// Інтеграційні тести pages/api/autopost.js з AuditShield: реальний handler + фейкові GitHub (CAS за sha), Telegram, Anthropic.
// Час керується через mock.timers (Date); нічого не виходить у мережу.
import test, { mock, before, after } from 'node:test'
import assert from 'node:assert/strict'
import handler from '../pages/api/autopost.js'
import { Harness, baseState, isAuditshieldMessage, fakeSections, sectionsToText, defaultLlm } from './helpers/fakes.mjs'
import { generateAuditshieldPost, readState } from '../lib/auditshieldPost.js'
import { ANGLES, FORMATS } from '../lib/auditshieldAngles.js'

const DAY = 86400000
const MIN = 60000
const D0 = Date.parse('2026-11-01T00:00:00Z')            // 1 листопада — непарний день
const at = (day, hh, mm = 1) => D0 + day * DAY + (hh * 60 + mm) * MIN
const SLOTS = [[8, 'content'], [10, 'middle'], [16, 'extra']]   // розклад із комітів бота (UTC)

before(() => mock.timers.enable({ apis: ['Date'], now: at(0, 8) }))
after(() => mock.timers.reset())

function make(t, over = {}, { enabled = true, llm } = {}) {
  const h = new Harness(baseState(over), llm ? { llm } : {})
  h.install()
  h.enable(enabled)
  t.after(() => h.uninstall())
  return h
}
const setT = ms => mock.timers.setTime(ms)
const utcDay = ms => new Date(ms).getUTCDate()

async function simulate(h, { days, from = 0, skip = () => false }) {
  const rows = []
  for (let d = from; d < from + days; d++) {
    for (const [hh, type] of SLOTS) {
      if (skip(d, type)) continue
      setT(at(d, hh))
      const before = h.tg.sent.length
      const r = await h.run(handler, { type })
      rows.push({ d, type, t: at(d, hh), status: r.status, sent: h.tg.sent.slice(before) })
    }
  }
  return rows
}
const auditRows = rows => rows.filter(r => r.sent.some(isAuditshieldMessage))

// Стан, у якому AuditShield уже дозволений (середина листопада): кілька тижнів лічильників, жодного поста ще не було.
function eligibleState(extra = {}) {
  return { v: 1, seq: 0, posts_since: 30, initialized_at: new Date(at(0, 8)).toISOString(), last_published_at: null, manual_last_at: null, history: [], ...extra }
}

// ── частота, інтервали, кулдаун (90 днів роботи розкладу з реальним handler) ──
test('90-day simulation: ≤1 per 7 days, ≤1 per 8 posts, never consecutive, ≥3 normal posts between, only odd-day middle slots, angle cooldown 45 days', async t => {
  const h = make(t)
  const rows = await simulate(h, { days: 90 })
  assert.ok(rows.every(r => r.status === 200), 'every scheduled call succeeded')
  const all = rows.flatMap(r => r.sent.map(m => ({ ...m, type: r.type, d: r.d })))
  assert.equal(all.length, 270, '3 posts per day, one message each')
  const idx = all.map((m, i) => (isAuditshieldMessage(m) ? i : -1)).filter(i => i >= 0)
  assert.ok(idx.length >= 8 && idx.length <= 11, `AuditShield posts in 90 days: ${idx.length}`)
  for (let i = 1; i < idx.length; i++) {
    assert.ok(all[idx[i]].at - all[idx[i - 1]].at >= 7 * DAY, 'at least 7 days apart')
    assert.ok(idx[i] - idx[i - 1] >= 8, 'at most one in any 8 consecutive posts')
    assert.ok(idx[i] - idx[i - 1] - 1 >= 3, 'at least 3 normal posts between')
  }
  assert.ok(idx.every(i => all[i].type === 'middle' && utcDay(all[i].at) % 2 === 1), 'only the odd-day middle slot')
  assert.ok(idx[0] > 0 && all[idx[0]].at - at(0, 8) >= 7 * DAY, 'the first post waits 7 days after the counters were initialized')
  // той самий кут — не раніше ніж через 45 днів
  const st = h.gh.state.auditshield
  assert.equal(readState({ auditshield: st }).status, 'ok')
  const lastByAngle = new Map()
  for (const e of st.history) {
    const ms = Date.parse(e.published_at)
    if (lastByAngle.has(e.angle)) assert.ok(ms - lastByAngle.get(e.angle) >= 45 * DAY, `angle ${e.angle} repeated too early`)
    lastByAngle.set(e.angle, ms)
  }
  // формати чергуються за циклом і не повторюються підряд
  for (let i = 1; i < st.history.length; i++) assert.notEqual(st.history[i].format, st.history[i - 1].format)
  assert.ok(st.history.every(e => FORMATS.includes(e.format)))
  // кожен пост має унікальний content id і посилання зі схемою a1_tc_auditshield_
  const ids = st.history.map(e => e.content_id)
  assert.equal(new Set(ids).size, ids.length)
  for (const i of idx) assert.match(all[i].text, /start=a1_tc_auditshield_as\d{4}-[a-z0-9-]+\)/)
  // самостійна ротація тем слота не зламана: AuditShield не просуває promo_index
  const oddMiddleStandalone = rows.filter(r => r.type === 'middle' && utcDay(r.t) % 2 === 1 && !r.sent.some(isAuditshieldMessage)).length
  assert.equal(h.gh.state.promo_index, 90 + oddMiddleStandalone)
})

