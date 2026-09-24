// Мінімальний спільний хелпер для TikTok Sandbox OAuth smoke test
// (pages/api/tiktok/login.js + pages/api/tiktok/callback.js).
// Навмисно без нової залежності (cookie-парсер тут тривіальний) і без жодної
// персистенції токенів — це stateless CSRF-cookie і безпечний рендер HTML.

export const STATE_COOKIE_NAME = 'tiktok_oauth_state'
const STATE_COOKIE_MAX_AGE_SECONDS = 600 // 10 хвилин

export function serializeStateCookie(value) {
  return [
    `${STATE_COOKIE_NAME}=${value}`,
    'Path=/api/tiktok',
    `Max-Age=${STATE_COOKIE_MAX_AGE_SECONDS}`,
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
  ].join('; ')
}

export function clearStateCookie() {
  return [
    `${STATE_COOKIE_NAME}=`,
    'Path=/api/tiktok',
    'Max-Age=0',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
  ].join('; ')
}

export function parseCookie(cookieHeader, name) {
  if (!cookieHeader) return null
  for (const part of cookieHeader.split(';')) {
    const eq = part.indexOf('=')
    if (eq === -1) continue
    const key = part.slice(0, eq).trim()
    if (key === name) {
      try {
        return decodeURIComponent(part.slice(eq + 1).trim())
      } catch {
        return part.slice(eq + 1).trim()
      }
    }
  }
  return null
}

