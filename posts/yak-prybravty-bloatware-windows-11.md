---
title: "Як видалити непотрібні програми і bloatware з Windows 11"
date: "2026-06-15"
publishDate: "2026-06-15"
description: "Видалення bloatware і попередньо встановлених програм з Windows 11: через Параметри, PowerShell, Winget і спеціальні утиліти. Що безпечно видалити а що залишити."
tags: ["windows", "оптимізація", "очищення", "продуктивність", "powershell"]
readTime: 6
---

Windows 11 поставляється з десятками попередньо встановлених програм які більшість людей ніколи не використовує. Вони займають місце, сповільнюють запуск і показують рекламу.

---

## Що безпечно видалити

**Ігри та розваги:**
- Microsoft Solitaire Collection
- Xbox, Xbox Game Bar (якщо не граєш)
- Candy Crush, TikTok та інші ігри від сторонніх

**Офісні та продуктивність:**
- Microsoft Teams (якщо не використовуєш)
- OneNote (якщо є Office з повним OneNote)
- Skype

**Медіа:**
- Groove Music → замінюй на Spotify або VLC
- Films & TV (кіно і ТБ)

**Інше:**
- News (Новини Microsoft)
- Weather (Погода) — якщо є телефон
- Maps (Карти)
- Mixed Reality Portal
- People (Люди)
- Your Phone / Phone Link (якщо не потрібна інтеграція з Android)

**Що НЕ видаляти:**
- Microsoft Edge (системний компонент)
- Cortana — видалення може зламати деякі функції
- Windows Security (антивірус)
- Диспетчер пристроїв, Засоби адміністрування

---

## Спосіб 1: Через Параметри

`Пуск` → `Параметри` → `Програми` → `Встановлені програми`

Знайди програму → клікни `...` → **Видалити**

Мінус: не всі вбудовані програми видаляються звідси.

---

## Спосіб 2: Через PowerShell — видалення системних пакетів

Відкрий **PowerShell від адміністратора**:

```powershell
# Переглянути всі встановлені AppX пакети
Get-AppxPackage | Select-Object Name, PackageFullName | Sort-Object Name

# Видалити конкретну програму (приклад — Solitaire)
Get-AppxPackage *MicrosoftSolitaireCollection* | Remove-AppxPackage

# Видалити для всіх користувачів
Get-AppxPackage -AllUsers *MicrosoftSolitaireCollection* | Remove-AppxPackage -AllUsers

# Видалити пакет щоб він не встановлювався новим користувачам
Get-AppxProvisionedPackage -Online |
  Where-Object { $_.PackageName -like "*Solitaire*" } |
  Remove-AppxProvisionedPackage -Online
```

### Масове видалення bloatware одним скриптом

```powershell
$bloatware = @(
    "*MicrosoftSolitaireCollection*"
    "*BingNews*"
    "*BingWeather*"
    "*BingFinance*"
    "*BingSports*"
    "*XboxApp*"
    "*XboxGameOverlay*"
    "*XboxGamingOverlay*"
    "*XboxSpeechToTextOverlay*"
    "*XboxIdentityProvider*"
    "*Getstarted*"
    "*SkypeApp*"
    "*MixedReality*"
    "*People*"
    "*Messaging*"
    "*3DViewer*"
    "*OneConnect*"
    "*WindowsFeedbackHub*"
    "*ZuneMusic*"
    "*ZuneVideo*"
)

foreach ($app in $bloatware) {
    $pkg = Get-AppxPackage $app -ErrorAction SilentlyContinue
    if ($pkg) {
        Write-Output "Видаляю: $($pkg.Name)"
        Remove-AppxPackage $pkg -ErrorAction SilentlyContinue
    }
}
Write-Output "Готово"
```

---

## Спосіб 3: Winget — сучасний менеджер пакетів

```powershell
# Список всіх встановлених програм
winget list

# Видалити програму
winget uninstall "Microsoft Teams"
winget uninstall "Cortana"
winget uninstall "Xbox"

# Пошук програми
winget search "solitaire"
```

---

## Спосіб 4: Утиліта Chris Titus Tech WinUtil

Популярний безкоштовний інструмент з відкритим кодом для комплексного очищення Windows.

Відкрий **PowerShell від адміністратора**:

```powershell
irm christitus.com/win | iex
```

З'явиться графічний інтерфейс де можна:
- Видалити bloatware галочками
- Вимкнути телеметрію
- Встановити корисні програми
- Оптимізувати налаштування

> Перед запуском будь-якого скрипту з інтернету — перевір його репутацію. Chris Titus WinUtil відкритий на GitHub і широко перевірений спільнотою.

---

## Вимкнути рекламу в меню Пуск

Окремо від програм — вимкни рекомендовані (рекламні) матеріали:

`Параметри` → `Персоналізація` → `Пуск`:
- Вимкни **Показувати рекомендовані файли**
- Вимкни **Показувати нещодавно додані програми**

`Параметри` → `Конфіденційність і безпека` → `Загальне`:
- Вимкни **Показувати рекомендований вміст у Параметрах**

---

## Відновити видалену програму

Якщо видалив потрібне — більшість програм можна відновити через Microsoft Store або командою:

```powershell
# Відновити всі вбудовані програми для поточного користувача
Get-AppxPackage -AllUsers |
  Where-Object { $_.NonRemovable -eq $false } |
  ForEach-Object { Add-AppxPackage -RegisterByFamilyName -MainPackage $_.PackageFamilyName -ErrorAction SilentlyContinue }
```

Або перевстанови конкретну програму через Microsoft Store.

---

## Підсумок

Для швидкого очищення — PowerShell скрипт з масовим видаленням bloatware. Для комплексної оптимізації — Chris Titus WinUtil. Після видалення непотрібних програм Windows запускається швидше і менше відволікає рекламою.
