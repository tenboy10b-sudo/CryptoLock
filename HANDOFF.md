# CryptoLock Handoff Guide

## What CryptoLock is

A Ukrainian-language website (cryptolockua.com) with step-by-step Windows/PC-security guides, a small suite of free browser tools, and an automated Telegram channel (@cryptolock888). Part of a wider funnel (Site → TikTok → Telegram → monetization) alongside a separate product, AuditShield (a Windows security-audit tool sold via its own Telegram bot).

## Business objectives

1. Recover and grow organic search traffic (site has been in an SEO recovery period since 13.06.2026 — see DOCUMENTATION.md for the full incident history).
2. Monetize the website itself in the future (no direct monetization on-site yet).
3. Rebuild the Telegram channel into one with a real, engaged audience and future monetization.
4. Continue scaling TikTok.
5. Unify all of the above into one funnel.

## Repository

- Local dev path (on the current maintainer's machine): `C:\Users\rr\Desktop\pctips-template`
- GitHub: `https://github.com/tenboy10b-sudo/CryptoLock.git`
- Default branch: `main`

## Production domain

`https://cryptolockua.com` (canonical). `www.cryptolockua.com` and the legacy `crypto-lock-five.vercel.app` both 308-redirect to it.

## Source-of-truth hierarchy

| Question | Authoritative source |
|---|---|
| What does search see / how is indexing doing? | Google Search Console |
| How do real users behave on the site? | GA4 |
| What is actually live right now? | Vercel dashboard / direct production HTTP checks / logs — **not** local git state |
| What is the code and its history? | GitHub (`origin/main`) |
| What has the Telegram bot posted / what's its internal state? | `published.json` on GitHub (via the bot) + the Telegram channel itself |
| How is TikTok performing? | TikTok Analytics |

**Never infer current remote/production state from local git history alone.** A stale local clone has already produced one false conclusion in this project's history (see DOCUMENTATION.md and PROJECT_STATE.md's "INVALIDATED FINDINGS").

## Architecture

```
User / Googlebot
  → cryptolockua.com (domain)
  → Vercel (Edge CDN + serverless functions)
  → Next.js 14.2.3 (Pages Router)
  → Markdown content (posts/, posts-en/) / tools pages
  → HTML response
```

```
cron-job.org (external scheduler, not in this repo)
  → GET /api/autopost?type=X&secret=... (Vercel serverless function)
  → Anthropic API (claude-sonnet-4-5) — generates the post text/poll
  → Telegram Bot API — publishes to @cryptolock888
  → GitHub Contents API — reads/writes published.json (bot's own state)
```

This ordering (Telegram send before the GitHub state write) is a confirmed, unfixed source of a race condition — see PROJECT_STATE.md → KNOWN BUGS.

## Repository directory map

| Path | Purpose |
|---|---|
| `posts/` | UK articles (Markdown + frontmatter) |
| `posts-en/` | EN articles |
| `pages/` | Next.js Pages Router routes |
| `pages/[slug].js` | Article template (ISR) |
| `pages/index.js` | Homepage / article list (pure SSG, no revalidate) |
| `pages/api/autopost.js` | Live Telegram autopost logic |
| `pages/tools/` | Free browser tools (password generator, subnet calculator, etc.) |
| `pages/sitemap.xml.js`, `pages/robots.txt.js` | Dynamic SEO endpoints |
| `pages/terms.js`, `pages/privacy.js` | Public legal pages (Terms of Service, Privacy Policy) |
| `pages/tiktok-connect.js`, `pages/api/tiktok/` | TikTok Sandbox OAuth smoke test (temporary, noindex — see TikTok section below) |
| `lib/posts.js` | Content-reading/filtering logic |
| `lib/tiktokAuth.js` | TikTok OAuth helpers — CSRF cookie, HTML escaping, result-page rendering |
| `components/` | Shared UI (Layout, PostCard, SearchBar, TableOfContents) |
| `next.config.js` | i18n, headers, the accumulated redirect list |
| `site.config.js` | Site name, description, social links, nav, GA id |
| `bot.py` | Legacy Telegram bot script — not the live path, kept for reference |
| `DOCUMENTATION.md` | Full chronological session history (see below) |

## Content architecture

Each `.md` file has frontmatter including `title`, `date`, `publishDate`, `updated`, `description`, `tags`, `readTime`, and — for translated pairs — `translatesEn` (in UK files) or `translatesUk` (in EN files). `publishDate` gates visibility: `lib/posts.js` filters out anything with a future `publishDate`. Slug = filename without `.md`. UK articles route at `/slug`; EN articles route at `/en/slug`.

