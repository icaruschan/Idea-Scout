import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import { NOTION_DATA_SOURCE_IDS } from "../src/lib/constants";

dotenv.config({ override: true });

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function run() {
  console.log("Checking if any posts are still missing Niche tags...");
  try {
    const allResults: any[] = [];
    let hasMore = true;
    let startCursor: string | undefined = undefined;

    while (hasMore) {
      const response = await notion.dataSources.query({
        data_source_id: NOTION_DATA_SOURCE_IDS.SCOUTED_CONTENT,
        page_size: 100,
        start_cursor: startCursor,
      });

      allResults.push(...response.results);
      hasMore = response.has_more;
      startCursor = response.next_cursor || undefined;
    }

    const untagged = allResults.filter((page) => {
      const pillars = page.properties?.Niche?.multi_select || [];
      return pillars.length === 0;
    });

    console.log(`\n🔍 Audit Results:`);
    console.log(`- Total Scouted Posts: ${allResults.length}`);
    console.log(`- Untagged Posts: ${untagged.length}`);

    if (untagged.length > 0) {
      console.log("\nList of untagged posts:");
      untagged.forEach((item, idx) => {
        const title = item.properties?.Title?.title?.[0]?.plain_text || "Untitled";
        console.log(`${idx + 1}. [${item.id}] ${title}`);
      });
    } else {
      console.log("\n✅ Perfect! All posts in the database are fully tagged!");
    }
  } catch (error: any) {
    console.error("Error:", error.message || error);
  }
}

run();
