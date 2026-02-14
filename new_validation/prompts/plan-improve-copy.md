# Plan: Improve CTA and Mailing Form Copy Prompts

## Problem

The generated CTA and mailing form copy is emotionally flat. It states facts ("holding boundaries without yelling", "audio lessons and illustrated guides") instead of connecting to the reader's lived experience. The copy tells the reader what the product IS, not why THEY need it.

### Specific issues by entry type

**Blog category community CTAs** (`community-{slug}` in `cta_catalog.json`)
- Eyebrows are generic labels ("Real parents, real limits") — not hooks that speak to the reader's moment
- Titles state obvious facts ("Holding boundaries without yelling is a team effort") — not recognizable situations the reader is IN
- Bodies describe the group ("A private group where parents share...") instead of showing why THIS parent, reading THIS category, would want to join RIGHT NOW
- The reader reaction is "so what?" instead of "that's me"

**Course CTAs** (`course-{slug}` in `cta_catalog.json`)
- Body text LEADS with format ("Audio lessons and illustrated guides") instead of VALUE
- Eyebrows state the problem abstractly ("Worry is taking over", "Emotions are overwhelming") instead of placing the reader in a recognizable moment
- Title is always "Start the [Course Name] course" — mechanical, not compelling
- The format description (written guides + illustrations narrated as audio lessons) should come at the END, after the value proposition

**Quiz community CTAs** (`community-quiz-{slug}` in `cta_catalog.json`)
- Most are direct copies from article category CTAs (e.g. calm-down-toolkit and emotional-intelligence both have identical big-feelings copy)
- They're not quiz-specific at all — after taking a quiz about parenting style, the CTA should speak to that quiz's insight, not generic "hard emotional moments"
- Need to answer: "You just learned something about yourself. Here's where parents like you talk about it."

**Course waitlist mailing forms** (`waitlist-{slug}` in `mailing_form_catalog.json`)
- Same problem as course CTAs: body leads with format, not value
- Eyebrow/title don't create urgency or desire specific to the course topic

**Blog freebie mailing forms** (`freebie-{slug}` in `mailing_form_catalog.json`)
- These are actually decent — they describe specific printables with clear use cases
- Keep the content requirements (printable type, what it does) but improve the emotional hook
- The body should still describe the printable but frame it around the reader's situation

**Quiz email gate mailing forms** (`quiz-gate-{slug}` in `mailing_form_catalog.json`)
- Copy does NOT live in `mailing_form_catalog.json` — it lives in the quiz JSON files (`landing/src/lib/quiz/*.json` → `meta.previewCta`)
- The existing previewCta copy is already good (quiz-specific, describes exact value of full results)
- No prompt changes needed here, but the admin page should display this copy

---

## What good copy looks like

### Community CTA — discipline (before)
```
eyebrow: "Real parents, real limits"
title: "Holding boundaries without yelling is a team effort"
body: "A private group where parents share what works when limits get tested every single day. We are there with you daily too."
```

### Community CTA — discipline (the FEEL we want)
```
eyebrow: "When they push back again"
title: "Other parents are figuring out the same limit right now"
body: "The moment you wonder if you're being too strict or too soft, there's a group already talking about it. We are there with you daily too."
```

The difference: "before" describes the group. "After" places the reader in the moment ("when they push back") and tells them what they'll find there (people figuring out the same thing RIGHT NOW).

### Course CTA — anxiety (before)
```
eyebrow: "Worry is taking over"
title: "Start the Childhood Anxiety course"
body: "Audio lessons and illustrated guides that help your child face worry and fear instead of being ruled by them."
```

### Course CTA — anxiety (the FEEL we want)
```
eyebrow: "When worry won't let go"
title: "Help your child talk back to the worry voice"
body: "Learn what makes anxious kids avoid, freeze, or spiral — and what to say in each moment. Written and illustrated guides narrated as audio lessons."
```

The difference: format info ("audio lessons and illustrated guides") moves to the END. Value comes first. The title names a specific outcome the parent wants. The eyebrow places them in the recognizable moment.

---

## Prompt change strategy

### Keep (from existing prompts)
- Output schema (TypeScript types, JSON structure)
- Structural constraints (word counts, fixed buttonText, mandatory founder line)
- Forbidden terms list
- "No exclamation marks" rule
- The `{{CATEGORIES_WITH_COURSES}}` injection pattern

### Change (in all prompts)

1. **Tone section**: Replace "Warm, direct, peer-to-peer" with Steady Parent voice rules:
   - Self-deprecating, wry, rational — not warm mommy-blogger energy
   - Direct — respect the reader's time
   - No platitudes ("you're not alone", "it's hard", "you've got this")

2. **Eyebrow instruction**: Change from "a soft hook" to "a recognizable parenting moment — 'When they...', 'That moment when...', 'After the third time tonight...' — place the reader in the situation"