## Deployment architecture

Four distinct states — always report them separately, never assume one implies another:

- **LOCAL:** your working directory. Always `git fetch origin` and compare against `origin/main` before trusting it.
- **GITHUB:** `origin/main` — the source of truth for code. Also stores `published.json`, continuously updated by the live bot independent of any deploy.
- **VERCEL:** the hosting platform. Auto-deploy-on-push is currently **broken** (`vercel git connect` fails — a recurring GitHub OAuth-App account flag, 6th confirmed occurrence in this project's history). This has been true across multiple points in this project's history, not a one-time incident.
- **PRODUCTION:** what `cryptolockua.com` actually serves right now. Verify directly via HTTP, not by assuming a recent push means a recent deploy.

**Manual deploy workaround** (documented for reference — do not run it unless a task explicitly says `DEPLOY: YES`):
```
vercel --prod --yes
```
This has been the standard practice throughout this project whenever auto-deploy is broken, which has been often.

## Telegram architecture

- Endpoint: `pages/api/autopost.js`, types `content` / `middle` / `extra` / `engage` / `promo`, secured by `AUTOPOST_SECRET` query param
- State storage: `published.json` in the GitHub repo, read/written via the Contents API (GitHub itself acts as the database — there is no other persistent store)
- Text/poll generation: Anthropic API, model `claude-sonnet-4-5`
- Publishing: Telegram Bot API
- Trigger: external cron-job.org, observed daily around ~11:01 (content), ~13:00 (middle, alternates promo/engage by day-of-month parity), ~19:00-19:01 (extra) — these times are inferred from commit timestamps, not independently confirmed against the cron-job.org dashboard
- **Confirmed race/retry risk:** Telegram send happens before the GitHub state write. A concurrent or retried invocation can send two Telegram messages while only one state update persists (the loser fails on a GitHub SHA conflict). Not fixed as of this document's creation.

## Analytics

- GA4: connected historically per project documentation; no fresh data reviewed in this repo's latest state.
- GSC: connected historically; last documented checkpoint 13.08.2026 (66 indexed / 792 not indexed / 858 total). Needs a fresh export before any SEO decision is made.

## TikTok

Active growth channel in the overall business funnel. As of 2026-09-24, a Sandbox OAuth smoke test is integrated (Login Kit only — this is **not** a permanent analytics collector yet):

```
User (via /tiktok-connect, temporary internal test route, noindex/nofollow)
  → /api/tiktok/login (random CSRF state → Secure/HttpOnly/SameSite=Lax cookie, redirects to TikTok)
  → TikTok OAuth (Sandbox app, scopes: user.info.basic, video.list)
  → /api/tiktok/callback (server-side token exchange → validate response → verify scopes
      → persist token bundle to Redis → user.info.basic + video.list → throwaway result page)
  → Upstash Redis (durable token/runtime-state store — connected 2026-09-24, written to on
      every successful OAuth login as of commit b8193db, deployed 2026-09-24)

cron/future trigger (not yet scheduled — cron-job.org job NOT configured yet)
  → POST /api/tiktok/collect
      Bearer TIKTOK_COLLECT_SECRET  = manual mode  (full response incl. videos[])
      Bearer TIKTOK_SCHEDULE_SECRET = schedule mode (compact response, NO videos[])
      (constant-time compare; identical values or none configured -> 500)
  → Redis lock (cryptolock:tiktok:collector_lock:v1, SET NX EX 120, atomic
      compare-and-delete release — implemented and deployed, commit 5b0b073, 2026-09-24)
  → Redis token bundle (cryptolock:tiktok:token_bundle:v1)
  → refresh via TikTok if access_token_expires_at <= now + 20 minutes
  → persist refreshed bundle to Redis (before video.list — a persist failure here
      aborts the run rather than risk continuing on a token TikTok may have rotated)
  → TikTok video.list, paginated (hard cap 10 pages / 200 videos, truncated: true if hit)
  → write/update the private daily snapshot: tenboy10b-sudo/CryptoLock-analytics
      tiktok/snapshots/YYYY/MM/YYYY-MM-DD.json (ANALYTICS_GITHUB_TOKEN; verified
      by a real run 2026-09-25)
  → secret-gated JSON response (no token/secret values)

The "cron/future trigger" above is NOT IMPLEMENTED — the collector is currently
called manually by the account owner.
```

As of 2026-09-24 (commit `b8193db`), a successful, fully-scoped OAuth login **persists the token bundle server-side to Upstash Redis** under one fixed key: **`cryptolock:tiktok:token_bundle:v1`** (`lib/tiktokTokenStore.js`). This is durable, secret-capable, server-side-only storage, deliberately **not** the GitHub repo (TikTok tokens must never be committed to Git). The stored bundle: `access_token`, `refresh_token`, `access_token_expires_at`, `refresh_token_expires_at` (both computed server-side at receipt as unix seconds), `scope`, `token_type`, `open_id`, `updated_at`. Never stored: `client_key`, `client_secret`, the authorization code, CSRF state, or cookies. Persistence happens after token-response validation and the required-scope check but *before* `user.info.basic`/`video.list` are called — any validation or Redis failure fails closed (generic 502, no internal details exposed) and those calls are never reached. **Recovery:** if the token bundle is absent or corrupt, perform a fresh manual authorization through `/tiktok-connect` — there is no other recovery path, and none is needed (this is a smoke-test route, not a production login users depend on). Analytics-history storage (as opposed to token/runtime-state storage) lives in a separate private GitHub repo — see "Analytics history storage" below.

Vercel Production env var **names** for the Redis store (values never documented): `KV_REST_API_READ_ONLY_TOKEN`, `KV_REST_API_TOKEN`, `KV_REST_API_URL`, `KV_URL`, `REDIS_URL`. Application code uses `KV_REST_API_URL` + `KV_REST_API_TOKEN` for write-capable REST access (never the read-only token, `KV_URL`, or `REDIS_URL`).

As of 2026-09-24 (commit `5b0b073`), a secret-gated **`POST /api/tiktok/collect`** endpoint proves the token bundle in Redis can be used autonomously, without any browser OAuth session: `Authorization: Bearer TIKTOK_COLLECT_SECRET` (new Vercel Production env var **name only**, values never documented), constant-time compared, never accepted via query string or body. It reads `cryptolock:tiktok:token_bundle:v1`, proactively refreshes the access token via TikTok's `refresh_token` grant when within 20 minutes of expiry (persisting the refreshed bundle back to Redis *before* calling `video.list`), and paginates `video.list` up to a hard cap of 10 pages / 200 videos. A Redis lock (`cryptolock:tiktok:collector_lock:v1`) prevents overlapping runs from both refreshing at once. It now also persists a daily analytics snapshot into a separate private GitHub repository — see "Analytics history storage" below. **Two auth modes (commit `4f0f109`, 2026-09-26):** the endpoint accepts either `TIKTOK_COLLECT_SECRET` (manual mode — full response including the `videos` array) or a second, separate `TIKTOK_SCHEDULE_SECRET` (schedule mode — the exact same pipeline, but a compact success body with no videos/titles/descriptions/share URLs/tokens, so a third-party scheduler's stored execution history never contains analytics content). Both are Bearer-header only, compared in constant time; neither configured, or both configured to the identical value, fails closed with 500. The snapshot written to the private repo is identical in both modes. The schedule mode is implemented and deployed but **not yet exercised by a real call**, and the cron-job.org job is **not configured yet**.

