# Fix page-level FreebieCTA to show category-specific content

**Date:** 2026-02-08 22:20
**Scope:** landing/src/app/(public)/blog/[category]/[slug]/page.tsx, landing/src/lib/cta-catalog.ts, landing/src/components/blog/freebie-cta.tsx

## Summary
Fixed the page-level FreebieCTA at the bottom of blog posts to display category-specific freebie content instead of hardcoded "Tantrum Reset cheat sheet" default for all articles.

## Context & Problem
Every blog post had a full-width FreebieCTA at the bottom showing "Get the Tantrum Reset cheat sheet" regardless of the article's category. A sleep article about bedtime routines was showing tantrum-related freebie copy. The inline `<FreebieCTA>` components within articles already had correct per-article copy (set by the writer), but the page-level one was using hardcoded defaults.

## Decisions Made

### Created cta-catalog.ts helper module
- **Chose:** Server-side helper that reads cta_catalog.json with fs and caches in memory, same dev/prod path pattern as sync-orchestrator
- **Why:** Blog post page is a server component (SSG), needs async data loading. Reuses the same path resolution pattern already established in sync-orchestrator. Cache prevents re-reading the file for each article at build time.

### Title formatting with "The" prefix detection
- **Chose:** `Get ${name.startsWith("The ") ? "" : "the "}${name}` to avoid "Get the The X" double-article
- **Why:** Some freebie names start with "The" (e.g., "The 3-Step Tantrum Script Cheat Sheet") and some don't (e.g., "Bedtime Routine Cards by Age"). Simple prefix check handles both cases cleanly.

### Spread props pattern for exactOptionalPropertyTypes
- **Chose:** `{...(freebie ? { title: x, body: y } : {})}` instead of `title={freebie ? x : undefined}`
- **Why:** TypeScript's `exactOptionalPropertyTypes` (enabled in this project) distinguishes between "property absent" and "property = undefined". Spread pattern avoids the type error.

## Key Files for Context
- `landing/src/lib/cta-catalog.ts` — new helper, reads cta_catalog.json
- `landing/src/app/(public)/blog/[category]/[slug]/page.tsx` — blog post page, now passes category-specific freebie props
- `research/cta_catalog.json` — source data, freebie IDs follow `freebie-{categorySlug}` pattern
- `.worklogs/2026-02-08-214801-data-files-validation.md` — prior worklog about data files
