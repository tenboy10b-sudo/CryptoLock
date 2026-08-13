---
title: "Windows Sandbox: Isolated Environment for Safe Program Testing"
date: "2026-08-11"
publishDate: "2026-08-11"
updated: "2026-08-11"
description: "How to enable and use Windows Sandbox on Windows 10 and 11 Pro. Run suspicious programs safely in isolation, configure .wsb files and understand sandbox limitations."
tags: ["windows", "sandbox", "security", "virtualization", "tools"]
readTime: 6
translatesUk: "windows-sandbox-izolovane-seredovyshche"
---

Windows Sandbox is a built-in isolated environment in Windows 10/11 Pro for safely testing programs. Run a suspicious file, close Sandbox — no trace left on your system.

---

## What Is Windows Sandbox

A lightweight VM using your existing Windows installation. Every launch — clean system. Close it — everything deleted automatically.

**Advantages over VirtualBox:**
- No separate Windows image needed
- Starts in 5–10 seconds
- Auto-deletes all changes on close
- Built into Windows — nothing to install

**Limitations:**
- Only Windows 10/11 **Pro, Enterprise or Education**
- No state persistence between sessions
- No snapshots

---

## Enable Windows Sandbox

```
Win + R → optionalfeatures → Windows Sandbox → ✅ → OK → Restart
```

Or PowerShell:
```powershell
Enable-WindowsOptionalFeature -FeatureName "Containers-DisposableClientVM" -Online -All
```

---

## Basic Usage

1. Start → **Windows Sandbox**
2. Wait 5–15 seconds for it to load
3. Copy file into Sandbox (drag & drop or clipboard)
4. Run the file — everything inside is isolated
5. Close Sandbox → confirm → all changes deleted

---

## Configuration Files (.wsb)

```xml
<Configuration>
  <Networking>Disable</Networking>
  <MappedFolders>
    <MappedFolder>
      <HostFolder>C:\TestFiles</HostFolder>
      <ReadOnly>true</ReadOnly>
    </MappedFolder>
  </MappedFolders>
</Configuration>
```

Save as `sandbox.wsb` → double-click to launch with these settings.

**Key options:**

| Setting | Values | Description |
|---------|--------|-------------|
| `Networking` | Enable/Disable | Internet access |
| `ReadOnly` | true/false | Read-only shared folder |
| `MemoryInMB` | 2048 | RAM allocation |

---

## Practical Use Cases

- **Test suspicious .exe** — run inside, close after
- **Test installers** — see what they install before committing
- **Browse suspicious sites** — Edge in Sandbox
- **Test PowerShell scripts** — isolated execution

---

## If You Don't Have Windows Pro

Sandbox isn't available on Windows Home. Alternatives:
- **VirtualBox** — free VM, needs a separate Windows ISO
- **Any.run** — online sandbox for file analysis (free tier available)
- **VirusTotal** — scan a file with 70+ antivirus engines

## Security Notes

Clipboard sharing is enabled by default — be careful copying sensitive data between host and Sandbox.

Malware could theoretically escape Sandbox via a VM escape exploit, but this is extremely rare and requires a sophisticated zero-day. For typical consumer malware, Sandbox is safe.

---

## Troubleshooting

### Sandbox not in Start Menu
```powershell
Get-WindowsEdition -Online  # Must be Pro/Enterprise/Education
```

### "Hypervisor is not running"
```powershell
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
```

---

## Summary

| Task | Solution |
|------|---------|
| Enable | optionalfeatures → Windows Sandbox |
| Launch | Start → Windows Sandbox |
| Transfer file | Drag & drop or Ctrl+C/V |
| No internet | .wsb: `<Networking>Disable</Networking>` |
| Shared folder | .wsb: MappedFolders |
| Clean up | Just close the window |
