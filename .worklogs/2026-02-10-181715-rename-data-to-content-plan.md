# Rename data/ to content-plan/

**Date:** 2026-02-10 18:17
**Scope:** `content-plan/`, all files updated in previous commit

## Summary
Renamed `data/` → `content-plan/` because "data" is too generic. These files are the editorial content plan — taxonomy, link plans, CTAs, quiz specs — not arbitrary data.

## Context & Problem
Immediately after the `data/` move, user pointed out the name doesn't convey what the directory contains. "Data can be anything."

## Decisions Made

### content-plan/
- **Chose:** `content-plan/`
- **Why:** Matches existing naming (`validate-plans.ts` calls itself "Plan Data Validation"), clearly communicates purpose — these are the structured definitions that drive what the site produces
- **Alternatives considered:**
  - `editorial/` — too vague, sounds like written content
  - `definitions/` — accurate but doesn't convey the "plan" aspect
