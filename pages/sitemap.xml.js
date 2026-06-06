import { getAllPosts, getAllTags } from '../lib/posts'
import siteConfig from '../site.config'


// Топ сторінки з GSC — підвищений пріоритет
const HIGH_PRIORITY = new Set([
  'zaborona-zapusku-prohram-gpo',
  'obmezhennya-kilkosti-sprob-parolyu',
  'yak-nalashtuvanty-virtualnyi-stol-windows',
  'yak-pereviryt-yadro-windows-bezpechno',
  'applocker-gpo-nalashtuvannya',
  'yak-nalashtuvanty-spilnyy-dostup-do-papky',
  'cmd-komandy-dlya-perevirky-dysku',
  'yak-pidklyuchyty-dva-monitory-windows',
  'yak-nalashtuvanty-avtomatychne-blokuvannya-windows',
  'yak-zashyfruvaty-dysk-bitlocker',
  'siniy-ekran-pislya-onovlennya-windows-11',
  'windows-11-ne-zapuskaetsya-yak-vypravyty',
])

function getPublishedPosts() {
  const now = new Date()
  return getAllPosts().filter(post => {
    const pd = post.publishDate || post.date
    if (!pd) return true
    return new Date(pd) <= now
  })
}

function generateSitemap(posts, enPosts, tags) {
  const SITE = siteConfig.url
  const today = new Date().toISOString()

  const staticPages = [
    { url: '',                            priority: '1.0', changefreq: 'daily'   },
    { url: '/tools',                      priority: '0.9', changefreq: 'weekly'  },
    { url: '/tools/auditshield',          priority: '0.9', changefreq: 'weekly'  },
    { url: '/tools/windows-error-decoder',priority: '0.8', changefreq: 'monthly' },
    { url: '/tools/powershell-commands',  priority: '0.8', changefreq: 'monthly' },
    { url: '/tools/windows-event-id',     priority: '0.8', changefreq: 'monthly' },
    { url: '/tools/password-generator',   priority: '0.7', changefreq: 'monthly' },
    { url: '/tools/subnet-calculator',    priority: '0.7', changefreq: 'monthly' },
    { url: '/tags',                       priority: '0.6', changefreq: 'weekly'  },
    { url: '/about',                       priority: '0.4', changefreq: 'monthly' },
    { url: '/bookmarks',                   priority: '0.3', changefreq: 'monthly' },
    { url: '/privacy',                    priority: '0.3', changefreq: 'monthly' },
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
${enPosts.map(post => {
  const enUrl = `${SITE}/en/${post.slug}`
  return `  <url>
    <loc>${enUrl}</loc>
    <lastmod>${post.updated || post.date || today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>
  </url>`
}).join('\n')}
</urlset>`
}

export default function Sitemap() {
  return null
}

export async function getServerSideProps({ res }) {
  const posts = getPublishedPosts()
  const enPosts = getAllPosts('en').filter(p => {
    const pd = p.publishDate || p.date
    if (!pd) return true
    return new Date(pd) <= new Date()
  })
  const tags = getAllTags()
  const sitemap = generateSitemap(posts, enPosts, tags)

  res.setHeader('Content-Type', 'text/xml')
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400')
  res.write(sitemap)
  res.end()

  return { props: {} }
}
