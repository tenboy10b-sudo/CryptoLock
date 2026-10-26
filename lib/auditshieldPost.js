// AuditShield як окремий, жорстко обмежений тип Telegram-контенту (інтегрується в існуючий autopost, а не друга система).
//
// Принципи:
//  - вимкнено за замовчуванням (AUDITSHIELD_POSTS_ENABLED); без прапорця поведінка autopost не змінюється;
//  - будь-яка непевність = НЕ постити AuditShield (звичайний пост слота виходить як завжди);
//  - ліміти частоти, дублікати і посилання з атрибуцією перевіряються тут, ДО будь-якої відправки;
//  - посилання і CTA додає код, а не LLM: модель пише лише розділи HOOK/VALUE/CONTEXT/BRIDGE.
//
// Усі функції чисті (час передається аргументом); мережа тільки через переданий generateText.
import { createHash } from 'crypto'
import { ANGLES, FORMAT_CYCLE, FORMATS, VERIFIED_FACTS, FORBIDDEN_CLAIMS } from './auditshieldAngles.js'

export const AUDITSHIELD_BOT_URL = 'https://t.me/AuditShield_01_Bot'
// Схема атрибуції a1 з audit-shield-bot/funnel.py: a1_<src>_<campaign>_<content>, tc = tg_channel.
export const ATTRIBUTION = { code: 'tc', source: 'tg_channel', campaign: 'auditshield' }

const DAY_MS = 24 * 60 * 60 * 1000
export const LIMITS = {
  minDays: 7,            // не більше 1 AuditShield-поста за будь-які 7 днів
  minPostsBetween: 7,    // не більше 1 на кожні 8 постів => між двома AuditShield щонайменше 7 інших (суворіше за «мінімум 3 звичайні»)
  minNormalAfter: 3,     // явна нижня межа з вимог; завжди перекривається minPostsBetween
  angleCooldownDays: 45, // той самий кут не раніше ніж через 45 днів
  maxAttempts: 3,        // скільки різних кутів пробуємо за один слот, потім пропускаємо
  timeBudgetMs: 25000,   // нова спроба не починається, якщо від старту генерації минуло більше
  historyLight: 24,      // записів історії (метадані)
  historyText: 12,       // з них з повним текстом (для перевірки схожості)
}
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

export function buildContentId(seq, angleId) {
  return `as${String(seq).padStart(4, '0')}-${angleId}`
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
    && typeof e.content_id === 'string' && validIso(e.published_at) && (e.text === undefined || typeof e.text === 'string')
}

