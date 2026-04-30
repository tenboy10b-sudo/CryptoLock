---
title: "SSH ключі в Windows: генерація, використання і захист"
date: "2026-08-24"
publishDate: "2026-08-24"
description: "Як генерувати SSH ключі в Windows, додавати їх на сервери, використовувати ssh-agent для автоматичної автентифікації і захищати приватний ключ паролем."
tags: ["безпека", "windows", "мережа", "адміністрування", "powershell"]
readTime: 6
---

SSH ключі — безпечніша альтернатива паролям для підключення до серверів. Один раз налаштував — більше не вводиш пароль, але захист значно вищий.

---

## Генерація ключової пари

```powershell
# Сучасний алгоритм ED25519 (рекомендовано)
ssh-keygen -t ed25519 -C "work-laptop-2026"

# Або RSA 4096 якщо сервер не підтримує ed25519
ssh-keygen -t rsa -b 4096 -C "work-laptop-2026"
```

При генерації:
- **Шлях** — натисни Enter (збереже в `~/.ssh/id_ed25519`)
- **Passphrase** — введи надійний пароль для захисту ключа. Якщо не вводити — ключ незахищений.

Результат:
- `~/.ssh/id_ed25519` — **приватний ключ** (нікому не давати)
- `~/.ssh/id_ed25519.pub` — публічний ключ (додається на сервери)

---

## Переглянути публічний ключ

```powershell
Get-Content "$env:USERPROFILE\.ssh\id_ed25519.pub"

# Або скопіювати в буфер
Get-Content "$env:USERPROFILE\.ssh\id_ed25519.pub" | Set-Clipboard
```

---

## Додати ключ на сервер

**Linux/macOS сервер:**

```bash
# З Windows — через ssh-copy-id (потрібен OpenSSH клієнт)
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server-ip

# Або вручну
cat ~/.ssh/id_ed25519.pub | ssh user@server "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

**Windows сервер з OpenSSH:**

Детальніше: [OpenSSH сервер на Windows](/openssh-server-windows-nalashtuvannya)

---

## Налаштувати ssh-agent для автоматичної автентифікації

ssh-agent зберігає розшифрований ключ у пам'яті — не потрібно вводити passphrase при кожному підключенні.

```powershell
# Запустити ssh-agent і додати в автозапуск
Set-Service -Name ssh-agent -StartupType Automatic
Start-Service ssh-agent

# Додати ключ до агента
ssh-add "$env:USERPROFILE\.ssh\id_ed25519"
# Введи passphrase один раз

# Перевірити що ключ додано
ssh-add -l
```

---

## Файл конфігурації SSH (~/.ssh/config)

Дозволяє налаштувати різні параметри для різних хостів.

```
Host production
    HostName 192.168.1.100
    User admin
    IdentityFile ~/.ssh/id_ed25519
    Port 2222

Host staging
    HostName 192.168.1.200
    User deploy
    IdentityFile ~/.ssh/id_rsa_staging

Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_github
```

Тепер підключення: `ssh production` замість `ssh admin@192.168.1.100 -p 2222`.

---

## Декілька ключів для різних цілей

```powershell
# Ключ для роботи
ssh-keygen -t ed25519 -f "$env:USERPROFILE\.ssh\id_work" -C "work"

# Ключ для GitHub
ssh-keygen -t ed25519 -f "$env:USERPROFILE\.ssh\id_github" -C "github"

# Ключ для особистих серверів
ssh-keygen -t ed25519 -f "$env:USERPROFILE\.ssh\id_personal" -C "personal"
```

---

## Захист ключів

**Права доступу** — приватний ключ має бути доступний тільки тобі:

```powershell
# Встановити правильні права на приватний ключ
$keyPath = "$env:USERPROFILE\.ssh\id_ed25519"
$acl = Get-Acl $keyPath

# Прибрати успадковані права
$acl.SetAccessRuleProtection($true, $false)

# Залишити тільки поточного користувача
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
    $env:USERNAME, "FullControl", "Allow"
)
$acl.SetAccessRule($rule)
Set-Acl $keyPath $acl
```

**Ніколи:**
- Не відправляй приватний ключ по email або месенджеру
- Не зберігай без passphrase якщо ключ має доступ до важливих серверів
- Не комітай у Git репозиторій

---

## Ротація ключів

Якщо ключ міг бути скомпрометований:

```powershell
# Згенерувати новий ключ
ssh-keygen -t ed25519 -f "$env:USERPROFILE\.ssh\id_ed25519_new" -C "rotated-2026"

# Додати новий ключ на всі сервери
# Видалити старий з authorized_keys на серверах
# Видалити старий локально
Remove-Item "$env:USERPROFILE\.ssh\id_ed25519"
Remove-Item "$env:USERPROFILE\.ssh\id_ed25519.pub"
```

---

## Підсумок

`ssh-keygen -t ed25519` → додай публічний ключ на сервери → налаштуй `~/.ssh/config` для зручності → запусти `ssh-agent` щоб не вводити passphrase кожного разу. Приватний ключ — завжди з passphrase і ніколи нікому.
