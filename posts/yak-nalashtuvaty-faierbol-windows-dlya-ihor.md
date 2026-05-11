---
title: "Як відкрити порт в брандмауері Windows для гри або програми"
date: "2026-08-08"
publishDate: "2026-08-08"
description: "Як відкрити конкретний порт або дозволити програму через брандмауер Windows. Через графічний інтерфейс і PowerShell для вхідних і вихідних з'єднань."
tags: ["windows", "мережа", "firewall", "налаштування"]
readTime: 4
---

Гра не підключається до серверу, програма не отримує вхідні з'єднання — часто причина в брандмауері Windows. Ось як відкрити потрібний порт або дозволити програму.

---

## Дозволити програму (найпростіше)

`Win + S` → **Брандмауер Windows** → **Дозволити програму або компонент через брандмауер Windows** → **Змінити параметри** → **Дозволити іншу програму** → вибери exe файл → OK.

Встанови галочки для **Приватна** (домашня мережа) і/або **Публічна** мережа.

---

## Відкрити конкретний порт

`Win + S` → **Брандмауер Windows у режимі підвищеної безпеки** (або `Win + R` → `wf.msc`):

1. **Правила для вхідних підключень** → **Нове правило**
2. **Тип правила**: Порт → Далі
3. **Протокол**: TCP або UDP → вкажи порт (наприклад 25565 для Minecraft)
4. **Дія**: Дозволити підключення
5. **Профіль**: вибери Приватна і/або Публічна
6. **Ім'я**: дай зрозумілу назву → Готово

---

## Через PowerShell

```powershell
# Відкрити TCP порт 25565 (Minecraft)
New-NetFirewallRule -DisplayName "Minecraft Server" `
  -Direction Inbound -Protocol TCP -LocalPort 25565 -Action Allow

# Відкрити UDP порт 27015 (Steam/Source ігри)
New-NetFirewallRule -DisplayName "Steam Game UDP" `
  -Direction Inbound -Protocol UDP -LocalPort 27015 -Action Allow

# Дозволити програму
New-NetFirewallRule -DisplayName "My Game" `
  -Direction Inbound `
  -Program "C:\Games\MyGame\game.exe" `
  -Action Allow -Profile Private,Public

# Перевірити що правило створено
Get-NetFirewallRule -DisplayName "Minecraft Server"
```

---

## Популярні порти для ігор

| Гра / Сервіс | Протокол | Порт |
|-------------|---------|------|
| Minecraft Java | TCP | 25565 |
| Minecraft Bedrock | UDP | 19132 |
| Valheim | UDP | 2456-2458 |
| CS2 / Source | UDP | 27015 |
| Steam | TCP/UDP | 27015-27030 |
| Terraria | TCP | 7777 |
| ARK | UDP | 7777, 27015 |

---

## Видалити правило

```powershell
Remove-NetFirewallRule -DisplayName "Minecraft Server"
```

Або в `wf.msc` → знайди правило → правий клік → **Видалити**.

---

## Перевірити чи порт відкритий

```powershell
# Перевірити з іншого ПК або онлайн сервісом
Test-NetConnection -ComputerName ВАШ_IP -Port 25565

# Переглянути відкриті порти локально
Get-NetTCPConnection -LocalPort 25565 -State Listen
```

---

## Резюме

Для програми: Брандмауер → Дозволити програму → вибери exe. Для конкретного порту: `wf.msc` → Нове правило → Порт → вкажи номер. Через PowerShell: `New-NetFirewallRule` — швидше для технічних задач.
