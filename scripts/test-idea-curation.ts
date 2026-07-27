import assert from "node:assert/strict";
import { curateDailyIdeas, type CurationCandidate } from "../src/lib/idea-curation";

const candidates: CurationCandidate[] = [
  { pageId: "a", title: "Best", category: ["Automation"], format: "Thread", variationSet: "one", confidenceScore: 9.2, effortFit: 6, novelty: 8, hookStrength: 9 },
  { pageId: "b", title: "Quick", category: ["Vibe Coding"], format: "Short", variationSet: "two", confidenceScore: 8.4, effortFit: 10, novelty: 7, hookStrength: 8 },
  { pageId: "c", title: "Bold", category: ["Creator Economy"], format: "Mid-length", variationSet: "three", confidenceScore: 7.8, effortFit: 8, novelty: 10, hookStrength: 10 },
  { pageId: "d", title: "Sibling", category: ["Automation"], format: "Article", variationSet: "one", confidenceScore: 9, effortFit: 4, novelty: 9, hookStrength: 9 },
  { pageId: "e", title: "Weak", category: ["Automation"], format: "Short", variationSet: "four", confidenceScore: 7.4, effortFit: 10, novelty: 10, hookStrength: 10 },
];

const curated = curateDailyIdeas(candidates, new Date("2026-07-13T08:00:00.000Z"));
assert.deepEqual(curated.map((item) => item.role), ["Best Overall", "Quick Win", "Bold Bet"]);
assert.equal(curated[0].pageId, "a");
assert.equal(curated[1].pageId, "b");
assert.equal(curated[2].pageId, "c");
assert.equal(new Set(curated.map((item) => item.variationSet)).size, 3);
console.log("✅ Idea curation tests passed");
