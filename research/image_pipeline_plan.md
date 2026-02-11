# Image Pipeline Plan

Fully scripted pipeline to go from generated MDX articles to rendered blog images. No LLM context needed after article generation.

## Pipeline Overview

```
Article Generator (Opus)
        │
        ▼
   MDX file with {/* IMAGE: ... */} placeholders
        │
        ▼
Step 1: extract-image-prompts.ts
        │
        ▼
   prompts/{slug}/cover.txt, scene1.txt, scene2.txt
        │
        ▼
Step 2: External image generation (manual/automated)
        │
        ▼
   images/{slug}/cover.png, scene1.png, scene2.png
        │
        ▼
Step 3: upload-images.sh
        │
        ▼
   R2: blog/{category}/{slug}/cover.png, scene1.png, scene2.png
        │
        ▼
Step 4: insert-images.ts
        │
        ▼
   MDX files with ![alt](R2_URL) replacing placeholders
```

## Step 1: extract-image-prompts.ts

**Input:** All MDX files in `landing/src/content/blog/posts/*.mdx`
**Output:** `research/image-prompts/{slug}/cover.txt`, `scene1.txt`, `scene2.txt`

Logic:
- For each MDX file, regex match all `{/* IMAGE: ... */}` comments
- Order matters: 1st = cover, 2nd = scene1, 3rd = scene2
- Write the description text (everything between `IMAGE:` and `*/`) to the corresponding txt file
- Also write a manifest file `research/image-prompts/manifest.json` mapping slug → category slug → image count
- Category slug comes from the metadata export in the MDX (`category: "Siblings"` → `siblings`)
- Skip articles that have no IMAGE comments (already have real images)
- Skip articles that already have entries in the manifest (idempotent)

Regex: `\{\/\*\s*IMAGE:\s*([\s\S]*?)\s*\*\/\}`

## Step 2: External Image Generation

Not scripted here. External system reads `research/image-prompts/{slug}/*.txt` and produces images.

**Expected output structure:**
```
research/generated-images/{slug}/cover.png
research/generated-images/{slug}/scene1.png
research/generated-images/{slug}/scene2.png
```

Or wherever the external system drops them. Step 3 just needs a folder of `{slug}/{cover,scene1,scene2}.png`.

## Step 3: upload-images.sh

**Input:** Folder with generated images (e.g., `research/generated-images/`)
**Output:** Images uploaded to R2 bucket `nmp-landing-media`

Logic:
- Read `research/image-prompts/manifest.json` for slug → category mapping
- For each slug folder with images:
  - Upload `cover.png` → `blog/{category}/{slug}/cover.png`
  - Upload `scene1.png` → `blog/{category}/{slug}/scene1.png`
  - Upload `scene2.png` → `blog/{category}/{slug}/scene2.png`
  - Use: `wrangler r2 object put nmp-landing-media/{path} --file {local} --content-type image/png --remote`
- Write upload results to `research/image-prompts/uploaded.json` (slug → R2 URLs)
- Idempotent: skip already-uploaded slugs unless --force flag

R2 public base: `https://pub-d3fadb2d999a48daa35d8631993c8d45.r2.dev`

## Step 4: insert-images.ts

**Input:** MDX files + `research/image-prompts/uploaded.json`
**Output:** MDX files with IMAGE comments replaced by markdown images

Logic:
- For each entry in `uploaded.json`:
  - Read the corresponding MDX file
  - Find all `{/* IMAGE: ... */}` comments (same regex as Step 1)
  - Replace 1st match with `![{alt}]({R2_URL_cover})`
  - Replace 2nd match with `![{alt}]({R2_URL_scene1})`
  - Replace 3rd match with `![{alt}]({R2_URL_scene2})`
  - Write the MDX file back
- Alt text derivation: take the scene description, truncate to first sentence or ~15 words, clean up
- Idempotent: skip MDX files that already have `![` image markdown where IMAGE comments would be

## Alt Text Strategy

No LLM needed. Derive from the scene description:
1. Take full description text
2. Extract first clause (up to first period or comma after 10+ words)
3. Cap at ~120 characters
4. Example: "Pregnant mother sitting on a couch with toddler girl (~3) on her lap, both looking down at the mother's belly" → "Pregnant mother sitting on a couch with toddler girl on her lap, both looking down at the mother's belly"
5. Strip race/age annotations from alt text for cleaner accessibility (e.g., "(~3)" → "")

## IMAGE Comment Format

The writer prompt produces:
```
{/* IMAGE: [scene description] */}
```

Scene descriptions include (per writer_prompt.md):
- Character roles + approximate age + race
- Poses and actions
- Facial expressions
- Gaze direction
- Object interactions
- Spatial relationships
- NO art style, medium, or format instructions

## File Locations

| File | Purpose |
|------|---------|
| `research/writer_prompt.md` | Article generator prompt (IMAGE section defines format) |
| `research/image-prompts/manifest.json` | Slug → category mapping + image count |
| `research/image-prompts/{slug}/cover.txt` | Cover image scene description |
| `research/image-prompts/{slug}/scene1.txt` | Inline image 1 scene description |
| `research/image-prompts/{slug}/scene2.txt` | Inline image 2 scene description |
| `research/image-prompts/uploaded.json` | Slug → R2 URLs after upload |
| `landing/mdx-components.tsx` | Image rendering: `aspect-3/2 rounded-xl object-cover` |

## R2 Path Convention

```
blog/{category_slug}/{article_slug}/cover.png
blog/{category_slug}/{article_slug}/scene1.png
blog/{category_slug}/{article_slug}/scene2.png
```

Example: `blog/tantrums/handle-tantrum-scripts/cover.png`

## Scale Numbers

- 245 articles × 3 images = 735 images total
- Each prompt txt file: ~100-300 bytes
- Each image: ~500KB-1MB PNG
- Total R2 storage: ~400-700MB
- Upload time: ~10-15 min (sequential wrangler calls)

## Edge Cases

- Articles with fewer than 3 IMAGE comments: warn, process what exists
- Articles that already have real images (like handle-tantrum-scripts): skip (no IMAGE comments to match)
- Duplicate slugs across categories: impossible (slugs are unique in taxonomy)
- Failed uploads: uploaded.json tracks state, re-run skips successes
- Image gen produces wrong dimensions: not our problem (object-cover + aspect-3/2 in CSS handles it)
