# CryptoLock — TikTok Windows tutorial production standard
Status: **OWNER-APPROVED CREATIVE BASELINE** (2026-11-01)
Version: 1.0
Applies to: all new CryptoLock short-form Windows troubleshooting / administration / security walkthroughs.
Origin: owner accepted Claude's Password Policy v5-style video after successive review rounds. Approval is for the creative format and workflow, **not blanket approval of future renders**.

## Goal & responsibilities
- Goal: practical, watchable, credible Windows tutorials with a strong first seconds and a clear, verified user outcome.
- GPT is product/editorial/accuracy/QA lead. Claude Code is production executor, performing editing and output rendering. Owner approves release.
- Source of truth is the *actual supplied screen recording*, plus official Microsoft documentation for technically important policy/security claims. Never invent a UI state, action, click, command result, or claimed environment.
- If capture is from a physical host rather than a VM, do not describe it as lab footage. Protect desktop names, taskbar, accounts, notification contents and other private identifiers by privacy-safe cropping/blur.

## Fixed production requirements
1. **Source evidence first.** Inspect original file and create a timecoded action map: what is really clicked/typed, visible before/after values, verified outcome. If result differs from an intermediate typed value, only the saved final state may be used for the hook.
2. **9:16 export** default 1080x1920, 30fps, H.264 MP4 + AAC. Preserve real horizontal Windows capture, with editorial pan/zoom/crop to fit portrait; do not fake mobile screen recordings.
3. **Instruction overlays**: every arrow, outline, click cue and enlarged field must be verified on source pixel coordinates and final output. No arbitrary/click-inventing overlays. Text and active targets readable at normal phone size; avoid obstructing live UI or TikTok interface zones.
4. **HOOK IS PRIORITY #1**: strong first frame based on a factual on-screen before/after or problem, not generic hype. Design a specific visual for each topic using source screenshots (not a reused generic slate). Displayed words and narrator's spoken words must match; animations of meaningful numbers/terms synchronized to corresponding voiced words. Voice starts at the opening. Normally 3–6 sec depending on natural spoken length. Avoid vague «тут/ось тут» when there is no precise visible referent, or false duration/security guarantees.
5. **ONE narrator / ONE output**: Ukrainian `uk-UA-OstapNeural` voice throughout (including hook). Do not splice English voices. Speak *natural Ukrainian explanatory phrases*, including Ukrainian equivalents for English UI menu labels while keeping labels **unchanged in the real captured interface**. Owner-approved voice convention: do not say spoken «Windows» or «Віндовс»; use grammatically inflected `операційна система` where needed (or avoid unnecessary repetition). Preserve exact commands in on-screen labels (e.g. `gpedit.msc`). Validate pronunciation and contextual stress by actual listening to test/full phrases; TTS timestamps and spectral/duration checks cannot prove intelligibility.
6. **Real actions remain primary**: trim dead time, add minimal editorial holds only for coherent narration. Do not artificially stretch movement, invent steps, or restage screens. Voice and highlight are synced to real event times; show genuine outcome clearly.
7. **End disclaimer is a fixed template**: dedicated full-screen page, EXACT owner-approved wording below, total duration **3.0 sec**, a left-to-right mask reveal of **all lines together in ~0.6 sec** (not line-by-line nor moving text out of frame), full-text hold until ~2.8 sec, then fade ~0.2 sec. Ensure contrast and safe area. Owner consciously prefers 3 sec although full disclaimer is too long to read normally in that window. Keep text in description or linked disclosures if needed. Do not alter disclaimer without owner approval.

> Це відео носить  
> виключно освітній та  
> демонстраційний характер.  
> Не повторюйте дії,  
> які можуть бути небезпечними.  
> Виконуйте тільки на власних  
> пристроях та з дозволу власника.  
> Показано легальне  
> програмне забезпечення.

8. **One deliverable format**: only **one final voiced MP4** (no `no_voice` export). Retain isolated WAV voice stems, phrase-level audio, editable project (`project.json`/scripts and source references), PNG hook, full-screen disclaimer image, 10–14+ frame QA contact sheet, technical QA JSON. A short hook preview is useful for early visual/audio gate; no alternate full edit unless owner orders one.
9. **Safe iteration**: unique working folder and version; original recording and previous approved versions unchanged. No VM/host OS configuration work, website changes, TikTok posting, Git deployment or production operations as side effects of video editing.
10. **QA before presenting**: source-vs-overlay accuracy, portrait visibility, privacy, full MP4 decode, audio timing/level/no clipping, exact Ukrainian spelling and numbers, voiced hook coherence, final outcome frame, safe margins, no awkward long holds or broken transitions, TTS audible review by human. Report issues honestly; automated pixel fit is not creative approval.
11. **Release**: video is review-only until OWNER approval. For publication, respect applicable platform AI-audio labeling rules, check AI voice commercial permissions for the specific channel/use, then evaluate retention/completion, saves/shares, profile visits and follows. No growth guarantees.

## Per-video handoff and signoff
- Analysis: exact original source file path/hash, resolution/fps/duration, provenance/PII, 5–10 evidence frames, timecoded action map, true before/after, technical limitations/caveats.
- Creative: hook copy and 1:1 spoken script, visually grounded scene outline, Ukrainian voice exact TTS text, timing map, before/after proof, final disclaimer.
- Production: editable project, final MP4, separate WAV, hook preview, QA images/report and SHA256. No auto-posting.
- Owner gate: actual MP4 viewed with sound on a phone. If owner approves, log approval; if not, revise specific components without undoing approved core.

## New topic special case: password-history recording 2026-11-01 17:40:42
- Source filename `Записування 2026-11-01 174042.mp4`; observed editor path `Computer Configuration > Windows Settings > Security Settings > Account Policies > Password Policy > Enforce password history`.
- Recorded initial value `0 passwords remembered`; intermediate input shows **24**, but saved final table shows **22 passwords remembered**. The only defensible factual hook is **0 → 22**, NOT 0 → 24. Never call 22 the Microsoft-recommended value.
- Microsoft documentation recommends 24 for `Enforce password history`; `Minimum password age` also matters. Video shows `Minimum password age: 0 days` in the policy table, so do not imply that this example alone makes password reuse impossible. Consider clearly labeling this a demonstration rather than a universal optimal security configuration. If owner specifically wants best-practice video 24 + appropriate minimum age, request separate corrected source demonstration before claiming it.
- First ~20 sec navigates familiar gpedit trees; avoid overly long duplicate setup from previous tutorial. Preserve actual relevant target, use brief navigation edits, don't claim clicks that source doesn't show.

## Decision record
DATE: 2026-11-01
PROBLEM: Repeated low-quality TikTok edits and inconsistent voice/hook/disclaimer styles.
EVIDENCE: owner rejected GPT v1/v2, reviewed Claude PRO iterations, and explicitly approved final creative workflow/format.
DECISION: lock this production standard as default for all future CryptoLock Windows TikToks.
EXPECTED RESULT: consistent clarity, fewer corrections, higher-quality topical hooks.
METRIC: owner first-pass approval; verified overlay correctness; first-3s retention, full-video completion, saves/shares, qualified profile visits and follows once published.
RESULT: standard saved; not evidence of TikTok distribution.
FOLLOW-UP: use on new password-history source, owner review before release.
