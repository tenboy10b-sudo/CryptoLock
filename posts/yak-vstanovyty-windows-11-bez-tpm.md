---
title: "Як встановити Windows 11 без TPM 2.0 і Secure Boot у 2026"
date: "2026-05-12"
publishDate: "2026-05-12"
description: "Windows 11 вимагає TPM 2.0 і Secure Boot, але встановити можна і без них. Три офіційних і неофіційних способи обійти перевірку вимог для старих ПК."
tags: ["windows", "встановлення", "bios", "налаштування"]
translatesEn: "how-to-install-windows-11-without-tpm"
readTime: 5
---

Windows 11 офіційно вимагає TPM 2.0, Secure Boot і процесор не старше 2017 року. Але встановити її на старе залізо можна — ось три способи.

---

## Спосіб 1: Увімкнути fTPM в BIOS (найпростіший)

Багато старих процесорів мають вбудований TPM але він вимкнений в BIOS:

1. Перезавантаж і зайди в BIOS (Del, F2 або F12)
2. Шукай **fTPM**, **PTT** (Intel) або **AMD fTPM**
3. Увімкни → збережи → перезавантаж
4. Перевір: `Win + R` → `tpm.msc` → має показати **TPM готовий до використання**

Після цього Windows 11 встановлюється стандартно.

---

## Спосіб 2: Rufus з обходом перевірки (рекомендовано)

Rufus може створити USB з вимкненими перевірками TPM і Secure Boot:

1. Завантаж **Rufus** з rufus.ie (`winget install Rufus.Rufus`)
2. Підключи USB (мін. 8 ГБ)
3. В Rufus → клікни **Download** поруч із Boot selection → завантаж Windows 11 ISO прямо в Rufus
4. Натисни **Start** → з'явиться діалог:
   - ✅ **Remove requirement for TPM 2.0**
   - ✅ **Remove requirement for Secure Boot**
   - ✅ **Remove requirement for 4GB RAM**
5. Клікни OK → Rufus запише USB

Завантажся з USB і встановлюй як звичайно.

---

## Спосіб 3: Реєстр під час встановлення (офіційний обхід від Microsoft)

При встановленні коли з'явиться екран "Цей ПК не може запустити Windows 11":

1. Натисни `Shift + F10` → відкриється CMD
2. Введи `regedit` → відкриється редактор реєстру
3. Перейди до `HKEY_LOCAL_MACHINE\SYSTEM\Setup\MoSetup`
4. Якщо папки немає — створи її
5. Створи параметр DWORD: `AllowUpgradesWithUnsupportedTPMOrCPU` = `1`
6. Закрий regedit і CMD → продовжуй встановлення

---

## Перевірити вимоги перед встановленням

```powershell
# TPM
Get-Tpm | Select-Object TpmPresent, TpmReady, ManufacturerId

# Secure Boot
Confirm-SecureBootUEFI

# RAM
(Get-WmiObject Win32_ComputerSystem).TotalPhysicalMemory / 1GB

# Процесор
(Get-WmiObject Win32_Processor).Name
```

Або завантаж **PC Health Check** від Microsoft — офіційний інструмент перевірки сумісності.

---

## Що буде після встановлення на непідтримуваний ПК

Microsoft офіційно заявляє що такі ПК **можуть не отримувати оновлення** в майбутньому. На практиці оновлення продовжують приходити — але ситуація може змінитись.

Альтернатива для дуже старого заліза: **Linux Mint** — безкоштовний, схожий інтерфейс, підтримка 5 років.

---

## Резюме

**Якщо є fTPM в BIOS** — увімкни і проблема вирішена. **Якщо ні** — використовуй Rufus з обходом вимог: швидко, надійно, без ризику. Спосіб з реєстром — для оновлення з Windows 10 без перевстановлення.
