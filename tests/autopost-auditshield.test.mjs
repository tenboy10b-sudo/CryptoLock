// Інтеграційні тести pages/api/autopost.js з AuditShield: реальний handler + фейкові GitHub (CAS за sha), Telegram, Anthropic.
// Час керується через mock.timers (Date); нічого не виходить у мережу. AuditShield бере пости зі статичної бібліотеки — модель не викликається.
import test, { mock, before, after } from 'node:test'
import assert from 'node:assert/strict'
import handler from '../pages/api/autopost.js'
import { Harness, baseState, isAuditshieldMessage, approveLibrary, unapproveLibrary } from './helpers/fakes.mjs'
import { readState, bodyHash } from '../lib/auditshieldPost.js'
import { APPROVED_POSTS } from '../lib/auditshieldApprovedPosts.js'
import { FORMATS } from '../lib/auditshieldAngles.js'

const DAY = 86400000
const MIN = 60000
const D0 = Date.parse('2026-11-01T00:00:00Z')            // 1 листопада — непарний день
const at = (day, hh, mm = 1) => D0 + day * DAY + (hh * 60 + mm) * MIN
const SLOTS = [[8, 'content'], [10, 'middle'], [16, 'extra']]   // розклад із комітів бота (UTC)
const idOf = m => (m.text.match(/start=a1_tc_auditshield_(asp\d{3})\)/) || [])[1]

// Існуючий код обирає статтю для `content` через Math.random (autopost.js, не змінюється), а назва останньої статті впливає на захист від
// збігу тем. Сам вибір AuditShield детермінований, тож генератор фіксуємо і перезасіваємо на старті кожного harness: прогони відтворювані.
let seed = 1
const reseed = () => { seed = 20261101 }
let rnd
before(() => {
  mock.timers.enable({ apis: ['Date'], now: at(0, 8) })
  rnd = mock.method(Math, 'random', () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296 })
})
after(() => { rnd.mock.restore(); mock.timers.reset() })

function make(t, over = {}, { enabled = true, llm, approved = true } = {}) {
  reseed()
  const restore = approved ? approveLibrary() : unapproveLibrary()
  const h = new Harness(baseState(over), llm ? { llm } : {})
  h.install()
  h.enable(enabled)
  t.after(() => { h.uninstall(); restore() })
  return h
}
const setT = ms => mock.timers.setTime(ms)
const utcDay = ms => new Date(ms).getUTCDate()

// Один запуск слота на окремому harness (для порівнянь «до/після»). tweak() може змінити бібліотеку і має повернути відкат.
async function runOnce(over, { enabled = true, approved = true, llm, when = at(8, 10), type = 'middle', tweak } = {}) {
  reseed()
  const restoreApproval = approved ? approveLibrary() : unapproveLibrary()
  const restoreTweak = tweak ? tweak() : () => {}
  const h = new Harness(baseState(over), llm ? { llm } : {})
  h.install(); h.enable(enabled)
  try { setT(when); h.result = await h.run(handler, { type }); return h } finally { h.uninstall(); restoreTweak(); restoreApproval() }
}

async function simulate(h, { days, from = 0, skip = () => false }) {
  const rows = []
  for (let d = from; d < from + days; d++) {
    for (const [hh, type] of SLOTS) {
      if (skip(d, type)) continue
      setT(at(d, hh))
      const before = h.tg.sent.length, calls = h.anthropic.length
      const r = await h.run(handler, { type })
      rows.push({ d, type, t: at(d, hh), status: r.status, sent: h.tg.sent.slice(before), anthropicCalls: h.anthropic.length - calls })
    }
  }
  return rows
}
const auditRows = rows => rows.filter(r => r.sent.some(isAuditshieldMessage))

