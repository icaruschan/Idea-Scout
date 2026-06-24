import * as fs from "fs";
import * as path from "path";
import type { ExecutionPlanPayload, OutlineSection } from "./content-intelligence";
import { IDEA_SCOUT_CONFIG } from "./idea-scout-config";

export const VOICE_DNA_PROMPT = `# 🧬 VOICE DNA DOCUMENT: THE TRENCH-BUILDER CURATOR
*System Prompt Injection Ready | Pivot Context: Tech/AI/Automation Developer-Builder*

---

## 1. VOICE IDENTITY & PERSONA
**Core Persona:** The Trench-Builder Curator. A peer-level developer, automation practitioner, and AI workflow architect who documents real implementations, stress-tests tools, and shares hard-won operational lessons. Not a guru. Not a hype-man. A builder who ships, breaks things, fixes them, and leaves the blueprint on the table.

**Character Posture:**
- **Peer Builder:** Speaks from the trenches. Uses "we" and "I" interchangeably. Never positions above the audience.
- **Protective Mentor:** Warns against cheap campaigns, burnout, and tool-hopping. Advocates for compounding systems and reputation capital.
- **Practical Curator:** Filters noise. Surfaces signal. Translates complex AI/automation concepts into actionable, step-by-step workflows.

**Conversational Relationship:** Talks *with* a fellow traveler, not *at* them. Shares scar tissue openly. Gives an unvarnished look at what works, what breaks, and what actually moves the needle.

---

## 2. SENTENCE ARCHITECTURE & TECHNICAL CONSTRAINTS (SHORT / MID-LENGTH ONLY)
**[APPLIES TO SHORT AND MID-LENGTH TWEETS ONLY — NOT ARTICLES OR THREADS]**
- Word Limits: 6-12 words per line block. Max 14 words per line.
- Block Constraints: Max 2 lines per paragraph. Never cluster >3 consecutive lines without visual break.
- Visual Spacing: Exactly 1 empty line between thoughts. Double line break before list, quote, or CTA.
- Opening Casing: Predominantly sentence case. Lowercase openings rare (~1%).
- Opening Length: First line 4-8 words (median 6). Max 14 words.
- Opening Emojis: ~1 in 3 openers has a single emoji at the end of the line.
- Visual Layout: ~42% of lines are empty. Lists are dominant (70% of tweets use arrows/checkmarks).
- Bullet Characters: Use →, ➡️, ➠, ➥, ✅. Don't mix styles.
- Formatting Emojis: Placed at the end of a line. Moderate frequency. No clusters.
- Punctuation: Ellipsis (...) in ~21% of tweets. Colons introduce lists. Em-dashes almost never (~1%).
- Capitalization: Sentence case default. ALL CAPS for surgical 1-2 words.
- Vocabulary: "guys" (17%), "cooking/cooked", "grateful", "shout out", "positioned/positioning", "touch grass", "wild", "insane", "banger".
- Slang: "tbh" (~2%), "ngl" (~1%), "GGs" (~2%), "kings" (~4%), "lol" (~2%) as seasoning, not base.
- Banned Words: "Let's dive in", "In today's world", "Game changer", "Synergy", "Revolutionize", "To the moon", "WAGMI", "LFG", "Bro" (unless Case-Study mode), "Fam", "Unlock potential", "Paradigm shift", "Leverage".

**Rhythmic Flow Pattern:**
\`Staccato Opening\` → \`Analytical/Contextual Bridge\` → \`Punchy Payoff/Resolution\`
- *Execution Rule:* Keep sentences tight. Use line breaks as breath marks. Never stack more than two lines before a visual reset.

---

## 3. ANTI-PATTERNS (STRICT PROHIBITIONS)
- **Never sound like a generic threadboi selling a course.** No "DM me for access", no "1000% ROI", no fake scarcity.
- **Never post passive summaries.** Every post must contain actionable insight, exact specs, or a clear lesson.
- **Never use corporate speak or startup fluff.** Ban: "synergy", "paradigm shift", "leverage", "unlock potential", "game changer".
- **Never force engagement.** No "drop a 🔥", no "follow for more", no "what do you think?". Let the content stand alone.
`;

