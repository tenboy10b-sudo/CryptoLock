---
title: "How to Monitor Windows Security Events with Event Viewer"
date: "2026-05-02"
publishDate: "2026-05-02"
description: "Use Windows Event Viewer to detect unauthorized access, new accounts, suspicious services, and scheduled tasks. Key Security Event IDs every admin should monitor."
tags: ["windows", "security", "monitoring", "administration"]
translatesUk: "yak-korystuvatys-zhurnalom-podiy-windows"
readTime: 6
---

Windows Event Viewer records everything that happens on the system. Security events — logins, account changes, new services, firewall activity — are all there if you know where to look.

---

## Open Event Viewer

`Win + R` → `eventvwr.msc`

Navigate to **Windows Logs** → **Security** for authentication and audit events.

---

## Enable Full Security Auditing

By default, not all security events are logged. Enable detailed auditing:

```powershell
# Enable Process Creation logging (Event ID 4688)
auditpol /set /subcategory:"Process Creation" /success:enable /failure:enable

# Enable Logon Events
auditpol /set /subcategory:"Logon" /success:enable /failure:enable

# Check current audit policy
auditpol /get /category:*
```

---

## Critical Event IDs to Monitor

| Event ID | Meaning | Threat |
|----------|---------|--------|
| **4625** | Failed login | High — brute force indicator |
| **4720** | New account created | High — unauthorized account |
| **4728/4732** | Added to privileged group | High — privilege escalation |
| **7045** | New service installed | High — malware persistence |
| **4698** | Scheduled task created | High — malware persistence |
| **1102** | Security log cleared | Critical — covering tracks |
| **4719** | Audit policy changed | Critical — disabling monitoring |
| **4624** | Successful login | Info — baseline activity |
| **4688** | Process created | Medium — requires context |

---

## PowerShell Monitoring Queries

```powershell
# Failed logins in last 24 hours
Get-WinEvent -FilterHashtable @{
  LogName='Security'; Id=4625
  StartTime=(Get-Date).AddDays(-1)
} | Group-Object {$_.Properties[5].Value} |
  Sort-Object Count -Descending |
  Select-Object Name, Count

# New accounts created today
Get-WinEvent -FilterHashtable @{
  LogName='Security'; Id=4720
  StartTime=(Get-Date).Date
} | Select-Object TimeCreated,
  @{n='NewAccount';e={$_.Properties[0].Value}},
  @{n='CreatedBy';e={$_.Properties[4].Value}}

# New services installed (last 7 days)
Get-WinEvent -FilterHashtable @{
  LogName='System'; Id=7045
  StartTime=(Get-Date).AddDays(-7)
} | Select-Object TimeCreated,
  @{n='ServiceName';e={$_.Properties[0].Value}},
  @{n='ServicePath';e={$_.Properties[1].Value}}

# Security log cleared
Get-WinEvent -FilterHashtable @{
  LogName='Security'; Id=1102
} -MaxEvents 5 | Select-Object TimeCreated,
  @{n='ClearedBy';e={$_.Properties[1].Value}}
```

---

## Set Up Automated Alerts

Save as `C:\Scripts\security-monitor.ps1` and schedule daily:

```powershell
$report = @()
$report += "=== Security Event Report $(Get-Date -Format 'yyyy-MM-dd') ==="

# Failed logins
$fails = (Get-WinEvent -FilterHashtable @{LogName='Security';Id=4625;StartTime=(Get-Date).Date} -EA 0).Count
$report += "Failed logins today: $fails $(if($fails -gt 10){'⚠️ HIGH'}else{'✅'})"

# New accounts
$newAccounts = (Get-WinEvent -FilterHashtable @{LogName='Security';Id=4720;StartTime=(Get-Date).Date} -EA 0).Count
$report += "New accounts today: $newAccounts $(if($newAccounts -gt 0){'⚠️ Review'}else{'✅'})"

# Log cleared
$cleared = (Get-WinEvent -FilterHashtable @{LogName='Security';Id=1102} -MaxEvents 1 -EA 0)
$report += "Log cleared: $(if($cleared){'🚨 YES - ' + $cleared.TimeCreated}else{'✅ No'})"

$report | Out-File "C:\Scripts\security-report.txt"
$report | Write-Host
```

---

## Filter Events Efficiently

```powershell
# XPath query for faster filtering (especially useful for large logs)
$xpath = "*[System[EventID=4625 and TimeCreated[timediff(@SystemTime) <= 86400000]]]"
Get-WinEvent -LogName Security -FilterXPath $xpath -MaxEvents 50
```

---

## 📋 Don't know what an Event ID means?

Use our free reference tool:

**[→ Windows Event ID Reference](/tools/windows-event-id)** — search 20+ key security events with descriptions, threat levels, and recommended actions.

---


---

## 🛡️ Перевір безпеку свого ПК

Хочеш знати чи немає витоків даних, зайвих служб або підозрілих програм на твоєму ПК?

**[→ AuditShield](/tools/auditshield)** — аудит Windows по 22 напрямках за 10 хвилин. HTML-звіт з оцінкою ризику. Є безкоштовне демо.


## Summary

Enable detailed auditing with `auditpol`. Monitor Event IDs 4625, 4720, 7045, 4698, and 1102. Use `Get-WinEvent` with FilterHashtable for efficient log queries. Schedule a daily report script to catch issues before they escalate. Unknown Event ID — check the [Event ID reference](/tools/windows-event-id).
