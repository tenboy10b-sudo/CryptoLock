// Чиста логіка AuditShield-постів зі статичної бібліотеки: реєстр, бібліотека, гейти частоти, вибір, валідатор, схожість, атрибуція, стан.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { ANGLES, ANGLE_BY_ID, FORMATS, VERIFIED_FACTS } from '../lib/auditshieldAngles.js'
import { APPROVED_POSTS } from '../lib/auditshieldApprovedPosts.js'
import {
  LIMITS, BODY, SIMILARITY, CTA_VARIANTS, auditshieldEnabled, parseA1Payload, buildAttributionLink, readState, evaluateGates,
  selectApprovedPost, previewPostById, renderApprovedPost, validateApprovedPost, validateLibrary, nearDuplicate, bodyHash, splitBody,
  markdownProblems, escapeMarkdownV1, assemblePost, nextAuditshieldState, recordUnconfirmed, extractCode, isApproved,
} from '../lib/auditshieldPost.js'

const DAY = 86400000
const NOW = new Date('2026-11-10T10:01:00Z')
const iso = ms => new Date(ms).toISOString()
const ago = d => iso(NOW.getTime() - d * DAY)

// Копія бібліотеки з поточними полями затвердження / затверджена копія (версія 'test' + хеш тексту).
const copyLib = () => APPROVED_POSTS.map(p => ({ ...p }))
const approvedLib = (lib = copyLib()) => lib.map(p => ({ ...p, approved_version: 'test', approved_sha: bodyHash(p.body) }))
const byId = id => APPROVED_POSTS.find(p => p.id === id)
const LIB = approvedLib()

function entry(over = {}) {
  return { id: 'asp900', angle: 'startup-unknown', format: 'diagnostic', topic: 't', content_id: 'asp900', cta_variant: 0, text_sha: 'zz', published_at: ago(20), message_id: 1, status: 'published', ...over }
}
function aud(over = {}) {
  return { v: 1, seq: 0, posts_since: 10, initialized_at: ago(30), last_published_at: null, manual_last_at: null, history: [], ...over }
}
const st = a => ({ auditshield: a })
const select = (state, over = {}) => selectApprovedPost({ state, now: NOW, library: LIB, ...over })

