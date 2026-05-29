---
title: "Як увімкнути Secure Boot в BIOS для Windows 10 і 11"
date: "2027-02-06"
publishDate: "2027-02-06"
description: "Увімкнення Secure Boot в BIOS/UEFI для Windows 10 і 11. Перевірка статусу, перехід з Legacy на UEFI, конвертація MBR в GPT без втрати даних."
tags: ["windows", "bios", "secure-boot", "uefi", "встановлення"]
readTime: 4
translatesEn: "how-to-enable-secure-boot-windows"
---

Secure Boot запобігає запуску несанкціонованих завантажувачів. Windows 11 вимагає його. Ось як увімкнути без втрати даних.

---

## Перевірити поточний статус

```powershell
# Чи увімкнений Secure Boot
Confirm-SecureBootUEFI

# Режим BIOS (UEFI або Legacy)
(Get-WmiObject Win32_ComputerSystem).FirmwareType
```

---

## Зайти в BIOS

```powershell
# Перезавантажитись напряму в UEFI
shutdown /r /fw /t 0
```

Або при завантаженні: `Del`, `F2`, `F12` (залежить від виробника)

---

## Увімкнути Secure Boot

BIOS → **Security** або **Boot** → **Secure Boot** → **Enabled**

Якщо опція недоступна (сіра) — спочатку вимкни **CSM** (Legacy Mode).

---

## Перевірити тип розділу диску

```powershell
Get-Disk | Select-Object Number, PartitionStyle
```

Якщо **MBR** — конвертуй в GPT. Якщо вже **GPT** — просто вмикай UEFI в BIOS.

---

## Конвертація MBR → GPT без втрати даних

```powershell
# Перевірити чи можлива конвертація
mbr2gpt /validate /disk:0 /allowFullOS

# Конвертувати
mbr2gpt /convert /disk:0 /allowFullOS
```

---

## Після увімкнення

```powershell
# Перевірити що Secure Boot активний
Confirm-SecureBootUEFI  # має повернути True
```

---

## Часті питання

### Увімкнення Secure Boot видалить дані?

Ні. Secure Boot впливає тільки на те що може завантажитись. Дані і Windows не зачіпаються. Конвертація MBR→GPT через mbr2gpt теж безпечна.

### Увімкнув Secure Boot але Windows 11 все одно каже що вимкнений?

Перевір в PowerShell: `Confirm-SecureBootUEFI`. Також перевір `msinfo32` → Стан безпечного завантаження. Іноді потрібне оновлення BIOS.

---

## Резюме

Перевірити: `Confirm-SecureBootUEFI`. Зайти в BIOS: `shutdown /r /fw /t 0`. Вимкнути CSM перед увімкненням Secure Boot. Конвертувати MBR→GPT через `mbr2gpt` якщо потрібно.
