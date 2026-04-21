// ============================================================
// ЗМІНЮЙ ЦЕЙ ФАЙЛ ДЛЯ КОЖНОГО НОВОГО САЙТУ В СІТЦІ
// ============================================================

const siteConfig = {
  // Назва сайту
  name: 'PCTips.ua',

  // Домен (без слешу в кінці)
  url: 'https://pctips.ua',

  // Опис для SEO / OG
  description: 'Покрокові гайди по налаштуванню Windows, безпеці та оптимізації ПК українською мовою.',

  // Мова
  language: 'uk',

  // Google AdSense ID (залиш порожнім поки не підтвердять)
  adsenseId: '',

  // Google Analytics 4 ID (залиш порожнім якщо не треба)
  gaId: '',

  // Кількість статей на головній
  postsPerPage: 10,

  // Соцмережі (залиш порожнім якщо нема)
  social: {
    telegram: 'https://t.me/your_channel',
    tiktok: '',
  },

  // Навігація
  nav: [
    { label: 'Статті', href: '/' },
    { label: 'Теги', href: '/tags' },
    { label: 'Про нас', href: '/about' },
  ],
}

module.exports = siteConfig
