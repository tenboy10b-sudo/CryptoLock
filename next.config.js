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
      // Старі EN UK slugs → правильні EN slugs
      {
        source: '/yak-vydatyly-virus-z-windows',
        locale: false,
        has: [{ type: 'header', key: 'x-nextjs-locale', value: 'en' }],
        destination: '/en/how-to-remove-virus-windows',
        permanent: true,
      },
      {
        source: '/en/yak-vydatyly-virus-z-windows',
        destination: '/en/how-to-remove-virus-windows',
        permanent: true,
      },
      {
        source: '/en/yak-pryskoryt-windows',
        destination: '/en/how-to-speed-up-windows',
        permanent: true,
      },
      {
        source: '/en/yak-zashyfruvaty-dysk-bitlocker',
        destination: '/en/how-to-enable-bitlocker',
        permanent: true,
      },
      {
        source: '/en/nalashtuvannya-remote-desktop-rdp',
        destination: '/en/how-to-set-up-remote-desktop',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
