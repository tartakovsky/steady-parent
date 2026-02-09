# Rebuild Cross-Linking tab with nested accordions and resolved link targets

**Date:** 2026-02-09 13:05
**Scope:** content-spec/src/validator/cross-links.ts, content-spec/src/validator/index.ts, content-spec/src/index.ts, landing/src/app/admin/spec/page.tsx, landing/src/app/api/admin/spec/route.ts

## Summary
Rebuilt the Cross-Linking tab from aggregate-only stats to a full browsable view: nested accordions (category → article → outgoing links) with resolved target names, color-coded type badges, and per-link validation checkmarks.

## Context & Problem
The initial Cross-Linking tab (commit 550d6b9) only showed aggregate numbers — link/CTA counts by type. User feedback: "completely useless" because it doesn't show the actual per-article link data. Need to see which article links to what, with resolved names and validation status.

## Decisions Made

### Server-side detail builder instead of client-side resolution
- **Chose:** `buildCrossLinkDetail()` in content-spec that pre-resolves all link targets and groups by category
- **Why:** The admin page shouldn't need to do URL→title lookups or category grouping — that's validation/spec logic. Single API call returns display-ready structure.
- **Alternatives considered:**
  - Client-side resolution from raw link plan + taxonomy — rejected because it duplicates logic and makes the page heavier

### Three-level nested accordion UI
- **Chose:** Category → Article → Links table (Status | Type | Target | URL)
- **Why:** 245 articles × ~8 links each = ~2000 rows. Flat list unusable. Category grouping matches how taxonomy organizes articles.

### Color-coded type badges for link types
- **Chose:** Different colors per link type (cross=blue, sibling=cyan, quiz=violet, series_preview=amber, pillar=emerald, prev/next=muted)
- **Why:** Visual scanning of link composition at a glance

### Separate sections for Articles, Quizzes, Courses
- **Chose:** Articles (grouped by category), Quizzes (flat table with connectsTo badges), Courses (placeholder)
- **Why:** These are different source page types that will eventually all have outgoing cross-links

## Architectural Notes
- `CrossLinkDetail` type bundles stats + per-category articles + orphan detection + quiz connections + validation
- URL→title lookup built from both article taxonomy and quiz taxonomy entries
- `norm()` helper strips trailing slashes for URL comparison (link plan uses trailing slashes, quiz taxonomy doesn't)
- API route returns single `crossLinkDetail` object instead of separate `crossLinkStats` + `crossLinkValidation`

## Key Files for Context
- `content-spec/src/validator/cross-links.ts` — core cross-link logic (stats, validation, detail builder)
- `landing/src/app/admin/spec/page.tsx` — admin spec page with all tabs
- `landing/src/app/api/admin/spec/route.ts` — API route loading all spec data
- `.worklogs/2026-02-09-130502-cross-linking-tab-rebuild.md` — this worklog

## Next Steps / Continuation Plan
1. Continue with remaining plan items (quiz validation system, community CTA generation)
2. Consider adding incoming link counts (how many articles link TO a given article) for completeness
