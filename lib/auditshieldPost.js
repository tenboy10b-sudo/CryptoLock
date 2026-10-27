// AuditShield як окремий, жорстко обмежений тип Telegram-контенту (інтегрується в існуючий autopost, а не друга система).
//
// Принципи:
//  - тексти НЕ генеруються під час cron: пости написано і затверджено заздалегідь (auditshieldApprovedPosts.js).
//    Цей модуль лише вибирає наступний затверджений пост, перевіряє його і збирає Telegram-текст: жодної моделі й мережі;
//  - вимкнено за замовчуванням (AUDITSHIELD_POSTS_ENABLED); без прапорця поведінка autopost не змінюється;
//  - будь-яка непевність = НЕ постити AuditShield (звичайний пост слота виходить як завжди);
//  - ліміти частоти, дублікати і посилання з атрибуцією перевіряються тут, ДО будь-якої відправки;
//  - посилання і CTA додає код, а не текст поста: content id атрибуції завжди дорівнює id затвердженого поста;
//  - бібліотека, що вичерпалась, сама не починається спочатку: потрібне явне поповнення і нове затвердження.
//
// Усі функції чисті (час передається аргументом).
import { createHash } from 'crypto'
import { ANGLE_BY_ID, FORMATS } from './auditshieldAngles.js'
import { APPROVED_POSTS } from './auditshieldApprovedPosts.js'

export const AUDITSHIELD_BOT_URL = 'https://t.me/AuditShield_01_Bot'
// Схема атрибуції a1 з audit-shield-bot/funnel.py: a1_<src>_<campaign>_<content>, tc = tg_channel.
export const ATTRIBUTION = { code: 'tc', source: 'tg_channel', campaign: 'auditshield' }

const DAY_MS = 24 * 60 * 60 * 1000
export const LIMITS = {
  minDays: 7,            // не більше 1 AuditShield-поста за будь-які 7 днів
  minPostsBetween: 7,    // не більше 1 на кожні 8 постів => між двома AuditShield щонайменше 7 інших (суворіше за «мінімум 3 звичайні»)
  minNormalAfter: 3,     // явна нижня межа з вимог; завжди перекривається minPostsBetween
  angleCooldownDays: 45, // той самий кут не раніше ніж через 45 днів
  historyLight: 24,      // записів історії (метадані); id опублікованих постів живуть окремо в used_ids і не обрізаються
}
// Межі тексту поста (символи BODY до CTA, разом із блоками коду).
export const BODY = { min: 350, max: 1100, maxChecklist: 1400, hookMax: 320, bridgeMax: 200, maxEmoji: 2, maxCommands: 1, maxChecklistCommands: 3, maxChecklistItems: 3 }
export const SIMILARITY = { prose: 0.25, body: 0.3, hook: 0.6, bridge: 0.7, commands: 0.5, minCommands: 2 }

export const CTA_VARIANTS = [
  url => `🔎 Безкоштовна швидка перевірка AuditShield → [Demo у Telegram](${url})`,
  url => `🧰 Спробувати безкоштовний AuditShield Demo → [відкрити бота](${url})`,
  url => `🆓 AuditShield Demo — безкоштовно, без прав адміністратора → [відкрити](${url})`,
  url => `▶️ Перевірити чотири області Windows безкоштовно → [AuditShield Demo](${url})`,
]
const HASHTAGS = '#windows #безпека'

export function auditshieldEnabled(env = process.env) {
  return ['true', '1', 'on'].includes(String(env.AUDITSHIELD_POSTS_ENABLED || '').trim().toLowerCase())
}

// ── Атрибуція: JS-порт граматики funnel.parse_payload (бот не змінюємо, лише гарантуємо, що він прийме наше посилання) ──
const PAYLOAD_CHARS = /^[A-Za-z0-9_-]+$/
const TOKEN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const SOURCE_CODES = { st: 'site_tool', sl: 'site_links', tc: 'tg_channel', tt: 'tiktok_bio', ot: 'other' }

