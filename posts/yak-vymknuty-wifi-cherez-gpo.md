---
title: "Як вимкнути Wi-Fi через GPO в Windows"
date: "2026-04-02"
description: "Покроковий гайд як вимкнути Wi-Fi адаптер для всіх користувачів через Group Policy Editor (gpedit.msc) в Windows 10 і 11."
tags: ["wifi", "gpo", "групова-політика", "мережа"]
readTime: 4
---

Якщо потрібно заблокувати використання Wi-Fi на корпоративних ПК — групова політика дозволяє зробити це централізовано без фізичного втручання.

## Спосіб 1: Через Device Installation Policy

Цей метод забороняє Windows встановлювати Wi-Fi адаптер як пристрій.

**Крок 1.** `Win + R` → `gpedit.msc` → Enter.

**Крок 2.** Перейди:
```
Computer Configuration
  → Administrative Templates
    → System
      → Device Installation
        → Device Installation Restrictions
```

**Крок 3.** Відкрий **Prevent installation of devices that match any of these device IDs** → **Enabled**.

**Крок 4.** Натисни **Show** → додай Hardware ID Wi-Fi адаптера.

Щоб дізнатись Hardware ID: Device Manager → Wi-Fi адаптер → Properties → Details → **Hardware IDs** → скопіюй перший рядок.

---

## Спосіб 2: Заблокувати через Network Connections Policy

**Крок 1.** `gpedit.msc` → перейди:
```
User Configuration
  → Administrative Templates
    → Network
      → Network Connections
```

**Крок 2.** Увімкни ці політики:

| Політика | Дія |
|---|---|
| **Prohibit connecting and disconnecting a remote access connection** | Забороняє підключення |
| **Ability to rename LAN connections or remote access connections** | Прибирає доступ до налаштувань |
| **Prohibit access to properties of a LAN connection** | Блокує властивості |

---

## Спосіб 3: Вимкнути адаптер через реєстр

```cmd
reg add "HKLM\SYSTEM\CurrentControlSet\Services\WlanSvc" /v Start /t REG_DWORD /d 4 /f
```

Значення `4` = disabled. Щоб увімкнути назад — встанови `2`.

Або через PowerShell:
```powershell
Disable-NetAdapter -Name "Wi-Fi" -Confirm:$false
```

---

## Перевірка

Після перезавантаження перевір: `Win + I` → **Network & Internet** — перемикач Wi-Fi має бути недоступний або відсутній.

> Також дивись: [Як заборонити користувачу змінювати налаштування Wi-Fi](/zaborona-zminy-wifi-gpo)
