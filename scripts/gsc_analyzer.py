#!/usr/bin/env python3
"""
GSC Analyzer — автоматичний аналіз Google Search Console
Запускається через GitHub Actions раз на тиждень
Збирає: позиції, CTR, 404, trending запити
Генерує: детальний звіт у GitHub Issue
"""

import os
import json
import datetime
import requests
from google.oauth2.credentials import Credentials
from google.oauth2 import service_account
from googleapiclient.discovery import build

# ── Конфігурація ──────────────────────────────────────────────────────────────
SITE_URL        = "https://cryptolockua.com/"
GITHUB_TOKEN    = os.environ.get("GITHUB_TOKEN")
GITHUB_REPO     = os.environ.get("GITHUB_REPO", "tenboy10b-sudo/CryptoLock")
GSC_CREDS_JSON  = os.environ.get("GSC_CREDENTIALS_JSON")  # Service Account JSON

TODAY      = datetime.date.today()
DATE_END   = TODAY.strftime("%Y-%m-%d")
DATE_START = (TODAY - datetime.timedelta(days=28)).strftime("%Y-%m-%d")
DATE_START_3M = (TODAY - datetime.timedelta(days=90)).strftime("%Y-%m-%d")


# ── GSC API підключення ───────────────────────────────────────────────────────
def get_gsc_service():
    creds_info = json.loads(GSC_CREDS_JSON)
    creds = service_account.Credentials.from_service_account_info(
        creds_info,
        scopes=["https://www.googleapis.com/auth/webmasters.readonly"]
    )
    return build("searchconsole", "v1", credentials=creds)


# ── Запити до GSC API ─────────────────────────────────────────────────────────
def fetch_top_queries(service, days=28):
    """Топ запити за останні N днів"""
    date_start = (TODAY - datetime.timedelta(days=days)).strftime("%Y-%m-%d")
    response = service.searchanalytics().query(
        siteUrl=SITE_URL,
        body={
            "startDate": date_start,
            "endDate": DATE_END,
            "dimensions": ["query"],
            "rowLimit": 100,
            "orderBy": [{"fieldName": "impressions", "sortOrder": "DESCENDING"}]
        }
    ).execute()
    return response.get("rows", [])


def fetch_top_pages(service, days=28):
    """Топ сторінки за останні N днів"""
    date_start = (TODAY - datetime.timedelta(days=days)).strftime("%Y-%m-%d")
    response = service.searchanalytics().query(
        siteUrl=SITE_URL,
        body={
            "startDate": date_start,
            "endDate": DATE_END,
            "dimensions": ["page"],
            "rowLimit": 50,
            "orderBy": [{"fieldName": "impressions", "sortOrder": "DESCENDING"}]
        }
    ).execute()
    return response.get("rows", [])


def fetch_daily_stats(service, days=28):
    """Динаміка по днях"""
    date_start = (TODAY - datetime.timedelta(days=days)).strftime("%Y-%m-%d")
    response = service.searchanalytics().query(
        siteUrl=SITE_URL,
        body={
            "startDate": date_start,
            "endDate": DATE_END,
            "dimensions": ["date"],
            "rowLimit": 100,
            "orderBy": [{"fieldName": "date", "sortOrder": "ASCENDING"}]
        }
    ).execute()
    return response.get("rows", [])


def fetch_page_queries(service, page_url, days=28):
    """Запити для конкретної сторінки"""
    date_start = (TODAY - datetime.timedelta(days=days)).strftime("%Y-%m-%d")
    response = service.searchanalytics().query(
        siteUrl=SITE_URL,
        body={
            "startDate": date_start,
            "endDate": DATE_END,
            "dimensions": ["query"],
            "dimensionFilterGroups": [{
                "filters": [{
                    "dimension": "page",
                    "operator": "equals",
                    "expression": page_url
                }]
            }],
            "rowLimit": 20
        }
    ).execute()
    return response.get("rows", [])


def fetch_device_stats(service, days=28):
    """Статистика по пристроях"""
    date_start = (TODAY - datetime.timedelta(days=days)).strftime("%Y-%m-%d")
    response = service.searchanalytics().query(
        siteUrl=SITE_URL,
        body={
            "startDate": date_start,
            "endDate": DATE_END,
            "dimensions": ["device"],
            "rowLimit": 10
        }
    ).execute()
    return response.get("rows", [])


