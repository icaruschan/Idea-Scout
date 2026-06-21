import { schedules, task, tasks } from "@trigger.dev/sdk/v3";
import { CONTENT_PILLARS } from "../../lib/constants";
import { matchPillar } from "../../lib/pillar-utils";
import { generateJSON } from "../../lib/llm";
import { StrategyBrief } from "../../lib/voice-dna";
import {
  getRecentScoutedContent,
  getScoutedContentByIds,
  getTopViralPosts,
  getRecentIdeaTitles,
  getPillarDistribution,
  createIdea,
  cleanRejectedIdeas,
  appendIdeaOperationalNote,
  CreateIdeaOptions,
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

const SYNTHESIS_SYSTEM_PROMPT = `You are the Strategy Brain for a Twitter (X) creator. Audience: sharp founders, indie hackers, developers — not beginners.

═══════════════════════════════════════════════════════════════════════════════
VOICE MODES
═══════════════════════════════════════════════════════════════════════════════
→ Builder-Retrospective (default): You built/experienced it yourself. First-person retrospective. ("i spent 90 days trying to scale my scraping...")
→ Tool-Curator: Spotlighting an external tool or repo. Metric-dense, spec-focused.
→ Case-Study: Micro wins and operator wisdom — "someone built X, got first $/users/revenue, here is the mechanism" OR long-term reputation/compounding lessons.

Default to Builder-Retrospective. Use Tool-Curator when spotlighting external tools/repos. Use Case-Study for small monetization wins, builder journeys with receipts, or deep operator principles.

═══════════════════════════════════════════════════════════════════════════════
CONTENT PILLARS (8 ACTIVE)
═══════════════════════════════════════════════════════════════════════════════
${CONTENT_PILLARS.map((p, i) => `${i + 1}. ${p}`).join("\n")}

═══════════════════════════════════════════════════════════════════════════════
TITLE RULES — THIS IS CRITICAL
═══════════════════════════════════════════════════════════════════════════════
These titles are NOT for Twitter. They are INTERNAL working titles for a Notion database.
They must be short, punchy, and instantly scannable (2-5 words max).

GOOD EXAMPLES (Short & Punchy):
✅ "Cursor vs SaaS Pricing"
✅ "The 72hr n8n Build"
✅ "Claude Code Context Trick"
✅ "The Indie Hacker Trap"

BANNED PATTERNS:
❌ No full sentences ("How I used Cursor to build...")
❌ No generic buzzwords ("The X Protocol", "The Z Stack")
❌ No clickbait ("You won't believe how this tool...")

═══════════════════════════════════════════════════════════════════════════════
STRATEGY BRIEF RULES
═══════════════════════════════════════════════════════════════════════════════
You do NOT write the actual tweet. You only generate the underlying Strategy Brief.
A separate dedicated Writer AI will take your strategy and draft the text.

Focus entirely on:
- Identifying the perfect Hook Angle based on the scouted content.
- Explaining the psychological trigger (why it works).
- Recommending the best viral format/structure to map it to.

═══════════════════════════════════════════════════════════════════════════════
FRAMEWORK SELECTION — PICK THE BEST LAYOUT FOR EACH DRAFT
═══════════════════════════════════════════════════════════════════════════════
For each draft, evaluate the concept and select the most fitting framework to structure the eventual tweet/article. Set the "appliedFramework" field accordingly.

1. "SaaS-Killer" — Use when the concept contrasts a free/open-source tool with a paid SaaS expense.
   Flow: Staccato hook highlighting cost pain → Introduce the alternative → Indented feature list using "→" → Side-by-side pricing block → GitHub stars + license → "100% Open Source."

2. "Macro Case-Study" — Use when explaining a major builder achievement, milestone, or industry shift.
   Flow: Dramatic narrative hook + direct quote/metric → Background context → Paradigm shift ("We used to... Now we...") → Detail list using "→" → Closing macro-question ("What happens when...").

3. "Reputation Warning" — Use when sharing career advice, creator warnings, or long-term lessons about trust/taste.
   Flow: Direct address or caution opener → Explain the trap → Personal/historical scar tissue → Actionable checklist using "✅" → Philosophical/mindset close.

4. "Concept Explainer" — Use when breaking down a technical protocol, architecture, or mechanism in simple terms.
   Flow: "I finally figured out how [X] works" style hook → Nested analogical stack ("Think of X like Y") → Step-by-step setup using "→" → "Massive upgrade." or "Simple once it clicks." close.

5. "General Blended" — Default fallback for observations, news, general builder topics, or anything that doesn't clearly fit the above.
   Flow: Use the standard Trench-Builder Curator Voice DNA layout.

IMPORTANT: Mix frameworks across the batch. Do NOT apply the same framework to every idea. Let the concept dictate the choice.

═══════════════════════════════════════════════════════════════════════════════
ANTI-PATTERNS (never produce)
═══════════════════════════════════════════════════════════════════════════════
- "AI is changing everything" — vague
- "Here are X reasons why..." — weak hook
- Generic takes without numbers/tools
- Hedged opinions ("some might argue...")
- Hyped claims without receipts

Respond only with pure JSON — no markdown fences, no explanation.`;

export async function runDraftIdeas(payload?: any): Promise<{ ideasCreated: number }> {
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
        getTopViralPosts(30),         // Top 30 viral posts (4★+)
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

    if (scoutedContent.length === 0) {
      console.log("⚠️ No scouted content available. Skipping drafting.");
      return { ideasCreated: 0 };
    }

    // ─── Step 2: Group scouted content by primary pillar ───────────

    const groups = new Map<string, any[]>();
    for (const item of scoutedContent) {
      const p = getPrimaryPillar(item);
      const list = groups.get(p) || [];
      list.push(item);
      groups.set(p, list);
    }

    console.log(`Pillar groups created: ${Array.from(groups.keys()).map(k => `${k}: ${groups.get(k)?.length}`).join(", ")}`);

    // ─── Step 3: Run LLM Synthesis in Parallel ─────────────────────
    console.log("🧠 Starting parallel LLM synthesis across all pillar groups...");

    interface GeneratedIdeaResult {
      pillar: string;
      groupItems: any[];
      ideas: any[];
    }

    const synthesizePillar = async (
      pillar: string,
      groupItems: any[],
    ): Promise<GeneratedIdeaResult> => {
      const matchedCategories = PILLAR_TO_VIRAL_CATEGORIES[pillar] || [];
      let groupTemplates = (viralPosts as any[]).filter((post) => {
        const p = post.properties || {};
        const cats = p.Category?.multi_select?.map((s: any) => s.name) || [];
        return cats.some((c: string) => matchedCategories.includes(c));
      });

      // If less than 4 templates matched, append general top-rated templates to ensure variety
      if (groupTemplates.length < 4) {
        const generalTemplates = (viralPosts as any[]).filter((post) => {
          const rating = post.properties?.["⭐ Rating"]?.select?.name || "";
          return rating.includes("⭐⭐⭐⭐⭐") || rating.includes("★★★★★");
        });
        const existingIds = new Set(groupTemplates.map((t) => t.id));
        for (const gt of generalTemplates) {
          if (!existingIds.has(gt.id)) {
            groupTemplates.push(gt);
          }
        }
      }

      // Limit templates to a maximum of 8 per chunk to prevent prompt overload
      groupTemplates = groupTemplates.slice(0, 8);

      const scoutedSummary = groupItems
        .map(
          (item: any) =>
            `[ID: ${item.pageId}] [${item.platform}] ${item.title}\nSummary: ${item.aiSummary}\nKey Takeaways: ${item.keyTakeaways}\nURL: ${item.url}`,
        )
        .join("\n\n---\n\n");

      const viralSummary = groupTemplates
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
          const whyItWorksVal =
            p["💡 Why It Works"]?.rich_text?.[0]?.plain_text ||
            p["Why It Works"]?.rich_text?.[0]?.plain_text ||
            "";
          return `[ID: ${post.id}] [${rating}] [Hook Type: ${hookType}] ${tweetText}\nStructure: ${structure}\nSteal-able Pattern: ${stealable}\nWhy it works: ${whyItWorksVal}`;
        })
        .join("\n\n---\n\n");

      const targetIdeaCount = Math.max(
        1,
        Math.min(5, Math.ceil(groupItems.length * 0.75)),
      );

      const synthesisPrompt = `You have two data sources. Your job is to CROSS-POLLINATE them to create tweet ideas for the content pillar: ${pillar}.

═══ SOURCE 1: SCOUTED CONTENT (raw intelligence about ${pillar}) ═══
${scoutedSummary}

═══ SOURCE 2: VIRAL POST LIBRARY (proven templates matching ${pillar}) ═══
${viralSummary || "No viral posts available."}

═══ EXISTING IDEAS (do NOT duplicate these) ═══
${existingTitles.slice(0, 30).join("\n") || "None yet"}

═══ TASK ═══
Generate EXACTLY ${targetIdeaCount} tweet idea drafts specifically for the "${pillar}" pillar by combining the scouted content insights with the proven viral templates.

For each idea, you MUST:
1. Pick a specific insight from Source 1 (scouted content)
2. Apply a proven format/hook from Source 2 (viral library)
3. Choose the optimal voice mode: "Builder-Retrospective", "Tool-Curator", or "Case-Study". Mix them across the batch.
4. Explain the cross-pollination logic

Return JSON:
{
  "ideas": [
    {
      "title": "Specific, compelling idea title following the TITLE RULES",
      "pillar": "${pillar}",
      "voiceMode": "Builder-Retrospective" | "Tool-Curator" | "Case-Study",
      "appliedFramework": "SaaS-Killer" | "Macro Case-Study" | "Reputation Warning" | "Concept Explainer" | "General Blended",
      "hookAngle": "The specific hook/angle framing for this topic",
      "whyItWorks": "The psychological/strategic reason why this format/angle works (audience motivation, curiosity gap, etc.)",
      "format": "Short" | "Mid-length" | "Thread" | "Article",
      "priority": "🔥 Hot" | "💡 Good" | "📝 Maybe",
      "stealablePattern": "The viral format pattern being applied (from Source 2)",
      "tweetStructure": "Brief outline of the tweet structure",
      "sourcedFrom": "Brief name or title of the scouted content source",
      "inspiredByScoutedIds": ["exact [ID: ...] of the scouted content item(s) from Source 1 that inspired this"],
      "inspiredByLibraryId": "The [ID: ...] of the Viral Library post you used from Source 2 that inspired this format/pattern",
      "crossPollinationLogic": "Brief explanation of how Source 1 insight + Source 2 format = this idea"
    }
  ]
}`;

      try {
        console.log(`📡 Calling OpenRouter for pillar: ${pillar}...`);
        const generatedIdeas = await generateJSON(
          synthesisPrompt,
          SYNTHESIS_SYSTEM_PROMPT,
          0.8,
        );
        if (generatedIdeas?.ideas && Array.isArray(generatedIdeas.ideas)) {
          console.log(
            `✨ LLM successfully synthesized ${generatedIdeas.ideas.length} ideas for ${pillar}.`,
          );
          return { pillar, groupItems, ideas: generatedIdeas.ideas };
        }
      } catch (err: any) {
        console.error(
          `❌ LLM synthesis failed for pillar ${pillar}:`,
          err.message || err,
        );
      }
      return { pillar, groupItems, ideas: [] };
    };

    // Process in batches of 3 to avoid overwhelming OpenRouter
    const CONCURRENCY_LIMIT = 3;
    const allEntries = Array.from(groups.entries()).filter(
      ([pillar]) => CONTENT_PILLARS.includes(pillar)
    );
    const synthesisResults: GeneratedIdeaResult[] = [];

    for (let i = 0; i < allEntries.length; i += CONCURRENCY_LIMIT) {
      const batch = allEntries.slice(i, i + CONCURRENCY_LIMIT);
      console.log(
        `\n📦 Processing batch ${Math.floor(i / CONCURRENCY_LIMIT) + 1}/${Math.ceil(allEntries.length / CONCURRENCY_LIMIT)} (${batch.map(([p]) => p).join(", ")})...`,
      );
      const batchResults = await Promise.all(
        batch.map(([pillar, groupItems]) =>
          synthesizePillar(pillar, groupItems),
        ),
      );
      synthesisResults.push(...batchResults);
    }

    // ─── Step 4: Write Generated Ideas Sequentially with Throttle ───────────
    console.log("\n✍️ Starting sequential Notion database writes...");
    let ideasCreated = 0;

    for (const groupResult of synthesisResults) {
      const { pillar, groupItems, ideas } = groupResult;
      if (ideas.length === 0) continue;

      console.log(`Writing ${ideas.length} ideas for pillar: ${pillar}...`);

      for (const idea of ideas) {
        try {
          const validPillar = matchPillar(idea.pillar || pillar);
          const inspiredByScoutedIds: string[] = [];

          if (idea.inspiredByScoutedIds && Array.isArray(idea.inspiredByScoutedIds)) {
            for (const idStr of idea.inspiredByScoutedIds) {
              const matchedId = idStr.match(
                /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
              )?.[0];
              if (matchedId) {
                // Verify the ID belongs to one of our group items
                const exists = groupItems.some((item) => item.pageId === matchedId);
                if (exists) {
                  inspiredByScoutedIds.push(matchedId);
                }
              }
            }
          }

          // Fallback: If no direct ID was matched, run the cleanTitle matching on sourcedFrom as a safety net
          if (inspiredByScoutedIds.length === 0 && idea.sourcedFrom) {
            const cleanSourced = cleanTitle(idea.sourcedFrom);
            for (const item of groupItems) {
              const cleanScouted = cleanTitle(item.title);
              // Match length: check prefix similarity or direct inclusion
              const minLength = Math.min(cleanScouted.length, cleanSourced.length);
              const matchLength = Math.min(30, minLength);
              const isMatch =
                cleanSourced.includes(cleanScouted) ||
                cleanScouted.includes(cleanSourced) ||
                (matchLength >= 15 &&
                  cleanSourced.substring(0, matchLength) ===
                    cleanScouted.substring(0, matchLength));

              if (isMatch) {
                inspiredByScoutedIds.push(item.pageId);
              }
            }
          }

          const formatMap: Record<string, NonNullable<CreateIdeaOptions["formatIdea"]>> = {
            Short: "Short",
            "Mid-length": "Mid-length",
            Thread: "Thread",
            Article: "Article",
          };
          const normalizedFormat = formatMap[idea.format] || "Short";
          const validVoiceModes: StrategyBrief["voiceMode"][] = [
            "Builder-Retrospective",
            "Tool-Curator",
            "Case-Study",
          ];
          const normalizedVoiceMode = validVoiceModes.includes(idea.voiceMode)
            ? idea.voiceMode
            : "Builder-Retrospective";

          const rawData = [
            `🎙️ Voice: ${normalizedVoiceMode}`,
            `📐 Framework: ${idea.appliedFramework || "General Blended"}`,
            `📌 Cross-Pollination: ${idea.crossPollinationLogic}`,
            `📦 Sourced From: ${idea.sourcedFrom}`,
            `🔧 Structure: ${idea.tweetStructure}`,
          ].join("\n\n");

          const cleanLibraryId = idea.inspiredByLibraryId
            ? idea.inspiredByLibraryId.match(
                /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
              )?.[0]
            : undefined;

          // 1. Save Strategy to Notion Idea Bank
          const notionIdeaId = await createIdea(
            idea.title,
            "Idea Scout",
            validPillar,
            idea.hookAngle,
            rawData,
            {
              priority: idea.priority as any,
              formatIdea: normalizedFormat,
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
            `💡 Created idea strategy: "${idea.title.substring(0, 60)}" [${validPillar}]`,
          );

          // 2. Trigger the Writer Actor
          const strategyBrief: StrategyBrief = {
            title: idea.title,
            pillar: validPillar,
            voiceMode: normalizedVoiceMode,
            appliedFramework: idea.appliedFramework,
            hookAngle: idea.hookAngle,
            whyItWorks: idea.whyItWorks,
            format: normalizedFormat,
            stealablePattern: idea.stealablePattern,
            tweetStructure: idea.tweetStructure,
            crossPollinationLogic: idea.crossPollinationLogic
          };

          console.log(`🚀 Dispatching to Writer Actor for Idea: ${notionIdeaId}`);
          try {
            const writerHandle = await tasks.trigger("write-tweets", {
              notionIdeaId,
              strategyBrief,
            });
            const dispatchNote = [
              `Writer run ID: ${writerHandle.id}`,
              `Dispatched at: ${new Date().toISOString()}`,
              `Idea page ID: ${notionIdeaId}`,
              `Title: ${idea.title}`,
              `Voice mode: ${normalizedVoiceMode}`,
              `Format: ${normalizedFormat}`,
            ].join("\n");
            console.log(
              `🧾 Writer dispatched | idea=${notionIdeaId} | run=${writerHandle.id} | voice=${normalizedVoiceMode} | format=${normalizedFormat} | title="${idea.title}"`,
            );
            await appendIdeaOperationalNote(
              notionIdeaId,
              "Writer Dispatch",
              dispatchNote,
            );
          } catch (dispatchErr: any) {
            const message = dispatchErr?.message || String(dispatchErr);
            console.error(
              `Writer dispatch failed for Idea ${notionIdeaId}:`,
              message,
            );
            await appendIdeaOperationalNote(
              notionIdeaId,
              "Writer Dispatch Failed",
              [
                `Failed at: ${new Date().toISOString()}`,
                `Idea page ID: ${notionIdeaId}`,
                `Title: ${idea.title}`,
                `Voice mode: ${normalizedVoiceMode}`,
                `Format: ${normalizedFormat}`,
                `Error: ${message}`,
              ].join("\n"),
            );
          }

        } catch (err: any) {
          console.error(
            `Failed to create idea "${idea.title?.substring(0, 60)}":`,
            err.message || err,
          );
        }

        // Throttle to respect Notion rate limits (~3 reqs/sec)
        await new Promise((r) => setTimeout(r, 350));
      }
    }

    console.log(`✅ Draft complete: ${ideasCreated} ideas written to Ideas Bank`);
    return { ideasCreated };
}

