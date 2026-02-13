# Validation System Analysis: Current State vs Desired Architecture

## Executive Summary

The admin mailing page (`/admin/mailing`) currently mixes **spec-level checks** (does the plan file have an entry?) with **production-level checks** (does Kit actually have this tag?) in the same table, with no clear separation. Some form types get production checks that others don't. The "Kit Form" column checks whether a JSON plan file has an entry — it does NOT check whether the form actually works in production. This creates confusion about what the dashboard is actually telling you.

**Desired architecture:** Two cleanly separated validation layers:
1. **Spec validator** — validates that spec files are complete, consistent, and contain all required information
2. **Production validator** — validates that the spec is actually implemented and running in production (Kit tags exist, API routes respond, frontend components are wired, sequences fire)

---

## Part 1: Current Spec Files Inventory

These files live in `content-plan/` (dev) or `mdx-sources/` (prod build). They define the complete content plan.

### Files That Define "What Should Exist"

| File | Entries | What It Contains |
|------|---------|-----------------|
| `article_taxonomy.json` | 245 articles + 20 categories | Master article registry (slug, title, URL, type, category) |
| `quiz_taxonomy.json` | 24 quizzes | Master quiz registry (slug, title, URL, connectsTo categories) |
| `article_link_plan.json` | 245 entries | Per-article internal links + CTA placements |
| `cta_catalog.json` | 65 entries | CTA definitions (community + course), copy, promises, forbidden terms |
| `mailing_form_catalog.json` | 64 entries | All email capture forms: 20 freebies + 20 waitlists + 24 quiz-gates |
| `mailing_tags.json` | 47 tags | Kit tag registry with kitTagId numbers |
| `form_tag_mappings.json` | 64 mappings | Maps formId → tagIds (which tags each form applies) |
| `kit_integration.json` | 1 object | Full Kit integration spec: API routes, custom fields, flows, frontend checks |
| `page_types.json` | 2 types | Article constraints (word count, H2s, CTAs, images, FAQs) |
| `quiz_page_types.json` | 3 types | Quiz constraints (question counts, dimensions, scale points) |
| `quizzes/quiz-definitions.json` | 24 quizzes | Generated quiz content (questions, scales, results, CTAs) |
| `source_to_article_assignment.json` | 20 categories | Source → article mapping (historical, generation phase) |

### Relationships Between Spec Files

```
article_taxonomy.json ←──── article_link_plan.json (URLs must reference valid articles)
        │                          │
        │                          └──── cta_catalog.json (CTA types must match catalog)
        │
        ├──── mailing_form_catalog.json (categories must exist in taxonomy)
        │           │
        │           └──── mailing_tags.json (tag references must resolve)
        │                      │
        │                      └──── form_tag_mappings.json (tagIds must exist in mailing_tags)
        │
quiz_taxonomy.json ←──── quiz_page_types.json (types must match)
        │
        └──── quizzes/quiz-definitions.json (slugs must match taxonomy)
```

---

## Part 2: Current Runtime Code (What Actually Makes Things Work)

Runtime code does NOT read from spec files. It uses hardcoded config in TypeScript.

### The Actual Production Code Path

**File: `landing/src/lib/kit-config.ts`** — This is the ONLY file that maps subscriptions to Kit tags at runtime.

```
kitTags: Record<string, number>    →  101 tag name → Kit ID mappings
freebieConfig: Record<string, string[]>  →  64 slug → tag name arrays
resolveTagIds(slug): number[]      →  slug → Kit tag IDs
```

**Runtime subscription flows:**

| Flow | API Route | Status | Config Key Pattern |
|------|-----------|--------|-------------------|
| Blog freebie | `/api/freebie-subscribe` | NOT IMPLEMENTED (no route, no onSubmit) | `blog/{category}` → `["lead", "freebie-{category}"]` |
| Quiz gate | `/api/quiz-subscribe` | WORKING | `quiz/{slug}` → `["lead", "quiz-{slug}"]` |
| Course waitlist | `/api/waitlist-subscribe` | WORKING | `waitlist/{category}` → `["lead", "waitlist-joined", "waitlist-{category}"]` |

**Key insight:** `kit-config.ts` has entries for all 64 forms. `form_tag_mappings.json` has entries for all 64 forms. These are TWO INDEPENDENT COPIES of the same mapping. Runtime uses `kit-config.ts`. Admin validation uses `form_tag_mappings.json`. They could drift apart and nobody would know.

### Runtime Helper Chain

