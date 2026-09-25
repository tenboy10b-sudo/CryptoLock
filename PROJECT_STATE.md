# CryptoLock Project State

LAST UPDATED: 2026-09-25
CURRENT PHASE: Post-SEO-crisis recovery (ongoing since 2026-06-13), governance/documentation baseline established
CURRENT ORIGIN MAIN SHA: 0c5b1eb (last code/docs commit this snapshot was written against; the bot's `published.json` commits keep advancing origin/main independently)

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

**CURRENT STATUS: VERIFIED — Sandbox API connection works end-to-end.**

**Configuration (as stated by the account owner, not independently re-verified against the TikTok dashboard this session):**
- TikTok Sandbox app configured
- Domain verified
- Login Kit enabled
- Scopes: `user.info.basic`, `video.list`
- Vercel Production env vars present (**names only, values never written here**): `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `TIKTOK_REDIRECT_URI`

**What exists in this repo (implemented and deployed 2026-09-24, commits `7cfd17c` + `f2e12e4` + `a0110c3`):**
- `/terms` — public Terms of Service page, live, required alongside `/privacy` for TikTok Developer app review (see COMPLETED WORK, commit `9acd92f`)
- `/tiktok-connect` — temporary internal test route (`noindex,nofollow`, not in nav/footer/sitemap) — **still exists, still temporary**, has NOT been promoted to a permanent feature
- `/api/tiktok/login` — OAuth start: random CSRF state → Secure/HttpOnly/SameSite=Lax cookie → redirect to TikTok's real authorize screen
- `/api/tiktok/callback` — OAuth completion: server-side token exchange, `user.info.basic` + `video.list` calls, renders a throwaway result page
- **Tokens are now persisted server-side to Upstash Redis on a successful OAuth login** (commit `b8193db`, deployed 2026-09-24) — see the persistence status block below. Still no GitHub write, no file, no client-side exposure.
- **The permanent analytics collector does NOT exist yet.** Ultimate integration goal, not yet built: `TikTok API → server-side collector → persistent analytics data → GPT/Claude analysis`

**Verification history (see DOCUMENTATION.md продовження 54-58 for the full incident-by-incident record):** first real attempt failed CSRF (продовження 54) → safe CSRF diagnostics added (55) → later real attempt passed CSRF but failed token exchange (56) → diagnostics revealed `invalid_client` (credential mismatch) → account owner corrected the Vercel `TIKTOK_CLIENT_KEY`/`TIKTOK_CLIENT_SECRET` pair and production was redeployed (57) → **a real end-to-end OAuth login now succeeds** (58).

**VERIFIED REAL RESULT (2026-09-24, via `/tiktok-connect`, real browser login):**
- TikTok connected: YES
- Display name: `cryptolockua`
- Scopes granted: `user.info.basic`, `video.list`
- Videos returned: 20

**Now confirmed working:** CSRF/state flow, Vercel Sandbox credentials, token exchange, `user.info.basic`, `video.list` — CryptoLock can read its own TikTok public video metrics via the Sandbox app. Not yet confirmed available via this API/scope set: retention, completion rate, profile visits, follows — do not assume these are accessible until specifically checked.

**INFRASTRUCTURE — Upstash Redis (connected 2026-09-24, продовження 59):** Upstash for Redis created via Vercel Marketplace and connected to the `crypto-lock` Vercel project, for TikTok server-side runtime state (`access_token`, `refresh_token`, token expiration metadata, future collector lock/idempotency state). Vercel Production env var **NAMES only** (values never written here): `KV_REST_API_READ_ONLY_TOKEN`, `KV_REST_API_TOKEN`, `KV_REST_API_URL`, `KV_URL`, `REDIS_URL`. Analytics-history storage remains a **separate, still-pending decision** — Redis is scoped to tokens/runtime state only, not analytics history.

**TOKEN PERSISTENCE — STATUS: VERIFIED (продовження 60-61, commit `b8193db`, deployed 2026-09-24).** `pages/api/tiktok/callback.js` persists the token bundle to Redis under the fixed key **`cryptolock:tiktok:token_bundle:v1`** via a single Redis SET, using `KV_REST_API_URL`/`KV_REST_API_TOKEN` only (never the read-only token or `KV_URL`/`REDIS_URL`). Pipeline order: token exchange → structural validation (`access_token`/`refresh_token`/`expires_in`/`refresh_expires_in` all required) → required-scope check → persist to Redis → `user.info.basic` → `video.list` → success page. Any validation or Redis failure fails closed with a generic 502 page and `user.info`/`video.list` are never called. 65/65 local tests passed. `npm run build` passed.

**REAL PRODUCTION VALIDATION (2026-09-24, via `/tiktok-connect`, real browser login by the account owner):**
- TikTok connected: YES
- Display name: `cryptolockua`
- Scopes granted: `user.info.basic`, `video.list`
- Videos returned: 20
- Secure token persistence: YES

This confirms a real TikTok OAuth token bundle was successfully written to Upstash Redis under `cryptolock:tiktok:token_bundle:v1` — token persistence is no longer just implemented, it is **VERIFIED by a live write**. No token values are recorded here or anywhere in this repo's documentation.

**AUTONOMOUS COLLECTOR — STATUS: VERIFIED (продовження 62-63, commit `5b0b073`, deployed 2026-09-24).** Secret-gated endpoint **`POST /api/tiktok/collect`** proves CryptoLock can read TikTok video metrics without a browser OAuth session:
- **Authentication:** `Authorization: Bearer <TIKTOK_COLLECT_SECRET>` (constant-time comparison; never accepted via query string or body; missing secret env var fails closed with 500). New Vercel Production env var **name only**: `TIKTOK_COLLECT_SECRET`.
- **Token source:** the Redis bundle persisted by `/api/tiktok/callback` (`cryptolock:tiktok:token_bundle:v1`) — read via `lib/tiktokTokenStore.js`'s new `loadTokenBundle()`.
- **Proactive refresh:** if `access_token_expires_at` is within **20 minutes**, refreshes via TikTok's `refresh_token` grant before calling `video.list`; if `refresh_token_expires_at` has already passed, fails safely with `reauthorization_required: true` and makes no TikTok call at all. A successful refresh is validated (required scopes still present, `open_id` continuity checked against the previous bundle) and persisted to Redis **before** `video.list` is ever called — if that persist fails, the run aborts rather than risk continuing on a token TikTok may have already rotated away from.
- **Concurrency:** a Redis lock (`cryptolock:tiktok:collector_lock:v1`, `SET NX EX 120`) prevents overlapping runs; released only via an atomic Lua compare-and-delete so a run can never clear a lock it doesn't own, always in a `finally` block.
- **Video collection:** paginates `video.list` up to a hard cap of **10 pages / 200 videos**; reports `truncated: true` rather than silently claiming completeness if the cap is hit while TikTok still has more.
- **Response:** secret-gated JSON only (`ok`, `token_refreshed`, `videos_returned`, `pages_fetched`, `truncated`, `collected_at`, `videos[]`) — never `open_id`/`access_token`/`refresh_token`/expiry values/any secret.
- **Analytics history is NOT persisted yet** — this stage only proves the token lifecycle and API collection; `pages/api/tiktok/login.js` and `pages/api/tiktok/callback.js` are untouched.
- 55/55 local tests passed (auth, lock ownership/release, all refresh-validation-reject paths, Redis-persist-failure-blocks-video-list, pagination cap/truncation, no-secret-leakage). `npm run build` passed.

**REAL PRODUCTION VALIDATION (2026-09-24, account owner's first authenticated call to `POST /api/tiktok/collect`, real `TIKTOK_COLLECT_SECRET`):**
- `ok`: true
- `token_refreshed`: false
- `videos_returned`: 110
- `pages_fetched`: 6
- `truncated`: false
- `collected_at`: `2026-09-24T13:07:32.306Z`

This confirms, by a real run: Bearer authentication works, the collector runs without any new TikTok browser login, the persisted Redis token bundle reads successfully, the existing `access_token` works outside the OAuth callback, and `video.list` pagination works correctly across multiple pages (6 pages, 110 videos, no truncation). **Autonomous collector = VERIFIED. Pagination = VERIFIED.**

**Token refresh (status at the time of the first collector run): was IMPLEMENTED, NOT YET VERIFIED.** `token_refreshed: false` on that run meant the access token was still fresh enough that the refresh branch was never exercised. **Superseded — real token refresh is now VERIFIED by a later real production run (`token_refreshed: true`, продовження 69, 2026-09-25); see below.** The two statuses were deliberately kept separate until that evidence existed.

**TOKEN LIFECYCLE HARDENING — deployed 2026-09-24 (продовження 64, commit `474acba`), ahead of enabling scheduled collection or analytics persistence.** Tightened validation for both the persisted and refreshed token bundle:
- `access_token_expires_at`/`refresh_token_expires_at`: now rejected if `NaN`/`Infinity`/`<= 0`, not just non-numeric as before.
- `scope`: stored/refreshed bundles must still contain both `user.info.basic` and `video.list` (new shared `REQUIRED_SCOPES`/`hasRequiredScopes()` in `lib/tiktokTokenStore.js`, replacing two separate ad-hoc scope checks).
- `token_type`: must be `"bearer"` case-insensitively — previously any string (or none at all) was silently accepted/defaulted; stored value is now normalized to canonical `"Bearer"`.
- `open_id`: must be `null` or a non-empty string — previously an object/number/empty-string `open_id` was silently coerced away instead of rejected.
- **Real bug fixed:** the refresh `open_id`-continuity check (`lib/tiktokCollector.js`) used `previousOpenId && base.bundle.open_id && previousOpenId !== base.bundle.open_id`, which silently skipped the check entirely whenever a refresh response came back with `open_id` missing/null — meaning a refresh that silently dropped `open_id` would have been accepted and persisted. Now correctly rejects any refresh where a previously-known non-null `open_id` goes missing, becomes `null`, or changes to a different value.
- 27 new unit tests (all 26 stored-bundle/refresh-response edge cases) + full 36-test collector regression suite re-run with zero prior coverage lost. `npm run build` passed. No change to refresh threshold, collector auth, Redis lock behavior, pagination, or the token persistence key — `pages/api/tiktok/login.js`, `pages/api/tiktok/callback.js`, `pages/api/tiktok/collect.js` all untouched (confirmed via `git diff`). Deployed and safely verified in production (405/401/401/200 checks only — no authenticated collector call made, no Redis writes).

**TIKTOK ANALYTICS STORAGE ARCHITECTURE (продовження 65, 2026-09-24):**
- **Runtime secrets/state (token bundle, refresh state, collector lock, future idempotency state):** Upstash Redis — unchanged, this task did not touch Redis.
- **Long-term analytics history:** a separate **PRIVATE** GitHub repository, `tenboy10b-sudo/CryptoLock-analytics` — deliberately NOT the public `tenboy10b-sudo/CryptoLock` repo, since analytics history is business data. Planned layout: `tiktok/snapshots/YYYY/MM/YYYY-MM-DD.json`, one file per UTC calendar day (documented in that repo's own `README.md`, not duplicated here).
- **Analytics storage repository: CREATED / VERIFIED.** Private, correct owner, `main` default branch, `README.md` + `tiktok/snapshots/.gitkeep` present at creation (first real snapshot since added — see продовження 69).
- **Analytics writer: VERIFIED** by a real production snapshot write (продовження 69).
- **Scheduled collection: NOT IMPLEMENTED.** No cron-job.org trigger configured for the collector.
- **Autonomous collector: VERIFIED** (продовження 62-63).
- **Real token refresh: VERIFIED** by a real production run (продовження 69).

**PRODUCTION GITHUB_TOKEN PREFLIGHT: FAILED (продовження 66, 2026-09-25).** The original production `GITHUB_TOKEN` cannot read `tenboy10b-sudo/CryptoLock-analytics` at all (`repo_access: false`) — most likely scoped only to the public `CryptoLock` repo. **This token must never be used for analytics.** (Full incident record preserved below/in DOCUMENTATION.md продовження 66.)

**PRODUCTION ANALYTICS_GITHUB_TOKEN PREFLIGHT: PASS (продовження 67, 2026-09-25).** A dedicated, least-privilege fine-grained PAT was added as a new Vercel Production env var, `ANALYTICS_GITHUB_TOKEN` (**name only**, value never documented), scoped specifically to `CryptoLock-analytics` with Contents read/write. Tested via the same temporary, secret-gated, read-only diagnostic pattern (deployed, called once, then fully removed regardless of outcome — same discipline as продовження 66). **Repository:** `tenboy10b-sudo/CryptoLock-analytics`. **Verified capabilities: read = YES, write = YES.** Old `GITHUB_TOKEN`: confirmed NOT used for analytics.

**TIKTOK ANALYTICS SNAPSHOT WRITER — VERIFIED (implemented продовження 67, commit `c6f9fd2`, deployed 2026-09-25; validated by a real production run продовження 69).**
- New `lib/tiktokAnalyticsStore.js`: `validateSnapshot()` (structural validation — schema_version, snapshot_date format, valid collected_at, non-negative integer counts, boolean truncated, non-empty video_id per video), `deriveSnapshotPath()` (UTC-only via `getUTC*` accessors — server local timezone can never change which daily file a snapshot lands in: `tiktok/snapshots/YYYY/MM/YYYY-MM-DD.json`), `writeSnapshot()` (GET-then-PUT: 404 → CREATE, 200 → UPDATE with the current blob SHA — never a new filename; a write conflict gets exactly one re-read + one retry, never an unbounded loop; deterministic commit messages with no video data in them). Uses **only** `process.env.ANALYTICS_GITHUB_TOKEN`, never `GITHUB_TOKEN`.
- `pages/api/tiktok/collect.js` modified: after `video.list` succeeds, builds the snapshot from the same data already being returned and writes it before reporting overall success. A snapshot write failure returns a safe 502 (`{stage: "analytics_snapshot", error: "snapshot_write_failed"}`) — the collector does not claim success, though the Redis lock is still released. Success responses now include `analytics_snapshot: {status, path}`.
- `pages/api/tiktok/login.js`, `pages/api/tiktok/callback.js`, `lib/tiktokTokenStore.js`, `lib/tiktokCollector.js` all untouched.
- 46/46 local tests passed (UTC path/timezone independence, full schema validation, create/update/idempotency, the one-retry conflict policy, fail-closed on missing credential and GitHub errors, no token leakage, full collector integration, and regression coverage for auth/lock/pagination/token-lifecycle/CSRF). `npm run build` passed. Deployed and safely verified in production (405/401/401/200 checks only — no authenticated collector call made, no manual snapshot created).

**TIKTOK_COLLECT_SECRET ROTATION (продовження 68, 2026-09-25).** The first real analytics-writer validation call returned `401 unauthorized` — rejected at collector authentication, before the Redis lock, any TikTok API call, token refresh, or the analytics snapshot writer ran, so nothing downstream was exercised. The account owner then **rotated `TIKTOK_COLLECT_SECRET` in Vercel Production** (env var **name only** — the value is not documented anywhere). Production was **redeployed** (`dpl_EcDVgjAK7hsQRFCV6or5RxmZ2V6Z`, no application code change) so the runtime picks up the new value. Safe collector auth checks passed after the redeploy: `GET` → 405, `POST` without `Authorization` → 401, `POST` with an obviously wrong Bearer → 401, `/tiktok-connect` → 200 — these prove the endpoint is live and enforcing auth, **not** that the new secret works; no authenticated collector call was made.

**REAL PRODUCTION VALIDATION — REFRESH + ANALYTICS SNAPSHOT PIPELINE (продовження 69, 2026-09-25).** After the rotation, the account owner performed an authenticated `POST /api/tiktok/collect`:
- `ok`: true
- `token_refreshed`: **true**
- `videos_returned`: 110
- `pages_fetched`: 6
- `truncated`: false
- `collected_at`: `2026-09-25T13:37:45.620Z`
- `analytics_snapshot`: `status: created`, `path: tiktok/snapshots/2026/09/2026-09-25.json`

**Independently verified on GitHub (read-only, by Claude):** the private repo `tenboy10b-sudo/CryptoLock-analytics` (visibility PRIVATE) contains exactly that file, with `schema_version: 1`, `snapshot_date: 2026-09-25`, `collected_at: 2026-09-25T13:37:45.620Z`, `videos_returned: 110` (a 110-entry `videos` array), `pages_fetched: 6`, `truncated: false`. Top-level keys are exactly the schema's seven fields; each video record has exactly the ten schema fields. A scan of the file found no `access_token`, `refresh_token`, `open_id`, `ANALYTICS_GITHUB_TOKEN`, `TIKTOK_COLLECT_SECRET`, `Authorization`, or `token_refreshed`. The commit message follows the specified pattern (`analytics(tiktok): snapshot 2026-09-25`).

**What `token_refreshed: true` + `ok: true` proves:** the real production refresh branch executed and the whole chain completed — stored Redis token bundle → `refresh_token` grant → refreshed-bundle validation → refreshed bundle persisted to Redis (before `video.list`) → `video.list` (6 pages / 110 videos) → private GitHub daily snapshot. Because the collector returns 502 rather than `ok: true` if refresh validation, refreshed-token persistence, or the snapshot write fails, a successful response is itself evidence each of those steps succeeded.

**Current TikTok pipeline:** TikTok OAuth → Upstash Redis token bundle → autonomous collector → automatic token refresh when needed → `video.list` pagination → private `CryptoLock-analytics` daily snapshot. Snapshot convention: `tiktok/snapshots/YYYY/MM/YYYY-MM-DD.json`, one canonical file per UTC day — the first successful run that day creates it, a later same-day run updates that same file in place.

**Verified status:**
- TikTok OAuth: **VERIFIED**
- Redis token persistence: **VERIFIED**
- Autonomous collector: **VERIFIED**
- Pagination: **VERIFIED**
- Real token refresh: **VERIFIED**
- Refreshed token persistence: **VERIFIED**
- Private analytics GitHub writer: **VERIFIED**
- Daily analytics snapshot storage: **VERIFIED**
- Scheduled collection / cron: **NOT IMPLEMENTED**

Not yet observed: the same-day **update** path (this was a first-of-the-day create) and a conflict retry — both are covered by local tests only, not yet by a live run. The private repo's `README.md` was updated to match the live storage model (private-repo commit `cb9a08f`).

**NEXT ACTION:** implement and validate once-daily scheduled collection. Do not change the analytics schema or storage architecture unless evidence requires it.

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
