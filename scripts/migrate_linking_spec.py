#!/usr/bin/env python3
"""
Migrate article_link_plan.json + taxonomy.json → new_validation/spec/linking.json

Builds three top-level sections: blog, quiz, course.

Blog: catalog + pillar + series entries (from article_link_plan.json + taxonomy)
Quiz: root catalog + 24 quiz pages (from taxonomy connectsTo)
Course: root catalog + 20 course pages (from taxonomy categorySlug)

Freebie is a mailing form, NOT a CTA. Blog articles get:
  - 2 CTAs (course + community)
  - 1 mailing form (freebie)
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
COMMUNITY_URL = "https://www.skool.com/steady-parent-1727"

# ---------------------------------------------------------------------------
# Load sources
# ---------------------------------------------------------------------------

link_plan = json.loads((ROOT / "content-plan" / "article_link_plan.json").read_text())
taxonomy = json.loads((ROOT / "new_validation" / "spec" / "taxonomy.json").read_text())

# ---------------------------------------------------------------------------
# Build lookups from taxonomy
# ---------------------------------------------------------------------------

# Category → guide URL
cat_to_guide_url: dict[str, str] = {}
for cat, articles in taxonomy["blog"].items():
    if "guide" in articles:
        cat_to_guide_url[cat] = articles["guide"]["url"]

# Category → series articles sorted by seriesPosition
cat_to_series: dict[str, list[tuple[str, dict]]] = {}
for cat, articles in taxonomy["blog"].items():
    series = []
    for key, entry in articles.items():
        if entry.get("pageType") == "series":
            series.append((key, entry))
    series.sort(key=lambda x: x[1].get("seriesPosition", 999))
    cat_to_series[cat] = series

# Build set of old pillar URLs (2-segment blog paths) for remapping
pillar_urls: set[str] = set()
for entry in link_plan:
    parts = entry["url"].strip("/").split("/")
    if len(parts) == 2 and parts[0] == "blog":
        pillar_urls.add(entry["url"])


def remap_link_url(url: str) -> str:
    """Remap old pillar-target URLs to new /guide/ path."""
    if url in pillar_urls:
        cat = url.strip("/").split("/")[1]
        return f"/blog/{cat}/guide/"
    return url


# ---------------------------------------------------------------------------
# Initialize output
# ---------------------------------------------------------------------------

spec: dict = {"blog": {}, "quiz": {}, "course": {}}

# ---------------------------------------------------------------------------
# Blog: migrate 245 existing entries
# ---------------------------------------------------------------------------

for entry in link_plan:
    url = entry["url"]
    parts = url.strip("/").split("/")

    if len(parts) == 2 and parts[0] == "blog":
        cat = parts[1]
        article_key = "guide"
    elif len(parts) == 3 and parts[0] == "blog":
        cat = parts[1]
        article_key = parts[2]
    else:
        raise ValueError(f"Unexpected URL format: {url}")

    if cat not in spec["blog"]:
        spec["blog"][cat] = {}

    # Remap link target URLs (old pillar → guide), drop type field
    links = []
    for link in entry["links"]:
        links.append({
            "url": remap_link_url(link["url"]),
            "intent": link["intent"],
        })

    # Split freebie out of CTAs into mailing field
    ctas = []
    mailing = None
    for cta in entry["ctas"]:
        if cta["type"] == "freebie":
            mailing = {"type": "freebie", "intent": cta["intent"]}
        else:
            ctas.append({
                "url": cta["url"],
                "type": cta["type"],
                "intent": cta["intent"],
            })

    spec["blog"][cat][article_key] = {
        "links": links,
        "ctas": ctas,
        "mailing": mailing,
    }

# ---------------------------------------------------------------------------
# Blog: add 20 catalog entries
# ---------------------------------------------------------------------------

for cat in taxonomy["blog"]:
    if cat not in spec["blog"]:
        spec["blog"][cat] = {}

    catalog_links = []

    # Link to guide article
    guide_url = cat_to_guide_url.get(cat)
    if guide_url:
        catalog_links.append({
            "url": guide_url,
            "intent": "link to the comprehensive guide for this category",
        })

    # Links to all series articles, sorted by seriesPosition
    for i, (slug, entry) in enumerate(cat_to_series.get(cat, []), 1):
        catalog_links.append({
            "url": entry["url"],
            "intent": f"preview and link to article {i} in the series",
        })

    spec["blog"][cat][""] = {
        "links": catalog_links,
        "ctas": [{
            "url": COMMUNITY_URL,
            "type": "community",
            "intent": "offer the community below the catalog grid",
        }],
        "mailing": None,
    }

# ---------------------------------------------------------------------------
# Quiz: root catalog
# ---------------------------------------------------------------------------

quiz_catalog_links = []
for slug in sorted(taxonomy["quiz"]):
    if slug == "":
        continue  # skip catalog entry
    quiz = taxonomy["quiz"][slug]
    quiz_catalog_links.append({
        "url": quiz["url"],
        "intent": f"preview and link to the {quiz['title']} quiz",
    })

spec["quiz"][""] = {
    "links": quiz_catalog_links,
    "ctas": [],
    "mailing": None,
}

# ---------------------------------------------------------------------------
# Quiz: 24 quiz pages
# ---------------------------------------------------------------------------

for slug in sorted(taxonomy["quiz"]):
    if slug == "":
        continue  # skip catalog entry
    quiz = taxonomy["quiz"][slug]
    links = []
    for cat_slug in quiz["connectsTo"]:
        guide_url = cat_to_guide_url.get(cat_slug)
        if guide_url:
            cat_name = taxonomy["categories"][cat_slug]["name"]
            links.append({
                "url": guide_url,
                "intent": f"related guide: {cat_name}",
            })

    spec["quiz"][slug] = {
        "links": links,
        "ctas": [{
            "url": COMMUNITY_URL,
            "type": "community",
            "intent": "offer the community after quiz completion",
        }],
        "mailing": {
            "type": "quiz-gate",
            "intent": "gate full results behind email signup",
        },
    }

# ---------------------------------------------------------------------------
# Course: root catalog
# ---------------------------------------------------------------------------

course_catalog_links = []
for slug in sorted(taxonomy["course"]):
    if slug == "":
        continue  # skip catalog entry
    course = taxonomy["course"][slug]
    course_catalog_links.append({
        "url": course["url"],
        "intent": f"preview and link to the {course['name']} course",
    })

spec["course"][""] = {
    "links": course_catalog_links,
    "ctas": [],
    "mailing": None,
}

# ---------------------------------------------------------------------------
# Course: 20 course pages
# ---------------------------------------------------------------------------

for slug in sorted(taxonomy["course"]):
    if slug == "":
        continue  # skip catalog entry
    course = taxonomy["course"][slug]
    cat_slug = course["categorySlug"]
    guide_url = cat_to_guide_url.get(cat_slug)

    links = []
    if guide_url:
        cat_name = taxonomy["categories"][cat_slug]["name"]
        links.append({
            "url": guide_url,
            "intent": f"explore the free {cat_name} article series",
        })

    spec["course"][slug] = {
        "links": links,
        "ctas": [],
        "mailing": {
            "type": "waitlist",
            "intent": "capture email for course waitlist",
        },
    }

# ---------------------------------------------------------------------------
# Write
# ---------------------------------------------------------------------------

out_path = ROOT / "new_validation" / "spec" / "linking.json"
out_path.parent.mkdir(parents=True, exist_ok=True)
out_path.write_text(json.dumps(spec, indent=2, ensure_ascii=False) + "\n")
print(f"Written {out_path}")

# ---------------------------------------------------------------------------
# Stats
# ---------------------------------------------------------------------------

blog_entries = sum(len(arts) for arts in spec["blog"].values())
quiz_entries = len(spec["quiz"])
course_entries = len(spec["course"])
total = blog_entries + quiz_entries + course_entries

print(f"  blog:    {len(spec['blog'])} categories, {blog_entries} entries")
print(f"  quiz:    {quiz_entries} entries (1 catalog + {quiz_entries - 1} pages)")
print(f"  course:  {course_entries} entries (1 catalog + {course_entries - 1} pages)")
print(f"  total:   {total}")

# ---------------------------------------------------------------------------
# Verification
# ---------------------------------------------------------------------------

errors = []

# 1. No old pillar URLs in link targets
for section in spec.values():
    items = section.values() if isinstance(section, dict) and "" in section else []
    if not items:
        items = section.values() if isinstance(section, dict) else []
    for key_or_cat in (spec["blog"].values()):
        for art in key_or_cat.values():
            for link in art["links"]:
                if link["url"] in pillar_urls:
                    errors.append(f"Old pillar URL in blog link target: {link['url']}")
for art in spec["quiz"].values():
    for link in art["links"]:
        if link["url"] in pillar_urls:
            errors.append(f"Old pillar URL in quiz link target: {link['url']}")
for art in spec["course"].values():
    for link in art["links"]:
        if link["url"] in pillar_urls:
            errors.append(f"Old pillar URL in course link target: {link['url']}")

# 2. Blog guide/series: exactly 2 CTAs (course + community)
for cat, articles in spec["blog"].items():
    for key, art in articles.items():
        if key == "":
            continue  # catalog checked separately
        cta_types = sorted(c["type"] for c in art["ctas"])
        if cta_types != ["community", "course"]:
            errors.append(f"blog/{cat}/{key}: expected CTAs [community, course], got {cta_types}")

# 3. Blog catalog: exactly 1 CTA (community)
for cat, articles in spec["blog"].items():
    if "" in articles:
        cta_types = [c["type"] for c in articles[""]["ctas"]]
        if cta_types != ["community"]:
            errors.append(f"blog/{cat}/: expected CTAs [community], got {cta_types}")

# 4. No freebie in any ctas[]
for cat, articles in spec["blog"].items():
    for key, art in articles.items():
        for cta in art["ctas"]:
            if cta["type"] == "freebie":
                errors.append(f"blog/{cat}/{key}: freebie in ctas (should be mailing)")

# 5. Blog guide/series: mailing type == freebie
for cat, articles in spec["blog"].items():
    for key, art in articles.items():
        if key == "":
            continue
        if not art.get("mailing") or art["mailing"]["type"] != "freebie":
            errors.append(f"blog/{cat}/{key}: expected mailing type 'freebie'")

# 6. Quiz pages: mailing type == quiz-gate
for slug, art in spec["quiz"].items():
    if slug == "":
        continue
    if not art.get("mailing") or art["mailing"]["type"] != "quiz-gate":
        errors.append(f"quiz/{slug}: expected mailing type 'quiz-gate'")

# 7. Course pages: mailing type == waitlist
for slug, art in spec["course"].items():
    if slug == "":
        continue
    if not art.get("mailing") or art["mailing"]["type"] != "waitlist":
        errors.append(f"course/{slug}: expected mailing type 'waitlist'")

# 8. Catalogs/roots: mailing == null
for cat, articles in spec["blog"].items():
    if "" in articles and articles[""]["mailing"] is not None:
        errors.append(f"blog/{cat}/: catalog mailing should be null")
if spec["quiz"][""]["mailing"] is not None:
    errors.append("quiz/: root mailing should be null")
if spec["course"][""]["mailing"] is not None:
    errors.append("course/: root mailing should be null")

if errors:
    for e in errors:
        print(f"  ✗ {e}")
    raise ValueError(f"{len(errors)} verification errors")

print("  ✓ All verification checks passed")
