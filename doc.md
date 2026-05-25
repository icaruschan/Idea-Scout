# Idea Scout Logic Review Report

Date: 2026-05-25
Scope: Static logic review of the current Idea Scout pipeline plus a read-only live Notion schema check. No paid scraper, LLM, or Notion write tests were run.

## Executive Summary

The Idea Scout architecture is sound, but several current code paths do not match the documented behavior. The most important fixes are:

1. Preserve full transcripts when writing Scouted Content.
2. Make YouTube and Instagram relation property names consistent between writes and duplicate lookups.
3. Make `draft-ideas` use the actual `scoutedContentIds` from the current run.
4. Fix Viral Post Library property reads so the LLM receives the real template content.
5. Fix the Ideas Bank `Why It Works` property name so idea writes do not fail.
6. Remove Twitter API key logging and align env var names.
7. Align the documented schedule with the real Trigger cron.
8. Clean up documentation claims that do not match intentional behavior, especially the OpenRouter single-model setup.

## Findings

### P1 - Full transcripts are not actually preserved

Status: Confirmed.

Evidence:
- `src/lib/notion.ts` is capable of writing long transcript content via `splitIntoRichText(input.transcript)` and `splitIntoParagraphBlocks(input.transcript)`.
- But `src/trigger/idea-scout/process-content.ts` passes only `transcript.substring(0, 2000)` into `createScoutedContent`.

Current code:

```ts
// src/trigger/idea-scout/process-content.ts
transcript: transcript.substring(0, 2000),
```

Impact:
- The Scouted Content `Transcript` property and the `Full Transcript` toggle both receive only the first 2,000 characters.
- This contradicts README/directive claims that the full transcript is stored in the page body.
- Long YouTube/Instagram transcripts lose most of their source context.

Recommended fix:
- Pass the full transcript to `createScoutedContent`.
- Let `createScoutedContent` decide how much to write to the database property vs the body toggle.

Suggested change:

```ts
transcript,
```

Optional hardening:
- Add a separate `transcriptPreview` field if the database property should stay short.
- Keep the full transcript only in the page body toggle if Notion property limits become a concern.

Files:
- `src/trigger/idea-scout/process-content.ts`
- `src/lib/notion.ts`

### P1 - Drafting ignores the current run's processed IDs

Status: Confirmed.

Evidence:
- `draftIdeas` receives `payload.scoutedContentIds`.
- It logs the count.
- It does not use those IDs to fetch source content.
- Instead it calls `getRecentScoutedContent(7)`.

Current code:

```ts
// src/trigger/idea-scout/draft-ideas.ts
const [scoutedContent, viralPosts, existingTitles, pillarCounts] =
  await Promise.all([
    getRecentScoutedContent(7),
    getTopViralPosts(15),
    getRecentIdeaTitles(30),
    getPillarDistribution(14),
  ]);
```

Impact:
- A run that processes 3 new items may generate drafts from unrelated items scraped up to 7 days earlier.
- Old items can be repeatedly remixed.
- `scoutedContentIds` gives a false sense of run-scoped lineage.
- Relation linking back to Scouted Content becomes fuzzy and unreliable.

Recommended fix:
- Add a Notion helper like `getScoutedContentByIds(ids: string[])`.
- In `draft-ideas.ts`, fetch exactly `payload.scoutedContentIds`.
- Use recent 7-day content only as fallback when IDs are missing or empty.

Suggested flow:

```ts
const scoutedContent = payload.scoutedContentIds.length
  ? await getScoutedContentByIds(payload.scoutedContentIds)
  : await getRecentScoutedContent(7);
```

Files:
- `src/trigger/idea-scout/draft-ideas.ts`
- `src/lib/notion.ts`

### P1 - Viral Post Library property names are mismatched

Status: Confirmed in code, local schema docs, and read-only live Notion schema check.

Evidence:
- `Notion Knowledge/notion_database_map.md` documents the primary Viral Post Library title as `Post Title`.
- It documents the structure field as `Tweet Structure`.
- Live Notion schema also has `Post Title`, `Post Content`, `Steal-able Pattern`, and `Tweet Structure`.
- Live Notion schema does not have `Tweet` or `Structure`.
- `draft-ideas.ts` reads `Tweet` and `Structure` instead.

