---
title: "Налаштування проксі в Windows 10 і 11 через PowerShell і реєстр"
date: "2026-06-13"
publishDate: "2026-06-13"
description: "Налаштування проксі в Windows системно, для WinHTTP і окремих застосунків. PAC файл, аутентифікований проксі і виправлення проблем підключення."
tags: ["windows", "проксі", "мережа", "адміністрування", "powershell"]
readTime: 4
translatesEn: "how-to-configure-windows-proxy-settings"
---

Налаштування проксі Windows контролюють як трафік маршрутизується через проксі сервер.

---

## Налаштування через Параметри

`Win + I` → **Мережа та Інтернет** → **Проксі** → **Ручне налаштування**

---

## Через PowerShell (WinINET)

```powershell
$proxy = "http://proxy.company.com:8080"

Set-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings" `
  -Name "ProxyEnable" -Value 1 -Type DWord
Set-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings" `
  -Name "ProxyServer" -Value $proxy
```

---

## WinHTTP (системні служби)

WinHTTP використовується Windows Update і системними службами — окремо від WinINET:

```powershell
# Встановити
netsh winhttp set proxy "proxy.company.com:8080"

# Імпортувати з WinINET
netsh winhttp import proxy ie

# Перевірити
netsh winhttp show proxy

# Скинути
netsh winhttp reset proxy
```

---

## Вимкнути проксі

```powershell
Set-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings" `
  -Name "ProxyEnable" -Value 0 -Type DWord

netsh winhttp reset proxy
```

---

## Часті питання

### Проксі увімкнений але застосунки ігнорують його?

Багато сучасних застосунків (Chrome, Slack) мають власні налаштування проксі окремо від Windows. Налаштуй в кожному застосунку або використовуй WinHTTP.

### Windows Update не працює за проксі?

```powershell
netsh winhttp import proxy ie
```
Копіює IE/WinINET налаштування в WinHTTP який використовує Windows Update.

---

## Резюме

Системний проксі через Параметри або реєстр. WinHTTP через `netsh winhttp` — для Windows Update. Per-app через `[System.Net.WebRequest]::DefaultWebProxy`. При діагностиці перевіряй обидва рівні: WinINET і WinHTTP.
