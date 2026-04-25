---
title: "Автоматичний вхід в Windows без пароля: налаштування і ризики"
date: "2026-08-12"
publishDate: "2026-08-12"
description: "Як налаштувати автоматичний вхід в Windows 10 і 11 без введення пароля через netplwiz і реєстр. Коли це доречно і як захистити дані при автовході."
tags: ["windows", "налаштування", "облікові-записи", "безпека"]
readTime: 4
---

Автоматичний вхід зручний для домашнього ПК або кіоску — Windows завантажується одразу до робочого столу без введення пароля.

---

## Коли автовхід доречний

✅ Домашній ПК до якого маєш тільки ти фізичний доступ
✅ Спільний медіацентр або телевізійний ПК
✅ Кіоск або інформаційний термінал
✅ Тестові або розробницькі машини

❌ Ноутбук що виносиш з дому
❌ Офісний ПК
❌ ПК з чутливими даними (фінанси, медицина)

---

## Спосіб 1: Через netplwiz

`Win + R` → `netplwiz` → Enter

1. Вибери свій обліковий запис
2. Зніми галочку **"Для використання цього комп'ютера користувачі повинні ввести ім'я і пароль"**
3. Натисни **OK**
4. Введи пароль двічі для підтвердження

> В Windows 11 23H2+ ця галочка може бути прихована. Тоді використовуй спосіб 2.

---

## Спосіб 2: Через реєстр

```powershell
# Налаштувати автовхід через реєстр
$regPath = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon"

Set-ItemProperty $regPath -Name "AutoAdminLogon"  -Value "1" -Type String
Set-ItemProperty $regPath -Name "DefaultUserName"  -Value "ТвоєІм'яКористувача" -Type String
Set-ItemProperty $regPath -Name "DefaultPassword"  -Value "ТвійПароль" -Type String
Set-ItemProperty $regPath -Name "DefaultDomainName" -Value $env:COMPUTERNAME -Type String

Write-Output "Автовхід налаштовано. Перезавантаж для перевірки."
```

> Пароль зберігається у відкритому вигляді в реєстрі. На домашньому ПК це прийнятно, на корпоративному — ні.

---

## Спосіб 3: Для доменного ПК

На ПК в домені автовхід налаштовується з вказанням домену:

```powershell
$regPath = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon"

Set-ItemProperty $regPath -Name "AutoAdminLogon"   -Value "1"
Set-ItemProperty $regPath -Name "DefaultUserName"   -Value "username"
Set-ItemProperty $regPath -Name "DefaultPassword"   -Value "password"
Set-ItemProperty $regPath -Name "DefaultDomainName" -Value "company.local"
```

---

## Вимкнути автовхід

```powershell
$regPath = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon"
Set-ItemProperty $regPath -Name "AutoAdminLogon" -Value "0"
Remove-ItemProperty $regPath -Name "DefaultPassword" -ErrorAction SilentlyContinue
```

Або через `netplwiz` — поверни галочку назад.

---

## Автовхід + BitLocker = безпека при автовході

Якщо хочеш автовхід але захист від крадіжки ноутбука:

1. Увімкни BitLocker — диск зашифрований, без ключа дані недоступні
2. Налаштуй автовхід — вхід в систему без пароля

При крадіжці злодій не зможе прочитати дані без ключа шифрування навіть якщо Windows не вимагає пароль при вході.

Детальніше: [Як увімкнути BitLocker](/yak-uvimknuty-bitlocker-windows-11)

---

## Тимчасово пропустити автовхід

Якщо потрібно увійти під іншим акаунтом:

При завантаженні утримуй `Shift` → з'явиться екран входу, можна вибрати інший акаунт.

---

## Підсумок

`netplwiz` → зняти галочку — найпростіший спосіб. Реєстр → `AutoAdminLogon = 1` — якщо галочка прихована. Для ноутбуків: комбінуй автовхід з BitLocker — зручно і безпечно одночасно. Ніколи не налаштовуй автовхід без шифрування на мобільних пристроях.
