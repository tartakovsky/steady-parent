#!/usr/bin/env python3
"""
Migrate article_link_plan.json → new_validation/spec/linking.json

Remaps pillar articles from /blog/{cat}/ → /blog/{cat}/guide/ to match
the new taxonomy where catalog pages sit at the category root.

Does NOT create catalog link plan entries (no source data exists).
The validator will flag these as missing — catalog link plans must be
authored separately.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

link_plan = json.loads((ROOT / "content-plan" / "article_link_plan.json").read_text())

# Build set of pillar URLs (2-segment blog paths) for remapping
pillar_urls: set[str] = set()
for entry in link_plan:
    parts = entry["url"].strip("/").split("/")
    if len(parts) == 2 and parts[0] == "blog":
        pillar_urls.add(entry["url"])


def remap_link_url(url: str) -> str:
    """Remap pillar-target URLs to new /guide/ path."""
    if url in pillar_urls:
        cat = url.strip("/").split("/")[1]
        return f"/blog/{cat}/guide/"
    return url


spec: dict = {}

for entry in link_plan:
    url = entry["url"]
    parts = url.strip("/").split("/")

    if len(parts) == 2 and parts[0] == "blog":
        # Pillar article: /blog/{cat}/ → key = "guide"
        cat = parts[1]
        article_key = "guide"
    elif len(parts) == 3 and parts[0] == "blog":
        # Series article: /blog/{cat}/{slug}/
        cat = parts[1]
        article_key = parts[2]
    else:
        raise ValueError(f"Unexpected URL format: {url}")

    if cat not in spec:
        spec[cat] = {}

    # Remap link target URLs (pillar → guide)
    links = []
    for link in entry["links"]:
        links.append({
            "url": remap_link_url(link["url"]),
            "type": link["type"],
            "intent": link["intent"],
        })

    # CTAs pass through unchanged (course/community/freebie URLs don't change)
    ctas = []
    for cta in entry["ctas"]:
        ctas.append({
            "url": cta["url"],
            "type": cta["type"],
            "intent": cta["intent"],
        })

    spec[cat][article_key] = {
        "links": links,
        "ctas": ctas,
    }

# ---------------------------------------------------------------------------
# Write
# ---------------------------------------------------------------------------
out_path = ROOT / "new_validation" / "spec" / "linking.json"
out_path.parent.mkdir(parents=True, exist_ok=True)
out_path.write_text(json.dumps(spec, indent=2, ensure_ascii=False) + "\n")
print(f"Written {out_path}")

# Stats
categories = len(spec)
articles = sum(len(arts) for arts in spec.values())
total_links = sum(
    len(art["links"])
    for arts in spec.values()
    for art in arts.values()
)
total_ctas = sum(
    len(art["ctas"])
    for arts in spec.values()
    for art in arts.values()
)
print(f"  categories: {categories}")
print(f"  articles:   {articles}")
print(f"  links:      {total_links}")
print(f"  ctas:       {total_ctas}")

# Verify no old pillar URLs remain in link targets
old_pillar_refs = 0
for arts in spec.values():
    for art in arts.values():
        for link in art["links"]:
            if link["url"] in pillar_urls:
                old_pillar_refs += 1
if old_pillar_refs:
    raise ValueError(f"{old_pillar_refs} link targets still reference old pillar URLs")
print("  ✓ No old pillar URL references remain")