```
User submits email
  → API route validates input
  → Builds slug: "{type}/{identifier}"
  → Calls subscribeWithTags(email, slug, fields)
    → resolveTagIds(slug) via kit-config.ts → tag IDs
    → createOrUpdateSubscriber(email, fields) → Kit API v4
    → addTagToSubscriber(email, tagId) for each tag → Kit API v4
```

---

## Part 3: Current Validation (What the Admin Page Actually Checks)

### Admin Mailing Route: `/api/admin/mailing/route.ts`

This route does everything in one blob. Here's what it actually checks, traced line by line:

#### A. Spec-level checks (from `validateMailingFormCatalog`)

For EACH of the 64 mailing form entries, the `validateMailingFormCatalog` function (from content-spec) validates:
- Entry has required fields (id, type, name, tags, pageUrlPattern, endpoint)
- `what_it_is` description exists (for freebies/waitlists)
- `cta_copy` exists and passes word count validation (eyebrow, title, body)
- `buttonText` matches expected constant
- Tag IDs in the entry reference valid tags in mailing_tags.json
- `pageUrlPattern` matches known category slugs or quiz slugs

These are PURE SPEC checks — they verify the plan files are complete and consistent. No production calls.

#### B. Freebie-specific checks (route.ts lines 222-264)

For each category, the route:
1. Looks up the freebie entry from `mailing_form_catalog.json`
2. Computes what FreebieCTA would render (eyebrow, title, body from spec)
3. Runs `validateCtaCopy` on those rendered values
4. **Line 253: `kit_form` check** — checks if category exists in `blogMappings` set (built from `form_tag_mappings.json` line 202)

This is a HYBRID: steps 1-3 are spec validation, step 4 is a "plan exists" check (NOT production).

#### C. Quiz-gate patching (route.ts lines 270-300)

For each deployed quiz, patches the entry with `previewCta` from the actual quiz JSON. Then validates copy. This is SPEC validation against generated content.

#### D. Infrastructure checks (route.ts lines 317-397)

These are PRODUCTION checks:

| Check | What It Tests | How |
|-------|--------------|-----|
| `freebieApiRoute` | Does file `/api/freebie-subscribe/route.ts` exist? | `fileExists()` |
| `quizApiRoute` | Does file `/api/quiz-subscribe/route.ts` exist? | `fileExists()` |
| `waitlistApiRoute` | Does file `/api/waitlist-subscribe/route.ts` exist? | `fileExists()` |
| `freebieFrontendReady` | Does FreebieCTA have onSubmit + fetch? | `fileContainsPatterns()` |
| `quizFrontendReady` | Do quiz components have subscribe logic? | `fileContainsPatterns()` |
| `waitlistFrontendReady` | Does CourseHero have fetch + /api/waitlist-subscribe? | `fileContainsPatterns()` |
| `kitCustomFieldReady` | Does `quiz_result_url` exist in Kit? | LIVE Kit API call |
| `kitFreebieTagsReady` | Do all 20 freebie tags exist in Kit? | DB query + compare with mailing_tags.json |
| `kitQuizTagsReady` | Do all quiz tags exist in Kit? | DB query + compare with mailing_tags.json |
| `quizResultsSequenceReady` | Does quiz results sequence exist in Kit? | LIVE Kit API call |
| `freebieSequenceReady` | Does freebie delivery sequence exist in Kit? | LIVE Kit API call |
| `waitlistSequenceReady` | Does waitlist confirmation sequence exist in Kit? | LIVE Kit API call |

These are REAL production checks. They actually verify the system works.

#### E. Per-entry infrastructure patching (route.ts lines 399-465)

After computing infrastructure flags, the route patches them INTO the per-entry validation results:

**Freebie entries get:** `api_route`, `frontend`, `kit_seq` (lines 399-416)
**Waitlist entries get:** `api_route`, `frontend`, `kit_seq` (lines 418-435)
**Quiz-gate entries get:** `api_route`, `frontend`, `kit_field`, `kit_tag`, `kit_seq` (lines 437-464)

Notice: Quiz-gate gets `kit_tag` (per-quiz Kit tag existence check) but **waitlist and freebie do NOT get `kit_tag`**.

### What Each Table Column Actually Tests

#### Blog Freebie Table

