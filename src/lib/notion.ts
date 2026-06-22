import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import { NOTION_DATABASE_IDS, NOTION_DATA_SOURCE_IDS } from "./constants";
import { filterCategoryList } from "./pillar-utils";
dotenv.config({ override: true });

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface CreatorEntry {
  pageId: string;
  name: string;
  handle: string; // channel URL for YT, handle for IG/Twitter
  lastChecked: string | null;
}

export interface CreateIdeaOptions {
  priority?: "🔥 Hot" | "💡 Good" | "📝 Maybe";
  formatIdea?: "Short" | "Mid-length" | "Thread" | "Article" | "Video";
  inspiredByLibraryId?: string;
  inspiredByScoutedIds?: string[];
  stealablePattern?: string;
  tweetStructure?: string;
  whyItWorks?: string;
  draftTweet?: string;
}

export interface ScoutedContentForDraft {
  pageId: string;
  title: string;
  platform: string;
  aiSummary: string;
  keyTakeaways: string;
  url: string;
  pillars: string[];
  creatorPageId: string;
  transcriptPreview: string;
  /** Transcript/caption/post body only — excludes metadata wrapper used in sourceText */
  rawSourceText: string;
  sourceText: string;
}

/** Length of actual source content (transcript/caption/post), not the wrapped strategist context. */
export function getRawSourceDepth(
  source: Pick<ScoutedContentForDraft, "rawSourceText" | "transcriptPreview" | "title">,
): number {
  const raw = source.rawSourceText || source.transcriptPreview || source.title || "";
  return raw.trim().length;
}

const IDEAS_BANK_WHY_IT_WORKS_KEYS = [
  "Why it works",
  "Why It Works",
  "💡 Why It Works",
] as const;

function applyWhyItWorksProperty(
  properties: Record<string, any>,
  value: string,
  propertyKey: (typeof IDEAS_BANK_WHY_IT_WORKS_KEYS)[number] = IDEAS_BANK_WHY_IT_WORKS_KEYS[0],
): void {
  properties[propertyKey] = {
    rich_text: [{ text: { content: value.substring(0, 2000) } }],
  };
}

export interface ScoutedContentInput {
  title: string;
  platform: "X" | "YouTube" | "Instagram";
  url: string;
  likes: number;
  views: number;
  comments: number;
  publishedDate: string;
  aiSummary: string;
  keyTakeaways: string;
  transcript: string;
  creatorPageId: string;
  pillars?: string[];
}

// ═══════════════════════════════════════════════════════════════
// CREATOR QUERIES (for Idea Scout Step 1: GATHER)
// ═══════════════════════════════════════════════════════════════

/**
 * Get active YouTube creators, sorted by Last Checked (oldest first).
 * This naturally rotates through the roster over time.
 */
export async function getYouTubeCreators(
  limit: number = 10,
): Promise<CreatorEntry[]> {
  try {
    const response = await notion.dataSources.query({
      data_source_id: NOTION_DATA_SOURCE_IDS.YOUTUBE_CREATORS,
      filter: {
        property: "Status",
        status: { equals: "Active" },
      },
      sorts: [
        { property: "Last Checked", direction: "ascending" },
      ],
      page_size: limit,
    });

    return response.results.map((page: any) => {
      const p = page.properties || {};
      return {
        pageId: page.id,
        name: p["Name"]?.title?.[0]?.plain_text || "",
        handle: p["Channel URL"]?.url || "",
        lastChecked: p["Last Checked"]?.date?.start || null,
      };
    });
  } catch (error) {
    console.error("Error fetching YouTube creators:", error);
    return [];
  }
}

/**
 * Get Instagram creators, sorted by Last Checked (oldest first).
 * Note: IG Creators DB has no Status property, so we fetch all.
 */
export async function getInstagramCreators(
  limit: number = 10,
): Promise<CreatorEntry[]> {
  try {
    const response = await notion.dataSources.query({
      data_source_id: NOTION_DATA_SOURCE_IDS.INSTAGRAM_CREATORS,
      sorts: [
        { property: "Last Checked", direction: "ascending" },
      ],
      page_size: limit,
    });

    return response.results.map((page: any) => {
      const p = page.properties || {};
      const handle =
        p["Instagram Handle"]?.rich_text?.[0]?.plain_text ||
        p["Profile URL"]?.url?.replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "") ||
        "";
      return {
        pageId: page.id,
        name: p["Name"]?.title?.[0]?.plain_text || "",
        handle,
        lastChecked: p["Last Checked"]?.date?.start || null,
      };
    });
  } catch (error) {
    console.error("Error fetching Instagram creators:", error);
    return [];
  }
}

/**
 * Get active Twitter (X) focus creators, sorted by Last Checked (oldest first).
 */
