import { schedules, task } from "@trigger.dev/sdk/v3";
import { CONTENT_PILLARS } from "../../lib/constants";
import { matchPillar } from "../../lib/pillar-utils";
import { generateJSON } from "../../lib/llm";
import {
  getRecentScoutedContent,
  getScoutedContentByIds,
  getTopViralPosts,
  getRecentIdeaTitles,
  getPillarDistribution,
  createIdea,
  cleanRejectedIdeas,
} from "../../lib/notion";

// ═══════════════════════════════════════════════════════════════
// DRAFT IDEAS — Cross-Platform Synthesis Engine
// ═══════════════════════════════════════════════════════════════
// This is the intelligence layer. It correlates:
//   1. Scouted Content (this run's processed items)
//   2. Viral Post Library (proven tweet formats)
//   3. Existing Ideas Bank (dedup)
//   4. Pillar Distribution (balance)
// ...then generates 10 high-quality tweet idea drafts.
// ═══════════════════════════════════════════════════════════════

interface DraftIdeasPayload {
  scoutedContentIds: string[];
}

const SYNTHESIS_SYSTEM_PROMPT = `You are the content brain for a Twitter (X) creator. Audience: sharp founders, indie hackers, developers — not beginners.

═══════════════════════════════════════════════════════════════════════════════
YOUR ROLE
═══════════════════════════════════════════════════════════════════════════════
You take SCOUTED CONTENT (from YouTube, Instagram, and Twitter creators) and cross-reference it with PROVEN VIRAL TWEET FORMATS to generate high-quality tweet idea drafts.

The magic is in the CROSS-POLLINATION:
- A YouTube tutorial about building an AI agent → tweet idea using a "I replaced X with Y" format from the Viral Library
- An Instagram reel about Cursor tips → tweet idea using a numbered list format that got 50k+ impressions
- A Twitter thread about n8n workflows → tweet idea using a hook formula that drove high bookmarks

═══════════════════════════════════════════════════════════════════════════════
CREATOR VOICE (non-negotiable)
═══════════════════════════════════════════════════════════════════════════════
- Practitioner who builds real things, not commentator
- Anti-hype bias: "walk before you run", "don't set up X until you know Y"
- Specific numbers always: $65,897 not "$65k", 7,380 not "thousands"
- Lowercase first-person: "i built this", "my clawdbot henry"
- Short sentences. Line breaks. Arrows for bullets (→).

═══════════════════════════════════════════════════════════════════════════════
CONTENT PILLARS (9 ACTIVE)
═══════════════════════════════════════════════════════════════════════════════
${CONTENT_PILLARS.map((p, i) => `${i + 1}. ${p}`).join("\n")}

═══════════════════════════════════════════════════════════════════════════════
TITLE RULES — THIS IS CRITICAL
═══════════════════════════════════════════════════════════════════════════════
BANNED TITLE PATTERNS (never generate these):
❌ "The X Protocol" — generic buzzword
❌ "The Y Arbitrage" — meaningless without specifics
❌ "The Z Stack" — could apply to anything
❌ "The [Adjective] [Noun] Framework" — template garbage
❌ Any title that works if you swap the trend keyword — too generic

TITLE MUST INCLUDE AT LEAST ONE:
- Specific dollar amount ($4,217, $56k, $0)
- Specific timeframe (18 minutes, 72 hours, 30 days)
- Specific tool name (Claude, Cursor, n8n, Notion, Apify, Kling)
- Specific metric (200% improvement, 10x faster, 550 videos/day)
- Specific persona ("my 16-year-old brother", "rookie vibe coders")

═══════════════════════════════════════════════════════════════════════════════
ANTI-PATTERNS (never produce)
═══════════════════════════════════════════════════════════════════════════════
- "AI is changing everything" — vague
- "Here are X reasons why..." — weak hook
- Generic takes without numbers/tools
- Hedged opinions ("some might argue...")
- Hyped claims without receipts

Respond only with pure JSON — no markdown fences, no explanation.`;

