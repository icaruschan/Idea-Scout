# Directive: Consolidated Idea Scout Pipeline (v3)

## Goal

Maintain and execute the autonomous creator research and idea drafting pipeline. It monitors target creators across YouTube, Instagram, and X (Twitter) every Monday, Thursday, and Saturday at 8:30 AM UTC (9:30 AM local time), evaluates new uploads for relevance against 9 active content pillars, and saves summaries in Notion. A decoupled task running every Monday through Saturday at 8:00 AM UTC (9:00 AM local time) then synthesizes strategic tweet drafts in the Notion Ideas Bank by cross-pollinating newly scouted concepts with templates from a Viral Post Library. Additionally, a manually triggered Viral Post Research task (`research-tweets`) gathers the highest performing tweets from X focus creators, runs a content strategist LLM analysis, and populates the Viral Post Library with proven structures and patterns.

---

## 1. Environment Variables Required

Ensure these are populated in `.env` for local testing and loaded into the Trigger.dev dashboard for production runs:

```env
# Notion API Configuration
NOTION_API_KEY=

# OpenRouter / LLM Client Configuration
OPENROUTER_API_KEY=
OPENROUTER_MODEL=qwen/qwen3.6-plus   # Default model fallback

# Twitter API (TwitterAPI.io wrapper client)
BACKUP_TWITTER_API_KEY=

# Twitter Programmatic Filter Configuration
TWITTER_MIN_VIEWS=1000               # Default fallback is 1000

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

## 3. The 9 Active Content Pillars

The filter checks content relevance against these specific domains. If a piece of content matches none, it is discarded.

1. **Automation** (n8n workflows, Make.com, AI agents, execution pipelines, RPA vs agents)
2. **AI Creative** (video/image gen, Kling, Runway, UGC, ad creatives, faceless channels)
3. **AI Prompting & Tools** (prompt engineering, Claude Projects, Gems, hidden settings, MCP servers)
4. **Vibe Coding** (Cursor, Claude Code, Windsurf, coding apps using LLMs without traditional code)
5. **Web3** (crypto culture, Base/Solana, tokenized agents, DeFi x AI convergent utilities)
6. **Creator Economy** (audience growth, newsletter monetization, Gumroad launches, funnels)
7. **Copywriting and Storytelling** (hooks, tweet structures, PAS/AIDA frameworks, sales copy)
8. **Personal/Vulnerability** (emotional resonance, failures, founder's transparent updates)
9. **Building in Public** (MRR milestones, shipping features, open build logs, retrospective audits)

> [!WARNING]
> The **Psychology** pillar is frozen. Existing database records are kept intact, but the filter must ignore it for new content processing.

---

## 4. Pipeline Architecture & Execution Flow

```
Trigger.dev Mon/Thu/Sat Cron
│
└── scout-content (Runs 8:30 AM UTC Mon/Thu/Sat | maxDuration: 14400s)
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
    │      ├── C. Relevance check: LLM checks content maps to 9 pillars (reject if < 0.6 confidence)
    │      ├── D. Disambiguation check: LLM filters out false positives (e.g., Mercedes driver Kimi Antonelli, NBA athlete Amen Thompson)
    │      ├── E. Summarization: LLM extracts summary and actionable key takeaways (bullets with →)
    │      └── F. Notion insert: Create Scouted Content page, establishing creator relation
    └── 4. Update Last Checked date ONLY for successfully processed creators (failed creators are skipped)

Trigger.dev Mon-Sat Cron
│
└── draft-ideas (Runs 8:00 AM UTC Mon-Sat | maxDuration: 900s)
    ├── 1. Gather context from all sources:
    │      ├── A. Unused Scouted Content (from past 7 days, filtering out those already linked to Ideas)
    │      ├── B. Top 30 Viral Posts (4★+)
    │      ├── C. Past 30 days of generated Idea titles (soft dedup)
    │      └── D. Category distribution balance (prioritize underserved pillars)
    ├── 2. Group scouted posts into buckets based on their "Niche" property in Notion (falling back to AI-Keyword Sorter regex matching if empty)
    ├── 3. Parallelize LLM synthesis across niche groups in concurrency-limited batches of 3 to avoid timeouts
    ├── 4. Gather and flatten all generated ideas
    └── 5. Sequentially write the ideas to the Ideas Bank Notion database with a 350ms throttle delay, resolving Inspired By relations using the unique Notion Page IDs matching loop (UUID regex) with cleanTitle title-substring matching as a fallback safety net

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

