---
title: "Як встановити Windows 11 з флешки: покрокова інструкція"
date: "2025-04-29"
description: "Створення завантажувальної флешки, налаштування BIOS і чиста установка Windows 11. Що потрібно знати про TPM 2.0 і Secure Boot."
tags: ["windows", "bios", "встановлення", "флешка"]
readTime: 8
---

Чиста установка Windows 11 — найнадійніший спосіб отримати швидку і стабільну систему. Розберемо весь процес від завантаження ISO до першого запуску.

## Що потрібно

- Флешка мінімум 8 ГБ (всі дані буде видалено)
- Утиліта Rufus (rufus.ie) — безкоштовна
- ISO-образ Windows 11 з microsoft.com
- ПК з TPM 2.0 і UEFI

---

## Крок 1. Завантаж Windows 11 ISO

Зайди на microsoft.com/software-download/windows11 → **Download Windows 11 Disk Image (ISO)** → вибери мову → завантаж.

---

## Крок 2. Запиши флешку через Rufus

**Крок 1.** Вставте флешку. Відкрий Rufus.

**Крок 2.** У Rufus:
- **Device:** вибери свою флешку
- **Boot selection:** вибери завантажений ISO
- **Partition scheme:** GPT
- **Target system:** UEFI (non CSM)
- **File system:** NTFS

**Крок 3.** Натисни **Start** → Rufus запитає про режим — вибери **Windows User Experience**:
- ✅ **Remove requirement for 4GB+ RAM, Secure Boot and TPM 2.0** — якщо ПК не відповідає вимогам
- ✅ **Remove requirement for an online Microsoft account** — щоб встановити без акаунта Microsoft

**Крок 4.** Підтверди → зачекай 5–10 хвилин.

---

## Крок 3. Налаштуй BIOS

При включенні ПК натискай Del або F2 → зайди в BIOS.

Перевір:
1. **Secure Boot** → Enabled
2. **TPM** → Enabled (або PTT для Intel, fTPM для AMD)
3. **Boot Mode** → UEFI
4. **Boot Priority** → постав USB на перше місце

Збережи: F10 → Enter.

---

## Крок 4. Встановлення Windows 11

ПК завантажиться з флешки.

1. Вибери мову → **Next**
2. **Install now**
3. Введи ключ або натисни **I don't have a product key**
4. Вибери версію (Home або Pro)
5. **Custom: Install Windows only (advanced)**
6. Вибери диск — **Delete** всі розділи якщо хочеш чисту установку → вибери нерозподілений простір → **Next**

Установка займе 10–20 хвилин і ПК перезавантажиться кілька разів.

---

## Крок 5. Початкове налаштування

Після установки Windows запустить OOBE (Out of Box Experience):

- Вибери регіон і мову
- Підключися до Wi-Fi
- **Увійди в Microsoft Account** або оффлайн-акаунт (якщо обрав цю опцію в Rufus)
- Налаштуй PIN

---

## Якщо ПК не відповідає вимогам TPM 2.0

Є три шляхи:
1. Увімкнути TPM в BIOS (його часто просто вимкнено)
2. Використати Rufus з обходом перевірки
3. Встановити через реєстровий ключ:

```cmd
reg add HKLM\SYSTEM\Setup\MoSetup /v AllowUpgradesWithUnsupportedTPMOrCPU /t REG_DWORD /d 1 /f
```

> Також дивись: [Що робити якщо BIOS не бачить флешку](/bios-ne-bachyt-fleshku) та [Як зайти в BIOS](/yak-zayty-v-bios)
