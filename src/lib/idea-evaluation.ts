import type { ContentFormat, ExecutionPlan } from "./voice-dna";

export const EVALUATION_VERSION = "v1" as const;
export const DAILY_ELIGIBILITY_THRESHOLD = 7.5;
export const NEEDS_REVIEW_THRESHOLD = 6.5;

export type EvaluationState = "Pending" | "Scored" | "Failed" | "Skipped";
export type ShelfLife = "24h" | "3d" | "7d" | "30d" | "Evergreen";
export type RecommendationRole = "Best Overall" | "Quick Win" | "Bold Bet";
export type CriticalFlag =
  | "unsupported_claim"
  | "source_mismatch"
  | "generic_slop"
  | "weak_hook"
  | "voice_mismatch"
  | "duplicate_angle"
  | "incomplete_payoff";

export interface IdeaScoreBreakdown {
  sourceStrength: number;
  audienceFit: number;
  novelty: number;
  usefulness: number;
  voiceFit: number;
  hookStrength: number;
  timeliness: number;
  effortFit: number;
}

export interface IdeaEvaluation {
  scores: IdeaScoreBreakdown;
  confidenceScore: number;
  evaluationState: EvaluationState;
  shelfLife: ShelfLife;
  expiresAt?: string;
  criticalFlags: CriticalFlag[];
  recommendationReason: string;
  improvementNotes: string[];
  closestDuplicate?: {
    ideaId?: string;
    title: string;
    similarityReason: string;
  };
  evaluationVersion: typeof EVALUATION_VERSION;
}

const SCORE_WEIGHTS = {
  usefulness: 0.2,
  sourceStrength: 0.15,
  audienceFit: 0.15,
  novelty: 0.15,
  voiceFit: 0.15,
  hookStrength: 0.15,
  timeliness: 0.05,
} as const;

export function clampScore(value: unknown, fallback = 5): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(10, Math.max(1, Math.round(parsed * 10) / 10));
}

export function computeConfidenceScore(scores: IdeaScoreBreakdown): number {
  const total = Object.entries(SCORE_WEIGHTS).reduce((sum, [key, weight]) => {
    return sum + scores[key as keyof typeof SCORE_WEIGHTS] * weight;
  }, 0);
  return Math.round(total * 10) / 10;
}

export function derivePriority(score: number): "🔥 Hot" | "💡 Good" | "📝 Maybe" {
  if (score >= 8.5) return "🔥 Hot";
  if (score >= 7) return "💡 Good";
  return "📝 Maybe";
}

export function deriveEffortFit(format: ContentFormat, draft: string): number {
  const words = draft.trim().split(/\s+/).filter(Boolean).length;
  const base: Record<ContentFormat, number> = {
    Short: 9.5,
    "Mid-length": 8.5,
    Thread: 6.5,
    Article: 4.5,
  };
  const lengthPenalty = words > 2500 ? 1 : words > 1500 ? 0.5 : 0;
  return clampScore(base[format] - lengthPenalty);
}

export function shelfLifeToExpiry(shelfLife: ShelfLife, now = new Date()): string | undefined {
  if (shelfLife === "Evergreen") return undefined;
  const days = shelfLife === "24h" ? 1 : shelfLife === "3d" ? 3 : shelfLife === "7d" ? 7 : 30;
  const expires = new Date(now);
  expires.setUTCDate(expires.getUTCDate() + days);
  return expires.toISOString();
}

function normalizeShelfLife(value: unknown): ShelfLife {
  const text = String(value || "").trim().toLowerCase();
  if (text === "24h" || text.includes("24")) return "24h";
  if (text === "3d" || text.includes("3 day")) return "3d";
  if (text === "7d" || text.includes("7 day") || text.includes("week")) return "7d";
  if (text === "30d" || text.includes("30 day") || text.includes("month")) return "30d";
  return "Evergreen";
}

const ALLOWED_FLAGS = new Set<CriticalFlag>([
  "unsupported_claim",
  "source_mismatch",
  "generic_slop",
  "weak_hook",
  "voice_mismatch",
  "duplicate_angle",
  "incomplete_payoff",
]);

function strings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item || "").trim()).filter(Boolean);
}

