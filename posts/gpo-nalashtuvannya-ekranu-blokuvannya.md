---
title: "Налаштування екрану блокування Windows через GPO і реєстр"
date: "2026-07-06"
publishDate: "2026-07-06"
description: "Налаштування екрану блокування Windows для корпоративного середовища: заборона зміни фону, показ повідомлення, автоблокування і приховування імен користувачів."
tags: ["групова-політика", "gpo", "windows", "безпека", "адміністрування"]
readTime: 6
---

Екран блокування в корпоративному середовищі має бути налаштований правильно: показувати юридичне повідомлення, приховувати імена користувачів і автоматично блокуватись. Все це через GPO.

---

## Показати юридичне повідомлення при вході

Стандартна вимога в корпоративних середовищах.

`gpedit.msc` → **Computer Configuration** → **Windows Settings** → **Security Settings** → **Local Policies** → **Security Options**:

- **Interactive logon: Message title for users attempting to log on** → назва вікна
- **Interactive logon: Message text for users attempting to log on** → текст повідомлення

```powershell
# Через реєстр
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" `
  -Name "legalnoticecaption" -Value "Увага" -Type String
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" `
  -Name "legalnoticetext" -Value "Ця система призначена тільки для авторизованих користувачів." -Type String
```

---

## Приховати імена користувачів на екрані входу

```
Computer Configuration → Windows Settings → Security Settings → Local Policies → Security Options
→ Interactive logon: Do not display last signed-in → Enabled
→ Interactive logon: Do not display username at sign-in → Enabled
```

```powershell
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" `
  -Name "DontDisplayLastUserName" -Value 1 -Type DWord
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" `
  -Name "DontDisplayUserName" -Value 1 -Type DWord
```

---

## Автоблокування екрану через GPO

```
User Configuration → Administrative Templates → Control Panel → Personalization
→ Enable screen saver → Enabled
→ Screen saver timeout → 600 (10 хвилин)
→ Password protect the screen saver → Enabled
→ Force specific screen saver → scrnsave.scr (порожній чорний екран)
```

```powershell
# Через реєстр для поточного користувача
$path = "HKCU:\Control Panel\Desktop"
Set-ItemProperty $path -Name "ScreenSaveActive" -Value "1"
Set-ItemProperty $path -Name "ScreenSaveTimeOut" -Value "600"
Set-ItemProperty $path -Name "ScreenSaverIsSecure" -Value "1"
Set-ItemProperty $path -Name "SCRNSAVE.EXE" -Value "scrnsave.scr"
```

---

## Заборонити зміну фону екрану блокування

```
User Configuration → Administrative Templates → Control Panel → Personalization
→ Prevent changing lock screen and logon image → Enabled
```

Або встанови корпоративний фон:

```
Computer Configuration → Administrative Templates → Control Panel → Personalization
→ Force a specific default lock screen and logon image → Enabled
→ Path to lock screen image: \\server\share\lockscreen.jpg
```

---

## Вимкнути Spotlight (рекламні фони від Microsoft)

```
Computer Configuration → Administrative Templates → Control Panel → Personalization
→ Force a specific default lock screen image → Enabled (вкажи свій фон)

або

User Configuration → Administrative Templates → Windows Components → Cloud Content
→ Do not suggest third-party content in Windows spotlight → Enabled
→ Turn off Windows spotlight on lock screen → Enabled
```

---

## Обмежити кількість невдалих спроб входу

```
Computer Configuration → Windows Settings → Security Settings → Account Policies → Account Lockout Policy
→ Account lockout threshold → 5 (спроб)
→ Account lockout duration → 30 (хвилин)
→ Reset account lockout counter after → 30 (хвилин)
```

```powershell
# Через net accounts
net accounts /lockoutthreshold:5 /lockoutduration:30 /lockoutwindow:30
```

Детальніше: [Обмеження кількості спроб пароля](/obmezhennya-kilkosti-sprob-parolyu)

---

## Вимкнути кнопки на екрані блокування

```
Computer Configuration → Administrative Templates → System → Logon
→ Do not display network selection UI → Enabled  (приховати вибір мережі)
→ Turn off app notifications on the lock screen → Enabled  (без сповіщень)
```

Прибрати кнопки живлення і спеціальних можливостей:

```
Computer Configuration → Windows Settings → Security Settings → Local Policies → Security Options
→ Shutdown: Allow system to be shut down without having to log on → Disabled
```

---

## Перевірити застосування налаштувань

```cmd
gpupdate /force
gpresult /r | findstr /i "lock\|screen\|logon"
```

---

## Швидке блокування для користувачів

Нагадай користувачам: `Win + L` — миттєве блокування екрану без очікування таймера.

Детальніше про автоблокування: [Автоматичне блокування екрана через GPO](/avto-blokuvannya-ekranu-gpo)

---

## Підсумок

Мінімальний корпоративний стандарт: юридичне повідомлення при вході + приховати ім'я останнього користувача + автоблокування через 10 хвилин + блокування після 5 невдалих спроб. Все через одну GPO прив'язану до потрібного OU.