| Column | Source | Spec or Prod? |
|--------|--------|--------------|
| Eyebrow | validateCtaCopy on computed values | **SPEC** (validates rendered copy from spec data) |
| Title | validateCtaCopy on computed values | **SPEC** |
| Body | validateCtaCopy on computed values | **SPEC** |
| Name | nameInTitle check | **SPEC** |
| No !/bans | forbidden terms | **SPEC** |
| **Kit Form** | `blogMappings.has(slug)` from form_tag_mappings.json | **SPEC** (plan file entry exists) |
| Live | publishedCount/totalCount | **PROD** (actual deployed articles) |

Per-article drill-down adds:
| Column | Source | Spec or Prod? |
|--------|--------|--------------|
| Kit (same as Kit Form) | `blogMappings.has(catSlug)` | **SPEC** |
| API | infrastructure.freebieApiRoute | **PROD** (file exists on disk) |
| Frontend | infrastructure.freebieFrontendReady | **PROD** (pattern in source file) |
| Kit Seq | infrastructure.freebieSequenceReady | **PROD** (Kit API) |

#### Course Waitlist Table

| Column | Source | Spec or Prod? |
|--------|--------|--------------|
| Desc | what_it_is from catalog | **SPEC** |
| URL | pageUrlPattern from catalog | **SPEC** |
| Tags | tag array from catalog | **SPEC** |
| Copy | cta_copy existence | **SPEC** |
| Button | buttonText check | **SPEC** |
| Eyebrow | word count validation | **SPEC** |
| Title | word count validation | **SPEC** |
| Body | word count validation | **SPEC** |
| No !/bans | forbidden terms | **SPEC** |
| API | infrastructure.waitlistApiRoute | **PROD** |
| Frontend | infrastructure.waitlistFrontendReady | **PROD** |
| Kit Seq | infrastructure.waitlistSequenceReady | **PROD** |
| **Kit Form** | `waitlistMappings.has(slug)` from form_tag_mappings.json | **SPEC** (plan file entry exists) |

**MISSING from waitlist:** `kit_tag` (does the waitlist-{category} tag actually exist in Kit?)

#### Quiz Gate Table

| Column | Source | Spec or Prod? |
|--------|--------|--------------|
| URL | pageUrlPattern from catalog | **SPEC** |
| Tags | tag array from catalog | **SPEC** |
| Copy | from quiz JSON previewCta | **SPEC** (generated content) |
| Button | buttonText check | **SPEC** |
| Eyebrow | word count validation | **SPEC** |
| Title | word count validation | **SPEC** |
| Body | word count validation | **SPEC** |
| No !/bans | forbidden terms | **SPEC** |
| API | infrastructure.quizApiRoute | **PROD** |
| Frontend | infrastructure.quizFrontendReady | **PROD** |
| Kit Field | infrastructure.kitCustomFieldReady | **PROD** (Kit API) |
| **Kit Tag** | `mailing_tags.find(quiz-{slug})` → kitTagId in Kit DB | **PROD** (DB + Kit) |
| Kit Seq | infrastructure.quizResultsSequenceReady | **PROD** (Kit API) |
| **Kit Form** | `quizMappings.has(slug)` from form_tag_mappings.json | **SPEC** (plan file entry exists) |

---

## Part 4: Problems With Current System

### Problem 1: "Kit Form" column checks the wrong thing

The "Kit Form" column (visible on all three tables via `kitMappingSet`) checks whether `form_tag_mappings.json` has a matching entry. This is a SPEC check ("does the plan file have this entry?") displayed alongside PRODUCTION checks.

It does NOT check:
- Whether the tags listed in the mapping actually exist in Kit
- Whether `kit-config.ts` (the runtime code) has the same mapping
- Whether the subscription actually works end-to-end

**What happened:** Waitlist entries were added to `form_tag_mappings.json` to make the green check appear, but this didn't change anything about production. The check was already passing via `kit-config.ts` because the runtime doesn't read `form_tag_mappings.json`.

### Problem 2: Duplicate sources of truth

The tag-to-form mapping exists in TWO places:
1. `form_tag_mappings.json` (spec file, read only by admin validation)
2. `kit-config.ts` → `freebieConfig` (runtime code, read by API routes)

These could go out of sync. Currently:
- `form_tag_mappings.json` has 64 entries (20 blog + 24 quiz + 20 waitlist)
- `kit-config.ts` freebieConfig has 64 entries (same count)
- The tag names should match, but nobody validates this

### Problem 3: `mailing_tags.json` is incomplete

Current state:
- Has: 2 global + 20 freebie + 1 quiz-completed + 24 quiz = **47 tags**
- Missing: `waitlist-joined` + 20 `waitlist-{category}` = **21 waitlist tags**