def fetch_country_stats(service, days=28):
    """Статистика по країнах"""
    date_start = (TODAY - datetime.timedelta(days=days)).strftime("%Y-%m-%d")
    response = service.searchanalytics().query(
        siteUrl=SITE_URL,
        body={
            "startDate": date_start,
            "endDate": DATE_END,
            "dimensions": ["country"],
            "rowLimit": 10,
            "orderBy": [{"fieldName": "impressions", "sortOrder": "DESCENDING"}]
        }
    ).execute()
    return response.get("rows", [])


# ── Google Trends через pytrends ──────────────────────────────────────────────
def fetch_trends(keywords):
    """Актуальні тренди для ключових слів"""
    try:
        from pytrends.request import TrendReq
        pytrends = TrendReq(hl='uk-UA', tz=120, timeout=(10, 25))

        results = {}
        # Перевіряємо по 5 слів за раз (обмеження API)
        for i in range(0, len(keywords), 5):
            batch = keywords[i:i+5]
            try:
                pytrends.build_payload(batch, cat=5, timeframe='now 7-d', geo='UA')
                interest = pytrends.interest_over_time()
                if not interest.empty:
                    for kw in batch:
                        if kw in interest.columns:
                            results[kw] = int(interest[kw].mean())
            except Exception:
                pass

        return results
    except ImportError:
        return {}


def fetch_trending_searches():
    """Поточні трендові запити в Україні"""
    try:
        from pytrends.request import TrendReq
        pytrends = TrendReq(hl='uk-UA', tz=120)
        trending = pytrends.trending_searches(pn='ukraine')
        return trending[0].tolist()[:20]
    except Exception:
        return []


def fetch_related_queries(keyword):
    """Пов'язані запити для ключового слова"""
    try:
        from pytrends.request import TrendReq
        pytrends = TrendReq(hl='uk-UA', tz=120)
        pytrends.build_payload([keyword], timeframe='now 7-d', geo='UA')
        related = pytrends.related_queries()
        if keyword in related and related[keyword]['top'] is not None:
            return related[keyword]['top']['query'].tolist()[:10]
    except Exception:
        pass
    return []


# ── Аналіз даних ─────────────────────────────────────────────────────────────
def analyze_ctr_opportunities(pages):
    """Сторінки з поганим CTR але хорошими позиціями"""
    opportunities = []
    for row in pages:
        pos      = row.get("position", 99)
        ctr      = row.get("ctr", 0)
        impr     = row.get("impressions", 0)
        clicks   = row.get("clicks", 0)
        page     = row["keys"][0].replace(SITE_URL.rstrip("/"), "")

        # Позиція в топ-10 але CTR < 5% — погано
        if pos <= 10 and ctr < 0.05 and impr >= 5:
            expected_ctr = 0.10 if pos <= 3 else 0.05
            lost_clicks  = int(impr * (expected_ctr - ctr))
            opportunities.append({
                "page": page,
                "pos": round(pos, 1),
                "ctr": round(ctr * 100, 1),
                "impr": impr,
                "clicks": clicks,
                "lost_clicks": lost_clicks,
            })

    return sorted(opportunities, key=lambda x: -x["lost_clicks"])


def analyze_position_groups(pages):
    """Групуємо сторінки за позиціями"""
    groups = {
        "top3":    [],  # позиції 1-3
        "top10":   [],  # 4-10
        "page2":   [],  # 11-20
        "far":     [],  # 20+
    }
    for row in pages:
        pos  = row.get("position", 99)
        page = row["keys"][0].replace(SITE_URL.rstrip("/"), "")
        impr = row.get("impressions", 0)
        data = {"page": page, "pos": round(pos, 1), "impr": impr,
                "clicks": row.get("clicks", 0), "ctr": round(row.get("ctr", 0) * 100, 1)}

        if pos <= 3:      groups["top3"].append(data)
        elif pos <= 10:   groups["top10"].append(data)
        elif pos <= 20:   groups["page2"].append(data)
        else:             groups["far"].append(data)

    return groups


def find_quick_wins(queries):
    """Запити на позиціях 5-15 з великою кількістю показів"""
    wins = []
    for row in queries:
        pos  = row.get("position", 99)
        impr = row.get("impressions", 0)
        ctr  = row.get("ctr", 0)
        q    = row["keys"][0]

        if 4 < pos <= 15 and impr >= 10:
            wins.append({
                "query": q,
                "pos":   round(pos, 1),
                "impr":  impr,
                "ctr":   round(ctr * 100, 1),
                "clicks": row.get("clicks", 0),
            })

    return sorted(wins, key=lambda x: -x["impr"])[:20]