test('skipped scheduler slots are NOT caught up: after a long outage at most one AuditShield post per allowed slot', async t => {
  const h = make(t)
  const before = await simulate(h, { days: 12 })
  const nBefore = auditRows(before).length
  assert.ok(nBefore >= 1)
  const after = await simulate(h, { days: 14, from: 40 })              // дні 12–39 розклад не працював
  const posts = auditRows(after)
  assert.ok(posts.length >= 1 && posts.length <= 2, `posts after outage: ${posts.length}`)
  for (let i = 1; i < posts.length; i++) assert.ok(posts[i].t - posts[i - 1].t >= 7 * DAY)
  assert.equal(posts[0].sent.length, 1, 'the missed slot is not compensated with a second post')
})

// ── дублікати на рівні handler ──
// Текст «міфу» без команд валідний для будь-якого з трьох myth-кутів, тому модель, яка повторює його для кожного кута, перевіряє саме дедуплікацію.
const MYTH_TEXT = {
  hook: '🧩 Антивірус відповідає на одне питання, а Windows зберігає відповіді на зовсім інші.',
  value: 'Антивірус шукає шкідливі файли. А от які програми стартують разом із системою, які USB-накопичувачі колись підключали і які облікові записи існують на ПК — це окремі питання, і Windows уже має на них відповіді. Їх можна переглянути без додаткових програм, спокійно і без поспіху.',
  context: 'Це не вада антивіруса і не привід для хвилювання: просто різні інструменти для різних питань, які варто ставити по черзі.',
  bridge: 'Якщо не хочете переглядати все вручну — безкоштовний AuditShield Demo збирає ці відповіді в один звіт.',
}
// Запис історії з цим текстом; метадані (кут/формат) задаємо так, щоб наступним за циклом був саме myth (seq 3) і не збігся з форматом попереднього поста.
async function seedMythEntry(text = MYTH_TEXT) {
  const r = await generateAuditshieldPost({
    state: { auditshield: eligibleState() }, now: new Date(at(8, 10)),
    generateText: async () => sectionsToText(text), format: 'myth', angleId: 'av-blind-spots',
  })
  assert.ok(r.post, JSON.stringify(r.blocked))
  return { ...r.post.audit, angle: 'startup-unknown', format: 'diagnostic', published_at: new Date(at(-1, 10)).toISOString(), status: 'published', message_id: 1 }
}
const mythState = entry => eligibleState({ seq: 3, last_published_at: entry.published_at, history: [entry] })

