---
title: "Як переглянути журнал подій Windows через Event Viewer і PowerShell"
date: "2026-04-07"
description: "Читання системних логів через Event Viewer і PowerShell: помилки, входи в систему, вимкнення ПК і критичні події."
tags: ["моніторинг", "інструменти", "windows", "безпека"]
readTime: 5
---

Журнал подій Windows зберігає детальну інформацію про всі системні події. Це перше місце куди треба дивитись при діагностиці проблем.

## Відкрити Event Viewer

```cmd
eventvwr.msc
```

Або: `Win + X` → **Event Viewer**.

---

## Структура журналів

- **Windows Logs → Application** — помилки програм
- **Windows Logs → Security** — входи в систему, зміни прав
- **Windows Logs → System** — системні події, драйвери, служби
- **Windows Logs → Setup** — встановлення компонентів
- **Applications and Services Logs** — журнали конкретних компонентів

---

## Рівні подій

| Рівень | Значення |
|---|---|
| **Critical** | Система або компонент недоступний |
| **Error** | Серйозна помилка |
| **Warning** | Потенційна проблема |
| **Information** | Нормальна операція |
| **Verbose** | Детальна діагностика |

---

## Корисні пошуки через PowerShell

**Критичні помилки за останню добу:**
```powershell
Get-EventLog -LogName System -EntryType Error -Newest 20 | Select-Object TimeGenerated, Source, Message
```

**Коли ПК вмикали і вимикали:**
```powershell
Get-EventLog -LogName System | Where-Object {$_.EventID -in (6005,6006,6008)} | Select-Object TimeGenerated, EventID, Message
```

Event ID:
- `6005` — система запущена
- `6006` — система зупинена коректно
- `6008` — аварійне вимкнення

**Всі входи в систему:**
```powershell
Get-EventLog -LogName Security | Where-Object {$_.EventID -eq 4624} | Select-Object TimeGenerated, Message | Select-Object -First 10
```

**Невдалі спроби входу:**
```powershell
Get-EventLog -LogName Security | Where-Object {$_.EventID -eq 4625} | Select-Object TimeGenerated, Message
```

---

## Через Get-WinEvent (новіший підхід)

```powershell
# Помилки за останні 24 години
Get-WinEvent -FilterHashtable @{LogName='System'; Level=2; StartTime=(Get-Date).AddHours(-24)} | Select-Object TimeCreated, ProviderName, Message

# Перезавантаження
Get-WinEvent -FilterHashtable @{LogName='System'; Id=1074} | Select-Object TimeCreated, Message
```

---

## Знайти причину синього екрану (BSOD)

```powershell
Get-WinEvent -FilterHashtable @{LogName='System'; Id=41} | Select-Object -First 5 TimeCreated, Message
```

EventID 41 — критична помилка яка передувала BSOD.

Або перегляни папку:
```cmd
dir %SystemRoot%\Minidump
```

Файли `.dmp` — дампи пам'яті при BSOD. Аналізуй через WinDbg або WhoCrashed.

---

## Очистити журнал подій

```cmd
wevtutil cl System
wevtutil cl Application
wevtutil cl Security
```

Або через PowerShell:
```powershell
Get-EventLog -LogName System | Clear-EventLog
```

> Також дивись: [Як переглянути продуктивність ПК в Windows](/yak-podyvytys-produktyvnist-pk)
