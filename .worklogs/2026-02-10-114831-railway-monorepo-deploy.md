# Fix Railway deployment for monorepo workspace resolution

**Date:** 2026-02-10 11:48
**Scope:** `landing/next.config.ts`, Railway service settings (via GraphQL API)

## Summary
Fixed Railway deployment failing because root directory was set to `landing/`, which prevented npm from resolving the `@steady-parent/content-spec` workspace package. Changed root to repo root and set explicit build/start commands.

## Context & Problem
Railway's root directory was set to `/landing`. When Railway ran `npm install` there, it only saw `landing/package.json` which depends on `"@steady-parent/content-spec": "*"`. Without the root `package.json` (which declares workspaces), npm tried to resolve content-spec from the npm registry and failed.

## Decisions Made

### Change Railway root to monorepo root (not keep landing/ root with workaround)
- **Chose:** Set rootDirectory to `/` (repo root), use `-w landing` flags for build/start
- **Why:** This is Railway's documented approach for "shared monorepos" — packages that depend on siblings. `npm install` at root resolves all workspaces correctly.
- **Alternatives considered:**
  - `file:../content-spec` protocol in landing/package.json — fragile, breaks the workspace model
  - Publish content-spec to npm — overkill for a private monorepo
  - Dockerfile with multi-stage build — unnecessary complexity

### Update outputFileTracingRoot to monorepo root
- **Chose:** `path.join(__dirname, "..")` instead of `__dirname`
- **Why:** In standalone mode, Next.js traces runtime dependencies. With hoisted node_modules at the monorepo root, the trace needs to start from there to include all dependencies in the standalone output.

## Railway Settings (via GraphQL API)

| Setting | Before | After |
|---------|--------|-------|
| rootDirectory | `/landing` | `/` |
| buildCommand | *(auto-detected)* | `npm run build -w landing` |
| startCommand | *(auto-detected)* | `node landing/.next/standalone/server.js` |

The `-w landing` flag makes npm cd into `landing/` before running the build script, so all relative paths in the build script (`../research/*.json`, `.next/`, `public/`) work unchanged.

## Key Files for Context
- `landing/next.config.ts` — standalone output config, outputFileTracingRoot
- `landing/package.json` — build script with relative paths, workspace dependency on content-spec
- `package.json` (root) — workspace definitions

## Next Steps / Continuation Plan
1. Push to main → Railway auto-deploys
2. Monitor Railway build logs for success
3. Verify deployed site works at production URL
