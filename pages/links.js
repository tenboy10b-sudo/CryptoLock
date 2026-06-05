// pages/links.js
// Сторінка-лінктрі — НЕ в навігації, НЕ в sitemap
// URL: cryptolockua.com/links

export default function Links() {
  const links = [
    {
      href:    'https://cryptolockua.com',
      label:   'CryptoLock',
      sub:     'cryptolockua.com',
      icon:    '🔒',
      color:   '#2563eb',
      bg:      '#eff6ff',
      border:  '#bfdbfe',
    },
    {
      href:    'https://t.me/cryptolock888',
      label:   'Telegram канал',
      sub:     '@cryptolock888',
      icon:    '✈️',
      color:   '#0088cc',
      bg:      '#e8f4fd',
      border:  '#93c5fd',
    },
    {
      href:    'https://t.me/AuditShield_01_Bot',
      label:   'AuditShield Bot',
      sub:     '@AuditShield_01_Bot · Аудит безпеки Windows',
      icon:    '🛡️',
      color:   '#7c3aed',
      bg:      '#f5f3ff',
      border:  '#c4b5fd',
    },
    {
      href:    'https://www.tiktok.com/@cryptolockua',
      label:   'TikTok',
      sub:     '@cryptolockua',
      icon:    '🎵',
      color:   '#000000',
      bg:      '#f8fafc',
      border:  '#e2e8f0',
    },
  ]

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .link-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          border-radius: 16px;
          border: 1.5px solid;
          text-decoration: none;
          transition: transform 0.15s, box-shadow 0.15s;
          animation: fadeUp 0.4s ease both;
        }
        .link-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }
        .link-card:active { transform: translateY(0); }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}>

        {/* Декоративне коло */}
        <div style={{
          position: 'fixed', top: '-200px', right: '-200px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'fixed', bottom: '-150px', left: '-150px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ width: '100%', maxWidth: '460px', position: 'relative' }}>

          {/* Аватар / лого */}
          <div style={{ textAlign: 'center', marginBottom: '32px', animation: 'fadeUp 0.3s ease' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '20px',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '36px', margin: '0 auto 16px',
              boxShadow: '0 8px 32px rgba(37,99,235,0.3)',
            }}>
              🔒
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px' }}>
              CryptoLock
            </h1>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px', lineHeight: 1.5 }}>
              Безпека та адміністрування Windows
            </p>
          </div>

          {/* Лінки */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {links.map((link, i) => (
              <a
                key={i}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="link-card"
                style={{
                  background:   link.bg,
                  borderColor:  link.border,
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                {/* Іконка */}
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}>
                  {link.icon}
                </div>

                {/* Текст */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: link.color }}>
                    {link.label}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {link.sub}
                  </div>
                </div>

                {/* Стрілка */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={link.color} strokeWidth="2.5" style={{ flexShrink: 0, opacity: 0.6 }}>
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            ))}
          </div>

          {/* Footer */}
          <p style={{ textAlign: 'center', marginTop: '40px', fontSize: '12px', color: '#475569' }}>
            © 2026 CryptoLock
          </p>

        </div>
      </div>
    </>
  )
}
