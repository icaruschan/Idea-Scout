import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import { NOTION_DATA_SOURCE_IDS } from "../src/lib/constants";

dotenv.config({ override: true });

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function run() {
  console.log("🔍 Checking X Scouted Content URLs from May 28th...");
  try {
    const response = await notion.dataSources.query({
      data_source_id: NOTION_DATA_SOURCE_IDS.SCOUTED_CONTENT,
      filter: {
        and: [
          {
            property: "Scouted Date",
            date: { equals: "2026-05-28" }
          },
          {
            property: "Platform",
            select: { equals: "X" }
          }
        ]
      },
      page_size: 100,
    });

    console.log(`Fetched ${response.results.length} X items from May 28th.\n`);

    let articleCount = 0;
    let normalTweetCount = 0;

    response.results.forEach((page: any, index) => {
      const p = page.properties || {};
      const url = p["URL"]?.url || "";
      const title = p["Title"]?.title?.[0]?.plain_text || "Untitled";
      
      const isArticle = url.includes("/article/");
      if (isArticle) {
        articleCount++;
        console.log(`${index + 1}. [ARTICLE] "${title}"`);
        console.log(`   URL: ${url}`);
      } else {
        normalTweetCount++;
      }
    });

    console.log(`\nSummary:`);
    console.log(`- Normal Tweets (no REST call required): ${normalTweetCount}`);
    console.log(`- X Articles (REST call required): ${articleCount}`);

  } catch (error: any) {
    console.error("Error querying Notion:", error.message || error);
  }
}

run();
