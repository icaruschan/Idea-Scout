import { ExecutionPlan } from "./voice-dna";

const FORMAT_SUFFIXES = ["Short", "Mid-length", "Thread", "Article", "Video"] as const;

export interface VariationDraftEntry {
  plan: ExecutionPlan;
  displayTitle: string;
}

export interface CreatedVariation {
  pageId: string;
  format: string;
  displayTitle: string;
}

/** Group label shared by all format variations from one scouted source in a draft run. */
export function buildVariationSetLabel(
  sourceTitle: string,
  date: Date = new Date(),
): string {
  const trimmed = sourceTitle.trim().replace(/\s+/g, " ");
  const shortTitle =
    trimmed.length > 72 ? `${trimmed.substring(0, 69).trimEnd()}...` : trimmed;
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${shortTitle} (${formattedDate})`;
}

/** Append format suffix when missing so list views show Thread vs Article at a glance. */
export function formatIdeaTitleWithFormat(
  ideaTitle: string,
  format: string,
): string {
  const trimmed = ideaTitle.trim();
  const normalizedFormat = format.trim();
  if (!normalizedFormat) return trimmed;

  const suffix = ` — ${normalizedFormat}`;
  if (trimmed.toLowerCase().endsWith(suffix.toLowerCase())) {
    return trimmed;
  }

  for (const known of FORMAT_SUFFIXES) {
    const knownSuffix = ` — ${known}`;
    if (trimmed.toLowerCase().endsWith(knownSuffix.toLowerCase())) {
      return trimmed;
    }
  }

  return `${trimmed}${suffix}`;
}

export function buildVariationPreamble(input: {
  variationSet: string;
  format: string;
  index: number;
  total: number;
  sourceTitle: string;
  sourceUrl?: string;
  siblings: Array<{ format: string; displayTitle: string }>;
}): string {
  const { variationSet, format, index, total, sourceTitle, sourceUrl, siblings } =
    input;

  const lines = [
    `## Variation Set`,
    variationSet,
    ``,
    `**This idea:** ${format} (${index} of ${total})`,
    `**Source:** ${sourceTitle}`,
  ];

  if (sourceUrl) {
    lines.push(`**Source URL:** ${sourceUrl}`);
  }

  if (siblings.length > 0) {
    lines.push(
      ``,
      `**Other formats from this source:**`,
      ...siblings.map((s) => `- ${s.format}: ${s.displayTitle}`),
    );
  }

  lines.push(``);
  return lines.join("\n");
}

export function buildVariationDraftEntries(
  plans: ExecutionPlan[],
): VariationDraftEntry[] {
  return plans.map((plan) => ({
    plan,
    displayTitle: formatIdeaTitleWithFormat(plan.ideaTitle, plan.format),
  }));
}

export function buildVariationSiblingFooter(
  variationSet: string,
  currentPageId: string,
  variations: CreatedVariation[],
): string {
  const siblings = variations.filter((v) => v.pageId !== currentPageId);
  if (siblings.length === 0) return "";

  const lines = [
    `## Sibling Variations`,
    `Set: ${variationSet}`,
    ``,
    ...siblings.map((s) => {
      const slug = s.pageId.replace(/-/g, "");
      return `- ${s.format}: ${s.displayTitle} — https://www.notion.so/${slug}`;
    }),
  ];

  return lines.join("\n");
}

export function notionPageUrl(pageId: string): string {
  return `https://www.notion.so/${pageId.replace(/-/g, "")}`;
}