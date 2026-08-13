---
title: "PuTTY on Windows: SSH Connection to Servers and Terminal Setup"
date: "2026-09-18"
publishDate: "2026-09-18"
updated: "2026-09-18"
description: "How to install PuTTY and connect to a Linux server via SSH from Windows. Configure SSH keys, save sessions, port tunneling and PuTTY alternatives in 2026."
tags: ["windows", "putty", "ssh", "terminal", "administration", "tools"]
readTime: 7
translatesUk: "putty-windows-ssh-pidklyuchennya"
---

PuTTY is the classic SSH client for Windows. Connect to Linux servers, VPS or any SSH device directly from Windows without extra configuration.

---

## Install

```powershell
winget install PuTTY.PuTTY
```
Or from [putty.org](https://www.putty.org)

---

## First Connection

1. Open `putty.exe`
2. **Host Name:** server IP or domain
3. **Port:** 22, **Connection type:** SSH
4. Click **"Open"** → accept fingerprint → enter login and password

---

## Save Sessions

1. Fill in Host Name
2. Enter name in **"Saved Sessions"** field
3. Click **"Save"**
4. Next time: double-click saved session

---

## SSH Keys (more secure than password)

### Generate key (PuTTYgen)
1. Open `puttygen.exe` → **"Generate"** → move mouse
2. **"Save private key"** as `.ppk`
3. Copy public key from top field

### Add key to server
```bash
mkdir -p ~/.ssh
echo "PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Use key in PuTTY
```
Connection → SSH → Auth → Private key file: select .ppk
```

---

## Useful Settings

```
Window → Appearance → Font: Consolas 12pt
Connection → Seconds between keepalives: 60
Window → Translation → Remote character set: UTF-8
```

---

## Port Tunneling

```
Connection → SSH → Tunnels
L8080 127.0.0.1:80
```

Opens `http://localhost:8080` → traffic goes through SSH.

Common tunnels:
```
L3306 127.0.0.1:3306  # MySQL
L5432 127.0.0.1:5432  # PostgreSQL
```

---

## Built-in OpenSSH (Windows 10/11 alternative)

```powershell
# Install if not present
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0

# Connect without PuTTY
ssh user@server.com
ssh -i C:\keys\mykey.pem user@server.com
```

---

## Summary

| Task | Solution |
|------|---------|
| Basic connection | PuTTY → IP:22 → Open |
| Save session | Saved Sessions → Save |
| SSH key | PuTTYgen → generate → add to server |
| Port tunnel | Connection → SSH → Tunnels |
| No GUI needed | `ssh user@server` (built-in OpenSSH) |
