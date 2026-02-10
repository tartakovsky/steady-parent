#!/usr/bin/env python3
"""
Generate one blog article by assembling the writer prompt from template + data,
then sending it to Opus. Outputs an MDX file ready for the blog.

Usage:
    python3 research/generate_article.py --article "Article title here"
    python3 research/generate_article.py --article "Article title here" --dry-run  # print prompt, don't call LLM
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[1]

PROMPT_TEMPLATE_PATH = REPO_ROOT / "content-plan" / "writer_prompt.md"
LINK_PLAN_PATH = REPO_ROOT / "content-plan" / "article_link_plan.json"
ASSIGNMENTS_PATH = REPO_ROOT / "content-plan" / "source_to_article_assignment.json"
EXTRACTS_INDEX_PATH = REPO_ROOT / "content" / "blog" / "extracts" / "index.json"
CTA_CATALOG_PATH = REPO_ROOT / "content-plan" / "cta_catalog.json"
OUTPUT_DIR = REPO_ROOT / "landing" / "src" / "content" / "blog" / "posts"


def _read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def _read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8").strip()


def _safe_slug(url: str) -> str:
    """Extract slug from URL like /tantrums/handle-tantrum-scripts/"""
    parts = url.strip("/").split("/")
    return parts[-1] if len(parts) > 1 else parts[0]


def _find_link_plan(link_plan: list[dict], title: str) -> dict | None:
    for entry in link_plan:
        if entry["article"] == title:
            return entry
    return None


def _find_sources(assignments: dict, extracts_index: dict, title: str) -> list[dict]:
    """Find source extract file paths for a given article title."""
    # Build title -> keys mapping
    title_to_keys: dict[str, list[str]] = {}
    for key, meta in extracts_index.items():
        t = (meta or {}).get("title")
        if t:
            title_to_keys.setdefault(t, []).append(key)

    # Find assigned source titles
    source_titles: list[str] = []
    for _cat, payload in assignments.items():
        for item in payload.get("assignments", []):
            if title in item.get("targets", []):
                src = item.get("source")
                if src and src not in source_titles:
                    source_titles.append(src)

    # Resolve to file paths
    sources = []
    for st in source_titles:
        keys = title_to_keys.get(st, [])
        if not keys:
            continue
        key = sorted(keys, key=lambda k: (len(k), k))[0]
        meta = extracts_index.get(key, {})
        file_rel = meta.get("file")
        if not file_rel:
            continue
        extract_path = REPO_ROOT / "content" / "blog" / "extracts" / file_rel
        if extract_path.exists():
            sources.append({
                "title": st,
                "path": extract_path,
                "recap": meta.get("recap", ""),
            })
    return sources


def _format_body_links(links: list[dict]) -> str:
    """Format body links (cross, sibling, quiz) as a bullet list."""
    body_types = {"cross", "sibling", "quiz"}
    lines = []
    for link in links:
        if link["type"] in body_types:
            lines.append(f"- `{link['url']}` (type: {link['type']}) - use when: {link['intent']}")
    return "\n".join(lines) if lines else "(none)"


def _format_nav_links(links: list[dict]) -> str:
    """Format navigation links (pillar, prev, next) as a bullet list."""
    nav_types = {"pillar", "prev", "next"}
    lines = []
    for link in links:
        if link["type"] in nav_types:
            lines.append(f"- `{link['url']}` (type: {link['type']}) - {link['intent']}")
    return "\n".join(lines) if lines else "(none)"


def _build_cta_lookup(catalog: list[dict]) -> dict[str, dict[str, dict]]:
    """Build category_slug -> {course, freebie, community} lookup from cta_catalog.json."""
    lookup: dict[str, dict[str, dict]] = {}
    for entry in catalog:
        eid = entry["id"]
        etype = entry["type"]
        if etype == "community" and eid == "community":
            continue  # skip global community entry
        # Derive category slug from id: "course-tantrums" -> "tantrums"
        prefix = etype + "-"
        if eid.startswith(prefix):
            slug = eid[len(prefix):]
        else:
            continue
        lookup.setdefault(slug, {})[etype] = entry
    return lookup


def _format_ctas(ctas: list[dict], cta_lookup: dict[str, dict], category_slug: str) -> str:
    """Format CTA components with exact prop values from catalog."""
    cat_entries = cta_lookup.get(category_slug, {})
    lines = []
    for cta in ctas:
        url = cta.get("url")
        ctype = cta["type"]
        catalog_entry = cat_entries.get(ctype)

        if not catalog_entry or not catalog_entry.get("cta_copy"):
            # Fallback: placeholder if catalog entry missing
            component = {"course": "CourseCTA", "community": "CommunityCTA", "freebie": "FreebieCTA"}.get(ctype, "CTA")
            lines.append(f"<!-- WARNING: no cta_copy in catalog for {ctype}-{category_slug} -->")
            continue

        copy = catalog_entry["cta_copy"]
        component = {"course": "CourseCTA", "community": "CommunityCTA", "freebie": "FreebieCTA"}[ctype]
        href_prop = f'href="{url}" ' if url else ""

        jsx = (
            f'<{component} {href_prop}'
            f'eyebrow="{copy["eyebrow"]}" '
            f'title="{copy["title"]}" '
            f'body="{copy["body"]}" '
            f'buttonText="{copy["buttonText"]}" />'
        )
        lines.append(f"`{jsx}`")
        lines.append(f"  Placement: {cta['intent']}")
        lines.append("")

    return "\n".join(lines) if lines else "(none)"


def _determine_article_type(plan: dict) -> str:
    """Determine if this is a pillar or series article."""
    for link in plan.get("links", []):
        if link.get("type") == "series_preview":
            return "pillar"
    return "series"


def _category_display(url: str) -> str:
    """Extract display category from URL like /blog/sleep/slug/"""
    parts = url.strip("/").split("/")
    # Skip "blog" prefix if present
    cat = parts[1] if parts[0] == "blog" and len(parts) > 1 else parts[0]
    return cat.replace("-", " ").title()


def assemble_prompt(article_title: str) -> tuple[str, str, dict]:
    """
    Assemble the complete writer prompt for one article.
    Returns (prompt_text, output_filename, plan_dict).
    """
    link_plan = _read_json(LINK_PLAN_PATH)
    assignments = _read_json(ASSIGNMENTS_PATH)
    extracts_index = _read_json(EXTRACTS_INDEX_PATH)
    cta_catalog = _read_json(CTA_CATALOG_PATH)
    cta_lookup = _build_cta_lookup(cta_catalog)
    template = _read_text(PROMPT_TEMPLATE_PATH)

    plan = _find_link_plan(link_plan, article_title)
    if plan is None:
        print(f"ERROR: No link plan found for: {article_title!r}", file=sys.stderr)
        sys.exit(1)

    article_type = _determine_article_type(plan)
    word_target = "2,500-3,500" if article_type == "pillar" else "1,800-2,200"
    parts = plan["url"].strip("/").split("/")
    category_slug = parts[1] if parts[0] == "blog" and len(parts) > 1 else parts[0]
    category_display = _category_display(plan["url"])

    sources = _find_sources(assignments, extracts_index, article_title)
    if not sources:
        print(f"WARNING: No sources found for: {article_title!r}", file=sys.stderr)

    # Read source contents
    source_blocks = []
    for i, src in enumerate(sources, 1):
        content = src["path"].read_text(encoding="utf-8").strip()
        source_blocks.append(f"---SOURCE {i}: {src['title']}---\n\n{content}")
    source_material = "\n\n".join(source_blocks) if source_blocks else "(no sources available)"

    # Build prompt from template
    import datetime
    today = datetime.date.today().isoformat()

    prompt = template
    prompt = prompt.replace("{{ARTICLE_TITLE}}", article_title)
    prompt = prompt.replace("{{CATEGORY}}", category_slug)
    prompt = prompt.replace("{{CATEGORY_DISPLAY}}", category_display)
    prompt = prompt.replace("{{ARTICLE_TYPE}}", article_type)
    prompt = prompt.replace("{{WORD_COUNT_TARGET}}", word_target)
    prompt = prompt.replace("{{DATE}}", today)
    prompt = prompt.replace("{{BODY_LINKS}}", _format_body_links(plan.get("links", [])))
    prompt = prompt.replace("{{NAV_LINKS}}", _format_nav_links(plan.get("links", [])))
    prompt = prompt.replace("{{CTA_COMPONENTS}}", _format_ctas(plan.get("ctas", []), cta_lookup, category_slug))
    prompt = prompt.replace("{{SOURCE_COUNT}}", str(len(sources)))
    prompt = prompt.replace("{{SOURCE_MATERIAL}}", source_material)

    slug = _safe_slug(plan["url"])
    output_filename = f"{slug}.mdx"

    return prompt, output_filename, plan


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate one blog article.")
    parser.add_argument("--article", required=True, help="Exact article title.")
    parser.add_argument("--dry-run", action="store_true", help="Print assembled prompt, don't call LLM.")
    args = parser.parse_args()

    prompt, output_filename, plan = assemble_prompt(args.article)

    if args.dry_run:
        print(f"=== Output file: {output_filename} ===")
        print(f"=== Prompt length: {len(prompt)} chars, ~{len(prompt.split())} words ===")
        print()
        print(prompt)
        return

    # Write prompt to temp file for the agent to read
    output_path = OUTPUT_DIR / output_filename
    prompt_path = REPO_ROOT / "research" / "bundles" / f"{output_filename}.prompt.md"
    prompt_path.parent.mkdir(parents=True, exist_ok=True)
    prompt_path.write_text(prompt, encoding="utf-8")

    print(f"Prompt written to: {prompt_path}")
    print(f"Output target: {output_path}")
    print(f"Prompt: ~{len(prompt.split())} words")
    print()
    print("Run the prompt through Opus to generate the article.")
    print(f"The output should be written to: {output_path}")


if __name__ == "__main__":
    main()
