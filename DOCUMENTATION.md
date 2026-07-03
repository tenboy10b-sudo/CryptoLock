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


---

### Сесія 3 (22-30 червня 2026) — Hydration deep-fix + GSC recovery

#### Корінна причина hydration #418/#423/#425 — ЗНАЙДЕНА І ВИПРАВЛЕНА

Помилка існувала в кількох компонентах одночасно, виправляли послідовно:

1. **`components/Layout.js`** — дублікати preconnect (були і в Layout, і в _document), прибрано з Layout
2. **`pages/_document.js`** — залишено тільки `fonts.gstatic.com` preconnect, прибрано unused `fonts.googleapis.com` з Layout
3. **`components/SearchBar.js`** — `getBoundingClientRect()` викликався під час рендеру + `locale`-залежний рендер без mounted guard → додано `mounted` патерн, SSR рендерить статичну заглушку
4. **`components/PostCard.js`** — `toLocaleDateString()` форматує дати по-різному на сервері (Node.js) і клієнті → винесено форматування дати в `useEffect`, рендериться тільки на клієнті з `suppressHydrationWarning`
5. **`pages/index.js`** — `isEn = locale === 'en'` рендерився різний контент на сервері/клієнті через залежність від `useRouter().locale` без mounted guard → додано `mounted` патерн, до mount завжди `isEn = false`, додано `suppressHydrationWarning` на всі locale-залежні текстові вузли

**Результат:** PageSpeed Mobile 24 червня — 93 / 100 / 100 / 100, **0 помилок у консолі** (окрім незалежної GA4 проблеми). Раніше було 6+ помилок #418 на кожному завантаженні сторінки.

Архіви фіксів: `hydration-fix.zip` → `v2` → `v3` → `v4` (фінальна версія v4 містить усі 5 файлів).

#### GA4 — окрема нерозв'язана проблема

`https://www.googletagmanager.com/gtag/js?id=G-FQJ7326JW0` повертає **реальний 404** (підтверджено через DevTools Network, не блокувальник). Property `G-FQJ7326JW0` існує і активна в Google Analytics (Stream ID `14794677472`), але gtag.js файл для цього ID не віддається. Причина не з'ясована — можливо потрібно перестворити property або зв'язок між Analytics і тегом пошкоджений.

**Статус:** не виправлено. `gaId` в `site.config.js` поки що НЕ вимкнено (рішення відкладено). Якщо консоль-помилка заважає — закоментувати `gaId: ''` в `site.config.js`.

#### Validate Fix інцидент від 13 червня — повний таймлайн

- **13.06.2026** — за рекомендацією попередньої сесії запущено Validate Fix одночасно для всіх категорій проблем в GSC (70 сторінок 404 + 47 canonical + 41 redirect + 1 canonical conflict = 159 URL). Це визнана помилка — масовий запит навантажив crawl budget.
- **13-22.06** — GSC індексування "заморожене": 9+ днів жодна сторінка з Validate Fix не просканована, останнє оновлення розділу "Сторінки" застрягло на 12.06.
- **20.06** — найкраща стаття `/yak-nalashtuvanty-spilnyy-dostup-do-papky` випала з індексу, статус "Проскановано — наразі не проіндексовано", в деталях помилка #418 (стара версія коду).
- **22.06** — вручну подано запит на індексацію цієї статті через GSC → Перевірка URL.
- **23.06, ~00:00** — перший spike показів (1) в Ефективності — Google прийшов скенувати після hydration-фіксу.
- **24-29.06** — GSC поступово "розморожується": дата останнього оновлення в Ефективності зсувається до "4-6 годин тому", almost real-time знову. Але самі покази залишаються мізерними: 0-3 на добу.
- **27.06** — Google повторно сканує `/yak-nalashtuvanty-spilnyy-dostup-do-papky`, сторінка завантажується успішно, проте "Канонічна URL вибрана Google" — порожня, sitemap "не знайдено відповідних карт сайту" (ймовірно тимчасовий стан).
- **30.06** — SEO-звіт через `gsc_analyzer.py` (запущено вручну локально, бо GitHub Actions заблоковано) показує загальний тренд -94.6% за 28 днів, але це усереднення періоду 2-30 червня, де перші 13 днів — це "старий", ще здоровий трафік. Розбивка GSC Ефективності за 13-29.06 окремо показує справжню картину: стабільне плато 0-3 покази/день без видимого тренду росту, найпопулярніші запити — переважно випадкові/брендові (капслок, winlock, cryptolock), не тематичні SEO-запити.

**Поточний висновок:** офіційне "відновлення" ще не почалось по суті — GSC технічно ожив (індексує і оновлює дані), але органічний пошуковий трафік по цільових запитах залишається близько нуля. Це довше ніж очікувані 7-14 днів.

#### Знайдена і виправлена додаткова перешкода — Crawl-delay

В `pages/robots.txt.js` була директива `Crawl-delay: 1`. Хоч Googlebot офіційно ігнорує цю директиву, вона прибрана як можливий побічний негативний сигнал і щоб не сповільнювати сканування ботами які її таки враховують (Bing, Yandex). Архів: `robots-fix.zip`.

#### Sitemap — знайдені проблеми (НЕ виправлено, відкладено як не критичне)

