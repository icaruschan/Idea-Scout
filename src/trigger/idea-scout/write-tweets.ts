import { task } from "@trigger.dev/sdk/v3";
import { generateText } from "../../lib/llm";
import { StrategyBrief, buildWriterPrompt } from "../../lib/voice-dna";
import { updateIdea } from "../../lib/notion";
import * as fs from "fs";
import * as path from "path";

interface WriteTweetsPayload {
  notionIdeaId: string;
  strategyBrief: StrategyBrief;
}

export const writeTweets = task({
  id: "write-tweets",
  maxDuration: 600, // 10 minutes max
  retry: {
    maxAttempts: 2,
  },
  run: async (payload: WriteTweetsPayload): Promise<{ success: boolean; notionIdeaId: string }> => {
    const { notionIdeaId, strategyBrief } = payload;
    
    console.log(`✍️ Writer Actor starting for Idea: ${notionIdeaId}`);
    console.log(`Mode: ${strategyBrief.voiceMode} | Framework: ${strategyBrief.appliedFramework}`);

    try {
      // 1. Load few-shot samples
      const samplesPath = path.resolve(process.cwd(), ".tmp/creator-voice-samples.json");
      let samples = [];
      if (fs.existsSync(samplesPath)) {
        samples = JSON.parse(fs.readFileSync(samplesPath, "utf-8"));
      } else {
        console.warn("⚠️ creator-voice-samples.json not found! Falling back to base DNA.");
      }

      // 2. Build the exact system and user prompt for this mode
      const { systemPrompt, userPrompt } = buildWriterPrompt(strategyBrief, strategyBrief.voiceMode, samples);

      // 3. Generate the text using Qwen/Claude (with higher creativity and no JSON wrapper)
      console.log("📡 Calling LLM to draft tweet text...");
      const draftResult = await generateText(
        userPrompt,
        systemPrompt,
        0.85, // Higher temperature for more creative/human-like text
        "x-ai/grok-4.3" // Use Grok-4.3 as requested by the user
      );

      if (!draftResult) {
        throw new Error("LLM returned empty response for tweet draft.");
      }

      // Clean the output in case the LLM returned markdown quotes by mistake
      const cleanDraft = draftResult.replace(/^\`\`\`(markdown)?/gm, "").replace(/\`\`\`$/gm, "").trim();

      // 4. Update the existing Notion Idea with the draft
      console.log(`Updating Notion Idea ${notionIdeaId} with drafted text...`);
      await updateIdea(notionIdeaId, {
        draftTweet: cleanDraft
      });

      console.log("✅ Writer Actor finished successfully.");
      return { success: true, notionIdeaId };
    } catch (error: any) {
      console.error("❌ Writer Actor failed:", error.message || error);
      throw error;
    }
  },
});
