---
title: "How to Add and Troubleshoot Network Printers in Windows 10 and 11"
date: "2027-02-11"
publishDate: "2027-02-11"
description: "Add network and wireless printers in Windows 10 and 11. Connect via IP, share printer over network, fix printer offline errors and troubleshoot print queue."
tags: ["windows", "printer", "network", "administration", "troubleshooting"]
readTime: 5
---

Adding a network printer in Windows is usually straightforward. Here's how to handle both simple and problematic cases.

---

## Add Printer via Settings

`Win + I` → **Bluetooth & devices** → **Printers & scanners** → **Add device**

Windows scans the network automatically. If your printer appears — click **Add device**.

---

## Add Printer by IP Address

If Windows doesn't find it automatically:

1. `Win + I` → **Printers & scanners** → **Add device** → **Add manually**
2. **Add a printer using a TCP/IP address** → Next
3. Enter printer's IP address (find it on printer's control panel or router)
4. Windows installs the driver automatically

```powershell
# Add network printer by IP via PowerShell
Add-PrinterPort -Name "IP_192.168.1.100" -PrinterHostAddress "192.168.1.100"
Add-Printer -Name "Office Printer" -DriverName "HP LaserJet" -PortName "IP_192.168.1.100"
```

---

## Share a Printer on the Network

```powershell
# Share a local printer
Set-Printer -Name "EPSON" -Shared $true -ShareName "EpsonOffice"

# Check sharing status
Get-Printer | Select-Object Name, Shared, ShareName, PortName

# Connect to a shared printer from another PC
Add-Printer -ConnectionName "\\PCName\EpsonOffice"
```

---

## Fix Printer Shows as Offline

```powershell
# Set printer to online
Set-Printer -Name "Office Printer" -WorkOffline $false

# Restart Print Spooler service
Restart-Service Spooler -Force

# Check print spooler status
Get-Service Spooler | Select-Object Status, StartType
```

Or: Right-click printer → **See what's printing** → **Printer** menu → uncheck **Use Printer Offline**

---

## Clear Stuck Print Queue

```powershell
# Stop spooler
Stop-Service Spooler -Force

# Delete stuck jobs
Remove-Item "C:\Windows\System32\spool\PRINTERS\*" -Force -EA 0

# Restart spooler
Start-Service Spooler

Write-Host "Print queue cleared"
```

---

## Reinstall Printer Driver

```powershell
# List installed printer drivers
Get-PrinterDriver | Select-Object Name, MajorVersion, PrinterEnvironment

# Remove a specific driver
Remove-PrinterDriver -Name "HP LaserJet 1020"

# Add a driver from Windows driver store
Add-PrinterDriver -Name "Microsoft Print to PDF"
```

---

## Troubleshoot "Driver Unavailable" Error

```powershell
# Run printer troubleshooter
msdt.exe /id PrinterDiagnostic

# Reset printer spooler completely
Stop-Service Spooler -Force
Remove-Item "C:\Windows\System32\spool\PRINTERS\*" -Force -EA 0
Get-PrinterDriver | Remove-PrinterDriver -EA 0
Start-Service Spooler
# Re-add printer from scratch
```

---

## Check Printer Status

```powershell
# All printers with status
Get-Printer | Format-Table Name, PrinterStatus, WorkOffline, Shared, PortName

# Check print jobs
Get-PrintJob -PrinterName "Office Printer"

# Cancel all jobs on a printer
Get-PrintJob -PrinterName "Office Printer" | Remove-PrintJob
```

---

## Summary

Add via Settings → Add device for automatic detection. For manual: use IP address method. Fix offline: restart Spooler + uncheck "Use Printer Offline". Clear stuck jobs by stopping Spooler, deleting spool files, restarting. Reinstall driver for persistent errors.

## Frequently Asked Questions

### My printer shows as offline even when it's on and connected — why?

Usually the Spooler service needs restarting. Also check that the printer IP hasn't changed (DHCP can reassign IPs). Set a static IP on the printer to prevent this.

### Printer was working, then stopped after Windows Update?

The update may have changed the driver. Device Manager → Printers → right-click → Roll Back Driver. Or uninstall and reinstall the printer.

### How do I find my network printer's IP address?

On the printer: print a configuration page (usually hold the button for 5-10 seconds). Or check your router's connected devices list — look for the printer's hostname.
