---
title: "Windows для дослідника безпеки: інструменти і налаштування"
date: "2026-08-13"
publishDate: "2026-08-13"
description: "Налаштування Windows для аналізу безпеки і пентестингу: Sysinternals Suite, Wireshark, Process Monitor, корисні інструменти і безпечне середовище для дослідження."
tags: ["безпека", "windows", "інструменти", "моніторинг", "адміністрування"]
readTime: 7
---

Аналіз підозрілих файлів, моніторинг системних подій, дослідження мережевого трафіку — ці задачі вимагають правильно підібраного набору інструментів.

---

## Sysinternals Suite — базовий набір

Безкоштовний набір від Microsoft для глибокого аналізу Windows. Завантаж з **learn.microsoft.com/sysinternals**.

### Autoruns — що запускається автоматично

Найповніший список всього що запускається: реєстр, планувальник, служби, драйвери, браузерні розширення.

```cmd
autoruns.exe
```

Корисно: **Options → Scan Options → Check VirusTotal.com** — перевіряє всі записи через VirusTotal.

### Process Monitor (procmon) — журнал всіх операцій

Записує в реальному часі: звернення до файлів, реєстру, мережі.

```cmd
procmon.exe
```

Фільтр для конкретного процесу: **Filter → Process Name → Is → chrome.exe → Add**.

### Process Explorer — детальний диспетчер задач

Показує дерево процесів, DLL що завантажені, мережеві підключення процесу.

```cmd
procexp.exe
```

**Options → Check VirusTotal.com** — перевірка хешів процесів.

### TCPView — мережеві підключення в реальному часі

```cmd
tcpview.exe
```

Показує всі TCP/UDP підключення з прив'язкою до процесу. Краще за `netstat` для швидкого аналізу.

---

## Wireshark — аналіз мережевих пакетів

Встановлення:
```powershell
winget install WiresharkFoundation.Wireshark
```

Корисні фільтри для аналізу безпеки:

```
# DNS запити
dns

# HTTP трафік (незашифрований)
http

# Підозрілі великі пакети назовні
ip.dst != 192.168.0.0/16 and frame.len > 1000

# Пошук конкретних рядків
frame contains "password"
frame contains "login"

# Трафік до конкретного IP
ip.addr == 185.220.101.0
```

---

## HxD — шестнадцятковий редактор

Для аналізу бінарних файлів і дампів пам'яті.

```powershell
winget install MiroKaku.HexEditor
```

Або безкоштовний **HxD** з mh-nexus.de.

---

## Strings — пошук рядків у виконуваних файлах

```powershell
# З Sysinternals
strings.exe suspicious.exe

# Знайти URL у файлі
strings.exe malware.exe | Select-String "http"

# Знайти IP адреси
strings.exe malware.exe | Select-String "\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}"
```

---

## PowerShell для аналізу

```powershell
# Хеш файлу для перевірки на VirusTotal
Get-FileHash "C:\suspicious.exe" -Algorithm SHA256

# Дата компіляції PE файлу
$bytes = [System.IO.File]::ReadAllBytes("C:\suspicious.exe")
$timestamp = [System.BitConverter]::ToInt32($bytes, 0x40 + [System.BitConverter]::ToInt32($bytes, 0x3C))
[System.DateTimeOffset]::FromUnixTimeSeconds($timestamp).DateTime

# Імпортовані функції DLL (базово)
$pe = [System.Reflection.Assembly]::LoadFile("C:\suspicious.dll")
$pe.GetExportedTypes() | Select-Object Name
```

---

## Налаштування безпечного середовища для аналізу

**1. Використовуй VM або Sandbox:**

Ніколи не аналізуй підозрілі файли на основній системі. Windows Sandbox або Hyper-V VM.

**2. Відключи мережу в VM:**

```powershell
# В Hyper-V — від'єднати мережевий адаптер VM
Disconnect-VMNetworkAdapter -VMName "AnalysisVM" -All
```

**3. Зроби snapshot перед аналізом:**

```powershell
Checkpoint-VM -Name "AnalysisVM" -SnapshotName "Before Analysis"
```

**4. Відновись після аналізу:**

```powershell
Restore-VMSnapshot -VMName "AnalysisVM" -Name "Before Analysis"
```

---

## Онлайн інструменти для аналізу

- **virustotal.com** — перевірка файлів і URL 90+ антивірусами
- **any.run** — онлайн пісочниця з поведінковим аналізом
- **hybrid-analysis.com** — безкоштовний онлайн аналіз шкідливого ПЗ
- **crt.sh** — аналіз SSL сертифікатів і доменів
- **shodan.io** — пошук відкритих сервісів і пристроїв

---

## Підсумок

Базовий набір: Autoruns + Process Monitor + TCPView (Sysinternals) + Wireshark. Для аналізу файлів: `Get-FileHash` → перевір на VirusTotal → `strings.exe` → аналіз у Sandbox або VM. Завжди роби snapshot VM перед запуском підозрілого коду — відновлення займе секунди.
