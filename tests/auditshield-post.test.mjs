// Чиста логіка AuditShield-постів: реєстр, гейти частоти, відбір кута, валідація, схожість, атрибуція, переходи стану.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { ANGLES, FORMATS, FORMAT_CYCLE, VERIFIED_FACTS } from '../lib/auditshieldAngles.js'
import {
  LIMITS, CTA_VARIANTS, auditshieldEnabled, parseA1Payload, buildContentId, buildAttributionLink, readState, evaluateGates, chooseFormat,
  selectAngle, buildPrompt, parseSections, validateParts, checkDuplicate, escapeMarkdownV1, assemblePost, generateAuditshieldPost,
  nextAuditshieldState, recordUnconfirmed, extractCode, SIMILARITY,
} from '../lib/auditshieldPost.js'
import { fakeSections, sectionsToText } from './helpers/fakes.mjs'

const DAY = 86400000
const NOW = new Date('2026-11-10T10:01:00Z')
const iso = ms => new Date(ms).toISOString()
const ago = d => iso(NOW.getTime() - d * DAY)

function entry(over = {}) {
  return { id: 'as0001', seq: 1, angle: 'startup-unknown', format: 'diagnostic', topic: 't', content_id: 'as0001-startup-unknown', cta_variant: 0, generated_at: ago(20), published_at: ago(20), message_id: 1, status: 'published', ...over }
}
function aud(over = {}) {
  return { v: 1, seq: 0, posts_since: 10, initialized_at: ago(30), last_published_at: null, manual_last_at: null, history: [], ...over }
}
const st = a => ({ auditshield: a })

