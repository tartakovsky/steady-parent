# Fix Railway standalone output paths for monorepo

**Date:** 2026-02-10 11:59
**Scope:** `landing/package.json`, Railway service settings (startCommand via GraphQL)

## Summary
Fixed the CRASHED Railway deployment caused by wrong standalone output paths after the previous commit changed `outputFileTracingRoot` to the monorepo root.

## Context & Problem
Commit `667b4c5` fixed workspace resolution by setting `outputFileTracingRoot: path.join(__dirname, "..")` and changing Railway's root directory to `/`. However, this change affects Next.js standalone output structure: when `outputFileTracingRoot` points to a parent directory, the standalone bundle mirrors the monorepo structure. Instead of `server.js` at `.next/standalone/server.js`, it lands at `.next/standalone/landing/server.js`. The same applies to static assets and public files.

The deployment CRASHED because Railway's start command was `node landing/.next/standalone/server.js` but server.js was actually at `landing/.next/standalone/landing/server.js`. Additionally, the build script's `cp` commands were copying static/public to the wrong locations.

Railway deployment list showed:
- `70496c29` — CRASHED (the fix commit)
- `15f07587` — FAILED (quiz generation commit — workspace resolution)
- `086d0e39` — FAILED (same)

## Decisions Made

### Fix build script paths
- **Chose:** Update `cp` commands from `.next/standalone/.next/static` → `.next/standalone/landing/.next/static` and `.next/standalone/public` → `.next/standalone/landing/public`
- **Why:** The standalone directory now mirrors the monorepo structure with a `landing/` subdirectory containing the actual app

### Fix Railway start command
- **Chose:** Updated via GraphQL API: `node landing/.next/standalone/landing/server.js`
- **Why:** The old command `node landing/.next/standalone/server.js` pointed to a non-existent file

## Verification
- Local build: `npm run build -w landing` succeeds
- Confirmed `landing/.next/standalone/landing/server.js` exists
- Confirmed `landing/.next/standalone/landing/.next/static/` populated
- Confirmed `landing/.next/standalone/landing/public/` populated

## Key Files for Context
- `landing/package.json` — build and start scripts with standalone paths
- `landing/next.config.ts` — outputFileTracingRoot setting
- `.worklogs/2026-02-10-114831-railway-monorepo-deploy.md` — previous fix that introduced the path issue
