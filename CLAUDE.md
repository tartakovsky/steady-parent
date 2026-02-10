# Steady Parent (Monorepo)

## Critical Operational Standards
**1. Deep Analysis Over Speed:** Never skimp on reading context. When asked for a plan or schema, read the **entire** relevant source file first. Do not rely on memory or "gist."
**2. Anti-Sycophancy:** Do not just agree with the user to move the conversation forward. If the user points out an error, fix it thoroughly. If the user is mistaken, explain why with evidence. Stop being a "yes man."
**3. Comprehensive Output:** For architectural or structural tasks, provide the **complete, detailed solution**. Do not offer "half-assed" summaries. If a file has 10 requirements, the output must cover 10 requirements.
**4. Verification:** Before outputting a schema or plan, cross-reference it against the source text line-by-line to ensure nothing was missed (e.g., Author fields, specific constraints).

## Project Overview
Steady Parent is a parenting resources platform designed to provide evidence-based strategies (focused on tantrum resets, emotional regulation, and secure attachment) for parents. The project transitioned from a single Next.js landing page into a monorepo to support multiple services and content research.

## Repository Structure
This is a monorepo using NPM workspaces.

```text
.
├── landing/              # Next.js Application (The primary frontend)
│   ├── src/              # App router, components, and local lib
│   ├── public/           # Static assets (Hero, testimonials, etc.)
│   └── next.config.ts    # Standalone build configuration
├── content-spec/         # Shared package: schemas, parser, validator, types
├── data/                 # Active data files (JSON schemas, prompts) — see data/README.md
├── research/             # Historical research, competitor analysis, generation scripts
├── content/              # Shared content assets (source extracts)
│   └── blogs/            # Raw and processed blog extracts
├── eslint.config.mjs     # Shared Linting config
├── tsconfig.base.json    # Shared TypeScript base configuration
└── package.json          # Monorepo workspace configuration
```

## Deployment Strategy
### Landing Page
- **Provider:** Railway
- **Source:** Tracked via the `landing/` workspace in this Git repo.
- **Build Command:** `npm run build -w landing`
- **Output:** Next.js Standalone mode.
- **Environment:** Railway connects to the GitHub repository and is configured to look into the `landing` subfolder for deployment.

## Technical Context
- **Framework:** Next.js 16+ (App Router), React 19, Tailwind CSS 4.
- **Language:** TypeScript.
- **Styles:** Shadcn UI (Pro Blocks) and custom Embla/Swiper carousels.
- **Content:** MDX-driven blog and pages.

## UI/Markup Strategy
**Goal:** Minimize custom implementation and avoid "reinventing the wheel."

1.  **Reuse Existing:** Check `src/components/` first. Reuse what is already built.
2.  **ProBlocks:** If a new block is needed, check Shadcn ProBlocks for the closest match and adapt it.
3.  **Shadcn Primitives:** If no block fits, compose new components using existing Shadcn primitives (`src/components/ui`), strictly adhering to the project's theme and `globals.css`.
4.  **Avoid Manual CSS:** Never implement custom styles manually if a utility class or existing component can achieve the result.

## Core Rules for Gemini CLI
1. **Workspace Awareness:** Always check if a command needs to be scoped to a workspace (e.g., `npm run dev -w landing`).
2. **Pathing:** Use absolute paths within the monorepo or relative paths from the root to ensure consistency.
3. **Environment:** `.env.local` files in `landing/` are managed locally; do not commit secrets but ensure they are excluded via the root `.gitignore`.
4. **Tooling:** GitHub CLI (`gh`) is available for repository management.
