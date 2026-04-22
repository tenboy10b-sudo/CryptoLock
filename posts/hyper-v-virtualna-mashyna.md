---
title: "Як налаштувати Hyper-V і запустити віртуальну машину в Windows"
date: "2025-05-18"
description: "Увімкнення Hyper-V в Windows 10/11 Pro, створення віртуальної машини і встановлення гостьової ОС. Вимоги і налаштування."
tags: ["hyper-v", "windows", "адміністрування", "інструменти"]
readTime: 6
---

Hyper-V — вбудований гіпервізор Windows. Дозволяє запускати віртуальні машини безкоштовно прямо в Windows Pro без VMware або VirtualBox.

## Вимоги

- Windows 10/11 Pro, Enterprise або Education (Home не підтримує)
- Процесор з підтримкою апаратної віртуалізації (Intel VT-x або AMD-V)
- Мінімум 4 ГБ RAM (рекомендовано 8 ГБ+)
- Увімкнена віртуалізація в BIOS

---

## Перевір підтримку віртуалізації

```cmd
systeminfo | findstr /i "Hyper-V"
```

Якщо бачиш `Hyper-V Requirements: A hypervisor has been detected` — вже увімкнено. Якщо `VM Monitor Mode Extensions: Yes` — підтримується, але треба увімкнути.

---

## Крок 1: Увімкни Hyper-V

**Через Windows Features:**
`Win + R` → `optionalfeatures` → знайди **Hyper-V** → постав галочку → OK → перезавантаж.

**Через PowerShell (швидше):**
```powershell
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
```

**Через DISM:**
```cmd
DISM /Online /Enable-Feature /All /FeatureName:Microsoft-Hyper-V
```

---

## Крок 2: Увімкни віртуалізацію в BIOS

Зайди в BIOS (Del або F2 при старті) → знайди:
- Intel: **Intel Virtualization Technology (VT-x)** → Enabled
- AMD: **AMD-V** або **SVM Mode** → Enabled

Збережи і перезавантаж.

---

## Крок 3: Відкрий Hyper-V Manager

`Win + S` → **Hyper-V Manager**.

Або через CMD:
```cmd
virtmgmt.msc
```

---

## Крок 4: Створи нову віртуальну машину

**Правий клік** на ім'я ПК в лівій панелі → **New** → **Virtual Machine**.

Майстер:

1. **Name:** назва ВМ (наприклад "Ubuntu 24.04")
2. **Generation:** Generation 2 для сучасних ОС (UEFI), Generation 1 для старих
3. **Memory:** мінімум 2048 МБ для Linux, 4096 МБ для Windows
4. **Networking:** вибери **Default Switch** для доступу в інтернет
5. **Virtual Hard Disk:** розмір (мінімум 25 ГБ для Linux, 50 ГБ для Windows)
6. **Installation media:** вкажи ISO-образ

Finish → ВМ створена.

---

## Крок 5: Запуск і встановлення

Правий клік на ВМ → **Start** → **Connect** → відкриється вікно.

Встановлення гостьової ОС відбувається як на реальному ПК.

---

## Корисні команди Hyper-V через PowerShell

```powershell
# Список всіх ВМ
Get-VM

# Запустити ВМ
Start-VM -Name "Ubuntu 24.04"

# Зупинити
Stop-VM -Name "Ubuntu 24.04" -Force

# Зробити знімок (checkpoint)
Checkpoint-VM -Name "Ubuntu 24.04" -SnapshotName "Before update"

# Відновити знімок
Restore-VMCheckpoint -VMName "Ubuntu 24.04" -Name "Before update"

# Видалити ВМ
Remove-VM -Name "Ubuntu 24.04" -Force
```

---

## Enhanced Session Mode — буфер обміну і аудіо

Для зручної роботи з ВМ увімкни Enhanced Session:

```powershell
Set-VMHost -EnableEnhancedSessionMode $true
```

Тепер можна копіювати текст між ВМ і хостом, перенаправляти аудіо і USB.
