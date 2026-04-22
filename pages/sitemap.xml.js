import { getAllPosts } from '../lib/posts'
import siteConfig from '../site.config'

function generateSitemap(posts) {
  const today = new Date().toISOString()
  
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/tags', priority: '0.6', changefreq: 'weekly' },
    { url: '/about', priority: '0.4', changefreq: 'monthly' },
    { url: '/privacy', priority: '0.3', changefreq: 'monthly' },
  ]

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(p => `  <url>
    <loc>${siteConfig.url}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
${posts.map(post => `  <url>
    <loc>${siteConfig.url}/${post.slug}</loc>
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
  const posts = getAllPosts()
  const sitemap = generateSitemap(posts)
  
  res.setHeader('Content-Type', 'text/xml')
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate')
  res.write(sitemap)
  res.end()
  
  return { props: {} }
}
