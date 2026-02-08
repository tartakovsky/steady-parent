# Admin Dashboard: Full System Reference & CTA Metadata Expansion

**Date:** 2026-02-08 19:18
**Scope:** Complete admin dashboard system, sync engine, DB schema, all admin pages, CTA metadata expansion, Kit integration metadata display

## Summary
Built a complete admin dashboard at `/admin` backed by Railway Postgres + Drizzle ORM. A sync engine parses real MDX files from disk, validates them against the link plan, queries Kit API for tag state, and writes everything to the database. Admin pages show articles, validation status, Kit tags, plan-vs-reality coverage, and a ReactFlow link graph. Subsequently expanded CTA metadata capture to include ALL props (eyebrow, buttonText) and wired Kit integration metadata display into the article detail page.

## Context & Problem
The article generation pipeline produces MDX files, registers them in `posts.ts`, and links them via `article_link_plan.json`. But any agent can modify any file, and there's no way to verify what's actually deployed without manually checking. The user explicitly rejected a plan-file-based approach: "The files are corrupted most of the time. Any agent could go through any file... I'm talking about an actual real-time monitoring."

Additionally, CTA components in articles carry rich metadata (eyebrow text, button text, body copy) that represents editorial promises to users. These promises must be visible in the admin dashboard for content QA, and for FreebieCTA specifically, the admin needs to see what Kit tags would be assigned and what canonical freebie name is expected for the category.

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

### 6. CTA metadata capture: all props, not just title/body/href
- **Chose:** Capture eyebrow and buttonText alongside title/body/href for all CTA components
- **Why:** The user needs to see what each CTA promises editorially. Eyebrow sets context ("When scripts aren't enough"), buttonText shows the action ("Get the toolkit"). Without these, content QA is blind to what the CTA actually says.
- **Note:** The MDX parser's PROP_RE regex already extracted ALL props from CTA components but extractCtaComponents() was only saving title/body/href. Fix was to also save eyebrow and buttonText.

### 7. Kit integration metadata display for FreebieCTA
- **Chose:** Show freebie slug, Kit tag names, Kit tag IDs, and canonical freebie name (from category_ctas.json) directly on the article detail page
- **Why:** FreebieCTA has no href prop — it submits to `/api/subscribe` which resolves category → freebie slug → Kit tags. Admin needs to see this chain to verify the right freebie will be offered on each article.
- **Data flow:** Article category slug → `blog/{category}` freebie slug → freebieConfig lookup → tag names array → kitTags lookup → Kit tag IDs. Plus category_ctas.json gives the canonical freebie name that should match the CTA title.

## Architectural Notes

### Database Schema (4 tables)
- `syncs` — audit log of sync runs with aggregate counts
- `articles` — parsed MDX data: metadata, word count, links, CTAs (JSONB with type/eyebrow/title/body/buttonText/href), validation errors/warnings (JSONB)
- `kit_tags` — live Kit state with subscriber counts, mapped to config names
- `link_plan_entries` — 245 planned articles, deployment status

### Sync Flow
POST /api/admin/sync → create sync record → read MDX files → parse each → validate against link plan → check posts.ts registration → upsert articles → load link plan entries → query Kit API for tags → update sync record

### Build Script Extension
The standalone build copies MDX files + JSON configs so the sync engine can run in production:
```
mkdir -p .next/standalone/mdx-sources && cp src/content/blog/posts/*.mdx .next/standalone/mdx-sources/ && cp ../research/article_link_plan.json .next/standalone/mdx-sources/ && cp ../research/category_ctas.json .next/standalone/mdx-sources/
```

### CTA Component Prop Systems
Three CTA types exist in the codebase:
- **CourseCTA** (`src/components/blog/course-cta.tsx`): eyebrow, title, body, buttonText, href, fullWidth, variant
- **CommunityCTA** (`src/components/blog/community-cta.tsx`): eyebrow, title, body, buttonText, href, fullWidth, variant
- **FreebieCTA** (`src/components/blog/freebie-cta.tsx`): eyebrow, title, body, inputPlaceholder, buttonText, fullWidth, variant — **NO href** (submits to /api/subscribe)

### Kit Integration Chain for FreebieCTA
```
Article at /blog/tantrums/handle-tantrum-scripts
  → freebieSlugFromPathname() → "blog/tantrums"
  → freebieConfig["blog/tantrums"] → ["lead", "freebie-tantrums"]
  → kitTags["lead"] → 14523789, kitTags["freebie-tantrums"] → 15744933
  → Kit API: tag subscriber with IDs [14523789, 15744933]
```
Category CTA canonical names from category_ctas.json:
```
tantrums.freebie_name = "The 3-Step Tantrum Script Cheat Sheet"
```
Validator checks that FreebieCTA title matches this canonical name.

### Admin Pages
- `/admin` — Dashboard: stats cards (deployed/245, registered, errors, warnings), sync button, last sync info
- `/admin/articles` — TanStack Table: status badge, title (link), category, word count, CTAs, links, images, FAQ Qs, registered
- `/admin/articles/[slug]` — Full detail: metadata, stats grid, validation errors/warnings, links table, CTA components with ALL props + Kit metadata, image descriptions
- `/admin/kit` — Kit tag table: name, Kit ID, config key, subscriber count, mapped/orphaned status
- `/admin/plan` — 245-row plan vs reality: category summary grid, all/deployed/pending filters, link to article detail
- `/admin/links` — ReactFlow graph: nodes = articles colored by category, edges = internal links, click → article detail

