---
title: "Безпечне ядро Windows 11: що це і як увімкнути"
date: "2026-04-30"
publishDate: "2026-04-30"
description: "Що таке Secured-core PC і безпечне ядро Windows 11, які функції захисту воно включає і як перевірити чи вони увімкнені на твоєму ПК."
tags: ["windows", "безпека", "налаштування", "захист"]
readTime: 4
---

Secured-core PC — рівень апаратного захисту що Microsoft вимагає від корпоративних пристроїв. Але перевірити і частково увімкнути можна на будь-якому ПК.

---

## Що входить в безпечне ядро

- **TPM 2.0** — захист ключів шифрування
- **Secure Boot** — блокує шкідливе ПЗ при завантаженні
- **VBS** (Virtualization-Based Security) — ізоляція критичних процесів
- **HVCI** (Hypervisor-Protected Code Integrity) — захист від атак на драйвери
- **Windows Defender Credential Guard** — захист облікових даних

---

## Перевірити статус

`Win + R` → `msinfo32` → шукай в розділі **System Summary**:
- Virtualization-based security: Running
- Kernel DMA Protection: On
- Secure Boot State: On

```powershell
# Через PowerShell
Get-CimInstance -ClassName Win32_DeviceGuard -Namespace root\Microsoft\Windows\DeviceGuard |
  Select-Object VirtualizationBasedSecurityStatus, CodeIntegrityPolicyEnforcementStatus
```

---

## Увімкнути VBS і HVCI

`Параметри` → `Windows Security` → `Device Security` → `Core Isolation Details` → увімкни **Memory Integrity (HVCI)** → перезавантаж.

---

## Підсумок

Мінімум: TPM 2.0 + Secure Boot + Memory Integrity (HVCI) увімкнені. Перевір через `msinfo32`. Ці три функції захищають від більшості сучасних апаратних атак.
