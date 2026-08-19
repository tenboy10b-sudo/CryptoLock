"""One-off: respace the future-publishDate article queue from ~1 pair/day
to 2 pairs/week (Tue+Fri), preserving relative order. Updates both `date`
and `publishDate` (keeps them in sync — see DOCUMENTATION.md session 12
cont. 38 for the bug that happens when they drift apart).

Dry-run by default (prints the plan, writes nothing). Pass --apply to write.
"""
import datetime
import os
import re
import sys

TODAY = datetime.date.today()
UK_DIR = "posts"
EN_DIR = "posts-en"


def frontmatter_field(text, field):
    m = re.search(rf'^{field}:\s*"?([^"\n]+?)"?\s*$', text, re.MULTILINE)
    return m.group(1).strip() if m else None


def load_all(dirpath):
    out = {}
    for fn in os.listdir(dirpath):
        if not fn.endswith(".md"):
            continue
        slug = fn[:-3]
        path = os.path.join(dirpath, fn)
        with open(path, encoding="utf-8") as f:
            text = f.read()
        head = text[:2000]
        pub_raw = frontmatter_field(head, "publishDate") or frontmatter_field(head, "date")
        try:
            pub_date = datetime.date.fromisoformat(pub_raw[:10]) if pub_raw else None
        except ValueError:
            pub_date = None
        out[slug] = dict(
            path=path,
            text=text,
            pub=pub_date,
            translatesEn=frontmatter_field(head, "translatesEn"),
            translatesUk=frontmatter_field(head, "translatesUk"),
        )
    return out


def build_pairs(uk_future, en_future):
    """Pair UK<->EN future posts via translatesEn/translatesUk, oldest pub first.
    Falls back to solo entries for anything unmatched (should be none, but don't crash)."""
    en_by_uk_slug = {}
    for en_slug, d in en_future.items():
        if d["translatesUk"]:
            en_by_uk_slug[d["translatesUk"]] = en_slug

    used_en = set()
    pairs = []
    solos = []
    for uk_slug, d in sorted(uk_future.items(), key=lambda kv: kv[1]["pub"]):
        en_slug = d["translatesEn"] if d["translatesEn"] in en_future else en_by_uk_slug.get(uk_slug)
        if en_slug and en_slug not in used_en:
            pairs.append((uk_slug, en_slug, d["pub"]))
            used_en.add(en_slug)
        else:
            solos.append(("uk", uk_slug, d["pub"]))

    for en_slug, d in sorted(en_future.items(), key=lambda kv: kv[1]["pub"]):
        if en_slug not in used_en:
            solos.append(("en", en_slug, d["pub"]))

    return pairs, solos


def schedule_dates(n, start_from):
    """2 slots/week: every Tue (1) and Fri (4), starting the first such day >= start_from."""
    slots = []
    d = start_from
    while len(slots) < n:
        if d.weekday() in (1, 4):
            slots.append(d)
        d += datetime.timedelta(days=1)
    return slots


def set_dates(text, new_date_iso):
    text = re.sub(r'^date:\s*"?[^"\n]+"?\s*$', f'date: "{new_date_iso}"', text, count=1, flags=re.MULTILINE)
    text = re.sub(r'^publishDate:\s*"?[^"\n]+"?\s*$', f'publishDate: "{new_date_iso}"', text, count=1, flags=re.MULTILINE)
    return text


def main():
    apply = "--apply" in sys.argv

    uk = load_all(UK_DIR)
    en = load_all(EN_DIR)
    uk_future = {s: d for s, d in uk.items() if d["pub"] and d["pub"] > TODAY}
    en_future = {s: d for s, d in en.items() if d["pub"] and d["pub"] > TODAY}

    pairs, solos = build_pairs(uk_future, en_future)

    # One combined, chronologically-ordered event list: a pair (UK+EN, same new date)
    # or a solo (its translation already published earlier — still gets its own slot),
    # so relative publish order is preserved across both kinds of events.
    events = [("pair", uk_slug, en_slug, old_date) for uk_slug, en_slug, old_date in pairs]
    events += [("solo", lang, slug, old_date) for lang, slug, old_date in solos]
    events.sort(key=lambda e: e[3])

    start_from = TODAY + datetime.timedelta(days=1)
    slot_dates = schedule_dates(len(events), start_from)

    print(f"{'APPLYING' if apply else 'DRY RUN'} — {len(pairs)} pairs, {len(solos)} solo(s), {len(events)} slots total")
    print(f"New range: {slot_dates[0] if slot_dates else '-'} .. {slot_dates[-1] if slot_dates else '-'}")
    print()

    for event, new_date in zip(events, slot_dates):
        new_iso = new_date.isoformat()
        if event[0] == "pair":
            _, uk_slug, en_slug, old_date = event
            print(f"{old_date} -> {new_iso}   {uk_slug}  |  {en_slug}")
            if apply:
                for slug, d in [(uk_slug, uk[uk_slug]), (en_slug, en[en_slug])]:
                    new_text = set_dates(d["text"], new_iso)
                    with open(d["path"], "w", encoding="utf-8") as f:
                        f.write(new_text)
        else:
            _, lang, slug, old_date = event
            store = uk if lang == "uk" else en
            print(f"{old_date} -> {new_iso}   [{lang} solo] {slug}")
            if apply:
                d = store[slug]
                new_text = set_dates(d["text"], new_iso)
                with open(d["path"], "w", encoding="utf-8") as f:
                    f.write(new_text)


if __name__ == "__main__":
    main()
