---
title: "Сертифікати в Windows: управління через certmgr і PowerShell"
date: "2026-09-09"
publishDate: "2026-09-09"
description: "Управління SSL/TLS сертифікатами в Windows: certmgr.msc, імпорт і експорт сертифікатів, перевірка терміну дії, розгортання через GPO і PowerShell."
tags: ["windows", "безпека", "адміністрування", "powershell", "мережа"]
readTime: 7
---

Сертифікати в Windows використовуються для HTTPS, підпису коду, EFS, VPN і автентифікації. Вміння ними управляти — базова навичка адміністратора.

---

## Де зберігаються сертифікати

Windows має кілька сховищ сертифікатів:

| Сховище | Призначення |
|---------|------------|
| Personal (My) | Особисті сертифікати з приватним ключем |
| Trusted Root CA | Кореневі довірені центри сертифікації |
| Intermediate CA | Проміжні центри сертифікації |
| Trusted Publishers | Довірені видавці ПЗ |
| Untrusted | Заблоковані сертифікати |

**Два рівні:**
- `certmgr.msc` — для поточного користувача
- `certlm.msc` — для локального комп'ютера (локальна машина)

---

## Перегляд сертифікатів через GUI

```
Win + R → certmgr.msc  (поточний користувач)
Win + R → certlm.msc   (комп'ютер)
```

---

## PowerShell — управління сертифікатами

```powershell
# Список всіх сертифікатів поточного користувача
Get-ChildItem Cert:\CurrentUser\My

# Сертифікати комп'ютера
Get-ChildItem Cert:\LocalMachine\My

# Всі сховища
Get-ChildItem Cert:\ | Get-ChildItem

# Детальна інформація про сертифікат
Get-ChildItem Cert:\LocalMachine\My |
  Select-Object Subject, Thumbprint, NotBefore, NotAfter, Issuer |
  Format-Table -AutoSize

# Сертифікати що закінчуються через 30 днів
Get-ChildItem -Path Cert:\LocalMachine\My |
  Where-Object { $_.NotAfter -lt (Get-Date).AddDays(30) } |
  Select-Object Subject, NotAfter, Thumbprint
```

---

## Імпорт сертифіката

### PFX (з приватним ключем)

```powershell
# Імпорт PFX
$password = ConvertTo-SecureString "CertPassword!" -AsPlainText -Force
Import-PfxCertificate `
  -FilePath "C:\certs\mycert.pfx" `
  -CertStoreLocation "Cert:\LocalMachine\My" `
  -Password $password

# Або через certlm.msc: Personal → Certificates → правою → All Tasks → Import
```

### CER/CRT (тільки публічний ключ)

```powershell
# Імпорт CER сертифіката
Import-Certificate `
  -FilePath "C:\certs\rootca.cer" `
  -CertStoreLocation "Cert:\LocalMachine\Root"
```

---

## Експорт сертифіката

```powershell
# Знайти сертифікат
$cert = Get-ChildItem Cert:\LocalMachine\My |
  Where-Object { $_.Subject -like "*mycert*" }

# Експортувати як CER (без приватного ключа)
Export-Certificate -Cert $cert -FilePath "C:\backup\mycert.cer"

# Експортувати як PFX (з приватним ключем)
$password = ConvertTo-SecureString "BackupPassword!" -AsPlainText -Force
Export-PfxCertificate `
  -Cert $cert `
  -FilePath "C:\backup\mycert.pfx" `
  -Password $password
```

---

## Розгортання сертифікатів через GPO

Для автоматичного розгортання кореневого CA на всі ПК домену:

`gpmc.msc` → потрібний GPO → **Computer Configuration** → **Windows Settings** → **Security Settings** → **Public Key Policies** → **Trusted Root Certification Authorities** → правою → **Import** → вибери .cer файл.

Або через PowerShell на всіх ПК:

```powershell
# Розгорнути на всі ПК через Invoke-Command
$certData = [System.IO.File]::ReadAllBytes("C:\certs\rootca.cer")

Invoke-Command -ComputerName (Get-ADComputer -Filter *).Name -ScriptBlock {
    param($data)
    $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2
    $cert.Import($data)
    $store = New-Object System.Security.Cryptography.X509Certificates.X509Store("Root", "LocalMachine")
    $store.Open("ReadWrite")
    $store.Add($cert)
    $store.Close()
} -ArgumentList (,$certData) -ErrorAction SilentlyContinue
```

---

## Видалення сертифіката

```powershell
# Знайти і видалити за Thumbprint
$thumbprint = "1A2B3C4D..."
Remove-Item "Cert:\LocalMachine\My\$thumbprint"

# Видалити прострочені сертифікати
Get-ChildItem Cert:\LocalMachine\My |
  Where-Object { $_.NotAfter -lt (Get-Date) } |
  Remove-Item
```

---

## Перевірка ланцюжка сертифікатів

```powershell
# Перевірити валідність сертифіката
$cert = Get-ChildItem Cert:\LocalMachine\My | Select-Object -First 1
$chain = New-Object Security.Cryptography.X509Certificates.X509Chain
$chain.Build($cert)
$chain.ChainStatus | Select-Object Status, StatusInformation

# Якщо ChainStatus порожній — сертифікат валідний
```

---

## Самопідписаний сертифікат для тестування

```powershell
# Створити самопідписаний сертифікат
$cert = New-SelfSignedCertificate `
  -DnsName "myserver.local", "localhost" `
  -CertStoreLocation "Cert:\LocalMachine\My" `
  -NotAfter (Get-Date).AddYears(2) `
  -KeyUsage DigitalSignature, KeyEncipherment `
  -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.1")

Write-Output "Thumbprint: $($cert.Thumbprint)"
```

---

## Підсумок

`Get-ChildItem Cert:\LocalMachine\My` — переглянути сертифікати. `Import-PfxCertificate` — імпортувати PFX. `Export-PfxCertificate` — резервна копія з приватним ключем. Перевіряй прострочені сертифікати регулярно — `Where-Object { $_.NotAfter -lt (Get-Date).AddDays(30) }`. GPO Trusted Root CA — автоматичне розгортання корпоративного CA на всі ПК.
