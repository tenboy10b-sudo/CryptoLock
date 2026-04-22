---
title: "Як вимкнути UAC через GPO і реєстр в Windows"
date: "2026-04-02"
description: "Налаштування User Account Control через Group Policy і реєстр: вимкнення, зниження рівня або тихий режим для адміністраторів."
tags: ["uac", "gpo", "групова-політика", "безпека"]
readTime: 4
---

UAC (User Account Control) захищає від несанкціонованих змін системи, але іноді заважає корпоративним процесам. Ось як налаштувати його через GPO.

## Рівні UAC

| Рівень | Поведінка |
|---|---|
| Завжди сповіщати | Запит при будь-яких змінах |
| За замовчуванням | Запит тільки при зміні системних налаштувань |
| Не сповіщати при змінах програм | Тихий режим для програм |
| Вимкнути | Без запитів, без захисту |

---

## Через GPO

`gpedit.msc` → перейди:
```
Computer Configuration
  → Windows Settings
    → Security Settings
      → Local Policies
        → Security Options
```

Знайди ці параметри:

**User Account Control: Run all administrators in Admin Approval Mode**
→ `Disabled` повністю вимикає UAC.

**User Account Control: Behavior of the elevation prompt for administrators**
→ `Elevate without prompting` — адміни не бачать запит.

**User Account Control: Behavior of the elevation prompt for standard users**
→ `Automatically deny elevation requests` — звичайні користувачі не можуть підвищити права.

---

## Через реєстр

```cmd
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" /v EnableLUA /t REG_DWORD /d 0 /f
```

`0` = UAC вимкнений, `1` = увімкнений.

Тихий режим для адмінів (без запиту):
```cmd
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" /v ConsentPromptBehaviorAdmin /t REG_DWORD /d 0 /f
```

---

## Через Settings

`Win + S` → **UAC** → **Change User Account Control settings** → пересунь повзунок.

---

## Рекомендація щодо безпеки

Не вимикай UAC повністю — це значно знижує захист системи. Замість цього:

1. Налаштуй **Elevate without prompting** тільки для адміністраторів
2. Для звичайних користувачів залиш стандартний рівень
3. Якщо потрібно запустити конкретну програму без UAC — використай планувальник завдань з підвищеними правами

---

## Перевірка поточного рівня UAC

```powershell
(Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System").EnableLUA
```

`1` = UAC увімкнений, `0` = вимкнений.