test('handler: exact duplicate text is blocked → no AuditShield message, the normal standalone post goes out instead', async t => {
  const entry = await seedMythEntry()
  const h = make(t, { auditshield: mythState(entry) }, { llm: p => (p.includes('[HOOK]') ? sectionsToText(MYTH_TEXT) : defaultLlm(p)) })
  setT(at(8, 10))                                                     // 9 листопада, непарний день
  const r = await h.run(handler, { type: 'middle' })
  assert.equal(r.status, 200)
  assert.equal(h.tg.sent.length, 1)
  assert.ok(!isAuditshieldMessage(h.tg.sent[0]))
  const blocked = h.events('auditshield_blocked')
  assert.equal(blocked.length, 1)
  assert.equal(blocked[0].reasons.filter(x => x.endsWith(':dup_exact')).length, 3, JSON.stringify(blocked[0].reasons))   // три різні кути, жоден не пройшов
  assert.equal(h.gh.state.promo_index, 91, 'the standalone rotation advanced as before')
  assert.equal(h.gh.state.auditshield.history.length, 1, 'nothing new recorded as an AuditShield post')
  assert.equal(h.gh.state.auditshield.posts_since, 31)
})

test('handler: a near-duplicate rewrite (a few words changed) is blocked the same way', async t => {
  const entry = await seedMythEntry()
  const tweaked = { ...MYTH_TEXT, value: MYTH_TEXT.value.replace('Антивірус шукає', 'Антивірус виявляє').replace('спокійно і без поспіху', 'без поспіху'), context: MYTH_TEXT.context + ' Саме так.' }
  const h = make(t, { auditshield: mythState(entry) }, { llm: p => (p.includes('[HOOK]') ? sectionsToText(tweaked) : defaultLlm(p)) })
  setT(at(8, 10))
  await h.run(handler, { type: 'middle' })
  assert.ok(!h.tg.sent.some(isAuditshieldMessage))
  const reasons = h.events('auditshield_blocked')[0].reasons
  assert.equal(reasons.filter(x => /dup_(near_duplicate|same_body|same_hook)/.test(x)).length, 3, JSON.stringify(reasons))
})

test('handler: when the model gives a genuinely different post for the next angle, it is accepted (duplicates are skipped, not the whole feature)', async t => {
  const entry = await seedMythEntry()
  const h = make(t, { auditshield: mythState(entry) })              // типова модель: окремий текст для кожного кута
  setT(at(8, 10))
  await h.run(handler, { type: 'middle' })
  assert.equal(h.tg.sent.filter(isAuditshieldMessage).length, 1)
  assert.equal(h.gh.state.auditshield.history.length, 2)
  assert.equal(h.gh.state.auditshield.history[1].format, 'myth')
})

test('handler: a model output that breaks the content rules is never published; the normal post goes out instead', async t => {
  const llm = p => {
    if (!p.includes('[HOOK]')) return defaultLlm(p)
    const a = ANGLES.find(x => x.topic === p.match(/КУТ ПОСТА: (.*)/)[1])
    const s = fakeSections(a)
    return sectionsToText({ ...s, context: s.context + ' Вас зламали, ваші дані вже крадуть!' })
  }
  const h = make(t, { auditshield: eligibleState() }, { llm })
  setT(at(8, 10))
  const r = await h.run(handler, { type: 'middle' })
  assert.equal(r.status, 200)
  assert.equal(h.tg.sent.length, 1)
  assert.ok(!isAuditshieldMessage(h.tg.sent[0]))
  assert.equal(h.events('auditshield_blocked')[0].reasons.filter(x => x.endsWith(':scare')).length, 3)
  assert.equal(h.gh.state.auditshield.history.length, 0)
})

