---
title: "Mouse or Keyboard Not Working in Windows: How to Fix"
date: "2026-03-28"
publishDate: "2026-03-28"
description: "Mouse or keyboard stopped working in Windows? Step-by-step fixes for USB and wireless devices: driver reset, USB power management, PS/2 fallback, and recovery without a working keyboard."
tags: ["windows", "troubleshooting", "hardware", "drivers"]
readTime: 5
---

A dead mouse or keyboard ranges from annoying to completely blocking — you can't even log in. Here's how to fix both, including how to operate Windows with no working input device.

---

## Check the Obvious First

- Try a different USB port — prefer ports directly on the motherboard, not a hub
- For wireless devices: check battery, re-pair receiver (unplug USB receiver → wait 10 seconds → replug)
- Try the device on another PC to confirm it's not hardware failure
- For Bluetooth devices: pair again from Windows Settings

---

## Fix Without Any Input Device

If your keyboard or mouse completely stops working, use these Windows accessibility features:

**On-screen keyboard:** `Win + Ctrl + O` or: sign-in screen → **Accessibility** icon → **On-screen keyboard**

**Mouse keys (control cursor with numpad):**
`Win + U` (Ease of Access) → **Mouse** → **Control your mouse with a keypad** → On

**Narrator (voice commands):** `Ctrl + Win + Enter`

---

## Fix 1: Restart Device via Device Manager

`Win + X` → **Device Manager** → expand **Mice and other pointing devices** (or **Keyboards**)

Right-click the device → **Disable device** → wait 5 seconds → right-click → **Enable device**

If it shows a yellow warning icon:
Right-click → **Update driver** → **Search automatically**

---

## Fix 2: Uninstall and Reinstall Driver

Right-click the device in Device Manager → **Uninstall device** → **Uninstall** (don't check delete driver) → unplug the device → replug

Windows reinstalls the driver automatically.

If that fails: right-click → **Uninstall** → check **Delete the driver software** → restart PC → replug device.

---

## Fix 3: Disable USB Selective Suspend

Windows may power off USB ports to save energy — cutting power to the device:

`Win + R` → `powercfg.cpl` → **Change plan settings** → **Change advanced power settings** → **USB settings** → **USB selective suspend setting** → **Disabled**

Or per-device:
Device Manager → **Universal Serial Bus controllers** → right-click **USB Root Hub** → **Properties** → **Power Management** → uncheck **Allow the computer to turn off this device**

---

## Fix 4: Keyboard Not Working at Login Screen

If keyboard works in BIOS but not at Windows login:

**Cause:** USB drivers not loaded early enough.

**Fix:** Enable USB Legacy Support in BIOS (look for "USB Legacy" or "USB Keyboard Support" in BIOS settings → Enable)

---

## Fix 5: Mouse Pointer Freezes Randomly

Usually caused by power management or a driver conflict:

```powershell
# Check for driver errors
Get-WinEvent -FilterHashtable @{LogName='System'; Level=2} -MaxEvents 20 |
  Where-Object {$_.Message -like "*HID*" -or $_.Message -like "*mouse*"} |
  Select-Object TimeCreated, Message
```

Also check: Device Manager → right-click mouse → Properties → **Power Management** → uncheck **Allow the computer to turn off this device**

---

## Fix 6: Wireless Mouse Disconnects

For 2.4 GHz wireless mice (USB dongle):

- Move receiver closer to mouse — maximum range is ~10 meters but walls reduce it
- Keep receiver away from USB 3.0 ports — USB 3.0 emits interference at 2.4 GHz
- Replace batteries even if indicator shows them as OK
- Reposition to a different USB port on the other side of the PC

---

## Fix 7: SFC Scan for Corrupted Drivers

```powershell
sfc /scannow
```

Corrupted HID (Human Interface Device) drivers cause intermittent failures.

---

## Fix 8: Check for Windows Update Breaking Input

```powershell
# List recent updates
Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 10 HotFixID, Description, InstalledOn
```

If input stopped working after a recent update: uninstall it via `Win + I` → **Windows Update** → **Update history** → **Uninstall updates**

---

## Keyboard-Only Navigation Tips

If mouse isn't working:

- `Tab` / `Shift + Tab` — move between controls
- `Enter` — confirm / click button
- `Space` — toggle checkbox
- `Alt + F4` — close window
- `Win + X` then arrow keys — navigate System menu
- `Alt + Tab` — switch apps
- `F10` — activate menu bar in most apps

---


---

## 🔍 Не знаєш що означає код помилки Windows?

Якщо Windows показує код на кшталт `0x80070005`, `0x80070002` або `0xC000021A` — скористайся безкоштовним інструментом:

**[→ Декодер помилок Windows](/tools/windows-error-decoder)** — введи код і одразу дізнайся що він означає та як виправити.


## Summary

Try a different USB port first. If still dead: Device Manager → disable → enable. For power-related freezing: disable USB selective suspend. For login screen failures: enable USB Legacy in BIOS. For wireless: move receiver away from USB 3.0 ports and replace batteries.
