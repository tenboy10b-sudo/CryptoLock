# CryptoLock Project State

LAST UPDATED: 2026-09-24
CURRENT PHASE: Post-SEO-crisis recovery (ongoing since 2026-06-13), governance/documentation baseline established
CURRENT ORIGIN MAIN SHA: a0110c3

## PROJECT

CryptoLock (cryptolockua.com) — Ukrainian-language content site with step-by-step Windows/PC-security guides, a small suite of free browser tools, and a Telegram channel (@cryptolock888) driven by an automated posting system.

## BUSINESS GOALS

- Website: recover and significantly grow organic search traffic
- Website: monetize in the future
- Telegram: rebuild into a channel with a real, engaged audience and future monetization
- TikTok: continue scaling
- Overall: build a single Site → TikTok → Telegram → monetization funnel

## CURRENT KPIs

GSC:
STATUS: awaiting fresh data — last known checkpoint was 13.08.2026 (66 indexed / 792 not indexed / 858 total); no more recent export has been reviewed in this repo's documentation.

GA4:
STATUS: awaiting fresh data — no recent export reviewed.

Telegram:
- Channel: @cryptolock888
- Autopost running continuously — 72 consecutive state commits confirmed 30.08.2026–22.09.2026, ~3/day (content/middle/extra), zero gaps
- First subscriber-growth giveaway launched 30.08.2026 (AuditShield licenses, goal: 150 subscribers) — outcome not yet confirmed in this repo

TikTok:
STATUS: no verified data in this repository's documentation.

## ARCHITECTURE

- Framework: Next.js 14.2.3, Pages Router (not App Router)
- Rendering: `pages/index.js` = pure SSG, no `revalidate`; `pages/[slug].js` = ISR (`revalidate: 3600`, `fallback: 'blocking'`)
- Repository: github.com/tenboy10b-sudo/CryptoLock (private/public status not re-verified this session)
- Hosting: Vercel (project `crypto-lock`)
- Domain: cryptolockua.com (+ www redirect, + legacy `crypto-lock-five.vercel.app` redirect)
- Languages: uk (default, no URL prefix), en (`/en/` prefix) — Next.js built-in i18n routing
- Content storage: Markdown files directly in the git repo (`posts/`, `posts-en/`), read at build/ISR time via `lib/posts.js`

## INTEGRATIONS

- GitHub: source of truth for code and content; also used as the *database* for `published.json` (Telegram autopost state) via the Contents API
- Vercel: hosting, serverless functions, CDN
- Google Search Console: connected historically (see DOCUMENTATION.md); no fresh data reviewed this session
- GA4: connected historically; no fresh data reviewed this session
- Telegram: Bot API, channel @cryptolock888
- Anthropic: Claude API (`claude-sonnet-4-5`) generates all autopost text/poll content
- cron-job.org: external scheduler triggering `/api/autopost` on a daily schedule (exact current schedule not independently re-verified against the cron-job.org dashboard this session — only inferred from commit timestamps)
- TikTok: Login Kit OAuth smoke test integrated 2026-09-24 (`/api/tiktok/login`, `/api/tiktok/callback`, `TIKTOK_CLIENT_KEY`/`TIKTOK_CLIENT_SECRET`/`TIKTOK_REDIRECT_URI` env vars) — see TIKTOK STATUS below

## SITE STATUS

- Production responds 200 OK (verified 2026-09-23)
- `robots.txt` no longer blocks `/_next/` (fixed 2026-09-23, commit `bc1ecb6`, deployment `dpl_3hPjQVojRbLu9As1ZVcQFLwMzNKd` — see KNOWN BUGS/COMPLETED WORK below). `Disallow: /_next/` had been present since commit `a0c979f`, 2026-04-24, and was confirmed via GSC URL Inspection Live Test to block Googlebot from loading 10 of 14 page resources (JS/CSS) during rendering. This fix addresses only that confirmed current rendering restriction — it is NOT claimed to be the cause of the 2026-06-13 traffic collapse (see Stage 2C forensic reconstruction in DOCUMENTATION.md for that separate, still-open question).
- `sitemap.xml` returns 480 URLs, confirmed 0 `/tags/*` entries (noindex + sitemap-exclusion fix from an earlier session is holding)
- Individual ISR article pages generate correctly on demand even without a fresh full deploy (confirmed by testing several September-dated articles: 200 OK)

