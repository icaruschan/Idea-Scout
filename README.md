# Ultimate Creator Brain — Unified Idea Scout Pipeline

An automated agentic content scouting and idea remixing engine. This system monitors target creators across YouTube, Instagram, and X (Twitter), filters out noise using a single-step LLM filter, and remixes relevant concepts with high-performing templates to generate fresh tweet drafts directly inside Notion.

---

## The Tech Stack

* **Background Orchestrator:** [Trigger.dev v3](https://trigger.dev/) (Runs background cron schedules and concurrent worker tasks).
* **Data Sources:** Notion API v5 (Custom-forked client with customized database reading endpoints).
* **Scraping Tools:** 
  * [Apify API](https://apify.com/) (Extracts YouTube video transcripts and Instagram Reels data).
  * [TwitterAPI.io](https://twitterapi.io/) (High-speed X search wrapper).
* **AI Engine:** [TokenRouter API](https://api.tokenrouter.com/v1) (MiniMax M3 for strategic content comprehension and outline planning; `x-ai/grok-4.3` for creative voice-matched tweet, thread, and article drafting).
* **Environment:** TypeScript, Node.js, npm.

---

## Core Feature & Value Map

Here is the user-facing feature map for the **Idea Scout** agentic workspace. You can open and edit the interactive version using the link below:
* ⬜ [Interactive Excalidraw Board](https://excalidraw.com/#json=R_wmTfjZZwW4SBD8_gxaj,7rnQ8w-FECXdNaHO7PhnNA)

![Idea Scout Feature Map](images/idea_scout_dark.png)

---

## Step-by-Step Workflow (With Simple Examples)

### Step 1: Read Creator Lists
The system queries your Notion Workspace to fetch active target accounts to monitor.
* **YouTube Creators:** Channel links (e.g. `youtube.com/@AlexHormozi`).
* **Instagram Creators:** Profile handles (e.g. `naval`).
* **X (Twitter) Creators:** Profile handles (e.g. `mrbeast`).

---

### Step 2: Multi-Source Scraping & Optimization
The scrapers gather recent content. To save API credits, several smart optimization strategies are applied:

* **X (Twitter):** Fetches recent tweets from each creator with a 5.5s throttle between requests.
  * *Views Filter:* Immediately drops tweets that have **fewer than 1,000 views** to avoid waste.
  * *X Article Support:* Detects long-form X Articles (via the `isArticle` flag or URLs containing `/article/`) and queries the TwitterAPI.io `/article` endpoint to retrieve the full article body, bypassing the standard tweet character limits.
* **YouTube:** Triggers Apify's `streamers/youtube-scraper` to pull the latest video metadata, subtitles, and transcripts.
* **Instagram:** Triggers Apify's `apify/instagram-reel-scraper` on the newest 30 reels.
  * *Virality Strategy:* Selects the **5 newest reels** (freshness) plus the **5 highest-viewed reels** (virality) from the rest, then transcribes them in **chunks of 3 concurrent actors** (with 2s cooldown between chunks) using `apple_yang/instagram-transcripts-scraper`.
* **Inter-Platform Cooldowns:** 5-second pauses between YouTube→Instagram and Instagram→Twitter phases allow Apify actors to release memory before the next phase starts.
* **Apify Token Rotation:** If the primary Apify API token hits rate limits or runs out of credits, the code automatically rotates through backup credentials (`BACKUP_APIFY_TOKEN`, `BACKUP_APIFY_TOKEN_2`, etc.) and retries.
* **Pre-Filtering Deduplication:** Before calling expensive transcript scraper actors, the system cross-references URLs against the Notion database to ensure we do not scrape a post we have already processed.

---

### Step 3: Single-Step LLM Filter (Relevance & Disambiguation)
To prevent your Notion databases from filling up with unrelated spam, the AI runs a single-step review:

* **Pillar Relevance Check:** The AI matches the post against active content pillars:
  * *Active Pillars:* Automation, AI Creative, AI Prompting & Tools, Vibe Coding, Creator Economy, Copywriting and Storytelling, Personal/Vulnerability, Building in Public.
  * *Frozen Pillars:* Web3 and Psychology remain readable for historical records, but they are ignored for new content processing and idea generation.
  * *Relevance threshold:* Must match an active pillar with a confidence score of $\ge 0.6$ or it is ignored.
  * *Expanded Context Limit:* The pipeline passes up to **100,000 characters** of the content/transcript to the LLM (expanded from 6,000 characters) to ensure full-length YouTube transcripts and X Articles are analyzed completely without early truncation.
  * *Scout Pass 1 cleaning:* YouTube/Instagram transcripts are deterministically cleaned (`prepareScoutContentBody`) — strip SFX, filler lines, consecutive dedupe — before gem extraction. Dense YT transcripts shrink ~0%.
* **Disambiguation Check:** Drops false-positives that match keywords by coincidence.
  * *Example:* A sports news post mentions "Kimi Antonelli" (an F1 racer) or "Amen Thompson" (an NBA player). The AI detects this is sports entertainment news rather than actionable tech or creator content, and automatically discards it.

---

### Step 4: Write to "Scouted Content" Database
For posts that pass the filters, the AI generates a 2-3 sentence **AI Summary** and 3-5 bulleted **Key Takeaways**. 

* **Notion Transcript Storage (fixes bare drafts):** A prior bug hard-truncated the `Transcript` property to 2,000 characters and skipped the page-body toggle — the Strategist only saw a snippet, producing shallow outlines. **Current behavior:**
  1. **`Transcript` property:** Chunked rich_text elements (2,000 chars each, up to 100 chunks via `splitIntoRichText()`) — not a single 2k substring.
  2. **Page body:** The **full, uncut transcript** is appended inside a collapsible toggle (`▶️ Full Transcript`) as batched paragraph blocks.
  3. **Read path:** `getScoutedContentByIds` extracts the toggle text via `extractRawTranscriptFromPageBody()` and passes it to the Strategist as authoritative source text.

#### Example Notion Scouted Entry:
* **Title:** "The Future of Vibe Coding with Claude Code"
* **Platform:** YouTube
* **Likes:** 10,200 | **Views:** 240,000
* **AI Summary:** "Explains how Claude Code allows non-developers to build full applications directly in terminal sessions."
* **Takeaways:**
  * Terminal-based AI agent speeds up development loops.
  * Natural language files are parsed directly into codebase changes.
* **Page Body:**
  ```markdown
  ▶️ Full Transcript
    [Full 15,000-character transcript text is safely stored here...]
  ```

---

### Step 5: The Source-First Two-Actor Idea Engine
The idea engine uses a **hybrid trigger**: after `scout-content` finishes (Mon/Thu/Sun), it immediately dispatches **draft-ideas** with that run's scouted page IDs. **draft-ideas** also runs on a Wed/Fri catch-all cron to draft any unlinked scouted content added manually or outside scout runs. The **Value Strategist** studies one source at a time using MiniMax M3 via TokenRouter to generate a detailed Execution Plan, and the **Writer Actor** turns it into the final tweet, thread, long tweet, or article using Grok 4.3 via TokenRouter.

#### Actor 1: The Value Strategist (`draft-ideas`)
1. **Automated Cleanup**: Archives any existing Idea Bank entries marked as "Rejected", severing their relation to scouted content and freeing it for reuse.
2. Queries **Scouted Content** from the past 7 days, filtering out entries already linked to generated ideas.
3. Reads the **Viral Post Library** for patterns rated ⭐⭐⭐⭐ or higher.
4. Reads the full source context for each page:
   - `Title`, `Platform`, `URL`, `AI Summary`, `Key Takeaways`, and `Niche`.
   - Full transcript/source text from the Notion page body toggle when present.
   - X posts fall back to the full stored title/text plus summary/takeaways when no transcript exists.
5. Applies **transcript budget** (`src/lib/transcript-cleaner.ts`) before each strategist call:
   - Deterministic clean for YouTube/Instagram (strip SFX brackets, filler-only lines, consecutive dedupe) — ~0% reduction on dense YT transcripts.
   - **Head+tail trim** (65/35 split with omission marker) only when cleaned text still exceeds `strategistMaxTranscriptChars` (**30,000** — raised from 20k after measurement showed 22k YT sources need full coverage).
   - MiniMax M3 calls use **streaming** (`strategistUseStreaming: true`) to prevent TokenRouter gateway idle cutoff during the `<think>` phase.
6. Processes each source independently through the **Multi-Phase Comprehension Pipeline**:
   - **Phase 1: Comprehend** — studies the transcript to build structured prose comprehension (intent, overlapping audience, costs of inaction, teachable units).
   - **Phase 2: Brainstorm** — evaluates teachable units to brainstorm distinct outputs across formats (Article, Thread, Mid-length, Short) and formats primary value bombs.
   - **Phase 3: Select** — selects 1-2 formats to execute (enforcing format diversity if quality is high).
   - **Phase 4: Plan** — matches hooks using `hook-matcher.ts` (tokenized keyword matching from the 100 Hook Templates), plans a detailed outline (section by section), structures the viral tweet body layout, and extracts **Talking Points** (3–7 publishable bullets) plus **Step by Step Process** (ordered how-to steps when the source supports it).
7. Produces a detailed `ExecutionPlan` containing outline details, hook templates, talking points, step-by-step process, source evidence, and audience mapping.
8. Writes the plan details to the Ideas Bank (status: 💭 Raw) in clean, readable markdown headers, and dispatches the Writer asynchronously.

#### Actor 2: The Writer (`write-tweets`)
1. Receives the `ExecutionPlan` (which extends the legacy `ValueBrief` schema) and the Notion Idea page ID, including **Talking Points** and **Step by Step Process** when present.
2. Loads committed creator voice samples from `src/data/creator-voice-samples.json` and selects the top 5 matching examples based on voice mode:
   - **Builder-Retrospective** → Dreyshq samples (first-person, scar tissue)
   - **Tool-Curator** → Sharbel samples (analytical, metric-dense, arrow lists)
   - **Case-Study** → Zaimiri samples (operator wisdom, lowercase openers, "bro")
3. Treats the source as the absolute authority and the viral template as packaging only.
4. If drafting an **Article**, loads 3 full, untruncated articles from `src/data/article-examples.json` as few-shot reference inputs.
5. Uses the outline, hook template, source facts, numbers, tools, examples, mechanism, and do-not-invent guardrails.
6. Generates the draft using **Grok-4.3** (`x-ai/grok-4.3` via TokenRouter) at temperature 0.7.
7. Validates draft depth:
   - **Article**: Validates target is >= 1200 words (target: 1500–3000 words) with >= 4 named `##` sections.
   - **Thread**: Validates target is >= 8 posts (target: 8–15 posts) with progressive reasoning.
   - Retries generation once with an expansion hint if validation fails.
8. Updates the Notion Idea with the final draft and sets the status to 📝 Drafted.

#### Example of a Remix:
* **Scouted Input:** A transcript about using Claude Code to build static websites.
* **100 Viral Hooks Template:**
  * *Pattern:* "I built a [Product] in [Time] using [Tool]..."
* **ExecutionPlan Output:**
  * **Title:** "Claude Code Static Sites"
  * **Voice Mode:** Builder-Retrospective
  * **Format:** Thread
  * **Detailed Outline:** 
    1. Hook: Scroll-stopper showing speed.
    2. Setup: Installing Claude Code on the terminal.
    3. Workflow: Initializing the app with a single prompt.
    4. Execution: How Claude handles the build process.
    5. Takeaway: The shift to agentic vibe coding.
  * **Hook Filled Example:** "I built a full web app in 3 minutes using Claude Code. Here's how..."
  * **Talking Points:** terminal install, single-prompt init, agentic build loop, no boilerplate needed
  * **Step by Step Process:** 1. Install Claude Code → 2. Run init prompt → 3. Let agent build → 4. Deploy static output
  * **Do Not Invent:** no fake build time, fake revenue, or unsupported claims
* **Writer Output (via Grok-4.3):**
  ```text
  I built a full web app in 3 minutes using Claude Code.

  No templates. No boilerplate. Just one sentence in terminal.

  Here's the exact workflow 🧵

  [1/5] Install Claude Code on your terminal...
  ```

---

### Step 6: Write to "Ideas Bank" Database
The generated drafts are written directly to the **Ideas Bank** database.
* **Two-Phase Write**: The Value Strategist creates the Idea page (status: 💭 Raw) with the source-grounded ExecutionPlan metadata. The Writer Actor then updates the same page with the finished draft (status: 📝 Drafted).
* **Source-Grounded Notes**: The Idea page body is written in clean, human-readable markdown headers (e.g., What This Source Is About, Outline, Talking Points, Step by Step Process, Hook, Key Source Details, etc.) to give a clean user interface without raw JSON dumps or escape characters.
* **Ready-to-Post Drafts**: Each idea includes a full, ready-to-post tweet or article draft styled according to your custom **Voice DNA Profile** with three distinct voice modes mapped to real creator examples.
  * *Plain-Language Rule:* Drafts should read like a smart builder explaining it to a friend: simple grammar, short sentences, niche-native terms when useful, and no fake-smart abstractions like "operational layer" or "signal extraction workflow".
  * *Bypassing Notion's 2,000 Character Limit:* The first 2,000 characters of the draft are stored in the `"Draft Tweet"` database page property for a quick preview, while the **entire, un-truncated draft** is placed inside a collapsible toggle block (`▶️ Full Draft Tweet`) inside the page body.
* **Deterministic Source Tracking**: Each draft links back to its single scouted catalyst page by using the source page ID directly from Notion.
* **Robust Pillar Mapping**: Generated pillars are passed through a validation check (`matchPillar()` in `src/lib/pillar-utils.ts`). It performs exact match, fuzzy substring checks, and custom heuristics to match the AI output with one of the 8 active pillars, preventing write validation errors or silent fallback to "Unknown".
* **Error Prevention**: If the relation schema has changed or is missing, the script catches the error and saves the idea anyway, preventing data loss.

---

### Operational Notes / Known Failure Modes
* **Bare drafts / thin outlines**: Usually means the Strategist saw a truncated transcript. Confirm the Scouted Content page has `▶️ Full Transcript` in the body and that `draft-ideas` logs show full `rawSourceText` depth. Run `npm run measure:transcripts` to validate cleaning reduction and head+tail needs against live Scouted Content.
* **Raw Ideas Need Investigation**: A page stuck in 💭 Raw usually means the Writer task has not finished or failed after dispatch. Check Trigger.dev task logs for `write-tweets` and inspect the outline or plan details in the Idea page body.
* **Voice Sample Source of Truth**: Production Writer prompts use `src/data/creator-voice-samples.json`. `.tmp/creator-voice-samples.json` is only a regeneration/export artifact and is not deployed.
* **Frozen Pillars**: Web3/Psychology records remain in Notion for history, but new matching, drafting, and category writes should resolve those themes to `Unknown` or skip them.

---

## Detailed System Configuration Reference

### 1. Notion Database Catalog
These are the exact database IDs used in the codebase.

#### Database IDs (Used for creating pages)
| Database Name | Database ID |
| :--- | :--- |
| **Viral Post Library** | `9c392141-a928-4813-a18e-676560fc4f62` |
| **Ideas Bank** | `38f85f8c-eccf-4679-a2d3-6c0e6d386e7d` |
| **Scouted Content** | `3674a5db-f371-80ad-8ec6-f3e99bdd4191` |
| **Creators (X)** | `18d75163-a3d6-455d-9d3d-2076f20d2fed` |
| **YouTube Creators** | `3674a5db-f371-80f9-8822-c0459d34168e` |
| **Instagram Creators** | `3674a5db-f371-809a-88a9-d122c712139b` |
| **Content Pipeline** | `8cc7a479-7eea-4092-a11b-81381d4524b0` |

#### Data Source IDs (Used for database queries)
| Database Name | Data Source ID |
| :--- | :--- |
| **Viral Post Library** | `93504640-6cf8-4676-9b4a-f74c8b706387` |
| **Ideas Bank** | `553eb2c3-82cb-4fb7-abff-6652cb694e4a` |
| **Scouted Content** | `3674a5db-f371-802c-b23e-000b7d73be04` |
| **Creators (X)** | `24e6bb9b-b226-4ff6-86b4-f6a72493029d` |
| **YouTube Creators** | `3674a5db-f371-80d3-bac9-000befffdd42` |
| **Instagram Creators** | `3674a5db-f371-80d2-bece-000b0dd38da2` |
| **Content Pipeline** | `4bfdc801-348f-4203-8966-9720d3e11088` |

---

### 2. Database Field Properties

#### Ideas Bank DB Schema
| Property Name | Property Type | Value Description |
| :--- | :--- | :--- |
| `Idea` | Title | Compelling title summarizing the post concept |
| `Source` | Select | Hardcoded to `"Idea Scout"` |
| `Category` | Multi-select | Maps to the matched content pillar(s) |
| `Hook Angle` | Rich text | Breakdown of the hook psychology |
| `Why it works` | Rich text | Human psychology driver behind the concept |
| `Status` | Select | Defaults to `"💭 Raw"` |
| `Priority` | Select | AI priority selection (`🔥 Hot`, `💡 Good`, `📝 Maybe`) |
| `Format Idea` | Select | Suggests structure (`Short`, `Thread`, `Video`) |
| `Steal-able Pattern`| Rich text | Copied from the Viral Post Library pattern template |
| `Tweet Structure` | Rich text | Copied from the Viral Post Library structure template |
| `Draft Tweet` | Rich text | Ready-to-post draft tweet matching Voice DNA (first 2,000 characters) |
| `Inspired By (Scouted)` | Relation | Link back to the Scouted Content database entry |

#### Scouted Content DB Schema
| Property Name | Property Type | Value Description |
| :--- | :--- | :--- |
| `Title` | Title | Post title (capped at 200 characters) |
| `Platform` | Select | Platform source (`X`, `YouTube`, `Instagram`) |
| `URL` | URL | Link to the original video or post |
| `Likes` | Number | Number of likes |
| `Views` | Number | Number of views |
| `Comments` | Number | Number of comments |
| `Published Date` | Date | Date when the post was uploaded |
| `Scouted Date` | Date | Date when our system scouted it |
| `AI Summary` | Rich text | 2-3 sentence content overview |
| `Key Takeaways` | Rich text | 3-5 bulleted learnings |
| `Transcript` | Rich text | Chunked rich_text preview (2k per element); full transcript in page-body `▶️ Full Transcript` toggle |
| `YouTube Creators` | Relation | Relation link back to YT Creators database |
| `Instagram Creators` | Relation | Relation link back to IG Creators database |
| `👤 Twitter Creators` | Relation | Relation link back to X Creators database |

---

### 3. File Directory Structure

```text
src/
├── data/
│   ├── article-examples.json        — Curated untruncated X Article references for few-shot learning.
│   ├── creator-voice-samples.json   — Committed, reviewed few-shot examples for Writer voice modes.
│   └── viral-hook-templates.json    — 100 parsed hook templates.
│
├── lib/
│   ├── apify.ts                     — Controls YouTube & Instagram scrapers, handles token rotation.
│   ├── content-intelligence.ts      — Types and schemas for the multi-stage strategist pipeline.
│   ├── draft-validator.ts           — Depth validation gate for writer drafts (word counts and section counts).
│   ├── hook-matcher.ts              — Tokenizes and matches templates from the 100 Viral Hooks library.
│   ├── idea-scout-config.ts         — Central configuration (strategistMaxTranscriptChars: 30k, strategistUseStreaming, timeouts).
│   ├── transcript-cleaner.ts      — Deterministic YT/IG clean, head+tail budget for Strategist, scout Pass 1 body prep.
│   ├── notion.ts                    — Handles all database reads/writes, transcript toggle storage, and idea updates.
│   ├── twitter.ts                   — Controls TwitterAPI.io requests and views filters.
│   ├── llm.ts                       — TokenRouter client for MiniMax M3 and Grok 4.3; also houses legacy OpenRouter.
│   ├── voice-dna.ts                 — Voice DNA prompts, ExecutionPlan type, and buildWriterPrompt().
│   ├── pillar-utils.ts              — Content pillar alias mapping, fuzzy matching, and category filtering.
│   └── constants.ts                 — Stores Notion database IDs, source IDs, and content pillars list.
│
└── trigger/
    ├── idea-scout/
    │   ├── scout-content.ts         — Orchestrator. Fetches creators and starts scrapers.
    │   ├── process-content.ts       — Filters content relevance and writes to Scouted Content.
    │   ├── comprehend-source.ts     — VALUE STRATEGIST: Multi-phase strategist comprehension planner.
    │   ├── draft-ideas.ts           — VALUE STRATEGIST: Queries prioritized content, executes planner, and dispatches the writer.
    │   └── write-tweets.ts          — WRITER ACTOR: Drafts source-grounded long-form and short-form drafts via Grok-4.3.
    │
    └── viral-library/
        └── research-tweets.ts       — Ported from n8n. Scrapes & analyzes top tweets to populate the Viral Post Library.
```

---

### 4. Background Workers Configuration
The system uses the following task registrations in Trigger.dev:

| Task ID | Trigger Type | Schedule / Trigger | Max Duration | Concurrency | Model |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `scout-content` | `schedules.task` | Mon/Thu/Sun 3:30 AM UTC (`30 3 * * 1,4,0`) | 14400 seconds (4 hours) | 1 | — |
| `process-content`| `task` | Batched from orchestrator | 300 seconds (5 minutes) | 5 (queue limit) | `MiniMax-M3` (TokenRouter) |
| `draft-ideas` | `schedules.task` | Triggered by `scout-content` (immediate) + Wed/Fri 4:30 AM UTC catch-all (`30 4 * * 3,5`) | 900 seconds | 1 | `MiniMax-M3` (TokenRouter) |
| `write-tweets` | `task` | Triggered by `draft-ideas` | 600 seconds (10 minutes) | — | `x-ai/grok-4.3` (TokenRouter) |
| `research-tweets` | `task` | On-demand (Manual Run) | 14400 seconds (4 hours) | 1 | `MiniMax-M3` (TokenRouter) |

---

### 5. Setup & Environment Variables
Create a `.env` file in the root directory:

```env
# Notion API
NOTION_API_KEY=secret_notion_key_goes_here

# TokenRouter (LLM Client for Idea Scout)
TOKENROUTER_API_KEY=tr-your-key-here

# OpenRouter (Optional: Used for legacy scripts or on-demand research only)
OPENROUTER_API_KEY=sk-or-your-key
OPENROUTER_MODEL=qwen/qwen3.6-plus

# X (Twitter) Scraper wrapper
TWITTER_API_KEY=your-twitterapi-io-key
TWITTER_MIN_VIEWS=3000

# Apify Scraper Keys (Rotates automatically to share credit loads)
APIFY_TOKEN=primary-apify-token
BACKUP_APIFY_TOKEN=backup-token-1
BACKUP_APIFY_TOKEN_2=backup-token-2
BACKUP_APIFY_TOKEN_3=backup-token-3
BACKUP_APIFY_TOKEN_4=backup-token-4

# Trigger.dev Credentials
TRIGGER_SECRET_KEY=tg_secret_key
TRIGGER_ENV=dev
```

---

### 6. Deployment Checklist

1. **Upload Secrets:** In your Trigger.dev Dashboard, add ALL environment variables to the production environment:
   - `NOTION_API_KEY`
   - `TOKENROUTER_API_KEY` ⚠️ **Critical** — missing this causes strategist and writer failures.
   - `APIFY_TOKEN` + `BACKUP_APIFY_TOKEN` through `BACKUP_APIFY_TOKEN_4`
   - `BACKUP_TWITTER_API_KEY`
   - `TWITTER_MIN_VIEWS` (default: `3000`)
2. **Run Deploy Command:** Run this in your terminal to sync your workers to production:
   ```bash
   npx trigger.dev@latest deploy
   ```
3. **Verify runs:** Run a test execution from the Trigger.dev dashboard to confirm everything is linked correctly.
4. **Validate transcript cap:** `npm run measure:transcripts` — measures real Scouted Content cleaning reduction and head+tail needs at the 30k strategist cap.
