# Directive: Consolidated Idea Scout Pipeline (v4 — Comprehension-First)

## Goal

Maintain and execute the autonomous creator research and idea drafting pipeline. It monitors target creators across YouTube, Instagram, and X (Twitter), evaluates relevance against 8 active content pillars, and saves guide-oriented scout analysis in Notion. A **comprehension-first** two-actor engine then: **Comprehend → Brainstorm → Plan → Write → Validate** — using MiniMax M3 (strategist) and `x-ai/grok-4.3` via TokenRouter (writer), 100 hook templates (openers), and Viral Post Library patterns (body structure). Additionally, a manually triggered Viral Post Research task (`research-tweets`) gathers the highest performing tweets from X focus creators, runs a content strategist LLM analysis, and populates the Viral Post Library with proven structures and patterns.

---

## 1. Environment Variables Required

Ensure these are populated in `.env` for local testing and loaded into the Trigger.dev dashboard for production runs:

```env
# Notion API Configuration
NOTION_API_KEY=

# TokenRouter (Idea Scout — required)
TOKENROUTER_API_KEY=

# OpenRouter (other tasks/scripts only — optional for Idea Scout)
OPENROUTER_API_KEY=
OPENROUTER_MODEL=qwen/qwen3.6-plus

# Twitter API (TwitterAPI.io wrapper client)
BACKUP_TWITTER_API_KEY=

# Twitter Programmatic Filter Configuration
TWITTER_MIN_VIEWS=3000               # Default fallback is 3000

# Apify Scraper Token & Failover Rotation
APIFY_TOKEN=
BACKUP_APIFY_TOKEN=
BACKUP_APIFY_TOKEN_2=
BACKUP_APIFY_TOKEN_3=
BACKUP_APIFY_TOKEN_4=

# Trigger.dev Credentials
TRIGGER_SECRET_KEY=
TRIGGER_ENV=dev|prod
```

---

## 2. Notion Database Mapping

> [!NOTE]
> Following Notion API v5 standards, all **read queries** must run against `dataSources.query` using the **Data Source ID**. All **write operations** (page creations/updates) must target standard Notion endpoints using the **Database ID** or **Page ID**.

| Database Name | Database ID (for writes/relations) | Data Source ID (for read queries) |
| :--- | :--- | :--- |
| **Viral Post Library** | `9c392141-a928-4813-a18e-676560fc4f62` | `93504640-6cf8-4676-9b4a-f74c8b706387` |
| **Ideas Bank** | `38f85f8c-eccf-4679-a2d3-6c0e6d386e7d` | `553eb2c3-82cb-4fb7-abff-6652cb694e4a` |
| **Scouted Content** | `3674a5db-f371-80ad-8ec6-f3e99bdd4191` | `3674a5db-f371-802c-b23e-000b7d73be04` |
| **Creators (X)** | `18d75163-a3d6-455d-9d3d-2076f20d2fed` | `24e6bb9b-b226-4ff6-86b4-f6a72493029d` |
| **YouTube Creators** | `3674a5db-f371-80f9-8822-c0459d34168e` | `3674a5db-f371-80d3-bac9-000befffdd42` |
| **Instagram Creators** | `3674a5db-f371-809a-88a9-d122c712139b` | `3674a5db-f371-80d2-bece-000b0dd38da2` |
| **Content Pipeline** | `8cc7a479-7eea-4092-a11b-81381d4524b0` | `4bfdc801-348f-4203-8966-9720d3e11088` |
| **My Content Tracker** | `69f828a6-5d4d-4ae1-bd62-b415abefe757` | `75600b9e-4eba-4594-92ac-ce01fa85b0a8` |

---

## 3. The 8 Active Content Pillars

The filter checks content relevance against these specific domains. If a piece of content matches none, it is discarded.

