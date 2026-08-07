---
title: "Windows Sandbox: ізольоване середовище для безпечного запуску програм"
date: "2026-06-18"
publishDate: "2027-06-01"
updated: "2026-06-18"
description: "Як увімкнути і використовувати Windows Sandbox на Windows 10 і 11 Pro. Запуск підозрілих програм в ізоляції, налаштування конфігурацій і обмеження Sandbox."
tags: ["windows", "sandbox", "безпека", "віртуалізація", "інструменти"]
readTime: 6
translatesEn: "windows-sandbox-guide"
---

Windows Sandbox — вбудована в Windows 10/11 Pro ізольована середовище для безпечного тестування програм. Запускаєш підозрілий файл, закриваєш Sandbox — і від нього не залишається жодного сліду в системі.

---

## Що таке Windows Sandbox

Sandbox — легка віртуальна машина що використовує той самий образ Windows що встановлений на твоєму ПК. Кожен запуск — чиста система. Після закриття — все видаляється автоматично.

**Переваги перед VirtualBox:**
- Не потрібно завантажувати образ Windows окремо
- Запускається за 5-10 секунд
- Автоматично видаляє всі зміни після закриття
- Вбудований в Windows — нічого не треба встановлювати

**Обмеження:**
- Тільки Windows 10/11 **Pro, Enterprise або Education**
- Не зберігає стан між сесіями
- Немає знімків (snapshots)

---

## Системні вимоги

- Windows 10 версія 1903+ або Windows 11
- **Pro, Enterprise або Education** редакція
- 4 ГБ RAM (рекомендовано 8 ГБ)
- 1 ГБ вільного місця
- Увімкнена віртуалізація (VT-x/AMD-V) в BIOS

---

## Увімкнення Windows Sandbox

### Спосіб 1 — через "Компоненти Windows"

```
Win + R → optionalfeatures
→ Windows Sandbox → ✅ → OK → Перезавантаження
```

### Спосіб 2 — PowerShell

```powershell
# Увімкнути Windows Sandbox
Enable-WindowsOptionalFeature -FeatureName "Containers-DisposableClientVM" -Online -All

# Перевірити статус
Get-WindowsOptionalFeature -Online -FeatureName "Containers-DisposableClientVM"
```

Після перезавантаження знайди **Windows Sandbox** в меню Пуск.

---

## Запуск і базове використання

1. Пуск → **Windows Sandbox**
2. Зачекай 5-15 секунд поки завантажиться
3. Відкривається вікно з чистою Windows
4. Скопіюй файл в Sandbox (перетягни або через буфер обміну)
5. Запусти файл — все що відбувається всередині ізольоване
6. Закрий вікно Sandbox → підтверди → всі зміни видалені

---

## Конфігураційні файли (.wsb)

Windows Sandbox підтримує конфігурацію через XML файли з розширенням `.wsb`:

### Базова конфігурація

```xml
<Configuration>
  <VGpu>Enable</VGpu>
  <Networking>Enable</Networking>
  <MappedFolders>
    <MappedFolder>
      <HostFolder>C:\Users\user\Downloads</HostFolder>
      <SandboxFolder>C:\Users\WDAGUtilityAccount\Desktop\Downloads</SandboxFolder>
      <ReadOnly>true</ReadOnly>
    </MappedFolder>
  </MappedFolders>
  <LogonCommand>
    <Command>explorer.exe C:\Users\WDAGUtilityAccount\Desktop\Downloads</Command>
  </LogonCommand>
</Configuration>
```

Зберегти як `sandbox.wsb` → двічі клікни щоб запустити Sandbox з цими налаштуваннями.

### Параметри конфігурації

| Параметр | Значення | Опис |
|---------|---------|------|
| `VGpu` | Enable/Disable | Відеоприскорення |
| `Networking` | Enable/Disable | Доступ до інтернету |
| `MappedFolders` | шлях | Спільна папка з хостом |
| `ReadOnly` | true/false | Тільки читання |
| `LogonCommand` | команда | Запустити при старті |
| `MemoryInMB` | 2048 | Обсяг RAM |

### Конфіг без інтернету (для безпечного тестування)

```xml
<Configuration>
  <Networking>Disable</Networking>
  <MappedFolders>
    <MappedFolder>
      <HostFolder>C:\Sandbox-Files</HostFolder>
      <ReadOnly>true</ReadOnly>
    </MappedFolder>
  </MappedFolders>
</Configuration>
```

---

## Практичні сценарії використання

### Тестування підозрілих програм
1. Скопіюй підозрілий `.exe` в Sandbox
2. Запусти і подивись що відбувається
3. Закрий Sandbox — сліду немає

### Тестування інсталяторів
Перш ніж встановлювати нову програму — протестуй в Sandbox:
- Що вона встановлює
- Чи додається в автозапуск
- Чи з'являється реклама

### Перегляд підозрілих сайтів
Відкрий Edge в Sandbox → відвідай підозрілий сайт → закрий.

### Тестування скриптів PowerShell

```xml
<Configuration>
  <Networking>Disable</Networking>
  <LogonCommand>
    <Command>powershell.exe -ExecutionPolicy Bypass -File C:\Users\WDAGUtilityAccount\Desktop\test.ps1</Command>
  </LogonCommand>
</Configuration>
```

---

## Чому Sandbox не запускається

### "Windows Sandbox не знайдено в меню Пуск"
Перевір редакцію Windows:
```powershell
Get-WindowsEdition -Online
# Потрібна Pro, Enterprise або Education
```

### "Hypervisor не запущений"
Увімкни Hyper-V і VT-x в BIOS:
```powershell
# Увімкнути Hyper-V
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
```

### Sandbox зависає при запуску
Перевір чи увімкнена Hyper-V Platform:
```
optionalfeatures → Hyper-V Platform → ✅
```

---

## Резюме

| Задача | Рішення |
|--------|---------|
| Увімкнути | optionalfeatures → Windows Sandbox |
| Запустити | Пуск → Windows Sandbox |
| Передати файл | Перетягни або Ctrl+C/V |
| Ізоляція від мережі | .wsb файл: `<Networking>Disable</Networking>` |
| Спільна папка | .wsb: MappedFolders |
| Очистити | Просто закрити вікно |
