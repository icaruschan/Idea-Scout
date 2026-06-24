import viralHooks from "../data/viral-hook-templates.json";
import { IDEA_SCOUT_CONFIG } from "./idea-scout-config";

export interface HookTemplate {
  number: number;
  template: string;
  original: string;
  examples: string[];
}

const HOOKS = viralHooks as HookTemplate[];

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
        `[#${h.number}] Template: ${h.template}\nOriginal: ${h.original}\nExample: ${h.examples[0] || "n/a"}`,
    )
    .join("\n\n---\n\n");
}