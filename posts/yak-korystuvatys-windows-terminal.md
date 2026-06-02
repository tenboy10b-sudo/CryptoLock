---
title: "Як користуватись Windows Terminal: вкладки, профілі і кастомізація"
date: "2026-05-17"
publishDate: "2026-05-17"
description: "Повний гайд по Windows Terminal. Налаштування профілів для PowerShell, CMD і WSL, вкладки, розділення панелей, JSON налаштування і гарячі клавіші."
tags: ["windows", "terminal", "powershell", "wsl", "продуктивність"]
readTime: 4
translatesEn: "how-to-use-windows-terminal"
---

Windows Terminal — сучасна заміна старому CMD і PowerShell з вкладками, кількома оболонками і повною кастомізацією.

---

## Встановити

```powershell
winget install Microsoft.WindowsTerminal
```

Або Microsoft Store (вбудований в Windows 11).

---

## Основні гарячі клавіші

| Комбінація | Дія |
|-----------|-----|
| `Ctrl + Shift + T` | Нова вкладка |
| `Ctrl + Shift + W` | Закрити вкладку |
| `Alt + Shift + D` | Розділити панель |
| `Ctrl + ,` | Відкрити налаштування |
| `F11` | Повний екран |

---

## Налаштування зовнішнього вигляду

`Ctrl + ,` → відкриває `settings.json`:

```json
{
  "profiles": {
    "defaults": {
      "colorScheme": "One Half Dark",
      "font": { "face": "Cascadia Code", "size": 12 },
      "opacity": 90,
      "useAcrylic": true
    }
  }
}
```

---

## Встановити шрифт Cascadia Code

```powershell
winget install Microsoft.CascadiaCode
```

Підтримує лігатури (`->`, `=>`) і Nerd Font іконки.

---

## Відкрити термінал в папці (контекстне меню)

Windows 11: ПКМ на папці → **Відкрити в терміналі**

Windows 10:
```powershell
$regPath = "HKCU:\SOFTWARE\Classes\Directory\Background\shell\wt"
New-Item -Path $regPath -Force
Set-ItemProperty $regPath -Name "(Default)" -Value "Відкрити в терміналі"
New-Item -Path "$regPath\command" -Force
Set-ItemProperty "$regPath\command" -Name "(Default)" -Value "wt.exe -d ."
```

---

## Часті питання

### Windows Terminal vs PowerShell ISE?

Terminal для щоденної роботи в командному рядку. ISE для написання і налагодження скриптів. ISE не підтримує PowerShell 7 — використовуй VS Code з розширенням PowerShell.

### Чи можна запускати Linux команди?

Так — встанови WSL (`wsl --install`) і відкрий WSL вкладку в Terminal.

---

## Резюме

Встановити через winget або Store. Основне: вкладки, розділення панелей, JSON налаштування. Cascadia Code для кращого досвіду. Починай в потрібній папці через "Відкрити в терміналі".
