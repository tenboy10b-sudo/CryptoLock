---
title: "Реєстр Windows: редагування, резервна копія і відновлення"
date: "2026-05-22"
publishDate: "2026-05-22"
description: "Як безпечно редагувати реєстр Windows через regedit і PowerShell. Створювати, змінювати і видаляти ключі, робити резервну копію перед змінами."
tags: ["windows", "реєстр", "адміністрування", "powershell", "безпека"]
readTime: 4
translatesEn: "how-to-configure-remote-registry-windows"
---

Реєстр Windows зберігає системні налаштування і конфігурацію програм. Редагування без резервної копії може зламати Windows.

---

## Відкрити редактор реєстру

```
Win + R → regedit
```

---

## Структура реєстру

```
HKEY_LOCAL_MACHINE (HKLM)  ← системні налаштування
HKEY_CURRENT_USER (HKCU)   ← налаштування поточного користувача
HKEY_CLASSES_ROOT (HKCR)   ← асоціації файлів
```

---

## Резервна копія перед редагуванням

```powershell
# Експортувати ключ
reg export "HKCU\Software\Microsoft\Windows" "C:\Backup\key.reg"

# Весь HKCU
reg export HKCU "C:\Backup\hkcu.reg"
```

---

## Читати значення реєстру

```powershell
# Отримати значення
(Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion").ProductName

# Перевірити чи існує ключ
Test-Path "HKCU:\Software\MyApp"
```

---

## Створити і змінити ключ

```powershell
# Новий ключ
New-Item -Path "HKCU:\Software\MyApp" -Force

# Нове значення
New-ItemProperty "HKCU:\Software\MyApp" -Name "Setting" -Value "Enabled" -PropertyType String

# Змінити значення
Set-ItemProperty "HKCU:\Software\MyApp" -Name "Setting" -Value "Disabled"

# DWORD значення
New-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\Windows" `
  -Name "AllowCortana" -Value 0 -PropertyType DWord -Force
```

---

## Видалити ключ

```powershell
Remove-ItemProperty "HKCU:\Software\MyApp" -Name "OldSetting"
Remove-Item "HKCU:\Software\MyApp" -Recurse -Force
```

---

## Відновити резервну копію

Двічі клікни на `.reg` файл → Дозволити → Так

Або через CMD:
```cmd
reg import "C:\Backup\key.reg"
```

---

## Часті питання

### Чи небезпечно редагувати реєстр?

Серйозні помилки (видалення критичних ключів) можуть зупинити завантаження Windows. Завжди роби резервну копію. Безпечний режим і Відновлення системи допоможуть відкотитись.

### Чи безпечні програми для очищення реєстру?

Ні. Microsoft не рекомендує їх. Вони рідко покращують продуктивність і можуть видалити потрібні ключі.

---

## Резюме

Завжди роби `reg export` перед змінами. PowerShell `Get-ItemProperty` / `Set-ItemProperty` для скриптів. Відновлення: `reg import` або подвійний клік на `.reg` файл.
