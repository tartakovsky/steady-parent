#!/usr/bin/env python3
"""
Migrate mailing_form_catalog.json → spec/mailing.json

Transforms the flat catalog into a nested structure keyed by URL path:
  blog/{category}/{article} — 245 freebie entries (expanded from 20 per-category)
  course/{courseSlug}        — 20 waitlist entries
  quiz/{quizSlug}            — 24 quiz-gate entries

Each entry has 8 fields:
  eyebrow, title, body, inputPlaceholder, buttonText  — rendered by component
  endpoint                                             — API URL for form POST
  tags                                                 — Kit tags applied on subscribe
  params                                               — static POST body params

Tags are derived from kit-config.ts freebieConfig (source of truth), NOT from
the old catalog which was missing "waitlist-joined" for waitlists.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

catalog = json.loads((ROOT / "content-plan" / "mailing_form_catalog.json").read_text())
taxonomy = json.loads((ROOT / "content-plan" / "article_taxonomy.json").read_text())

# Build lookup: category slug → list of article slugs
articles_by_cat: dict[str, list[str]] = {}
for entry in taxonomy["entries"]:
    cat = entry["categorySlug"]
    articles_by_cat.setdefault(cat, []).append(entry["slug"])

# ---------------------------------------------------------------------------
# Tag generation — mirrors kit-config.ts freebieConfig exactly
# ---------------------------------------------------------------------------
# Freebie:  ["lead", "freebie-{category}"]
# Waitlist: ["lead", "waitlist-joined", "waitlist-{category}"]
# Quiz:     ["lead", "quiz-{quizSlug}"]

def freebie_tags(cat_slug: str) -> list[str]:
    return ["lead", f"freebie-{cat_slug}"]

def waitlist_tags(cat_slug: str) -> list[str]:
    return ["lead", "waitlist-joined", f"waitlist-{cat_slug}"]

def quiz_tags(quiz_slug: str) -> list[str]:
    return ["lead", f"quiz-{quiz_slug}", "quiz-completed"]

# Build lookups from catalog
freebies_by_cat: dict[str, dict] = {}
waitlists: dict[str, dict] = {}
quiz_gates: dict[str, dict] = {}

for item in catalog:
    t = item["type"]

    if t == "freebie":
        # Extract category slug from id: "freebie-{catSlug}"
        cat_slug = item["id"].removeprefix("freebie-")
        copy = item["cta_copy"]
        freebies_by_cat[cat_slug] = {
            "eyebrow": copy["eyebrow"],
            "title": copy["title"],
            "body": copy["body"],
            "inputPlaceholder": "Email address",
            "buttonText": copy["buttonText"],
            "endpoint": "/api/freebie-subscribe",
            "tags": freebie_tags(cat_slug),
            "params": {
                "category": cat_slug,
            },
        }

    elif t == "waitlist":
        # Extract course slug from pageUrlPattern: "/course/{slug}/"
        course_slug = item["pageUrlPattern"].strip("/").split("/")[-1]
        # Extract category slug from id: "waitlist-{catSlug}"
        cat_slug = item["id"].removeprefix("waitlist-")
        copy = item["cta_copy"]
        waitlists[course_slug] = {
            "eyebrow": copy["eyebrow"],
            "title": copy["title"],
            "body": copy["body"],
            "inputPlaceholder": "Email address",
            "buttonText": copy["buttonText"],
            "endpoint": "/api/waitlist-subscribe",
            "tags": waitlist_tags(cat_slug),
            "params": {
                "category": cat_slug,
            },
        }

    elif t == "quiz-gate":
        # Extract quiz slug from id: "quiz-gate-{quizSlug}"
        quiz_slug = item["id"].removeprefix("quiz-gate-")
        # Quiz gate copy lives in the quiz JSON files (meta.previewCta),
        # not in the mailing catalog. Read from the actual quiz data.
        quiz_json_path = ROOT / "landing" / "src" / "lib" / "quiz" / f"{quiz_slug}.json"
        if quiz_json_path.exists():
            quiz_data = json.loads(quiz_json_path.read_text())
            copy = quiz_data.get("meta", {}).get("previewCta", {})
            entry = {
                "eyebrow": copy.get("eyebrow", ""),
                "title": copy.get("title", ""),
                "body": copy.get("body", ""),
                "inputPlaceholder": "Email address",
                "buttonText": copy.get("buttonText", "Send my results"),
            }
        else:
            print(f"WARNING: no quiz JSON for '{quiz_slug}', using catalog or defaults")
            copy = item.get("cta_copy")
            if copy:
                entry = {
                    "eyebrow": copy["eyebrow"],
                    "title": copy["title"],
                    "body": copy["body"],
                    "inputPlaceholder": "Email address",
                    "buttonText": copy["buttonText"],
                }
            else:
                entry = {
                    "eyebrow": "Want the full results?",
                    "title": "Get your complete results delivered to your inbox",
                    "body": "Your personalized breakdown, action steps, and expert-backed recommendations — all in one email.",
                    "inputPlaceholder": "Email address",
                    "buttonText": "Send my results",
                }
        entry["endpoint"] = "/api/quiz-subscribe"
        entry["tags"] = quiz_tags(quiz_slug)
        entry["params"] = {
            "quizSlug": quiz_slug,
            "resultUrl": "",
            "fromGate": True,
        }
        quiz_gates[quiz_slug] = entry

# Build the nested spec
spec: dict = {"blog": {}, "course": {}, "quiz": {}}

# Blog: expand freebies to per-article
for cat_slug, freebie_template in sorted(freebies_by_cat.items()):
    article_slugs = articles_by_cat.get(cat_slug, [])
    if not article_slugs:
        print(f"WARNING: no articles for category '{cat_slug}'")
        continue
    spec["blog"][cat_slug] = {}
    for article_slug in article_slugs:
        spec["blog"][cat_slug][article_slug] = dict(freebie_template)

# Course: one per course slug
for course_slug in sorted(waitlists):
    spec["course"][course_slug] = waitlists[course_slug]

# Quiz: one per quiz slug
for quiz_slug in sorted(quiz_gates):
    spec["quiz"][quiz_slug] = quiz_gates[quiz_slug]

# Write to both locations
for out_path in [
    ROOT / "spec" / "mailing.json",
    ROOT / "new_validation" / "spec" / "mailing.json",
]:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(spec, indent=2, ensure_ascii=False) + "\n")
    print(f"Written {out_path}")

# Stats
blog_articles = sum(len(arts) for arts in spec["blog"].values())
print(f"  blog:   {len(spec['blog'])} categories, {blog_articles} articles")
print(f"  course: {len(spec['course'])} waitlists")
print(f"  quiz:   {len(spec['quiz'])} quiz-gates")
print(f"  Total:  {blog_articles + len(spec['course']) + len(spec['quiz'])} entries")
