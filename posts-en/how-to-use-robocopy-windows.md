---
title: "How to Use Robocopy in Windows: Backup and File Sync Guide"
date: "2027-01-09"
publishDate: "2027-01-09"
description: "Robocopy is the most reliable file copy tool built into Windows. Learn how to use it for backups, folder sync, network transfers and scheduled jobs with practical examples."
tags: ["windows", "robocopy", "backup", "powershell", "administration"]
readTime: 5
---

Robocopy (Robust File Copy) is built into Windows and outperforms standard copy in every way — it resumes interrupted transfers, preserves timestamps and handles network errors gracefully.

---

## Basic Syntax

```cmd
robocopy <source> <destination> [files] [options]
```

---

## Common Use Cases

**Mirror a folder (exact copy, delete extras):**
```cmd
robocopy "C:\Source" "D:\Backup" /MIR /R:3 /W:5
```

**Copy new and changed files only:**
```cmd
robocopy "C:\Source" "D:\Backup" /E /XO /R:3 /W:5
```

**Copy specific file types:**
```cmd
robocopy "C:\Documents" "D:\DocBackup" *.pdf *.docx *.xlsx /E /R:3
```

**Network copy with progress:**
```cmd
robocopy "C:\Source" "\\Server\Share\Backup" /E /R:3 /W:10 /NP /LOG:C:\robocopy.log
```

---

## Key Options Explained

| Option | What it does |
|--------|-------------|
| `/MIR` | Mirror — copies new/changed AND deletes files removed from source |
| `/E` | Copy all subdirectories including empty ones |
| `/XO` | Exclude Older — skip files that are newer in destination |
| `/R:3` | Retry 3 times on failure |
| `/W:5` | Wait 5 seconds between retries |
| `/LOG:file` | Save output to log file |
| `/NP` | No progress — cleaner output |
| `/COPYALL` | Copy all file attributes including permissions |
| `/PURGE` | Delete destination files not in source (without full mirror) |
| `/MT:8` | Multi-threaded copy with 8 threads (faster for many small files) |

---

## Scheduled Backup via Task Scheduler

```powershell
# Create daily backup task at 2 AM
$action  = New-ScheduledTaskAction -Execute "robocopy.exe" `
  -Argument '"C:\Documents" "D:\Backup\Documents" /MIR /R:3 /W:5 /LOG:C:\Logs\backup.log'
$trigger = New-ScheduledTaskTrigger -Daily -At "2:00AM"
Register-ScheduledTask -TaskName "DailyDocBackup" `
  -Action $action -Trigger $trigger -RunLevel Highest
```

---

## Sync Two Folders

```cmd
REM One-way sync: Source → Destination
robocopy "C:\Work" "D:\WorkSync" /MIR /R:2 /W:3

REM Copy only files modified in the last 7 days
robocopy "C:\Source" "D:\Recent" /E /MAXAGE:7 /R:2 /W:3
```

---

## Robocopy Exit Codes

```powershell
# Run robocopy and check exit code
$result = (Start-Process robocopy -ArgumentList '"C:\Src" "D:\Dst" /E' -Wait -PassThru).ExitCode
switch ($result) {
  0 { "No files copied — destination already up to date" }
  1 { "Files copied successfully" }
  2 { "Extra files in destination (would be deleted with /PURGE)" }
  4 { "Some mismatched files — check log" }
  8 { "Some files failed to copy — check log" }
  16 { "Fatal error — no files copied" }
  default { "Code $result — check robocopy log" }
}
```

---

## Useful Combinations

```cmd
REM Full backup preserving permissions and timestamps
robocopy "C:\Source" "D:\FullBackup" /COPYALL /MIR /R:5 /W:10 /LOG:C:\backup.log

REM Fast large file copy (multi-threaded, no retry spam)
robocopy "C:\LargeFiles" "D:\Target" /E /MT:16 /R:1 /W:1

REM Dry run — show what WOULD be copied without actually copying
robocopy "C:\Source" "D:\Dest" /E /L /NP
```

---

## Summary

Use `/MIR` for exact mirror backups, `/E /XO` for incremental sync. Always add `/R:3 /W:5` to handle temporary failures. Use `/LOG:` to save output for review. Schedule with Task Scheduler for automated backups. Exit code 1 = success, anything ≥ 8 = investigate the log.

## Frequently Asked Questions

### Is Robocopy better than xcopy?

Yes. Robocopy handles retries, multi-threading, preserves all NTFS attributes, and has better error reporting. xcopy is obsolete — use Robocopy instead.

### Does /MIR delete files from destination?

Yes. `/MIR` makes the destination an exact mirror — files deleted from source will be deleted from destination on the next run. Use `/E /XO` if you want a one-way copy without deletions.

### Can Robocopy copy open files?

Not directly. For open files (like a live database), use Volume Shadow Copy: `robocopy \\?\GLOBALROOT\Device\HarddiskVolumeShadowCopy1\ "D:\Backup"` after creating a VSS snapshot.
