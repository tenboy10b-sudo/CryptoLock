const SITE_URL = 'https://cryptolockua.com'

const siteConfig = {
  name: 'CryptoLock',
  domain: 'cryptolockua.com',
  url: SITE_URL,
  description: 'Покрокові гайди з налаштування Windows, інформаційної безпеки та захисту ПК українською мовою.',
  language: 'uk',
  adsenseId: '',
  gaId: 'G-FQJ7326JW0',
  googleVerification: '', // вставити код з Google Search Console
  postsPerPage: 10,
  social: {
    telegram: 'https://t.me/cryptolock888',
    tiktok: 'https://www.tiktok.com/@cryptolock_01',
    youtube: 'https://youtube.com/@cryptolock_01',
  },
  nav: [
    { label: 'Статті', href: '/' },
    { label: 'Теги', href: '/tags' },
    { label: 'Про нас', href: '/about' },
  ],
}

module.exports = siteConfig