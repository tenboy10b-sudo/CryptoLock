---
title: "Printer Not Printing in Windows 10 and 11: Step-by-Step Fix"
date: "2026-06-18"
publishDate: "2026-08-18"
updated: "2026-06-18"
description: "What to do when your printer won't print in Windows 10 and 11. Clear print queue, restart Print Spooler service, update drivers and fix offline printer errors."
tags: ["windows", "printer", "printing", "fix", "drivers"]
readTime: 7
translatesUk: "prynter-ne-druukuie-windows-vyrishennya"
---

Printer shows in Windows but won't print — the most common cause is a stuck print queue or Print Spooler service issue.

---

## Step 1 — Clear the Print Queue

First thing to try for any printer problem:

```powershell
Stop-Service Spooler -Force
Remove-Item "$env:SystemRoot\System32\spool\PRINTERS\*" -Force -ErrorAction SilentlyContinue
Start-Service Spooler
Write-Host "Print queue cleared"
```

---

## Step 2 — Restart Print Spooler

```powershell
Restart-Service Spooler
Get-Service Spooler | Select-Object Name, Status

# If disabled:
Set-Service Spooler -StartupType Automatic
Start-Service Spooler
```

---

## Step 3 — Remove and Reinstall Printer

```powershell
# List printers
Get-Printer | Select-Object Name, PortName

# Remove printer
Remove-Printer -Name "PRINTER_NAME"
```

Then add again:
```
Win + I → Bluetooth & devices → Printers & scanners → Add device
```

---

## Step 4 — Update Printer Driver

1. Device Manager → Print queues
2. Right-click printer → Update driver
3. Or download from manufacturer (Canon, HP, Epson, Brother)

---

## Common Errors

### "Printer offline"
```
Settings → Printers → printer → Open queue →
Printer → uncheck "Use Printer Offline"
```

### Document stuck in queue
```powershell
Stop-Service Spooler -Force
Remove-Item "$env:SystemRoot\System32\spool\PRINTERS\*" -Force
Start-Service Spooler
```

---

## Troubleshooter

```powershell
msdt.exe /id PrinterDiagnostic
```

---

## Summary

| Problem | Fix |
|---------|-----|
| Stuck document | Clear print queue (Stop Spooler) |
| Printer offline | Uncheck "Use Printer Offline" |
| Not detected | Remove and reinstall |
| Print error | Update or reinstall driver |
