---
title: "Менеджер сертифікатів Windows: перегляд і управління SSL сертифікатами"
date: "2026-02-20"
publishDate: "2026-02-20"
description: "Як відкрити менеджер сертифікатів Windows, переглянути встановлені сертифікати, додати або видалити кореневі сертифікати і вирішити помилки SSL."
tags: ["windows", "безпека", "мережа", "адміністрування"]
readTime: 4
---

Сертифікати Windows — основа довіри до сайтів, програм і мережевих підключень. Ось як ними керувати.

---

## Відкрити менеджер сертифікатів

**Для поточного користувача:**
`Win + R` → `certmgr.msc`

**Для комп'ютера (потребує адміністратора):**
`Win + R` → `certlm.msc`

Або через MMC: `Win + R` → `mmc` → **Файл** → **Додати або видалити оснастку** → **Сертифікати** → додай.

---

## Структура сховищ сертифікатів

| Сховище | Призначення |
|---------|-------------|
| **Особисті** | Власні сертифікати з приватним ключем |
| **Довірені кореневі центри** | CA що Windows довіряє беззаперечно |
| **Проміжні центри** | Сертифікати між кореневими і кінцевими |
| **Ненадійні сертифікати** | Явно заблоковані сертифікати |

---

## Переглянути через PowerShell

```powershell
# Сертифікати поточного користувача
Get-ChildItem Cert:\CurrentUser\My |
  Select-Object Subject, Thumbprint, NotAfter | Format-Table

# Кореневі сертифікати
Get-ChildItem Cert:\LocalMachine\Root |
  Select-Object Subject, NotAfter |
  Where-Object {$_.NotAfter -gt (Get-Date)} |
  Sort-Object NotAfter

# Знайти сертифікат по домену
Get-ChildItem Cert:\LocalMachine\Root |
  Where-Object {$_.Subject -like "*microsoft*"}

# Перевірити термін дії
Get-ChildItem Cert:\CurrentUser\My |
  Where-Object {$_.NotAfter -lt (Get-Date).AddDays(30)} |
  Select-Object Subject, NotAfter
```

---

## Додати кореневий сертифікат

```powershell
# Імпортувати .cer або .crt файл
Import-Certificate -FilePath "C:\cert.cer" `
  -CertStoreLocation Cert:\LocalMachine\Root

# Через certutil
certutil -addstore "Root" "C:\cert.cer"
```

В GUI: `certlm.msc` → **Довірені кореневі центри сертифікації** → правий клік → **Всі завдання** → **Імпорт**.

---

## Видалити сертифікат

```powershell
# Видалити по відбитку (thumbprint)
$thumbprint = "ABC123..."
Remove-Item "Cert:\LocalMachine\Root\$thumbprint"

# Через certutil
certutil -delstore "Root" $thumbprint
```

---

## Помилки SSL і сертифікатів

**"Ваше з'єднання не захищене"** в браузері:
```powershell
# Перевірити системний час (неправильний час = помилки SSL)
Get-Date

# Оновити кореневі сертифікати
certutil -generateSSTFromWU roots.sst
certutil -addstore Root roots.sst
```

**Помилка "Сертифікат виданий недовіреним центром":**
Додай кореневий сертифікат організації в **Довірені кореневі центри**.

---

## Перевірити сертифікат сайту

```powershell
# Перевірити SSL сертифікат сайту
$url = "https://google.com"
$request = [Net.HttpWebRequest]::Create($url)
$request.GetResponse() | Out-Null
$cert = $request.ServicePoint.Certificate
[PSCustomObject]@{
  Subject = $cert.Subject
  Issuer = $cert.Issuer
  Expires = $cert.GetExpirationDateString()
}
```

---

## Резюме

`certmgr.msc` — сертифікати користувача, `certlm.msc` — комп'ютера. Для масового перегляду і пошуку — PowerShell `Get-ChildItem Cert:\`. Помилки SSL часто вирішуються синхронізацією часу або додаванням кореневого сертифіката організації.