# ── Формування звіту ──────────────────────────────────────────────────────────
def build_report(service):
    print("Збираємо дані з GSC...")

    queries  = fetch_top_queries(service)
    pages    = fetch_top_pages(service)
    daily    = fetch_daily_stats(service)
    devices  = fetch_device_stats(service)
    countries = fetch_country_stats(service)

    print("Аналізуємо дані...")

    groups       = analyze_position_groups(pages)
    ctr_ops      = analyze_ctr_opportunities(pages)
    quick_wins   = find_quick_wins(queries)

    # Динаміка
    total_impr   = sum(r.get("impressions", 0) for r in daily)
    total_clicks = sum(r.get("clicks", 0) for r in daily)
    avg_ctr      = total_clicks / total_impr * 100 if total_impr else 0
    avg_pos      = sum(r.get("position", 0) for r in daily) / len(daily) if daily else 0

    # Тренди
    print("Збираємо тренди...")
    top_query_words = [r["keys"][0] for r in queries[:10]]
    trends = fetch_trends(top_query_words)
    trending_ua = fetch_trending_searches()

    # Пов'язані запити для топ сторінок
    related_map = {}
    for row in pages[:5]:
        page = row["keys"][0].replace(SITE_URL.rstrip("/"), "")
        q_rows = fetch_page_queries(service, row["keys"][0])
        related_map[page] = [r["keys"][0] for r in q_rows[:5]]

    # ── Будуємо Markdown звіт ──────────────────────────────────────────────────
    now = TODAY.strftime("%d.%m.%Y")
    report = f"""# 📊 SEO Звіт — cryptolockua.com ({now})

> Автоматично згенеровано GSC Analyzer. Період: {DATE_START} → {DATE_END}

---

## 📈 Загальна динаміка (28 днів)

| Метрика | Значення |
|---------|---------|
| Загалом показів | **{total_impr:,}** |
| Загалом кліків | **{total_clicks:,}** |
| Середній CTR | **{avg_ctr:.2f}%** |
| Середня позиція | **{avg_pos:.1f}** |
| Сторінок в топ-10 | **{len(groups["top3"]) + len(groups["top10"])}** |
| Сторінок в топ-3 | **{len(groups["top3"])}** |

---

## 🏆 Топ-10 сторінки

### У топ-3 ({len(groups["top3"])} сторінок)
"""
    for p in groups["top3"][:5]:
        report += f"- `{p['page']}` — pos **{p['pos']}**, {p['impr']} показів, {p['ctr']}% CTR\n"

    report += f"\n### Позиції 4-10 ({len(groups['top10'])} сторінок)\n"
    for p in groups["top10"][:10]:
        report += f"- `{p['page']}` — pos **{p['pos']}**, {p['impr']} показів, {p['ctr']}% CTR\n"

    report += f"\n### Позиції 11-20 ({len(groups['page2'])} сторінок — майже топ-10)\n"
    for p in groups["page2"][:10]:
        report += f"- `{p['page']}` — pos **{p['pos']}**, {p['impr']} показів\n"

    report += f"""
---

## 🎯 Quick Wins — запити на межі топ-10

Ці запити на позиціях 5-15 з великою кількістю показів. Невеликі покращення виведуть їх в топ-5.

| Запит | Позиція | Покази | CTR |
|-------|---------|--------|-----|
"""
    for w in quick_wins[:15]:
        report += f"| `{w['query']}` | {w['pos']} | {w['impr']} | {w['ctr']}% |\n"

    report += f"""
---

## ⚡ CTR Opportunities — погані кліки при хороших позиціях

Ці сторінки в топ-10 але CTR нижче норми. Виправлення title/description дасть кліки.

| Сторінка | Позиція | CTR | Покази | Втрачені кліки |
|----------|---------|-----|--------|----------------|
"""
    for op in ctr_ops[:10]:
        report += f"| `{op['page']}` | {op['pos']} | {op['ctr']}% | {op['impr']} | ~{op['lost_clicks']} |\n"

    report += "\n---\n\n## 🌍 Географія\n\n"
    for row in countries[:5]:
        country = row["keys"][0].upper()
        report += f"- **{country}**: {row['impressions']} показів, {row['clicks']} кліків, CTR {round(row['ctr']*100,1)}%\n"

    report += "\n---\n\n## 📱 Пристрої\n\n"
    for row in devices:
        device = row["keys"][0]
        report += f"- **{device}**: {row['impressions']} показів, {round(row['ctr']*100,1)}% CTR\n"

    report += "\n---\n\n## 🔥 Тренди в Україні зараз\n\n"
    if trending_ua:
        report += "Поточні трендові запити:\n"
        for i, t in enumerate(trending_ua[:15], 1):
            report += f"{i}. {t}\n"
    else:
        report += "_Дані недоступні_\n"

    report += "\n---\n\n## 📊 Запити і тренди для наших топ-сторінок\n\n"
    for page, page_queries in list(related_map.items())[:5]:
        if page_queries:
            report += f"**`{page}`**\n"
            for q in page_queries:
                trend_val = trends.get(q, "—")
                report += f"- `{q}` (тренд: {trend_val})\n"
            report += "\n"

    report += f"""
---

## 🚨 Рекомендовані дії

### 🔴 Терміново (вплив на трафік цього тижня):
"""
    # Авто-генеруємо рекомендації на основі даних
    if ctr_ops:
        top_ctr = ctr_ops[0]
        report += f"1. **Виправити CTR** — `{top_ctr['page']}` (pos {top_ctr['pos']}, CTR {top_ctr['ctr']}%) — оновити title/description\n"

    if quick_wins:
        top_win = quick_wins[0]
        report += f"2. **Quick win** — запит `{top_win['query']}` на позиції {top_win['pos']} ({top_win['impr']} показів) — потрібна стаття або оновлення\n"

    if groups["page2"]:
        top_p2 = groups["page2"][0]
        report += f"3. **Вивести в топ-10** — `{top_p2['page']}` на позиції {top_p2['pos']} — розширити контент і внутрішні посилання\n"

    report += """
### 🟡 Важливо (цього місяця):
- Додати FAQ блоки в статті що показуються але не мають rich snippets
- Перевірити нові 404 в GSC і додати redirects
- Запустити `add-tool-links.py` після нових статей

### 🟢 Генерація контенту:
"""
    # Запити без нашого контенту
    our_slugs = set()
    try:
        import glob
        for f in glob.glob("posts/*.md") + glob.glob("posts-en/*.md"):
            slug = os.path.basename(f).replace(".md", "").lower()
            our_slugs.add(slug)
    except Exception:
        pass

    report += "Нові теми для статей на основі quick wins:\n"
    for w in quick_wins[:5]:
        report += f"- `{w['query']}` — pos {w['pos']}, {w['impr']} показів\n"

    report += f"\n\n---\n_Звіт згенеровано: {now} | Наступний: через 7 днів_\n"

    return report


