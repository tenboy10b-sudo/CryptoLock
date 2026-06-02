---
title: "Чорний екран після входу в Windows 10 і 11: як виправити"
date: "2026-06-06"
publishDate: "2026-06-06"
description: "Виправлення чорного екрану після входу в Windows. Робочий стіл не завантажується, курсор видно але іконок немає — перезапуск Explorer, виправлення драйверу GPU."
tags: ["windows", "чорний-екран", "помилки", "драйвери", "відновлення"]
readTime: 4
translatesEn: "how-to-fix-windows-black-screen-login"
---

Чорний екран після входу — Windows завантажується але робочий стіл не з'являється. Ось як виправити кожен варіант.

---

## Швидке виправлення: перезапустити Explorer

`Ctrl + Alt + Delete` → **Диспетчер завдань** → **Файл** → **Запустити нове завдання** → `explorer.exe`

```cmd
taskkill /f /im explorer.exe
start explorer.exe
```

---

## Виправити реєстровий запис Shell

```powershell
# Перевірити
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" |
  Select-Object Shell, Userinit

# Має бути: Shell = explorer.exe
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" `
  -Name "Shell" -Value "explorer.exe"
```

---

## Виправити драйвер GPU

Найчастіша причина — особливо після оновлення Windows:

```powershell
# Завантажитись у безпечний режим
bcdedit /set {current} safeboot minimal
Restart-Computer
```

У безпечному режимі видали драйвер через Диспетчер пристроїв → Відеоадаптери → Видалити.

---

## Перевірити на малваре

```powershell
# Малваре може замінити Explorer власним процесом
Get-ItemProperty "HKCU:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" -EA 0 |
  Select-Object Shell

# Видалити якщо є значення
Remove-ItemProperty "HKCU:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" -Name "Shell" -EA 0
```

---

## Відновлення через WinRE

3 невдалих завантаження → WinRE → **Автоматичне відновлення запуску**

---

## Часті питання

### Курсор видно але немає робочого столу?

Explorer.exe не запущений. Запусти через Диспетчер завдань. Якщо одразу падає — запусти SFC для відновлення системних файлів.

### Чорний екран тільки на зовнішньому моніторі?

Натисни `Win + P` для перемикання режимів дисплея. Перевір чи монітор встановлений як основний в Параметрах дисплея.

---

## Резюме

Спочатку перезапусти Explorer. Перевір реєстровий ключ Shell. Безпечний режим і видалення GPU драйвера. SFC+DISM з WinRE. Перевір малваре що замінює оболонку.
