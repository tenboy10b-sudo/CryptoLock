#!/usr/bin/env python3
"""GSC Analyzer v2 — OAuth version"""

import os, json, datetime, requests
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

SITE_URL       = "sc-domain:cryptolockua.com"
GITHUB_TOKEN   = os.environ.get("GITHUB_TOKEN")
GITHUB_REPO    = os.environ.get("GITHUB_REPO", "tenboy10b-sudo/CryptoLock")
GSC_TOKEN_JSON = os.environ.get("GSC_TOKEN_JSON")

TODAY         = datetime.date.today()
DATE_END      = TODAY.strftime("%Y-%m-%d")
DATE_START_28 = (TODAY - datetime.timedelta(days=28)).strftime("%Y-%m-%d")
DATE_START_7  = (TODAY - datetime.timedelta(days=7)).strftime("%Y-%m-%d")


def get_gsc_service():
    data  = json.loads(GSC_TOKEN_JSON)
    creds = Credentials(
        token=data.get("token"),
        refresh_token=data.get("refresh_token"),
        token_uri=data.get("token_uri"),
        client_id=data.get("client_id"),
        client_secret=data.get("client_secret"),
        scopes=data.get("scopes"),
    )
    if not creds.valid:
        creds.refresh(Request())
    return build("searchconsole", "v1", credentials=creds)


def gsc_query(service, dimensions, date_start=None, filters=None, limit=100):
    body = {
        "startDate": date_start or DATE_START_28,
        "endDate": DATE_END,
        "dimensions": dimensions,
        "rowLimit": limit,
        "orderBy": [{"fieldName": "impressions", "sortOrder": "DESCENDING"}]
    }
    if filters:
        body["dimensionFilterGroups"] = [{"filters": filters}]
    return service.searchanalytics().query(siteUrl=SITE_URL, body=body).execute().get("rows", [])