export const draftIdeas = schedules.task({
  id: "draft-ideas",
  cron: "0 8 * * 1-6", // Mon-Sat 8:00 AM UTC (9:00 AM WAT)
  maxDuration: 900,
  retry: {
    maxAttempts: 2,
  },
  run: async (payload): Promise<{ ideasCreated: number }> => {
    return runDraftIdeas(payload);
  },
});

// ═══════════════════════════════════════════════════════════════
// HELPERS FOR CHUNKED DRAFTING
// ═══════════════════════════════════════════════════════════════

const PILLAR_TO_VIRAL_CATEGORIES: Record<string, string[]> = {
  "Vibe Coding": ["Vibe Coding", "Tech/AI"],
  "Automation": ["Tools/Resources", "Tech/AI"],
  "Creator Economy": ["Content Creators", "Business/Entrepreneurs"],
  "Copywriting and Storytelling": ["Marketing/Growth", "Content Creators"],
  "AI Prompting & Tools": ["Tech/AI", "Tools/Resources"],
  "AI Creative": ["Tech/AI", "Design/Creative"],
  "Personal/Vulnerability": ["Productivity/Self-Improvement", "Business/Entrepreneurs"],
  "Building in Public": ["Business/Entrepreneurs", "Marketing/Growth"],
};

