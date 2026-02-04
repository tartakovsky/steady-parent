# New Project Rules

> Copy this file and the referenced configuration files when setting up a new project.
>
> These rules ensure consistency, strict type safety, and organized code structure.

---

## Required Configuration Files

When creating a new project, copy these files from the reference project:

### 1. TypeScript Configuration

**File:** `tsconfig.json`

Contains strict TypeScript compilation rules including:

- `strict: true` with additional checks beyond the strict preset
- `noUncheckedIndexedAccess` — array/object index access returns `T | undefined`
- `noPropertyAccessFromIndexSignature` — force bracket notation for index signatures
- `exactOptionalPropertyTypes` — differentiate between `undefined` and missing
- `noImplicitReturns`, `noImplicitOverride`, `noFallthroughCasesInSwitch`
- Dead code detection: `allowUnreachableCode: false`, `noUnusedLocals`, `noUnusedParameters`

### 2. ESLint Configuration

**File:** `eslint.config.mjs`

Contains strict ESLint rules including:

- **No `any` types** — all `@typescript-eslint/no-unsafe-*` rules enabled
- **Explicit return types** on functions and module boundaries
- **Strict boolean expressions** — no truthy/falsy coercion
- **Promise safety** — no floating promises, no misused promises
- **Consistent type imports/exports**
- **JSDoc ban** — this codebase is AI-agent-written; JSDoc wastes context tokens
- Relaxed rules for test files and config files

---

## Frontend Technology Stack

When the project includes a frontend, copy these documentation files to `src/app/__docs__/`:

### 1. Frontend Guidelines

**File:** `src/app/__docs__/frontend.md`

Defines the UI development standards:

- Technology stack: React (latest) + shadcn/ui (latest) + Next.js
- Component library priority:
  1. **shadcndesign Pro Blocks** (first choice)
  2. **shadcn/ui components** (second choice)
  3. **Pure React / third-party** (last resort, only if explicitly requested)
- Theming: Must use Shadcn or Pro Blocks theme engine

### 2. Pro Blocks Directory

**File:** `src/app/__docs__/shadcndesign-pro-blocks-directory.md`

Complete catalog of all 314 available blocks:

| Category       | Blocks |
|----------------|--------|
| Landing Page   | 181    |
| Application    | 84     |
| E-commerce     | 49     |

Reference this file when building UI to find pre-built components.

---

## Quick Checklist

When setting up a new project:

- [ ] Copy `tsconfig.json` (strict TypeScript rules)
- [ ] Copy `eslint.config.mjs` (strict ESLint rules)
- [ ] Set up `__tests__/` directories with `mock/` and `live/` subdirectories
- [ ] Set up `__docs__/` directories for module documentation
- [ ] If frontend: Copy `src/app/__docs__/frontend.md`
- [ ] If frontend: Copy `src/app/__docs__/shadcndesign-pro-blocks-directory.md`
- [ ] Configure shadcndesign registry in `components.json` (if using Pro Blocks)

---

## File Locations Summary

| Purpose                      | File Path                                          |
|------------------------------|----------------------------------------------------|
| TypeScript rules             | `tsconfig.json`                                    |
| ESLint rules                 | `eslint.config.mjs`                                |
| Frontend guidelines          | `src/app/__docs__/frontend.md`                     |
| Pro Blocks catalog           | `src/app/__docs__/shadcndesign-pro-blocks-directory.md` |

