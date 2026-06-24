import {
  buildSourceTextFromScoutedContentFields,
  extractPlainTextFromNotionBlocks,
} from "../src/lib/notion";

let failed = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    failed++;
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log("=== RUNNING SOURCE TEXT TESTS ===");

const bodyText = extractPlainTextFromNotionBlocks([
  {
    type: "toggle",
    toggle: {
      rich_text: [{ plain_text: "Full Transcript" }],
    },
  },
  {
    type: "paragraph",
    paragraph: {
      rich_text: [{ plain_text: "The transcript says the builder used n8n, Airtable, and Slack." }],
    },
  },
]);

assert(bodyText.includes("Full Transcript"), "Block text extraction includes toggle labels");
assert(bodyText.includes("n8n, Airtable, and Slack"), "Block text extraction includes paragraph text");

const sourceText = buildSourceTextFromScoutedContentFields({
  title: "Lead triage automation",
  platform: "YouTube",
  url: "https://example.com/video",
  aiSummary: "A workflow for qualifying inbound leads.",
  keyTakeaways: "Classify, enrich, score, route.",
  transcriptPreview: "Preview text that should be replaced when body exists.",
  pageBodyText: bodyText,
  scoutAnalysis: {
    summary: "Lead triage workflow",
    creatorDoing: "Building n8n pipeline on screen",
    contentType: "workflow-walkthrough",
    targetAudience: "founders",
    primaryPain: "manual lead checking",
    teachableUnits: ["qualify first"],
    transcriptGems: ["n8n node config"],
    guidePotential: "high",
    keyTakeaways: "→ automate triage",
  },
});

assert(
  sourceText.indexOf("FULL TRANSCRIPT / SOURCE TEXT (AUTHORITATIVE)") <
    sourceText.indexOf("SCOUT ANALYSIS"),
  "Transcript appears before scout analysis",
);
assert(sourceText.includes("n8n, Airtable, and Slack"), "Source text includes page body transcript");
assert(sourceText.includes("Creator doing: Building n8n pipeline"), "Source text includes scout analysis");
assert(sourceText.includes("Title: Lead triage automation"), "Source metadata at end");

const xSourceText = buildSourceTextFromScoutedContentFields({
  title: "X post: Use smaller automation loops",
  platform: "X",
  url: "https://x.com/example/status/123",
  aiSummary: "Small loops are easier to debug.",
  keyTakeaways: "Keep the handoff simple.",
});

assert(
  xSourceText.includes("FULL TRANSCRIPT / SOURCE TEXT (AUTHORITATIVE):"),
  "X posts include authoritative source block",
);

console.log("\n======================================");
if (failed > 0) {
  console.error(`❌ Test run failed: ${failed} failed assertions.`);
  process.exit(1);
}

console.log("🎉 Source text tests passed successfully!");
process.exit(0);