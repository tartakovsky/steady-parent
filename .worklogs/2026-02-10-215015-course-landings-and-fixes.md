# Course landing pages, waitlist CTAs, Yandex Metrica, and admin fixes

**Date:** 2026-02-10 21:50
**Scope:** landing/src/app/(public)/course/, landing/src/components/course/, landing/src/lib/cta-catalog.ts, landing/src/lib/admin/sync-orchestrator.ts, landing/src/app/layout.tsx, landing/src/components/blog/freebie-cta.tsx, content-plan/cta_catalog.json, landing/package.json

## Summary
Built course landing pages (waitlist hero with email form) for all 20 categories, generated 20 waitlist CTA entries in the catalog, integrated Yandex Metrica analytics, and fixed several stale path bugs from the research/ → content-plan/ migration.

## Context & Problem
- Needed course landing pages at `/course/[slug]` with a "Reserve your spot" waitlist form
- The CTA catalog had `course` type entries but no `waitlist` type entries — the admin spec page showed "Not generated" for all waitlists
- The sync orchestrator still referenced `../research/` paths after the content-plan migration, causing Plan vs Reality to show 0/0 articles
- The `cta-catalog.ts` build-time path only checked `mdx-sources/` (production) which doesn't exist during `next build`, so `generateStaticParams` returned empty — zero course pages in production builds
- Yandex Metrica needed integration for analytics tracking

## Decisions Made

### Course page reads from waitlist entries, not course entries
- **Chose:** Separate `waitlist` CTA type for landing page content, `course` type for inline article CTAs
- **Why:** Clean separation of concerns — course CTA copy says "Start the X course" (for article body), waitlist CTA copy is for the hero landing page with "Reserve your spot"
- **Alternatives considered:**
  - Removing waitlist type entirely and using course entries — rejected because the validator/admin infrastructure already expected waitlist entries

### min-height instead of height for input elements
- **Chose:** `min-h-14` instead of `h-14` on `<input>` elements
- **Why:** Chrome ignores CSS `height` property on native `<input>` elements (even inline `!important` doesn't work), but respects `min-height`. Verified via browser DevTools: button with `h-14` → 70px, input with `h-14` → 48.5px, input with `min-h-14` → 70px
- **Alternatives considered:**
  - Tailwind v4 `!important` suffix (`h-14!`) — not tested, non-standard approach
  - Wrapping input in a div — unnecessary complexity

### Dual-path catalog loading for build compatibility
- **Chose:** `cta-catalog.ts` tries `mdx-sources/` first, falls back to `../content-plan/`
- **Why:** During `next build`, `NODE_ENV=production` but `mdx-sources/` doesn't exist yet (it's created post-build for standalone). Fallback ensures `generateStaticParams` works during build while production runtime still uses `mdx-sources/`

## Architectural Notes
- Course pages are statically generated via `generateStaticParams` with `dynamicParams = false`
- Waitlist entries mirror course entries: same name, URL, what_it_is, and similar cta_copy but with "Reserve your spot" buttonText
- The CourseHero component uses the same pattern as existing hero sections (Tagline eyebrow, heading-xl h1, Check-icon bullets) plus an email waitlist form matching FreebieCTA's form
- Yandex Metrica uses `next-yandex-metrica` package in SPA/app-router mode

## Information Sources
- Shadcn Pro Blocks Hero Section 4 (email form pattern)
- Existing `FreebieCTA` component for form sizing reference
- Chrome DevTools for debugging input height issue (min-height vs height)
- CTA validator at `content-spec/src/validator/cta.ts` for waitlist entry requirements

## Open Questions / Future Considerations
- Course hero bullets are currently hardcoded (same for all 20 courses) — could be moved to waitlist CTA data
- Email form submission not wired to Kit.com yet — currently just prevents default
- The `navbar.tsx` "Join Course" button links somewhere — may need updating to link to a course index or specific course

## Key Files for Context
- `landing/src/app/(public)/course/[slug]/page.tsx` — course landing page (reads from waitlist entries)
- `landing/src/components/course/course-hero.tsx` — hero component with email waitlist form
- `landing/src/lib/cta-catalog.ts` — catalog loader with dual-path fallback + waitlist functions
- `content-plan/cta_catalog.json` — 81 CTA entries (20 course + 20 waitlist + 20 community + 20 freebie + 1 global)
- `content-spec/src/validator/cta.ts` — CTA validator (checks waitlist entries)
- `landing/src/lib/admin/sync-orchestrator.ts` — sync with fixed content-plan paths
- `.worklogs/2026-02-06-120000-article-generation-pipeline-experiments.md` — prior pipeline context

## Next Steps / Continuation Plan
1. Wire email form submission to Kit.com API (subscribe to waitlist tag per category)
2. Consider per-course bullet points from catalog data instead of hardcoded
3. Deploy to Railway and verify course pages render in production
