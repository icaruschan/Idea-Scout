# Deterministic Execution Layer (Layer 3)

This project’s core pipeline is **TypeScript on Trigger.dev**, not Python. Layer 3 lives under `src/lib/` (clients/helpers) and `src/trigger/` (tasks). The optional `execution/` folder is reserved for future Python utilities; it is not where Idea Scout runs.

| Doc | Role |
| --- | --- |
| `directives/idea-scout.md` | Live SOP (agents) |
| `README.md` | Human overview + config |
| `RECAP.md` | Changelog + architecture snapshot |

---

## Two execution paths

### 1. Generation path (manual-origin)

Scout → process → strategist draft → writer → structural validation.

| Task | Path | Trigger |
| --- | --- | --- |
| `scout-content` | `idea-scout/scout-content.ts` | **Manual** (cron paused) |
| `process-content` | `idea-scout/process-content.ts` | Batched from scout |
| `draft-ideas` | `idea-scout/draft-ideas.ts` | Manual / scout dispatch |
| `write-tweets` | `idea-scout/write-tweets.ts` | From draft-ideas |
| `research-tweets` | `viral-library/research-tweets.ts` | Manual |

### 2. Decision / learning path (PRODUCTION schedules, Africa/Lagos)

Evaluate → curate → promote selected → sync posted → taste profile.

| Task | Path | Trigger |
| --- | --- | --- |
| `evaluate-draft` | `idea-scout/evaluate-draft.ts` | After valid write / backfill |
| `backfill-idea-evaluations` | `idea-scout/backfill-evaluations.ts` | Manual (batches of 10) |
| `curate-daily-ideas` | `idea-scout/curate-daily-ideas.ts` | Daily 07:00 |
| `promote-selected-ideas` | `idea-scout/promote-selected-ideas.ts` | Every 15 min |
| `sync-posted-content-to-tracker` | `idea-scout/sync-posted-content.ts` | Hourly :05 |
| `refresh-taste-profile` | `idea-scout/refresh-taste-profile.ts` | Sunday 08:00 |

**Human gates:** automation never sets `✅ Selected` and never publishes. Pipeline → Tracker requires `🚀 Posted` + `Move to Tracker` + `Posted URL`.

---

## `src/lib/` — clients & helpers

| Module | Role |
| --- | --- |
| `notion.ts` | Notion v5 reads/writes, transcripts, Variation Sets |
| `idea-roadmap-notion.ts` | Evaluation save/route, curation, promote, tracker sync, taste profiles, hooks |
| `idea-evaluation.ts` | Score weights, Confidence Score, shelf life, critical flags, thresholds (7.5 / 6.5) |
| `idea-curation.ts` | Deterministic Top 3 (Best Overall / Quick Win / Bold Bet) |
| `hook-matcher.ts` | Enriched hooks; Safe/Sharp/Bold variants |
| `voice-dna.ts` | ExecutionPlan (+ hookVariants), `buildWriterPrompt` (+ taste) |
| `apify.ts` / `twitter.ts` / `llm.ts` | Scrapers + TokenRouter |
| `transcript-cleaner.ts` / `draft-validator.ts` | Budgets + writer depth gates |
| `pillar-selection.ts` / `pillar-utils.ts` | Pillar routing |
| `idea-page-blocks.ts` / `idea-variations.ts` / `notion-markdown-blocks.ts` | Structured Ideas Bank pages |
| `idea-scout-config.ts` / `constants.ts` | Caps, IDs (incl. Taste Profiles), pillars |

---

## Scripts

| Command | Purpose |
| --- | --- |
| `npm test` | tsc + unit tests (includes evaluation, curation, hooks) |
| `npm run measure:transcripts` | Strategist transcript budget diagnostics |
| `npm run migrate:roadmap` / `migrate:roadmap:dry` | Ensure Notion roadmap properties |
| `npm run verify:roadmap` | Live schema verification |
| `npm run enrich:hooks` | Enrich `viral-hook-templates.json` metadata |
| `npm run build:voice` | Regenerate voice DNA artifacts |

Helpers: `scripts/audit-roadmap-state.ts`, `run-roadmap-backfill.ts`, `trigger-roadmap-task.ts`, `verify-idea-scout-roadmap.ts`.

---

## Execution layer rules

1. **Strict types** — Prefer explicit interfaces (`ExecutionPlan`, `IdeaEvaluation`, `CurationCandidate`, etc.).
2. **Secrets from env** — Production secrets in Trigger.dev (`TOKENROUTER_API_KEY` required).
3. **Failover** — Scrapers throw; Apify rotation; Twitter 5.5s throttle; Notion write throttles.
4. **Orchestration vs I/O** — Trigger tasks orchestrate; mutations live in `src/lib/`.
5. **Rejected ideas stay** — Do not reintroduce auto-archive of `Rejected` (taste learning).
6. **No placeholders** — Complete, testable code only.

---

## Optional Python (`execution/`)

Add Python only for offline utilities. The live Idea Scout path does **not** depend on Python.