### TypeScript Strictness Issues Encountered
- ES2017 target: no /s regex flag → use [\s\S] instead
- `noUncheckedIndexedAccess`: regex match groups can be undefined → null checks everywhere
- `noPropertyAccessFromIndexSignature`: process.env.X → process.env["X"], props.title → props["title"]
- `exactOptionalPropertyTypes`: can't assign `string | undefined` to optional property → conditionally build objects
- `.next/types` cache: stale after route restructure → delete .next/types and .next/dev/types

## Information Sources
- `research/validate_article.py` — all regex patterns ported to TypeScript
- `research/article_link_plan.json` — 245 entries, schema for links/CTAs
- `research/category_ctas.json` — canonical CTA names per category (course + freebie)
- `landing/src/lib/kit-config.ts` — Kit tag IDs, freebie slug mapping, helpers
- `landing/src/components/blog/course-cta.tsx` — CourseCTA props interface
- `landing/src/components/blog/community-cta.tsx` — CommunityCTA props interface
- `landing/src/components/blog/freebie-cta.tsx` — FreebieCTA props interface (no href)
- `.worklogs/2026-02-08-181120-convertkit-integration-plan.md` — Kit integration plan, tag config
- `.worklogs/2026-02-08-171844-full-session-canonical-ctas-pipeline.md` — Earlier pipeline session
- Kit API v4: `GET /v4/tags` with pagination for tag sync
- Railway CLI: `railway add --database postgres`, `railway variable set`

## Open Questions / Future Considerations
- **Auth on admin routes**: Currently no authentication — anyone can access `/admin`. Need to add auth before production.
- **Incremental sync**: Full delete-and-reinsert works fine but won't scale if we need sync history diff.
- **FreebieCTA wiring**: `/api/subscribe` route not yet created. FreebieCTA form currently does nothing.
- **MDX source access on Railway**: Build script copies files, so articles deployed without rebuild won't be synced. Acceptable since deploy = rebuild.
- **category_ctas.json in admin**: Currently the article detail page resolves Kit metadata client-side using hardcoded config imports. If category_ctas.json changes, the admin page needs redeployment. Could move to API endpoint for dynamic loading.

## Key Files for Context

### Database & Infrastructure
- `landing/src/lib/db/schema.ts` — Drizzle schema (4 tables: syncs, articles, kitTags, linkPlanEntries)
- `landing/src/lib/db/index.ts` — Drizzle client singleton
- `landing/drizzle.config.ts` — Drizzle Kit config
- `landing/next.config.ts` — serverExternalPackages: ['postgres']

### Sync Engine
- `landing/src/lib/admin/mdx-parser.ts` — MDX regex extraction (TypeScript port from validate_article.py)
- `landing/src/lib/admin/article-validator.ts` — validation checks (TypeScript port)
- `landing/src/lib/admin/sync-orchestrator.ts` — reads MDX files + validates + writes DB + queries Kit API
- `landing/src/lib/admin/types.ts` — shared types (ParsedArticle, ParsedMetadata, etc.)

### Admin Routes
- `landing/src/app/api/admin/sync/route.ts` — sync trigger endpoint (POST triggers, GET returns latest)
- `landing/src/app/api/admin/articles/route.ts` — GET all articles
- `landing/src/app/api/admin/kit/route.ts` — GET all Kit tags
- `landing/src/app/api/admin/plan/route.ts` — GET all link plan entries

### Admin Pages
- `landing/src/app/admin/layout.tsx` — admin sidebar layout
- `landing/src/app/admin/page.tsx` — dashboard (stats cards, sync button)
- `landing/src/app/admin/articles/page.tsx` — articles data table
- `landing/src/app/admin/articles/[slug]/page.tsx` — article detail with CTA metadata + Kit integration
- `landing/src/app/admin/kit/page.tsx` — Kit tags table
- `landing/src/app/admin/plan/page.tsx` — plan vs reality comparison
- `landing/src/app/admin/links/page.tsx` — ReactFlow link graph

### Admin Components
- `landing/src/components/admin/admin-sidebar.tsx` — navigation sidebar
- `landing/src/components/admin/sync-button.tsx` — sync trigger button
- `landing/src/components/admin/stats-card.tsx` — stats card component
- `landing/src/components/admin/validation-badge.tsx` — pass/warn/fail badge

### CTA & Kit Integration
- `landing/src/lib/kit-config.ts` — Kit tag IDs, freebie slug mapping, helpers
- `research/category_ctas.json` — canonical course/freebie names per category
- `landing/src/components/blog/course-cta.tsx` — CourseCTA component
- `landing/src/components/blog/community-cta.tsx` — CommunityCTA component
- `landing/src/components/blog/freebie-cta.tsx` — FreebieCTA component (no href)

### Prior Worklogs
- `.worklogs/2026-02-08-190258-admin-dashboard-with-sync.md` — First admin dashboard worklog
- `.worklogs/2026-02-08-181120-convertkit-integration-plan.md` — Kit integration plan
- `.worklogs/2026-02-08-171844-full-session-canonical-ctas-pipeline.md` — Pipeline session

## Next Steps / Continuation Plan

1. **Wire FreebieCTA component** — Create `/api/subscribe` route that accepts email + pathname, resolves freebie slug → Kit tags, creates subscriber via Kit API. Update FreebieCTA component with `usePathname()` + fetch.
2. **Add admin auth** — Protect `/admin/*` routes with basic token check or session-based auth.
3. **Deploy to Railway** — DATABASE_URL reference var already set on landing service. Push code, verify sync works in production.
4. **Batch article generation** — Only 4/245 articles generated. Run batch generation across all 20 categories.
5. **ConvertKit automations** — Set up "when tagged with freebie-X → send email" flows in Kit dashboard.
