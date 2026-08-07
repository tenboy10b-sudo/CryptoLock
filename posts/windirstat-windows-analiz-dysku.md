---
title: "WinDirStat на Windows: як знайти що займає місце на диску"
date: "2026-06-15"
publishDate: "2027-06-01"
updated: "2026-06-15"
description: "Як встановити WinDirStat і знайти великі файли і папки що займають місце на диску Windows. Візуалізація використання диску, видалення зайвого і альтернативи."
tags: ["windows", "windirstat", "диск", "оптимізація", "інструменти"]
readTime: 5
translatesEn: "windirstat-windows-disk-usage-guide"
---

WinDirStat показує що займає місце на твоєму диску у вигляді наочної теплової карти. За хвилину знайдеш файли на 10+ ГБ про існування яких забув.

---

## Встановлення

```powershell
winget install WinDirStat.WinDirStat
```
Або з [windirstat.net](https://windirstat.net).

**Альтернатива — WizTree** (швидший, безкоштовний):
```powershell
winget install AntibodySoftware.WizTree
```

---

## Як користуватись

1. Запусти WinDirStat від адміністратора
2. Вибери диск або папку для аналізу
3. Зачекай поки просканує (1-5 хвилин залежно від розміру)
4. Дивись результати

**Три панелі:**
- **Верхня ліва** — дерево папок з розмірами
- **Верхня права** — список розширень файлів з відсотком
- **Нижня** — теплова карта (кожен прямокутник = файл, розмір = площа)

---

## Читання теплової карти

- **Великий прямокутник** = великий файл
- **Колір** = тип файлу (за розширенням — легенда вгорі)
- **Клік на прямокутник** → підсвічує файл в дереві вгорі

---

## Знайти і видалити великі файли

1. Клікни на найбільші прямокутники на карті
2. Правою кнопкою → **"Explorer Here"** — відкрити в Провіднику
3. Або **"Delete"** — видалити прямо з WinDirStat

**Типові "пожирачі місця":**

| Папка | Що там | Безпечно видалити? |
|-------|--------|-------------------|
| `C:\Windows\SoftwareDistribution` | Кеш Windows Update | ✅ Зупини wuauserv спочатку |
| `C:\Windows\Temp` | Тимчасові файли | ✅ |
| `%TEMP%` | Тимчасові файли користувача | ✅ |
| `C:\Users\*\Downloads` | Завантажені файли | ⚠️ Перевір перед видаленням |
| `C:\Users\*\AppData\Local\Temp` | Тимчасові додатків | ✅ |
| `hiberfil.sys` | Файл гібернації | ✅ `powercfg /h off` |
| `pagefile.sys` | Файл підкачки | ❌ Не видаляй |

---

## PowerShell — знайти великі файли без програм

```powershell
# Топ-20 найбільших файлів на диску C:
Get-ChildItem C:\ -Recurse -ErrorAction SilentlyContinue |
    Sort-Object Length -Descending |
    Select-Object FullName, @{N='SizeMB';E={[math]::Round($_.Length/1MB,1)}} |
    Select-Object -First 20

# Великі папки в конкретній директорії
Get-ChildItem "C:\Users" -Directory |
    ForEach-Object {
        $size = (Get-ChildItem $_.FullName -Recurse -ErrorAction SilentlyContinue |
            Measure-Object Length -Sum).Sum
        [PSCustomObject]@{ Name=$_.Name; SizeGB=[math]::Round($size/1GB,2) }
    } | Sort-Object SizeGB -Descending
```

---

## Звільнити місце після аналізу

```powershell
# Очистити тимчасові файли
Remove-Item "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "C:\Windows\Temp\*" -Recurse -Force -ErrorAction SilentlyContinue

# Очистити кеш Windows Update
Stop-Service wuauserv -Force
Remove-Item "C:\Windows\SoftwareDistribution\Download\*" -Recurse -Force
Start-Service wuauserv

# Вимкнути гібернацію (звільнить hiberfil.sys ~4-16 ГБ)
powercfg /h off
```

---

## WinDirStat vs WizTree vs SpaceSniffer

| | WinDirStat | WizTree | SpaceSniffer |
|-|-----------|---------|-------------|
| Швидкість | Повільна | Дуже швидка | Середня |
| Теплова карта | ✅ | ✅ | ✅ |
| Безкоштовно | ✅ | ✅ | ✅ |
| Портативний | ❌ | ✅ | ✅ |

---

## Резюме

```
1. Запусти WinDirStat від адміністратора
2. Вибери диск → скануй
3. Клікай на великі прямокутники → знаходь файли
4. ПКМ → Explorer Here або Delete
5. Типово: Windows\Temp, SoftwareDistribution, Downloads
```
