---
title: "How to Fix Slow Windows Boot Time"
date: "2026-04-09"
publishDate: "2026-04-09"
description: "Windows taking too long to boot? Find what's causing the delay, disable startup programs, enable Fast Startup, and use Event Viewer to pinpoint slow components."
tags: ["windows", "optimization", "performance", "diagnostics"]
readTime: 6
---

A slow boot is usually caused by too many startup programs, a failing drive, or a specific Windows component taking too long to initialize. Here's how to diagnose and fix it systematically.

---

## Measure Current Boot Time

```powershell
# Boot time from event log (Event ID 100)
Get-WinEvent -FilterHashtable @{
  LogName = 'Microsoft-Windows-Diagnostics-Performance/Operational'
  Id = 100
} -MaxEvents 5 | Select-Object TimeCreated,
  @{n='Boot(ms)';e={$_.Properties[0].Value}},
  @{n='Boot(sec)';e={[math]::Round($_.Properties[0].Value/1000,1)}}
```

**Expected times:**
- NVMe SSD: 5–10 seconds
- SATA SSD: 10–20 seconds
- HDD: 30–60 seconds

If significantly longer, something is adding delay.

---

## Find What's Causing the Delay

```powershell
# Event ID 101 — which component caused delay and by how much
Get-WinEvent -FilterHashtable @{
  LogName = 'Microsoft-Windows-Diagnostics-Performance/Operational'
  Id = 101
} -MaxEvents 20 | Select-Object TimeCreated,
  @{n='Component';e={$_.Properties[1].Value}},
  @{n='Delay(ms)';e={$_.Properties[4].Value}} |
  Sort-Object 'Delay(ms)' -Descending
```

The top entries show which service, driver, or app is slowing boot the most.

---

## Fix 1: Disable Startup Programs

The fastest win — every startup program adds seconds.

`Ctrl + Shift + Esc` → **Startup apps** tab → sort by **Startup impact** → disable anything **High** you don't need at login.

Common culprits: Spotify, Discord, Teams (personal), OneDrive, Adobe updaters, game launchers.

```powershell
# View startup impact via registry
Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" |
  Select-Object * -ExcludeProperty PS*
```

---

## Fix 2: Enable Fast Startup

Fast Startup saves kernel state to disk — next boot loads it instead of reinitializing:

`Control Panel` → **Power Options** → **Choose what the power buttons do** → check **Turn on fast startup**

```powershell
# Enable via registry
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Power" `
  -Name "HiberbootEnabled" -Value 1 -Type DWord
```

**Note:** Fast Startup can interfere with dual-boot systems. Disable it if you dual-boot Linux.

---

## Fix 3: Check and Optimize Drive

```powershell
# Drive health
Get-PhysicalDisk | Select-Object FriendlyName, HealthStatus, MediaType

# Drive performance test
winsat disk -drive c
```

An HDD with degraded health significantly slows boot. An SSD below 200 MB/s sequential read needs attention.

---

## Fix 4: Run SFC and DISM

Corrupted system files cause slow initialization:

```cmd
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
```

---

## Fix 5: Check for Slow Services

Some services time out during startup and cause delays:

```powershell
# Services that failed or had issues recently
Get-WinEvent -FilterHashtable @{LogName='System'; Id=@(7000,7001,7009,7011)} -MaxEvents 20 |
  Select-Object TimeCreated, Id, Message
```

Event ID 7009 = service timed out waiting to start. Event ID 7011 = service failed to respond.

Identify the service and consider disabling if not needed.

---

## Fix 6: BIOS Settings

In BIOS:
- **POST delay** / **Boot delay**: set to 0 or minimum
- **Network/PXE boot**: disable if not needed (adds 5–15 seconds)
- **Boot order**: set SSD first, remove unused boot devices
- **Fast Boot / Quick Boot**: enable if available

---

## Fix 7: Clean Boot to Isolate Problem

Test without third-party services and startup programs:

`Win + R` → `msconfig` → **Services** tab → check **Hide all Microsoft services** → **Disable all** → **Startup** tab → **Open Task Manager** → disable all → **Apply** → restart.

If boot is fast in clean boot — re-enable items in batches to find the culprit.

---

## Fix 8: Rebuild Boot Configuration

```cmd
# Run as Administrator
bcdedit /deletevalue {current} safeboot
bootrec /fixmbr
bootrec /fixboot
bootrec /rebuildbcd
```

---

## Fix 9: Check Windows Update Pending Restart

Pending updates often cause slow boots as they process during startup:

```powershell
# Check for pending updates
(New-Object -ComObject Microsoft.Update.SystemInfo).RebootRequired
```

If True — restart and let updates complete. Boot should be faster afterward.

---

## Monitor Boot Over Time

```powershell
# Get last 10 boot times to see if it's getting worse
Get-WinEvent -FilterHashtable @{
  LogName = 'Microsoft-Windows-Diagnostics-Performance/Operational'
  Id = 100
} -MaxEvents 10 | Select-Object TimeCreated,
  @{n='Boot(sec)';e={[math]::Round($_.Properties[0].Value/1000,1)}} |
  Sort-Object TimeCreated
```

A trend of increasing boot times suggests a growing problem — drive health, accumulating startup programs, or software issue.

---


---

## 🔍 Not sure what a Windows error code means?

If Windows shows a code like `0x80070005`, `0x80070002` or `0xC000021A` — use this free tool:

**[→ Windows Error Decoder](/tools/windows-error-decoder)** — enter the code and instantly find out what it means and how to fix it.


## Summary

Measure with Event ID 100. Find slow components with Event ID 101. Quickest fixes: disable high-impact startup programs, enable Fast Startup, check drive health. For stubborn cases: clean boot to isolate the culprit, then SFC/DISM for file corruption. HDD → SSD replacement is the single biggest improvement possible on older hardware.
