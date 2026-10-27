// Регресійні тести тимчасової заморозки публікації нових статей сайту (site.config.js → publishCutoff).
// Рішення 2026-10-27: стаття публікується, лише коли її дата <= поточний час І (якщо cutoff заданий) <= publishCutoff.
// Тести читають справжні posts/ і posts-en/ напряму (front matter) і порівнюють із тим, що віддає lib/posts.js, sitemap і гілка `content` бота.
// Час керується через mock.timers (Date); нічого не виходить у мережу. Коли заморозку знімають — оновити CUTOFF і числа нижче свідомо.
import test, { mock, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire, registerHooks } from 'node:module'
import matter from 'gray-matter'
import * as posts from '../lib/posts.js'
import handler from '../pages/api/autopost.js'
import { Harness, baseState } from './helpers/fakes.mjs'

const require = createRequire(import.meta.url)
const siteConfig = require('../site.config.js')

// pages/sitemap.xml.js імпортує '../site.config' (Next дозволяє, чистий Node — ні, а хук у helpers розширення з крапкою пропускає).
registerHooks({ resolve: (spec, ctx, next) => next(spec === '../site.config' ? '../site.config.js' : spec, ctx) })
const sitemap = await import('../pages/sitemap.xml.js')

const CUTOFF = '2026-10-27'
const ROOT = process.cwd()                      // npm test запускається з кореня репозиторію, lib/posts.js теж читає від process.cwd()
const SITE = siteConfig.url
const STATIC_PATHS = ['', '/tools', '/tools/auditshield', '/tools/windows-error-decoder', '/tools/powershell-commands', '/tools/windows-event-id',
  '/tools/password-generator', '/tools/subnet-calculator', '/tags', '/about', '/bookmarks', '/privacy', '/terms']

// Моменти «після»: перший день черги, кінець 30/60-денного вікна, останній день черги, далеке майбутнє.
const PROBES = ['2026-10-27T14:00:00Z', '2026-10-30T00:00:01Z', '2026-11-26T12:00:00Z', '2026-12-26T12:00:00Z', '2027-03-01T08:01:00Z', '2028-01-01T00:00:00Z']
const setNow = iso => mock.timers.setTime(Date.parse(iso))

const day = v => (v instanceof Date ? v.toISOString() : String(v)).slice(0, 10)
const readDir = (dir, lang) => fs.readdirSync(path.join(ROOT, dir)).filter(f => f.endsWith('.md')).map(f => {
  const { data } = matter(fs.readFileSync(path.join(ROOT, dir, f), 'utf8'))
  return { lang, slug: f.replace(/\.md$/, ''), date: data.date, publishDate: data.publishDate, tags: data.tags || [], when: day(data.publishDate || data.date) }
})
const CORPUS = [...readDir('posts', 'uk'), ...readDir('posts-en', 'en')]
const LIVE = CORPUS.filter(p => p.when <= CUTOFF)
const QUEUE = CORPUS.filter(p => p.when > CUTOFF)
const slugs = (list, lang) => list.filter(p => p.lang === lang).map(p => p.slug).sort()
const sorted = a => [...a].sort()

// Точна копія правила ДО заморозки (lib/posts.js, коміт 7fb16f6) — еталон для «cutoff null = стара поведінка».
const legacy = (p, now) => { const d = p.publishDate || p.date; return !d || new Date(d) <= now }

function withCutoff(value, fn) {
  const had = Object.prototype.hasOwnProperty.call(siteConfig, 'publishCutoff'), prev = siteConfig.publishCutoff
  if (value === undefined) delete siteConfig.publishCutoff; else siteConfig.publishCutoff = value
  try { return fn() } finally { if (had) siteConfig.publishCutoff = prev; else delete siteConfig.publishCutoff }
}
const article = (date, publishDate) => ({ slug: 'x', ...(date ? { date } : {}), ...(publishDate ? { publishDate } : {}) })

let rnd
before(() => { mock.timers.enable({ apis: ['Date'], now: Date.parse('2026-11-05T12:00:00Z') }) })
after(() => { mock.timers.reset() })

test('site.config.js declares the approved cutoff', () => {
  assert.equal(siteConfig.publishCutoff, CUTOFF)
})

// ── isPublished: правило ──────────────────────────────────────────────────────────────────────────────
test('isPublished: an article dated on or before the cutoff is published (cutoff day is inclusive)', () => {
  setNow('2026-11-05T12:00:00Z')
  withCutoff(CUTOFF, () => {
    assert.equal(posts.isPublished(article('2026-10-20')), true)
    assert.equal(posts.isPublished(article('2026-10-27')), true)
    assert.equal(posts.isPublished(article(null, '2026-10-27')), true)
  })
})

test('isPublished: an article after the cutoff stays hidden even after its scheduled date has passed', () => {
  setNow('2027-03-01T08:01:00Z')
  withCutoff(CUTOFF, () => {
    assert.equal(posts.isPublished(article('2026-10-28')), false)
    assert.equal(posts.isPublished(article('2026-10-30')), false)
    assert.equal(posts.isPublished(article('2027-02-02')), false)
    assert.equal(posts.isPublished(article('2026-01-01', '2026-11-03')), false)
  })
})

