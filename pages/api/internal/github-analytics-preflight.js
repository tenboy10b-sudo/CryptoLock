// TEMPORARY diagnostic endpoint — verifies the production GITHUB_TOKEN can
// read the private tenboy10b-sudo/CryptoLock-analytics repo before the
// TikTok analytics snapshot writer is implemented. Read-only: never creates,
// updates, or deletes any file in that repo. Removed immediately after use —
// see CryptoLock DOCUMENTATION.md for the dated record of this preflight.
// Never returns/logs/hashes/prefixes GITHUB_TOKEN or ANALYTICS_PREFLIGHT_SECRET.
const OWNER = 'tenboy10b-sudo'
const REPO = 'CryptoLock-analytics'

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false })
  }

  const PREFLIGHT_SECRET = process.env.ANALYTICS_PREFLIGHT_SECRET
  if (!PREFLIGHT_SECRET) {
    return res.status(500).json({ ok: false })
  }

  const authHeader = req.headers.authorization || ''
  const match = /^Bearer\s+(.+)$/.exec(authHeader)
  const provided = match ? match[1] : null
  if (!provided || !safeEqual(provided, PREFLIGHT_SECRET)) {
    return res.status(401).json({ ok: false })
  }

  const token = process.env.GITHUB_TOKEN
  if (!token) {
    return res.status(500).json({ ok: false })
  }

  const ghHeaders = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'CryptoLock-analytics-preflight',
  }

  let repoAccess = false
  let isPrivate = null
  let defaultBranchIsMain = null
  let writePermission = false
  let pullPermission = false

  try {
    const repoRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}`, { headers: ghHeaders })
    if (repoRes.status === 200) {
      const repoJson = await repoRes.json().catch(() => null)
      if (repoJson && typeof repoJson === 'object') {
        repoAccess = true
        isPrivate = repoJson.private === true
        defaultBranchIsMain = repoJson.default_branch === 'main'
        if (repoJson.permissions && typeof repoJson.permissions === 'object') {
          writePermission = repoJson.permissions.push === true
          pullPermission = repoJson.permissions.pull === true
        }
      }
    }
  } catch (e) {
    // repoAccess stays false
  }

  let readAccess = false
  try {
    const contentRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/README.md?ref=main`,
      { headers: ghHeaders }
    )
    readAccess = contentRes.status === 200
  } catch (e) {
    // readAccess stays false
  }

  const ok = repoAccess && isPrivate === true && defaultBranchIsMain === true && readAccess && pullPermission

  return res.status(200).json({
    ok,
    repo_access: repoAccess,
    private: isPrivate,
    read_access: readAccess,
    write_permission: writePermission,
  })
}