export const draftIdeas = schedules.task({
  id: "draft-ideas",
  cron: "0 8 * * 1-6", // Monday through Saturday at 8:00 AM UTC (9:00 AM local)
  maxDuration: 900,
  retry: {
    maxAttempts: 2,
  },
  run: async (payload): Promise<{ ideasCreated: number }> => {
    const scoutedContentIds = payload && "scoutedContentIds" in payload && Array.isArray(payload.scoutedContentIds)
      ? (payload.scoutedContentIds as string[])
      : [];

    console.log(
      `💡 Draft Ideas starting — ${scoutedContentIds.length > 0 ? scoutedContentIds.length : "all recent"} scouted items to synthesize`,
    );

    // ─── Step 0: Clean up any Rejected ideas ────────────────────
    
    const cleanedCount = await cleanRejectedIdeas();
    if (cleanedCount > 0) {
      console.log(`🗑️ Cleaned up ${cleanedCount} rejected ideas to free up source content.`);
    }

    // ─── Step 1: Gather context from all sources ────────────────

    const [scoutedContent, viralPosts, existingTitles, pillarCounts] =
      await Promise.all([
        scoutedContentIds.length > 0
          ? getScoutedContentByIds(scoutedContentIds)
          : getRecentScoutedContent(7),
        getTopViralPosts(15),         // Top 15 viral posts (4★+)
        getRecentIdeaTitles(30),      // Last 30 days of ideas for dedup
        getPillarDistribution(14),    // 14-day pillar balance
      ]);

    // Compute underserved pillars for the LLM
    const totalIdeas = (Object.values(pillarCounts) as number[]).reduce(
      (a: number, b: number) => a + b,
      0,
    );
    const avgPerPillar = totalIdeas / CONTENT_PILLARS.length || 1;
    const underservedPillars = CONTENT_PILLARS.filter(
      (p) => (pillarCounts[p] || 0) < avgPerPillar * 0.5,
    );

    console.log(
      `Context loaded → Scouted: ${scoutedContent.length}, Viral: ${viralPosts.length}, Existing ideas: ${existingTitles.length}`,
    );
    console.log(
      `Underserved pillars: ${underservedPillars.length > 0 ? underservedPillars.join(", ") : "none"}`,
    );

    // ─── Step 2: Format scouted content for the LLM ─────────────

    const scoutedSummary = scoutedContent
      .map(
        (item: any) =>
          `[${item.platform}] ${item.title}\nSummary: ${item.aiSummary}\nKey Takeaways: ${item.keyTakeaways}\nURL: ${item.url}`,
      )
      .join("\n\n---\n\n");

    // ─── Step 3: Format viral posts for pattern matching ────────

    const viralSummary = (viralPosts as any[])
      .map((post) => {
        const p = post.properties || {};
        const tweetText =
          p["Post Title"]?.title?.[0]?.plain_text ||
          p["Tweet"]?.title?.[0]?.plain_text ||
          p["Post Content"]?.rich_text?.[0]?.plain_text ||
          "";
        const structure =
          p["Tweet Structure"]?.rich_text?.[0]?.plain_text ||
          p["Structure"]?.select?.name ||
          "";
        const rating = p["⭐ Rating"]?.select?.name || "";
        const hookType = p["Hook Type"]?.select?.name || "";
        const stealable =
          p["Steal-able Pattern"]?.rich_text?.[0]?.plain_text || "";
        return `[ID: ${post.id}] [${rating}] ${tweetText.substring(0, 300)}\nStructure: ${structure} | Hook: ${hookType}\nSteal-able Pattern: ${stealable}`;
      })
      .join("\n\n---\n\n");

    // ─── Step 4: Build the synthesis prompt ──────────────────────
    
    // Calculate dynamic idea volume based on input size
    const targetIdeaCount = Math.max(10, Math.min(30, Math.ceil(scoutedContent.length * 0.75)));
    console.log(`🎯 Targeting ${targetIdeaCount} ideas based on ${scoutedContent.length} scouted items`);

    const synthesisPrompt = `You have two data sources. Your job is to CROSS-POLLINATE them to create tweet ideas.

═══ SOURCE 1: SCOUTED CONTENT (raw intelligence from YouTube, Instagram, and Twitter creators) ═══
${scoutedSummary || "No scouted content available this run."}

═══ SOURCE 2: VIRAL POST LIBRARY (proven tweet formats with 4★+ ratings) ═══
${viralSummary || "No viral posts available."}

═══ EXISTING IDEAS (do NOT duplicate these) ═══
${existingTitles.slice(0, 30).join("\n") || "None yet"}

═══ UNDERSERVED PILLARS (bias toward these if possible) ═══
${underservedPillars.length > 0 ? underservedPillars.join(", ") : "All pillars are balanced"}

═══ TASK ═══
Generate EXACTLY ${targetIdeaCount} tweet idea drafts by combining scouted content insights with proven viral formats.

For each idea, you MUST:
1. Pick a specific insight from Source 1 (scouted content)
2. Apply a proven format/hook from Source 2 (viral library)
3. Explain the cross-pollination logic

Return JSON:
{
  "ideas": [
    {
      "title": "Specific, compelling idea title following the TITLE RULES",
      "pillar": "MUST MATCH EXACTLY ONE OF: ${CONTENT_PILLARS.join(", ")}",
      "hookAngle": "The specific hook/angle framing for this topic",
      "whyItWorks": "The psychological/strategic reason why this format/angle works (audience motivation, curiosity gap, etc.)",
      "format": "Short" | "Mid-length" | "Thread",
      "priority": "🔥 Hot" | "💡 Good" | "📝 Maybe",
      "stealablePattern": "The viral format pattern being applied (from Source 2)",
      "tweetStructure": "Brief outline of the tweet structure",
      "sourcedFrom": "Which scouted content item(s) inspired this",
      "inspiredByLibraryId": "The [ID: ...] of the Viral Library post you used from Source 2 that inspired this format/pattern",
      "crossPollinationLogic": "Brief explanation of how Source 1 insight + Source 2 format = this idea"
    }
  ]
}`;

    // ─── Step 5: Generate ideas via LLM ─────────────────────────

    let generatedIdeas: {
      ideas: {
        title: string;
        pillar: string;
        hookAngle: string;
        whyItWorks: string;
        format: string;
        priority: string;
        stealablePattern: string;
        tweetStructure: string;
        sourcedFrom: string;
        inspiredByLibraryId?: string;
        crossPollinationLogic: string;
      }[];
    };

    try {
      generatedIdeas = await generateJSON(
        synthesisPrompt,
        SYNTHESIS_SYSTEM_PROMPT,
        0.8, // Higher temperature for creative synthesis
      );
    } catch (err) {
      console.error("LLM synthesis failed:", err);
      return { ideasCreated: 0 };
    }

    if (!generatedIdeas?.ideas || generatedIdeas.ideas.length === 0) {
      console.log("⚠️ LLM returned no ideas");
      return { ideasCreated: 0 };
    }

    console.log(`🧠 LLM generated ${generatedIdeas.ideas.length} ideas`);

    // ─── Step 6: Write each idea to Ideas Bank ──────────────────

    // Build a lookup of scouted content page IDs by title for relation linking
    const scoutedLookup = new Map<string, string>(
      scoutedContent.map((item: any) => [
        item.title.toLowerCase().substring(0, 100),
        item.pageId,
      ]),
    );

    let ideasCreated = 0;

    for (const idea of generatedIdeas.ideas) {
      try {
        // Validate pillar using fuzzy matching
        const validPillar = matchPillar(idea.pillar);

        // Try to find the scouted content IDs this idea references
        const inspiredByScoutedIds: string[] = [];
        if (idea.sourcedFrom) {
          // Fuzzy match against scouted content titles
          for (const [titleKey, pageId] of scoutedLookup) {
            if (
              idea.sourcedFrom.toLowerCase().includes(titleKey) ||
              titleKey.includes(idea.sourcedFrom.toLowerCase().substring(0, 50))
            ) {
              inspiredByScoutedIds.push(pageId);
            }
          }
        }

        // Map format string to valid select option
        const formatMap: Record<string, string> = {
          Short: "Short",
          "Mid-length": "Mid-length",
          Thread: "Thread",
          Article: "Article",
          Video: "Video",
        };

        const rawData = [
          `📌 Cross-Pollination: ${idea.crossPollinationLogic}`,
          `📦 Sourced From: ${idea.sourcedFrom}`,
          `🔧 Structure: ${idea.tweetStructure}`,
        ].join("\n\n");

        const cleanLibraryId = idea.inspiredByLibraryId
          ? idea.inspiredByLibraryId.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0]
          : undefined;

        await createIdea(
          idea.title,
          "Idea Scout", // Source = "Idea Scout"
          validPillar,
          idea.hookAngle,
          rawData,
          {
            priority: idea.priority as any,
            formatIdea: formatMap[idea.format] as any || "Short",
            stealablePattern: idea.stealablePattern,
            tweetStructure: idea.tweetStructure,
            inspiredByScoutedIds:
              inspiredByScoutedIds.length > 0 ? inspiredByScoutedIds : undefined,
            inspiredByLibraryId: cleanLibraryId,
            whyItWorks: idea.whyItWorks,
          },
        );

        ideasCreated++;
        console.log(
          `💡 Created idea: "${idea.title.substring(0, 60)}" [${validPillar}]`,
        );
      } catch (err) {
        console.error(
          `Failed to create idea "${idea.title.substring(0, 60)}":`,
          err,
        );
      }
    }

    console.log(`✅ Draft complete: ${ideasCreated} ideas written to Ideas Bank`);
    return { ideasCreated };
  },
});
