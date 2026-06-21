import { task } from "@trigger.dev/sdk/v3";
import { generateText } from "../../lib/llm";
import { ValueBrief, buildWriterPrompt } from "../../lib/voice-dna";
import { updateIdea } from "../../lib/notion";
import * as fs from "fs";
import * as path from "path";

interface WriteTweetsPayload {
  notionIdeaId: string;
  valueBrief: ValueBrief;
}

const COMMITTED_SAMPLES_PATH = path.resolve(process.cwd(), "src/data/creator-voice-samples.json");
const TMP_SAMPLES_PATH = path.resolve(process.cwd(), ".tmp/creator-voice-samples.json");

export function loadVoiceSamples(): any[] {
  const samplePaths = [COMMITTED_SAMPLES_PATH, TMP_SAMPLES_PATH];

  for (const samplesPath of samplePaths) {
    if (fs.existsSync(samplesPath)) {
      console.log(`Loaded voice samples from ${samplesPath}`);
      return JSON.parse(fs.readFileSync(samplesPath, "utf-8"));
    }
  }

  console.warn(
    "⚠️ creator-voice-samples.json not found in src/data or .tmp. Falling back to base DNA.",
  );
  return [];
}

export const writeTweets = task({
  id: "write-tweets",
  maxDuration: 600, // 10 minutes max
  retry: {
    maxAttempts: 2,
  },
  run: async (payload: WriteTweetsPayload): Promise<{ success: boolean; notionIdeaId: string }> => {
    const { notionIdeaId, valueBrief } = payload;
    
    console.log(`✍️ Writer Actor starting for Idea: ${notionIdeaId}`);
    console.log(`Mode: ${valueBrief.voiceMode} | Format: ${valueBrief.format} | Source: ${valueBrief.sourceTitle}`);

    try {
      // 1. Load few-shot samples
      const samples = loadVoiceSamples();

      // 2. Build the exact system and user prompt for this mode
      const { systemPrompt, userPrompt } = buildWriterPrompt(valueBrief, valueBrief.voiceMode, samples);

      // 3. Generate the text from the source-grounded brief (no JSON wrapper)
      console.log("📡 Calling LLM to draft tweet text...");
      const draftResult = await generateText(
        userPrompt,
        systemPrompt,
        0.7,
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
