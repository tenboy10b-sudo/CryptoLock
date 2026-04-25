---
title: "Hyper-V: налаштування мережі для віртуальних машин"
date: "2026-06-29"
publishDate: "2026-06-29"
description: "Типи мережевих комутаторів Hyper-V: External, Internal і Private. Як налаштувати мережу для VM, доступ до інтернету і ізольована мережа між VM."
tags: ["windows", "адміністрування", "мережа", "налаштування", "безпека"]
readTime: 6
---

Мережа у Hyper-V — одна з найскладніших частин для початківців. Три типи комутаторів дають різні рівні ізоляції і доступу. Розберемо кожен.

---

## Три типи мережевих комутаторів

### External (Зовнішній)
VM має повний доступ до фізичної мережі і інтернету. Прив'язується до фізичного мережевого адаптера хосту.

Використання: продакшн VM, тестування в реальній мережі.

### Internal (Внутрішній)
VM спілкується з хост-машиною і між собою. Немає прямого доступу до фізичної мережі (але може через NAT на хості).

Використання: розробка, тестування без впливу на реальну мережу.

### Private (Приватний)
VM спілкуються тільки між собою. Хост не має доступу до цієї мережі.

Використання: ізольовані тестові середовища, симуляція мережевих атак.

---

## Створення комутатора через GUI

`Hyper-V Manager` → **Virtual Switch Manager** → вибери тип → **Create Virtual Switch**

---

## Створення через PowerShell

```powershell
# External switch — прив'язати до фізичного адаптера
$adapter = Get-NetAdapter | Where-Object { $_.Status -eq "Up" -and $_.Name -like "Ethernet*" } | Select-Object -First 1
New-VMSwitch -Name "External Switch" -NetAdapterName $adapter.Name -AllowManagementOS $true

# Internal switch
New-VMSwitch -Name "Internal Switch" -SwitchType Internal

# Private switch
New-VMSwitch -Name "Private Switch" -SwitchType Private

# Переглянути всі комутатори
Get-VMSwitch | Select-Object Name, SwitchType, NetAdapterInterfaceDescription
```

---

## Підключити VM до комутатора

```powershell
# Підключити VM до комутатора
Add-VMNetworkAdapter -VMName "MyVM" -SwitchName "External Switch"

# Замінити існуючий адаптер
Connect-VMNetworkAdapter -VMName "MyVM" -SwitchName "Internal Switch"

# Переглянути мережеві адаптери VM
Get-VMNetworkAdapter -VMName "MyVM"

# Кілька мережевих адаптерів у одній VM
Add-VMNetworkAdapter -VMName "MyVM" -SwitchName "Internal Switch" -Name "Internal NIC"
Add-VMNetworkAdapter -VMName "MyVM" -SwitchName "External Switch" -Name "External NIC"
```

---

## NAT — доступ до інтернету через Internal switch

Internal switch сам по собі не дає інтернету. Налаштуй NAT на хості:

```powershell
# Знайти IP адаптера Internal switch на хості
Get-NetIPAddress | Where-Object { $_.InterfaceAlias -like "*Internal*" }

# Призначити статичний IP адаптеру Internal switch
New-NetIPAddress -IPAddress 192.168.100.1 -PrefixLength 24 `
  -InterfaceAlias "vEthernet (Internal Switch)"

# Створити NAT
New-NetNat -Name "InternalNAT" -InternalIPInterfaceAddressPrefix "192.168.100.0/24"

# У VM встанови:
# IP: 192.168.100.x (будь-який в підмережі)
# Шлюз: 192.168.100.1
# DNS: 8.8.8.8
```

---

## VLAN для ізоляції трафіку

```powershell
# Встановити VLAN ID для мережевого адаптера VM
Set-VMNetworkAdapterVlan -VMName "MyVM" -Access -VlanId 100

# Переглянути VLAN налаштування
Get-VMNetworkAdapterVlan -VMName "MyVM"

# Вимкнути VLAN
Set-VMNetworkAdapterVlan -VMName "MyVM" -Untagged
```

---

## Обмеження пропускної здатності

```powershell
# Обмежити пропускну здатність до 100 Мбіт/с
Set-VMNetworkAdapter -VMName "MyVM" -MaximumBandwidth 100000000

# Встановити мінімально гарантовану пропускну здатність
Set-VMNetworkAdapter -VMName "MyVM" -MinimumBandwidthWeight 10

# Переглянути поточні налаштування
Get-VMNetworkAdapter -VMName "MyVM" | Select-Object Name, MaximumBandwidth, MinimumBandwidthWeight
```

---

## Типові проблеми

### VM не отримує IP від роутера (External switch)

```powershell
# Перевірити чи External switch прив'язаний до правильного адаптера
Get-VMSwitch "External Switch" | Select-Object Name, NetAdapterInterfaceDescription

# Перевірити чи VM підключена
Get-VMNetworkAdapter -VMName "MyVM" | Select-Object SwitchName, Connected
```

Переконайся що `AllowManagementOS $true` — інакше хост сам втратить мережу.

### Хост втратив мережу після створення External switch

```powershell
# Перевірити чи хост використовує віртуальний адаптер
Get-NetAdapter | Where-Object { $_.InterfaceDescription -like "*Hyper-V*" }
```

External switch ділить фізичний адаптер між хостом і VM. Якщо `AllowManagementOS = $false` — хост не матиме мережі.

### VM не може пінгувати хост через Internal switch

Перевір брандмауер на хості — можливо блокує ICMP для vEthernet адаптера:

```powershell
New-NetFirewallRule -DisplayName "Allow ICMP Hyper-V" -Protocol ICMPv4 `
  -IcmpType 8 -Direction Inbound -Action Allow `
  -InterfaceAlias "vEthernet (Internal Switch)"
```

---

## Підсумок

External — для VM з реальним IP і доступом до мережі. Internal + NAT — для VM з доступом до інтернету але без видимості в мережі. Private — повністю ізольовані VM. Для більшості тестових середовищ достатньо Internal + NAT.
