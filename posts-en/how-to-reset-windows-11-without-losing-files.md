---
title: "How to Reset Windows 11 Without Losing Files (Factory Reset Guide)"
date: "2026-05-04"
publishDate: "2026-05-04"
description: "Reset Windows 11 to factory settings while keeping personal files. Use Fresh Start, Reset this PC, or cloud download to fix persistent issues without data loss."
tags: ["windows", "reset", "recovery", "installation", "troubleshooting"]
readTime: 5
translatesUk: "yak-skydannya-windows-11-bez-vtraty-fayliv"
---

When Windows has persistent issues that can't be fixed otherwise, resetting it is the nuclear option — but it doesn't have to mean losing your files.

---

## Option 1: Reset This PC (Recommended)

`Win + I` → **System** → **Recovery** → **Reset this PC** → **Reset PC**

Choose:
- **Keep my files** — removes apps and settings, keeps personal files
- **Remove everything** — full clean install, removes all data

Then choose:
- **Cloud download** — downloads fresh Windows from Microsoft (best if files are corrupted)
- **Local reinstall** — uses files already on your PC (faster, no internet needed)

---

## Option 2: Via WinRE (If Windows Won't Start)

Force WinRE (3 failed boots) or boot from USB:

**Troubleshoot** → **Reset this PC** → **Keep my files** → **Cloud download**

---

## Option 3: Fresh Start (Windows 10 / Early 11)

```powershell
# Open Fresh Start wizard (Windows Security)
Start-Process "ms-settings:windowsdefender"
# Then: Device performance & health → Fresh Start
```

Fresh Start reinstalls Windows keeping files but removes most pre-installed apps including manufacturer bloatware.

---

## Before Resetting — Back Up First

```powershell
# Export list of installed programs before reset
Get-ItemProperty HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\* |
  Select-Object DisplayName, DisplayVersion, Publisher |
  Where-Object {$_.DisplayName} |
  Sort-Object DisplayName |
  Export-Csv "C:\Users\Public\Desktop\installed-apps.csv" -NoTypeInformation

# Export winget app list
winget export -o "C:\Users\Public\Desktop\winget-apps.json"

# Note important settings: Wi-Fi passwords, browser profiles, etc.
```

---

## What "Keep My Files" Actually Removes

| Removed | Kept |
|---------|------|
| All installed applications | Documents, Photos, Videos |
| Desktop shortcuts | Desktop files |
| System settings | Downloads folder |
| Custom fonts | Music |
| Registry modifications | User account |

---

## After Reset: Reinstall Apps

```powershell
# Reinstall apps from winget export
winget import -i "C:\winget-apps.json" --accept-package-agreements --accept-source-agreements

# Or reinstall common apps quickly
$apps = @("Google.Chrome", "Mozilla.Firefox", "7zip.7zip", "Git.Git", "Bitwarden.Bitwarden")
foreach ($app in $apps) {
  winget install $app --silent --accept-package-agreements
}
```

---

## Fix Without Full Reset

Before resetting, try these in order:

```powershell
# 1. Repair system files
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow

# 2. Run startup repair
# WinRE → Troubleshoot → Advanced → Startup Repair

# 3. System Restore
rstrui.exe
```

---

## Summary

Use **Reset this PC → Keep my files → Cloud download** for the safest reset. Export your app list with winget before starting. WinRE Reset works even if Windows won't start. Fresh Start removes manufacturer bloatware. Always run DISM + SFC before resorting to reset.

## Frequently Asked Questions

### Will Reset remove viruses?

Yes — Reset with **Remove everything** + Cloud download removes all malware. **Keep my files** may not remove malware that hides in user folders.

### How long does a reset take?

30-60 minutes for **Keep my files**. 45-90 minutes for **Remove everything**. Cloud download adds 10-30 minutes depending on internet speed.

### My PC is very slow after reset — is that normal?

Yes temporarily — Windows Update downloads updates in the background after reset. Also Windows Search re-indexes everything. Give it 2-4 hours to settle before judging performance.
