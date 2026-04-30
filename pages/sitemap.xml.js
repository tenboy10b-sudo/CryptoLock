import { getAllPosts, getAllTags } from '../lib/posts'
import siteConfig from '../site.config'

function getPublishedPosts() {
  const now = new Date()
  return getAllPosts().filter(post => {
    const pd = post.publishDate || post.date
    if (!pd) return true
    return new Date(pd) <= now
  })
}

function generateSitemap(posts, tags) {
  const SITE = siteConfig.url
  const today = new Date().toISOString()

  const staticPages = [
    { url: '',         priority: '1.0', changefreq: 'daily'   },
    { url: '/tags',    priority: '0.6', changefreq: 'weekly'  },
    { url: '/about',   priority: '0.4', changefreq: 'monthly' },
    { url: '/privacy', priority: '0.3', changefreq: 'monthly' },
  ]

  const tagPages = tags.map(({ tag }) => ({
    url: `/tags/${encodeURIComponent(tag)}`,
    priority: '0.6',
    changefreq: 'weekly',
    lastmod: today,
  }))

  // Хелпер для запису URL з hreflang
  const urlEntry = (ukUrl, lastmod, priority, changefreq) => {
    const enUrl = ukUrl === '' ? `${SITE}/en` : `${SITE}/en${ukUrl}`
    return `  <url>
    <loc>${SITE}${ukUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <xhtml:link rel="alternate" hreflang="uk" href="${SITE}${ukUrl}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${ukUrl}"/>
  </url>`
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${staticPages.map(p => urlEntry(p.url, today, p.priority, p.changefreq)).join('\n')}
${tagPages.map(p => urlEntry(p.url, p.lastmod, p.priority, p.changefreq)).join('\n')}
${posts.map(post => urlEntry(
  `/${post.slug}`,
  post.date || today,
  '0.9',
  'monthly'
)).join('\n')}
</urlset>`
}

export default function Sitemap() {
  return null
}

export async function getServerSideProps({ res }) {
  const posts = getPublishedPosts()
  const tags = getAllTags()
  const sitemap = generateSitemap(posts, tags)

  res.setHeader('Content-Type', 'text/xml')
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400')
  res.write(sitemap)
  res.end()

  return { props: {} }
}