export function parseA1Payload(raw) {
  if (typeof raw !== 'string' || raw === '' || raw.length > 64 || !PAYLOAD_CHARS.test(raw)) return null
  const parts = raw.split('_')
  if (parts[0] !== 'a1' || parts.length < 2 || parts.length > 4) return null
  const source = SOURCE_CODES[parts[1]]
  if (!source) return null
  const campaign = parts.length > 2 ? parts[2] : null
  const content = parts.length > 3 ? parts[3] : null
  if (campaign !== null && !(campaign.length <= 16 && TOKEN.test(campaign))) return null
  if (content !== null && !(content.length <= 24 && TOKEN.test(content))) return null
  return { source, campaign, content }
}

// Повертає { url, payload } або кидає Error: кожне посилання проходить ту саму граматику, що й у боті.
export function buildAttributionLink(contentId) {
  const payload = `a1_${ATTRIBUTION.code}_${ATTRIBUTION.campaign}_${contentId}`
  const parsed = parseA1Payload(payload)
  if (!parsed || parsed.source !== ATTRIBUTION.source || parsed.campaign !== ATTRIBUTION.campaign || parsed.content !== contentId) {
    throw new Error('attribution_link_invalid')
  }
  return { url: `${AUDITSHIELD_BOT_URL}?start=${payload}`, payload }
}

// ── Стан (published.json → auditshield) ──
function validIso(s) { return typeof s === 'string' && !Number.isNaN(Date.parse(s)) }

function validEntry(e) {
  return !!e && typeof e === 'object' && typeof e.id === 'string' && typeof e.angle === 'string' && FORMATS.includes(e.format)
    && typeof e.content_id === 'string' && validIso(e.published_at)
}

export function readState(state) {
  const a = state && state.auditshield
  if (a === undefined || a === null) return { status: 'uninitialized' }
  const ok = typeof a === 'object' && a.v === 1 && Number.isInteger(a.seq) && a.seq >= 0 && Number.isInteger(a.posts_since) && a.posts_since >= 0
    && validIso(a.initialized_at) && (a.last_published_at === null || validIso(a.last_published_at))
    && (a.manual_last_at === null || a.manual_last_at === undefined || validIso(a.manual_last_at))
    && (a.used_ids === undefined || (Array.isArray(a.used_ids) && a.used_ids.every(x => typeof x === 'string')))
    && Array.isArray(a.history) && a.history.every(validEntry)
  return ok ? { status: 'ok', value: a } : { status: 'malformed' }
}

// Усі id, які вже виходили в канал (або могли вийти: unconfirmed). used_ids не обрізається, history — так.
function usedIdsOf(a) {
  return new Set([...(a && a.used_ids ? a.used_ids : []), ...(a ? a.history.map(e => e.id) : [])])
}

// Дозволено лише в слоті middle непарного дня — це перевіряє виклик; тут — часові та лічильні гейти.
export function evaluateGates(state, now = new Date()) {
  const r = readState(state)
  if (r.status === 'malformed') return { eligible: false, reason: 'state_malformed' }
  if (r.status === 'uninitialized') return { eligible: false, reason: 'uninitialized' }
  const a = r.value
  const t = now.getTime()
  const times = [a.last_published_at, a.manual_last_at].filter(Boolean).map(s => Date.parse(s))
  if (times.some(x => x > t + 60 * 1000)) return { eligible: false, reason: 'clock_skew' }
  const lastAudit = a.last_published_at ? Date.parse(a.last_published_at) : null
  const lastManual = a.manual_last_at ? Date.parse(a.manual_last_at) : null
  if (lastManual !== null && t - lastManual < LIMITS.minDays * DAY_MS) return { eligible: false, reason: 'manual_recent' }
  // Поки AuditShield-постів не було, відлік ведемо від ініціалізації лічильників.
  const anchor = lastAudit !== null ? lastAudit : Date.parse(a.initialized_at)
  if (t - anchor < LIMITS.minDays * DAY_MS) return { eligible: false, reason: 'min_days' }
  if (a.posts_since < Math.max(LIMITS.minPostsBetween, LIMITS.minNormalAfter)) return { eligible: false, reason: 'min_posts' }
  return { eligible: true, reason: 'ok' }
}