test('handler: invalid attribution link blocks the AuditShield post; the slot still publishes its normal post', async t => {
  const h = make(t, { auditshield: eligibleState() })
  const saved = ANGLES.splice(0, ANGLES.length, { id: 'Bad_Id', format: 'diagnostic', module: null, keywords: ['zzz'], topic: 'bad', brief: 'b', steps: ['Get-Process'], limits: 'l' })
  t.after(() => { ANGLES.splice(0, ANGLES.length, ...saved) })
  h.llm = () => sectionsToText({ ...fakeSections(saved.find(a => a.id === 'defender-status')), value: 'Одна команда: `Get-Process`. '.repeat(14) })
  setT(at(8, 10))
  const r = await h.run(handler, { type: 'middle' })
  assert.equal(r.status, 200)
  assert.equal(h.tg.sent.length, 1)
  assert.ok(!isAuditshieldMessage(h.tg.sent[0]))
  assert.ok(h.events('auditshield_blocked')[0].reasons.includes('attribution_link_invalid'))
})

// ── паралельність, ретраї, мережеві збої ──
test('parallel scheduler runs of the same slot produce exactly one post (CAS lock)', async t => {
  const h = make(t, { auditshield: eligibleState() })
  setT(at(8, 10))
  const [a, b] = await Promise.all([h.run(handler, { type: 'middle' }), h.run(handler, { type: 'middle' })])
  assert.equal(h.tg.sent.length, 1)
  assert.equal(h.tg.sent.filter(isAuditshieldMessage).length, 1)
  assert.deepEqual([a.status, b.status], [200, 200])
  assert.equal([a.body, b.body].filter(x => x.skipped).length, 1)
  assert.equal(h.gh.state.auditshield.history.length, 1)
})

test('parallel runs of different types also serialize through the global lock', async t => {
  const h = make(t, { auditshield: eligibleState() })
  setT(at(8, 10))
  const res = await Promise.all([h.run(handler, { type: 'middle' }), h.run(handler, { type: 'extra' }), h.run(handler, { type: 'content' })])
  assert.equal(h.tg.sent.length, 1)
  assert.equal(res.filter(r => r.body && r.body.skipped).length, 2)
})

test('network failure during the Telegram send: no automatic resend; the orphan is settled as unconfirmed and the caps still hold', async t => {
  const h = make(t, { auditshield: eligibleState() })
  h.tg.script = ['throw']
  setT(at(8, 10))
  const r1 = await h.run(handler, { type: 'middle' })
  assert.equal(r1.status, 500)
  assert.equal(h.tg.sent.length, 0)
  assert.ok(h.gh.state.pending && h.gh.state.pending.audit, 'the intent was persisted before the send')
  // повторний запуск у межах TTL лока — безпечний skip
  setT(at(8, 10) + 5 * MIN)
  const r2 = await h.run(handler, { type: 'middle' })
  assert.equal(r2.body.reason, 'locked')
  // після TTL: осиротілий pending прибирається БЕЗ повторної відправки, AuditShield рахується як (можливо) опублікований
  setT(at(8, 10) + 20 * MIN)
  const r3 = await h.run(handler, { type: 'middle' })
  assert.equal(r3.body.reason, 'recovered_orphaned_pending')
  assert.equal(h.tg.sent.length, 0)
  const a = h.gh.state.auditshield
  assert.equal(a.history.length, 1); assert.equal(a.history[0].status, 'unconfirmed'); assert.equal(a.posts_since, 0)
  assert.equal(h.gh.state.pending, null)
  // наступний непарний middle (через 2 дні) і навіть через 6 днів — жодного AuditShield
  for (const d of [10, 14]) {
    setT(at(d, 10))
    await h.run(handler, { type: 'middle' })
  }
  assert.equal(h.tg.sent.filter(isAuditshieldMessage).length, 0)
  assert.equal(h.events('auditshield_gate').at(-1).reason, 'min_days')
})