Redis keys in use: `cryptolock:tiktok:token_bundle:v1` (token bundle) and `cryptolock:tiktok:collector_lock:v1` (collector concurrency lock). **Recovery:** if the token bundle is absent or corrupt, perform a fresh manual authorization through `/tiktok-connect` — there is no other recovery path, and none is needed (this is a smoke-test route, not a production login users depend on).

### Analytics history storage

```
TikTok API
  → CryptoLock collector (POST /api/tiktok/collect)
  → Redis (token bundle + collector lock — runtime/secret state only)
  → private GitHub analytics history (durable, non-secret snapshot history)
```

Long-term TikTok analytics history is stored in a **separate PRIVATE** GitHub repository, **`tenboy10b-sudo/CryptoLock-analytics`** — created 2026-09-24, same owner as this repo. **The public `tenboy10b-sudo/CryptoLock` repository must never be used for TikTok analytics-history snapshots** — analytics is business data and this repo is public. Snapshot path convention: `tiktok/snapshots/YYYY/MM/YYYY-MM-DD.json`, one canonical file per UTC calendar day, derived from `collected_at` using UTC accessors only (server local timezone can never change which file a snapshot lands in). Redis remains the store for runtime/secret state only (token bundle, collector lock) — it is explicitly **not** the long-term analytics history store.

