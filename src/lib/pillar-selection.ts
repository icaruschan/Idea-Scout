import { CONTENT_PILLARS } from "./constants";
import { ScoutedContentForDraft } from "./notion";

export type PillarCounts = Record<string, number>;

/**
 * When a scouted item has multiple Niche tags, pick the active pillar with the
 * fewest recent ideas. Ties prefer the tag listed later (usually more specific).
 */
export function pickMostUnderservedPillar(
  candidates: string[],
  pillarCounts: PillarCounts,
  tagOrder: string[] = [],
): string {
  if (candidates.length === 0) return "Unknown";
  if (candidates.length === 1) return candidates[0];

  const minCount = Math.min(...candidates.map((p) => pillarCounts[p] || 0));
  const tied = candidates.filter((p) => (pillarCounts[p] || 0) === minCount);
  if (tied.length === 1) return tied[0];

  return tied.reduce((best, pillar) => {
    const idx = tagOrder.indexOf(pillar);
    const bestIdx = tagOrder.indexOf(best);
    if (idx === -1) return best;
    if (bestIdx === -1) return pillar;
    return idx > bestIdx ? pillar : best;
  });
}

/**
 * Resolve which pillar to draft under for a scouted item.
 * Uses distribution-aware routing when multiple Niche tags are present.
 */
export function resolvePrimaryPillar(
  item: ScoutedContentForDraft,
  pillarCounts: PillarCounts,
): string {
  const activePillars = (item.pillars || []).filter((p) =>
    CONTENT_PILLARS.includes(p),
  );

  if (activePillars.length > 0) {
    return pickMostUnderservedPillar(
      activePillars,
      pillarCounts,
      item.pillars || [],
    );
  }

  return resolvePrimaryPillarFromKeywords(item);
}

function resolvePrimaryPillarFromKeywords(item: ScoutedContentForDraft): string {
  const textToSearch =
    `${item.title} ${item.aiSummary} ${item.keyTakeaways}`.toLowerCase();

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