export async function getTwitterCreators(
  limit: number = 24,
): Promise<CreatorEntry[]> {
  try {
    const response = await notion.dataSources.query({
      data_source_id: NOTION_DATA_SOURCE_IDS.CREATORS,
      sorts: [
        { property: "Last Checked", direction: "ascending" },
      ],
      page_size: 100, // Fetch a larger batch to support programmatic filtering
    });

    const creators = response.results.map((page: any) => {
      const p = page.properties || {};
      const niches: string[] = p["Niche"]?.multi_select?.map((s: any) => s.name) || [];
      return {
        pageId: page.id,
        name: p["Handle"]?.title?.[0]?.plain_text || "",
        handle: (p["Handle"]?.title?.[0]?.plain_text || "").replace(/^@/, ""),
        lastChecked: p["Last Checked"]?.date?.start || null,
        niches,
      };
    });

    // Programmatically filter out any creators whose niches contain "Web3" (case-insensitive)
    const filtered = creators.filter((c) => {
      return !c.niches.some((n) => n.toLowerCase().includes("web3"));
    });

    // Return up to the requested limit
    return filtered.slice(0, limit).map(({ pageId, name, handle, lastChecked }) => ({
      pageId,
      name,
      handle,
      lastChecked,
    }));
  } catch (error) {
    console.error("Error fetching Twitter creators:", error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// CREATOR LIFECYCLE
// ═══════════════════════════════════════════════════════════════

/**
 * Update a creator's Last Checked date to today.
 * Works for any creator DB (YT, IG, Twitter).
 */
export async function updateCreatorLastChecked(
  pageId: string,
): Promise<void> {
  try {
    await notion.pages.update({
      page_id: pageId,
      properties: {
        "Last Checked": {
          date: { start: new Date().toISOString().split("T")[0] },
        },
      },
    });
  } catch (error) {
    console.error(`Error updating Last Checked for ${pageId}:`, error);
    // Non-blocking — don't throw, just log
  }
}

// ═══════════════════════════════════════════════════════════════
// SCOUTED CONTENT (for Idea Scout Step 2: STORE)
// ═══════════════════════════════════════════════════════════════

// Helper to guarantee string types (e.g. if the LLM output parsed as an array or object)
function safeString(val: any): string {
  if (val === undefined || val === null) return "";
  if (typeof val === "string") return val;
  if (Array.isArray(val)) {
    return val.map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v))).join("\n");
  }
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

// Helper to safely parse dates of various formats to YYYY-MM-DD
function safeFormatDate(dateStr: any): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split("T")[0];
    }
  } catch (err) {
    console.warn(`Failed to parse date string: ${dateStr}`, err);
  }
  return null;
}

// Helper to split a long string into Notion's rich text array elements (max 2000 chars each)
function splitIntoRichText(text: string): any[] {
  const str = safeString(text);
  if (!str) return [];
  const chunks: string[] = [];
  const chunkSize = 2000;
  for (let i = 0; i < str.length && chunks.length < 100; i += chunkSize) {
    chunks.push(str.substring(i, i + chunkSize));
  }
  return chunks.map((chunk) => ({
    text: { content: chunk },
  }));
}

// Helper to split a long string into paragraph blocks (max 2000 chars each)
function splitIntoParagraphBlocks(text: string): any[] {
  const str = safeString(text);
  if (!str) return [];
  const chunks: string[] = [];
  const chunkSize = 2000;
  for (let i = 0; i < str.length; i += chunkSize) {
    chunks.push(str.substring(i, i + chunkSize));
  }
  return chunks.map((chunk) => ({
    object: "block" as const,
    type: "paragraph" as const,
    paragraph: {
      rich_text: [{ text: { content: chunk } }],
    },
  }));
}

async function appendBlocksInBatches(pageId: string, blocks: any[]) {
  const batchSize = 80;
  for (let i = 0; i < blocks.length; i += batchSize) {
    await notion.blocks.children.append({
      block_id: pageId,
      children: blocks.slice(i, i + batchSize),
    });
    if (i + batchSize < blocks.length) {
      await new Promise((r) => setTimeout(r, 350));
    }
  }
}

function getRichTextPlain(prop: any): string {
  if (!prop?.rich_text) return "";
  return prop.rich_text.map((r: any) => r.plain_text || "").join("");
}

function getTitlePlain(prop: any): string {
  if (!prop?.title) return "";
  return prop.title.map((r: any) => r.plain_text || "").join("");
}

function getBlockRichText(block: any): string {
  const typed = block?.[block?.type];
  const richText = typed?.rich_text || typed?.caption || [];
  if (!Array.isArray(richText)) return "";
  return richText.map((r: any) => r.plain_text || "").join("");
}

export function extractPlainTextFromNotionBlocks(blocks: any[]): string {
  return blocks
    .map((block) => getBlockRichText(block))
    .filter(Boolean)
    .join("\n\n");
}

