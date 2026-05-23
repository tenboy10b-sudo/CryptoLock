---
title: "Нічний режим і Night Light в Windows: захист очей від синього світла"
date: "2026-08-04"
publishDate: "2026-08-04"
description: "Як увімкнути Night Light в Windows 10 і 11 для зменшення синього світла після заходу сонця. Налаштування розкладу, інтенсивності і автоматичного перемикання."
tags: ["windows", "налаштування", "персоналізація", "здоров'я"]
readTime: 3
---

Night Light зменшує кількість синього світла на екрані у вечірній час — це знижує навантаження на очі і покращує засинання.

---

## Увімкнути Night Light

**Швидко:** Центр сповіщень (правий нижній кут) → клікни плитку **Night Light**.

**Через Параметри:**
`Win + I` → **Система** → **Дисплей** → **Night Light** → увімкни.

---

## Налаштувати розклад і інтенсивність

`Win + I` → **Система** → **Дисплей** → **Night Light** → **Параметри Night Light**:

**Інтенсивність** — повзунок від теплого (менше синього) до холодного. Рекомендовано: 30-50%.

**Розклад:**
- **Від заходу до сходу сонця** — автоматично за геолокацією
- **Встановити години** — вручну, наприклад з 21:00 до 7:00

---

## Через PowerShell

```powershell
# Увімкнути Night Light негайно
$blueLight = Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\CloudStore\Store\DefaultAccount\Current\default$windows.data.bluelightreduction.bluelightreductionstate\windows.data.bluelightreduction.bluelightreductionstate"

# Перевірити статус Night Light
Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\CloudStore\Store\DefaultAccount\Current\default`$windows.data.bluelightreduction.settings\windows.data.bluelightreduction.settings" -ErrorAction SilentlyContinue
```

Простіший варіант — через UI, PowerShell для Night Light досить складний.

---

## Автоматичне перемикання не працює

Якщо опція "Від заходу до сходу" недоступна:

`Win + I` → **Конфіденційність і безпека** → **Розташування** → увімкни **Служби розташування**.

Windows використовує геолокацію щоб визначити час заходу сонця.

---

## Альтернатива: f.lux

Якщо вбудований Night Light не влаштовує — f.lux дає більше контролю:
- Більш плавний перехід
- Налаштування по типу освітлення (лампочка, флуоресцент)
- Профілі для різних активностей

Завантаж з [justgetflux.com](https://justgetflux.com) — безкоштовний.

---


---

## 🛡️ Перевір безпеку свого ПК

Хочеш знати чи немає витоків даних, зайвих служб або підозрілих програм на твоєму ПК?

**[→ AuditShield](/tools/auditshield)** — аудит Windows по 22 напрямках за 10 хвилин. HTML-звіт з оцінкою ризику. Є безкоштовне демо.


## Резюме

`Win + I` → Дисплей → Night Light → увімкни і налаштуй розклад. Рекомендовано: автоматично від заходу до сходу, інтенсивність 40%. Якщо розклад недоступний — увімкни службу розташування.
