import { generateJSONStrategist } from "../../lib/llm";
import { getRawSourceDepth, ScoutedContentForDraft } from "../../lib/notion";
import { IDEA_SCOUT_CONFIG } from "../../lib/idea-scout-config";
import {
  formatHookCandidates,
  matchHookTemplates,
  type HookTemplate,
} from "../../lib/hook-matcher";
import type {
  BrainstormedOutput,
  ContentArchetype,
  ExecutionPlanPayload,
  OutlineSection,
  ScoutAnalysis,
  SourceComprehension,
  TeachableUnit,
  ValueBomb,
  ViralTemplateRef,
} from "../../lib/content-intelligence";
import type { ContentFormat, VoiceMode } from "../../lib/voice-dna";
import { CONTENT_PILLARS } from "../../lib/constants";

const COMPREHEND_SYSTEM = `You are a senior content strategist for a builder/founder X audience.

Your job is to STUDY one source deeply — like a human who watched the full video or read the full transcript.

Do NOT brainstorm tweet ideas yet.
Do NOT fill generic slots with vague language.
Describe what the creator is ACTUALLY doing and what value exists for builders, founders, and operators.

If scout analysis contradicts the transcript, the transcript wins.

Respond only with pure JSON. No markdown fences.`;

const BRAINSTORM_SYSTEM = `You are a senior content strategist brainstorming publication-ready outputs from a studied source.

Primary outputs: valuable ARTICLES (guides), THREADS (teachable sequences), MID-LENGTH tweets (one complete value bomb).
Short tweets ONLY when the source has one punchy standalone insight.

Brainstorm 2-5 distinct outputs spanning multiple formats when the source supports it.
Include at least one primary value bomb candidate (usually mid-length or strong thread opener).

Respond only with pure JSON. No markdown fences.`;

const PLAN_SYSTEM = `You are a senior content strategist creating an execution plan for a writer.

The source is authority. Your plan must trace every detail to the comprehension and transcript gems.
Do not invent metrics, tools, steps, or outcomes.

Respond only with pure JSON. No markdown fences.`;

const GENERIC_CREATOR_DOING = [
  "explains a topic",
  "talks about",
  "discusses the subject",
  "shares thoughts on",
];

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function buildStrategistSourceBlock(source: ScoutedContentForDraft): string {
  const depth = getRawSourceDepth(source);
  const scout = source.scoutAnalysis;

  return [
    `SOURCE METADATA`,
    `Title: ${source.title}`,
    `Platform: ${source.platform}`,
    `URL: ${source.url || "No URL"}`,
    `RAW SOURCE DEPTH: ${depth} characters`,
    ``,
    `FULL TRANSCRIPT / SOURCE TEXT (AUTHORITATIVE):`,
    source.rawSourceText || source.transcriptPreview || source.title,
    ``,
    scout
      ? [
          `SCOUT ANALYSIS (helper only — verify against transcript):`,
          `Summary: ${scout.summary}`,
          `Creator doing: ${scout.creatorDoing}`,
          `Content type: ${scout.contentType}`,
          `Target audience: ${scout.targetAudience}`,
          `Primary pain: ${scout.primaryPain}`,
          `Guide potential: ${scout.guidePotential}`,
          `Teachable units: ${scout.teachableUnits.join(" | ")}`,
          `Transcript gems: ${scout.transcriptGems.join(" | ")}`,
        ].join("\n")
      : `SCOUT ANALYSIS: Not available — study transcript directly.`,
  ].join("\n\n");
}