**Credential:** writes to `CryptoLock-analytics` use **only** a dedicated, least-privilege Vercel Production env var, **`ANALYTICS_GITHUB_TOKEN`** (name only, value never documented) — a fine-grained PAT scoped specifically to that one repo (Contents read/write, Metadata read-only), added 2026-09-25 and confirmed via preflight to have working read + write access. **The existing `GITHUB_TOKEN`** (used by `pages/api/autopost.js` for the public `CryptoLock` repo) **was tested against `CryptoLock-analytics` first and failed** (`repo_access: false` — most likely scoped only to the public repo) — it **must never be used for analytics**, and application code (`lib/tiktokAnalyticsStore.js`) never falls back to it. `GITHUB_TOKEN` is also configured as a Vercel "Sensitive" env var, so its value can never be read locally (`vercel env pull` returns it empty) — any future credential test for either token must run server-side (a temporary deployed diagnostic endpoint, removed immediately after use), not locally.

As of 2026-09-25 (commit `c6f9fd2`), `pages/api/tiktok/collect.js` builds a snapshot (`schema_version`, `snapshot_date`, `collected_at`, `videos_returned`, `pages_fetched`, `truncated`, `videos[]` — never token/secret fields) from the same data it already returns, and writes it via `lib/tiktokAnalyticsStore.js`'s `writeSnapshot()` immediately after a successful `video.list` call, before reporting overall collector success. **Idempotency:** GET the exact daily path first — 404 creates it, 200 updates it in place using the current blob SHA (never a new filename); a write conflict gets exactly one re-read + one retry, never an unbounded loop. A snapshot write failure fails the whole collector call closed (`{stage: "analytics_snapshot", error: "snapshot_write_failed"}`, safe 502) — the Redis lock is still released, but overall success is never claimed. **Status as of 2026-09-25: VERIFIED by a real production run** — the first real snapshot (`tiktok/snapshots/2026/09/2026-09-25.json`, 110 videos, 6 pages, `truncated: false`) was created by an authenticated collector call and independently confirmed in the private repo. The same-day *update* path and the conflict-retry path are covered by local tests but have not yet been exercised live. **No scheduled collection is configured** — snapshots are currently written only when the collector is called manually.

The current durable pipeline is: `TikTok OAuth → Upstash Redis token bundle → autonomous collector → automatic token refresh when needed → video.list pagination → private CryptoLock-analytics daily snapshot`, with GPT/Claude reading the snapshots from the private repo. **Every stage is VERIFIED by real production runs (2026-09-24/25):** the Sandbox OAuth login, Redis token persistence, the autonomous collector (110 videos, 6 pages, no truncation), **real token refresh** (a production run returned `token_refreshed: true` and completed successfully — meaning refresh, refreshed-bundle validation, persistence of the refreshed bundle to Redis, `video.list`, and the snapshot write all succeeded), and the private analytics snapshot writer. Token/refresh validation was hardened 2026-09-24 (commit `474acba`). **Scheduled collection (cron) is NOT IMPLEMENTED** — the scheduler-safe auth mode (`TIKTOK_SCHEDULE_SECRET`, compact response) is deployed, so what remains is configuring the cron-job.org job and validating it with a controlled "Run now". See `PROJECT_STATE.md` → TIKTOK STATUS for the current snapshot and `DOCUMENTATION.md` (продовження 52-69) for the full implementation/incident history.

## Tools

