---
title: "Windows для розробника: WSL2, Terminal, Git і VS Code з нуля"
date: "2026-09-13"
publishDate: "2026-09-13"
description: "Налаштування Windows як середовища для розробки: встановлення WSL2 з Ubuntu, Windows Terminal, Git, VS Code і базова конфігурація для комфортної роботи."
tags: ["windows", "інструменти", "налаштування", "cmd", "powershell"]
readTime: 7
---

Windows з WSL2 — повноцінне середовище розробки що конкурує з macOS. Ось як налаштувати все з нуля за одну годину.

---

## 1. Встановити WSL2 з Ubuntu

```powershell
# Встановити WSL2 і Ubuntu одночасно
wsl --install

# Або обрати конкретний дистрибутив
wsl --install -d Ubuntu-22.04

# Після перезавантаження — встановити логін і пароль Ubuntu
```

Детальніше: [Як встановити WSL 2](/yak-vstanovyty-wsl-linux-v-windows)

---

## 2. Windows Terminal — сучасна консоль

```powershell
winget install Microsoft.WindowsTerminal
```

Налаштування за замовчуванням:

`Ctrl + ,` → Settings → Default profile: Ubuntu → Start in: `\\wsl$\Ubuntu\home\username`

Рекомендований шрифт: Cascadia Code або JetBrains Mono Nerd Font.

Детальніше: [Windows Terminal — повний гайд](/windows-terminal-povnyy-gaid)

---

## 3. Git — версіонування коду

```powershell
winget install Git.Git
```

Базова конфігурація:

```bash
# В WSL або Git Bash
git config --global user.name "Ім'я Прізвище"
git config --global user.email "email@example.com"
git config --global core.autocrlf input  # важливо для WSL
git config --global init.defaultBranch main
```

SSH ключ для GitHub:

```bash
ssh-keygen -t ed25519 -C "email@example.com"
cat ~/.ssh/id_ed25519.pub  # скопіюй на github.com → Settings → SSH keys
```

Детальніше: [Як встановити і налаштувати Git](/yak-vstanovyty-git-windows)

---

## 4. VS Code — редактор коду

```powershell
winget install Microsoft.VisualStudioCode
```

Обов'язкові розширення:

```
WSL — Microsoft (для роботи з WSL)
GitLens — підсвічування Git
Prettier — форматування коду
ESLint / Pylint — лінтери
Remote SSH — підключення до серверів
```

Відкрити проект з WSL в VS Code:

```bash
# В WSL терміналі
cd ~/projects/myapp
code .  # відкриє VS Code підключений до WSL
```

---

## 5. Node.js через nvm (WSL)

```bash
# В WSL — встановити nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Встановити Node.js LTS
nvm install --lts
nvm use --lts
node --version
```

---

## 6. Python

```bash
# В WSL (Ubuntu вже має Python 3)
python3 --version
pip3 install --upgrade pip

# Virtualenv для проектів
python3 -m venv .venv
source .venv/bin/activate
```

Або на Windows напряму: [Як встановити Python на Windows](/yak-vstanovyty-python-windows)

---

## 7. Docker Desktop з WSL2 бекендом

```powershell
winget install Docker.DockerDesktop
```

В налаштуваннях Docker Desktop → General → Use WSL 2 based engine → увімкни.

Детальніше: [Як встановити Docker на Windows](/yak-vstanovyty-docker-windows)

---

## 8. Оптимізація WSL2

```bash
# Обмежити RAM для WSL (за замовчуванням WSL може зайняти весь RAM)
# Файл C:\Users\ІМ'Я\.wslconfig
```

```ini
[wsl2]
memory=4GB
processors=4
swap=2GB
```

```bash
# Перезапустити WSL після змін
wsl --shutdown
wsl
```

---

## 9. Oh My Zsh — покращена оболонка

```bash
# В WSL — встановити zsh і Oh My Zsh
sudo apt install zsh -y
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# Встановити корисні плагіни
git clone https://github.com/zsh-users/zsh-autosuggestions ~/.oh-my-zsh/custom/plugins/zsh-autosuggestions
git clone https://github.com/zsh-users/zsh-syntax-highlighting ~/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting

# Додати в ~/.zshrc:
# plugins=(git zsh-autosuggestions zsh-syntax-highlighting)
```

---

## 10. Winget — встановити все одразу

```powershell
# Весь dev стек одною командою
$devTools = @(
    "Microsoft.WindowsTerminal",
    "Microsoft.VisualStudioCode",
    "Git.Git",
    "Docker.DockerDesktop",
    "OpenJS.NodeJS.LTS",
    "Python.Python.3.12",
    "Postman.Postman",
    "dbeaver.dbeaver"
)

foreach ($tool in $devTools) {
    Write-Output "Встановлюю: $tool"
    winget install $tool --silent --accept-package-agreements --accept-source-agreements
}
```

---

## Підсумок

Мінімальний стек: WSL2 + Windows Terminal + Git + VS Code. Все інше (Node, Python, Docker) — залежно від проекту. Важливо: зберігай проекти у файловій системі Linux (`~/projects`) а не Windows (`C:\`) — продуктивність з WSL в рази вища.
