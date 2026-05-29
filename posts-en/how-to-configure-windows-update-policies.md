---
title: "How to Control Windows Update with Group Policy and Registry"
date: "2026-04-16"
publishDate: "2026-04-16"
description: "Precisely control Windows Update behavior: defer feature and quality updates, block specific updates, force update schedules, and configure update sources using Group Policy and PowerShell."
tags: ["windows", "windows-update", "gpo", "administration"]
readTime: 6
---

Windows Update settings in the basic UI are limited. Group Policy and registry give you precise control over when, what, and how updates install.

---

## Defer Updates (Pro and Enterprise)

**Via Settings:**
`Win + I` → **Windows Update** → **Advanced options**:
- **Receive updates for other Microsoft products**: On/Off
- **Get the latest updates as soon as they're available**: Off (defers by ~1 week)

**Via Group Policy:**
`gpedit.msc` → **Computer Configuration** → **Administrative Templates** → **Windows Components** → **Windows Update** → **Windows Update for Business**

Key policies:

**Select when Preview Builds and Feature Updates are received:**
- Enable → set deferral to **365 days**
- This delays major version upgrades (22H2 → 23H2) by up to a year

**Select when Quality Updates are received:**
- Enable → set deferral to **14 days** (keeps security patches but gives time to test)

---

## Block Specific Updates

If a specific update causes problems:

```powershell
# Hide update by KB number using Windows Update PowerShell module
$session = New-Object -ComObject Microsoft.Update.Session
$searcher = $session.CreateUpdateSearcher()
$updates = $searcher.Search("IsInstalled=0").Updates

# Find the problematic update
$updates | Where-Object {$_.Title -like "*KB5034441*"} |
  ForEach-Object {$_.IsHidden = $true}
```

Or download the **Show or Hide Updates** troubleshooter from Microsoft for a GUI approach.

---

## Force Automatic Updates

```powershell
# Set to auto-download and install
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU"
New-Item -Path $path -Force | Out-Null
Set-ItemProperty -Path $path -Name "NoAutoUpdate" -Value 0 -Type DWord
Set-ItemProperty -Path $path -Name "AUOptions" -Value 4 -Type DWord  # 4 = auto download and install
Set-ItemProperty -Path $path -Name "ScheduledInstallDay" -Value 0 -Type DWord  # 0 = every day
Set-ItemProperty -Path $path -Name "ScheduledInstallTime" -Value 3 -Type DWord  # 3 AM
```

AU Options values:
- `2` = Notify before download
- `3` = Auto download, notify before install
- `4` = Auto download and schedule install
- `5` = Allow local admin to choose

---

## Configure WSUS Source (Enterprise)

Point Windows Update at an internal WSUS server:

```powershell
$wuPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate"
New-Item -Path $wuPath -Force | Out-Null
Set-ItemProperty -Path $wuPath -Name "WUServer" -Value "http://wsus.company.local:8530"
Set-ItemProperty -Path $wuPath -Name "WUStatusServer" -Value "http://wsus.company.local:8530"

$auPath = "$wuPath\AU"
New-Item -Path $auPath -Force | Out-Null
Set-ItemProperty -Path $auPath -Name "UseWUServer" -Value 1 -Type DWord
```

---

## Check for and Install Updates via PowerShell

```powershell
# Install PSWindowsUpdate module
Install-Module PSWindowsUpdate -Force -Scope CurrentUser

# Check for available updates
Get-WindowsUpdate

# Install all available updates
Install-WindowsUpdate -AcceptAll -AutoReboot

# Install only security updates
Get-WindowsUpdate -Category "Security Updates" | Install-WindowsUpdate -AcceptAll

# Uninstall a specific update
Uninstall-WindowsUpdate -KBArticleID KB5034441 -Confirm:$false
```

---

## Pause Updates Registry Method

```powershell
# Pause updates for 35 days (maximum via Settings is 35 days)
$pauseDate = (Get-Date).AddDays(35).ToString("yyyy-MM-ddTHH:mm:ssZ")
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\WindowsUpdate\UX\Settings" `
  -Name "PauseFeatureUpdatesEndTime" -Value $pauseDate
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\WindowsUpdate\UX\Settings" `
  -Name "PauseQualityUpdatesEndTime" -Value $pauseDate

# Resume updates
Remove-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\WindowsUpdate\UX\Settings" `
  -Name "PauseFeatureUpdatesEndTime" -ErrorAction SilentlyContinue
Remove-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\WindowsUpdate\UX\Settings" `
  -Name "PauseQualityUpdatesEndTime" -ErrorAction SilentlyContinue
```

---

## View Update History

```powershell
# Last 20 installed updates
Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 20 HotFixID, Description, InstalledOn

# Via Windows Update COM object
$session = New-Object -ComObject Microsoft.Update.Session
$searcher = $session.CreateUpdateSearcher()
$history = $searcher.QueryHistory(0, 20)
$history | Select-Object Title, Date, ResultCode |
  Where-Object {$_.ResultCode -eq 2} | # 2 = succeeded
  Sort-Object Date -Descending
```

---

## Force Update Check Now

```powershell
# Trigger immediate update check
(New-Object -ComObject Microsoft.Update.AutoUpdate).DetectNow()

# Or via wuauclt
wuauclt /detectnow
wuauclt /updatenow
```

---

## Summary

Defer feature updates by up to 365 days via Group Policy to avoid being an early adopter. Defer quality updates by 14 days to let others catch any issues first. Use `PSWindowsUpdate` module for scripted update management. Block problematic updates with `IsHidden = $true` on the update object.
