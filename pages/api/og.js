// pages/api/og.js
// Динамічні OG зображення для статей CryptoLock
// URL: /api/og?title=Назва&tags=tag1,tag2&lang=uk

import { ImageResponse } from 'next/og'

export const config = { runtime: 'edge' }

export default async function handler(req) {
  const { searchParams } = new URL(req.url)

  const title   = searchParams.get('title')  || 'CryptoLock'
  const tags    = (searchParams.get('tags')  || '').split(',').filter(Boolean).slice(0, 3)
  const lang    = searchParams.get('lang')   || 'uk'
  const isEn    = lang === 'en'

  // Скорочуємо довгий заголовок
  const shortTitle = title.length > 65 ? title.slice(0, 62) + '...' : title

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: '#0f172a',
          padding: '60px',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Декоративний градієнт */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.3) 0%, transparent 70%)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-80px',
          left: '-80px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* Верхня лінія */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          height: '4px',
          background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
          display: 'flex',
        }} />

        {/* Логотип і бренд */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '40px',
        }}>
          {/* Shield іконка */}
          <div style={{
            width: '44px',
            height: '44px',
            background: 'rgba(37,99,235,0.2)',
            border: '1px solid rgba(37,99,235,0.4)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
          }}>
            🔒
          </div>
          <span style={{
            fontSize: '22px',
            fontWeight: '700',
            color: '#e2e8f0',
            letterSpacing: '-0.5px',
          }}>
            Crypto<span style={{ color: '#2563eb' }}>Lock</span>
          </span>
          <span style={{
            fontSize: '14px',
            color: '#475569',
            marginLeft: '4px',
          }}>
            cryptolockua.com
          </span>
        </div>

        {/* Заголовок статті */}
        <div style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <p style={{
            fontSize: shortTitle.length > 45 ? '38px' : '48px',
            fontWeight: '700',
            color: '#f1f5f9',
            lineHeight: '1.2',
            margin: '0 0 32px 0',
            maxWidth: '900px',
          }}>
            {shortTitle}
          </p>

          {/* Теги */}
          {tags.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {tags.map((tag, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '16px',
                    color: '#93c5fd',
                    background: 'rgba(37,99,235,0.15)',
                    border: '1px solid rgba(37,99,235,0.3)',
                    borderRadius: '6px',
                    padding: '5px 14px',
                    fontFamily: 'monospace',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Нижній рядок */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '20px',
          marginTop: '20px',
        }}>
          <span style={{ fontSize: '15px', color: '#475569' }}>
            {isEn ? 'Windows Security & Administration' : 'Безпека та адміністрування Windows'}
          </span>
          <span style={{
            fontSize: '14px',
            color: '#2563eb',
            background: 'rgba(37,99,235,0.1)',
            border: '1px solid rgba(37,99,235,0.2)',
            borderRadius: '6px',
            padding: '4px 12px',
          }}>
            {isEn ? 'Read article →' : 'Читати статтю →'}
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
