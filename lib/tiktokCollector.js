// TikTok token-refresh + video.list pagination logic for the autonomous
// collector (pages/api/tiktok/collect.js). No Redis access here — all storage
// goes through lib/tiktokTokenStore.js, which stays the only file that talks
// to Redis for TikTok. Never logs/returns token values, client_secret, or
// full TikTok request/response bodies.
import { validateTokenBundle } from './tiktokTokenStore'

export const REFRESH_THRESHOLD_SECONDS = 20 * 60 // proactively refresh 20 min before expiry

const REQUIRED_SCOPES = ['user.info.basic', 'video.list']
const MAX_PAGES = 10
const MAX_VIDEOS = 200
const VIDEO_FIELDS = 'id,title,video_description,create_time,duration,share_url,view_count,like_count,comment_count,share_count'

function safeStr(value, maxLen = 300) {
  if (typeof value !== 'string' || !value) return null
  return value.length > maxLen ? value.slice(0, maxLen) + '…' : value
}

function log(event, fields = {}) {
  console.log(JSON.stringify({ event, ts: new Date().toISOString(), ...fields }))
}

// Pure decision, no I/O — easy to unit test without mocking fetch/Redis.
export function decideTokenAction(bundle, nowSeconds) {
  if (bundle.refresh_token_expires_at <= nowSeconds) {
    return { action: 'reauthorization_required' }
  }
  if (bundle.access_token_expires_at > nowSeconds + REFRESH_THRESHOLD_SECONDS) {
    return { action: 'use_existing' }
  }
  return { action: 'refresh' }
}

// Calls TikTok's refresh_token grant. Never sends redirect_uri (not required
// for a refresh). Returns the raw parsed tokenJson on success for the caller
// to validate — this function itself does not persist anything.
export async function refreshAccessToken(refreshToken) {
  const { TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET } = process.env
  if (!TIKTOK_CLIENT_KEY || !TIKTOK_CLIENT_SECRET) {
    return { ok: false, reason: 'missing_env' }
  }

  const params = new URLSearchParams({
    client_key: TIKTOK_CLIENT_KEY,
    client_secret: TIKTOK_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })

  let tokenRes
  try {
    tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cache-Control': 'no-cache' },
      body: params.toString(),
    })
  } catch (e) {
    return { ok: false, reason: 'network_error' }
  }

  let tokenJson = null
  try {
    tokenJson = await tokenRes.json()
  } catch (e) {
    tokenJson = null
  }

  if (tokenJson === null || typeof tokenJson !== 'object') {
    return { ok: false, reason: 'malformed', httpStatus: tokenRes.status }
  }

  if (!tokenRes.ok || !tokenJson.access_token) {
    return {
      ok: false,
      reason: 'tiktok_error',
      diag: {
        httpStatus: tokenRes.status,
        error: safeStr(tokenJson.error),
        errorDescription: safeStr(tokenJson.error_description),
        logId: safeStr(tokenJson.log_id),
      },
    }
  }

  return { ok: true, tokenJson }
}

// Refresh-specific validation on top of the shared structural check: the
// refreshed bundle must still carry both required scopes, and if the previous
// bundle had an open_id, the new one (when present) must match it — TikTok
// refreshing to a different account's token would be a serious, silent bug.
export function validateRefreshedBundle(tokenJson, previousOpenId) {
  const base = validateTokenBundle(tokenJson)
  if (!base.ok) return base

  const grantedScopes = (typeof tokenJson.scope === 'string' ? tokenJson.scope : '')
    .split(',').map(s => s.trim()).filter(Boolean)
  const hasAllScopes = REQUIRED_SCOPES.every(s => grantedScopes.includes(s))
  if (!hasAllScopes) {
    return { ok: false, reason: 'insufficient_scope' }
  }

  if (previousOpenId && base.bundle.open_id && previousOpenId !== base.bundle.open_id) {
    return { ok: false, reason: 'open_id_mismatch' }
  }

  return base
}

// Paginates video.list up to MAX_PAGES/MAX_VIDEOS. Stops early when TikTok
// reports has_more === false or gives no usable cursor. If the cap is hit
// while TikTok still has more, truncated is reported true rather than
// silently claiming a complete result. Any page-level failure fails the
// whole call closed — never returns a partial result as if it were success.
export async function collectVideos(accessToken) {
  let cursor
  let pagesFetched = 0
  let truncated = false
  const videos = []

  while (true) {
    const body = cursor ? { max_count: 20, cursor } : { max_count: 20 }

    let videoRes
    try {
      videoRes = await fetch(
        `https://open.tiktokapis.com/v2/video/list/?fields=${VIDEO_FIELDS}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      )
    } catch (e) {
      return { ok: false, reason: 'network_error', pagesFetched }
    }

    let videoJson = null
    try {
      videoJson = await videoRes.json()
    } catch (e) {
      videoJson = null
    }

    if (videoJson === null || typeof videoJson !== 'object') {
      return { ok: false, reason: 'malformed', httpStatus: videoRes.status, pagesFetched }
    }

    if (!videoRes.ok || (videoJson.error && videoJson.error.code && videoJson.error.code !== 'ok')) {
      return { ok: false, reason: 'tiktok_error', httpStatus: videoRes.status, pagesFetched }
    }

    const pageVideos = Array.isArray(videoJson.data?.videos) ? videoJson.data.videos : []
    videos.push(...pageVideos)
    pagesFetched++
    log('video_list_page_fetched', { page: pagesFetched, video_count: pageVideos.length })

    const hasMore = videoJson.data?.has_more === true
    const nextCursor = videoJson.data?.cursor

    if (!hasMore || nextCursor === undefined || nextCursor === null || nextCursor === '') {
      break
    }
    if (pagesFetched >= MAX_PAGES || videos.length >= MAX_VIDEOS) {
      truncated = true
      break
    }
    cursor = nextCursor
  }

  return { ok: true, videos: videos.slice(0, MAX_VIDEOS), pagesFetched, truncated }
}
