# Steady Parent (Monorepo)

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
├── research/             # Competitor analysis and raw data
│   ├── competitors/      # Research on Big Little Feelings, Good Inside, etc.
│   └── skool/            # Lesson drafts and community seed content
├── content/              # Shared content assets
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
