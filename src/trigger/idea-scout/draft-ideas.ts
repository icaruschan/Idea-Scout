import { task, tasks } from "@trigger.dev/sdk/v3";
import { CONTENT_PILLARS } from "../../lib/constants";
import { IDEA_SCOUT_CONFIG } from "../../lib/idea-scout-config";
import { ExecutionPlan } from "../../lib/voice-dna";
import { runComprehensionPipeline } from "./comprehend-source";
import {
  getRecentScoutedContent,
  getScoutedContentByIds,
  getTopViralPosts,
  getRecentIdeaTitles,
  getPillarDistribution,
  createIdea,
  cleanRejectedIdeas,
  getRawSourceDepth,
  CreateIdeaOptions,
  ScoutedContentForDraft,
} from "../../lib/notion";

interface DraftIdeasPayload {
  scoutedContentIds?: string[];
}

const YT_IG_TARGET_SHARE = 0.7;
const X_TARGET_SHARE = 0.3;
const MIN_RAW_SOURCE_DEPTH = 300;

/** Prioritize all YT/IG sources, then cap X to ~30% of the YT/IG count. */
export function prioritizeSourcesByPlatform(
  scoutedContent: ScoutedContentForDraft[],
): ScoutedContentForDraft[] {
  const ytIgSources = scoutedContent
    .filter((s) => s.platform === "YouTube" || s.platform === "Instagram")
    .sort((a, b) => getRawSourceDepth(b) - getRawSourceDepth(a));

  const xSources = scoutedContent
    .filter((s) => s.platform === "X")
    .sort((a, b) => getRawSourceDepth(b) - getRawSourceDepth(a));

  const ytIgSelected = ytIgSources;

  let xCap: number;
  if (ytIgSelected.length === 0) {
    xCap = xSources.length;
  } else {
    xCap = Math.max(1, Math.round((ytIgSelected.length * X_TARGET_SHARE) / YT_IG_TARGET_SHARE));
    xCap = Math.min(xCap, xSources.length);
  }

  return [...ytIgSelected, ...xSources.slice(0, xCap)];
}

