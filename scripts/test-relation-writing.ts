import dotenv from "dotenv";
import { getRecentScoutedContent, createIdea } from "../src/lib/notion";
import { matchPillar } from "../src/lib/pillar-utils";

dotenv.config({ override: true });

async function run() {
  console.log("🚀 Starting Relation Writing Test (Mock LLM Output)...");
  try {
    // 1. Get a real recently scouted content item from Notion
    console.log("📡 Fetching a recent scouted content item from Notion...");
    const scoutedItems = await getRecentScoutedContent(14);
    
    if (scoutedItems.length === 0) {
      console.log("⚠️ No recent scouted content found. Cannot run relation mapping test.");
      return;
    }

    const testScoutedItem = scoutedItems[0];
    console.log(`\nFound Scouted Item:`);
    console.log(`- Title: "${testScoutedItem.title}"`);
    console.log(`- Page ID: ${testScoutedItem.pageId}`);
    console.log(`- Platform: ${testScoutedItem.platform}`);

    // 2. Mock a synthesized idea for the Automation pillar
    const mockPillar = "Automation";
    const validPillar = matchPillar(mockPillar);

    const mockIdea = {
      title: `Cursor + n8n: How i saved 18 hours building my pipeline`,
      pillar: mockPillar,
      hookAngle: "Vulnerability + extreme speed results",
      whyItWorks: "Curiosity gap combined with a specific timeframe (18 hours) and tool stacks (Cursor, n8n).",
      format: "Short",
      priority: "🔥 Hot",
      stealablePattern: "I replaced X with Y and built Z in [Timeframe]",
      tweetStructure: "Hook -> The manual nightmare -> The automated solution -> Call to action",
      whyWorks: "Specific metrics + tool names spark curiosity.",
      sourcedFrom: testScoutedItem.title,
      inspiredByScoutedIds: [testScoutedItem.pageId], // Crucial: actual Notion UUID
    };

    console.log("\n✍️ Attempting to write mock idea to Notion Ideas Bank...");
    console.log(`- Title: "${mockIdea.title}"`);
    console.log(`- Linking to Scouted Content ID: ${mockIdea.inspiredByScoutedIds[0]}`);

    const rawData = [
      `📌 Cross-Pollination Logic: Mock test for verifying the UUID-based relation linking logic.`,
      `📦 Sourced From: ${mockIdea.sourcedFrom}`,
      `🔧 Structure: ${mockIdea.tweetStructure}`,
    ].join("\n\n");

    const createdPageId = await createIdea(
      mockIdea.title,
      "Idea Scout",
      validPillar,
      mockIdea.hookAngle,
      rawData,
      {
        priority: mockIdea.priority as any,
        formatIdea: "Short",
        stealablePattern: mockIdea.stealablePattern,
        tweetStructure: mockIdea.tweetStructure,
        inspiredByScoutedIds: mockIdea.inspiredByScoutedIds,
        whyItWorks: mockIdea.whyItWorks,
      }
    );

    console.log(`\n✅ Success! Created Idea page ID: ${createdPageId}`);
    console.log(`🔗 Check the Ideas Bank database in Notion to verify that:`);
    console.log(`   1. The new Idea "Cursor + n8n: How i saved 18 hours building my pipeline" is created.`);
    console.log(`   2. The "Inspired By (Scouted)" relation is linked directly to: "${testScoutedItem.title}".`);

  } catch (error: any) {
    console.error("\n❌ Relation Writing Test failed:", error.message || error);
  }
}

run();
