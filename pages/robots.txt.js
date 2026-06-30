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
  res.write(content)
  res.end()

  return { props: {} }
}
