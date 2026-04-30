/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {},

  // i18n — українська за замовчуванням, /en/ для англійської
  i18n: {
    locales: ['uk', 'en'],
    defaultLocale: 'uk',
    localeDetection: false, // вимкнено — не редиректить автоматично, користувач сам обирає
  },

  // Заголовки безпеки
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },

  // 301 редирект зі старого домену на новий
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'crypto-lock-five.vercel.app' }],
        destination: 'https://cryptolockua.com/:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