Current code:

```ts
const tweetText = p["Tweet"]?.title?.[0]?.plain_text || "";
const structure = p["Structure"]?.select?.name || "";
const stealable =
  p["Steal-able Pattern"]?.rich_text?.[0]?.plain_text || "";
```

Expected from docs:

```ts
const tweetText = p["Post Title"]?.title?.[0]?.plain_text || "";
const structure =
  p["Tweet Structure"]?.rich_text?.[0]?.plain_text || "";
```

Impact:
- Viral library records may be fetched but formatted into mostly empty template summaries.
- The LLM loses the proven pattern context that the whole remix step depends on.
- Generated ideas may become generic despite having valid scouted content.

Recommended fix:
- Update `draft-ideas.ts` to read the documented primary fields.
- Optionally support both old and new names during migration.

Suggested resilient mapping:

```ts
const tweetText =
  p["Post Title"]?.title?.[0]?.plain_text ||
  p["Tweet"]?.title?.[0]?.plain_text ||
  p["Post Content"]?.rich_text?.[0]?.plain_text ||
  "";

const structure =
  p["Tweet Structure"]?.rich_text?.[0]?.plain_text ||
  p["Structure"]?.select?.name ||
  "";
```

Files:
- `src/trigger/idea-scout/draft-ideas.ts`
- `src/lib/notion.ts` if this mapping is moved into a helper.

### P1 - Ideas Bank `Why It Works` property name is wrong

Status: Confirmed against live Notion schema.

Evidence:
- Live Ideas Bank schema contains `Why It Works`.
- `src/lib/notion.ts` writes `Why it works`.
- Notion property names are exact, so this casing mismatch can trigger a validation error when `options.whyItWorks` is present.

Current code:

```ts
properties["Why it works"] = {
  rich_text: [
    { text: { content: options.whyItWorks.substring(0, 2000) } },
  ],
};
```

Expected:

```ts
properties["Why It Works"] = {
  rich_text: [
    { text: { content: options.whyItWorks.substring(0, 2000) } },
  ],
};
```

Impact:
- `draft-ideas` now passes `whyItWorks` into `createIdea`, so idea creation can fail at the write step.
- If it fails inside the loop, each affected idea is skipped after logging an error.
- Local schema docs and README also use `Why it works`, so the docs need to be updated to match live Notion.

Recommended fix:
- Change the writer to `Why It Works`.
- Update `README.md`, `RECAP.md`, and `Notion Knowledge/notion_database_map.md` to use the live property name.

Files:
- `src/lib/notion.ts`
- `README.md`
- `RECAP.md`
- `Notion Knowledge/notion_database_map.md`

### P2 - YouTube/Instagram creator relation names differ between writes and duplicate lookups

Status: Confirmed in code, local schema docs, and read-only live Notion schema check.

Evidence:
- `createScoutedContent` writes YouTube relation under `YouTube Creators`.
- `createScoutedContent` writes Instagram relation under `Instagram Creators`.
- `getScoutedItemsForCreator` queries `👤 YouTube Creators` and `👤 Instagram Creators`.
- For X, both writer and lookup use `👤 Twitter Creators`.
- Live Scouted Content schema has `YouTube Creators`, `Instagram Creators`, and `👤 Twitter Creators`. It does not have `👤 YouTube Creators` or `👤 Instagram Creators`.

Current writer:

```ts
creatorRelation["YouTube Creators"] = { relation: [{ id: input.creatorPageId }] };
creatorRelation["Instagram Creators"] = { relation: [{ id: input.creatorPageId }] };
creatorRelation["👤 Twitter Creators"] = { relation: [{ id: input.creatorPageId }] };
```

Current lookup:

```ts
relationField = "👤 YouTube Creators";
relationField = "👤 Instagram Creators";
relationField = "👤 Twitter Creators";
```

Impact:
- Per-creator duplicate lookup for YouTube/Instagram likely fails and returns empty arrays.
- URL deduplication still happens later in `process-content.ts` via `checkUrlExists(url)`, so exact duplicates are usually filtered before writing.
- However, for Instagram this happens after metadata fetch and transcript calls, so duplicate reels can still burn Apify transcript credits before being filtered.
- Title-based duplicate protection for YouTube/Instagram is weakened.

