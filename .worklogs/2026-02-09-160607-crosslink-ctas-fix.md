# Show CTAs in cross-link detail; remove fake quiz section

**Date:** 2026-02-09 16:06
**Scope:** content-spec/src/validator/cross-links.ts, content-spec/src/validator/index.ts, content-spec/src/index.ts, landing/src/app/admin/spec/page.tsx

## Summary
Fixed two issues with the Cross-Linking tab: (1) removed the Quizzes section which showed category metadata instead of actual cross-links, (2) added CTA rows (course, community, freebie) to the per-article link detail so all outgoing connections are visible.

## Context & Problem
User feedback: "Why the fuck is it in the cross-linking?" — the Quizzes section showed `connectsTo` (which categories a quiz relates to), but quizzes have zero entries in the link plan. Cross-linking must show actual cross-links, not metadata associations.

Also: articles link to courses and community via CTAs, but those weren't visible in the article detail. The link plan has both `links` (articles, quizzes) and `ctas` (course, community, freebie) per entry.

## Decisions Made

### Remove quizzes from cross-linking entirely
- **Chose:** Remove `CrossLinkQuiz` type and `quizConnections` from `CrossLinkDetail`
- **Why:** Zero quiz entries in the link plan. `connectsTo` is category metadata that belongs in Taxonomy, not cross-linking

### Add CTAs to article detail
- **Chose:** New `ResolvedCta` type with `url | null`, `type`, `intent`; rendered after links in same table
- **Why:** CTAs are outgoing connections from articles — course, community, freebie links must be visible
- **Alternatives considered:**
  - Separate CTAs section — rejected because they're per-article outgoing connections, same as links

## Key Files for Context
- `content-spec/src/validator/cross-links.ts` — core types and builder
- `landing/src/app/admin/spec/page.tsx` — admin spec page