### Synthesis & Drafting Task (`draft-ideas`)
The synthesis engine runs independently on its scheduled days:
1. Cleans up any Ideas Bank entries marked as "Rejected" (archiving them) to sever relations and free up the associated scouted content for reuse.
2. Queries the past 7 days of Scouted Content, filtering out entries that are already linked to generated ideas in the `"Linked Ideas"` relation (Source Deduplication).
3. Queries the top 30 highly-rated (`⭐⭐⭐⭐`/`⭐⭐⭐⭐⭐`) Viral Post Library patterns (increased from 15).
4. Queries the past 30 days of generated Idea titles to ensure soft deduplication.
5. Queries the past 14 days of Ideas Bank category distribution to focus on underserved pillars.
6. Groups scouted posts by their `"Niche"` multi-select property (instead of general creator categories).
7. Processes groups in parallel batches of 3:
   - Filters templates to only those containing Category tags relevant to the current niche.
   - Instructs the LLM (via OpenRouter) to cross-pollinate the niche's raw insights with the matched templates.
8. Gathers, flattens, and writes the synthesized ideas back to Notion:
   - Validates and fuzzy-maps the generated pillars using `matchPillar()` (from `src/lib/pillar-utils.ts`) to avoid silent defaults.
   - Applies the deterministic UUID relation matching to extract the Notion Page ID from the LLM output's `"inspiredByScoutedIds"` and links the relation, falling back to `cleanTitle` string matching if empty.
   - Sequentially invokes Notion's API, introducing a `350ms` throttle pause between writes to strictly stay under Notion's rate limits.
   - The entries written contain:
     - Compelling title anchor containing a specific metric/tool/amount (Anti-template rules)
     - Source: `"Idea Scout"`
     - Categories and Hook Angles
     - Relation link back to `Scouted Content`
     - Page Body: Source Context recap, rough draft copy, why it works explanation, and patterns used.
9. Decoupled Business Logic: The core synthesis logic is extracted into a named export `runDraftIdeas` so it can be run and verified locally using `scripts/test-draft-locally.ts` without Trigger.dev overhead.


---

## 5. Concurrency & Rate Limiting

The pipeline controls concurrency at multiple levels to prevent API exhaustion:

| Layer | Control | Why |
| :--- | :--- | :--- |
| **Apify IG Transcripts** | Max 3 concurrent actors + 2s cooldown between chunks | Prevents 8192MB free-tier memory exhaustion (was causing 402 errors) |
| **process-content tasks** | Trigger.dev `queue.concurrencyLimit: 5` and `maxDuration: 300s` | Prevents 300+ parallel tasks flooding Notion (3 req/s limit) and OpenRouter, with 5 min safety buffer |
| **Trigger.dev Batch Chunking** | Chunk raw content items into groups of 15 with 2s cooldown | Prevents parent orchestrator from hanging indefinitely in "waiting" state |
| **OpenAI/OpenRouter Client** | 120s client-side request timeout | Prevents tasks from hanging indefinitely on slow API requests, increased from 60s to handle parallel synthesis workloads |
| **LLM Synthesis Parallelization** | Concurrency limit of 3 | Processes 3 niche groups concurrently to prevent network/connection saturation while speeding up the pipeline |
| **Notion batch reads** | `getScoutedContentByIds` chunks into batches of 5 + 350ms delay | Stays under Notion's 3 req/s rate limit |
| **Notion writes throttle** | 350ms delay between consecutive `createIdea` requests | Strictly prevents Notion 429 rate limit errors when writing newly drafted ideas |
| **Inter-platform cooldowns** | 5s pause between YT→IG and IG→Twitter phases | Lets Apify actors release memory before next phase |
| **Twitter API throttle** | 5.5s delay between requests + exponential backoff on 429/5xx | Respects 1 QPS free-tier limit |

---

## 6. Edge Cases & Learnings

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
