import { ExecutionPlan } from "./voice-dna";
import { markdownToNotionBlocks, NotionBlock } from "./notion-markdown-blocks";

export function normalizeHookTemplate(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    if (typeof obj.template === "string") return obj.template.trim();
    if (typeof obj.hookTemplate === "string") return obj.hookTemplate.trim();
    if (typeof obj.name === "string") return obj.name.trim();
  }
  return "";
}

/** Strategist / thought-process content — lives inside a collapsed Notion toggle. */
export function buildStrategistBriefMarkdown(plan: ExecutionPlan): string {
  const outlineText =
    plan.detailedOutline
      ?.map((s, i) => `${i + 1}. ${s.heading} — ${s.purpose}`)
      .join("\n") || plan.suggestedStructure;

  const gems = plan.mustUseDetails?.slice(0, 8) || [];
  const hookTemplate = normalizeHookTemplate(plan.hookTemplate);

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
    `## Outline`,
    outlineText,
    ``,
    plan.talkingPoints?.length
      ? `## Talking Points\n${plan.talkingPoints.map((p) => `- ${p}`).join("\n")}`
      : "",
    ``,
    plan.stepByStepProcess?.length
      ? `## Step by Step Process\n${plan.stepByStepProcess.map((s) => `- ${s}`).join("\n")}`
      : "",
    ``,
    hookTemplate ? `## Hook Template\n${hookTemplate}` : "",
    plan.hookRationale ? `Rationale: ${plan.hookRationale}` : "",
    plan.hookVariants?.length
      ? `## Hook Options\n${plan.hookVariants.map((hook) => `- **${hook.label}:** ${hook.text} — ${hook.psychology.join(", ")}`).join("\n")}`
      : "",
    ``,
    `## Packaging`,
    `Pattern: ${plan.stealablePattern || "Source-grounded guide"}`,
    plan.viralTweetStructure ? `Structure: ${plan.viralTweetStructure}` : "",
    ``,
    `## Key Source Details`,
    ...gems.map((g) => `- ${g}`),
    ``,
    `Voice: ${plan.voiceMode} | Pillar: ${plan.pillar}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Visible top-of-page content: hook, output summary, draft placeholder. */
export function buildVisibleIdeaPageMarkdown(plan: ExecutionPlan): string {
  const hookTemplate = normalizeHookTemplate(plan.hookTemplate);

  return [
    `## Hook`,
    plan.hookFilledExample || plan.contentPromise,
    hookTemplate ? `Template: ${hookTemplate}` : "",
    plan.hookVariants?.length
      ? `**Options:**\n${plan.hookVariants.map((hook) => `- ${hook.label}: ${hook.text}`).join("\n")}`
      : "",
    ``,
    `## Output`,
    `**Format:** ${plan.format}`,
    `**Title:** ${plan.ideaTitle}`,
    `**Angle:** ${plan.selectedAngle}`,
    plan.sourceUrl ? `**Source:** ${plan.sourceUrl}` : `**Source:** ${plan.sourceTitle}`,
    ``,
    `## Draft`,
    `_Pending — the writer will add the full ${plan.format.toLowerCase()} draft below after generation._`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildIdeaPageTopBlocks(
  plan: ExecutionPlan,
  variationMarkdown?: string,
): NotionBlock[] {
  const blocks: NotionBlock[] = [];

  if (variationMarkdown?.trim()) {
    blocks.push(...markdownToNotionBlocks(variationMarkdown));
    blocks.push({
      object: "block",
      type: "divider",
      divider: {},
    });
  }

  blocks.push(...markdownToNotionBlocks(buildVisibleIdeaPageMarkdown(plan)));
  return blocks;
}
