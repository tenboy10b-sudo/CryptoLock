# CryptoLock v5 — Список змін

## Виправлені баги

### Критичні
- **[slug].js**: видалено дублікат `const s = {}` (був двічі в кінці файлу — SyntaxError)
- **Layout.js**: горизонтальний скрол на мобайлі виправлено — `socialRow` і `nav` тепер ховаються через надійні CSS-класи (`.nav-desktop`, `.nav-social`, `.nav-divider`, `.nav-burger`), а не крихкий `[style*="..."]` селектор
- **globals.css**: два конфліктуючих медіа-брейкпоїнти для бургера (640px і 680px) — залишено один (680px)

### Важливі
- **next.config.js**: прибрано `images: { unoptimized: true }` — тепер Next.js оптимізує зображення (WebP, lazy load, srcset → покращує LCP)
- **next.config.js**: додані Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
- **globals.css**: `overflow-x: hidden` на body — додатковий захист від горизонтального скролу

## SEO покращення

### Структуровані дані (JSON-LD)
- **Layout.js**: `Organization` + `WebSite` schema на кожній сторінці
- **[slug].js**: `Article` schema з обов'язковим полем `image` (потрібно для Rich Results)
- **[slug].js**: `BreadcrumbList` schema (Google може показати хлібні крихти в сніпеті)
- **tags/[tag].js**: `BreadcrumbList` schema
- **index.js**: `WebPage` schema
- **about.js**: `AboutPage` schema

### Meta теги
- **Layout.js**: додано `hreflang="uk"` і `hreflang="x-default"` (правильна прив'язка мови)
- **Layout.js**: `og:image:width/height` (1200×630)
- **Layout.js**: `og:locale="uk_UA"`
- **Layout.js**: `twitter:card` змінено на `summary_large_image` (більше фото в картці)
- **Layout.js**: явний `robots: index, follow, max-image-preview:large, max-snippet:-1`
- **tags/index.js**: унікальний title і description
- **tags/[tag].js**: унікальний title і description для кожного тега
- **about.js**: унікальний description з ключовими словами
- **privacy.js**: canonical + унікальний description

### Sitemap
- **sitemap.xml.js**: додані сторінки тегів `/tags/[tag]` (раніше відсутні)
- **next-sitemap.config.js**: видалено — усуває дублювання sitemap

### Семантика та доступність (A11y → SEO-сигнал)
- **PostCard.js**: `aria-label` на посиланні-картці, `<time>` елемент для дати
- **[slug].js**: `<time>` для дат публікації, `aria-current="page"` на breadcrumb, `<article>` обгортка
- **index.js**: `aria-label` на секціях і nav, `role="list"` на списках
- **tags/[tag].js**: breadcrumbs з `aria-label`, `aria-current`
- **Layout.js**: `aria-expanded` і `aria-controls` на бургері, `aria-label` на logo link, copyright у footer

### Контент (E-E-A-T)
- **about.js**: розширений опис з конкретними темами → сигнал авторитетності
- **Footer**: додано copyright рядок

### [slug].js
- **bcCur**: `whiteSpace` замінено з `nowrap` на `wordBreak: 'break-word'` — заголовки більше не обрізаються на мобайлі

## Що залишилось зробити (поза кодом)
1. Підключити власний домен (заміни URL в `site.config.js`)
2. Зареєструвати сайт у Google Search Console
3. Додати `gaId` в `site.config.js` для GA4
4. Для унікальних OG-зображень статей — розглянь Vercel OG (@vercel/og)

---

## v5.1 — Логотип + Автопостінг

### Логотип
- `logo.jpg` → `logo.png` з прозорим фоном (видалено білий фон через маскування)
- `Layout.js`: прибрано `border` і `borderRadius` з контейнера логотипу — тепер логотип виглядає органічно на будь-якому фоні
- Всі посилання на logo.jpg замінено на logo.png (Layout.js, [slug].js, sitemap)

### Автопостінг — виправлена логіка незапублікованих статей
- **`lib/posts.js`**: `getAllSlugs()` тепер повертає тільки опубліковані slug. Незапубліковані статті не отримують URL взагалі.
- **`pages/[slug].js`**: видалено `isPending` логіку з noindex-заглушкою. Тепер незапублікована стаття → `notFound: true` → чиста 404 для Google. Жодного негативного сигналу.
- **`README-AUTOPOST.md`**: повністю переписано з workflow для замовлення статей у Claude

### Нові файли
- `_templates/ШАБЛОН-СТАТТІ.md` — готовий шаблон з frontmatter
- `_templates/СПИСОК-ТЕГІВ.md` — всі наявні теги для точного використання
