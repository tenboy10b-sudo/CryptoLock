---
title: "WinSCP on Windows: FTP and SFTP Client for Server File Transfer"
date: "2027-01-29"
publishDate: "2027-01-29"
updated: "2026-10-05"
description: "How to install and use WinSCP to connect to FTP and SFTP servers. Transfer files, configure connections, sync folders, SSH key auth and WinSCP scripting."
tags: ["windows", "winscp", "ftp", "sftp", "tools", "administration"]
readTime: 7
translatesUk: "winscp-windows-ftp-sftp-klient"
---

WinSCP is the most popular free FTP/SFTP client for Windows. Transfer files to web servers, VPS or any SSH server with a GUI or automated scripts.

---

## Install

```powershell
winget install WinSCP.WinSCP
```
Or from [winscp.net](https://winscp.net/eng/download.php)

---

## First Connection (SFTP/SSH)

1. Launch WinSCP → **"New Session"**
2. Fill in: Protocol: SFTP, Host: IP or domain, Port: 22, Username, Password
3. Click **"Login"** → accept host fingerprint on first connect

---

## SSH Key Authentication

1. **"New Session"** → **"Advanced"** → **"SSH"** → **"Authentication"**
2. **"Private key file"** → select `.ppk` file
   - Convert `.pem` to `.ppk` using **PuTTYgen** (included with WinSCP)

---

## Key Operations

| Action | Method |
|--------|--------|
| Upload file | Drag from left panel to right |
| Download file | Drag from right to left |
| Edit on server | Double-click → saves back automatically |
| Set permissions | Right-click → Properties |

---

## Sync Folders

```
Commands → Synchronize (Ctrl+S)
```

| Mode | Action |
|------|--------|
| **Remote** | Updates server from local |
| **Local** | Updates local from server |
| **Both** | Two-way sync |

---

## Scripting for Automation

```batch
:: Upload files automatically
"C:\Program Files (x86)\WinSCP\WinSCP.com" /command ^
  "open sftp://user:password@server.com/" ^
  "put C:\backup\*.sql /backups/" ^
  "exit"
```

```powershell
# PowerShell .NET assembly
Add-Type -Path "C:\Program Files (x86)\WinSCP\WinSCPnet.dll"
$options = New-Object WinSCP.SessionOptions -Property @{
    Protocol = [WinSCP.Protocol]::Sftp
    HostName = "server.com"
    UserName = "user"
    Password = "password"
}
$session = New-Object WinSCP.Session
$session.Open($options)
$session.PutFiles("C:\backup\*", "/backups/").Check()
$session.Dispose()
```

---

## WinSCP vs FileZilla

| | WinSCP | FileZilla |
|-|--------|----------|
| SFTP/SCP | ✅ | ✅ |
| Scripting | ✅ | ❌ |
| .NET API | ✅ | ❌ |
| No ads | ✅ | ⚠️ |

---

## Summary

| Task | Solution |
|------|---------|
| Connect to server | New Session → SFTP → IP/login |
| SSH key | Advanced → SSH → Auth → .ppk |
| Sync folder | Commands → Synchronize |
| Automation | WinSCP.com scripts or .NET assembly |
