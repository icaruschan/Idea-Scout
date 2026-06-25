import dotenv from "dotenv";
import { getRecentScoutedContent } from "../src/lib/notion";

dotenv.config({ override: true });

async function main() {
  const sources = await getRecentScoutedContent(30);
  const byPlatform = { YouTube: [] as typeof sources, Instagram: [] as typeof sources, X: [] as typeof sources };
  for (const s of sources) {
    if (s.platform in byPlatform) (byPlatform as any)[s.platform].push(s);
  }

  console.log(`\nScouted content audit (past 30 days, unlinked only)\n`);

  for (const [platform, items] of Object.entries(byPlatform)) {
    console.log(`=== ${platform} (${items.length}) ===`);
    for (const s of items.slice(0, 8)) {
      const raw = s.rawSourceText.length;
      const preview = s.transcriptPreview.length;
      const full = s.sourceText.length;
      console.log(`  ${s.title.substring(0, 55)}`);
      console.log(`    rawSourceText: ${raw} | Transcript property: ${preview} | sourceText: ${full}`);
      if (preview === 2000 && raw <= 2000) {
        console.log(`    ⚠️  Likely property-only (toggle empty or short)`);
      }
      if (raw >= 5000) {
        console.log(`    ✅ Full transcript in page body`);
      }
    }
    console.log();
  }
}

main().catch(console.error);