3. **Title instruction**: Change from "speaks to this category's pain point" to "name a specific outcome the reader wants, or a recognizable emotion they're feeling RIGHT NOW — not an abstract statement about the topic"

4. **Body instruction**: Change from "describes the group/course" to "show why THIS person, in THIS moment, needs this. VALUE first (what they'll get, what changes), format/logistics LAST"

5. **Anti-pattern examples**: Add explicit "NOT THIS / THIS" examples showing the flat-to-emotional transformation (like the discipline and anxiety examples above)

6. **Course body specifically**: Add rule "format description (written guides + illustrations narrated as audio lessons) goes in the LAST clause of the body, never the first"

---

## Files to update

### Prompt templates (update)

| File | What to change |
|------|---------------|
| `research/community_cta_prompt.md` | Tone, eyebrow/title/body instructions, add anti-pattern examples. Used for blog category community CTAs (20 entries). |
| `research/waitlist_cta_prompt.md` | Same tone changes + "format at end" rule for body. Used for course waitlist mailing forms (20 entries). Note: this currently generates CTA catalog entries (type "waitlist") but now needs to target `mailing_form_catalog.json` entries. |

### New prompt templates (create)

| File | Purpose |
|------|---------|
| `research/course_cta_prompt.md` | Blog category course CTAs (20 entries in `cta_catalog.json`). Doesn't exist yet — course copy was hand-generated in a prior session. Needs "format at end" rule. |
| `research/quiz_community_cta_prompt.md` | Quiz community CTAs (24 entries in `cta_catalog.json`). Doesn't exist yet — entries were cloned from article categories. Must receive quiz taxonomy with quiz titles/descriptions. |
| `research/freebie_mailing_form_prompt.md` | Blog freebie mailing forms (20 entries in `mailing_form_catalog.json`). Doesn't exist yet — freebie copy was hand-generated. Keep content requirements (printable types), improve emotional hooks. |

### How-to docs (update)

| File | What to change |
|------|---------------|
| `research/how-to-generate-community-ctas.md` | Update file paths (was `research/cta_catalog.json`, now `content-plan/cta_catalog.json`). |
| `research/how-to-generate-waitlist-ctas.md` | Update file paths + target file (now `content-plan/mailing_form_catalog.json`). |

### New how-to docs (create)

| File | Purpose |
|------|---------|
| `research/how-to-generate-course-ctas.md` | Steps for generating 20 course CTA entries |
| `research/how-to-generate-quiz-community-ctas.md` | Steps for generating 24 quiz community CTA entries |
| `research/how-to-generate-freebie-mailing-forms.md` | Steps for generating 20 freebie mailing form entries |

---

## Execution order

1. Update `research/community_cta_prompt.md` — new tone, instructions, anti-patterns
2. Create `research/course_cta_prompt.md` — based on community prompt pattern, with "format at end" rule
3. Create `research/quiz_community_cta_prompt.md` — receives quiz taxonomy, quiz-specific copy
4. Update `research/waitlist_cta_prompt.md` — align with new tone, target mailing_form_catalog
5. Create `research/freebie_mailing_form_prompt.md` — keep printable requirements, new emotional hooks
6. Update/create how-to docs (5 files)
7. Generate all entries via background agents (5 agent runs):
   - 20 blog community CTAs → merge into `content-plan/cta_catalog.json`
   - 20 course CTAs → merge into `content-plan/cta_catalog.json`
   - 24 quiz community CTAs → merge into `content-plan/cta_catalog.json`
   - 20 waitlist mailing forms → merge into `content-plan/mailing_form_catalog.json`
   - 20 freebie mailing forms → merge into `content-plan/mailing_form_catalog.json`
8. Run `npx tsx content-spec/src/validate-plans.ts` — all pass
9. Check admin `/admin/ctas` and `/admin/mailing` — all green

## Quiz email gate copy — NO regeneration needed

Quiz gate `previewCta` copy lives in `landing/src/lib/quiz/*.json` (24 files). This copy is already good — it's quiz-specific and describes the exact value of full results. No prompt changes needed.

However, the admin mailing page should display this copy in the quiz gate table. See admin page fix below.

---

## Admin page fix: show quiz gate copy

The mailing validation page (`/admin/mailing`) shows quiz gate forms but currently has no "Copy" column showing the actual previewCta content. The copy lives in the quiz JSON files, not in `mailing_form_catalog.json`.

**Approach**: The mailing API route (`/api/admin/mailing`) should load quiz JSON files and return `previewCta` data alongside the quiz-gate entries. The mailing page then renders a Copy column for quiz gates showing the previewCta content (eyebrow, title, body, buttonText) — same display pattern as freebie and waitlist forms.
