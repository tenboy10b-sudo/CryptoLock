---
title: "Налаштування UAC (контроль облікових записів) в Windows 10 і 11"
date: "2026-05-16"
publishDate: "2026-05-16"
description: "Налаштування User Account Control (UAC) в Windows. Рівні сповіщень, автоматичне підвищення прав для конкретних застосунків, керування через групові політики."
tags: ["windows", "uac", "безпека", "адміністрування", "powershell"]
readTime: 4
translatesEn: "how-to-configure-windows-user-account-control"
---

Запити UAC дратують, але це остання лінія захисту від несанкціонованих змін системи.

---

## Перевірити поточний рівень

```powershell
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" |
  Select-Object ConsentPromptBehaviorAdmin, EnableLUA
```

Значення `ConsentPromptBehaviorAdmin`: `5` = за замовчуванням, `2` = завжди, `0` = вимкнено.

---

## Змінити через GUI

`Win + R` → `UserAccountControlSettings` → пересуни повзунок.

---

## Змінити через PowerShell

```powershell
# За замовчуванням (рекомендовано)
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" `
  -Name "ConsentPromptBehaviorAdmin" -Value 5 -Type DWord

# Максимальна безпека
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" `
  -Name "ConsentPromptBehaviorAdmin" -Value 2 -Type DWord
```

---

## Запуск конкретного застосунку без UAC

Через Планувальник завдань — створи задачу з підвищеними правами:

```powershell
$action = New-ScheduledTaskAction -Execute "C:\Tools\MyApp.exe"
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -RunLevel Highest
Register-ScheduledTask -TaskName "RunMyAppElevated" `
  -Action $action -Principal $principal

# Запуск без запиту UAC
Start-ScheduledTask -TaskName "RunMyAppElevated"
```

---

## Часті питання

### Чи варто вимикати UAC щоб прибрати запити?

Ні. Без UAC малваре може тихо встановлювати драйвери і змінювати системні файли без будь-якого попередження.

### UAC запитує навіть для моїх власних застосунків?

Застосунок запитує підвищення через маніфест. Використовуй метод з Планувальником щоб запускати без запиту.

---

## Резюме

Стандартний UAC (рівень 5) — правильний баланс. `ConsentPromptBehaviorAdmin = 2` для максимальної безпеки. Ніколи не вимикай UAC повністю. Планувальник завдань для автопідвищення конкретних інструментів.
