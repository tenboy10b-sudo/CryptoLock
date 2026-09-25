// Writer for TikTok analytics snapshots into the private, separate
// tenboy10b-sudo/CryptoLock-analytics repository — never the public
// CryptoLock repo, never Redis. Uses ONLY process.env.ANALYTICS_GITHUB_TOKEN
// (a dedicated, least-privilege credential scoped to that repo); it must
// never fall back to process.env.GITHUB_TOKEN, which already failed a
// preflight against this repo and is used elsewhere for the public repo.
// Never logs/returns the token value, Authorization headers, or full GitHub
// request/response bodies — only safe metadata (path, operation, status).
const OWNER = 'tenboy10b-sudo'
const REPO = 'CryptoLock-analytics'
const BRANCH = 'main'

function log(event, fields = {}) {
  console.log(JSON.stringify({ event, ts: new Date().toISOString(), ...fields }))
}

// Pure validation, no I/O — the writer refuses to call GitHub at all for a
// structurally invalid snapshot.
export function validateSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return { ok: false, reason: 'not_an_object' }
  if (snapshot.schema_version !== 1) return { ok: false, reason: 'invalid_schema_version' }
  if (typeof snapshot.snapshot_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(snapshot.snapshot_date)) {
    return { ok: false, reason: 'invalid_snapshot_date' }
  }
  if (typeof snapshot.collected_at !== 'string' || Number.isNaN(Date.parse(snapshot.collected_at))) {
    return { ok: false, reason: 'invalid_collected_at' }
  }
  if (!Number.isInteger(snapshot.videos_returned) || snapshot.videos_returned < 0) {
    return { ok: false, reason: 'invalid_videos_returned' }
  }
  if (!Number.isInteger(snapshot.pages_fetched) || snapshot.pages_fetched < 0) {
    return { ok: false, reason: 'invalid_pages_fetched' }
  }
  if (typeof snapshot.truncated !== 'boolean') {
    return { ok: false, reason: 'invalid_truncated' }
  }
  if (!Array.isArray(snapshot.videos)) {
    return { ok: false, reason: 'invalid_videos_array' }
  }
  for (const video of snapshot.videos) {
    if (!video || typeof video !== 'object') return { ok: false, reason: 'invalid_video_entry' }
    if (typeof video.video_id !== 'string' || !video.video_id) return { ok: false, reason: 'missing_video_id' }
    for (const field of ['views', 'likes', 'comments', 'shares']) {
      const value = video[field]
      if (value !== null && typeof value !== 'number') return { ok: false, reason: `invalid_${field}` }
    }
  }
  return { ok: true }
}

// UTC-only by construction (getUTC* accessors) — server local timezone can
// never change which daily file a snapshot lands in.
export function deriveSnapshotPath(collectedAtIso) {
  const d = new Date(collectedAtIso)
  if (Number.isNaN(d.getTime())) return null
  const yyyy = String(d.getUTCFullYear())
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  const date = `${yyyy}-${mm}-${dd}`
  return { path: `tiktok/snapshots/${yyyy}/${mm}/${date}.json`, date }
}

function ghHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'CryptoLock-analytics-writer',
  }
}