export function recentPromoModules(promoModules, promoIndex) {
  const n = promoModules.length
  const out = new Set()
  if (!n) return out
  for (let i = promoIndex - 6; i <= promoIndex + 1; i++) out.add(promoModules[((i % n) + n) % n].module)
  return out
}

// ── Текст поста: розбір, хеш, схожість ──
export function isApproved(post) {
  return !!post && typeof post.approved_version === 'string' && post.approved_version.trim() !== ''
}

// Хеш точного тексту: фіксує, що саме затвердив власник (approved_sha), і є ключем дедуплікації в історії.
export function bodyHash(body) {
  return createHash('sha256').update(body, 'utf8').digest('hex').slice(0, 16)
}

// BODY = абзаци через порожній рядок: перший — HOOK, останній — SOFT BRIDGE, між ними VALUE і CONTEXT.
export function splitBody(body) {
  const paragraphs = body.split(/\n{2,}/).map(s => s.trim()).filter(Boolean)
  return { paragraphs, hook: paragraphs[0] || '', bridge: paragraphs.length ? paragraphs[paragraphs.length - 1] : '' }
}

export function tokens(text) {
  const prose = text.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`\n]*`/g, ' ').replace(/https?:\/\/\S+/g, ' ').replace(/#\S+/g, ' ')
  return (prose.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [])
}
export function shingles(toks, n = 3) {
  const s = new Set()
  if (toks.length < n) { toks.forEach(t => s.add(t)); return s }
  for (let i = 0; i <= toks.length - n; i++) s.add(toks.slice(i, i + n).join(' '))
  return s
}
export function jaccard(a, b) {
  if (!a.size && !b.size) return 0
  let inter = 0
  for (const x of a) if (b.has(x)) inter++
  return inter / (a.size + b.size - inter)
}

