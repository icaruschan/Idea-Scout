import { task } from "@trigger.dev/sdk/v3";
import { CONTENT_PILLARS } from "../../lib/constants";
import { generateJSONFree } from "../../lib/llm";
import {
  createScoutedContent,
  checkUrlExists,
} from "../../lib/notion";
import { prepareScoutContentBody } from "../../lib/transcript-cleaner";

// ═══════════════════════════════════════════════════════════════
// PROCESS CONTENT — AI Relevance Filter + Store
// ═══════════════════════════════════════════════════════════════
// Receives a single raw content item from the orchestrator.
// Step 1: Check for duplicates against recent Scouted Content
// Step 2: AI relevance filter — does this map to our 8 active pillars?
// Step 3: AI summarization — extract key takeaways
// Step 4: Write to Scouted Content DB with creator relation
// ═══════════════════════════════════════════════════════════════

export interface RawContentItem {
  platform: "X" | "YouTube" | "Instagram";
  creatorPageId: string;
  creatorName: string;
  title: string;
  text: string;
  url: string;
  likes: number;
  views: number;
  comments: number;
  publishedDate: string;
  transcript: string;
}

const RELEVANCE_SYSTEM_PROMPT = `You are a content relevance analyst for a Twitter (X) creator who covers AI, automation, coding, and creator economy topics.

Your job is to evaluate whether a piece of content from YouTube, Instagram, or Twitter is relevant to the creator's content pillars and worth scouting for tweet ideas.

THE 8 ACTIVE CONTENT PILLARS:
${CONTENT_PILLARS.map((p, i) => `${i + 1}. ${p}`).join("\n")}

RELEVANCE CRITERIA — content MUST meet ALL of:
✅ Directly related to at least 1 of the 8 pillars above
✅ Contains actionable insights, specific tools/techniques, or contrarian takes
✅ Not generic motivation/fluff/listicle content
✅ Would resonate with an audience of founders, indie hackers, and developers

REJECT if:
❌ Generic "AI is amazing" hype without specifics
❌ Product announcements with no actionable angle
❌ News about company valuations/fundraising with no builder angle
❌ Content primarily about entertainment/lifestyle
❌ Content in a language other than English

DISAMBIGUATION (EXAMPLES) — Always verify context before matching any ambiguous term:
- e.g., "Kimi" → relevant ONLY if discussing the AI model, NOT F1 racing
- e.g., "Amen" → relevant ONLY if discussing tech/tools, NOT sports or religion
- e.g., "Jupiter" → relevant ONLY if discussing the platform, NOT astronomy or golf
- e.g., "Game 2" → relevant ONLY if discussing gamification, NOT sports playoffs
- GENERAL RULE: If a word could refer to pop culture, sports, or everyday life instead of tech/business, you MUST verify the surrounding context is about the pillar topic before approving.

CRITICAL: A keyword match is NOT enough. The content's actual subject matter must clearly fall within a pillar. When in doubt, reject.

Respond with pure JSON — no markdown fences, no explanation.`;

