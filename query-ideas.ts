import { Client } from "@notionhq/client";
import dotenv from "dotenv";
dotenv.config({ override: true });

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const IDEAS_BANK_DS = "553eb2c3-82cb-4fb7-abff-6652cb694e4a";

async function main() {
  // Fetch 15 most recent ideas from the Ideas Bank
  const response = await (notion as any).dataSources.query({
    data_source_id: IDEAS_BANK_DS,
    sorts: [{ timestamp: "created_time", direction: "descending" }],
    page_size: 15,
  });

  console.log(`\n${"═".repeat(80)}`);
  console.log(`  IDEA BANK — 15 MOST RECENT DRAFTED IDEAS`);
  console.log(`${"═".repeat(80)}\n`);

  for (let i = 0; i < response.results.length; i++) {
    const page = response.results[i] as any;
    const p = page.properties || {};

    const title = p["Idea"]?.title?.[0]?.plain_text || "(no title)";
    const category = p["Category"]?.multi_select?.map((s: any) => s.name).join(", ") || "";
    const priority = p["Priority"]?.select?.name || "";
    const format = p["Format Idea"]?.select?.name || "";
    const status = p["Status"]?.select?.name || "";
    const hookAngle = p["Hook Angle"]?.rich_text?.[0]?.plain_text || "";
    const draftTweet = p["Draft Tweet"]?.rich_text?.map((r: any) => r.plain_text).join("") || "";
    const source = p["Source"]?.select?.name || "";
    const created = page.created_time || "";

    console.log(`─── IDEA ${i + 1} ───────────────────────────────────────────`);
    console.log(`Title:    ${title}`);
    console.log(`Category: ${category} | Priority: ${priority} | Format: ${format}`);
    console.log(`Status:   ${status} | Source: ${source}`);
    console.log(`Created:  ${created}`);
    console.log(`Hook:     ${hookAngle.substring(0, 200)}`);
    console.log(`\nDRAFT TWEET:\n${draftTweet || "(empty)"}`);
    console.log();
  }
}

main().catch(console.error);
