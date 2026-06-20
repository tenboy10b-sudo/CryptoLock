# 📚 Технічна документація — cryptolockua.com

> Повний технічний опис проекту для відтворення або підтримки аналогічного сайту.
> Дата: травень 2026

---

## 🏗️ ЗАГАЛЬНА АРХІТЕКТУРА

```
GitHub репо (код + контент)
    ↓  push → автодеплой
Vercel (хостинг + CDN)
    ↓
cryptolockua.com
    ↓
Google Search Console (SEO моніторинг)
    ↓  щонеділі автоматично
GitHub Actions → GitHub Issue (SEO звіт)
```

---

## 📍 ДЕ ЩО ЗНАХОДИТЬСЯ

| Що | Де |
|----|-----|
| Код і контент | github.com/tenboy10b-sudo/CryptoLock |
| Хостинг | vercel.com (проект CryptoLock) |
| Домен | namecheap.com (cryptolockua.com) |
| Аналітика | analytics.google.com (G-FQJ7326JW0) |
| SEO моніторинг | search.google.com/search-console |
| GSC API налаштування | console.cloud.google.com (проект cryptolock-seo) |
| Telegram канал | t.me/cryptolock888 |
| Telegram бот AuditShield | @AuditShield_01_Bot |

---

## 🔧 ТЕХНІЧНИЙ СТЕК

| Компонент | Технологія | Версія |
|-----------|-----------|--------|
| Фреймворк | Next.js (Pages Router) | 14.2.3 |
| Мова | JavaScript/React | 18 |
| Стилі | CSS-in-JS (inline styles) | — |
| Парсинг MD | gray-matter + remark | — |
| Хостинг | Vercel | — |
| CDN | Vercel Edge Network | — |
| Контент | Markdown файли в репо | — |
| i18n | Next.js built-in | uk + en |

---

## 📁 СТРУКТУРА РЕПОЗИТОРІЮ

```
CryptoLock/
│
├── .github/
│   └── workflows/
│       ├── content.yml      ← Telegram бот (контентні пости)
│       ├── promo.yml        ← Telegram бот (промо пости)
│       └── seo-report.yml   ← Автоматичний SEO звіт (щонеділі)
│
├── pages/                   ← Next.js сторінки
│   ├── index.js             ← Головна (список статей)
│   ├── [slug].js            ← Шаблон статті
│   ├── about.js             ← Про нас
│   ├── privacy.js           ← Політика конфіденційності
│   ├── 404.js               ← Кастомна 404 сторінка
│   ├── search.js            ← Пошук
│   ├── sitemap.xml.js       ← Динамічний sitemap
│   ├── robots.txt.js        ← robots.txt
│   ├── tags/
│   │   ├── index.js         ← Всі теги
│   │   └── [tag].js         ← Статті за тегом
│   ├── tools/
│   │   ├── index.js         ← Хаб інструментів (/tools)
│   │   ├── auditshield.js   ← AuditShield (/tools/auditshield)
│   │   ├── windows-error-decoder.js  ← Декодер помилок
│   │   ├── powershell-commands.js    ← PowerShell довідник
│   │   ├── windows-event-id.js      ← Event ID довідник
│   │   ├── password-generator.js    ← Генератор паролів
│   │   └── subnet-calculator.js     ← Subnet калькулятор
│   └── api/
│       └── search-index.js  ← API для пошуку
│
├── components/
│   ├── Layout.js            ← Головний layout (head, nav, footer)
│   ├── PostCard.js          ← Картка статті в списку
│   ├── SearchBar.js         ← Пошуковий рядок
│   └── TableOfContents.js   ← Зміст статті
│
├── lib/
│   └── posts.js             ← Функції читання MD файлів
│
├── posts/                   ← Українські статті (306 файлів)
│   └── [slug].md
│
├── posts-en/                ← Англійські статті (101 файл)
│   └── [slug].md
│
├── scripts/
│   └── gsc_analyzer.py      ← GSC аналізатор (запускається Actions)
│
├── _templates/              ← Шаблони для нових статей
│
├── site.config.js           ← Конфігурація сайту (назва, соцмережі, nav)
├── next.config.js           ← Next.js конфіг (i18n, redirects, headers)
├── next-sitemap.config.js   ← Конфіг для next-sitemap
├── package.json             ← Залежності проекту
├── add-tool-links.py        ← Скрипт додавання посилань на інструменти
├── bot.py                   ← Telegram бот для постів
├── requirements.txt         ← Python залежності (для бота і скриптів)
└── reports/                 ← Автоматичні SEO звіти (генеруються Actions)
```

