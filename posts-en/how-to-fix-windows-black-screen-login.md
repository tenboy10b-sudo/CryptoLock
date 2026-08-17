---
title: "How to Fix Black Screen After Login in Windows 10 and 11"
date: "2026-05-21"
publishDate: "2026-05-21"
description: "Fix black screen after login in Windows 10 and 11. Desktop doesn't load, cursor visible but no icons — restart Explorer, fix GPU driver, repair startup entries."
tags: ["windows", "black-screen", "troubleshooting", "errors", "drivers"]
readTime: 5
translatesUk: "chornyy-ekran-pislya-vkhodu-windows"
---

Black screen after login — Windows loads but the desktop never appears. Here's how to diagnose and fix every variant. (Screen is black before you even reach login, or has no cursor at all? See the [general black screen triage guide](/en/how-to-fix-windows-black-screen) for other scenarios.)

---

## Quick Fix: Restart Explorer

`Ctrl + Alt + Delete` → **Task Manager** → **File** → **Run new task** → type `explorer.exe` → OK

```powershell
# Or kill and restart Explorer from Task Manager Details tab
Stop-Process -Name explorer -Force
Start-Process explorer
```

---

## Fix via Task Manager When Stuck

If you can't see Task Manager:
1. `Ctrl + Alt + Delete` → Task Manager
2. **More details** (if in simple view)
3. **File** → **Run new task** → `cmd.exe` → OK
4. In CMD:

```cmd
taskkill /f /im explorer.exe
start explorer.exe
```

---

## Fix GPU Driver Issue

Most common cause — especially after Windows Update:

```powershell
# Boot into Safe Mode first
bcdedit /set {current} safeboot minimal
Restart-Computer
```

In Safe Mode:
```powershell
# Uninstall display driver
pnputil /delete-driver oem*.inf /uninstall /force

# Or via Device Manager → Display adapters → right-click → Uninstall device
# Check "Delete the driver software for this device"

# Restart normally — Windows installs basic driver
bcdedit /deletevalue {current} safeboot
Restart-Computer
```

---

## Fix Shell Registry Entry

```powershell
# Check if shell is set correctly
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" |
  Select-Object Shell, Userinit

# Should be: Shell = explorer.exe
# Fix if wrong:
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" `
  -Name "Shell" -Value "explorer.exe"
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" `
  -Name "Userinit" -Value "C:\Windows\system32\userinit.exe,"
```

---

## Fix DisplayLink or Third-Party Display Software

DisplayLink (USB monitors), virtual desktop apps and screen recorders sometimes cause black screen:

```powershell
# Check for DisplayLink process
Get-Process | Where-Object {$_.Name -like "*display*" -or $_.Name -like "*monitor*"}

# Uninstall DisplayLink if causing issues
# Control Panel → Programs → uninstall DisplayLink USB Graphics
```

---

## Fix via Startup Repair (WinRE)

If black screen occurs every boot:

1. Force 3 failed boots → WinRE opens
2. **Troubleshoot** → **Advanced options** → **Startup Repair**

```cmd
REM Or from WinRE CMD:
sfc /scannow /offbootdir=C:\ /offwindir=C:\Windows
DISM /Image:C:\ /Cleanup-Image /RestoreHealth
```

---

## Check for Malware

Some malware replaces Explorer with its own process:

```powershell
# Check what's running as shell
Get-ItemProperty "HKCU:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" -EA 0 |
  Select-Object Shell

# Any value here means user-level shell override — remove it
Remove-ItemProperty "HKCU:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" -Name "Shell" -EA 0
```

---

## Fix Display Timeout Issue

Sometimes the screen turns off immediately after login due to power settings:

```powershell
# Set screen timeout to never (troubleshooting)
powercfg /change monitor-timeout-ac 0
powercfg /change monitor-timeout-dc 0
```

---

## Summary

Try restarting Explorer first (Ctrl+Alt+Del → Task Manager). Check Shell registry key. Boot Safe Mode and remove GPU driver. Run SFC+DISM from WinRE. Check for malware hijacking the shell.

## Frequently Asked Questions

### Cursor is visible but no desktop — what does that mean?

Explorer.exe isn't running. Use Task Manager to start it manually. If it crashes immediately on start, run SFC to repair system files.

### Black screen only on external monitor — what's wrong?

Display adapter or cable issue. Try pressing `Win + P` to cycle display modes. Check if the monitor is set as primary in Display settings.

### Black screen after installing new GPU — how to fix?

The driver may not be installed yet or is incompatible. Boot in Safe Mode, uninstall any existing GPU drivers, restart normally, then install the correct driver from the GPU manufacturer's website.
