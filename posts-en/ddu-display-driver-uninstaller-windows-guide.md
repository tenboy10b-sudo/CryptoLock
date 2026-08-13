---
title: "DDU (Display Driver Uninstaller): Completely Remove GPU Drivers on Windows"
date: "2026-09-06"
publishDate: "2026-09-06"
updated: "2026-09-06"
description: "How to use DDU to completely remove NVIDIA, AMD or Intel GPU drivers on Windows. Step-by-step guide through Safe Mode, when you need DDU and how to install clean drivers after."
tags: ["windows", "ddu", "drivers", "nvidia", "amd", "tools"]
readTime: 6
translatesUk: "ddu-display-driver-uninstaller-windows"
---

DDU completely removes GPU drivers including all leftovers — registry entries, folders and services. Needed when normal uninstall fails or you want a clean driver installation.

---

## When You Need DDU

- Artifacts, black screen or crashes after driver update
- Switching from NVIDIA to AMD (or vice versa)
- Installing fresh drivers on a clean base
- Driver won't install due to conflicts with old version

---

## Download

Official site only: [guru3d.com/files-details/display-driver-uninstaller-download](https://www.guru3d.com/files-details/display-driver-uninstaller-download.html)

DDU is portable — no installation needed.

---

## Step 1 — Download New Drivers First

Download before removing so they're ready offline:
- **NVIDIA:** [nvidia.com/drivers](https://www.nvidia.com/Download/index.aspx)
- **AMD:** [amd.com/en/support](https://www.amd.com/en/support)

---

## Step 2 — Boot into Safe Mode

```
Win + I → System → Recovery → Advanced startup → Restart now
→ Troubleshoot → Advanced options → Startup Settings → Restart
→ Press F4 (Safe Mode)
```

Or via PowerShell:
```powershell
bcdedit /set {current} safeboot minimal
shutdown /r /t 0
# After DDU — restore:
bcdedit /deletevalue {current} safeboot
```

---

## Step 3 — Run DDU

1. Launch `Display Driver Uninstaller.exe`
2. **Select device type:** GPU
3. **Select device:** NVIDIA / AMD / Intel
4. Click **"Clean and restart"**

---

## Step 4 — Install New Drivers

After restart Windows uses basic VGA driver. Install the drivers you downloaded in Step 1.

**For NVIDIA** — use **NV Clean Install** for a bloat-free installation:
```powershell
winget install Techpowerup.NVCleanInstall
```

---

## Summary

```
1. Download new drivers (offline)
2. Boot into Safe Mode
3. DDU → GPU → Clean and restart
4. Install new drivers
```

| Situation | Action |
|-----------|--------|
| Artifacts after update | DDU → clean install |
| Switching NVIDIA → AMD | DDU required |
| Fresh install | DDU recommended |
| No Safe Mode | DDU in normal mode (riskier) |
