import assert from "node:assert/strict";
import {
  computeConfidenceScore,
  derivePriority,
  evaluationNeedsReview,
  normalizeIdeaEvaluation,
} from "../src/lib/idea-evaluation";

const now = new Date("2026-07-13T08:00:00.000Z");
const evaluation = normalizeIdeaEvaluation({
  scores: {
    sourceStrength: 9,
    audienceFit: 8,
    novelty: 7,
    usefulness: 9,
    voiceFit: 8,
    hookStrength: 8,
    timeliness: 7,
  },
  shelfLife: "3d",
  criticalFlags: [],
  recommendationReason: "Specific, useful, and source-grounded.",
  improvementNotes: ["Tighten the second paragraph."],
}, "Mid-length", "A complete draft with enough words to evaluate.", now);

assert.equal(evaluation.confidenceScore, 8.2);
assert.equal(evaluation.expiresAt, "2026-07-16T08:00:00.000Z");
assert.equal(evaluationNeedsReview(evaluation), false);
assert.equal(derivePriority(evaluation.confidenceScore), "💡 Good");
assert.equal(computeConfidenceScore(evaluation.scores), 8.2);

const flagged = { ...evaluation, criticalFlags: ["unsupported_claim" as const] };
assert.equal(evaluationNeedsReview(flagged), true);
console.log("✅ Idea evaluation tests passed");