export async function runDraftIdeas(payload?: DraftIdeasPayload): Promise<{ ideasCreated: number }> {
  const scoutedContentIds = Array.isArray(payload?.scoutedContentIds)
    ? payload.scoutedContentIds
    : [];

  console.log(
    scoutedContentIds.length > 0
      ? `💡 Draft Ideas starting — ${scoutedContentIds.length} item(s) from scout-content dispatch`
      : `💡 Draft Ideas starting — catch-all mode, querying recent unlinked scouted content (past 7 days)`,
  );

  const cleanedCount = await cleanRejectedIdeas();
  if (cleanedCount > 0) {
    console.log(`🗑️ Cleaned up ${cleanedCount} rejected ideas to free up source content.`);
  }

  const [scoutedContent, viralPosts, existingTitles, pillarCounts] =
    await Promise.all([
      scoutedContentIds.length > 0
        ? getScoutedContentByIds(scoutedContentIds)
        : getRecentScoutedContent(7),
      getTopViralPosts(30),
      getRecentIdeaTitles(30),
      getPillarDistribution(14),
    ]);

  const totalIdeas = (Object.values(pillarCounts) as number[]).reduce(
    (a: number, b: number) => a + b,
    0,
  );
  const avgPerPillar = totalIdeas / CONTENT_PILLARS.length || 1;
  const underservedPillars = CONTENT_PILLARS.filter(
    (p) => (pillarCounts[p] || 0) < avgPerPillar * 0.5,
  );

  console.log(
    `Context loaded → Scouted: ${scoutedContent.length}, Viral templates: ${viralPosts.length}, Existing ideas: ${existingTitles.length}`,
  );
  console.log(
    `Underserved pillars: ${underservedPillars.length > 0 ? underservedPillars.join(", ") : "none"}`,
  );

  if (scoutedContent.length === 0) {
    console.log("⚠️ No scouted content available. Skipping drafting.");
    return { ideasCreated: 0 };
  }

  const prioritizedAll = prioritizeSourcesByPlatform(scoutedContent);
  const sourceCap = IDEA_SCOUT_CONFIG.maxSourcesPerRun;
  const prioritizedSources = prioritizedAll.slice(0, sourceCap);
  const ytIgCount = prioritizedSources.filter(
    (s) => s.platform === "YouTube" || s.platform === "Instagram",
  ).length;
  const xCount = prioritizedSources.filter((s) => s.platform === "X").length;

  console.log(
    `📊 Platform weighting: ${ytIgCount} YT/IG + ${xCount} X = ${prioritizedSources.length} total (out of ${scoutedContent.length} available)`,
  );
  if (prioritizedAll.length > prioritizedSources.length) {
    console.log(
      `⏭️ Per-run source cap: processing ${prioritizedSources.length}/${prioritizedAll.length} (maxSourcesPerRun=${sourceCap})`,
    );
  }

  let ideasCreated = 0;

  for (const source of prioritizedSources) {
    try {
      const rawDepth = getRawSourceDepth(source);
      if (rawDepth < MIN_RAW_SOURCE_DEPTH) {
        console.log(
          `⏭️ Skipping "${source.title.substring(0, 60)}" — raw source too thin (${rawDepth} chars, need ${MIN_RAW_SOURCE_DEPTH})`,
        );
        continue;
      }

      const pillar = getPrimaryPillar(source);
      if (!CONTENT_PILLARS.includes(pillar)) {
        console.log(
          `⏭️ Skipping source "${source.title.substring(0, 80)}" because it did not map to an active pillar.`,
        );
        continue;
      }

      const templates = getTemplatesForPillar(viralPosts as any[], pillar);
      const viralSummary = templates.map(formatViralTemplate).join("\n\n---\n\n");

      console.log(`🧠 Comprehension pipeline for: ${source.title.substring(0, 80)}`);

      const executionPlans = await runComprehensionPipeline({
        source,
        pillar,
        viralPosts: templates,
        viralSummary,
      });

      if (executionPlans.length === 0) {
        console.log(`⏭️ Comprehension produced no plans for: ${source.title.substring(0, 80)}`);
        continue;
      }

      for (const plan of executionPlans) {
        if (
          existingTitles.some(
            (t) =>
              t.toLowerCase() === plan.ideaTitle.toLowerCase() ||
              t.toLowerCase() === plan.selectedAngle.toLowerCase(),
          )
        ) {
          console.log(`⏭️ Skipping duplicate angle: ${plan.ideaTitle}`);
          continue;
        }

        const rawData = buildIdeaPageRawData(plan);
        const notionIdeaId = await createIdea(
          plan.ideaTitle,
          "Idea Scout",
          plan.pillar,
          plan.hookFilledExample || plan.selectedAngle,
          rawData,
          {
            priority: plan.priority || "💡 Good",
            formatIdea: plan.format,
            stealablePattern: plan.stealablePattern,
            tweetStructure: plan.viralTweetStructure || plan.suggestedStructure,
            inspiredByScoutedIds: [plan.sourcePageId],
            inspiredByLibraryId: plan.inspiredByLibraryId,
            whyItWorks: plan.viralWhyItWorks || plan.whyThisMatters,
          },
        );

        ideasCreated++;
        console.log(
          `💡 Created ${plan.format} idea "${plan.ideaTitle}" from "${source.title.substring(0, 60)}"`,
        );

        existingTitles.push(plan.ideaTitle);
        existingTitles.push(plan.selectedAngle);

        await tasks.trigger("write-tweets", {
          notionIdeaId,
          valueBrief: plan as ExecutionPlan,
        });

        console.log(
          `🚀 Writer dispatched idea=${notionIdeaId} voice=${plan.voiceMode} format=${plan.format}`,
        );

        await wait(350);
      }
    } catch (err: any) {
      console.error(
        `❌ Failed to draft from source "${source.title?.substring(0, 80)}":`,
        err?.message || err,
      );
    }
  }

  console.log(`✅ Draft complete: ${ideasCreated} source-grounded ideas written to Ideas Bank`);
  return { ideasCreated };
}

// Manual-only: triggered directly or dispatched by scout-content after a scouting run.
export const draftIdeas = task({
  id: "draft-ideas",
  maxDuration: 3600,
  retry: {
    maxAttempts: 2,
  },
  run: async (payload: unknown): Promise<{ ideasCreated: number }> => {
    const draftPayload =
      payload &&
      typeof payload === "object" &&
      "scoutedContentIds" in payload
        ? (payload as DraftIdeasPayload)
        : undefined;
    return runDraftIdeas(draftPayload);
  },
});

