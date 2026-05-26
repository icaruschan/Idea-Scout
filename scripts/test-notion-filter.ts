import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import { NOTION_DATA_SOURCE_IDS } from "../src/lib/constants";
import { cleanContentUrl } from "../src/lib/notion";

dotenv.config({ override: true });

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function testFilter() {
  const fakeUrl = "https://x.com/this_does_not_exist_at_all_123456_" + Date.now();
  console.log("Testing filter with fake URL:", fakeUrl);

  try {
    const response = await notion.dataSources.query({
      data_source_id: NOTION_DATA_SOURCE_IDS.SCOUTED_CONTENT,
      filter: {
        property: "URL",
        url: { equals: fakeUrl },
      },
      page_size: 1,
    });

    console.log(`Results length: ${response.results.length}`);
    if (response.results.length > 0) {
      const page = response.results[0] as any;
      console.log("Returned Page ID:", page.id);
      console.log("Returned URL property value:", page.properties?.["URL"]?.url);
    }
  } catch (error: any) {
    console.error("Error during query:", error.message || error);
  }
}

testFilter();
