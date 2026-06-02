---
title: "Налаштування мережі Hyper-V: віртуальні комутатори і NAT"
date: "2026-06-23"
publishDate: "2026-06-23"
description: "Налаштування віртуальних комутаторів Hyper-V в Windows. External, Internal і Private комутатори, NAT мережа, VLAN теги і діагностика підключення VM."
tags: ["windows", "hyper-v", "мережа", "віртуалізація", "адміністрування"]
readTime: 5
translatesEn: "how-to-configure-hyper-v-networking"
---

Мережа Hyper-V використовує віртуальні комутатори для підключення VM до зовнішньої мережі і між собою.

---

## Типи віртуальних комутаторів

| Тип | VM → Інтернет | VM → Хост | VM → VM |
|-----|--------------|----------|---------|
| **External** | ✅ Так | ✅ Так | ✅ Так |
| **Internal** | ❌ Ні | ✅ Так | ✅ Так |
| **Private** | ❌ Ні | ❌ Ні | ✅ Так |

---

## Створити комутатори

```powershell
# External (VM отримує інтернет через фізичний адаптер)
New-VMSwitch -Name "External-Switch" -NetAdapterName "Ethernet" -AllowManagementOS $true

# Internal (VM ↔ хост, без інтернету)
New-VMSwitch -Name "Internal-Switch" -SwitchType Internal

# Private (тільки VM між собою)
New-VMSwitch -Name "Private-Switch" -SwitchType Private
```

---

## Підключити VM до комутатора

```powershell
Add-VMNetworkAdapter -VMName "TestVM" -SwitchName "External-Switch"
Connect-VMNetworkAdapter -VMName "TestVM" -SwitchName "Internal-Switch"
```

---

## NAT мережа (інтернет без External)

Коли External недоступний (Wi-Fi або спільний доступ заборонений):

```powershell
# 1. Створити Internal комутатор
New-VMSwitch -Name "NATSwitch" -SwitchType Internal

# 2. Призначити IP хостовому адаптеру
New-NetIPAddress -InterfaceAlias "vEthernet (NATSwitch)" `
  -IPAddress "192.168.100.1" -PrefixLength 24

# 3. Створити NAT правило
New-NetNat -Name "NATNetwork" -InternalIPInterfaceAddressPrefix "192.168.100.0/24"

# 4. В VM встановити: IP=192.168.100.2, шлюз=192.168.100.1, DNS=8.8.8.8
```

---

## Часті питання

### VM немає інтернету — що перевірити?

1. `Get-VMNetworkAdapter` — чи підключений до External або NAT?
2. `Get-VMSwitch` — чи External прив'язаний до правильного фізичного адаптера?
3. В VM запусти `ipconfig` — є IP?

### Чи можна використовувати Wi-Fi для External комутатора?

Деякі Wi-Fi адаптери не підтримують External через обмеження драйвера. Використовуй NAT метод — він працює з будь-яким типом підключення.

---

## Резюме

External для інтернету. Internal для комунікації VM-хост. Private для ізольованих мереж. NAT коли External недоступний. `New-VMSwitch` і `Connect-VMNetworkAdapter` для налаштування.
