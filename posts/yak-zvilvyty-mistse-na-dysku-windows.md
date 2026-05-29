---
title: "Як звільнити місце на диску Windows 10 і 11: повний гайд"
date: "2027-02-10"
publishDate: "2027-02-10"
description: "Звільнення місця на диску Windows: видалення тимчасових файлів, кешу оновлень, папки Windows.old, WinSxS і пошук великих файлів через PowerShell."
tags: ["windows", "диск", "сховище", "оптимізація", "очищення"]
readTime: 4
translatesEn: "how-to-free-up-disk-space-windows"
---

Мало місця на диску гальмує Windows і блокує оновлення. Ось як безпечно відновити гігабайти простору.

---

## Швидкий результат: Disk Cleanup

```powershell
cleanmgr /sageset:1
cleanmgr /sagerun:1
```

Зазвичай звільняє 2-10 ГБ — кеш оновлень, тимчасові файли, кошик.

---

## Видалити тимчасові файли

```powershell
Remove-Item "$env:TEMP\*" -Recurse -Force -EA 0
Remove-Item "C:\Windows\Temp\*" -Recurse -Force -EA 0
Remove-Item "C:\Windows\Prefetch\*" -Force -EA 0
```

---

## Видалити Windows.old

Після оновлення до Windows 11 попередня версія залишається як `Windows.old`:

```powershell
# Перевірити розмір
(Get-ChildItem "C:\Windows.old" -Recurse -EA 0 | Measure-Object Length -Sum).Sum / 1GB

# Disk Cleanup → Очистити системні файли → Попередня установка Windows
```

---

## Очистити кеш Windows Update

```powershell
Stop-Service wuauserv -Force
Remove-Item "C:\Windows\SoftwareDistribution\Download\*" -Recurse -Force -EA 0
Start-Service wuauserv
```

---

## Зменшити папку WinSxS

```powershell
Dism /Online /Cleanup-Image /AnalyzeComponentStore
Dism /Online /Cleanup-Image /StartComponentCleanup /ResetBase
```

---

## Знайти великі файли

```powershell
# Топ-20 найбільших файлів
Get-ChildItem C:\ -Recurse -File -EA 0 |
  Sort-Object Length -Descending |
  Select-Object -First 20 FullName, @{n='ГБ';e={[math]::Round($_.Length/1GB,2)}}
```

---

## Часті питання

### Скільки вільного місця потрібно Windows 11?

Мінімум 20 ГБ вільно для нормальної роботи. Windows 11 потребує мінімум 64 ГБ всього і рекомендує завжди мати 15-20 ГБ вільних для оновлень і файлу підкачки.

### Чи безпечно видаляти Windows.old?

Так, якщо Windows 11 працює нормально. Після 10 днів Windows сама пропонує видалити. Потрібна тільки для відкату до попередньої версії.

### Папка WinSxS займає 20 ГБ — можна видалити?

Ніколи не видаляй WinSxS вручну. Використовуй `DISM /Cleanup-Image /StartComponentCleanup` — безпечно видаляє тільки застарілі компоненти.

---

## Резюме

Спочатку Disk Cleanup з системними файлами. Видали тимчасові файли. Видали Windows.old якщо є. Очисти SoftwareDistribution. DISM для WinSxS. Знайди великі файли через PowerShell. Storage Sense для автоматичного обслуговування.
