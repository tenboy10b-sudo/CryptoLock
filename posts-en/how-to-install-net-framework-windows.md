---
title: "How to Install .NET Framework 3.5 and .NET 6/7/8 on Windows 10 and 11"
date: "2026-05-27"
publishDate: "2026-05-27"
description: "Install .NET Framework 3.5 and modern .NET 6/7/8 on Windows 10 and 11. Fix .NET installation errors, check installed versions and repair corrupted .NET installations."
tags: ["windows", "dotnet", "errors", "installation", "administration"]
readTime: 5
translatesUk: "yak-vstanovyty-net-framework-windows"
---

Many Windows apps and games require .NET Framework or modern .NET. Here's how to install any version and fix common errors.

---

## Check Installed .NET Versions

```powershell
# Check .NET Framework versions
Get-ChildItem "HKLM:\SOFTWARE\Microsoft\NET Framework Setup\NDP" -Recurse |
  Get-ItemProperty -Name Version, Release -EA 0 |
  Where-Object {$_.PSChildName -match "^(?!S)\p{L}"} |
  Select-Object PSChildName, Version, Release

# Check modern .NET (Core/.NET 5+)
dotnet --list-runtimes
dotnet --list-sdks

# Quick version check
dotnet --version
```

---

## Install .NET Framework 3.5 (Required by Many Old Apps)

.NET 3.5 isn't installed by default on Windows 10/11:

```powershell
# Method 1: Windows Features (requires internet)
Enable-WindowsOptionalFeature -Online -FeatureName "NetFx3" -All

# Method 2: DISM
DISM /Online /Enable-Feature /FeatureName:NetFx3 /All

# Method 3: Via Settings
# Win + R → optionalfeatures → .NET Framework 3.5 → check → OK
```

---

## Install .NET Framework 3.5 Offline (No Internet)

If you have Windows installation media:

```cmd
REM Mount Windows ISO and run (replace D: with DVD/ISO drive letter)
DISM /Online /Enable-Feature /FeatureName:NetFx3 /All /LimitAccess /Source:D:\sources\sxs
```

---

## Install Modern .NET (6, 8, 9)

```powershell
# Install latest .NET Runtime via winget
winget install Microsoft.DotNet.Runtime.8

# Install .NET Desktop Runtime (for WinForms/WPF apps)
winget install Microsoft.DotNet.DesktopRuntime.8

# Install .NET SDK (for development)
winget install Microsoft.DotNet.SDK.8

# Check available versions
winget search Microsoft.DotNet
```

Or download directly from: dotnet.microsoft.com/download

---

## Fix .NET Framework Installation Errors

```powershell
# Error 0x800F0954 — can't download during feature install
# Solution: specify local source from Windows media
DISM /Online /Enable-Feature /FeatureName:NetFx3 /All `
  /LimitAccess /Source:C:\Windows\WinSxS

# Error 0x80070643 — .NET installation failed
# Run .NET repair tool from Microsoft
# Or:
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
# Then retry installation
```

---

## Repair Corrupted .NET Framework

```powershell
# Download .NET Repair Tool
# microsoft.com/en-us/download/details.aspx?id=30135

# Or repair via DISM
DISM /Online /Enable-Feature /FeatureName:NetFx3 /All

# Check .NET Framework health
(Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full").Release
```

---

## Set Default .NET Version for App

```powershell
# Create runtimeconfig.json for specific app
$config = @{
  runtimeOptions = @{
    tfm = "net8.0"
    framework = @{
      name = "Microsoft.NETCore.App"
      version = "8.0.0"
    }
    rollForward = "minor"
  }
}
$config | ConvertTo-Json -Depth 5 | Out-File "app.runtimeconfig.json"
```

---

## Summary

Check versions with `dotnet --list-runtimes` and registry. .NET 3.5: use `Enable-WindowsOptionalFeature` or DISM. Modern .NET: use winget. Fix errors 0x800F0954 with offline source `/Source:D:\sources\sxs`. Repair with DISM + SFC.

## Frequently Asked Questions

### Which .NET do I need? Framework 3.5, 4.8, or .NET 8?

Older apps (pre-2015): usually need .NET Framework 3.5 or 4.x. Windows is pre-installed with 4.8. Modern apps specify their requirement in error messages. .NET 6/7/8 are newer and don't replace Framework.

### Error "This application requires .NET Framework X.X" — what to do?

Go to dotnet.microsoft.com/download, download the exact version mentioned in the error, install it. For 3.5 specifically, use the Windows Features method (optionalfeatures).

### Can I uninstall old .NET versions?

.NET Framework versions (3.5, 4.x) are Windows components — don't uninstall them. Modern .NET versions (6, 7, 8) can be uninstalled via Settings → Apps if not needed.
