---
title: "Bulk Rename Utility on Windows: Mass File Renaming Guide"
date: "2026-06-18"
publishDate: "2026-09-01"
updated: "2026-06-18"
description: "How to install Bulk Rename Utility and mass rename files on Windows. Add numbers, change extensions, remove characters, regex replacements and PowerShell alternatives."
tags: ["windows", "bulk-rename", "files", "tools", "automation"]
readTime: 6
translatesUk: "bulk-rename-utility-windows-masove-pereymenuvannya"
---

Bulk Rename Utility is a free tool for renaming hundreds of files in a few clicks. Essential for photographers, videographers and anyone managing large file collections.

---

## Install

Download from [bulkrenameutility.co.uk](https://www.bulkrenameutility.co.uk/Download.php) — portable version available.

```powershell
winget install TGRMNSoftware.BulkRenameUtility
```

---

## Common Scenarios

### 1. Number files sequentially

```
Section C (Numbering):
Start: 001, Incr: 1, Pad: 3
Format: {NAME} ({NUM})
```
Result: `photo.jpg` → `photo (001).jpg`

### 2. Remove text from name

```
Section D (Replace):
Replace: "IMG_"
With: ""
```

### 3. Change case

```
Section I (Case):
Title → Each Word Capitalized
Lower → all lowercase
```

### 4. Add prefix or suffix

```
Section B (Add):
Prefix: "2026_"
Suffix: "_final"
```

### 5. Replace spaces with underscores

```
Section D (Replace): " " → "_"
```

---

## Regex Examples

Enable RegEx in Section D:

```regex
\d+       → remove numbers
\s+       → replace spaces: _
\s*\(.*\) → remove text in brackets
```

---

## PowerShell Alternative

For simple operations PowerShell is faster:

```powershell
# Add prefix to all jpg
Get-ChildItem *.jpg | Rename-Item -NewName { "2026_" + $_.Name }

# Replace spaces with underscores
Get-ChildItem *.mp4 | Rename-Item -NewName { $_.Name -replace ' ', '_' }

# Number files
$i = 1
Get-ChildItem *.jpg | Sort-Object Name | ForEach-Object {
    Rename-Item $_ -NewName ("photo_{0:D3}.jpg" -f $i++)
}

# Change .jpeg to .jpg
Get-ChildItem *.jpeg | Rename-Item -NewName { $_.Name -replace '\.jpeg$', '.jpg' }
```

---

## Undo Renaming

```
Edit → Undo (Ctrl+Z)
```

---

## Summary

| Task | Section |
|------|---------|
| Add numbers | C (Numbering) |
| Remove text | D (Replace) or E (Remove) |
| Add prefix/suffix | B (Add) |
| Change case | I (Case) |
| Change extension | G (Extension) |
| Complex operations | D (Replace) + RegEx |
| No software needed | PowerShell Rename-Item |
