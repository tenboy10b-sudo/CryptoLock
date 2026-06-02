---
title: "Windows Hello: налаштування PIN, відбитка і виправлення помилок"
date: "2026-05-26"
publishDate: "2026-05-26"
description: "Налаштування Windows Hello PIN, відбитка пальця і розпізнавання обличчя. Виправлення: Hello не працює після оновлення, цикл скидання PIN, біометрія недоступна."
tags: ["windows", "windows-hello", "безпека", "автентифікація", "біометрія"]
readTime: 4
translatesEn: "how-to-configure-windows-hello-for-business"
---

Windows Hello забезпечує вхід без пароля через PIN, відбиток або обличчя. Ось як налаштувати і виправити коли зламалось.

---

## Налаштування Hello

`Win + I` → **Облікові записи** → **Параметри входу**

- **PIN** — працює на будь-якому ПК (найважливіше)
- **Відбиток пальця** — потрібен сканер
- **Розпізнавання обличчя** — потрібна ІК-камера

---

## Виправлення: Hello не працює після оновлення

```powershell
# Перезапустити службу Windows Hello
Restart-Service WbioSrvc -Force
```

---

## Виправлення: PIN не працює

На екрані блокування → **Я не пам'ятаю свій PIN** → підтверди через Microsoft акаунт.

```powershell
# Скинути дані Windows Hello
$ngcPath = "C:\Windows\ServiceProfiles\LocalService\AppData\Local\Microsoft\Ngc"
Stop-Service WbioSrvc -Force -EA 0
Remove-Item $ngcPath -Recurse -Force -EA 0
New-Item $ngcPath -ItemType Directory -EA 0
icacls $ngcPath /reset /t /c /l /q
Start-Service WbioSrvc
```

---

## Виправлення: Біометрія недоступна

```powershell
# Перевірити службу
Get-Service WbioSrvc | Select-Object Status

Set-Service WbioSrvc -StartupType Automatic
Start-Service WbioSrvc

# Перевірити TPM
(Get-WmiObject -Namespace "root\cimv2\security\microsofttpm" -Class Win32_Tpm).IsEnabled_InitialValue
```

Якщо TPM вимкнений — увімкни в BIOS.

---

## Часті питання

### Чи можна Hello з локальним акаунтом?

Так. PIN зберігається локально в TPM, не прив'язаний до Microsoft акаунту.

### Hello постійно просить налаштуватись знову після перезавантаження?

Пошкоджена папка NGC. Очисти через PowerShell вище і налаштуй Hello знову.

---

## Резюме

Спочатку PIN — обов'язковий для інших методів Hello. Перезапуск WbioSrvc і очищення NGC для виправлення. TPM має бути увімкнений в BIOS.