// ── реєстр кутів ──
test('angles: ids unique, valid a1-style tokens, known formats; module names exist in PROMO_MODULES of autopost.js (topic guard really works)', () => {
  const src = readFileSync(new URL('../pages/api/autopost.js', import.meta.url), 'utf-8')
  const ids = ANGLES.map(a => a.id)
  assert.equal(new Set(ids).size, ids.length)
  for (const a of ANGLES) {
    assert.match(a.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    assert.ok(FORMATS.includes(a.format))
    assert.ok(a.keywords.length && typeof a.demoCovers === 'string' && a.demoCovers.length > 20 && typeof a.limits === 'string' && a.limits.length > 20, a.id)
    if (a.module) assert.ok(src.includes(`module: '${a.module}'`), a.module)
    if (a.format === 'tool') assert.equal(a.steps.length, 0)
    else assert.ok(a.steps.length >= 1, a.id)
  }
})

test('facts: no stale 22-module claim, no absolute network/privacy claim for the full version, 24 modules stated', () => {
  const blob = VERIFIED_FACTS.join(' ')
  assert.doesNotMatch(blob, /22\s*модул|нічого не передається|жодних даних/i)
  assert.match(blob, /24 модулі/)
})

// ── бібліотека ──
test('library: 12 candidates = 3 diagnostic + 3 quick + 2 checklist + 3 myth + 1 tool (direct product post is 1 of 12)', () => {
  const count = f => APPROVED_POSTS.filter(p => p.format === f).length
  assert.deepEqual(FORMATS.map(count), [3, 3, 2, 3, 1])
  assert.equal(APPROVED_POSTS.length, 12)
})

test('library: ids asp###, unique content ids accepted by the bot grammar, 12 distinct angles that exist and match the format', () => {
  const ids = APPROVED_POSTS.map(p => p.id)
  assert.equal(new Set(ids).size, 12)
  for (const p of APPROVED_POSTS) {
    assert.match(p.id, /^asp\d{3}$/)
    assert.deepEqual(parseA1Payload(`a1_tc_auditshield_${p.id}`), { source: 'tg_channel', campaign: 'auditshield', content: p.id })
    assert.equal(buildAttributionLink(p.id).url, `https://t.me/AuditShield_01_Bot?start=a1_tc_auditshield_${p.id}`)
    assert.equal(ANGLE_BY_ID[p.angle].format, p.format, p.id)
    assert.ok(Number.isInteger(p.cta_variant) && p.cta_variant < CTA_VARIANTS.length)
  }
  assert.equal(new Set(APPROVED_POSTS.map(p => p.angle)).size, 12)
})

test('library: rotation order never puts two posts of the same format back to back', () => {
  for (let i = 1; i < APPROVED_POSTS.length; i++) assert.notEqual(APPROVED_POSTS[i].format, APPROVED_POSTS[i - 1].format, APPROVED_POSTS[i].id)
})

test('library: every candidate passes the deterministic validator, and no two posts are near-duplicates', () => {
  for (const p of APPROVED_POSTS) assert.deepEqual(validateApprovedPost(p, { requireApproval: false }).reasons, [], p.id)
  assert.deepEqual(validateLibrary(APPROVED_POSTS).problems, [])
})

test('library: style budget — body ≤1100 (checklist ≤1400), most 500–1000; ≤1 command per ordinary post, ≤3 checks in a checklist; hook, soft bridge', () => {
  let inBand = 0
  for (const p of APPROVED_POSTS) {
    const max = p.format === 'checklist' ? BODY.maxChecklist : BODY.max
    assert.ok(p.body.length <= max, `${p.id} ${p.body.length}`)
    if (p.body.length >= 500 && p.body.length <= 1000) inBand++
    const commands = (p.body.match(/```/g) || []).length / 2
    if (p.format === 'checklist') {
      assert.ok(commands <= 3 && (p.body.match(/^\s*\d+[.)]\s/gm) || []).length <= 3, p.id)
    } else {
      assert.ok(commands <= 1, `${p.id} has ${commands} commands`)
    }
    const { hook, bridge } = splitBody(p.body)
    assert.match(hook, /^\p{Extended_Pictographic}/u)
    assert.ok(bridge.length <= BODY.bridgeMax && /AuditShield/.test(p.format === 'tool' ? p.body : bridge), p.id)
  }
  assert.ok(inBand >= 10, `posts inside 500–1000: ${inBand}/12`)
})

test('library: post text carries no AI tics, scare wording or third-party brands (explicit scan, independent of the validator rules)', () => {
  const blob = APPROVED_POSTS.map(p => p.body).join('\n')
  assert.doesNotMatch(blob, /Чесно:|Читання результату|ось що потрібно|піратськ|тривожн|22 модул|Google|Mozilla|CCleaner|100\s*%/i)
  assert.doesNotMatch(blob, /нічого не надсилає|без передачі даних|жодних даних|нікуди не/i)
})

test('library: shipped posts are candidates until the owner approves them — a candidate is never selectable, an approved one is', () => {
  const fresh = copyLib().map(p => ({ ...p, approved_version: null, approved_sha: null }))
  const r = selectApprovedPost({ state: st(aud()), now: NOW, library: fresh })
  assert.equal(r.status, 'library_empty')
  assert.equal(r.post, undefined)
  const withPreview = selectApprovedPost({ state: st(aud()), now: NOW, library: fresh, includeCandidates: true })
  assert.deepEqual([withPreview.status, withPreview.post.id], ['selected', 'asp001'])
  assert.equal(isApproved(fresh[0]), false)
  assert.equal(isApproved(LIB[0]), true)
})

// ── прапорець ──
test('auditshieldEnabled: off by default, only explicit true/1/on', () => {
  assert.equal(auditshieldEnabled({}), false)
  assert.equal(auditshieldEnabled({ AUDITSHIELD_POSTS_ENABLED: '' }), false)
  assert.equal(auditshieldEnabled({ AUDITSHIELD_POSTS_ENABLED: 'false' }), false)
  assert.equal(auditshieldEnabled({ AUDITSHIELD_POSTS_ENABLED: 'yes' }), false)
  for (const v of ['true', 'TRUE', '1', 'on']) assert.equal(auditshieldEnabled({ AUDITSHIELD_POSTS_ENABLED: v }), true)
})

// ── атрибуція ──
test('attribution: parser mirrors the bot grammar (valid and rejected payloads)', () => {
  assert.deepEqual(parseA1Payload('a1_tc_auditshield_asp007'), { source: 'tg_channel', campaign: 'auditshield', content: 'asp007' })
  assert.deepEqual(parseA1Payload('a1_st'), { source: 'site_tool', campaign: null, content: null })
  for (const bad of ['', 'a1', 'a2_tc_x', 'a1_xx_x', 'A1_tc_x', 'a1_tc_Auditshield', 'a1_tc__x', 'a1_tc_x_y_z', 'a1_tc_x-', 'a1_tc_-x', 'a1_tc_x y', 'a1_tc_' + 'a'.repeat(17), 'a1_tc_x_' + 'a'.repeat(25), 'a1_tc_x\n']) {
    assert.equal(parseA1Payload(bad), null, JSON.stringify(bad))
  }
  assert.equal(parseA1Payload('a1_tc_' + 'a'.repeat(16))?.campaign, 'a'.repeat(16))
  assert.equal(parseA1Payload(undefined), null)
})

test('attribution: link = source tc, campaign auditshield, content = approved post id; an id the bot would reject blocks', () => {
  assert.equal(buildAttributionLink('asp001').url, 'https://t.me/AuditShield_01_Bot?start=a1_tc_auditshield_asp001')
  assert.notEqual(buildAttributionLink('asp001').url, buildAttributionLink('asp002').url)
  for (const bad of ['ASP001', 'asp001_x', 'asp001-' + 'x'.repeat(30), '', 'asp 001', 'asp001-']) {
    assert.throws(() => buildAttributionLink(bad), /attribution_link_invalid/, bad)
  }
})

// ── стан і гейти ──
test('readState: absent → uninitialized; valid (with or without used_ids) → ok; every malformed shape → malformed', () => {
  assert.equal(readState({}).status, 'uninitialized')
  assert.equal(readState({ auditshield: null }).status, 'uninitialized')
  assert.equal(readState(st(aud())).status, 'ok')
  assert.equal(readState(st(aud({ used_ids: ['asp001'] }))).status, 'ok')
  const bad = [{ ...aud(), v: 2 }, { ...aud(), seq: -1 }, { ...aud(), seq: 1.5 }, { ...aud(), posts_since: 'x' }, { ...aud(), initialized_at: 'nope' },
    { ...aud(), last_published_at: 'nope' }, { ...aud(), manual_last_at: 'nope' }, { ...aud(), history: {} }, { ...aud(), history: [{ id: 1 }] },
    { ...aud(), history: [entry({ format: 'zzz' })] }, { ...aud(), used_ids: 'asp001' }, { ...aud(), used_ids: [1] }, 'string', 5, []]
  for (const b of bad) assert.equal(readState(st(b)).status, 'malformed', JSON.stringify(b).slice(0, 60))
})

test('gates: nothing before init; 7 days AND 7 posts both required (1 per 7 days, 1 per 8 posts)', () => {
  assert.deepEqual(evaluateGates({}, NOW), { eligible: false, reason: 'uninitialized' })
  assert.equal(evaluateGates(st({ ...aud(), v: 9 }), NOW).reason, 'state_malformed')
  const last = (days, posts) => st(aud({ seq: 1, posts_since: posts, last_published_at: ago(days) }))
  assert.equal(evaluateGates(last(7, 7), NOW).eligible, true)
  assert.equal(evaluateGates(last(6.99, 50), NOW).reason, 'min_days')
  assert.equal(evaluateGates(last(60, 6), NOW).reason, 'min_posts')
  assert.equal(evaluateGates(last(60, 3), NOW).reason, 'min_posts')   // «3 звичайні» мало — діє суворіше «1 на 8»
  assert.equal(evaluateGates(last(60, 0), NOW).reason, 'min_posts')   // два поспіль неможливі
})

test('gates: before the first AuditShield post the clock runs from initialization', () => {
  assert.equal(evaluateGates(st(aud({ initialized_at: ago(6), posts_since: 30 })), NOW).reason, 'min_days')
  assert.equal(evaluateGates(st(aud({ initialized_at: ago(8), posts_since: 30 })), NOW).eligible, true)
  assert.equal(evaluateGates(st(aud({ initialized_at: ago(8), posts_since: 2 })), NOW).reason, 'min_posts')
})

test('gates: a manual AuditShield post (owner marker) blocks for 7 days; future timestamps block (clock skew)', () => {
  assert.equal(evaluateGates(st(aud({ seq: 1, last_published_at: ago(30), manual_last_at: ago(3) })), NOW).reason, 'manual_recent')
  assert.equal(evaluateGates(st(aud({ seq: 1, last_published_at: ago(30), manual_last_at: ago(8) })), NOW).eligible, true)
  assert.equal(evaluateGates(st(aud({ seq: 1, last_published_at: iso(NOW.getTime() + 3600e3) })), NOW).reason, 'clock_skew')
})

// ── вибір наступного затвердженого поста ──
test('select: deterministic — the first approved post in library order; the same input always gives the same answer', () => {
  const a = select(st(aud())), b = select(st(aud()))
  assert.deepEqual([a.status, a.post.id], ['selected', 'asp001'])
  assert.equal(b.post.id, a.post.id)
  assert.equal(select({}).post.id, 'asp001')                          // стан ще не ініціалізовано: лише прев'ю, але вибір працює
})

test('select: an id that was already published is never chosen again while others remain (used_ids and history both count)', () => {
  assert.equal(select(st(aud({ seq: 1, used_ids: ['asp001'] }))).post.id, 'asp002')
  assert.equal(select(st(aud({ seq: 1, history: [entry({ id: 'asp001', angle: 'startup-unknown', content_id: 'asp001', published_at: ago(1) })] }))).post.id, 'asp002')
  assert.equal(select(st(aud({ seq: 2, used_ids: ['asp001', 'asp002'] }))).post.id, 'asp003')
})

test('select: used_ids is never trimmed — 31 published posts push the first out of the 24-entry history, it still cannot come back', () => {
  let s = nextAuditshieldState(undefined, null, NOW)
  const audit = (id, angle) => ({ id, angle, format: 'diagnostic', topic: 't', content_id: id, cta_variant: 0, approved_version: 'test', text_sha: `h-${id}`, selected_at: NOW.toISOString() })
  s = nextAuditshieldState(s, audit('asp001', 'startup-unknown'), new Date(NOW.getTime() - 400 * DAY))
  for (let i = 0; i < 30; i++) s = nextAuditshieldState(s, audit(`asp9${String(i).padStart(2, '0')}`, `filler-${i}`), new Date(NOW.getTime() - (399 - i) * DAY))
  assert.equal(s.history.length, LIMITS.historyLight)
  assert.ok(!s.history.some(e => e.id === 'asp001'), 'trimmed out of history')
  assert.equal(s.used_ids.length, 31)
  assert.equal(select(st(s)).post.id, 'asp002', 'asp001 stays used')
})

test('select: the same text under a new id, or a light rewrite of an already published post, is not published again', () => {
  const published = nextAuditshieldState(nextAuditshieldState(undefined, null, NOW), renderApprovedPost(LIB[0], NOW).audit, new Date(NOW.getTime() - 20 * DAY))
  const approve = p => ({ ...p, approved_version: 'test', approved_sha: bodyHash(p.body) })
  const sameText = approve({ ...LIB[0], id: 'asp101' })                // точний текст asp001 під новим id: ловить хеш у історії
  const r1 = selectApprovedPost({ state: st(published), now: NOW, library: [LIB[0], sameText, ...LIB.slice(1)] })
  assert.notEqual(r1.post.id, 'asp101')
  assert.equal(r1.duplicate, 1)
  const lightRewrite = approve({ ...LIB[0], id: 'asp102', body: LIB[0].body.replace('Скільки програм', 'Яка кількість програм').replace('є команда', 'доступна команда') })
  const r2 = selectApprovedPost({ state: st(published), now: NOW, library: [LIB[0], lightRewrite, ...LIB.slice(1)] })   // ловить схожість із опублікованим постом бібліотеки
  assert.notEqual(r2.post.id, 'asp102')
  assert.equal(r2.duplicate, 1)
})

test('select: 45-day angle cooldown is exact (44.9 days blocked, 45.1 allowed)', () => {
  const used = days => st(aud({ seq: 1, history: [entry({ id: 'asp900', angle: 'startup-unknown', format: 'myth', published_at: ago(days) })] }))   // myth: правило «не той самий формат підряд» тут не втручається
  const blocked = select(used(44.9))
  assert.notEqual(blocked.post.id, 'asp001')
  assert.equal(blocked.cooldown, 1)
  assert.equal(select(used(45.1)).post.id, 'asp001')
})

test('select: avoids topics of the neighbouring standalone posts and of recent extra/article titles; the skipped post stays available', () => {
  const promo = [{ module: 'Автозапуск' }, ...Array.from({ length: 22 }, (_, i) => ({ module: `Заповнювач ${i}` }))]
  const blocked = select(st(aud()), { promoModules: promo, promoIndex: 0 })
  assert.notEqual(blocked.post.id, 'asp001')
  assert.equal(blocked.topic, 1)
  assert.equal(select(st(aud()), { promoModules: promo, promoIndex: 12 }).post.id, 'asp001')   // вікно -6..+1 вже далеко
  assert.notEqual(select(st(aud()), { extraTopics: ['🔐 Команда дня: автозапуск програм'] }).post.id, 'asp001')
  assert.notEqual(select(st(aud()), { lastPostTitle: 'Як налаштувати автозавантаження програм' }).post.id, 'asp001')
  assert.equal(select(st(aud()), { lastPostTitle: 'Як вибрати принтер' }).post.id, 'asp001')            // чужа тема нічого не блокує
})

test('select: prefers a different format than the previous AuditShield post, but never strands the last posts of one format', () => {
  const afterDiag = st(aud({ seq: 1, history: [entry({ id: 'asp900', angle: 'other', format: 'diagnostic', published_at: ago(10) })] }))
  assert.equal(select(afterDiag).post.id, 'asp002')                   // asp001 (diagnostic) відкладено
  const onlyDiag = LIB.filter(p => p.format === 'diagnostic')
  const r = selectApprovedPost({ state: afterDiag, now: NOW, library: onlyDiag })
  assert.deepEqual([r.status, r.post.format], ['selected', 'diagnostic'])
})

test('select: library exhausted → status library_exhausted, forever — it never starts over by itself', () => {
  let s = nextAuditshieldState(undefined, null, new Date(NOW.getTime() - 200 * DAY))
  LIB.forEach((p, i) => { s = nextAuditshieldState(s, renderApprovedPost(p, NOW).audit, new Date(NOW.getTime() - (180 - i * 10) * DAY)) })
  assert.equal(s.used_ids.length, 12)
  for (const later of [0, 30, 400, 3650]) {
    const r = selectApprovedPost({ state: st(s), now: new Date(NOW.getTime() + later * DAY), library: LIB })
    assert.equal(r.status, 'library_exhausted', `+${later}d`)
    assert.equal(r.post, undefined)
  }
  // явне поповнення: новий затверджений пост із новим id стає доступним, старі не повертаються
  const body = [
    '🧪 Нова добірка, новий пост: ще один погляд на захисник Windows, яким у каналі ще не користувалися.',
    '```\nGet-MpComputerStatus | Select-Object AntivirusEnabled, RealTimeProtectionEnabled, AntivirusSignatureLastUpdated\n```',
    'Якщо в полях стоїть True, відповідний компонент працює. Дата оновлення баз не повинна бути занадто давньою, інакше варто зазирнути в налаштування оновлень Безпеки Windows. Цей текст свідомо написано іншими словами, ніж усі попередні пости бібліотеки.',
    'Стан Defender AuditShield Demo показує серед чотирьох областей перевірки.',
  ].join('\n\n')
  const fresh = { id: 'asp013', format: 'quick', angle: 'defender-status', topic: 'нова добірка', cta_variant: 1, body, approved_version: 'test-2', approved_sha: bodyHash(body) }
  const r = selectApprovedPost({ state: st(s), now: new Date(NOW.getTime() + 400 * DAY), library: [...LIB, fresh] })
  assert.deepEqual([r.status, r.post.id], ['selected', 'asp013'])
})

test('select: no approved posts → library_empty; everything blocked right now → no_eligible_post; malformed state → state_malformed', () => {
  assert.equal(selectApprovedPost({ state: st(aud()), now: NOW, library: [] }).status, 'library_empty')
  const allCooling = st(aud({ seq: 12, history: LIB.map(p => entry({ id: `x-${p.id}`, angle: p.angle, format: p.format, published_at: ago(5) })) }))
  assert.equal(select(allCooling).status, 'no_eligible_post')
  assert.equal(select(st({ v: 99 })).status, 'state_malformed')
})

test('select: an invalid approved post is blocked and reported, the next valid one is used; if none is valid → no_valid_post', () => {
  const broken = LIB.map(p => ({ ...p }))
  broken[0].body = broken[0].body.replace('Незнайома назва ще не вирок', 'Вас зламали, дані вже крадуть')   // правка після затвердження
  const r = selectApprovedPost({ state: st(aud()), now: NOW, library: broken })
  assert.equal(r.post.id, 'asp002')
  assert.deepEqual(r.invalid.map(x => x.id), ['asp001'])
  assert.ok(r.invalid[0].reasons.includes('approved_sha_mismatch'))
  const allBroken = LIB.map(p => ({ ...p, body: p.body + ' Вас зламали.' }))
  assert.equal(selectApprovedPost({ state: st(aud()), now: NOW, library: allBroken }).status, 'no_valid_post')
})

test('previewPostById: shows any library post (candidate or approved) through the same validation; unknown id is reported', () => {
  const r = previewPostById('asp003')
  assert.equal(r.status, 'selected')
  assert.equal(r.approved, isApproved(byId('asp003')))
  assert.equal(previewPostById('asp999').status, 'unknown_post')
  const bad = [{ ...byId('asp003'), body: 'коротко' }]
  assert.equal(previewPostById('asp003', bad).status, 'invalid_post')
})

// ── валідатор: кожне правило має тест, який його порушує ──
const clone = id => ({ ...byId(id) })
const middle = (p, extra) => { const ps = p.body.split('\n\n'); ps[ps.length - 2] += ' ' + extra; p.body = ps.join('\n\n'); return p }
const bridgeTo = (p, text) => { const ps = p.body.split('\n\n'); ps[ps.length - 1] = text; p.body = ps.join('\n\n'); return p }
const reasonsOf = (id, mut) => { const p = clone(id); mut(p); return validateApprovedPost(p, { requireApproval: false }).reasons }

test('validator: a clean post has no reasons (control for every mutation below)', () => {
  for (const id of ['asp002', 'asp004', 'asp009']) assert.deepEqual(reasonsOf(id, () => {}), [], id)
})

test('validator: scare, urgency, guarantees, scores, stale facts, price/sales words are blocked', () => {
  const cases = {
    scare: 'Вас зламали, і ваші дані вже крадуть.', alarmist: 'Піратська Windows — тривожна ознака.', urgency: 'Перевірте терміново.',
    guarantee: 'Це дає 100% захист і гарантує безпеку.', score: 'Ваш рівень ризику 70/100.', stale_module_count: 'У AuditShield 22 модулі.',
    price_or_sales: 'Купити повну версію за $9.',
  }
  for (const [code, text] of Object.entries(cases)) assert.ok(reasonsOf('asp002', p => middle(p, text)).includes(code), code)
  // кожен варіант страшилки окремо, щоб жоден не прикривав інший
  for (const text of ['Вас зламали.', 'Ваші дані вже крадуть.', 'Дані вже вкрали.', 'Вас хакнули.']) assert.ok(reasonsOf('asp002', p => middle(p, text)).includes('scare'), text)
  for (const text of ['Негайно перевірте.', 'Не зволікайте.', 'Це ваш останній шанс.', 'Тільки сьогодні.']) assert.ok(reasonsOf('asp002', p => middle(p, text)).includes('urgency'), text)
  for (const text of ['Гарантія безпеки.', 'Знайде всі загрози.', 'Це повний захист.', 'Замінює антивірус.']) assert.ok(reasonsOf('asp002', p => middle(p, text)).includes('guarantee'), text)
})

test('validator: absolute privacy / network claims are blocked in every wording the real-model run slipped through', () => {
  for (const text of ['Demo нічого не надсилає.', 'Звіт створюється без передачі даних.', 'Жодних даних нікуди не передається.', 'Працює офлайн.', 'Demo не передає жодних даних.', 'Без інтернету теж працює.']) {
    assert.ok(reasonsOf('asp002', p => middle(p, text)).includes('privacy_absolute'), text)
  }
  assert.ok(!reasonsOf('asp002', p => middle(p, 'Звіт створюється локально на вашому ПК.')).includes('privacy_absolute'))   // конкретне і підтверджене формулювання дозволене
})

test('validator: AI chatter and third-party brands are blocked', () => {
  for (const text of ['Чесно: так буває.', 'Читання результату: дивіться колонку.', 'Ось що потрібно знати.', 'Варто зазначити, що це швидко.']) {
    assert.ok(reasonsOf('asp002', p => middle(p, text)).includes('ai_phrase'), text)
  }
  for (const text of ['Часто це оновлювач Google.', 'Або CCleaner.', 'Чи Kaspersky.']) assert.ok(reasonsOf('asp002', p => middle(p, text)).includes('third_party_brand'), text)
})

test('validator: links, hashtags, mentions, markup, backslashes outside code and unbalanced backticks are blocked', () => {
  assert.ok(reasonsOf('asp002', p => middle(p, 'https://example.com')).includes('link_in_text'))
  assert.ok(reasonsOf('asp002', p => middle(p, 't.me/x')).includes('link_in_text'))
  assert.ok(reasonsOf('asp002', p => middle(p, '#windows')).includes('hashtag_in_text'))
  assert.ok(reasonsOf('asp002', p => middle(p, '@cryptolock888')).includes('mention_in_text'))
  assert.ok(reasonsOf('asp002', p => middle(p, '**жирний**')).includes('markup_in_text'))
  assert.ok(reasonsOf('asp002', p => middle(p, 'C:\\Windows')).includes('backslash_outside_code'))
  assert.ok(reasonsOf('asp002', p => middle(p, '`відкрита')).includes('unbalanced_backticks'))
  assert.ok(reasonsOf('asp002', p => { p.body = p.body.replace(/\n```\n\n/, '\n\n') }).includes('unbalanced_backticks'))   // фенс без закриття
  assert.ok(reasonsOf('asp002', p => { p.body = p.body.replace(/(Get-MpComputerStatus[^\n]*)\n/, '$1\n\nвставка\n') }).includes('blank_line_in_code'))   // порожній рядок усередині блоку коду
})

test('validator: destructive, hallucinated and altered PowerShell is blocked; only the verified command of the angle may be fenced', () => {
  assert.ok(reasonsOf('asp002', p => { p.body = p.body.replace(/Get-MpComputerStatus[^\n]*/, 'Get-Process | Stop-Process -Force') }).includes('unverified_command'))
  assert.ok(reasonsOf('asp002', p => { p.body = p.body.replace(/Get-MpComputerStatus[^\n]*/, 'Remove-Item -Recurse C:\\Users') }).includes('unsafe_command'))
  assert.ok(reasonsOf('asp002', p => middle(p, 'Спробуйте Stop-Service та Set-MpPreference.')).includes('unsafe_command'))   // навіть у прозі
  assert.ok(reasonsOf('asp002', p => { p.body = p.body.replace('AntivirusEnabled,', 'AntivirusEnabledX,') }).includes('unverified_command'))
  assert.ok(reasonsOf('asp002', p => middle(p, 'Або `Invoke-Expression`.')).includes('unsafe_command'))
  assert.ok(!reasonsOf('asp002', p => middle(p, 'Назву `AntivirusEnabled` видно у виводі.')).includes('unverified_command'))   // ім'я поля в зворотних лапках — не команда
  assert.ok(reasonsOf('asp004', p => { p.body = p.body.replace('Get-Process | Sort-Object', 'Get-Process | Out-File x.txt; Sort-Object') }).includes('unverified_command'))
  assert.deepEqual(extractCode('a `x y` b\n```\nl1\n l2 \n```'), ['l1', 'l2', 'x y'])
})

test('validator: command budget — one command in an ordinary post, up to three checks in a checklist', () => {
  assert.ok(reasonsOf('asp002', p => { p.body = p.body.replace('\n\nAntivirusEnabled', '\n\n```\n' + 'Get-MpComputerStatus | Select-Object AntivirusEnabled, RealTimeProtectionEnabled, AntivirusSignatureLastUpdated' + '\n```\n\nAntivirusEnabled') }).includes('too_many_commands'))
  assert.ok(reasonsOf('asp008', p => middle(p, '\n\n```\nGet-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location\n```')).includes('too_many_commands'))
  assert.ok(reasonsOf('asp008', p => middle(p, '\n\n4. Ще одна перевірка.')).includes('checklist_items'))
  assert.ok(reasonsOf('asp004', p => { p.body = p.body.replace(/\n\n3\. [^\n]*/, '').replace(/\n\n2\. [^\n]*/, '') }).includes('checklist_items'))   // лишився 1 пункт
  assert.ok(reasonsOf('asp002', p => { p.body = p.body.replace(/```\n[^\n]*\n```\n\n/, '') }).includes('format_without_command'))
  assert.ok(reasonsOf('asp001', p => { p.body = p.body.replace(/```\n[^\n]*\n```\n\n/, '') }).includes('format_without_command'))
})

test('validator: structure — emoji hook, a soft one-sentence bridge that names AuditShield, product only in the bridge (tool excepted), length bounds', () => {
  assert.ok(reasonsOf('asp002', p => { p.body = p.body.replace(/^\S+\s/, '') }).includes('hook_without_emoji'))
  assert.ok(reasonsOf('asp002', p => { p.body = p.body.replace('🛡', '🛡🔥🔥') }).includes('too_many_emoji'))
  assert.ok(reasonsOf('asp002', p => bridgeTo(p, 'Просто спробуйте безкоштовне демо.')).includes('bridge_without_auditshield'))
  assert.ok(reasonsOf('asp002', p => bridgeTo(p, 'AuditShield Demo показує стан Defender. Він безкоштовний.')).includes('bridge_not_single_sentence'))
  assert.ok(reasonsOf('asp002', p => bridgeTo(p, 'AuditShield Demo показує стан Defender ' + 'разом з іншими областями '.repeat(10) + '.')).includes('bridge_too_long'))
  assert.ok(reasonsOf('asp002', p => { p.body = p.body.replace('🛡 Чи справді', '🛡 AuditShield: чи справді') }).includes('product_outside_bridge'))
  assert.ok(reasonsOf('asp002', p => middle(p, 'Є й Demo.')).includes('product_outside_bridge'))
  assert.ok(reasonsOf('asp002', p => { p.body = '🛡 Коротко.\n\nМало.\n\nAuditShield Demo.' }).includes('too_short'))
  assert.ok(reasonsOf('asp002', p => middle(p, 'слово '.repeat(300))).includes('too_long'))
  assert.ok(reasonsOf('asp002', p => { p.body = p.body.replace(/\n\n/g, ' ') }).includes('too_few_paragraphs'))
  assert.ok(reasonsOf('asp003', p => { p.body = '🧩 ' + 'довге речення '.repeat(30) + '\n\n' + p.body.split('\n\n').slice(1).join('\n\n') }).includes('hook_too_long'))
  assert.ok(!reasonsOf('asp008', p => middle(p, 'слово '.repeat(60))).includes('too_long'), 'a checklist may run to ~1300 (limit 1400)')
  assert.ok(reasonsOf('asp008', p => middle(p, 'слово '.repeat(120))).includes('too_long'), 'but the checklist limit is 1400, not unlimited')
  assert.ok(!reasonsOf('asp002', p => middle(p, 'слово '.repeat(50))).includes('too_long'), 'an ordinary post of ~1050 is still allowed')
  assert.ok(reasonsOf('asp002', p => middle(p, 'слово '.repeat(90))).includes('too_long'), 'an ordinary post is capped at 1100')
})

test('validator: tool format — must say it is free, mentions AuditShield 1–5 times', () => {
  assert.ok(reasonsOf('asp009', p => { p.body = p.body.replace(/безкоштовн\S*/gi, 'доступний') }).includes('tool_without_free'))
  assert.ok(reasonsOf('asp009', p => middle(p, 'AuditShield AuditShield AuditShield AuditShield AuditShield.')).includes('auditshield_mentions'))
})

test('validator: the Demo cannot be credited with areas it does not cover (network, services, accounts, login log); honest negations are fine', () => {
  for (const text of ['AuditShield Demo перевіряє мережеві підключення.', 'Demo показує служби і облікові записи.', 'AuditShield Demo шукає шкідливі файли.', 'Demo читає журнал входів.']) {
    assert.ok(reasonsOf('asp002', p => bridgeTo(p, text)).includes('demo_overclaim'), text)
  }
  for (const text of ['AuditShield Demo не охоплює мережеві підключення.', 'Служби перевіряє вже повна версія, а Demo не шукає шкідливі файли.']) {
    assert.ok(!reasonsOf('asp002', p => bridgeTo(p, text)).includes('demo_overclaim'), text)
  }
})

test('validator: record shape — id, format, angle (and its format), cta variant; unknown shapes are rejected', () => {
  assert.ok(reasonsOf('asp002', p => { p.id = 'ASP002' }).includes('bad_id'))
  assert.ok(reasonsOf('asp002', p => { p.id = 'asp2' }).includes('bad_id'))
  assert.ok(reasonsOf('asp002', p => { p.format = 'zzz' }).includes('bad_format'))
  assert.ok(reasonsOf('asp002', p => { p.angle = 'nope' }).includes('unknown_angle'))
  assert.ok(reasonsOf('asp002', p => { p.format = 'myth' }).includes('angle_format_mismatch'))
  assert.ok(reasonsOf('asp002', p => { p.cta_variant = 9 }).includes('bad_cta_variant'))
  assert.ok(reasonsOf('asp002', p => { p.topic = '' }).includes('bad_topic'))
  assert.ok(reasonsOf('asp002', p => { p.body = '' }).includes('bad_body'))
  assert.deepEqual(validateApprovedPost(null).reasons, ['not_an_object'])
})

test('validator: approval is two-part — a non-empty approved_version AND a hash of the exact text', () => {
  const p = clone('asp002')
  assert.ok(validateApprovedPost({ ...p, approved_version: null, approved_sha: null }).reasons.includes('not_approved'))
  assert.ok(validateApprovedPost({ ...p, approved_version: 'v1', approved_sha: 'deadbeef' }).reasons.includes('approved_sha_mismatch'))
  assert.deepEqual(validateApprovedPost({ ...p, approved_version: 'v1', approved_sha: bodyHash(p.body) }).reasons, [])
  assert.equal(validateApprovedPost({ ...p, approved_version: 'v1', approved_sha: bodyHash(p.body + ' ') }).reasons.includes('approved_sha_mismatch'), true)   // навіть пробіл = нове затвердження
})

test('validateLibrary: duplicate ids, identical text and near-duplicate pairs are all reported', () => {
  const a = { ...LIB[1] }
  assert.ok(validateLibrary([LIB[1], a]).problems.some(x => x.problem === 'duplicate_id'))
  const same = { ...LIB[1], id: 'asp201' }
  const pair = validateLibrary([LIB[1], same]).problems
  assert.ok(pair.some(x => x.problem === 'duplicate_text') && pair.some(x => x.problem === 'similar'))
  const light = { ...LIB[1], id: 'asp202', body: LIB[1].body.replace('Чи справді працює', 'Чи точно працює') }
  assert.ok(validateLibrary([LIB[1], light]).problems.some(x => x.problem === 'similar'))
  assert.ok(validateLibrary([{ ...LIB[1], body: 'x' }]).problems.some(x => x.problem === 'invalid'))
})

// ── схожість ──
test('nearDuplicate: each metric works on its own (the others are switched off), and unrelated posts are never flagged', () => {
  const a = byId('asp002').body
  const [hook, ...rest] = a.split('\n\n')
  const bridge = rest.pop()
  const middle = rest.join('\n\n')
  const join = (...parts) => parts.join('\n\n')
  assert.deepEqual([nearDuplicate(a, a).dup, nearDuplicate(a, a).reason], [true, 'exact'])
  assert.equal(nearDuplicate(byId('asp001').body, byId('asp012').body).dup, false, 'unrelated posts are not flagged with the real thresholds')
  const saved = { ...SIMILARITY }
  const only = metric => { Object.assign(SIMILARITY, saved, { prose: 2, body: 2, hook: 2, bridge: 2, commands: 2 }); SIMILARITY[metric] = saved[metric] }
  try {
    only('hook'); assert.equal(nearDuplicate(a, join(hook, 'Зовсім інша середина без спільних слів зі старою.', 'Інший місток без спільних слів.')).reason, 'same_hook')
    only('bridge'); assert.equal(nearDuplicate(a, join('🧪 Зовсім інший вступ без спільних слів.', 'Нова середина без спільних слів зі старою.', bridge)).reason, 'same_bridge')
    only('prose'); assert.equal(nearDuplicate(a, a.replace('Чи справді', 'Чи точно')).reason, 'near_duplicate')
    only('body'); assert.equal(nearDuplicate(a, join('🧪 Інший вступ без спільних слів.', middle, 'Інший місток без спільних слів із першим.')).reason, 'same_body')
    const asp8 = byId('asp008').body
    const sameCommands = join('🧭 Інший початок без спільних слів.', ...asp8.split('\n\n').filter(x => x.startsWith('```')), 'Інший кінець AuditShield.')
    only('commands'); assert.equal(nearDuplicate(asp8, sameCommands).reason, 'same_checklist')
    Object.assign(SIMILARITY, saved, { prose: 2, body: 2, hook: 2, bridge: 2, commands: 2 })
    assert.equal(nearDuplicate(a, a.replace('Чи справді', 'Чи точно')).dup, false, 'control: with every metric off nothing is flagged')
  } finally { Object.assign(SIMILARITY, saved) }
})

// ── Markdown і збірка ──
test('markdown: _ * [ escaped outside code, untouched inside code; CTA link keeps its underscores', () => {
  assert.equal(escapeMarkdownV1('a_b *c* [d]'), 'a\\_b \\*c\\* \\[d]')
  assert.equal(escapeMarkdownV1('x_y `a_b*c` z_w'), 'x\\_y `a_b*c` z\\_w')
  assert.equal(escapeMarkdownV1('```\nGet_X | a*b\n``` після_блоку'), '```\nGet_X | a*b\n``` після\\_блоку')
  const text = assemblePost({ body: '🔍 a_b\n\nb', ctaVariant: 0, url: 'https://t.me/AuditShield_01_Bot?start=a1_tc_auditshield_asp001' })
  assert.match(text, /\[Demo у Telegram\]\(https:\/\/t\.me\/AuditShield_01_Bot\?start=a1_tc_auditshield_asp001\)/)
  assert.match(text, /🔍 a\\_b/)
  assert.ok(text.endsWith('#windows #безпека'))
})

test('markdown: broken Telegram text is detected (unbalanced fence/backtick, unescaped markup, wrong link count, over 4096)', () => {
  const good = assemblePost({ body: '🔍 текст\n\n```\nGet-Process\n```', ctaVariant: 0, url: buildAttributionLink('asp001').url })
  assert.deepEqual(markdownProblems(good), [])
  assert.ok(markdownProblems(good.replace('```\n\n🔎', '\n\n🔎')).includes('unbalanced_fences'))
  assert.ok(markdownProblems(good.replace('текст', 'те`кст')).includes('unbalanced_inline_backticks'))
  assert.ok(markdownProblems(good.replace('текст', 'те_кст')).includes('unescaped_markup_char'))
  assert.ok(markdownProblems(good.replace('текст', 'те*кст')).includes('unescaped_markup_char'))
  assert.ok(markdownProblems(good + '\n[ще](https://t.me/AuditShield_01_Bot?start=a1_tc_auditshield_asp002)').includes('link_count_2'))
  assert.ok(markdownProblems(good.replace(/\(https[^)]*\)/, '')).includes('link_count_0'))
  assert.ok(markdownProblems(good + 'я'.repeat(4100)).includes('over_4096'))
})

test('CTA: every variant points to the Demo link, none mentions price or purchase', () => {
  assert.equal(CTA_VARIANTS.length, 4)
  for (const f of CTA_VARIANTS) {
    const t = f('https://t.me/AuditShield_01_Bot?start=a1_tc_auditshield_asp001')
    assert.match(t, /start=a1_tc_auditshield_/)
    assert.match(t, /Demo|перевірк/i)
    assert.doesNotMatch(t, /купи|ціна|\$|тариф|оплат/i)
  }
})

test('render: every shipped post becomes valid Telegram text — one attribution link with its own id, hashtags last, under 4096, no stray markup', () => {
  for (const p of APPROVED_POSTS) {
    const r = renderApprovedPost(p, NOW)
    assert.deepEqual(markdownProblems(r.text), [], p.id)
    assert.ok(r.text.length < 4096)
    assert.ok(r.text.includes(`(https://t.me/AuditShield_01_Bot?start=a1_tc_auditshield_${p.id})`))
    assert.ok(r.text.endsWith('#windows #безпека'))
    assert.ok(r.text.includes('\n\n' + CTA_VARIANTS[p.cta_variant](r.link) + '\n\n'), 'the CTA is the one chosen for this post')
    assert.deepEqual(r.audit, { id: p.id, angle: p.angle, format: p.format, topic: p.topic, content_id: p.id, cta_variant: p.cta_variant, approved_version: p.approved_version, text_sha: bodyHash(p.body), selected_at: NOW.toISOString() })
    assert.ok(r.text.startsWith(escapeMarkdownV1(p.body)), 'the body is sent exactly as written (only Markdown escapes added)')
  }
})

// ── переходи стану ──
test('state: first normal post initializes counters; later posts increment; an AuditShield post resets and records everything required', () => {
  const now = new Date('2026-11-01T10:00:00Z')
  const s1 = nextAuditshieldState(undefined, null, now)
  assert.deepEqual(s1, { v: 1, seq: 0, posts_since: 1, initialized_at: now.toISOString(), last_published_at: null, manual_last_at: null, used_ids: [], history: [] })
  const s2 = nextAuditshieldState(s1, null, now)
  assert.equal(s2.posts_since, 2)
  const audit = renderApprovedPost(LIB[3], now).audit
  const s3 = nextAuditshieldState(s2, audit, new Date('2026-11-09T10:01:00Z'), 777)
  assert.equal(s3.seq, 1); assert.equal(s3.posts_since, 0); assert.equal(s3.last_published_at, '2026-11-09T10:01:00.000Z')
  assert.deepEqual(s3.used_ids, ['asp004'])
  const e = s3.history[0]
  for (const k of ['id', 'angle', 'format', 'topic', 'content_id', 'cta_variant', 'approved_version', 'text_sha', 'published_at', 'message_id', 'status']) assert.ok(e[k] !== undefined, k)
  assert.equal(e.message_id, 777); assert.equal(e.status, 'published'); assert.equal(e.text, undefined, 'no post text is stored in the state')
  assert.equal(readState({ auditshield: s3 }).status, 'ok')
})

test('state: recording the same post twice changes nothing (idempotent); an unconfirmed orphan counts as published', () => {
  const s0 = nextAuditshieldState(undefined, null, NOW)
  const audit = renderApprovedPost(LIB[0], NOW).audit
  const once = nextAuditshieldState(s0, audit, NOW, 5)
  assert.deepEqual(nextAuditshieldState(once, audit, new Date(NOW.getTime() + DAY), 6), once)
  const u = recordUnconfirmed(s0, audit, NOW)
  assert.equal(u.history[0].status, 'unconfirmed'); assert.equal(u.posts_since, 0); assert.equal(u.seq, 1); assert.equal(u.history[0].message_id, null)
  assert.deepEqual(u.used_ids, ['asp001'])
  assert.deepEqual(recordUnconfirmed(u, audit, new Date(NOW.getTime() + DAY)), u)
})

test('state: a legacy state without used_ids still works (ids come from history); malformed state is never rewritten', () => {
  const legacy = aud({ seq: 1, history: [entry({ id: 'asp001', angle: 'startup-unknown', published_at: ago(60) })] })
  assert.equal(select(st(legacy)).post.id, 'asp002')
  const upgraded = nextAuditshieldState(legacy, renderApprovedPost(LIB[1], NOW).audit, NOW)
  assert.deepEqual(upgraded.used_ids, ['asp001', 'asp002'])
  const broken = { v: 99 }
  assert.equal(nextAuditshieldState(broken, null, NOW), broken)
  assert.equal(nextAuditshieldState(broken, renderApprovedPost(LIB[0], NOW).audit, NOW), broken)
})

// ── у шляху AuditShield немає моделі ──
test('no model dependency: the AuditShield modules and the AuditShield part of autopost.js contain no Anthropic/generation code', () => {
  for (const f of ['auditshieldPost.js', 'auditshieldApprovedPosts.js', 'auditshieldAngles.js']) {
    const src = readFileSync(new URL(`../lib/${f}`, import.meta.url), 'utf-8')
    assert.doesNotMatch(src, /anthropic|generateText|fetch\s*\(|claude-|max_tokens|buildPrompt|messages\s*:/i, f)
  }
  const auto = readFileSync(new URL('../pages/api/autopost.js', import.meta.url), 'utf-8')
  const part = auto.slice(auto.indexOf('function tryAuditshield('), auto.indexOf('function settleOrphanAudit('))
  assert.ok(part.length > 1000)
  assert.doesNotMatch(part, /generateText|anthropic|ANTHROPIC|await /i)
  assert.equal(selectApprovedPost({ state: st(aud()), now: NOW, library: LIB }) instanceof Promise, false)
  assert.equal(renderApprovedPost(LIB[0], NOW) instanceof Promise, false)
})
