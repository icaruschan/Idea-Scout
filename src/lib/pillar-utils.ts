import { CONTENT_PILLARS, FROZEN_PILLARS } from "./constants";

/**
 * Normalizes a string for comparison (lowercase, alphanumeric only).
 */
export function normalizeString(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// A dictionary mapping variations/aliases/keywords to their primary content pillar name.
// All keys are lowercased for case-insensitive matching.
export const PILLAR_ALIASES: Record<string, string> = {
  // AI Prompting & Tools aliases
  "ai tools": "AI Prompting & Tools",
  "ai prompting & tools": "AI Prompting & Tools",
  "ai prompting and tools": "AI Prompting & Tools",
  "ai": "AI Prompting & Tools",
  "ai strategy": "AI Prompting & Tools",
  "prompting": "AI Prompting & Tools",
  "prompts": "AI Prompting & Tools",
  "perplexity": "AI Prompting & Tools",
  "chatgpt": "AI Prompting & Tools",
  "claude": "AI Prompting & Tools",
  "deepseek": "AI Prompting & Tools",

  // AI Creative aliases
  "ai creative": "AI Creative",
  "ai video": "AI Creative",
  "ai image": "AI Creative",
  "runway": "AI Creative",
  "kling": "AI Creative",
  "sora": "AI Creative",
  "midjourney": "AI Creative",
  "flux": "AI Creative",

  // Automation aliases
  "automation": "Automation",
  "n8n": "Automation",
  "make": "Automation",
  "zapier": "Automation",
  "agentic": "Automation",
  "agents": "Automation",

  // Vibe Coding aliases
  "vibe coding": "Vibe Coding",
  "cursor": "Vibe Coding",
  "claude code": "Vibe Coding",
  "windsurf": "Vibe Coding",
  "lovable": "Vibe Coding",
  "bolt.new": "Vibe Coding",
  "indie hacker dev": "Vibe Coding",

  // Creator Economy aliases
  "creator economy": "Creator Economy",
  "audience growth": "Creator Economy",
  "growth": "Creator Economy",
  "newsletter": "Creator Economy",
  "monetization": "Creator Economy",
  "monetising": "Creator Economy",
  "beehiiv": "Creator Economy",
  "substack": "Creator Economy",
  "gumroad": "Creator Economy",
  "biz development": "Creator Economy",
  "biz dev": "Creator Economy",

  // Copywriting and Storytelling aliases
  "copywriting and storytelling": "Copywriting and Storytelling",
  "copywriting & storytelling": "Copywriting and Storytelling",
  "copywriting": "Copywriting and Storytelling",
  "storytelling": "Copywriting and Storytelling",
  "hooks": "Copywriting and Storytelling",
  "hook formulas": "Copywriting and Storytelling",

  // Personal/Vulnerability aliases
  "personal/vulnerability": "Personal/Vulnerability",
  "personal": "Personal/Vulnerability",
  "vulnerability": "Personal/Vulnerability",

  // Building in Public aliases
  "building in public": "Building in Public",
  "build in public": "Building in Public",
  "mrr": "Building in Public",
  "milestones": "Building in Public"
};

// Pre-sort alias entries by key length descending to prevent substring collisions (longer, more specific keys match first)
export const SORTED_PILLAR_ALIASES = Object.entries(PILLAR_ALIASES).sort(
  ([keyA], [keyB]) => keyB.length - keyA.length
);

/**
 * Attempts to map an LLM-generated pillar string to a valid CONTENT_PILLAR or fallback "Unknown".
 * 
 * 1. Exact Match (case-insensitive) against active pillars
 * 2. Exact Match (case-insensitive) against alias dictionary keys
 * 3. Substring / Fuzzy match on alias dictionary keys and active pillars
 * 4. Fallback to "Unknown" (previously "Automation")
 * 
 * @param inputPillar The raw pillar string from the LLM
 * @returns A valid string from CONTENT_PILLARS, or "Unknown"
 */
export function matchPillar(inputPillar: string): string {
  const cleanInput = inputPillar.trim();
  const lowerInput = cleanInput.toLowerCase();

  // 1. Exact Match (case-insensitive) against active pillars
  const exactMatch = CONTENT_PILLARS.find(
    (p) => p.toLowerCase() === lowerInput
  );
  if (exactMatch) return exactMatch;

  // 2. Direct Alias Dictionary lookup
  const aliasMatch = PILLAR_ALIASES[lowerInput];
  if (aliasMatch) {
    console.log(`🎯 Exact alias matched: "${cleanInput}" -> "${aliasMatch}"`);
    return aliasMatch;
  }

  // 3. Substring / Fuzzy Match against normalized alias keys
  const normalizedInput = normalizeString(cleanInput);

  // First check if input contains or is contained by any normalized alias key
  for (const [aliasKey, targetPillar] of SORTED_PILLAR_ALIASES) {
    const normAlias = normalizeString(aliasKey);
    if (normAlias.length >= 2 && (normalizedInput.includes(normAlias) || normAlias.includes(normalizedInput))) {
      console.log(`⚠️ Fuzzy matched alias pillar: "${cleanInput}" -> "${targetPillar}" (via alias "${aliasKey}")`);
      return targetPillar;
    }
  }

  // Fallback heuristic keyword checks
  if (normalizedInput.includes("market") || normalizedInput.includes("biz")) {
    console.log(`⚠️ Heuristic matched pillar: "${cleanInput}" -> "Creator Economy"`);
    return "Creator Economy";
  }

  // 4. Default Fallback
  console.log(`❌ Unrecognized pillar: "${cleanInput}". Falling back to "Unknown".`);
  return "Unknown";
}

/**
 * Filters a list of pillars, removing frozen or fallback pillars ("Unknown", "Web3", "Psychology")
 * so they are not written as category tags in new Notion entries.
 */
export function filterCategoryList(pillars: string[]): string[] {
  return pillars.filter(
    (p) => p && p !== "Unknown" && !FROZEN_PILLARS.includes(p)
  );
}

