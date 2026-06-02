---
title: "Windows Sandbox: безпечне тестування підозрілого ПЗ"
date: "2026-05-27"
publishDate: "2026-05-27"
description: "Використання Windows Sandbox для безпечного тестування підозрілих інсталяторів і файлів. Налаштування .wsb файлів, спільні папки, відключення мережі."
tags: ["windows", "sandbox", "безпека", "віртуалізація", "малваре"]
readTime: 4
translatesEn: "how-to-use-windows-sandbox-safely"
---

Windows Sandbox дає одноразове Windows середовище — все що ти запускаєш всередині зникає при закритті вікна. Ідеально для тестування ненадійного ПЗ.

---

## Увімкнути Sandbox

```powershell
Enable-WindowsOptionalFeature -FeatureName "Containers-DisposableClientVM" -Online -NoRestart
Restart-Computer
```

Або: `Win + R` → `optionalfeatures` → Windows Sandbox → OK → Перезавантажити.

---

## Базове використання

1. Пуск → **Windows Sandbox**
2. Перетягни файл або скопіюй всередину
3. Запусти що потрібно протестувати
4. Закрий вікно — **все всередині видаляється назавжди**

---

## Конфігурація через .wsb файл

```xml
<!-- TestSandbox.wsb — двічі клікни щоб запустити -->
<Configuration>
  <!-- Спільна папка (тільки читання) -->
  <MappedFolders>
    <MappedFolder>
      <HostFolder>C:\Downloads</HostFolder>
      <ReadOnly>true</ReadOnly>
    </MappedFolder>
  </MappedFolders>

  <!-- Вимкнути інтернет для максимальної ізоляції -->
  <Networking>Disable</Networking>
  <MemoryInMB>4096</MemoryInMB>
</Configuration>
```

---

## Sandbox vs Hyper-V VM

| | Sandbox | Hyper-V VM |
|--|---------|-----------|
| Час запуску | 5 секунд | 5-30 хвилин |
| Збереження | Немає (одноразовий) | Зберігається |
| Ізоляція | Добра | Краща |
| Знімки стану | Ні | Так |

Sandbox для швидкого тестування. Hyper-V для довгострокових середовищ.

---

## Часті питання

### Чи може малваре вийти з Sandbox?

Теоретично через VM escape, але надзвичайно рідко і вимагає складного zero-day. Для типового споживчого малваре — Sandbox безпечний.

### Чи можна зберегти файли з Sandbox на ПК?

Так — якщо спільна папка має `ReadOnly: false`, все що Sandbox записав туди залишається. Для тестування завжди використовуй `ReadOnly: true`.

---

## Резюме

Увімкнення через `optionalfeatures`. `.wsb` файли для відтворюваних сесій. Вимикай мережу для максимальної ізоляції. Ідеально для тестування інсталяторів і підозрілих завантажень перед запуском на основному ПК.
