---
title: "LDAP запити до Active Directory: пошук і фільтрація через PowerShell"
date: "2026-09-27"
publishDate: "2026-09-27"
description: "Як робити LDAP запити до Active Directory через PowerShell і ldapsearch: фільтри, атрибути, пошук користувачів і комп'ютерів без модуля AD."
tags: ["адміністрування", "windows", "powershell", "мережа", "безпека"]
readTime: 6
---

LDAP запити дозволяють шукати об'єкти в Active Directory навіть без встановленого модуля ActiveDirectory — корисно на системах де він недоступний.

---

## Базовий LDAP запит через .NET

```powershell
# Підключення до AD через DirectorySearcher
$searcher = New-Object System.DirectoryServices.DirectorySearcher
$searcher.Filter = "(objectClass=user)"
$searcher.PageSize = 1000

$results = $searcher.FindAll()
$results | ForEach-Object {
    $_.Properties["samaccountname"][0]
}
```

---

## Структура LDAP фільтрів

```
(атрибут=значення)                     # точний збіг
(атрибут=*значення*)                   # містить
(атрибут=значення*)                    # починається з
(&(фільтр1)(фільтр2))                  # AND
(|(фільтр1)(фільтр2))                  # OR
(!(фільтр))                            # NOT
```

---

## Корисні LDAP фільтри

```powershell
# Функція для зручного пошуку
function Search-LDAP {
    param([string]$Filter, [string[]]$Properties = @("*"), [string]$Base = "")

    $root = if ($Base) {
        New-Object System.DirectoryServices.DirectoryEntry("LDAP://$Base")
    } else {
        New-Object System.DirectoryServices.DirectoryEntry
    }

    $searcher = New-Object System.DirectoryServices.DirectorySearcher($root)
    $searcher.Filter = $Filter
    $searcher.PageSize = 1000
    $Properties | ForEach-Object { $searcher.PropertiesToLoad.Add($_) | Out-Null }

    $searcher.FindAll() | ForEach-Object {
        $obj = @{}
        $_.Properties.Keys | ForEach-Object {
            $obj[$_] = $_.Properties[$_][0]
        }
        [PSCustomObject]$obj
    }
}

# Всі активні користувачі
Search-LDAP "(&(objectClass=user)(!(userAccountControl:1.2.840.113556.1.4.803:=2)))" |
  Select-Object samaccountname, displayname

# Користувачі в конкретному OU
Search-LDAP "(&(objectClass=user)(OU=Sales,DC=company,DC=local))"

# Комп'ютери з Windows 11
Search-LDAP "(&(objectClass=computer)(operatingSystem=Windows 11*))" `
  -Properties samaccountname,operatingSystem |
  Select-Object samaccountname, operatingSystem

# Заблоковані акаунти
# userAccountControl bit 1 = LOCKOUT (бітова маска 1.2.840.113556.1.4.803:=16)
Search-LDAP "(&(objectClass=user)(userAccountControl:1.2.840.113556.1.4.803:=16))"

# Акаунти з паролем що не закінчується
# userAccountControl bit 65536 = DONT_EXPIRE_PASSWORD
Search-LDAP "(&(objectClass=user)(userAccountControl:1.2.840.113556.1.4.803:=65536))" |
  Select-Object samaccountname, displayname
```

---

## UserAccountControl прапорці

| Значення | Прапорець |
|---------|---------|
| 2 | ACCOUNTDISABLE |
| 16 | LOCKOUT |
| 32 | PASSWD_NOTREQD |
| 64 | PASSWD_CANT_CHANGE |
| 65536 | DONT_EXPIRE_PASSWORD |
| 524288 | TRUSTED_FOR_DELEGATION |

---

## Пошук через ldp.exe (GUI)

`Win + R` → `ldp.exe` → Connection → Connect → введи DC hostname → OK.

Потім: Browse → Search → Base DN і Filter → Run.

Корисно для тестування фільтрів перед написанням скрипту.

---

## LDAPS — захищений LDAP

```powershell
# Підключення через LDAPS (порт 636)
$directoryEntry = New-Object System.DirectoryServices.DirectoryEntry(
    "LDAPS://dc.company.local:636",
    "administrator@company.local",
    "password",
    [System.DirectoryServices.AuthenticationTypes]::SecureSocketsLayer
)

$searcher = New-Object System.DirectoryServices.DirectorySearcher($directoryEntry)
$searcher.Filter = "(objectClass=user)"
```

---

## Підсумок

`System.DirectoryServices.DirectorySearcher` — LDAP без модуля AD. Основні фільтри: `(objectClass=user)` для користувачів, `(&(...)(...))`  для AND. `userAccountControl` — бітова маска для перевірки стану акаунту. `ldp.exe` — GUI для тестування запитів.
