---
title: "Розширені правила брандмауера Windows: блокування, порти і IP діапазони"
date: "2026-05-12"
publishDate: "2026-05-12"
description: "Створення розширених правил брандмауера Windows для блокування або дозволу застосунків, портів і IP діапазонів. Експорт конфігурації і моніторинг підключень."
tags: ["windows", "firewall", "мережа", "безпека", "powershell"]
readTime: 4
translatesEn: "how-to-configure-windows-firewall-rules"
---

Брандмауер Windows з розширеною безпекою дає детальний контроль над кожним мережевим підключенням.

---

## Відкрити розширений брандмауер

```
wf.msc
```

---

## Правило для застосунку

```powershell
# Дозволити застосунок
New-NetFirewallRule -DisplayName "Allow MyApp" `
  -Direction Inbound `
  -Program "C:\Apps\myapp.exe" `
  -Action Allow -Profile Private

# Заблокувати вихідний трафік застосунку
New-NetFirewallRule -DisplayName "Block Outbound" `
  -Direction Outbound `
  -Program "C:\Apps\telemetry.exe" `
  -Action Block
```

---

## Правило для порту

```powershell
# Відкрити порт
New-NetFirewallRule -DisplayName "Allow Port 8080" `
  -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow

# Заблокувати небезпечний порт
New-NetFirewallRule -DisplayName "Block Telnet" `
  -Direction Inbound -Protocol TCP -LocalPort 23 -Action Block
```

---

## Увімкнути логування

```powershell
Set-NetFirewallProfile -Profile Domain,Public,Private `
  -LogBlocked True `
  -LogFileName "C:\Windows\System32\LogFiles\Firewall\pfirewall.log"

# Переглянути заблоковані пакети
Get-Content "C:\Windows\System32\LogFiles\Firewall\pfirewall.log" -Tail 20 |
  Where-Object {$_ -like "*DROP*"}
```

---

## Резервна копія і відновлення

```powershell
netsh advfirewall export "C:\Backup\firewall.wfw"
netsh advfirewall import "C:\Backup\firewall.wfw"
netsh advfirewall reset  # скинути до стандартних
```

---

## Часті питання

### Як знайти яке правило блокує застосунок?

Увімкни логування, відтвори блокування, потім перевір лог на записи DROP з портом твого застосунку.

### Яка різниця між профілями Domain, Private і Public?

Domain = корпоративна мережа. Private = домашня/довірена. Public = кафе, готель. Правила застосовуються для конкретних профілів.

---

## Резюме

`New-NetFirewallRule` для скриптового створення правил. Логування для діагностики. `netsh advfirewall export` перед масовими змінами. `Get-NetTCPConnection` для моніторингу активних підключень.
