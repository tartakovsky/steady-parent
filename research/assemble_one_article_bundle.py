#!/usr/bin/env python3
"""
Assemble a single "writer input bundle" for one target article.

Inputs (repo files):
- research/source_to_article_assignment.json
- content/blog/extracts/index.json
- research/article_link_plan.json
- research/seo/article-structure.md
- research/seo/writing-style.md

Output:
- research/bundles/<safe-slug>.md
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable


REPO_ROOT = Path(__file__).resolve().parents[1]

ASSIGNMENTS_PATH = REPO_ROOT / "research" / "source_to_article_assignment.json"
EXTRACTS_INDEX_PATH = REPO_ROOT / "content" / "blog" / "extracts" / "index.json"
LINK_PLAN_PATH = REPO_ROOT / "research" / "article_link_plan.json"
ARTICLE_STRUCTURE_PATH = REPO_ROOT / "research" / "seo" / "article-structure.md"
WRITING_STYLE_PATH = REPO_ROOT / "research" / "seo" / "writing-style.md"

BUNDLES_DIR = REPO_ROOT / "research" / "bundles"


def _read_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _read_text(path: Path) -> str:
    with path.open("r", encoding="utf-8") as f:
        return f.read().strip() + "\n"


def _safe_slug(text: str) -> str:
    s = text.strip().lower()
    s = re.sub(r"[’']", "", s)
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-{2,}", "-", s).strip("-")
    return s or "article"


@dataclass(frozen=True)
class SourceRef:
    key: str
    title: str
    source_url: str | None
    file_rel: str

    @property
    def extract_path(self) -> Path:
        return REPO_ROOT / "content" / "blog" / "extracts" / self.file_rel


def _iter_assignments_for_article(assignments_by_category: dict[str, Any], article_title: str) -> list[str]:
    """Return list of source titles assigned to the given target article title."""
    sources: list[str] = []
    for _category, payload in assignments_by_category.items():
        for item in payload.get("assignments", []):
            targets = item.get("targets", [])
            if article_title in targets:
                sources.append(item.get("source"))
    # preserve order but de-dupe
    seen: set[str] = set()
    deduped: list[str] = []
    for s in sources:
        if not s or s in seen:
            continue
        seen.add(s)
        deduped.append(s)
    return deduped


def _build_title_to_keys(extracts_index: dict[str, Any]) -> dict[str, list[str]]:
    title_to_keys: dict[str, list[str]] = {}
    for key, meta in extracts_index.items():
        title = (meta or {}).get("title")
        if not title:
            continue
        title_to_keys.setdefault(title, []).append(key)
    return title_to_keys


def _resolve_sources(
    source_titles: Iterable[str],
    extracts_index: dict[str, Any],
    title_to_keys: dict[str, list[str]],
) -> tuple[list[SourceRef], list[str]]:
    resolved: list[SourceRef] = []
    missing: list[str] = []

    for title in source_titles:
        keys = title_to_keys.get(title, [])
        if len(keys) == 0:
            missing.append(title)
            continue
        if len(keys) > 1:
            # Prefer a deterministic choice but keep it stable: choose the shortest key.
            keys = sorted(keys, key=lambda k: (len(k), k))
        key = keys[0]
        meta = extracts_index.get(key, {})
        file_rel = meta.get("file")
        if not file_rel:
            missing.append(title)
            continue
        resolved.append(
            SourceRef(
                key=key,
                title=title,
                source_url=meta.get("source_url"),
                file_rel=file_rel,
            )
        )

    return resolved, missing


def _find_link_plan_for_article(link_plan: list[dict[str, Any]], article_title: str) -> dict[str, Any] | None:
    for obj in link_plan:
        if obj.get("article") == article_title:
            return obj
    return None


def _format_link_plan_block(plan: dict[str, Any]) -> str:
    # Keep it in JSON for copy/paste fidelity.
    return json.dumps(plan, indent=2, ensure_ascii=False) + "\n"


def assemble_bundle(article_title: str, out_path: Path | None) -> Path:
    assignments_by_category = _read_json(ASSIGNMENTS_PATH)
    extracts_index = _read_json(EXTRACTS_INDEX_PATH)
    link_plan = _read_json(LINK_PLAN_PATH)

    article_structure = _read_text(ARTICLE_STRUCTURE_PATH)
    writing_style = _read_text(WRITING_STYLE_PATH)

    source_titles = _iter_assignments_for_article(assignments_by_category, article_title)
    title_to_keys = _build_title_to_keys(extracts_index)
    sources, missing_sources = _resolve_sources(source_titles, extracts_index, title_to_keys)

    plan = _find_link_plan_for_article(link_plan, article_title)
    if plan is None:
        raise SystemExit(f"ERROR: No link plan found for article title: {article_title!r}")

    BUNDLES_DIR.mkdir(parents=True, exist_ok=True)
    if out_path is None:
        out_path = BUNDLES_DIR / f"{_safe_slug(plan.get('url') or article_title)}.md"

    now = dt.datetime.now().isoformat(timespec="seconds")
    parts: list[str] = []
    parts.append(f"# Writer bundle\n\nGenerated: {now}\n")
    parts.append("## Article\n")
    parts.append(f"- Title: {article_title}\n")
    parts.append(f"- URL: {plan.get('url')}\n")
    parts.append(f"- Links count: {len(plan.get('links', []))}\n")
    parts.append(f"- CTAs count: {len(plan.get('ctas', []))}\n")
    parts.append("\n## Link plan (JSON)\n\n```json\n")
    parts.append(_format_link_plan_block(plan))
    parts.append("```\n")

    parts.append("\n## Mandatory rules — Article structure\n\n")
    parts.append(article_structure)
    parts.append("\n## Mandatory rules — Writing style\n\n")
    parts.append(writing_style)

    parts.append("\n## Sources (resolved extracts)\n")
    parts.append(f"- Assigned source titles: {len(source_titles)}\n")
    parts.append(f"- Resolved extract files: {len(sources)}\n")
    parts.append(f"- Missing extracts: {len(missing_sources)}\n\n")

    if missing_sources:
        parts.append("### Missing extracts (title did not resolve in `content/blog/extracts/index.json`)\n")
        for t in missing_sources:
            parts.append(f"- {t}\n")
        parts.append("\n")

    for i, src in enumerate(sources, start=1):
        rel = os.path.relpath(src.extract_path, REPO_ROOT)
        parts.append(f"### Source {i}: {src.title}\n")
        parts.append(f"- Key: `{src.key}`\n")
        if src.source_url:
            parts.append(f"- URL: {src.source_url}\n")
        parts.append(f"- File: `{rel}`\n\n")
        parts.append("```md\n")
        try:
            parts.append(_read_text(src.extract_path))
        except FileNotFoundError:
            parts.append(f"[MISSING FILE ON DISK] {rel}\n")
        parts.append("```\n\n")

    out_path.write_text("".join(parts), encoding="utf-8")
    return out_path


def main() -> None:
    parser = argparse.ArgumentParser(description="Assemble one writer bundle for a target article title.")
    parser.add_argument("--article", required=True, help="Exact target article title (must match link plan + assignment).")
    parser.add_argument("--out", required=False, help="Optional output path. Defaults to research/bundles/<slug>.md")
    args = parser.parse_args()

    out_path = Path(args.out).resolve() if args.out else None
    written = assemble_bundle(article_title=args.article, out_path=out_path)
    print(str(written))


if __name__ == "__main__":
    main()