Recommended fix:
- Use one central relation-property map for both read and write paths.
- Based on local docs, likely correct values are:

```ts
const SCOUTED_CREATOR_RELATION_BY_PLATFORM = {
  YouTube: "YouTube Creators",
  Instagram: "Instagram Creators",
  X: "👤 Twitter Creators",
} as const;
```

Files:
- `src/lib/notion.ts`

### P2 - Ideas are not linked back to the Viral Post Library

Status: Confirmed.

Evidence:
- `createIdea` supports `inspiredByLibraryId`.
- `draft-ideas.ts` fetches Viral Post Library records but formats them as plain text and never preserves the page IDs in the LLM output or write step.
- The database docs say Ideas Bank should track lineage to both Scouted Content and Viral Post Library patterns.

Impact:
- New Ideas Bank entries may include copied pattern text but no `Inspired By (Library)` relation.
- It becomes harder to audit which proven pattern created a draft.
- Future feedback loops cannot reliably measure which library templates produce the best ideas.

Recommended fix:
- Include a stable library identifier in each formatted viral template, such as `libraryId: post.id`.
- Ask the LLM to return the chosen template ID or select a template deterministically before generation.
- Pass the selected ID into `createIdea` as `inspiredByLibraryId`.

Files:
- `src/trigger/idea-scout/draft-ideas.ts`
- `src/lib/notion.ts`

### P2 - Documentation claims a two-step filter, but code uses one LLM call

Status: Confirmed.

Evidence:
- `README.md` describes a two-tier LLM filter: pillar relevance and disambiguation.
- `src/trigger/idea-scout/process-content.ts` makes one `generateJSON` call for relevance.
- Disambiguation examples are included inside the same system prompt, but there is no separate second LLM verification step.

Impact:
- The documentation overstates the runtime behavior.
- Operators may think false-positive disambiguation is independently verified when it is actually prompt-guided inside the relevance call.

Recommended fix:
- If one call is intended, update README/directive/recap wording to say "single relevance filter with disambiguation rules in the prompt."
- If two calls are intended, add a second deterministic disambiguation task before summarization.

Files:
- `src/trigger/idea-scout/process-content.ts`
- `README.md`
- `directives/idea-scout.md`
- `RECAP.md`

### P2 - Twitter client logs part of the API key

Status: Confirmed.

Evidence:

```ts
// src/lib/twitter.ts
console.log("src/lib/twitter.ts API_KEY:", API_KEY ? API_KEY.substring(0, 8) + "..." : "undefined");
```

Impact:
- Even partial secrets should not be printed in runtime logs.
- Logs may end up in Trigger.dev or local console history.

Recommended fix:
- Remove the log entirely.
- If needed, log only whether a key is configured:

```ts
if (!API_KEY) {
  console.warn("TwitterAPI.io key is not configured.");
}
```

Files:
- `src/lib/twitter.ts`

### P2 - Twitter env var name is inconsistent

Status: Confirmed.

Evidence:
- `src/lib/twitter.ts` only reads `BACKUP_TWITTER_API_KEY`.
- `README.md` setup uses `TWITTER_API_KEY`.
- `.env` currently contains both names, but production may not.
- `directives/idea-scout.md` uses `BACKUP_TWITTER_API_KEY`.
- `RECAP.md` lists both.

Impact:
- A correctly configured `TWITTER_API_KEY` from README can still result in no API key at runtime if `BACKUP_TWITTER_API_KEY` is missing.
- This can silently make X scraping return empty arrays because `searchCreatorPosts` catches errors and returns `[]`.

Recommended fix:
- Prefer primary key first, fallback to backup:

```ts
const API_KEY = process.env.TWITTER_API_KEY || process.env.BACKUP_TWITTER_API_KEY;
```

Files:
- `src/lib/twitter.ts`
- `README.md`
- `directives/idea-scout.md`
- `RECAP.md`

### P2 - Schedule docs disagree with current code

Status: Confirmed.

