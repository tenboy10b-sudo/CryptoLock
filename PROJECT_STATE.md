# CryptoLock Project State

LAST UPDATED: 2026-09-26
CURRENT PHASE: Post-SEO-crisis recovery (ongoing since 2026-06-13), governance/documentation baseline established
BASE SHA (snapshot, not a live HEAD): 8fa72a2 — the commit this document was last reconciled against. This is a point-in-time reference, NOT a self-updating field: the docs commit that records it and the Telegram bot's frequent `published.json` commits land after it, so origin/main is normally ahead. Always `git fetch origin` and compare before trusting it.

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
STATUS: real, verified data collection is live (Sandbox app, account `cryptolockua`). A real production collector run on 2026-09-25 returned 110 videos across 6 pages (`truncated: false`) and wrote the first daily analytics snapshot to the private `CryptoLock-analytics` repo (`tiktok/snapshots/2026/09/2026-09-25.json`). Per-video views/likes/comments/shares are being captured (111 videos in the latest 2026-09-26 snapshot); no performance conclusions have been drawn from them yet. A daily cron-job.org job (03:15 UTC) is configured and enabled and two scheduler test runs succeeded, but the first natural clock-triggered run is still awaiting verification. See TIKTOK STATUS.

## ARCHITECTURE

- Framework: Next.js 14.2.3, Pages Router (not App Router)
- Rendering: `pages/index.js` = pure SSG, no `revalidate`; `pages/[slug].js` = ISR (`revalidate: 3600`, `fallback: 'blocking'`)
- Repository: github.com/tenboy10b-sudo/CryptoLock — **PUBLIC** (verified 2026-09-25 via `gh`). This is why TikTok analytics history lives in a separate private repo, never here.
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
- cron-job.org (second job): `CryptoLock TikTok Daily Analytics` — `POST https://cryptolockua.com/api/tiktok/collect`, daily 03:15 UTC, enabled (per the account owner; dashboard not inspected by Claude). Authenticates with `TIKTOK_SCHEDULE_SECRET` and receives the compact response. See TIKTOK STATUS.
- TikTok: Login Kit OAuth + an autonomous collector (`/api/tiktok/login`, `/api/tiktok/callback`, `POST /api/tiktok/collect`), integrated 2026-09-24/25 and verified end-to-end in production — see TIKTOK STATUS below
- Upstash Redis (via Vercel Marketplace): TikTok token bundle + collector lock (runtime/secret state only)
- `tenboy10b-sudo/CryptoLock-analytics` (separate PRIVATE GitHub repo): TikTok analytics snapshot history, one file per UTC day

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
- **Current production verification status:** production is current as of 2026-09-26 — the latest deployment is `dpl_AEfwg85byMR77KuMidkJiFVMZdqk` (a code-unchanged redeploy of commit `0670579`, run to load the rotated `TIKTOK_SCHEDULE_SECRET`; the scheduler-safe auth code itself shipped in commit `4f0f109`), aliased to `cryptolockua.com`. Every deploy since 2026-09-22 was done manually via `vercel --prod --yes` (auto-deploy remains broken, above), so the earlier "last production deploy was 2026-08-29 (`039d61c`), 24 days stale" statement (written 2026-09-22) is superseded — the code and config changes since then, including the entire TikTok pipeline, are live. Doc-only commits after that deploy (this one included) do not require a redeploy.

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

**CURRENT STATUS: VERIFIED END-TO-END, including scheduler-triggered runs; daily cron CONFIGURED — awaiting the first natural scheduled run.** Pipeline: TikTok OAuth → Upstash Redis token bundle → autonomous collector → automatic token refresh when needed → `video.list` pagination → private `CryptoLock-analytics` daily snapshot, triggered daily at 03:15 UTC by cron-job.org. Every stage is verified by real production runs, including two live cron-job.org TEST RUNs on 2026-09-26. The only thing not yet observed is a run triggered by the actual clock schedule (first expected 2026-09-27 03:15 UTC) — until then the pipeline is not claimed to be fully autonomous.

