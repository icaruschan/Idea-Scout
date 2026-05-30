import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import { NOTION_DATA_SOURCE_IDS } from "../src/lib/constants";

dotenv.config({ override: true });

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function run() {
  console.log("🔍 Querying recent Scouted Content to check historical ingestion by day...");
  try {
    const response = await notion.dataSources.query({
      data_source_id: NOTION_DATA_SOURCE_IDS.SCOUTED_CONTENT,
      sorts: [{ property: "Scouted Date", direction: "descending" }],
      page_size: 100,
    });

    console.log(`Successfully fetched ${response.results.length} recent items.`);

    // Group counts by Date and Platform
    // Structure: { "YYYY-MM-DD": { "YouTube": X, "Instagram": Y, "X": Z } }
    const dailyStats: Record<string, Record<string, number>> = {};

    for (const page of response.results as any[]) {
      const p = page.properties || {};
      const scoutedDate = p["Scouted Date"]?.date?.start || "No Date";
      const platform = p["Platform"]?.select?.name || "Unknown";

      if (!dailyStats[scoutedDate]) {
        dailyStats[scoutedDate] = { YouTube: 0, Instagram: 0, X: 0 };
      }
      
      if (platform === "YouTube" || platform === "Instagram" || platform === "X") {
        dailyStats[scoutedDate][platform] = (dailyStats[scoutedDate][platform] || 0) + 1;
      } else {
        dailyStats[scoutedDate][platform] = (dailyStats[scoutedDate][platform] || 0) + 1;
      }
    }

    console.log("\n📊 DAILY INGESTION BREAKDOWN:");
    console.log("=========================================");
    console.log("Date       | Platform  | Items Stored");
    console.log("-----------------------------------------");
    
    // Sort dates descending
    const sortedDates = Object.keys(dailyStats).sort((a, b) => b.localeCompare(a));
    
    for (const date of sortedDates) {
      const platforms = dailyStats[date];
      for (const [platform, count] of Object.entries(platforms)) {
        if (count > 0) {
          console.log(`${date.padEnd(10)} | ${platform.padEnd(9)} | ${count}`);
        }
      }
      console.log("-----------------------------------------");
    }

  } catch (error: any) {
    console.error("Error querying Notion:", error.message || error);
  }
}

run();
