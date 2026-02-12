# Remove misleading 'Blog freebie forms' stat line

**Date:** 2026-02-12 16:58
**Scope:** landing/src/app/admin/mailing/page.tsx

## Summary
Removed "Blog freebie forms: 20/20" from mailing page stats. Freebies are per-article, not standalone forms — the only meaningful metric is "In-article freebies: x/245".

## Context & Problem
"Blog freebie forms: 20/20" counted catalog entries with no errors. All 20 categories have freebie catalog entries, so it showed green 20/20. But this is meaningless — freebies live on articles, and almost none are published. The green number was actively misleading.