# ── Публікація в GitHub Issues ────────────────────────────────────────────────
def create_github_issue(title, body):
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json",
    }
    data = {
        "title": title,
        "body": body,
        "labels": ["seo-report", "automated"],
    }
    url = f"https://api.github.com/repos/{GITHUB_REPO}/issues"
    response = requests.post(url, json=data, headers=headers)

    if response.status_code == 201:
        issue = response.json()
        print(f"✅ Issue створено: {issue['html_url']}")
        return issue["html_url"]
    else:
        print(f"❌ Помилка: {response.status_code} — {response.text}")
        return None


def save_report_to_file(report):
    """Зберігає звіт у файл reports/"""
    os.makedirs("reports", exist_ok=True)
    filename = f"reports/seo-report-{TODAY.strftime('%Y-%m-%d')}.md"
    with open(filename, "w", encoding="utf-8") as f:
        f.write(report)
    print(f"✅ Звіт збережено: {filename}")
    return filename


# ── Головна функція ───────────────────────────────────────────────────────────
def main():
    if not GSC_CREDS_JSON:
        print("❌ GSC_CREDENTIALS_JSON не задано")
        return

    service = get_gsc_service()
    report  = build_report(service)

    # Зберігаємо файл
    save_report_to_file(report)

    # Публікуємо як GitHub Issue
    if GITHUB_TOKEN:
        title = f"📊 SEO Звіт — {TODAY.strftime('%d.%m.%Y')}"
        create_github_issue(title, report)
    else:
        print("GITHUB_TOKEN не задано — тільки файл")
        print(report)


if __name__ == "__main__":
    main()
