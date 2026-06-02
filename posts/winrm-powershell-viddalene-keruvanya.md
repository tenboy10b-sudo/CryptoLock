---
title: "WinRM і PowerShell Remoting: налаштування віддаленого керування Windows"
date: "2026-06-18"
publishDate: "2026-06-18"
description: "Увімкнення WinRM для PowerShell Remoting в Windows 10 і 11. Підключення до віддалених ПК, запуск команд і управління кількома машинами через Enter-PSSession."
tags: ["windows", "winrm", "powershell", "remote", "адміністрування"]
readTime: 4
translatesEn: "how-to-configure-windows-remote-management"
---

WinRM дозволяє запускати PowerShell команди на віддалених ПК. Незамінний для управління кількома машинами.

---

## Увімкнути WinRM

```powershell
# Увімкнути (від адміністратора)
Enable-PSRemoting -Force

# Перевірити
Test-WSMan -ComputerName localhost
```

---

## Швидка команда на віддаленому ПК

```powershell
Invoke-Command -ComputerName "PC-Name" -ScriptBlock { Get-Process | Select-Object -First 5 }

# Кілька ПК одночасно
$computers = @("PC01", "PC02", "PC03")
Invoke-Command -ComputerName $computers -ScriptBlock {
  [PSCustomObject]@{
    Computer = $env:COMPUTERNAME
    CPU = (Get-CimInstance Win32_Processor).LoadPercentage
  }
}
```

---

## Інтерактивна сесія

```powershell
# Відкрити інтерактивну сесію
Enter-PSSession -ComputerName "RemotePC"

# Підключення з credentials
$cred = Get-Credential
Enter-PSSession -ComputerName "RemotePC" -Credential $cred

# Вийти
Exit-PSSession
```

---

## TrustedHosts (поза доменом)

```powershell
# Додати конкретний ПК
Set-Item WSMan:\localhost\Client\TrustedHosts -Value "192.168.1.100" -Force

# Кілька ПК
Set-Item WSMan:\localhost\Client\TrustedHosts -Value "PC01,PC02,192.168.1.*" -Force
```

---

## Копіювати файли через сесію

```powershell
$session = New-PSSession -ComputerName "RemotePC"
Copy-Item "C:\Scripts\deploy.ps1" -Destination "C:\Scripts\" -ToSession $session
Remove-PSSession $session
```

---

## Часті питання

### WinRM увімкнений але з'єднання відхилено?

Перевір брандмауер: `Get-NetFirewallRule -DisplayName "*WinRM*"`. Перевір TrustedHosts якщо поза доменом. `Test-WSMan RemotePC` для діагностики.

### Чи безпечний WinRM?

Так при правильному налаштуванні. HTTP (5985) шифрується через Kerberos або NTLM. Для зовнішнього доступу завжди використовуй HTTPS (5986).

---

## Резюме

Увімкнути: `Enable-PSRemoting -Force`. Одна команда: `Invoke-Command`. Інтерактивно: `Enter-PSSession`. Поза доменом: налаштуй TrustedHosts. Постійні сесії для кількох операцій на одному ПК.