export const VOICE_DNA_LONG = `# LONG-FORM VOICE DNA (ARTICLES & THREADS)

IGNORE all short-tweet line constraints (6-12 words per line, 42% empty lines, max 2 lines per paragraph).

Write like a sharp builder publishing a guide or native X Article:
- Full paragraphs (3-6 sentences each) with conversational flow
- Section headers (## / ###) for articles; [n/m] markers for threads
- Teach mechanisms, workflows, examples, and warnings from the source
- Depth over brevity — expand thinking, do not summarize into tweet spacing
- Stay plain-language; no corporate fluff or fake-smart jargon
`;

export const VOICE_EXAMPLES_PER_PROMPT = 5;
export const THREAD_EXAMPLES_PER_PROMPT = 3;

const BUILDER_POSITIVE_TERMS = [
  "i built",
  "i spent",
  "i finally",
  "i tried",
  "i did a thing",
  "vibe coding",
  "automation",
  "workflow",
  "agent",
  "claude",
  "cursor",
  "n8n",
  "pipeline",
  "scout",
  "notion",
  "github",
  "llm",
  "shipping",
  "shipped",
  "idea scout",
  "how it works",
  "lesson",
  "burnout",
  "burned out",
  "creativity is the moat",
];

const BUILDER_NEGATIVE_TERMS = [
  "ronin",
  "persona ip",
  "azuki",
  "immutable",
  "pixel heroes",
  "bonsai",
  "virtuals_io",
  "sei network",
  "web3",
  "crypto",
  "nft",
  "memecoin",
  "gaming",
  "mmorpg",
  "star platinum",
  "mr beast",
  "ready player one",
  "among us",
  "fps game",
  "auto clicking",
];

const MICRO_CASE_TERMS = [
  "someone built",
  "someone on reddit",
  "first $",
  "first 100",
  "120 subscribers",
  "tiny number",
  "useful money",
];

export type VoiceMode = "Builder-Retrospective" | "Tool-Curator" | "Case-Study";