async function getExistingFile(token, path) {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`,
    { headers: ghHeaders(token) }
  )
  if (res.status === 404) return { exists: false }
  if (res.status === 200) {
    const json = await res.json().catch(() => null)
    if (json && typeof json.sha === 'string') return { exists: true, sha: json.sha }
    return { exists: false, malformed: true }
  }
  return { exists: false, error: true, status: res.status }
}

async function putFile(token, path, content, message, sha) {
  const body = {
    message,
    content: Buffer.from(content, 'utf-8').toString('base64'),
    branch: BRANCH,
  }
  if (sha) body.sha = sha
  return fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: { ...ghHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// Create-or-update one canonical file per UTC day. First run that day creates
// it (404 -> PUT without sha); a later run the same day updates the exact
// same path (200 -> PUT with the current sha). A write conflict (another
// writer raced us between GET and PUT) gets exactly one re-read + one retry,
// never an unbounded loop.
export async function writeSnapshot(snapshot) {
  const validation = validateSnapshot(snapshot)
  if (!validation.ok) {
    log('analytics_snapshot_failed', { reason: validation.reason })
    return { ok: false, reason: validation.reason }
  }

  const token = process.env.ANALYTICS_GITHUB_TOKEN
  if (!token) {
    log('analytics_snapshot_failed', { reason: 'missing_analytics_github_token' })
    return { ok: false, reason: 'missing_analytics_github_token' }
  }

  const derived = deriveSnapshotPath(snapshot.collected_at)
  if (!derived) {
    log('analytics_snapshot_failed', { reason: 'invalid_collected_at' })
    return { ok: false, reason: 'invalid_collected_at' }
  }
  const { path, date } = derived
  const content = JSON.stringify(snapshot, null, 2) + '\n'

  log('analytics_snapshot_lookup', { path })
  let existing
  try {
    existing = await getExistingFile(token, path)
  } catch (e) {
    log('analytics_snapshot_failed', { reason: 'github_read_error', path })
    return { ok: false, reason: 'github_read_error' }
  }
  if (existing.error) {
    log('analytics_snapshot_failed', { reason: 'github_read_error', path, http_status: existing.status })
    return { ok: false, reason: 'github_read_error', httpStatus: existing.status }
  }
  if (existing.malformed) {
    log('analytics_snapshot_failed', { reason: 'github_read_malformed', path })
    return { ok: false, reason: 'github_read_malformed' }
  }

  const operation = existing.exists ? 'update' : 'create'
  const message = existing.exists
    ? `analytics(tiktok): update snapshot ${date}`
    : `analytics(tiktok): snapshot ${date}`
  log(existing.exists ? 'analytics_snapshot_update' : 'analytics_snapshot_create', { path })

  let putRes
  try {
    putRes = await putFile(token, path, content, message, existing.exists ? existing.sha : undefined)
  } catch (e) {
    log('analytics_snapshot_failed', { reason: 'github_write_error', path, operation })
    return { ok: false, reason: 'github_write_error' }
  }

  if (putRes.status === 200 || putRes.status === 201) {
    const putJson = await putRes.json().catch(() => null)
    log('analytics_snapshot_written', { path, operation, conflict_retry: false })
    return {
      ok: true,
      status: existing.exists ? 'updated' : 'created',
      path,
      commitSha: putJson?.commit?.sha ?? null,
    }
  }

  // Conflict: something else wrote to this exact path between our GET and PUT
  // (the collector's Redis lock already prevents normal parallel runs, but
  // this stays independently retry-safe). One re-read, one retry, no loop.
  if (putRes.status === 409 || putRes.status === 422) {
    let retryExisting
    try {
      retryExisting = await getExistingFile(token, path)
    } catch (e) {
      log('analytics_snapshot_failed', { reason: 'github_conflict_reread_error', path })
      return { ok: false, reason: 'github_conflict_reread_error' }
    }
    if (!retryExisting.exists) {
      log('analytics_snapshot_failed', { reason: 'github_conflict_unresolved', path })
      return { ok: false, reason: 'github_conflict_unresolved' }
    }
    let retryRes
    try {
      retryRes = await putFile(token, path, content, `analytics(tiktok): update snapshot ${date}`, retryExisting.sha)
    } catch (e) {
      log('analytics_snapshot_failed', { reason: 'github_conflict_retry_error', path })
      return { ok: false, reason: 'github_conflict_retry_error' }
    }
    if (retryRes.status === 200 || retryRes.status === 201) {
      const retryJson = await retryRes.json().catch(() => null)
      log('analytics_snapshot_written', { path, operation: 'update', conflict_retry: true })
      return {
        ok: true,
        status: 'updated',
        path,
        commitSha: retryJson?.commit?.sha ?? null,
      }
    }
    log('analytics_snapshot_failed', { reason: 'github_conflict_retry_failed', path, http_status: retryRes.status })
    return { ok: false, reason: 'github_conflict_retry_failed', httpStatus: retryRes.status }
  }

  log('analytics_snapshot_failed', { reason: 'github_write_failed', path, http_status: putRes.status })
  return { ok: false, reason: 'github_write_failed', httpStatus: putRes.status }
}
