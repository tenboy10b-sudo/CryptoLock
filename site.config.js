const SITE_URL = 'https://cryptolockua.com'

const siteConfig = {
  name: 'CryptoLock',
  domain: 'cryptolockua.com',
  url: SITE_URL,
  description: 'Покрокові гайди з Windows 10 і 11, безпеки, адміністрування ПК та інструментів розробника. PowerShell, GPO, BitLocker, Git, VirtualBox — українською.',
  language: 'uk',
  adsenseId: '',
  gaId: 'G-FV18M8XP3S',
  googleVerification: '',
  postsPerPage: 10,
  // Тимчасова заморозка публікації нових статей (рішення 2026-10-27): живі лише статті з датою <= цього дня включно, незалежно від publishDate черги.
  // Зняти або змінити можна лише свідомо — разом із перепланованою чергою (scripts/respace_queue.py) і деплоєм, інакше черга вийде одним вибухом.
  publishCutoff: '2026-10-27',
  social: {
    telegram: 'https://t.me/cryptolock888',
    tiktok: 'https://www.tiktok.com/@cryptolockua',
  },
  nav: [
    { label: 'Статті', href: '/' },
    { label: 'Інструменти', href: '/tools' },
    { label: 'Теги', href: '/tags' },
    { label: 'Про нас', href: '/about' },
  ],
}

module.exports = siteConfig
