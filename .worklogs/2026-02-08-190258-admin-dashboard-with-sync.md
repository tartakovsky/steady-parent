# Admin Dashboard: Real-Time Site Monitoring with Sync Engine

**Date:** 2026-02-08 19:02
**Scope:** Database schema, sync engine, admin UI, route restructuring, Kit API integration

## Summary
Built a complete admin dashboard at `/admin` backed by Railway Postgres. A sync engine parses real MDX files, validates them against the link plan, queries Kit API for tag state, and writes everything to the database. Admin pages show articles, validation status, Kit tags, plan-vs-reality coverage, and a ReactFlow link graph.

## Context & Problem
The article generation pipeline produces MDX files, registers them in `posts.ts`, and links them via `article_link_plan.json`. But any agent can modify any file, and there's no way to verify what's actually deployed without manually checking. The user explicitly rejected a plan-file-based approach: "The files are corrupted most of the time. Any agent could go through any file... I'm talking about an actual real-time monitoring."

## Decisions Made

### 1. Postgres on Railway (not SQLite)
- **Chose:** Railway managed Postgres + Drizzle ORM
- **Why:** Railway's filesystem is ephemeral (standalone mode), so SQLite would be lost on every deploy. Postgres is a first-class Railway service with persistent storage.
- **Alternatives:** SQLite (rejected — ephemeral filesystem), Turso/PlanetScale (rejected — unnecessary external service when Railway provides Postgres natively)

### 2. Drizzle ORM (not Prisma)
- **Chose:** Drizzle with postgres.js driver
- **Why:** Lighter weight, TypeScript-native, no code generation step, direct SQL when needed
- **Config:** `serverExternalPackages: ['postgres']` in next.config.ts to prevent webpack bundling

### 3. Route groups for admin vs public
- **Chose:** `(public)/` route group for existing pages, `admin/` for dashboard
- **Why:** Admin needs a different layout (sidebar, no navbar/footer). Route groups keep URLs unchanged for public pages.
- **Structure:** Root layout → minimal html/body. Public layout → Navbar + Footer. Admin layout → sidebar + content.

### 4. Sync engine architecture
- **Chose:** Single POST endpoint triggers full re-sync (delete-and-reinsert)
- **Why:** Simpler than incremental sync, articles table is small (~245 rows max), runs in seconds
- **Dev vs prod:** MDX sources at `src/content/blog/posts/` in dev, `mdx-sources/` in production (build script copies them)

### 5. TypeScript port of Python validator
- **Chose:** Ported regex patterns from `validate_article.py` to TypeScript
- **Why:** Sync engine needs to run in Node.js, not call Python. Same patterns ensure consistency.
- **Patterns:** ES2017-compatible (no /s flag — used [\s\S] instead), strict null checks throughout

## Architectural Notes

### Database Schema (4 tables)
- `syncs` — audit log of sync runs with aggregate counts
- `articles` — parsed MDX data: metadata, word count, links, CTAs, validation errors/warnings (JSONB)
- `kit_tags` — live Kit state with subscriber counts, mapped to config names
- `link_plan_entries` — 245 planned articles, deployment status

### Sync Flow
POST /api/admin/sync → create sync record → read MDX files → parse each → validate against link plan → check posts.ts registration → upsert articles → load link plan entries → query Kit API for tags → update sync record

### Build Script Extension
```
mkdir -p .next/standalone/mdx-sources && cp src/content/blog/posts/*.mdx .next/standalone/mdx-sources/ && cp ../research/article_link_plan.json .next/standalone/mdx-sources/ && cp ../research/category_ctas.json .next/standalone/mdx-sources/
```

### Admin Pages
- `/admin` — Dashboard with stats cards, sync button, last sync info
- `/admin/articles` — TanStack Table with sorting/filtering, links to detail
- `/admin/articles/[slug]` — Full article detail: metadata, validation, links, CTAs, images
- `/admin/kit` — Kit tag table with config mapping status, subscriber counts
- `/admin/plan` — 245-row plan vs reality table with category coverage summary
- `/admin/links` — ReactFlow graph, nodes colored by category, click to navigate

## Information Sources
- `research/validate_article.py` — all regex patterns ported to TypeScript
- `research/article_link_plan.json` — 245 entries, schema for links/ctas
- `.worklogs/2026-02-08-181120-convertkit-integration-plan.md` — Kit integration plan, tag config
- Kit API v4: `GET /v4/tags` with pagination for tag sync
- Railway CLI: `railway add --database postgres`, `railway variable set`

## Open Questions / Future Considerations
- **Auth on admin routes**: Currently no authentication — anyone can access `/admin`. Need to add auth before production.
- **Incremental sync**: Full delete-and-reinsert works fine for now but won't scale if we need sync history diff.
- **MDX source access on Railway**: Build script copies MDX files, but this means articles deployed without rebuild won't be synced. Acceptable since deploy = rebuild.

## Key Files for Context
- `landing/src/lib/db/schema.ts` — Drizzle schema (4 tables)
- `landing/src/lib/db/index.ts` — Drizzle client singleton
- `landing/drizzle.config.ts` — Drizzle Kit config
- `landing/src/lib/admin/mdx-parser.ts` — MDX regex extraction (TypeScript port)
- `landing/src/lib/admin/article-validator.ts` — validation checks (TypeScript port)
- `landing/src/lib/admin/sync-orchestrator.ts` — reads files + validates + writes DB
- `landing/src/lib/admin/types.ts` — shared types
- `landing/src/app/api/admin/sync/route.ts` — sync trigger endpoint
- `landing/src/app/admin/layout.tsx` — admin sidebar layout
- `landing/src/components/admin/admin-sidebar.tsx` — navigation sidebar
- `landing/src/lib/kit-config.ts` — Kit tag config (from previous session)
- `.worklogs/2026-02-08-181120-convertkit-integration-plan.md` — Kit integration plan

## Next Steps / Continuation Plan
1. **Add admin auth** — protect `/admin/*` routes (basic token check or session-based)
2. **Wire up FreebieCTA component** — create `/api/subscribe` route, update FreebieCTA with `usePathname()` + fetch
3. **Deploy to Railway** — add `DATABASE_URL` reference var to landing service (already done), push code
4. **Generate more articles** — batch generation across all 20 categories
5. **ConvertKit automations** — set up "when tagged with freebie-X → send email" in Kit dashboard
