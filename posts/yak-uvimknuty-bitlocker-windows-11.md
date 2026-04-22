---
title: "Як увімкнути BitLocker в Windows 11: покроковий гайд"
date: "2026-04-19"
description: "Детальна інструкція як активувати BitLocker в Windows 11, налаштувати PIN при завантаженні і зберегти ключ відновлення."
tags: ["bitlocker", "шифрування", "безпека", "windows"]
readTime: 6
---

BitLocker в Windows 11 має кілька нових опцій порівняно з Windows 10. Розберемо як увімкнути правильно.

## Відмінності BitLocker у Windows 11

- Підтримує тільки TPM 2.0 (в Windows 10 — TPM 1.2)
- Новий алгоритм шифрування XTS-AES 256 за замовчуванням
- Інтегрується з Windows Hello для автентифікації

## Перевір TPM 2.0

`Win + R` → `tpm.msc`.

Має відображати: **TPM 2.0 ready for use**. Якщо показує TPM 1.2 або "не знайдено" — дивись розділ нижче.

---

## Спосіб 1: Через Settings (найпростіший)

**Крок 1.** `Win + I` → **System** → **Storage**.

**Крок 2.** Прокрути вниз → **Advanced storage settings** → **Disks & volumes**.

**Крок 3.** Вибери диск C: → **Properties** → **Turn on BitLocker**.

**Крок 4.** Або швидший шлях: `Win + S` → введи **BitLocker** → **Manage BitLocker** → **Turn on BitLocker** поруч з диском C:.

---

## Спосіб 2: Через Control Panel

**Win + R** → `control` → **System and Security** → **BitLocker Drive Encryption** → **Turn on BitLocker**.

---

## Налаштування PIN при завантаженні (рекомендовано)

Без PIN BitLocker розблокується автоматично через TPM — зручно але менш безпечно. З PIN — потрібно вводити код при кожному старті.

**Крок 1.** `gpedit.msc` → перейди:
```
Computer Configuration
  → Administrative Templates
    → Windows Components
      → BitLocker Drive Encryption
        → Operating System Drives
```

**Крок 2.** Відкрий **Require additional authentication at startup** → **Enabled** → вибери **Require startup PIN with TPM** → OK.

**Крок 3.** Тепер при увімкненні BitLocker система запропонує встановити PIN (мінімум 6 символів).

---

## Збережи ключ відновлення

Без ключа відновлення доступ до зашифрованого диска назавжди втрачено.

Варіанти збереження:
- **Microsoft account** — найзручніше для домашнього ПК
- **USB flash drive** — зберігай окремо від ПК
- **File** — НЕ на диск C:
- **Print** — роздрукуй і зберігай фізично

---

## Перевірка статусу

```cmd
manage-bde -status C:
```

Покаже: `Protection Status: Protection On` — шифрування активне.

---

## BitLocker без TPM 2.0

Якщо TPM відсутній або версія 1.2:

`gpedit.msc` → **Computer Configuration → Administrative Templates → Windows Components → BitLocker Drive Encryption → Operating System Drives** → **Require additional authentication at startup** → **Enabled** → постав галочку **Allow BitLocker without a compatible TPM**.

Тепер замість TPM система попросить USB-ключ або пароль.

> Також дивись: [Як зашифрувати диск BitLocker в Windows 10](/yak-zashyfruvaty-dysk-bitlocker)
