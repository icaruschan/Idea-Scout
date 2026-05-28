import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import { NOTION_DATA_SOURCE_IDS, CONTENT_PILLARS } from "../src/lib/constants";
import { generateJSON } from "../src/lib/llm";

dotenv.config({ override: true });

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const FREE_MODEL = "google/gemini-3.1-flash-lite";

async function run() {
  console.log("🚀 Starting existing content tagging migration script...");
  console.log(`Using free model on OpenRouter: ${FREE_MODEL}`);

  try {
    // 1. Fetch ALL scouted content using pagination
    console.log("Fetching all scouted content from Notion (paginated)...");
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
      console.log(`Fetched ${allResults.length} posts so far...`);

      hasMore = response.has_more;
      startCursor = response.next_cursor || undefined;

      // Small pause to avoid hitting rate limit during pagination
      if (hasMore) {
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    const itemsToTag = allResults.filter((page) => {
      const pillars = page.properties?.Niche?.multi_select || [];
      return pillars.length === 0;
    });

    console.log(`Found ${allResults.length} total scouted posts. ${itemsToTag.length} posts need tagging.`);

    if (itemsToTag.length === 0) {
      console.log("✅ All posts are already tagged. Nothing to do!");
      return;
    }

    // 2. Batch process items in chunks of 8 to prevent prompt overload and fit within OpenRouter limits
    const CHUNK_SIZE = 8;
    for (let i = 0; i < itemsToTag.length; i += CHUNK_SIZE) {
      const chunk = itemsToTag.slice(i, i + CHUNK_SIZE);
      console.log(`\nProcessing chunk ${Math.floor(i / CHUNK_SIZE) + 1} of ${Math.ceil(itemsToTag.length / CHUNK_SIZE)} (size: ${chunk.length})...`);

      // Format chunk items for LLM
      const formattedItems = chunk.map((item, idx) => {
        const title = item.properties?.Title?.title?.[0]?.plain_text || "Untitled";
        const summary = item.properties?.["AI Summary"]?.rich_text?.[0]?.plain_text || "";
        const takeaways = item.properties?.["Key Takeaways"]?.rich_text?.[0]?.plain_text || "";
        return `Index: ${idx}\nPageID: ${item.id}\nTitle: ${title}\nSummary: ${summary}\nTakeaways: ${takeaways}`;
      }).join("\n\n---\n\n");

      const prompt = `You are a content classifier. You need to assign each content item to one or more of our 9 active content pillars.

THE 9 ACTIVE CONTENT PILLARS (MUST MATCH EXACTLY):
${CONTENT_PILLARS.map((p) => `- ${p}`).join("\n")}

Here is the list of content items to classify:
${formattedItems}

For each item, select the pillars it matches (pick at least 1, up to 3).
Only select from the 9 active pillars listed above. Do not invent new pillars.

Return a JSON array of mappings:
{
  "mappings": [
    {
      "pageId": "string (the PageID provided)",
      "pillars": ["PillarName1", "PillarName2"]
    }
  ]
}`;

      const systemPrompt = "You are an accurate, developer-focused content classifier. Respond with pure JSON matching the requested schema. Use only the exact pillar names provided.";

      try {
        const classification = await generateJSON(prompt, systemPrompt, 0.2, FREE_MODEL);
        
        if (!classification?.mappings || !Array.isArray(classification.mappings)) {
          console.warn("⚠️ Invalid response from LLM, skipping this chunk.");
          continue;
        }

        console.log(`Received classifications for ${classification.mappings.length} items.`);

        // 3. Update each page in Notion with its classified pillars
        for (const mapping of classification.mappings) {
          const matchedItem = chunk.find(item => item.id === mapping.pageId);
          if (!matchedItem) continue;

          const title = matchedItem.properties?.Title?.title?.[0]?.plain_text || "Untitled";
          
          // Filter out any invalid/banned pillars returning from LLM
          const validPillars = mapping.pillars.filter((p: string) => CONTENT_PILLARS.includes(p));

          if (validPillars.length === 0) {
            console.warn(`⚠️ No valid pillars found for "${title.substring(0, 50)}", falling back to "AI Prompting & Tools"`);
            validPillars.push("AI Prompting & Tools");
          }

          console.log(`🏷️ Tagging "${title.substring(0, 50)}" with: [${validPillars.join(", ")}]`);

          await notion.pages.update({
            page_id: mapping.pageId,
            properties: {
              "Niche": {
                multi_select: validPillars.map((p: string) => ({ name: p }))
              }
            }
          });
        }
      } catch (err: any) {
        console.error("Failed to process chunk:", err.message || err);
      }

      // Pause to avoid hitting rate limits
      await new Promise(r => setTimeout(r, 1500));
    }

    console.log("\n✅ Migration tagging complete!");
  } catch (error: any) {
    console.error("Migration failed:", error.message || error);
  }
}

run();