function getPrimaryPillar(item: any): string {
  if (item.pillars && item.pillars.length > 0) {
    const activePillar = item.pillars.find((p: string) =>
      CONTENT_PILLARS.includes(p),
    );
    if (activePillar) return activePillar; // Use the first active Notion Niche tag
  }

  // Fallback: Keyword-based matching on summary / takeaways
  const textToSearch = `${item.title} ${item.aiSummary} ${item.keyTakeaways}`.toLowerCase();
  if (
    textToSearch.includes("cursor") ||
    textToSearch.includes("claude code") ||
    textToSearch.includes("lovable") ||
    textToSearch.includes("v0") ||
    textToSearch.includes("bolt.new") ||
    textToSearch.includes("vibe coding") ||
    textToSearch.includes("coder") ||
    textToSearch.includes("developer")
  ) {
    return "Vibe Coding";
  }
  if (
    textToSearch.includes("n8n") ||
    textToSearch.includes("make.com") ||
    textToSearch.includes("zapier") ||
    textToSearch.includes("automation") ||
    textToSearch.includes("workflows") ||
    textToSearch.includes("agentic")
  ) {
    return "Automation";
  }
  if (
    textToSearch.includes("newsletter") ||
    textToSearch.includes("beehiiv") ||
    textToSearch.includes("audience") ||
    textToSearch.includes("creator economy") ||
    textToSearch.includes("monetise") ||
    textToSearch.includes("sponsorship")
  ) {
    return "Creator Economy";
  }
  if (
    textToSearch.includes("kling") ||
    textToSearch.includes("runway") ||
    textToSearch.includes("sora") ||
    textToSearch.includes("elevenlabs") ||
    textToSearch.includes("avatar") ||
    textToSearch.includes("ai creative") ||
    textToSearch.includes("generate video")
  ) {
    return "AI Creative";
  }
  if (
    textToSearch.includes("hook") ||
    textToSearch.includes("copywriting") ||
    textToSearch.includes("storytelling") ||
    textToSearch.includes("persuasion")
  ) {
    return "Copywriting and Storytelling";
  }
  if (
    textToSearch.includes("public") ||
    textToSearch.includes("milestone") ||
    textToSearch.includes("mrr") ||
    textToSearch.includes("building in public")
  ) {
    return "Building in Public";
  }
  // Default fallback
  return "AI Prompting & Tools";
}

function cleanTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/^\[(youtube|instagram|x)\]\s*/i, "")
    .replace(/^(youtube|instagram|x)\s+post:\s*/i, "")
    .replace(/^(youtube|instagram|x)\s+video:\s*/i, "")
    .replace(/[\s\r\n]+/g, " ")
    .trim();
}
