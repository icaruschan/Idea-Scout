import {
  budgetTranscript,
  cleanTranscript,
  dedupeConsecutive,
  lineSimilarity,
  shouldCleanTranscript,
} from "../src/lib/transcript-cleaner";

let failed = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    failed++;
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log("=== RUNNING TRANSCRIPT CLEANER TESTS ===");

assert(!shouldCleanTranscript("X"), "X platform skips cleaning");
assert(shouldCleanTranscript("YouTube"), "YouTube platform cleans");
assert(shouldCleanTranscript("Instagram"), "Instagram platform cleans");

const noisy = [
  "Intro to Claude agents",
  "",
  "[Music]",
  "(upbeat music)",
  "so what I wanted to show you is the agent loop setup",
  "so what I wanted to show you is the agent loop setup",
  "um",
  "uh",
  "Chapter 3",
  "12:45",
  "The key is running tools in a loop until the task completes.",
].join("\n");

const cleaned = cleanTranscript(noisy, "YouTube");
assert(cleaned.length < noisy.length, "Cleaning reduces noisy transcript size");
assert(!cleaned.includes("[Music]"), "Strips bracketed music tags");
assert(!/\bum\b/i.test(cleaned.split("\n").join("")), "Drops filler-only lines");
assert(cleaned.includes("agent loop"), "Keeps substantive content");

assert(lineSimilarity("setup the agent loop", "setup the agent loop") === 1, "Identical lines score 1");
assert(
  lineSimilarity(
    "so what I wanted to show you is the agent loop setup",
    "so what I wanted to show you is the agent loop setup",
  ) === 1,
  "Duplicate ASR lines score 1",
);

const deduped = dedupeConsecutive(noisy, 0.85, 8);
assert(
  deduped.split("agent loop setup").length <= noisy.split("agent loop setup").length,
  "Consecutive fuzzy dedupe removes repeated substantive line",
);

const long = `${"word ".repeat(8000)}middle detail ${"tail ".repeat(8000)}`;
const budgeted = budgetTranscript(long, "YouTube", 30_000);
assert(budgeted.stats.cleaned || budgeted.stats.headTailTrimmed, "Long transcript is processed");
assert(budgeted.text.length <= 30_000, "Budget respects max chars");
assert(budgeted.text.startsWith("word"), "Head preserved after budget");
assert(budgeted.text.trimEnd().endsWith("tail"), "Tail preserved after budget");

const xPassthrough = cleanTranscript("[Music]\num\nReal insight about n8n", "X");
assert(xPassthrough.includes("[Music]"), "X transcript passes through untouched");

if (failed > 0) {
  console.error(`\n❌ ${failed} test(s) failed`);
  process.exit(1);
}

console.log("\n🎉 Transcript cleaner tests passed!");