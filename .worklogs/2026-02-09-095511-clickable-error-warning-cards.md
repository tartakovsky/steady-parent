# Clickable error/warning cards on admin dashboard

**Date:** 2026-02-09 09:55
**Scope:** landing/src/app/admin/page.tsx, landing/src/components/admin/stats-card.tsx

## Summary
Made the Errors and Warnings stat cards on the admin dashboard clickable. Clicking expands an inline detail panel showing all errors (or warnings) grouped by article, with links to each article's detail page.

## Context & Problem
The dashboard showed aggregate error/warning counts but required navigating to the Articles page and then clicking into individual articles to find specific errors. User wanted to click the error count and immediately see what's wrong.

## Decisions Made

### Inline expandable panel (not a separate page)
- **Chose:** Toggle a detail panel below the stats grid on the same page
- **Why:** Keeps context — you see the counts and the details together. No navigation needed. Click again to collapse.

### Lazy-load articles on first click
- **Chose:** Fetch `/api/admin/articles` only when user clicks an error/warning card, then cache
- **Why:** Dashboard loads fast (just sync summary). Article data with validation arrays is heavier — only fetch when needed.

### StatsCard onClick + active props
- **Chose:** Added optional `onClick` and `active` props to StatsCard component
- **Why:** Non-clickable cards (Deployed Articles, Plan Coverage, Warnings at 0) remain static. Only cards with issues become interactive. Active state shows a ring highlight.

## Key Files for Context
- `landing/src/app/admin/page.tsx` — dashboard with expandable error/warning detail panel
- `landing/src/components/admin/stats-card.tsx` — stats card with optional click behavior
