# Deterministic Execution Layer (Layer 3)

This project’s core pipeline is **TypeScript on Trigger.dev**, not Python. Layer 3 lives under `src/lib/` (clients/helpers) and `src/trigger/` (scheduled/on-demand tasks). The optional `execution/` folder is reserved for future Python utilities; it is not where Idea Scout runs.

For the live SOP, see **`directives/idea-scout.md`**. For human overview + config, see **`README.md`**. For changelog + architecture snapshot, see **`RECAP.md`**.

---

## TypeScript execution (core pipeline)

### `src/lib/` — clients & helpers

| Module | Role |
| --- | --- |
| `notion.ts` | Notion API v5 reads (`dataSources.query`) and writes (`pages.create` / `pages.update`); transcript toggles; Variation Set footers |
| `apify.ts` | YouTube + Instagram scrapers; Apify token rotation |
| `twitter.ts` | TwitterAPI.io search, articles, threads (`TWITTER_API_KEY` \|\| `BACKUP_TWITTER_API_KEY`) |
| `llm.ts` | **TokenRouter** (MiniMax-M3 strategist / Grok writer) + legacy OpenRouter helpers |
| `voice-dna.ts` | `ExecutionPlan`, voice modes, `buildWriterPrompt` |
| `comprehend-source` (trigger) + `content-intelligence.ts` | Multi-phase strategist schemas and pipeline |
| `transcript-cleaner.ts` | YT/IG clean + head+tail strategist budget |
| `idea-scout-config.ts` | Caps: 30k transcript, `maxSourcesPerRun: 10`, format targets, streaming |
| `idea-page-blocks.ts` / `idea-variations.ts` / `notion-markdown-blocks.ts` | Structured Ideas Bank pages + multi-format grouping |
| `pillar-selection.ts` / `pillar-utils.ts` | Underserved pillar routing + alias matching |
| `draft-validator.ts` / `hook-matcher.ts` | Writer depth gates + hook templates |

### `src/trigger/` — Trigger.dev tasks

| Task | Path | Trigger |
| --- | --- | --- |
| `scout-content` | `idea-scout/scout-content.ts` | Cron Mon/Thu/Sun 3:30 AM UTC |
| `process-content` | `idea-scout/process-content.ts` | Batched from scout |
| `draft-ideas` | `idea-scout/draft-ideas.ts` | Scout dispatch + Wed/Fri 4:30 catch-all |
| `write-tweets` | `idea-scout/write-tweets.ts` | From draft-ideas |
| `research-tweets` | `viral-library/research-tweets.ts` | Manual |

### `scripts/` — local utilities

One-off audits, measure scripts (`npm run measure:transcripts`), voice rebuild (`npm run build:voice`), and tests (`npm test`).

### `src/data/` — committed few-shots

- `creator-voice-samples.json` — production Writer samples  
- `viral-hook-templates.json` — 100 openers  
- `article-examples.json` — full article depth examples  

---

## Execution layer rules

1. **Strict types & schemas** — Prefer explicit interfaces (`ExecutionPlan`, `ScoutedContentForDraft`, etc.).
2. **Secrets from env** — Never hardcode keys; production secrets live in Trigger.dev dashboard (`TOKENROUTER_API_KEY` is required for Idea Scout).
3. **Failover & resilience** — Scrapers throw (don’t silently succeed); Apify token rotation; Twitter 5.5s throttle; Notion write throttles.
4. **Orchestration vs execution** — Trigger tasks orchestrate; mutation and API I/O stay in `src/lib/` helpers.
5. **No placeholders** — Complete, testable code only.

---

## Optional Python (`execution/`)

Add Python scripts here only for specialized offline processing. Invoke from Node via `child_process` if needed. The live Idea Scout path does **not** depend on Python.
