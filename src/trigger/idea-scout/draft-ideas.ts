import { schedules, tasks } from "@trigger.dev/sdk/v3";
import { CONTENT_PILLARS } from "../../lib/constants";
import { matchPillar } from "../../lib/pillar-utils";
import { generateJSON } from "../../lib/llm";
import { ContentFormat, ValueBrief, VoiceMode } from "../../lib/voice-dna";
import {
  getRecentScoutedContent,
  getScoutedContentByIds,
  getTopViralPosts,
  getRecentIdeaTitles,
  getPillarDistribution,
  createIdea,
  cleanRejectedIdeas,
  CreateIdeaOptions,
  ScoutedContentForDraft,
} from "../../lib/notion";

interface DraftIdeasPayload {
  scoutedContentIds?: string[];
}

const VALUE_STRATEGIST_SYSTEM_PROMPT = `You are the Value Strategist for a Twitter/X creator.

Your job is NOT to write the final tweet.
Your job is to study ONE full source at a time and produce a source-grounded ValueBrief for the Writer.

The source transcript/content is the authority.
Viral templates are only packaging.
Voice modes are only styling direction.

Audience: sharp founders, indie hackers, builders, developers, and AI/automation operators.
Goal: extract useful value, not generic advice.

ACTIVE CONTENT PILLARS:
${CONTENT_PILLARS.map((p, i) => `${i + 1}. ${p}`).join("\n")}

VOICE MODES:
- Builder-Retrospective: commentary from a builder/operator POV. First-person is allowed only as commentary unless the source supports direct experience.
- Tool-Curator: external tool/repo/workflow spotlight. Best for concrete tools, specs, pricing, features, or comparisons.
- Case-Study: micro-case study, first-$/users/revenue breakdown, builder journey, or operator principle.

FORMAT CONTRACTS:
- Short: one tight tweet.
- Mid-length: one longer value tweet.
- Thread: multiple posts with [1/n] markers.
- Article: long-form markdown article.

RULES:
- Return 1 brief by default.
- Return 2-3 briefs only when the source contains clearly distinct, high-value angles.
- Never combine this source with unrelated sources.
- Preserve source IDs and URLs exactly.
- Extract facts, mechanisms, tools, examples, and numbers from the source.
- Add "doNotInvent" guardrails for anything the source does not prove.
- Do not invent personal experience, revenue, user counts, screenshots, steps, tools, or claims.
- If the source is too thin to support a useful draft, return an empty "briefs" array.
- Respond only with pure JSON. No markdown fences.`;

type Priority = NonNullable<CreateIdeaOptions["priority"]>;

const VALID_VOICE_MODES: VoiceMode[] = [
  "Builder-Retrospective",
  "Tool-Curator",
  "Case-Study",
];

const VALID_FORMATS: ContentFormat[] = [
  "Short",
  "Mid-length",
  "Thread",
  "Article",
];

const VALID_PRIORITIES: Priority[] = ["🔥 Hot", "💡 Good", "📝 Maybe"];