Evidence:
- `src/trigger/idea-scout/scout-content.ts` cron is `30 23 * * 1`, Monday 11:30 PM.
- `README.md` also says Monday 11:30 PM.
- `directives/idea-scout.md` says Wednesday morning / 8:00 AM.
- `RECAP.md` says Wednesday 8 AM and even lists `0 8 * * 3`.

Impact:
- Human operators and agents may deploy or reason from the wrong schedule.
- If the intended schedule is Wednesday 8 AM, the code is wrong.
- If Monday 11:30 PM is intended, the directive and recap are wrong.

Recommended fix:
- Decide the actual intended schedule.
- Update all docs and code to one value.

If Wednesday 8 AM is intended:

```ts
cron: "0 8 * * 3"
```

If Monday 11:30 PM is intended:

```ts
cron: "30 23 * * 1"
```

Files:
- `src/trigger/idea-scout/scout-content.ts`
- `README.md`
- `directives/idea-scout.md`
- `RECAP.md`

### P2 - TwitterAPI.io pagination is ignored

Status: Confirmed from local TwitterAPI.io docs and code.

Evidence:
- `Notion Knowledge/twitterapi-io-docs.md` documents `cursor`, `has_next_page`, and `next_cursor` for `/twitter/tweet/advanced_search`.
- `searchCreatorPosts` makes one request and returns only `response.data?.tweets || []`.

Impact:
- X scouting only sees the first page of results for each creator.
- For active creators, the pipeline can miss qualifying posts within the requested lookback window.
- Since the code later slices to 10 non-duplicate tweets, missing pages can reduce quality and diversity.

Recommended fix:
- Add pagination support with a bounded max page count, such as 3-5 pages per creator.
- Stop early when enough non-duplicate, above-threshold posts are found.
- Keep rate-limit pauses between creator calls or page calls as needed.

Files:
- `src/lib/twitter.ts`
- `src/trigger/idea-scout/scout-content.ts`

### P2 - README claims OpenRouter model fallback, but code intentionally uses one model

Status: Confirmed. Per operator preference, the intended behavior is one configured model only.

Evidence:
- `README.md` says the AI engine uses `qwen/qwen3.6-plus` "with fallback to Claude/Gemini models."
- `src/lib/llm.ts` uses `process.env.OPENROUTER_MODEL || "qwen/qwen3.6-plus"` and does not implement fallback model retries.

Impact:
- This is a documentation bug, not necessarily a code bug.
- Future agents may add unwanted fallback behavior because the docs say it exists.

Recommended fix:
- Update README/recap/directive wording to say the system uses one configured OpenRouter model.
- Keep `OPENROUTER_MODEL` as the only model selector.

Files:
- `README.md`
- `RECAP.md`
- `directives/idea-scout.md` if model behavior is described there.

### P3 - Local test/verification commands are not wired in package.json

Status: Confirmed, but less important if Antigravity runs its own tooling.

Evidence:

```json
"test": "echo \"Error: no test specified\" && exit 1"
```

Installed top-level packages do not include `typescript`, `tsx`, or `ts-node`.

Impact:
- The scripts in `scripts/*.ts` are useful but not directly exposed through `npm run`.
- A future agent may assume `npm test` validates the pipeline when it currently always fails.

Recommended fix:
- Add explicit scripts and dev dependencies, or document that Antigravity owns execution.

Suggested package additions:

```json
"scripts": {
  "dev": "npx trigger dev",
  "test": "npm run test:twitter",
  "test:twitter": "tsx scripts/test-twitter.ts",
  "test:scrapers": "tsx scripts/test-scrapers.ts",
  "test:pipeline": "tsx scripts/test-pipeline-integration.ts"
}
```

If adding dependencies:

```bash
npm install -D typescript tsx
```

Files:
- `package.json`

### P3 - One live Viral Post Library rating option is excluded

Status: Confirmed against live Notion schema and records.

Evidence:
- Live Viral Post Library rating options include `★★★★★` in addition to the emoji-star options.
- `getTopViralPosts` filters `⭐⭐⭐⭐⭐`, `⭐⭐⭐⭐⭐ (Holy Grail)`, and `⭐⭐⭐⭐`, but not `★★★★★`.
- A read-only live query found one post currently using `★★★★★`.

