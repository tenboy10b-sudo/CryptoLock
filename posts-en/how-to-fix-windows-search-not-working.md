---
title: "How to Fix Windows Search Not Working in Windows 10 and 11"
date: "2027-01-06"
publishDate: "2027-01-06"
description: "Windows search bar not working, showing blank results or freezing? Fix Windows Search with these methods: restart the service, rebuild the index, run the troubleshooter."
tags: ["windows", "troubleshooting", "errors", "optimization"]
readTime: 5
---

Windows Search stops working for several common reasons — a crashed service, corrupted index, or a pending update. Here's how to fix it step by step.

---

## Quick Fix: Restart Windows Search

```powershell
# Restart the Search service
Get-Process -Name "SearchIndexer" -EA 0 | Stop-Process -Force
Get-Process -Name "SearchApp" -EA 0 | Stop-Process -Force
Get-Process -Name "SearchUI" -EA 0 | Stop-Process -Force

# Restart Windows Search service
Restart-Service WSearch -Force
```

Wait 30 seconds and try searching again.

---

## Run the Search Troubleshooter

`Win + I` → **System** → **Troubleshoot** → **Other troubleshooters** → **Search and Indexing** → **Run**

Or via PowerShell:
```powershell
msdt.exe /id SearchDiagnostic
```

---

## Re-register Search App

```powershell
# Re-register Windows Search app
Get-AppxPackage -AllUsers Microsoft.Windows.Search | Foreach {Add-AppxPackage -DisableDevelopmentMode -Register "$($_.InstallLocation)\AppXManifest.xml"}
```

---

## Rebuild the Search Index

When search returns incomplete or wrong results:

1. `Win + I` → **Privacy & security** → **Searching Windows** → **Advanced indexing options**
2. **Advanced** → **Rebuild** → **OK**
3. Wait for indexing to complete (30 min to 2 hours depending on file count)

```powershell
# Check indexing status
$svc = Get-Service WSearch
Write-Host "Search service: $($svc.Status)"

# Force re-index by deleting index files
Stop-Service WSearch -Force
Remove-Item "C:\ProgramData\Microsoft\Search\Data\Applications\Windows\*" -Recurse -Force -EA 0
Start-Service WSearch
```

---

## Fix via Registry

```powershell
# Reset Search settings in registry
$searchKey = "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Search"
Set-ItemProperty $searchKey "BingSearchEnabled" -Value 0
Set-ItemProperty $searchKey "CortanaConsent" -Value 0

# Re-enable Windows Search indexing
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Services\WSearch" "Start" -Value 2
Start-Service WSearch
```

---

## Repair System Files

Corrupted Windows files can break Search:

```cmd
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
```

Restart after completion.

---

## Reset Windows Search (Nuclear Option)

```powershell
# Remove and reinstall Search
Get-AppxPackage *search* | Remove-AppxPackage -EA 0
Get-AppxPackage -AllUsers *search* | Remove-AppxPackage -EA 0

# Reinstall from store or via:
Add-AppxPackage -RegisterByFamilyName -MainPackage Microsoft.Windows.Search_cw5n1h2txyewy
```

---

## Summary

Try in order: restart Search service → run troubleshooter → re-register Search app → rebuild index → repair system files. Rebuilding the index fixes 80% of incomplete search results issues. Use `sfc /scannow` if search is completely broken.

## Frequently Asked Questions

### Why does Windows Search show no results after an update?

Windows updates sometimes reset Search indexing. Wait 30 minutes after an update for the index to rebuild automatically. If it doesn't recover, manually rebuild the index.

### Can I disable Windows Search completely?

Yes, but it removes the Start menu search functionality:
```powershell
Stop-Service WSearch -Force
Set-Service WSearch -StartupType Disabled
```

### Search works but is very slow — why?

The index may need rebuilding, or the disk is nearly full. Check free space first (`Get-PSDrive C`), then rebuild the index if space is adequate.