## DEPLOYMENT STATUS

These are explicitly separate systems — do not conflate them:

- **Git push status:** `gh auth status` shows account `tenboy10b-sudo` authenticated with `repo` scope. Push capability believed functional; not tested with an actual push prior to this documentation commit.
- **GitHub repository status:** origin/main is healthy, linear history, receiving continuous automated commits from the Telegram bot.
- **Vercel auto-deploy status:** BROKEN. `vercel git connect` fails with "Failed to connect tenboy10b-sudo/CryptoLock to project" — a recurring issue (6th confirmed occurrence) tied to a GitHub account OAuth-App flag. Last independently confirmed as broken: 2026-09-22 (this session).
- **Manual deploy procedure:** `vercel --prod --yes` from the repo root — the established workaround used repeatedly throughout this project's history when auto-deploy is broken.
- **Current production verification status:** last known production deploy was 2026-08-29 19:13 (commit `039d61c`) — 24 days stale relative to today's git history, though this does NOT mean the site is broken (ISR still serves individual pages correctly); it means the static homepage list and any code/config changes since 29.08 have not reached production.

## GSC STATUS

Missing evidence. Last checkpoint used in project documentation: 13.08.2026 (66 indexed / 792 not indexed / 858 total, per DOCUMENTATION.md). No fresher export has been reviewed by any session recorded in this repo.

## CONTENT STATUS

- UK: 350 published `.md` files in `posts/`, 38 future-dated (publishDate > 2026-09-22)
- EN: 194 published `.md` files in `posts-en/`, 38 future-dated
- Known consolidation state: ~50+ duplicate clusters merged across UK+EN through August 2026 (see DOCUMENTATION.md for full session-by-session history); publish queue deliberately slowed from ~1 pair/day to 2 pairs/week starting 21.08.2026 as an extra-caution measure during the recovery window

## LANGUAGE ARCHITECTURE

**Decision (2026-09-23): UK and EN are independent editorial pipelines by default.** There is no requirement that a UK article have an EN counterpart, or vice versa. True translation pairing (`translatesEn`/`translatesUk` frontmatter) exists only as explicit, optional metadata for the ~140 pairs where it happens to be accurate — it is not a guarantee, and it is not currently trustworthy enough to drive automatic cross-locale redirects (confirmed: 2 broken `translatesEn` targets pointing to nonexistent files, 1 translation collision where two EN articles both claim the same UK original). **There is no automatic cross-locale content fallback.**

