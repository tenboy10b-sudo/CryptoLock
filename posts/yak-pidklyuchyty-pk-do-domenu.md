---
title: "Як підключити комп'ютер до домену Active Directory"
date: "2026-07-19"
publishDate: "2026-07-19"
description: "Покроково підключити Windows 10 і 11 до домену Active Directory: вимоги, налаштування DNS, приєднання до домену через GUI і PowerShell, типові помилки."
tags: ["адміністрування", "windows", "мережа", "налаштування", "облікові-записи"]
readTime: 5
---

Приєднання ПК до домену — стандартна задача при розгортанні нового робочого місця. Займає 5 хвилин якщо DNS налаштований правильно.

---

## Що потрібно перед початком

- ПК підключений до корпоративної мережі (не через VPN якщо вперше)
- DNS на ПК вказує на контролер домену
- Ім'я домену (наприклад `company.local`)
- Акаунт з правами приєднувати ПК до домену (зазвичай доменний адміністратор)

---

## Крок 1: Налаштувати DNS

ПК має резолвити домен через DNS контролера домену.

`Win + R` → `ncpa.cpl` → правою кнопкою на адаптер → **Властивості** → **IP версії 4** → **Властивості**:
- DNS сервер: IP контролера домену (наприклад `192.168.1.10`)
- Додатковий DNS: другий DC або `8.8.8.8`

Перевір що домен резолвиться:

```cmd
nslookup company.local
ping company.local
```

Якщо відповідь є — DNS налаштований правильно.

---

## Крок 2: Перейменуй ПК (якщо потрібно)

Ім'я комп'ютера в домені повинно бути унікальним і відповідати стандарту компанії.

```powershell
Rename-Computer -NewName "PC-IVANOV-001" -Restart
```

Або: правою кнопкою на **Цей комп'ютер** → **Властивості** → **Змінити параметри** → **Змінити** → введи нове ім'я.

---

## Крок 3: Приєднати до домену

### Через GUI

`Win + R` → `sysdm.cpl` → вкладка **Ім'я комп'ютера** → **Змінити**:
- Вибери **Домен**
- Введи ім'я домену: `company.local`
- Натисни **OK**
- Введи логін і пароль доменного адміністратора
- Після успіху — перезавантаж

### Через PowerShell

```powershell
# Приєднати до домену
Add-Computer `
  -DomainName "company.local" `
  -Credential (Get-Credential) `
  -Restart

# Приєднати і одразу помістити в конкретний OU
Add-Computer `
  -DomainName "company.local" `
  -OUPath "OU=Workstations,OU=Kyiv,DC=company,DC=local" `
  -Credential (Get-Credential) `
  -Restart

# Масове приєднання (з файлу зі списком ПК)
$computers = Get-Content "C:\computers.txt"
$cred = Get-Credential
foreach ($pc in $computers) {
    Add-Computer -ComputerName $pc -DomainName "company.local" -Credential $cred -Restart -Force
}
```

---

## Перевірити успішне приєднання

```powershell
# Перевірити що ПК в домені
(Get-WmiObject Win32_ComputerSystem).Domain

# Перевірити зв'язок з DC
nltest /sc_verify:company.local

# Переглянути застосовані GPO
gpresult /r
```

---

## Типові помилки

### "Не вдається зв'язатися з доменом"

```cmd
rem Перевірити DNS
nslookup company.local

rem Перевірити доступність DC
ping 192.168.1.10

rem Перевірити порти DC (389 - LDAP, 88 - Kerberos)
Test-NetConnection 192.168.1.10 -Port 389
Test-NetConnection 192.168.1.10 -Port 88
```

### "Ім'я користувача або пароль неправильні"

Вводь у форматі `company\administrator` або `administrator@company.local` — не просто `administrator`.

### "Комп'ютер вже є в домені" (при повторному приєднанні)

```powershell
# Спочатку видали старий об'єкт з AD (на DC)
Remove-ADComputer -Identity "PC-IVANOV-001" -Confirm:$false

# Потім приєднуй заново
Add-Computer -DomainName "company.local" -Credential (Get-Credential) -Force -Restart
```

### GPO не застосовуються після приєднання

```cmd
gpupdate /force
gpresult /r
```

---

## Вийти з домену

```powershell
Remove-Computer -UnjoinDomainCredential (Get-Credential) -WorkgroupName "WORKGROUP" -Restart -Force
```

---

## Підсумок

Три кроки: DNS на IP контролера домену → `sysdm.cpl` → Змінити → Домен → ввести credentials. Якщо помилка "не вдається зв'язатися" — перевір DNS і `ping company.local`. Після приєднання `gpupdate /force` застосує всі групові політики.