test('GitHub finalization failure after a successful send: the post is not repeated, the next runs treat it as published', async t => {
  const h = make(t, { auditshield: eligibleState() })
  setT(at(8, 10))
  h.gh.failPut = info => info.state.last_message_id !== undefined && info.state.pending === null && info.state.auditshield?.history?.length === 1
  const r1 = await h.run(handler, { type: 'middle' })
  assert.equal(r1.status, 207)
  assert.equal(h.tg.sent.filter(isAuditshieldMessage).length, 1)
  h.gh.failPut = null
  // інший тип запускається першим: осиротілий pending іншого типу не губиться, а фіксується як unconfirmed
  setT(at(8, 16))
  await h.run(handler, { type: 'extra' })
  const a = h.gh.state.auditshield
  assert.equal(a.history.length, 1); assert.equal(a.history[0].status, 'unconfirmed')
  assert.ok(a.posts_since >= 1)
  setT(at(10, 10))
  await h.run(handler, { type: 'middle' })
  assert.equal(h.tg.sent.filter(isAuditshieldMessage).length, 1, 'no second AuditShield post')
})

test('model/Anthropic failure before anything is promised: no post, lock released, nothing recorded', async t => {
  const h = make(t, { auditshield: eligibleState() }, { llm: () => { throw new Error('anthropic down') } })
  setT(at(8, 10))
  const r = await h.run(handler, { type: 'middle' })
  assert.equal(r.status, 500)
  assert.equal(h.tg.sent.length, 0)
  assert.equal(h.gh.state.lock, null); assert.equal(h.gh.state.pending, null)
  assert.equal(h.gh.state.auditshield.history.length, 0)
})

// ── регресії існуючої системи ──
test('flag OFF: every post type works as before and no auditshield key ever appears in the state', async t => {
  const h = make(t, {}, { enabled: false })
  const rows = await simulate(h, { days: 6 })
  assert.ok(rows.every(r => r.status === 200))
  assert.equal(h.tg.sent.length, 18)
  assert.ok(!h.tg.sent.some(isAuditshieldMessage))
  const s = h.gh.state
  assert.equal('auditshield' in s, false)
  assert.equal(s.count, 6)                                           // content: по одному на день
  assert.equal(s.extra_index, 123 + 6)
  assert.equal(s.promo_index, 90 + 3)                                // 1, 3, 5 листопада — непарні дні
  assert.equal(s.engage_ab_index, 17 + 3)                            // 2, 4, 6 — парні дні
  assert.equal(s.lock, null); assert.equal(s.pending, null)
  assert.ok(h.events('auditshield_gate').length === 0)
})

test('flag ON: normal posts keep their own counters and only gain the auditshield post counter', async t => {
  const h = make(t)
  const rows = await simulate(h, { days: 4 })
  assert.ok(rows.every(r => r.status === 200))
  const s = h.gh.state
  assert.equal(s.count, 4); assert.equal(s.extra_index, 127); assert.equal(s.promo_index, 92); assert.equal(s.engage_ab_index, 19)
  assert.equal(s.auditshield.posts_since, 12)
  assert.equal(s.auditshield.history.length, 0)
  assert.equal(s.auditshield.initialized_at, new Date(at(0, 8)).toISOString())
})

test('backward compatibility: a legacy state (no auditshield key, old pending shape) is accepted; the key is added only when the flag is on', async t => {
  const legacy = baseState({ pending: { execution_id: 'old', type: 'extra', identifier: 'extra-style-1', payload: { text: 'x' }, created_at: new Date(at(0, 1)).toISOString() } })
  const h = make(t, legacy)
  setT(at(0, 10))
  const r = await h.run(handler, { type: 'middle' })
  assert.equal(r.status, 200)
  assert.equal(h.tg.sent.length, 1)
  assert.equal(h.gh.state.auditshield.posts_since, 1)
  assert.equal(h.events('auditshield_gate')[0].reason, 'uninitialized')
})