export function validateComprehension(
  comprehension: SourceComprehension,
  rawDepth: number,
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const cfg = IDEA_SCOUT_CONFIG;

  if (wordCount(comprehension.contentAbout) < cfg.minComprehensionWords) {
    issues.push(`contentAbout too short (${wordCount(comprehension.contentAbout)} words)`);
  }
  if ((comprehension.teachableUnits || []).length < cfg.minTeachableUnits) {
    issues.push(`teachableUnits < ${cfg.minTeachableUnits}`);
  }
  if (
    rawDepth > cfg.longSourceCharThreshold &&
    (comprehension.transcriptOnlyGems || []).length < cfg.minTranscriptGemsForLongSource
  ) {
    issues.push("missing transcriptOnlyGems for long source");
  }
  const doing = comprehension.creatorDoing?.toLowerCase() || "";
  if (GENERIC_CREATOR_DOING.some((g) => doing.includes(g))) {
    issues.push("creatorDoing is generic");
  }

  return { valid: issues.length === 0, issues };
}

function normalizeTeachableUnits(raw: unknown): TeachableUnit[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item: any) => {
      if (typeof item === "string") {
        return {
          unit: item,
          audienceRelevance: "",
          painItSolves: "",
          depthAvailable: "medium" as const,
          sourceEvidence: "",
          formatFit: {
            article: "moderate" as const,
            thread: "moderate" as const,
            midLength: "moderate" as const,
            short: "weak" as const,
          },
        };
      }
      return {
        unit: String(item?.unit || "").trim(),
        audienceRelevance: String(item?.audienceRelevance || "").trim(),
        painItSolves: String(item?.painItSolves || "").trim(),
        depthAvailable: item?.depthAvailable || "medium",
        sourceEvidence: String(item?.sourceEvidence || "").trim(),
        formatFit: {
          article: item?.formatFit?.article || "moderate",
          thread: item?.formatFit?.thread || "moderate",
          midLength: item?.formatFit?.midLength || "moderate",
          short: item?.formatFit?.short || "weak",
        },
      };
    })
    .filter((u) => u.unit.length > 0);
}

export function normalizeComprehension(raw: Record<string, unknown>): SourceComprehension {
  return {
    contentAbout: String(raw.contentAbout || "").trim(),
    creatorDoing: String(raw.creatorDoing || "").trim(),
    contentType: (raw.contentType as ContentArchetype) || "workflow-walkthrough",
    creatorIntent: String(raw.creatorIntent || "").trim(),
    narrativeArc: String(raw.narrativeArc || "").trim(),
    sourceAudience: String(raw.sourceAudience || "").trim(),
    yourAudience: String(raw.yourAudience || "").trim(),
    audienceOverlap: String(raw.audienceOverlap || "").trim(),
    audienceSophistication:
      (raw.audienceSophistication as SourceComprehension["audienceSophistication"]) ||
      "intermediate",
    primaryPain: String(raw.primaryPain || "").trim(),
    secondaryPains: ensureArray(raw.secondaryPains),
    painEvidence: ensureArray(raw.painEvidence),
    costOfInaction: String(raw.costOfInaction || "").trim(),
    coreValue: String(raw.coreValue || "").trim(),
    valueType: (raw.valueType as SourceComprehension["valueType"]) || "how-to-guide",
    readerOutcome: String(raw.readerOutcome || "").trim(),
    whyNow: String(raw.whyNow || "").trim(),
    teachableUnits: normalizeTeachableUnits(raw.teachableUnits),
    transcriptOnlyGems: ensureArray(raw.transcriptOnlyGems),
    specificTools: ensureArray(raw.specificTools),
    specificSteps: ensureArray(raw.specificSteps),
    specificMistakes: ensureArray(raw.specificMistakes),
    specificProof: ensureArray(raw.specificProof),
    unsupportedClaims: ensureArray(raw.unsupportedClaims),
  };
}

