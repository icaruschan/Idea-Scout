const { Client } = require("@notionhq/client");
const dotenv = require("dotenv");
const { NOTION_DATA_SOURCE_IDS } = require("../src/lib/constants");

dotenv.config({ override: true });

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function run() {
  console.log("Querying Scouted Content Data Source:", NOTION_DATA_SOURCE_IDS.SCOUTED_CONTENT);
  try {
    const response = await notion.dataSources.query({
      data_source_id: NOTION_DATA_SOURCE_IDS.SCOUTED_CONTENT,
      page_size: 50,
    });

    console.log(`Retrieved ${response.results.length} total pages from Notion.`);

    // Sort programmatically by created_time descending
    const sorted = [...response.results].sort((a: any, b: any) => {
      const timeA = new Date(a.created_time || 0).getTime();
      const timeB = new Date(b.created_time || 0).getTime();
      return timeB - timeA;
    });

    console.log(`Showing the 5 most recently created pages:\n`);

    for (const page of sorted.slice(0, 5)) {
      console.log(`=========================================`);
      console.log(`Page ID: ${page.id}`);
      console.log(`Created Time: ${page.created_time}`);
      
      const props = page.properties;
      
      // Title
      const title = props.Title?.title?.[0]?.text?.content || props.Title?.title?.[0]?.plain_text || "Untitled";
      console.log(`Title: ${title}`);
      
      // Platform
      const platform = props.Platform?.select?.name || "None";
      console.log(`Platform: ${platform}`);
      
      // URL
      const url = props.URL?.url || "None";
      console.log(`URL: ${url}`);
      
      // Metrics
      const likes = props.Likes?.number ?? "None";
      const views = props.Views?.number ?? "None";
      const comments = props.Comments?.number ?? "None";
      console.log(`Metrics: Likes: ${likes} | Views: ${views} | Comments: ${comments}`);
      
      // Dates
      const pubDate = props["Published Date"]?.date?.start || "None";
      const scoutDate = props["Scouted Date"]?.date?.start || "None";
      console.log(`Dates: Published: ${pubDate} | Scouted: ${scoutDate}`);
      
      // AI Summary
      const summary = props["AI Summary"]?.rich_text?.[0]?.text?.content || props["AI Summary"]?.rich_text?.[0]?.plain_text || "None";
      console.log(`AI Summary: ${summary.substring(0, 100)}...`);
      
      // Key Takeaways
      const takeaways = props["Key Takeaways"]?.rich_text?.[0]?.text?.content || props["Key Takeaways"]?.rich_text?.[0]?.plain_text || "None";
      console.log(`Key Takeaways: ${takeaways.substring(0, 100)}...`);
      
      // Relations
      const ytRelation = props["YouTube Creators"]?.relation || [];
      const igRelation = props["Instagram Creators"]?.relation || [];
      const twitterRelation = props["👤 Twitter Creators"]?.relation || [];
      
      console.log(`YouTube Creators relation count: ${ytRelation.length} (${JSON.stringify(ytRelation)})`);
      console.log(`Instagram Creators relation count: ${igRelation.length} (${JSON.stringify(igRelation)})`);
      console.log(`👤 Twitter Creators relation count: ${twitterRelation.length} (${JSON.stringify(twitterRelation)})`);
      console.log(`=========================================\n`);
    }
  } catch (error: any) {
    console.error("Error querying database:", error.message || error);
  }
}

run();
