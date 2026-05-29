---
title: "How to Decode Windows Error Codes: 0x80070005, 0xC000021A and More"
date: "2026-05-04"
publishDate: "2026-05-04"
description: "Windows error codes look cryptic but follow a clear pattern. How to decode 0x80070005, HRESULT and NTSTATUS codes, find the root cause, and fix common errors."
tags: ["windows", "errors", "diagnostics", "troubleshooting"]
translatesUk: "shcho-oznachaie-kod-pomylky-windows"
readTime: 5
---

Windows error codes like `0x80070005` or `0xC000021A` follow a consistent structure. Once you understand the pattern, you can decode most errors without searching the internet.

---

## How Windows Error Codes Work

Take `0x80070005`:

```
0x    8007    0005
│     │       │
│     │       └── Win32 error code (decimal 5 = ERROR_ACCESS_DENIED)
│     └────────── 8007 = HRESULT wrapping a Win32 code
└──────────────── 0x = hexadecimal prefix
```

**Code families:**
- `0x8007xxxx` — Win32 API errors (most common)
- `0xC000xxxx` — NT kernel errors (NTSTATUS, often in BSOD)
- `0x8000xxxx` — COM/OLE errors
- `0x803Fxxxx` — Microsoft Store errors

---

## Decode Errors in PowerShell

```powershell
# Decode Win32 error code
[System.ComponentModel.Win32Exception]::new(5).Message
# Returns: "Access is denied"

# Decode from full hex code (extract Win32 part)
[System.ComponentModel.Win32Exception]::new(0x5).Message

# List common Win32 codes
@(2,3,5,14,32,112) | ForEach-Object {
  "$_ (0x{0:X4}) = $([System.ComponentModel.Win32Exception]::new($_).Message)" -f $_
}
```

---

## Common Error Codes Reference

**Access and Permissions:**
- `0x80070005` — ERROR_ACCESS_DENIED — run as administrator, check NTFS permissions
- `0x80070006` — ERROR_INVALID_HANDLE — restart the program or service

**File System:**
- `0x80070002` — ERROR_FILE_NOT_FOUND — file moved/deleted, run `sfc /scannow`
- `0x80070003` — ERROR_PATH_NOT_FOUND — folder doesn't exist
- `0x80070070` — ERROR_DISK_FULL — free up disk space

**Network:**
- `0x80072EFE` — connection aborted — check internet connection
- `0x80072EE7` — DNS name not resolved — flush DNS, change DNS server

**Windows Update:**
- `0x80248007` — corrupted update database — clear SoftwareDistribution folder
- `0x80073712` — component store corrupted — run DISM RestoreHealth
- `0x80070057` — invalid parameter — run `sfc /scannow`

**BSOD (NTSTATUS):**
- `0xC000021A` — system process terminated — safe mode, SFC, driver rollback
- `0x0000007E` — system thread exception — driver issue, check Event Log

---

## Fix the Most Common Error: 0x80070005

```powershell
# Option 1: Run as Administrator (simplest)
Start-Process powershell -Verb RunAs

# Option 2: Reset NTFS permissions on a folder
takeown /f "C:\ProblemFolder" /r /d y
icacls "C:\ProblemFolder" /grant Administrators:F /t

# Option 3: System file check
sfc /scannow

# Option 4: If Windows Update error
DISM /Online /Cleanup-Image /RestoreHealth
```

---

## Fix Windows Update Errors (0x80248007, 0x80070002)

```powershell
# Clear update cache
Stop-Service wuauserv, bits -Force
Remove-Item "C:\Windows\SoftwareDistribution\*" -Recurse -Force -EA 0
Start-Service wuauserv, bits

# Repair Windows image
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
```

---

## 🔍 Quick Lookup Tool

Instead of searching manually:

**[→ Windows Error Code Decoder](/tools/windows-error-decoder)** — enter any code (0x80070005, plain decimal, or 8-digit hex) and instantly get the error name, common causes, and step-by-step fixes.

---

## Summary

`0x8007xxxx` = Win32 errors (most Windows errors). `0xC000xxxx` = kernel errors (BSOD). Last four digits after `0x8007` = the specific Win32 code. Use `[System.ComponentModel.Win32Exception]::new(code).Message` in PowerShell to decode locally. For a complete lookup with fix instructions — use the [Error Code Decoder](/tools/windows-error-decoder).