export function extractCode(text) {
  const out = []
  const fenced = /```[a-z]*\n?([\s\S]*?)```/gi
  let m
  while ((m = fenced.exec(text))) out.push(...m[1].split('\n').map(s => s.trim()).filter(Boolean))
  const rest = text.replace(fenced, ' ')
  const inline = /`([^`\n]+)`/g
  while ((m = inline.exec(rest))) out.push(m[1].trim())
  return out
}
function fencedLines(text) {
  const out = []
  const fenced = /```[a-z]*\n?([\s\S]*?)```/gi
  let m
  while ((m = fenced.exec(text))) out.push(...m[1].split('\n').map(s => s.trim()).filter(Boolean))
  return out
}
function inlineSpans(text) {
  const rest = text.replace(/```[\s\S]*?```/g, ' ')
  return [...rest.matchAll(/`([^`\n]+)`/g)].map(m => m[1].trim())
}
function normCmd(s) { return s.replace(/\s+/g, ' ').trim().toLowerCase().replace(/\b\d{3,}\b/g, 'n') }
function stepCommand(step) { return step.split(/\s{3,}\(/)[0] }

// Пара текстів вважається дублікатом, якщо перевищено будь-який поріг (цілий текст, тіло без вступу й містка, вступ, місток, набір команд).
export function nearDuplicate(bodyA, bodyB) {
  const profile = body => {
    const { paragraphs, hook, bridge } = splitBody(body)
    return {
      prose: shingles(tokens(body)), middle: shingles(tokens(paragraphs.slice(1, -1).join('\n\n'))),
      hook: new Set(tokens(hook)), bridge: shingles(tokens(bridge)), cmds: new Set(extractCode(body).map(normCmd)),
    }
  }
  const a = profile(bodyA), b = profile(bodyB)
  if (bodyHash(bodyA) === bodyHash(bodyB)) return { dup: true, reason: 'exact', score: 1 }
  const checks = [
    ['same_hook', jaccard(a.hook, b.hook), SIMILARITY.hook],
    ['same_bridge', jaccard(a.bridge, b.bridge), SIMILARITY.bridge],
    ['near_duplicate', jaccard(a.prose, b.prose), SIMILARITY.prose],
    ['same_body', jaccard(a.middle, b.middle), SIMILARITY.body],
  ]
  if (a.cmds.size >= SIMILARITY.minCommands && b.cmds.size >= SIMILARITY.minCommands) checks.push(['same_checklist', jaccard(a.cmds, b.cmds), SIMILARITY.commands])
  for (const [reason, score, limit] of checks) if (score >= limit) return { dup: true, reason, score }
  return { dup: false }
}

// ── Детермінований валідатор ──
const FORBIDDEN_TEXT = [
  [/вас\s+зламал|ваш[іи]\s+дан[іи]\s+(вже|краду)|краду(ть|ться)|вже\s+(вкрали|злили)|вас\s+(хакнули|шпигу)/iu, 'scare'],
  [/піратськ|тривожн|серйозн\p{L}*\s+сигнал|шпигун|майнер/iu, 'alarmist'],
  [/терміново|негайно|не\s+зволікайте|останн\p{L}+\s+шанс|тільки\s+сьогодні|обмежен\p{L}+\s+пропозиц/iu, 'urgency'],
  [/100\s*%|сто\s+відсотків|гаранту|гарантія|повн\p{L}+\s+захист|абсолютно\s+безпечн|непробивн|захистить|захист\s+від\s+(усіх|всіх)|знайде\s+(всі|усі)|виявить\s+(всі|усі)|замінює\s+антивірус/iu, 'guarantee'],
  [/\b\d{1,3}\s*\/\s*100\b|оцінк\p{L}+\s+ризику|рівен\p{L}+\s+ризику|risk\s*score|(?<![\p{L}])бал(ів|и|а|ами)?(?![\p{L}])/iu, 'score'],
  [/22\s*модул/iu, 'stale_module_count'],
  [/жодн\p{L}+\s+дан\p{L}+|нічого\s+не\s+(передається|надсилається|відправляється|надсилає|передає|відправляє)|ніщо\s+не\s+(передається|надсилається)|нікуди\s+не|дан\p{L}+\s+нікуди|без\s+передачі|не\s+(надсилає|передає|відправляє)\s+(жодн\p{L}+\s+)?дан|без\s+(інтернету|мережі)|не\s+потребує\s+(інтернету|мережі)|офлайн|offline/iu, 'privacy_absolute'],
  [/\$\s*\d|\d\s*(usd|usdt|грн|₴)|(?<![\p{L}])(ціна|ціни|ціну|ціною)(?![\p{L}])|тариф|купит|придбат|оплат|знижк|промокод/iu, 'price_or_sales'],
  [/чесно\s*:|читання\s+результату|ось\s+що\s+(потрібно|важливо|варто)|важливо\s+зазначити|варто\s+зазначити|слід\s+зазначити|зверніть\s+увагу,\s+що|у\s+цьому\s+пості|давайте\s+розберемо/iu, 'ai_phrase'],
  [/google|mozilla|firefox|chrome|ccleaner|avast|kaspersky|касперськ|\beset\b|norton|mcafee|malwarebytes|bitdefender|avira|dr\.?\s?web/iu, 'third_party_brand'],
]
const ALWAYS_ALLOWED_CODE = ['%localappdata%\\auditshield_demo\\', '%localappdata%\\auditshield_demo']
const PLAIN_IDENT = /^[A-Za-z][A-Za-z0-9_.]*$/
const SAFE_CMDLET_TOKENS = ['select-object', 'sort-object', 'where-object', 'foreach-object']
// Демо не охоплює ці області: речення про Demo, де вони згадані без заперечення, — обіцянка більшого, ніж Demo вміє.
const DEMO_UNCOVERED = /мереж\p{L}*|служб\p{L}*|облікових?\s+запис\p{L}*|журнал\p{L}*\s+вход\p{L}*|(?<![\p{L}])віру[сз]\p{L}*|шкідлив\p{L}*/iu
const DEMO_NEGATION = /не\s+(охоплює|перевіряє|шукає|робить|вміє|показує|є)(?![\p{L}])|лише\s+довідково|повн\p{L}+\s+верс/iu

export function allowedCommands(angle) {
  return [...angle.steps.map(stepCommand), ...ALWAYS_ALLOWED_CODE].map(normCmd)
}

function demoOverclaims(text) {
  return text.split(/(?<=[.!?…])\s+|\n+/).filter(s => /demo|auditshield/i.test(s) && DEMO_UNCOVERED.test(s) && !DEMO_NEGATION.test(s))
}

// Telegram parse_mode=Markdown (legacy): незбалансована розмітка або неекранований символ ламають відправку.
export function markdownProblems(text) {
  const issues = []
  if ((text.match(/```/g) || []).length % 2) issues.push('unbalanced_fences')
  let rest = text.replace(/```[\s\S]*?```/g, ' ')
  if ((rest.match(/`/g) || []).length % 2) issues.push('unbalanced_inline_backticks')
  rest = rest.replace(/`[^`\n]*`/g, ' ')
  const links = rest.match(/\[[^\]\n]+\]\(https:\/\/t\.me\/AuditShield_01_Bot\?start=[A-Za-z0-9_-]+\)/g) || []
  if (links.length !== 1) issues.push(`link_count_${links.length}`)
  rest = rest.replace(/\[[^\]\n]+\]\([^)\n]*\)/g, ' ')
  if (/[_*[`]/.test(rest.replace(/\\[_*[`]/g, ''))) issues.push('unescaped_markup_char')
  if (text.length > 4096) issues.push('over_4096')
  return issues
}

// requireApproval=false лише для перегляду кандидатів (dry-run): решту правил кандидат проходить так само, як затверджений пост.
export function validateApprovedPost(post, { requireApproval = true } = {}) {
  const reasons = []
  const add = r => { if (!reasons.includes(r)) reasons.push(r) }
  if (!post || typeof post !== 'object') return { ok: false, reasons: ['not_an_object'] }
  if (typeof post.id !== 'string' || !/^asp\d{3,4}$/.test(post.id)) add('bad_id')
  if (!FORMATS.includes(post.format)) add('bad_format')
  const angle = ANGLE_BY_ID[post.angle]
  if (!angle) add('unknown_angle')
  else if (angle.format !== post.format) add('angle_format_mismatch')
  if (typeof post.topic !== 'string' || !post.topic.trim()) add('bad_topic')
  if (!Number.isInteger(post.cta_variant) || post.cta_variant < 0 || post.cta_variant >= CTA_VARIANTS.length) add('bad_cta_variant')
  if (typeof post.body !== 'string' || !post.body.trim()) { add('bad_body'); return { ok: false, reasons } }
  if (requireApproval) {
    if (!isApproved(post)) add('not_approved')
    else if (post.approved_sha !== bodyHash(post.body)) add('approved_sha_mismatch')
  }
  const body = post.body
  const { paragraphs, hook, bridge } = splitBody(body)
  const maxLen = post.format === 'checklist' ? BODY.maxChecklist : BODY.max
  if (body.length < BODY.min) add('too_short')
  if (body.length > maxLen) add('too_long')
  if (paragraphs.length < 3) add('too_few_paragraphs')
  if (hook.length > BODY.hookMax) add('hook_too_long')
  if (!/^\p{Extended_Pictographic}/u.test(hook)) add('hook_without_emoji')
  if (hook.startsWith('```') || bridge.startsWith('```')) add('hook_or_bridge_is_code')
  if (bridge.length > BODY.bridgeMax) add('bridge_too_long')
  if (bridge.split(/(?<=[.!?…])\s+/).filter(Boolean).length > 1) add('bridge_not_single_sentence')
  if ((body.match(/\p{Extended_Pictographic}/gu) || []).length > BODY.maxEmoji) add('too_many_emoji')
  for (const [re, code] of FORBIDDEN_TEXT) if (re.test(body)) add(code)
  if (/https?:\/\/|t\.me|www\./i.test(body)) add('link_in_text')
  if (/(^|\s)#\w/.test(body)) add('hashtag_in_text')
  const noCode = body.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`\n]*`/g, ' ')
  if (/@[A-Za-z0-9_]{3,}/.test(noCode)) add('mention_in_text')
  if (/\*\*|__|~~|^#{1,6}\s/m.test(noCode)) add('markup_in_text')
  if (/\\/.test(noCode)) add('backslash_outside_code')
  if ((body.match(/`/g) || []).length % 2 !== 0) add('unbalanced_backticks')
  if ([...body.matchAll(/```[^\n]*\n([\s\S]*?)```/g)].some(m => /\n\s*\n/.test(m[1].trim()))) add('blank_line_in_code')
  const mentions = s => (s.match(/auditshield/gi) || []).length
  if (post.format === 'tool') {
    if (mentions(body) < 1 || mentions(body) > 5) add('auditshield_mentions')
    if (!/безкоштовн/i.test(body)) add('tool_without_free')
  } else {
    if (mentions(bridge) < 1) add('bridge_without_auditshield')
    if (/auditshield|demo/i.test(paragraphs.slice(0, -1).join('\n\n'))) add('product_outside_bridge')
  }
  if (demoOverclaims(body).length) add('demo_overclaim')
  if (angle) {
    const allowed = allowedCommands(angle)
    const verified = c => { const n = normCmd(c); return allowed.includes(n) || (n.length >= 5 && allowed.some(a => a.includes(n))) }
    const fenced = fencedLines(body)
    if (fenced.some(c => !allowed.includes(normCmd(c)))) add('unverified_command')
    if (inlineSpans(body).some(c => !verified(c) && !PLAIN_IDENT.test(c))) add('unverified_command')
    const known = new Set(SAFE_CMDLET_TOKENS)
    for (const a of allowed) for (const t of a.match(/[a-z]+-[a-z]+/g) || []) known.add(t)
    // будь-яке «Дієслово-Іменник» у тексті (навіть не в коді) має бути з перевірених команд: Remove-Item, Stop-Process тощо блокуються
    if ((body.match(/(?<![\p{L}\p{N}_-])[A-Z][a-z]+-[A-Z][A-Za-z]+/gu) || []).some(t => !known.has(t.toLowerCase()))) add('unsafe_command')
    const maxCmd = post.format === 'checklist' ? BODY.maxChecklistCommands : BODY.maxCommands
    if (fenced.length > maxCmd) add('too_many_commands')
    if ((post.format === 'quick' || post.format === 'diagnostic') && fenced.length < 1) add('format_without_command')
  }
  const items = (body.match(/^\s*\d+[.)]\s/gm) || []).length
  if (post.format === 'checklist' && (items < 2 || items > BODY.maxChecklistItems)) add('checklist_items')
  if (!reasons.includes('bad_id') && !reasons.includes('bad_cta_variant')) {
    try {
      const link = buildAttributionLink(post.id)
      if (markdownProblems(assemblePost({ body, ctaVariant: post.cta_variant, url: link.url })).length) add('markdown_invalid')
    } catch { add('attribution_link_invalid') }
  }
  return { ok: reasons.length === 0, reasons }
}

