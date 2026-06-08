---
title: "Windows Update: How to Update, Disable, or Fix Update Errors"
date: "2026-06-08"
publishDate: "2026-08-04"
updated: "2026-06-08"
description: "How to update Windows 10 and 11, pause or disable automatic updates. Fix Windows Update errors: 0x80070422, 0x8024402C, stuck at 0%. Roll back problematic updates."
tags: ["windows", "updates", "windows-update", "settings"]
readTime: 7
translatesUk: "windows-update-yak-onovyty-vymknuty-vypravyty-pomylky"
---

Windows Update installs security patches and feature updates automatically. Sometimes updates break things, downloads get stuck at 0%, or you just want control over when to update. Here's everything you need.

---

## Check for Updates Manually

```
Win + I → Windows Update → Check for updates
```

```powershell
Install-Module PSWindowsUpdate -Force
Get-WindowsUpdate
Install-WindowsUpdate -AcceptAll -AutoReboot
```

---

## Pause Updates

```
Win + I → Windows Update → Advanced options → Pause updates (1–5 weeks)
```

```powershell
# Defer quality updates by 30 days via registry
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU" `
  -Name "DeferQualityUpdates" -Value 1
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU" `
  -Name "DeferQualityUpdatesPeriodInDays" -Value 30
```

---

## Disable Automatic Updates

> ⚠️ Disabling updates is a security risk. Pausing is safer.

```powershell
# Disable Windows Update service
Stop-Service wuauserv
Set-Service wuauserv -StartupType Disabled

# Re-enable
Set-Service wuauserv -StartupType Automatic
Start-Service wuauserv
```

**Metered Connection trick:**
`Win + I → Network → Wi-Fi → [network name] → Metered connection → On`

---

## Fix Windows Update Errors

### Error 0x80070422 — service not running

```powershell
$services = @('wuauserv','cryptsvc','bits','msiserver')
foreach ($s in $services) {
    Set-Service $s -StartupType Automatic
    Start-Service $s -ErrorAction SilentlyContinue
}
```

### Error 0x8024402C — can't connect to server

```cmd
netsh winhttp reset proxy
netsh winsock reset
netsh int ip reset
shutdown /r /t 0
```

### Update stuck at 0%

```powershell
Stop-Service wuauserv, bits, cryptsvc -Force
Remove-Item C:\Windows\SoftwareDistribution\* -Recurse -Force
Remove-Item C:\Windows\System32\catroot2\* -Recurse -Force -ErrorAction SilentlyContinue
Start-Service wuauserv, bits, cryptsvc
```

### Error 0x80073712 — corrupted components

```cmd
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
```

---

## Roll Back Problematic Update

```
Win + I → Windows Update → Update history → Uninstall updates
```

```powershell
wusa /uninstall /kb:5034441 /quiet /norestart
```

---

## Summary

| Task | Solution |
|------|---------|
| Check for updates | Win+I → Windows Update |
| Pause for a week | Windows Update → Pause |
| Disable auto-updates | wuauserv service → Disabled |
| Error 0x80070422 | Start wuauserv, bits services |
| Update stuck | Clear SoftwareDistribution folder |
| Roll back update | Update history → Uninstall |
