import Head from 'next/head'

// Internal/temporary TikTok Sandbox OAuth smoke-test page. Not linked from
// navigation/footer/sitemap anywhere — reachable only by knowing this exact URL.
export default function TikTokConnect() {
  return (
    <>
      <Head>
        <title>TikTok Connect — internal test</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div style={styles.wrap}>
        <div style={styles.card}>
          <h1 style={styles.title}>Connect CryptoLock TikTok</h1>
          <p style={styles.note}>
            Internal Sandbox smoke test (Login Kit — user.info.basic, video.list).
            Not a public feature.
          </p>
          <a href="/api/tiktok/login" style={styles.button}>Login with TikTok</a>
        </div>
      </div>
    </>
  )
}

const styles = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f172a',
    padding: '20px',
  },
  card: {
    maxWidth: '420px',
    width: '100%',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '28px 32px',
    textAlign: 'center',
  },
  title: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#e2e8f0',
    margin: '0 0 8px',
  },
  note: {
    fontSize: '13px',
    color: '#94a3b8',
    margin: '0 0 20px',
    lineHeight: 1.5,
  },
  button: {
    display: 'inline-block',
    padding: '10px 20px',
    borderRadius: '8px',
    background: '#e2e8f0',
    color: '#0f172a',
    fontWeight: 600,
    fontSize: '14px',
    textDecoration: 'none',
  },
}
