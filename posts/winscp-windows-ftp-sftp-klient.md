---
title: "WinSCP на Windows: FTP і SFTP клієнт для передачі файлів на сервер"
date: "2026-06-15"
publishDate: "2026-10-05"
updated: "2026-06-15"
description: "Як встановити і використовувати WinSCP для підключення до FTP і SFTP серверів. Передача файлів, налаштування з'єднань, синхронізація папок і командний рядок WinSCP."
tags: ["windows", "winscp", "ftp", "sftp", "інструменти", "адміністрування"]
readTime: 7
translatesEn: "winscp-windows-ftp-sftp-guide"
---

WinSCP — найпопулярніший безкоштовний FTP/SFTP клієнт для Windows. Передавай файли на веб-сервер, VPS або будь-який SSH сервер з графічним інтерфейсом або автоматично через скрипти.

---

## Встановлення

```powershell
winget install WinSCP.WinSCP
```
Або з [winscp.net](https://winscp.net/eng/download.php).

---

## Підтримувані протоколи

| Протокол | Порт | Коли використовувати |
|---------|------|---------------------|
| **SFTP** | 22 | Безпечна передача (SSH) — рекомендовано |
| **SCP** | 22 | Старіший SSH протокол |
| **FTP** | 21 | Звичайні FTP сервери (незашифрований) |
| **FTPS** | 990/21 | FTP з SSL шифруванням |
| **WebDAV** | 80/443 | Хмарні сховища |
| **S3** | 443 | Amazon S3 і сумісні |

---

## Перше підключення (SFTP/SSH)

1. Запусти WinSCP → **"New Session"**
2. Заповни:
   - **File protocol:** SFTP
   - **Host name:** IP або домен сервера
   - **Port:** 22
   - **User name:** ім'я користувача (зазвичай `root` або `ubuntu`)
   - **Password:** пароль або залиш порожнім якщо SSH ключ

3. Натисни **"Login"**
4. При першому підключенні — підтвердити fingerprint сервера → **"Accept"**

---

## Підключення через SSH ключ

Безпечніше за пароль:

1. **"New Session"** → **"Advanced"** → **"SSH"** → **"Authentication"**
2. **"Private key file"** → вибери свій `.ppk` файл
   - Якщо маєш `.pem` (Linux/Mac формат) → конвертуй через **PuTTYgen** (входить в WinSCP)
3. **"Login"**

**Конвертація .pem в .ppk:**
```
Відкрий PuTTYgen → Load → вибери .pem → Save private key → зберегти як .ppk
```

---

## Інтерфейс WinSCP

Два режими:
- **Commander** — два панелі: ліворуч локальний комп'ютер, праворуч сервер
- **Explorer** — одна панель, як Провідник Windows

Змінити: **Options → Preferences → Interface → Commander / Explorer**

### Основні операції

| Дія | Спосіб |
|-----|--------|
| Завантажити файл на сервер | Перетягни з лівої панелі в праву |
| Скачати файл | Перетягни з правої в ліву |
| Редагувати файл на сервері | Подвійний клік → відкриється в редакторі |
| Видалити | Del |
| Права доступу | ПКМ → Properties |

---

## Синхронізація папок

Автоматично синхронізувати локальну папку з сервером:

```
Commands → Synchronize (Ctrl+S)
```

| Режим | Що робить |
|-------|----------|
| **Remote** | Оновлює сервер з локальних файлів |
| **Local** | Оновлює локальні файли з сервера |
| **Both** | Двостороння синхронізація |

**Preview** — переглянути що буде змінено перед синхронізацією.

---

## Автоматизація через скрипти

WinSCP має вбудований скриптовий режим — корисно для резервних копій і деплою:

```batch
:: backup.bat — завантаження файлів на сервер
"C:\Program Files (x86)\WinSCP\WinSCP.com" ^
  /log="C:\logs\winscp.log" ^
  /command ^
  "open sftp://user:password@server.com/" ^
  "put C:\backup\*.sql /backups/" ^
  "exit"
```

```powershell
# PowerShell + WinSCP .NET assembly
Add-Type -Path "C:\Program Files (x86)\WinSCP\WinSCPnet.dll"

$options = New-Object WinSCP.SessionOptions -Property @{
    Protocol = [WinSCP.Protocol]::Sftp
    HostName = "server.com"
    UserName = "user"
    Password = "password"
    SshHostKeyFingerprint = "ssh-rsa 2048 xx:xx:..."
}

$session = New-Object WinSCP.Session
$session.Open($options)
$session.PutFiles("C:\backup\*", "/backups/").Check()
$session.Dispose()
```

---

## Редагування файлів на сервері

WinSCP відкриває файли у вбудованому або зовнішньому редакторі:

**Налаштування редактора:**
```
Options → Preferences → Editors → Add → вкажи шлях до VS Code або Notepad++
```

Зміни зберігаються автоматично на сервер при збереженні файлу.

---

## Менеджер з'єднань (Site Manager)

Зберігай часто використовувані з'єднання:
```
New Session → вкажи дані → Save → вкажи назву
```

Наступного разу: подвійний клік на збереженому з'єднанні.

---

## WinSCP vs FileZilla

| | WinSCP | FileZilla |
|-|--------|----------|
| SFTP/SCP | ✅ | ✅ |
| Скриптування | ✅ | ❌ |
| .NET API | ✅ | ❌ |
| Редагування файлів на сервері | ✅ | ✅ |
| Безкоштовно | ✅ | ✅ |
| Без реклами | ✅ | ⚠️ |

---

## Резюме

| Задача | Рішення |
|--------|---------|
| Підключитись до сервера | New Session → SFTP → IP/логін/пароль |
| SSH ключ | Advanced → SSH → Authentication → .ppk |
| Синхронізувати папку | Commands → Synchronize |
| Автоматизація | WinSCP.com скрипти або .NET assembly |
| Редагувати файли | Подвійний клік → зміни зберігаються на сервер |