But these 21 waitlist tags DO exist in Kit (created via API) and in `kit-config.ts`. The spec file just wasn't updated.

This means the `kit_tag` production check (which uses `mailing_tags.json` to look up kitTagId) CANNOT work for waitlist entries — there's nothing to look up.

### Problem 4: Production checks are inconsistent across form types

| Production Check | Freebie | Waitlist | Quiz-gate |
|-----------------|---------|----------|-----------|
| API route exists | yes | yes | yes |
| Frontend wired | yes | yes | yes |
| Kit tag exists per-entry | **NO** | **NO** | **YES** |
| Kit custom field exists | N/A | N/A | yes |
| Kit sequence exists | yes | yes | yes |

Quiz-gate gets per-entry `kit_tag` checks (line 451-455 of route.ts), but freebie and waitlist do not. All three form types have per-entry tags in Kit — the check should be universal.

### Problem 5: `kit_tag` check depends on mailing_tags.json having kitTagId

The quiz-gate `kit_tag` check works like this (route.ts line 451-455):
```
1. Find tag entry in mailing_tags.json where id === `quiz-{slug}`
2. Get its kitTagId
3. Check if that kitTagId exists in the Kit DB (via kitTagIds set from DB rows)
```

For this to work for waitlists/freebies, `mailing_tags.json` needs:
- All 20 `waitlist-{category}` entries with correct kitTagId values
- The 20 `freebie-{category}` entries already exist with kitTagId values

### Problem 6: No validation that kit-config.ts matches spec files

There is no check that:
- Every tag in `mailing_tags.json` has a matching entry in `kit-config.ts` → `kitTags`
- Every mapping in `form_tag_mappings.json` has a matching entry in `kit-config.ts` → `freebieConfig`
- The kitTagId in `mailing_tags.json` matches the number in `kit-config.ts`

This is arguably the MOST important production check: does the runtime config match the spec?

### Problem 7: No end-to-end smoke test

No check actually:
1. Calls the API route with a test payload
2. Verifies the Kit subscriber was created
3. Verifies the correct tags were applied

The closest thing is the `fileExists` and `fileContainsPatterns` checks, which verify the code is there but not that it runs correctly.

---

## Part 5: Desired Architecture — Admin Page Structure

### New Navigation

```
/admin/spec/articles         — Spec validator: Articles
/admin/spec/ctas             — Spec validator: CTAs
/admin/spec/mailing          — Spec validator: Mailing Forms

/admin/production/articles   — Production validator: Articles
/admin/production/ctas       — Production validator: CTAs
/admin/production/mailing    — Production validator: Mailing Forms
```

Each page has its own validator that reads from a different source:
- **Spec pages** read ONLY from spec files (`content-plan/*.json`) — validate completeness and consistency of the plan
- **Production pages** read from production — the actual deployed website, Kit API, DB, source code — and compare against the spec

### Core Principle

Tables on spec and production pages are **structurally similar** (same rows, similar columns). The difference is WHERE the data comes from:

| Aspect | Spec Page | Production Page |
|--------|-----------|-----------------|
| **Data source** | `content-plan/*.json` files only | Live website, Kit API, DB, source files |
| **Question answered** | "Is the plan complete and consistent?" | "Does production match the plan?" |
| **External calls** | NONE — pure file reads | Kit API, DB queries, file system checks |
| **When it fails** | Spec is incomplete — fix the spec files | Production is broken — fix code/Kit/deployment |

---

### 5.1 Spec Validator: Articles (`/admin/spec/articles`)

**Data source:** `article_taxonomy.json`, `article_link_plan.json`, `page_types.json`

**What it validates:** The article plan is complete and internally consistent.

**Table: one row per article (245 rows, grouped by category)**

| Column | Check | Source |
|--------|-------|--------|
| Slug | exists | taxonomy |
| Title | non-empty | taxonomy |
| URL | starts with `/blog/`, matches pattern | taxonomy |
| Type | pillar/series/standalone | taxonomy |
| Category | references valid category | taxonomy cross-ref |
| Link Plan | entry exists in link_plan | link_plan cross-ref |
| Links | count within page_types constraint | link_plan + page_types |
| CTAs | count within page_types constraint (3 expected) | link_plan + page_types |
| CTA Types | has community + course + freebie | link_plan |
| Series Pos | set if type=series, absent if standalone | taxonomy |

**What this does NOT check:**
- Whether the article is actually deployed/published
- Whether the MDX file exists
- Whether CTA components in the MDX match the spec

