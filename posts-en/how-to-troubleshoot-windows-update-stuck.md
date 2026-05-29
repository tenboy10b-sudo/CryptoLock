---
title: "Windows Update Stuck at 0% or 100%: How to Fix It"
date: "2026-03-01"
publishDate: "2026-03-01"
description: "Windows Update stuck downloading, installing, or at a specific percentage? Step-by-step fixes for updates that won't progress, including resetting update components and using DISM."
tags: ["windows", "windows-update", "troubleshooting", "tools"]
readTime: 5
---

A stuck Windows Update — frozen at 0%, 32%, or 100% for hours — is one of the most frustrating Windows problems. Here's how to unstick it.

---

## Step 1: Wait (Seriously)

Some updates genuinely take a long time. Before doing anything:

- **0% for under 30 minutes** — wait, especially on slow internet
- **Installing at a fixed percentage for under 2 hours** — wait, some updates process slowly
- **Stuck for over 3 hours with no disk activity** — proceed with fixes below

Check disk activity: if the drive light is blinking or Task Manager shows disk usage — it's still working.

---

## Step 2: Restart and Try Again

Sometimes a single restart unsticks the update.

`Start` → **Update and Shut Down** (not just Restart) — this lets pending updates apply during shutdown.

If it freezes during restart: hold the power button for 10 seconds to force off, then start normally. Windows will usually detect the interrupted update and retry.

---

## Step 3: Run Windows Update Troubleshooter

`Win + I` → **System** → **Troubleshoot** → **Other troubleshooters** → **Windows Update** → **Run**

This automatically detects and fixes common update issues — corrupted cache, stopped services, permission errors.

---

## Step 4: Reset Windows Update Components

The most reliable manual fix:

```cmd
net stop wuauserv
net stop cryptSvc
net stop bits
net stop msiserver

ren C:\Windows\SoftwareDistribution SoftwareDistribution.old
ren C:\Windows\System32\catroot2 catroot2.old

net start wuauserv
net start cryptSvc
net start bits
net start msiserver
```

Run as Administrator. This clears the update cache and forces a fresh download.

---

## Step 5: Clear the Update Queue

If updates are queued but stuck:

```powershell
# Stop Update service
Stop-Service wuauserv -Force

# Delete downloaded update files
Remove-Item "C:\Windows\SoftwareDistribution\Download\*" -Recurse -Force

# Restart service
Start-Service wuauserv

# Trigger update check
(New-Object -ComObject Microsoft.Update.AutoUpdate).DetectNow()
```

---

## Step 6: Fix with DISM and SFC

Corrupted system files often cause stuck updates:

```cmd
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
```

Run DISM first — it repairs the component store that SFC relies on. Restart after both complete.

---

## Step 7: Manually Download the Update

If a specific update keeps failing:

1. Note the KB number from **Windows Update** → **Update history**
2. Go to [catalog.update.microsoft.com](https://www.catalog.update.microsoft.com)
3. Search for the KB number
4. Download the `.msu` file for your Windows version and architecture
5. Run it directly — bypasses Windows Update entirely

---

## Step 8: Use Media Creation Tool

If nothing works and you're stuck on an old version:

Download **Windows 11 Installation Assistant** from [microsoft.com/software-download/windows11](https://www.microsoft.com/software-download/windows11) → run → choose **Update now**.

This performs an in-place upgrade — updates Windows without touching your files.

---

## Stuck at "Getting Windows ready" Screen

This appears after updates install. If stuck for over an hour:

- **Don't force restart** if the drive light is active — it may be writing
- After 2+ hours with no disk activity: force restart (hold power button)
- Windows usually recovers and either continues or rolls back

If it boot-loops after forced restart: boot from USB → **Repair your computer** → **Startup Repair**

---

## Prevent Future Stuck Updates

```powershell
# Check Windows Update service is set to automatic
Get-Service wuauserv | Select-Object Name, StartType, Status

# Ensure BITS service is running (downloads updates in background)
Get-Service bits | Select-Object Name, StartType, Status
```

Keep at least **10 GB free** on C: — updates need space to download and extract.

---


---

## 🔍 Не знаєш що означає код помилки Windows?

Якщо Windows показує код на кшталт `0x80070005`, `0x80070002` або `0xC000021A` — скористайся безкоштовним інструментом:

**[→ Декодер помилок Windows](/tools/windows-error-decoder)** — введи код і одразу дізнайся що він означає та як виправити.


## Summary

In order: wait 2+ hours → restart → run troubleshooter → reset update components (`net stop wuauserv` then rename SoftwareDistribution folder) → DISM + SFC → manual KB download. The component reset (Step 4) fixes the majority of stuck update cases.