export async function comprehendSource(
  source: ScoutedContentForDraft,
  strict = false,
): Promise<SourceComprehension | null> {
  const prompt = `${strict ? "STRICT MODE: Be highly specific. Ban generic creatorDoing phrases.\n\n" : ""}Study this source and return comprehension JSON.

${buildStrategistSourceBlock(source)}

RETURN JSON:
{
  "contentAbout": "80+ words — what this content IS, not a tweet angle",
  "creatorDoing": "What the creator is literally doing on screen/in text",
  "contentType": "workflow-walkthrough | tool-demo | tool-comparison | case-study | contrarian-essay | operator-principle | news-reaction | listicle | personal-story",
  "creatorIntent": "Why they made this",
  "narrativeArc": "How the piece flows",
  "sourceAudience": "Who the creator made this for",
  "yourAudience": "Builders, founders, indie hackers, automation operators",
  "audienceOverlap": "Where audiences match or diverge",
  "audienceSophistication": "beginner | intermediate | advanced",
  "primaryPain": "Main friction the audience feels",
  "secondaryPains": ["..."],
  "painEvidence": ["quotes or facts from source"],
  "costOfInaction": "What happens if they ignore this",
  "coreValue": "One sentence — the real value",
  "valueType": "workflow | framework | warning | tool-discovery | mindset-shift | case-proof | how-to-guide",
  "readerOutcome": "What reader can DO after consuming",
  "whyNow": "Why this matters now from source",
  "teachableUnits": [
    {
      "unit": "distinct chunk",
      "audienceRelevance": "...",
      "painItSolves": "...",
      "depthAvailable": "low | medium | high",
      "sourceEvidence": "specific quote or fact",
      "formatFit": { "article": "weak|moderate|strong", "thread": "weak|moderate|strong", "midLength": "weak|moderate|strong", "short": "weak|moderate|strong" }
    }
  ],
  "transcriptOnlyGems": ["details ONLY in transcript, not title/summary"],
  "specificTools": ["..."],
  "specificSteps": ["..."],
  "specificMistakes": ["..."],
  "specificProof": ["numbers, results if stated"],
  "unsupportedClaims": ["what source does NOT prove"]
}`;

  const raw = await generateJSONStrategist(
    prompt,
    COMPREHEND_SYSTEM,
    IDEA_SCOUT_CONFIG.strategistTemperature.comprehend,
  );
  const comprehension = normalizeComprehension(raw);
  const validation = validateComprehension(comprehension, getRawSourceDepth(source));

  if (!validation.valid && !strict) {
    console.warn(`⚠️ Shallow comprehension, retrying strict: ${validation.issues.join(", ")}`);
    return comprehendSource(source, true);
  }
  if (!validation.valid) {
    console.warn(`⏭️ Comprehension rejected: ${validation.issues.join(", ")}`);
    return null;
  }

  return comprehension;
}

export async function brainstormOutputs(
  comprehension: SourceComprehension,
  source: ScoutedContentForDraft,
  pillar: string,
  viralSummary: string,
): Promise<BrainstormedOutput[]> {
  const rawDepth = getRawSourceDepth(source);
  const shortOnly = rawDepth < IDEA_SCOUT_CONFIG.hardShortOnlyCharThreshold;

  const prompt = `Brainstorm publication outputs from this comprehension.

PILLAR: ${pillar}
PLATFORM: ${source.platform}
RAW DEPTH: ${rawDepth} chars
${shortOnly ? "HARD RULE: Source < 500 chars — Short format ONLY." : "Prefer Article/Thread for rich YT/IG sources when teachable units support it."}

COMPREHENSION:
${JSON.stringify(comprehension, null, 2)}

VIRAL LIBRARY PATTERNS (packaging reference only):
${viralSummary || "None"}

RETURN JSON:
{
  "primaryValueBomb": {
    "insight": "...",
    "pain": "...",
    "mechanism": "...",
    "proof": "...",
    "bestFormat": "Short | Mid-length | Thread | Article",
    "whyThisFormat": "...",
    "sourceEvidence": ["..."]
  },
  "outputs": [
    {
      "workingTitle": "2-5 words",
      "format": "Short | Mid-length | Thread | Article",
      "angle": "...",
      "isPrimaryValueBomb": true/false,
      "targetAudience": "...",
      "painAddressed": "...",
      "valueProposition": "...",
      "readerOutcome": "...",
      "hookDirection": "...",
      "sourceUnitsUsed": ["..."],
      "transcriptGemsUsed": ["..."],
      "estimatedDepth": "e.g. 2000 words / 10 posts / 18 lines",
      "priority": "🔥 Hot | 💡 Good | 📝 Maybe",
      "rationale": "why this format fits",
      "formatFitScore": 1-10
    }
  ]
}`;

  const raw = await generateJSONStrategist(
    prompt,
    BRAINSTORM_SYSTEM,
    IDEA_SCOUT_CONFIG.strategistTemperature.brainstorm,
  );

  const outputs = Array.isArray(raw.outputs) ? raw.outputs : [];
  const valueBomb = raw.primaryValueBomb as ValueBomb | undefined;

  return outputs
    .slice(0, 5)
    .map((item: any) => normalizeBrainstormed(item, shortOnly))
    .filter((o): o is BrainstormedOutput => o !== null)
    .map((o) => ({
      ...o,
      primaryValueBomb: o.isPrimaryValueBomb ? valueBomb : undefined,
    }));
}