async function getBlockChildrenPlainText(blockId: string): Promise<string> {
  const chunks: string[] = [];
  let cursor: string | undefined;

  do {
    const response: any = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });

    for (const block of response.results || []) {
      const ownText = getBlockRichText(block);
      if (ownText) chunks.push(ownText);
      if (block.has_children) {
        const childText = await getBlockChildrenPlainText(block.id);
        if (childText) chunks.push(childText);
      }
    }

    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return chunks.filter(Boolean).join("\n\n");
}

export function buildSourceTextFromScoutedContentFields(input: {
  title: string;
  platform: string;
  url: string;
  aiSummary: string;
  keyTakeaways: string;
  transcriptPreview?: string;
  pageBodyText?: string;
}): string {
  const fullSourceText = input.pageBodyText || input.transcriptPreview || input.title;
  return [
    `SOURCE TITLE:\n${input.title}`,
    `PLATFORM:\n${input.platform}`,
    input.url ? `SOURCE URL:\n${input.url}` : "",
    input.aiSummary ? `AI SUMMARY:\n${input.aiSummary}` : "",
    input.keyTakeaways ? `KEY TAKEAWAYS:\n${input.keyTakeaways}` : "",
    `FULL TRANSCRIPT / SOURCE TEXT:\n${fullSourceText}`,
  ].filter(Boolean).join("\n\n---\n\n");
}

async function mapScoutedPageForDraft(page: any): Promise<ScoutedContentForDraft> {
  const p = page.properties || {};
  const creatorPageId =
    p["YouTube Creators"]?.relation?.[0]?.id ||
    p["Instagram Creators"]?.relation?.[0]?.id ||
    p["👤 Twitter Creators"]?.relation?.[0]?.id ||
    "";
  const title = getTitlePlain(p["Title"]);
  const platform = p["Platform"]?.select?.name || "";
  const aiSummary = getRichTextPlain(p["AI Summary"]);
  const keyTakeaways = getRichTextPlain(p["Key Takeaways"]);
  const transcriptPreview = getRichTextPlain(p["Transcript"]);
  const url = p["URL"]?.url || "";
  const pageBodyText = await getBlockChildrenPlainText(page.id);

  const rawSourceText = pageBodyText || transcriptPreview || title;

  return {
    pageId: page.id,
    title,
    platform,
    aiSummary,
    keyTakeaways,
    url,
    pillars: p["Niche"]?.multi_select?.map((s: any) => s.name) || [],
    creatorPageId,
    transcriptPreview,
    rawSourceText,
    sourceText: buildSourceTextFromScoutedContentFields({
      title,
      platform,
      url,
      aiSummary,
      keyTakeaways,
      transcriptPreview,
      pageBodyText,
    }),
  };
}

/**
 * Write a scouted content entry to the 🔍 Scouted Content DB.
 * Automatically sets the correct creator relation based on platform.
 */
export async function createScoutedContent(
  input: ScoutedContentInput,
): Promise<string> {
  try {
    // Determine which creator relation to populate based on platform
    const creatorRelation: Record<string, any> = {};
    if (input.platform === "YouTube") {
      creatorRelation["YouTube Creators"] = {
        relation: [{ id: input.creatorPageId }],
      };
    } else if (input.platform === "Instagram") {
      creatorRelation["Instagram Creators"] = {
        relation: [{ id: input.creatorPageId }],
      };
    } else if (input.platform === "X") {
      creatorRelation["👤 Twitter Creators"] = {
        relation: [{ id: input.creatorPageId }],
      };
    }

    const formattedPublishedDate = safeFormatDate(input.publishedDate);

    const pageParams: any = {
      parent: { database_id: NOTION_DATABASE_IDS.SCOUTED_CONTENT },
      properties: {
        Title: {
          title: [{ text: { content: safeString(input.title).substring(0, 200) } }],
        },
        Platform: {
          select: { name: input.platform },
        },
        URL: {
          url: input.url ? cleanContentUrl(input.url) : null,
        },
        Likes: {
          number: input.likes || 0,
        },
        Views: {
          number: input.views || 0,
        },
        Comments: {
          number: input.comments || 0,
        },
        ...(formattedPublishedDate
          ? { "Published Date": { date: { start: formattedPublishedDate } } }
          : {}),
        "Scouted Date": {
          date: { start: new Date().toISOString().split("T")[0] },
        },
        "AI Summary": {
          rich_text: splitIntoRichText(input.aiSummary),
        },
        "Key Takeaways": {
          rich_text: splitIntoRichText(input.keyTakeaways),
        },
        Transcript: {
          rich_text: splitIntoRichText(safeString(input.transcript).substring(0, 2000)),
        },
        ...creatorRelation,
        ...(input.pillars && input.pillars.length > 0 ? {
          "Niche": {
            multi_select: filterCategoryList(input.pillars).map((p) => ({ name: p })),
          },
        } : {}),
      },
    };

    if (input.transcript && input.transcript.trim()) {
      pageParams.children = [
        {
          object: "block" as const,
          type: "toggle" as const,
          toggle: {
            rich_text: [{ text: { content: "▶️ Full Transcript" } }],
            children: splitIntoParagraphBlocks(input.transcript),
          },
        },
      ];
    }

    const response = await notion.pages.create(pageParams);

    return response.id;
  } catch (error) {
    console.error("Error creating Scouted Content entry:", error);
    throw error;
  }
}

