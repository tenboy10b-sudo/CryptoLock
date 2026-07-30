---
title: "Безпечне ядро і захист пам'яті Windows 11: як перевірити за 2 хвилини"
date: "2026-04-30"
updated: "2026-05-24"
publishDate: "2026-04-30"
description: "Як перевірити чи увімкнені HVCI, Secure Boot і захист ядра в Windows 11. Команди PowerShell і де подивитись в Безпека Windows."
tags: ["windows", "безпека", "налаштування", "захист"]
readTime: 4
translatesEn: "how-to-configure-windows-security-key-features"
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
## Часті питання

### Як швидко перевірити статус безпечного ядра?

Відкрий Безпека Windows → Безпека пристрою → Ізоляція ядра. Або в PowerShell: `(Get-CimInstance -ClassName Win32_DeviceGuard -Namespace root\Microsoft\Windows\DeviceGuard).VirtualizationBasedSecurityStatus` — 2 означає увімкнено.

### Чи обов'язково мати Secured-core PC?

Ні. Secured-core — це сертифікація для корпоративних пристроїв. Більшість функцій захисту ядра (HVCI, Secure Boot) можна увімкнути і на звичайному ПК з Windows 11 Pro.

### Чому HVCI вимкнений навіть якщо процесор підтримує?

Часто через несумісний драйвер. Windows вимикає HVCI автоматично якщо виявляє конфліктний драйвер. Перевір: Безпека Windows → Безпека пристрою → Деталі ізоляції ядра.

### Чи вплине увімкнення HVCI на продуктивність?

Незначно — 5-10% на старих процесорах. На сучасних CPU (Intel 8-го покоління і новіших, AMD Zen 2+) вплив мінімальний.

---

## 🛡️ Перевір безпеку свого ПК

Хочеш знати чи немає витоків даних, зайвих служб або підозрілих програм?

**[→ AuditShield](/tools/auditshield)** — аудит Windows по 22 напрямках за 10 хвилин. HTML-звіт з оцінкою ризику. Є безкоштовне демо.