export function normalizeIdeaEvaluation(
  raw: Record<string, unknown>,
  format: ContentFormat,
  draft: string,
  now = new Date(),
): IdeaEvaluation {
  const source = (raw.scores && typeof raw.scores === "object" ? raw.scores : raw) as Record<string, unknown>;
  const scores: IdeaScoreBreakdown = {
    sourceStrength: clampScore(source.sourceStrength),
    audienceFit: clampScore(source.audienceFit),
    novelty: clampScore(source.novelty),
    usefulness: clampScore(source.usefulness),
    voiceFit: clampScore(source.voiceFit),
    hookStrength: clampScore(source.hookStrength),
    timeliness: clampScore(source.timeliness),
    effortFit: deriveEffortFit(format, draft),
  };
  const shelfLife = normalizeShelfLife(raw.shelfLife);
  const criticalFlags = strings(raw.criticalFlags).filter((flag): flag is CriticalFlag =>
    ALLOWED_FLAGS.has(flag as CriticalFlag),
  );
  const duplicate = raw.closestDuplicate && typeof raw.closestDuplicate === "object"
    ? raw.closestDuplicate as Record<string, unknown>
    : undefined;

  return {
    scores,
    confidenceScore: computeConfidenceScore(scores),
    evaluationState: "Scored",
    shelfLife,
    expiresAt: shelfLifeToExpiry(shelfLife, now),
    criticalFlags,
    recommendationReason: String(raw.recommendationReason || "Scored from source strength, usefulness, originality, voice, hook, and timing.").trim(),
    improvementNotes: strings(raw.improvementNotes).slice(0, 5),
    closestDuplicate: duplicate && duplicate.title
      ? {
          ideaId: String(duplicate.ideaId || "").trim() || undefined,
          title: String(duplicate.title).trim(),
          similarityReason: String(duplicate.similarityReason || "Similar core angle.").trim(),
        }
      : undefined,
    evaluationVersion: EVALUATION_VERSION,
  };
}

export function evaluationNeedsReview(evaluation: IdeaEvaluation): boolean {
  return evaluation.criticalFlags.length > 0 || evaluation.confidenceScore < NEEDS_REVIEW_THRESHOLD;
}

export function buildEvaluationPrompt(input: {
  title: string;
  category: string[];
  format: ContentFormat;
  hook: string;
  draft: string;
  plan?: Partial<ExecutionPlan>;
  sourceContext?: string;
  recentIdeas: Array<{ id?: string; title: string; angle?: string }>;
}): string {
  return `Evaluate this Idea Scout draft as a strict editor. Judge the draft, not the popularity of the topic.

IDEA: ${input.title}
CATEGORY: ${input.category.join(", ") || "Unknown"}
FORMAT: ${input.format}
HOOK: ${input.hook || "Not supplied"}

STRATEGIST PLAN:
${input.plan ? JSON.stringify(input.plan, null, 2) : "Not available for this backfill record."}

AUTHORITATIVE SOURCE CONTEXT:
${(input.sourceContext || input.plan?.sourceText || "Not available").slice(0, 30000)}

DRAFT:
${input.draft.slice(0, 30000)}

RECENT IDEAS FOR SEMANTIC DUPLICATE CHECK:
${JSON.stringify(input.recentIdeas.slice(0, 50), null, 2)}

Score each qualitative dimension from 1-10. Be strict: 5 is average, 7 is good, 9 is exceptional.
Critical flags may only be: unsupported_claim, source_mismatch, generic_slop, weak_hook, voice_mismatch, duplicate_angle, incomplete_payoff.
Only use duplicate_angle when the core claim, audience pain, and mechanism substantially overlap a recent idea.

Return JSON only:
{
  "scores": {
    "sourceStrength": 1,
    "audienceFit": 1,
    "novelty": 1,
    "usefulness": 1,
    "voiceFit": 1,
    "hookStrength": 1,
    "timeliness": 1
  },
  "shelfLife": "24h|3d|7d|30d|Evergreen",
  "criticalFlags": [],
  "recommendationReason": "One concise explanation grounded in this draft.",
  "improvementNotes": ["Specific fix"],
  "closestDuplicate": null
}`;
}
