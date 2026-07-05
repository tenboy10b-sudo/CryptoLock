import siteConfig from '../site.config'

export default function Robots() {
  return null
}

export async function getServerSideProps({ res }) {
  const content = `User-agent: *
Allow: /
Disallow: /api/

# Заблокувати індексацію службових папок Next.js
Disallow: /_next/

Sitemap: ${siteConfig.url}/sitemap.xml`

  res.setHeader('Content-Type', 'text/plain')
  // robots.txt не змінюється між запитами — кешуємо на CDN, щоб не виконувати
  // serverless-функцію при кожному зверненні Googlebot (ймовірна причина
  // "Висока частота помилок" при отриманні robots.txt в GSC → Статистика сканування)
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400')
  res.write(content)
  res.end()

  return { props: {} }
}
