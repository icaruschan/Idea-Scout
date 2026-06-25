/**
 * Verifies Notion transcript chunking helpers (no API calls).
 */
import { splitTranscriptForNotion } from "../src/lib/notion";

let failed = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    failed++;
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log("=== NOTION TRANSCRIPT STORAGE TESTS ===");

const short = "Hello world";
const shortChunks = splitTranscriptForNotion(short);
assert(shortChunks.length === 1, "Short transcript is one rich_text chunk");
assert(shortChunks[0].text.content === short, "Short transcript content preserved");

const long = "x".repeat(5500);
const longChunks = splitTranscriptForNotion(long);
assert(longChunks.length === 3, "5500 chars becomes 3 Notion rich_text chunks");
assert(
  longChunks.map((c) => c.text.content).join("").length === 5500,
  "Chunked transcript preserves full length",
);

if (failed > 0) {
  process.exit(1);
}

console.log("\n🎉 Notion transcript storage tests passed!");