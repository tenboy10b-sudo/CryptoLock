---
title: "Як налаштувати автоматичний вхід в Windows без пароля"
date: "2026-04-02"
description: "Налаштування автоматичного входу в Windows 10 і 11 через netplwiz, реєстр і через GPO. Коли це доречно і як зберегти безпеку."
tags: ["windows", "облікові-записи", "налаштування", "безпека"]
readTime: 4
---

Автоматичний вхід без пароля зручний для домашнього ПК якого ніхто крім тебе не використовує. Ось як налаштувати правильно.

## Спосіб 1: Через netplwiz (найпростіший)

`Win + R` → `netplwiz` → Enter.

У вікні "User Accounts" знайди свій обліковий запис → **зніми галочку** з "Users must enter a user name and password to use this computer" → Apply.

З'явиться вікно → введи пароль двічі → OK.

> Якщо галочки немає — дивись наступний спосіб.

---

## Спосіб 2: Через реєстр

```cmd
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v AutoAdminLogon /t REG_SZ /d "1" /f
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultUserName /t REG_SZ /d "ТвоєІм'яКористувача" /f
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultPassword /t REG_SZ /d "ТвійПароль" /f
```

> Увага: пароль зберігається у відкритому вигляді в реєстрі. Не використовуй для ПК з важливими даними.

---

## Спосіб 3: Через Sysinternals Autologon

Microsoft випустила безкоштовну утиліту Autologon яка шифрує пароль в реєстрі.

1. Завантаж з learn.microsoft.com/sysinternals/downloads/autologon
2. Запусти → введи ім'я користувача і пароль → Enable
3. Пароль зберігається зашифрованим — безпечніше ніж через реєстр вручну

---

## Скасувати автовхід

```cmd
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v AutoAdminLogon /t REG_SZ /d "0" /f
reg delete "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultPassword /f
```

Або в netplwiz — повернути галочку.

---

## Автовхід при перезапуску після оновлень

Іноді потрібно щоб ПК після перезавантаження через Windows Update автоматично війшов і продовжив роботу (наприклад для серверів чи kiosk-режиму).

Через GPO:
`gpedit.msc`:
```
Computer Configuration
  → Windows Settings
    → Security Settings
      → Local Policies
        → Security Options
```

**Interactive logon: Do not require CTRL+ALT+DEL** → **Enabled**.

---

## Альтернатива: PIN замість пароля

Якщо головна проблема в тому що пароль довгий і незручно вводити — встанови PIN:

`Win + I` → **Accounts** → **Sign-in options** → **PIN (Windows Hello)** → **Add**.

PIN простіший для введення і при цьому безпечний (прив'язаний до конкретного пристрою).

> Також дивись: [Як створити обліковий запис адміністратора через командний рядок](/stvorenny-admina-cherez-cmd)
