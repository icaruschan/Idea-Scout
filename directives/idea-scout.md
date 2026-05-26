# Directive: Consolidated Idea Scout Pipeline (v3)

## Goal

Maintain and execute the autonomous weekly creator research and idea drafting pipeline. It monitors target creators across YouTube, Instagram, and X (Twitter) on Tuesday mornings (4:30 AM UTC / 5:30 AM local), evaluates new uploads for relevance against 9 active content pillars, summarizes findings, and synthesizes strategic tweet drafts in the Notion Ideas Bank by cross-pollinating scouted concepts with templates from a Viral Post Library.

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
Trigger.dev Tuesday Cron
│
└── scout-content (Runs 4:30 AM UTC Tue | maxDuration: 3600s)
    ├── 1. Gather active creators (YT: 10, IG: 10, X: 24) sorted by Last Checked (oldest first)
    ├── 2. Scrape content streams:
    │      ├── YT: Scrapes newest 5 videos (Apify Actor)
    │      ├── IG: Pulls newest 30 reels, selects the 5 newest + 5 highest-viewed reels,
    │      │       and transcribes all 10 selected reels concurrently (using apple_yang transcript scraper)
    │      └── X: Queries all recent tweets via search query and applies programmatic view filter (views >= TWITTER_MIN_VIEWS)
    ├── 3. Execute process-content in a concurrent batch task for all scraped items
    │      ├── A. Duplicate check: Verify title does not clash with 14-day history
    │      ├── B. Relevance check: LLM checks content maps to 9 pillars (reject if < 0.6 confidence)
    │      ├── C. Disambiguation check: LLM filters out false positives (e.g., Mercedes driver Kimi Antonelli, NBA athlete Amen Thompson)
    │      ├── D. Summarization: LLM extracts summary and actionable key takeaways (bullets with →)
    │      └── E. Notion insert: Create Scouted Content page, establishing creator relation
    ├── 4. Update Last Checked date on creators to rotate roster
    └── 5. Trigger draft-ideas to draft concepts from processed scouted list
```

### Synthesis & Drafting Task (`draft-ideas`)
The synthesis engine runs following successful content processing:
1. Queries the top 15 highly-rated (`⭐⭐⭐⭐`/`⭐⭐⭐⭐⭐`) Viral Post Library patterns.
2. Queries the past 30 days of generated Idea titles to ensure soft deduplication.
3. Queries the past 14 days of Ideas Bank category distribution to focus on underserved pillars.
4. Instructs the LLM (via OpenRouter) to cross-pollinate new insights with VPL layouts.
5. Saves 5-8 raw concepts into the `Ideas Bank` Notion database containing:
   - Compelling title anchor containing a specific metric/tool/amount (Anti-template rules)
   - Source: `"Idea Scout"`
   - Categories and Hook Angles
   - Relation link back to `Scouted Content`
   - Page Body: Source Context recap, rough draft copy, why it works explanation, and patterns used.

---

## 5. Edge Cases & Learnings

- **Notion Relation Failures:** Relation linking during `createIdea` can sometimes error with `validation_error` or `object_not_found`. The client catches this error and automatically retries the insert without the `Inspired By` relations to keep task executions green.
- **Twitter API Rate Limits & Indexing:** Implement a 5-second interval sleep between X creator searches in the fetching loop. We pull all recent tweets and programmatically filter them using `MIN_VIEWS` (default 1000) rather than using search parameter filters which suffer from search index delay. We do not apply bookmark filtering as high-signal viral tweets often have 0 bookmarks.
- **Apify Token Rotation:** If the main `APIFY_TOKEN` fails or runs out of credits, the system automatically rotates through a failover array of backup tokens (`BACKUP_APIFY_TOKEN` through `BACKUP_APIFY_TOKEN_4`).
- **Scraper Constraints:** YouTube limits channel queries to `maxItems: 5`. Instagram reels pulls up to `resultsLimit: 30` per creator, selecting the 5 newest and 5 top-performing (most viewed) reels for concurrent audio transcript mapping, reducing run times and costs.
- **Title Formatting Rules:** The LLM is prohibited from generating template titles (e.g. *"The [Adjective] [Noun] Framework"* or *"The X Arbitrage"*). Every title must contain a specific name, metric, or monetary value (e.g., *"$0 Technical Co-Founder"*).
