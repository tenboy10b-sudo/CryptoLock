---
title: "How to Install WSL 2 and Run Linux on Windows"
date: "2026-08-17"
publishDate: "2026-08-17"
description: "Windows Subsystem for Linux (WSL 2) runs a real Linux kernel inside Windows. How to install it, choose a distribution, access Windows files from Linux, and set up a development environment."
tags: ["windows", "linux", "tools", "administration"]
readTime: 6
---

WSL 2 runs a genuine Linux kernel inside Windows — not a compatibility layer, not a VM you manage manually. It starts in seconds, integrates with the Windows filesystem, and works with VS Code, Docker, and most Linux tools.

---

## Install WSL 2

Open PowerShell as Administrator:

```powershell
wsl --install
```

This single command:
- Enables required Windows features
- Downloads and installs WSL 2
- Installs Ubuntu by default

Restart when prompted. On first launch, Ubuntu asks you to create a Linux username and password.

---

## Install a Different Distribution

```powershell
# List available distributions
wsl --list --online

# Install specific distros
wsl --install -d Debian
wsl --install -d Ubuntu-22.04
wsl --install -d kali-linux
wsl --install -d openSUSE-Leap-15.5
```

---

## Basic WSL Commands

```powershell
# List installed distributions
wsl --list --verbose

# Launch default distro
wsl

# Launch specific distro
wsl -d Ubuntu

# Set default distro
wsl --set-default Ubuntu-22.04

# Shut down all running distros
wsl --shutdown

# Update WSL kernel
wsl --update

# Check WSL version
wsl --version
```

---

## Access Files Between Windows and Linux

**From Linux, access Windows files:**
```bash
cd /mnt/c/Users/YourName/Documents
ls /mnt/d/Projects
```

**From Windows, access Linux files:**
Open File Explorer → type in address bar: `\\wsl$\Ubuntu`

Or from terminal:
```powershell
explorer.exe .  # Opens current Linux directory in File Explorer
```

**Copy files:**
```bash
# Linux to Windows
cp ~/script.sh /mnt/c/Users/YourName/Desktop/

# Windows to Linux
cp /mnt/c/Users/YourName/Downloads/file.zip ~/
```

---

## Performance: Keep Files in Linux Filesystem

File operations on `/mnt/c/` (Windows filesystem) are significantly slower than native Linux filesystem (`~/`). For development:

- Store project files in `~/projects/` not `/mnt/c/Users/...`
- Build, compile, run in Linux filesystem
- Open with VS Code via `code .` from Linux terminal

---

## Set Up WSL for Development

```bash
# Update packages (Ubuntu/Debian)
sudo apt update && sudo apt upgrade -y

# Install common tools
sudo apt install -y git curl wget build-essential

# Install Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install --lts

# Install Python tools
sudo apt install -y python3-pip python3-venv

# Install Docker (works with Docker Desktop on Windows)
sudo apt install -y docker.io
```

---

## VS Code + WSL Integration

Install the **WSL** extension in VS Code. Then from any Linux terminal:

```bash
code .  # Opens current directory in VS Code with WSL backend
```

VS Code runs in Windows but executes everything (terminal, extensions, debugger) inside WSL. No configuration needed.

---

## WSL Config File

Create `~/.wslconfig` on Windows (not inside WSL) at `C:\Users\YourName\.wslconfig`:

```ini
[wsl2]
memory=4GB          # Limit RAM usage
processors=2        # Limit CPU cores
swap=2GB            # Swap file size
localhostForwarding=true  # Forward ports to Windows localhost
```

Apply: `wsl --shutdown` then restart.

---

## Export and Import Distributions

```powershell
# Backup a distro
wsl --export Ubuntu "D:\Backup\ubuntu-backup.tar"

# Restore on another PC
wsl --import Ubuntu "C:\WSL\Ubuntu" "D:\Backup\ubuntu-backup.tar"

# Unregister (delete) a distro
wsl --unregister Ubuntu
```

---

## Troubleshooting

**"WSL 2 requires an update to its kernel component":**
```powershell
wsl --update
```

**Distro won't start:**
```powershell
wsl --shutdown
wsl
```

**Slow network in WSL:**
Add to `/etc/wsl.conf` inside WSL:
```ini
[network]
generateResolvConf = false
```
Then set DNS manually: `echo "nameserver 1.1.1.1" | sudo tee /etc/resolv.conf`

---

## Summary

`wsl --install` → restart → done. Store project files in the Linux filesystem (`~/`) for best performance. Use VS Code with the WSL extension for a seamless development experience. Configure memory and CPU limits in `.wslconfig` if WSL uses too many resources.
