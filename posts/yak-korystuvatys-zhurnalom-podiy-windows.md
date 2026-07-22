---
title: "Event Viewer: повний гайд по журналу подій Windows"
date: "2026-05-05"
updated: "2026-07-21"
publishDate: "2026-05-05"
description: "Як читати журнал подій Windows: структура, рівні подій, ключові Event ID для безпеки і збоїв, PowerShell-команди, а також очищення і налаштування розміру логів."
tags: ["windows", "діагностика", "безпека", "моніторинг", "powershell", "адміністрування"]
translatesEn: "how-to-monitor-windows-security-events"
readTime: 11
---

Event Viewer — вбудований інструмент Windows, що записує все, що відбувається в системі: збої програм, помилки драйверів, спроби входу. Якщо щось пішло не так — відповідь майже завжди тут.

---

## Як відкрити

`Win + R` → `eventvwr.msc`

Або: `Win + S` (пошук) → **Перегляд подій**

---

## Структура журналів

**Журнали Windows** — основні:
- **Application (Програма)** — події програм і служб, краші застосунків
- **Security (Безпека)** — входи, спроби входу, зміни облікових записів і прав
- **System (Система)** — драйвери, апаратні проблеми, збої служб

**Applications and Services Logs (Служби і програми)** — деталізовані журнали окремих компонентів (Windows Update, Defender, PowerShell, Performance тощо).

### Рівні подій

| Рівень | Що означає |
|---|---|
| **Critical** | Збій системи або компонента — потребує негайної уваги |
| **Error** | Серйозна проблема — функція або служба не працює |
| **Warning** | Потенційна проблема — варто перевірити |
| **Information** | Нормальні операції системи |

**Event ID** — ключ до розуміння: одне і те ж число завжди означає одну і ту саму подію, незалежно від того коли й на якому ПК вона сталась. Двічі клікни на подію, щоб побачити деталі: Event ID, Source, Level, час і опис.

---

## Знайти причину збою чи зависання

Після зависання чи неочікуваного перезавантаження:

**Журнали Windows** → **Система** → правий клік → **Фільтрувати поточний журнал** → рівень **Критичний** і **Помилка** → знайди події навколо часу збою.

```powershell
# Критичні події за останню добу
Get-WinEvent -FilterHashtable @{LogName='System'; Level=1,2; StartTime=(Get-Date).AddDays(-1)} |
  Select-Object TimeCreated, ProviderName, Message | Format-List
```

### Знайти причину краху програми

**Журнали Windows** → **Програма** → фільтр **Помилка** → джерело **Application Error** або назва конкретної програми.

```powershell
# Краші програм (Event ID 1000)
Get-WinEvent -FilterHashtable @{LogName='Application'; Id=1000} -MaxEvents 10 |
  Select-Object TimeCreated,
    @{n='App';e={$_.Properties[0].Value}},
    @{n='Version';e={$_.Properties[1].Value}},
    @{n='Module';e={$_.Properties[4].Value}}
```

### Перевірити час завантаження

**Служби і програми** → **Microsoft** → **Windows** → **Diagnostics-Performance** → **Operational** → Event ID **100** — показує загальний час завантаження в мс і які процеси затримали старт.

---

## Моніторинг безпеки

```powershell
# Невдалі спроби входу за останню добу — з ім'ям користувача і IP
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625} |
  Where-Object {$_.TimeCreated -gt (Get-Date).AddHours(-24)} |
  Select-Object TimeCreated,
    @{n='User';e={$_.Properties[5].Value}},
    @{n='IP';e={$_.Properties[19].Value}} |
  Sort-Object TimeCreated -Descending
```

Багато спроб з одного IP за короткий час — ознака brute-force атаки. Блокуй через брандмауер.

---

## Довідник ключових Event ID

| ID | Журнал | Що означає |
|---|---|---|
| 41 | System | Жорстке вимкнення (BSOD або знеструмлення) |
| 6005 | System | Система запущена |
| 6006 | System | Чисте завершення роботи |
| 6008 | System | Неочікуване вимкнення |
| 7034 | System | Служба впала несподівано |
| 7045 | System | Встановлено нову службу (перевір — типова ознака малваре) |
| 1000 / 1001 | Application | Краш програми / Windows Error Reporting |
| 4624 | Security | Успішний вхід |
| 4625 | Security | Невдала спроба входу |
| 4698 | Security | Нове заплановане завдання |
| 4720 | Security | Створено новий обліковий запис |
| 1102 | Security | Журнал безпеки очищено (можлива спроба приховати сліди) |
| 100 | Diagnostics-Performance | Час завантаження системи |

Незнайомий Event ID поза цим списком — перевір у **[довіднику Windows Event ID](/tools/windows-event-id)**: пошук по 20+ подіях з описом, рівнем загрози і рекомендаціями.

---

## PowerShell — швидкі команди

```powershell
# Перевірити конкретний Event ID
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4624} -MaxEvents 5

# Кілька журналів і кілька ID одночасно
Get-WinEvent -FilterHashtable @{LogName='System','Application'; Level=1,2; StartTime=(Get-Date).AddHours(-24)} |
  Select-Object TimeCreated, LogName, Id, Message | Format-List

# Знайти події BSOD
Get-WinEvent -FilterHashtable @{LogName='System'; Id=41} -MaxEvents 5
```

