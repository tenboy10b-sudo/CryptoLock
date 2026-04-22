---
title: "Як налаштувати AppLocker в Windows через GPO"
date: "2025-04-30"
description: "Покрокове налаштування AppLocker для блокування несанкціонованих програм через Group Policy в Windows 10/11 Enterprise і Education."
tags: ["applocker", "gpo", "групова-політика", "безпека"]
readTime: 6
---

AppLocker — корпоративний рівень контролю додатків. Дозволяє точно вказати які програми можуть запускатись, а які заблоковані.

## Вимоги

AppLocker доступний тільки на **Windows Enterprise** і **Education**. На Pro — правила можна створити але вони не виконуються.

---

## Крок 1. Відкрий AppLocker в GPO

`gpedit.msc` → перейди:
```
Computer Configuration
  → Windows Settings
    → Security Settings
      → Application Control Policies
        → AppLocker
```

---

## Крок 2. Налаштуй виконання правил

Клікни правою кнопкою → **Properties** (або **Configure Rule Enforcement**).

Постав галочки для:
- **Executable rules** — блокує .exe файли
- **Windows Installer rules** — блокує .msi інсталятори
- **Script rules** — блокує .ps1, .bat, .cmd скрипти
- **Packaged app rules** — блокує UWP/Store програми

Для кожного вибери **Enforce rules** (не **Audit only** — це тільки логування).

---

## Крок 3. Створи базові правила за замовчуванням

Клікни правою кнопкою на **Executable Rules** → **Create Default Rules**.

Це створить три правила:
1. Всі файли в `C:\Windows\*` — дозволено для Everyone
2. Всі файли в `C:\Program Files\*` — дозволено для Everyone
3. Все — дозволено для Administrators

Без цих правил система може стати непрацездатною.

---

## Крок 4. Заблокуй конкретну програму

Правий клік на **Executable Rules** → **Create New Rule**.

- **Action:** Deny
- **User or group:** Everyone (або конкретна група)
- **Conditions:** Path → вкажи шлях: `C:\Users\*\Downloads\*.exe`

Це заблокує запуск будь-якого .exe з папки Завантаження — дуже ефективно проти шкідливих програм.

---

## Крок 5. Запусти службу AppID

AppLocker не працює без цієї служби:

```cmd
sc config AppIDSvc start= auto
sc start AppIDSvc
```

Або через Services: `services.msc` → **Application Identity** → Automatic → Start.

---

## Крок 6. Примусово застосуй GPO

```cmd
gpupdate /force
```

---

## Перевірка

Спробуй запустити заблокований файл — має з'явитись:
> **"This program is blocked by group policy. For more information, contact your system administrator."**

---

## Перегляд журналу блокувань

```powershell
Get-AppLockerFileInformation -EventLog -LogPath "Microsoft-Windows-AppLocker/EXE and DLL" -Statistics
```

Або через Event Viewer: **Applications and Services Logs → Microsoft → Windows → AppLocker**.

> Також дивись: [Як заборонити запуск програм через групову політику](/zaborona-zapusku-prohram-gpo)
