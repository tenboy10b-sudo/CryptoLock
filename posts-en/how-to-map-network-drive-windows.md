---
title: "How to Map a Network Drive in Windows 10 and 11"
date: "2026-06-02"
publishDate: "2026-06-02"
description: "Map a network folder as a drive letter in Windows so it appears in File Explorer like a local drive. Covers GUI, Command Prompt, and PowerShell methods with persistent mapping."
tags: ["windows", "network", "administration", "tools"]
readTime: 5
---

Mapping a network drive lets you access a shared folder as if it were a local drive — it appears in File Explorer with its own letter (Z:, Y:, etc.) and works with any app that opens files.

---

## Method 1: File Explorer (GUI)

Open **File Explorer** → click **This PC** in the left panel → **Map network drive** (in the toolbar or right-click This PC)

1. Choose a drive letter (e.g. **Z:**)
2. Enter the folder path: `\\ServerName\SharedFolder` or `\\192.168.1.100\SharedFolder`
3. Check **Reconnect at sign-in** to make it persistent
4. Check **Connect using different credentials** if the share requires a different username/password
5. Click **Finish**

---

## Method 2: Command Prompt

```cmd
net use Z: \\192.168.1.100\SharedFolder /persistent:yes

rem With credentials
net use Z: \\192.168.1.100\SharedFolder /user:username password /persistent:yes

rem Disconnect
net use Z: /delete

rem List all mapped drives
net use
```

---

## Method 3: PowerShell

```powershell
# Map drive
New-PSDrive -Name "Z" -PSProvider FileSystem -Root "\\192.168.1.100\SharedFolder" -Persist

# Map with credentials
$cred = Get-Credential
New-PSDrive -Name "Z" -PSProvider FileSystem -Root "\\192.168.1.100\SharedFolder" -Credential $cred -Persist

# List mapped drives
Get-PSDrive -PSProvider FileSystem

# Remove mapped drive
Remove-PSDrive -Name "Z"
```

---

## Troubleshooting

**"The network path was not found":**
- Check the server name or IP is correct
- Ping the server: `ping 192.168.1.100`
- Verify the shared folder name (case-sensitive on some systems)

**"Access is denied":**
- Use correct credentials
- Check share permissions on the server side

**Drive disappears after restart:**
- Make sure **Reconnect at sign-in** was checked
- Or use Task Scheduler to remap at login

**Map drive that persists for all users:**
```cmd
net use Z: \\server\share /persistent:yes
reg add "HKLM\SYSTEM\CurrentControlSet\Services\LanmanWorkstation\Parameters" /v "AllowInsecureGuestAuth" /t REG_DWORD /d 1 /f
```

---

## Summary

For one-time setup: use File Explorer → Map network drive. For scripted or automated setup: use `net use` or `New-PSDrive`. Always check **Reconnect at sign-in** to keep the mapping after restart.
