---
title: "How to Remove a Virus from Windows Without Paid Antivirus"
date: "2026-04-22"
publishDate: "2026-04-22"
description: "Step-by-step guide to removing malware from Windows 10 and 11 using free built-in tools: Windows Defender, Safe Mode, Malwarebytes Free, and manual cleanup."
tags: ["windows", "security", "viruses", "tools"]
readTime: 6
translatesUk: "yak-vydatyly-virus-z-windows"
---

Your PC is infected but you don't want to pay for antivirus? Windows has powerful free tools that handle most malware. Here's exactly what to do.

---

## Step 1: Boot into Safe Mode

Safe Mode prevents most malware from loading.

Hold `Shift` and click **Restart** → **Troubleshoot** → **Advanced options** → **Startup Settings** → **Restart** → press **4** (Safe Mode) or **5** (Safe Mode with Networking).

---

## Step 2: Run Windows Defender Full Scan

```powershell
# Start a full scan from PowerShell (run as Administrator)
Start-MpScan -ScanType FullScan
```

Or: **Windows Security** → **Virus & threat protection** → **Scan options** → **Full scan** → **Scan now**.

Wait for it to complete — this can take 30–60 minutes.

---

## Step 3: Download and Run Malwarebytes Free

Malwarebytes catches things Defender sometimes misses.

1. Download from **malwarebytes.com** (free version)
2. Install and run a **Threat Scan**
3. Quarantine everything it finds
4. Restart your PC

---

## Step 4: Clean Temp Files

Malware often hides in temp folders.

```powershell
# Run as Administrator
Remove-Item "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "C:\Windows\Temp\*" -Recurse -Force -ErrorAction SilentlyContinue
```

---

## Step 5: Check Startup Programs

Malware often adds itself to startup.

`Ctrl + Shift + Esc` → **Startup** tab → look for anything suspicious or unknown → right-click → **Disable**.

Then open Registry Editor (`Win + R` → `regedit`) and check:
```
HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run
HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run
```

Delete any entries you don't recognize.

---

## Step 6: Reset Browser Settings

Many infections target browsers.

**Chrome:** `...` → Settings → **Reset settings** → **Restore settings to their original defaults**.

**Edge:** `edge://settings/resetProfileSettings`

**Firefox:** `about:support` → **Refresh Firefox**.

Also check installed extensions — remove anything you didn't install.

---

## Step 7: Check Hosts File

Some malware modifies the hosts file to redirect websites.

```powershell
notepad C:\Windows\System32\drivers\etc\hosts
```

It should only contain lines starting with `#` (comments) and possibly `127.0.0.1 localhost`. Delete anything else.

---

## Signs Your PC is Clean

- No more pop-up ads or random browser redirects
- CPU and RAM usage normal in Task Manager
- No unknown processes in Task Manager
- Browser homepage and search engine are back to normal

---

## When to Reinstall Windows

If malware keeps coming back after removal, or you suspect a rootkit — reinstall Windows. Back up your personal files first (not programs — those may be infected).

**Settings** → **Recovery** → **Reset this PC** → **Remove everything**.

---

## Summary

Safe Mode → Windows Defender full scan → Malwarebytes Free → clean temp files → check startup and registry. This sequence removes 95% of common malware for free. For persistent infections — a clean Windows reinstall is the safest solution.
