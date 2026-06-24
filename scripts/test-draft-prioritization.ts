import { prioritizeSourcesByPlatform } from "../src/trigger/idea-scout/draft-ideas";
import { selectOutputs } from "../src/trigger/idea-scout/comprehend-source";
import { getRawSourceDepth, ScoutedContentForDraft } from "../src/lib/notion";

let failed = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    failed++;
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

function makeSource(
  platform: ScoutedContentForDraft["platform"],
  rawSourceText: string,
  pageId: string,
): ScoutedContentForDraft {
  return {
    pageId,
    title: rawSourceText.substring(0, 80),
    platform,
    aiSummary: "summary",
    keyTakeaways: "takeaways",
    url: "https://example.com",
    pillars: ["Automation"],
    creatorPageId: "creator",
    transcriptPreview: rawSourceText.substring(0, 2000),
    rawSourceText,
    sourceText: `SOURCE TITLE:\n${rawSourceText}\n\n---\n\nAI SUMMARY:\nLong padded metadata that should not affect depth gates`,
  };
}

console.log("=== RUNNING DRAFT PRIORITIZATION TESTS ===");

const mixedPool = [
  ...Array.from({ length: 10 }, (_, i) =>
    makeSource("X", `x tweet ${i} `.repeat(20), `x-${i}`),
  ),
  ...Array.from({ length: 4 }, (_, i) =>
    makeSource("YouTube", `youtube transcript ${i} `.repeat(200), `yt-${i}`),
  ),
  makeSource("Instagram", `instagram caption `.repeat(80), "ig-1"),
];

const prioritized = prioritizeSourcesByPlatform(mixedPool);
const ytIg = prioritized.filter((s) => s.platform === "YouTube" || s.platform === "Instagram");
const x = prioritized.filter((s) => s.platform === "X");

assert(ytIg.length === 5, "All YT/IG sources are kept");
assert(x.length === 2, "X is capped to ~30% of YT/IG count (5 -> 2)");
assert(
  ytIg.length / (ytIg.length + x.length) >= 0.7,
  "Final mix is at least 70% YT/IG when YT/IG exists",
);

const xOnlyPool = Array.from({ length: 6 }, (_, i) =>
  makeSource("X", `solo x tweet ${i} `.repeat(20), `only-x-${i}`),
);
const xOnlyPrioritized = prioritizeSourcesByPlatform(xOnlyPool);
assert(xOnlyPrioritized.length === 6, "X-only pool still drafts when no YT/IG exists");

const thinSource = makeSource("X", "Live stream final push only title text", "thin-x");
assert(getRawSourceDepth(thinSource) < 300, "Thin raw X source is below 300 chars");

const paddedThinSource = {
  ...thinSource,
  sourceText: `${thinSource.sourceText}\n\n`.repeat(20),
};
assert(
  getRawSourceDepth(paddedThinSource) < 300,
  "Raw depth ignores wrapped strategist metadata padding",
);

const thinSelected = selectOutputs(
  [
    {
      workingTitle: "Thin Post",
      format: "Short",
      angle: "Short update",
      isPrimaryValueBomb: true,
      targetAudience: "builders",
      painAddressed: "noise",
      valueProposition: "one insight",
      readerOutcome: "skip",
      hookDirection: "punchy",
      sourceUnitsUsed: [],
      transcriptGemsUsed: [],
      estimatedDepth: "6 lines",
      priority: "💡 Good",
      rationale: "thin source",
      formatFitScore: 8,
    },
  ],
  thinSource,
);

assert(thinSelected.length === 1 && thinSelected[0].format === "Short", "Thin source still selects short output");

console.log("\n======================================");
if (failed > 0) {
  console.error(`❌ Test run failed: ${failed} failed assertions.`);
  process.exit(1);
}

console.log("🎉 Draft prioritization tests passed successfully!");
process.exit(0);