def build_report(service):
    print("Збираємо дані з GSC...")

    queries_28 = gsc_query(service, ["query"], limit=100)
    pages_28   = gsc_query(service, ["page"], limit=50)
    daily_28   = gsc_query(service, ["date"], limit=30)
    devices    = gsc_query(service, ["device"])
    countries  = gsc_query(service, ["country"])
    queries_7  = gsc_query(service, ["query"], date_start=DATE_START_7, limit=50)

    total_impr   = sum(r.get("impressions", 0) for r in daily_28)
    total_clicks = sum(r.get("clicks", 0) for r in daily_28)
    avg_ctr      = round(total_clicks / total_impr * 100, 2) if total_impr else 0
    avg_pos      = round(sum(r.get("position", 0) for r in pages_28) / len(pages_28), 1) if pages_28 else 0

    half = len(daily_28) // 2
    first_impr = sum(r.get("impressions", 0) for r in daily_28[:half])
    last_impr  = sum(r.get("impressions", 0) for r in daily_28[half:])
    trend = round((last_impr - first_impr) / first_impr * 100, 1) if first_impr else 0

    top3, top10, page2, far = [], [], [], []
    for r in pages_28:
        pos  = r.get("position", 99)
        page = r["keys"][0].replace("https://cryptolockua.com", "").replace("sc-domain:cryptolockua.com", "") or "/"
        d = {"page": page, "pos": round(pos, 1),
             "impr": r.get("impressions", 0), "clicks": r.get("clicks", 0),
             "ctr": round(r.get("ctr", 0) * 100, 1)}
        if pos <= 3:    top3.append(d)
        elif pos <= 10: top10.append(d)
        elif pos <= 20: page2.append(d)
        else:           far.append(d)

    EXPECTED_CTR = {1:0.28,2:0.15,3:0.11,4:0.08,5:0.07,6:0.06,7:0.05,8:0.04,9:0.04,10:0.03}
    ctr_ops = []
    for r in pages_28:
        pos  = r.get("position", 99)
        ctr  = r.get("ctr", 0)
        impr = r.get("impressions", 0)
        page = r["keys"][0].replace("https://cryptolockua.com", "").replace("sc-domain:cryptolockua.com", "") or "/"
        exp  = EXPECTED_CTR.get(int(pos), 0.02)
        if pos <= 10 and ctr < exp * 0.7 and impr >= 5:
            ctr_ops.append({"page": page, "pos": round(pos, 1),
                            "ctr": round(ctr * 100, 1), "impr": impr,
                            "lost": int(impr * (exp - ctr))})
    ctr_ops.sort(key=lambda x: -x["lost"])

    quick_wins = [
        {"query": r["keys"][0], "pos": round(r.get("position", 0), 1),
         "impr": r.get("impressions", 0), "clicks": r.get("clicks", 0),
         "ctr": round(r.get("ctr", 0) * 100, 1)}
        for r in queries_28
        if 4 < r.get("position", 99) <= 15 and r.get("impressions", 0) >= 5
    ][:20]

    zero_ctr = [
        {"query": r["keys"][0], "pos": round(r.get("position", 0), 1),
         "impr": r.get("impressions", 0)}
        for r in queries_28
        if r.get("clicks", 0) == 0 and r.get("impressions", 0) >= 10
    ][:15]

    old_q = set(r["keys"][0] for r in queries_28)
    new_queries = [r for r in queries_7 if r["keys"][0] not in old_q]

    page_queries = {}
    for row in pages_28[:5]:
        page = row["keys"][0].replace(SITE_URL.rstrip("/"), "") or "/"
        pq = gsc_query(service, ["query"], filters=[{
            "dimension": "page", "operator": "equals",
            "expression": row["keys"][0]
        }], limit=8)
        page_queries[page] = [r["keys"][0] for r in pq]

    now = TODAY.strftime("%d.%m.%Y")
    trend_icon = "📈" if trend > 0 else "📉"

    rep = f"""# 📊 SEO Звіт — cryptolockua.com ({now})

> Автоматичний звіт | {DATE_START_28} → {DATE_END}

## 📈 Загальна динаміка

| Метрика | Значення |
|---------|---------|
| Покази | **{total_impr:,}** |
| Кліки | **{total_clicks:,}** |
| CTR | **{avg_ctr}%** |
| Середня позиція | **{avg_pos}** |
| Тренд | {trend_icon} **{trend:+.1f}%** |
| Топ-3 | **{len(top3)}** сторінок |
| Топ-10 | **{len(top3)+len(top10)}** сторінок |
| Позиції 11-20 | **{len(page2)}** сторінок |

## 🏆 Топ-3 сторінки
"""
    for p in top3:
        rep += f"- `{p['page']}` pos **{p['pos']}** | {p['impr']} показів | {p['ctr']}% CTR | {p['clicks']} кліків\n"

    rep += f"\n## ✅ Топ 4-10 ({len(top10)} сторінок)\n"
    for p in top10[:12]:
        rep += f"- `{p['page']}` pos **{p['pos']}** | {p['impr']} показів | {p['ctr']}% CTR\n"

    rep += f"\n## ⚡ Позиції 11-20 — майже в топ-10\n"
    for p in page2[:10]:
        rep += f"- `{p['page']}` pos **{p['pos']}** | {p['impr']} показів\n"

    rep += f"\n## 🎯 Quick Wins — запити біля топ-10\n\n| Запит | Позиція | Покази | CTR |\n|-------|---------|--------|-----|\n"
    for w in quick_wins[:15]:
        rep += f"| `{w['query']}` | {w['pos']} | {w['impr']} | {w['ctr']}% |\n"

    rep += f"\n## ⚡ CTR Opportunities\n\n| Сторінка | Позиція | CTR | Покази | Втрачені кліки |\n|----------|---------|-----|--------|----------------|\n"
    for op in ctr_ops[:10]:
        rep += f"| `{op['page']}` | {op['pos']} | {op['ctr']}% | {op['impr']} | **~{op['lost']}** |\n"

    rep += f"\n## 🔍 Запити з 0 кліків (10+ показів)\n\n| Запит | Позиція | Покази |\n|-------|---------|--------|\n"
    for z in zero_ctr:
        rep += f"| `{z['query']}` | {z['pos']} | {z['impr']} |\n"

    if new_queries:
        rep += f"\n## 🆕 Нові запити за 7 днів\n"
        for q in new_queries[:10]:
            rep += f"- `{q['keys'][0]}` — pos {round(q.get('position',0),1)}, {q.get('impressions',0)} показів\n"

    rep += f"\n## 🌍 Країни\n"
    for row in countries[:5]:
        rep += f"- **{row['keys'][0].upper()}**: {row['impressions']} показів, {row['clicks']} кліків\n"

    rep += f"\n## 📱 Пристрої\n"
    for row in devices:
        rep += f"- **{row['keys'][0]}**: {row['impressions']} показів\n"

    rep += f"\n## 📋 Запити для топ-5 сторінок\n"
    for page, pqs in page_queries.items():
        if pqs:
            rep += f"\n**`{page}`**\n"
            for q in pqs[:6]:
                rep += f"- `{q}`\n"

    rep += f"\n## 🚨 Рекомендації\n\n### 🔴 Терміново:\n"
    if ctr_ops:
        rep += f"1. **CTR fix** — `{ctr_ops[0]['page']}` pos {ctr_ops[0]['pos']}, CTR {ctr_ops[0]['ctr']}%\n"
    if quick_wins:
        rep += f"2. **Quick win** — `{quick_wins[0]['query']}` pos {quick_wins[0]['pos']} ({quick_wins[0]['impr']} показів)\n"
    if page2:
        rep += f"3. **Вивести в топ-10** — `{page2[0]['page']}` pos {page2[0]['pos']}\n"

    rep += "\n### 🟡 Цього тижня:\n- Перевірити нові 404 в GSC\n- Запустити `add-tool-links.py`\n- Запросити переіндексацію оновлених сторінок\n"
    rep += f"\n---\n_Звіт: {now} | Наступний: через 7 днів_\n"
    return rep


def create_issue(title, body):
    resp = requests.post(
        f"https://api.github.com/repos/{GITHUB_REPO}/issues",
        headers={"Authorization": f"token {GITHUB_TOKEN}",
                 "Accept": "application/vnd.github.v3+json"},
        json={"title": title, "body": body, "labels": ["seo-report"]}
    )
    if resp.status_code == 201:
        print(f"✅ Issue: {resp.json()['html_url']}")
    else:
        print(f"❌ {resp.status_code}: {resp.text[:200]}")


def main():
    if not GSC_TOKEN_JSON:
        print("❌ GSC_TOKEN_JSON не задано")
        return
    service = get_gsc_service()
    report  = build_report(service)

    os.makedirs("reports", exist_ok=True)
    path = f"reports/seo-{TODAY}.md"
    with open(path, "w", encoding="utf-8") as f:
        f.write(report)
    print(f"✅ Збережено: {path}")

    if GITHUB_TOKEN:
        create_issue(f"📊 SEO Звіт — {TODAY.strftime('%d.%m.%Y')}", report)


if __name__ == "__main__":
    main()
