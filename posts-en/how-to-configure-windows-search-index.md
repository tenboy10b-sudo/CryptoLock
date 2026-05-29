---
title: "How to Configure Windows Search Index for Faster File Searches"
date: "2026-04-25"
publishDate: "2026-04-25"
description: "Customize what Windows indexes and how — add locations, exclude folders, rebuild corrupt index, and configure enhanced vs classic indexing mode for better search results."
tags: ["windows", "optimization", "tools", "settings"]
readTime: 5
---

Windows Search indexes file names and content so searches return results instantly. By default it only indexes your user folders — here's how to extend or fine-tune it.

---

## Open Indexing Options

`Win + S` → **Indexing Options**

Or: `Control Panel` → **Indexing Options**

Shows the current index count and which locations are indexed.

---

## Indexing Modes

**Classic (default):** indexes only your libraries (Desktop, Documents, Downloads, Music, Pictures, Videos) and the Start menu.

**Enhanced:** indexes the entire C: drive. Much more thorough — finds everything — but uses more disk space and CPU during initial indexing.

`Win + I` → **Privacy & Security** → **Searching Windows** → switch between **Classic** and **Enhanced**

---

## Add Custom Locations

If you store files outside the default libraries:

**Indexing Options** → **Modify** → **Show all locations** → check the folders you want indexed → **OK**

Or add via PowerShell:
```powershell
# Add a folder to the index
$indexer = New-Object -ComObject Search.CrawlScopeManager
$indexer.AddUserScopeRule("file:///D:/Projects/", $true, $false, $null)
$indexer.SaveAll()
```

---

## Exclude Folders

Large folders you never search (VM disks, build artifacts) slow down indexing and waste space:

**Indexing Options** → **Modify** → find the folder → uncheck → **OK**

Or exclude specific file types: **Advanced** → **File Types** → uncheck extensions like `.vmdk`, `.vhdx`, `.iso`, `.log`

---

## Index File Contents (Not Just Names)

By default Windows indexes file names and properties. To also index file contents (search inside documents, txt files, etc.):

**Indexing Options** → **Advanced** → **File Types** tab → find the extension → select **Index Properties and File Contents**

For common types (`.txt`, `.md`, `.cs`, `.py`) — switch from **Index Properties Only** to **Index Properties and File Contents**.

---

## Rebuild the Index

If search returns wrong results or misses files:

**Indexing Options** → **Advanced** → **Rebuild**

Takes 15–60 minutes. Search works during rebuild but may return incomplete results.

```powershell
# Rebuild via service restart (less thorough but faster)
Stop-Service WSearch -Force
Remove-Item "$env:ProgramData\Microsoft\Search\Data\Applications\Windows\*" -Recurse -Force -ErrorAction SilentlyContinue
Start-Service WSearch
```

---

## Check Index Status

```powershell
# Indexing service status
Get-Service WSearch | Select-Object Status, StartType

# Items indexed (approximate via registry)
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows Search\Gather\Windows\SystemIndex" -ErrorAction SilentlyContinue |
  Select-Object DataSizeBytes

# Check if a specific file would be indexed
$path = "C:\Documents\report.docx"
Test-Path $path
```

---

## Search Operator Tips

Once indexed, use operators in File Explorer search bar:

```
name:report                    # files with "report" in name
ext:docx                       # only .docx files
kind:document                  # documents (Word, PDF, txt)
modified:>01/01/2026           # modified after date
size:>1MB                      # files larger than 1 MB
content:quarterly              # files containing "quarterly"
author:John                    # documents by author
```

---

## Pause and Resume Indexing

```powershell
# Pause indexing
Stop-Service WSearch

# Resume
Start-Service WSearch

# Set to index only when PC is idle (via Group Policy)
# gpedit.msc → Computer Configuration → Administrative Templates →
# Windows Components → Search → Prevent indexing when on battery power → Enabled
```

---

## Use Everything as an Alternative

Windows Search indexes file content but is slow for pure file-name searches. **Everything** from voidtools is instant:

```powershell
winget install voidtools.Everything
```

Everything reads the NTFS file table directly — no index needed. Searches complete in milliseconds. Complements Windows Search: use Everything for file names, Windows Search for content.

---

## Summary

For most users: switch to **Enhanced** mode to index everything, or add specific work folders in **Indexing Options**. Exclude VM disks and build folders to keep indexing fast. Enable **Index Properties and File Contents** for text-based file types. Rebuild if search gives wrong results. Install Everything for instant file-name search alongside Windows Search for content search.