test('isPublished: a not-yet-due article is hidden whatever the cutoff (the date gate still applies)', () => {
  setNow('2026-10-27T12:00:00Z')
  for (const cutoff of [null, undefined, CUTOFF, '2026-12-31']) {
    withCutoff(cutoff, () => assert.equal(posts.isPublished(article('2026-10-29')), false, `cutoff=${cutoff}`))
  }
})

test('isPublished: raising the cutoff releases exactly the articles up to the new cutoff that are due', () => {
  setNow('2026-11-05T12:00:00Z')
  withCutoff('2026-11-03', () => {
    assert.equal(posts.isPublished(article('2026-10-30')), true)
    assert.equal(posts.isPublished(article('2026-11-03')), true)
    assert.equal(posts.isPublished(article('2026-11-06')), false)
  })
})

test('isPublished: publishDate takes precedence over date; an undated article stays published', () => {
  setNow('2027-03-01T08:01:00Z')
  withCutoff(CUTOFF, () => {
    assert.equal(posts.isPublished(article('2026-01-01', '2026-11-01')), false)
    assert.equal(posts.isPublished(article('2026-12-01', '2026-10-01')), true)
    assert.equal(posts.isPublished(article()), true)
  })
})

test('cutoff null / absent reproduces the historical behaviour exactly (every real file, every probe moment)', () => {
  for (const cutoff of [null, undefined]) {
    withCutoff(cutoff, () => {
      for (const iso of ['2026-10-27T14:00:00Z', ...PROBES]) {
        setNow(iso)
        const now = new Date(iso)
        const diff = CORPUS.filter(p => posts.isPublished(p) !== legacy(p, now)).map(p => `${p.lang}:${p.slug}`)
        assert.deepEqual(diff, [], `cutoff=${cutoff} @ ${iso}`)
      }
    })
  }
  setNow('2027-03-01T08:01:00Z')
  withCutoff(null, () => assert.equal(posts.getAllPosts('uk').length + posts.getAllPosts('en').length, CORPUS.length, 'without a cutoff the whole queue becomes live once due'))
})

// ── справжній корпус ──────────────────────────────────────────────────────────────────────────────────
test('live corpus is exactly 488 articles (322 UK + 166 EN) = the files dated on or before the cutoff, at every probe moment', () => {
  assert.equal(LIVE.length, 488)
  assert.equal(slugs(LIVE, 'uk').length, 322)
  assert.equal(slugs(LIVE, 'en').length, 166)
  for (const iso of PROBES) {
    setNow(iso)
    assert.deepEqual(sorted(posts.getAllPosts('uk').map(p => p.slug)), slugs(LIVE, 'uk'), `uk posts @ ${iso}`)
    assert.deepEqual(sorted(posts.getAllPosts('en').map(p => p.slug)), slugs(LIVE, 'en'), `en posts @ ${iso}`)
    assert.deepEqual(sorted(posts.getAllSlugs('uk').map(s => s.params.slug)), slugs(LIVE, 'uk'), `uk static paths @ ${iso}`)
    assert.deepEqual(sorted(posts.getAllSlugs('en').map(s => s.params.slug)), slugs(LIVE, 'en'), `en static paths @ ${iso}`)
  }
})

test('future queue is 28 UK + 28 EN = 56 and none of it is published after its scheduled date (first pair 2026-10-30 included)', () => {
  assert.deepEqual([slugs(QUEUE, 'uk').length, slugs(QUEUE, 'en').length, QUEUE.length], [28, 28, 56])
  assert.equal(QUEUE.map(p => p.when).sort()[0], '2026-10-30')
  const first = { uk: 'gimp-windows-vstanovlennya-osnovy', en: 'gimp-windows-installation-beginners-guide' }
  for (const iso of PROBES) {
    setNow(iso)
    const livePosts = { uk: posts.getAllPosts('uk').map(p => p.slug), en: posts.getAllPosts('en').map(p => p.slug) }
    const livePaths = { uk: posts.getAllSlugs('uk').map(s => s.params.slug), en: posts.getAllSlugs('en').map(s => s.params.slug) }
    for (const q of QUEUE) {
      assert.ok(!livePosts[q.lang].includes(q.slug), `${q.lang}:${q.slug} listed @ ${iso}`)
      assert.ok(!livePaths[q.lang].includes(q.slug), `${q.lang}:${q.slug} has a static path @ ${iso}`)
    }
    assert.ok(!livePosts.uk.includes(first.uk) && !livePosts.en.includes(first.en))
  }
})