export const processContent = task({
  id: "process-content",
  maxDuration: 300,
  queue: {
    concurrencyLimit: 5, // Prevent Notion/OpenRouter rate-limit storms from 300+ parallel tasks
  },
  retry: {
    maxAttempts: 2,
  },
  run: async (
    payload: RawContentItem,
  ): Promise<{ scoutedContentId: string | null; filtered: boolean }> => {
    const { platform, creatorPageId, creatorName, title, text, url, likes, views, comments, publishedDate, transcript } = payload;

    // Clean video transcripts before scout LLM (full raw transcript still stored in Notion)
    const contentBody = prepareScoutContentBody({
      title,
      text,
      transcript,
      platform,
    });

    if (contentBody.trim().length < 50) {
      console.log(`⏭️ Skipping "${title.substring(0, 60)}" — too short`);
      return { scoutedContentId: null, filtered: true };
    }

    // ─── Step 1: Dedup check ────────────────────────────────────

    try {
      const isDuplicate = await checkUrlExists(url);
      if (isDuplicate) {
        console.log(`⏭️ Skipping duplicate URL: "${url}"`);
        return { scoutedContentId: null, filtered: true };
      }
    } catch (err) {
      console.warn("Dedup check failed, continuing...", err);
    }

    // ─── Step 2: AI Relevance Filter ────────────────────────────

    const filterPrompt = `Evaluate this ${platform} content for relevance:

CREATOR: ${creatorName}
TITLE: ${title}
CONTENT:
${contentBody}

ENGAGEMENT: ${likes} likes, ${views} views, ${comments} comments

Return JSON:
{
  "relevant": true/false,
  "confidence": 0.0-1.0,
  "matchedPillars": ["Pillar1", "Pillar2"],
  "reasoning": "Brief explanation of why this is/isn't relevant"
}`;

    let filterResult: {
      relevant: boolean;
      confidence: number;
      matchedPillars: string[];
      reasoning: string;
    };

    try {
      filterResult = await generateJSONFree(filterPrompt, RELEVANCE_SYSTEM_PROMPT, 0.3, "xiaomi/mimo-v2.5-pro");
    } catch (err) {
      console.error("LLM filter failed:", err);
      return { scoutedContentId: null, filtered: true };
    }

    if (!filterResult.relevant || filterResult.confidence < 0.6) {
      console.log(
        `🚫 Filtered out: "${title.substring(0, 60)}" — ${filterResult.reasoning}`,
      );
      return { scoutedContentId: null, filtered: true };
    }

    console.log(
      `✅ Relevant: "${title.substring(0, 60)}" → [${filterResult.matchedPillars.join(", ")}] (${filterResult.confidence})`,
    );

    // ─── Step 3: AI Summary + Key Takeaways ─────────────────────

    const summaryPrompt = `Study this ${platform} content for guide-worthy material (workflows, how-tos, tools, operator lessons).

CREATOR: ${creatorName}
TITLE: ${title}
MATCHED PILLARS: ${filterResult.matchedPillars.join(", ")}
CONTENT:
${contentBody}

Return JSON:
{
  "summary": "2-4 sentences — what this content IS and what the creator is doing",
  "creatorDoing": "What the creator is literally doing (screen recording, teaching, demoing, arguing, etc.)",
  "contentType": "workflow-walkthrough | tool-demo | case-study | contrarian-essay | listicle | personal-story | news-reaction",
  "targetAudience": "Who this content is for",
  "primaryPain": "Main problem/friction the content addresses",
  "teachableUnits": ["3-8 distinct teachable chunks — NOT tweet bullets, real sections of value"],
  "transcriptGems": ["2-5 specific details only visible in the full content (numbers, configs, mistakes, tools)"],
  "guidePotential": "low | medium | high",
  "keyTakeaways": "3-5 actionable bullets with → arrows. Focus on mechanisms, tools, steps, warnings.",
  "tweetAngle": "One sentence — strongest single value bomb if forced to one post"
}`;

    let summaryResult: {
      summary: string;
      creatorDoing?: string;
      contentType?: string;
      targetAudience?: string;
      primaryPain?: string;
      teachableUnits?: string[];
      transcriptGems?: string[];
      guidePotential?: "low" | "medium" | "high";
      keyTakeaways: string;
      tweetAngle: string;
    };

    try {
      summaryResult = await generateJSONFree(summaryPrompt, RELEVANCE_SYSTEM_PROMPT, 0.5, "xiaomi/mimo-v2.5-pro");
    } catch (err) {
      console.error("LLM summary failed:", err);
      // Still store the content, just without a summary
      summaryResult = {
        summary: filterResult.reasoning,
        keyTakeaways: "",
        tweetAngle: "",
      };
    }

    // ─── Step 4: Write to Scouted Content DB ────────────────────

    const guidePotential = summaryResult.guidePotential || "medium";
    const scoutAnalysis =
      summaryResult.creatorDoing && summaryResult.teachableUnits?.length
        ? {
            summary: summaryResult.summary,
            creatorDoing: summaryResult.creatorDoing,
            contentType: summaryResult.contentType || "workflow-walkthrough",
            targetAudience: summaryResult.targetAudience || "",
            primaryPain: summaryResult.primaryPain || "",
            teachableUnits: summaryResult.teachableUnits || [],
            transcriptGems: summaryResult.transcriptGems || [],
            guidePotential,
            keyTakeaways: summaryResult.keyTakeaways,
          }
        : undefined;

    const scoutedContentId = await createScoutedContent({
      title: title.substring(0, 200),
      platform,
      url,
      likes,
      views,
      comments,
      publishedDate,
      aiSummary: summaryResult.summary,
      keyTakeaways: summaryResult.keyTakeaways,
      transcript,
      creatorPageId,
      pillars: filterResult.matchedPillars,
      scoutAnalysis,
    });

    console.log(
      `📝 Stored in Scouted Content: "${title.substring(0, 60)}" (${scoutedContentId})`,
    );

    return { scoutedContentId, filtered: false };
  },
});
