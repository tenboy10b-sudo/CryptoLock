---
title: "Credential Manager Windows: збереження і управління паролями"
date: "2026-06-20"
publishDate: "2026-06-20"
description: "Credential Manager Windows для збереження паролів мережевих ресурсів і застосунків. Перегляд, додавання і видалення збережених credentials через PowerShell і cmdkey."
tags: ["windows", "паролі", "безпека", "credentials", "адміністрування"]
readTime: 3
translatesEn: "how-to-use-windows-credential-manager"
---

Credential Manager зберігає паролі для веб-сайтів, мережевих ресурсів і застосунків — щоб Windows підключалась автоматично.

---

## Відкрити

```
Win + R → control /name Microsoft.CredentialManager
```

Або: `Win + S` → **Диспетчер облікових даних**

Дві категорії:
- **Облікові дані Windows** — мережеві ресурси, RDP, сертифікати
- **Облікові дані Інтернету** — збережені Edge/IE

---

## Переглянути збережені

```powershell
cmdkey /list
```

---

## Додати credentials

```powershell
# Мережевий ресурс
cmdkey /add:НазваСервера /user:Domain\Username /pass:Password

# RDP підключення
cmdkey /add:TERMSRV/RemotePC /user:Username /pass:Password
```

---

## Видалити

```powershell
cmdkey /delete:НазваСервера
cmdkey /delete:TERMSRV/RemotePC
```

---

## Часті питання

### Паролі в Credential Manager зашифровані?

Так — через Windows Data Protection API (DPAPI), прив'язаний до твого акаунту і машини. Інші облікові записи не можуть їх прочитати.

### Видалив credentials і мережеві диски не підключаються?

Додай знову: `cmdkey /add:НазваСервера /user:Domain\Username /pass:Password`. Підключи диск — Windows використає збережені credentials автоматично.

---

## Резюме

Відкрити: `control /name Microsoft.CredentialManager`. `cmdkey /add` для збереження, `/list` для перегляду, `/delete` для видалення. RDP: префікс `TERMSRV/`. Використовуй Credential Manager в скриптах замість жорстко закодованих паролів.
