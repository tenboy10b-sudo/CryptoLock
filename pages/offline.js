// pages/offline.js
export default function Offline() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#0f172a', color: '#f1f5f9', fontFamily: 'sans-serif',
      padding: '2rem', textAlign: 'center'
    }}>
      <div style={{ fontSize: '64px', marginBottom: '1.5rem' }}>🔒</div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>
        Crypto<span style={{ color: '#2563eb' }}>Lock</span>
      </h1>
      <p style={{ color: 'var(--faint,#94a3b8)', fontSize: '1rem', maxWidth: '360px', lineHeight: 1.6 }}>
        Немає підключення до інтернету. Раніше переглянуті статті доступні в кеші.
      </p>
      <button
        onClick={() => window.history.back()}
        style={{
          marginTop: '2rem', padding: '0.75rem 2rem',
          background: '#2563eb', color: '#fff', border: 'none',
          borderRadius: '10px', fontSize: '0.9rem', cursor: 'pointer'
        }}
      >
        ← Назад
      </button>
    </div>
  )
}
