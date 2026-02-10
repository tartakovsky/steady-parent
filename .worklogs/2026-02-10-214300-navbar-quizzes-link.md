# Add Quizzes link to navbar

**Date:** 2026-02-10 21:43
**Scope:** landing/src/components/landing/navbar.tsx

## Summary
Added "Quizzes" nav link to the site navbar so users can discover quizzes from any page.

## Context & Problem
The quiz listing page and all 24 quizzes were deployed but there was no way to navigate to them from the main site navbar. The link was present locally but wasn't included in the previous commit.

## Decisions Made
- Added "Quizzes" → `/quiz` to all route-conditional menu item arrays
- When on a quiz page, the Quizzes link is replaced by Home/About/Blog (same pattern as other nav items)
