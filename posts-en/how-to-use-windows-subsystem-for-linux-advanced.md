---
title: "WSL 2 Advanced: GPU Support, systemd, and Development Setup"
date: "2026-11-01"
publishDate: "2026-11-01"
description: "Take WSL 2 further: enable systemd, use GPU acceleration for ML workloads, set up a complete development environment, and configure WSL networking for advanced use cases."
tags: ["windows", "linux", "tools", "administration"]
readTime: 6
---

Once you've installed WSL 2, there's a lot more you can do with it. This guide covers systemd, GPU passthrough, development environments, and advanced configuration.

---

## Enable systemd

WSL 2 supports systemd since September 2022 — enables services that normally require it (Docker, Apache, PostgreSQL as system services).

Add to `/etc/wsl.conf` inside WSL:

```ini
[boot]
systemd=true
```

```bash
# Create or edit the file
sudo nano /etc/wsl.conf
```

Restart WSL: in PowerShell:
```powershell
wsl --shutdown
wsl
```

Verify:
```bash
systemctl status
ps aux | grep systemd
```

---

## GPU Acceleration (CUDA / Machine Learning)

WSL 2 supports GPU passthrough via NVIDIA CUDA or DirectML.

**Requirements:**
- NVIDIA GPU with updated Windows driver (version 470.76+)
- WSL 2 (not WSL 1)
- Ubuntu or supported distribution

**Inside WSL:**
```bash
# Install CUDA toolkit (Ubuntu)
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
sudo apt update
sudo apt install cuda-toolkit

# Verify GPU is accessible
nvidia-smi
```

For PyTorch:
```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
python -c "import torch; print(torch.cuda.is_available())"
```

---

## Complete Development Environment

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Essential build tools
sudo apt install -y build-essential git curl wget unzip

# Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install --lts
node --version

# Python 3 with pip
sudo apt install -y python3 python3-pip python3-venv
pip3 install --upgrade pip

# Docker (via systemd, now supported)
sudo apt install -y docker.io
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER

# PostgreSQL
sudo apt install -y postgresql
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

---

## Access WSL from Windows Network

By default WSL 2 runs in a private NAT network. To expose a service:

```powershell
# Port forward: expose WSL port 3000 to Windows localhost
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=(wsl hostname -I)

# Remove forward
netsh interface portproxy delete v4tov4 listenport=3000
```

Or configure in `.wslconfig`:
```ini
[wsl2]
localhostForwarding=true
```

WSL services on port 3000 are then accessible at `localhost:3000` in Windows.

---

## WSL Networking Modes

**NAT (default):** WSL gets its own IP, Windows and WSL can communicate, but WSL is not directly on your LAN.

**Mirrored (Windows 11 22H2+):** WSL shares the Windows network stack — same IP, no bridging issues.

Enable mirrored mode in `.wslconfig` (at `C:\Users\YourName\.wslconfig`):
```ini
[wsl2]
networkingMode=mirrored
```

---

## Custom DNS in WSL

If DNS doesn't work correctly inside WSL:

```bash
# Disable automatic DNS
sudo bash -c 'echo "[network]
generateResolvConf = false" >> /etc/wsl.conf'

# Set custom DNS
sudo bash -c 'echo "nameserver 1.1.1.1
nameserver 8.8.8.8" > /etc/resolv.conf'

# Make immutable so WSL doesn't overwrite
sudo chattr +i /etc/resolv.conf
```

---

## Limit WSL Resource Usage

By default WSL 2 can use up to 80% of host RAM. Limit it:

`C:\Users\YourName\.wslconfig`:
```ini
[wsl2]
memory=6GB
processors=4
swap=2GB
swapFile=C:\\Temp\\wsl-swap.vhdx
```

Apply: `wsl --shutdown` then relaunch.

---

## Backup and Restore WSL Distro

```powershell
# Export distro to .tar file
wsl --export Ubuntu "D:\Backup\ubuntu-2024.tar"

# Import on new machine or restore
wsl --import Ubuntu "C:\WSL\Ubuntu" "D:\Backup\ubuntu-2024.tar" --version 2

# Set default user after import
ubuntu config --default-user yourusername
```

---

## WSL Disk Management

WSL uses a virtual disk (`.vhdx`). If it grows large:

```powershell
# Find location of WSL disk
Get-ChildItem "$env:LOCALAPPDATA\Packages" -Recurse -Filter "*.vhdx" -ErrorAction SilentlyContinue |
  Select-Object FullName, @{n='GB';e={[math]::Round($_.Length/1GB,1)}}

# Compact the disk (WSL must be shut down)
wsl --shutdown
# Then in diskpart:
# select vdisk file="path\to\disk.vhdx"
# attach vdisk readonly
# compact vdisk
# detach vdisk
```

---

## Summary

Enable systemd with `/etc/wsl.conf` `[boot] systemd=true`. For GPU: install NVIDIA CUDA inside WSL. Use `.wslconfig` to limit memory and set network mode. Mirrored networking mode (Windows 11) removes most connectivity friction. Back up distros before major changes with `wsl --export`.
