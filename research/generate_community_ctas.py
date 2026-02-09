#!/usr/bin/env python3
"""
Generate per-category community CTA pitches by assembling a prompt and sending to Opus.

Usage:
    python3 research/generate_community_ctas.py
    python3 research/generate_community_ctas.py --dry-run   # print prompt, don't call LLM
    python3 research/generate_community_ctas.py --merge      # generate + merge into cta_catalog.json
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]

PROMPT_TEMPLATE_PATH = REPO_ROOT / "research" / "community_cta_prompt.md"
CTA_CATALOG_PATH = REPO_ROOT / "research" / "cta_catalog.json"
TAXONOMY_PATH = REPO_ROOT / "research" / "article_taxonomy.json"


def _read_json(path: Path) -> object:
    return json.loads(path.read_text(encoding="utf-8"))


def _read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8").strip()


def assemble_prompt() -> str:
    """Build the complete prompt from template + data."""
    template = _read_text(PROMPT_TEMPLATE_PATH)
    catalog = _read_json(CTA_CATALOG_PATH)
    taxonomy = _read_json(TAXONOMY_PATH)

    # Get global community entry for cant_promise
    community = next((c for c in catalog if c["id"] == "community"), None)
    cant_promise = ", ".join(community["cant_promise"]) if community else "(none)"

    # Get category list with course descriptions for context
    categories = taxonomy["categories"]
    courses = {c["id"].replace("course-", ""): c for c in catalog if c["type"] == "course"}

    cat_lines = []
    for cat in categories:
        slug = cat["slug"]
        name = cat["name"]
        course = courses.get(slug)
        course_desc = f' (course topic: {course["what_it_is"]})' if course else ""
        cat_lines.append(f"- **{name}** (`{slug}`){course_desc}")

    prompt = template.replace("{{CANT_PROMISE}}", cant_promise)
    prompt = prompt.replace("{{CATEGORIES}}", "\n".join(cat_lines))

    return prompt


def call_opus(prompt: str) -> str:
    """Send prompt to Claude Opus and return the response text."""
    try:
        import anthropic
    except ImportError:
        print("ERROR: anthropic package not installed. Run: pip install anthropic", file=sys.stderr)
        sys.exit(1)

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ERROR: ANTHROPIC_API_KEY environment variable not set.", file=sys.stderr)
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    message = client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )

    return message.content[0].text


def parse_response(response_text: str) -> list[dict]:
    """Parse the JSON array from the model response."""
    # Strip markdown fences if present
    text = response_text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        lines = lines[1:]  # remove opening fence
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines)

    return json.loads(text)


def build_catalog_entries(pitches: list[dict]) -> list[dict]:
    """Convert pitches into cta_catalog.json entries."""
    entries = []
    for pitch in pitches:
        entries.append({
            "id": f"community-{pitch['category_slug']}",
            "type": "community",
            "name": "Steady Parent Community",
            "url": "https://www.skool.com/steady-parent",
            "what_it_is": pitch["what_it_is"],
            "can_promise": [],
            "cant_promise": [],
        })
    return entries


def merge_into_catalog(new_entries: list[dict]) -> None:
    """Merge generated community entries into cta_catalog.json."""
    catalog = _read_json(CTA_CATALOG_PATH)

    # Remove any existing per-category community entries
    catalog = [c for c in catalog if not (c["type"] == "community" and c["id"] != "community")]

    # Find insertion point: after the global community entry
    insert_idx = 0
    for i, entry in enumerate(catalog):
        if entry["id"] == "community":
            insert_idx = i + 1
            break

    # Insert new entries
    for entry in sorted(new_entries, key=lambda e: e["id"]):
        catalog.insert(insert_idx, entry)
        insert_idx += 1

    CTA_CATALOG_PATH.write_text(
        json.dumps(catalog, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"Merged {len(new_entries)} community entries into {CTA_CATALOG_PATH.name}")


def main():
    parser = argparse.ArgumentParser(description="Generate per-category community CTA pitches")
    parser.add_argument("--dry-run", action="store_true", help="Print prompt without calling LLM")
    parser.add_argument("--merge", action="store_true", help="Also merge results into cta_catalog.json")
    args = parser.parse_args()

    prompt = assemble_prompt()

    if args.dry_run:
        print(prompt)
        print(f"\n--- Prompt length: {len(prompt)} chars ---")
        return

    print("Calling Claude...", file=sys.stderr)
    response = call_opus(prompt)

    pitches = parse_response(response)
    entries = build_catalog_entries(pitches)

    # Print the generated entries
    print(json.dumps(entries, indent=2, ensure_ascii=False))

    if args.merge:
        merge_into_catalog(entries)

    print(f"\nGenerated {len(entries)} community CTA entries.", file=sys.stderr)


if __name__ == "__main__":
    main()
