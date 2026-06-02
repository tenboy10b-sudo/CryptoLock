---
title: "Правила зменшення поверхні атаки (ASR) Windows Defender"
date: "2026-06-30"
publishDate: "2026-06-30"
description: "Увімкнення правил Attack Surface Reduction для блокування поширених технік атак. Налаштування ASR через PowerShell і GPO, моніторинг заблокованих дій."
tags: ["windows", "windows-defender", "безпека", "asr", "powershell"]
readTime: 4
translatesEn: "how-to-configure-windows-defender-attack-surface"
---

Правила ASR блокують конкретні поведінки що малваре часто використовує — макроси Office, крадіжку credentials, шифрування файлів.

---

## Режими ASR

- **0** = Вимкнено
- **1** = Блокувати
- **2** = Аудит (логувати без блокування — почни з цього)
- **6** = Попереджувати

---

## Увімкнути в режимі аудиту

```powershell
$rules = @(
  "D4F940AB-401B-4EFC-AADC-AD5F3C50688A",  # Office не запускає дочірні процеси
  "9E6C4E1F-7D60-472F-BA1A-A39EF669E4B2",  # Блокування крадіжки credentials з LSASS
  "C1DB55AB-C21A-4637-BB3F-A12568109D35",  # Блокування операцій типу ransomware
  "5BEB7EFE-FD9A-4556-801D-275E5FFC04CC",  # Блокування виконання з USB
  "D3E037E1-3EB8-44C8-A917-57927947596D"   # JS/VBS не виконує завантажений контент
)

foreach ($rule in $rules) {
  Add-MpPreference -AttackSurfaceReductionRules_Ids $rule `
    -AttackSurfaceReductionRules_Actions AuditMode
}
```

---

## Переключити на Блокування

Після тижня аудиту і перевірки відсутності помилкових спрацьовувань:

```powershell
foreach ($rule in $rules) {
  Add-MpPreference -AttackSurfaceReductionRules_Ids $rule `
    -AttackSurfaceReductionRules_Actions Enabled
}
```

---

## Моніторинг подій ASR

```powershell
# Event IDs: 1121 (заблоковано), 1122 (аудит)
Get-WinEvent -FilterHashtable @{
  LogName='Microsoft-Windows-Windows Defender/Operational'
  Id=1121,1122
} -MaxEvents 20 | Select-Object TimeCreated, Id, Message | Format-List
```

---

## Виключення для конкретного застосунку

```powershell
Add-MpPreference -AttackSurfaceReductionOnlyExclusions "C:\LegitApp\app.exe"
```

---

## Часті питання

### ASR заблокував легітимний застосунок?

Додай виключення через `Add-MpPreference -AttackSurfaceReductionOnlyExclusions`.

### Чи впливають правила ASR на Microsoft Office?

Деякі правила блокують специфічну поведінку Office що малваре використовує. Спочатку режим аудиту — перевір що блокується у твоєму середовищі.

---

## Резюме

Починай з режиму аудиту на тиждень. Переглядай Event ID 1121/1122. Переходь на Блокування після перевірки. Найважливіші: Office child process, LSASS credentials, ransomware file operations.
