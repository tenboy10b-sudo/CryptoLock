// pages/links.js — CryptoLock Linktree
// Стиль: dark tech / terminal aesthetic — під формат сайту

export default function Links() {
  const links = [
    {
      href:  'https://cryptolockua.com',
      label: 'CryptoLock',
      sub:   'cryptolockua.com · Гайди Windows і безпека',
      type:  'site',
    },
    {
      href:  'https://t.me/cryptolock888',
      label: 'Telegram',
      sub:   '@cryptolock888 · Канал',
      type:  'telegram',
    },
    {
      href:  'https://t.me/AuditShield_01_Bot',
      label: 'AuditShield Bot',
      sub:   '@AuditShield_01_Bot · Аудит безпеки Windows',
      type:  'bot',
    },
    {
      href:  'https://www.tiktok.com/@cryptolockua',
      label: 'TikTok',
      sub:   '@cryptolockua · Відеогайди',
      type:  'tiktok',
    },
  ]

  const icons = {
    site: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    telegram: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.01 9.47c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 14.676l-2.95-.924c-.642-.2-.654-.642.136-.953l11.52-4.44c.537-.194 1.006.131.686.889z"/>
      </svg>
    ),
    bot: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
    tiktok: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.95a8.16 8.16 0 004.77 1.52V7a4.85 4.85 0 01-1-.31z"/>
      </svg>
    ),
  }

  const accents = {
    site:     { color: '#60a5fa', glow: 'rgba(96,165,250,0.15)', border: 'rgba(96,165,250,0.25)' },
    telegram: { color: '#38bdf8', glow: 'rgba(56,189,248,0.15)', border: 'rgba(56,189,248,0.25)' },
    bot:      { color: '#a78bfa', glow: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.25)' },
    tiktok:   { color: '#f472b6', glow: 'rgba(244,114,182,0.15)', border: 'rgba(244,114,182,0.25)' },
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Unbounded:wght@700;900&display=swap');

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          background: #080d14;
          font-family: 'JetBrains Mono', monospace;
          overflow-x: hidden;
          min-height: 100vh;
        }

        /* Анімований фон — grid pattern */
        .bg-grid {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(37,99,235,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,99,235,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .bg-glow-1 {
          position: fixed;
          top: -20%;
          right: -10%;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 65%);
          pointer-events: none;
          animation: pulse 8s ease-in-out infinite;
        }

        .bg-glow-2 {
          position: fixed;
          bottom: -20%;
          left: -10%;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 65%);
          pointer-events: none;
          animation: pulse 10s ease-in-out infinite reverse;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }

        .wrapper {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 20px;
        }

        .card {
          width: 100%;
          max-width: 480px;
        }

        /* Header */
        .header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 40px;
          animation: fadeDown 0.6s ease both;
        }

        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .logo-wrap {
          position: relative;
          margin-bottom: 20px;
        }

        .logo-img {
          width: 88px;
          height: 88px;
          border-radius: 22px;
          object-fit: contain;
          display: block;
          border: 1.5px solid rgba(37,99,235,0.3);
          box-shadow:
            0 0 0 6px rgba(37,99,235,0.06),
            0 0 40px rgba(37,99,235,0.2),
            0 8px 32px rgba(0,0,0,0.5);
        }

        .logo-ring {
          position: absolute;
          inset: -8px;
          border-radius: 30px;
          border: 1px solid rgba(37,99,235,0.15);
          animation: ringPulse 3s ease-in-out infinite;
        }

        @keyframes ringPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.04); opacity: 0.5; }
        }

        .site-name {
          font-family: 'Unbounded', sans-serif;
          font-size: 26px;
          font-weight: 900;
          color: #f1f5f9;
          letter-spacing: -0.5px;
          line-height: 1;
          margin-bottom: 6px;
        }

        .site-name span { color: #3b82f6; }

        .site-tagline {
          font-size: 11px;
          color: #475569;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        /* Terminal prompt decoration */
        .prompt {
          font-size: 11px;
          color: #334155;
          margin-bottom: 20px;
          letter-spacing: 0.05em;
        }

        .prompt span { color: #3b82f6; }

        /* Link cards */
        .links {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .link-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          border-radius: 14px;
          border: 1px solid;
          text-decoration: none;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          opacity: 0;
          animation: fadeUp 0.5s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .link-item::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .link-item:hover {
          transform: translateY(-2px);
        }

        .link-item:hover::before { opacity: 1; }

        .icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          transition: background 0.2s;
        }

        .link-item:hover .icon-wrap {
          background: rgba(255,255,255,0.08);
        }

        .link-text { flex: 1; min-width: 0; }

        .link-label {
          font-size: 14px;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 2px;
          font-family: 'JetBrains Mono', monospace;
        }

        .link-sub {
          font-size: 11px;
          color: #475569;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          letter-spacing: 0.02em;
        }

        .arrow {
          flex-shrink: 0;
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity 0.2s, transform 0.2s;
        }

        .link-item:hover .arrow {
          opacity: 0.6;
          transform: translateX(0);
        }

        /* Footer */
        .footer {
          margin-top: 36px;
          text-align: center;
          font-size: 11px;
          color: #1e293b;
          letter-spacing: 0.08em;
          animation: fadeUp 0.5s 0.5s ease both;
        }

        /* Status dot */
        .status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          color: #334155;
          letter-spacing: 0.08em;
          margin-bottom: 28px;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 6px rgba(34,197,94,0.6);
          animation: blink 2s ease infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <div className="bg-grid" />
      <div className="bg-glow-1" />
      <div className="bg-glow-2" />

      <div className="wrapper">
        <div className="card">

          {/* Header */}
          <div className="header">
            <div className="logo-wrap">
              <img
                src="https://cryptolockua.com/logo.webp"
                alt="CryptoLock"
                className="logo-img"
              />
              <div className="logo-ring" />
            </div>
            <h1 className="site-name">
              Crypto<span>Lock</span>
            </h1>
            <p className="site-tagline">Security & Windows Administration</p>
          </div>

          {/* Status */}
          <div style={{ display:'flex', justifyContent:'center' }}>
            <div className="status">
              <div className="status-dot" />
              ONLINE · cryptolockua.com
            </div>
          </div>

          {/* Links */}
          <div className="links">
            {links.map((link, i) => {
              const acc = accents[link.type]
              return (
                <a
                  key={i}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-item"
                  style={{
                    background: `${acc.glow}`,
                    borderColor: acc.border,
                    animationDelay: `${0.1 + i * 0.08}s`,
                  }}
                >
                  <div
                    className="icon-wrap"
                    style={{ color: acc.color }}
                  >
                    {icons[link.type]}
                  </div>
                  <div className="link-text">
                    <div className="link-label" style={{ color: acc.color }}>
                      {link.label}
                    </div>
                    <div className="link-sub">{link.sub}</div>
                  </div>
                  <svg className="arrow" width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke={acc.color} strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </a>
              )
            })}
          </div>

          {/* Footer */}
          <div className="footer">
            © 2026 CRYPTOLOCK · ALL RIGHTS RESERVED
          </div>

        </div>
      </div>
    </>
  )
}