1. **Automation** (n8n workflows, Make.com, AI agents, execution pipelines, RPA vs agents)
2. **AI Creative** (video/image gen, Kling, Runway, UGC, ad creatives, faceless channels)
3. **AI Prompting & Tools** (prompt engineering, Claude Projects, Gems, hidden settings, MCP servers)
4. **Vibe Coding** (Cursor, Claude Code, Windsurf, coding apps using LLMs without traditional code)
5. **Creator Economy** (audience growth, newsletter monetization, Gumroad launches, funnels)
6. **Copywriting and Storytelling** (hooks, tweet structures, PAS/AIDA frameworks, sales copy)
7. **Personal/Vulnerability** (emotional resonance, failures, founder's transparent updates)
8. **Building in Public** (MRR milestones, shipping features, open build logs, retrospective audits)

> [!WARNING]
> The **Psychology** and **Web3** content pillars are frozen. Existing database records are kept intact, but the filter and drafting pipelines must ignore them for new content processing and idea generation.

---

## 4. Pipeline Architecture & Execution Flow

```
Trigger.dev Mon/Thu/Sun Cron
│
└── scout-content (Runs 3:30 AM UTC Mon/Thu/Sun | maxDuration: 14400s)
    ├── 1. Gather active creators (YT: 10, IG: 10, X: 24) sorted by Last Checked (oldest first)
    ├── 2. Scrape content streams (with 5s cooldowns between phases):
    │      ├── YT: Scrapes newest 5 videos (Apify Actor) — sequential per creator
    │      ├── ⏸️ 5s cooldown
    │      ├── IG: Pulls newest 30 reels, selects 5 newest + 5 top-viewed,
    │      │       transcribes in chunks of 3 concurrent actors (apple_yang) with 2s delays
    │      ├── ⏸️ 5s cooldown
    │      └── X: Queries recent tweets with a 5.5s throttle sequential loop using the direct REST API (twitterapi.io), filters by views (>= TWITTER_MIN_VIEWS), and fetches full-text X Articles using the getArticle endpoint (passing articleId: tweet.id) if tweet.article is present or URL contains /article/
    ├── 3. Execute process-content in batches of 15 (Trigger.dev Batch Chunking) with a 2s delay between batches to prevent parent orchestrator hangs
    │      ├── A. Duplicate check: Verify URL/title does not clash with existing scouted content for that creator
    │      ├── B. Feed to LLM: Prepares up to 100,000 characters of content/transcript (expanded from 6,000 to prevent context truncation)
    │      ├── C. Relevance check: LLM checks content maps to 8 active pillars (reject if < 0.6 confidence; frozen Web3/Psychology are ignored)
    │      ├── D. Disambiguation check: LLM filters out false positives (e.g., Mercedes driver Kimi Antonelli, NBA athlete Amen Thompson)
    │      ├── E. Summarization: LLM extracts summary and actionable key takeaways (bullets with →)
    │      └── F. Notion insert: Create Scouted Content page (full transcript in `▶️ Full Transcript` toggle + chunked rich_text property), establishing creator relation
    ├── 4. Update Last Checked date ONLY for successfully processed creators (failed creators are skipped)
    └── 5. Dispatch draft-ideas with this run's `scoutedContentIds` (skipped when no new content was stored)

Triggered two ways (hybrid):
│   • Immediately by scout-content with this run's scoutedContentIds (Mon/Thu/Sun)
│   • Catch-all cron Wed/Fri 4:30 AM UTC for unlinked scouted content (manual/orphaned)
│   • Manual dashboard / trigger-draft.ts also supported
│
└── draft-ideas [VALUE STRATEGIST] (maxDuration: 900s)
    ├── 1. Clean up rejected ideas (archive to sever relations and free scouted content)
    ├── 2. Gather context from all sources:
    │      ├── A. Unused Scouted Content (from past 7 days, filtering out those already linked to Ideas)
    │      ├── B. Top 30 Viral Posts (4★+)
    │      ├── C. Past 30 days of generated Idea titles (soft dedup)
    │      └── D. Category distribution balance (prioritize underserved pillars)
    ├── 3. For each Scouted Content page, fetch the full source context:
    │      ├── Title, Platform, URL, AI Summary, Key Takeaways, and Niche
    │      ├── Full transcript/source text from the Notion page body toggle when present
    │      └── X posts without transcript fall back to stored title/text + summary/takeaways
    ├── 4. Resolve pillar from item.pillars (Niche tags):
    │      Single tag → use it. Multiple tags → pick the pillar with the fewest recent Ideas Bank ideas (14-day distribution); ties prefer the later-listed tag.
    │      Frozen Web3/Psychology tags resolve to Unknown/skip for new drafting
    ├── 5. Comprehension pipeline per source (MiniMax M3 via TokenRouter, streaming enabled):
    │      Transcript budget: deterministic clean (YT/IG) → head+tail only if still over `strategistMaxTranscriptChars` (30_000)
    │      Phase 1 COMPREHEND — what is content about, creator doing, audience, pain, teachable units
    │      Phase 2 BRAINSTORM — article/thread/mid/short products + value bombs
    │      Phase 3 SELECT — up to 2 outputs (format diversity when score ≥ 7)
    │      Phase 4 PLAN — detailedOutline, talkingPoints (3–7 bullets), stepByStepProcess (ordered how-to), hook template, viral tweetStructure
    │      Output: ExecutionPlan for writer
    ├── 6. Sequentially write ExecutionPlans to Ideas Bank (status: 💭 Raw) with 350ms throttle
    │      Shared `Variation Set` label per source batch; idea titles suffixed with format (e.g. `— Thread`)
    │      Page preamble + sibling Notion links when multiple formats are drafted from one source
    └── 7. Dispatch write-tweets task for each ExecutionPlan

Triggered by draft-ideas (async)
│
└── write-tweets [WRITER ACTOR] (maxDuration: 600s | retry: 2)
    ├── 1. Load few-shot voice samples from src/data/creator-voice-samples.json (.tmp is local regeneration scratch)
    ├── 2. Build source-grounded, voice-specific prompt via buildWriterPrompt() from voice-dna.ts
    │      Maps voiceMode → creator samples:
    │        Builder-Retrospective → Dreyshq (first-person, scar tissue, value)
    │        Tool-Curator → Sharbel (analytical, metric-dense, "Bookmark this" CTA)
    │        Case-Study → Zaimiri (operator wisdom, lowercase openers, "bro" allowed)
    ├── 3. Use ExecutionPlan source facts, talking points, step-by-step process, numbers, tools, examples, mechanism, and do-not-invent guardrails
    ├── 4. Generate text via TokenRouter x-ai/grok-4.3 at temperature 0.7
    │      Validate depth (article ≥1200 words, thread ≥8 posts) — retry once if thin
    │      Dynamically switches output:
    │        Short: One tight tweet
    │        Mid-length: One longer value tweet
    │        Thread: Staccato formatting, [1/n] markers
    │        Article: Full long-form markdown with ##/### headers
    └── 5. Update Notion Idea:
           - Draft Tweet property (first 2000 chars)
           - Full text in toggle block (▶️ Full Draft Tweet)
           - Auto-set status to 📝 Drafted

Trigger.dev Manual Run
│
└── research-tweets (Runs on-demand | maxDuration: 14400s)
    ├── 1. Gather active focus creators from Creators (X) database (up to 100)
    ├── 2. Fetch clean URLs of posts added to Viral Post Library in the past 30 days for deduplication
    ├── 3. Sequentially query creator tweets from past 30 days (5.5s delay between creators to respect REST 1 QPS rate limit)
    ├── 4. Filter for tweets where views >= 3000 and bookmarks >= 10, excluding duplicates
    ├── 5. Score virality: Score = (bookmarks * 10) + (retweets * 5) + (replies * 2) + Math.floor(views / 1000)
    ├── 6. Slice top 150 tweets sorted by score descending
    ├── 7. Sequentially analyze tweets:
    │      ├── Fetch full text of X Articles if detected via getArticle REST API
    │      ├── Prompt OpenRouter (xiaomi/mimo-v2.5-pro by default) with the Senior Content Strategist framework
    │      └── Write the structured analysis to the Viral Post Library database with a 500ms delay to stay within Notion's write rate limits
```

### Synthesis & Drafting Tasks (`draft-ideas` + `write-tweets`)
The synthesis engine runs as a two-actor pipeline:

**Actor 1: The Value Strategist (`draft-ideas`)**
1. Cleans up any Ideas Bank entries marked as "Rejected" (archiving them) to sever relations and free up the associated scouted content for reuse.
2. Queries the past 7 days of Scouted Content, filtering out entries that are already linked to generated ideas in the `"Linked Ideas"` relation (Source Deduplication).
3. Queries the top 30 highly-rated (`⭐⭐⭐⭐`/`⭐⭐⭐⭐⭐`) Viral Post Library patterns.
4. Queries the past 30 days of generated Idea titles to ensure soft deduplication.
5. Queries the past 14 days of Ideas Bank category distribution to focus on underserved pillars.
6. Fetches full source context for each Scouted Content page:
   - `Title`, `Platform`, `URL`, `AI Summary`, `Key Takeaways`, and `Niche`.
   - Full transcript/source text from page body blocks when present.
   - X posts without transcripts fall back to stored title/text plus summary/takeaways.
7. Runs comprehension pipeline per source (MiniMax M3 via TokenRouter, `strategistUseStreaming: true`, no OpenRouter fallback):
   - **Transcript budget** (`src/lib/transcript-cleaner.ts`): deterministic clean for YT/IG (SFX, filler, dedupe); ~0% reduction on dense YT transcripts. Head+tail trim (65/35 split) only when cleaned text still exceeds `strategistMaxTranscriptChars` (30_000 — raised from 20k after measurement showed 22k YT sources need full coverage).
   - **Comprehend** — study transcript; reject shallow comprehension (retry once strict).
   - **Brainstorm** — 2-5 format-native outputs; value bombs; up to 2 selected.
   - **Plan** — `detailedOutline`, `talkingPoints` (publishable bullets from transcript gems), `stepByStepProcess` (from `specificSteps` when how-to), hook from `src/data/viral-hook-templates.json`, viral `tweetStructure`. Deterministic fallbacks in `deriveTalkingPoints()` / `deriveStepByStepProcess()` if the model omits them.
   - Produces `ExecutionPlan` (not thin single-pass JSON).
8. Writes structured Ideas Bank pages: Hook + Output visible at top; strategist brief (outline, talking points, steps, gems) in collapsed toggle; writer draft in `▶️ Draft — {format}` toggle with native Notion headings/lists.
9. Dispatches `write-tweets` per plan.

**Actor 2: The Writer (`write-tweets`)**
1. Receives `ExecutionPlan` and Notion Idea page ID.
2. Loads few-shot voice samples from `src/data/creator-voice-samples.json` (committed, reviewed production samples). `.tmp/creator-voice-samples.json` is only a regeneration/export artifact.
3. Calls `buildWriterPrompt()` from `voice-dna.ts` which:
   - Maps `voiceMode` to a creator handle (Builder-Retrospective → Dreyshq, Tool-Curator → Sharbel, Case-Study → Zaimiri).
   - Selects the top 5 matching samples by engagement.
   - Injects mode-specific instructions (e.g., Sharbel: "Bookmark this" CTA allowed, Zaimiri: lowercase openers and "bro" allowed).
   - Injects talking points, step-by-step process (threads/articles), source facts, numbers, tools, examples, mechanism, and anti-invention guardrails.
   - Dynamically switches output format based on `valueBrief.format`: Short, Mid-length, Thread, or Article.
4. Generates via **TokenRouter** `x-ai/grok-4.3` at temperature `0.7`. Validates depth; retries once if thin.
5. Updates the Notion Idea with the draft:
   - First 2000 chars in `"Draft Tweet"` property.
   - Full un-truncated text in a toggle block (`▶️ Full Draft Tweet`).
   - Auto-sets status to `"📝 Drafted"`.


---

## Operational Notes / Known Failure Modes

- **Bare / shallow drafts (root cause: transcript truncation):** If the Strategist only sees a 2k transcript snippet, comprehension and outlines lack source depth. **Fix:** `createScoutedContent` stores the full transcript in an `▶️ Full Transcript` page-body toggle (paragraph blocks appended in batches) and writes the `Transcript` property as chunked rich_text (2k per element, up to 100 chunks — not a single 2k substring). `getScoutedContentByIds` reads the toggle via `extractRawTranscriptFromPageBody()` and passes the full text to the Strategist.
- **Validate transcript cap decisions:** Run `npm run measure:transcripts` (or `npx tsx scripts/measure-transcript-cleaning.ts [days] [limit]`) against live Scouted Content to see cleaning reduction % and how many sources need head+tail at the current cap.
- **M3 gateway idle cutoff:** Strategist calls use streaming (`strategistUseStreaming: true` in `idea-scout-config.ts`) so TokenRouter keeps the connection alive during MiniMax's `<think>` phase. Falls back to non-streaming on stream failure.
- **Ideas stuck in 💭 Raw:** Check Trigger.dev `write-tweets` logs and inspect the ValueBrief in the Idea page body. A successful `draft-ideas` run means Writer tasks were dispatched, not that every final draft has completed.
- **Voice samples:** Production reads from `src/data/creator-voice-samples.json`. Regeneration scripts write to `.tmp/creator-voice-samples.json`; review and sanitize that output before promoting it into `src/data`.
- **Frozen pillars:** Web3 and Psychology remain valid historical labels in Notion, but new matching, drafting, and category writes must ignore them or resolve them to `Unknown`.
- **Async Writer behavior:** `draft-ideas` does not wait for Writer completion. This is intentional; quality comes from the full source handoff, while final draft completion is handled by the child Writer task.
- **Production run polling:** Manual trigger scripts (`trigger-scout.ts`, `trigger-draft.ts`) set `TRIGGER_SECRET_KEY` from `TRIGGER_PRODUCTION_KEY`. Local status polling must use the same key path; `scripts/check-status.ts` falls back to `TRIGGER_PRODUCTION_KEY` before `TRIGGER_DEVELOPMENT_KEY` to avoid false 404s when polling production run IDs.

---

## 5. Concurrency & Rate Limiting

The pipeline controls concurrency at multiple levels to prevent API exhaustion:

| Layer | Control | Why |
| :--- | :--- | :--- |
| **Apify IG Transcripts** | Max 3 concurrent actors + 2s cooldown between chunks | Prevents 8192MB free-tier memory exhaustion (was causing 402 errors) |
| **process-content tasks** | Trigger.dev `queue.concurrencyLimit: 5` and `maxDuration: 300s` | Prevents 300+ parallel tasks flooding Notion (3 req/s limit) and OpenRouter, with 5 min safety buffer |
| **Trigger.dev Batch Chunking** | Chunk raw content items into groups of 15 with 2s cooldown | Prevents parent orchestrator from hanging indefinitely in "waiting" state |
| **OpenAI/OpenRouter Client** | 120s client-side request timeout | Prevents tasks from hanging indefinitely on slow API requests, increased from 60s to handle large source-study workloads |
| **LLM Synthesis Parallelization** | Concurrency limit of 3 | Processes 3 active niche groups concurrently to prevent network/connection saturation while speeding up the pipeline |
| **Notion batch reads** | `getScoutedContentByIds` chunks into batches of 5 + 350ms delay | Stays under Notion's 3 req/s rate limit |
| **Notion writes throttle** | 350ms delay between consecutive `createIdea` requests | Strictly prevents Notion 429 rate limit errors when writing newly drafted ideas |
| **Inter-platform cooldowns** | 5s pause between YT→IG and IG→Twitter phases | Lets Apify actors release memory before next phase |
| **Twitter API throttle** | 5.5s delay between requests + exponential backoff on 429/5xx | Respects 1 QPS free-tier limit |

---

## 6. Edge Cases & Learnings

- **Notion Transcript Storage Fix:** Prior bug: `Transcript` property was hard-truncated to 2,000 chars and the page-body toggle was not populated — Strategist read only the preview, producing bare drafts. Now: property uses `splitIntoRichText()` chunks; full transcript lives in `▶️ Full Transcript` toggle children. Scout Pass 1 (`process-content`) also runs `prepareScoutContentBody()` — deterministic YT/IG clean before gem extraction (100k cap).
- **Strategist Transcript Budget:** `budgetTranscript()` in `comprehend-source.ts` — clean first, head+tail only as last resort. Dense YT transcripts (~22k chars) shrink ~0% after cleaning; 30k cap avoids unnecessary trimming. On strategist timeout retry, budget halves (`strategistTimeoutRetryTranscriptFactor: 0.5`).
- **Apify X Scraper Migration to REST**: Switched X scraping to a direct REST API client (`twitterapi.io`) due to Free Plan account restrictions blocking execution of Apify actors. Uses a sequential creator loop with a 5.5s throttle delay to stay under the 1 QPS limit.
- **X Articles Endpoint Parameter Fix**: The `/article` endpoint expects `articleId` as the query parameter. Restored and fixed this by changing `tweetId` to `articleId` (`params: { articleId: tweetId }`), enabling successful full-body fetches for long-form X Articles.
- **Deterministic Notion Relation Mapping**: LLM synthesis output is instructed to return unique Notion Page IDs inside `"inspiredByScoutedIds"`. The code parses these via UUID regex, resulting in a 100% relation linking hit rate and bypassing LLM title paraphrasing glitches.
- **Self-Healing JSON Parse**: Added a regex-based `repairJson(str)` helper that heals minor LLM JSON formatting omissions (such as missing commas on newlines).
- **Scraper Failures Skip `Last Checked` Update:** If a scraper throws an error (Apify 402, network timeout, etc.), that creator is caught by the per-creator `try/catch` and excluded from `processedCreatorIds`. This ensures failed creators are retried on the next run rather than silently skipped.
- **Notion Relation Failures:** Relation linking during `createIdea` can sometimes error with `validation_error` or `object_not_found`. The client catches this error and automatically retries the insert without the `Inspired By` relations to keep task executions green.
- **Twitter API Rate Limits & Indexing:** We pull all recent tweets and programmatically filter them using `MIN_VIEWS` (default 1000) rather than using search parameter filters which suffer from search index delay. We do not apply bookmark filtering as high-signal viral tweets often have 0 bookmarks.
- **Apify Token Rotation:** If the main `APIFY_TOKEN` fails or runs out of credits, the system automatically rotates through a failover array of backup tokens (`BACKUP_APIFY_TOKEN` through `BACKUP_APIFY_TOKEN_4`).
- **Scraper Constraints:** YouTube limits channel queries to `maxItems: 5`. Instagram reels pulls up to `resultsLimit: 30` per creator, selecting the 5 newest and 5 top-performing (most viewed) reels, transcribing in controlled batches of 3.
- **Title Formatting Rules:** The LLM is prohibited from generating template titles (e.g. *"The [Adjective] [Noun] Framework"* or *"The X Arbitrage"*). Every title must contain a specific name, metric, or monetary value (e.g., *"$0 Technical Co-Founder"*).
- **OpenRouter API Key:** Must be set in both `.env` (local) AND Trigger.dev production environment variables. Missing this key causes silent content filtering failures (LLM returns 401, caught by try/catch, content marked as "filtered").
