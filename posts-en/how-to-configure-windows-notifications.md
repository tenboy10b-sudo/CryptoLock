---
title: "How to Manage Windows Notifications: Disable, Customize and Focus Assist"
date: "2026-05-03"
publishDate: "2026-05-03"
description: "Manage Windows 10 and 11 notifications: disable specific app alerts, configure Focus Assist (Do Not Disturb), customize notification banners and clear notification history."
tags: ["windows", "notifications", "productivity", "personalization", "optimization"]
readTime: 4
---

Windows notifications can be distracting when poorly configured. Here's how to take full control.

---

## Disable All Notifications

`Win + I` → **System** → **Notifications** → toggle **Notifications** off

Or keep them on but configure per-app (more useful).

---

## Configure Per-App Notifications

`Win + I` → **System** → **Notifications** → scroll down to app list

For each app you can:
- Turn off completely
- Disable notification banners (still go to Notification Center)
- Disable notification sounds
- Set priority (Top / High / Normal)

---

## Focus Assist (Do Not Disturb)

**Windows 11:** `Win + I` → **System** → **Focus** → **Start focus session**

**Windows 10:** `Win + I` → **System** → **Focus Assist**

Modes:
- **Off** — all notifications
- **Priority only** — only selected apps
- **Alarms only** — only alarms

```powershell
# Enable Focus Assist via registry
Set-ItemProperty "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\CloudStore\Store\DefaultAccount\Current\default$windows.data.notifications.quiethourssettings\windows.data.notifications.quiethourssettings" `
  -Name "Data" -Value ([byte[]](0x02,0x00,0x00,0x00)) -Type Binary -EA 0
```

---

## Auto Focus Assist Rules

`Win + I` → **System** → **Focus Assist** → **Automatic rules**

- **During these times** — set schedule
- **When duplicating display** — auto-enable during presentations
- **When playing a game** — no interruptions during gaming
- **When using an app in full screen mode**

---

## Configure Notification Banners

```powershell
# Disable all notification banners but keep in Action Center
Set-ItemProperty "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\PushNotifications" `
  -Name "ToastEnabled" -Value 0 -Type DWord

# Re-enable
Set-ItemProperty "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\PushNotifications" `
  -Name "ToastEnabled" -Value 1 -Type DWord
```

---

## Clear Notification History

```powershell
# Clear all notification history
Remove-Item "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Notifications\Settings" `
  -Recurse -Force -EA 0
```

Or: Click notification bell in taskbar → click **X** on each notification or **Clear all**

---

## Disable Notifications for Specific Apps via GPO

`gpedit.msc` → `User Configuration` → `Administrative Templates` → `Start Menu and Taskbar` → `Notifications`

- **Turn off toast notifications** — disable all toasts for all apps
- **Turn off toast notifications on the lock screen**

---

## Summary

Configure per-app in Settings → Notifications. Use Focus Assist for distraction-free work. Set automatic Focus rules for presentations and games. Disable `ToastEnabled` via registry to kill all banners while keeping Action Center.

## Frequently Asked Questions

### I disabled an app's notifications but they still appear — why?

Some system notifications bypass app settings. Check Windows Security Center and Action Center settings separately. Also check if the app has its own notification settings inside the app.

### Does Focus Assist block phone calls?

Only if you're using Your Phone / Phone Link app. Regular Windows Focus Assist only affects Windows notifications — not actual phone calls.

### How do I stop Windows from showing news and weather in the taskbar?

Right-click taskbar → **News and interests** → **Turn off**. Or: `Win + I` → Personalization → Taskbar → disable Widgets.
