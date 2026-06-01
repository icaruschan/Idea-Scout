import dotenv from "dotenv";
import { getRecentScoutedContent, getTopViralPosts } from "../src/lib/notion";
import { generateText } from "../src/lib/llm";

dotenv.config({ override: true });

async function run() {
  console.log("📡 Fetching context from Notion...");
  try {
    const [scoutedItems, viralPosts] = await Promise.all([
      getRecentScoutedContent(3),
      getTopViralPosts(5)
    ]);

    if (scoutedItems.length === 0) {
      console.log("❌ No scouted content found in Notion.");
      return;
    }

    const scoutedSummary = scoutedItems
      .map((item, idx) => `[Scouted Item #${idx + 1}]\nTitle: ${item.title}\nSummary: ${item.aiSummary}\nTakeaways: ${item.keyTakeaways}\nCreator: ${item.creatorName}\nURL: ${item.url}`)
      .join("\n\n---\n\n");

    const viralSummary = viralPosts
      .map((post, idx) => {
        const p = post.properties || {};
        const tweetText = p["Post Title"]?.title?.[0]?.plain_text || p["Tweet"]?.title?.[0]?.plain_text || p["Post Content"]?.rich_text?.[0]?.plain_text || "";
        const rating = p["⭐ Rating"]?.select?.name || "";
        return `[Viral Template #${idx + 1}] [Rating: ${rating}]\n${tweetText.substring(0, 300)}`;
      })
      .join("\n\n---\n\n");

    const prompt = `You are a world-class copywriter who specializes in writing X (Twitter) content in the "Curator-Analyst" / "Reverse-Engineering Case Study" style.

Here is the real source context:

═══════════════════════════════════════════════════════════════════════════════
SOURCE 1: SCOUTED CONTENT (Recent builder achievements/tutorials)
═══════════════════════════════════════════════════════════════════════════════
${scoutedSummary}

═══════════════════════════════════════════════════════════════════════════════
SOURCE 2: VIRAL POST LIBRARY (proven structures/hooks)
═══════════════════════════════════════════════════════════════════════════════
${viralSummary}

═══════════════════════════════════════════════════════════════════════════════
YOUR MISSION
═══════════════════════════════════════════════════════════════════════════════
Generate 3 concrete example drafts in the "Curator-Analyst" style (e.g. "This creator/builder just built X, here's how they did it/how you can too..."). 

For each example:
1. State which Scouted Item and Viral Template you are pairing together.
2. Provide the generated hook title.
3. Write the full draft tweet body, conforming strictly to the "Smart Friend" voice:
   - "Short. Breathe. Land." visual spacing (max 2 lines of text per paragraph block).
   - Use concrete metrics and numbers where possible.
   - Banned jargon (no "game-changer", "revolutionize", "elevate", "democratize", etc.).
   - Use first-person lowercase "i watched" or "i analyzed" to keep it human.`;

    console.log("🧠 Querying OpenRouter to generate Curator-Analyst examples...");
    const result = await generateText(prompt, "You are a senior digital content strategist.", 0.7);
    console.log("\n===============================================================================");
    console.log("✨ GENERATED CURATOR-ANALYST EXAMPLES:");
    console.log("===============================================================================");
    console.log(result);
    console.log("===============================================================================");

  } catch (err: any) {
    console.error("❌ Execution failed:", err.message || err);
  }
}

run();
