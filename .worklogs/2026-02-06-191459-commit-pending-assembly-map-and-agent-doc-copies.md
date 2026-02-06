# Commit pending assembly-map refactor and agent-doc copies

**Date:** 2026-02-06 19:14
**Scope:** `research/assemble_one_article_bundle.py`, `research/bundles/tantrums-handle-tantrum-scripts.md`, `.worklogs/2026-02-06-182740-article-input-assembly-map.md`, `AGENTS.md`, `CLAUDE.md`

## Summary
Analyzed all currently pending working-tree changes and prepared them for a single commit that captures the assembly-map refactor plus repository-level agent-instruction document copies. The analysis confirms the bundle generator now outputs references/recaps instead of inlining full extracts, and the sample bundle reflects that lightweight format.

## Context & Problem
The repository had an open branch (`quiz-work-status-audit`) with unrelated uncommitted changes from earlier work. The requested operation was to delete that branch, commit all pending changes, and then create a fresh branch from a clean state.

Before committing, the pending changes needed to be audited so the worklog could explain what changed and why, including whether new files were net-new content or duplicates.

## Decisions Made

### Keep assembly output as a pointer map, not content concatenation
- **Chose:** Preserve the `research/assemble_one_article_bundle.py` refactor that emits an "article input assembly map" with file-path references + recap snippets.
- **Why:** This aligns with the pipeline direction from Phase 6: small deterministic maps that point to canonical extract files, avoiding giant duplicated bundle artifacts.
- **Alternatives considered:**
  - Keep full source text in bundle files — rejected because it duplicates content and produces very large artifacts that are hard to review/diff.
  - Keep rule documents inlined in each bundle — rejected because structure/style docs are canonical files and should be referenced, not copied.

### Commit `AGENTS.md` and `CLAUDE.md` as instruction aliases
- **Chose:** Include both files in commit scope as-is.
- **Why:** Both files are byte-identical to `AGENT.md` and appear intended as compatibility aliases for different agent runtimes/readers.
- **Alternatives considered:**
  - Drop both and keep only `AGENT.md` — rejected because these files are already present in working tree and may be expected by external tooling.

### Treat `.worklogs/2026-02-06-182740-article-input-assembly-map.md` as part of the same changeset
- **Chose:** Include the earlier untracked worklog together with code/content changes it describes.
- **Why:** It documents the reasoning behind the assembly-map refactor and should travel with the implementation commit.
- **Alternatives considered:**
  - Separate commit for the worklog — rejected because this worklog directly explains the same code changes.

## Architectural Notes
The generator now performs a registry join and emits:
- article metadata and link-plan block
- references to rule docs (`research/seo/article-structure.md`, `research/seo/writing-style.md`)
- resolved extract file references + recaps from `content/blog/extracts/index.json`
- explicit missing-source list for extraction gaps

This keeps the output artifact lightweight and improves repeatability for later writer-runner steps.

## Information Sources
- `git diff -- research/assemble_one_article_bundle.py`
- `git diff -- research/bundles/tantrums-handle-tantrum-scripts.md`
- `AGENT.md`
- `AGENTS.md`
- `CLAUDE.md`
- `.worklogs/2026-02-06-182740-article-input-assembly-map.md`
- `.worklogs/2026-02-06-181417-revert-bad-quiz-commits.md`
- `.worklogs/2026-02-06-163605-phase5-link-plan.md`

## Open Questions / Future Considerations
- If `AGENTS.md`/`CLAUDE.md` are only runtime aliases, consider documenting that explicitly near `AGENT.md` to prevent accidental divergence.
- The map generator still relies on exact title matching across assignment/index registries; if title drift grows, add key-based fallback matching.
- Missing extracts remain a pipeline dependency for full article generation.

## Key Files for Context
- `research/assemble_one_article_bundle.py` — generator logic for lightweight assembly maps.
- `research/bundles/tantrums-handle-tantrum-scripts.md` — representative output showing reference-only format.
- `content/blog/extracts/index.json` — source index with file pointers and recaps.
- `research/source_to_article_assignment.json` — assignment registry used for source resolution.
- `research/article_link_plan.json` — per-article internal-link/CTA plan injected into maps.
- `AGENT.md` — canonical instruction text that currently matches the new alias files.
- `AGENTS.md` — alias copy currently identical to `AGENT.md`.
- `CLAUDE.md` — alias copy currently identical to `AGENT.md`.
- `.worklogs/2026-02-06-182740-article-input-assembly-map.md` — prior detailed rationale for this refactor.

## Next Steps / Continuation Plan
1. Stage the full pending set: the two research changes, both instruction-alias files, and both worklogs.
2. Commit on the base branch intended by the user after branch cleanup.
3. Create a fresh dedicated quiz branch only after `git status` is clean.
4. Continue quiz-stage/problem analysis from commit history/worklogs on that clean branch.