Impact:
- At least one high-rated Viral Library entry is currently invisible to the pattern-mining step.

Recommended fix:
- Either normalize that live record to the canonical rating option, or include `★★★★★` in the filter during migration.

Files:
- `src/lib/notion.ts`

### P3 - URL normalization is too narrow for duplicate protection

Status: Confirmed by code review.

Evidence:
- `cleanContentUrl` removes a small tracker list and normalizes `youtu.be`.
- It does not normalize `twitter.com` to `x.com`, Instagram query/share parameters like `igsh`, URL fragments, or platform-specific trailing variants.

Impact:
- Exact duplicate checks can miss the same content under a slightly different share URL.
- The risk is highest for X and Instagram shared links.

Recommended fix:
- Expand `cleanContentUrl` with platform-specific normalization for X/Twitter, Instagram reels, and YouTube Shorts/watch URLs.
- Use the same normalized URL everywhere: scrape-time dedup, `checkUrlExists`, and writes.

Files:
- `src/lib/notion.ts`

### P3 - Apify backup key names are inconsistent in docs

Status: Confirmed.

Evidence:
- `src/lib/apify.ts` reads `APIFY_TOKEN`, `BACKUP_APIFY_TOKEN`, and numbered keys named `BACKUP_APIFY_TOKEN_2`, `BACKUP_APIFY_TOKEN_3`, etc.
- `README.md` text says `APIFY_TOKEN_2`, while the environment block correctly shows `BACKUP_APIFY_TOKEN_2`.

Impact:
- Minor setup confusion for future operators.

Recommended fix:
- Update README wording to use the exact env var names from code.

Files:
- `README.md`

## Additional Notes

### Notion `dataSources.query` usage is valid

The installed `@notionhq/client@5.14.0` includes `notion.dataSources.query`, so the Notion v5 read pattern itself is not the problem.

### Exact duplicate writes are partly protected

Even if the YouTube/Instagram per-creator relation lookup fails, `process-content.ts` still calls `checkUrlExists(url)` before writing. This means exact URL duplicates should usually not be written twice. The remaining issue is wasted scraper/transcription work and weaker title deduplication.

### Live Notion schema verification was read-only

The following live schemas were checked without writes: Viral Post Library, Scouted Content, Ideas Bank, YouTube Creators, Instagram Creators, and X Creators. This confirmed the exact property names for the highest-risk Notion findings.

### Scraper logic was not live-run

This review did not run Apify scraper jobs, OpenRouter LLM calls, TwitterAPI.io search calls, or Notion write operations. The report is based on static code, local documentation, and read-only live Notion schema checks. Before deploying fixes, run:

```powershell
npm run dev
```

Then trigger a small controlled `scout-content` or use targeted tests from Antigravity.

## Recommended Fix Order

1. Fix full transcript truncation.
2. Fix `draft-ideas` to use current run IDs.
3. Fix Viral Post Library field mapping.
4. Fix Ideas Bank `Why It Works` casing.
5. Fix relation field mapping for YouTube/Instagram.
6. Preserve/link Viral Post Library lineage.
7. Remove Twitter API key logging and normalize env vars.
8. Align schedule docs/code.
9. Update docs for one-model OpenRouter behavior and one-step filter behavior.
10. Wire local test commands if desired.

## Suggested Acceptance Checks

1. A long transcript over 2,000 characters appears in the Scouted Content page body toggle beyond the first 2,000 characters.
2. Running the same Instagram reel twice does not call the transcript actor the second time.
3. `draft-ideas` logs and uses only the IDs produced by the current `scout-content` run.
4. The LLM synthesis prompt includes non-empty Viral Post Library title, pattern, and structure fields.
5. Ideas are written with the live `Why It Works` property and do not fail Notion validation.
6. Ideas can link back to both Scouted Content and the chosen Viral Post Library template.
7. Twitter module logs no secret material.
8. README, directive, recap, and `scout-content.ts` all show the same cron schedule.
9. README no longer claims Claude/Gemini fallback models unless code intentionally implements fallback.