export async function runDraftIdeas(payload?: DraftIdeasPayload): Promise<{ ideasCreated: number }> {
  const scoutedContentIds = Array.isArray(payload?.scoutedContentIds)
    ? payload.scoutedContentIds
    : [];

  console.log(
    `💡 Draft Ideas starting — ${scoutedContentIds.length > 0 ? scoutedContentIds.length : "all recent"} scouted items to study`,
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

  let ideasCreated = 0;

  for (const source of scoutedContent) {
    try {
      const pillar = getPrimaryPillar(source);
      if (!CONTENT_PILLARS.includes(pillar)) {
        console.log(
          `⏭️ Skipping source "${source.title.substring(0, 80)}" because it did not map to an active pillar.`,
        );
        continue;
      }

      const templates = getTemplatesForPillar(viralPosts as any[], pillar);
      const valueBriefs = await generateValueBriefsForSource({
        source,
        pillar,
        templates,
        existingTitles,
        underservedPillars,
      });

      if (valueBriefs.length === 0) {
        console.log(`⏭️ No usable value angles found for source: ${source.title.substring(0, 80)}`);
        continue;
      }

      for (const valueBrief of valueBriefs) {
        const rawData = buildIdeaPageRawData(valueBrief);
        const notionIdeaId = await createIdea(
          valueBrief.ideaTitle,
          "Idea Scout",
          valueBrief.pillar,
          valueBrief.selectedAngle,
          rawData,
          {
            priority: valueBrief.priority || "💡 Good",
            formatIdea: valueBrief.format,
            stealablePattern: valueBrief.stealablePattern,
            tweetStructure: valueBrief.suggestedStructure,
            inspiredByScoutedIds: [valueBrief.sourcePageId],
            inspiredByLibraryId: valueBrief.inspiredByLibraryId,
            whyItWorks: valueBrief.whyThisMatters,
          },
        );

        ideasCreated++;
        console.log(
          `💡 Created source-grounded idea "${valueBrief.ideaTitle}" from "${source.title.substring(0, 60)}"`,
        );

        await tasks.trigger("write-tweets", {
          notionIdeaId,
          valueBrief,
        });

        console.log(
          `🚀 Writer Actor dispatched for idea=${notionIdeaId} voice=${valueBrief.voiceMode} format=${valueBrief.format}`,
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

export const draftIdeas = schedules.task({
  id: "draft-ideas",
  cron: "30 4 * * 1,3,5,0", // Mon/Wed/Fri/Sun 4:30 AM UTC (5:30 AM WAT)
  maxDuration: 900,
  retry: {
    maxAttempts: 2,
  },
  run: async (payload): Promise<{ ideasCreated: number }> => {
    return runDraftIdeas(payload as DraftIdeasPayload);
  },
});

async function generateValueBriefsForSource(input: {
  source: ScoutedContentForDraft;
  pillar: string;
  templates: any[];
  existingTitles: string[];
  underservedPillars: string[];
}): Promise<ValueBrief[]> {
  const { source, pillar, templates, existingTitles, underservedPillars } = input;
  const viralSummary = templates.map(formatViralTemplate).join("\n\n---\n\n");

  const prompt = `Study this ONE source and produce source-grounded ValueBriefs.

SOURCE METADATA
ID: ${source.pageId}
Title: ${source.title}
Platform: ${source.platform}
URL: ${source.url || "No URL"}
Primary active pillar: ${pillar}
Niche tags from Notion: ${source.pillars.join(", ") || "None"}

FULL SOURCE CONTEXT
${source.sourceText}

VIRAL POST LIBRARY PATTERNS
Use these only for packaging/structure. The source remains the authority.
${viralSummary || "No viral templates available."}

RECENT IDEA TITLES TO AVOID DUPLICATING
${existingTitles.slice(0, 30).join("\n") || "None yet"}

UNDERSERVED PILLARS
${underservedPillars.join(", ") || "None"}

RETURN JSON IN THIS SHAPE:
{
  "briefs": [
    {
      "ideaTitle": "2-5 word internal working title",
      "sourcePageId": "${source.pageId}",
      "sourceTitle": "${escapeForPrompt(source.title)}",
      "sourceUrl": "${escapeForPrompt(source.url)}",
      "platform": "${escapeForPrompt(source.platform)}",
      "pillar": "${pillar}",
      "voiceMode": "Builder-Retrospective" | "Tool-Curator" | "Case-Study",
      "format": "Short" | "Mid-length" | "Thread" | "Article",
      "sourceText": "Do not summarize here; the system will inject the full source text deterministically.",
      "sourceThesis": "The core claim/lesson of the source in 1-2 sentences",
      "sourceFacts": ["Specific facts from the source"],
      "numbersMentioned": ["Exact numbers/metrics from the source, or empty array"],
      "toolsMentioned": ["Tools/platforms/repos/frameworks named in the source, or empty array"],
      "specificExamples": ["Concrete examples/cases/stories from the source"],
      "mechanism": "The actual how/why behind the source insight",
      "whyThisMatters": "Why a builder/founder/operator should care",
      "valuableAngles": ["Distinct valuable angles found in the source"],
      "selectedAngle": "The strongest angle for this draft",
      "mustUseDetails": ["Concrete source details the Writer must use"],
      "doNotInvent": ["Unsupported claims the Writer must not add"],
      "suggestedStructure": "Specific structure for the final draft",
      "priority": "🔥 Hot" | "💡 Good" | "📝 Maybe",
      "appliedFramework": "Optional packaging framework from the viral library",
      "stealablePattern": "Optional viral pattern used only as packaging",
      "inspiredByLibraryId": "Optional Notion ID of the viral template used"
    }
  ]
}`;

  const generated = await generateJSON(
    prompt,
    VALUE_STRATEGIST_SYSTEM_PROMPT,
    0.45,
    "x-ai/grok-4.3",
  );

  const rawBriefs = Array.isArray(generated?.briefs)
    ? generated.briefs
    : Array.isArray(generated?.ideas)
      ? generated.ideas
      : [];

  return rawBriefs
    .slice(0, 3)
    .map((brief: any) => normalizeValueBrief(brief, source, pillar))
    .filter((brief: ValueBrief | null): brief is ValueBrief => brief !== null);
}

function normalizeValueBrief(raw: any, source: ScoutedContentForDraft, fallbackPillar: string): ValueBrief | null {
  const pillar = matchPillar(String(raw?.pillar || fallbackPillar));
  if (!CONTENT_PILLARS.includes(pillar)) return null;

  const voiceMode = VALID_VOICE_MODES.includes(raw?.voiceMode)
    ? raw.voiceMode
    : inferVoiceMode(raw, source);

  const format = VALID_FORMATS.includes(raw?.format)
    ? raw.format
    : inferFormat(raw);

  const priority = VALID_PRIORITIES.includes(raw?.priority)
    ? raw.priority
    : "💡 Good";

  const ideaTitle = cleanIdeaTitle(raw?.ideaTitle || raw?.title || raw?.selectedAngle || source.title);
  const sourceFacts = ensureStringArray(raw?.sourceFacts);
  const mustUseDetails = ensureStringArray(raw?.mustUseDetails);

  if (sourceFacts.length === 0 && mustUseDetails.length === 0) {
    return null;
  }

  return {
    ideaTitle,
    sourcePageId: source.pageId,
    sourceTitle: source.title,
    sourceUrl: source.url,
    platform: source.platform,
    pillar,
    voiceMode,
    format,
    sourceText: source.sourceText,
    sourceThesis: stringOrFallback(raw?.sourceThesis, source.aiSummary || source.title),
    sourceFacts,
    numbersMentioned: ensureStringArray(raw?.numbersMentioned),
    toolsMentioned: ensureStringArray(raw?.toolsMentioned),
    specificExamples: ensureStringArray(raw?.specificExamples),
    mechanism: stringOrFallback(raw?.mechanism, "Explain the practical mechanism directly from the source."),
    whyThisMatters: stringOrFallback(raw?.whyThisMatters, "This gives builders a concrete lesson from the source."),
    valuableAngles: ensureStringArray(raw?.valuableAngles),
    selectedAngle: stringOrFallback(raw?.selectedAngle || raw?.hookAngle, raw?.sourceThesis || source.aiSummary || source.title),
    mustUseDetails,
    doNotInvent: ensureStringArray(raw?.doNotInvent).length > 0
      ? ensureStringArray(raw?.doNotInvent)
      : [
          "Do not invent metrics, tools, steps, timelines, or outcomes not present in the source.",
          "Do not claim the creator personally built or tested anything unless the source says so.",
        ],
    suggestedStructure: stringOrFallback(raw?.suggestedStructure || raw?.tweetStructure, "Hook, source-backed insight, mechanism, practical takeaway."),
    priority,
    appliedFramework: stringOrFallback(raw?.appliedFramework, "Source-grounded value breakdown"),
    stealablePattern: stringOrFallback(raw?.stealablePattern, "Use viral templates only as packaging; do not override source truth."),
    inspiredByLibraryId: cleanNotionId(raw?.inspiredByLibraryId),
  };
}

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

function buildIdeaPageRawData(valueBrief: ValueBrief): string {
  return [
    `Source Title:\n${valueBrief.sourceTitle}`,
    valueBrief.sourceUrl ? `Source URL:\n${valueBrief.sourceUrl}` : "",
    `Platform:\n${valueBrief.platform}`,
    `Source Thesis:\n${valueBrief.sourceThesis}`,
    `Selected Angle:\n${valueBrief.selectedAngle}`,
    `Why This Matters:\n${valueBrief.whyThisMatters}`,
    `Mechanism:\n${valueBrief.mechanism}`,
    `Source Facts:\n${formatLines(valueBrief.sourceFacts)}`,
    `Numbers Mentioned:\n${formatLines(valueBrief.numbersMentioned)}`,
    `Tools Mentioned:\n${formatLines(valueBrief.toolsMentioned)}`,
    `Specific Examples:\n${formatLines(valueBrief.specificExamples)}`,
    `Must-Use Details:\n${formatLines(valueBrief.mustUseDetails)}`,
    `Do Not Invent:\n${formatLines(valueBrief.doNotInvent)}`,
    `Suggested Structure:\n${valueBrief.suggestedStructure}`,
    `Voice Mode:\n${valueBrief.voiceMode}`,
    `Format:\n${valueBrief.format}`,
    `Packaging Pattern:\n${valueBrief.stealablePattern || "Source-grounded value breakdown"}`,
    `Full ValueBrief JSON:\n${JSON.stringify(valueBrief, null, 2)}`,
  ].filter(Boolean).join("\n\n---\n\n");
}

function ensureStringArray(value: any): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean);
}

function stringOrFallback(value: any, fallback: string): string {
  const str = String(value || "").trim();
  return str || fallback;
}

function cleanIdeaTitle(value: string): string {
  const cleaned = String(value || "")
    .replace(/[\r\n]+/g, " ")
    .replace(/^["']|["']$/g, "")
    .trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  return words.slice(0, 6).join(" ") || "Source Value Angle";
}

function cleanNotionId(value: any): string | undefined {
  const match = String(value || "").match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  );
  return match?.[0];
}

function inferVoiceMode(raw: any, source: ScoutedContentForDraft): VoiceMode {
  const text = `${raw?.selectedAngle || ""} ${raw?.sourceThesis || ""} ${source.sourceText}`.toLowerCase();
  if (
    text.includes("tool") ||
    text.includes("repo") ||
    text.includes("github") ||
    text.includes("open-source") ||
    text.includes("open source")
  ) {
    return "Tool-Curator";
  }
  if (
    text.includes("first $") ||
    text.includes("revenue") ||
    text.includes("mrr") ||
    text.includes("case study") ||
    text.includes("someone built")
  ) {
    return "Case-Study";
  }
  return "Builder-Retrospective";
}

function inferFormat(raw: any): ContentFormat {
  const structure = String(raw?.suggestedStructure || raw?.selectedAngle || "").toLowerCase();
  if (structure.includes("article") || structure.includes("long-form")) return "Article";
  if (structure.includes("thread") || structure.includes("[1/")) return "Thread";
  if (structure.includes("mid")) return "Mid-length";
  return "Mid-length";
}

function formatLines(items: string[]): string {
  return items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "- None extracted";
}

function escapeForPrompt(value: string): string {
  return String(value || "").replace(/"/g, '\\"');
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