function getPrimaryPillar(item: ScoutedContentForDraft): string {
  if (item.pillars && item.pillars.length > 0) {
    const activePillar = item.pillars.find((p: string) =>
      CONTENT_PILLARS.includes(p),
    );
    if (activePillar) return activePillar;
  }

  const textToSearch = `${item.title} ${item.aiSummary} ${item.keyTakeaways}`.toLowerCase();
  if (
    textToSearch.includes("web3") ||
    textToSearch.includes("crypto") ||
    textToSearch.includes("solana") ||
    textToSearch.includes("ethereum") ||
    textToSearch.includes("nft")
  ) {
    return "Unknown";
  }

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
    textToSearch.includes("monetization") ||
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
  if (
    textToSearch.includes("chatgpt") ||
    textToSearch.includes("claude") ||
    textToSearch.includes("prompt") ||
    textToSearch.includes("grok") ||
    textToSearch.includes("perplexity")
  ) {
    return "AI Prompting & Tools";
  }

  return "Unknown";
}

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

function getTemplatesForPillar(viralPosts: any[], pillar: string): any[] {
  const matchedCategories = PILLAR_TO_VIRAL_CATEGORIES[pillar] || [];
  const matched = viralPosts.filter((post) => {
    const p = post.properties || {};
    const cats = p.Category?.multi_select?.map((s: any) => s.name) || [];
    return cats.some((c: string) => matchedCategories.includes(c));
  });

  if (matched.length >= 4) return matched.slice(0, 8);

  const existingIds = new Set(matched.map((t) => t.id));
  const generalTemplates = viralPosts.filter((post) => {
    const rating = post.properties?.["⭐ Rating"]?.select?.name || "";
    return rating.includes("⭐⭐⭐⭐⭐") || rating.includes("★★★★★");
  });

  for (const template of generalTemplates) {
    if (!existingIds.has(template.id)) matched.push(template);
    if (matched.length >= 8) break;
  }

  return matched.slice(0, 8);
}

function formatViralTemplate(post: any): string {
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
  return `[ID: ${post.id}] [${rating}] [Hook Type: ${hookType}]
Template/Text:
${tweetText}

Structure:
${structure}

Steal-able Pattern:
${stealable}

Why it works:
${whyItWorksVal}`;
}

export function buildIdeaPageRawData(plan: ExecutionPlan): string {
  const outlineText =
    plan.detailedOutline?.map((s, i) => `${i + 1}. ${s.heading} — ${s.purpose}`).join("\n") ||
    plan.suggestedStructure;

  const gems = plan.mustUseDetails?.slice(0, 8) || [];

  return [
    `## What This Source Is About`,
    plan.comprehensionSummary || plan.sourceThesis,
    ``,
    `## Who It's For`,
    `${plan.targetAudience} — ${plan.audiencePain}`,
    ``,
    `## Creator Is Doing`,
    plan.creatorDoing || "See source transcript.",
    ``,
    plan.primaryValueBomb
      ? `## Value Bomb\n${plan.primaryValueBomb.insight} → ${plan.primaryValueBomb.bestFormat}`
      : "",
    ``,
    `## Chosen Output`,
    `${plan.format} — ${plan.ideaTitle}`,
    `Angle: ${plan.selectedAngle}`,
    ``,
    `## Outline`,
    outlineText,
    ``,
    plan.talkingPoints?.length
      ? `## Talking Points\n${plan.talkingPoints.map((point) => `- ${point}`).join("\n")}`
      : "",
    ``,
    plan.stepByStepProcess?.length
      ? `## Step by Step Process\n${plan.stepByStepProcess.map((step) => `- ${step}`).join("\n")}`
      : "",
    ``,
    `## Hook`,
    plan.hookFilledExample || plan.contentPromise,
    plan.hookTemplate ? `Template: ${plan.hookTemplate}` : "",
    ``,
    `## Packaging`,
    `Pattern: ${plan.stealablePattern || "Source-grounded guide"}`,
    plan.viralTweetStructure ? `Structure: ${plan.viralTweetStructure}` : "",
    ``,
    `## Key Source Details`,
    ...gems.map((g) => `- ${g}`),
    ``,
    `## Source Link`,
    plan.sourceUrl ? plan.sourceUrl : plan.sourceTitle,
    ``,
    `Voice: ${plan.voiceMode} | Pillar: ${plan.pillar}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function formatLines(items: string[]): string {
  return items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "- None";
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
