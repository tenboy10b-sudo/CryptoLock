---
title: "Windows Update Delivery Optimization: How to Configure and Save Bandwidth"
date: "2026-03-25"
updated: "2026-06-13"
publishDate: "2026-03-25"
description: "How to configure Windows Update Delivery Optimization on Windows 10 and 11. Limit bandwidth usage, disable P2P sharing, use local network only. Group Policy and registry settings."
tags: ["windows", "windows-update", "network", "optimization"]
readTime: 5
---

Delivery Optimization downloads Windows updates from Microsoft servers and other PCs on your network or the internet — reducing Microsoft's bandwidth costs but using yours in the process. Here's how to control it.

---

## What Delivery Optimization Does

By default, Windows may:
- Download update pieces from other PCs on your local network
- Download from PCs on the internet (other Windows users)
- Upload portions of updates to other PCs

This is on by default and can saturate your connection during active uploads.

---

## Check Current Settings

`Win + I` → **Windows Update** → **Advanced options** → **Delivery Optimization**

See if **Allow downloads from other PCs** is on and what source is selected:
- **Devices on my local network** — only shares within your home/office
- **Devices on the internet and local network** — shares with anyone (more bandwidth used)

---

## Limit Download and Upload Bandwidth

`Win + I` → **Windows Update** → **Advanced options** → **Delivery Optimization** → **Advanced options**

**Download settings:**
- **Percentage of measured bandwidth** — recommended: set to 10-25% so updates don't saturate your connection during work hours
- **Absolute bandwidth** — set a specific MB/s cap

**Upload settings:**
- **Monthly upload limit** — set to 1-5 GB to prevent excessive uploads
- **Percentage of bandwidth** for uploads — set to 5-10%

---

## Disable Delivery Optimization Peer Sharing

To stop sharing entirely (still downloads from Microsoft):

```powershell
# Disable peer sharing — download only from Microsoft
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DeliveryOptimization" `
  -Name "DODownloadMode" -Value 0 -Type DWord -Force
```

Download mode values:
- `0` = Microsoft only (no peer sharing)
- `1` = Local network peers only
- `2` = Local network + internet peers
- `99` = Bypass (disable Delivery Optimization entirely)

---

## Disable Delivery Optimization Service

```powershell
# Stop and disable the service
Stop-Service DoSvc -Force
Set-Service DoSvc -StartupType Disabled
```

Note: disabling the service may slow down Windows Update slightly on some configurations.

---

## Check Delivery Optimization Activity

```powershell
# View upload/download stats
Get-DeliveryOptimizationStatus

# Detailed stats
Get-DeliveryOptimizationPerfSnap
```

---

## Configure via Group Policy

For managed environments:

`gpedit.msc` → **Computer Configuration** → **Administrative Templates** → **Windows Components** → **Delivery Optimization**

Key policies:
- **Download Mode** → set to `0` (HTTP only, no peering)
- **Maximum Download Bandwidth** → set percentage or absolute value
- **Maximum Upload Bandwidth** → limit uploads

---

## Delivery Optimization Log

```powershell
# Check recent Delivery Optimization activity
Get-WinEvent -LogName "Microsoft-Windows-Delivery-Optimization/Operational" -MaxEvents 20 |
  Select-Object TimeCreated, Message | Format-List
```

---

## When to Restrict It

**Restrict if:**
- You have a metered connection or data cap
- Updates are noticeably slowing your network
- You're on a business network where you control bandwidth

**Leave default if:**
- You have a fast unlimited connection
- You have multiple PCs at home (local peering actually speeds things up)
- You want to help other Windows users get updates faster

---

## Summary

Limit bandwidth via **Advanced options** in Delivery Optimization — set download to 10-25% and monthly upload cap to 5 GB. To disable peer sharing: set DODownloadMode to 0 via registry or Group Policy. To check what's being uploaded: use `Get-DeliveryOptimizationStatus`.
