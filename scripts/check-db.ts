const { Client } = require("@notionhq/client");
const dotenv = require("dotenv");
const { NOTION_DATA_SOURCE_IDS } = require("../src/lib/constants");

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function checkCreators() {
  try {
    // 1. YouTube
    const ytResponse = await notion.dataSources.query({
      data_source_id: NOTION_DATA_SOURCE_IDS.YOUTUBE_CREATORS,
      page_size: 100,
    });
    console.log(`YouTube Creators count in Notion: ${ytResponse.results.length}`);
    ytResponse.results.slice(0, 5).forEach((p, i) => {
      const name = p.properties.Name?.title?.[0]?.plain_text || "Unnamed";
      const handle = p.properties["Channel URL"]?.url || "No URL";
      const status = p.properties.Status?.status?.name || "No Status";
      console.log(`  [YT ${i+1}] Name: ${name} | Handle/URL: ${handle} | Status: ${status}`);
    });

    // 2. Instagram
    const igResponse = await notion.dataSources.query({
      data_source_id: NOTION_DATA_SOURCE_IDS.INSTAGRAM_CREATORS,
      page_size: 100,
    });
    console.log(`\nInstagram Creators count in Notion: ${igResponse.results.length}`);
    igResponse.results.slice(0, 5).forEach((p, i) => {
      const name = p.properties.Name?.title?.[0]?.plain_text || "Unnamed";
      const handle = p.properties["Instagram Handle"]?.rich_text?.[0]?.plain_text || "No Handle";
      const profileUrl = p.properties["Profile URL"]?.url || "No URL";
      console.log(`  [IG ${i+1}] Name: ${name} | Handle: ${handle} | URL: ${profileUrl}`);
    });

    // 3. Twitter
    const twResponse = await notion.dataSources.query({
      data_source_id: NOTION_DATA_SOURCE_IDS.CREATORS,
      page_size: 100,
    });
    console.log(`\nTwitter Creators count in Notion: ${twResponse.results.length}`);
    twResponse.results.slice(0, 5).forEach((p, i) => {
      const handle = p.properties.Handle?.title?.[0]?.plain_text || "Unnamed";
      const name = p.properties.Name?.rich_text?.[0]?.plain_text || "No Name";
      console.log(`  [Twitter ${i+1}] Name: ${name} | Handle: ${handle}`);
    });

  } catch (error) {
    console.error("Error querying creators:", error);
  }
}

checkCreators();
