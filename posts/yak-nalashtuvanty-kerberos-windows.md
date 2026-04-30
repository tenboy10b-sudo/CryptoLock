---
title: "Kerberos автентифікація в Active Directory: як працює і діагностика"
date: "2026-09-24"
publishDate: "2026-09-24"
description: "Як працює Kerberos автентифікація в Active Directory, типові помилки (clock skew, SPN, делегування) і інструменти діагностики через klist і PowerShell."
tags: ["адміністрування", "безпека", "windows", "мережа", "облікові-записи"]
readTime: 6
---

Kerberos — основний протокол автентифікації в Active Directory. Розуміння його роботи допомагає швидко діагностувати помилки входу і делегування.

---

## Як працює Kerberos (спрощено)

```
1. Клієнт → KDC (Key Distribution Center = DC):
   "Хочу TGT для user@company.local"

2. KDC → Клієнт:
   TGT (Ticket Granting Ticket) зашифрований ключем користувача

3. Клієнт → KDC:
   "Хочу квиток для fileserver.company.local" + TGT

4. KDC → Клієнт:
   Service Ticket для fileserver

5. Клієнт → FileServer:
   Service Ticket → доступ надано
```

TGT живе 10 годин за замовчуванням. Service Tickets — 10 хвилин.

---

## Переглянути Kerberos квитки

```cmd
rem Список всіх квитків поточної сесії
klist

rem Очистити квитки (примусово переавтентифікуватись)
klist purge

rem Квитки конкретного користувача
klist -li 0x3e7

rem Детально по конкретному квитку
klist tickets
```

---

## Типові помилки Kerberos

### KRB_AP_ERR_SKEW — розбіжність часу

Найчастіша помилка. Різниця між клієнтом і DC більше 5 хвилин.

```cmd
rem Перевірити час
w32tm /query /status

rem Синхронізувати з DC
net stop w32tm
net start w32tm
w32tm /resync /force
```

Детальніше: [Синхронізація NTP](/ntp-synkhronizatsiya-chasu-windows-domen)

---

### KDC_ERR_S_PRINCIPAL_UNKNOWN — SPN не знайдено

SPN (Service Principal Name) не зареєстровано або зареєстровано неправильно.

```cmd
rem Знайти SPN для сервісу
setspn -L fileserver

rem Зареєструвати SPN
setspn -A HTTP/webserver.company.local company\webservice

rem Знайти дублікати SPN (часта причина проблем)
setspn -X
```

---

### NTLM замість Kerberos

Кербероc не використовується — замість нього NTLM (слабший). Перевірити:

```powershell
# Перевірити чи використовується Kerberos
klist | Select-String "Kerberos"

# Або переглянути Event ID 4624 — Logon Type 3 + Kerberos
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4624} |
  Where-Object { $_.Properties[14].Value -eq "Kerberos" } |
  Select-Object TimeCreated, @{N="User";E={$_.Properties[5].Value}} |
  Select-Object -First 10
```

Причини NTLM замість Kerberos:
- Підключення по IP замість DNS імені
- SPN не зареєстровано
- Розбіжність часу

---

## Kerberos делегування

Делегування дозволяє сервісу виконувати дії від імені користувача.

```powershell
# Перевірити налаштування делегування для акаунта
Get-ADUser "serviceaccount" -Properties TrustedForDelegation, TrustedToAuthForDelegation |
  Select-Object Name, TrustedForDelegation, TrustedToAuthForDelegation

# Увімкнути Unconstrained Delegation (небезпечно — тільки для тестування)
Set-ADUser "serviceaccount" -TrustedForDelegation $true

# Constrained Delegation (безпечніше)
Set-ADUser "serviceaccount" -Add @{'msDS-AllowedToDelegateTo'="HTTP/webserver.company.local"}
```

---

## Audit Kerberos подій

```powershell
# Увімкнути аудит Kerberos
auditpol /set /subcategory:"Kerberos Service Ticket Operations" /success:enable /failure:enable
auditpol /set /subcategory:"Kerberos Authentication Service" /success:enable /failure:enable

# Переглянути помилки Kerberos
Get-WinEvent -FilterHashtable @{
    LogName = 'Security'
    Id = 4768, 4769, 4771  # TGT request, ST request, AS request failed
    StartTime = (Get-Date).AddHours(-24)
} | Select-Object TimeCreated, Id, Message | Format-List
```

| Event ID | Подія |
|----------|-------|
| 4768 | TGT запит |
| 4769 | Service Ticket запит |
| 4771 | Pre-auth failed (неправильний пароль) |
| 4772 | TGT запит відхилено |

---

## Підсумок

`klist` — переглянути квитки. `klist purge` — очистити. Найчастіша проблема — `w32tm /resync`. SPN дублікати — `setspn -X`. NTLM замість Kerberos — перевір підключення по DNS імені а не IP.
