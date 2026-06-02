#!/usr/bin/env python3
"""
Одноразова авторизація для GSC API через OAuth.
Запусти: python auth.py
Відкриється браузер → авторизуйся → скрипт збереже token.json
"""

from google_auth_oauthlib.flow import InstalledAppFlow
import json, os

SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]

# Шукаємо client_secret файл в поточній папці
client_files = [f for f in os.listdir('.') if f.startswith('client_secret') and f.endswith('.json')]

if not client_files:
    print("❌ Файл client_secret_*.json не знайдено!")
    print("   Поклади завантажений JSON файл поруч з auth.py")
    exit(1)

client_file = client_files[0]
print(f"✅ Знайдено: {client_file}")
print("   Відкриється браузер для авторизації...")

flow = InstalledAppFlow.from_client_secrets_file(client_file, SCOPES)
creds = flow.run_local_server(port=0)

# Зберігаємо токени
token_data = {
    "token": creds.token,
    "refresh_token": creds.refresh_token,
    "token_uri": creds.token_uri,
    "client_id": creds.client_id,
    "client_secret": creds.client_secret,
    "scopes": list(creds.scopes),
}

with open("token.json", "w") as f:
    json.dump(token_data, f, indent=2)

print("\n✅ Авторизація успішна!")
print("   Файл token.json створено")
print("\n📋 Вміст token.json (збережи як GitHub Secret GSC_TOKEN_JSON):")
print(json.dumps(token_data, indent=2))
