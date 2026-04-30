---
title: "Sysinternals: Autoruns, Process Explorer і інші незамінні утиліти"
date: "2026-09-23"
publishDate: "2026-09-23"
description: "Sysinternals від Microsoft: Autoruns для автозапуску, Process Explorer замість Диспетчера завдань, TCPView для мережі, Handle і Sigcheck для аналізу файлів."
tags: ["windows", "безпека", "інструменти", "діагностика", "адміністрування"]
readTime: 6
---

Sysinternals — безкоштовний набір утиліт від Microsoft для глибокого аналізу Windows. Деякі з них безпосередньо входять в арсенал антивірусних і forensic аналітиків.

---

## Де завантажити

Всі утиліти: learn.microsoft.com/sysinternals або напряму з live.sysinternals.com.

```powershell
# Запуск без завантаження (прямо з мережі Microsoft)
\\live.sysinternals.com\Tools\procexp.exe
\\live.sysinternals.com\Tools\autoruns.exe
```

---

## Autoruns — найповніший список автозапуску

Показує ВСЕ що запускається автоматично: реєстр, служби, драйвери, заплановані задачі, розширення браузерів, COM об'єкти і десятки інших місць.

**Головна особливість:** кольорова індикація:
- **Жовтий** — файл не знайдено (підозрілий запис-примара)
- **Рожевий** — немає цифрового підпису (потенційно небезпечно)
- **Білий** — підписано Microsoft

**Як перевірити підозрілий запис:**
Options → Scan Options → Check VirusTotal.com → перевіряє всі записи в VirusTotal.

```powershell
# Консольна версія для скриптів
autorunsc.exe -a * -c -h -vt | Export-Csv "C:\autoruns.csv"
```

---

## Process Explorer — покращений Диспетчер завдань

Замінює стандартний диспетчер і показує набагато більше:

- Дерево процесів (батьківський → дочірній)
- Хешування файлів і перевірка в VirusTotal
- DLL що завантажені кожним процесом
- Дескриптори файлів і реєстру
- Хто запустив процес і коли

**Корисна функція — Replace Task Manager:**
Options → Replace Task Manager → тепер `Ctrl+Shift+Esc` відкриває Process Explorer.

---

## TCPView — мережеві підключення з процесами

Краще за `netstat` — показує в реальному часі які процеси мають відкриті порти і підключення.

- Зелений — нове підключення
- Червоний — закрите підключення
- Колонка Process показує точний виконуваний файл

**Для пошуку шкідливого ПЗ:** незнайоме підключення до незвичного IP → права кнопка → Whois.

---

## Strings — пошук рядків у бінарних файлах

```cmd
rem Знайти URL і шляхи у виконуваному файлі
strings.exe suspicious.exe | findstr "http"
strings.exe suspicious.exe | findstr ".exe .dll .bat"

rem Пошук у пам'яті процесу
strings.exe -p 1234
```

---

## Handle — які файли відкриті процесом

```cmd
rem Знайти процес що заблокував файл
handle.exe "C:\locked-file.txt"

rem Всі відкриті дескриптори процесу
handle.exe -p notepad.exe
```

Корисно коли Windows каже "файл зайнятий іншим процесом" і не дає видалити.

---

## PsExec — виконання команд на віддаленому ПК

```cmd
rem Виконати команду на віддаленому ПК
psexec.exe \\Server01 ipconfig /all

rem Відкрити інтерактивний CMD на іншому ПК
psexec.exe \\Server01 -i cmd.exe

rem Запустити від SYSTEM (вищий рівень ніж адмін)
psexec.exe -s cmd.exe
```

---

## Sigcheck — перевірка підпису файлів

```cmd
rem Перевірити підпис конкретного файлу
sigcheck.exe C:\Windows\System32\notepad.exe

rem Перевірити всі файли в папці на відсутність підпису
sigcheck.exe -u -e C:\Windows\System32\

rem Перевірити в VirusTotal
sigcheck.exe -vt suspicious.exe
```

---

## Disk2vhd — конвертувати фізичний диск у VHD

```cmd
rem Створити VHD образ системного диска (для міграції у Hyper-V)
disk2vhd.exe C: E:\backup.vhdx
```

---

## Підсумок

**Autoruns** — перше місце для пошуку шкідливого ПЗ в автозапуску. **Process Explorer** — заміна Диспетчера завдань з перевіркою VirusTotal. **TCPView** — хто і куди підключається. **Handle** — знайти процес що заблокував файл. Всі утиліти безкоштовні від Microsoft — завантажуй з live.sysinternals.com.
