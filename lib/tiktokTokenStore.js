// Server-side persistence for the TikTok Sandbox OAuth token bundle, using the
// Upstash Redis store connected to this Vercel project (crypto-lock). This is
// the ONLY place in the codebase that talks to Redis for TikTok. Never stores
// client_key/client_secret/authorization code/CSRF state/cookies — only the
// fields TikTok itself returns in a successful token response.
import { Redis } from '@upstash/redis'

export const TOKEN_BUNDLE_KEY = 'cryptolock:tiktok:token_bundle:v1'
export const COLLECTOR_LOCK_KEY = 'cryptolock:tiktok:collector_lock:v1'
const COLLECTOR_LOCK_TTL_SECONDS = 120

// Fields a stored bundle must have to be considered usable. open_id/token_type
// are checked for presence, not truthiness — open_id can legitimately be null
// (TikTok didn't return one) and is still a "present" field.
const REQUIRED_BUNDLE_FIELDS = [
  'schema_version', 'access_token', 'refresh_token',
  'access_token_expires_at', 'refresh_token_expires_at',
  'scope', 'token_type', 'open_id',
]

export const REQUIRED_SCOPES = ['user.info.basic', 'video.list']

function isValidTokenType(value) {
  return typeof value === 'string' && value.toLowerCase() === 'bearer'
}

function isValidOpenId(value) {
  return value === null || (typeof value === 'string' && value.length > 0)
}

export function hasRequiredScopes(scopeString) {
  if (typeof scopeString !== 'string') return false
  const granted = scopeString.split(',').map(s => s.trim()).filter(Boolean)
  return REQUIRED_SCOPES.every(s => granted.includes(s))
}

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
  if (!isValidTokenType(token_type)) {
    return { ok: false, reason: 'invalid_token_type' }
  }
  if (!isValidOpenId(open_id)) {
    return { ok: false, reason: 'invalid_open_id' }
  }

  const nowSeconds = Math.floor(Date.now() / 1000)
  const bundle = {
    schema_version: 1,
    access_token,
    refresh_token,
    access_token_expires_at: nowSeconds + expires_in,
    refresh_token_expires_at: nowSeconds + refresh_expires_in,
    scope: typeof scope === 'string' ? scope : '',
    token_type: 'Bearer', // normalized casing now that it's been validated case-insensitively
    open_id,
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

// Reads the stored bundle back. @upstash/redis's default deserializer tries to
// JSON.parse a string result automatically, so a normal GET already returns an
// object here — but this defensively accepts either an already-decoded object
// or a raw JSON string, since that behavior isn't a contract we should rely on.
// Never logs bundle contents. Never deletes a malformed bundle — that's a
// decision for a human, not for this code to make silently.
export async function loadTokenBundle() {
  const redis = getRedisClient()
  if (!redis) {
    return { ok: false, reason: 'missing_redis_env' }
  }

  let raw
  try {
    raw = await redis.get(TOKEN_BUNDLE_KEY)
  } catch (e) {
    return { ok: false, reason: 'redis_read_error' }
  }

  if (raw === null || raw === undefined) {
    return { ok: false, reason: 'not_found' }
  }

  let bundle
  if (typeof raw === 'string') {
    try {
      bundle = JSON.parse(raw)
    } catch (e) {
      return { ok: false, reason: 'malformed' }
    }
  } else if (typeof raw === 'object') {
    bundle = raw
  } else {
    return { ok: false, reason: 'malformed' }
  }

  if (!bundle || typeof bundle !== 'object') {
    return { ok: false, reason: 'malformed' }
  }
  for (const field of REQUIRED_BUNDLE_FIELDS) {
    if (!(field in bundle)) {
      return { ok: false, reason: 'malformed' }
    }
  }
  if (bundle.schema_version !== 1) {
    return { ok: false, reason: 'malformed' }
  }
  if (typeof bundle.access_token !== 'string' || !bundle.access_token) {
    return { ok: false, reason: 'malformed' }
  }
  if (typeof bundle.refresh_token !== 'string' || !bundle.refresh_token) {
    return { ok: false, reason: 'malformed' }
  }
  if (
    typeof bundle.access_token_expires_at !== 'number' ||
    !Number.isFinite(bundle.access_token_expires_at) ||
    bundle.access_token_expires_at <= 0
  ) {
    return { ok: false, reason: 'malformed' }
  }
  if (
    typeof bundle.refresh_token_expires_at !== 'number' ||
    !Number.isFinite(bundle.refresh_token_expires_at) ||
    bundle.refresh_token_expires_at <= 0
  ) {
    return { ok: false, reason: 'malformed' }
  }
  if (!hasRequiredScopes(bundle.scope)) {
    return { ok: false, reason: 'malformed' }
  }
  if (!isValidTokenType(bundle.token_type)) {
    return { ok: false, reason: 'malformed' }
  }
  if (!isValidOpenId(bundle.open_id)) {
    return { ok: false, reason: 'malformed' }
  }

  return { ok: true, bundle }
}

// Acquire the single-run collector lock with SET NX + TTL. The stored value is
// the caller's random execution ID, so releaseCollectorLock can later verify
// ownership before deleting (see below) instead of blindly clearing a lock
// that may since belong to a different run.
export async function acquireCollectorLock(executionId) {
  const redis = getRedisClient()
  if (!redis) {
    return { ok: false, reason: 'missing_redis_env' }
  }
  try {
    const result = await redis.set(COLLECTOR_LOCK_KEY, executionId, { nx: true, ex: COLLECTOR_LOCK_TTL_SECONDS })
    if (result === null || result === undefined) {
      return { ok: false, reason: 'locked' }
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, reason: 'redis_error' }
  }
}

// Atomic compare-and-delete: only removes the lock if it still holds this
// execution's own ID. Never blindly DELs, since TTL expiry may have already
// let a different run acquire the lock by the time this runs. Best-effort —
// swallows its own errors since this only ever runs as cleanup in a finally
// block, and the TTL is the real safety net if release itself fails.
export async function releaseCollectorLock(executionId) {
  const redis = getRedisClient()
  if (!redis) return
  const script = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `
  try {
    await redis.eval(script, [COLLECTOR_LOCK_KEY], [executionId])
  } catch (e) {
    // Cleanup only — the lock's own TTL guarantees it self-clears eventually.
  }
}