// Стан, у якому AuditShield уже дозволений (середина листопада): кілька тижнів лічильників, жодного поста ще не було.
function eligibleState(extra = {}) {
  return { v: 1, seq: 0, posts_since: 30, initialized_at: new Date(at(0, 8)).toISOString(), last_published_at: null, manual_last_at: null, used_ids: [], history: [], ...extra }
}
// Усі затверджені пости вже виходили (поповнення бібліотеки ще не було).
function exhaustedState() {
  return eligibleState({ seq: 12, last_published_at: new Date(at(-30, 10)).toISOString(), used_ids: APPROVED_POSTS.map(p => p.id) })
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
  assert.ok(st.history.every(e => FORMATS.includes(e.format)))
  // кожен опублікований пост — один раз, зі свого посилання a1_tc_auditshield_<id> і з бібліотеки; стан запам'ятав усі id
  const ids = idx.map(i => idOf(all[i]))
  assert.equal(new Set(ids).size, ids.length, 'no approved post is published twice')
  assert.ok(ids.every(id => APPROVED_POSTS.some(p => p.id === id)))
  assert.deepEqual(st.used_ids, ids)
  assert.deepEqual(st.history.map(e => e.content_id), ids)
  // самостійна ротація тем слота не зламана: AuditShield не просуває promo_index
  const oddMiddleStandalone = rows.filter(r => r.type === 'middle' && utcDay(r.t) % 2 === 1 && !r.sent.some(isAuditshieldMessage)).length
  assert.equal(h.gh.state.promo_index, 90 + oddMiddleStandalone)
  // жодного звернення до моделі там, де вийшов AuditShield-пост; усі інші запуски — рівно один виклик, як і раніше
  assert.ok(auditRows(rows).every(r => r.anthropicCalls === 0), 'AuditShield runs make 0 Anthropic calls')
  assert.equal(h.anthropic.length, 270 - idx.length)
})

