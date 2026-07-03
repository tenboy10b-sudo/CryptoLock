---
title: "How to Configure UAC (User Account Control) in Windows 10 and 11"
date: "2026-05-08"
publishDate: "2026-05-08"
description: "Configure User Account Control (UAC) in Windows 10 and 11. Adjust notification level, disable UAC for specific apps, manage elevation prompts via Group Policy."
tags: ["windows", "uac", "security", "administration", "powershell"]
readTime: 5
translatesUk: "nalashtuvannya-uac-windows"
---

UAC prompts are annoying but they're also your last line of defense against unauthorized system changes. Here's how to tune them properly.

---

## Check Current UAC Level

```powershell
# View current UAC settings
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" |
  Select-Object ConsentPromptBehaviorAdmin, EnableLUA, PromptOnSecureDesktop
```

**ConsentPromptBehaviorAdmin values:**
- `0` = Never notify (UAC disabled)
- `1` = Notify only for app changes, not Windows settings
- `2` = Always notify (most secure)
- `5` = Default — notify for app changes (dimmed desktop)

---

## Change UAC Level via GUI

`Win + R` → `UserAccountControlSettings` → drag the slider:

- **Always notify** — most secure, most annoying
- **Notify only when apps try to make changes** (default)
- **Notify only when apps try to make changes (don't dim desktop)** — less secure
- **Never notify** — dangerous, malware can silently elevate

---

## Change UAC Level via PowerShell

```powershell
# Set to default (notify for app changes, dim desktop)
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" `
  -Name "ConsentPromptBehaviorAdmin" -Value 5 -Type DWord
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" `
  -Name "PromptOnSecureDesktop" -Value 1 -Type DWord

# Set to Always Notify (most secure)
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" `
  -Name "ConsentPromptBehaviorAdmin" -Value 2 -Type DWord

# Disable UAC (not recommended)
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" `
  -Name "EnableLUA" -Value 0 -Type DWord
```

---

## Auto-Elevate a Specific App Without Prompt

Create an application manifest to auto-elevate a trusted app:

```powershell
# Create a scheduled task that runs elevated without UAC prompt
$action = New-ScheduledTaskAction -Execute "C:\Tools\MyApp.exe"
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit 0
Register-ScheduledTask -TaskName "RunMyAppElevated" `
  -Action $action -Principal $principal -Settings $settings

# Run it without UAC prompt
Start-ScheduledTask -TaskName "RunMyAppElevated"
```

---

## Bypass UAC for Specific Apps via Task Scheduler

Another method — create a task for the specific app and launch via task:

```powershell
# Create shortcut that launches app via task (no UAC prompt)
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut("$env:USERPROFILE\Desktop\MyApp-Admin.lnk")
$shortcut.TargetPath = "schtasks.exe"
$shortcut.Arguments = "/run /tn RunMyAppElevated"
$shortcut.Save()
```

---

## Configure via Group Policy

`gpedit.msc` → `Computer Configuration` → `Windows Settings` → `Security Settings` → `Local Policies` → `Security Options`

Key settings:
- **UAC: Behavior of the elevation prompt for administrators** — set to Prompt for credentials
- **UAC: Run all administrators in Admin Approval Mode** — keep Enabled
- **UAC: Virtualize file and registry write failures** — keep Enabled

---

## Summary

Default UAC (level 5) is the right balance for most users. Use `ConsentPromptBehaviorAdmin = 2` for maximum security on sensitive systems. Never fully disable UAC — it's a key defense layer. Use scheduled tasks to auto-elevate specific trusted tools.

## Frequently Asked Questions

### Should I disable UAC to stop the prompts?

No. Disabling UAC means malware can silently install drivers, modify system files and change registry without any warning. The prompts are annoying but they stop real attacks.

### UAC prompt appears even for my own apps — how do I stop it?

The app requests elevation via its manifest. Use the scheduled task method above to create an elevated shortcut that launches without a UAC prompt.

### Changing UAC settings requires admin rights — circular dependency?

Yes, intentionally. You need to already be logged in as an admin to change UAC. This prevents non-admin users from weakening system security.
