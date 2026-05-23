---
title: "Winget: менеджер пакетів Windows для встановлення програм"
date: "2026-12-16"
publishDate: "2026-12-16"
description: "Як встановлювати, оновлювати і видаляти програми через winget в Windows 10 і 11. Один рядок замість завантаження інсталятора — найшвидший спосіб налаштувати Windows."
tags: ["windows", "інструменти", "powershell", "налаштування"]
readTime: 5
---

Winget — вбудований менеджер пакетів Windows. Замість того щоб заходити на сайт, завантажувати інсталятор і клікати «Далі-Далі» — просто пишеш одну команду.

---

## Перевірити чи встановлений winget

```powershell
winget --version
```

Winget вбудований у Windows 10 (1809+) і Windows 11. Якщо відсутній — оновіть **App Installer** в Microsoft Store.

---

## Встановити програму

```powershell
# За назвою
winget install "Google Chrome"
winget install "7-Zip"
winget install "VLC"

# За точним ID (надійніше)
winget install Google.Chrome
winget install 7zip.7zip
winget install VideoLAN.VLC

# Без питань (тихе встановлення)
winget install Mozilla.Firefox --silent
```

---

## Знайти програму

```powershell
winget search chrome
winget search "visual studio code"

# Детальна інформація
winget show 7zip.7zip
```

---

## Оновити програми

```powershell
# Список програм з доступними оновленнями
winget upgrade

# Оновити конкретну програму
winget upgrade Google.Chrome

# Оновити все одразу
winget upgrade --all --silent
```

---

## Видалити програму

```powershell
winget uninstall Mozilla.Firefox

# Список встановлених програм
winget list
```

---

## Зберегти і відновити список програм

Ідеально для налаштування нового ПК:

```powershell
# Зберегти список поточних програм
winget export -o C:\my-apps.json

# На новому ПК — встановити все одним рядком
winget import -i C:\my-apps.json --ignore-unavailable
```

---

## Корисні програми через winget

```powershell
# Продуктивність
winget install Microsoft.PowerToys
winget install voidtools.Everything
winget install Microsoft.WindowsTerminal

# Безпека
winget install Bitwarden.Bitwarden
winget install KeePassXCTeam.KeePassXC

# Медіа і файли
winget install VideoLAN.VLC
winget install 7zip.7zip
winget install Rufus.Rufus

# Для розробників
winget install Microsoft.VisualStudioCode
winget install Git.Git
winget install Microsoft.PowerShell
```

---

## Скрипт налаштування нового ПК

```powershell
# setup.ps1 — запустити на свіжому Windows
$apps = @(
  "Microsoft.WindowsTerminal", "Microsoft.PowerShell",
  "Microsoft.VisualStudioCode", "Git.Git",
  "7zip.7zip", "VideoLAN.VLC",
  "voidtools.Everything", "Microsoft.PowerToys",
  "Bitwarden.Bitwarden", "Mozilla.Firefox"
)

foreach ($app in $apps) {
  winget install $app --silent --accept-source-agreements --accept-package-agreements
  Write-Host "✅ $app" -ForegroundColor Green
}
```

Зберегти як `setup.ps1` і запустити на будь-якому новому ПК — всі програми встановляться автоматично.

---

## Резюме

`winget install Назва` — встановити. `winget upgrade --all` — оновити все. `winget export` — зберегти список. Winget вже є на твоєму ПК — нічого не треба встановлювати. Для пошуку PowerShell і CMD команд — [PowerShell довідник](/tools/powershell-commands).