---

### 5.2 Production Validator: Articles (`/admin/production/articles`)

**Data source:** Deployed MDX files, article DB, `article_taxonomy.json` (as the spec to compare against)

**What it validates:** Every article in the spec is deployed and its content matches the spec.

**Table: one row per article (245 rows, grouped by category)**

| Column | Check | Source |
|--------|-------|--------|
| Slug | — | taxonomy (row identifier) |
| Deployed | MDX file exists + published | blogPosts registry / DB |
| Word Count | within page_types constraint | DB (from sync) |
| H2 Count | within page_types constraint | DB |
| CTA Count | matches spec (3) | DB |
| Image Count | within page_types constraint | DB |
| FAQ Count | within page_types constraint | DB |
| Internal Links | >= minInternalLinks from page_types | DB |
| Has TL;DR | required by page_types | DB |
| Has FAQ | required by page_types | DB |

**Key difference from spec:** Spec says "the plan says 3 CTAs." Production says "the deployed article actually has 3 CTAs." Same column label, different data source.

---

### 5.3 Spec Validator: CTAs (`/admin/spec/ctas`)

**Data source:** `cta_catalog.json`, `article_taxonomy.json`, `quiz_taxonomy.json`

**What it validates:** The CTA catalog is complete, every entry has valid copy, and coverage is complete.

**Table: one row per CTA entry (65 rows)**

| Column | Check | Source |
|--------|-------|--------|
| ID | exists, valid slug format | catalog |
| Type | community / course | catalog |
| Name | non-empty | catalog |
| URL | exists | catalog |
| What It Is | description present (for course) | catalog |
| Eyebrow | exists, within word count | catalog cta_copy |
| Title | exists, within word count | catalog cta_copy |
| Body | exists, within word count | catalog cta_copy |
| Button | matches expected constant | catalog cta_copy |
| No !/bans | no exclamation marks, no forbidden terms | catalog cta_copy |
| Founder | founder_presence present (for community) | catalog |
| Can Promise | array present | catalog |
| Can't Promise | array present | catalog |

**Coverage checks (summary/banner):**
- Every category has a community CTA entry
- Every category has a course CTA entry
- Every quiz has a community CTA entry
- Global community CTA exists

---

### 5.4 Production Validator: CTAs (`/admin/production/ctas`)

**Data source:** Deployed MDX articles (CTA component props), `cta_catalog.json` (as the spec to compare against)

**What it validates:** Every CTA in the spec is actually rendered in published articles with correct props.

**Table: one row per CTA entry (65 rows), expandable to per-article drill-down**

| Column | Check | Source |
|--------|-------|--------|
| ID | — | catalog (row identifier) |
| Spec Valid | spec validator passes for this entry | spec validator result |
| Deployed | at least one article renders this CTA | MDX extraction |
| Href Match | href in MDX component matches catalog URL | MDX props vs catalog |
| Eyebrow Match | rendered eyebrow matches spec | MDX props vs catalog |
| Title Match | rendered title matches spec | MDX props vs catalog |
| Body Match | rendered body matches spec | MDX props vs catalog |
| Button Match | rendered buttonText matches spec | MDX props vs catalog |
| Founder Line | founder line present (community CTAs) | MDX props |

**Per-article drill-down (when expanded):** For each published article in the CTA's category, show whether the CTA component is present and whether its props match the spec.

**Key difference from spec:** Spec validates the catalog entry is well-formed. Production validates the actual MDX components rendered on the page match what the catalog says.

---

### 5.5 Spec Validator: Mailing Forms (`/admin/spec/mailing`)

_To be defined in detail later._

**Data source:** `mailing_form_catalog.json`, `mailing_tags.json`, `form_tag_mappings.json`, `kit_integration.json`

**What it validates:** The mailing form spec is complete — every form has tags, copy, endpoints defined. All cross-references resolve.

**Three sub-tables:** Freebies (20), Waitlists (20), Quiz Gates (24)

### 5.6 Production Validator: Mailing Forms (`/admin/production/mailing`)

_To be defined in detail later._

**Data source:** Kit API, DB, source code, deployed components

**What it validates:** Every mailing form in the spec is actually wired end-to-end — API route exists, frontend has submit handler, Kit tags exist, Kit sequences exist, runtime config matches spec.

**Three sub-tables:** Freebies (20), Waitlists (20), Quiz Gates (24)

---

## Part 6: What the Current Admin Pages Become

### Mapping current → new

