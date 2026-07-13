import {
  DAILY_ELIGIBILITY_THRESHOLD,
  RecommendationRole,
} from "./idea-evaluation";

export interface CurationCandidate {
  pageId: string;
  title: string;
  category: string[];
  format: string;
  variationSet: string;
  confidenceScore: number;
  effortFit: number;
  novelty: number;
  hookStrength: number;
  expiresAt?: string;
  recommendationDate?: string;
  createdTime?: string;
}

export interface CuratedIdea extends CurationCandidate {
  rank: 1 | 2 | 3;
  role: RecommendationRole;
}

function dateOnly(value?: string): string {
  return value ? value.slice(0, 10) : "";
}

function daysAgo(value: string, now: Date): number {
  return Math.floor((now.getTime() - new Date(value).getTime()) / 86_400_000);
}

function eligible(candidate: CurationCandidate, now: Date): boolean {
  if (candidate.confidenceScore < DAILY_ELIGIBILITY_THRESHOLD) return false;
  if (candidate.expiresAt && new Date(candidate.expiresAt).getTime() < now.getTime()) return false;
  if (candidate.recommendationDate && daysAgo(candidate.recommendationDate, now) < 7) return false;
  return true;
}

function differentVariation(candidate: CurationCandidate, picked: CurationCandidate[]): boolean {
  if (!candidate.variationSet) return true;
  return !picked.some((item) => item.variationSet && item.variationSet === candidate.variationSet);
}

function diversityBonus(candidate: CurationCandidate, picked: CurationCandidate[]): number {
  if (picked.length === 0) return 0;
  const categoryDifferent = !picked.some((item) => item.category.some((c) => candidate.category.includes(c)));
  const formatDifferent = !picked.some((item) => item.format === candidate.format);
  return (categoryDifferent ? 0.15 : 0) + (formatDifferent ? 0.1 : 0);
}

function choose(
  candidates: CurationCandidate[],
  picked: CurationCandidate[],
  score: (candidate: CurationCandidate) => number,
): CurationCandidate | undefined {
  return candidates
    .filter((candidate) => !picked.some((item) => item.pageId === candidate.pageId))
    .filter((candidate) => differentVariation(candidate, picked))
    .sort((a, b) => {
      const scoreA = score(a) + diversityBonus(a, picked);
      const scoreB = score(b) + diversityBonus(b, picked);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return String(b.createdTime || "").localeCompare(String(a.createdTime || ""));
    })[0];
}

export function curateDailyIdeas(
  input: CurationCandidate[],
  now = new Date(),
): CuratedIdea[] {
  let candidates = input.filter((candidate) => eligible(candidate, now));
  if (candidates.length < 3) {
    candidates = input.filter((candidate) => {
      if (candidate.confidenceScore < DAILY_ELIGIBILITY_THRESHOLD) return false;
      return !candidate.expiresAt || new Date(candidate.expiresAt).getTime() >= now.getTime();
    });
  }

  const picked: CurationCandidate[] = [];
  const result: CuratedIdea[] = [];
  const add = (candidate: CurationCandidate | undefined, rank: 1 | 2 | 3, role: RecommendationRole) => {
    if (!candidate) return;
    picked.push(candidate);
    result.push({ ...candidate, rank, role });
  };

  add(choose(candidates, picked, (c) => c.confidenceScore), 1, "Best Overall");
  add(choose(candidates, picked, (c) => c.confidenceScore * 0.7 + c.effortFit * 0.3), 2, "Quick Win");
  add(choose(candidates, picked, (c) => c.novelty * 0.5 + c.hookStrength * 0.3 + c.confidenceScore * 0.2), 3, "Bold Bet");
  return result;
}

export function recommendationDate(now = new Date()): string {
  return dateOnly(now.toISOString());
}
