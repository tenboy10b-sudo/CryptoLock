// Autonomous TikTok collector: proves CryptoLock can read TikTok video metrics
// without a browser OAuth session, using the token bundle persisted by
// /api/tiktok/callback. Secret-gated (Bearer TIKTOK_COLLECT_SECRET), POST only.
// Does NOT persist analytics history yet — this stage only proves the token
// lifecycle (proactive refresh, atomic Redis overwrite) and video.list
// pagination work end to end.
import crypto from 'crypto'
import {
  loadTokenBundle,
  persistTokenBundle,
  acquireCollectorLock,
  releaseCollectorLock,
} from '../../../lib/tiktokTokenStore'
import {
  decideTokenAction,
  refreshAccessToken,
  validateRefreshedBundle,
  collectVideos,
} from '../../../lib/tiktokCollector'

function log(event, fields = {}) {
  // Safe by construction: callers below only ever pass status codes / booleans /
  // page counts / fixed reason strings — never tokens, secrets, or headers.
  console.log(JSON.stringify({ event, ts: new Date().toISOString(), ...fields }))
}

function jsonResponse(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

// Constant-time secret comparison. Buffers of different lengths can't be
// passed to timingSafeEqual directly (it throws), so a same-length dummy
// comparison keeps the rejection path's timing close to the real one instead
// of short-circuiting on a length check.
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a))
  const bufB = Buffer.from(String(b))
  if (bufA.length !== bufB.length) {
    try { crypto.timingSafeEqual(bufA, bufA) } catch (e) { /* noop */ }
    return false
  }
  return crypto.timingSafeEqual(bufA, bufB)
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return jsonResponse(res, 405, { ok: false, error: 'method_not_allowed' })
  }

  const COLLECT_SECRET = process.env.TIKTOK_COLLECT_SECRET
  if (!COLLECT_SECRET) {
    log('collector_failed', { stage: 'auth', reason: 'missing_env' })
    return jsonResponse(res, 500, { ok: false, error: 'server_misconfigured' })
  }

  const authHeader = req.headers.authorization || ''
  const match = /^Bearer\s+(.+)$/.exec(authHeader)
  const providedSecret = match ? match[1] : null
  if (!providedSecret || !safeEqual(providedSecret, COLLECT_SECRET)) {
    return jsonResponse(res, 401, { ok: false, error: 'unauthorized' })
  }

  log('collector_started', {})

  const executionId = crypto.randomBytes(16).toString('hex')
  const lockResult = await acquireCollectorLock(executionId)
  if (!lockResult.ok) {
    if (lockResult.reason === 'locked') {
      log('collector_lock_busy', {})
      return jsonResponse(res, 409, { ok: false, error: 'already_running' })
    }
    log('collector_failed', { stage: 'lock', reason: lockResult.reason })
    return jsonResponse(res, 502, { ok: false, error: 'lock_unavailable' })
  }
  log('collector_lock_acquired', {})

  try {
    const bundleResult = await loadTokenBundle()
    if (!bundleResult.ok) {
      log('collector_failed', { stage: 'token_bundle', reason: bundleResult.reason })
      if (bundleResult.reason === 'not_found' || bundleResult.reason === 'malformed') {
        return jsonResponse(res, 409, {
          ok: false,
          error: 'reauthorization_required',
          reauthorization_required: true,
          message: 'No usable TikTok token found. Perform a fresh authorization via /tiktok-connect.',
        })
      }
      return jsonResponse(res, 502, { ok: false, error: 'token_bundle_unavailable' })
    }
    log('token_bundle_loaded', {})

    let bundle = bundleResult.bundle
    const nowSeconds = Math.floor(Date.now() / 1000)
    const decision = decideTokenAction(bundle, nowSeconds)

    if (decision.action === 'reauthorization_required') {
      log('collector_failed', { stage: 'token_expiry', reason: 'refresh_token_expired' })
      return jsonResponse(res, 409, {
        ok: false,
        error: 'reauthorization_required',
        reauthorization_required: true,
        message: 'The stored refresh token has expired. Perform a fresh authorization via /tiktok-connect.',
      })
    }

    let tokenRefreshed = false
    if (decision.action === 'refresh') {
      log('token_refresh_started', {})
      const refreshResult = await refreshAccessToken(bundle.refresh_token)
      if (!refreshResult.ok) {
        log('token_refresh_failed', {
          reason: refreshResult.reason,
          http_status: refreshResult.diag?.httpStatus ?? refreshResult.httpStatus ?? null,
          error: refreshResult.diag?.error ?? null,
          error_description: refreshResult.diag?.errorDescription ?? null,
          log_id: refreshResult.diag?.logId ?? null,
        })
        return jsonResponse(res, 502, { ok: false, stage: 'token_refresh', error: 'token_refresh_failed' })
      }

      const validation = validateRefreshedBundle(refreshResult.tokenJson, bundle.open_id)
      if (!validation.ok) {
        log('token_refresh_failed', { reason: validation.reason })
        return jsonResponse(res, 502, { ok: false, stage: 'token_refresh', error: 'token_refresh_failed' })
      }

      const persistResult = await persistTokenBundle(validation.bundle)
      if (!persistResult.ok) {
        // TikTok may already have rotated the refresh token server-side; if we
        // fail to persist here we must not proceed, or our durable state goes
        // stale relative to what TikTok now considers valid.
        log('token_refresh_persist_failed', { reason: persistResult.reason })
        return jsonResponse(res, 502, { ok: false, stage: 'token_refresh', error: 'token_persist_failed' })
      }

      log('token_refresh_succeeded', {})
      bundle = validation.bundle
      tokenRefreshed = true
    }

    const videoResult = await collectVideos(bundle.access_token)
    if (!videoResult.ok) {
      log('collector_failed', {
        stage: 'video_list',
        reason: videoResult.reason,
        http_status: videoResult.httpStatus ?? null,
        pages_fetched: videoResult.pagesFetched ?? 0,
      })
      return jsonResponse(res, 502, {
        ok: false,
        stage: 'video_list',
        error: videoResult.reason,
        http_status: videoResult.httpStatus ?? null,
      })
    }

    const responseVideos = videoResult.videos.map(v => ({
      video_id: v.id ?? null,
      title: v.title ?? null,
      video_description: v.video_description ?? null,
      create_time: v.create_time ?? null,
      duration: v.duration ?? null,
      share_url: v.share_url ?? null,
      views: v.view_count ?? null,
      likes: v.like_count ?? null,
      comments: v.comment_count ?? null,
      shares: v.share_count ?? null,
    }))

    log('collector_success', {
      token_refreshed: tokenRefreshed,
      video_count: responseVideos.length,
      pages_fetched: videoResult.pagesFetched,
      truncated: videoResult.truncated,
    })

    return jsonResponse(res, 200, {
      ok: true,
      token_refreshed: tokenRefreshed,
      videos_returned: responseVideos.length,
      pages_fetched: videoResult.pagesFetched,
      truncated: videoResult.truncated,
      collected_at: new Date().toISOString(),
      videos: responseVideos,
    })
  } finally {
    await releaseCollectorLock(executionId)
  }
}