function normalizeBrainstormed(raw: any, shortOnly: boolean): BrainstormedOutput | null {
  const format = normalizeFormat(raw?.format);
  if (shortOnly && format !== "Short") return null;

  const workingTitle = cleanTitle(raw?.workingTitle || raw?.angle || "Source Angle");
  if (!workingTitle) return null;

  return {
    workingTitle,
    format: shortOnly ? "Short" : format,
    angle: String(raw?.angle || workingTitle).trim(),
    isPrimaryValueBomb: Boolean(raw?.isPrimaryValueBomb),
    targetAudience: String(raw?.targetAudience || "").trim(),
    painAddressed: String(raw?.painAddressed || "").trim(),
    valueProposition: String(raw?.valueProposition || "").trim(),
    readerOutcome: String(raw?.readerOutcome || "").trim(),
    hookDirection: String(raw?.hookDirection || "").trim(),
    sourceUnitsUsed: ensureArray(raw?.sourceUnitsUsed),
    transcriptGemsUsed: ensureArray(raw?.transcriptGemsUsed),
    estimatedDepth: String(raw?.estimatedDepth || "").trim(),
    priority: normalizePriority(raw?.priority),
    rationale: String(raw?.rationale || "").trim(),
    formatFitScore: Number(raw?.formatFitScore) || 5,
  };
}

export function selectOutputs(
  outputs: BrainstormedOutput[],
  source: ScoutedContentForDraft,
): BrainstormedOutput[] {
  if (outputs.length === 0) return [];

  const cfg = IDEA_SCOUT_CONFIG;
  const sorted = [...outputs].sort((a, b) => {
    const priorityScore = (p: string) =>
      p === "🔥 Hot" ? 3 : p === "💡 Good" ? 2 : 1;
    const ps = priorityScore(b.priority) - priorityScore(a.priority);
    if (ps !== 0) return ps;
    return b.formatFitScore - a.formatFitScore;
  });

  const selected: BrainstormedOutput[] = [sorted[0]];
  if (cfg.outputsPerSource <= 1 || sorted.length < 2) return selected;

  const firstFormat = selected[0].format;
  const secondCandidate = sorted.find(
    (o, idx) =>
      idx > 0 &&
      o.formatFitScore >= cfg.minFormatFitScoreForSecondOutput &&
      (cfg.preferFormatDiversity ? o.format !== firstFormat : true),
  );

  if (secondCandidate) selected.push(secondCandidate);
  return selected;
}

export function parseViralTemplate(post: any): ViralTemplateRef {
  const p = post.properties || {};
  return {
    id: post.id,
    tweetStructure:
      p["Tweet Structure"]?.rich_text?.[0]?.plain_text ||
      p["Structure"]?.select?.name ||
      "",
    stealablePattern: p["Steal-able Pattern"]?.rich_text?.[0]?.plain_text || "",
    whyItWorks:
      p["💡 Why It Works"]?.rich_text?.[0]?.plain_text ||
      p["Why It Works"]?.rich_text?.[0]?.plain_text ||
      "",
    hookType: p["Hook Type"]?.select?.name || "",
    format: p["Format"]?.select?.name || p["Format Idea"]?.select?.name || "",
    rating: p["⭐ Rating"]?.select?.name || "",
  };
}