export function escapeHtml(value) {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Дозволяє рендерити href лише для безпечних https-посилань, які прийшли від TikTok —
// захист про всяк випадок від будь-якої несподіваної схеми (напр. javascript:).
export function safeHttpsUrl(value) {
  if (typeof value !== 'string') return null
  return /^https:\/\//i.test(value) ? value : null
}

function pageShell(title, bodyHtml, statusColor) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 40px 16px; }
  .card { max-width: 720px; margin: 0 auto; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 28px 32px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .status { font-size: 13px; font-weight: 600; color: ${statusColor || '#94a3b8'}; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #334155; }
  th { color: #94a3b8; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; }
  a { color: #60a5fa; }
  .meta { font-size: 13px; color: #94a3b8; margin: 4px 0; }
  code { background: #0f172a; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
</style>
</head>
<body>
<div class="card">
${bodyHtml}
</div>
</body>
</html>`
}

export function renderErrorPage(title, message) {
  return pageShell(
    title,
    `<h1>TikTok Sandbox — connection failed</h1>
     <p class="status" style="color:#f87171">TikTok connected: NO</p>
     <p class="meta">${escapeHtml(message)}</p>`,
    '#f87171'
  )
}

// TEMPORARY diagnostic page for the CSRF state-check failure path only (see
// TIKTOK OAUTH — DIAGNOSE CSRF STATE FAILURE task). Shows only booleans, never
// the actual state/cookie values — same no-secrets contract as renderErrorPage.
export function renderStateDiagnosticPage(diag) {
  const yn = (b) => (b ? 'YES' : 'NO')
  return pageShell(
    'TikTok Sandbox — CSRF state check failed',
    `<h1>TikTok Sandbox — connection failed</h1>
     <p class="status" style="color:#f87171">TikTok connected: NO</p>
     <p class="meta">Invalid or missing CSRF state.</p>
     <p class="meta">State returned by TikTok: <code>${yn(diag.statePresent)}</code></p>
     <p class="meta">OAuth cookie returned by browser: <code>${yn(diag.stateCookiePresent)}</code></p>
     <p class="meta">State matched cookie: <code>${yn(diag.stateMatchesCookie)}</code></p>`,
    '#f87171'
  )
}

// TEMPORARY diagnostic page for the token-exchange failure path only (see
// CRYPTOLOCK — DIAGNOSE TIKTOK TOKEN EXCHANGE FAILURE task). Shows only the
// four safe fields TikTok itself returns on failure (HTTP status, error,
// error_description, log_id) — never client_secret/client_key/code/tokens.
export function renderTokenDiagnosticPage(diag) {
  const status = diag.httpStatus === null || diag.httpStatus === undefined ? '(unknown)' : diag.httpStatus

  if (diag.malformed) {
    return pageShell(
      'TikTok Sandbox — token exchange failed',
      `<h1>TikTok Sandbox — connection failed</h1>
       <p class="status" style="color:#f87171">TikTok connected: NO</p>
       <p class="meta">TikTok token exchange: FAILED</p>
       <p class="meta">Unexpected TikTok token response.</p>
       <p class="meta">HTTP status: <code>${escapeHtml(status)}</code></p>`,
      '#f87171'
    )
  }

  return pageShell(
    'TikTok Sandbox — token exchange failed',
    `<h1>TikTok Sandbox — connection failed</h1>
     <p class="status" style="color:#f87171">TikTok connected: NO</p>
     <p class="meta">TikTok token exchange: FAILED</p>
     <p class="meta">HTTP status: <code>${escapeHtml(status)}</code></p>
     <p class="meta">Error: <code>${escapeHtml(diag.error || '(none)')}</code></p>
     <p class="meta">Description: <code>${escapeHtml(diag.errorDescription || '(none)')}</code></p>
     <p class="meta">Log ID: <code>${escapeHtml(diag.logId || '(none)')}</code></p>`,
    '#f87171'
  )
}

// TEMPORARY diagnostic page for the token-persistence failure path only (see
// CRYPTOLOCK — PERSIST VERIFIED TIKTOK OAUTH TOKENS TO UPSTASH REDIS task).
// Deliberately generic — never reveals whether the cause was a missing env
// var or a Redis-level error, and never the Redis/TikTok values themselves.
export function renderTokenPersistFailedPage() {
  return pageShell(
    'TikTok Sandbox — token persistence failed',
    `<h1>TikTok Sandbox — connection failed</h1>
     <p class="status" style="color:#f87171">TikTok connected: NO</p>
     <p class="meta">TikTok authorization succeeded, but secure token persistence failed.</p>`,
    '#f87171'
  )
}

export function renderResultPage({ displayName, grantedScopes, videos }) {
  const rows = videos.map(v => {
    const date = v.create_time ? new Date(v.create_time * 1000).toISOString().slice(0, 10) : '—'
    const share = safeHttpsUrl(v.share_url)
    const titleCell = share
      ? `<a href="${escapeHtml(share)}" target="_blank" rel="noopener noreferrer">${escapeHtml(v.title || '(untitled)')}</a>`
      : escapeHtml(v.title || '(untitled)')
    return `<tr>
      <td>${titleCell}</td>
      <td>${escapeHtml(date)}</td>
      <td>${escapeHtml(v.view_count ?? '—')}</td>
      <td>${escapeHtml(v.like_count ?? '—')}</td>
      <td>${escapeHtml(v.comment_count ?? '—')}</td>
      <td>${escapeHtml(v.share_count ?? '—')}</td>
    </tr>`
  }).join('\n')

  return pageShell(
    'TikTok Sandbox — connected',
    `<h1>TikTok Sandbox smoke test</h1>
     <p class="status" style="color:#4ade80">TikTok connected: YES</p>
     <p class="meta">Display name: <code>${escapeHtml(displayName || '(none)')}</code></p>
     <p class="meta">Scopes granted: <code>${escapeHtml(grantedScopes.join(', '))}</code></p>
     <p class="meta">Videos returned: <code>${videos.length}</code></p>
     <table>
       <thead><tr><th>Title</th><th>Created</th><th>Views</th><th>Likes</th><th>Comments</th><th>Shares</th></tr></thead>
       <tbody>${rows || '<tr><td colspan="6">No videos returned.</td></tr>'}</tbody>
     </table>
     <p class="meta" style="margin-top:20px">Secure token persistence: <code>YES</code></p>`,
    '#4ade80'
  )
}
