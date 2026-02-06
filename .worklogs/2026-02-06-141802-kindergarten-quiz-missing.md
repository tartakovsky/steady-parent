# Add missing kindergarten-readiness quiz JSON

**Date:** 2026-02-06 14:18
**Scope:** `landing/src/lib/quiz/kindergarten-readiness.json`

## Summary
Committed the kindergarten-readiness.json file that was created in a prior session but never tracked by git. The registry already imported it.

## Context & Problem
The quiz registry in index.ts imported kindergarten-readiness.json, and it worked locally, but the file was untracked in git. Deploying without it would break the build.
