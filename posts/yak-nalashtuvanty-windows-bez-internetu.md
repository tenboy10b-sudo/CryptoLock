---
title: "Як налаштувати Windows без інтернету: драйвери, оновлення і активація"
date: "2026-08-31"
publishDate: "2026-08-31"
description: "Встановлення Windows і базове налаштування без доступу до інтернету: офлайн драйвери, оновлення через WSUS або USB, офлайн активація Windows."
tags: ["windows", "налаштування", "оновлення", "драйвери", "інструменти"]
readTime: 5
---

Іноді потрібно налаштувати Windows без інтернету — в ізольованих середовищах, при розгортанні корпоративних ПК або при відсутності з'єднання. Ось як це зробити.

---

## Встановлення без Microsoft акаунту

При встановленні Windows 11 без інтернету — на екрані входу з'явиться кнопка "Продовжити з обмеженим налаштуванням" для локального акаунту.

Якщо потрібно примусово: `Shift + F10` → `oobe\bypassnro`.

Детальніше: [Як встановити Windows 11 без Microsoft акаунту](/yak-vstanovyty-windows-11-bez-microsoft-account)

---

## Офлайн драйвери

### Завантаження заздалегідь

Перш ніж від'єднуватись від інтернету — завантаж драйвери:

```cmd
rem Переглянути встановлені драйвери і зберегти в папку
dism /online /export-driver /destination:C:\DriversBackup

rem Або через PowerShell
Export-WindowsDriver -Online -Destination "C:\DriversBackup"
```

### Встановлення офлайн драйвера з .inf файлу

```cmd
pnputil /add-driver "C:\Drivers\printer.inf" /install

rem Або через Диспетчер пристроїв
rem Правою → Оновити драйвер → Пошук на цьому комп'ютері
```

---

## Офлайн оновлення Windows

### Спосіб 1: Windows Update Offline (WSUS Offline Update)

Безкоштовний інструмент що завантажує всі оновлення заздалегідь.

1. Завантаж **WSUS Offline Update** з wsusoffline.net на ПК з інтернетом
2. Запусти, вибери версію Windows → Download
3. Скопіюй папку `client` на USB
4. На цільовому ПК запусти `UpdateInstaller.exe`

### Спосіб 2: PowerShell з локального джерела

```powershell
# На ПК з інтернетом — зберегти пакети оновлень
Save-Package -Name WindowsUpdate -Path "D:\Updates"

# На ізольованому ПК
Install-Package -Source "D:\Updates" -Name WindowsUpdate
```

### Спосіб 3: Окремі KB файли

Завантаж конкретні оновлення з catalog.update.microsoft.com на ПК з інтернетом і перенеси на USB.

```cmd
rem Встановити .msu файл оновлення
wusa.exe KB5034441.msu /quiet /norestart
```

---

## Офлайн активація Windows

### Через телефон (завжди доступно)

1. `Win + R` → `slui 4`
2. Вибери країну
3. Зателефонуй на вказаний номер
4. Продиктуй Installation ID
5. Отримай Confirmation ID → введи

### Через командний рядок

```cmd
rem Переглянути Installation ID
slmgr /dti

rem Активувати з Confirmation ID отриманим по телефону
slmgr /atp CONFIRMATION-ID-HERE
```

### KMS активація (для корпоративних ліцензій)

```cmd
rem Налаштувати KMS сервер (внутрішній в корпоративній мережі)
slmgr /skms kms-server.company.local
slmgr /ato
```

---

## Офлайн встановлення програм

```powershell
# Завантажити winget пакет на ПК з інтернетом
winget download 7zip.7zip --download-directory C:\Packages

# Встановити на ізольованому ПК
winget install --manifest C:\Packages\7zip.7zip.yaml
```

---

## Що потрібно підготувати заздалегідь (чеклист)

Перед від'єднанням від інтернету підготуй:

```
☐ ISO образ Windows (для перевстановлення)
☐ Драйвери — мережевий адаптер, відеокарта, чипсет
☐ Оновлення безпеки (останні за місяць)
☐ Ключ продукту або Confirmation ID (активація)
☐ Необхідні програми у вигляді .exe інсталяторів
☐ Офлайн документація (якщо потрібна)
```

---

## Підсумок

Для офлайн налаштування Windows: `dism /export-driver` — зберегти драйвери заздалегідь. WSUS Offline Update — завантажити всі оновлення на USB. `slui 4` — активація по телефону без інтернету. Все це варто підготувати ДО від'єднання від мережі.
