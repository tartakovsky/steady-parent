# Require Kit wiring for waitlist/quiz-gate passing counts

**Date:** 2026-02-12 17:00
**Scope:** landing/src/app/admin/mailing/page.tsx

## Summary
Waitlist and quiz-gate stats now require Kit form mapping to count as passing. A form without Kit wiring can't actually collect emails, so it shouldn't show green.

## Context & Problem
"Course waitlist forms: 20/20" and "Quiz gate forms: 24/24" showed green based only on catalog validation (no errors in byEntry). But without a Kit form mapping, submitting the form does nothing — the email never reaches Kit. The stat must reflect end-to-end readiness.
