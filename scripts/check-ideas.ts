import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import { NOTION_DATA_SOURCE_IDS } from "../src/lib/constants";

dotenv.config({ override: true });

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function run() {
  console.log("🔍 Fetching recent ideas from the Ideas Bank...");
  try {
    const response = await (notion as any).dataSources.query({
      data_source_id: NOTION_DATA_SOURCE_IDS.IDEAS_BANK,
      page_size: 35,
    });

    console.log(`\nFound ${response.results.length} recent ideas:\n`);
    for (const page of response.results as any[]) {
      const p = page.properties || {};
      const title = p["Idea"]?.title?.[0]?.plain_text || "Untitled";
      const category = p["Category"]?.multi_select?.map((s: any) => s.name).join(", ") || "None";
      const status = p["Status"]?.select?.name || "None";
      const createdTime = page.created_time;
      
      const inspiredByScouted = p["Inspired By (Scouted)"]?.relation || [];
      const inspiredByLibrary = p["Inspired By (Library)"]?.relation || [];

      console.log(`- Title: "${title}"`);
      console.log(`  Category: [${category}] | Status: ${status} | Created: ${createdTime}`);
      console.log(`  Inspired By (Scouted): ${inspiredByScouted.map((r: any) => r.id).join(", ") || "None"}`);
      console.log(`  Inspired By (Library): ${inspiredByLibrary.map((r: any) => r.id).join(", ") || "None"}`);
      console.log(`  ID: ${page.id}\n`);
    }
  } catch (error: any) {
    console.error("Error querying Notion:", error.message || error);
  }
}

run();
