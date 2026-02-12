# Add infrastructure columns to waitlist and quiz-gate tables

**Date:** 2026-02-12 17:36
**Scope:** landing/src/app/api/admin/mailing/route.ts, landing/src/app/admin/mailing/page.tsx

## Summary
Waitlist and quiz-gate tables now show infrastructure checks per-row (API route, frontend handler, Kit custom field, Kit tag). Previously they only showed catalog validation — all green — despite zero forms actually working.

## Context & Problem
Previous commit added infrastructure stats at the top of the page, but the waitlist and quiz-gate tables themselves still showed all-green rows because they only validated catalog data (copy word counts, URL patterns, tag names). The user couldn't see WHY forms were broken without scrolling to the integration accordion at the bottom.

## Changes

### Route: patch byEntry with infrastructure checks
After computing infrastructure flags, loop through waitlist and quiz-gate entries in mailingByEntry and inject:

**Waitlist entries** get: `api_route` (waitlist-subscribe route exists?), `frontend` (CourseHero has real submit handler?)
**Quiz-gate entries** get: `api_route` (quiz-subscribe route), `frontend` (quiz subscribe logic), `kit_field` (quiz_result_url custom field), `kit_tag` (per-quiz Kit tag exists)

Failures are added to both `ev.checks` (visible in table columns) AND `ev.errors` (makes row icon red + affects passing count).

### Route: waitlist code checks
Added `fileExists` check for `/api/waitlist-subscribe/route.ts` and `fileContainsPatterns` for CourseHero looking for "fetch(" and "/api/waitlist-subscribe". Neither exists currently.

### Page: column definitions updated
- waitlistColumns: +api_route, +frontend
- quizGateColumns: +api_route, +frontend, +kit_field, +kit_tag

### Page: removed redundant quizInfraReady
Since quiz-gate infrastructure failures are now in ev.errors, the passing count `ev.errors.length === 0` already catches them. No need for separate quizInfraReady boolean.

## Current state
- Waitlist: 0/20 passing (all have 2 infra errors: no API route + no submit handler)
- Quiz gate: 0/24 passing (all have 3 infra errors: no API route + no frontend subscribe + no Kit custom field; Kit tags pass)
- Freebie: 0/245 passing (no API route per article)
