import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import { NOTION_DATA_SOURCE_IDS } from "../src/lib/constants";

dotenv.config({ override: true });

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function run() {
  console.log("🔍 Fetching recent scouted content to inspect titles...");
  try {
    const response = await notion.dataSources.query({
      data_source_id: NOTION_DATA_SOURCE_IDS.SCOUTED_CONTENT,
      sorts: [{ property: "Scouted Date", direction: "descending" }],
      page_size: 20,
    });

    console.log(`\nFound ${response.results.length} recent scouted items:\n`);
    for (const page of response.results as any[]) {
      const p = page.properties || {};
      const title = p["Title"]?.title?.[0]?.plain_text || "Untitled";
      const id = page.id;
      const niche = p["Niche"]?.multi_select?.map((s: any) => s.name).join(", ") || "None";
      console.log(`- Title: "${title}"`);
      console.log(`  ID: ${id} | Niche: [${niche}]`);
      console.log(`  Normalized title key (100 chars): "${title.toLowerCase().substring(0, 100)}"\n`);
    }
  } catch (error: any) {
    console.error("Error querying Notion:", error.message || error);
  }
}

run();
