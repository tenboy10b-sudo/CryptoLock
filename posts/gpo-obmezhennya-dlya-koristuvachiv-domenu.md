---
title: "Групова політика для користувачів домену: базові обмеження і налаштування"
date: "2026-05-09"
publishDate: "2026-05-09"
description: "Як налаштувати GPO для обмеження дій користувачів у домені Active Directory: заборона панелі керування, зміна паролю, доступ до реєстру і CMD."
tags: ["групова-політика", "gpo", "gpedit", "безпека", "адміністрування"]
readTime: 8
---

Групова політика (GPO) у домені Active Directory — основний інструмент адміністратора для централізованого управління ПК. Розберемо базові обмеження які застосовують у більшості організацій.

---

## Де налаштовується GPO у домені

На контролері домену відкрий:

`Win + R` → `gpmc.msc` → **Group Policy Management Console**

Тут видно всі GPO, до яких OU (організаційних підрозділів) вони прив'язані.

**Щоб створити нову політику:**

1. Клікни правою кнопкою на потрібний OU → **Create a GPO in this domain and link it here**
2. Дай назву (наприклад, "Обмеження для користувачів")
3. Клікни правою кнопкою на нову GPO → **Edit**

Відкриється редактор GPO. Всі налаштування для користувачів — у розділі **User Configuration**.

---

## 1. Заборона доступу до Панелі керування

**User Configuration** → **Administrative Templates** → **Control Panel** → **Prohibit access to Control Panel and PC Settings** → **Enabled**

Користувач більше не зможе відкрити Панель керування або Параметри Windows.

> Залиш доступ для адміністраторів через окрему GPO яка не поширюється на адмінський акаунт.

---

## 2. Заборона зміни пароля

**User Configuration** → **Administrative Templates** → **System** → **Ctrl+Alt+Del Options** → **Remove Change Password** → **Enabled**

Прибирає пункт "Змінити пароль" з меню Ctrl+Alt+Del.

---

## 3. Заборона доступу до командного рядка

**User Configuration** → **Administrative Templates** → **System** → **Prevent access to the command prompt** → **Enabled**

Додаткові параметри:
- **Also disable the command prompt script processing** → Yes — забороняє і .bat скрипти

Детальніше: [Заборона CMD для користувачів](/zaborona-cmd-dlya-korystuvachiv)

---

## 4. Заборона запуску PowerShell

**User Configuration** → **Administrative Templates** → **System** → **Don't run specified Windows applications** → **Enabled** → **Show** → додай:
- `powershell.exe`
- `powershell_ise.exe`
- `pwsh.exe`

Або через AppLocker для більш тонкого контролю. Детальніше: [Заборона запуску PowerShell](/zaborona-zapusku-powershell)

---

## 5. Заборона доступу до реєстру

**User Configuration** → **Administrative Templates** → **System** → **Prevent access to registry editing tools** → **Enabled**

Забороняє запуск `regedit.exe`.

---

## 6. Заборона встановлення програм

**User Configuration** → **Administrative Templates** → **Windows Components** → **Windows Installer** → **Prohibit User Installs** → **Enabled**

Або більш гнучко через AppLocker: [AppLocker налаштування](/applocker-gpo-nalashtuvannya)

---

## 7. Приховати диски у Провіднику

**User Configuration** → **Administrative Templates** → **Windows Components** → **File Explorer** → **Hide these specified drives in My Computer** → **Enabled** → вибери які диски приховати

Та окремо: **Prevent access to drives from My Computer** → **Enabled** — повністю блокує доступ, а не тільки ховає.

---

## 8. Заборона зовнішніх носіїв (USB)

**Computer Configuration** → **Administrative Templates** → **System** → **Removable Storage Access** → встанови **Deny** для потрібних класів:
- **All Removable Storage classes: Deny all access**

Або точково: детальніше: [Заборона USB через групову політику](/grupova-polityka-zaborona-usb)

---

## 9. Налаштування заставки і блокування екрана

**User Configuration** → **Administrative Templates** → **Control Panel** → **Personalization**:
- **Enable screen saver** → Enabled
- **Screen saver timeout** → 600 (10 хвилин)
- **Password protect the screen saver** → Enabled
- **Force specific screen saver** → `scrnsave.scr` (чорний екран)

Детальніше: [Автоматичне блокування екрана через GPO](/avto-blokuvannya-ekranu-gpo)

---

## 10. Перевір застосування GPO

Після налаштування на клієнтській машині виконай:

```cmd
gpupdate /force
```

Щоб переглянути які GPO застосовані:

```cmd
gpresult /r
```

або детальний HTML-звіт:

```cmd
gpresult /h C:\gpo-report.html
```

Відкрий `C:\gpo-report.html` у браузері — побачиш повний список застосованих політик.

---

## Порядок пріоритетів GPO

Якщо кілька GPO конфліктують — діє така черга (від найнижчого до найвищого пріоритету):

1. Local GPO (локальна на ПК)
2. Site GPO
3. Domain GPO
4. OU GPO (найвищий)

GPO з вищим пріоритетом перекриває нижчі. Якщо потрібно заблокувати успадкування — клікни правою кнопкою на OU → **Block Inheritance**.

---

## Підсумок

Базовий набір обмежень для користувачів домену охоплює: заборону CMD і PowerShell, доступу до реєстру і Панелі керування, блокування USB і автоматичне блокування екрана. Всі ці налаштування застосовуються централізовано через GPMC без візитів до кожного ПК.
