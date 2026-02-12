# Fix summary banner to include deployment issues in counts

**Date:** 2026-02-12 16:46
**Scope:** landing/src/app/admin/ctas/page.tsx, landing/src/app/admin/mailing/page.tsx

## Summary
Summary banners on CTA and mailing pages now include deployment issues (unpublished articles, CTA check failures) in error counts and show the total validation scope (catalog entries + article checks), not just catalog entry counts.

## Context & Problem
Both pages showed "All checks passed — N entries validated" based only on catalog-level validation. With 240 unpublished articles, the banner was green and said "65 entries" when the real scope is 65 catalog entries + 490 article-level checks (245 articles x 2 CTA types), most of which are failing.

## Decisions Made

### CTA page: count deployment issues as errors
- Each unpublished article counts as 2 issues (community + course missing)
- Each published article with CTA problems counted from `communityIssues` / `courseIssues`
- Total scope = catalog entries + (articles × 2)

### Mailing page: count deployment issues from articlesByCategory
- Each unpublished article = 1 issue
- Each published article with check failures = 1 issue
- Total scope = catalog entries + total articles across categories