| Current Page | What Happens |
|-------------|-------------|
| `/admin/spec` (spec browser) | Split into `/admin/spec/articles`, `/admin/spec/ctas`, `/admin/spec/mailing` — adds validation columns to what was read-only |
| `/admin/ctas` (CTA validation) | Becomes `/admin/production/ctas` — it already validates deployed MDX |
| `/admin/mailing` (mailing forms) | Split — spec checks → `/admin/spec/mailing`, production checks → `/admin/production/mailing` |
| `/admin/articles` (article inventory) | Becomes `/admin/production/articles` — it shows DB data |
| `/admin/plan` (plan vs reality) | Absorbed — spec articles + production articles replace this |
| `/admin/quizzes` | Stays separate (quiz content validation is its own domain) |
| `/admin/links` | Stays separate (graph visualization) |

### Current pages that already lean one way

- **`/admin/spec`** — already purely spec (read-only browser of plan files). Just needs validation columns added.
- **`/admin/ctas`** — already mostly production (extracts CTA props from deployed MDX). Just needs clean split from spec concerns.
- **`/admin/articles`** — already purely production (reads from DB). Needs spec comparison columns.
- **`/admin/mailing`** — the messiest. Mixes spec and production in every table. Needs full split.

---

## Part 7: Open Questions — What Else Needs Defining

### 7.1 Existing validator code reuse

Most validators already exist but are called from the wrong places:

- **`validateMailingFormCatalog()`** — pure spec validator. Should only be called from spec mailing page, not production.
- **`validateCtaCopy()`** — called for both spec (catalog copy) and production (MDX props). Shared utility, but the DATA SOURCE differs.
- **`validateKitIntegration()`** — currently mixes spec checks (file cross-references) with production checks (Kit API calls, file existence). Needs to be split into two functions.
- **`validateCrossLinks()`** — pure spec. Already correctly placed.

### 7.2 API route structure

New routes mirror the pages:

```
/api/admin/spec/articles
/api/admin/spec/ctas
/api/admin/spec/mailing
/api/admin/production/articles
/api/admin/production/ctas
/api/admin/production/mailing
```

Spec routes: read JSON files, run validators, return results. No external calls.
Production routes: read spec as baseline, then check production state against it.

### 7.3 Shared table component

Since spec and production tables will be structurally similar (same rows, similar columns), there should be a shared table component that accepts:
- Row data (articles/CTAs/mailing forms)
- Column definitions (which checks to show)
- Check results per cell (ok/fail/detail)

This is basically what `CheckTable` in the current mailing page already does. Generalize it.

### 7.4 Production articles data source

The production articles page needs deployed article stats (word count, CTA count, H2 count, etc.). Currently this data lives in the Postgres DB, populated by the sync process.
- Is the sync data fresh enough? (It runs on-demand.)
- Should the production page trigger a sync if data is stale?
- Or should it read directly from MDX files at request time?

### 7.5 Dual source of truth resolution

When spec says tag X has kitTagId 12345 and `kit-config.ts` says tag X has ID 67890, which is wrong?

| Source | Used By | Contains |
|--------|---------|----------|
| `kit-config.ts` → kitTags | Runtime API routes | tag name → Kit tag ID |
| `kit-config.ts` → freebieConfig | Runtime API routes | form slug → tag names |
| `mailing_tags.json` | Spec / admin validation | tag id → Kit tag ID |
| `form_tag_mappings.json` | Spec / admin validation | form id → tag ids |

**Options:**
1. **Spec is authoritative** — generate `kit-config.ts` from spec files at build time (cleanest, requires build step)
2. **Code is authoritative** — generate spec files from `kit-config.ts` (avoids manual spec edits)
3. **Validate consistency** — keep both, production validator flags mismatches (fastest to implement)

### 7.6 Spec article validation — what's new vs what exists

The current spec browser (`/admin/spec`) shows taxonomy data read-only but doesn't run per-article validation. Adding columns like "Link Plan exists" and "CTA count within constraints" requires new cross-file validation logic in content-spec. Some of this exists in `validateCrossLinks()` but needs to be surfaced per-article rather than as a summary.

### 7.7 Progressive rollout

We don't need to build all 6 pages at once. Suggested order:

1. **Spec CTAs + Production CTAs** — existing `/admin/ctas` is already close to production, just needs clean split
2. **Spec Articles + Production Articles** — existing `/admin/articles` + `/admin/plan` already have most data
3. **Spec Mailing + Production Mailing** — the messiest, do last
