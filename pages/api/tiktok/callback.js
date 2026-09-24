// TikTok Sandbox OAuth smoke test — step 2: verify CSRF state, exchange the code
// server-side, call user.info.basic + video.list, render a throwaway result page.
// No access_token/refresh_token is ever persisted (no DB/GitHub/file write) — both
// fall out of scope when this request finishes. Never log secret/code/token values.
import {
  STATE_COOKIE_NAME,
  clearStateCookie,
  parseCookie,
  escapeHtml,
  renderErrorPage,
  renderResultPage,
  renderStateDiagnosticPage,
  renderTokenDiagnosticPage,
} from '../../../lib/tiktokAuth'

const REQUIRED_SCOPES = ['user.info.basic', 'video.list']

// Defensive coercion for the 4 safe fields TikTok's token endpoint returns on
// failure (error/error_description/log_id) — always a short string or null,
// never an object/array that could smuggle unexpected content through.
function safeStr(value, maxLen = 300) {
  if (typeof value !== 'string' || !value) return null
  return value.length > maxLen ? value.slice(0, maxLen) + '…' : value
}

function log(event, fields = {}) {
  // Safe by construction: callers below only ever pass status codes / booleans /
  // fixed strings here, never response bodies or the token/code/secret values.
  console.log(JSON.stringify({ event, ts: new Date().toISOString(), ...fields }))
}

function fail(res, status, safeMessage, logEvent) {
  if (logEvent) log(logEvent, { status })
  res.status(status).setHeader('Content-Type', 'text/html; charset=utf-8')
  res.end(renderErrorPage('TikTok Sandbox — failed', safeMessage))
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  const { TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_REDIRECT_URI } = process.env
  const missing = ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET', 'TIKTOK_REDIRECT_URI']
    .filter(k => !process.env[k])
  if (missing.length) {
    return fail(res, 500, `Server misconfigured: missing ${missing.join(', ')}.`, 'missing_env')
  }

  const { code, state, error, error_description: errorDescription } = req.query

  // One-time use: clear the state cookie on every outcome, success or failure.
  res.setHeader('Set-Cookie', clearStateCookie())

  if (error) {
    return fail(
      res, 400,
      `TikTok returned an OAuth error: ${escapeHtml(String(error))}${errorDescription ? ' — ' + escapeHtml(String(errorDescription)) : ''}`,
      'tiktok_oauth_error'
    )
  }

  const cookieState = parseCookie(req.headers.cookie, STATE_COOKIE_NAME)
  const statePresent = Boolean(state)
  const cookieHeaderPresent = Boolean(req.headers.cookie)
  const stateCookiePresent = Boolean(cookieState)
  const stateMatchesCookie = statePresent && stateCookiePresent && state === cookieState

  if (!stateMatchesCookie) {
    // TEMPORARY diagnostic (see TIKTOK OAUTH — DIAGNOSE CSRF STATE FAILURE task):
    // booleans only, never the actual state/cookie values.
    log('state_mismatch', {
      state_present: statePresent,
      cookie_header_present: cookieHeaderPresent,
      state_cookie_present: stateCookiePresent,
      state_matches_cookie: stateMatchesCookie,
      request_method: req.method,
      request_host: req.headers.host || null,
    })
    res.status(403).setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.end(renderStateDiagnosticPage({
      statePresent,
      stateCookiePresent,
      stateMatchesCookie,
    }))
  }

  if (!code) {
    return fail(res, 400, 'Missing authorization code.', 'missing_code')
  }

  // ---- server-side token exchange ----
  let accessToken, grantedScopesRaw
  try {
    const params = new URLSearchParams({
      client_key: TIKTOK_CLIENT_KEY,
      client_secret: TIKTOK_CLIENT_SECRET,
      code: String(code),
      grant_type: 'authorization_code',
      redirect_uri: TIKTOK_REDIRECT_URI,
    })
    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cache-Control': 'no-cache' },
      body: params.toString(),
    })

    // Parse separately from the ok/access_token check so a malformed/non-JSON
    // body (TikTok outage, proxy error page, etc.) is distinguishable from a
    // well-formed JSON error response.
    let tokenJson = null
    try {
      tokenJson = await tokenRes.json()
    } catch (parseErr) {
      tokenJson = null
    }

    if (tokenJson === null || typeof tokenJson !== 'object') {
      log('token_exchange_malformed', { http_status: tokenRes.status })
      res.status(502).setHeader('Content-Type', 'text/html; charset=utf-8')
      return res.end(renderTokenDiagnosticPage({ malformed: true, httpStatus: tokenRes.status }))
    }

    if (!tokenRes.ok || !tokenJson.access_token) {
      // Only these four safe fields are ever extracted, logged, or displayed —
      // never client_secret/client_key/authorization code/tokens/full body.
      const diag = {
        httpStatus: tokenRes.status,
        error: safeStr(tokenJson.error),
        errorDescription: safeStr(tokenJson.error_description),
        logId: safeStr(tokenJson.log_id),
      }
      log('token_exchange_failed', {
        http_status: diag.httpStatus,
        error: diag.error,
        error_description: diag.errorDescription,
        log_id: diag.logId,
      })
      res.status(502).setHeader('Content-Type', 'text/html; charset=utf-8')
      return res.end(renderTokenDiagnosticPage(diag))
    }

    accessToken = tokenJson.access_token
    grantedScopesRaw = tokenJson.scope || ''
  } catch (e) {
    // Network/fetch-level failure — no HTTP response to extract diagnostic fields from.
    log('token_exchange_error', { status: 0 })
    return fail(res, 502, 'Token exchange with TikTok failed.', null)
  }

  const grantedScopes = grantedScopesRaw.split(',').map(s => s.trim()).filter(Boolean)
  const hasAllScopes = REQUIRED_SCOPES.every(s => grantedScopes.includes(s))
  if (!hasAllScopes) {
    return fail(
      res, 403,
      `Missing required scopes. Granted: ${escapeHtml(grantedScopes.join(', ') || 'none')}, required: ${REQUIRED_SCOPES.join(', ')}.`,
      'insufficient_scope'
    )
  }

  // ---- user.info.basic ----
  let displayName = null
  try {
    const userRes = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    const userJson = await userRes.json()
    if (!userRes.ok || (userJson.error && userJson.error.code && userJson.error.code !== 'ok')) {
      throw new Error('user info fetch failed')
    }
    displayName = userJson.data?.user?.display_name ?? null
  } catch (e) {
    log('user_info_failed', { status: 0 })
    return fail(res, 502, 'Failed to fetch TikTok user info.', null)
  }

  // ---- video.list ----
  let videos = []
  try {
    const videoRes = await fetch(
      'https://open.tiktokapis.com/v2/video/list/?fields=id,title,create_time,duration,cover_image_url,share_url,view_count,like_count,comment_count,share_count',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ max_count: 20 }),
      }
    )
    const videoJson = await videoRes.json()
    if (!videoRes.ok || (videoJson.error && videoJson.error.code && videoJson.error.code !== 'ok')) {
      throw new Error('video list fetch failed')
    }
    videos = Array.isArray(videoJson.data?.videos) ? videoJson.data.videos : []
  } catch (e) {
    log('video_list_failed', { status: 0 })
    return fail(res, 502, 'Failed to fetch TikTok video list.', null)
  }

  log('success', { videoCount: videos.length })

  // accessToken/tokenJson intentionally go out of scope here — nothing persisted.
  res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8')
  res.end(renderResultPage({ displayName, grantedScopes, videos }))
}
