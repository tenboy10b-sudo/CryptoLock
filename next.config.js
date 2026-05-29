/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {},

  // i18n — українська за замовчуванням, /en/ для англійської
  i18n: {
    locales: ['uk', 'en'],
    defaultLocale: 'uk',
    localeDetection: false,
  },

  // Заголовки безпеки
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // Кешування статичних ресурсів на 1 рік
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Кешування HTML сторінок на 1 годину з stale-while-revalidate
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 's-maxage=3600, stale-while-revalidate=86400' },
        ],
      },
    ]
  },

  async redirects() {
    return [
      // ── Старий домен → новий ─────────────────────────────────────────
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'crypto-lock-five.vercel.app' }],
        destination: 'https://cryptolockua.com/:path*',
        permanent: true,
      },


      // ── www → non-www ────────────────────────────────────────────────
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.cryptolockua.com' }],
        destination: 'https://cryptolockua.com/:path*',
        permanent: true,
      },


      // ── Trailing slash дублікати → без slash ─────────────────────────
      { source: '/:slug/', destination: '/:slug', permanent: true },

      // ── /en/tags/tools → /tools ──────────────────────────────────────
      { source: '/en/tags/tools', destination: '/tools', permanent: true, locale: false },
      { source: '/en/tags/%D1%96%D0%BD%D1%81%D1%82%D1%80%D1%83%D0%BC%D0%B5%D0%BD%D1%82%D0%B8', destination: '/tools', permanent: true, locale: false },
      // ── EN теги з UK назвами → UK тег (301) ──────────────────────────
      { source: '/en/tags/:tag', destination: '/tags/:tag', permanent: true, locale: false },

      // ── UK slug на EN локалі → UK URL ─────────────────────────────────
      { source: '/en/yak-:slug*', destination: '/yak-:slug*', permanent: true, locale: false },

      // ── README-AUTOPOST ────────────────────────────────────────────────
      { source: '/README-AUTOPOST', destination: '/', permanent: true, locale: false },
      { source: '/en/README-AUTOPOST', destination: '/', permanent: true, locale: false },



      // ── Масові виправлення 404 (23.05.2026) ──────────────────────────
      { source: '/how-to-check-disk-health-windows', destination: '/en/how-to-check-disk-health-windows', permanent: true, locale: false },
      { source: '/how-to-check-disk-health-windows/', destination: '/en/how-to-check-disk-health-windows', permanent: true, locale: false },
      { source: '/how-to-fix-bsod-windows', destination: '/en/how-to-fix-bsod-windows', permanent: true, locale: false },
      { source: '/how-to-fix-bsod-windows/', destination: '/en/how-to-fix-bsod-windows', permanent: true, locale: false },
      { source: '/how-to-remove-virus-windows', destination: '/en/how-to-remove-virus-windows', permanent: true, locale: false },
      { source: '/how-to-remove-virus-windows/', destination: '/en/how-to-remove-virus-windows', permanent: true, locale: false },
      { source: '/how-to-install-windows-11-without-tpm', destination: '/en/how-to-install-windows-11-without-tpm', permanent: true, locale: false },
      { source: '/how-to-install-windows-11-without-tpm/', destination: '/en/how-to-install-windows-11-without-tpm', permanent: true, locale: false },
      { source: '/how-to-fix-windows-update-errors', destination: '/en/how-to-fix-windows-update-errors', permanent: true, locale: false },
      { source: '/how-to-fix-windows-update-errors/', destination: '/en/how-to-fix-windows-update-errors', permanent: true, locale: false },
      { source: '/how-to-set-up-dns-windows', destination: '/en/how-to-set-up-dns-windows', permanent: true, locale: false },
      { source: '/how-to-set-up-dns-windows/', destination: '/en/how-to-set-up-dns-windows', permanent: true, locale: false },
      { source: '/tags/viruses', destination: '/tags/%D0%B2%D1%96%D1%80%D1%83%D1%81%D0%B8', permanent: true, locale: false },
      { source: '/tags/bsod', destination: '/tags/bsod', permanent: true, locale: false },
      { source: '/tags/performance', destination: '/tags/%D0%BF%D1%80%D0%BE%D0%B4%D1%83%D0%BA%D1%82%D0%B8%D0%B2%D0%BD%D1%96%D1%81%D1%82%D1%8C', permanent: true, locale: false },
      { source: '/tags/diagnostics', destination: '/tags/%D0%B4%D1%96%D0%B0%D0%B3%D0%BD%D0%BE%D1%81%D1%82%D0%B8%D0%BA%D0%B0', permanent: true, locale: false },
      { source: '/tags/privacy', destination: '/tags/%D0%BF%D1%80%D0%B8%D0%B2%D0%B0%D1%82%D0%BD%D1%96%D1%81%D1%82%D1%8C', permanent: true, locale: false },
      { source: '/en/perevirka-ram-na-pomylky', destination: '/perevirka-ram-na-pomylky', permanent: true, locale: false },
      { source: '/en/defragmentatsiya-dysku-windows', destination: '/defragmentatsiya-dysku-windows', permanent: true, locale: false },
      { source: '/en/skynuti-parol-windows-cmd', destination: '/skynuti-parol-windows-cmd', permanent: true, locale: false },
      { source: '/en/prava-dostupu-fayly-papky', destination: '/prava-dostupu-fayly-papky', permanent: true, locale: false },
      { source: '/en/yak-uvimknuty-bitlocker-windows-11', destination: '/yak-uvimknuty-bitlocker-windows-11', permanent: true, locale: false },
      { source: '/en/yak-pidklyuchyty-dva-monitory-windows', destination: '/yak-pidklyuchyty-dva-monitory-windows', permanent: true, locale: false },
      { source: '/en/yak-zminyty-dns-windows', destination: '/yak-zminyty-dns-windows', permanent: true, locale: false },
      { source: '/en/yak-zminyty-imya-kompyutera', destination: '/yak-zminyty-imya-kompyutera', permanent: true, locale: false },
      { source: '/en/blokuvannya-saytiv-cherez-gpo', destination: '/blokuvannya-saytiv-cherez-gpo', permanent: true, locale: false },
      { source: '/en/perevirka-dysku-na-pomylky-chkdsk', destination: '/perevirka-dysku-na-pomylky-chkdsk', permanent: true, locale: false },
      { source: '/en/avto-blokuvannya-ekranu-gpo', destination: '/avto-blokuvannya-ekranu-gpo', permanent: true, locale: false },
      { source: '/en/yak-skynute-windows-do-zavodskykh', destination: '/yak-skynute-windows-do-zavodskykh', permanent: true, locale: false },
      { source: '/en/obmezhennya-kilkosti-sprob-parolyu', destination: '/obmezhennya-kilkosti-sprob-parolyu', permanent: true, locale: false },
      { source: '/en/yak-vymknuty-telemetriyu-windows', destination: '/yak-vymknuty-telemetriyu-windows', permanent: true, locale: false },
      { source: '/en/yak-vstanovyty-windows-11-z-fleshky', destination: '/yak-vstanovyty-windows-11-z-fleshky', permanent: true, locale: false },
      { source: '/en/cmd-komandy-dlya-perevirky-dysku', destination: '/cmd-komandy-dlya-perevirky-dysku', permanent: true, locale: false },
      { source: '/en/rezervne-kopiyuvannya-windows', destination: '/rezervne-kopiyuvannya-windows', permanent: true, locale: false },
      { source: '/en/zaborona-zapusku-prohram-gpo', destination: '/zaborona-zapusku-prohram-gpo', permanent: true, locale: false },
      { source: '/en/yak-vymknuty-wifi-cherez-gpo', destination: '/yak-vymknuty-wifi-cherez-gpo', permanent: true, locale: false },
      { source: '/en/yak-podyvytys-produktyvnist-pk', destination: '/yak-podyvytys-produktyvnist-pk', permanent: true, locale: false },
      { source: '/en/powershell-komandy-administratora', destination: '/powershell-komandy-administratora', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvanty-avtomatychne-blokuvannya-windows', destination: '/yak-nalashtuvanty-avtomatychne-blokuvannya-windows', permanent: true, locale: false },
      { source: '/en/zhurnal-podiy-event-viewer', destination: '/zhurnal-podiy-event-viewer', permanent: true, locale: false },
      { source: '/en/perevirka-produktyvnosti-dysku', destination: '/perevirka-produktyvnosti-dysku', permanent: true, locale: false },
      { source: '/en/avtozapusk-cherez-reiestr', destination: '/avtozapusk-cherez-reiestr', permanent: true, locale: false },
      { source: '/en/zaborona-zminy-wifi-gpo', destination: '/zaborona-zminy-wifi-gpo', permanent: true, locale: false },
      { source: '/en/vidnovlennya-zavantazhuvach-windows', destination: '/vidnovlennya-zavantazhuvach-windows', permanent: true, locale: false },
      { source: '/en/sfc-dism-povnyy-gaid', destination: '/sfc-dism-povnyy-gaid', permanent: true, locale: false },
      { source: '/en/applocker-gpo-nalashtuvannya', destination: '/applocker-gpo-nalashtuvannya', permanent: true, locale: false },
      { source: '/en/zaborona-zapusku-powershell', destination: '/zaborona-zapusku-powershell', permanent: true, locale: false },
      { source: '/en/hyper-v-virtualna-mashyna', destination: '/hyper-v-virtualna-mashyna', permanent: true, locale: false },
      { source: '/en/keruvanya-sluzhbamy-windows', destination: '/keruvanya-sluzhbamy-windows', permanent: true, locale: false },
      { source: '/en/windows-defender-cherez-gpo', destination: '/windows-defender-cherez-gpo', permanent: true, locale: false },
      { source: '/en/yak-zrobyty-screenshot-windows', destination: '/yak-zrobyty-screenshot-windows', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvatv-vpn-windows', destination: '/yak-nalashtuvaty-vpn-windows', permanent: true, locale: false },
      { source: '/README-AUTOPOST', destination: '/', permanent: true, locale: false },
      { source: '/en/README-AUTOPOST', destination: '/', permanent: true, locale: false },
      { source: '/yak-zrobyty-screenshot-windows', destination: '/yak-zrobyty-screenshot-windows', permanent: true, locale: false },
      // ── Опечатка в slug ───────────────────────────────────────────────
      {
        source: '/yak-nalashtuvatv-vpn-windows',
        destination: '/yak-nalashtuvaty-vpn-windows',
        permanent: true,
      },

      // ── Старі EN UK slugs → правильні EN slugs ────────────────────────
      {
        source: '/yak-vydatyly-virus-z-windows',
        locale: false,
        has: [{ type: 'header', key: 'x-nextjs-locale', value: 'en' }],
        destination: '/en/how-to-remove-virus-windows',
        permanent: true,
      },
      { source: '/en/yak-vydatyly-virus-z-windows', destination: '/en/how-to-remove-virus-windows', permanent: true },
      { source: '/en/yak-pryskoryt-windows', destination: '/en/how-to-speed-up-windows', permanent: true },
      { source: '/en/yak-zashyfruvaty-dysk-bitlocker', destination: '/en/how-to-enable-bitlocker', permanent: true },
      { source: '/en/nalashtuvannya-remote-desktop-rdp', destination: '/en/how-to-set-up-remote-desktop', permanent: true },

      // ── UK slugs що потрапили на EN локаль → UK версія ────────────────
      { source: '/en/yak-vstanovyty-wsl-linux-v-windows', destination: '/yak-vstanovyty-wsl-windows', permanent: true, locale: false },
      { source: '/en/vidklyuchennya-avtoonovlennya-windows', destination: '/vidklyuchennya-avtoonovlennya-windows', permanent: true, locale: false },
      { source: '/en/yak-uvimknuty-secure-boot', destination: '/yak-uvimknuty-secure-boot', permanent: true, locale: false },
      { source: '/en/yak-zablokuvaty-oblikovyy-zapys', destination: '/yak-zablokuvaty-oblikovyy-zapys', permanent: true, locale: false },

      // ── EN теги з UK назвами → UK версія тегу ────────────────────────
      // безпека
      { source: '/en/tags/%D0%B1%D0%B5%D0%B7%D0%BF%D0%B5%D0%BA%D0%B0', destination: '/tags/%D0%B1%D0%B5%D0%B7%D0%BF%D0%B5%D0%BA%D0%B0', permanent: true, locale: false },
      // групова-політика
      { source: '/en/tags/%D0%B3%D1%80%D1%83%D0%BF%D0%BE%D0%B2%D0%B0-%D0%BF%D0%BE%D0%BB%D1%96%D1%82%D0%B8%D0%BA%D0%B0', destination: '/tags/%D0%B3%D1%80%D1%83%D0%BF%D0%BE%D0%B2%D0%B0-%D0%BF%D0%BE%D0%BB%D1%96%D1%82%D0%B8%D0%BA%D0%B0', permanent: true, locale: false },
      // налаштування
      { source: '/en/tags/%D0%BD%D0%B0%D0%BB%D0%B0%D1%88%D1%82%D1%83%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F', destination: '/tags/%D0%BD%D0%B0%D0%BB%D0%B0%D1%88%D1%82%D1%83%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F', permanent: true, locale: false },
      // оптимізація
      { source: '/en/tags/%D0%BE%D0%BF%D1%82%D0%B8%D0%BC%D1%96%D0%B7%D0%B0%D1%86%D1%96%D1%8F', destination: '/tags/%D0%BE%D0%BF%D1%82%D0%B8%D0%BC%D1%96%D0%B7%D0%B0%D1%86%D1%96%D1%8F', permanent: true, locale: false },
      // прискорення
      { source: '/en/tags/%D0%BF%D1%80%D0%B8%D1%81%D0%BA%D0%BE%D1%80%D0%B5%D0%BD%D0%BD%D1%8F', destination: '/tags/%D0%BF%D1%80%D0%B8%D1%81%D0%BA%D0%BE%D1%80%D0%B5%D0%BD%D0%BD%D1%8F', permanent: true, locale: false },
      // завантаження
      { source: '/en/tags/%D0%B7%D0%B0%D0%B2%D0%B0%D0%BD%D1%82%D0%B0%D0%B6%D0%B5%D0%BD%D0%BD%D1%8F', destination: '/tags/%D0%B7%D0%B0%D0%B2%D0%B0%D0%BD%D1%82%D0%B0%D0%B6%D0%B5%D0%BD%D0%BD%D1%8F', permanent: true, locale: false },
      // помилки
      { source: '/en/tags/%D0%BF%D0%BE%D0%BC%D0%B8%D0%BB%D0%BA%D0%B8', destination: '/tags/%D0%BF%D0%BE%D0%BC%D0%B8%D0%BB%D0%BA%D0%B8', permanent: true, locale: false },
      // мережа
      { source: '/en/tags/%D0%BC%D0%B5%D1%80%D0%B5%D0%B6%D0%B0', destination: '/tags/%D0%BC%D0%B5%D1%80%D0%B5%D0%B6%D0%B0', permanent: true, locale: false },
      // реєстр
      { source: '/en/tags/%D1%80%D0%B5%D1%94%D1%81%D1%82%D1%80', destination: '/tags/%D1%80%D0%B5%D1%94%D1%81%D1%82%D1%80', permanent: true, locale: false },
      // інструменти
      { source: '/en/tags/%D1%96%D0%BD%D1%81%D1%82%D1%80%D1%83%D0%BC%D0%B5%D0%BD%D1%82%D0%B8', destination: '/tags/%D1%96%D0%BD%D1%81%D1%82%D1%80%D1%83%D0%BC%D0%B5%D0%BD%D1%82%D0%B8', permanent: true, locale: false },
      // відновлення
      { source: '/en/tags/%D0%B2%D1%96%D0%B4%D0%BD%D0%BE%D0%B2%D0%BB%D0%B5%D0%BD%D0%BD%D1%8F', destination: '/tags/%D0%B2%D1%96%D0%B4%D0%BD%D0%BE%D0%B2%D0%BB%D0%B5%D0%BD%D0%BD%D1%8F', permanent: true, locale: false },
      // обладнання
      { source: '/en/tags/%D0%BE%D0%B1%D0%BB%D0%B0%D0%B4%D0%BD%D0%B0%D0%BD%D0%BD%D1%8F', destination: '/tags/%D0%BE%D0%B1%D0%BB%D0%B0%D0%B4%D0%BD%D0%B0%D0%BD%D0%BD%D1%8F', permanent: true, locale: false },
      // оновлення
      { source: '/en/tags/%D0%BE%D0%BD%D0%BE%D0%B2%D0%BB%D0%B5%D0%BD%D0%BD%D1%8F', destination: '/tags/%D0%BE%D0%BD%D0%BE%D0%B2%D0%BB%D0%B5%D0%BD%D0%BD%D1%8F', permanent: true, locale: false },
      // паролі
      { source: '/en/tags/%D0%BF%D0%B0%D1%80%D0%BE%D0%BB%D1%96', destination: '/tags/%D0%BF%D0%B0%D1%80%D0%BE%D0%BB%D1%96', permanent: true, locale: false },
      // драйвери
      { source: '/en/tags/%D0%B4%D1%80%D0%B0%D0%B9%D0%B2%D0%B5%D1%80%D0%B8', destination: '/tags/%D0%B4%D1%80%D0%B0%D0%B9%D0%B2%D0%B5%D1%80%D0%B8', permanent: true, locale: false },
      // діагностика
      { source: '/en/tags/%D0%B4%D1%96%D0%B0%D0%B3%D0%BD%D0%BE%D1%81%D1%82%D0%B8%D0%BA%D0%B0', destination: '/tags/%D0%B4%D1%96%D0%B0%D0%B3%D0%BD%D0%BE%D1%81%D1%82%D0%B8%D0%BA%D0%B0', permanent: true, locale: false },
      // продуктивність
      { source: '/en/tags/%D0%BF%D1%80%D0%BE%D0%B4%D1%83%D0%BA%D1%82%D0%B8%D0%B2%D0%BD%D1%96%D1%81%D1%82%D1%8C', destination: '/tags/%D0%BF%D1%80%D0%BE%D0%B4%D1%83%D0%BA%D1%82%D0%B8%D0%B2%D0%BD%D1%96%D1%81%D1%8C', permanent: true, locale: false },
      // встановлення
      { source: '/en/tags/%D0%B2%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%BB%D0%B5%D0%BD%D0%BD%D1%8F', destination: '/tags/%D0%B2%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%BB%D0%B5%D0%BD%D0%BD%D1%8F', permanent: true, locale: false },
      // очищення
      { source: '/en/tags/%D0%BE%D1%87%D0%B8%D1%89%D0%B5%D0%BD%D0%BD%D1%8F', destination: '/tags/%D0%BE%D1%87%D0%B8%D1%89%D0%B5%D0%BD%D0%BD%D1%8F', permanent: true, locale: false },
      // адміністрування
      { source: '/en/tags/%D0%B0%D0%B4%D0%BC%D1%96%D0%BD%D1%96%D1%81%D1%82%D1%80%D1%83%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F', destination: '/tags/%D0%B0%D0%B4%D0%BC%D1%96%D0%BD%D1%96%D1%81%D1%82%D1%80%D1%83%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F', permanent: true, locale: false },
      // автозавантаження
      { source: '/en/tags/%D0%B0%D0%B2%D1%82%D0%BE%D0%B7%D0%B0%D0%B2%D0%B0%D0%BD%D1%82%D0%B0%D0%B6%D0%B5%D0%BD%D0%BD%D1%8F', destination: '/tags/%D0%B0%D0%B2%D1%82%D0%BE%D0%B7%D0%B0%D0%B2%D0%B0%D0%BD%D1%82%D0%B0%D0%B6%D0%B5%D0%BD%D0%BD%D1%8F', permanent: true, locale: false },
      // захист
      { source: '/en/tags/%D0%B7%D0%B0%D1%85%D0%B8%D1%81%D1%82', destination: '/tags/%D0%B7%D0%B0%D1%85%D0%B8%D1%81%D1%82', permanent: true, locale: false },
      // темна-тема
      { source: '/en/tags/%D1%82%D0%B5%D0%BC%D0%BD%D0%B0-%D1%82%D0%B5%D0%BC%D0%B0', destination: '/tags/%D1%82%D0%B5%D0%BC%D0%BD%D0%B0-%D1%82%D0%B5%D0%BC%D0%B0', permanent: true, locale: false },
      // шифрування
      { source: '/en/tags/%D1%88%D0%B8%D1%84%D1%80%D1%83%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F', destination: '/tags/%D1%88%D0%B8%D1%84%D1%80%D1%83%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F', permanent: true, locale: false },
      // скидання
      { source: '/en/tags/%D1%81%D0%BA%D0%B8%D0%B4%D0%B0%D0%BD%D0%BD%D1%8F', destination: '/tags/%D1%81%D0%BA%D0%B8%D0%B4%D0%B0%D0%BD%D0%BD%D1%8F', permanent: true, locale: false },
      // переустановка
      { source: '/en/tags/%D0%BF%D0%B5%D1%80%D0%B5%D1%83%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%BA%D0%B0', destination: '/tags/%D0%BF%D0%B5%D1%80%D0%B5%D1%83%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%BA%D0%B0', permanent: true, locale: false },
      // диспетчер-завдань
      { source: '/en/tags/%D0%B4%D0%B8%D1%81%D0%BF%D0%B5%D1%82%D1%87%D0%B5%D1%80-%D0%B7%D0%B0%D0%B2%D0%B4%D0%B0%D0%BD%D1%8C', destination: '/tags/%D0%B4%D0%B8%D1%81%D0%BF%D0%B5%D1%82%D1%87%D0%B5%D1%80-%D0%B7%D0%B0%D0%B2%D0%B4%D0%B0%D0%BD%D1%8C', permanent: true, locale: false },
      // планувальник
      { source: '/en/tags/%D0%BF%D0%BB%D0%B0%D0%BD%D1%83%D0%B2%D0%B0%D0%BB%D1%8C%D0%BD%D0%B8%D0%BA', destination: '/tags/%D0%BF%D0%BB%D0%B0%D0%BD%D1%83%D0%B2%D0%B0%D0%BB%D1%8C%D0%BD%D0%B8%D0%BA', permanent: true, locale: false },
      // персоналізація
      { source: '/en/tags/%D0%BF%D0%B5%D1%80%D1%81%D0%BE%D0%BD%D0%B0%D0%BB%D1%96%D0%B7%D0%B0%D1%86%D1%96%D1%8F', destination: '/tags/%D0%BF%D0%B5%D1%80%D1%81%D0%BE%D0%BD%D0%B0%D0%BB%D1%96%D0%B7%D0%B0%D1%86%D1%96%D1%8F', permanent: true, locale: false },
      // резервне-копіювання
      { source: '/en/tags/%D1%80%D0%B5%D0%B7%D0%B5%D1%80%D0%B2%D0%BD%D0%B5-%D0%BA%D0%BE%D0%BF%D1%96%D1%8E%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F', destination: '/tags/%D1%80%D0%B5%D0%B7%D0%B5%D1%80%D0%B2%D0%BD%D0%B5-%D0%BA%D0%BE%D0%BF%D1%96%D1%8E%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F', permanent: true, locale: false },
      // моніторинг
      { source: '/en/tags/%D0%BC%D0%BE%D0%BD%D1%96%D1%82%D0%BE%D1%80%D0%B8%D0%BD%D0%B3', destination: '/tags/%D0%BC%D0%BE%D0%BD%D1%96%D1%82%D0%BE%D1%80%D0%B8%D0%BD%D0%B3', permanent: true, locale: false },
      // облікові-записи
      { source: '/en/tags/%D0%BE%D0%B1%D0%BB%D1%96%D0%BA%D0%BE%D0%B2%D1%96-%D0%B7%D0%B0%D0%BF%D0%B8%D1%81%D0%B8', destination: '/tags/%D0%BE%D0%B1%D0%BB%D1%96%D0%BA%D0%BE%D0%B2%D1%96-%D0%B7%D0%B0%D0%BF%D0%B8%D1%81%D0%B8', permanent: true, locale: false },
      // адміністратор
      { source: '/en/tags/%D0%B0%D0%B4%D0%BC%D1%96%D0%BD%D1%96%D1%81%D1%82%D1%80%D0%B0%D1%82%D0%BE%D1%80', destination: '/tags/%D0%B0%D0%B4%D0%BC%D1%96%D0%BD%D1%96%D1%81%D1%82%D1%80%D0%B0%D1%82%D0%BE%D1%80', permanent: true, locale: false },
      // віруси
      { source: '/en/tags/%D0%B2%D1%96%D1%80%D1%83%D1%81%D0%B8', destination: '/tags/%D0%B2%D1%96%D1%80%D1%83%D1%81%D0%B8', permanent: true, locale: false },
      // диск
      { source: '/en/tags/%D0%B4%D0%B8%D1%81%D0%BA', destination: '/tags/%D0%B4%D0%B8%D1%81%D0%BA', permanent: true, locale: false },
      // швидкість
      { source: '/en/tags/%D1%88%D0%B2%D0%B8%D0%B4%D0%BA%D1%96%D1%81%D1%82%D1%8C', destination: '/tags/%D1%88%D0%B2%D0%B8%D0%B4%D0%BA%D1%96%D1%81%D1%82%D1%8C', permanent: true, locale: false },
      // gpedit (вже латиниця але на EN локалі — без UK статей)
      { source: '/en/tags/gpedit', destination: '/tags/gpedit', permanent: true, locale: false },


      // ── EN теги без Ukrainian prefix → UK теги (доповнення) ──────────
      { source: '/en/tags/applocker', destination: '/tags/applocker', permanent: true, locale: false },
      { source: '/en/tags/bios', destination: '/tags/bios', permanent: true, locale: false },
      { source: '/en/tags/bitlocker', destination: '/tags/bitlocker', permanent: true, locale: false },
      { source: '/en/tags/bluetooth', destination: '/tags/bluetooth', permanent: true, locale: false },
      { source: '/en/tags/bsod', destination: '/tags/bsod', permanent: true, locale: false },
      { source: '/en/tags/chkdsk', destination: '/tags/chkdsk', permanent: true, locale: false },
      { source: '/en/tags/cmd', destination: '/tags/cmd', permanent: true, locale: false },
      { source: '/en/tags/dism', destination: '/tags/dism', permanent: true, locale: false },
      { source: '/en/tags/dns', destination: '/tags/dns', permanent: true, locale: false },
      { source: '/en/tags/firewall', destination: '/tags/firewall', permanent: true, locale: false },
      { source: '/en/tags/gpo', destination: '/tags/gpo', permanent: true, locale: false },
      { source: '/en/tags/hyper-v', destination: '/tags/hyper-v', permanent: true, locale: false },
      { source: '/en/tags/linux', destination: '/tags/linux', permanent: true, locale: false },
      { source: '/en/tags/ntfs', destination: '/tags/ntfs', permanent: true, locale: false },
      { source: '/en/tags/powershell', destination: '/tags/powershell', permanent: true, locale: false },
      { source: '/en/tags/ram', destination: '/tags/ram', permanent: true, locale: false },
      { source: '/en/tags/rdp', destination: '/tags/rdp', permanent: true, locale: false },
      { source: '/en/tags/secpol', destination: '/tags/secpol', permanent: true, locale: false },
      { source: '/en/tags/sfc', destination: '/tags/sfc', permanent: true, locale: false },
      { source: '/en/tags/troubleshooting', destination: '/tags/troubleshooting', permanent: true, locale: false },
      { source: '/en/tags/uac', destination: '/tags/uac', permanent: true, locale: false },
      { source: '/en/tags/uefi', destination: '/tags/uefi', permanent: true, locale: false },
      { source: '/en/tags/usb', destination: '/tags/usb', permanent: true, locale: false },
      { source: '/en/tags/vpn', destination: '/tags/vpn', permanent: true, locale: false },
      { source: '/en/tags/wifi', destination: '/tags/wifi', permanent: true, locale: false },
      { source: '/en/tags/windows', destination: '/tags/windows', permanent: true, locale: false },
      { source: '/en/tags/windows-11', destination: '/tags/windows-11', permanent: true, locale: false },
      { source: '/en/tags/windows-defender', destination: '/tags/windows-defender', permanent: true, locale: false },
      { source: '/en/tags/windows-update', destination: '/tags/windows-update', permanent: true, locale: false },
      { source: '/en/tags/wsl', destination: '/tags/wsl', permanent: true, locale: false },
      { source: '/en/tags/%D0%B0%D0%B2%D1%82%D0%BE%D0%BC%D0%B0%D1%82%D0%B8%D0%B7%D0%B0%D1%86%D1%96%D1%8F', destination: '/tags/%D0%B0%D0%B2%D1%82%D0%BE%D0%BC%D0%B0%D1%82%D0%B8%D0%B7%D0%B0%D1%86%D1%96%D1%8F', permanent: true, locale: false },
      { source: '/en/tags/%D0%B2%D1%96%D1%80%D1%82%D1%83%D0%B0%D0%BB%D1%96%D0%B7%D0%B0%D1%86%D1%96%D1%8F', destination: '/tags/%D0%B2%D1%96%D1%80%D1%82%D1%83%D0%B0%D0%BB%D1%96%D0%B7%D0%B0%D1%86%D1%96%D1%8F', permanent: true, locale: false },
      { source: '/en/tags/%D0%B7%D0%B4%D0%BE%D1%80%D0%BE%D0%B2%27%D1%8F', destination: '/tags/%D0%B7%D0%B4%D0%BE%D1%80%D0%BE%D0%B2%27%D1%8F', permanent: true, locale: false },
      { source: '/en/tags/%D0%BA%D0%BB%D0%B0%D0%B2%D1%96%D0%B0%D1%82%D1%83%D1%80%D0%B0', destination: '/tags/%D0%BA%D0%BB%D0%B0%D0%B2%D1%96%D0%B0%D1%82%D1%83%D1%80%D0%B0', permanent: true, locale: false },
      { source: '/en/tags/%D0%BC%D0%BE%D0%BD%D1%96%D1%82%D0%BE%D1%80', destination: '/tags/%D0%BC%D0%BE%D0%BD%D1%96%D1%82%D0%BE%D1%80', permanent: true, locale: false },
      { source: '/en/tags/%D0%BC%D1%83%D0%BB%D1%8C%D1%82%D0%B8%D0%BC%D0%B5%D0%B4%D1%96%D0%B0', destination: '/tags/%D0%BC%D1%83%D0%BB%D1%8C%D1%82%D0%B8%D0%BC%D0%B5%D0%B4%D1%96%D0%B0', permanent: true, locale: false },
      { source: '/en/tags/%D0%BD%D0%BE%D1%83%D1%82%D0%B1%D1%83%D0%BA', destination: '/tags/%D0%BD%D0%BE%D1%83%D1%82%D0%B1%D1%83%D0%BA', permanent: true, locale: false },
      { source: '/en/tags/%D0%BF%D1%80%D0%B8%D0%B2%D0%B0%D1%82%D0%BD%D1%96%D1%81%D1%82%D1%8C', destination: '/tags/%D0%BF%D1%80%D0%B8%D0%B2%D0%B0%D1%82%D0%BD%D1%96%D1%81%D1%82%D1%8C', permanent: true, locale: false },
      { source: '/en/tags/%D0%BF%D1%80%D0%B8%D0%BD%D1%82%D0%B5%D1%80', destination: '/tags/%D0%BF%D1%80%D0%B8%D0%BD%D1%82%D0%B5%D1%80', permanent: true, locale: false },
      { source: '/en/tags/%D1%80%D0%BE%D0%B7%D1%80%D0%BE%D0%B1%D0%BA%D0%B0', destination: '/tags/%D1%80%D0%BE%D0%B7%D1%80%D0%BE%D0%B1%D0%BA%D0%B0', permanent: true, locale: false },
      { source: '/en/tags/%D1%81%D0%B5%D1%80%D0%B2%D0%B5%D1%80', destination: '/tags/%D1%81%D0%B5%D1%80%D0%B2%D0%B5%D1%80', permanent: true, locale: false },
      { source: '/en/tags/%D1%81%D0%BF%D0%B5%D1%86%D1%96%D0%B0%D0%BB%D1%8C%D0%BD%D1%96-%D0%BC%D0%BE%D0%B6%D0%BB%D0%B8%D0%B2%D0%BE%D1%81%D1%82%D1%96', destination: '/tags/%D1%81%D0%BF%D0%B5%D1%86%D1%96%D0%B0%D0%BB%D1%8C%D0%BD%D1%96-%D0%BC%D0%BE%D0%B6%D0%BB%D0%B8%D0%B2%D0%BE%D1%81%D1%82%D1%96', permanent: true, locale: false },
      { source: '/en/tags/%D1%84%D0%B0%D0%B9%D0%BB%D0%B8', destination: '/tags/%D1%84%D0%B0%D0%B9%D0%BB%D0%B8', permanent: true, locale: false },
      { source: '/en/tags/%D1%84%D0%BB%D0%B5%D1%88%D0%BA%D0%B0', destination: '/tags/%D1%84%D0%BB%D0%B5%D1%88%D0%BA%D0%B0', permanent: true, locale: false },
      { source: '/en/tags/%D1%85%D0%BC%D0%B0%D1%80%D0%B0', destination: '/tags/%D1%85%D0%BC%D0%B0%D1%80%D0%B0', permanent: true, locale: false },
      { source: '/en/tags/%D1%96%D0%B3%D1%80%D0%B8', destination: '/tags/%D1%96%D0%B3%D1%80%D0%B8', permanent: true, locale: false },

      // ── EN /tools/* → UK /tools/* (інструменти тільки UK версія) ────
      // EN tools тепер окремі сторінки — redirect прибрано
      // { source: '/en/tools', destination: '/tools', permanent: false, locale: false },
      // { source: '/en/tools/:path*', destination: '/tools/:path*', permanent: false, locale: false },
    ]
  },
}

module.exports = nextConfig
