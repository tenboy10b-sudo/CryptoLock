---
title: "SC.exe: управління службами Windows з командного рядка"
date: "2026-09-28"
publishDate: "2026-09-28"
description: "Команда sc.exe для управління службами Windows: створення, видалення, зміна типу запуску і налаштування відновлення після збоїв через командний рядок."
tags: ["windows", "cmd", "адміністрування", "інструменти"]
readTime: 5
---

`sc.exe` — потужніша альтернатива `net start/stop` для управління службами. Дозволяє не тільки запускати служби але й створювати, видаляти і налаштовувати їх.

---

## Основні команди

```cmd
rem Переглянути стан служби
sc query wuauserv

rem Список всіх служб
sc query type= all

rem Тільки запущені
sc query state= running

rem Тільки зупинені
sc query state= stopped

rem Докладна конфігурація служби
sc qc wuauserv
```

---

## Запуск і зупинка

```cmd
rem Запустити службу
sc start wuauserv

rem Зупинити
sc stop wuauserv

rem Призупинити (якщо служба підтримує)
sc pause spooler

rem Відновити після паузи
sc continue spooler
```

---

## Змінити тип запуску

```cmd
rem Автоматичний запуск
sc config wuauserv start= auto

rem Автоматичний із затримкою
sc config wuauserv start= delayed-auto

rem Ручний запуск
sc config wuauserv start= demand

rem Вимкнути
sc config wuauserv start= disabled
```

> Зверни увагу: після `start=` **обов'язково пробіл** — `start= auto`, не `start=auto`.

---

## Налаштування відновлення після збою

```cmd
rem При першому збої — перезапустити через 1 хвилину
rem При другому — перезапустити через 2 хвилини
rem При третьому — запустити команду (наприклад відправити alert)

sc failure wuauserv reset= 86400 actions= restart/60000/restart/120000/run/0

rem Параметри:
rem reset= 86400 — скинути лічильник збоїв через 24 год
rem actions= тип/затримка_мс/тип/затримка_мс/...
rem Типи: restart, run, reboot, none
```

---

## Створити нову службу

```cmd
rem Зареєструвати власну програму як службу Windows
sc create MyService `
  binpath= "C:\MyApp\myapp.exe" `
  displayname= "My Application Service" `
  start= auto `
  type= own

rem Додати опис
sc description MyService "Сервіс для моєї програми"

rem Запустити
sc start MyService
```

---

## Видалити службу

```cmd
rem Спочатку зупинити
sc stop MyService

rem Видалити
sc delete MyService
```

---

## Змінити акаунт служби

```cmd
rem Запускати від конкретного акаунту
sc config MyService obj= "DOMAIN\serviceaccount" password= "P@ssword!"

rem Від LocalSystem
sc config MyService obj= LocalSystem

rem Від NetworkService
sc config MyService obj= NT AUTHORITY\NetworkService
```

---

## Залежності між службами

```cmd
rem Переглянути залежності
sc qc wuauserv | findstr "DEPENDENCIES"

rem Встановити залежність (служба стартує тільки після залежної)
sc config MyService depend= rpcss/lanmanworkstation
```

---

## Управління службами на віддаленому ПК

```cmd
rem Всі команди sc підтримують підключення до іншого ПК
sc \\ServerName query
sc \\ServerName stop spooler
sc \\ServerName start spooler
sc \\ServerName config wuauserv start= auto
```

---

## Підсумок

`sc qc` — конфігурація. `sc query` — стан. `sc config start= auto/demand/disabled` — тип запуску. `sc failure` — налаштування відновлення. `sc create` / `sc delete` — для власних служб. `sc \\ComputerName` — управління на іншому ПК.
