# Quiz System Architecture

## Overview

Interactive, shareable parenting quizzes. Each quiz is a self-contained JSON file processed by a generic quiz engine. Results are assembled from composable content blocks, not hardcoded templates — meaning a small number of domain-level content pieces cover all scoring combinations.

## Stack

- **Framework**: Next.js 16+ (App Router), React 19
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Animations**: Framer Motion (question transitions)
- **PDF**: html-to-image + jsPDF (client-side capture)
- **Validation**: Zod 4 (schema validation + LLM structured output)
- **LLM Client**: OpenRouter (Claude Opus 4.6 for quiz generation)

## File Structure

```
landing/src/
├── app/quiz/
│   ├── page.tsx                      # Quiz index (lists all quizzes)
│   └── [slug]/
│       ├── page.tsx                  # Quiz page (static generation)
│       └── opengraph-image.tsx       # Dynamic OG image (Satori)
├── components/quiz/
│   ├── quiz-container.tsx            # Main orchestrator (state, navigation, URL sync)
│   ├── quiz-question.tsx             # Single question with animated options
│   ├── quiz-progress.tsx             # Progress bar
│   └── quiz-result.tsx               # Result page (score ring, domains, PDF, share)
└── lib/quiz/
    ├── index.ts                      # Quiz registry (getQuizBySlug, getAllQuizSlugs)
    ├── quiz-engine.ts                # Scoring engine + TypeScript types
    ├── quiz-schema.ts                # Zod schema (validation + structured output)
    ├── quiz-url.ts                   # URL encoding/decoding (compact digit format)
    ├── generate-quiz.ts              # LLM quiz generation function
    └── potty-training-readiness.json # First quiz dataset
```

## Scoring Architecture

### Domains
Each quiz defines N scoring domains (e.g., Physical, Cognitive, Emotional). Every question belongs to exactly one domain.

### Points
- Each option has 0–N points
- Every question must have at least one 0-point option
- Domain `maxPoints` = sum of max option points across that domain's questions

### Levels
Each domain has thresholds: `high` (>= X), `medium` (>= Y), `low` (< Y).

### Content Composition
For 3 domains with 3 levels each = 27 possible combinations. Instead of 27 unique result pages, the system composes results from:
- **3 result templates** (based on total score ranges: ready/almost/not-yet)
- **9 domain-level content blocks** (3 domains × 3 levels)

Each result page shows: the matching result template headline/explanation + each domain's level-specific content (headline, detail, strength/concern).

Strengths are collected from high-level domains; concerns from medium/low-level domains.

## URL Encoding

Compact format for shareability in chat apps (no special characters that break link parsing):

- **Mid-quiz**: `?q=3&a=010` — on question 4, first 3 answered with option indices
- **Complete**: `?a=0101012101` — all 10 answered, showing results

Each digit is the 0-based index of the selected option for that question (in question order).

Browser back/forward supported via `pushState` + `popstate` listener.

## OG Image

Uses Next.js `ImageResponse` (Satori) at `opengraph-image.tsx`. Renders:
- Brand mark + "Steady Parent"
- Quiz title in question form
- Description
- "Take the quiz" CTA button
- Question count + estimated time

Note: OG crawlers don't pass search params through the opengraph-image route, so the image is quiz-specific but not result-specific. Result-specific OG images would require a separate `/api/og` route.

## Quiz Generation (LLM)

`generate-quiz.ts` calls the OpenRouter client with:
- **Model**: `anthropic/claude-opus-4-6`
- **Schema**: `QuizDataSchema` (Zod) passed as structured output
- **Validation**: Response is automatically validated against the Zod schema

The Zod schema includes `.refine()` cross-field checks:
1. `questionCount` matches actual questions array length
2. All questions reference valid domain IDs
3. `domainContent` has entries for every domain
4. Score ranges cover 0 → totalMax with no gaps/overlaps
5. Every question has at least one 0-point option

## Result Page

Visually designed for shareability:
- **Hero section**: SVG score ring, result badge (color-coded), headline, share/PDF/retake buttons
- **Domain breakdown**: Colored progress bars with Strong/Developing/Emerging badges
- **Strengths & Concerns**: Side-by-side cards (green/amber)
- **Next Steps**: Numbered list with themed indicators
- **Good to Know**: Blue info card (context, not warning)
- **Encouragement**: Warm closing message with retake advice

PDF export captures the entire result section at 2x resolution and scales to A4.

## Key Design Decisions

1. **Static generation**: Quiz pages are statically generated at build time via `generateStaticParams()`. No server-side rendering needed.
2. **Client-side scoring**: All computation happens in the browser. No API calls for results.
3. **Composable content**: Small number of content blocks covers exponential combinations.
4. **Compact URLs**: Single-digit indices keep URLs clean and chat-app-friendly.
5. **Schema-first generation**: Zod schema serves triple duty — validation, TypeScript types, and LLM structured output constraints.