1. Зламаний URL з кодуванням: `yak-nalashtuvanty-dvokrokovтХд╨У-autentyfikatsiyu-windows` та дублікат-варіант `yak-nalashtuvanty-dvokrokov#U2564#U0413-autentyfikatsiyu-windows` — обидва в sitemap, файл з пошкодженою назвою існує в `posts/`.
2. Дублікати статей в sitemap (обидві версії існують і обидві в sitemap):
   - `/en/how-to-enable-bitlocker` + `/en/how-to-enable-bitlocker-windows`
   - `/en/how-to-configure-static-ip-windows` + `/en/how-to-configure-static-ip-windows-11`
   - `/en/how-to-fix-windows-slow-boot` + `/en/how-to-fix-windows-11-slow-boot`

**TODO:** знайти і перейменувати/видалити файл з биткою назвою в `posts/`, прибрати дублікати з sitemap або redirect один на інший.

#### GitHub Actions — ще заблоковано, follow-up відправлено

Тікет #4498412 без відповіді тиждень після першої відповіді Ivy. Відправлено повторний follow-up з детальним описом усіх трьох workflow (seo-report.yml — щотижня автоматично; content.yml і promo.yml — лише вручну, НЕ за розкладом, виправлено помилку з попереднього повідомлення де було сказано "3 рази на день").

**Тимчасове рішення для роботи без Actions:**
```
cd C:\Users\rr\Desktop\pctips-template
python -m pip install google-api-python-client google-auth-oauthlib google-auth-httplib2
set GSC_TOKEN_JSON={однорядковий JSON з token.json}
python scripts/gsc_analyzer.py
```
Працює — звіт за 30.06 згенеровано успішно цим способом.

⚠️ **Безпека:** токен з `token.json` (включно з `client_secret`) був вставлений в чат відкритим текстом під час сесії 3. Рекомендовано перегенерувати токен (`python auth.py`) при першій нагоді.

#### SEO-звіт 30.06.2026 — ключові цифри (період 02.06-30.06, змішаний до/після інциденту)

- Покази: 1526, Кліки: 20, CTR: 1.31%, Середня позиція: 18.5
- Топ-3: 1 сторінка (`/yak-vykorystovuvaty-robocopy-windows`, поз. 3)
- Топ-10: 29 сторінок (переважно "старий" трафік з 1-13 червня)
- Найкраща сторінка за весь період: `/yak-nalashtuvanty-spilnyy-dostup-do-papky` — 74 покази, поз. 8.1
- Quick wins: `/windows-event-id-shpargalka` (поз. 6, CTR лише 3.6% — потрібно покращити title/description); `/en/how-to-configure-static-ip-windows-11` (поз. 16.3, близько до топ-10)

#### Поточний стан інфраструктури (на кінець сесії 3, 30.06.2026)