// ── Збірка поста для Telegram (Markdown legacy) ──
export function escapeMarkdownV1(text) {
  return text.split(/(```[\s\S]*?```|`[^`\n]*`)/g).map((seg, i) => (i % 2 === 1 ? seg : seg.replace(/([_*[`])/g, '\\$1'))).join('')
}

export function assemblePost({ body, ctaVariant, url }) {
  return [escapeMarkdownV1(body), CTA_VARIANTS[ctaVariant](url), HASHTAGS].join('\n\n')
}

// Повертає готовий Telegram-текст, посилання і метадані для pending/історії. Кидає Error('attribution_link_invalid') на поганому id.
export function renderApprovedPost(post, now = new Date()) {
  const link = buildAttributionLink(post.id)
  return {
    text: assemblePost({ body: post.body, ctaVariant: post.cta_variant, url: link.url }),
    link: link.url,
    audit: {
      id: post.id, angle: post.angle, format: post.format, topic: post.topic, content_id: post.id,
      cta_variant: post.cta_variant, approved_version: post.approved_version, text_sha: bodyHash(post.body), selected_at: now.toISOString(),
    },
  }
}

// ── Вибір наступного затвердженого поста ──
// Порядок бібліотеки = порядок ротації. Береться перший пост, який: затверджений; не публікувався (id, хеш тексту, не схожий на опублікований);
// проходить валідатор; його кут не використовувався 45 днів; тема не збігається із сусідніми самостійними постами слота та останніми
// extra/статтею. Формат, що збігається з форматом попереднього AuditShield-поста, відкладається, якщо є інший.
// Статуси: selected | library_empty (немає затверджених) | library_exhausted (усі затверджені вже виходили; сам не починається заново)
// | no_valid_post (решта не проходить валідатор) | no_eligible_post (решта тимчасово заблокована кулдауном/темою) | state_malformed.
export function selectApprovedPost({ state, now = new Date(), library = APPROVED_POSTS, promoModules = [], promoIndex = 0, extraTopics = [], lastPostTitle = '', includeCandidates = false }) {
  const r = readState(state)
  if (r.status === 'malformed') return { status: 'state_malformed' }
  const a = r.status === 'ok' ? r.value : null
  const history = a ? a.history : []
  const used = usedIdsOf(a)
  const usedShas = new Set(history.map(e => e.text_sha).filter(Boolean))
  const lastUsed = new Map()
  for (const e of history) lastUsed.set(e.angle, Math.max(lastUsed.get(e.angle) || 0, Date.parse(e.published_at)))
  const lastFormat = history.length ? history[history.length - 1].format : null
  const blockedModules = recentPromoModules(promoModules, promoIndex)
  const hay = [...extraTopics, lastPostTitle].join(' ').toLowerCase()
  const published = library.filter(p => used.has(p.id) && typeof p.body === 'string')
  const pool = library.filter(p => isApproved(p) || includeCandidates)
  const stats = { library: library.length, pool: pool.length, used: 0, duplicate: 0, invalid: [], cooldown: 0, topic: 0, eligible: 0 }
  if (!pool.length) return { status: 'library_empty', ...stats }
  const unused = []
  for (const p of pool) {
    if (used.has(p.id)) { stats.used++; continue }
    const v = validateApprovedPost(p, { requireApproval: isApproved(p) })
    if (!v.ok) { stats.invalid.push({ id: p.id, reasons: v.reasons }); continue }
    if (usedShas.has(bodyHash(p.body)) || published.some(q => nearDuplicate(p.body, q.body).dup)) { stats.duplicate++; continue }
    unused.push(p)
  }
  if (!unused.length) return { status: stats.invalid.length ? 'no_valid_post' : 'library_exhausted', ...stats }
  const eligible = unused.filter(p => {
    const angle = ANGLE_BY_ID[p.angle]
    if (lastUsed.has(p.angle) && now.getTime() - lastUsed.get(p.angle) < LIMITS.angleCooldownDays * DAY_MS) { stats.cooldown++; return false }
    if ((angle.module && blockedModules.has(angle.module)) || angle.keywords.some(k => hay.includes(k))) { stats.topic++; return false }
    return true
  })
  stats.eligible = eligible.length
  if (!eligible.length) return { status: 'no_eligible_post', ...stats }
  return { status: 'selected', post: eligible.find(p => p.format !== lastFormat) || eligible[0], ...stats }
}

