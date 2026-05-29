---
title: "How to Use Windows Clipboard History and Cloud Clipboard"
date: "2026-03-15"
publishDate: "2026-03-15"
description: "Windows Clipboard History lets you access the last 25 items you copied. Enable it, use keyboard shortcuts, pin frequently used snippets, and sync across devices with Cloud Clipboard."
tags: ["windows", "productivity", "tools", "settings"]
readTime: 4
---

Copy something, then copy something else, and the first thing is gone forever — unless you enable Clipboard History. It keeps your last 25 copied items accessible instantly.

---

## Enable Clipboard History

`Win + I` → **System** → **Clipboard** → turn on **Clipboard history**

Or press `Win + V` — if not enabled, Windows will offer to turn it on.

---

## Use Clipboard History

Press `Win + V` to open the clipboard panel — shows the last 25 copied items: text, images, and HTML.

Click any item to paste it. The panel stays open so you can paste multiple items.

**Keyboard navigation:**
- `Win + V` → open panel
- Arrow keys → navigate items
- `Enter` → paste selected item
- `Del` → delete item from history

---

## Pin Frequently Used Items

In the `Win + V` panel, click the pin icon on any item — it stays in history permanently and won't be pushed out by new copies.

Useful for: code snippets, email signatures, frequently used addresses, boilerplate text.

---

## Clear Clipboard History

```powershell
# Clear all clipboard history
Clear-Clipboard

# Or via the Win+V panel: click the three dots → "Clear all"
```

Individual items: in the panel, click **...** next to any item → **Delete**

---

## Cloud Clipboard (Sync Across Devices)

Cloud Clipboard syncs your clipboard between Windows PCs signed into the same Microsoft account.

`Win + I` → **System** → **Clipboard** → **Sync across devices** → turn on

Only pinned items and manually chosen items sync — your full history stays local.

To use a synced item on another PC: press `Win + V` — synced items appear with a cloud icon.

---

## Clipboard History via PowerShell

```powershell
# Get current clipboard content
Get-Clipboard

# Set clipboard content
Set-Clipboard -Value "Text to copy"

# Get clipboard as file list (if files are copied)
Get-Clipboard -Format FileDropList

# Clear clipboard
Set-Clipboard -Value $null
```

---

## Third-Party Clipboard Managers

The built-in history is limited to 25 items with no search. For power users:

**Ditto** — free, open source, unlimited history, full-text search, network sync. From [ditto-cp.sourceforge.io](https://ditto-cp.sourceforge.io)

**CopyQ** — free, cross-platform, scripting support, custom actions.

Both work alongside Windows Clipboard History without conflicts.

---


---

## ⚡ Шукаєш потрібну команду?

**[→ PowerShell і CMD довідник](/tools/powershell-commands)** — 40+ команд з пошуком за задачею. Введи "мережа", "диск" або "безпека" і одразу отримай готову команду.


## Summary

`Win + V` enables and opens clipboard history. Pin items you use frequently. Enable Cloud Clipboard in Settings to sync pinned items across PCs. For more than 25 items or search functionality, add Ditto or CopyQ alongside the built-in feature.