test('rotation is deterministic: the same schedule publishes the same posts in the same order', async t => {
  const run = async () => {
    reseed()
    const restore = approveLibrary()
    const h = new Harness(baseState({}))
    h.install(); h.enable(true)
    try {
      setT(at(0, 8))
      const rows = await simulate(h, { days: 50 })
      return auditRows(rows).map(r => idOf(r.sent.find(isAuditshieldMessage)))
    } finally { h.uninstall(); restore() }
  }
  const first = await run()
  const second = await run()
  assert.ok(first.length >= 5)
  assert.deepEqual(second, first)
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

// ── дублікати, затвердження, вичерпання ──
test('handler: a text that was already published under another id is skipped — the next approved post goes out instead', async t => {
  const baseline = await runOnce({ auditshield: eligibleState() })
  const first = idOf(baseline.tg.sent[0])
  assert.ok(first)
  const seeded = APPROVED_POSTS.find(p => p.id === first)
  const history = [{ id: 'asp900', angle: 'nothing', format: 'myth', topic: 't', content_id: 'asp900', cta_variant: 0, text_sha: bodyHash(seeded.body), published_at: new Date(at(-20, 10)).toISOString(), message_id: 1, status: 'published' }]
  const h = await runOnce({ auditshield: eligibleState({ seq: 1, last_published_at: history[0].published_at, used_ids: ['asp900'], history }) })
  assert.equal(h.tg.sent.length, 1)
  assert.ok(isAuditshieldMessage(h.tg.sent[0]))
  assert.notEqual(idOf(h.tg.sent[0]), first, 'same text under another id was not repeated')
})

test('handler: an approved post whose text was edited after approval is never published; the slot continues with the next valid post', async t => {
  const baseline = await runOnce({ auditshield: eligibleState() })
  const first = idOf(baseline.tg.sent[0])
  const post = APPROVED_POSTS.find(p => p.id === first)
  const h = await runOnce({ auditshield: eligibleState() }, { tweak: () => { const saved = post.body; post.body += ' Вас зламали, ваші дані вже крадуть!'; return () => { post.body = saved } } })
  assert.equal(h.result.status, 200)
  assert.equal(h.tg.sent.length, 1)
  assert.ok(isAuditshieldMessage(h.tg.sent[0]))
  assert.notEqual(idOf(h.tg.sent[0]), first)
  const bad = h.events('auditshield_invalid_post')
  assert.deepEqual(bad.map(b => b.post_id), [first])
  assert.ok(bad[0].reasons.includes('approved_sha_mismatch') && bad[0].reasons.includes('scare'))
})

test('handler: when every approved post is invalid, nothing AuditShield goes out and the normal standalone post is published', async t => {
  const h = await runOnce({ auditshield: eligibleState() }, {
    tweak: () => { const saved = APPROVED_POSTS.map(p => p.id); APPROVED_POSTS.forEach(p => { p.id = p.id.toUpperCase() }); return () => APPROVED_POSTS.forEach((p, i) => { p.id = saved[i] }) },
  })
  assert.equal(h.result.status, 200)
  assert.equal(h.tg.sent.length, 1)
  assert.ok(!isAuditshieldMessage(h.tg.sent[0]))
  assert.equal(h.events('auditshield_invalid_post').length, 12)
  assert.ok(h.events('auditshield_invalid_post').every(e => e.reasons.includes('bad_id')))   // id, який бот не прийняв би в посиланні
  assert.equal(h.events('auditshield_blocked')[0].reason, 'no_valid_post')
  assert.equal(h.gh.state.promo_index, 91, 'the standalone rotation advanced as before')
  assert.equal(h.gh.state.auditshield.history.length, 0)
})

test('handler: candidates the owner has not approved are never published, even with the flag ON and every gate open', async t => {
  const h = await runOnce({ auditshield: eligibleState() }, { approved: false })
  assert.equal(h.tg.sent.length, 1)
  assert.ok(!isAuditshieldMessage(h.tg.sent[0]))
  assert.equal(h.events('auditshield_library_empty').length, 1)
  assert.equal(h.events('auditshield_blocked')[0].reason, 'library_empty')
})

test('handler: library exhausted → normal post goes out (same model request as with the flag OFF), auditshield_library_exhausted is logged, nothing starts over', async t => {
  const off = await runOnce({}, { enabled: false })                     // еталон: прапорець вимкнено, той самий слот і стан
  const h = await runOnce({ auditshield: exhaustedState() })
  assert.equal(h.result.status, 200)
  assert.equal(h.tg.sent.length, 1)
  assert.ok(!isAuditshieldMessage(h.tg.sent[0]))
  assert.equal(h.events('auditshield_library_exhausted').length, 1)
  assert.equal(h.events('auditshield_library_exhausted')[0].approved, 12)
  assert.equal(h.events('auditshield_blocked')[0].reason, 'library_exhausted')
  assert.equal(h.anthropic.length, 1, 'only the normal post is generated')
  assert.deepEqual(h.anthropic, off.anthropic, 'the normal post uses exactly the same model request as before')
  assert.equal(h.gh.state.promo_index, 91)
  const a = h.gh.state.auditshield
  assert.equal(a.history.length, 0); assert.equal(a.used_ids.length, 12); assert.equal(a.posts_since, 31)
})

test('handler: an exhausted library stays exhausted for years — no automatic restart of old posts', async t => {
  const h = make(t, { auditshield: exhaustedState() })
  const rows = await simulate(h, { days: 30, from: 0 })
  const later = await simulate(h, { days: 6, from: 400 })
  assert.equal(auditRows([...rows, ...later]).length, 0)
  assert.ok(h.events('auditshield_library_exhausted').length >= 10)
  assert.equal(h.gh.state.auditshield.used_ids.length, 12)
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
  assert.equal(h.gh.state.auditshield.used_ids.length, 1)
})

test('parallel runs of different types also serialize through the global lock', async t => {
  const h = make(t, { auditshield: eligibleState() })
  setT(at(8, 10))
  const res = await Promise.all([h.run(handler, { type: 'middle' }), h.run(handler, { type: 'extra' }), h.run(handler, { type: 'content' })])
  assert.equal(h.tg.sent.length, 1)
  assert.equal(res.filter(r => r.body && r.body.skipped).length, 2)
})

test('network failure during the Telegram send: no automatic resend; the orphan is settled as unconfirmed, its post is never offered again, the caps still hold', async t => {
  const h = make(t, { auditshield: eligibleState() })
  h.tg.script = ['throw']
  setT(at(8, 10))
  const r1 = await h.run(handler, { type: 'middle' })
  assert.equal(r1.status, 500)
  assert.equal(h.tg.sent.length, 0)
  assert.ok(h.gh.state.pending && h.gh.state.pending.audit, 'the intent was persisted before the send')
  const lostId = h.gh.state.pending.audit.id
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
  assert.deepEqual(a.used_ids, [lostId])
  assert.equal(h.gh.state.pending, null)
  // наступний непарний middle (через 2 дні) і навіть через 6 днів — жодного AuditShield
  for (const d of [10, 14]) {
    setT(at(d, 10))
    await h.run(handler, { type: 'middle' })
  }
  assert.equal(h.tg.sent.filter(isAuditshieldMessage).length, 0)
  assert.equal(h.events('auditshield_gate').at(-1).reason, 'min_days')
  // далі розклад іде штатно, але втрачений пост більше не пропонується
  const later = await simulate(h, { days: 40, from: 15 })
  const ids = auditRows(later).map(r => idOf(r.sent.find(isAuditshieldMessage)))
  assert.ok(ids.length >= 3 && !ids.includes(lostId), `later posts ${ids}`)
})

test('GitHub finalization failure after a successful send: the post is not repeated, the next runs treat it as published', async t => {
  const h = make(t, { auditshield: eligibleState() })
  setT(at(8, 10))
  h.gh.failPut = info => info.state.last_message_id !== undefined && info.state.pending === null && info.state.auditshield?.history?.length === 1
  const r1 = await h.run(handler, { type: 'middle' })
  assert.equal(r1.status, 207)
  assert.equal(h.tg.sent.filter(isAuditshieldMessage).length, 1)
  const sentId = idOf(h.tg.sent[0])
  h.gh.failPut = null
  // інший тип запускається першим: осиротілий pending іншого типу не губиться, а фіксується як unconfirmed
  setT(at(8, 16))
  await h.run(handler, { type: 'extra' })
  const a = h.gh.state.auditshield
  assert.equal(a.history.length, 1); assert.equal(a.history[0].status, 'unconfirmed')
  assert.deepEqual(a.used_ids, [sentId])
  assert.ok(a.posts_since >= 1)
  setT(at(10, 10))
  await h.run(handler, { type: 'middle' })
  assert.equal(h.tg.sent.filter(isAuditshieldMessage).length, 1, 'no second AuditShield post')
})

test('a model outage cannot block an AuditShield slot (it never calls the model), while a normal post still fails and releases the lock as before', async t => {
  const h = make(t, { auditshield: eligibleState() }, { llm: () => { throw new Error('anthropic down') } })
  setT(at(8, 10))
  const r = await h.run(handler, { type: 'middle' })
  assert.equal(r.status, 200)
  assert.equal(h.tg.sent.filter(isAuditshieldMessage).length, 1)
  assert.equal(h.anthropic.length, 0, 'AuditShield path: zero Anthropic calls')
  assert.equal(h.gh.state.auditshield.history.length, 1)
  setT(at(8, 16))
  const normal = await h.run(handler, { type: 'extra' })
  assert.equal(normal.status, 500)
  assert.equal(h.gh.state.lock, null); assert.equal(h.gh.state.pending, null)
  assert.equal(h.anthropic.length, 1)
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
  assert.equal(h.anthropic.length, 18, 'one model call per post, as before')
})

test('flag ON but AuditShield not due yet: every model request and every Telegram text is byte-identical to the flag OFF run', async t => {
  const run = async enabled => {
    reseed()
    const restore = approveLibrary()
    const h = new Harness(baseState({}))
    h.install(); h.enable(enabled)
    try { setT(at(0, 8)); await simulate(h, { days: 6 }); return h } finally { h.uninstall(); restore() }
  }
  const off = await run(false)
  assert.deepEqual((await run(false)).anthropic, off.anthropic, 'control: two flag OFF runs are identical, so any difference below would come from the flag')
  const on = await run(true)
  assert.equal(on.tg.sent.length, 18)
  assert.deepEqual(on.anthropic, off.anthropic)
  assert.deepEqual(on.tg.sent.map(m => m.text ?? m.poll?.question), off.tg.sent.map(m => m.text ?? m.poll?.question))
  const { auditshield, ...rest } = on.gh.state
  assert.deepEqual(rest, off.gh.state)
  assert.equal(auditshield.posts_since, 18)
})

test('normal generation keeps the existing model: claude-sonnet-4-5, one user message, the same token limits per post type', async t => {
  const h = make(t, { auditshield: exhaustedState() })
  await simulate(h, { days: 3 })
  assert.ok(h.anthropic.length > 0)
  for (const req of h.anthropic) {
    assert.equal(req.model, 'claude-sonnet-4-5')
    assert.equal(req.messages.length, 1); assert.equal(req.messages[0].role, 'user')
    assert.ok(!/\[HOOK\]|КУТ ПОСТА/.test(req.messages[0].content), 'no AuditShield prompt exists any more')
  }
  const middleOdd = h.anthropic.filter(r => r.max_tokens === 700)
  assert.equal(middleOdd.length, 2, 'odd-day middle standalone posts still use max_tokens 700 (days 1 and 3)')
})

test('flag ON: normal posts keep their own counters and only gain the auditshield post counter', async t => {
  const h = make(t)
  const rows = await simulate(h, { days: 4 })
  assert.ok(rows.every(r => r.status === 200))
  const s = h.gh.state
  assert.equal(s.count, 4); assert.equal(s.extra_index, 127); assert.equal(s.promo_index, 92); assert.equal(s.engage_ab_index, 19)
  assert.equal(s.auditshield.posts_since, 12)
  assert.equal(s.auditshield.history.length, 0)
  assert.deepEqual(s.auditshield.used_ids, [])
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

test('a state written before used_ids existed (history only) is still honoured: published ids stay published', async t => {
  const old = eligibleState({ seq: 1, last_published_at: new Date(at(-30, 10)).toISOString(), history: [{ id: 'asp001', angle: 'startup-unknown', format: 'diagnostic', topic: 't', content_id: 'asp001', cta_variant: 0, text_sha: 'x', published_at: new Date(at(-30, 10)).toISOString(), message_id: 1, status: 'published' }] })
  delete old.used_ids
  const h = await runOnce({ auditshield: old })
  assert.equal(h.tg.sent.filter(isAuditshieldMessage).length, 1)
  assert.notEqual(idOf(h.tg.sent[0]), 'asp001')
  assert.deepEqual(h.gh.state.auditshield.used_ids.slice(0, 1), ['asp001'])
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
test('dry-run shows the next eligible approved post — final text, id, format, angle, attribution — but writes nothing, sends nothing, calls no model', async t => {
  const h = make(t, {}, { enabled: false })                           // навіть вимкнений прапорець: прев'ю працює
  setT(at(8, 10))
  const r = await h.run(handler, { type: 'middle', dry: '1', auditshield: '1' })
  assert.equal(r.status, 200)
  assert.equal(r.body.dry, true)
  const p = r.body.auditshield
  assert.equal(p.enabled, false)
  assert.equal(p.gate.reason, 'uninitialized')
  assert.equal(p.approved, true)
  assert.match(p.audit.id, /^asp\d{3}$/)
  assert.ok(FORMATS.includes(p.audit.format) && p.audit.angle)
  assert.equal(p.link, `https://t.me/AuditShield_01_Bot?start=a1_tc_auditshield_${p.audit.id}`)
  assert.ok(p.text.includes(`(${p.link})`))
  assert.equal(p.identifier, `auditshield:${p.audit.id}:${p.audit.angle}`)
  assert.equal(p.selection.status, 'selected')
  assert.equal(h.tg.sent.length, 0)
  assert.equal(h.gh.puts.length, 0)
  assert.equal(h.anthropic.length, 0)
})

test('dry-run previews candidates: a specific post by id, or the whole unapproved library with candidates=1; by default unapproved posts are not offered', async t => {
  const h = make(t, {}, { approved: false })
  setT(at(8, 10))
  const none = await h.run(handler, { type: 'middle', dry: '1', auditshield: '1' })
  assert.equal(none.body.auditshield.blocked, 'library_empty')
  const one = await h.run(handler, { type: 'middle', dry: '1', auditshield: '1', post: 'asp003' })
  assert.equal(one.body.auditshield.audit.id, 'asp003')
  assert.equal(one.body.auditshield.approved, false)
  assert.match(one.body.auditshield.text, /start=a1_tc_auditshield_asp003\)/)
  const all = await h.run(handler, { type: 'middle', dry: '1', auditshield: '1', candidates: '1' })
  assert.equal(all.body.auditshield.approved, false)
  assert.ok(all.body.auditshield.audit.id)
  const unknown = await h.run(handler, { type: 'middle', dry: '1', auditshield: '1', post: 'asp999' })
  assert.equal(unknown.body.auditshield.blocked, 'unknown_post')
  assert.equal(h.tg.sent.length, 0); assert.equal(h.gh.puts.length, 0); assert.equal(h.anthropic.length, 0)
})

test('dry-run without the auditshield switch behaves exactly as before (normal preview, no state write)', async t => {
  const h = make(t, {}, { enabled: true })
  setT(at(9, 10))
  const r = await h.run(handler, { type: 'content', dry: '1' })
  assert.equal(r.status, 200); assert.equal(r.body.dry, true); assert.ok(r.body.text)
  assert.equal(h.tg.sent.length, 0); assert.equal(h.gh.puts.length, 0)
  assert.equal(h.anthropic.length, 1, 'a normal preview still asks the model, as before')
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
