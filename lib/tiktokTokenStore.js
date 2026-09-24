// Server-side persistence for the TikTok Sandbox OAuth token bundle, using the
// Upstash Redis store connected to this Vercel project (crypto-lock). This is
// the ONLY place in the codebase that talks to Redis for TikTok. Never stores
// client_key/client_secret/authorization code/CSRF state/cookies — only the
// fields TikTok itself returns in a successful token response.
import { Redis } from '@upstash/redis'

export const TOKEN_BUNDLE_KEY = 'cryptolock:tiktok:token_bundle:v1'

// Structural validation of TikTok's token-exchange response, done before any
// Redis call. Pure/no I/O so it's testable without mocking fetch. Returns the
// prepared bundle (never the raw tokenJson) so callers can't accidentally
// persist unvalidated/extra fields.
export function validateTokenBundle(tokenJson) {
  if (!tokenJson || typeof tokenJson !== 'object') {
    return { ok: false, reason: 'not_an_object' }
  }
  const { access_token, refresh_token, expires_in, refresh_expires_in, scope, token_type, open_id } = tokenJson

  if (typeof access_token !== 'string' || !access_token) {
    return { ok: false, reason: 'missing_access_token' }
  }
  if (typeof refresh_token !== 'string' || !refresh_token) {
    return { ok: false, reason: 'missing_refresh_token' }
  }
  if (typeof expires_in !== 'number' || !Number.isFinite(expires_in) || expires_in <= 0) {
    return { ok: false, reason: 'invalid_expires_in' }
  }
  if (typeof refresh_expires_in !== 'number' || !Number.isFinite(refresh_expires_in) || refresh_expires_in <= 0) {
    return { ok: false, reason: 'invalid_refresh_expires_in' }
  }

  const nowSeconds = Math.floor(Date.now() / 1000)
  const bundle = {
    schema_version: 1,
    access_token,
    refresh_token,
    access_token_expires_at: nowSeconds + expires_in,
    refresh_token_expires_at: nowSeconds + refresh_expires_in,
    scope: typeof scope === 'string' ? scope : '',
    token_type: typeof token_type === 'string' ? token_type : 'Bearer',
    open_id: typeof open_id === 'string' ? open_id : null,
    updated_at: new Date().toISOString(),
  }
  return { ok: true, bundle }
}

function getRedisClient() {
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  // Auto-pipelining batches multiple commands into one /pipeline HTTP call; we
  // only ever issue one SET per request, so disable it for a direct, predictable
  // single command per persist call.
  return new Redis({ url, token, enableAutoPipelining: false })
}

// Persists an already-validated bundle (from validateTokenBundle) as one JSON
// string under a single fixed key, via one Redis SET. Fails closed: any
// missing env var or Redis-level error returns { ok: false } without ever
// throwing the underlying exception (which could contain URLs/headers) up to
// the caller or a log line.
export async function persistTokenBundle(bundle) {
  const redis = getRedisClient()
  if (!redis) {
    return { ok: false, reason: 'missing_redis_env' }
  }
  try {
    await redis.set(TOKEN_BUNDLE_KEY, JSON.stringify(bundle))
    return { ok: true }
  } catch (e) {
    return { ok: false, reason: 'redis_write_error' }
  }
}
