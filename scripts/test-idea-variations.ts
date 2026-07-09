import {
  buildVariationDraftEntries,
  buildVariationPreamble,
  buildVariationSetLabel,
  buildVariationSiblingFooter,
  formatIdeaTitleWithFormat,
} from "../src/lib/idea-variations";
import { ExecutionPlan } from "../src/lib/voice-dna";

let failed = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    failed++;
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log("=== RUNNING IDEA VARIATION TESTS ===");

assert(
  buildVariationSetLabel("How to build n8n agents", new Date("2026-07-10T12:00:00Z")).includes(
    "Jul",
  ),
  "Variation set label includes source title and date",
);

assert(
  formatIdeaTitleWithFormat("Deploy in 12 minutes", "Thread") ===
    "Deploy in 12 minutes — Thread",
  "Format suffix is appended to idea title",
);

assert(
  formatIdeaTitleWithFormat("Already tagged — Thread", "Thread") ===
    "Already tagged — Thread",
  "Format suffix is not duplicated",
);

const planA = {
  ideaTitle: "Deploy in 12 minutes",
  format: "Thread",
} as ExecutionPlan;
const planB = {
  ideaTitle: "The Extraction Stack",
  format: "Article",
} as ExecutionPlan;

const entries = buildVariationDraftEntries([planA, planB]);
assert(entries.length === 2, "Builds one draft entry per plan");
assert(
  entries[0].displayTitle === "Deploy in 12 minutes — Thread",
  "Draft entry carries display title with format",
);

const preamble = buildVariationPreamble({
  variationSet: "Deploy demo (Jul 10, 2026)",
  format: "Thread",
  index: 1,
  total: 2,
  sourceTitle: "Deploy demo",
  sourceUrl: "https://example.com/video",
  siblings: [{ format: "Article", displayTitle: "The Extraction Stack — Article" }],
});

assert(preamble.includes("Variation Set"), "Preamble includes variation set header");
assert(preamble.includes("1 of 2"), "Preamble shows position in set");
assert(preamble.includes("Article: The Extraction Stack — Article"), "Preamble lists siblings");

const footer = buildVariationSiblingFooter(
  "Deploy demo (Jul 10, 2026)",
  "aaaa-bbbb",
  [
    { pageId: "aaaa-bbbb", format: "Thread", displayTitle: "Deploy — Thread" },
    { pageId: "cccc-dddd", format: "Article", displayTitle: "Stack — Article" },
  ],
);

assert(footer.includes("notion.so/ccccdddd"), "Sibling footer includes Notion link");
assert(!footer.includes("aaaa-bbbb"), "Sibling footer excludes current page");

console.log("\n======================================");
if (failed > 0) {
  console.error(`❌ Test run failed: ${failed} failed assertions.`);
  process.exit(1);
}

console.log("🎉 Idea variation tests passed successfully!");
process.exit(0);