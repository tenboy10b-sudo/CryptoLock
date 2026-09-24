// TikTok Sandbox OAuth smoke test — step 1: redirect to TikTok's authorize screen.
// Never touches TIKTOK_CLIENT_SECRET — that stays server-side-only in callback.js.
import crypto from 'crypto'
import { serializeStateCookie } from '../../../lib/tiktokAuth'

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  const { TIKTOK_CLIENT_KEY, TIKTOK_REDIRECT_URI } = process.env
  const missing = ['TIKTOK_CLIENT_KEY', 'TIKTOK_REDIRECT_URI'].filter(k => !process.env[k])
  if (missing.length) {
    return res.status(500).json({ error: `missing env vars: ${missing.join(', ')}` })
  }

  const state = crypto.randomBytes(24).toString('hex')
  res.setHeader('Set-Cookie', serializeStateCookie(state))

  const params = new URLSearchParams({
    client_key: TIKTOK_CLIENT_KEY,
    scope: 'user.info.basic,video.list',
    response_type: 'code',
    redirect_uri: TIKTOK_REDIRECT_URI,
    state,
  })

  res.redirect(302, `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`)
}
