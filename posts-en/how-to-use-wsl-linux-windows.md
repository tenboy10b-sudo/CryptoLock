---
title: "How to Install and Use WSL 2 (Linux on Windows) in 2025"
date: "2027-01-14"
publishDate: "2027-01-14"
description: "Install WSL 2 and run Linux on Windows 11 and 10. Set up Ubuntu, use Linux tools alongside Windows, access files between systems and configure WSL settings."
tags: ["windows", "wsl", "linux", "development", "administration"]
readTime: 6
---

WSL 2 (Windows Subsystem for Linux) lets you run a real Linux kernel directly in Windows — no VM, no dual boot, no performance penalty.

---

## Install WSL 2

```powershell
# One command installs WSL 2 and Ubuntu (requires restart)
wsl --install

# Install a specific distro
wsl --install -d Ubuntu-22.04
wsl --install -d Debian
wsl --install -d kali-linux
```

After restart, Ubuntu opens and asks to create a username and password.

---

## List Available Distros

```powershell
# See what's available online
wsl --list --online

# See installed distros
wsl --list --verbose
```

---

## Launch and Use WSL

```powershell
# Open default distro
wsl

# Open specific distro
wsl -d Ubuntu-22.04

# Run a single command
wsl ls -la /home

# Run as root
wsl -u root
```

---

## Access Files Between Windows and Linux

**From Linux, access Windows files:**
```bash
# Windows C: drive is mounted at /mnt/c/
ls /mnt/c/Users/YourName/Documents
cp /mnt/c/Users/YourName/file.txt ~/
```

**From Windows, access Linux files:**
```powershell
# Linux filesystem in Windows Explorer
explorer.exe \\wsl$\Ubuntu\home\username

# Or type in Explorer address bar:
\\wsl$\Ubuntu
```

---

## Install Linux Packages

```bash
# Update package list and upgrade
sudo apt update && sudo apt upgrade -y

# Install common tools
sudo apt install -y git curl wget unzip build-essential python3 python3-pip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs
```

---

## Configure WSL

```powershell
# Set WSL 2 as default version
wsl --set-default-version 2

# Set default distro
wsl --set-default Ubuntu-22.04

# Convert existing WSL 1 distro to WSL 2
wsl --set-version Ubuntu 2

# Limit WSL memory usage (create .wslconfig in %UserProfile%)
$config = @"
[wsl2]
memory=4GB
processors=2
swap=2GB
"@
$config | Out-File "$env:USERPROFILE\.wslconfig" -Encoding UTF8
```

---

## Useful WSL Commands

```powershell
# Shut down all WSL instances
wsl --shutdown

# Restart a specific distro
wsl --terminate Ubuntu-22.04
wsl -d Ubuntu-22.04

# Export distro as backup
wsl --export Ubuntu-22.04 "C:\Backup\ubuntu-backup.tar"

# Import distro from backup
wsl --import Ubuntu-Restored "C:\WSL\Ubuntu" "C:\Backup\ubuntu-backup.tar"

# Uninstall a distro
wsl --unregister Ubuntu-22.04
```

---

## Run Graphical Linux Apps (WSLg)

WSL 2 on Windows 11 includes WSLg — run Linux GUI apps natively:

```bash
# Install a GUI app
sudo apt install -y gedit

# Run it — appears as a normal Windows window
gedit &
```

No extra configuration needed on Windows 11.

---

## Summary

Install with `wsl --install`, then restart. Access Windows files at `/mnt/c/`. Access Linux files from Windows via `\\wsl$\Ubuntu`. Limit memory with `.wslconfig`. Export/import for backups. WSLg on Windows 11 runs GUI apps natively.

## Frequently Asked Questions

### Is WSL 2 better than a virtual machine?

WSL 2 is faster to start, uses less memory and integrates with Windows seamlessly. The tradeoff is it shares the Windows kernel — it's not fully isolated like a VM. For development work, WSL 2 is excellent. For security testing, use a full VM.

### Can I run Docker in WSL 2?

Yes. Docker Desktop for Windows uses WSL 2 as its backend. You can also install Docker directly inside WSL 2 without Docker Desktop.

### Does WSL 2 work on Windows 10?

Yes, WSL 2 works on Windows 10 version 2004 (build 19041) or later. Run `winver` to check your build number.
