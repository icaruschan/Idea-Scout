/**
 * Measure real transcript cleaning reduction on Scouted Content from Notion.
 * Run: npx tsx scripts/measure-transcript-cleaning.ts
 */
import dotenv from "dotenv";
import { getRecentScoutedContent } from "../src/lib/notion";
import { IDEA_SCOUT_CONFIG } from "../src/lib/idea-scout-config";
import { budgetTranscript, cleanTranscript } from "../src/lib/transcript-cleaner";

dotenv.config({ override: true });

function pct(reduced: number, original: number): string {
  if (original <= 0) return "0%";
  return `${Math.round((reduced / original) * 100)}%`;
}

async function main() {
  if (!process.env.NOTION_API_KEY) {
    console.error("❌ NOTION_API_KEY not set");
    process.exit(1);
  }

  const days = Number(process.argv[2] || 14);
  const limit = Number(process.argv[3] || 12);

  console.log(`\n${"═".repeat(72)}`);
  console.log(`  TRANSCRIPT CLEANING — real Scouted Content (past ${days} days)`);
  console.log(`${"═".repeat(72)}\n`);

  const sources = (await getRecentScoutedContent(days)).slice(0, limit);
  if (sources.length === 0) {
    console.log("No scouted content found.");
    return;
  }

  const strategistCap = IDEA_SCOUT_CONFIG.strategistMaxTranscriptChars;
  let totalOriginal = 0;
  let totalCleaned = 0;
  let headTailCount = 0;

  for (const source of sources) {
    const raw = source.rawSourceText || source.transcriptPreview || "";
    if (raw.length < 100) continue;

    const cleanedOnly = cleanTranscript(raw, source.platform);
    const budgeted = budgetTranscript(raw, source.platform, strategistCap);

    totalOriginal += budgeted.stats.originalChars;
    totalCleaned += budgeted.stats.cleanedChars;
    if (budgeted.stats.headTailTrimmed) headTailCount++;

    const cleanReduction = budgeted.stats.originalChars - budgeted.stats.cleanedChars;
    const finalReduction = budgeted.stats.originalChars - budgeted.stats.finalChars;

    console.log(`── ${source.title.substring(0, 65)}`);
    console.log(`   Platform: ${source.platform}`);
    console.log(
      `   Raw: ${budgeted.stats.originalChars.toLocaleString()} chars`,
    );
    console.log(
      `   After clean: ${budgeted.stats.cleanedChars.toLocaleString()} chars (${pct(cleanReduction, budgeted.stats.originalChars)} reduction)`,
    );
    console.log(
      `   After budget (${strategistCap.toLocaleString()} cap): ${budgeted.stats.finalChars.toLocaleString()} chars (${pct(finalReduction, budgeted.stats.originalChars)} total reduction)`,
    );
    console.log(
      `   Head+tail applied: ${budgeted.stats.headTailTrimmed ? "yes" : "no"}`,
    );
    if (source.platform !== "X" && cleanedOnly.length === raw.trim().length) {
      console.log(`   Note: no cleaning change — transcript may already be dense`);
    }
    console.log();
  }

  const avgCleanPct =
    totalOriginal > 0
      ? Math.round(((totalOriginal - totalCleaned) / totalOriginal) * 100)
      : 0;

  console.log(`${"─".repeat(72)}`);
  console.log(`Sources measured: ${sources.filter((s) => (s.rawSourceText || s.transcriptPreview || "").length >= 100).length}`);
  console.log(`Avg cleaning reduction (before head/tail): ~${avgCleanPct}%`);
  console.log(`Sources needing head+tail after clean: ${headTailCount}`);
  console.log(`Strategist cap: ${strategistCap.toLocaleString()} chars`);
  console.log();
  console.log(
    avgCleanPct < 5
      ? `✅ Dense YT transcripts show ~${avgCleanPct}% cleaning — 30k cap is appropriate; head+tail only when still over cap`
      : headTailCount > 0
        ? `ℹ️  Cleaning ~${avgCleanPct}% before budget; ${headTailCount} source(s) need head+tail at 30k cap — monitor strategist timeouts`
        : `ℹ️  Cleaning ~${avgCleanPct}% before budget; 30k cap fits without head+tail on measured sources`,
  );
}

main().catch((err) => {
  console.error("❌ Measurement failed:", err.message || err);
  process.exit(1);
});