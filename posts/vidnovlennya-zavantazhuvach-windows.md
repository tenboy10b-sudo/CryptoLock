---
title: "Як відновити завантажувач Windows після помилки"
date: "2026-04-15"
description: "Відновлення пошкодженого завантажувача Windows через bootrec, bcdboot і середовище відновлення без перевстановлення системи."
tags: ["відновлення", "завантаження", "bios", "cmd"]
readTime: 6
---

ПК не запускається і показує `BOOTMGR is missing` або `No boot device`? Завантажувач можна відновити без перевстановлення Windows.

## Що таке завантажувач Windows

Завантажувач (Boot Manager) — невеликий файл на окремому розділі диска який запускає Windows. Якщо він пошкоджений або відсутній — система не стартує.

---

## Що потрібно

- Завантажувальна флешка з Windows 10 або 11
- Доступ до Command Prompt з середовища відновлення

---

## Крок 1. Завантажся з флешки

Вставте флешку → зайди в BIOS Boot Menu (зазвичай F8, F11 або F12 при старті) → вибери флешку.

На екрані встановлення: **Repair your computer** → **Troubleshoot** → **Advanced options** → **Command Prompt**.

---

## Крок 2. Відновлення через bootrec

```cmd
bootrec /fixmbr
bootrec /fixboot
bootrec /scanos
bootrec /rebuildbcd
```

**Що роблять команди:**
- `/fixmbr` — відновлює Master Boot Record
- `/fixboot` — записує новий завантажувальний сектор
- `/scanos` — знаходить всі інсталяції Windows
- `/rebuildbcd` — перебудовує Boot Configuration Data

Після виконання всіх команд перезавантаж без флешки.

---

## Якщо bootrec не допоміг: bcdboot

```cmd
bcdboot C:\Windows /s C: /f UEFI
```

Для Legacy BIOS:
```cmd
bcdboot C:\Windows /s C: /f BIOS
```

Якщо диск C: не визначається — спочатку дізнайся правильну літеру:
```cmd
diskpart
list volume
exit
```

Знайди розділ з Windows і підстав правильну літеру.

---

## Якщо диск GPT і завантаження через UEFI

```cmd
diskpart
list disk
select disk 0
list partition
```

Знайди EFI розділ (зазвичай 100–500 МБ, тип System) → призначи йому літеру:
```cmd
select partition 1
assign letter=Z
exit
```

Тепер відновлюй завантажувач на цей розділ:
```cmd
bcdboot C:\Windows /s Z: /f UEFI
```

---

## Помилка 0xc000000f

Ця помилка означає що BCD (Boot Configuration Data) пошкоджений або відсутній.

```cmd
bcdedit /export C:\BCD_Backup
attrib C:\Boot\BCD -h -r -s
ren C:\Boot\BCD BCD.old
bootrec /rebuildbcd
```

---

## Перевірка після відновлення

```cmd
bcdedit
```

Має показати запис Windows Boot Loader з правильним шляхом до Windows.

> Також дивись: [Як скинути Windows до заводських налаштувань](/yak-skynute-windows-do-zavodskykh)