**Configuration (as stated by the account owner, not independently re-verified against the TikTok dashboard this session):**
- TikTok Sandbox app configured
- Domain verified
- Login Kit enabled
- Scopes: `user.info.basic`, `video.list`
- Vercel Production env vars present (**names only, values never written here**): `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `TIKTOK_REDIRECT_URI` (OAuth); `TIKTOK_COLLECT_SECRET` (collector Bearer auth, manual/admin mode) and `TIKTOK_SCHEDULE_SECRET` (collector Bearer auth, scheduler mode — a separate credential); `KV_REST_API_URL`, `KV_REST_API_TOKEN` (used), plus `KV_REST_API_READ_ONLY_TOKEN`, `KV_URL`, `REDIS_URL` (auto-provisioned, unused) for Upstash Redis; `ANALYTICS_GITHUB_TOKEN` (private analytics repo writer). The older `GITHUB_TOKEN` is NOT used for analytics.

**What exists in this repo (implemented and deployed 2026-09-24/25):**
- `/terms` — public Terms of Service page, live, required alongside `/privacy` for TikTok Developer app review (see COMPLETED WORK, commit `9acd92f`)
- `/tiktok-connect` — temporary internal test route (`noindex,nofollow`, not in nav/footer/sitemap) — **still exists, still temporary**, has NOT been promoted to a permanent feature
- `/api/tiktok/login` — OAuth start: random CSRF state → Secure/HttpOnly/SameSite=Lax cookie → redirect to TikTok's real authorize screen
- `/api/tiktok/callback` — OAuth completion: server-side token exchange, validation, persistence of the token bundle to Redis, then `user.info.basic` + `video.list` calls and a throwaway result page (commits `7cfd17c`, `f2e12e4`, `a0110c3`, `b8193db`)
- `POST /api/tiktok/collect` — the autonomous collector (two Bearer auth modes, see the scheduler-safe auth block below): Bearer-authenticated, Redis-locked, refreshes the token when needed, paginates `video.list`, and writes the daily snapshot (commits `5b0b073`, `474acba`, `c6f9fd2`)
- `lib/tiktokTokenStore.js` (Redis token bundle + collector lock), `lib/tiktokCollector.js` (refresh + pagination), `lib/tiktokAnalyticsStore.js` (private-repo snapshot writer)
- **Tokens are persisted server-side to Upstash Redis only** — never to GitHub, a file, or the client. (Analytics snapshots, which contain no tokens, are written to a separate private GitHub repo; see below.)
- **The autonomous collector and analytics snapshot writer DO exist and are VERIFIED.** Scheduled collection is now **configured** (a cron-job.org job, daily at 03:15 UTC, calling the collector with the dedicated `TIKTOK_SCHEDULE_SECRET`); scheduler-triggered TEST RUNs are verified live, but the first natural clock-triggered run is still awaited. Before the cron job existed, the collector was triggered manually by the account owner (manual mode with `TIKTOK_COLLECT_SECRET` still works). The GPT/Claude analysis step reads the snapshots from the private repo; no automated analysis is built.

**Verification history (see DOCUMENTATION.md продовження 54-58 for the full incident-by-incident record):** first real attempt failed CSRF (продовження 54) → safe CSRF diagnostics added (55) → later real attempt passed CSRF but failed token exchange (56) → diagnostics revealed `invalid_client` (credential mismatch) → account owner corrected the Vercel `TIKTOK_CLIENT_KEY`/`TIKTOK_CLIENT_SECRET` pair and production was redeployed (57) → **a real end-to-end OAuth login now succeeds** (58) → Redis token persistence implemented and verified (59-61) → autonomous collector implemented and verified (62-63) → token-lifecycle hardening (64) → private analytics repo created (65) → `GITHUB_TOKEN` preflight failed, dedicated `ANALYTICS_GITHUB_TOKEN` passed (66-67) → collect secret rotated (68) → **real token refresh and the first private analytics snapshot verified (69)**.

**VERIFIED REAL RESULT (2026-09-24, via `/tiktok-connect`, real browser login):**
- TikTok connected: YES
- Display name: `cryptolockua`
- Scopes granted: `user.info.basic`, `video.list`
- Videos returned: 20

**Now confirmed working:** CSRF/state flow, Vercel Sandbox credentials, token exchange, `user.info.basic`, `video.list` — CryptoLock can read its own TikTok public video metrics via the Sandbox app. Not yet confirmed available via this API/scope set: retention, completion rate, profile visits, follows — do not assume these are accessible until specifically checked.

**INFRASTRUCTURE — Upstash Redis (connected 2026-09-24, продовження 59):** Upstash for Redis created via Vercel Marketplace and connected to the `crypto-lock` Vercel project, for TikTok server-side runtime state (`access_token`, `refresh_token`, token expiration metadata, future collector lock/idempotency state). Vercel Production env var **NAMES only** (values never written here): `KV_REST_API_READ_ONLY_TOKEN`, `KV_REST_API_TOKEN`, `KV_REST_API_URL`, `KV_URL`, `REDIS_URL`. Redis is scoped to tokens/runtime state only (token bundle, collector lock) — it is NOT the analytics-history store. Analytics history lives in the separate private `CryptoLock-analytics` GitHub repo (decided and implemented; see the storage-architecture block below).

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
- *(First version of the collector, commit `5b0b073`.)* It did not persist analytics history at that stage — it only proved the token lifecycle and API collection. **Superseded:** the snapshot writer was added in `c6f9fd2` (продовження 67) and verified by a real run (продовження 69); see below. `pages/api/tiktok/login.js` and `pages/api/tiktok/callback.js` were untouched by the collector work.
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
- **Long-term analytics history:** a separate **PRIVATE** GitHub repository, `tenboy10b-sudo/CryptoLock-analytics` — deliberately NOT the public `tenboy10b-sudo/CryptoLock` repo, since analytics history is business data. Layout (live): `tiktok/snapshots/YYYY/MM/YYYY-MM-DD.json`, one file per UTC calendar day (documented in that repo's own `README.md`, not duplicated here).
- **Analytics storage repository: CREATED / VERIFIED.** Private, correct owner, `main` default branch, `README.md` + `tiktok/snapshots/.gitkeep` present at creation (first real snapshot since added — see продовження 69).
- **Analytics writer: VERIFIED** by a real production snapshot write (продовження 69).
- **Scheduled collection: CONFIGURED (cron-job.org, daily 03:15 UTC, enabled); first natural run awaiting verification** — see продовження 72 below. (At the time of this block's original writing, продовження 65, no cron job existed.)
- **Autonomous collector: VERIFIED** (продовження 62-63).
- **Real token refresh: VERIFIED** by a real production run (продовження 69).

**PRODUCTION GITHUB_TOKEN PREFLIGHT: FAILED (продовження 66, 2026-09-25).** The original production `GITHUB_TOKEN` cannot read `tenboy10b-sudo/CryptoLock-analytics` at all (`repo_access: false`) — most likely scoped only to the public `CryptoLock` repo. **This token must never be used for analytics.** (Full incident record is preserved in DOCUMENTATION.md продовження 66.)

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
- *(Status at the time of продовження 69. Superseded — see the продовження 72 block below for the current, more complete list: same-day update, scheduler-safe auth and cron configuration are now verified/configured, and the daily cron job is no longer "not implemented".)* Scheduled collection / cron: **NOT IMPLEMENTED** (at that time)

At that time not yet observed: the same-day **update** path (that run was a first-of-the-day create) and a conflict retry. **The same-day update path has since been verified live (продовження 72).** The conflict retry is still covered by local tests only. The private repo's `README.md` was updated to match the live storage model (private-repo commits `cb9a08f`, then `57ceb84` for the cron status).

**SCHEDULER-SAFE COLLECTOR AUTH — IMPLEMENTED + DEPLOYED (продовження 70, commit `4f0f109`, deployment `dpl_E5SQU7yaCnkiL5Pkr2qE3kqLFSfL`, 2026-09-26).** `POST /api/tiktok/collect` remains the single collector endpoint and now authenticates with either of two **separate** Bearer credentials (Production env var **names only**, values never documented):
- **manual** — `TIKTOK_COLLECT_SECRET`: unchanged behavior; success returns the full response including the `videos` array (same keys, same order as before).
- **schedule** — `TIKTOK_SCHEDULE_SECRET` (a dedicated, least-privilege credential intended for cron-job.org): runs the **exact same** pipeline (Redis lock → token load → refresh when needed → persist refreshed token → `video.list` pagination → analytics snapshot writer) but returns only compact metadata on success: `ok`, `token_refreshed`, `videos_returned`, `pages_fetched`, `truncated`, `collected_at`, `analytics_snapshot {status, path}` — **no** videos, titles, descriptions, share URLs, tokens, or `open_id`, because a third-party scheduler stores response bodies in its execution history. The snapshot written to the private repo is identical in both modes. Error responses are the same in both modes.
- **Auth rules:** Bearer header only (never query string, body, or cookie); constant-time comparison; no match → 401; neither env var set → 500 `server_misconfigured`; both set to the *identical* value → 500 (fail closed, since they are meant to have separate roles); one env var missing never blocks the other. Logs gain a safe `auth_mode` field (`manual`/`schedule`) — never a secret.
- No duplicated pipeline: one handler, varying only the accepted credential and the success body. `login.js`, `callback.js`, `lib/*`, the analytics schema/writer, and the Redis keys are untouched.
- 93/93 local tests (full auth matrix; manual response preserved; schedule response compact and leak-free and snapshot-identical to manual; lock/refresh/persistence/TikTok-failure/snapshot-failure/lock-release/pagination/create-update regressions run in **both** modes). The new-mode tests were confirmed to fail against the pre-change code. `npm run build` passed.
- Safe production checks after deploy: `GET` → 405, `POST` without `Authorization` → 401, `POST` with an obviously wrong Bearer → 401, `/tiktok-connect` → 200, and both env-var **names** present for Production. The wrong-Bearer request returning 401 (not 500) also shows production is configured with at least one secret and the two are not identical. **Neither real secret was used** — no authenticated collector call was made and no snapshot was created or updated.

**Status (as first deployed, продовження 70):** scheduler-safe collector auth **IMPLEMENTED + DEPLOYED**; the cron-job.org job did not exist yet.

**TIKTOK_SCHEDULE_SECRET ROTATION + REDEPLOY (продовження 71, 2026-09-26).** The account owner **rotated `TIKTOK_SCHEDULE_SECRET` in Vercel Production** (env var **name only**; the value is not documented anywhere, and Claude never read it). Production was **redeployed** (`dpl_AEfwg85byMR77KuMidkJiFVMZdqk`, READY, aliased to `cryptolockua.com`, **no application code change**) so the runtime loads the new value. Safe checks passed: `GET` → 405, `POST` without `Authorization` → 401, `POST` with an obviously wrong Bearer → 401, `/tiktok-connect` → 200. As before, these prove the endpoint is live and enforcing auth — **not** that the new schedule secret works; the wrong-Bearer 401 (not 500) only shows the secrets are configured and not identical. No authenticated call was made and no snapshot was created or updated.

**Status at the time of продовження 71:** the cron-job.org job was configured per the account owner; real scheduler auth was NOT YET VERIFIED. The task that requested that redeploy did not state why the rotation was needed, so no cause is recorded. **Superseded by the live test runs below.**

**DAILY SCHEDULER CONFIGURED + LIVE TEST RUNS VERIFIED (продовження 72, 2026-09-26).**

**cron-job.org job (as reported by the account owner, with a screenshot Claude has not seen — Claude has not inspected the cron-job.org dashboard itself):** title `CryptoLock TikTok Daily Analytics`; `POST https://cryptolockua.com/api/tiktok/collect`; schedule **03:15 UTC daily**; job **ENABLED**. The cron-job.org UI shows the next execution as 06:15 local time because the owner's timezone is UTC+3; the job's configured timezone remains UTC.

**Live TEST RUN #1 (cron-job.org, reported HTTP 200):** created `tiktok/snapshots/2026/09/2026-09-26.json` — `snapshot_date: 2026-09-26`, `collected_at: 2026-09-26T07:23:10.963Z`, `videos_returned: 111`, `pages_fetched: 6`, `truncated: false`. This proves cron-job.org → `TIKTOK_SCHEDULE_SECRET` auth → collector → TikTok API → private GitHub snapshot works end to end.

**Live TEST RUN #2 (reported HTTP 200):** updated the **same** canonical file in place — new `collected_at: 2026-09-26T07:24:27.487Z`, `videos_returned: 111`, `pages_fetched: 6`, `truncated: false`.

**Independently verified by Claude on GitHub (read-only, 2026-09-26):** the private repo is `PRIVATE`; it contains exactly two snapshot files, `2026-09-25.json` and `2026-09-26.json`; **exactly one** file is named for 2026-09-26 (no duplicate); the git history of that path shows exactly two commits — `analytics(tiktok): snapshot 2026-09-26` (07:23:11Z, create) then `analytics(tiktok): update snapshot 2026-09-26` (07:24:27Z, update); the file's current metadata matches run #2 (`collected_at 2026-09-26T07:24:27.487Z`, 111 videos with a 111-entry array, 6 pages, `truncated: false`, exactly the seven schema keys); and a scan found no `access_token`, `refresh_token`, `open_id`, `TIKTOK_SCHEDULE_SECRET`, `TIKTOK_COLLECT_SECRET`, `ANALYTICS_GITHUB_TOKEN`, `Authorization`, or `token_refreshed`. The 110→111 video count is consistent with one newly published video, not an error. Not independently visible to Claude: cron-job.org's own execution history and the HTTP 200 codes (owner-reported).

**Verified status (current):**
- TikTok OAuth: **VERIFIED**
- Redis token persistence: **VERIFIED**
- Automatic token refresh: **VERIFIED**
- Refreshed token persistence: **VERIFIED**
- Autonomous collector: **VERIFIED**
- Pagination: **VERIFIED**
- Private GitHub analytics writer: **VERIFIED**
- Daily snapshot CREATE: **VERIFIED LIVE**
- Same-day snapshot UPDATE (idempotency, no duplicate daily file): **VERIFIED LIVE**
- Scheduler-safe auth mode (`TIKTOK_SCHEDULE_SECRET`, compact response): **VERIFIED LIVE**
- cron-job.org configuration: **CONFIGURED / ENABLED** (per the owner's screenshot)
- Automatic execution triggered by the actual clock schedule: **CONFIGURED — awaiting first natural scheduled run. NOT verified; do not claim it is.**

Still covered by local tests only: the GitHub write-conflict retry.

**NEXT ACTION:** verify the first natural scheduled execution after 03:15 UTC on 2026-09-27: (1) cron-job.org history shows a successful automatic execution; (2) the private repo contains `tiktok/snapshots/2026/09/2026-09-27.json`; (3) its `collected_at` corresponds to the scheduled run (≈03:15 UTC); (4) the snapshot schema and counts are valid. Only after that can the TikTok daily analytics pipeline be marked fully autonomous and VERIFIED. Do not change the analytics schema or storage architecture unless evidence requires it.

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
- TikTok Sandbox OAuth Login Kit smoke test implemented and verified end-to-end (`/tiktok-connect`, `/api/tiktok/login`, `/api/tiktok/callback`; commits `7cfd17c` + `f2e12e4` + `a0110c3`, deployed 2026-09-24). The earlier CSRF and `invalid_client` blockers were diagnosed and resolved — see DOCUMENTATION.md продовження 54-58.
- TikTok token persistence to Upstash Redis (`b8193db`), autonomous collector with proactive token refresh, locking and pagination (`5b0b073`), token-lifecycle validation hardening including an `open_id`-continuity bug fix (`474acba`) — all deployed 2026-09-24 and verified by real production runs
- Private TikTok analytics storage: separate PRIVATE repo `tenboy10b-sudo/CryptoLock-analytics` created (2026-09-24), dedicated `ANALYTICS_GITHUB_TOKEN` preflight-verified (2026-09-25), and an idempotent daily snapshot writer (`c6f9fd2`) verified by a real run — real token refresh and the first snapshot (110 videos, 6 pages) confirmed 2026-09-25 (DOCUMENTATION.md продовження 65-69)

## BACKLOG

**P0:**
- Resolve Vercel↔GitHub OAuth connection (or formally commit to the manual-deploy workaround as standard practice)

**P1:**
- Verify the first natural scheduled TikTok collection (03:15 UTC on 2026-09-27) — the cron job is configured and enabled and the scheduler test runs are verified live; this is the current global NEXT ACTION, below
- Repeat GSC URL Inspection Live Test for `/yak-vstanovyty-python-windows` (or another representative UK article) to confirm the `/_next/` robots.txt fix actually resolves the "10 of 14 resources blocked" result now that it's live in production. Do not expect this to move the June-13 traffic-collapse question — that stays a separate, still-open investigation (see Stage 2C in DOCUMENTATION.md).
- Fix the autopost.js race condition (reorder state write before Telegram send, or add an idempotency key)

**P2:**
- Remove unused `@next/third-parties` dependency
- Clarify the `/tags` "N статей" label

## NEXT ACTION

Verify the first natural scheduled execution of the TikTok daily collector, after 03:15 UTC on 2026-09-27: cron-job.org history shows a successful automatic run; the private repo contains `tiktok/snapshots/2026/09/2026-09-27.json` with a `collected_at` matching the scheduled time and a valid schema/counts. The collector, token refresh, private snapshot writer, scheduler-safe auth, and the create and same-day-update paths are all VERIFIED live (two scheduler test runs on 2026-09-26); the cron job is configured and enabled. What is missing is a run triggered by the actual clock — only then can the pipeline be marked fully autonomous. Do not change the analytics schema or storage architecture unless evidence requires it. (The GSC URL Inspection Live Test that used to be listed here remains in the BACKLOG.)
