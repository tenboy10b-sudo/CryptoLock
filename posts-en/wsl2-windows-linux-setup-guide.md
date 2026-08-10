---
title: "WSL 2 on Windows 10 and 11: Install Linux and Set Up Developer Environment"
date: "2026-06-18"
publishDate: "2026-08-12"
updated: "2026-06-18"
description: "How to install WSL 2 and Linux on Windows 10 and 11. Configure Ubuntu, access Windows files from Linux, VS Code and Docker integration, performance optimization."
tags: ["windows", "wsl", "linux", "development", "ubuntu", "tools"]
readTime: 9
translatesUk: "wsl2-windows-vstanovlennya-linux-rozrobnyk"
---

WSL 2 (Windows Subsystem for Linux) runs a real Linux directly in Windows — no dual boot, no full VM. For developers it's a game-changer.

---

## Install WSL 2

```powershell
# One command — installs WSL 2 + Ubuntu
wsl --install
```

Restart → Ubuntu launches and asks to create a user.

### Choose a different distro

```powershell
wsl --list --online          # See available
wsl --install -d Debian
wsl --install -d Ubuntu-24.04
wsl --install -d kali-linux
```

---

## First Ubuntu Setup

```bash
sudo apt update && sudo apt upgrade -y

sudo apt install -y \
    git curl wget \
    build-essential \
    python3 python3-pip \
    nodejs npm

git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

---

## File Access

### From Linux to Windows files
```bash
ls /mnt/c/Users/
cd /mnt/c/Users/YourName/Documents
```

### From Windows to Linux files
```
\\wsl$\Ubuntu\home\username\
```

### Open Linux folder in Explorer
```bash
explorer.exe .
```

---

## VS Code Integration

1. Install **Remote - WSL** extension
2. In WSL terminal:
```bash
code .
```
VS Code opens with Linux backend — extensions, terminal and files all in Linux.

---

## Docker in WSL 2

1. Install Docker Desktop
2. Settings → Resources → WSL Integration → enable Ubuntu

```bash
docker --version
docker run hello-world
docker compose up -d
```

---

## Limit RAM Usage

```ini
# C:\Users\YourName\.wslconfig
[wsl2]
memory=4GB
processors=4
swap=2GB
```

```powershell
wsl --shutdown  # Apply changes
```

---

## Performance Tip

Store projects in Linux filesystem for best speed:
```bash
# ✅ Fast — in Linux
~/projects/myapp

# ❌ Slow — via Windows mount
/mnt/c/Users/user/projects/myapp
```

---

## Key WSL Commands

```powershell
wsl --list --verbose       # List distros
wsl --shutdown             # Stop WSL
wsl --terminate Ubuntu     # Stop specific distro
wsl --set-default Ubuntu   # Set default
wsl ls -la /home           # Run Linux command from PowerShell
wsl --set-version Ubuntu 2 # Convert a WSL 1 distro to WSL 2
wsl --export Ubuntu-24.04 "C:\Backup\ubuntu-backup.tar"   # Backup a distro
wsl --import Ubuntu-Restored "C:\WSL\Ubuntu" "C:\Backup\ubuntu-backup.tar"  # Restore from backup
wsl --unregister Ubuntu-24.04  # Remove a distro
```

---

## Summary

| Step | Command |
|------|---------|
| Install WSL + Ubuntu | `wsl --install` |
| Update packages | `sudo apt update && upgrade` |
| Open in VS Code | `code .` (from Linux folder) |
| Limit RAM | `.wslconfig` → memory=4GB |
| Stop WSL | `wsl --shutdown` |
| Windows files | `/mnt/c/Users/...` |