- ✅ Hydration-помилки повністю усунені, PageSpeed 93/100/100/100
- ✅ Sitemap технічно валідний (окрім дублікатів/зламаного URL вище)
- ✅ Crawl-delay прибрано
- ✅ GSC знову оновлюється в реальному часі (раніше — 12 днів застою)
- ❌ Органічний трафік не відновився — плато 0-3 покази/день з 13.06
- ❌ GA4 досі дає 404 на gtag.js, причина не з'ясована
- ❌ GitHub Actions досі заблоковано (тікет #4498412)
- ❌ Vercel webhook автодеплой досі під питанням — `vercel --prod` лишається обов'язковим кроком після кожного `git push`

#### TODO на наступну сесію

- [ ] Перевірити чи GitHub Support відповів на follow-up
- [ ] Перевірити динаміку показів за 7 днів — чи з'явився тренд росту після прибирання Crawl-delay
- [ ] З'ясувати причину GA4 404 (можливо перестворити property)
- [ ] Знайти і виправити файл з пошкодженою назвою (dvokrokov...) в posts/
- [ ] Прибрати дублікати з sitemap (bitlocker, static-ip, slow-boot варіанти)
- [ ] Покращити title/description для `/windows-event-id-shpargalka` (низький CTR при непоганій позиції)
- [ ] Перегенерувати GSC OAuth токен (стара версія засвічена в чаті)
- [ ] Якщо органічний трафік не відновиться до ~7 липня — розглянути чи є додаткові причини окрім Validate Fix (можливо ручна дія / Manual Action в GSC → Security & Manual Actions варто перевірити)


---

### Сесія 3 (продовження) — www domain fix + GA4 повна заміна property

#### www.cryptolockua.com був відсутній у Vercel Domains

GSC → Налаштування → Статистика сканування → Хости показав "З'єднання із сервером — Висока частота помилок минулого тижня" для хоста `www.cryptolockua.com`. Перевірка Vercel → Settings → Domains показала що `www.cryptolockua.com` взагалі не зареєстрований як домен проекту — існував тільки `cryptolockua.com` і `crypto-lock-five.vercel.app`. Через це Google отримував помилки з'єднання при спробі підключитись до www-версії (TCP/SSL рівень, до того як спрацював би код-redirect в `next.config.js`, бо запит ніколи не доходив до застосунку).

**Виправлено:** додано домен `www.cryptolockua.com` у Vercel → Domains з налаштуванням **308 Permanent Redirect → cryptolockua.com**. SSL-сертифікат згенерувався автоматично протягом ~15 хв.

#### GA4 — стара property остаточно непридатна, створено нову

Діагностика підтвердила: `gtag.js?id=G-FQJ7326JW0` давав справжній 404 (перевірено через DevTools Network, не блокувальник). GA4 Realtime звіт для старої property показував **0 активних користувачів** навіть при власному відвідуванні сайту — тобто жодні дані взагалі не збирались увесь час існування сайту.

**Рішення:** створено нову GA4 property з нуля.
- Назва ресурсу: `cryptolockua.com`
- Категорія: Computers & Electronics, розмір: 1-10
- Бізнес-ціль: Аналіз трафіку вебсайту
- Платформа: Web, URL `cryptolockua.com`
- **Новий Measurement ID: `G-FV18M8XP3S`** (замінює зламаний `G-FQJ7326JW0`)

Оновлено `gaId` в `site.config.js`. Після деплою: DevTools Network підтвердив `gtag/js?id=G-FV18M8XP3S` → **200 OK**. GA4 Realtime звіт для нової property одразу показав активних користувачів, перегляди сторінок, події `page_view`/`first_visit`/`session_start` — **відстеження працює коректно вперше за весь час існування сайту**.

**Важливо:** стара property `G-FQJ7326JW0` (Stream ID `14794677472`) залишається в Google Analytics як мертва/непрацююча — можна видалити пізніше, не критично.

#### Розслідування першопричини падіння — повний ланцюжок подій

Через аналіз історії komітів GitHub (не тільки GSC даних) встановлено точнішу хронологію:

- **5 червня** — "MASTER UPDATE: dark mode, bookmarks, share, tools, PWA, OG, comments" — масштабний реліз одночасно з багатьма новими фічами
- **6-8 червня** — серія з 20+ комітів "Fix dark mode: ..." — це вже симптом, не причина: масовий реліз вийшов нестабільним і вимагав негайних патчів
- **7-8 червня** — перші спроби виправити hydration #418 ("Fix hydration #418: mounted guard..." 7 червня, "Fix: add ThemeToggle + BookmarksNavLink..." 8 червня) — спроби були, але повністю проблему не закрили (інші hydration джерела в SearchBar/PostCard/index.js залишились до 22 червня)
- **Графік "Статистика сканування" в GSC** показує що запити на сканування впали з рівня 100-370/день до близько 0-20/день саме **з 9 червня** — на день раніше офіційно визнаної дати інциденту (13 червня)
- **13 червня** — Validate Fix запущено для 159 URL одночасно (вже описано вище) — накладається на вже ослаблений crawl rate і остаточно "заморожує" GSC індексування на 9+ днів
- **15 червня** — ще одна спроба фіксу hydration ("Fix React hydration #418: suppressHydrationWarning, remove broken font preload")
- **18 червня** — "Remove conflicting robots.txt from public folder" — видалено дублюючий статичний robots.txt який міг конфліктувати з динамічним `pages/robots.txt.js`
- **22-24 червня** (сесія 3 цього журналу) — корінь нарешті повністю усунутий через 4 файли (Layout, _document, SearchBar, PostCard, index.js)

**Висновок:** справжній початок проблеми — 5-8 червня (надмірно великий одночасний реліз без належного тестування hydration), а не 13 червня як вважалось раніше. Validate Fix 13 червня лише підсилив вже існуючу проблему. Це означає що Google спостерігав нестабільний/помилковий сайт довше ніж думали — приблизно **2.5 тижні** (5-22 червня), а не 9 днів.

#### Service Worker — перевірено, НЕ є причиною проблеми

`public/sw.js` використовує коректну стратегію: HTML — Network First (завжди свіжий контент), `_next/static/` — Cache First (безпечно, бо файли мають hash у назві й автоматично "застарівають" при новому деплої), стара версія кешу видаляється автоматично в `activate` event. SW виключено з підозрюваних.

#### Підтверджено через офіційні перевірки GSC — санкцій немає

- Заходи вжиті вручну (Manual Actions): **Проблем не виявлено**
- Проблеми з безпекою (Security Issues): **Проблем не виявлено**

Це остаточно підтверджує що падіння трафіку — наслідок суто технічних причин (hydration + Validate Fix + відсутній www domain), а не будь-якої санкції з боку Google.

#### Оновлений підсумковий стан інфраструктури (кінець сесії 3)

- ✅ Hydration-помилки повністю усунені (справжня причина: 5-8 червня, не 13 червня)
- ✅ Sitemap технічно валідний (дублікати/зламаний URL — низький пріоритет, відкладено)
- ✅ Crawl-delay прибрано з robots.txt
- ✅ www.cryptolockua.com доданий у Vercel з 308 redirect, SSL активний
- ✅ GA4 повністю замінено на нову property `G-FV18M8XP3S`, відстеження працює і підтверджено в Realtime
- ✅ GSC знову оновлюється в реальному часі
- ✅ Manual Actions — чисто
- ✅ Security Issues — чисто
- ❌ Органічний трафік ще не відновився — плато 0-3 покази/день з середини червня (станом на 30.06)
- ❌ GitHub Actions досі заблоковано (тікет #4498412, follow-up відправлено 30.06, відповіді ще немає)
- ❌ Vercel webhook автодеплой — статус незрозумілий (можливо вже працює сам, varto перевірити явно)
- ⚠️ Старий OAuth токен GSC засвічений в чаті сесії 3 — рекомендовано перегенерувати

#### Оновлений TODO

- [ ] Перевірити чи GitHub Support відповів на follow-up тікету #4498412
- [ ] Перевірити динаміку показів GSC за тиждень після всіх фіксів (контрольна точка ~7 липня)
- [ ] Перевірити явно чи Vercel webhook автодеплой вже відновився (зробити тестовий push без `vercel --prod` і подивитись чи задеплоїться само)
- [ ] Видалити стару непрацюючу GA4 property `G-FQJ7326JW0` (не критично, для порядку)
- [ ] Знайти і виправити файл з пошкодженою назвою (dvokrokov...) в posts/
- [ ] Прибрати дублікати з sitemap (bitlocker, static-ip, slow-boot варіанти)
- [ ] Покращити title/description для `/windows-event-id-shpargalka` (CTR 3.6% при поз. 6)
- [ ] Перегенерувати GSC OAuth токен (token.json вставлявся в чат відкритим текстом)
- [ ] Розглянути стратегію нарощування зовнішніх посилань (зараз 0 backlinks — структурна слабкість, довгострокова робота)


---

### Сесія 3 (продовження 2) — Повний аудит репозиторію через ZIP-архів

#### Метод перевірки

Отримано повний ZIP-архів репозиторію (`CryptoLock-main.zip`, GitHub → Code → Download ZIP) і проведено систематичну перевірку всіх React-компонентів і сторінок на патерни, що спричиняють hydration mismatch: `toLocaleDateString`, `getBoundingClientRect`, `localStorage`, прямі звернення до `window`/`document` поза `useEffect`, `locale`-залежний рендер без mounted-guard.

**Перевірені файли:** `Layout.js`, `SearchBar.js`, `PostCard.js`, `TableOfContents.js`, `index.js`, `_app.js`, `_document.js`, `bookmarks.js`, `search.js`, `links.js`, `about.js`, `privacy.js`, `404.js`, `pages/[slug].js`, `pages/tags/*`, `pages/tools/*`, `lib/posts.js`.

#### КРИТИЧНА ЗНАХІДКА: pages/[slug].js — пропущена hydration-помилка на 600+ сторінках статей

**Що знайдено:** в шаблоні сторінки статті (`pages/[slug].js`, рядки 301 та 303) функція `fmt(date, locale)`, яка викликає `new Date(d).toLocaleDateString(...)`, рендерилась **прямо в JSX без mounted-guard**:

```js
{post.date && <time dateTime={post.date} style={s.metaItem}>{fmt(post.date, locale)}</time>}
```

Це **та сама категорія проблеми**, яку вже виправляли в `PostCard.js` під час цієї ж сесії (де її поправили коректно — винесли форматування дати в `useEffect`). Але `[slug].js` — окремий файл, не використовує `PostCard` для рендеру власної дати публікації, тому фікс `PostCard.js` його не торкнувся.

**Чому це найважливіша знахідка дня:** `[slug].js` — це шаблон **кожної окремої статті**, тобто 600+ сторінок сайту. Усі попередні фікси сесії (`Layout`, `SearchBar`, `PostCard`, `index.js`) усували #418 на головній сторінці й елементах навігації, які видно на кожній сторінці — але сама стаття, основний контент-блок який Google індексує і ранжує, продовжувала кидати hydration-помилку при кожному рендері аж до цього моменту.

**Виправлено:** створено окремий компонент `PublishDate({ date, locale })` з mounted-патерном — `useState('')` стартове значення, форматування дати виконується тільки в `useEffect`, `suppressHydrationWarning` на `<time>`. Замінено обидва виклики `fmt()` в JSX (дата публікації та дата оновлення статті).

Архів: `slug-hydration-fix.zip` (1 файл — `pages/[slug].js`).

#### Чи через цю конкретну помилку впав сайт — аналіз причинно-наслідкового зв'язку

**Коротка відповідь: помилка існувала з 5-8 червня (як і всі інші hydration-баги цієї серії) і, ймовірно, була одним з НАЙВПЛИВОВІШИХ факторів падіння — можливо навіть більш значущим, ніж виправлені раніше Layout/SearchBar/PostCard помилки.**

**Чому саме ця помилка особливо шкідлива для SEO:**

1. **Масштаб ураження.** Помилки в `Layout.js`/`SearchBar.js` зачіпають елементи навколо контенту (навігація, пошук) — Google все одно міг прочитати основний текст статті навіть при їхньому збої. Але помилка в `[slug].js` виникає прямо всередині блоку статті, на тій самій сторінці що Google повинен проіндексувати як основний контент.

2. **Частота впливу.** Кожна з 600+ статей містить дату публікації — це означає що практично **кожне** сканування **кожної** статті Googlebot'ом викликало hydration mismatch. Це не поодинокий випадок на головній сторінці, а системна помилка яка повторювалась тисячі разів при кожному скануванні сайту.

3. **Збіг у часі.** Дата виникнення (5-8 червня, разом з MASTER UPDATE релізом) точно збігається з моментом коли почав падати crawl rate (графік "Статистика сканування" показує спад саме з 9 червня). Це не доказ прямої причинності, але сильна кореляція.

**Як саме могла виникнути:** під час "MASTER UPDATE" 5 червня одночасно додавались bookmarks, dark mode, PWA, OG-images, share buttons — і, ймовірно, в рамках цього ж рефакторингу хтось (попередня AI-сесія або сам розробник) додав чи змінив відображення дати статті, не врахувавши що `toLocaleDateString()` без явної локалі поводиться по-різному в Node.js (сервер, SSG-білд) і в браузері (клієнт) — це відома й часто пропускана пастка Next.js, тому що в development-режимі (`npm run dev`) ця різниця рідко проявляється, а в production-білді (Vercel) — завжди.

**Висновок:** ця помилка не є "новою" окремою причиною падіння — вона частина тієї ж самої серії hydration-багів 5-8 червня що вже задокументована вище в цьому журналі. Але її масштаб (600+ сторінок проти кількох спільних компонентів) робить її ймовірно **найвпливовішою окремою помилкою** з усієї серії. До сьогоднішнього виправлення вона залишалась активною попри попередні 4 раунди hydration-фіксів (20-24 червня), бо їх перевіряли тільки на головній сторінці (`index.js`) через PageSpeed, а не на сторінках статей.

#### Короткий підсумок і перспективи на майбутнє

**Що зроблено за сесію 3 (22-30 червня):**
- Повністю усунуто серію hydration-помилок React #418/#423/#425 — фінальна знахідка (`[slug].js`) закриває останню відому прогалину
- Знайдено і виправлено відсутній `www` домен у Vercel (помилки з'єднання для Google)
- Повністю замінено непрацюючу GA4 property — тепер реальні дані про відвідувачів збираються вперше за весь час
- Прибрано `Crawl-delay` з robots.txt
- Підтверджено відсутність Manual Actions і Security Issues в GSC
- Виключено Service Worker як причину проблеми (стратегія кешування коректна)
- Встановлено точнішу хронологію: справжній початок проблем — 5-8 червня (масовий "MASTER UPDATE" реліз), а не 13 червня (Validate Fix лише підсилив вже існуючу проблему)

**Перспективи відновлення:**

Тепер, коли і `[slug].js` нарешті виправлений, є підстави очікувати помітніше прискорення відновлення порівняно з попередніми фіксами — бо Google вперше за весь місяць зможе чисто прорендерити **сторінки самих статей**, не лише головну. Реалістичний прогноз:
- Перші ознаки покращення crawl rate — 3-7 днів після деплою цього фіксу
- Помітне зростання показів в GSC Ефективності — 1-2 тижні
- Повне відновлення до рівня "як було б без інциденту" — 3-4 тижні від моменту цього фіксу (тобто орієнтовно середина-кінець липня)

**Що могло б ще прискорити відновлення (довгострокові кроки, не термінові):**
- Розгляд стратегії здобуття зовнішніх посилань (зараз 0 backlinks)
- Завершення дрібних technical debt пунктів (дублікати sitemap, зламаний URL з кодуванням)
- Регулярний моніторинг без повторних масових Validate Fix запитів в GSC

**Контрольна точка:** перевірити GSC Ефективність і Статистику сканування через 5-7 днів після деплою цього фіксу (орієнтовно 5-7 липня) — це покаже чи дійсно `[slug].js`-виправлення дало помітний ефект.

#### Оновлений TODO (додано після знахідки [slug].js)

- [x] ~~Перевірити повний код репо на пропущені hydration-помилки~~ — зроблено, знайдено й виправлено `[slug].js`
- [ ] Задеплоїти `slug-hydration-fix.zip`
- [ ] Перевірити PageSpeed на 2-3 конкретних статтях (не лише головна) після деплою — підтвердити відсутність #418 саме на сторінках статей
- [ ] Контрольна точка по GSC — 5-7 липня
- [ ] Перевірити чи GitHub Support відповів на тікет #4498412
- [ ] Перевірити чи Vercel webhook автодеплой вже відновився сам
- [ ] Видалити стару непрацюючу GA4 property `G-FQJ7326JW0`
- [ ] Знайти і виправити файл з пошкодженою назвою (dvokrokov...) в posts/
- [ ] Прибрати дублікати з sitemap
- [ ] Покращити title/description для `/windows-event-id-shpargalka`
- [ ] Перегенерувати GSC OAuth токен
- [ ] Відновити доступ до акаунту Namecheap (загублено доступ, в процесі відновлення)
- [ ] Розглянути стратегію зовнішніх посилань


---

### Сесія 3 (продовження 3) — Фінальний фікс: style тег + BookmarkButton

#### Знайдено через dev режим (npm run dev)

Попередні методи діагностики (PageSpeed, інкогніто браузер) показували мінімізований стек трейс без назв компонентів. Запуск `npm run dev` локально дав точну відповідь — Next.js в dev режимі показує повний unminifield стек з точним описом проблеми.

#### Помилка 1: BookmarkButton в [slug].js — mounted guard

`BookmarkButton` в `[slug].js` рендерив `fill={saved?'currentColor':'none'}` і стилі залежні від `saved` прямо в JSX. `saved` стартує з `false` на сервері, але якщо стаття вже збережена в `localStorage` — клієнт бачить `true`. React бачив розбіжність → #418.

**Виправлено:** додано `mounted` патерн — до mount рендерить нейтральну кнопку без залежності від localStorage. Архів: `slug-hydration-fix-v2.zip`.

#### Помилка 2: BookmarksNavLink в Layout.js — locale href без mounted

`BookmarksNavLink` рендерив `href = isEn ? '/en/bookmarks' : '/bookmarks'` і `title` без mounted guard. На сервері locale може відрізнятись від клієнтського → розбіжність → #418.

**Виправлено:** `href` і `title` тепер залежать від `mounted` — до mount завжди `/bookmarks` і `Закладки`. Архів: `layout-bookmarks-fix.zip`.

#### Помилка 3 (КОРІННА): style тег з лапками в grid-template-areas

Dev режим показав точну причину:

```
Server: grid-template-areas: &quot;article sidebar&quot;
Client: grid-template-areas: "article sidebar"
```

В `[slug].js` був вбудований CSS через `<style>{`...`}</style>`. React/Next.js ескейпує HTML-символи всередині `<style>` на сервері (`"` → `&quot;`), але браузер при рендері читає реальні лапки. Різниця між `&quot;article sidebar&quot;` (сервер) і `"article sidebar"` (клієнт) спричиняла hydration mismatch на КОЖНІЙ сторінці статті.

**Виправлено:** `<style>{`...`}</style>` → `<style dangerouslySetInnerHTML={{ __html: `...` }} />`. З `dangerouslySetInnerHTML` React не ескейпує вміст і сервер/клієнт рендерять ідентичний CSS.

Архів: `slug-fix-v3.zip`.

**Перевірено інші файли на ту ж проблему:**
- `tools/port-checker.js` — `<style>{`...`}</style>` є, але CSS без лапок (тільки `from/to`) → безпечно
- `links.js` — `<style>{`...`}</style>` є, але CSS з одинарними лапками в `@import url('...')` → безпечно
- Тільки `[slug].js` мав проблему з подвійними лапками в `grid-template-areas`

#### Фінальне підтвердження — PageSpeed на сторінці статті

Після деплою `slug-fix-v3.zip` перевірено PageSpeed на:
`https://cryptolockua.com/yak-nalashtuvanty-spilnyy-dostup-do-papky`

**Результат: Оптимальні методи — 100%** ✅

Консоль браузера (інкогніто) — чиста, жодних помилок #418/#423/#425.

#### Повний список виправлених hydration-помилок (хронологія сесії 3)

| # | Файл | Проблема | Архів |
|---|------|----------|-------|
| 1 | Layout.js | ThemeToggle без mounted guard | hydration-fix-v2.zip |
| 2 | SearchBar.js | locale рендер + getBoundingClientRect без mounted | hydration-fix-v2.zip |
| 3 | PostCard.js | toLocaleDateString() в JSX | hydration-fix-v3.zip |
| 4 | index.js | locale-залежний контент без mounted | hydration-fix-v4.zip |
| 5 | [slug].js | toLocaleDateString() в JSX (дата статті) | slug-hydration-fix.zip |
| 6 | [slug].js | BookmarkButton saved-стан без mounted | slug-hydration-fix-v2.zip |
| 7 | Layout.js | BookmarksNavLink href/title locale без mounted | layout-bookmarks-fix.zip |
| 8 | [slug].js | style тег з &quot; vs " | slug-fix-v3.zip |

#### На скільки % ця помилка (style тег) вплинула на падіння показів

Чесна відповідь: неможливо виміряти точний відсоток. Але можна оцінити відносний вплив порівняно з іншими:

**Чому style тег, ймовірно, був найвпливовішою помилкою:**

1. **Масштаб** — зачіпала кожну з 600+ сторінок статей (на відміну від помилок в Layout/SearchBar що зачіпали навігацію навколо контенту)

2. **Критичність** — ця помилка (#418 через style) викидала React в режим "повного перерендеру клієнтом" (`the entire root will switch to client rendering`) — тобто вся сторінка перемальовувалась наново в браузері замість hydration. Для Googlebot це означає що він бачив сторінку в нестабільному стані.

3. **Діагноз** — помилка існувала з моменту додавання двоколонкового layout (серія "Fix dark mode" 8 червня) і залишалась **невиявленою** протягом усіх попередніх раундів фіксів (20-24 червня, 30 червня) бо тестували тільки PageSpeed на головній, а не на сторінках статей.

**Орієнтовна оцінка розподілу відповідальності за падіння:**

- Validate Fix (масовий запуск 13 червня) — ~30% впливу (crawl budget)
- Серія hydration-помилок разом (5-8 червня до сьогодні) — ~70% впливу
  - З них style тег (`&quot;`) — ймовірно ~40-50% від усієї серії, бо зачіпав основний контент
  - Решта помилок (Layout/SearchBar/PostCard/index/BookmarkButton) — ~20-30% разом

Але це оцінки, не точні цифри — Google не розкриває як саме hydration помилки впливають на ранжування. Впевнено можна сказати одне: **сьогодні, 1 липня 2026, вперше з 5 червня сайт технічно повністю чистий** — і це перша реальна можливість для Google побачити сайт таким яким він мав бути.

#### Оновлений TODO

- [x] ~~Виправити всі hydration-помилки~~ — ВИКОНАНО (8 джерел закрито)
- [x] ~~Перевірити PageSpeed на сторінці статті~~ — 100% Оптимальні методи
- [ ] Контрольна точка по GSC — 7-8 липня
- [ ] Перевірити чи GitHub Support відповів (#4498412)
- [ ] Відновити доступ до Namecheap і додати CNAME для www
- [ ] Видалити стару GA4 property G-FQJ7326JW0
- [ ] Виправити зламаний URL (dvokrokov...) в posts/
- [ ] Прибрати дублікати з sitemap
- [ ] Перегенерувати GSC OAuth токен


---

### Сесія 4 (1-2 липня 2026) — Повний аудит всіх файлів на hydration помилки

#### Метод роботи
Файли перевірялись по одному через копіювання коду з GitHub. Перевірялись на: `localStorage`, `toLocaleDateString()`, `getBoundingClientRect()`, `locale === 'en'` без mounted guard, `<style>` теги з лапками.

#### Результати перевірки по файлах

| Файл | Статус | Проблема | Виправлено |
|------|--------|----------|-----------|
| `pages/_app.js` | ✅ Чистий | — | — |
| `pages/_document.js` | ✅ Чистий | — | — |
| `pages/index.js` | ✅ Чистий | mounted патерн вже є | — |
| `components/PostCard.js` | ✅ Чистий | date у useEffect вже є | — |
| `components/SearchBar.js` | ✅ Чистий | mounted патерн вже є | — |
| `components/TableOfContents.js` | ✅ Чистий | — | — |
| `components/Layout.js` | ✅ Виправлено | locale в footer/nav/langSwitch без mounted; GA4 дублікат | layout-locale-fix.zip + layout-ga4-removed.zip |
| `pages/[slug].js` | ✅ Виправлено | style тег з лапками (КОРІННА), BookmarkButton без mounted, date у JSX | slug-fix-v3.zip |
| `pages/bookmarks.js` | ✅ Виправлено | locale без mounted в canonical/title | bookmarks-fix.zip |
| `pages/search.js` | ✅ Виправлено | locale без mounted | search-fix.zip |
| `pages/tags/[tag].js` | ✅ Чистий | getStaticPaths з locale — стабільний | — |
| `pages/tags/index.js` | ✅ Виправлено | locale без mounted | tags-index-fix.zip |
| `pages/about.js` | ✅ Виправлено | locale без mounted | about-fix.zip |
| `pages/privacy.js` | ✅ Виправлено | locale без mounted | privacy-fix.zip |
| `pages/404.js` | ✅ Виправлено | locale без mounted | 404-fix.zip |
| `pages/links.js` | ✅ Чистий | Статичний компонент | — |
| `pages/tools/index.js` | ⏳ НЕ ПЕРЕВІРЕНО | — | — |
| `pages/tools/*.js` (інші) | ⏳ НЕ ПЕРЕВІРЕНО | — | — |

#### Важливе відкриття — Vercel webhook

Перевірено: Vercel webhook **досі не працює** (тест 2 липня 2026). При commit на GitHub — Vercel НЕ деплоїть автоматично. Потрібно вручну:
```
git pull  (якщо редагував на GitHub)
git add .
git commit -m "опис"
git push
vercel --prod
```

Щоб виправити webhook: Vercel → Settings → Git → відключити і підключити GitHub інтеграцію заново.

#### GA4 + _document.js фікс (1 липня 2026)

- GA4 перенесено з `Layout.js` в `_document.js` з атрибутом `defer` (замість `async`)
- Google Fonts — додано `&display=swap` в URL (був відсутній — причина CLS)
- Результат: CLS 0.534 → **0**, TBT → **0**, Ефективність → 65 (зріст з 53)
- GA4 більше не дублюється

#### Поточний стан після сесії 4 (2 липня 2026)

**PageSpeed на сторінці статті:**
- Ефективність: 65
- Доступність: 100
- Оптимальні методи: 100
- SEO: 100
- CLS: 0 ✅
- TBT: 0 ✅
- Консоль: чиста ✅

**TODO на наступну сесію:**
- [ ] Перевірити `pages/tools/index.js` і всі tools сторінки
- [ ] Перевірити `pages/api/` файли
- [ ] Перевірити Vercel webhook — відключити/підключити GitHub інтеграцію
- [ ] Контрольна точка GSC — 7-8 липня (покази мають почати рости)
- [ ] Перевірити чи GitHub Actions відновлено (тікет #4498412)
- [ ] Відновити доступ до Namecheap і додати CNAME для www
- [ ] Видалити стару GA4 property G-FQJ7326JW0
- [ ] Виправити зламаний URL (dvokrokov...) в posts/
- [ ] Прибрати дублікати з sitemap
- [ ] Перегенерувати GSC OAuth токен

#### Поточний робочий процес деплою

```
1. Отримати файл (з GitHub або від Claude)
2. Замінити локально в C:\Users\rr\Desktop\pctips-template\
3. git add .
4. git commit -m "опис змін"
5. git push
6. vercel --prod
```


---

### ЩО РОБИМО ПРЯМО ЗАРАЗ (для швидкого старту нового чату)

**Контекст:** Проводимо повний аудит всіх React-файлів сайту на hydration помилки (#418/#423/#425). Перевіряємо файл за файлом — користувач копіює код з GitHub, Claude перевіряє і дає виправлений файл якщо є проблеми.

**На чому зупинились:** Перевірили всі основні файли. Наступний на черзі — **`pages/tools/index.js`** (і після нього решта tools сторінок).

**Список tools файлів для перевірки:**
- `pages/tools/index.js` ← НАСТУПНИЙ
- `pages/tools/auditshield.js`
- `pages/tools/base64.js`
- `pages/tools/hash.js`
- `pages/tools/ip-info.js`
- `pages/tools/password-generator.js`
- `pages/tools/port-checker.js`
- `pages/tools/powershell-commands.js`
- `pages/tools/regex.js`
- `pages/tools/subnet-calculator.js`
- `pages/tools/windows-error-decoder.js`
- `pages/tools/windows-event-id.js`

**Що шукаємо в кожному файлі:**
```js
// НЕБЕЗПЕЧНО — без mounted guard:
const { locale } = useRouter()
const isEn = locale === 'en'  // ← якщо одразу після useRouter без mounted

// БЕЗПЕЧНО — з mounted guard:
const [mounted, setMounted] = useState(false)
const isEn = mounted ? locale === 'en' : false
useEffect(() => { setMounted(true) }, [])

// НЕБЕЗПЕЧНО в JSX:
{isEn ? 'English text' : 'Текст'}  // без suppressHydrationWarning

// НЕБЕЗПЕЧНО:
toLocaleDateString()  // в JSX без useEffect
getBoundingClientRect()  // в JSX без useEffect
localStorage  // поза useEffect
<style>{`...`}</style>  // якщо є лапки " в CSS
```

**Стандартний фікс для кожного файлу з проблемою:**
```js
// 1. Додати імпорт якщо немає:
import { useState, useEffect } from 'react'

// 2. Додати на початку компонента:
const [mounted, setMounted] = useState(false)
const isEn = mounted ? locale === 'en' : false
useEffect(() => { setMounted(true) }, [])

// 3. Замінити старий рядок:
// const isEn = locale === 'en'  ← видалити
```

---

### КОД ДЛЯ ДЕПЛОЮ (копіювати кожного разу)

**Стандартний деплой після заміни файлу:**
```
cd C:\Users\rr\Desktop\pctips-template
git add .
git commit -m "Fix: hydration in [назва файлу]"
git push
vercel --prod
```

**Якщо редагував на GitHub і потрібно синхронізувати локально:**
```
cd C:\Users\rr\Desktop\pctips-template
git pull
vercel --prod
```

**Якщо git push відхилено (rejected):**
```
git pull
git push
vercel --prod
```

**⚠️ Важливо:** Vercel webhook не працює — `vercel --prod` обов'язковий після кожного push!

---

### ШВИДКИЙ СТАРТ НОВОГО ЧАТУ

Скажи: **"продовжуємо cryptolockua.com, перевіряємо tools файли"**

Claude прочитає DOCUMENTATION.md і одразу знатиме:
- Що вже перевірено (15 файлів)
- Що наступне (tools/index.js)
- Які фікси вже задеплоєні
- Поточний стан сайту


---

### Відомі UI баги (не #418, але варто виправити)

#### windows-event-id.js — ALL_LABEL state ініціалізується до mount

**Проблема простими словами:** Кнопка фільтра "Всі/All" не підсвічується правильно на EN версії після завантаження. Причина: `useState(ALL_LABEL)` ініціалізує category зі значенням 'Всі' (бо до mount `isEn = false`). Після mount `ALL_LABEL` стає 'All' але `category` вже має 'Всі' → кнопка "All" не активна хоча мала б бути.

**Це не #418** — просто візуальний баг, але може плутати EN-користувачів.

**Виправлення (просте):**
```js
// Замість:
const [category, setCategory] = useState(ALL_LABEL)

// Використати:
const [category, setCategory] = useState('__all__')
// і порівнювати: category === '__all__' замість category === ALL_LABEL
```

**Статус:** відкладено, не критично.

---

### Сесія 5 (3 липня 2026) — Завершення аудиту hydration + підключено Claude Code

#### Аудит tools файлів завершено

Останні 4 файли зі списку "НЕ ПЕРЕВІРЕНО" виправлені через Claude Code:

| Файл | Проблема | Виправлено |
|------|----------|-----------|
| `pages/tools/hash.js` | `isEn = locale === 'en'` без mounted guard | mounted патерн додано |
| `pages/tools/base64.js` | `isEn = locale === 'en'` без mounted guard | mounted патерн додано |
| `pages/tools/ip-info.js` | `isEn = locale === 'en'` без mounted guard | mounted патерн додано |
| `pages/tools/port-checker.js` | `isEn = locale === 'en'` без mounted guard | mounted патерн додано |

Фікс стандартний (як в `regex.js` та інших раніше виправлених файлах):
```js
const [mounted, setMounted] = useState(false)
const isEn = mounted ? locale === 'en' : false
useEffect(() => { setMounted(true) }, [])
```

Задеплоєно: `git commit` → `git push` → `vercel --prod` → заалайожено на `https://cryptolockua.com`.

**Аудит hydration-помилок #418/#423/#425 повністю завершено.**

#### Робота через Claude Code

З цієї сесії робота над проектом ведеться через **Claude Code** (CLI-агент), встановлений локально в `C:\Users\rr\Desktop\pctips-template`. Claude Code має прямий доступ до файлової системи, git та Vercel CLI — редагує файли, комітить, пушить і деплоїть напряму, без ручного копіювання коду через чат.

