// Тестова інфраструктура для pages/api/autopost.js: GitHub Contents API (з CAS за sha), Telegram і Anthropic — у пам'яті.
// Жодних реальних мережевих викликів: global fetch підміняється на маршрутизатор до цих фейків.
import { mock } from 'node:test'
import { APPROVED_POSTS } from '../../lib/auditshieldApprovedPosts.js'
import { bodyHash } from '../../lib/auditshieldPost.js'

const b64 = s => Buffer.from(s, 'utf-8').toString('base64')
const resp = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body, text: async () => JSON.stringify(body) })

export class FakeGitHub {
  constructor(initial) {
    this.file = { content: JSON.stringify(initial, null, 2), sha: 'sha0' }
    this.n = 0
    this.puts = []
    this.failPut = null      // (info) => bool: відповісти 500 на цей PUT
    this.beforePut = null    // async (info) => void: вклинитись між перевіркою і записом (для гонок)
  }
  get state() { return JSON.parse(this.file.content) }
  set state(s) { this.file = { content: JSON.stringify(s, null, 2), sha: `sha${++this.n}` } }
  async handle(method, init) {
    if (method === 'GET') return resp(200, { content: b64(this.file.content), sha: this.file.sha })
    const body = JSON.parse(init.body)
    const next = JSON.parse(Buffer.from(body.content, 'base64').toString('utf-8'))
    const info = { message: body.message, state: next }
    if (this.failPut && this.failPut(info)) return resp(500, { message: 'injected failure' })
    if (this.beforePut) await this.beforePut(info)
    if (body.sha !== this.file.sha) return resp(409, { message: 'sha conflict' })
    this.file = { content: JSON.stringify(next, null, 2), sha: `sha${++this.n}` }
    this.puts.push(info)
    return resp(200, { content: { sha: this.file.sha } })
  }
}

export class FakeTelegram {
  constructor() { this.sent = []; this.script = []; this.nextId = 1000 }
  // script: 'ok' | 'throw' | 'http500' для кожної наступної відправки (порожній = ok)
  async handle(url, init) {
    const mode = this.script.shift() || 'ok'
    if (mode === 'throw') throw new TypeError('fetch failed (injected network failure)')
    if (mode === 'http500') return resp(500, { ok: false })
    const body = JSON.parse(init.body)
    const kind = url.endsWith('/sendPoll') ? 'poll' : 'message'
    this.sent.push({ kind, text: body.text, poll: kind === 'poll' ? body : undefined, at: Date.now() })
    return resp(200, { ok: true, result: { message_id: this.nextId++ } })
  }
}

// Тести працюють із бібліотекою в пам'яті: approveLibrary() затверджує всі пости (версія 'test' + хеш тексту), unapproveLibrary() знімає
// затвердження (стан «кандидати»). Обидві повертають відкат до стану, зафіксованого при завантаженні модуля (вкладені виклики нічого не «заливають»).
const SHIPPED = APPROVED_POSTS.map(p => ({ approved_version: p.approved_version, approved_sha: p.approved_sha }))
const restoreShipped = () => APPROVED_POSTS.forEach((p, i) => Object.assign(p, SHIPPED[i]))
export function approveLibrary() {
  APPROVED_POSTS.forEach(p => { p.approved_version = 'test'; p.approved_sha = bodyHash(p.body) })
  return restoreShipped
}
export function unapproveLibrary() {
  APPROVED_POSTS.forEach(p => { p.approved_version = null; p.approved_sha = null })
  return restoreShipped
}

// Фейкова модель лише для звичайних постів (AuditShield модель не викликає). Лічильник свій для кожного harness,
// щоб два прогони з однаковим станом давали однакові запити.
export function makeLlm() {
  let n = 0
  return prompt => {
    if (prompt.includes('Поверни ТІЛЬКИ валідний JSON')) {
      return JSON.stringify({ question: `Тестове питання ${++n}?`, options: ['так', 'ні'], correct_index: 0, explanation: 'пояснення' })
    }
    return `Звичайний пост номер ${++n}`
  }
}

export class Harness {
  constructor(initial, { llm = makeLlm() } = {}) {
    this.gh = new FakeGitHub(initial)
    this.tg = new FakeTelegram()
    this.llm = llm
    this.llmPrompts = []
    this.anthropic = []      // усі запити до Anthropic як є: { model, max_tokens, messages }
    this.logs = []
    this.realFetch = globalThis.fetch
    this.realLog = console.log
    this.env = { AUTOPOST_SECRET: 's', TELEGRAM_TOKEN: 'tg', TELEGRAM_CHANNEL_ID: '@ch', ANTHROPIC_API_KEY: 'k', GITHUB_TOKEN: 'g', AUDITSHIELD_POSTS_ENABLED: undefined }
    this.savedEnv = {}
  }
  install() {
    for (const [k, v] of Object.entries(this.env)) { this.savedEnv[k] = process.env[k]; if (v === undefined) delete process.env[k]; else process.env[k] = v }
    console.log = (line) => { try { this.logs.push(JSON.parse(line)) } catch { /* не наш лог */ } }
    globalThis.fetch = async (url, init = {}) => {
      if (url.startsWith('https://api.github.com/')) return this.gh.handle((init.method || 'GET').toUpperCase(), init)
      if (url.startsWith('https://api.telegram.org/')) return this.tg.handle(url, init)
      if (url.startsWith('https://api.anthropic.com/')) {
        const request = JSON.parse(init.body)
        const prompt = request.messages[0].content
        this.anthropic.push(request)
        this.llmPrompts.push(prompt)
        return resp(200, { content: [{ text: await this.llm(prompt) }] })
      }
      throw new Error(`unexpected fetch ${url}`)
    }
  }
  uninstall() {
    globalThis.fetch = this.realFetch
    console.log = this.realLog
    for (const [k, v] of Object.entries(this.savedEnv)) { if (v === undefined) delete process.env[k]; else process.env[k] = v }
  }
  enable(on = true) { if (on) process.env.AUDITSHIELD_POSTS_ENABLED = 'true'; else delete process.env.AUDITSHIELD_POSTS_ENABLED }
  async run(handler, query) {
    const out = { status: null, body: null }
    const res = { status(c) { out.status = c; return this }, json(b) { out.body = b; return this } }
    await handler({ query: { secret: 's', ...query } }, res)
    return out
  }
  events(name) { return this.logs.filter(l => l.event === name) }
}

export function setNow(iso) { mock.timers.setTime(Date.parse(iso)) }

export function baseState(over = {}) {
  return {
    published: [], count: 0, promo_index: 90, engage_index: 73, extra_index: 123, extra_recent_topics: [],
    last_post: { slug: 'test-article', title: 'Тестова стаття про принтер', time: '2026-10-26T08:01:23.072Z' },
    last_message_id: 606, engage_ab_index: 17, poll_recent_topics: [], lock: null, pending: null, ...over,
  }
}

export const isAuditshieldMessage = m => m.kind === 'message' && /start=a1_tc_auditshield_/.test(m.text || '')
