# Replace Python generation script with prompt + how-to

**Date:** 2026-02-09 11:00
**Scope:** research/

## Summary
Deleted `generate_community_ctas.py` (Python API script) and replaced with a self-contained prompt template + how-to-run instructions for background agent generation.

## Context & Problem
The generation pattern in this project is: prompt template with typed output schema → background agent (Task tool) → runtime validation. Not Python scripts calling APIs. The Python script was the wrong approach.

## Decisions Made

### Background agent over API script
- **Chose:** Prompt template + how-to instructions for Claude background agents
- **Why:** User explicitly said generation happens via background agents, not API calls. The prompt contains the output schema inline so the agent knows the exact shape. Post-generation validation uses the existing Zod schemas.

### Prompt has placeholder, how-to explains assembly
- **Chose:** `{{CATEGORIES_WITH_COURSES}}` placeholder in prompt, assembly instructions in how-to
- **Why:** The category+course data changes as the catalog evolves. The how-to explains exactly how to read `article_taxonomy.json` and `cta_catalog.json` to build the placeholder value. A future session reads the how-to, assembles the prompt, launches an agent.

## Key Files for Context
- `research/community_cta_prompt.md` — prompt template with typed output schema
- `research/how-to-generate-community-ctas.md` — step-by-step instructions for running generation
- `research/cta_catalog.json` — target file for merged output
- `content-spec/src/schemas/cta-catalog.ts` — Zod schema for validation
