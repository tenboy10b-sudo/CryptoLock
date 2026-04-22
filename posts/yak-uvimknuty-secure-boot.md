---
title: "Як увімкнути Secure Boot в BIOS і навіщо він потрібен"
date: "2026-04-20"
description: "Що таке Secure Boot, як його увімкнути в UEFI/BIOS і вирішити проблеми із завантаженням після активації."
tags: ["bios", "uefi", "безпека", "завантаження"]
readTime: 5
---

Secure Boot — захист який перевіряє цифровий підпис завантажуваного ПЗ. Windows 11 вимагає його обов'язково. Розберемо як увімкнути правильно.

## Навіщо потрібен Secure Boot

Secure Boot захищає від:
- Завантаження заражених завантажувачів (bootkit)
- Підміни системних файлів до запуску Windows
- UEFI-руткітів які неможливо видалити через Windows

Мінус: деякі Linux дистрибутиви і старі завантажувачі не мають підпису Microsoft і не запустяться.

---

## Перевір поточний стан

**Спосіб 1 — через msinfo32:**
`Win + R` → `msinfo32` → рядок **Secure Boot State**:
- `On` — увімкнено
- `Off` — вимкнено
- `Unsupported` — BIOS не підтримує

**Спосіб 2 — через PowerShell:**
```powershell
Confirm-SecureBootUEFI
```
`True` — увімкнено, `False` — вимкнено.

---

## Як увімкнути Secure Boot в BIOS

**Крок 1.** Зайди в BIOS:
- При включенні натискай Del або F2 (або дивись [як зайти в BIOS](/yak-zayty-v-bios))

**Крок 2.** Знайди Secure Boot. Зазвичай у розділі:
- **Security** → Secure Boot
- **Boot** → Secure Boot
- **Advanced** → Secure Boot Configuration

**Крок 3.** Встанови **Secure Boot: Enabled**.

**Крок 4.** Збережи: F10 → Enter.

---

## Якщо після увімкнення Windows не завантажується

Причина: диск відформатований як MBR, а Secure Boot вимагає GPT.

**Перевір:**
```cmd
mbr2gpt /validate /disk:0
```

Якщо `Disk 0 is eligible for conversion` — можна конвертувати без втрати даних:
```cmd
mbr2gpt /convert /disk:0
```

Після конвертації поверни в BIOS і поміняй Boot Mode на UEFI.

---

## Режим Secure Boot: Setup Mode vs User Mode

- **User Mode** — стандартний захищений режим
- **Setup Mode** — дозволяє встановити власні ключі (для enterprise або Linux)

Якщо BIOS показує **Setup Mode** — увімкни **Restore Factory Keys** або **Install default keys** щоб перейти в User Mode.

---

## Secure Boot і Linux

Більшість популярних дистрибутивів (Ubuntu, Fedora, openSUSE) підтримують Secure Boot через shim-підписувач. Проблеми можуть виникнути зі старими або нішевими дистрибутивами.