export function pickViralTemplate(
  templates: any[],
  format: ContentFormat,
  fallbackId?: string,
): ViralTemplateRef | null {
  if (templates.length === 0) return null;

  const parsed = templates.map(parseViralTemplate);
  const formatMatch = parsed.find(
    (t) => t.format?.toLowerCase() === format.toLowerCase(),
  );
  if (formatMatch) return formatMatch;

  if (fallbackId) {
    const byId = parsed.find((t) => t.id === fallbackId);
    if (byId) return byId;
  }

  return parsed[0];
}

export async function planExecution(
  comprehension: SourceComprehension,
  chosen: BrainstormedOutput,
  source: ScoutedContentForDraft,
  pillar: string,
  viralTemplate: ViralTemplateRef | null,
  hookCandidates: HookTemplate[],
): Promise<ExecutionPlanPayload | null> {
  const hooksText = formatHookCandidates(hookCandidates);

  const prompt = `Create an execution plan for the writer.

COMPREHENSION:
${JSON.stringify(comprehension, null, 2)}

CHOSEN OUTPUT:
${JSON.stringify(chosen, null, 2)}

SOURCE PAGE ID: ${source.pageId}
PILLAR: ${pillar}

HOOK TEMPLATE CANDIDATES (pick ONE, fill for this source):
${hooksText}

VIRAL TEMPLATE:
${viralTemplate ? JSON.stringify(viralTemplate, null, 2) : "None — use source-native structure"}

RETURN JSON matching ExecutionPlan fields including:
- ideaTitle (2-5 words)
- voiceMode: Builder-Retrospective | Tool-Curator | Case-Study
- detailedOutline: array of { heading, purpose, sourceUnits, mustInclude, targetWords }
- hookTemplate, hookFilledExample, hookRationale
- viralTemplateId, viralTweetStructure, viralWhyItWorks, stealablePattern
- sourceFacts, mustUseDetails (from transcript gems), doNotInvent
- minWordTarget, minSectionCount (articles), minPostCount (threads)
- All audience/value fields populated from comprehension`;

  const raw = await generateJSONStrategist(
    prompt,
    PLAN_SYSTEM,
    IDEA_SCOUT_CONFIG.strategistTemperature.plan,
  );

  return buildExecutionPlan(raw, comprehension, chosen, source, pillar, viralTemplate);
}

