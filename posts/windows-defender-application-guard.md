---
title: "Windows Defender Application Guard: ізольований браузер для безпеки"
date: "2026-07-06"
publishDate: "2026-07-06"
description: "Увімкнення Application Guard для відкриття ненадійних сайтів у ізольованому Hyper-V контейнері. Налаштування WDAG для Edge, довірені сайти і моніторинг сесій."
tags: ["windows", "application-guard", "безпека", "edge", "віртуалізація"]
readTime: 4
translatesEn: "how-to-configure-windows-defender-application-guard"
---

Application Guard відкриває ненадійні сайти в одноразовому Hyper-V контейнері — якщо сайт доставить малваре, воно не зможе вийти на реальний ПК.

---

## Вимоги

- Windows 10/11 **Pro**, **Enterprise** або **Education**
- Віртуалізація увімкнена в BIOS
- Мінімум 8 ГБ RAM

---

## Увімкнути

```powershell
Enable-WindowsOptionalFeature -Online -FeatureName "Windows-Defender-ApplicationGuard" -NoRestart
Restart-Computer
```

Або: `Win + R` → `optionalfeatures` → Windows Defender Application Guard → OK → Перезавантажити

---

## Відкрити сайт в Application Guard

В Microsoft Edge: **...** → **Нове вікно Application Guard**

Або ПКМ на посиланні → **Відкрити посилання у вікні Application Guard**

---

## Налаштування буфера обміну

```powershell
# 0=заборонено, 1=тільки хост→контейнер, 2=контейнер→хост, 3=двостороннє
Set-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\AppHVSI" `
  -Name "AppHVSIClipboardSettings" -Value 1 -Type DWord
```

---

## Довірені сайти (не відкриваються в контейнері)

```powershell
$enterpriseSites = "HKLM:\SOFTWARE\Policies\Microsoft\AppHVSI\DomainList"
New-Item -Path $enterpriseSites -Force | Out-Null
Set-ItemProperty $enterpriseSites -Name "1" -Value "*.company.com"
Set-ItemProperty $enterpriseSites -Name "2" -Value "intranet.example.com"
```

---

## Часті питання

### Вікно Application Guard відкривається повільно?

Так — перший запуск займає 10-30 секунд поки Hyper-V запускає контейнер. Наступні запуски в тій самій сесії швидші.

### Чи може малваре з контейнера заразити ПК?

Контейнер не має доступу до файлової системи хоста. Буфер обміну і завантаження файлів можуть бути векторами — тримай буфер в режимі тільки хост→контейнер.

---

## Резюме

Увімкнення через `optionalfeatures`. Відкривай ненадійні сайти через Edge → Нове вікно Application Guard. Буфер тільки в один бік. Довірені сайти через реєстр або GPO.