---

## 📝 ФОРМАТ СТАТЕЙ (Markdown)

Кожна стаття — це `.md` файл з frontmatter:

```markdown
---
title: "Назва статті"
date: "2026-04-01"           ← дата написання
publishDate: "2026-04-01"    ← дата публікації (якщо в майбутньому — не показується)
updated: "2026-05-24"        ← дата оновлення (впливає на сортування)
description: "Опис 140-160 символів для Google сніпету"
tags: ["windows", "безпека", "налаштування"]
readTime: 5                  ← хвилини читання
translatesEn: "how-to-..."  ← slug EN версії (для перемикача мов)
translatesUk: "yak-..."     ← slug UK версії (тільки в EN файлах)
---

# Контент статті тут
```

**Правила назв файлів:**
- UK статті: `yak-zrobyty-shchos-windows.md` (транслітерація)
- EN статті: `how-to-do-something-windows.md`
- Slug = ім'я файлу без `.md`

**Де зберігаються:**
- UK: `posts/`
- EN: `posts-en/`

**Публікація:**
- Стаття з'являється на сайті автоматично коли `publishDate` настає
- Cron-job.org перезапускає сайт о 00:05 щодня (щоб нові статті з'явились)

---

## 🌐 МАРШРУТИ (URLs)

| URL | Файл | Опис |
|-----|------|------|
| `/` | `pages/index.js` | Головна — список UK статей |
| `/:slug` | `pages/[slug].js` | UK стаття |
| `/en/:slug` | `pages/[slug].js` | EN стаття (locale=en) |
| `/tags` | `pages/tags/index.js` | Всі теги |
| `/tags/:tag` | `pages/tags/[tag].js` | Статті за тегом |
| `/tools` | `pages/tools/index.js` | Хаб інструментів |
| `/tools/:tool` | `pages/tools/*.js` | Конкретний інструмент |
| `/about` | `pages/about.js` | Про нас |
| `/search` | `pages/search.js` | Пошук |
| `/sitemap.xml` | `pages/sitemap.xml.js` | Sitemap |
| `/robots.txt` | `pages/robots.txt.js` | robots.txt |

---

## 🔄 I18N (МОВИ)

Налаштовано в `next.config.js`:
```javascript
i18n: {
  locales: ['uk', 'en'],
  defaultLocale: 'uk',
  localeDetection: false,  // не перемикає автоматично по IP
}
```

- **UK** — дефолтна мова, URL без префіксу: `/slug`
- **EN** — з префіксом: `/en/slug`
- Перемикач мов з'являється якщо в frontmatter є `translatesEn`/`translatesUk`
- EN стаття без власного MD файлу → fallback на UK файл (але canonical правильний)

---

## ⚙️ КЛЮЧОВІ ФАЙЛИ КОНФІГУРАЦІЇ

### site.config.js
Головний конфіг сайту. Змінюй тут:
- Назву і опис сайту
- GA4 ID (`gaId`)
- Посилання соцмереж
- Навігацію (nav)

### next.config.js
- **i18n** — мови сайту
- **headers()** — заголовки безпеки і кешування
- **redirects()** — всі 301/302 редиректи (100+ штук)
  - www → non-www
  - Старий домен vercel.app → cryptolockua.com
  - EN теги → UK теги
  - EN URL без /en/ → /en/URL
  - Trailing slash → без slash
  - Виправлення опечаток в slug

### lib/posts.js
Функції для роботи зі статтями:
- `getAllPosts(locale)` — всі опубліковані статті
- `getPostBySlug(slug, locale)` — конкретна стаття
- `getAllTags(locale)` — всі теги з кількістю
- `getAllSlugs(locale)` — всі slug для статичної генерації

---

## 🚀 ДЕПЛОЙ

**Автоматичний** (при кожному `git push`):
1. Vercel отримує webhook від GitHub
2. Запускає `npm run build` (`next build`)
3. Деплоїть на Edge CDN
4. ~30-60 секунд до появи змін

**Команди для локальної розробки:**
```bash
npm run dev    # localhost:3000
npm run build  # перевірка що білд проходить
```

**Деплой нових статей:**
```bash
# Скопіюй .md файли в posts/ або posts-en/
git add .
git commit -m "Add new articles"
git push
# Vercel деплоїть автоматично
```

---

## 🤖 GITHUB ACTIONS

### 1. seo-report.yml — SEO Звіт
**Тригер:** Щонеділі о 08:00 UTC (10:00 Київ) + вручну

**Що робить:**
1. Підключається до Google Search Console API
2. Збирає дані за 28 днів (запити, сторінки, CTR, позиції)
3. Аналізує проблеми і можливості
4. Створює GitHub Issue зі звітом
5. Зберігає звіт в `reports/seo-YYYY-MM-DD.md`

**Secrets потрібні:**
- `GSC_TOKEN_JSON` — OAuth токен GSC
- `GITHUB_TOKEN` — автоматично є

**Як запустити вручну:**
GitHub → Actions → Weekly SEO Report → Run workflow

---

### 2. content.yml — Telegram контентний пост
**Тригер:** Тільки вручну (workflow_dispatch)

**Що робить:**
1. Читає статті з `posts/` і `posts-en/`
2. Генерує пост через Claude API
3. Публікує в Telegram канал
4. Зберігає що вже публікував в `published.json`

**Secrets потрібні:**
- `TELEGRAM_TOKEN` — токен бота від @BotFather
- `TELEGRAM_CHANNEL_ID` — ID або username каналу
- `ANTHROPIC_API_KEY` — Claude API ключ

---

### 3. promo.yml — Telegram промо пост
**Тригер:** Тільки вручну

**Що робить:** Те саме що content.yml але з промо типом посту (AuditShield реклама)

---

## 🔑 GITHUB SECRETS

Всі secrets: GitHub репо → Settings → Secrets and variables → Actions

| Secret | Що це | Де отримати |
|--------|-------|------------|
| `GSC_TOKEN_JSON` | OAuth токен Google Search Console | Запустити `auth.py` локально |
| `TELEGRAM_TOKEN` | Токен Telegram бота | @BotFather в Telegram |
| `TELEGRAM_CHANNEL_ID` | ID Telegram каналу | @userinfobot або username |
| `ANTHROPIC_API_KEY` | Claude API ключ | console.anthropic.com |
| `GITHUB_TOKEN` | Автоматично є, не треба створювати | — |

---

## 📊 SEO НАЛАШТУВАННЯ

### Structured Data (JSON-LD)
Автоматично генерується в:
- `pages/index.js` → WebSite + SearchAction schema
- `pages/[slug].js` → Article + BreadcrumbList + FAQPage schema
- `pages/tools/*.js` → WebApplication або SoftwareApplication schema

### FAQ Schema
Автоматична. Якщо стаття містить розділ `## Часті питання` з підзаголовками h3 — Google може показати FAQ rich snippet в результатах пошуку.

### Sitemap
Динамічний, генерується в `pages/sitemap.xml.js`:
- Всі UK статті з priority 0.7-1.0
- Всі EN статті
- Всі tools сторінки
- Статичні сторінки
- Топ-12 сторінок мають priority=1.0 і changefreq=weekly

### hreflang
В `components/Layout.js` — автоматично для всіх сторінок:
```html
<link rel="alternate" hrefLang="uk" href="https://cryptolockua.com/slug" />
<link rel="alternate" hrefLang="en" href="https://cryptolockua.com/en/slug" />
<link rel="alternate" hrefLang="x-default" href="https://cryptolockua.com/slug" />
```

### Canonical
В `pages/[slug].js` — правильний для UK і EN:
```javascript
const postUrl = locale === 'en'
  ? `${SITE}/en/${post.slug}`
  : `${SITE}/${post.slug}`
```

---

## 🛠️ КОРИСНІ СКРИПТИ

### add-tool-links.py
Додає посилання на інструменти в статті автоматично.

```bash
cd C:\Users\rr\Desktop\pctips-template
python add-tool-links.py
```

**Що робить:** Проходить по всіх статтях, знаходить тематичні (безпека, помилки, PowerShell тощо) і додає блок з посиланням на відповідний інструмент перед розділом "Резюме".

**Запускати після:** кожного нового інструменту або батчу статей.

---

### scripts/gsc_analyzer.py
SEO аналізатор. Зазвичай запускається автоматично через GitHub Actions.

Для локального запуску:
```bash
export GSC_TOKEN_JSON='{"token":...}'
python scripts/gsc_analyzer.py
```

---

### bot.py
Telegram бот для публікації постів.

```bash
# .env файл потрібен:
TELEGRAM_TOKEN=...
TELEGRAM_CHANNEL_ID=...
ANTHROPIC_API_KEY=...

python bot.py
```

---

## 🔧 ЯК ВНОСИТИ ЗМІНИ

### Додати нову статтю
1. Створи `.md` файл в `posts/` (UK) або `posts-en/` (EN)
2. Заповни frontmatter (title, date, publishDate, description, tags, readTime)
3. `git add . && git commit -m "Add article" && git push`

### Додати нову сторінку-інструмент
1. Створи `pages/tools/назва.js`
2. Додай в список в `pages/tools/index.js`
3. Додай URL в sitemap (`pages/sitemap.xml.js` → staticPages)
4. Запусти `add-tool-links.py` щоб додати посилання в статті

### Змінити навігацію
`site.config.js` → масив `nav`

### Додати redirect
`next.config.js` → масив в `redirects()`:
```javascript
{ source: '/старий-url', destination: '/новий-url', permanent: true }
```

### Змінити meta description сайту
`site.config.js` → поле `description`

### Оновити GSC токен (раз на рік)
1. Запусти `auth.py` локально
2. Скопіюй новий `token.json`
3. GitHub → Settings → Secrets → `GSC_TOKEN_JSON` → Edit

---

## 📈 МОНІТОРИНГ

### Google Search Console
- search.google.com/search-console
- Ресурс: `cryptolockua.com` (Domain property)
- Перевіряти: Ефективність, Індексування → Сторінки (404, canonical проблеми)

### Google Analytics 4
- analytics.google.com
- ID: G-FQJ7326JW0
- Відстежує: сесії, джерела трафіку, конверсії

### Автоматичний SEO звіт
- Щонеділі о 10:00 → GitHub Issue
- github.com/tenboy10b-sudo/CryptoLock/issues
- Містить: позиції, CTR, quick wins, рекомендації

### Vercel деплой статус
- vercel.com → проект CryptoLock → Deployments
- Кожен push → новий деплой (~30-60 сек)
- При помилці — email від Vercel

---

## 🆕 ЯК ВІДТВОРИТИ АНАЛОГІЧНИЙ САЙТ

### 1. Підготовка (1 день)
```bash
# Клонуй або форкни репо
git clone https://github.com/tenboy10b-sudo/CryptoLock.git my-site
cd my-site
npm install
```

### 2. Конфігурація (30 хв)
- `site.config.js` — змінити назву, домен, соцмережі, GA4 ID
- `next.config.js` — прибрати старі redirects, залишити базові
- `posts/` і `posts-en/` — видалити всі статті, додати свої

### 3. Хостинг на Vercel (15 хв)
1. vercel.com → New Project → Import Git Repository
2. Вибрати репо
3. Framework: Next.js (автовизначення)
4. Deploy
5. Settings → Domains → додати свій домен

### 4. Google Search Console (30 хв)
1. search.google.com/search-console → Add property
2. Підтвердити через DNS (Namecheap: Advanced DNS → TXT record)
3. Подати sitemap: `https://your-domain.com/sitemap.xml`

### 5. GitHub Actions (1 год)
- Налаштувати secrets: `TELEGRAM_TOKEN`, `ANTHROPIC_API_KEY` тощо
- Для SEO звіту: створити Google Cloud проект, OAuth client, запустити `auth.py`

### 6. Мінімальний зміст для запуску
- 10-20 статей в `posts/`
- Заповнений `site.config.js`
- Хоча б одна сторінка в `/tools/`

---

## ⚡ ШВИДКІ КОМАНДИ

```bash
# Локальна розробка
npm run dev

# Перевірка білду перед пушем
npm run build

# Деплой нових статей
git add . && git commit -m "New articles" && git push

# Додати посилання на інструменти в статті
python add-tool-links.py

# Публікувати в Telegram вручну
python bot.py

# Запустити SEO звіт вручну
# GitHub → Actions → Weekly SEO Report → Run workflow
```

---

## 📞 КОНТАКТИ І ДОСТУПИ

| Сервіс | Акаунт |
|--------|--------|
| GitHub | tenboy10b-sudo |
| Vercel | (через GitHub OAuth) |
| Google (GSC, Analytics, Cloud) | tenboy.10b@gmail.com |
| Namecheap (домен) | (власний акаунт) |
| Telegram канал | @cryptolock888 |

---

*Документація актуальна станом на травень 2026.*
*При змінах в архітектурі — оновлювати цей файл.*

---

## 📋 ЖУРНАЛ ЗМІН (сесії з Claude)

> Цей розділ оновлюється після кожної робочої сесії щоб нова сесія мала повний контекст.

---

### Сесія 1 (квітень–червень 2026) — Основна розробка

#### Що було зроблено:

**Технічні фікси (версія v5):**
- Виправлено горизонтальний скрол на мобайлі — `.nav-social`, `.nav-desktop`, `.nav-divider`ховаються через CSS-класи
- SearchBar повністю переписано — на мобайлі fullscreen overlay замість dropdown
- Виправлено React hydration error #418 (BookmarksNavLink SVG, ThemeToggle)
- `_document.js` — theme script перед рендером (без flash)
- `next.config.js` — Security headers, кешування зображень, прибрано `images: { unoptimized: true }`
- Виправлено дублікат `const s = {}` в `[slug].js` (SyntaxError)
- Footer контраст: `#94a3b8` → `#64748b` (accessibility 96→98)
- `PostCard.js` — додано `aria-label`, `<time>` element, `article` роль

**Соцмережі:**
- YouTube — прибрано
- TikTok — оновлено на `https://www.tiktok.com/@cryptolockua`

**SEO фікси:**
- 100+ redirects в `next.config.js` (404 → правильні URL)
- EN теги → UK теги
- Canonical дублікати виправлено

**Автоматизація:**
- Vercel Deploy Hook: `https://api.vercel.com/v1/integrations/deploy/prj_gb7whIAwmC0WhZ6oGgDGfpsL2IFo/E6JNVonNwc`
- cron-job.org: щодня о 00:05 → авторебілд Vercel (для планових статей)

---

#### Статистика контенту на кінець сесії 1:

| Мова | Кількість статей |
|------|-----------------|
| UK | ~344 |
| EN | ~142 |
| **Разом** | **~486** |

**Батчі статей написані за сесію (теми з Google Trends):**

| Батч | Теми | Дати публікації |
|------|------|----------------|
| batch-traffic | Відновлення, Update, Налаштування (6 статей UK+EN) | травень 2026 |
| batch-tools | Запис екрану, Git/GitHub (4 статті) | 2026-08-09, 2026-08-14 |
| batch-virt | Ventoy, VirtualBox (4 статті) | 2026-08-11, 2026-08-16 |
| batch-tools2 | TeamViewer, 7-Zip (4 статті) | 2026-08-18, 2026-08-19 |
| batch-dev | Python, Windows Server (4 статті) | серпень 2026 |
| batch-software | CCleaner, qBittorrent, VLC, WinRAR (8 статей) | 2026-08-23..26 |
| batch-apps | DS4Windows, GIMP, Telegram, Lightshot (8 статей) | 2026-08-27..30 |
| batch-final | OBS Studio, iTunes, Windows LTSC (6 статей) | 2026-09-01..03 |
| batch65 | Event Viewer, Backup, Notifications, Reset, Task Manager (10 статей) | 2026-05-01..05 |
| batch66 | Firewall rules, PowerToys, UAC (6 статей) | 2026-05-06..08 |
| batch67 | Windows Terminal, Local users, SSD opt (6 статей) | 2026-05-09..11 |
| batch68 | Windows 10→11 upgrade та ін. (розпочато) | 2026-05-12+ |

**Наступні вільні дати публікацій (на початок нової сесії):**
- EN → від `2026-05-12`
- UK → від `2026-05-22`

---

#### PageSpeed Insights результати (20 червня 2026):

| Метрика | Результат |
|---------|-----------|
| Ефективність | 92 |
| Доступність | 96 |
| Оптимальні методи | 96 |
| SEO | 100 |

**Проблеми виявлені:**
- 2 помилки 404 в консолі: `/gtag/js?id=G-FQJ7326JW0` і `chunks/main-f800….js`
- `/logo.webp` — TTL кешу None (Lighthouse бачить, але правило в next.config.js є — можливо Vercel override)
- Google Fonts 4 файли (~150 КіБ) — CLS 0.004, LCP затримка 670 мс
- CSS блокує рендер 160 мс
- Footer контраст низький: `#cbd5e1`

**Фікси застосовані (сесія 2 — 20 червня 2026):**
- `components/Layout.js`:
  - `footerCopyText` колір: `#cbd5e1` → `#475569` (доступність 96→100)
  - YouTubeIcon компонент видалено
  - socialLinks — тільки Telegram і TikTok
  - preconnect залишено тільки `fonts.gstatic.com`
- `next.config.js`:
  - Прибрано дублікат правила кешування зображень
- Архів: `pagespeed-fix.zip`

---

#### Робочий процес (важливо!):

**Деплой:**
```
git add .
git commit -m "опис змін"
git push
```
Vercel деплоїть **автоматично** після кожного push (~30-60 сек). Ніяких додаткових команд не треба.

**Папка проекту на ПК:** `C:\Users\rr\Desktop\pctips-template`

**VS Code** — використовується для роботи з репо.

---

#### Плани/TODO:

- [ ] Перевірити чому GA4 дає 404 (`/gtag/js?id=G-FQJ7326JW0`) — можливо неправильний ID в `site.config.js`
- [ ] Google Fonts → self-hosted або `font-display: swap` (зменшить LCP і CLS)
- [ ] Унікальні OG images для статей (зараз всі використовують `logo.png`)
- [ ] Person schema замість Organization для Article (E-E-A-T)
- [ ] Перевірити PageSpeed після деплою pagespeed-fix.zip (очікуємо доступність 100)
- [ ] Windhawk стаття (+50% Google Trends) — не написана
- [ ] Продовжити батчі статей від EN `2026-05-12`, UK `2026-05-22`

---

### Сесія 2 (20 червня 2026) — PageSpeed фікси + інфраструктура

#### Поточні проблеми інфраструктури:

**1. GitHub Actions — ЗАБЛОКОВАНО (з 19 червня 2026)**
- Тікет: github.com/support → #4498412
- Причина: abuse-detection (автоматичні workflows)
- Статус: очікуємо відповідь від Ivy (GitHub Support)
- Поки заблоковано: SEO звіт і Telegram бот не працюють через Actions
- Тимчасово: запускати `python bot.py` і `python scripts/gsc_analyzer.py` локально

**2. Vercel webhook — НЕ ПРАЦЮЄ (баг Vercel + GitHub App)**
- Автодеплой при `git push` зламаний через баг на стороні Vercel
- Рішення: після кожного push робити `vercel --prod` вручну
- Поточний workflow деплою:
```
git add .
git commit -m "опис змін"
git push
vercel --prod
```
- Коли виправлять — `vercel --prod` більше не потрібен

**3. Vercel Deploy Hook (резервний варіант)**
- URL: `https://api.vercel.com/v1/integrations/deploy/prj_gb7whIAwmC0WhZ6oGgDGfpsL2IFo/E6JNVonNwc`
- cron-job.org: щодня о 00:05 (для планових статей — працює незалежно від webhook)

---

#### Фікси застосовані в сесії 2:

**`components/Layout.js` + `next.config.js` → архів `pagespeed-fix.zip`:**
- Footer текст: `#cbd5e1` → `#475569` (accessibility 96 → очікуємо 100)
- YouTubeIcon компонент — видалено повністю
- socialLinks — тільки Telegram і TikTok (без YouTube)
- preconnect — залишено тільки `fonts.gstatic.com` (googleapis.com прибрано — був unused)
- next.config.js — прибрано дублікат правила кешування зображень

**Деплой цих фіксів:**
```
git add .
git commit -m "Fix: accessibility contrast, remove YouTube, fix preconnect, deduplicate cache headers"
git push
vercel --prod
```

---

#### DOCUMENTATION.md як пам'ять між сесіями:

**Як це працює:**
- Цей файл (`DOCUMENTATION.md`) зберігається в корені репо
- В кожній новій сесії Claude бачить його автоматично через "Project files"
- Після кожної сесії — Claude оновлює цей файл і дає архів для заміни
- Завжди замінювати файл в репо і пушити

**Щоб оновити після сесії:**
```
# замінити DOCUMENTATION.md в C:\Users\rr\Desktop\pctips-template\
git add DOCUMENTATION.md
git commit -m "docs: update session log"
git push
vercel --prod
```

