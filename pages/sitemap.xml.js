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
    { url: '',        priority: '1.0', changefreq: 'daily'   },
    { url: '/tags',   priority: '0.6', changefreq: 'weekly'  },
    { url: '/about',  priority: '0.4', changefreq: 'monthly' },
    { url: '/privacy',priority: '0.3', changefreq: 'monthly' },
  ]

  const tagPages = tags.map(({ tag }) => ({
    url: `/tags/${tag}`,
    priority: '0.6',
    changefreq: 'weekly',
    lastmod: today,
  }))

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(p => `  <url>
    <loc>${SITE}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
${tagPages.map(p => `  <url>
    <loc>${SITE}${p.url}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
${posts.map(post => `  <url>
    <loc>${SITE}/${post.slug}</loc>
    <lastmod>${post.updated || post.date || today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n')}
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
