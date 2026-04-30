/** @type {import('next').NextConfig} */
const nextConfig = {
  // Прибрано unoptimized:true — Next.js тепер оптимізує зображення (WebP, lazy load, srcset)
  // Це покращує LCP і Core Web Vitals
  images: {},

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