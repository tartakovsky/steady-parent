#!/usr/bin/env python3
"""
Migrate article_taxonomy.json + quiz_taxonomy.json + cta_catalog.json (courses)
+ page_types.json + quiz_page_types.json → new_validation/spec/taxonomy.json

Merges 5 source files into one canonical taxonomy spec. Keys use URL path
segments: blog/{cat}/{article}, quiz/{slug}, course/{slug}.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

article_taxonomy = json.loads((ROOT / "content-plan" / "article_taxonomy.json").read_text())
quiz_taxonomy = json.loads((ROOT / "content-plan" / "quiz_taxonomy.json").read_text())
cta_catalog = json.loads((ROOT / "content-plan" / "cta_catalog.json").read_text())
page_types = json.loads((ROOT / "content-plan" / "page_types.json").read_text())
quiz_page_types = json.loads((ROOT / "content-plan" / "quiz_page_types.json").read_text())

spec: dict = {}

# ---------------------------------------------------------------------------
# Categories: array → keyed object
# ---------------------------------------------------------------------------
spec["categories"] = {}
for cat in article_taxonomy["categories"]:
    spec["categories"][cat["slug"]] = {"name": cat["name"]}

# ---------------------------------------------------------------------------
# Articles: flat array → nested blog/{category}/{article}
# seriesPosition derived from array order within each category (1-based)
# ---------------------------------------------------------------------------
spec["blog"] = {}
series_counters: dict[str, int] = {}
for entry in article_taxonomy["entries"]:
    cat = entry["categorySlug"]
    if cat not in spec["blog"]:
        spec["blog"][cat] = {}
    article: dict = {
        "title": entry["title"],
        "url": entry["url"],
        "pageType": entry["type"],
    }
    if entry["type"] == "series":
        series_counters[cat] = series_counters.get(cat, 0) + 1
        article["seriesPosition"] = series_counters[cat]
    spec["blog"][cat][entry["slug"]] = article

# ---------------------------------------------------------------------------
# Quizzes: array → keyed quiz/{slug}
# No trailing slashes — keep URLs as-is from source.
# ---------------------------------------------------------------------------
spec["quiz"] = {}
for entry in quiz_taxonomy["entries"]:
    url = entry["url"]
    # Normalize to trailing slash (consistent with blog/course URLs)
    if not url.endswith("/"):
        url = url + "/"
    spec["quiz"][entry["slug"]] = {
        "title": entry["title"],
        "url": url,
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
