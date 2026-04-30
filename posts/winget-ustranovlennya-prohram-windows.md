---
title: "Winget: встановлення і оновлення програм через командний рядок Windows"
date: "2026-08-29"
publishDate: "2026-08-29"
description: "Winget — вбудований менеджер пакетів Windows. Як встановлювати, оновлювати і видаляти програми через термінал, масова установка і автоматизація."
tags: ["windows", "інструменти", "cmd", "powershell", "автоматизація"]
readTime: 5
---

Winget — офіційний менеджер пакетів Microsoft що з'явився в Windows 10/11. Дозволяє встановлювати програми однією командою як в Linux.

---

## Перевірити чи встановлений winget

```cmd
winget --version
```

Якщо не знайдено — встанови через Microsoft Store: **App Installer**.

---

## Основні команди

```cmd
rem Знайти програму
winget search chrome
winget search "visual studio code"

rem Встановити програму
winget install Google.Chrome
winget install Microsoft.VisualStudioCode
winget install 7zip.7zip

rem Встановити конкретну версію
winget install Python.Python.3 --version 3.11.0

rem Оновити одну програму
winget upgrade Microsoft.VisualStudioCode

rem Оновити всі програми
winget upgrade --all

rem Видалити програму
winget uninstall Google.Chrome

rem Список встановлених програм
winget list

rem Перевірити які програми можна оновити
winget upgrade
```

---

## Найпопулярніші програми через winget

```cmd
rem Браузери
winget install Google.Chrome
winget install Mozilla.Firefox
winget install Microsoft.Edge

rem Розробка
winget install Microsoft.VisualStudioCode
winget install Git.Git
winget install OpenJS.NodeJS.LTS
winget install Python.Python.3.12
winget install Docker.DockerDesktop
winget install JetBrains.IntelliJIDEA.Community

rem Утиліти
winget install 7zip.7zip
winget install Notepad++.Notepad++
winget install VideoLAN.VLC
winget install Bitwarden.Bitwarden
winget install Telegram.TelegramDesktop

rem Безпека
winget install Malwarebytes.Malwarebytes
winget install WireGuard.WireGuard

rem Адміністрування
winget install Microsoft.WindowsTerminal
winget install Microsoft.PowerShell
winget install WinSCP.WinSCP
winget install PuTTY.PuTTY
```

---

## Масова встановлення через файл

Збережи список програм у файл `packages.txt`:

```
Adobe.Acrobat.Reader.64-bit
7zip.7zip
Notepad++.Notepad++
VideoLAN.VLC
Google.Chrome
Bitwarden.Bitwarden
Microsoft.WindowsTerminal
Git.Git
Microsoft.VisualStudioCode
```

Встанови всі:

```powershell
Get-Content packages.txt | ForEach-Object {
    Write-Output "Встановлюю: $_"
    winget install $_ --silent --accept-package-agreements --accept-source-agreements
}
```

---

## Winget Export/Import — перенесення програм

```cmd
rem Зберегти список всіх встановлених програм у JSON
winget export -o packages.json

rem На новому ПК — встановити всі програми зі списку
winget import -i packages.json --accept-package-agreements
```

Зручно при переустановці Windows або налаштуванні нового ПК.

---

## Тихе встановлення (без UI)

```powershell
# Встановити без вікон і підтвердження
winget install Google.Chrome --silent --accept-package-agreements --accept-source-agreements

# Масово і тихо
$apps = @("7zip.7zip", "Notepad++.Notepad++", "VideoLAN.VLC")
foreach ($app in $apps) {
    winget install $app --silent --accept-package-agreements --accept-source-agreements
    Write-Output "✓ $app"
}
```

---

## Корпоративне розгортання через winget

```powershell
# Налаштувати winget через GPO або Intune скрипт
# Встановити необхідний корпоративний софт на всіх ПК
Invoke-Command -ComputerName (Get-ADComputer -Filter *).Name -ScriptBlock {
    winget install 7zip.7zip --silent --accept-package-agreements
    winget install Notepad++.Notepad++ --silent --accept-package-agreements
} -ErrorAction SilentlyContinue
```

---

## Підсумок

`winget search назва` → `winget install ID` — двокрокова установка будь-якої програми. `winget upgrade --all` — оновити все одразу. `winget export` і `winget import` — перенести набір програм на новий ПК за хвилину.