// ── реєстр ──
test('registry: ids are unique, ≤17 chars, valid a1 content tokens, every content id fits the 24-char limit', () => {
  const ids = ANGLES.map(a => a.id)
  assert.equal(new Set(ids).size, ids.length)
  for (const a of ANGLES) {
    assert.ok(a.id.length <= 17, a.id)
    assert.match(a.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    assert.ok(FORMATS.includes(a.format))
    assert.ok(buildContentId(9999, a.id).length <= 24, a.id)
    assert.ok(buildAttributionLink(buildContentId(9999, a.id)).url.startsWith('https://t.me/AuditShield_01_Bot?start=a1_tc_auditshield_'))
  }
})

test('registry: every format has ≥3 angles; cycle uses only known formats and tool is the rarest', () => {
  for (const f of FORMATS) assert.ok(ANGLES.filter(a => a.format === f).length >= 3, f)
  assert.ok(FORMAT_CYCLE.every(f => FORMATS.includes(f)))
  const count = f => FORMAT_CYCLE.filter(x => x === f).length
  assert.ok(FORMATS.filter(f => f !== 'tool').every(f => count('tool') < count(f)))
})

test('registry: non-tool angles carry verified steps; checklists have exactly 5 commands', () => {
  for (const a of ANGLES) {
    if (a.format === 'tool') assert.equal(a.steps.length, 0)
    else assert.ok(a.steps.length >= 1, a.id)
    if (a.format === 'checklist') assert.equal(a.steps.filter(s => /^(Get-|net )/.test(s)).length, 5, a.id)
  }
})

test('registry: every non-tool angle states what the Demo really covers on its topic (bridge cannot promise more)', () => {
  for (const a of ANGLES) assert.ok(typeof a.demoCovers === 'string' && a.demoCovers.length > 20, a.id)
  assert.match(buildPrompt({ format: 'quick', angle: ANGLES.find(a => a.id === 'task-sched-nonms') }), /Що Demo справді перевіряє по цій темі[^\n]*: Demo показує активні заплановані завдання/)
})

test('registry: angle.module names exist in PROMO_MODULES of autopost.js (so the topic-collision guard really works)', () => {
  const src = readFileSync(new URL('../pages/api/autopost.js', import.meta.url), 'utf-8')
  for (const a of ANGLES.filter(x => x.module)) assert.ok(src.includes(`module: '${a.module}'`), a.module)
})

test('registry: facts and prompt never contain the stale 22-module claim or an absolute network-silence claim', () => {
  const blob = VERIFIED_FACTS.join(' ')
  assert.doesNotMatch(blob, /22\s*модул|нічого не передається|жодних даних/i)
  assert.match(blob, /24 модулі/)
  const prompt = buildPrompt({ format: 'tool', angle: ANGLES.find(a => a.id === 'demo-vs-full') })
  assert.match(prompt, /ЗАБОРОНЕНО/)
  assert.match(prompt, /Не називати «22 модулі»/)
})

test('registry: the fake model output built from each angle passes the validator (registry is consistent with its own rules)', () => {
  for (const a of ANGLES) {
    const p = fakeSections(a)
    const v = validateParts(p, a.format, a)
    assert.deepEqual(v.reasons, [], a.id)
  }
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
  assert.deepEqual(parseA1Payload('a1_tc_auditshield_as0007-usb-memory'), { source: 'tg_channel', campaign: 'auditshield', content: 'as0007-usb-memory' })
  assert.deepEqual(parseA1Payload('a1_st'), { source: 'site_tool', campaign: null, content: null })
  for (const bad of ['', 'a1', 'a2_tc_x', 'a1_xx_x', 'A1_tc_x', 'a1_tc_Auditshield', 'a1_tc__x', 'a1_tc_x_y_z', 'a1_tc_x-', 'a1_tc_-x', 'a1_tc_x y', 'a1_tc_' + 'a'.repeat(17), 'a1_tc_x_' + 'a'.repeat(25), 'a1_tc_x\n']) {
    assert.equal(parseA1Payload(bad), null, JSON.stringify(bad))
  }
  assert.equal(parseA1Payload('a1_tc_' + 'a'.repeat(16))?.campaign, 'a'.repeat(16))
  assert.equal(parseA1Payload(undefined), null)
})

test('attribution: link = source tc, campaign auditshield, unique content per post; invalid content blocks', () => {
  const l1 = buildAttributionLink(buildContentId(1, 'usb-memory'))
  const l2 = buildAttributionLink(buildContentId(2, 'usb-memory'))
  assert.notEqual(l1.url, l2.url)
  assert.equal(l1.url, 'https://t.me/AuditShield_01_Bot?start=a1_tc_auditshield_as0001-usb-memory')
  for (const bad of ['AS0001-x', 'as0001_x', 'as0001-' + 'x'.repeat(30), '', 'as0001-', 'as 0001']) {
    assert.throws(() => buildAttributionLink(bad), /attribution_link_invalid/, bad)
  }
})

// ── стан і гейти ──
test('readState: absent → uninitialized; valid → ok; every malformed shape → malformed', () => {
  assert.equal(readState({}).status, 'uninitialized')
  assert.equal(readState({ auditshield: null }).status, 'uninitialized')
  assert.equal(readState(st(aud())).status, 'ok')
  const bad = [{ ...aud(), v: 2 }, { ...aud(), seq: -1 }, { ...aud(), seq: 1.5 }, { ...aud(), posts_since: 'x' }, { ...aud(), initialized_at: 'nope' },
    { ...aud(), last_published_at: 'nope' }, { ...aud(), manual_last_at: 'nope' }, { ...aud(), history: {} }, { ...aud(), history: [{ id: 1 }] },
    { ...aud(), history: [entry({ format: 'zzz' })] }, 'string', 5, []]
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

// ── відбір кута ──
// 23 теми, як у production: перші чотири — реальні, решта — заповнювачі (вікно блокування охоплює 8 сусідніх тем)
const PROMO = [{ module: 'Автозапуск' }, { module: 'USB-історія' }, { module: 'Запущені процеси' }, { module: 'Мережеві підключення' },
  ...Array.from({ length: 19 }, (_, i) => ({ module: `Заповнювач ${i}` }))]

test('selectAngle: first post follows the format cycle (seq 0 → diagnostic); 45-day cooldown is exact', () => {
  assert.equal(chooseFormat(0), 'diagnostic')
  const a = selectAngle({ state: st(aud()), now: NOW })
  assert.equal(a.format, 'diagnostic')
  const used = id => st(aud({ seq: 1, history: [entry({ angle: id, published_at: ago(44.9) })] }))
  assert.notEqual(selectAngle({ state: used('startup-unknown'), now: NOW, format: 'diagnostic' }).id, 'startup-unknown')
  const old = st(aud({ seq: 1, history: ANGLES.filter(x => x.format === 'diagnostic').map(x => entry({ angle: x.id, published_at: ago(45.1), id: x.id })) }))
  assert.ok(selectAngle({ state: old, now: NOW, format: 'diagnostic' }))   // кулдаун минув
  const all = st(aud({ seq: 1, history: ANGLES.filter(x => x.format === 'diagnostic').map(x => entry({ angle: x.id, published_at: ago(44), id: x.id })) }))
  assert.equal(selectAngle({ state: all, now: NOW, format: 'diagnostic' }), null)
})

test('selectAngle: avoids topics of the neighbouring standalone posts and of recent extra/article titles', () => {
  // promoIndex=1 → вікно -5..2 по колу охоплює Автозапуск, USB-історія, Запущені процеси: усі чотири діагностичні кути збігаються з сусідніми темами слота
  assert.equal(selectAngle({ state: st(aud()), now: NOW, promoModules: PROMO, promoIndex: 1, format: 'diagnostic' }), null)
  // без збігу тем (promoIndex=10 → вікно 4..11) кут обирається за реєстром
  assert.equal(selectAngle({ state: st(aud()), now: NOW, promoModules: PROMO, promoIndex: 10, format: 'diagnostic' }).id, 'startup-unknown')
  const b = selectAngle({ state: st(aud()), now: NOW, extraTopics: ['🔐 Команда дня: автозапуск програм'], lastPostTitle: 'Як вимкнути usb', format: 'diagnostic' })
  assert.ok(!['startup-unknown', 'usb-memory'].includes(b.id))
})

test('selectAngle: never repeats the previous post format when falling back; excluded angles are skipped', () => {
  const diagHist = ANGLES.filter(x => x.format === 'diagnostic').map(x => entry({ angle: x.id, id: x.id, published_at: ago(10), format: 'diagnostic' }))
  const a = selectAngle({ state: st(aud({ seq: 4, history: diagHist })), now: NOW })
  assert.notEqual(a.format, 'diagnostic')
  const x = selectAngle({ state: st(aud()), now: NOW, format: 'quick', exclude: ['defender-status'] })
  assert.notEqual(x.id, 'defender-status')
})

// ── розбір і валідація ──
test('parseSections: exact four sections in order; anything else is rejected', () => {
  const ok = sectionsToText({ hook: '🔍 a', value: 'b', context: 'c', bridge: 'd AuditShield' })
  assert.deepEqual(parseSections(ok), { hook: '🔍 a', value: 'b', context: 'c', bridge: 'd AuditShield' })
  assert.equal(parseSections('текст до\n' + ok), null)
  assert.equal(parseSections(ok.replace('[CONTEXT]\nc\n', '')), null)
  assert.equal(parseSections(ok + '[HOOK]\nx'), null)
  assert.equal(parseSections('[VALUE]\nb\n[HOOK]\na\n[CONTEXT]\nc\n[BRIDGE]\nd'), null)
  assert.equal(parseSections('[HOOK]\n\n[VALUE]\nb\n[CONTEXT]\nc\n[BRIDGE]\nd'), null)
  assert.equal(parseSections(null), null)
})

const quick = ANGLES.find(a => a.id === 'defender-status')
const okParts = () => fakeSections(quick)
const reasonsOf = (mut, angle = quick) => validateParts(mut(okParts()), angle.format, angle).reasons

test('validate: scare, urgency, guarantees, scores, stale facts, privacy absolutes, prices are all blocked', () => {
  const cases = {
    scare: 'Вас зламали, і ваші дані вже крадуть.', urgency: 'Перевірте терміново.', guarantee: 'Це дає 100% захист і гарантує безпеку.',
    score: 'Ваш рівень ризику 70/100.', stale_module_count: 'AuditShield має 22 модулі.', privacy_absolute: 'Нічого не передається в мережу.',
    price_or_sales: 'Купити повну версію за $9.',
  }
  for (const [code, text] of Object.entries(cases)) {
    assert.ok(reasonsOf(p => ({ ...p, context: p.context + ' ' + text })).includes(code), code)
  }
  assert.ok(!reasonsOf(p => p).length)
})

test('validate: links, hashtags, mentions, markup and backslashes outside code are blocked; unbalanced backticks too', () => {
  assert.ok(reasonsOf(p => ({ ...p, context: p.context + ' https://example.com' })).includes('link_in_text'))
  assert.ok(reasonsOf(p => ({ ...p, context: p.context + ' t.me/x' })).includes('link_in_text'))
  assert.ok(reasonsOf(p => ({ ...p, context: p.context + ' #windows' })).includes('hashtag_in_text'))
  assert.ok(reasonsOf(p => ({ ...p, context: p.context + ' @cryptolock888' })).includes('mention_in_text'))
  assert.ok(reasonsOf(p => ({ ...p, context: p.context + ' **жирний**' })).includes('markup_in_text'))
  assert.ok(reasonsOf(p => ({ ...p, context: p.context + ' C:\\Windows' })).includes('backslash_outside_code'))
  assert.ok(reasonsOf(p => ({ ...p, context: p.context + ' `відкрита' })).includes('unbalanced_backticks'))
})

test('validate: only verified commands are allowed (hallucinated command, wrong parameter, fenced or inline)', () => {
  assert.ok(reasonsOf(p => ({ ...p, value: p.value + '\n```\nGet-Process | Stop-Process -Force\n```' })).includes('unverified_command'))
  assert.ok(reasonsOf(p => ({ ...p, value: p.value + ' `Remove-Item C:` ' })).includes('unverified_command'))
  assert.ok(!reasonsOf(p => ({ ...p, context: p.context + ' Використовуйте `Get-MpComputerStatus`.' })).includes('unverified_command'))   // уривок перевіреної команди
  assert.ok(!reasonsOf(p => ({ ...p, value: p.value.replace('Get-MpComputerStatus', 'get-mpcomputerstatus') })).includes('unverified_command')) // регістр/пробіли не важливі
})

test('validate: AuditShield only in the bridge (tool format excepted); hook needs an emoji; length bounds; format rules', () => {
  assert.ok(reasonsOf(p => ({ ...p, hook: p.hook + ' AuditShield' })).includes('auditshield_outside_bridge'))
  assert.ok(reasonsOf(p => ({ ...p, bridge: 'Просто спробуйте демо.' })).includes('bridge_without_auditshield'))
  assert.ok(reasonsOf(p => ({ ...p, hook: p.hook.replace(/^\S+\s/, '') })).includes('hook_without_emoji'))
  assert.ok(reasonsOf(p => ({ ...p, value: 'коротко', context: 'коротко' })).includes('too_short'))
  assert.ok(reasonsOf(p => ({ ...p, value: p.value + ' я'.repeat(800) })).includes('too_long'))
  assert.ok(reasonsOf(p => ({ ...p, value: 'Просто текст без команди. '.repeat(14) })).includes('quick_without_command'))
  const cl = ANGLES.find(a => a.id === 'odd-activity-5')
  const bad = fakeSections(cl); bad.value = bad.value.split('\n').slice(0, 4).join('\n')
  assert.ok(validateParts(bad, 'checklist', cl).reasons.includes('checklist_not_5_items'))
  const tool = ANGLES.find(a => a.id === 'demo-four-areas')
  const tp = fakeSections(tool)
  for (const k of ['hook', 'value', 'context', 'bridge']) tp[k] = tp[k].replace(/безкоштовн\S*/gi, 'доступний')
  assert.ok(validateParts(tp, 'tool', tool).reasons.includes('tool_without_free'))
})

// ── схожість ──
// Запис історії будуємо реальним шляхом (generateAuditshieldPost), щоб text_sha/hook/bridge/text були саме такими, як у production.
async function realEntry(angle, over = {}) {
  const p = fakeSections(angle, over)
  const r = await generateAuditshieldPost({ state: { auditshield: aud() }, now: NOW, generateText: async () => sectionsToText(p), format: angle.format, angleId: angle.id })
  assert.ok(r.post, JSON.stringify(r.blocked))
  return { ...r.post.audit, published_at: ago(10), id: 'as0009', status: 'published' }
}
const cand = p => ({ plain: [p.hook, p.value, p.context, p.bridge].join('\n\n'), hook: p.hook, value: p.value, context: p.context, bridge: p.bridge })

test('duplicates: exact text is blocked', async () => {
  const a = ANGLES.find(x => x.id === 'defender-status')
  const e = await realEntry(a)
  const d = checkDuplicate(cand(fakeSections(a)), [e])
  assert.deepEqual([d.dup, d.reason], [true, 'exact'])
})

test('duplicates: a near-identical rewrite (few words changed) is blocked', async () => {
  const a = ANGLES.find(x => x.id === 'av-registered')
  const e = await realEntry(a)
  const p = fakeSections(a)
  p.value = p.value.replace('Іноді', 'Часом').replace('показує', 'виводить')
  p.context = p.context + ' Це нормально.'
  const d = checkDuplicate(cand(p), [e])
  assert.equal(d.dup, true)
  assert.ok(['near_duplicate', 'same_body', 'same_checklist', 'same_hook'].includes(d.reason), d.reason)
})

test('duplicates: the whole-text and the body metrics each work on their own (other metrics switched off)', async () => {
  const a = ANGLES.find(x => x.id === 'av-registered')
  const e = await realEntry(a)
  const p = { ...fakeSections(a), hook: '🧪 Зовсім інший вступ без спільних слів із попереднім.', bridge: 'Абсолютно інший місток до чогось іншого, що ніяк не схоже на старий.' }
  const saved = { ...SIMILARITY }
  try {
    Object.assign(SIMILARITY, { hook: 2, bridge: 2, commands: 2, body: 2 })
    assert.equal(checkDuplicate(cand(p), [e]).reason, 'near_duplicate')
    // тіло трохи змінено (не 1.0), щоб перевірити саме поріг, а не лише збіг
    const p2 = { ...p, value: p.value.replace('Іноді', 'Часом').replace('показує', 'виводить'), context: p.context + ' Це нормально.' }
    Object.assign(SIMILARITY, saved, { hook: 2, bridge: 2, commands: 2, prose: 2 })
    assert.equal(checkDuplicate(cand(p2), [e]).reason, 'same_body')
    Object.assign(SIMILARITY, saved, { hook: 2, bridge: 2, commands: 2, prose: 2, body: 2 })
    assert.equal(checkDuplicate(cand(p), [e]).dup, false, 'with every metric off nothing is flagged (control)')
  } finally { Object.assign(SIMILARITY, saved) }
})

test('duplicates: same text under a new hook is blocked as same_body; same hook with new body is blocked as same_hook', async () => {
  const a = ANGLES.find(x => x.id === 'firewall-profiles')
  const e = await realEntry(a)
  const base = fakeSections(a)
  const newHook = { ...base, hook: '🛡️ Зовсім інший вступ, який нічого спільного не має з попереднім постом про профілі мережі.' }
  assert.equal(checkDuplicate(cand(newHook), [e]).dup, true)
  const sameHook = { ...base, value: 'Інше пояснення без жодних спільних слів: ось зовсім свіжий опис ситуації. ```\nGet-NetFirewallProfile | Select-Object Name, Enabled\n```', context: 'Новий контекст, що не збігається з попереднім ні словом.' }
  const d = checkDuplicate(cand(sameHook), [e])
  assert.equal(d.dup, true)
  assert.equal(d.reason, 'same_hook')
})

test('duplicates: the same bridge sentence is blocked even when the rest differs', async () => {
  const a = ANGLES.find(x => x.id === 'av-registered')
  const b = ANGLES.find(x => x.id === 'task-sched-nonms')
  const bridge = 'Якщо не хочете переглядати все вручну — безкоштовний AuditShield Demo перевіряє основні області автоматично і показує звіт.'
  const e = await realEntry(a, { bridge })
  const d = checkDuplicate(cand(fakeSections(b, { bridge })), [e])
  assert.deepEqual([d.dup, d.reason], [true, 'same_bridge'])
})

test('duplicates: the same checklist commands in different words are blocked', async () => {
  const a = ANGLES.find(x => x.id === 'odd-activity-5')
  const e = await realEntry(a)
  const p = fakeSections(a, {
    hook: '🧭 Нова історія про інший початок, жодного спільного слова зі старим.',
    value: ANGLES.find(x => x.id === 'odd-activity-5').steps.map((s, i) => `${i + 1}. Зовсім інша фраза номер ${i + 1}: \`${s.split(/\s{3,}\(/)[0]}\``).join('\n'),
    context: 'Інший абзац контексту, що не повторює жодних сталих виразів.', bridge: 'Автоматичний варіант — окремий інструмент, коли немає бажання ганяти команди: безкоштовний AuditShield Demo.',
  })
  const d = checkDuplicate(cand(p), [e])
  assert.equal(d.dup, true)
  assert.equal(d.reason, 'same_checklist')
})

test('duplicates: all 17 distinct angles are mutually non-duplicates (thresholds do not over-block)', async () => {
  const entries = []
  for (const a of ANGLES) entries.push({ ...(await realEntry(a)), id: a.id })
  for (const a of ANGLES) {
    const others = entries.filter(e => e.id !== a.id)
    const d = checkDuplicate(cand(fakeSections(a)), others)
    assert.equal(d.dup, false, `${a.id} vs ${d.with}: ${d.reason} ${d.score}`)
  }
})

// ── Markdown і збірка ──
test('markdown: _ * [ escaped outside code, untouched inside code; CTA link keeps its underscores', () => {
  assert.equal(escapeMarkdownV1('a_b *c* [d]'), 'a\\_b \\*c\\* \\[d]')
  assert.equal(escapeMarkdownV1('x_y `a_b*c` z_w'), 'x\\_y `a_b*c` z\\_w')
  assert.equal(escapeMarkdownV1('```\nGet_X | a*b\n``` після_блоку'), '```\nGet_X | a*b\n``` після\\_блоку')
  const { telegram } = assemblePost({ parts: { hook: '🔍 a_b', value: 'v', context: 'c', bridge: 'b' }, ctaVariant: 0, url: 'https://t.me/AuditShield_01_Bot?start=a1_tc_auditshield_as0001-x' })
  assert.match(telegram, /\[Demo у Telegram\]\(https:\/\/t\.me\/AuditShield_01_Bot\?start=a1_tc_auditshield_as0001-x\)/)
  assert.match(telegram, /🔍 a\\_b/)
  assert.ok(telegram.endsWith('#windows #безпека'))
})

test('CTA: every variant points to the Demo link, none mentions price or purchase', () => {
  assert.equal(CTA_VARIANTS.length, 4)
  for (const f of CTA_VARIANTS) {
    const t = f('https://t.me/AuditShield_01_Bot?start=a1_tc_auditshield_as0001-x')
    assert.match(t, /start=a1_tc_auditshield_/)
    assert.match(t, /Demo|перевірк/i)
    assert.doesNotMatch(t, /купи|ціна|\$|тариф|оплат/i)
  }
})

// ── генерація ──
test('generate: produces a post with unique id/content id, rotating CTA variant, link validated; text length is Telegram-safe', async () => {
  const r = await generateAuditshieldPost({ state: st(aud({ seq: 4 })), now: NOW, generateText: async p => sectionsToText(fakeSections(ANGLES.find(a => a.topic === p.match(/КУТ ПОСТА: (.*)/)[1]))) })
  assert.ok(r.post, JSON.stringify(r.blocked))
  assert.equal(r.post.audit.id, 'as0005')
  assert.equal(r.post.audit.content_id, `as0005-${r.post.audit.angle}`)
  assert.equal(r.post.audit.cta_variant, 0)
  assert.match(r.post.text, new RegExp(`start=a1_tc_auditshield_as0005-${r.post.audit.angle}\\)`))
  assert.ok(r.post.text.length < 4096)
  assert.ok(r.post.audit.text_sha && r.post.audit.hook && r.post.audit.bridge && r.post.audit.generated_at)
})

test('generate: model/network error → blocked llm_error (no post); malformed or invalid output → tries other angles then blocks', async () => {
  const e = await generateAuditshieldPost({ state: st(aud()), now: NOW, generateText: async () => { throw new Error('boom') } })
  assert.deepEqual(e.blocked.slice(-1), ['llm_error'])
  let calls = 0
  const bad = await generateAuditshieldPost({ state: st(aud()), now: NOW, generateText: async () => { calls++; return 'не за форматом' } })
  assert.equal(calls, LIMITS.maxAttempts)
  assert.ok(bad.blocked.every(x => x.endsWith(':format')))
})

test('generate: the time budget stops further attempts (the 60 s serverless limit must still allow the normal post)', async () => {
  let t = 0
  let calls = 0
  const r = await generateAuditshieldPost({
    state: st(aud()), now: NOW, clock: () => t,
    generateText: async () => { calls++; t += 30000; return 'не за форматом' },
  })
  assert.equal(calls, 1)
  assert.ok(r.blocked.includes('time_budget'))
})

test('generate: output that breaks a content rule is rejected end to end, never returned as a post', async () => {
  const a = ANGLES.find(x => x.id === 'defender-status')
  const breakers = [
    p => ({ ...p, context: p.context + ' Вас зламали!' }),
    p => ({ ...p, value: p.value + '\n```\nRemove-Item -Recurse C:\\Users\n```' }),
    p => ({ ...p, bridge: p.bridge + ' Купити повну версію.' }),
  ]
  for (const b of breakers) {
    const r = await generateAuditshieldPost({ state: st(aud()), now: NOW, angleId: a.id, generateText: async () => sectionsToText(b(fakeSections(a))) })
    assert.equal(r.post, undefined)
    assert.ok(r.blocked.some(x => x.startsWith('defender-status:')), JSON.stringify(r.blocked))
  }
})

test('generate: invalid attribution link (id not accepted by the bot grammar) blocks the post', async () => {
  const bad = { id: 'Bad_Id', format: 'quick', module: null, keywords: ['zzz'], topic: 'bad', brief: 'b', steps: ['Get-Process'], limits: 'l' }
  ANGLES.push(bad)
  try {
    const r = await generateAuditshieldPost({
      state: st(aud()), now: NOW, angleId: 'Bad_Id',
      generateText: async () => sectionsToText({ ...fakeSections(ANGLES.find(a => a.id === 'defender-status')), value: 'Одна команда: `Get-Process`. '.repeat(14) }),
    })
    assert.deepEqual(r.blocked.slice(-1), ['attribution_link_invalid'])
    assert.equal(r.post, undefined)
  } finally { ANGLES.pop() }
})

test('generate: malformed state → blocked; uninitialized state is only used for previews (seq 1)', async () => {
  const m = await generateAuditshieldPost({ state: st({ v: 7 }), now: NOW, generateText: async () => '' })
  assert.deepEqual(m.blocked, ['state_malformed'])
  const r = await generateAuditshieldPost({ state: {}, now: NOW, generateText: async p => sectionsToText(fakeSections(ANGLES.find(a => a.topic === p.match(/КУТ ПОСТА: (.*)/)[1]))) })
  assert.equal(r.post.audit.id, 'as0001')
})

test('generate: a duplicate on the first angle falls through to the next angle instead of posting', async () => {
  const a = ANGLES.find(x => x.id === 'startup-unknown')
  const e = await realEntry(a)
  const seen = []
  const r = await generateAuditshieldPost({
    state: st(aud({ seq: 1, history: [e] })), now: NOW, format: 'diagnostic',
    generateText: async p => { const ang = ANGLES.find(x => x.topic === p.match(/КУТ ПОСТА: (.*)/)[1]); seen.push(ang.id); return sectionsToText(fakeSections(ang)) },
  })
  assert.ok(r.post)
  assert.notEqual(r.post.audit.angle, 'startup-unknown')
})

// ── переходи стану ──
test('state: first normal post initializes counters; later posts increment; AuditShield post resets and records everything required', () => {
  const now = new Date('2026-11-01T10:00:00Z')
  const s1 = nextAuditshieldState(undefined, null, now)
  assert.deepEqual({ ...s1, history: s1.history }, { v: 1, seq: 0, posts_since: 1, initialized_at: now.toISOString(), last_published_at: null, manual_last_at: null, history: [] })
  const s2 = nextAuditshieldState(s1, null, now)
  assert.equal(s2.posts_since, 2)
  const meta = { id: 'as0001', seq: 1, angle: 'usb-memory', format: 'diagnostic', topic: 'T', content_id: 'as0001-usb-memory', cta_variant: 0, generated_at: now.toISOString(), text_sha: 'abc', hook: 'h', bridge: 'b', text: 'full' }
  const s3 = nextAuditshieldState(s2, meta, new Date('2026-11-09T10:01:00Z'), 777)
  assert.equal(s3.seq, 1); assert.equal(s3.posts_since, 0); assert.equal(s3.last_published_at, '2026-11-09T10:01:00.000Z')
  const e = s3.history[0]
  for (const k of ['id', 'angle', 'topic', 'generated_at', 'published_at', 'cta_variant', 'content_id', 'text_sha', 'message_id', 'status']) assert.ok(e[k] !== undefined, k)
  assert.equal(e.message_id, 777); assert.equal(e.status, 'published')
  assert.equal(readState({ auditshield: s3 }).status, 'ok')
})

test('state: history keeps 24 entries, full text only for the newest 12; malformed state is never rewritten', () => {
  let s = nextAuditshieldState(undefined, null, NOW)
  for (let i = 1; i <= 30; i++) {
    s = nextAuditshieldState(s, { id: `as${i}`, seq: i, angle: `a${i}`, format: 'quick', topic: 't', content_id: `c${i}`, cta_variant: 0, generated_at: iso(NOW.getTime() + i), text_sha: 'x', hook: 'h', bridge: 'b', text: 'T' + i }, new Date(NOW.getTime() + i * DAY))
  }
  assert.equal(s.history.length, LIMITS.historyLight)
  assert.equal(s.history.filter(e => e.text !== undefined).length, LIMITS.historyText)
  assert.equal(s.history.at(-1).text, 'T30'); assert.equal(s.history[0].text, undefined)
  const broken = { v: 99 }
  assert.equal(nextAuditshieldState(broken, null, NOW), broken)
})

test('state: an unconfirmed orphan counts as published (conservative), status recorded', () => {
  const s0 = nextAuditshieldState(undefined, null, NOW)
  const meta = { id: 'as0001', seq: 1, angle: 'usb-memory', format: 'diagnostic', topic: 'T', content_id: 'as0001-usb-memory', cta_variant: 0, generated_at: NOW.toISOString(), text_sha: 'abc', hook: 'h', bridge: 'b', text: 'full' }
  const s1 = recordUnconfirmed(s0, meta, NOW)
  assert.equal(s1.history[0].status, 'unconfirmed'); assert.equal(s1.posts_since, 0); assert.equal(s1.seq, 1); assert.equal(s1.history[0].message_id, null)
})

test('extractCode: fenced lines and inline spans', () => {
  assert.deepEqual(extractCode('a `x y` b\n```\nl1\n l2 \n```'), ['l1', 'l2', 'x y'])
})
