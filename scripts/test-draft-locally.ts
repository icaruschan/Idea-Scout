import { runDraftIdeas } from "../src/trigger/idea-scout/draft-ideas";
import dotenv from "dotenv";

dotenv.config({ override: true });

async function run() {
  console.log("🚀 Starting Local Draft Ideas Synthesis Test...");
  try {
    // Run with an empty payload, which will fetch the 7 most recent scouted items in Notion
    // and attempt to synthesize ideas in the Ideas Bank using the newly tagged Niche properties.
    const result = await runDraftIdeas({ scoutedContentIds: [] });
    console.log("\n✅ Synthesis complete! Result:", result);
  } catch (error: any) {
    console.error("\n❌ Synthesis failed:", error.message || error);
  }
}

run();