// dry-run: показати конкретний пост бібліотеки (навіть кандидата) тим самим шляхом збірки, що й production.
export function previewPostById(id, library = APPROVED_POSTS) {
  const post = library.find(p => p.id === id)
  if (!post) return { status: 'unknown_post' }
  const v = validateApprovedPost(post, { requireApproval: isApproved(post) })
  return { status: v.ok ? 'selected' : 'invalid_post', post, approved: isApproved(post), reasons: v.reasons }
}

// Перевірка всієї бібліотеки цілком: унікальні id/тексти, кожен пост проходить валідатор, жодна пара не схожа понад пороги.
export function validateLibrary(library = APPROVED_POSTS, { requireApproval = false } = {}) {
  const problems = []
  const seenId = new Set(), seenSha = new Set()
  for (const p of library) {
    if (seenId.has(p.id)) problems.push({ id: p.id, problem: 'duplicate_id' })
    seenId.add(p.id)
    const v = validateApprovedPost(p, { requireApproval: requireApproval && isApproved(p) })
    if (!v.ok) problems.push({ id: p.id, problem: 'invalid', reasons: v.reasons })
    else {
      const sha = bodyHash(p.body)
      if (seenSha.has(sha)) problems.push({ id: p.id, problem: 'duplicate_text' })
      seenSha.add(sha)
    }
  }
  for (let i = 0; i < library.length; i++) for (let j = i + 1; j < library.length; j++) {
    if (typeof library[i].body !== 'string' || typeof library[j].body !== 'string') continue
    const d = nearDuplicate(library[i].body, library[j].body)
    if (d.dup) problems.push({ id: library[i].id, with: library[j].id, problem: 'similar', reason: d.reason, score: d.score })
  }
  return { ok: problems.length === 0, problems }
}

