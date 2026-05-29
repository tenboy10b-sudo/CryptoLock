---
title: "How to Enable and Use Windows Sandbox in Windows 11"
date: "2026-05-17"
publishDate: "2026-05-17"
description: "Enable Windows Sandbox in Windows 11 Pro to run untrusted apps safely. Each session starts fresh and leaves no traces. Setup, usage and configuration tips."
tags: ["windows", "security", "sandbox", "virtualization"]
readTime: 4
---

Windows Sandbox is a lightweight isolated desktop for running untrusted software safely. Every time you close it, everything inside is permanently deleted — zero traces on your main system.

---

## Requirements

- Windows 11 **Pro**, **Enterprise**, or **Education** (not Home)
- Virtualization enabled in BIOS
- At least 4 GB RAM free

---

## Enable Windows Sandbox

**Method 1 — Optional Features:**

`Win + R` → `optionalfeatures` → check **Windows Sandbox** → OK → Restart

**Method 2 — PowerShell:**

```powershell
Enable-WindowsOptionalFeature -FeatureName "Containers-DisposableClientVM" -Online
```

After restart: `Win + S` → search **Windows Sandbox** → launch.

---

## How to Use It

1. Open Windows Sandbox — a fresh Windows desktop appears in a window
2. Copy files into the Sandbox window (drag and drop)
3. Run suspicious installers, test software, browse risky sites
4. Close the Sandbox — **everything inside is permanently deleted**

The host PC is completely isolated. Nothing the Sandbox app does can affect your real Windows.

---

## Configure Sandbox with .wsb Files

You can create configuration files (`.wsb`) to customize the sandbox:

```xml
<!-- SaveAs: MySandbox.wsb, then double-click to launch -->
<Configuration>
  <!-- Share a folder from host (read-only) -->
  <MappedFolders>
    <MappedFolder>
      <HostFolder>C:\Downloads</HostFolder>
      <SandboxFolder>C:\Users\WDAGUtilityAccount\Desktop\Downloads</SandboxFolder>
      <ReadOnly>true</ReadOnly>
    </MappedFolder>
  </MappedFolders>

  <!-- Disable networking (maximum isolation) -->
  <Networking>Disable</Networking>

  <!-- Run a script at startup -->
  <LogonCommand>
    <Command>explorer.exe C:\Users\WDAGUtilityAccount\Desktop\Downloads</Command>
  </LogonCommand>

  <!-- Disable clipboard sharing -->
  <ClipboardRedirection>Disable</ClipboardRedirection>
</Configuration>
```

---

## Practical Use Cases

**Test an installer before running it on your PC:**
1. Copy the installer to Sandbox
2. Run it, observe behavior
3. Check what it installs, what it modifies
4. Close Sandbox — your PC untouched

**Browse a risky link safely:**
1. Open Sandbox
2. Open Edge inside Sandbox
3. Visit the link
4. Close Sandbox when done

**Test software you don't fully trust:**
- Cracked software (to check for malware before deciding)
- Unknown browser extensions
- Email attachments

---

## Summary

Enable via `optionalfeatures` → restart → launch from Start. Close the window to destroy everything inside. Use `.wsb` config files to map folders, disable network, or run startup commands. Perfect for testing installers and suspicious files.

## Frequently Asked Questions

### Is Windows Sandbox the same as a VM?

No. Sandbox is lighter, disposable and always starts from a clean Windows image. VMs (Hyper-V) persist data between sessions. Sandbox is faster to start but you can't save its state.

### Can Windows Sandbox run Windows 10 or Linux?

No. Windows Sandbox always runs the same Windows version as your host. For other OS use Hyper-V or VirtualBox.

### Why is Windows Sandbox not available on Windows 11 Home?

Microsoft reserves Sandbox for Pro and Enterprise as a business security feature. Home users can use Hyper-V (not available on Home either) or VirtualBox as a free alternative.
