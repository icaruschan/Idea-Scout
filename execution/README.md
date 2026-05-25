# ⚙️ Deterministic Execution Layer (Layer 3)

Agentic Workflows support both **TypeScript** and **Python** for deterministic execution (Layer 3). In this project, the core pipeline tasks, web scraping, and API clients are implemented in TypeScript/Node.js to run natively within **Trigger.dev** schedules and task queues. However, Python scripts can be added under `execution/` for specialized data processing, machine learning models, or utility scripts.

---

## 📂 Execution Code Organization

This project structures execution logic across both environments:

### 1. TypeScript Execution (Core Pipeline)

- **`src/lib/` (Deterministic Clients & Helpers):**
  - `notion.ts`: Handles Notion database reads (using `dataSources.query` for API v5 compliance) and writes (`pages.create`, `pages.update`).
  - `apify.ts`: Integrates with Apify actors for YouTube channel scraping, Instagram reels fetching, and the Apple Yang transcription failover workflow.
  - `twitter.ts`: Communicates with TwitterAPI.io to pull recent tweets and applies the programmatic view filter.
  - `llm.ts`: Structured OpenRouter API client for relevance classification, disambiguation, summary extraction, and idea drafting.
- **`src/tasks/` (Trigger.dev Jobs):**
  - Tasks registered in the Trigger.dev dashboard (e.g., `scout-content`, `draft-ideas`) which are scheduled via cron or triggered sequentially.
- **`scripts/` (Local Utilities & Scrapers):**
  - Run-once tools used for manual auditing, DB schema validation, and debugging.
- **`test-*.ts` (Local Testing Harnesses):**
  - Self-contained files to test specific components (e.g. `test-scraping.ts`, `test-twitter.ts`, `test-pipeline-integration.ts`) without triggering a full production deploy.

### 2. Python Execution (Optional Extensions)

- **`execution/` (Python Executables):**
  - Contains deterministic Python scripts and utilities. 
  - To invoke Python executables from Trigger.dev or other TypeScript files, use Node.js `child_process.spawn` or `execSync`, ensuring proper environment variable passing.

---

## 🛠️ Execution Layer Rules

1. **Strict Types & Schemas:** Every execution module must use explicit interfaces and types (e.g. `ScoutedContentInput`, `CreatorEntry`) to prevent data corruption.
2. **Environment Variables:** All secrets and API keys must be loaded from `.env` in the root directory via standard Node.js configuration (`process.env`).
3. **Failover & Resilience:** Critical execution steps (like third-party scraping) must incorporate robust error-handling, interval delays (e.g. 5-second sleep between Twitter requests to prevent rate limits), and failover mechanisms (like rotating through `BACKUP_APIFY_TOKEN` variables).
4. **No Direct Execution Logic in Orchestration:** Orchestrators should only query inputs, handle scheduling, and trigger execution tasks, leaving the actual data mutations to the deterministic functions in `src/lib/`.
5. **No Placeholders:** All code must be complete, functional, and testable.