All under `/tools`: `auditshield` (interface into the separate AuditShield product — see `security-audit-private`/`audit-shield-bot` repos for that product's own code), `base64`, `hash`, `ip-info`, `password-generator`, `port-checker`, `powershell-commands`, `regex`, `subnet-calculator`, `windows-error-decoder`, `windows-event-id`.

**AuditShield** (verified from the separate repos' own documentation, not re-audited here): a PowerShell tool that scans a Windows PC across 22 security-relevant areas and produces an HTML report. Sold via a manual-payment Telegram bot (`@AuditShield_01_Bot`); licenses are key+password pairs stored in `security-audit-private/licenses.json`, checked live by the client-run `launcher.ps1` against that file via the GitHub API.

## Environment variables

Names only, no values:

| Name | Used in |
|---|---|
| `TELEGRAM_TOKEN` | `pages/api/autopost.js` |
| `TELEGRAM_CHANNEL_ID` | `pages/api/autopost.js` |
| `ANTHROPIC_API_KEY` | `pages/api/autopost.js` |
| `GITHUB_TOKEN` | `pages/api/autopost.js` (writes `published.json`) |
| `GITHUB_OWNER` | `pages/api/autopost.js` (defaults to `tenboy10b-sudo` if unset) |
| `GITHUB_REPO` | `pages/api/autopost.js` (defaults to `CryptoLock` if unset) |
| `AUTOPOST_SECRET` | `pages/api/autopost.js` (query-param auth gate) |
| `TIKTOK_CLIENT_KEY` | `pages/api/tiktok/login.js`, `pages/api/tiktok/callback.js`, `lib/tiktokCollector.js` (token refresh) |
| `TIKTOK_CLIENT_SECRET` | `pages/api/tiktok/callback.js`, `lib/tiktokCollector.js` (token refresh) — never sent to the client |
| `TIKTOK_REDIRECT_URI` | `pages/api/tiktok/login.js`, `pages/api/tiktok/callback.js` |
| `TIKTOK_COLLECT_SECRET` | `pages/api/tiktok/collect.js` — Bearer auth for the autonomous collector endpoint, **manual/admin mode** (full response incl. `videos[]`), added 2026-09-24 (rotated 2026-09-25) |
| `TIKTOK_SCHEDULE_SECRET` | `pages/api/tiktok/collect.js` — Bearer auth for the same endpoint in **schedule mode** (compact response, no `videos[]`), a dedicated least-privilege credential for cron-job.org, added 2026-09-26. Must differ from `TIKTOK_COLLECT_SECRET` (identical values make the endpoint fail closed with 500). |
| `ANALYTICS_GITHUB_TOKEN` | `lib/tiktokAnalyticsStore.js` — fine-grained PAT scoped to `tenboy10b-sudo/CryptoLock-analytics` only, added 2026-09-25. Never used for the public `CryptoLock` repo; `GITHUB_TOKEN` is never used for analytics. |
| `KV_REST_API_URL` | `lib/tiktokTokenStore.js` — write-capable REST binding, used for all TikTok token bundle/lock reads and writes |
| `KV_REST_API_TOKEN` | `lib/tiktokTokenStore.js` — used alongside `KV_REST_API_URL` |
| `KV_REST_API_READ_ONLY_TOKEN` | Upstash Redis — read-only variant, auto-provisioned, not used (application code always uses the write-capable pair above) |
| `KV_URL` | Upstash Redis — auto-provisioned, not used |
| `REDIS_URL` | Upstash Redis — auto-provisioned TCP connection string, not used |

## Local setup

```bash
npm install
npm run dev     # localhost:3000
npm run build   # verify build before pushing
```

## Deployment procedure

1. **Before code change:** `git fetch origin`, compare `HEAD` to `origin/main`.
2. **Before editing:** ensure local is current (fast-forward pull if behind and safe to do so).
3. **After change:** run relevant tests/`npm run build`, review the diff.
4. **Commit** with a message describing the actual change.
5. **Push** to GitHub when the task permits.
6. **Production deployment must only happen if the task explicitly permits DEPLOY.** Otherwise, stop after push and report that deploy was not performed by design.
7. If Vercel auto-deploy remains broken and deploy is explicitly authorized: `vercel --prod --yes`, then verify production directly.

## Production verification checklist

- HTTP status of homepage and at least one article
- `robots.txt` content matches source
- `sitemap.xml` returns and has a sane URL count
- The specific changed functionality, checked directly
- Vercel deployment identifier/timestamp, where available, to confirm the deploy actually happened

## Rollback

Git-based only: identify the last known-good commit SHA, and either `git revert` the offending commit(s) (preferred, preserves history) or check out that SHA into a new branch for review before promoting it. **Never** use `--force` push as a normal rollback mechanism on `main`.

## Known infrastructure issues

The Vercel↔GitHub auto-deploy connection has broken and been manually reconnected or worked around multiple times across this project's history (see DOCUMENTATION.md for the session-by-session account) — this is a recurring pattern tied to a GitHub account OAuth-App flag, not a one-off glitch. Expect it to recur; the manual `vercel --prod --yes` workaround is the established fallback, not a last resort.

## Documentation files

| File | Purpose |
|---|---|
| `PROJECT_STATE.md` | Current snapshot — "what is true right now?" |
| `HANDOFF.md` | This file — portable transfer guide for a new person/account/AI |
| `DOCUMENTATION.md` | Chronological historical record — "what happened and why?" Never rewritten, only appended to. |
| `CLAUDE.md` | Executor operating rules for Claude Code in this repo |
| `CHANGELOG.md` | Product/change history where appropriate — not the project's source of truth |

## NEW EXECUTOR STARTUP CHECKLIST

Every new Claude/ChatGPT/developer taking this over should, in order:

1. Read `PROJECT_STATE.md`.
2. Read this file (`HANDOFF.md`).
3. Read `CLAUDE.md`.
4. Read the most recent relevant sections of `DOCUMENTATION.md`.
5. `git fetch origin`.
6. Compare `HEAD` and `origin/main`.
7. Inspect the working tree for anything unexpected.
8. Confirm the actual scope of the task before touching anything.
9. Make no unrelated changes.
10. Never assume local state is current.
