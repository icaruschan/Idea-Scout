import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import { NOTION_DATA_SOURCE_IDS } from "../src/lib/constants";

dotenv.config({ override: true });

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function run() {
  console.log("Querying single page to inspect all properties...");
  try {
    const response = await notion.dataSources.query({
      data_source_id: NOTION_DATA_SOURCE_IDS.SCOUTED_CONTENT,
      page_size: 1,
    });

    if (response.results.length === 0) {
      console.log("No pages found.");
      return;
    }

    const page: any = response.results[0];
    console.log("\nProperties found on the page:");
    for (const key of Object.keys(page.properties)) {
      const prop = page.properties[key];
      console.log(`- "${key}": type = ${prop.type}, value =`, JSON.stringify(prop[prop.type]));
    }
  } catch (error: any) {
    console.error("Error:", error.message || error);
  }
}

run();
