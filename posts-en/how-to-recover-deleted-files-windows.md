---
title: "How to Recover Deleted Files in Windows 10 and 11"
date: "2026-05-27"
publishDate: "2026-05-27"
description: "Accidentally deleted a file or emptied the Recycle Bin? Here are all the ways to recover deleted files in Windows — from the Recycle Bin and File History to free recovery tools."
tags: ["windows", "recovery", "tools", "troubleshooting"]
readTime: 6
---

Deleted files aren't immediately gone — Windows marks the space as available but doesn't overwrite the data right away. The faster you act, the better your chances.

---

## Step 1: Check the Recycle Bin

If you deleted normally (not Shift+Delete), the file is in the Recycle Bin.

Open **Recycle Bin** on the desktop → find the file → right-click → **Restore**

Or restore via PowerShell:
```powershell
$shell = New-Object -ComObject Shell.Application
$recycleBin = $shell.Namespace(0xA)
$recycleBin.Items() | Select-Object Name, Path
```

---

## Step 2: Use File History

If File History was configured before the deletion, you can restore previous versions.

Right-click the folder that contained the file → **Restore previous versions** → select a snapshot → **Restore**

Or via File History:
`Control Panel` → **File History** → **Restore personal files** → navigate to the file → click the green restore button.

---

## Step 3: Previous Versions (Shadow Copies)

Windows creates shadow copies when System Protection is enabled, even without File History.

Right-click the folder → **Properties** → **Previous Versions** tab → select a date → **Open** to browse, or **Restore** to recover.

```powershell
# List available shadow copies
vssadmin list shadows /for=C:

# Mount a shadow copy to browse it
$date = (Get-Date).AddDays(-1).ToString("MM/dd/yyyy")
vssadmin list shadows | Where-Object {$_ -match $date}
```

---

## Step 4: Windows File Recovery (Free Microsoft Tool)

For files deleted from Recycle Bin or on formatted/corrupted drives.

Install from Microsoft Store: **Windows File Recovery**

```cmd
# Recover specific file type from C: to D:\Recovery
winfr C: D:\Recovery /n *.docx

# Recover a specific file
winfr C: D:\Recovery /n \Users\YourName\Documents\report.xlsx

# Extensive scan for formatted/corrupted drives
winfr C: D:\Recovery /x /y:JPEG,PNG,PDF
```

Run in a **Command Prompt as Administrator**. Don't recover to the same drive you're recovering from.

---

## Step 5: Third-Party Recovery Tools

If the above don't work, use dedicated recovery software. Free options:

**Recuva** (Piriform) — simple GUI, works well for recently deleted files
- Download from [piriform.com/recuva](https://www.piriform.com/recuva)
- Run the wizard, select the drive, scan, restore

**TestDisk / PhotoRec** — open source, more powerful, recovers from formatted drives
- Available at [cgsecurity.org](https://www.cgsecurity.org)

**Important**: install recovery software on a different drive than the one you're recovering from. Every write to the drive risks overwriting the deleted data.

---

## Step 6: Recover from OneDrive or Cloud Backup

If OneDrive sync was enabled:
- Go to [onedrive.live.com](https://onedrive.live.com) → **Recycle Bin** (in left panel) → restore from there
- OneDrive keeps deleted files for 30 days (93 days for Microsoft 365)

---

## Why Files Sometimes Can't Be Recovered

- **SSD with TRIM enabled** — SSDs erase deleted data immediately when TRIM runs. Recovery from SSDs is often impossible.
- **The space was overwritten** — new files were written where the deleted file was
- **Encrypted drive** — recovery tools can find the data but can't decrypt it without the key
- **Time** — the longer you wait, the more likely the space gets overwritten

---

## Best Practice: Prevent Data Loss

- Enable **File History** — `Control Panel` → **File History** → connect an external drive → **Turn on**
- Enable **System Protection** (shadow copies) — `sysdm.cpl` → **System Protection** → Configure
- Regular backups to external drive or cloud

---

## Summary

Check Recycle Bin first. Then Previous Versions (shadow copies). For permanently deleted files: use **Windows File Recovery** (free, from Microsoft) or Recuva. Act fast — especially on SSDs where TRIM may erase data quickly. Stop writing to the drive until recovery is complete.
