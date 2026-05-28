import { CONTENT_PILLARS } from "./constants";

/**
 * Normalizes a string for comparison (lowercase, alphanumeric only).
 */
export function normalizeString(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Attempts to map an LLM-generated pillar string to a valid CONTENT_PILLAR.
 * 
 * 1. Exact Match (case-insensitive)
 * 2. Prefix/Substring Match (e.g., "AI Tools" -> "AI Prompting & Tools")
 * 3. Fallback (defaults to "Automation" if no match is found)
 * 
 * @param inputPillar The raw pillar string from the LLM
 * @returns A valid string from CONTENT_PILLARS
 */
export function matchPillar(inputPillar: string): string {
  const cleanInput = inputPillar.trim();
  const normalizedInput = normalizeString(cleanInput);

  // 1. Exact Match (case-insensitive)
  const exactMatch = CONTENT_PILLARS.find(
    (p) => p.toLowerCase() === cleanInput.toLowerCase()
  );
  if (exactMatch) return exactMatch;

  // 2. Fuzzy / Substring Match
  // E.g. "AI Tools" -> "AI Prompting & Tools"
  // E.g. "AI" -> "AI Prompting & Tools" or "AI Industry & News" (we'll take the first one that matches)
  for (const pillar of CONTENT_PILLARS) {
    const normalizedPillar = normalizeString(pillar);
    if (
      normalizedPillar.includes(normalizedInput) ||
      normalizedInput.includes(normalizedPillar)
    ) {
      console.log(`⚠️ Fuzzy matched pillar: "${cleanInput}" -> "${pillar}"`);
      return pillar;
    }
  }

  // 3. Keyword Heuristics (hardcoded common misclassifications)
  if (normalizedInput.includes("market") || normalizedInput.includes("biz")) {
    console.log(`⚠️ Heuristic matched pillar: "${cleanInput}" -> "Creator Economy"`);
    return "Creator Economy";
  }

  // 4. Default Fallback
  console.log(`❌ Unrecognized pillar: "${cleanInput}". Falling back to "Automation".`);
  return "Automation";
}
