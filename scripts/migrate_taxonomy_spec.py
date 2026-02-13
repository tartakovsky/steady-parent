#!/usr/bin/env python3
"""
Migrate article_taxonomy.json + quiz_taxonomy.json + quiz-definitions.json
+ cta_catalog.json (courses) + page_types.json + quiz_page_types.json
→ new_validation/spec/taxonomy.json

Merges 6 source files into one canonical taxonomy spec. Keys use URL path
segments: blog/{cat}/{article}, quiz/{slug}, course/{slug}.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

article_taxonomy = json.loads((ROOT / "content-plan" / "article_taxonomy.json").read_text())
quiz_taxonomy = json.loads((ROOT / "content-plan" / "quiz_taxonomy.json").read_text())
quiz_definitions = json.loads((ROOT / "content-plan" / "quizzes" / "quiz-definitions.json").read_text())
cta_catalog = json.loads((ROOT / "content-plan" / "cta_catalog.json").read_text())
page_types = json.loads((ROOT / "content-plan" / "page_types.json").read_text())
quiz_page_types = json.loads((ROOT / "content-plan" / "quiz_page_types.json").read_text())

# Build quiz slug → dataModel (likert/identity/assessment) lookup
quiz_type_map: dict[str, str] = {}
for qd in quiz_definitions:
    quiz_type_map[qd["slug"]] = qd["dataModel"]

spec: dict = {}

# ---------------------------------------------------------------------------
# Categories: array → keyed object
# ---------------------------------------------------------------------------
spec["categories"] = {}
for cat in article_taxonomy["categories"]:
    spec["categories"][cat["slug"]] = {"name": cat["name"]}

# ---------------------------------------------------------------------------
# Build category name lookup for catalog titles
# ---------------------------------------------------------------------------
cat_names: dict[str, str] = {}
for cat in article_taxonomy["categories"]:
    cat_names[cat["slug"]] = cat["name"]

# ---------------------------------------------------------------------------
# Articles: flat array → nested blog/{category}/{article}
# - Pillar articles get slug "guide" and URL /blog/{cat}/guide/
# - Each category also gets a catalog entry at the category slug
# - seriesPosition derived from array order within each category (1-based)
# ---------------------------------------------------------------------------
spec["blog"] = {}
series_counters: dict[str, int] = {}
catalogs_emitted: set[str] = set()
for entry in article_taxonomy["entries"]:
    cat = entry["categorySlug"]
    if cat not in spec["blog"]:
        spec["blog"][cat] = {}

    if entry["type"] == "pillar":
        # Emit catalog entry at category slug (takes over category root URL)
        spec["blog"][cat][cat] = {
            "title": f"{cat_names[cat]} Article Series",
            "url": f"/blog/{cat}/",
            "pageType": "catalog",
        }
        catalogs_emitted.add(cat)
        # Emit pillar at "guide" slug with new URL
        spec["blog"][cat]["guide"] = {
            "title": entry["title"],
            "url": f"/blog/{cat}/guide/",
            "pageType": "pillar",
        }
    elif entry["type"] == "series":
        series_counters[cat] = series_counters.get(cat, 0) + 1
        spec["blog"][cat][entry["slug"]] = {
            "title": entry["title"],
            "url": entry["url"],
            "pageType": "series",
            "seriesPosition": series_counters[cat],
        }
    else:
        raise ValueError(f"Unknown article type '{entry['type']}' for {entry['slug']}")

# Verify every category got a catalog
for cat_slug in spec["categories"]:
    if cat_slug not in catalogs_emitted:
        raise ValueError(f"Category '{cat_slug}' has no pillar entry — no catalog emitted")

# ---------------------------------------------------------------------------
# Quizzes: array → keyed quiz/{slug}
# quizType from quiz-definitions.json (dataModel field)
# ---------------------------------------------------------------------------
spec["quiz"] = {}
for entry in quiz_taxonomy["entries"]:
    slug = entry["slug"]
    url = entry["url"]
    # Normalize to trailing slash (consistent with blog/course URLs)
    if not url.endswith("/"):
        url = url + "/"
    if slug not in quiz_type_map:
        raise ValueError(f"Quiz '{slug}' has no dataModel in quiz-definitions.json")
    spec["quiz"][slug] = {
        "title": entry["title"],
        "url": url,
        "quizType": quiz_type_map[slug],
        "connectsTo": entry["connectsTo"],
    }

# ---------------------------------------------------------------------------
# Courses: extracted from course CTA entries in cta_catalog.json
# Keyed by course slug (NOT category slug — 12 of 20 differ)
# ---------------------------------------------------------------------------
spec["course"] = {}
for entry in cta_catalog:
    if entry["type"] != "course":
        continue
    cat_slug = entry["id"].removeprefix("course-")
    course_slug = entry["url"].strip("/").split("/")[-1]
    spec["course"][course_slug] = {
        "name": entry["name"],
        "url": entry["url"],
        "categorySlug": cat_slug,
    }

# ---------------------------------------------------------------------------
# Page type constraints
# ---------------------------------------------------------------------------
spec["pageTypes"] = {
    "article": {},
    "quiz": {},
}
spec["pageTypes"]["article"]["catalog"] = {"requiresDescription": True}
for pt in page_types:
    spec["pageTypes"]["article"][pt["name"]] = pt["constraints"]
for pt in quiz_page_types:
    spec["pageTypes"]["quiz"][pt["name"]] = pt["constraints"]

# ---------------------------------------------------------------------------
# Write
# ---------------------------------------------------------------------------
out_path = ROOT / "new_validation" / "spec" / "taxonomy.json"
out_path.parent.mkdir(parents=True, exist_ok=True)
out_path.write_text(json.dumps(spec, indent=2, ensure_ascii=False) + "\n")
print(f"Written {out_path}")

# Stats
article_count = sum(len(arts) for arts in spec["blog"].values())
print(f"  categories: {len(spec['categories'])}")
print(f"  blog:       {len(spec['blog'])} categories, {article_count} articles")
print(f"  quiz:       {len(spec['quiz'])}")
print(f"  course:     {len(spec['course'])}")
print(f"  pageTypes:  article({len(spec['pageTypes']['article'])}), quiz({len(spec['pageTypes']['quiz'])})")
