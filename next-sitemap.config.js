const SITE_URL = 'https://crypto-lock-five.vercel.app'

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/404'],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: 'Googlebot', allow: '/' },
      { userAgent: 'Googlebot-Image', allow: '/' },
    ],
    additionalSitemaps: [`${SITE_URL}/sitemap.xml`],
  },
  transform: async (config, path) => {
    if (path === '/') {
      return { loc: path, changefreq: 'daily', priority: 1.0, lastmod: new Date().toISOString() }
    }
    if (path.startsWith('/tags/')) {
      return { loc: path, changefreq: 'weekly', priority: 0.6, lastmod: new Date().toISOString() }
    }
    if (['about', 'privacy', 'tags'].some(p => path === '/' + p)) {
      return { loc: path, changefreq: 'monthly', priority: 0.4, lastmod: new Date().toISOString() }
    }
    // Статті
    return { loc: path, changefreq: 'monthly', priority: 0.9, lastmod: new Date().toISOString() }
  },
}
