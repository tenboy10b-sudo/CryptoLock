---
title: "How to Install Windows 11 Without TPM 2.0 (Bypass Requirements)"
date: "2026-05-15"
publishDate: "2026-05-15"
description: "Windows 11 requires TPM 2.0 and Secure Boot, but older PCs can bypass these requirements. Here are the official and unofficial methods to install Windows 11 on unsupported hardware."
tags: ["windows", "installation", "bios", "tools"]
readTime: 6
---

Windows 11 officially requires TPM 2.0, Secure Boot, and a supported CPU. Many capable PCs fail only because of TPM. Here's how to install it anyway — with an understanding of what you're giving up.

---

## Check What's Blocking You

Download and run the official **PC Health Check** app from Microsoft. It tells you exactly which requirements your PC fails.

Or check via PowerShell:

```powershell
# Check TPM
Get-Tpm

# Check Secure Boot
Confirm-SecureBootUEFI
```

If `TpmPresent: False` or `TpmReady: False` — your PC either has no TPM or it's disabled in BIOS.

---

## Method 1: Enable TPM in BIOS (Try This First)

Many PCs have TPM but it's disabled by default.

1. Restart → enter BIOS (`Del`, `F2`, or `F10` at startup)
2. Look for **TPM**, **PTT** (Intel Platform Trust Technology), or **fTPM** (AMD firmware TPM)
3. Enable it → save and exit

After enabling, run PC Health Check again. If it now passes — install Windows 11 normally.

---

## Method 2: Registry Bypass (Microsoft's Own Workaround)

Microsoft documented this bypass for organizations. It skips TPM and RAM checks but still requires Secure Boot and a supported CPU.

```cmd
reg add "HKLM\SYSTEM\Setup\MoSetup" /v AllowUpgradesWithUnsupportedTPMOrCPU /t REG_DWORD /d 1 /f
```

Then run the Windows 11 installer normally. This works for upgrades from Windows 10.

---

## Method 3: Rufus (Clean Install, Full Bypass)

**Rufus** is a free tool that creates installation USB drives with the TPM requirement removed.

1. Download [Rufus](https://rufus.ie) (free, no install needed)
2. Plug in a USB drive (8GB+)
3. In Rufus: select your Windows 11 ISO → under **Image option** select **Extended Windows 11 Installation (no TPM / no Secure Boot)**
4. Click **Start**

Boot from the USB and install Windows 11 — no TPM, no Secure Boot check.

---

## Method 4: appraiserres.dll Removal (During In-Place Upgrade)

For upgrading without using Rufus:

1. Mount the Windows 11 ISO (double-click in Windows Explorer)
2. Copy the entire ISO contents to a folder on your PC
3. Delete or rename `sources\appraiserres.dll`
4. Run `setup.exe` from that folder

The installer skips hardware compatibility checks.

---

## What You Lose on Unsupported Hardware

Microsoft is clear about this: PCs that bypass requirements may not receive future Windows 11 updates — including security patches. Currently updates still work, but Microsoft reserves the right to stop them.

You also won't get support from Microsoft if something goes wrong.

Practically speaking: most people bypass these requirements without issues. But be aware of the tradeoff.

---

## Should You Do This?

**Yes, if:**
- Your PC is fast enough (runs Windows 10 well)
- You have no TPM but everything else is fine
- You want to avoid buying new hardware just for an OS requirement

**No, if:**
- Your PC is slow on Windows 10 already
- You're in a business or corporate environment
- Security updates stopping matters to you

---

## Check TPM Status After Installing

```powershell
Get-Tpm | Select-Object TpmPresent, TpmReady, TpmEnabled
```

If you bypassed TPM, this will still show your TPM status — if TPM is present but was disabled in BIOS, you can enable it later without reinstalling.

---

## Summary

Try enabling TPM/fTPM in BIOS first — many PCs already have it disabled. If that fails: use Rufus with the extended Windows 11 option for a clean install, or the registry tweak for an upgrade. Be aware that Microsoft may restrict updates on unsupported hardware in the future.
