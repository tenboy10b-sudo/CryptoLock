---
title: "Як підключитись до ПК без монітора: RDP, VNC і SSH"
date: "2026-09-17"
publishDate: "2026-09-17"
description: "Підключення до комп'ютера або сервера без монітора і клавіатури через RDP, VNC і SSH у Windows. Налаштування headless режиму і типові проблеми."
tags: ["windows", "мережа", "адміністрування", "налаштування", "rdp"]
readTime: 5
---

Сервер або домашній медіацентр без монітора — стандартна ситуація. Підключитись до нього можна трьома способами.

---

## Спосіб 1: RDP (Remote Desktop) — рекомендовано

RDP вбудований в Windows і дає повноцінний графічний доступ.

**На цільовому ПК (один раз):**

```powershell
# Увімкнути RDP
Set-ItemProperty "HKLM:\System\CurrentControlSet\Control\Terminal Server" `
  -Name fDenyTSConnections -Value 0
Enable-NetFirewallRule -DisplayGroup "Remote Desktop"
```

**Підключення з іншого ПК:**
`Win + R` → `mstsc` → введи IP або ім'я комп'ютера → підключись.

Детальніше: [Налаштування Remote Desktop](/nalashtuvannya-remote-desktop-rdp)

---

## Спосіб 2: SSH — для серверів і автоматизації

SSH дає командний рядок — без графіки але набагато легший.

```powershell
# Увімкнути OpenSSH сервер на цільовому ПК
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
Start-Service sshd
Set-Service -Name sshd -StartupType Automatic
```

**Підключення:**
```cmd
ssh username@192.168.1.100
```

Детальніше: [OpenSSH сервер на Windows](/openssh-server-windows-nalashtuvannya)

---

## Спосіб 3: VNC — для пристроїв без RDP

VNC підходить коли RDP недоступний (наприклад Raspberry Pi, Linux або Windows Home).

Популярні безкоштовні варіанти:
- **TightVNC** (tightvnc.com) — простий, безкоштовний
- **RealVNC** — безкоштовний для особистого використання
- **UltraVNC** — відкритий код

Встанови VNC Server на цільовому ПК → підключись через VNC Viewer.

---

## Headless режим — Windows без монітора

Якщо до ПК ніколи не підключено монітор, Windows може зависати або показувати низьку роздільну здатність.

**Примусова роздільна здатність без монітора:**

```powershell
# Встановити роздільну здатність через реєстр
$regPath = "HKLM:\SYSTEM\CurrentControlSet\Control\GraphicsDrivers\Configuration"
# Або використай DisplayFusion / virtual display adapter
```

Простіше: купи **HDMI Dummy Plug** (~$5) — імітує підключений монітор.

---

## Автоматичний вхід без пароля

Для сервера без монітора часто потрібно щоб Windows автоматично входила.

`Win + R` → `netplwiz` → вибери акаунт → зніми галочку "вимагати пароль" → введи пароль для підтвердження.

Детальніше: [Автоматичний вхід в Windows](/avtomatychnyy-vkhid-windows)

---

## Знайти IP пристрою в мережі

```powershell
# Сканувати підмережу для пошуку ПК
1..254 | ForEach-Object -Parallel {
    $ip = "192.168.1.$_"
    if (Test-Connection $ip -Count 1 -Quiet -TimeoutSeconds 1) {
        $host = try { [Net.Dns]::GetHostEntry($ip).HostName } catch { "N/A" }
        "$ip — $host"
    }
} -ThrottleLimit 50
```

---

## Підсумок

RDP — найкращий вибір для Windows ПК без монітора. SSH — для серверів і скриптів. VNC — коли немає RDP. HDMI Dummy Plug вирішує проблеми з роздільною здатністю в headless режимі.