function buildExecutionPlan(
  raw: Record<string, unknown>,
  comprehension: SourceComprehension,
  chosen: BrainstormedOutput,
  source: ScoutedContentForDraft,
  pillar: string,
  viralTemplate: ViralTemplateRef | null,
): ExecutionPlanPayload | null {
  const sourceFacts = ensureArray(raw.sourceFacts);
  const mustUse = ensureArray(raw.mustUseDetails);
  if (sourceFacts.length === 0 && mustUse.length === 0) {
    mustUse.push(...chosen.transcriptGemsUsed.slice(0, 5));
    sourceFacts.push(...comprehension.transcriptOnlyGems.slice(0, 5));
  }
  if (sourceFacts.length === 0 && mustUse.length === 0) return null;

  const format = chosen.format;
  const targets = IDEA_SCOUT_CONFIG.formatWordTargets;

  const outline = normalizeOutline(raw.detailedOutline, format);

  return {
    ideaTitle: cleanTitle(String(raw.ideaTitle || chosen.workingTitle)),
    sourcePageId: source.pageId,
    sourceTitle: source.title,
    sourceUrl: source.url,
    platform: source.platform,
    pillar: CONTENT_PILLARS.includes(pillar) ? pillar : pillar,
    voiceMode: normalizeVoiceMode(raw.voiceMode, comprehension),
    format,
    sourceText: source.sourceText,
    sourceThesis: String(raw.sourceThesis || comprehension.coreValue).trim(),
    sourceFacts,
    numbersMentioned: ensureArray(raw.numbersMentioned).length
      ? ensureArray(raw.numbersMentioned)
      : comprehension.specificProof,
    toolsMentioned: ensureArray(raw.toolsMentioned).length
      ? ensureArray(raw.toolsMentioned)
      : comprehension.specificTools,
    specificExamples: ensureArray(raw.specificExamples).length
      ? ensureArray(raw.specificExamples)
      : chosen.sourceUnitsUsed,
    mechanism: String(raw.mechanism || chosen.angle).trim(),
    whyThisMatters: String(raw.whyThisMatters || comprehension.coreValue).trim(),
    targetAudience: String(raw.targetAudience || chosen.targetAudience || comprehension.yourAudience).trim(),
    audiencePain: String(raw.audiencePain || chosen.painAddressed || comprehension.primaryPain).trim(),
    valueProposition: String(raw.valueProposition || chosen.valueProposition).trim(),
    readerOutcome: String(raw.readerOutcome || chosen.readerOutcome || comprehension.readerOutcome).trim(),
    whyNow: String(raw.whyNow || comprehension.whyNow).trim(),
    contentPromise: String(raw.contentPromise || chosen.hookDirection).trim(),
    valuableAngles: ensureArray(raw.valuableAngles).length
      ? ensureArray(raw.valuableAngles)
      : comprehension.teachableUnits.map((u) => u.unit),
    selectedAngle: String(raw.selectedAngle || chosen.angle).trim(),
    mustUseDetails: mustUse,
    doNotInvent: ensureArray(raw.doNotInvent).length
      ? ensureArray(raw.doNotInvent)
      : comprehension.unsupportedClaims.length
        ? comprehension.unsupportedClaims
        : ["Do not invent metrics, tools, steps, or outcomes not in the source."],
    suggestedStructure: outlineToStructure(outline, format),
    priority: normalizePriority(raw.priority || chosen.priority),
    appliedFramework: String(raw.appliedFramework || viralTemplate?.stealablePattern || "Source-grounded guide").trim(),
    stealablePattern: String(raw.stealablePattern || viralTemplate?.stealablePattern || "").trim(),
    inspiredByLibraryId: String(raw.viralTemplateId || raw.inspiredByLibraryId || viralTemplate?.id || "").trim() || undefined,
    comprehensionSummary: comprehension.contentAbout,
    creatorDoing: comprehension.creatorDoing,
    contentArchetype: comprehension.contentType,
    primaryValueBomb: chosen.primaryValueBomb,
    detailedOutline: outline,
    hookTemplate: String(raw.hookTemplate || "").trim(),
    hookFilledExample: String(raw.hookFilledExample || chosen.hookDirection || "").trim(),
    hookRationale: String(raw.hookRationale || "").trim(),
    viralTemplateId: String(raw.viralTemplateId || viralTemplate?.id || "").trim() || undefined,
    viralTweetStructure: String(raw.viralTweetStructure || viralTemplate?.tweetStructure || "").trim(),
    viralWhyItWorks: String(raw.viralWhyItWorks || viralTemplate?.whyItWorks || "").trim(),
    minWordTarget:
      format === "Article"
        ? targets.article.min
        : format === "Thread"
          ? targets.thread.minPosts * 80
          : format === "Mid-length"
            ? 200
            : 80,
    minSectionCount: format === "Article" ? targets.article.minSections : undefined,
    minPostCount: format === "Thread" ? targets.thread.minPosts : undefined,
  };
}

