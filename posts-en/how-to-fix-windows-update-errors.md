---
title: "How to Fix Windows Update Errors: The Complete Guide"
date: "2026-04-30"
publishDate: "2026-04-30"
description: "Windows Update stuck, failing with error codes, or not downloading? Here are the most effective fixes for 0x80070005, 0x800f0922, 0x80073712 and other common update errors."
tags: ["windows", "windows-update", "troubleshooting", "tools"]
readTime: 8
---

Windows Update errors are frustrating — the system won't update, shows a cryptic error code, and "Try again" does nothing. Here's how to actually fix them.

---

## Step 1. Run the Windows Update Troubleshooter

The built-in troubleshooter fixes the most common problems automatically.

`Settings` → `System` → `Troubleshoot` → `Other troubleshooters` → **Windows Update** → **Run**

On Windows 10: `Settings` → `Update & Security` → `Troubleshoot` → `Windows Update`

Restart after it finishes, then try updating again.

---

## Step 2. Reset Windows Update Components

If the troubleshooter didn't help, reset the update service manually. Open **Command Prompt as Administrator** and run:

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

This clears the update cache and forces Windows to re-download update metadata from scratch.

---

## Step 3. Run SFC and DISM

Corrupted system files are behind many update errors.

```cmd
sfc /scannow
```

Wait for it to finish (5–15 minutes), then:

```cmd
DISM /Online /Cleanup-Image /RestoreHealth
```

Restart and try updating again.

---

## Step 4. Free Up Disk Space

Windows needs at least **10–15 GB free** on drive C to install major updates. Check with:

```powershell
Get-PSDrive C | Select-Object Used, Free
```

If space is low: `Win + R` → `cleanmgr` → select drive C → **Clean up system files** → check **Windows Update Cleanup** and **Temporary files**.

---

## Step 5. Fix Specific Error Codes

### 0x80070005 — Access Denied

Usually caused by a third-party antivirus blocking the update. Temporarily disable it and retry.

Also check Windows Update service is running:
```cmd
sc query wuauserv
```
If it shows `STOPPED`, start it: `net start wuauserv`

---

### 0x800f0922 — Failed to Install

Not enough space in the System Reserved partition, or VPN/proxy is blocking Microsoft servers.

Disable VPN/proxy, then:
```cmd
netsh winhttp reset proxy
```

---

### 0x80073712 — File Is Missing or Corrupt

Run DISM with the `/RestoreHealth` flag (Step 3 above). If that fails, mount the Windows ISO and point DISM to it:

```cmd
DISM /Online /Cleanup-Image /RestoreHealth /Source:D:\Sources\install.wim /LimitAccess
```

Replace `D:` with your ISO drive letter.

---

### 0x80070422 — Service Cannot Be Started

The Windows Update service is disabled.

```cmd
sc config wuauserv start= auto
net start wuauserv
```

---

### 0x80240034 — Update Not Applicable

The update doesn't apply to your Windows version. Check which build you're on:

```cmd
winver
```

If you're several versions behind, you may need to use the [Windows Update Assistant](https://www.microsoft.com/en-us/software-download/windows11) to upgrade directly.

---

## Step 6. Install the Update Manually

If automatic update keeps failing, download the update directly from Microsoft.

1. Find your error-failing update KB number in `Settings` → `Windows Update` → `Update history`
2. Go to [Microsoft Update Catalog](https://www.catalog.update.microsoft.com)
3. Search for the KB number, download the `.msu` file
4. Double-click to install

---

## Step 7. Use Media Creation Tool (Last Resort)

If nothing works and you're stuck on an old version, the Media Creation Tool performs an in-place upgrade — reinstalls Windows while keeping your files and apps.

Download from [microsoft.com/software-download/windows11](https://www.microsoft.com/software-download/windows11), run it, choose **Upgrade this PC now**.

---

## What Not to Do

- **Don't disable Windows Update permanently** — security patches are critical
- **Don't use registry "fixes" from random forums** — they often break more than they fix
- **Don't interrupt an update mid-install** — wait even if it seems stuck (some updates take 30+ minutes at a certain percentage)

---

## Summary

For most errors: run the troubleshooter → reset update components → run SFC + DISM. If you're getting a specific error code, use the lookup in Step 5. Manual KB download (Step 6) solves ~90% of stubborn cases.
