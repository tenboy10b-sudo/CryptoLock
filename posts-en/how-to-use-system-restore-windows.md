---
title: "How to Use System Restore in Windows 10 and 11"
date: "2026-04-26"
publishDate: "2026-04-26"
description: "System Restore can undo driver installations, bad updates, and software changes without deleting your files. Here's how to use it, create restore points, and fix it when it stops working."
tags: ["windows", "recovery", "troubleshooting", "tools"]
readTime: 6
---

System Restore rolls Windows back to a previous state — undoing driver installs, bad updates, and software changes. It doesn't touch your personal files. It's one of the most useful recovery tools in Windows, and most people only remember it exists when something breaks.

---

## Enable System Restore

It's often disabled by default on Windows 11. Check and enable it:

1. `Win + R` → `sysdm.cpl` → **System Protection** tab
2. Select drive **C:** → **Configure**
3. Select **Turn on system protection**
4. Set disk space usage to **5–10%** (enough for several restore points)
5. Click **OK**

Via PowerShell:
```powershell
Enable-ComputerRestore -Drive "C:\"
vssadmin resize shadowstorage /for=C: /on=C: /maxsize=10GB
```

---

## Create a Restore Point Manually

Create one before installing drivers, software, or making registry changes:

`Win + R` → `sysdm.cpl` → **System Protection** → **Create** → name it (e.g. "Before NVIDIA driver update") → **Create**

Via PowerShell:
```powershell
Checkpoint-Computer -Description "Before driver update" -RestorePointType MODIFY_SETTINGS
```

Windows also creates restore points automatically before Windows Updates and some software installations.

---

## Restore to a Previous Point

If something broke after an install or update:

1. `Win + R` → `rstrui.exe`
2. Click **Next**
3. Select a restore point from the list — check the date and description
4. Click **Scan for affected programs** to see what will be removed
5. **Next** → **Finish** → confirm

The PC restarts and rolls back. Takes 10–20 minutes.

---

## Restore From Safe Mode or Recovery Environment

If Windows won't boot normally:

**Safe Mode**: press `F8` during boot (or hold `Shift` while clicking Restart → Troubleshoot → Advanced options → Startup Settings → Restart → F4)

Once in Safe Mode: `Win + R` → `rstrui.exe` → proceed as above.

**Recovery Environment** (if can't boot at all):
- Boot from Windows installation USB
- **Repair your computer** → **Troubleshoot** → **Advanced options** → **System Restore**

---

## Check Available Restore Points

```powershell
Get-ComputerRestorePoint | Select-Object Description, CreationTime, SequenceNumber
```

---

## Delete Old Restore Points to Free Space

```powershell
# Delete all except the most recent
vssadmin delete shadows /for=C: /oldest /quiet

# Delete ALL restore points (use with caution)
vssadmin delete shadows /for=C: /all /quiet
```

Or: `sysdm.cpl` → **System Protection** → **Configure** → **Delete** (removes all restore points for that drive).

---

## Why System Restore Might Fail

**"No restore points exist"**: System Protection was disabled or disk space was too low to save them.

**"System Restore did not complete successfully"**: Usually caused by antivirus software blocking it. Boot into Safe Mode and try again.

**Restore point greyed out**: The restore point is too old and has been overwritten. Increase the disk space allocation in System Protection settings.

**Can't find the affected file after restore**: System Restore doesn't affect personal files — only Windows system files, registry, and installed programs.

---

## System Restore vs Reset vs Reinstall

| Method | Keeps files | Keeps apps | How far back |
|--------|-------------|------------|--------------|
| System Restore | ✅ Yes | Partially | Days/weeks |
| Reset (Keep files) | ✅ Yes | ❌ No | Factory state |
| Reset (Remove all) | ❌ No | ❌ No | Factory state |
| Clean reinstall | ❌ No | ❌ No | Factory state |

Use System Restore first — it's the least destructive option.

---

## Summary

Enable System Protection on drive C with 5–10% space allocation. Create restore points before major changes. When something breaks, run `rstrui.exe` and pick a point from before the problem started. If Windows won't boot, access System Restore from the Recovery Environment.
