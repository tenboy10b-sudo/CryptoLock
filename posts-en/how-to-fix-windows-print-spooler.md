---
title: "How to Fix Windows Print Spooler Errors and Printing Issues"
date: "2026-05-26"
publishDate: "2026-05-26"
description: "Fix Windows Print Spooler errors: spooler not running, stuck jobs, print spooler crashes and printing stopped working. Clear queue, restart service, reinstall drivers."
tags: ["windows", "printer", "spooler", "troubleshooting", "errors"]
readTime: 5
translatesUk: "vypravlennya-spuler-druku-windows"
---

Print Spooler manages all print jobs in Windows. When it crashes or gets stuck, nothing prints. Here's how to fix every variant.

---

## Check Spooler Status

```powershell
# Check if Print Spooler is running
Get-Service Spooler | Select-Object Name, Status, StartType

# View print jobs in queue
Get-PrintJob -PrinterName (Get-Printer | Select-Object -First 1).Name
```

---

## Fix 1: Restart Print Spooler

```powershell
# Restart the service
Restart-Service Spooler -Force

# If it won't restart — stop, clear queue, start
Stop-Service Spooler -Force
Remove-Item "C:\Windows\System32\spool\PRINTERS\*" -Force -EA 0
Start-Service Spooler
```

---

## Fix 2: Clear Stuck Print Queue

Jobs can get stuck and block all printing:

```powershell
# Complete queue clear script
Stop-Service Spooler -Force
Start-Sleep 2
Get-ChildItem "C:\Windows\System32\spool\PRINTERS\" -EA 0 | Remove-Item -Force -EA 0
Start-Service Spooler
Write-Host "Queue cleared and spooler restarted"
```

---

## Fix 3: Spooler Crashes Repeatedly

```powershell
# Check for corrupted spooler files
sfc /scannow

# Check spooler crash history
Get-WinEvent -FilterHashtable @{LogName='Application'; ProviderName='Application Error'} -MaxEvents 20 |
  Where-Object {$_.Message -like "*spoolsv*"} |
  Select-Object TimeCreated, Message | Format-List
```

---

## Fix 4: Remove and Reinstall Printer Driver

Corrupted driver is a common cause of spooler crashes:

```powershell
# List installed drivers
Get-PrinterDriver | Select-Object Name, PrinterEnvironment, MajorVersion

# Remove specific driver
Remove-PrinterDriver -Name "HP LaserJet 1020" -EA 0

# Remove all non-Microsoft drivers
Get-PrinterDriver | Where-Object {$_.Manufacturer -ne "Microsoft"} |
  ForEach-Object {
    Remove-PrinterDriver -Name $_.Name -EA 0
    Write-Host "Removed: $($_.Name)"
  }

# Restart spooler after removal
Restart-Service Spooler -Force
```

---

## Fix 5: Repair Spooler Permissions

```powershell
# Reset spooler folder permissions
$spoolPath = "C:\Windows\System32\spool"
$aclSpooler = Get-Acl $spoolPath

# Reset to default inheritance
$aclSpooler.SetAccessRuleProtection($false, $true)
Set-Acl -Path $spoolPath -AclObject $aclSpooler

# Also reset the PRINTERS subfolder
icacls "C:\Windows\System32\spool\PRINTERS" /reset /t /c
```

---

## Fix 6: Registry Cleanup

```powershell
# Check for corrupted spooler registry entries
$spoolerKey = "HKLM:\SYSTEM\CurrentControlSet\Control\Print\Printers"
Get-ChildItem $spoolerKey | ForEach-Object {
  $printerPath = $_.PSPath
  # Check if driver exists for this printer
  $driverName = (Get-ItemProperty $printerPath -EA 0).Printer_Driver
  if ($driverName) {
    $driverExists = Get-PrinterDriver -Name $driverName -EA 0
    if (-not $driverExists) {
      Write-Host "Orphaned printer registry entry: $($_.PSChildName)"
    }
  }
}
```

---

## Set Spooler to Auto-Restart on Failure

```powershell
# Configure service recovery — restart on failure
$service = Get-WmiObject Win32_Service -Filter "Name='Spooler'"

sc.exe failure Spooler reset= 86400 actions= restart/5000/restart/5000/restart/5000
```

---

## Summary

Stuck queue: stop spooler → delete PRINTERS contents → start spooler. Crashes: check Event Log for spoolsv.exe errors, remove corrupted drivers. Driver issues: remove all third-party drivers, reinstall fresh. Set service to auto-restart on failure.

## Frequently Asked Questions

### Print Spooler keeps crashing every day — what's the long-term fix?

Usually a corrupted third-party printer driver. Remove all non-Microsoft drivers (script above), restart, then reinstall only the drivers you actually need from the manufacturer's official download.

### I deleted the print queue but it refilled — why?

An app is continuously sending print jobs. Check all open apps — Office, PDF readers, browsers — for open print dialogs. Also check scheduled tasks that might auto-print documents.

### Print Spooler service is missing from Services — how to restore?

```powershell
# Re-register spooler service
sc.exe create Spooler binpath= "C:\Windows\System32\spoolsv.exe" type= own start= auto
Start-Service Spooler
```
