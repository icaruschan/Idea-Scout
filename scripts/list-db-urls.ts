const { Client } = require("@notionhq/client");
const dotenv = require("dotenv");
const { NOTION_DATA_SOURCE_IDS } = require("../src/lib/constants");

dotenv.config({ override: true });

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function run() {
  try {
    const response = await notion.dataSources.query({
      data_source_id: NOTION_DATA_SOURCE_IDS.SCOUTED_CONTENT,
      page_size: 100,
    });
    console.log(`Total items retrieved: ${response.results.length}`);
    response.results.forEach((page: any, index: number) => {
      const url = page.properties?.URL?.url;
      const title = page.properties?.Title?.title?.[0]?.text?.content || page.properties?.Title?.title?.[0]?.plain_text || "Untitled";
      console.log(`${index + 1}. [${title}] URL: ${url}`);
    });
  } catch (error: any) {
    console.error("Error:", error.message || error);
  }
}

run();
