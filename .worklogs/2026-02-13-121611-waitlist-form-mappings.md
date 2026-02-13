# Add waitlist entries to form_tag_mappings.json

**Date:** 2026-02-13 12:16
**Scope:** content-plan/form_tag_mappings.json

## Summary
Added 20 `waitlist/*` entries to `form_tag_mappings.json` so the admin mailing dashboard shows green checks for course waitlist Kit Form column.

## Context & Problem
Admin mailing page `/admin/mailing` showed red X for "Kit Form" column on all waitlist rows. The page's API reads `form_tag_mappings.json` (not `kit-config.ts`) to build coverage sets. The file had `blog/*` and `quiz/*` entries but no `waitlist/*` entries, so the `waitlistMappings` set was empty.

## Decisions Made
### Add entries to form_tag_mappings.json
- **Chose:** Add 20 waitlist entries mirroring the freebieConfig in kit-config.ts
- **Why:** The admin validation reads from this file, not from freebieConfig. Both need to be in sync.
- **Note:** This creates two sources of truth for the same mapping (form_tag_mappings.json + kit-config.ts freebieConfig). May want to consolidate in the future.
