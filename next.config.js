/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {},

  // i18n — українська за замовчуванням, /en/ для англійської
  i18n: {
    locales: ['uk', 'en'],
    defaultLocale: 'uk',
    localeDetection: false,
  },

  // Заголовки безпеки + кешування
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
        // Кешування HTML сторінок
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 's-maxage=3600, stale-while-revalidate=86400' },
        ],
      },
      {
        // Кешування статичних ресурсів Next.js на 1 рік
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Кешування зображень на 1 рік — оголошено ПІСЛЯ '/:path*' щоб не перебивалось ним
        // (Next.js: якщо кілька правил headers() збігаються з одним шляхом і задають той самий
        // ключ — виграє те, що оголошене пізніше; /logo.webp збігався і з цим правилом, і з
        // загальним '/:path*', і той раніше "вигравав", тому картинки кешувались лише на 1 годину)
        source: '/:file*.(png|webp|jpg|jpeg|svg|ico|gif)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
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

      // ── Консолідація дублікатів статей (сесія 12, 21.07.2026) ─────────
      // "Як прискорити Windows" — 7 статей об'єднано в yak-pryskoryt-windows
      { source: '/chomu-windows-halmuie-yak-pryskoryt', destination: '/yak-pryskoryt-windows', permanent: true },
      { source: '/noutbuk-galmuje-prichyny-rishennya', destination: '/yak-pryskoryt-windows', permanent: true },
      { source: '/yak-zrobyty-windows-11-shvydshe-na-slabkomu-pk', destination: '/yak-pryskoryt-windows', permanent: true },
      { source: '/yak-pryskoryt-windows-11-v-2026', destination: '/yak-pryskoryt-windows', permanent: true },
      { source: '/yak-nalashtuvaty-windows-na-stariy-pk', destination: '/yak-pryskoryt-windows', permanent: true },
      { source: '/yak-pryskoryt-zavantazhennya-windows', destination: '/yak-pryskoryt-windows', permanent: true },
      { source: '/yak-pryskoryt-zavantazhennya-windows-11', destination: '/yak-pryskoryt-windows', permanent: true },

      // "Спільний доступ до папок" — 4 статті об'єднано в yak-nalashtuvanty-spilnyy-dostup-do-papky
      { source: '/yak-nalashtuvatysy-spilnyy-dostup-do-papky', destination: '/yak-nalashtuvanty-spilnyy-dostup-do-papky', permanent: true },
      { source: '/yak-nalashtuvanty-shared-folder-windows', destination: '/yak-nalashtuvanty-spilnyy-dostup-do-papky', permanent: true },
      { source: '/spilni-papky-merezha-windows', destination: '/yak-nalashtuvanty-spilnyy-dostup-do-papky', permanent: true },

      // "Журнал подій" — 4 статті об'єднано в yak-korystuvatys-zhurnalom-podiy-windows
      { source: '/yak-pereviryty-zhurnaly-podiy-windows', destination: '/yak-korystuvatys-zhurnalom-podiy-windows', permanent: true },
      { source: '/yak-korystuvatys-zhurnalom-podiy-eventvwr', destination: '/yak-korystuvatys-zhurnalom-podiy-windows', permanent: true },
      { source: '/yak-ochystyty-zhurnaly-podiy-windows', destination: '/yak-korystuvatys-zhurnalom-podiy-windows', permanent: true },
      { source: '/zhurnal-podiy-event-viewer', destination: '/yak-korystuvatys-zhurnalom-podiy-windows', permanent: true },

      // "Ігрова оптимізація" — 4 статті об'єднано в yak-nalashtuvanty-windows-dlya-igrovogo-noutbuka
      { source: '/optymizatsiya-windows-dlya-igor', destination: '/yak-nalashtuvanty-windows-dlya-igrovogo-noutbuka', permanent: true },
      { source: '/yak-nalashtuvaty-windows-dlya-igher', destination: '/yak-nalashtuvanty-windows-dlya-igrovogo-noutbuka', permanent: true },
      { source: '/nalashtuvannya-igrovogo-pk-windows', destination: '/yak-nalashtuvanty-windows-dlya-igrovogo-noutbuka', permanent: true },

      // "Мережевий диск" — 3 статті об'єднано в yak-pidklyuchyty-merezhevyy-dysk-windows
      { source: '/pidklyuchennya-setevykh-dyskiv-windows', destination: '/yak-pidklyuchyty-merezhevyy-dysk-windows', permanent: true },
      { source: '/yak-nalashtuvaty-merezhevyy-dysk-windows', destination: '/yak-pidklyuchyty-merezhevyy-dysk-windows', permanent: true },

      // "Firewall-правила" — 3 статті об'єднано в windows-firewall-nalashtuvannya-pravyl
      { source: '/nalashtuvannya-brandmauera-windows', destination: '/windows-firewall-nalashtuvannya-pravyl', permanent: true },
      { source: '/rozshyreni-pravyla-brandmauera-windows', destination: '/windows-firewall-nalashtuvannya-pravyl', permanent: true },

      // "PowerShell — служби Windows" — 3 статті об'єднано в powershell-robota-z-sluzhbamy-windows
      { source: '/keruvannya-sluzhbamy-windows-powershell', destination: '/powershell-robota-z-sluzhbamy-windows', permanent: true },
      { source: '/keruvanya-sluzhbamy-windows', destination: '/powershell-robota-z-sluzhbamy-windows', permanent: true },

      // "PowerShell — топ-скрипти адміна" — 3 статті об'єднано в powershell-skrypty-dlya-admina-top20
      { source: '/powershell-komandy-administratora', destination: '/powershell-skrypty-dlya-admina-top20', permanent: true },
      { source: '/powershell-skrypty-dlya-systemnykh-admyniv', destination: '/powershell-skrypty-dlya-admina-top20', permanent: true },

      // "Диспетчер завдань" — 2 статті об'єднано в dispecher-zavdan-windows-povnyy-gaid
      { source: '/dispecher-zavdan-windows-povnyy-posibnyk', destination: '/dispecher-zavdan-windows-povnyy-gaid', permanent: true },

      // "Віртуальні робочі столи" — 2 статті об'єднано в yak-nalashtuvanty-virtualnyi-stol-windows
      { source: '/yak-nalashtuvaty-virtualni-robochi-stoly-windows', destination: '/yak-nalashtuvanty-virtualnyi-stol-windows', permanent: true },

      // "Другий монітор" — 2 статті об'єднано в yak-pidklyuchyty-dva-monitory-windows
      { source: '/yak-nalashtuvanty-druhyy-monitor-windows', destination: '/yak-pidklyuchyty-dva-monitory-windows', permanent: true },

      // "BSOD" — 4 статті об'єднано в siniy-ekran-smerti-windows-11-24h2
      { source: '/siniy-ekran-smerti-bsod-yak-vypravyty', destination: '/siniy-ekran-smerti-windows-11-24h2', permanent: true },
      { source: '/siniy-ekran-pislya-onovlennya-windows-11', destination: '/siniy-ekran-smerti-windows-11-24h2', permanent: true },
      { source: '/yak-vypravyty-bsod-windows', destination: '/siniy-ekran-smerti-windows-11-24h2', permanent: true },

      // "Windows Terminal" — 4 статті об'єднано в windows-terminal-povnyy-gaid
      { source: '/yak-nalashtuvaty-windows-terminal', destination: '/windows-terminal-povnyy-gaid', permanent: true },
      { source: '/yak-korystuvatysya-windows-terminal', destination: '/windows-terminal-povnyy-gaid', permanent: true },
      { source: '/windows-terminal-nalashtuvannya', destination: '/windows-terminal-povnyy-gaid', permanent: true },

      // "Мережевий принтер" — 4 статті об'єднано в yak-nalashtuvanty-printery-merezhevy-domen
      { source: '/nalashtuvannya-merezhenoho-pryntera-windows', destination: '/yak-nalashtuvanty-printery-merezhevy-domen', permanent: true },
      { source: '/yak-nalashtuvanty-printer-ip-merezhi', destination: '/yak-nalashtuvanty-printery-merezhevy-domen', permanent: true },
      { source: '/yak-pidklyuchyty-printer-windows', destination: '/yak-nalashtuvanty-printery-merezhevy-domen', permanent: true },

      // ── /en/tags/tools → /tools ──────────────────────────────────────
      { source: '/en/tags/tools', destination: '/tools', permanent: true, locale: false },
      { source: '/en/tags/%D1%96%D0%BD%D1%81%D1%82%D1%80%D1%83%D0%BC%D0%B5%D0%BD%D1%82%D0%B8', destination: '/tools', permanent: true, locale: false },


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
      { source: '/en/powershell-komandy-administratora', destination: '/powershell-skrypty-dlya-admina-top20', permanent: true, locale: false },
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
      { source: '/en/keruvanya-sluzhbamy-windows', destination: '/powershell-robota-z-sluzhbamy-windows', permanent: true, locale: false },
      { source: '/en/windows-defender-cherez-gpo', destination: '/windows-defender-cherez-gpo', permanent: true, locale: false },
      { source: '/en/yak-zrobyty-screenshot-windows', destination: '/yak-zrobyty-screenshot-windows', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvatv-vpn-windows', destination: '/yak-nalashtuvaty-vpn-windows', permanent: true, locale: false },
      { source: '/en/vymknute-cortana-veb-poshuk', destination: '/vymknute-cortana-veb-poshuk', permanent: true, locale: false },
      { source: '/en/ochyschennya-dns-keshu-windows', destination: '/ochyschennya-dns-keshu-windows', permanent: true, locale: false },
      { source: '/en/bios-ne-bachyt-fleshku', destination: '/bios-ne-bachyt-fleshku', permanent: true, locale: false },
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
      { source: '/en/tags/%D0%B1%D0%B5%D0%B7%D0%BF%D0%B5%D0%BA%D0%B0', destination: '/tags/%D0%B1%D0%B5%D0%B7%D0%BF%D0%B5%D0%BA%D0%B0', permanent: true, locale: false },
      { source: '/en/tags/%D0%B3%D1%80%D1%83%D0%BF%D0%BE%D0%B2%D0%B0-%D0%BF%D0%BE%D0%BB%D1%96%D1%82%D0%B8%D0%BA%D0%B0', destination: '/tags/%D0%B3%D1%80%D1%83%D0%BF%D0%BE%D0%B2%D0%B0-%D0%BF%D0%BE%D0%BB%D1%96%D1%82%D0%B8%D0%BA%D0%B0', permanent: true, locale: false },
      { source: '/en/tags/%D0%BD%D0%B0%D0%BB%D0%B0%D1%88%D1%82%D1%83%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F', destination: '/tags/%D0%BD%D0%B0%D0%BB%D0%B0%D1%88%D1%82%D1%83%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F', permanent: true, locale: false },
      { source: '/en/tags/%D0%BE%D0%BF%D1%82%D0%B8%D0%BC%D1%96%D0%B7%D0%B0%D1%86%D1%96%D1%8F', destination: '/tags/%D0%BE%D0%BF%D1%82%D0%B8%D0%BC%D1%96%D0%B7%D0%B0%D1%86%D1%96%D1%8F', permanent: true, locale: false },
      { source: '/en/tags/%D0%BF%D1%80%D0%B8%D1%81%D0%BA%D0%BE%D1%80%D0%B5%D0%BD%D0%BD%D1%8F', destination: '/tags/%D0%BF%D1%80%D0%B8%D1%81%D0%BA%D0%BE%D1%80%D0%B5%D0%BD%D0%BD%D1%8F', permanent: true, locale: false },
      { source: '/en/tags/%D0%B7%D0%B0%D0%B2%D0%B0%D0%BD%D1%82%D0%B0%D0%B6%D0%B5%D0%BD%D0%BD%D1%8F', destination: '/tags/%D0%B7%D0%B0%D0%B2%D0%B0%D0%BD%D1%82%D0%B0%D0%B6%D0%B5%D0%BD%D0%BD%D1%8F', permanent: true, locale: false },
      { source: '/en/tags/%D0%BF%D0%BE%D0%BC%D0%B8%D0%BB%D0%BA%D0%B8', destination: '/tags/%D0%BF%D0%BE%D0%BC%D0%B8%D0%BB%D0%BA%D0%B8', permanent: true, locale: false },
      { source: '/en/tags/%D0%BC%D0%B5%D1%80%D0%B5%D0%B6%D0%B0', destination: '/tags/%D0%BC%D0%B5%D1%80%D0%B5%D0%B6%D0%B0', permanent: true, locale: false },
      { source: '/en/tags/%D1%80%D0%B5%D1%94%D1%81%D1%82%D1%80', destination: '/tags/%D1%80%D0%B5%D1%94%D1%81%D1%82%D1%80', permanent: true, locale: false },
      { source: '/en/tags/%D1%96%D0%BD%D1%81%D1%82%D1%80%D1%83%D0%BC%D0%B5%D0%BD%D1%82%D0%B8', destination: '/tags/%D1%96%D0%BD%D1%81%D1%82%D1%80%D1%83%D0%BC%D0%B5%D0%BD%D1%82%D0%B8', permanent: true, locale: false },
      { source: '/en/tags/%D0%B2%D1%96%D0%B4%D0%BD%D0%BE%D0%B2%D0%BB%D0%B5%D0%BD%D0%BD%D1%8F', destination: '/tags/%D0%B2%D1%96%D0%B4%D0%BD%D0%BE%D0%B2%D0%BB%D0%B5%D0%BD%D0%BD%D1%8F', permanent: true, locale: false },
      { source: '/en/tags/%D0%BE%D0%B1%D0%BB%D0%B0%D0%B4%D0%BD%D0%B0%D0%BD%D0%BD%D1%8F', destination: '/tags/%D0%BE%D0%B1%D0%BB%D0%B0%D0%B4%D0%BD%D0%B0%D0%BD%D0%BD%D1%8F', permanent: true, locale: false },
      { source: '/en/tags/%D0%BE%D0%BD%D0%BE%D0%B2%D0%BB%D0%B5%D0%BD%D0%BD%D1%8F', destination: '/tags/%D0%BE%D0%BD%D0%BE%D0%B2%D0%BB%D0%B5%D0%BD%D0%BD%D1%8F', permanent: true, locale: false },
      { source: '/en/tags/%D0%BF%D0%B0%D1%80%D0%BE%D0%BB%D1%96', destination: '/tags/%D0%BF%D0%B0%D1%80%D0%BE%D0%BB%D1%96', permanent: true, locale: false },
      { source: '/en/tags/%D0%B4%D1%80%D0%B0%D0%B9%D0%B2%D0%B5%D1%80%D0%B8', destination: '/tags/%D0%B4%D1%80%D0%B0%D0%B9%D0%B2%D0%B5%D1%80%D0%B8', permanent: true, locale: false },
      { source: '/en/tags/%D0%B4%D1%96%D0%B0%D0%B3%D0%BD%D0%BE%D1%81%D1%82%D0%B8%D0%BA%D0%B0', destination: '/tags/%D0%B4%D1%96%D0%B0%D0%B3%D0%BD%D0%BE%D1%81%D1%82%D0%B8%D0%BA%D0%B0', permanent: true, locale: false },
      { source: '/en/tags/%D0%BF%D1%80%D0%BE%D0%B4%D1%83%D0%BA%D1%82%D0%B8%D0%B2%D0%BD%D1%96%D1%81%D1%82%D1%8C', destination: '/tags/%D0%BF%D1%80%D0%BE%D0%B4%D1%83%D0%BA%D1%82%D0%B8%D0%B2%D0%BD%D1%96%D1%81%D1%82%D1%8C', permanent: true, locale: false },
      { source: '/en/tags/%D0%B2%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%BB%D0%B5%D0%BD%D0%BD%D1%8F', destination: '/tags/%D0%B2%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%BB%D0%B5%D0%BD%D0%BD%D1%8F', permanent: true, locale: false },
      { source: '/en/tags/%D0%BE%D1%87%D0%B8%D1%89%D0%B5%D0%BD%D0%BD%D1%8F', destination: '/tags/%D0%BE%D1%87%D0%B8%D1%89%D0%B5%D0%BD%D0%BD%D1%8F', permanent: true, locale: false },
      { source: '/en/tags/%D0%B0%D0%B4%D0%BC%D1%96%D0%BD%D1%96%D1%81%D1%82%D1%80%D1%83%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F', destination: '/tags/%D0%B0%D0%B4%D0%BC%D1%96%D0%BD%D1%96%D1%81%D1%82%D1%80%D1%83%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F', permanent: true, locale: false },
      { source: '/en/tags/%D0%B0%D0%B2%D1%82%D0%BE%D0%B7%D0%B0%D0%B2%D0%B0%D0%BD%D1%82%D0%B0%D0%B6%D0%B5%D0%BD%D0%BD%D1%8F', destination: '/tags/%D0%B0%D0%B2%D1%82%D0%BE%D0%B7%D0%B0%D0%B2%D0%B0%D0%BD%D1%82%D0%B0%D0%B6%D0%B5%D0%BD%D0%BD%D1%8F', permanent: true, locale: false },
      { source: '/en/tags/%D0%B7%D0%B0%D1%85%D0%B8%D1%81%D1%82', destination: '/tags/%D0%B7%D0%B0%D1%85%D0%B8%D1%81%D1%82', permanent: true, locale: false },
      { source: '/en/tags/%D1%82%D0%B5%D0%BC%D0%BD%D0%B0-%D1%82%D0%B5%D0%BC%D0%B0', destination: '/tags/%D1%82%D0%B5%D0%BC%D0%BD%D0%B0-%D1%82%D0%B5%D0%BC%D0%B0', permanent: true, locale: false },
      { source: '/en/tags/%D1%88%D0%B8%D1%84%D1%80%D1%83%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F', destination: '/tags/%D1%88%D0%B8%D1%84%D1%80%D1%83%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F', permanent: true, locale: false },
      { source: '/en/tags/%D1%81%D0%BA%D0%B8%D0%B4%D0%B0%D0%BD%D0%BD%D1%8F', destination: '/tags/%D1%81%D0%BA%D0%B8%D0%B4%D0%B0%D0%BD%D0%BD%D1%8F', permanent: true, locale: false },
      { source: '/en/tags/%D0%BF%D0%B5%D1%80%D0%B5%D1%83%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%BA%D0%B0', destination: '/tags/%D0%BF%D0%B5%D1%80%D0%B5%D1%83%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%BA%D0%B0', permanent: true, locale: false },
      { source: '/en/tags/%D0%B4%D0%B8%D1%81%D0%BF%D0%B5%D1%82%D1%87%D0%B5%D1%80-%D0%B7%D0%B0%D0%B2%D0%B4%D0%B0%D0%BD%D1%8C', destination: '/tags/%D0%B4%D0%B8%D1%81%D0%BF%D0%B5%D1%82%D1%87%D0%B5%D1%80-%D0%B7%D0%B0%D0%B2%D0%B4%D0%B0%D0%BD%D1%8C', permanent: true, locale: false },
      { source: '/en/tags/%D0%BF%D0%BB%D0%B0%D0%BD%D1%83%D0%B2%D0%B0%D0%BB%D1%8C%D0%BD%D0%B8%D0%BA', destination: '/tags/%D0%BF%D0%BB%D0%B0%D0%BD%D1%83%D0%B2%D0%B0%D0%BB%D1%8C%D0%BD%D0%B8%D0%BA', permanent: true, locale: false },
      { source: '/en/tags/%D0%BF%D0%B5%D1%80%D1%81%D0%BE%D0%BD%D0%B0%D0%BB%D1%96%D0%B7%D0%B0%D1%86%D1%96%D1%8F', destination: '/tags/%D0%BF%D0%B5%D1%80%D1%81%D0%BE%D0%BD%D0%B0%D0%BB%D1%96%D0%B7%D0%B0%D1%86%D1%96%D1%8F', permanent: true, locale: false },
      { source: '/en/tags/%D1%80%D0%B5%D0%B7%D0%B5%D1%80%D0%B2%D0%BD%D0%B5-%D0%BA%D0%BE%D0%BF%D1%96%D1%8E%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F', destination: '/tags/%D1%80%D0%B5%D0%B7%D0%B5%D1%80%D0%B2%D0%BD%D0%B5-%D0%BA%D0%BE%D0%BF%D1%96%D1%8E%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F', permanent: true, locale: false },
      { source: '/en/tags/%D0%BC%D0%BE%D0%BD%D1%96%D1%82%D0%BE%D1%80%D0%B8%D0%BD%D0%B3', destination: '/tags/%D0%BC%D0%BE%D0%BD%D1%96%D1%82%D0%BE%D1%80%D0%B8%D0%BD%D0%B3', permanent: true, locale: false },
      { source: '/en/tags/%D0%BE%D0%B1%D0%BB%D1%96%D0%BA%D0%BE%D0%B2%D1%96-%D0%B7%D0%B0%D0%BF%D0%B8%D1%81%D0%B8', destination: '/tags/%D0%BE%D0%B1%D0%BB%D1%96%D0%BA%D0%BE%D0%B2%D1%96-%D0%B7%D0%B0%D0%BF%D0%B8%D1%81%D0%B8', permanent: true, locale: false },
      { source: '/en/tags/%D0%B0%D0%B4%D0%BC%D1%96%D0%BD%D1%96%D1%81%D1%82%D1%80%D0%B0%D1%82%D0%BE%D1%80', destination: '/tags/%D0%B0%D0%B4%D0%BC%D1%96%D0%BD%D1%96%D1%81%D1%82%D1%80%D0%B0%D1%82%D0%BE%D1%80', permanent: true, locale: false },
      { source: '/en/tags/%D0%B2%D1%96%D1%80%D1%83%D1%81%D0%B8', destination: '/tags/%D0%B2%D1%96%D1%80%D1%83%D1%81%D0%B8', permanent: true, locale: false },
      { source: '/en/tags/%D0%B4%D0%B8%D1%81%D0%BA', destination: '/tags/%D0%B4%D0%B8%D1%81%D0%BA', permanent: true, locale: false },
      { source: '/en/tags/%D1%88%D0%B2%D0%B8%D0%B4%D0%BA%D1%96%D1%81%D1%82%D1%8C', destination: '/tags/%D1%88%D0%B2%D0%B8%D0%B4%D0%BA%D1%96%D1%81%D1%82%D1%8C', permanent: true, locale: false },
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

      // ── Виправлення 404: /en/yak-... → /yak-... ────────────────
      { source: '/en/yak-perenesty-fayly-z-staroho-pk-na-novyy', destination: '/yak-perenesty-fayly-z-staroho-pk-na-novyy', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvanty-failovu-systemu-ntfs', destination: '/yak-nalashtuvanty-failovu-systemu-ntfs', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvaty-monitorynh-merezhi-windows', destination: '/yak-nalashtuvaty-monitorynh-merezhi-windows', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvanty-windows-bez-internetu', destination: '/yak-nalashtuvanty-windows-bez-internetu', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvanty-raid-windows-server', destination: '/yak-nalashtuvanty-raid-windows-server', permanent: true, locale: false },
      { source: '/en/yak-zakhystyty-oblikovyy-zapys-microsoft', destination: '/yak-zakhystyty-oblikovyy-zapys-microsoft', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvanty-son-ta-hibernatsiyu-windows', destination: '/yak-nalashtuvanty-son-ta-hibernatsiyu-windows', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvaty-avtozapusk-programy-windows', destination: '/yak-nalashtuvaty-avtozapusk-programy-windows', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvaty-diahnostiku-pamiati-windows', destination: '/yak-nalashtuvaty-diahnostiku-pamiati-windows', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvaty-klaviaturu-windows', destination: '/yak-nalashtuvaty-klaviaturu-windows', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvaty-robotu-iz-zasobamy-windows', destination: '/yak-nalashtuvaty-robotu-iz-zasobamy-windows', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvaty-vpn-windows', destination: '/yak-nalashtuvaty-vpn-windows', permanent: true, locale: false },
      { source: '/en/yak-vstanovyty-ssd-windows', destination: '/yak-vstanovyty-ssd-windows', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvanty-rezervne-kopiyuvannya-onedrive', destination: '/yak-nalashtuvanty-rezervne-kopiyuvannya-onedrive', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvaty-windows-zminnye-seredovyshhe', destination: '/yak-nalashtuvaty-windows-zminnye-seredovyshhe', permanent: true, locale: false },
      { source: '/en/yak-vymknuty-povnoekrannyy-antivirus', destination: '/yak-vymknuty-povnoekrannyy-antivirus', permanent: true, locale: false },
      { source: '/en/yak-koristuvatysya-dispetcherom-zasobiv', destination: '/yak-koristuvatysya-dispetcherom-zasobiv', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvanty-druhyy-monitor-windows', destination: '/yak-nalashtuvanty-druhyy-monitor-windows', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvaty-mysh-windows', destination: '/yak-nalashtuvaty-mysh-windows', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvaty-gpo-dlya-bezpeky', destination: '/yak-nalashtuvaty-gpo-dlya-bezpeky', permanent: true, locale: false },
      { source: '/en/yak-vstanovyty-windows-11-bez-microsoft-account', destination: '/yak-vstanovyty-windows-11-bez-microsoft-account', permanent: true, locale: false },
      { source: '/en/yak-korystuvatys-zhurnalom-podiy-windows', destination: '/yak-korystuvatys-zhurnalom-podiy-windows', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvanty-shared-folder-windows', destination: '/yak-nalashtuvanty-shared-folder-windows', permanent: true, locale: false },
      { source: '/en/yak-pratsyuvaty-z-reiestratorom-windows', destination: '/yak-pratsyuvaty-z-reiestratorom-windows', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvanty-dhcp-rezervatsiyi', destination: '/yak-nalashtuvanty-dhcp-rezervatsiyi', permanent: true, locale: false },
      { source: '/en/yak-pidklyuchytysy-do-korporatyvnoyi-merezhi', destination: '/yak-pidklyuchytysy-do-korporatyvnoyi-merezhi', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvanty-iis-windows-server', destination: '/yak-nalashtuvanty-iis-windows-server', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvanty-windows-developer', destination: '/yak-nalashtuvanty-windows-developer', permanent: true, locale: false },
      { source: '/en/yak-pratsyuvaty-z-dyskamy-ta-rozdilamy', destination: '/yak-pratsyuvaty-z-dyskamy-ta-rozdilamy', permanent: true, locale: false },
      { source: '/en/yak-zakhystyty-wi-fi-vdoma', destination: '/yak-zakhystyty-wi-fi-vdoma', permanent: true, locale: false },
      { source: '/en/yak-prybravty-bloatware-windows-11', destination: '/yak-prybravty-bloatware-windows-11', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvanty-rezerv-systemy-windows-image', destination: '/yak-nalashtuvanty-rezerv-systemy-windows-image', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvanty-dvokrokov', destination: '/', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvanty-robochyy-stil-windows', destination: '/yak-nalashtuvanty-robochyy-stil-windows', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvaty-shvydkyy-dostup-windows', destination: '/yak-nalashtuvaty-shvydkyy-dostup-windows', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvaty-usb-tethering-windows', destination: '/yak-nalashtuvaty-usb-tethering-windows', permanent: true, locale: false },
      { source: '/en/yak-pryskoryt-zavantazhennya-windows', destination: '/yak-pryskoryt-zavantazhennya-windows', permanent: true, locale: false },
      { source: '/en/yak-vstanovyty-docker-windows', destination: '/yak-vstanovyty-docker-windows', permanent: true, locale: false },
      { source: '/en/yak-vstanovyty-git-windows', destination: '/yak-vstanovyty-git-windows', permanent: true, locale: false },
      { source: '/en/yak-vstanovyty-python-windows', destination: '/yak-vstanovyty-python-windows', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvanty-windows-server-2022', destination: '/yak-nalashtuvanty-windows-server-2022', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvaty-windows-dlya-pryvatnosti', destination: '/yak-nalashtuvaty-windows-dlya-pryvatnosti', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvaty-faierbol-windows-dlya-ihor', destination: '/yak-nalashtuvaty-faierbol-windows-dlya-ihor', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvaty-windows-zaplyh-portiv', destination: '/yak-nalashtuvaty-windows-zaplyh-portiv', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvaty-dns-over-https-windows', destination: '/yak-nalashtuvaty-dns-over-https-windows', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvaty-nychnyy-rezhym-windows', destination: '/yak-nalashtuvaty-nychnyy-rezhym-windows', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvanty-windows-dlya-shkoly', destination: '/yak-nalashtuvanty-windows-dlya-shkoly', permanent: true, locale: false },
      { source: '/en/yak-vypravyty-windows-update-zavisaye', destination: '/yak-vypravyty-windows-update-zavisaye', permanent: true, locale: false },
      { source: '/yak-nalashtuvanty-dvokrokov', destination: '/', permanent: true, locale: false },

      // ── Canonical duplicates: /en/uk-slug → /uk-slug ────────────
      { source: '/en/zaborona-cmd-dlya-korystuvachiv', destination: '/zaborona-cmd-dlya-korystuvachiv', permanent: true, locale: false },
      { source: '/en/grupova-polityka-zaborona-usb', destination: '/grupova-polityka-zaborona-usb', permanent: true, locale: false },
      { source: '/en/yak-vstanovyty-draiver', destination: '/yak-vstanovyty-draiver', permanent: true, locale: false },
      { source: '/en/yak-vymknuty-avtozavantazhennya', destination: '/yak-vymknuty-avtozavantazhennya', permanent: true, locale: false },
      { source: '/en/brandmauer-windows-cherez-gpo', destination: '/brandmauer-windows-cherez-gpo', permanent: true, locale: false },
      { source: '/en/yak-zbilshyty-obsyah-ram-windows', destination: '/yak-zbilshyty-obsyah-ram-windows', permanent: true, locale: false },
      { source: '/en/minimalna-dovzhyna-parolyu', destination: '/minimalna-dovzhyna-parolyu', permanent: true, locale: false },
      { source: '/en/yak-uvimknuty-wifi-windows', destination: '/yak-uvimknuty-wifi-windows', permanent: true, locale: false },
      { source: '/en/yak-uvimknuty-bluetooth', destination: '/yak-uvimknuty-bluetooth', permanent: true, locale: false },
      { source: '/en/yak-vymknuty-uac-gpo', destination: '/yak-vymknuty-uac-gpo', permanent: true, locale: false },
      { source: '/en/yak-zayty-v-bios', destination: '/yak-zayty-v-bios', permanent: true, locale: false },
      { source: '/en/avtomatychnyy-vkhid-windows', destination: '/avtomatychnyy-vkhid-windows', permanent: true, locale: false },
      { source: '/en/yak-zbilshyty-shvydkist-internetu-windows', destination: '/yak-zbilshyty-shvydkist-internetu-windows', permanent: true, locale: false },

      // ── Crawled not indexed: /en/yak-... → /yak-... ─────────────
      { source: '/en/yak-nalashtuvanty-ldap-windows', destination: '/yak-nalashtuvanty-ldap-windows', permanent: true, locale: false },
      { source: '/en/yak-pratsyuvaty-z-dostupoyu-do-fayiv-windows', destination: '/yak-pratsyuvaty-z-dostupoyu-do-fayiv-windows', permanent: true, locale: false },
      { source: '/en/yak-shvydko-vidkryty-potribnu-program-windows', destination: '/yak-shvydko-vidkryty-potribnu-program-windows', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvaty-printer-windows', destination: '/yak-nalashtuvaty-printer-windows', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvaty-widkryttya-failiv-za-zamovchuvannyam', destination: '/yak-nalashtuvaty-widkryttya-failiv-za-zamovchuvannyam', permanent: true, locale: false },
      { source: '/en/yak-pryskoryt-windows-11-v-2026', destination: '/yak-pryskoryt-windows-11-v-2026', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvanty-rdp-windows', destination: '/yak-nalashtuvanty-rdp-windows', permanent: true, locale: false },
      { source: '/en/skynuti-parol-windows', destination: '/skynuti-parol-windows', permanent: true, locale: false },
      { source: '/en/menedzher-paroliv-yak-vybraty-i-vykorystovuvaty', destination: '/menedzher-paroliv-yak-vybraty-i-vykorystovuvaty', permanent: true, locale: false },
      { source: '/en/windows-subsystem-android-nalashtuvannya', destination: '/windows-subsystem-android-nalashtuvannya', permanent: true, locale: false },
      { source: '/en/symlink-mklink-windows', destination: '/symlink-mklink-windows', permanent: true, locale: false },
      { source: '/en/yak-nalashtuvatysy-windows-sandbox', destination: '/yak-nalashtuvatysy-windows-sandbox', permanent: true, locale: false },

      // ── Виправлення канібалізації контенту ─────────────────────
      { source: '/en/how-to-enable-bitlocker', destination: '/en/how-to-enable-bitlocker-windows', permanent: true, locale: false },
      { source: '/en/how-to-configure-static-ip-windows', destination: '/en/how-to-configure-static-ip-windows-11', permanent: true, locale: false },
      { source: '/en/how-to-enable-hyper-v-windows-11', destination: '/en/how-to-enable-hyper-v-windows', permanent: true, locale: false },
      { source: '/en/how-to-fix-windows-slow-boot', destination: '/en/how-to-fix-slow-boot-windows', permanent: true, locale: false },
      { source: '/en/how-to-fix-windows-11-slow-boot', destination: '/en/how-to-fix-slow-boot-windows', permanent: true, locale: false },
      { source: '/yak-nalashtuvaty-vkhid-bez-parolya-windows', destination: '/avtomatychnyy-vkhid-windows', permanent: true, locale: false },
      { source: '/yak-nalashtuvanty-avtomatychnyy-vkhid-windows', destination: '/avtomatychnyy-vkhid-windows', permanent: true, locale: false },
      { source: '/task-scheduler-avtomatyzatsiya', destination: '/yak-nalashtuvaty-task-scheduler-windows', permanent: true, locale: false },
      { source: '/avtomatyzatsiya-zadach-powershell-task-scheduler', destination: '/yak-nalashtuvaty-task-scheduler-windows', permanent: true, locale: false },
      { source: '/yak-korystuvatysya-windows-terminal', destination: '/yak-nalashtuvaty-windows-terminal', permanent: true, locale: false },
      { source: '/yak-vstanovyty-wsl-windows', destination: '/yak-nalashtuvanty-pidsystemu-windows-dlya-linux-wsl', permanent: true, locale: false },
      { source: '/sfc-dism-vidnovlennya-systemnykh-fayliv', destination: '/sfc-dism-povnyy-gaid', permanent: true, locale: false },
      { source: '/yak-pereviryty-zhurnaly-podiy-windows', destination: '/yak-korystuvatys-zhurnalom-podiy-windows', permanent: true, locale: false },
      { source: '/yak-ochystyty-zhurnaly-podiy-windows', destination: '/yak-korystuvatys-zhurnalom-podiy-windows', permanent: true, locale: false },
      { source: '/yak-zashyfruvaty-dysk-bitlocker', destination: '/yak-uvimknuty-bitlocker-windows-11', permanent: true, locale: false },
      { source: '/en/gpo-nalashtuvannya-polityky-paroliv', destination: '/gpo-nalashtuvannya-polityky-paroliv', permanent: true, locale: false },
    ]
  },
}

module.exports = nextConfig
