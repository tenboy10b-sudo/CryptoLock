---
title: "Як налаштувати права доступу до папок і файлів в Windows"
date: "2026-04-11"
description: "Налаштування NTFS-дозволів на папки через графічний інтерфейс, icacls і PowerShell. Дозволи для користувачів і груп."
tags: ["безпека", "ntfs", "windows", "облікові-записи"]
readTime: 6
---

NTFS-дозволи визначають хто може читати, записувати або запускати файли і папки. Правильне налаштування — основа безпеки файлової системи.

## Типи NTFS-дозволів

| Дозвіл | Що дозволяє |
|---|---|
| **Full Control** | Все, включаючи зміну дозволів |
| **Modify** | Читання, запис, видалення |
| **Read & Execute** | Читання і запуск |
| **List Folder Contents** | Перегляд вмісту папки |
| **Read** | Тільки читання |
| **Write** | Запис і створення |

---

## Через графічний інтерфейс

**Крок 1.** Правий клік на папку → **Properties** → вкладка **Security**.

**Крок 2.** Натисни **Edit** → **Add** → введи ім'я користувача або групи → **Check Names** → OK.

**Крок 3.** Вибери користувача → постав або зніми галочки в колонках **Allow** / **Deny**.

**Крок 4.** OK → Apply.

---

## Через icacls (CMD)

**Переглянути поточні дозволи:**
```cmd
icacls "C:\MyFolder"
```

**Дати користувачу повний доступ:**
```cmd
icacls "C:\MyFolder" /grant John:(OI)(CI)F
```

**Дати тільки читання:**
```cmd
icacls "C:\MyFolder" /grant John:(OI)(CI)R
```

**Забрати дозвіл:**
```cmd
icacls "C:\MyFolder" /remove John
```

**Позначення:**
- `(OI)` — Object Inherit (поширюється на файли)
- `(CI)` — Container Inherit (поширюється на підпапки)
- `F` — Full Control
- `M` — Modify
- `RX` — Read & Execute
- `R` — Read
- `W` — Write

---

## Скопіювати дозволи з однієї папки на іншу

```cmd
icacls "C:\Source" /save permissions.txt
icacls "C:\Destination" /restore permissions.txt
```

---

## Через PowerShell

**Переглянути дозволи:**
```powershell
(Get-Acl "C:\MyFolder").Access | Select-Object IdentityReference, FileSystemRights, AccessControlType
```

**Додати дозвіл:**
```powershell
$acl = Get-Acl "C:\MyFolder"
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule("John","ReadAndExecute","ContainerInherit,ObjectInherit","None","Allow")
$acl.SetAccessRule($rule)
Set-Acl "C:\MyFolder" $acl
```

---

## Взяти право власності (якщо немає доступу)

```cmd
takeown /f "C:\LockedFolder" /r /d y
icacls "C:\LockedFolder" /grant Administrators:F /t
```

---

## Заблокувати доступ до папки для всіх крім адміна

```cmd
icacls "C:\SecretFolder" /inheritance:r
icacls "C:\SecretFolder" /grant Administrators:(OI)(CI)F
icacls "C:\SecretFolder" /deny Everyone:(OI)(CI)R
```

> Також дивись: [Як заблокувати обліковий запис користувача](/yak-zablokuvaty-oblikovyy-zapys)