test('tags and related-post sources never expose a queued article: tag counts equal those of the live files, tag pages hold no queued slug', () => {
  setNow('2027-03-01T08:01:00Z')
  for (const lang of ['uk', 'en']) {
    const expected = {}
    LIVE.filter(p => p.lang === lang).forEach(p => p.tags.forEach(t => { expected[t] = (expected[t] || 0) + 1 }))
    const actual = Object.fromEntries(posts.getAllTags(lang).map(({ tag, count }) => [tag, count]))
    assert.deepEqual(actual, expected, `${lang} tag counts`)
    const queued = new Set(QUEUE.filter(p => p.lang === lang).map(p => p.slug))
    for (const tag of new Set(QUEUE.filter(p => p.lang === lang).flatMap(p => p.tags))) {
      assert.deepEqual(posts.getPostsByTag(tag, lang).filter(p => queued.has(p.slug)).map(p => p.slug), [], `${lang} tag ${tag}`)
    }
  }
})

// ── sitemap ───────────────────────────────────────────────────────────────────────────────────────────
async function sitemapLocs() {
  let body = ''
  await sitemap.getServerSideProps({ res: { setHeader() {}, write(s) { body += s }, end() {} } })
  return [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
}

test('sitemap is exactly the current baseline: 501 = 13 static + 322 UK + 166 EN, no queued URL, no live URL lost — at every probe moment', async () => {
  const expected = new Set([
    ...STATIC_PATHS.map(u => `${SITE}${u}`),
    ...slugs(LIVE, 'uk').map(s => `${SITE}/${s}`),
    ...slugs(LIVE, 'en').map(s => `${SITE}/en/${s}`),
  ])
  assert.equal(expected.size, 501)
  const queuedUrls = QUEUE.map(p => `${SITE}${p.lang === 'en' ? '/en' : ''}/${p.slug}`)
  for (const iso of PROBES) {
    setNow(iso)
    const locs = await sitemapLocs()
    assert.equal(locs.length, 501, `entries @ ${iso}`)
    assert.deepEqual(sorted(new Set(locs)), sorted(expected), `url set @ ${iso}`)
    assert.deepEqual(queuedUrls.filter(u => locs.includes(u)), [], `queued urls in sitemap @ ${iso}`)
  }
})

// ── прямий доступ до /[slug] ──────────────────────────────────────────────────────────────────────────
// pages/[slug].js містить JSX, у чистому Node його не виконати — перевіряємо вихідний код: єдина спільна перевірка, стоїть до fallback-редиректу.
test('direct [slug] access uses the shared isPublished and no longer carries its own inline date check', () => {
  const src = fs.readFileSync(path.join(ROOT, 'pages', '[slug].js'), 'utf8')
  assert.match(src, /import \{[^}]*\bisPublished\b[^}]*\} from '\.\.\/lib\/posts'/)
  const gsp = src.slice(src.indexOf('export async function getStaticProps'), src.indexOf('\nconst s = {'))
  assert.ok(gsp.length > 200, 'getStaticProps located')
  assert.match(gsp, /if \(!isPublished\(post\)\) \{\s*return \{ notFound: true \}\s*\}/, 'unpublished → notFound, unconditionally')
  assert.doesNotMatch(gsp, /new Date\(/, 'no independent date comparison in getStaticProps')
  assert.ok(gsp.indexOf('isPublished(post)') < gsp.indexOf('post.isFallback'), 'the gate runs before the EN→UK fallback redirect (a frozen UK slug must 404 under /en too)')
})

// ── Telegram: гілка `content` бере статті з того самого живого пулу ───────────────────────────────────────
// Усі живі slug уже «опубліковані» → якби в пулі лишилась черга, вибір упав би на неї; чесний пул порожній → reset, і вибір — довільна ЖИВА стаття.
test('Telegram content branch draws only from the live pool, never from the frozen queue', async () => {
  const liveSlugs = new Set(LIVE.map(p => p.slug))
  const queueSlugs = new Set(QUEUE.map(p => p.slug))
  assert.equal([...liveSlugs].filter(s => queueSlugs.has(s)).length, 0, 'slugs are unique across live/queue')
  for (const iso of ['2026-11-05T08:01:00Z', '2027-03-01T08:01:00Z']) {
    for (const r of [0, 0.37, 0.74, 0.999999]) {
      setNow(iso)
      rnd = mock.method(Math, 'random', () => r)
      const h = new Harness(baseState({ published: [...liveSlugs] }))
      h.install()
      try {
        const out = await h.run(handler, { type: 'content' })
        assert.equal(out.status, 200, `status @ ${iso} r=${r}`)
        assert.equal(h.tg.sent.length, 1, `one message @ ${iso} r=${r}`)
        const s = h.gh.state
        assert.ok(liveSlugs.has(s.last_post.slug), `picked a live article @ ${iso} r=${r}: ${s.last_post.slug}`)
        assert.ok(!queueSlugs.has(s.last_post.slug), `queued article picked @ ${iso} r=${r}`)
        assert.deepEqual(s.published, [s.last_post.slug], `pool of unpublished articles was empty → reset @ ${iso} r=${r}`)
      } finally { h.uninstall(); rnd.mock.restore() }
    }
  }
})