export function readState(state) {
  const a = state && state.auditshield
  if (a === undefined || a === null) return { status: 'uninitialized' }
  const ok = typeof a === 'object' && a.v === 1 && Number.isInteger(a.seq) && a.seq >= 0 && Number.isInteger(a.posts_since) && a.posts_since >= 0
    && validIso(a.initialized_at) && (a.last_published_at === null || validIso(a.last_published_at))
    && (a.manual_last_at === null || a.manual_last_at === undefined || validIso(a.manual_last_at))
    && Array.isArray(a.history) && a.history.every(validEntry)
  return ok ? { status: 'ok', value: a } : { status: 'malformed' }
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

export function chooseFormat(seq) { return FORMAT_CYCLE[seq % FORMAT_CYCLE.length] }

export function recentPromoModules(promoModules, promoIndex) {
  const n = promoModules.length
  const out = new Set()
  if (!n) return out
  for (let i = promoIndex - 6; i <= promoIndex + 1; i++) out.add(promoModules[((i % n) + n) % n].module)
  return out
}

// Кут: без повтору 45 днів, без збігу теми з сусідніми самостійними постами слота та останніми extra/статтею,
// пріоритет — формат за циклом, далі «найдавніше використаний».
export function selectAngle({ state, now = new Date(), promoModules = [], promoIndex = 0, extraTopics = [], lastPostTitle = '', format, exclude = [] }) {
  const r = readState(state)
  const history = r.status === 'ok' ? r.value.history : []
  const seq = r.status === 'ok' ? r.value.seq : 0
  const lastUsed = new Map()
  for (const e of history) lastUsed.set(e.angle, Math.max(lastUsed.get(e.angle) || 0, Date.parse(e.published_at)))
  const blockedModules = recentPromoModules(promoModules, promoIndex)
  const hay = [...extraTopics, lastPostTitle].join(' ').toLowerCase()
  // Без явного format (production): формат пропускається, якщо він збігається з форматом попереднього AuditShield-поста.
  const lastFormat = history.length ? history[history.length - 1].format : null
  const usable = angle => !exclude.includes(angle.id)
    && (format || angle.format !== lastFormat)
    && !(lastUsed.has(angle.id) && now.getTime() - lastUsed.get(angle.id) < LIMITS.angleCooldownDays * DAY_MS)
    && !(angle.module && blockedModules.has(angle.module))
    && !angle.keywords.some(k => hay.includes(k))
  const order = list => list.sort((a, b) => (lastUsed.get(a.id) || 0) - (lastUsed.get(b.id) || 0))
  const wanted = format || chooseFormat(seq)
  let list = order(ANGLES.filter(a => a.format === wanted && usable(a)))
  if (!list.length && !format) list = order(ANGLES.filter(usable))
  return list[0] || null
}

// ── Промпт ──
const FORMAT_SPEC = {
  diagnostic: `ФОРМАТ: Діагностичний кейс.
HOOK — 1–2 речення про конкретну річ на ПК, яку користувач зазвичай ніколи не перевіряє.
VALUE — 2–4 практичні речі для ручної перевірки (з кроків нижче).
CONTEXT — коли це корисно, і чесне обмеження.
BRIDGE — «Якщо не хочете збирати це вручну — безкоштовний AuditShield Demo перевіряє основні області автоматично» своїми словами.`,
  quick: `ФОРМАТ: Швидка перевірка.
HOOK — 1–2 речення: яке питання вирішує одна перевірка.
VALUE — один ручний спосіб (команда або шлях з кроків нижче) і як читати результат. Спочатку ручний спосіб.
CONTEXT — коли це корисно, чесне обмеження.
BRIDGE — AuditShield Demo як додатковий варіант, а не заміна.`,
  checklist: `ФОРМАТ: Чеклист.
HOOK — 1–2 речення: для якої ситуації цей чеклист.
VALUE — нумерований чеклист рівно з 5 пунктів; кожен пункт — що перевірити і як (з кроків нижче).
CONTEXT — скільки це займає і як читати результат.
BRIDGE — AuditShield згадується лише тут, після чеклисту.`,
  myth: `ФОРМАТ: Міф / пояснення.
HOOK — 1–2 речення: поширене уявлення або питання, без залякування.
VALUE — спокійне пояснення, чому відповідь складніша, і 1–2 ручні перевірки (з кроків нижче).
CONTEXT — що з цього випливає практично.
BRIDGE — AuditShield Demo як спосіб подивитися ці речі разом.`,
  tool: `ФОРМАТ: Інструмент / Demo (найпрямніший формат, але без продажу).
HOOK — 1–2 речення: яку задачу вирішує безкоштовний Demo.
VALUE — що саме робить Demo, лише з підтверджених фактів нижче; чого він не робить (чесно).
CONTEXT — кому це може бути корисно і яке обмеження має Demo.
BRIDGE — коротко: як отримати Demo (його надсилає бот).`,
}

export function buildPrompt({ format, angle, recentHooks = [] }) {
  const steps = angle.steps.length
    ? `ПЕРЕВІРЕНІ КРОКИ — використовуй ЛИШЕ їх; команди копіюй дослівно, жодних інших команд, ключів реєстру чи параметрів:\n${angle.steps.map(s => `- ${s}`).join('\n')}`
    : 'У цьому пості команд не буде: описуй лише підтверджені факти.'
  const avoid = recentHooks.length
    ? `\n\nОстанні вступи постів про AuditShield (НЕ повторюй їх і не перефразовуй):\n${recentHooks.map(h => `- ${h}`).join('\n')}`
    : ''
  return `Ти адміністратор Telegram-каналу CryptoLock (@cryptolock888) — практичні поради про Windows для українців.
Напиши ОДИН пост, який корисний сам по собі, навіть якщо людина нікуди не натисне. Це не реклама: основна частина — практична користь, а AuditShield з'являється лише у короткому місточку наприкінці.

${FORMAT_SPEC[format]}

КУТ ПОСТА: ${angle.topic}
Задум: ${angle.brief}
${steps}
Чесне обмеження: ${angle.limits}
Що Demo справді перевіряє по цій темі (у BRIDGE можна обіцяти не більше): ${angle.demoCovers}

ПІДТВЕРДЖЕНІ ФАКТИ ПРО AUDITSHIELD (говори про продукт лише ними, нічого не додавай від себе):
${VERIFIED_FACTS.map(f => `- ${f}`).join('\n')}

ЗАБОРОНЕНО:
${FORBIDDEN_CLAIMS.map(f => `- ${f}`).join('\n')}
- Без страшилок, терміновості, обіцянок і порівнянь «до/після зламу». Тон спокійний, як порада колеги.
- Без цін, тарифів, слів «купити/придбати/оплата/знижка».

ФОРМА ВІДПОВІДІ — рівно чотири розділи, кожна мітка на окремому рядку, без жодного тексту поза ними:
[HOOK]
[VALUE]
[CONTEXT]
[BRIDGE]

Вимоги до тексту:
- Українська мова. Загальний обсяг ${format === 'checklist' ? '700–1500' : '500–1100'} символів.
- HOOK починається одним емодзі. У BRIDGE має бути слово AuditShield.${format === 'tool' ? '' : ' В інших розділах AuditShield не згадується.'}
- Команди — у блоках з потрійними зворотними лапками, кожна команда з нового рядка; шляхи й назви команд у тексті — лише в одинарних зворотних лапках. Інакше жодної розмітки: без зірочок, підкреслень, заголовків, хештегів, посилань і @-згадок. Нумерація «1.» дозволена.
- НЕ пиши посилання і заклик «натисніть»: їх додасть система.${avoid}`
}

// ── Розбір і перевірка відповіді моделі ──
const SECTIONS = ['HOOK', 'VALUE', 'CONTEXT', 'BRIDGE']

export function parseSections(raw) {
  if (typeof raw !== 'string') return null
  const found = {}
  const order = []
  let current = null
  for (const line of raw.replace(/\r/g, '').split('\n')) {
    const m = line.trim().match(/^\[(HOOK|VALUE|CONTEXT|BRIDGE)\]$/)
    if (m) {
      if (found[m[1]] !== undefined) return null
      current = m[1]; found[current] = []; order.push(current)
    } else if (current) found[current].push(line)
    else if (line.trim()) return null
  }
  if (order.join(',') !== SECTIONS.join(',')) return null
  const parts = {}
  for (const k of SECTIONS) {
    parts[k.toLowerCase()] = found[k].join('\n').trim()
    if (!parts[k.toLowerCase()]) return null
  }
  return parts
}

const FORBIDDEN_TEXT = [
  [/вас\s+зламал|ваш[іи]\s+дан[іи]\s+(вже|краду)|краду(ть|ться)|вже\s+(вкрали|злили)|вас\s+(хакнули|шпигу)/iu, 'scare'],
  [/терміново|негайно|не\s+зволікайте|останн\p{L}+\s+шанс|тільки\s+сьогодні|обмежен\p{L}+\s+пропозиц/iu, 'urgency'],
  [/100\s*%|сто\s+відсотків|гаранту|гарантія|повн\p{L}+\s+захист|абсолютно\s+безпечн|непробивн|захистить|захист\s+від\s+(усіх|всіх)|знайде\s+(всі|усі)|виявить\s+(всі|усі)|замінює\s+антивірус/iu, 'guarantee'],
  [/\b\d{1,3}\s*\/\s*100\b|оцінк\p{L}+\s+ризику|рівен\p{L}+\s+ризику|risk\s*score|(?<![\p{L}])бал(ів|и|а|ами)?(?![\p{L}])/iu, 'score'],
  [/22\s*модул/iu, 'stale_module_count'],
  [/жодн\p{L}+\s+дан\p{L}+|нічого\s+не\s+(передається|надсилається|відправляється)|ніщо\s+не\s+(передається|надсилається)|офлайн|offline/iu, 'privacy_absolute'],
  [/\$\s*\d|\d\s*(usd|usdt|грн|₴)|(?<![\p{L}])(ціна|ціни|ціну|ціною)(?![\p{L}])|тариф|купит|придбат|оплат|знижк|промокод/iu, 'price_or_sales'],
]
const ALWAYS_ALLOWED_CODE = ['%localappdata%\\auditshield_demo\\', '%localappdata%\\auditshield_demo']

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

function normCmd(s) { return s.replace(/\s+/g, ' ').trim().toLowerCase().replace(/\b\d{3,}\b/g, 'n') }
function stepCommand(step) { return step.split(/\s{3,}\(/)[0] }

export function allowedCommands(angle) {
  return [...angle.steps.map(stepCommand), ...ALWAYS_ALLOWED_CODE].map(normCmd)
}

export function validateParts(parts, format, angle) {
  const reasons = []
  const all = [parts.hook, parts.value, parts.context, parts.bridge].join('\n\n')
  const maxLen = format === 'checklist' ? 1800 : 1500
  if (all.length < 350) reasons.push('too_short')
  if (all.length > maxLen) reasons.push('too_long')
  if (parts.hook.length > 320) reasons.push('hook_too_long')
  if (parts.bridge.length > 340) reasons.push('bridge_too_long')
  for (const [re, code] of FORBIDDEN_TEXT) if (re.test(all)) reasons.push(code)
  if (/https?:\/\/|t\.me|www\./i.test(all)) reasons.push('link_in_text')
  if (/(^|\s)#\w/.test(all)) reasons.push('hashtag_in_text')
  const noCode = all.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`\n]*`/g, ' ')
  if (/@[A-Za-z0-9_]{3,}/.test(noCode)) reasons.push('mention_in_text')
  if (/\*\*|__|~~|^#{1,6}\s/m.test(noCode)) reasons.push('markup_in_text')
  if (/\\/.test(noCode)) reasons.push('backslash_outside_code')
  if ((all.match(/`/g) || []).length % 2 !== 0) reasons.push('unbalanced_backticks')
  const mentions = (s => (s.match(/auditshield/gi) || []).length)
  if (format === 'tool') {
    if (mentions(all) < 1 || mentions(all) > 5) reasons.push('auditshield_mentions')
    if (!/безкоштовн/i.test(all)) reasons.push('tool_without_free')
  } else {
    if (mentions(parts.bridge) < 1) reasons.push('bridge_without_auditshield')
    if (mentions([parts.hook, parts.value, parts.context].join(' ')) > 0) reasons.push('auditshield_outside_bridge')
  }
  if (!/^\p{Extended_Pictographic}/u.test(parts.hook.trim())) reasons.push('hook_without_emoji')
  const allowed = allowedCommands(angle)
  // Повний рядок команди має збігатись зі «перевіреним кроком»; у тексті допускається уривок такої команди (від 5 символів).
  const verified = c => { const n = normCmd(c); return allowed.includes(n) || (n.length >= 5 && allowed.some(a => a.includes(n))) }
  if (extractCode(all).some(c => !verified(c))) reasons.push('unverified_command')
  if (format === 'quick' && extractCode(parts.value).length < 1) reasons.push('quick_without_command')
  if (format === 'checklist' && (parts.value.match(/^\s*\d+[.)]\s/gm) || []).length !== 5) reasons.push('checklist_not_5_items')
  if (format === 'diagnostic' && extractCode(parts.value).length < 1 && (parts.value.match(/^\s*(\d+[.)]|[-•])\s/gm) || []).length < 2) reasons.push('diagnostic_without_value')
  return { ok: reasons.length === 0, reasons }
}

// ── Схожість ──
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
const sig = text => createHash('sha256').update(tokens(text).join(' ') + '|' + extractCode(text).map(normCmd).sort().join(';')).digest('hex').slice(0, 16)

export function checkDuplicate(candidate, history) {
  const cSha = sig(candidate.plain)
  const cProse = shingles(tokens(candidate.plain))
  const cBody = shingles(tokens(candidate.value + '\n' + candidate.context))
  const cHook = new Set(tokens(candidate.hook))
  const cBridge = shingles(tokens(candidate.bridge))
  const cCmds = new Set(extractCode(candidate.plain).map(normCmd))
  for (const e of history) {
    if (e.text_sha === cSha) return { dup: true, reason: 'exact', with: e.id, score: 1 }
    if (e.hook) {
      const s = jaccard(cHook, new Set(tokens(e.hook)))
      if (s >= SIMILARITY.hook) return { dup: true, reason: 'same_hook', with: e.id, score: s }
    }
    if (e.bridge) {
      const s = jaccard(cBridge, shingles(tokens(e.bridge)))
      if (s >= SIMILARITY.bridge) return { dup: true, reason: 'same_bridge', with: e.id, score: s }
    }
    if (typeof e.text === 'string') {
      const sp = jaccard(cProse, shingles(tokens(e.text)))
      if (sp >= SIMILARITY.prose) return { dup: true, reason: 'near_duplicate', with: e.id, score: sp }
      const sb = jaccard(cBody, storedBody(e))
      if (sb >= SIMILARITY.body) return { dup: true, reason: 'same_body', with: e.id, score: sb }
      const eCmds = new Set(extractCode(e.text).map(normCmd))
      if (cCmds.size >= SIMILARITY.minCommands && eCmds.size >= SIMILARITY.minCommands) {
        const sc = jaccard(cCmds, eCmds)
        if (sc >= SIMILARITY.commands) return { dup: true, reason: 'same_checklist', with: e.id, score: sc }
      }
    }
  }
  return { dup: false }
}
// Збережений текст = hook \n\n value \n\n context \n\n bridge; «тіло» (value+context) — це текст без hook і bridge.
function storedBody(e) {
  const h = typeof e.hook === 'string' ? e.hook.length : 0
  const b = typeof e.bridge === 'string' ? e.bridge.length : 0
  return shingles(tokens(e.text.slice(h, e.text.length - b)))
}

// ── Збірка поста для Telegram (Markdown legacy) ──
export function escapeMarkdownV1(text) {
  return text.split(/(```[\s\S]*?```|`[^`\n]*`)/g).map((seg, i) => (i % 2 === 1 ? seg : seg.replace(/([_*[`])/g, '\\$1'))).join('')
}

export function assemblePost({ parts, ctaVariant, url }) {
  const plain = [parts.hook, parts.value, parts.context, parts.bridge].join('\n\n')
  const cta = CTA_VARIANTS[ctaVariant](url)
  const telegram = [escapeMarkdownV1(parts.hook), escapeMarkdownV1(parts.value), escapeMarkdownV1(parts.context), escapeMarkdownV1(parts.bridge), cta, HASHTAGS].join('\n\n')
  return { plain, telegram }
}

// ── Генерація одного поста (з кількома спробами різних кутів) ──
// Повертає { post } або { blocked: [...коди причин] }. Нічого не пише в стан.
export async function generateAuditshieldPost({ state, now = new Date(), generateText, promoModules = [], promoIndex = 0, extraTopics = [], lastPostTitle = '', format, angleId, log = () => {}, clock = Date.now }) {
  const r = readState(state)
  if (r.status === 'malformed') return { blocked: ['state_malformed'] }
  const history = r.status === 'ok' ? r.value.history : []
  const seq = (r.status === 'ok' ? r.value.seq : 0) + 1
  const recentHooks = history.slice(-6).map(e => e.hook).filter(Boolean)
  const reasons = []
  const exclude = []
  const startedAt = clock()
  for (let attempt = 1; attempt <= LIMITS.maxAttempts; attempt++) {
    // Функція Vercel живе 60 с, а після невдачі слоту ще потрібен звичайний пост: нові спроби лише поки бюджет часу не вичерпано.
    if (attempt > 1 && clock() - startedAt > LIMITS.timeBudgetMs) { reasons.push('time_budget'); break }
    const angle = angleId
      ? ANGLES.find(a => a.id === angleId && !exclude.includes(a.id))
      : selectAngle({ state, now, promoModules, promoIndex, extraTopics, lastPostTitle, format, exclude })
    if (!angle) { reasons.push('no_angle'); break }
    exclude.push(angle.id)
    let raw
    try {
      raw = await generateText(buildPrompt({ format: angle.format, angle, recentHooks }), 1200)
    } catch (e) {
      log('auditshield_llm_error', { attempt, error: String(e.message || e).slice(0, 120) })
      return { blocked: [...reasons, 'llm_error'] }
    }
    const parts = parseSections(raw)
    if (!parts) { reasons.push(`${angle.id}:format`); continue }
    const v = validateParts(parts, angle.format, angle)
    if (!v.ok) { reasons.push(...v.reasons.map(x => `${angle.id}:${x}`)); continue }
    const contentId = buildContentId(seq, angle.id)
    let link
    try { link = buildAttributionLink(contentId) } catch { return { blocked: [...reasons, 'attribution_link_invalid'] } }
    const ctaVariant = (seq - 1) % CTA_VARIANTS.length
    const { plain, telegram } = assemblePost({ parts, ctaVariant, url: link.url })
    let dup
    try { dup = checkDuplicate({ plain, hook: parts.hook, value: parts.value, context: parts.context, bridge: parts.bridge }, history) } catch { return { blocked: [...reasons, 'duplicate_checker_failed'] } }
    if (dup.dup) { reasons.push(`${angle.id}:dup_${dup.reason}`); continue }
    const postId = `as${String(seq).padStart(4, '0')}`
    return {
      post: {
        text: telegram,
        identifier: `auditshield:${postId}:${angle.id}`,
        commitMsg: 'bot: update published.json [middle-auditshield]',
        audit: {
          id: postId, seq, angle: angle.id, format: angle.format, topic: angle.topic, content_id: contentId,
          cta_variant: ctaVariant, generated_at: now.toISOString(), text_sha: sig(plain), hook: parts.hook, bridge: parts.bridge, text: plain,
        },
        link: link.url,
      },
    }
  }
  return { blocked: reasons.length ? reasons : ['no_candidate'] }
}

// ── Переходи стану ──
function trimHistory(history) {
  const h = history.slice(-LIMITS.historyLight)
  return h.map((e, i) => (i < h.length - LIMITS.historyText && e.text !== undefined ? (({ text, ...rest }) => rest)(e) : e))
}

function freshState(now) {
  return { v: 1, seq: 0, posts_since: 0, initialized_at: now.toISOString(), last_published_at: null, manual_last_at: null, history: [] }
}

// Викликається при кожній успішній відправці будь-якого поста, коли функція увімкнена.
// audit = мета AuditShield-поста (з pending) або null для звичайного поста. Пошкоджений стан не чіпаємо (лишається заблокованим).
export function nextAuditshieldState(prev, audit, now, messageId = null, status = 'published') {
  const r = readState({ auditshield: prev })
  if (r.status === 'malformed') return prev
  const base = r.status === 'ok' ? r.value : freshState(now)
  if (!audit) return { ...base, posts_since: base.posts_since + 1 }
  const entry = { ...audit, published_at: now.toISOString(), message_id: messageId, status }
  return {
    ...base,
    seq: Math.max(base.seq, audit.seq),
    posts_since: 0,
    last_published_at: now.toISOString(),
    history: trimHistory([...base.history, entry]),
  }
}

// Осиротілий pending з AuditShield-постом: чи пішов він у канал — невідомо, тому рахуємо як опублікований (безпечніше пропустити слот).
export function recordUnconfirmed(prev, audit, now) {
  return nextAuditshieldState(prev, audit, now, null, 'unconfirmed')
}

// Ручний пост власника бот прочитати не може; власник ставить маркер у published.json → auditshield.manual_last_at.
export const MANUAL_MARKER_NOTE = 'Bot API не дає читати історію каналу: ручні AuditShield-пости враховуються лише через auditshield.manual_last_at'
