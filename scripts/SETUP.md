# Налаштування GSC Analyzer

## Крок 1: Google Cloud Service Account

1. Зайди на https://console.cloud.google.com
2. Створи новий проект або вибери існуючий
3. APIs & Services → Enable APIs → увімкни **Google Search Console API**
4. APIs & Services → Credentials → Create Credentials → **Service Account**
5. Ім'я: `cryptolock-seo-bot`
6. Натисни на створений акаунт → Keys → Add Key → JSON
7. Завантажиться файл `.json` — це і є `GSC_CREDENTIALS_JSON`

## Крок 2: Додати Service Account в GSC

1. Відкрий Google Search Console
2. Налаштування → Користувачі та дозволи → Додати
3. Email: скопіюй з JSON файлу поле `client_email`
4. Роль: **Повний доступ**

## Крок 3: GitHub Secrets

1. GitHub репо → Settings → Secrets → Actions → New secret
2. Ім'я: `GSC_CREDENTIALS_JSON`
3. Значення: весь вміст JSON файлу (скопіюй і вставте)

## Крок 4: Додати файли в репо

Скопіюй ці файли в проект:
- `.github/workflows/seo-report.yml`
- `scripts/gsc_analyzer.py`
- `scripts/requirements.txt`

```
git add .
git commit -m "Add GSC Analyzer automation"
git push
```

## Крок 5: Перший запуск

GitHub → Actions → Weekly SEO Report → Run workflow

## Що отримуєш щонеділі:

- GitHub Issue зі звітом (автоматично)
- Файл `reports/seo-report-YYYY-MM-DD.md` в репо

## Як використовувати зі мною:

Скидай посилання на GitHub Issue або вміст reports/*.md
і я одразу аналізую і роблю виправлення.
