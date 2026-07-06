import {
  pickMostUnderservedPillar,
  resolvePrimaryPillar,
} from "../src/lib/pillar-selection";
import { ScoutedContentForDraft } from "../src/lib/notion";

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
  pageId: string,
  pillars: string[],
  platform: ScoutedContentForDraft["platform"] = "YouTube",
): ScoutedContentForDraft {
  return {
    pageId,
    title: `Source ${pageId}`,
    platform,
    aiSummary: "summary",
    keyTakeaways: "takeaways",
    url: "https://example.com",
    pillars,
    creatorPageId: "creator",
    transcriptPreview: "x".repeat(500),
    rawSourceText: "x".repeat(500),
    sourceText: "x".repeat(500),
  };
}

console.log("=== RUNNING PILLAR SELECTION TESTS ===");

const recentDistribution = {
  "AI Prompting & Tools": 25,
  Automation: 24,
  "Vibe Coding": 9,
  "Creator Economy": 3,
  "AI Creative": 2,
  "Building in Public": 0,
  "Copywriting and Storytelling": 0,
  "Personal/Vulnerability": 0,
};

assert(
  resolvePrimaryPillar(
    makeSource("single", ["Automation"]),
    recentDistribution,
  ) === "Automation",
  "Single tag always uses that pillar regardless of distribution",
);

assert(
  resolvePrimaryPillar(
    makeSource("multi", ["AI Prompting & Tools", "AI Creative", "Automation"]),
    recentDistribution,
  ) === "AI Creative",
  "Multi-tagged source picks the most underserved pillar",
);

assert(
  resolvePrimaryPillar(
    makeSource("bip", ["AI Prompting & Tools", "Automation", "Building in Public"]),
    recentDistribution,
  ) === "Building in Public",
  "Building in Public wins when it is the most underserved tag on the item",
);

assert(
  resolvePrimaryPillar(
    makeSource("tied", ["AI Prompting & Tools", "Building in Public"]),
    {
      ...recentDistribution,
      "AI Prompting & Tools": 0,
      "Building in Public": 0,
    },
  ) === "Building in Public",
  "Equal counts prefer the later-listed (more specific) pillar",
);

assert(
  pickMostUnderservedPillar(
    ["Automation", "Creator Economy"],
    recentDistribution,
    ["Automation", "Creator Economy"],
  ) === "Creator Economy",
  "pickMostUnderservedPillar chooses the lower recent-idea count",
);

assert(
  resolvePrimaryPillar(
    makeSource("keywords", [], "X"),
    recentDistribution,
  ) === "Unknown",
  "Untagged item with no keyword signal resolves to Unknown",
);

const vibeSource = makeSource("vibe", [], "X");
vibeSource.title = "Cursor vibe coding workflow for indie developers";
assert(
  resolvePrimaryPillar(vibeSource, recentDistribution) === "Vibe Coding",
  "Keyword fallback still works when Niche tags are empty",
);

console.log("\n======================================");
if (failed > 0) {
  console.error(`❌ Test run failed: ${failed} failed assertions.`);
  process.exit(1);
}

console.log("🎉 Pillar selection tests passed successfully!");
process.exit(0);