/**
 * Clean content URL by removing tracking/share query parameters and normalizing formatting.
 */
export function cleanContentUrl(url: string): string {
  if (!url) return "";
  try {
    const parsed = new URL(url.trim());

    // Normalize hostname for X/Twitter
    if (
      parsed.hostname === "twitter.com" ||
      parsed.hostname === "www.twitter.com" ||
      parsed.hostname === "mobile.twitter.com" ||
      parsed.hostname === "www.x.com"
    ) {
      parsed.hostname = "x.com";
    }

    // Platform-specific query parameter stripping
    if (parsed.hostname === "x.com") {
      // Strip all query parameters for X/Twitter URLs
      parsed.search = "";
    } else if (
      parsed.hostname === "instagram.com" ||
      parsed.hostname === "www.instagram.com"
    ) {
      // Strip all query parameters for Instagram URLs
      parsed.search = "";
    } else {
      // For other domains (like YouTube), just remove common tracker / share params
      const trackerParams = [
        "si",
        "feature",
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
        "gclid",
        "igsh",
        "igshid",
        "s",
        "t",
        "ref",
        "ref_src",
        "src",
        "fbclid",
      ];
      trackerParams.forEach((param) => parsed.searchParams.delete(param));
    }

    // Normalize youtu.be to youtube.com/watch?v=
    if (parsed.hostname === "youtu.be") {
      const videoId = parsed.pathname.substring(1);
      parsed.hostname = "www.youtube.com";
      parsed.pathname = "/watch";
      parsed.searchParams.set("v", videoId);
    }

    let normalized = parsed.toString();
    if (normalized.endsWith("/")) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch (e) {
    // If it's not a valid URL structure, just return trimmed/cleaned string
    let cleaned = url.trim();
    if (cleaned.endsWith("/")) {
      cleaned = cleaned.slice(0, -1);
    }
    return cleaned;
  }
}

/**
 * Check if a URL (clean version) already exists in the Scouted Content database.
 */
export async function checkUrlExists(url: string): Promise<boolean> {
  if (!url) return false;
  try {
    const cleanedUrl = cleanContentUrl(url);
    const response = await notion.dataSources.query({
      data_source_id: NOTION_DATA_SOURCE_IDS.SCOUTED_CONTENT,
      filter: {
        property: "URL",
        url: { equals: cleanedUrl },
      },
      page_size: 1,
    });
    return response.results.length > 0;
  } catch (error) {
    console.error(`Error checking URL existence for ${url}:`, error);
    return false;
  }
}

/**
 * Fetch all scouted content URLs and titles for a specific creator to prevent duplicates.
 */
export async function getScoutedItemsForCreator(
  creatorPageId: string,
  platform: "YouTube" | "Instagram" | "X",
): Promise<{ urls: string[]; titles: string[] }> {
  try {
    let relationField = "";
    if (platform === "YouTube") {
      relationField = "YouTube Creators";
    } else if (platform === "Instagram") {
      relationField = "Instagram Creators";
    } else if (platform === "X") {
      relationField = "👤 Twitter Creators";
    }

    if (!relationField) return { urls: [], titles: [] };

    const response = await notion.dataSources.query({
      data_source_id: NOTION_DATA_SOURCE_IDS.SCOUTED_CONTENT,
      filter: {
        property: relationField,
        relation: {
          contains: creatorPageId,
        },
      },
      page_size: 100,
    });

    const urls: string[] = [];
    const titles: string[] = [];

    for (const page of response.results as any[]) {
      const urlVal = page.properties?.["URL"]?.url || "";
      if (urlVal) {
        urls.push(cleanContentUrl(urlVal));
      }
      const titleVal = page.properties?.["Title"]?.title?.[0]?.plain_text || "";
      if (titleVal) {
        titles.push(titleVal.toLowerCase().trim());
      }
    }

    return { urls, titles };
  } catch (error) {
    console.error(`Error fetching scouted items for creator ${creatorPageId}:`, error);
    return { urls: [], titles: [] };
  }
}

/**
 * Fetch recent scouted content titles for dedup.
 * Returns titles from the past N days so we don't re-scout the same content.
 */
export async function getRecentScoutedTitles(
  days: number = 14,
): Promise<string[]> {
  try {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const response = await notion.dataSources.query({
      data_source_id: NOTION_DATA_SOURCE_IDS.SCOUTED_CONTENT,
      filter: {
        property: "Scouted Date",
        date: { on_or_after: sinceDate.toISOString().split("T")[0] },
      },
      page_size: 100,
    });

    return response.results
      .map(
        (page: any) =>
          page.properties?.["Title"]?.title?.[0]?.plain_text || "",
      )
      .filter(Boolean);
  } catch (error) {
    console.error("Error fetching recent scouted titles:", error);
    return [];
  }
}

/**
 * Fetch recent scouted content with full details for the synthesis step.
 * Returns content from the past N days with summaries and takeaways.
 */
export async function getRecentScoutedContent(
  days: number = 7,
  platform?: "X" | "YouTube" | "Instagram",
): Promise<ScoutedContentForDraft[]> {
  try {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const filters: any[] = [
      {
        property: "Scouted Date",
        date: { on_or_after: sinceDate.toISOString().split("T")[0] },
      },
      {
        property: "Linked Ideas",
        relation: { is_empty: true },
      },
    ];

    if (platform) {
      filters.push({ property: "Platform", select: { equals: platform } });
    }

    const fullFilter = { and: filters };

    const response = await notion.dataSources.query({
      data_source_id: NOTION_DATA_SOURCE_IDS.SCOUTED_CONTENT,
      filter: fullFilter,
      sorts: [{ property: "Scouted Date", direction: "descending" }],
      page_size: 50,
    });

    const results: ScoutedContentForDraft[] = [];
    const pages = response.results as any[];
    const BATCH_SIZE = 5;
    for (let i = 0; i < pages.length; i += BATCH_SIZE) {
      const batch = pages.slice(i, i + BATCH_SIZE);
      results.push(...await Promise.all(batch.map(mapScoutedPageForDraft)));
      if (i + BATCH_SIZE < pages.length) {
        await new Promise((r) => setTimeout(r, 350));
      }
    }

    return results;
  } catch (error) {
    console.error("Error fetching recent scouted content:", error);
    return [];
  }
}

/**
 * Fetch specific scouted content entries by their page IDs.
 */
export async function getScoutedContentByIds(
  ids: string[],
): Promise<ScoutedContentForDraft[]> {
  if (!ids || ids.length === 0) return [];
  try {
    const results: (ScoutedContentForDraft | null)[] = [];

    // Chunk requests to stay under Notion's 3 req/s rate limit
    const BATCH_SIZE = 5;
    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      const chunk = ids.slice(i, i + BATCH_SIZE);
      const chunkResults = await Promise.all(chunk.map(async (id) => {
        try {
          const page: any = await notion.pages.retrieve({ page_id: id });
          return mapScoutedPageForDraft(page);
        } catch (err) {
          console.error(`Error retrieving scouted content page ${id}:`, err);
          return null;
        }
      }));
      results.push(...chunkResults);
      // Delay between batches to respect Notion rate limits (~3 req/s)
      if (i + BATCH_SIZE < ids.length) {
        await new Promise(r => setTimeout(r, 350));
      }
    }

    return results.filter((item): item is NonNullable<typeof item> => item !== null);
  } catch (error) {
    console.error("Error fetching scouted content by IDs:", error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// IDEAS BANK (for Idea Scout Step 5: WRITE)
// ═══════════════════════════════════════════════════════════════

/**
 * Create a new idea in the Ideas Bank.
 * Supports "Idea Scout" as a source and Inspired By (Scouted) relations.
 */
export async function createIdea(
  title: string,
  source: string,
  pillar: string,
  hookAngle: string,
  rawData: string = "",
  options: CreateIdeaOptions = {},
) {
  try {
    const properties: Record<string, any> = {
      Idea: {
        title: [{ text: { content: title } }],
      },
      Source: {
        select: { name: source },
      },
      Category: {
        multi_select: filterCategoryList([pillar]).map((p) => ({ name: p })),
      },
      "Hook Angle": {
        rich_text: [{ text: { content: hookAngle.substring(0, 2000) } }],
      },
      Status: {
        select: { name: "💭 Raw" },
      },
    };

    if (options.priority) {
      properties["Priority"] = { select: { name: options.priority } };
    }
    if (options.formatIdea) {
      properties["Format Idea"] = { select: { name: options.formatIdea } };
    }
    if (options.stealablePattern) {
      properties["Steal-able Pattern"] = {
        rich_text: [
          { text: { content: options.stealablePattern.substring(0, 2000) } },
        ],
      };
    }
    if (options.tweetStructure) {
      properties["Tweet Structure"] = {
        rich_text: [
          { text: { content: options.tweetStructure.substring(0, 2000) } },
        ],
      };
    }
    if (options.whyItWorks) {
      applyWhyItWorksProperty(properties, options.whyItWorks);
    }
    if (options.draftTweet) {
      properties["Draft Tweet"] = {
        rich_text: splitIntoRichText(options.draftTweet.substring(0, 2000)),
      };
    }

    // Inspired By (Library) — single relation
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (
      options.inspiredByLibraryId &&
      uuidRegex.test(options.inspiredByLibraryId)
    ) {
      properties["Inspired By (Library)"] = {
        relation: [{ id: options.inspiredByLibraryId }],
      };
    }

    // Inspired By (Scouted) — multi relation
    if (options.inspiredByScoutedIds && options.inspiredByScoutedIds.length > 0) {
      properties["Inspired By (Scouted)"] = {
        relation: options.inspiredByScoutedIds
          .filter((id) => uuidRegex.test(id))
          .map((id) => ({ id })),
      };
    }

    const pageBody = {
      parent: { database_id: NOTION_DATABASE_IDS.IDEAS_BANK },
      properties,
      children: [
        {
          object: "block" as const,
          type: "heading_2" as const,
          heading_2: {
            rich_text: [{ text: { content: "🔍 Source Content" } }],
          },
        },
      ],
    };

    const pageBodyBlocks = [
      ...splitIntoParagraphBlocks(rawData),
      // Draft Tweet section (if provided)
      ...(options.draftTweet ? [
        {
          object: "block" as const,
          type: "toggle" as const,
          toggle: {
            rich_text: [{ text: { content: "▶️ Full Draft Tweet" } }],
            children: splitIntoParagraphBlocks(options.draftTweet),
          },
        },
      ] : []),
    ];

    try {
      const response = await notion.pages.create(pageBody);
      if (pageBodyBlocks.length > 0) {
        await appendBlocksInBatches(response.id, pageBodyBlocks);
      }
      return response.id;
    } catch (error: any) {
      const message = String(error?.message || "");

      // Retry with alternate Ideas Bank property casing for Why it works
      if (
        options.whyItWorks &&
        error?.code === "validation_error" &&
        message.toLowerCase().includes("why it works")
      ) {
        for (const propertyKey of IDEAS_BANK_WHY_IT_WORKS_KEYS.slice(1)) {
          try {
            const retryBody = {
              ...pageBody,
              properties: { ...pageBody.properties },
            };
            for (const key of IDEAS_BANK_WHY_IT_WORKS_KEYS) {
              delete retryBody.properties[key];
            }
            applyWhyItWorksProperty(retryBody.properties, options.whyItWorks, propertyKey);
            const response = await notion.pages.create(retryBody);
            if (pageBodyBlocks.length > 0) {
              await appendBlocksInBatches(response.id, pageBodyBlocks);
            }
            console.log(`Why it works written using property key "${propertyKey}"`);
            return response.id;
          } catch (retryError: any) {
            if (retryError?.code !== "validation_error") throw retryError;
          }
        }
      }

      // If the error is related to an invalid/missing relation ID, retry without it
      const isRelationError =
        (error?.code === "validation_error" &&
          error?.message?.includes("Inspired By")) ||
        (error?.code === "object_not_found" && options.inspiredByLibraryId);
      if (isRelationError) {
        console.warn(
          "Inspired By relation invalid, retrying without it.",
        );
        delete pageBody.properties["Inspired By (Library)"];
        delete pageBody.properties["Inspired By (Scouted)"];
        const response = await notion.pages.create(pageBody);
        if (pageBodyBlocks.length > 0) {
          await appendBlocksInBatches(response.id, pageBodyBlocks);
        }
        return response.id;
      }
      throw error;
    }
  } catch (error) {
    console.error("Error creating Idea in Notion:", error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════
// IDEAS BANK — DEDUP & BALANCE
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch recent idea titles from the Ideas Bank for soft dedup.
 * Returns titles from the past N days so the LLM can avoid generating duplicates.
 */
export async function getRecentIdeaTitles(
  days: number = 30,
): Promise<string[]> {
  try {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const response = await notion.dataSources.query({
      data_source_id: NOTION_DATA_SOURCE_IDS.IDEAS_BANK,
      filter: {
        timestamp: "created_time",
        created_time: {
          on_or_after: sinceDate.toISOString(),
        },
      },
      page_size: 100,
    });

    return response.results
      .map(
        (page: any) => page.properties?.["Idea"]?.title?.[0]?.plain_text || "",
      )
      .filter(Boolean);
  } catch (error) {
    console.error("Error fetching recent idea titles:", error);
    return []; // Non-blocking
  }
}

/**
 * Get pillar distribution from recent ideas to identify underserved pillars.
 * Returns a count of ideas per pillar over the past N days.
 */
export async function getPillarDistribution(
  days: number = 14,
): Promise<Record<string, number>> {
  try {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const response = await notion.dataSources.query({
      data_source_id: NOTION_DATA_SOURCE_IDS.IDEAS_BANK,
      filter: {
        timestamp: "created_time",
        created_time: {
          on_or_after: sinceDate.toISOString(),
        },
      },
      page_size: 100,
    });

    const distribution: Record<string, number> = {};
    for (const page of response.results as any[]) {
      const categories = page.properties?.["Category"]?.multi_select || [];
      for (const cat of categories) {
        distribution[cat.name] = (distribution[cat.name] || 0) + 1;
      }
    }
    return distribution;
  } catch (error) {
    console.error("Error fetching pillar distribution:", error);
    return {}; // Non-blocking
  }
}

// ═══════════════════════════════════════════════════════════════
// VIRAL POST LIBRARY (for Idea Scout Step 3: SYNTHESIZE)
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch top viral posts for pattern mining (4★ + 5★, last 30 days).
 * These provide the PROVEN FORMAT templates for idea drafting.
 */
export async function getTopViralPosts(limit = 15) {
  try {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - 30);

    const response = await notion.dataSources.query({
      data_source_id: NOTION_DATA_SOURCE_IDS.VIRAL_POST_LIBRARY,
      filter: {
        and: [
          {
            or: [
              { property: "⭐ Rating", select: { equals: "⭐⭐⭐⭐⭐" } },
              {
                property: "⭐ Rating",
                select: { equals: "⭐⭐⭐⭐⭐ (Holy Grail)" },
              },
              { property: "⭐ Rating", select: { equals: "⭐⭐⭐⭐" } },
              { property: "⭐ Rating", select: { equals: "★★★★★" } },
            ],
          },
          {
            property: "Added Date",
            date: { on_or_after: sinceDate.toISOString().split("T")[0] },
          },
        ],
      },
      sorts: [{ property: "Added Date", direction: "descending" }],
      page_size: limit,
    });
    return response.results;
  } catch (error) {
    console.error("Error fetching from Viral Library:", error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════
// TRENDING TOPICS (legacy — kept for backwards compat)
// ═══════════════════════════════════════════════════════════════

const PLATFORM_ORIGIN_MAP: Record<string, string> = {
  "Apify Global Trends": "X",
  "TwitterAPI Trends": "X",
  Reddit: "Reddit",
  "Hacker News": "News",
  "Google News": "News",
  "Creator Pulse": "X",
};

export async function logTrend(
  topic: string,
  volume: number,
  pillar: string,
  analysis: string,
  querySource: string = "X",
  urgency: "🔴 24 Hours" | "🟡 1 Week" | "🟢 1 Month" = "🔴 24 Hours",
) {
  try {
    const platformOrigin = PLATFORM_ORIGIN_MAP[querySource] || "X";
    const response = await notion.pages.create({
      parent: { database_id: NOTION_DATABASE_IDS.TRENDING_TOPICS },
      properties: {
        "Topic/Trend": {
          title: [{ text: { content: topic } }],
        },
        Relevance: {
          multi_select: [{ name: pillar }],
        },
        Notes: {
          rich_text: [{ text: { content: `Volume: ${volume} | ${analysis}` } }],
        },
        "Platform Origin": {
          select: { name: platformOrigin },
        },
        Status: {
          select: {
            name: urgency?.includes("24 Hours")
              ? "🔥 Hot"
              : urgency?.includes("1 Week")
                ? "📌 Watch"
                : "💤 Slow Burn",
          },
        },
        Urgency: {
          select: { name: urgency },
        },
        "Date Logged": {
          date: { start: new Date().toISOString().split("T")[0] },
        },
      },
    });
    return response.id;
  } catch (error) {
    console.error("Error logging Trend in Notion:", error);
    throw error;
  }
}

/**
 * Archive any ideas in the Ideas Bank that have been marked as "Rejected".
 * This severs the relation to scouted content, freeing it up for future runs.
 */
export async function cleanRejectedIdeas(): Promise<number> {
  try {
    const response = await notion.dataSources.query({
      data_source_id: NOTION_DATA_SOURCE_IDS.IDEAS_BANK,
      filter: {
        property: "Status",
        select: { equals: "Rejected" },
      },
    });

    let count = 0;
    for (const page of response.results) {
      await notion.pages.update({
        page_id: page.id,
        archived: true,
      });
      count++;
    }

    return count;
  } catch (error) {
    console.error("Error cleaning rejected ideas:", error);
    return 0;
  }
}

// ═══════════════════════════════════════════════════════════════
// VIRAL POST RESEARCH HELPERS
// ═══════════════════════════════════════════════════════════════

export interface ViralPostInput {
  postTitle: string;
  postUrl: string;
  author: string;
  postContent: string;
  shortDescription: string;
  platform: string;
  format: string;
  hookType: string;
  category: string[];
  rating: string;
  likes: number;
  bookmarks: number;
  retweets: number;
  replies: number;
  views: number;
  whyItWorks: string;
  stealablePattern: string;
  tweetStructure: string;
  addedDate?: string;
}

/**
 * Fetch URLs of viral posts added to the library in the past N days.
 * Used for deduplication.
 */
export async function getExistingViralPostUrls(
  days: number = 30,
): Promise<string[]> {
  try {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);
    const sinceDateStr = sinceDate.toISOString().split("T")[0];

    let hasMore = true;
    let startCursor: string | undefined = undefined;
    const urls: string[] = [];

    while (hasMore) {
      const response: any = await notion.dataSources.query({
        data_source_id: NOTION_DATA_SOURCE_IDS.VIRAL_POST_LIBRARY,
        filter: {
          property: "Added Date",
          date: { on_or_after: sinceDateStr },
        },
        page_size: 100,
        ...(startCursor ? { start_cursor: startCursor } : {}),
      });

      for (const page of response.results) {
        const urlVal = page.properties?.["Post URL"]?.url || "";
        if (urlVal) {
          urls.push(cleanContentUrl(urlVal));
        }
      }

      hasMore = response.has_more;
      startCursor = response.next_cursor || undefined;
    }

    return urls;
  } catch (error) {
    console.error("Error fetching existing viral post URLs:", error);
    return [];
  }
}

/**
 * Write a new viral post entry to the 📚 Viral Post Library.
 */
export async function createViralPost(
  input: ViralPostInput,
): Promise<string> {
  try {
    const formattedAddedDate = input.addedDate || new Date().toISOString().split("T")[0];

    const properties: Record<string, any> = {
      "Post Title": {
        title: [{ text: { content: safeString(input.postTitle).substring(0, 200) } }],
      },
      "Post URL": {
        url: input.postUrl ? cleanContentUrl(input.postUrl) : null,
      },
      "Author": {
        rich_text: splitIntoRichText(input.author),
      },
      "Post Content": {
        rich_text: splitIntoRichText(input.postContent),
      },
      "Short Description": {
        rich_text: splitIntoRichText(input.shortDescription),
      },
      "Platform": {
        select: { name: input.platform || "X" },
      },
      "Format": {
        select: { name: input.format || "Short" },
      },
      "Hook Type": {
        select: { name: input.hookType || "Story" },
      },
      "Category": {
        multi_select: filterCategoryList(input.category || ["Tech/AI"]).map((cat) => ({ name: cat })),
      },
      "⭐ Rating": {
        select: { name: input.rating || "⭐⭐⭐" },
      },
      "❤️ Likes": {
        number: input.likes || 0,
      },
      "🔖 Bookmarks": {
        number: input.bookmarks || 0,
      },
      "🔁 Retweets": {
        number: input.retweets || 0,
      },
      "💬 Replies": {
        number: input.replies || 0,
      },
      "👀 Views": {
        number: input.views || 0,
      },
      "💡 Why It Works": {
        rich_text: splitIntoRichText(input.whyItWorks),
      },
      "Steal-able Pattern": {
        rich_text: splitIntoRichText(input.stealablePattern),
      },
      "Tweet Structure": {
        rich_text: splitIntoRichText(input.tweetStructure),
      },
      "Added Date": {
        date: { start: formattedAddedDate },
      },
    };

    const response = await notion.pages.create({
      parent: { database_id: NOTION_DATABASE_IDS.VIRAL_POST_LIBRARY },
      properties,
    });

    return response.id;
  } catch (error) {
    console.error("Error creating Viral Post entry:", error);
    throw error;
  }
}

/**
 * Update an existing idea in the Ideas Bank.
 */
export async function updateIdea(pageId: string, updates: Partial<CreateIdeaOptions>) {
  try {
    const properties: Record<string, any> = {};

    if (updates.draftTweet) {
      properties["Draft Tweet"] = {
        rich_text: splitIntoRichText(updates.draftTweet.substring(0, 2000)),
      };
      // Once it's drafted by the Writer Actor, we update the status so it moves across the kanban board.
      properties["Status"] = { select: { name: "📝 Drafted" } };
    }

    if (Object.keys(properties).length > 0) {
      await notion.pages.update({
        page_id: pageId,
        properties,
      });
    }

    if (updates.draftTweet) {
      const toggleResponse: any = await notion.blocks.children.append({
        block_id: pageId,
        children: [
          {
            object: "block" as const,
            type: "toggle" as const,
            toggle: {
              rich_text: [{ text: { content: "▶️ Full Draft Tweet" } }],
            },
          },
        ]
      });
      const toggleId = toggleResponse.results?.[0]?.id;
      if (toggleId) {
        await appendBlocksInBatches(toggleId, splitIntoParagraphBlocks(updates.draftTweet));
      }
    }
  } catch (error) {
    console.error(`Error updating Idea ${pageId}:`, error);
    throw error;
  }
}

/**
 * Append a small operational note to an Ideas Bank page without changing schema.
 */
export async function appendIdeaOperationalNote(pageId: string, title: string, body: string) {
  try {
    await appendBlocksInBatches(pageId, [
      {
        object: "block" as const,
        type: "heading_3" as const,
        heading_3: {
          rich_text: [{ text: { content: title.substring(0, 2000) } }],
        },
      },
      ...splitIntoParagraphBlocks(body),
    ]);
  } catch (error) {
    console.error(`Error appending operational note to Idea ${pageId}:`, error);
    throw error;
  }
}