// ── Переходи стану ──
function freshState(now) {
  return { v: 1, seq: 0, posts_since: 0, initialized_at: now.toISOString(), last_published_at: null, manual_last_at: null, used_ids: [], history: [] }
}

// Викликається при кожній успішній відправці будь-якого поста, коли функція увімкнена.
// audit = мета AuditShield-поста (з pending) або null для звичайного поста. Пошкоджений стан не чіпаємо (лишається заблокованим).
// Повторний запис того самого id нічого не змінює (ідемпотентно).
export function nextAuditshieldState(prev, audit, now, messageId = null, status = 'published') {
  const r = readState({ auditshield: prev })
  if (r.status === 'malformed') return prev
  const base = r.status === 'ok' ? r.value : freshState(now)
  if (!audit) return { ...base, posts_since: base.posts_since + 1 }
  const used = usedIdsOf(base)
  if (used.has(audit.id)) return base
  const entry = { ...audit, published_at: now.toISOString(), message_id: messageId, status }
  return {
    ...base,
    seq: base.seq + 1,
    posts_since: 0,
    last_published_at: now.toISOString(),
    used_ids: [...used, audit.id],
    history: [...base.history, entry].slice(-LIMITS.historyLight),
  }
}

// Осиротілий pending з AuditShield-постом: чи пішов він у канал — невідомо, тому рахуємо як опублікований (безпечніше пропустити слот).
export function recordUnconfirmed(prev, audit, now) {
  return nextAuditshieldState(prev, audit, now, null, 'unconfirmed')
}

// Ручний пост власника бот прочитати не може; власник ставить маркер у published.json → auditshield.manual_last_at.
export const MANUAL_MARKER_NOTE = 'Bot API не дає читати історію каналу: ручні AuditShield-пости враховуються лише через auditshield.manual_last_at'
