---
title: "How to Use Windows Sandbox to Test Suspicious Software Safely"
date: "2026-05-15"
publishDate: "2026-05-15"
description: "Use Windows Sandbox to safely test suspicious installers, scripts and files. Configure .wsb files, share folders, disable networking and automate sandbox sessions."
tags: ["windows", "sandbox", "security", "virtualization", "malware"]
readTime: 5
translatesUk: "windows-sandbox-bezpechne-testuvannya"
---

Windows Sandbox gives you a disposable Windows environment. Every file you run inside it, every change it makes — gone the moment you close the window. Perfect for testing untrusted software.

---

## Enable Windows Sandbox

```powershell
# Requires Windows 11/10 Pro, Enterprise or Education
Enable-WindowsOptionalFeature -FeatureName "Containers-DisposableClientVM" -Online -NoRestart
Restart-Computer
```

Or: `Win + R` → `optionalfeatures` → check **Windows Sandbox** → OK → Restart

---

## Basic Usage

1. Start menu → **Windows Sandbox**
2. A clean Windows desktop opens in a window
3. Drag files into it or use copy/paste
4. Run whatever you want to test
5. Close the window — **everything inside is permanently deleted**

---

## Configure Sandbox with .wsb Files

Create a text file with `.wsb` extension to customize the sandbox:

```xml
<!-- SaveAs: TestSandbox.wsb — double-click to launch -->
<Configuration>
  <!-- Share a folder (read-only by default) -->
  <MappedFolders>
    <MappedFolder>
      <HostFolder>C:\Downloads</HostFolder>
      <SandboxFolder>C:\Users\WDAGUtilityAccount\Desktop\Downloads</SandboxFolder>
      <ReadOnly>true</ReadOnly>
    </MappedFolder>
  </MappedFolders>

  <!-- Disable internet for maximum isolation -->
  <Networking>Disable</Networking>

  <!-- RAM allocation (MB) -->
  <MemoryInMB>4096</MemoryInMB>

  <!-- Run script on startup -->
  <LogonCommand>
    <Command>cmd.exe /c start explorer.exe C:\Users\WDAGUtilityAccount\Desktop\Downloads</Command>
  </LogonCommand>
</Configuration>
```

---

## Sandbox for Malware Analysis

```xml
<!-- MalwareAnalysis.wsb -->
<Configuration>
  <Networking>Disable</Networking>
  <ClipboardRedirection>Disable</ClipboardRedirection>
  <PrinterRedirection>Disable</PrinterRedirection>
  <MemoryInMB>4096</MemoryInMB>
  <MappedFolders>
    <MappedFolder>
      <HostFolder>C:\Samples</HostFolder>
      <SandboxFolder>C:\Users\WDAGUtilityAccount\Desktop\Samples</SandboxFolder>
      <ReadOnly>true</ReadOnly>
    </MappedFolder>
  </MappedFolders>
  <LogonCommand>
    <Command>powershell -Command "Start-Process 'C:\Users\WDAGUtilityAccount\Desktop\Samples\suspicious.exe'"</Command>
  </LogonCommand>
</Configuration>
```

---

## What Sandbox Protects Against

✅ Malware that modifies Windows files
✅ Browser hijackers from installer bundles
✅ Ransomware (can't encrypt host files)
✅ Registry changes that break Windows
✅ Persistent startup entries

❌ Hardware exploits (rare)
❌ VM escape exploits (extremely rare)
❌ Clipboard-based attacks if clipboard sharing is on

---

## Automate Sandbox Sessions via PowerShell

```powershell
# Create temp sandbox config
$wsb = @"
<Configuration>
  <Networking>Disable</Networking>
  <MappedFolders>
    <MappedFolder>
      <HostFolder>$env:USERPROFILE\Downloads</HostFolder>
      <ReadOnly>true</ReadOnly>
    </MappedFolder>
  </MappedFolders>
</Configuration>
"@

$wsbPath = "$env:TEMP\temp-sandbox.wsb"
$wsb | Out-File $wsbPath -Encoding UTF8
Start-Process $wsbPath
```

---

## Sandbox vs Hyper-V VM

| | Sandbox | Hyper-V VM |
|--|---------|-----------|
| Setup time | 5 seconds | 5-30 minutes |
| Persistence | None (disposable) | Persists |
| Isolation | Good | Better |
| Snapshots | No | Yes |
| Resource use | Light | Heavier |

Use Sandbox for quick testing. Use Hyper-V VM for long-term testing environments.

---

## Summary

Enable via `optionalfeatures`. Use `.wsb` config files for reproducible sessions. Disable networking for maximum isolation. Share folders as read-only to pass files in. Sandbox is ideal for testing installers, scripts and suspicious downloads before running on host.

## Frequently Asked Questions

### Can malware escape from Windows Sandbox?

Theoretically possible via VM escape exploits, but extremely rare and would require a sophisticated zero-day. For practical purposes — testing typical consumer malware — Sandbox is safe.

### Why does Sandbox start a full Windows copy?

Sandbox uses a linked clone technology that shares most files with the host OS. It looks like a full Windows installation but uses only ~100 MB of memory beyond the shared base.

### Can I save files from Sandbox to my PC?

Yes — if you have a mapped folder with `ReadOnly: false`, anything the sandbox writes there persists on the host. Set `ReadOnly: true` for all test scenarios to prevent accidental writes.
