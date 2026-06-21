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
});

assert(sourceText.includes("SOURCE TITLE:\nLead triage automation"), "Source text includes title");
assert(sourceText.includes("AI SUMMARY:\nA workflow for qualifying inbound leads."), "Source text includes AI Summary");
assert(sourceText.includes("KEY TAKEAWAYS:\nClassify, enrich, score, route."), "Source text includes key takeaways");
assert(sourceText.includes("FULL TRANSCRIPT / SOURCE TEXT:\nFull Transcript"), "Source text includes page body transcript");
assert(!sourceText.includes("Preview text that should be replaced"), "Page body transcript wins over Transcript property preview");

const xSourceText = buildSourceTextFromScoutedContentFields({
  title: "X post: Use smaller automation loops",
  platform: "X",
  url: "https://x.com/example/status/123",
  aiSummary: "Small loops are easier to debug.",
  keyTakeaways: "Keep the handoff simple.",
});

assert(xSourceText.includes("FULL TRANSCRIPT / SOURCE TEXT:\nX post: Use smaller automation loops"), "X posts without transcripts fall back to stored title/text");

console.log("\n======================================");
if (failed > 0) {
  console.error(`❌ Test run failed: ${failed} failed assertions.`);
  process.exit(1);
}

console.log("🎉 Source text tests passed successfully!");
process.exit(0);