**Confirmed mechanism (Stage 2D/2E audits, 2026-09-22/23):** requesting `/en/{uk-slug}` for a UK article with no real `posts-en/{slug}.md` used to return HTTP 200 with the Ukrainian article body (`lib/posts.js`'s `isFallback` fallback), with `canonical` correctly pointing to the UK original but the URL itself staying live and crawlable indefinitely. Google was still actively crawling a meaningful subset of these historical URLs as of September 2026 (confirmed for at least 138 `/en/yak-*` URLs in GSC's "Crawled – currently not indexed"; NOT proven for the full 650-URL count in that category — see DOCUMENTATION.md Stage 2E entry for the exact scope of what is and isn't proven).

**Mitigation shipped (2026-09-23):** `pages/[slug].js` `getStaticProps` now returns a permanent redirect to `/{slug}` (the UK original) instead of `props` whenever `locale === 'en' && post.isFallback === true`. This does **not** attempt to resolve a real EN translation via `translatesEn` (deliberately out of scope — see DOCUMENTATION.md decision entry) and does **not** touch the 15+ already-confirmed-wrong explicit redirects in `next.config.js` (separate, not-yet-done follow-up). Explicit `next.config.js` redirects still execute first and are unaffected by this change.

**Deployed to production: 2026-09-23 07:59 EEST**, commit `0943b8736747985fc8d248354c82e061361650d6`, via `vercel --prod --yes` (deployment `dpl_FhkpQPEJjsA5pkxxTHYMgJL7tKmB`). Live validation passed 8/8 (3 changed fallback URLs → 308 → correct UK URL → 200, no loops; existing explicit redirect unaffected; real EN/UK articles unaffected; nonexistent slug still 404; Googlebot UA behaves identically to normal UA). **Monitoring period started 2026-09-23** — watch GSC "Crawled – currently not indexed" count for `/en/yak-*` URLs over the following weeks; do not expect a fast or dramatic change (Google re-crawls historical URLs on its own schedule).

## TELEGRAM STATUS

Current autopost architecture: `pages/api/autopost.js` (Vercel serverless function), triggered externally by cron-job.org, generates content via Claude API, posts via Telegram Bot API, and tracks state in `published.json` on GitHub via the Contents API. Legacy `bot.py` in the repo root exists but is not the live path (its GitHub Actions workflows are `workflow_dispatch`-only, not scheduled).

**Explicit correction:**

PREVIOUS CLAIM: "Telegram autopost stopped for 24 days."
STATUS: **INVALIDATED.**
REASON: The local development clone was 72 bot-state commits behind origin/main. The claim was based on stale local git history, not on the actual state of the GitHub repository.
CURRENT VERIFIED FACT: Telegram autopost state commits (`bot: update published.json [...]`) continued uninterrupted, approximately 3 times daily, from 2026-08-30 through 2026-09-22 (the date of this entry), confirmed by inspecting `origin/main` directly.

**Confirmed (not fixed) race condition:** in `pages/api/autopost.js`, the Telegram send call happens before the `published.json` GitHub write. Under a concurrent or retried invocation, this can result in two Telegram messages being sent while only one state update is persisted (the losing write fails on a GitHub SHA conflict and is silently dropped from the bot's own tracking). This is documented for awareness only — it has NOT been fixed as part of this session.

## TIKTOK STATUS

**CURRENT STATUS: CREDENTIALS CORRECTED, AWAITING RETRY VERIFICATION**

**Configuration (as stated by the account owner, not independently re-verified against the TikTok dashboard this session):**
- TikTok Sandbox app configured
- Domain verified
- Login Kit enabled
- Scopes: `user.info.basic`, `video.list`
- Vercel Production env vars present (**names only, values never written here**): `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `TIKTOK_REDIRECT_URI`

**What exists in this repo (implemented and deployed 2026-09-24, commits `7cfd17c` + `f2e12e4` + `a0110c3`):**
- `/terms` — public Terms of Service page, live, required alongside `/privacy` for TikTok Developer app review (see COMPLETED WORK, commit `9acd92f`)
- `/tiktok-connect` — temporary internal test route (`noindex,nofollow`, not in nav/footer/sitemap)
- `/api/tiktok/login` — OAuth start: random CSRF state → Secure/HttpOnly/SameSite=Lax cookie → redirect to TikTok's real authorize screen (confirmed live, redirects with the genuine production `client_key`)
- `/api/tiktok/callback` — OAuth completion: server-side token exchange, `user.info.basic` + `video.list` calls, renders a throwaway result page
- **Tokens are NOT persisted anywhere** (no DB, no GitHub write, no file) — this is a smoke test only
- **The permanent analytics collector does NOT exist yet.** Ultimate integration goal, not yet built: `TikTok API → server-side collector → persistent analytics data → GPT/Claude analysis`

**Live status (superseded — see below for the current blocker):** the *first* real authorization attempt reached `/api/tiktok/callback` but failed CSRF state validation *before* token exchange (`Invalid or missing CSRF state`). Commit `f2e12e4` deployed safe boolean-only CSRF diagnostics.

**CURRENT BLOCKER (as of a later real attempt, same day):** a subsequent real browser attempt **passed CSRF validation** (state matched cookie correctly — the earlier CSRF failure did not recur and its root cause remains unexplained but is no longer blocking). The flow now fails one step later, at server-side token exchange (`POST https://open.tiktokapis.com/v2/oauth/token/`), with `Token exchange with TikTok failed.` **Root cause: still UNKNOWN.**

Commit `a0110c3` deployed safe token-exchange diagnostics: on failure, `/api/tiktok/callback` now extracts and displays/logs only the 4 fields TikTok's token endpoint itself returns — HTTP status, `error`, `error_description`, `log_id` — never `client_key`/`client_secret`/the authorization code/`access_token`/`refresh_token`/the CSRF state or cookie value/any full request or response body. A malformed/non-JSON response is distinguished from a well-formed JSON error and shows only "Unexpected TikTok token response" + HTTP status (no fabricated fields). 26/26 local tests passed (invalid_client/invalid_grant/invalid_request/malformed/success-path-unchanged/no-secret-leakage/network-error). Production-verified same day via a safe synthetic request (real TikTok token endpoint, deliberately expired/fake code, **not a real login**): TikTok returned HTTP 200 with `error=invalid_grant`, `error_description="Authorization code is expired."`, and a real `log_id` — confirming the new diagnostic path is live and correctly parses TikTok's actual response shape (flat JSON, not nested under `data`, and note TikTok can return HTTP 200 with an error body rather than a 4xx/5xx).

**RESOLVED DIAGNOSIS (real attempt, same day, after продовження 56):** a genuine (non-expired, non-fabricated) OAuth retry hit the new token-exchange diagnostics and revealed the real failure: `error=invalid_client`, `error_description="Client key or secret is incorrect."` — i.e. the `TIKTOK_CLIENT_KEY`/`TIKTOK_CLIENT_SECRET` pair in Vercel Production did not match a single TikTok Sandbox app.

**DECISION/FIX:** the account owner manually re-copied a matching Client Key + Client Secret pair from the same TikTok Sandbox app into Vercel Production env vars (`TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`). `TIKTOK_REDIRECT_URI` was not changed. No credential values were viewed, printed, or stored in Git at any point — this was a Vercel dashboard-only change. No application code changed.

**REDEPLOY:** production redeployed via `vercel --prod --yes` (deployment `dpl_ABgvGF19NLxenryeQEA48GpgbX8V`, READY, aliased to `cryptolockua.com`) so the corrected env vars are loaded into serverless functions. `/tiktok-connect` verified 200 after redeploy (no real TikTok login performed).

**NEXT ACTION:** one real TikTok Sandbox OAuth retry via `/tiktok-connect` to confirm the corrected credentials resolve the `invalid_client` error and the flow completes end-to-end (token exchange → `user.info.basic` → `video.list` → result page).

## MONETIZATION

- Existing products: AuditShield (Windows security audit tool, sold via a separate Telegram bot/repo, `security-audit-private` + `audit-shield-bot`) — used as the prize mechanism for the CryptoLock channel's first giveaway
- Revenue status: unknown/not tracked in this repository
- Open questions: no monetization mechanism exists yet directly on cryptolockua.com itself (site currently has no ads/paid product of its own; `adsenseId` in `site.config.js` is empty)

## KNOWN BUGS

**P0:**
- Vercel↔GitHub auto-deploy connection broken (OAuth account flag, recurring — 6th occurrence)

**P1:**
- Race condition in `pages/api/autopost.js`: Telegram send precedes GitHub state write, no idempotency key, no lock

**P2:**
- `@next/third-parties ^16.2.4` listed in `package.json` alongside `next@14.2.3` but never imported anywhere in the codebase (dead dependency, no runtime effect)
- `/tags` page label "N статей" is actually a sum of per-tag article counts (an article with 6 tags counts 6 times), not a deduplicated article count — not a bug, but a misleading label

**Security note (local hygiene, not a production issue):** the local `.claude/settings.local.json` permission cache has held a plaintext secret (`AUTOPOST_SECRET`) in a cached command string. It was never committed to git and is now git-ignored (see `.gitignore`). No rotation performed as part of documenting this — that remains a separate decision for whoever owns the secret.

## INVALIDATED FINDINGS

- **"Telegram autopost stopped for 24 days" (raised 2026-09-22, invalidated same day).** Root cause of the false claim: local git clone was 72 commits behind origin/main; the audit that produced this claim never ran `git fetch` before concluding the bot was silent. See TELEGRAM STATUS above for the corrected fact. Any future AI session or developer should NOT repeat this conclusion without first fetching and comparing against origin/main.

## DECISIONS

1. GitHub `origin/main` is the source of truth for source code.
2. Before every audit or implementation task: `git fetch origin`, compare `HEAD` with `origin/main`.
3. Never infer current remote state from stale local git history.
4. No domain migration without evidence.
5. No mass SEO/content deletion or restructuring without GSC evidence.
6. Git push success and production deployment success are separate states — always report them separately.
7. Significant completed work must exist in Git history and documentation, not only in AI chat history.
8. Every significant implementation must end with the full pipeline: **implementation → test → deploy → production verify → documentation → docs commit → push**. A task is not complete if it stops before the documentation/docs-commit/push steps. This exists so a new Claude/GPT session — including a different account — can reconstruct current project state from GitHub alone, without any prior chat history.

## ACTIVE EXPERIMENTS

- First subscriber-growth giveaway on @cryptolock888 (started 30.08.2026, goal: 150 subscribers, prize: AuditShield licenses) — outcome not yet recorded in this repo.

- **NAME:** Crawl Priority Internal-Link Experiment
  **START DATE:** 2026-09-24 (commit `f9678a2`, deployment `dpl_zLokNezWsra59zdGsQ7SBVgsAMBe`)
  **5 TEST URLs** (received exactly 1 new contextual inbound link each):
  - `/en/process-explorer-system-informer-windows-guide`
  - `/keepass-bitwarden-windows-menedzher-paroliv`
  - `/en/windows-server-2022-2019-setup-guide`
  - `/nemaye-internetu-pislya-onovlennya-windows`
  - `/en/taskbar-not-working-windows-fix`
  **5 CONTROL URLs** (topic/publish-date-matched to each TEST URL, untouched):
  - `/process-explorer-system-informer-windows`
  - `/en/keepass-bitwarden-windows-password-manager-guide`
  - `/windows-server-2022-2019-nalashtuvannya`
  - `/en/how-to-fix-no-internet-after-windows-update`
  - `/panel-zavdan-ne-pratsyuie-windows-vyrishennya`
  **INTERVENTION:** exactly one new contextual markdown link added per TEST URL, from one already-crawled source article each (2 already-indexed sources, 3 crawled-not-indexed sources with recent crawl dates) — see `dee1237`-style targeted diff in commit `f9678a2`. No CONTROL files, target-article content, sitemap, homepage, tags, canonicals, hreflang, or redirects touched.
  **BASELINE (recorded before deploy):** all 10 URLs = "Discovered — currently not indexed" in GSC. TEST inbound counts: 0, 1, 0, 0, 0. CONTROL inbound counts: 1, 0, 1, 0, 0.
  **CHECK DATE:** 2026-10-08 (+14 days)
  **SUCCESS CRITERIA:** ≥3 of 5 TEST URLs move from Discovered to Crawled-not-indexed or Indexed, compared against the CONTROL group's movement rate over the same window. No manual GSC submission was used for any of the 10 URLs — the test is specifically about whether added internal links alone shift crawl behavior.

- **NAME:** Telegram Poll Experiment
  **START DATE:** 2026-09-24 (commit `ecb7845`, deployment `dpl_ETGzSHiEnKELFWVez23i37Zt6iNE`)
  **END DATE:** 2026-10-08 (+14 days)
  **BASELINE** (from the 30-day Telegram performance audit completed the same day): 93 posts, median views 25, only 3 of 93 posts (all `middle-engage`) were real Telegram polls, only 9.7% of all posts received any reaction at all, and engagement was overwhelmingly concentrated in those 3 poll posts (poll voter counts 3/6/4, vs. a max of 2 reactions on any text post) — full breakdown and per-format medians in this session's transcript, not duplicated here.
  **INTERVENTION:** on `middle-engage` days only (unchanged 3-posts/day schedule, unchanged content/extra/middle structure, unchanged AuditShield-promo and article-post frequency), deterministically alternate poll (A) → text (B) → poll → text..., tracked by a new `engage_ab_index` counter that only advances on confirmed Telegram-send + finalize (same lifecycle as every other reliability-guard counter, so a failed/retried cycle never double-advances it or skips a turn). Poll topics come from a new dedicated prompt — practical Windows/security/admin topic, 2-4 options, no clickbait, no article promotion disguised as a poll — with its own rolling anti-repeat list (`poll_recent_topics`, last 6). Text-turn style selection draws from the existing `ENGAGE_STYLES` minus the 4 that already triggered a poll/quiz, so a "text turn" can never accidentally become a poll. Standalone `type=engage`, `extra`, `middle-promo`, `content`, the reliability guard, cron schedule, and the website/SEO experiment from above are all untouched — verified via a 22/22 local test suite against the real handler code.
  **SUCCESS METRICS (compare after 14 days, poll turns vs. text turns):** median views, median votes/reactions, % of posts with any engagement at all. Not judged by views alone, per the explicit instruction that prompted this experiment.

## COMPLETED WORK

(Verified via git history / DOCUMENTATION.md only)

- ~50+ duplicate content clusters consolidated (UK+EN), with redirects, across roughly July–August 2026
- Fixed 291 fake `/en/` fallback pages (hreflang/canonical/sitemap corrected)
- Fixed a systemic `locale:false` + bare-source redirect-matching bug (30 broken rules)
- Fixed CLS caused by web-font `display=swap` (switched to `display=optional`)
- Fixed Telegram extra-post topic repetition (expanded topic lists + recent-topic avoidance)
- `/tags/*` pages set to noindex and removed from sitemap
- Publish queue re-spaced from ~1 pair/day to 2 pairs/week
- This governance/documentation baseline (PROJECT_STATE.md, HANDOFF.md, CLAUDE.md, DOCUMENTATION.md entry) — 2026-09-22
- Fixed cross-locale `/en/{uk-slug}` fake-200-fallback (`pages/[slug].js`, commit `0943b87`, deployed 2026-09-23)
- Removed `Disallow: /_next/` from robots.txt so Googlebot can load Next.js JS/CSS resources (`pages/robots.txt.js`, commit `bc1ecb6`, deployed 2026-09-23)
- Added Terms of Service page (`pages/terms.js`, commit `9acd92f`, deployed 2026-09-24) at `/terms` (+ `/en/terms` via existing i18n routing) — required alongside the existing `/privacy` page for TikTok Developer app production review (Terms of Service URL + Privacy Policy URL + public website URL)
- Fixed EN article tag links (`pages/[slug].js`) that were resolving to bare `/tags/{tag}` instead of `/en/tags/{tag}` — caused by a stray `locale={false}` on the tag-chip/breadcrumb `<Link>`s and JSON-LD `BreadcrumbList`. Confirmed live 404s (`/tags/hardware`, `/tags/settings`, `/tags/productivity`) before the fix; all now resolve via `/en/tags/*` (commit `44d20ae`, deployed 2026-09-23)
- Added a global execution lock + persisted pending-outbox to `pages/api/autopost.js` so overlapping cron invocations can no longer both post to Telegram, and a GitHub-write failure after a successful send no longer silently desyncs state (commit `ef134a7`, deployed 2026-09-24; live-verified on the first real cycle afterward)
- TikTok Sandbox OAuth Login Kit smoke test implemented (`/tiktok-connect`, `/api/tiktok/login`, `/api/tiktok/callback`) — see TIKTOK STATUS above for current blocked-on-token-exchange status (commits `7cfd17c` + `f2e12e4` + `a0110c3`, deployed 2026-09-24)

## BACKLOG

**P0:**
- Resolve Vercel↔GitHub OAuth connection (or formally commit to the manual-deploy workaround as standard practice)

**P1:**
- Fix the autopost.js race condition (reorder state write before Telegram send, or add an idempotency key)

**P2:**
- Remove unused `@next/third-parties` dependency
- Clarify the `/tags` "N статей" label

## NEXT ACTION

Repeat GSC URL Inspection Live Test for `/yak-vstanovyty-python-windows` (or another representative UK article) to confirm the `/_next/` robots.txt fix actually resolves the "10 of 14 resources blocked" result now that it's live in production. Do not expect this to move the June-13 traffic-collapse question — that stays a separate, still-open investigation (see Stage 2C in DOCUMENTATION.md).
