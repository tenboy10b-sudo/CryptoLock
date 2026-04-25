---
title: "Windows Sandbox проти Hyper-V: коли що використовувати"
date: "2026-08-11"
publishDate: "2026-08-11"
description: "Порівняння Windows Sandbox і Hyper-V: різниця в призначенні, ресурсах, налаштуванні і безпеці. Коли вибрати Sandbox а коли повноцінну VM на Hyper-V."
tags: ["windows", "безпека", "адміністрування", "налаштування", "інструменти"]
readTime: 5
---

Обидва інструменти дозволяють запускати ізольоване середовище Windows, але для зовсім різних задач. Ось коли що обирати.

---

## Швидке порівняння

| Характеристика | Windows Sandbox | Hyper-V VM |
|---------------|----------------|-----------|
| Збереження стану | ❌ Одноразова | ✅ Зберігається |
| Час запуску | ~5–10 секунд | 30–60 секунд |
| Налаштування | Мінімальне | Повне |
| Ізоляція | Висока | Повна |
| Потребує ліцензії | Windows Pro+ | Windows Pro+ |
| Споживання RAM | ~500 МБ | 1–4 ГБ+ |
| Знімки (snapshots) | ❌ | ✅ |
| Різна ОС | ❌ (тільки Windows) | ✅ (Linux, Windows тощо) |

---

## Windows Sandbox — для чого ідеально

**Тестування підозрілих файлів:**
Отримав exe що виглядає підозріло — кинь у Sandbox, запусти, подивись що відбувається. Після закриття — система чиста.

**Тестування інсталяторів:**
Встанови програму в Sandbox, перевір чи все ок, потім встановлюй на основну систему.

**Відкриття підозрілих PDF і документів:**
Документ від невідомого відправника — відкрий у Sandbox, не ризикуй основною системою.

**Швидкі одноразові тести:**
Потрібно перевірити скрипт або команду в чистому середовищі — Sandbox запускається за секунди.

```xml
<!-- Sandbox config з папкою для тестових файлів -->
<Configuration>
  <MappedFolders>
    <MappedFolder>
      <HostFolder>C:\TestFiles</HostFolder>
      <ReadOnly>true</ReadOnly>
    </MappedFolder>
  </MappedFolders>
  <Networking>Disable</Networking>
</Configuration>
```

Детальніше: [Windows Sandbox — повний гайд](/windows-sandbox-bezpechne-seredovyshe)

---

## Hyper-V — для чого ідеально

**Тривалі середовища розробки:**
VM зі встановленим Linux, Docker, набором інструментів — зберігається між сесіями.

**Тестування різних ОС:**
Ubuntu, Debian, Windows Server, старий Windows XP для legacy software.

**Мережеве тестування:**
Кілька VM в ізольованій мережі — симуляція складних топологій.

**Знімки (snapshots):**
Зроби snapshot → встанови щось ризиковане → якщо щось пішло не так → відновись до snapshot.

**Сервери і довгострокові задачі:**
VM може працювати безперервно, перезавантажуватись, зберігати logs.

```powershell
# Створити VM в Hyper-V
New-VM -Name "TestUbuntu" -MemoryStartupBytes 2GB -Generation 2
Add-VMDvdDrive -VMName "TestUbuntu"
Set-VMDvdDrive -VMName "TestUbuntu" -Path "C:\ISOs\ubuntu.iso"
Start-VM -Name "TestUbuntu"
```

Детальніше: [Hyper-V — налаштування мережі](/hyper-v-nalashtuvannya-merezhi)

---

## Коли ні те, ні інше

**Потрібна максимальна продуктивність** → Docker Desktop або WSL2 — легший за повну VM.

**Старий ПК з 4 ГБ RAM** → Hyper-V і Sandbox вимагають достатньо ресурсів, може краще VirtualBox.

**Тестування на Linux** → WSL2 швидший і простіший ніж повна Linux VM для більшості задач розробки.

---

## Увімкнути обидва

```powershell
# Увімкнути Hyper-V
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All

# Увімкнути Windows Sandbox
Enable-WindowsOptionalFeature -Online -FeatureName Containers-DisposableClientVM

# Перезавантаж після обох команд
Restart-Computer
```

---

## Підсумок

**Sandbox** — якщо потрібно швидко і одноразово в чистому середовищі. **Hyper-V** — якщо потрібно зберігати стан, робити snapshots або запускати іншу ОС. Для тестування підозрілих файлів завжди Sandbox — простіше і безпечніше.
