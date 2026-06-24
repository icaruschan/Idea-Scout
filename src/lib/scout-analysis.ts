import type { ScoutAnalysis } from "./content-intelligence";

export function parseScoutAnalysisFromPageBody(pageBody: string): ScoutAnalysis | null {
  if (!pageBody.includes("Scout Analysis")) return null;

  const section = pageBody.split(/Scout Analysis/i)[1] || "";
  const getField = (label: string): string => {
    const re = new RegExp(`${label}:\\s*([^\\n]+)`, "i");
    return section.match(re)?.[1]?.trim() || "";
  };

  const parseList = (label: string): string[] => {
    const re = new RegExp(`${label}:\\s*([^\\n]+)`, "i");
    const line = section.match(re)?.[1] || "";
    return line.split(/[|;]/).map((s) => s.trim()).filter(Boolean);
  };

  const summary = getField("Summary");
  if (!summary) return null;

  const guideRaw = getField("Guide potential").toLowerCase();
  const guidePotential: ScoutAnalysis["guidePotential"] =
    guideRaw === "high" || guideRaw === "low" ? guideRaw : "medium";

  return {
    summary,
    creatorDoing: getField("Creator doing"),
    contentType: getField("Content type"),
    targetAudience: getField("Target audience"),
    primaryPain: getField("Primary pain"),
    teachableUnits: parseList("Teachable units"),
    transcriptGems: parseList("Transcript gems"),
    guidePotential,
    keyTakeaways: getField("Key takeaways"),
  };
}

export function extractRawTranscriptFromPageBody(
  pageBodyText: string,
  transcriptPreview: string,
  title: string,
): string {
  const marker = /(?:▶️\s*)?Full Transcript\s*/i;
  if (marker.test(pageBodyText)) {
    const chunk = pageBodyText.split(marker).pop()?.trim();
    if (chunk && chunk.length >= 50) return chunk;
  }
  if (!pageBodyText.includes("Scout Analysis")) {
    return pageBodyText.trim() || transcriptPreview || title;
  }
  return transcriptPreview || title;
}