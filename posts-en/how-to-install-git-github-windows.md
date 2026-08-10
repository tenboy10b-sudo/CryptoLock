---
title: "How to Install and Use Git and GitHub on Windows 10 and 11"
date: "2026-06-08"
publishDate: "2026-08-14"
updated: "2026-06-08"
description: "How to install Git on Windows 10 and 11, configure username and email, connect to GitHub via SSH or HTTPS. Essential Git commands for beginners. GitHub Desktop setup."
tags: ["windows", "git", "github", "tools", "development"]
readTime: 8
translatesUk: "yak-vstanovyty-git-windows"
---

Git is a version control system used by all developers. GitHub is the most popular Git hosting platform. Here's how to set everything up from scratch on Windows.

---

## Install Git

### Method 1 — Official Installer (recommended)

1. Download from [git-scm.com/download/win](https://git-scm.com/download/win)
2. Run installer — keep default settings
3. On **"Choosing default editor"** step — select VS Code or Notepad++

### Method 2 — winget

```powershell
winget install Git.Git
```

### Verify Installation

```cmd
git --version
# git version 2.45.2.windows.1
```

---

## Basic Git Configuration

```bash
# Set name and email (appears in every commit)
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Default editor (VS Code)
git config --global core.editor "code --wait"

# Default branch name
git config --global init.defaultBranch main

# Check all settings
git config --list
```

---

## Connect to GitHub

### HTTPS (easier for beginners)

```bash
git clone https://github.com/username/repo.git
# Use Personal Access Token instead of password
```

**Create token:** GitHub → Settings → Developer settings → Personal access tokens → Generate → select `repo`

### SSH (more convenient for regular use)

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your@email.com"

# Copy public key
Get-Content "$env:USERPROFILE\.ssh\id_ed25519.pub" | Set-Clipboard
```

**Add to GitHub:** Settings → SSH keys → New SSH key → paste

```bash
# Test connection
ssh -T git@github.com
```

---

## Essential Git Commands

```bash
# Initialize repository
git init

# Check status
git status

# Stage files
git add .

# Commit
git commit -m "Description of changes"

# View history
git log --oneline

# Push to GitHub
git push origin main

# Pull from GitHub
git pull origin main

# Clone repository
git clone https://github.com/username/repo.git
```

### Branches

```bash
git branch              # list branches
git checkout -b feature # create and switch
git merge feature       # merge into current
git branch -d feature   # delete
```

---

## Git in VS Code

VS Code has built-in Git support — no need to memorize commands:
`Ctrl + Shift + G` → Source Control panel → stage, commit, push via GUI

---

## Common Issues

### Git asks password on every push
```bash
git config --global credential.helper manager-core
```

### Undo last commit
```bash
git reset --soft HEAD~1   # keep changes
git reset --hard HEAD~1   # discard changes
```

### CRLF warning
```bash
git config --global core.autocrlf true
```

---

## Summary

| Task | Command |
|------|---------|
| Set username | `git config --global user.name "Name"` |
| Start project | `git init` → `git add .` → `git commit` |
| Upload to GitHub | `git push origin main` |
| Get updates | `git pull origin main` |
| New branch | `git checkout -b branch-name` |
