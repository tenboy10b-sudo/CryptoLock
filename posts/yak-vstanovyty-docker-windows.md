---
title: "Як встановити Docker на Windows і запустити перший контейнер"
date: "2026-08-26"
publishDate: "2026-08-26"
description: "Встановлення Docker Desktop на Windows 10 і 11 через WSL 2, основні команди Docker і запуск першого контейнера. Типові помилки і їх вирішення."
tags: ["windows", "інструменти", "налаштування", "cmd", "powershell"]
readTime: 6
---

Docker дозволяє запускати додатки в ізольованих контейнерах — без залежностей від системи. На Windows найпростіше через Docker Desktop з WSL 2 бекендом.

---

## Вимоги

- Windows 10 версія 2004+ або Windows 11
- WSL 2 (встановлюється автоматично разом з Docker Desktop)
- 4 ГБ RAM мінімум (рекомендується 8 ГБ)
- Увімкнена віртуалізація в BIOS

---

## Встановлення Docker Desktop

**Спосіб 1 — офіційний сайт:**

1. Зайди на docker.com/products/docker-desktop
2. Завантаж Docker Desktop для Windows
3. Запусти інсталятор
4. Обери **Use WSL 2 instead of Hyper-V** (рекомендовано)
5. Перезавантаж ПК

**Спосіб 2 — winget:**

```powershell
winget install Docker.DockerDesktop
```

---

## Перевірити встановлення

```cmd
docker --version
docker compose version
```

Запусти перший тестовий контейнер:

```cmd
docker run hello-world
```

Якщо бачиш "Hello from Docker!" — все працює.

---

## Основні команди Docker

```cmd
rem Завантажити образ
docker pull nginx
docker pull ubuntu:22.04
docker pull python:3.12-slim

rem Список завантажених образів
docker images

rem Запустити контейнер
docker run nginx

rem Запустити у фоновому режимі
docker run -d nginx

rem Запустити з пробросом порту
docker run -d -p 8080:80 nginx
rem Тепер відкрий http://localhost:8080

rem Запустити з іменем
docker run -d --name my-nginx -p 8080:80 nginx

rem Список запущених контейнерів
docker ps

rem Список всіх контейнерів (включно зупинених)
docker ps -a

rem Зупинити контейнер
docker stop my-nginx

rem Видалити контейнер
docker rm my-nginx

rem Видалити образ
docker rmi nginx
```

---

## Запустити Ubuntu всередині Docker

```cmd
rem Інтерактивна сесія bash в Ubuntu
docker run -it ubuntu:22.04 bash

rem Тепер ти всередині контейнера
apt update
apt install -y curl
exit
```

---

## Docker Compose — кілька контейнерів разом

Створи файл `docker-compose.yml`:

```yaml
version: '3.8'
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```cmd
rem Запустити всі сервіси
docker compose up -d

rem Зупинити
docker compose down

rem Переглянути логи
docker compose logs -f
```

---

## Типові проблеми

### "Cannot connect to the Docker daemon"

Docker Desktop не запущений. Знайди в системному треї і запусти.

### "WSL 2 installation is incomplete"

```powershell
# Оновити WSL
wsl --update
wsl --set-default-version 2
```

Детальніше: [Як встановити WSL 2](/yak-vstanovyty-wsl-linux-v-windows)

### Повільна робота Docker на Windows

Docker на Windows через WSL 2 може бути повільним при роботі з файлами Windows (C:\). Помісти проект у файлову систему Linux:

```bash
# В WSL термінал
cd ~/projects
git clone repo
# Запускай Docker звідси — значно швидше
```

### Порт вже зайнятий

```powershell
# Знайти що займає порт 8080
Get-NetTCPConnection -LocalPort 8080 |
  Select-Object @{N="Process";E={(Get-Process -Id $_.OwningProcess).Name}}
```

---

## Підсумок

`winget install Docker.DockerDesktop` → перезавантаж → `docker run hello-world`. Основна зв'язка: `docker pull` для завантаження, `docker run -d -p порт:порт` для запуску у фоні, `docker ps` для перегляду, `docker stop` для зупинки. Docker Compose — для проектів з кількома сервісами.