export function scoreVoiceSample(text: string, voiceMode: VoiceMode, likes = 0): number {
  const low = text.toLowerCase();
  let score = 0;

  if (voiceMode === "Builder-Retrospective") {
    for (const term of BUILDER_POSITIVE_TERMS) {
      if (low.includes(term)) score += 10;
    }
    for (const term of BUILDER_NEGATIVE_TERMS) {
      if (low.includes(term)) score -= 30;
    }
    if (/\bi (built|spent|fixed|tried|learned|finally)\b/i.test(text)) score += 15;
    if (/\b(→|step \d|here's what)\b/i.test(text)) score += 8;
    if (/\[1\/\d+\]/.test(text) && low.includes("this is ")) score -= 12;
  } else if (voiceMode === "Case-Study") {
    for (const term of MICRO_CASE_TERMS) {
      if (low.includes(term)) score += 18;
    }
    if (/\bbro\b/.test(low)) score += 4;
    if (low.includes("reputation") || low.includes("compounding")) score += 6;
  }

  score += Math.log10(Math.max(1, likes + 1)) * 3;
  return score;
}

export function selectVoiceSamples(
  fewShotSamples: any[],
  handleTarget: string,
  voiceMode: VoiceMode,
  limit = VOICE_EXAMPLES_PER_PROMPT,
): string[] {
  const useRelevanceRanking =
    voiceMode === "Builder-Retrospective" || voiceMode === "Case-Study";

  return fewShotSamples
    .filter((s) => s.handle === handleTarget)
    .map((s) => ({
      text: s.text as string,
      rankScore: useRelevanceRanking
        ? scoreVoiceSample(s.text, voiceMode, s.likes ?? 0)
        : (s.likes ?? 0),
    }))
    .sort((a, b) => b.rankScore - a.rankScore)
    .slice(0, limit)
    .map((s) => s.text);
}

export type ContentFormat = "Short" | "Mid-length" | "Thread" | "Article";

export interface ValueBrief {
  ideaTitle: string;
  sourcePageId: string;
  sourceTitle: string;
  sourceUrl: string;
  platform: string;
  pillar: string;
  voiceMode: VoiceMode;
  format: ContentFormat;
  sourceText: string;
  sourceThesis: string;
  sourceFacts: string[];
  numbersMentioned: string[];
  toolsMentioned: string[];
  specificExamples: string[];
  mechanism: string;
  whyThisMatters: string;
  targetAudience: string;
  audiencePain: string;
  valueProposition: string;
  readerOutcome: string;
  whyNow: string;
  contentPromise: string;
  valuableAngles: string[];
  selectedAngle: string;
  mustUseDetails: string[];
  doNotInvent: string[];
  suggestedStructure: string;
  priority?: "🔥 Hot" | "💡 Good" | "📝 Maybe";
  appliedFramework?: string;
  stealablePattern?: string;
  inspiredByLibraryId?: string;
}

/** Writer input — ValueBrief + comprehension-first execution fields */
export interface ExecutionPlan extends ValueBrief {
  comprehensionSummary?: string;
  creatorDoing?: string;
  contentArchetype?: string;
  primaryValueBomb?: {
    insight: string;
    pain: string;
    mechanism: string;
    proof: string;
    bestFormat: ContentFormat;
    whyThisFormat: string;
    sourceEvidence: string[];
  };
  detailedOutline?: OutlineSection[];
  hookTemplate?: string;
  hookFilledExample?: string;
  hookRationale?: string;
  viralTweetStructure?: string;
  viralWhyItWorks?: string;
  minWordTarget?: number;
  minSectionCount?: number;
  minPostCount?: number;
}

export interface ArticleExample {
  author: string;
  title: string;
  url: string;
  text: string;
  wordCount: number;
  archetype: string;
  pillar: string;
}

function formatList(items: string[]): string {
  return items && items.length > 0
    ? items.map((item) => `- ${item}`).join("\n")
    : "- None found in source.";
}

function getFormatInstructions(format: ContentFormat, plan?: ExecutionPlan): string {
  const targets = IDEA_SCOUT_CONFIG.formatWordTargets;

  if (format === "Short") {
    return `Draft ONE short tweet.
- 4-9 lines max.
- One clear source-backed idea.
- Must include at least one concrete source detail if available.
- Use only when the source has one punchy, self-contained insight.
- No thread numbering.
- Output ONLY the tweet text.`;
  }

  if (format === "Mid-length") {
    return `Draft ONE mid-length tweet (${targets.midLength.minLines}-25 lines).
- ONE complete value bomb: pain → mechanism → proof → takeaway.
- Build from hook → source-backed insight → mechanism → practical takeaway.
- Must include at least 2 concrete source details (tools, numbers, steps).
- Use short paragraphs and line breaks.
- No thread numbering.
- CLOSER: End with ONE of these shapes (pick the best fit — do NOT default to "Bookmark this" every time):
  1. Action step: "Try [specific step from source] this week."
  2. Decision rule: "If [condition], use [approach]. Otherwise, [alternative]."
  3. Source pointer: "Full breakdown in the source — worth 10 minutes."
  4. Bookmark CTA (Tool-Curator only): "Bookmark this for [specific use case]."
- Never repeat the same closer phrasing across drafts.
- Output ONLY the tweet text.`;
  }

  if (format === "Thread") {
    const minPosts = plan?.minPostCount || targets.thread.minPosts;
    return `Draft a valuable thread (${minPosts}-${targets.thread.idealPosts} posts minimum).
- Use [1/n], [2/n], etc. markers on EVERY post.
- Post 1 = hook (adapt the hook template provided).
- Posts 2..n-1 = one teachable unit each with source proof (mechanism, example, or warning).
- Final post = summary + what the reader should do next.
- Each post must be at least 2 sentences with concrete source-backed value.
- Best when the source has 5-8 teachable steps, lessons, mistakes, or examples.
- No "thread incoming" or filler setup posts.
- Follow the DETAILED OUTLINE post-by-post.
- Output ONLY the thread text.`;
  }

  const minWords = plan?.minWordTarget || targets.article.min;
  const minSections = plan?.minSectionCount || targets.article.minSections;
  return `Draft the final LONG-FORM ARTICLE (${minWords}-${targets.article.ideal} words minimum).
- Write a full native X Article / guide — NOT a thread with headers.
- IGNORE staccato tweet formatting. Write FULL paragraphs (3-6 sentences each).
- Structure: strong opening hook → problem framing → ${minSections}+ titled sections (## / ###).
- Each section MUST include: mechanism + concrete example + takeaway from the source.
- Turn the source into a useful breakdown with workflows, tools, steps, and warnings.
- Best when the source has a complete workflow, deep argument, multiple sections, or several examples.
- Follow the DETAILED OUTLINE section-by-section.
- Close with an actionable summary the reader can execute.
- Output ONLY the raw article text (markdown headers allowed).`;
}

function getModeFormatGuidance(voiceMode: VoiceMode, format: ContentFormat): string {
  if (format !== "Article" && format !== "Thread") return "";

  if (voiceMode === "Builder-Retrospective") {
    return format === "Article"
      ? "ARTICLE MODE: First-person builder commentary on workflows and scar tissue. Share operational lessons from the source."
      : "THREAD MODE: Each post = one lesson learned. First-person allowed as commentary only if source supports it.";
  }
  if (voiceMode === "Tool-Curator") {
    return format === "Article"
      ? "ARTICLE MODE: Spec-dense guide with → lists, pricing, setup steps, comparisons. Third-person analytical."
      : "THREAD MODE: One tool feature, capability, or spec per post. Arrow lists encouraged.";
  }
  return format === "Article"
    ? "ARTICLE MODE: Operator essay — lowercase openers, business mechanics, reputation and systems thinking."
    : "THREAD MODE: One operator principle per post. Lowercase openers. 'bro' for emphasis only.";
}

export function loadArticleExamples(): ArticleExample[] {
  const p = path.resolve(process.cwd(), "src/data/article-examples.json");
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

export function selectThreadSamples(
  fewShotSamples: any[],
  handleTarget: string,
  voiceMode: VoiceMode,
  limit = THREAD_EXAMPLES_PER_PROMPT,
): string[] {
  return fewShotSamples
    .filter((s) => s.handle === handleTarget)
    .filter((s) => /\[1\/\d+\]|\[1\/\]|\(1\/\d+\)/.test(s.text))
    .map((s) => ({
      text: s.text as string,
      rankScore: scoreVoiceSample(s.text, voiceMode, s.likes ?? 0),
    }))
    .sort((a, b) => b.rankScore - a.rankScore)
    .slice(0, limit)
    .map((s) => s.text);
}

function formatOutline(outline: OutlineSection[] | undefined): string {
  if (!outline?.length) return "Follow suggested structure from the brief.";
  return outline
    .map(
      (s, i) =>
        `${i + 1}. ${s.heading}\n   Purpose: ${s.purpose}\n   Must include: ${s.mustInclude.join("; ") || "source-backed details"}`,
    )
    .join("\n");
}

export function buildWriterPrompt(
  valueBrief: ValueBrief | ExecutionPlan,
  voiceMode: VoiceMode,
  fewShotSamples: any[],
) {
  const plan = valueBrief as ExecutionPlan;
  const format = valueBrief.format;
  const isLongForm = format === "Article" || format === "Thread";
  // Filter samples based on the voice mode mapping
  // Builder-Retrospective -> Dreyshq samples
  // Tool-Curator -> Sharbel samples
  // Case-Study -> Zaimiri samples

  let handleTarget = 'Dreyshq';
  let modeInstructions = '';

  if (voiceMode === 'Builder-Retrospective') {
    handleTarget = 'Dreyshq';
    modeInstructions = `MODE BEHAVIORAL CONTRACT: Builder-Retrospective (Emulating X Creator: @Dreyshq)
    - MUST DO: Write in the first-person perspective ("I built", "I tried", "I spent", "my setup"). Share actual scar tissue, shipping lessons, operational failures, and what worked/broke. Focus on personal builder experience.
    - MUST NOT DO: Do NOT use detached third-person tool descriptions or arrow lists (e.g., → Feature 1). Do NOT use generic marketing call-to-actions like "Bookmark this".
    - STYLE: Peer builder, transparent, slightly self-deprecating but highly competent. Uses phrases like "I did a thing guys", "grateful", "grateful for the feedback".`;
  } else if (voiceMode === 'Tool-Curator') {
    handleTarget = 'sharbel';
    modeInstructions = `MODE BEHAVIORAL CONTRACT: Tool-Curator (Emulating X Creator: @sharbel)
    - MUST DO: Write in an analytical, third-person perspective. Spotlight a specific tool, repository, API, model, or comparison. Use arrow-heavy lists (→) to break down specs, features, pricing, setup steps, or comparisons. Highlight open-source vs proprietary SaaS. Allowed/encouraged to use "Bookmark this" as a call-to-action.
    - MUST NOT DO: Do NOT write in first-person ("I built this", "my workflow") or invent personal anecdotes. Do NOT write conversational narrative or lowercase sentence starters.
    - STYLE: Resource-dense, spec-driven, highly structured, clean.`;
  } else if (voiceMode === 'Case-Study') {
    handleTarget = 'zaimiri';
    modeInstructions = `MODE BEHAVIORAL CONTRACT: Case-Study (Emulating X Creator: @zaimiri)
    - MUST DO: Focus on macro/micro case studies, operator wisdom, business model breakdowns, and scaling principles. Use lowercase sentence openers frequently (e.g. "someone built a...", "the best model for..."). Use "bro" strictly for emphasis (e.g. "bro thought he could...", "it's simple, bro"). Focus on long-term reputation, distribution, and compounding systems.
    - MUST NOT DO: Do NOT use structured arrow lists (→) or developer setup tutorials. Do NOT use first-person builder anecdotes ("I built this").
    - STYLE: Lowkey, lowercase-heavy, operator wisdom, street-smart business insight.`;
  }

  let matchedSamples: string[];
  if (format === "Thread") {
    const threadSamples = selectThreadSamples(fewShotSamples, handleTarget, voiceMode);
    matchedSamples =
      threadSamples.length > 0
        ? threadSamples
        : selectVoiceSamples(fewShotSamples, handleTarget, voiceMode, VOICE_EXAMPLES_PER_PROMPT);
  } else {
    matchedSamples = selectVoiceSamples(
      fewShotSamples,
      handleTarget,
      voiceMode,
      VOICE_EXAMPLES_PER_PROMPT,
    );
  }

  const articleExamples =
    format === "Article" ? loadArticleExamples().slice(0, 3) : [];

  const voiceDna = isLongForm ? VOICE_DNA_LONG : VOICE_DNA_PROMPT;
  const modeFormatGuidance = getModeFormatGuidance(voiceMode, format);

  const systemPrompt = `CRITICAL: You are writing in ${voiceMode} mode.
Each mode produces a COMPLETELY DIFFERENT style, perspective, and format structure.
If you default to a generic staccato builder voice, or mix up the behaviors (e.g., using "Bookmark this" in Builder-Retrospective mode, or first-person "I built" in Tool-Curator/Case-Study mode), you have FAILED.
The voice samples below are your absolute ground truth for THIS mode.

You are an elite ghostwriter for a sharp founder/developer in the Tech/AI/Automation space.
You write source-grounded, valuable tweets, threads, long tweets, and articles.

The source is the authority. The brief is your map. Viral templates and voice samples are packaging only.

${voiceDna}
${isLongForm ? "\nCRITICAL: Do NOT apply short-tweet line constraints to this format.\n" : ""}
---
${modeInstructions}
${modeFormatGuidance ? `\n${modeFormatGuidance}\n` : ""}

STRICT GROUNDING RULES
- Do not invent metrics, tools, steps, screenshots, timelines, revenue, users, or outcomes.
- Do not write fake first-person experience. First-person is allowed only as commentary unless the source proves the creator personally did it.
- Do not turn a summary into a generic motivational post.
- If a detail is not in the source or brief, leave it out.
- Every draft must teach something useful from the source: a mechanism, workflow, example, warning, or decision rule.

PLAIN-LANGUAGE RULE
Write like a smart builder explaining it to a friend.

Use simple grammar.
Use short, clear sentences.
Prefer concrete actions over abstract nouns.

You can use niche terms when they are widely understood by the audience:
Cursor, Claude Code, n8n, Zapier, webhook, API, MCP, agent, prompt, repo, scraper, workflow, funnel, MRR.

But do not dress simple ideas in fake-smart language.

Avoid fake-smart phrasing:
- routing system
- operational layer
- qualification infrastructure
- signal extraction workflow
- leverage automation
- optimize conversion pathways

Prefer concrete wording:
- qualify leads faster
- send the best leads to Slack
- check the form
- pull company info
- skip bad-fit leads
- reply before they go cold

HOOK RULES
- Hooks must be simple, specific, and reader-centered.
- Prefer a real pain, mistake, surprising mechanism, or concrete outcome.
- Build the opening from audience pain + source mechanism + reader outcome.
- Avoid abstract labels unless they are widely understood in the niche.
- Do not use "Here's why", "AI is changing everything", or generic threadboi openers unless the source gives a stronger reason.
`;

  const formatInstructions = getFormatInstructions(format, plan);

  const userPrompt = `Here is the SOURCE-GROUNDED EXECUTION PLAN for the content you need to write:

${plan.comprehensionSummary ? `COMPREHENSION — What this source is about:\n${plan.comprehensionSummary}\n\n` : ""}${plan.creatorDoing ? `CREATOR IS DOING:\n${plan.creatorDoing}\n\n` : ""}Idea Title: ${valueBrief.ideaTitle}
Pillar: ${valueBrief.pillar}
Format Required: ${valueBrief.format}
Platform: ${valueBrief.platform}
Source Title: ${valueBrief.sourceTitle}
Source URL: ${valueBrief.sourceUrl || "No URL provided"}
Framework/Packaging: ${valueBrief.appliedFramework || "Source-grounded value breakdown"}

Source Thesis:
${valueBrief.sourceThesis}

Selected Angle:
${valueBrief.selectedAngle}

Why This Matters:
${valueBrief.whyThisMatters}

Target Audience:
${valueBrief.targetAudience}

Audience Pain:
${valueBrief.audiencePain}

Value Proposition:
${valueBrief.valueProposition}

Reader Outcome:
${valueBrief.readerOutcome}

Why Now:
${valueBrief.whyNow}

Content Promise:
${valueBrief.contentPromise}

Mechanism:
${valueBrief.mechanism}

Source Facts:
${formatList(valueBrief.sourceFacts)}

Numbers Mentioned:
${formatList(valueBrief.numbersMentioned)}

Tools Mentioned:
${formatList(valueBrief.toolsMentioned)}

Specific Examples:
${formatList(valueBrief.specificExamples)}

Must-Use Details:
${formatList(valueBrief.mustUseDetails)}

Do Not Invent:
${formatList(valueBrief.doNotInvent)}

Suggested Structure:
${valueBrief.suggestedStructure}

${plan.detailedOutline?.length ? `DETAILED OUTLINE (follow this):\n${formatOutline(plan.detailedOutline)}\n\n` : ""}${plan.hookFilledExample ? `HOOK (lines 1-2 MUST adapt this):\nTemplate: ${plan.hookTemplate || "n/a"}\nFilled: ${plan.hookFilledExample}\nWhy: ${plan.hookRationale || "scroll-stop opener"}\n\n` : ""}${plan.viralTweetStructure ? `VIRAL BODY STRUCTURE (packaging flow):\n${plan.viralTweetStructure}\n\n` : ""}Viral Pattern to use only as packaging:
${valueBrief.stealablePattern || "None. Prioritize source truth."}

---
EXAMPLES OF THIS EXACT VOICE & STYLE:
Read these carefully to match the pacing, line breaks, formatting, and vocabulary perfectly.

${matchedSamples.map((text, i) => `Example ${i + 1}:\n${text}\n`).join("\n")}
${articleExamples.length > 0 ? `\n---\nFULL ARTICLE DEPTH EXAMPLES (match this depth and structure — do NOT truncate your output):\n${articleExamples.map((a, i) => `Article Example ${i + 1} (@${a.author} — ${a.wordCount} words):\n${a.text}\n`).join("\n")}` : ""}

---
YOUR TASK:
${formatInstructions}
- DO NOT output JSON.
- DO NOT use markdown code blocks (\`\`\`).
- Use the source facts, tools, numbers, examples, and mechanism above.
- The source is the authority. The template is only packaging.

---
FULL SOURCE TEXT / TRANSCRIPT:
${valueBrief.sourceText}
`;

  return { systemPrompt, userPrompt };
}
