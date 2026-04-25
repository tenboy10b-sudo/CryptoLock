---
title: "Проксі-сервер в Windows: налаштування для браузера і всієї системи"
date: "2026-07-30"
publishDate: "2026-07-30"
description: "Налаштування проксі-сервера в Windows 10 і 11: для всієї системи через Параметри, для конкретного браузера, корпоративний PAC файл і проксі через реєстр."
tags: ["мережа", "windows", "налаштування", "безпека", "адміністрування"]
readTime: 5
---

Проксі-сервер потрібен для корпоративних мереж де весь трафік проходить через контрольований шлюз, або для обходу гео-обмежень. Ось як налаштувати.

---

## Налаштування проксі для всієї системи

`Параметри` → `Мережа і Інтернет` → **Проксі**:

### Ручне налаштування
- Увімкни **"Використовувати проксі-сервер"**
- **Адреса:** IP або hostname проксі (наприклад `proxy.company.com`)
- **Порт:** зазвичай 3128, 8080 або 8888
- **Не використовувати проксі для:** `localhost;127.0.0.1;*.company.local`

### Автоматичне виявлення (WPAD)
Увімкни **"Визначати налаштування автоматично"** — якщо в мережі є WPAD сервер, налаштування підтягнуться самостійно.

### PAC файл (Proxy Auto-Configuration)
- Увімкни **"Використовувати скрипт конфігурації"**
- Введи URL PAC файлу: `http://proxy.company.com/proxy.pac`

---

## Через реєстр і PowerShell

```powershell
# Встановити проксі через реєстр
$regPath = "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Internet Settings"

Set-ItemProperty $regPath -Name "ProxyEnable" -Value 1 -Type DWord
Set-ItemProperty $regPath -Name "ProxyServer" -Value "proxy.company.com:3128" -Type String
Set-ItemProperty $regPath -Name "ProxyOverride" -Value "localhost;127.0.0.1;*.company.local" -Type String

# Вимкнути проксі
Set-ItemProperty $regPath -Name "ProxyEnable" -Value 0 -Type DWord

# Переглянути поточні налаштування
Get-ItemProperty $regPath | Select-Object ProxyEnable, ProxyServer, ProxyOverride
```

---

## Через netsh

```cmd
rem Встановити проксі для WinHTTP (системний рівень, для служб і оновлень)
netsh winhttp set proxy proxy.company.com:3128

rem Переглянути поточний проксі WinHTTP
netsh winhttp show proxy

rem Скинути до прямого підключення
netsh winhttp reset proxy

rem Імпортувати налаштування з IE/Edge
netsh winhttp import proxy source=ie
```

---

## Проксі для конкретного браузера

### Chrome / Edge
Беруть налаштування із системи Windows — зміни через Параметри діють для них автоматично.

Або запусти з параметром:
```cmd
chrome.exe --proxy-server="http://proxy.company.com:3128"
```

### Firefox
Firefox має власні незалежні налаштування:

**Налаштування** → **Загальні** → прокрути вниз → **Параметри мережевого підключення** → **Вручну налаштувати проксі**.

---

## Проксі для CMD і PowerShell

За замовчуванням CMD і PowerShell не використовують системний проксі.

```powershell
# Встановити проксі для поточного сеансу PowerShell
$proxy = New-Object System.Net.WebProxy("http://proxy.company.com:3128")
$proxy.Credentials = [System.Net.CredentialCache]::DefaultCredentials
[System.Net.WebRequest]::DefaultWebProxy = $proxy

# Тепер Invoke-WebRequest буде йти через проксі
Invoke-WebRequest "https://google.com"
```

```cmd
rem Встановити проксі через змінну середовища (для деяких програм)
set HTTP_PROXY=http://proxy.company.com:3128
set HTTPS_PROXY=http://proxy.company.com:3128
set NO_PROXY=localhost,127.0.0.1,*.company.local
```

---

## Проксі з автентифікацією

Якщо проксі вимагає логін і пароль:

```
Адреса: proxy.company.com:3128
Або з автентифікацією в URL: http://username:password@proxy.company.com:3128
```

В Windows при першому підключенні через такий проксі — з'явиться вікно для введення credentials.

---

## Перевірити чи проксі працює

```powershell
# Перевірити підключення через проксі
$proxy = New-Object System.Net.WebProxy("http://proxy.company.com:3128")
$client = New-Object System.Net.WebClient
$client.Proxy = $proxy
$client.DownloadString("http://example.com") | Out-Null
Write-Output "Проксі працює"
```

```cmd
rem Через curl (якщо встановлений)
curl -x http://proxy.company.com:3128 http://example.com
```

---

## Корпоративний проксі через GPO

Для масового розгортання на всі ПК домену:

`gpedit.msc` → **User Configuration** → **Windows Settings** → **Internet Explorer Maintenance** → **Connection** → **Proxy Settings**

Або через Registry Preferences у GPO — застосувати реєстрові ключі з розділу вище на всіх ПК.

---

## Підсумок

Для системного проксі: `Параметри` → `Мережа` → `Проксі` → ручне налаштування. `netsh winhttp set proxy` — для системних служб і Windows Update. PowerShell `[System.Net.WebRequest]::DefaultWebProxy` — для скриптів. Firefox — налаштовується незалежно від системи.