Файли дампів пам'яті при BSOD зберігаються окремо від журналу подій — для аналізу через WinDbg чи WhoCrashed:
```cmd
dir %SystemRoot%\Minidump
```

Детальніше про діагностику BSOD: [Синій екран смерті — повний гайд](/siniy-ekran-smerti-windows-11-24h2)

```powershell
# Експортувати журнал для передачі/аналізу деінде
wevtutil epl System C:\system-log.evtx

# Відкрити раніше збережений журнал
Get-WinEvent -Path "C:\system-log.evtx" | Select-Object -First 20
```

---

## Custom View — зберегти фільтр для повторного використання

Якщо регулярно перевіряєш ті самі Event ID — не набирай фільтр щоразу заново:

Правий клік на **Настроювані подання** → **Створити настроюваний вигляд** → задай журнали, рівні і ID → збережи під назвою.

---

## Керування розміром і очищення журналів

Журнали з часом займають сотні мегабайт. При переповненні старі події перезаписуються новими — якщо це критично (наприклад для аудиту безпеки), потрібно налаштувати розмір і збереження заздалегідь.

### Переглянути поточний розмір

```powershell
Get-WinEvent -ListLog * | Where-Object { $_.RecordCount -gt 0 } |
  Select-Object LogName, @{N="Size MB";E={[math]::Round($_.FileSize/1MB, 1)}}, RecordCount |
  Sort-Object "Size MB" -Descending | Format-Table -AutoSize
```

### Очистити журнал

**Через Event Viewer:** правою на журнал → **Очистити журнал** → обери **Зберегти і очистити** (рекомендовано, не втрачаєш історію) або просто **Очистити**.

**Через CMD:**
```cmd
wevtutil cl System
wevtutil cl Application
wevtutil cl Security
```

**Через PowerShell, з архівацією перед очищенням:**
```powershell
$date = Get-Date -Format "yyyyMMdd"
wevtutil epl System "C:\EventLogs\System-$date.evtx"
Clear-EventLog -LogName System
```

### Налаштувати максимальний розмір

Правою на журнал → **Властивості** → **Максимальний розмір журналу**, або через команду:

```powershell
wevtutil sl System /ms:134217728       # 128 МБ
wevtutil sl Application /ms:67108864   # 64 МБ
wevtutil sl Security /ms:268435456     # 256 МБ — аудит потребує більше
```

**Орієнтовні розміри:** System 64-128 МБ, Application 64 МБ, Security 128-512 МБ.

### Поведінка при переповненні

```powershell
# Перевірити поточну поведінку
wevtutil gl System | findstr "retention"

# Для Security-лога — зберігати 90 днів, перезаписувати старіше
Limit-EventLog -LogName Security -OverflowAction OverwriteOlder -RetentionDays 90
```

### Автоматичне очищення за розкладом

Скрипт для Task Scheduler — архівує й чистить журнал, якщо він більший за 50 МБ, і видаляє архіви старші 90 днів:

```powershell
$archivePath = "C:\EventLogs\Archive"
New-Item $archivePath -ItemType Directory -Force | Out-Null
$date = Get-Date -Format "yyyyMMdd-HHmm"

foreach ($log in @("System", "Application")) {
    $size = (Get-WinEvent -ListLog $log).FileSize / 1MB
    if ($size -gt 50) {
        wevtutil epl $log "$archivePath\$log-$date.evtx"
        wevtutil cl $log
    }
}

Get-ChildItem $archivePath -Filter "*.evtx" |
  Where-Object { $_.CreationTime -lt (Get-Date).AddDays(-90) } |
  Remove-Item -Force
```

---

## Часті питання

### Event Viewer показує тисячі подій — це нормально?

Так. Warning та Information трапляються постійно і зазвичай не проблема. Фокусуйся на **Level 1 (Critical)** і **Level 2 (Error)**, і зіставляй час події з моментом коли виникла проблема.

### Скільки часу зберігаються логи за замовчуванням?

За замовчуванням журнал обмежений ~20 МБ, що зазвичай означає 1-4 тижні історії залежно від активності системи. Збільшити: `wevtutil sl System /ms:104857600` (100 МБ) — деталі в розділі про розмір вище.

### Чи можна очистити журнал без втрати історії?

Так — обирай **"Зберегти і очистити"** в Event Viewer, або архівуй командою `wevtutil epl` перед `wevtutil cl` при роботі з командного рядка.

---

## Підсумок

**Діагностика збою:** System → фільтр Critical/Error навколо часу проблеми → шукай Event ID 41, 6008 або 7034. **Безпека:** Security → Event ID 4625 (невдалі входи), 7045 (нова служба), 1102 (очищення логів — підозріло). **Керування розміром:** `wevtutil sl` для ліміту, `wevtutil epl` + `cl` для архівації й очищення. Незнайомий ID — [довідник Event ID](/tools/windows-event-id).

---

## 🔍 Не знаєш що означає код помилки Windows?

Якщо Windows показує код на кшталт `0x80070005`, `0x80070002` або `0xC000021A` — скористайся безкоштовним інструментом:

**[→ Декодер помилок Windows](/tools/windows-error-decoder)** — введи код і одразу дізнайся що він означає та як виправити.
