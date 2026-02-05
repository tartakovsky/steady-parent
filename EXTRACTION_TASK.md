# Knowledge Extraction Task for Parenting Articles

## Current Status

| Blog | Extracted | Total | Progress |
|------|-----------|-------|----------|
| biglittlefeelings | 22 | 22 | ✅ 100% |
| goodinside | 30 | 30 | ✅ 100% |
| nurturedfirst | 114 | 114 | ✅ 100% |
| peacefulparenthappykids | 87 | 807 | 11% |
| **Total** | **253** | **973** | **26%** |

**Remaining:** 720 peacefulparenthappykids articles

## Directory Structure

```
/Users/tartakovsky/Projects/steady-parent/content/blog/
├── raw/
│   ├── index.json                    # Master index of all raw articles
│   ├── biglittlefeelings/           # 22 articles (done)
│   ├── goodinside/                   # 30 articles (done)
│   ├── nurturedfirst/               # 114 articles (done)
│   └── peacefulparenthappykids/     # 807 articles (87 done, 720 remaining)
└── extracts/
    ├── index.json                    # Index of extracted articles only
    ├── biglittlefeelings/           # 22 extracts
    ├── goodinside/                   # 30 extracts
    ├── nurturedfirst/               # 114 extracts
    └── peacefulparenthappykids/     # 87 extracts
```

## Remaining Articles List

File: `/Users/tartakovsky/Projects/steady-parent/remaining_pphk_articles.txt`
Contains 720 article keys (one per line) in format: `peacefulparenthappykids/{article-slug}`

## How to Extract a Single Article

For each article, the agent should:

1. **Read the source file:**
   ```
   /Users/tartakovsky/Projects/steady-parent/content/blog/raw/peacefulparenthappykids/{article-slug}.md
   ```

2. **Use the `knowledge_extractor` skill** to extract structured knowledge from the article

3. **Write the output to:**
   ```
   /Users/tartakovsky/Projects/steady-parent/content/blog/extracts/peacefulparenthappykids/{article-slug}.md
   ```

4. **Update the extracts index** by running:
   ```bash
   cd /Users/tartakovsky/Projects/brightdata_scraper && python update_extracts_index.py
   ```

   Note: The update script reads from `/Users/tartakovsky/Projects/steady-parent/content/blog/` (paths are configured in the script)

## Agent Prompt Template

For each article, use this prompt:

```
Extract knowledge from /Users/tartakovsky/Projects/steady-parent/content/blog/raw/peacefulparenthappykids/{ARTICLE_SLUG}.md using the knowledge_extractor skill. Write the output to /Users/tartakovsky/Projects/steady-parent/content/blog/extracts/peacefulparenthappykids/{ARTICLE_SLUG}.md (create directory if needed). Then run: cd /Users/tartakovsky/Projects/brightdata_scraper && python update_extracts_index.py
```

## Knowledge Extractor Skill Requirements

The extraction should:
- **No em-dashes** (use regular hyphens)
- **Exhaustive extraction** - capture all knowledge, not summaries
- **Preserve causal chains** - why things work, not just what to do
- **Include frameworks** - mental models, decision trees, step-by-step processes
- **Capture anti-patterns** - what NOT to do and why
- **Maintain specificity** - preserve concrete examples, exact phrases, specific ages

## Parallel Execution

Launch agents in parallel using `run_in_background=true`. Each agent is independent and can run concurrently. Recommended batch size: 50 agents at a time.

## Smoke Check After Processing

After a batch completes, verify extraction quality:

```bash
# Count extracts
ls /Users/tartakovsky/Projects/steady-parent/content/blog/extracts/peacefulparenthappykids/*.md | wc -l

# Check for suspiciously short files (< 500 words)
for f in /Users/tartakovsky/Projects/steady-parent/content/blog/extracts/peacefulparenthappykids/*.md; do
  words=$(wc -w < "$f")
  if [ "$words" -lt 500 ]; then
    echo "SHORT: $(basename $f) - $words words"
  fi
done

# Update and verify index
cd /Users/tartakovsky/Projects/brightdata_scraper && python update_extracts_index.py
```

## Files to Review

7 existing extracts are suspiciously short (< 500 words):
- 13-year-old-doesn-t-want-to-practice-piano.md (390 words)
- 14-month-old-throwing-everything.md (405 words)
- 2-1-2-year-old-interested-in-a-bottle-for-the-first-time.md (482 words)
- 3-year-old-isnt-interested-in-potty-training.md (373 words)
- 4-year-old-aggressive-tantrums-screaming.md (458 words)
- 5-year-old-has-tantrums-during-sports-games.md (348 words)
- 9-year-old-has-panic-attacks.md (256 words)

These may need re-extraction or the source articles may just be short.
