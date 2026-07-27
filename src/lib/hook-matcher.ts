import viralHooks from "../data/viral-hook-templates.json";
import { IDEA_SCOUT_CONFIG } from "./idea-scout-config";

export interface HookTemplate {
  number: number;
  template: string;
  original: string;
  examples: string[];
  psychology?: HookPsychology[];
  bestFor?: string[];
  riskLevel?: HookRiskLevel;
  requiresProof?: boolean;
}

export type HookPsychology =
  | "Mistake"
  | "Contrarian"
  | "Proof"
  | "How-to"
  | "Comparison"
  | "Tool Stack"
  | "Warning"
  | "Personal Story"
  | "Resource Drop"
  | "Curiosity Gap"
  | "Status Shift";

export type HookRiskLevel = "Safe" | "Sharp" | "Bold";

export interface HookVariant {
  label: HookRiskLevel;
  text: string;
  template: string;
  rationale: string;
  psychology: HookPsychology[];
  requiresProof: boolean;
}

const HOOKS = viralHooks as HookTemplate[];

export function inferHookPsychology(hook: HookTemplate): HookPsychology[] {
  if (hook.psychology?.length) return hook.psychology;
  const text = `${hook.template} ${hook.original}`.toLowerCase();
  const labels: HookPsychology[] = [];
  if (/mistake|wrong|stop|never|don't|avoid|waste/.test(text)) labels.push("Mistake", "Warning");
  if (/unpopular|truth|actually|myth|nobody|everyone.*wrong/.test(text)) labels.push("Contrarian");
  if (/result|proof|tested|grew|made|from .* to |case study|data/.test(text)) labels.push("Proof");
  if (/how to|steps?|guide|workflow|process|way to/.test(text)) labels.push("How-to");
  if (/\bvs\b|versus|compare|better than|difference/.test(text)) labels.push("Comparison");
  if (/tools?|stack|apps?|resources?/.test(text)) labels.push("Tool Stack", "Resource Drop");
  if (/\bi\b|\bmy\b|\bwe\b|built|learned|spent|tried/.test(text)) labels.push("Personal Story");
  if (/secret|surprising|what happened|you won't|little-known/.test(text)) labels.push("Curiosity Gap");
  if (/beginner|expert|top |best |pro |level/.test(text)) labels.push("Status Shift");
  const resolved: HookPsychology[] = labels.length ? labels : ["Curiosity Gap"];
  return [...new Set(resolved)];
}

export function inferHookRiskLevel(hook: HookTemplate): HookRiskLevel {
  if (hook.riskLevel) return hook.riskLevel;
  const labels = inferHookPsychology(hook);
  if (labels.includes("Contrarian") || /never|everyone|nobody|worst|dead/i.test(hook.template)) return "Bold";
  if (labels.includes("Mistake") || labels.includes("Warning") || labels.includes("Proof")) return "Sharp";
  return "Safe";
}

export function getAllHookTemplates(): HookTemplate[] {
  return HOOKS;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);
}

export function scoreHookTemplate(
  hook: HookTemplate,
  keywords: string[],
): number {
  const corpus = `${hook.template} ${hook.original} ${hook.examples.join(" ")}`.toLowerCase();
  let score = 0;

  for (const word of keywords) {
    if (corpus.includes(word)) score += 3;
  }

  if (/\[mistake|never|don't|stop|wrong/i.test(hook.template) && keywords.some((k) => /pain|mistake|waste|fail/.test(k))) {
    score += 4;
  }
  if (/\[how to|guide|step|workflow/i.test(hook.template) && keywords.some((k) => /workflow|guide|how|step/.test(k))) {
    score += 4;
  }
  if (/\[tool|vs|comparison/i.test(hook.template) && keywords.some((k) => /tool|compare|vs/.test(k))) {
    score += 4;
  }

  return score;
}

export function matchHookTemplates(input: {
  primaryPain: string;
  mechanism: string;
  contentType: string;
  coreValue: string;
  hookDirection?: string;
}, limit = IDEA_SCOUT_CONFIG.hookMatchLimit): HookTemplate[] {
  const keywords = [
    ...tokenize(input.primaryPain),
    ...tokenize(input.mechanism),
    ...tokenize(input.contentType),
    ...tokenize(input.coreValue),
    ...tokenize(input.hookDirection || ""),
  ];

  const uniqueKeywords = [...new Set(keywords)];

  return [...HOOKS]
    .map((hook) => ({ hook, score: scoreHookTemplate(hook, uniqueKeywords) }))
    .sort((a, b) => b.score - a.score || a.hook.number - b.hook.number)
    .slice(0, limit)
    .map((entry) => entry.hook);
}

export function formatHookCandidates(hooks: HookTemplate[]): string {
  return hooks
    .map(
      (h) =>
        `[#${h.number}] Template: ${h.template}\nPsychology: ${inferHookPsychology(h).join(", ")}\nRisk: ${inferHookRiskLevel(h)}\nRequires proof: ${Boolean(h.requiresProof || inferHookPsychology(h).includes("Proof"))}\nOriginal: ${h.original}\nExample: ${h.examples[0] || "n/a"}`,
    )
    .join("\n\n---\n\n");
}

export function normalizeHookVariants(
  raw: unknown,
  fallbackText: string,
  candidates: HookTemplate[] = [],
): HookVariant[] {
  const rows = Array.isArray(raw) ? raw : [];
  const labels: HookRiskLevel[] = ["Safe", "Sharp", "Bold"];
  const allowedPsychology = [
    "Mistake", "Contrarian", "Proof", "How-to", "Comparison", "Tool Stack",
    "Warning", "Personal Story", "Resource Drop", "Curiosity Gap", "Status Shift",
  ];

  return labels.map((label, index): HookVariant => {
    const candidate = candidates.find((item) => inferHookRiskLevel(item) === label) || candidates[index] || candidates[0];
    const row = rows.find((item) => {
      if (!item || typeof item !== "object") return false;
      return String((item as Record<string, unknown>).label || "").toLowerCase() === label.toLowerCase();
    }) as Record<string, unknown> | undefined;
    const psychRaw = Array.isArray(row?.psychology) ? row.psychology : [];
    const psychology = psychRaw.length
      ? psychRaw.map(String).filter((item): item is HookPsychology => allowedPsychology.includes(item))
      : candidate
        ? inferHookPsychology(candidate)
        : ["Curiosity Gap" as HookPsychology];
    return {
      label,
      text: String(row?.text || row?.filled || fallbackText || candidate?.original || "").trim(),
      template: String(row?.template || candidate?.template || "").trim(),
      rationale: String(row?.rationale || `${label} option matched to the source and audience pain.`).trim(),
      psychology,
      requiresProof: Boolean(row?.requiresProof ?? candidate?.requiresProof ?? psychology.includes("Proof")),
    };
  }).filter((item) => item.text);
}