test('malformed auditshield state: AuditShield is blocked, normal posts continue, the broken value is preserved untouched', async t => {
  const h = make(t, { auditshield: { v: 99, nonsense: true } })
  setT(at(8, 10))
  const r = await h.run(handler, { type: 'middle' })
  assert.equal(r.status, 200)
  assert.equal(h.tg.sent.length, 1)
  assert.ok(!isAuditshieldMessage(h.tg.sent[0]))
  assert.equal(h.events('auditshield_gate')[0].reason, 'state_malformed')
  assert.deepEqual(h.gh.state.auditshield, { v: 99, nonsense: true })
})

test('even-day middle (Poll Experiment) is never an AuditShield slot', async t => {
  const h = make(t, { auditshield: eligibleState() })
  setT(at(9, 10))                                                     // 10 листопада — парний
  const r = await h.run(handler, { type: 'middle' })
  assert.equal(r.status, 200)
  assert.ok(!h.tg.sent.some(isAuditshieldMessage))
  assert.equal(h.events('auditshield_gate').length, 0)
  assert.equal(h.gh.state.promo_index, 90)
})

test('owner manual marker (manual_last_at) is honoured; without it a manual post is invisible to the bot (documented limit)', async t => {
  const h = make(t, { auditshield: eligibleState({ manual_last_at: new Date(at(6, 12)).toISOString() }) })
  setT(at(8, 10))                                                     // менше 7 днів після ручного поста
  await h.run(handler, { type: 'middle' })
  assert.ok(!h.tg.sent.some(isAuditshieldMessage))
  assert.equal(h.events('auditshield_gate')[0].reason, 'manual_recent')
})

// ── dry-run ──
test('dry-run preview generates a full example but publishes nothing and writes nothing', async t => {
  const h = make(t, {}, { enabled: false })                           // навіть вимкнений прапорець: прев'ю працює
  setT(at(8, 10))
  const r = await h.run(handler, { type: 'middle', dry: '1', auditshield: '1', format: 'quick', angle: 'firewall-profiles' })
  assert.equal(r.status, 200)
  assert.equal(r.body.dry, true)
  const p = r.body.auditshield
  assert.equal(p.enabled, false)
  assert.equal(p.gate.reason, 'uninitialized')
  assert.equal(p.audit.angle, 'firewall-profiles')
  assert.match(p.link, /^https:\/\/t\.me\/AuditShield_01_Bot\?start=a1_tc_auditshield_as0001-firewall-profiles$/)
  assert.match(p.text, /start=a1_tc_auditshield_as0001-firewall-profiles\)/)
  assert.equal(p.audit.text, undefined, 'the preview does not echo the internal plain text twice')
  assert.equal(h.tg.sent.length, 0)
  assert.equal(h.gh.puts.length, 0)
})

test('dry-run without the auditshield switch behaves exactly as before (normal preview, no state write)', async t => {
  const h = make(t, {}, { enabled: true })
  setT(at(9, 10))
  const r = await h.run(handler, { type: 'content', dry: '1' })
  assert.equal(r.status, 200); assert.equal(r.body.dry, true); assert.ok(r.body.text)
  assert.equal(h.tg.sent.length, 0); assert.equal(h.gh.puts.length, 0)
})

test('security: wrong secret is rejected before anything else; type=promo stays a no-op', async t => {
  const h = make(t)
  const r = await h.run(handler, { type: 'middle', secret: 'bad' })
  assert.equal(r.status, 401)
  const p = await h.run(handler, { type: 'promo' })
  assert.deepEqual([p.status, p.body.reason], [200, 'promo_paused'])
  assert.equal(h.tg.sent.length, 0)
})

test('logs never contain post text, tokens or the secret', async t => {
  const h = make(t, { auditshield: eligibleState() })
  setT(at(8, 10))
  await h.run(handler, { type: 'middle' })
  const blob = JSON.stringify(h.logs)
  assert.ok(h.events('auditshield_published').length === 1)
  assert.doesNotMatch(blob, /start=a1_tc|Get-|Безкоштовн|tg_token|"tg"|"k"|"g"/)
  assert.ok(!blob.includes('secret'))
})