export async function runComprehensionPipeline(input: {
  source: ScoutedContentForDraft;
  pillar: string;
  viralPosts: any[];
  viralSummary: string;
}): Promise<ExecutionPlanPayload[]> {
  const { source, pillar, viralPosts, viralSummary } = input;

  const comprehension = await comprehendSource(source);
  if (!comprehension) return [];

  const brainstormed = await brainstormOutputs(comprehension, source, pillar, viralSummary);
  if (brainstormed.length === 0) return [];

  const selected = selectOutputs(brainstormed, source);
  const plans: ExecutionPlanPayload[] = [];

  for (const chosen of selected) {
    const viralTemplate = pickViralTemplate(viralPosts, chosen.format);
    const hookCandidates = matchHookTemplates({
      primaryPain: chosen.painAddressed || comprehension.primaryPain,
      mechanism: comprehension.coreValue,
      contentType: comprehension.contentType,
      coreValue: comprehension.coreValue,
      hookDirection: chosen.hookDirection,
    });

    const plan = await planExecution(
      comprehension,
      chosen,
      source,
      pillar,
      viralTemplate,
      hookCandidates,
    );
    if (plan) plans.push(plan);
  }

  return plans;
}

function normalizeOutline(raw: unknown, format: ContentFormat): OutlineSection[] {
  if (!Array.isArray(raw)) return [];
  const sections = raw
    .map((s: any) => ({
      heading: String(s?.heading || "").trim(),
      purpose: String(s?.purpose || "").trim(),
      sourceUnits: ensureArray(s?.sourceUnits),
      mustInclude: ensureArray(s?.mustInclude),
      targetWords: s?.targetWords ? Number(s.targetWords) : undefined,
    }))
    .filter((s) => s.heading);

  if (sections.length > 0) return sections;

  if (format === "Article") {
    return [
      { heading: "Opening hook", purpose: "Stop scroll with pain + promise", sourceUnits: [], mustInclude: [] },
      { heading: "Problem framing", purpose: "Audience pain from source", sourceUnits: [], mustInclude: [] },
      { heading: "Core mechanism", purpose: "How/why from source", sourceUnits: [], mustInclude: [] },
      { heading: "Walkthrough", purpose: "Steps/tools from source", sourceUnits: [], mustInclude: [] },
      { heading: "Takeaways", purpose: "Actionable close", sourceUnits: [], mustInclude: [] },
    ];
  }
  return sections;
}

function outlineToStructure(outline: OutlineSection[], format: ContentFormat): string {
  if (format === "Thread") {
    return outline.map((s, i) => `Post ${i + 1}: ${s.heading} — ${s.purpose}`).join(" → ");
  }
  return outline.map((s) => `${s.heading}: ${s.purpose}`).join(" → ");
}

function ensureArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v || "").trim()).filter(Boolean);
}

function cleanTitle(value: string): string {
  const words = String(value || "")
    .replace(/[\r\n]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return words.slice(0, 6).join(" ") || "Source Angle";
}

function normalizeFormat(value: unknown): ContentFormat {
  const v = String(value || "").trim();
  if (v === "Short" || v === "Mid-length" || v === "Thread" || v === "Article") return v;
  if (/thread/i.test(v)) return "Thread";
  if (/article|long/i.test(v)) return "Article";
  if (/mid/i.test(v)) return "Mid-length";
  return "Mid-length";
}

function normalizePriority(value: unknown): "🔥 Hot" | "💡 Good" | "📝 Maybe" {
  const v = String(value || "");
  if (v.includes("🔥")) return "🔥 Hot";
  if (v.includes("📝")) return "📝 Maybe";
  return "💡 Good";
}

function normalizeVoiceMode(raw: unknown, comprehension: SourceComprehension): VoiceMode {
  const v = String(raw || "");
  if (v === "Tool-Curator" || v === "Case-Study" || v === "Builder-Retrospective") return v;

  const text = `${comprehension.contentType} ${comprehension.creatorDoing} ${comprehension.specificTools.join(" ")}`.toLowerCase();
  if (/tool|repo|comparison|demo/.test(text)) return "Tool-Curator";
  if (/case|revenue|operator|principle/.test(text)) return "Case-Study";
  return "Builder-Retrospective";
}

export { parseScoutAnalysisFromPageBody } from "../../lib/scout-analysis";