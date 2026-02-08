#!/usr/bin/env python3
"""
Phase 7.3 article validation script.

Checks a generated article markdown file against its link plan and
structural requirements. Reports missing links, hallucinated URLs,
word count, heading hierarchy, FAQ count, and CTA presence.

Usage:
    python3 research/validate_article.py research/articles/tantrums/handle-tantrum-scripts.md
    python3 research/validate_article.py research/articles/  # validate all .md files in dir
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[1]
LINK_PLAN_PATH = REPO_ROOT / "research" / "article_link_plan.json"
CATEGORY_CTAS_PATH = REPO_ROOT / "research" / "category_ctas.json"


# ---------------------------------------------------------------------------
# URL registry: every valid internal + external URL from the link plan
# ---------------------------------------------------------------------------

def _build_url_registry(link_plan: list[dict[str, Any]]) -> set[str]:
    """Collect every valid URL that can appear in an article."""
    urls: set[str] = set()
    for entry in link_plan:
        urls.add(entry["url"])
        for link in entry.get("links", []):
            if link.get("url"):
                urls.add(link["url"])
        for cta in entry.get("ctas", []):
            if cta.get("url"):
                urls.add(cta["url"])
    return urls


# ---------------------------------------------------------------------------
# Markdown parsing helpers
# ---------------------------------------------------------------------------

_MD_LINK_RE = re.compile(r"\[([^\]]*)\]\(([^)]+)\)")
_HEADING_RE = re.compile(r"^(#{1,6})\s+(.+)$", re.MULTILINE)
_JSX_HREF_RE = re.compile(r'<(?:CourseCTA|CommunityCTA|FreebieCTA|a)\s[^>]*href="([^"]+)"')
_HTML_COMMENT_RE = re.compile(r"<!--[\s\S]*?-->")
_MDX_IMAGE_RE = re.compile(r"\{/\*\s*IMAGE:\s*(.*?)\s*\*/\}", re.DOTALL)
_CTA_COMPONENT_RE = re.compile(r"<(CourseCTA|CommunityCTA|FreebieCTA)\s")
_EM_DASH_RE = re.compile(r"\u2014")
_GENDERED_RE = re.compile(r"\b(?:mama|mommy|mommies|girl|girly|girlies)\b", re.IGNORECASE)


def _extract_md_links(text: str) -> list[tuple[str, str]]:
    """Return list of (anchor_text, url) from markdown links."""
    return _MD_LINK_RE.findall(text)


def _extract_jsx_hrefs(text: str) -> list[str]:
    """Return list of URLs from JSX/MDX component href props."""
    return _JSX_HREF_RE.findall(text)


def _extract_headings(text: str) -> list[tuple[int, str]]:
    """Return list of (level, heading_text)."""
    return [(len(m.group(1)), m.group(2).strip()) for m in _HEADING_RE.finditer(text)]


def _word_count(text: str) -> int:
    """Approximate word count (strip markdown syntax roughly)."""
    clean = re.sub(r"```[\s\S]*?```", "", text)  # remove code blocks
    clean = re.sub(r"`[^`]+`", "", clean)  # remove inline code
    clean = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", clean)  # remove images
    clean = re.sub(r"\[[^\]]*\]\([^)]*\)", lambda m: m.group(0).split("]")[0][1:], clean)
    clean = re.sub(r"[#*_>\-|]", " ", clean)
    return len(clean.split())


# ---------------------------------------------------------------------------
# Find link plan entry for an article
# ---------------------------------------------------------------------------

def _find_plan_by_url(link_plan: list[dict[str, Any]], article_url: str) -> dict[str, Any] | None:
    for entry in link_plan:
        if entry["url"] == article_url:
            return entry
    return None


def _find_plan_by_title(link_plan: list[dict[str, Any]], title: str) -> dict[str, Any] | None:
    t = title.lower().strip()
    for entry in link_plan:
        if entry["article"].lower().strip() == t:
            return entry
    return None


def _guess_plan(link_plan: list[dict[str, Any]], text: str, filepath: Path) -> dict[str, Any] | None:
    """Try to match article to its link plan entry.

    Strategy:
    1. Look for a YAML/markdown frontmatter url field
    2. Look for the H1 title and match by title
    3. Match by filename slug against link plan URLs
    """
    # Try frontmatter url
    fm_url = re.search(r"^url:\s*(.+)$", text, re.MULTILINE)
    if fm_url:
        plan = _find_plan_by_url(link_plan, fm_url.group(1).strip().strip('"').strip("'"))
        if plan:
            return plan

    # Try H1 title
    h1 = re.search(r"^#\s+(.+)$", text, re.MULTILINE)
    if h1:
        plan = _find_plan_by_title(link_plan, h1.group(1).strip())
        if plan:
            return plan

    # Try filename slug match
    slug = filepath.stem
    for entry in link_plan:
        if entry["url"].rstrip("/").split("/")[-1] == slug:
            return entry

    return None


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------

class ValidationResult:
    def __init__(self, filepath: Path, plan: dict[str, Any] | None):
        self.filepath = filepath
        self.plan = plan
        self.errors: list[str] = []
        self.warnings: list[str] = []
        self.info: list[str] = []

    @property
    def ok(self) -> bool:
        return len(self.errors) == 0

    def error(self, msg: str) -> None:
        self.errors.append(msg)

    def warn(self, msg: str) -> None:
        self.warnings.append(msg)

    def add_info(self, msg: str) -> None:
        self.info.append(msg)

    def print_report(self) -> None:
        title = self.plan["article"] if self.plan else self.filepath.name
        status = "PASS" if self.ok else "FAIL"
        print(f"\n{'=' * 70}")
        print(f"[{status}] {title}")
        print(f"  File: {self.filepath}")
        if self.plan:
            print(f"  URL:  {self.plan['url']}")
        print(f"{'=' * 70}")

        for msg in self.info:
            print(f"  INFO:    {msg}")
        for msg in self.warnings:
            print(f"  WARNING: {msg}")
        for msg in self.errors:
            print(f"  ERROR:   {msg}")

        if self.ok and not self.warnings:
            print("  All checks passed.")


def validate_article(filepath: Path, link_plan: list[dict[str, Any]], url_registry: set[str]) -> ValidationResult:
    text = filepath.read_text(encoding="utf-8")
    plan = _guess_plan(link_plan, text, filepath)
    result = ValidationResult(filepath, plan)

    if plan is None:
        result.error("Could not match article to any link plan entry")
        return result

    is_pillar = plan["url"].count("/") == 2 and plan["url"].endswith("/")
    # Pillar URLs look like /tantrums/, series like /tantrums/slug/
    # More robust: check if any link has type series_preview
    has_series_preview = any(l.get("type") == "series_preview" for l in plan.get("links", []))
    is_pillar = has_series_preview

    # ----- Word count -----
    wc = _word_count(text)
    result.add_info(f"Word count: {wc}")
    if is_pillar:
        if wc < 2500:
            result.error(f"Pillar article too short: {wc} words (min 2,500)")
        elif wc > 4000:
            result.warn(f"Pillar article long: {wc} words (target max 3,500)")
    else:
        if wc < 1600:
            result.error(f"Article too short: {wc} words (min 1,800)")
        elif wc < 1800:
            result.warn(f"Article slightly short: {wc} words (target 1,800-2,200)")
        elif wc > 2400:
            result.warn(f"Article long: {wc} words (target 1,800-2,200)")

    # ----- Detect MDX metadata (H1 comes from page component) -----
    has_mdx_metadata = bool(re.search(r"export\s+const\s+metadata\s*=", text))

    # ----- HTML comments (MDX build error) -----
    html_comments = _HTML_COMMENT_RE.findall(text)
    if html_comments:
        result.error(f"HTML comments found ({len(html_comments)}x) — MDX requires {{/* */}} not <!-- -->")

    # ----- Metadata fields validation -----
    # Regex that handles escaped quotes inside string values
    _meta_str_re = re.compile(r'(?:(?:[^\\]|\A)")((?:[^"\\]|\\.)*)"')
    if has_mdx_metadata:
        for field in ("title", "description", "date", "category"):
            if not re.search(rf'{field}:\s*"(?:[^"\\]|\\.)*"', text):
                result.error(f"Metadata missing or empty: {field}")
        title_match = re.search(r'title:\s*"((?:[^"\\]|\\.)*)"', text)
        if title_match:
            title_val = title_match.group(1).replace('\\"', '"')
            title_len = len(title_val)
            result.add_info(f"Title length: {title_len} chars")
            if title_len > 110:
                result.warn(f"Title too long: {title_len} chars (max 110 for SEO)")
        desc_match_meta = re.search(r'description:\s*"((?:[^"\\]|\\.)*)"', text)
        if desc_match_meta:
            desc_val = desc_match_meta.group(1).replace('\\"', '"')
            desc_wc = len(desc_val.split())
            result.add_info(f"Description (AI answer): {desc_wc} words")
            if desc_wc < 30:
                result.warn(f"Description too short: {desc_wc} words (target 40-60)")
            elif desc_wc > 80:
                result.warn(f"Description too long: {desc_wc} words (target 40-60)")

    # ----- Heading hierarchy -----
    headings = _extract_headings(text)
    h1_count = sum(1 for level, _ in headings if level == 1)
    if h1_count == 0 and not has_mdx_metadata:
        result.error("No H1 found")
    elif h1_count == 0 and has_mdx_metadata:
        result.add_info("H1 provided by page component (MDX metadata export found)")
    elif h1_count > 1:
        result.error(f"Multiple H1s found: {h1_count}")
    if has_mdx_metadata and h1_count > 0:
        result.warn("MDX file has both metadata export and H1 heading (page will render duplicate title)")

    for i, (level, heading_text) in enumerate(headings):
        if level > 3:
            result.error(f"Heading level H{level} used (only H1/H2/H3 allowed): '{heading_text}'")
        if i > 0:
            prev_level = headings[i - 1][0]
            if level > prev_level + 1:
                result.error(f"Skipped heading level: H{prev_level} -> H{level} at '{heading_text}'")

    h2_count = sum(1 for level, _ in headings if level == 2)
    result.add_info(f"H2 sections: {h2_count}")
    if h2_count < 3:
        result.warn(f"Only {h2_count} H2 sections (target 5-8)")

    # ----- TLDR section -----
    h2_texts = [t.lower().strip() for level, t in headings if level == 2]
    if "tldr" not in h2_texts and "tl;dr" not in h2_texts:
        result.error("No TLDR section found (expected ## TLDR)")
    elif h2_texts and h2_texts[0] not in ("tldr", "tl;dr"):
        result.warn("TLDR section exists but is not the first H2")

    # ----- FAQ section -----
    faq_match = re.search(r"##\s+FAQ", text, re.IGNORECASE)
    if faq_match:
        faq_text = text[faq_match.start():]
        # Count question-like patterns (bold text ending in ?, or ### headings with ?)
        faq_questions = re.findall(r"(?:\*\*[^*]+\?\*\*|###\s+.+\?)", faq_text)
        result.add_info(f"FAQ questions: {len(faq_questions)}")
        if len(faq_questions) < 3:
            result.error(f"Too few FAQ questions: {len(faq_questions)} (min 3)")
        elif len(faq_questions) > 7:
            result.warn(f"Many FAQ questions: {len(faq_questions)} (target 3-5)")
        # Check individual FAQ answer lengths
        faq_blocks = re.split(r"\*\*[^*]+\?\*\*|###\s+.+\?", faq_text)
        for i, block in enumerate(faq_blocks[1:], 1):  # skip text before first Q
            answer_text = block.strip()
            # Stop at next heading or end
            next_heading = re.search(r"\n##\s", answer_text)
            if next_heading:
                answer_text = answer_text[:next_heading.start()]
            answer_wc = len(answer_text.split())
            if answer_wc > 0 and answer_wc < 25:
                result.warn(f"FAQ answer {i} too short: {answer_wc} words (target ~45)")
            elif answer_wc > 80:
                result.warn(f"FAQ answer {i} too long: {answer_wc} words (target ~45)")
    else:
        result.error("No FAQ section found (expected ## FAQ heading)")

    # ----- Extract all URLs from article -----
    found_links = _extract_md_links(text)
    jsx_hrefs = _extract_jsx_hrefs(text)
    found_urls = [url for _, url in found_links] + jsx_hrefs
    found_urls_set = set(found_urls)
    result.add_info(f"Markdown links: {len(found_links)}, JSX component hrefs: {len(jsx_hrefs)}")

    # ----- Check required links from plan -----
    required_links = plan.get("links", [])
    required_ctas = plan.get("ctas", [])

    # Links check
    missing_links = []
    for link in required_links:
        url = link["url"]
        if url not in found_urls_set:
            missing_links.append(f"{url} (type={link['type']})")

    if missing_links:
        result.error(f"Missing {len(missing_links)} required links:")
        for ml in missing_links:
            result.error(f"  - {ml}")

    present_required = len(required_links) - len(missing_links)
    result.add_info(f"Required links present: {present_required}/{len(required_links)}")

    # CTA check
    missing_ctas = []
    for cta in required_ctas:
        url = cta.get("url")
        if url is None:
            # freebie with null URL - check if there's any freebie mention
            continue
        if url not in found_urls_set:
            missing_ctas.append(f"{url} (type={cta['type']})")

    if missing_ctas:
        result.error(f"Missing {len(missing_ctas)} required CTAs:")
        for mc in missing_ctas:
            result.error(f"  - {mc}")

    # Count CTA types present
    cta_urls = {cta["url"] for cta in required_ctas if cta.get("url")}
    ctas_found = found_urls_set & cta_urls
    result.add_info(f"CTAs present: {len(ctas_found)}/{len(cta_urls)}")

    # ----- Unauthorized URLs (not in registry) -----
    for url in sorted(found_urls_set):
        if url.startswith("/"):
            if url not in url_registry:
                result.error(f"Hallucinated internal URL (not in registry): {url}")
        elif url.startswith("http"):
            if url not in url_registry:
                result.error(f"Unauthorized external URL (not in registry): {url}")
        elif url.startswith("#"):
            pass  # anchor links are fine
        else:
            result.warn(f"Unusual URL format: {url}")

    # ----- Internal link count (excluding external) -----
    internal_link_count = sum(1 for url in found_urls if url.startswith("/"))
    result.add_info(f"Internal links: {internal_link_count}")
    if not is_pillar:
        if internal_link_count < 5:
            result.error(f"Too few internal links: {internal_link_count} (min 5)")
        elif internal_link_count > 15:
            result.warn(f"Many internal links: {internal_link_count} (target 5-10)")

    # ----- Duplicate anchor text for different URLs -----
    anchor_to_urls: dict[str, set[str]] = {}
    for anchor, url in found_links:
        anchor_lower = anchor.strip().lower()
        if anchor_lower:
            anchor_to_urls.setdefault(anchor_lower, set()).add(url)
    for anchor, urls in anchor_to_urls.items():
        if len(urls) > 1:
            result.warn(f"Same anchor text '{anchor}' used for {len(urls)} different URLs")

    # ----- CTA component count (exactly 3) -----
    cta_components = _CTA_COMPONENT_RE.findall(text)
    result.add_info(f"CTA components: {len(cta_components)} ({', '.join(cta_components) if cta_components else 'none'})")
    if len(cta_components) < 3:
        result.error(f"Too few CTA components: {len(cta_components)} (need exactly 3)")
    elif len(cta_components) > 3:
        result.warn(f"Too many CTA components: {len(cta_components)} (target exactly 3)")

    # ----- CTA title consistency (canonical names) -----
    if CATEGORY_CTAS_PATH.exists():
        category_ctas = json.loads(CATEGORY_CTAS_PATH.read_text(encoding="utf-8"))
        # Extract category slug from plan URL
        plan_parts = plan["url"].strip("/").split("/")
        cat_slug = plan_parts[1] if plan_parts[0] == "blog" and len(plan_parts) > 1 else plan_parts[0]
        cat_cta = category_ctas.get(cat_slug)
        if cat_cta:
            # Check CourseCTA titles
            course_title_re = re.compile(r'<CourseCTA\s[^>]*title="([^"]*)"')
            for m in course_title_re.finditer(text):
                found_title = m.group(1)
                canonical = cat_cta["course_name"]
                if canonical.lower() not in found_title.lower():
                    result.error(f"CourseCTA title \"{found_title}\" doesn't match canonical \"{canonical}\"")
            # Check FreebieCTA titles
            freebie_title_re = re.compile(r'<FreebieCTA\s[^>]*title="([^"]*)"')
            for m in freebie_title_re.finditer(text):
                found_title = m.group(1)
                canonical = cat_cta["freebie_name"]
                if canonical.lower() not in found_title.lower():
                    result.error(f"FreebieCTA title \"{found_title}\" doesn't match canonical \"{canonical}\"")

    # ----- Video promise in CTA body -----
    cta_body_re = re.compile(r'<(?:CourseCTA|CommunityCTA|FreebieCTA)\s[^>]*body="([^"]*)"', re.DOTALL)
    for m in cta_body_re.finditer(text):
        body_text = m.group(1).lower()
        if "video" in body_text:
            result.error(f"CTA body promises video: \"{m.group(1)[:80]}...\" (courses are text + audio + illustrations only)")

    # ----- Image placeholder checks -----
    image_placeholders = list(_MDX_IMAGE_RE.finditer(text))
    result.add_info(f"Image placeholders: {len(image_placeholders)}")
    if len(image_placeholders) < 3:
        result.error(f"Too few image placeholders: {len(image_placeholders)} (need exactly 3: 1 cover + 2 inline)")
    elif len(image_placeholders) > 3:
        result.warn(f"Too many image placeholders: {len(image_placeholders)} (target exactly 3)")

    # Cover image should come before first H2
    if image_placeholders:
        first_image_pos = image_placeholders[0].start()
        first_h2 = re.search(r"^##\s", text, re.MULTILINE)
        if first_h2 and first_image_pos > first_h2.start():
            result.warn("Cover image is not before the first H2 heading")

    # ----- Navigation block position -----
    nav_link_types = {"pillar", "prev", "next"}
    body_link_types = {"cross", "sibling", "quiz"}
    nav_urls = {l["url"] for l in plan.get("links", []) if l.get("type") in nav_link_types}
    # URLs that serve double duty (both body link and nav link) are allowed before FAQ
    body_urls = {l["url"] for l in plan.get("links", []) if l.get("type") in body_link_types}
    nav_only_urls = nav_urls - body_urls
    if nav_only_urls:
        # Find where the FAQ section starts — nav-only links should be after it
        faq_pos = faq_match.start() if faq_match else len(text)
        for anchor, url in found_links:
            if url in nav_only_urls:
                link_pos = text.find(f"]({url})")
                if link_pos >= 0 and link_pos < faq_pos:
                    result.warn(f"Navigation link {url} appears before FAQ section (should be at END)")
                    break

    # ----- Style: em-dash detection -----
    em_dashes = _EM_DASH_RE.findall(text)
    if em_dashes:
        result.warn(f"Em-dashes found ({len(em_dashes)}x) — style guide forbids them (use commas, periods, or parentheses)")

    # ----- Style: gendered language -----
    gendered_matches = _GENDERED_RE.findall(text)
    if gendered_matches:
        unique = sorted(set(m.lower() for m in gendered_matches))
        result.warn(f"Gendered language found: {', '.join(unique)} — style guide forbids these")

    # ----- AI answer block (first paragraph after H1) -----
    h1_match = re.search(r"^#\s+.+$", text, re.MULTILINE)
    if h1_match:
        after_h1 = text[h1_match.end():].lstrip("\n")
        # First non-empty paragraph before next heading
        first_para = re.match(r"(.+?)(?=\n\n|\n#)", after_h1, re.DOTALL)
        if first_para:
            ai_answer_wc = len(first_para.group(1).split())
            result.add_info(f"AI answer block: ~{ai_answer_wc} words")
            if ai_answer_wc < 30:
                result.warn(f"AI answer block very short: {ai_answer_wc} words (target 40-60)")
            elif ai_answer_wc > 80:
                result.warn(f"AI answer block long: {ai_answer_wc} words (target 40-60)")

    # ----- Artifact report -----
    # Extract CTAs and image suggestions so we know what assets to produce
    freebie_re = re.compile(
        r'<FreebieCTA\s[^>]*?title="([^"]*)"[^>]*?body="([^"]*)"',
        re.DOTALL,
    )
    freebie_re2 = re.compile(
        r'<FreebieCTA\s[^>]*?body="([^"]*)"[^>]*?title="([^"]*)"',
        re.DOTALL,
    )
    course_re = re.compile(
        r'<CourseCTA\s[^>]*?title="([^"]*)"[^>]*?body="([^"]*)"',
        re.DOTALL,
    )
    artifacts: list[str] = []
    for m in freebie_re.finditer(text):
        artifacts.append(f"FREEBIE: \"{m.group(1)}\" - {m.group(2)}")
    for m in freebie_re2.finditer(text):
        artifacts.append(f"FREEBIE: \"{m.group(2)}\" - {m.group(1)}")
    for m in course_re.finditer(text):
        artifacts.append(f"COURSE: \"{m.group(1)}\" - {m.group(2)}")
    seen_artifacts: set[str] = set()
    for a in artifacts:
        if a not in seen_artifacts:
            seen_artifacts.add(a)
            result.add_info(f"Artifact promised: {a}")

    # Extract image suggestions
    for i, img_match in enumerate(image_placeholders, 1):
        desc = img_match.group(1).strip()
        label = "cover" if i == 1 else f"inline {i - 1}"
        result.add_info(f"Image ({label}): {desc}")

    # ----- Duplicate AI answer block check -----
    if has_mdx_metadata:
        desc_match = re.search(r'description:\s*"((?:[^"\\]|\\.)*)"', text)
        if desc_match:
            desc_text = desc_match.group(1).strip()
            metadata_end = text.find("};")
            if metadata_end > 0:
                body = text[metadata_end + 2:].strip()
                if body.startswith(desc_text[:60]):
                    result.error("AI answer block duplicates the metadata description (page already renders description)")

    return result


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python3 research/validate_article.py <article.md | directory/>")
        sys.exit(1)

    target = Path(sys.argv[1])
    if target.is_dir():
        files = sorted([*target.rglob("*.md"), *target.rglob("*.mdx")])
    else:
        files = [target]

    if not files:
        print(f"No .md/.mdx files found in {target}")
        sys.exit(1)

    link_plan = json.loads(LINK_PLAN_PATH.read_text(encoding="utf-8"))
    url_registry = _build_url_registry(link_plan)

    results: list[ValidationResult] = []
    for f in files:
        results.append(validate_article(f, link_plan, url_registry))

    for r in results:
        r.print_report()

    # Summary
    total = len(results)
    passed = sum(1 for r in results if r.ok)
    failed = total - passed
    total_errors = sum(len(r.errors) for r in results)
    total_warnings = sum(len(r.warnings) for r in results)

    print(f"\n{'=' * 70}")
    print(f"SUMMARY: {passed}/{total} passed, {failed} failed")
    print(f"         {total_errors} errors, {total_warnings} warnings")
    print(f"{'=' * 70}")

    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
