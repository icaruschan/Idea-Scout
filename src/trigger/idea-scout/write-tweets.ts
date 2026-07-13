import { task, tasks } from "@trigger.dev/sdk/v3";
import { generateTextTokenRouter, MODELS } from "../../lib/llm";
import { ExecutionPlan, ContentFormat, buildWriterPrompt } from "../../lib/voice-dna";
import { appendIdeaOperationalNote, updateIdea } from "../../lib/notion";
import { validateDraft } from "../../lib/draft-validator";
import { IDEA_SCOUT_CONFIG } from "../../lib/idea-scout-config";
import { getActiveTasteProfile, setEvaluationState } from "../../lib/idea-roadmap-notion";
import * as fs from "fs";
import * as path from "path";

interface WriteTweetsPayload {
  notionIdeaId: string;
  valueBrief: ExecutionPlan;
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

function cleanDraftOutput(raw: string): string {
  return raw.replace(/^\`\`\`(markdown)?/gm, "").replace(/\`\`\`$/gm, "").trim();
}

function writerMaxTokens(format: ContentFormat, isRetry: boolean): number {
  const caps = IDEA_SCOUT_CONFIG.writerMaxTokens;
  if (format === "Article") return isRetry ? caps.articleRetry : caps.article;
  if (format === "Thread") return isRetry ? caps.threadRetry : caps.thread;
  if (format === "Mid-length") return caps.midLength;
  if (format === "Short") return caps.short;
  return caps.default;
}

export const writeTweets = task({
  id: "write-tweets",
  maxDuration: 600,
  retry: {
    maxAttempts: 2,
  },
  run: async (
    payload: WriteTweetsPayload,
  ): Promise<{ success: boolean; notionIdeaId: string; validationPassed?: boolean }> => {
    const { notionIdeaId, valueBrief } = payload;

    console.log(`✍️ Writer Actor starting for Idea: ${notionIdeaId}`);
    console.log(
      `Mode: ${valueBrief.voiceMode} | Format: ${valueBrief.format} | Source: ${valueBrief.sourceTitle}`,
    );

    try {
      const [samples, tasteProfile] = await Promise.all([
        Promise.resolve(loadVoiceSamples()),
        getActiveTasteProfile().catch(() => ""),
      ]);
      const { systemPrompt, userPrompt } = buildWriterPrompt(
        valueBrief,
        valueBrief.voiceMode,
        samples,
        tasteProfile,
      );

      const maxTokens = writerMaxTokens(valueBrief.format, false);
      console.log(
        `📡 Calling TokenRouter ${MODELS.WRITER} (max_tokens=${maxTokens}) to draft content...`,
      );
      let draftResult = await generateTextTokenRouter(
        userPrompt,
        systemPrompt,
        IDEA_SCOUT_CONFIG.writerTemperature,
        MODELS.WRITER,
        maxTokens,
      );

      if (!draftResult.content) {
        throw new Error("LLM returned empty response for draft.");
      }

      let cleanDraft = cleanDraftOutput(draftResult.content);
      let validation = validateDraft(
        cleanDraft,
        valueBrief.format,
        valueBrief.mustUseDetails,
        { truncated: draftResult.finishReason === "length" },
      );

      console.log(
        `📏 Draft validation: passed=${validation.passed} finish=${draftResult.finishReason} metrics=${JSON.stringify(validation.metrics)}`,
      );

      if (!validation.passed && validation.retryHint) {
        const retryMaxTokens = writerMaxTokens(valueBrief.format, true);
        console.log(
          `🔄 Retrying draft (max_tokens=${retryMaxTokens}): ${validation.issues.join("; ")}`,
        );
        draftResult = await generateTextTokenRouter(
          `${userPrompt}\n\nREVISION REQUIRED:\n${validation.retryHint}\n\nPrevious draft was too thin or truncated. Expand significantly and finish with a complete closing section.`,
          systemPrompt,
          IDEA_SCOUT_CONFIG.writerTemperature,
          MODELS.WRITER,
          retryMaxTokens,
        );
        cleanDraft = cleanDraftOutput(draftResult.content);
        validation = validateDraft(cleanDraft, valueBrief.format, valueBrief.mustUseDetails, {
          truncated: draftResult.finishReason === "length",
        });
        console.log(
          `📏 Retry validation: passed=${validation.passed} finish=${draftResult.finishReason} metrics=${JSON.stringify(validation.metrics)}`,
        );
      }

      console.log(`Updating Notion Idea ${notionIdeaId} with drafted text...`);
      await updateIdea(notionIdeaId, {
        draftTweet: cleanDraft,
        formatIdea: valueBrief.format,
        promoteToDrafted: validation.passed,
      });

      if (!validation.passed) {
        await setEvaluationState(notionIdeaId, "Skipped");
        console.warn(`⚠️ Depth gate failed — staying 💭 Raw: ${validation.issues.join("; ")}`);
        await appendIdeaOperationalNote(
          notionIdeaId,
          "⚠️ Writer depth gate failed",
          [
            `Format: ${valueBrief.format}`,
            `Issues: ${validation.issues.join("; ")}`,
            `Metrics: ${JSON.stringify(validation.metrics)}`,
            "Draft saved in toggle for inspection. Re-run write-tweets or edit manually.",
          ].join("\n"),
        );
        return { success: false, notionIdeaId, validationPassed: false };
      }

      await setEvaluationState(notionIdeaId, "Pending");
      await tasks.trigger("evaluate-draft", {
        notionIdeaId,
        valueBrief,
        draft: cleanDraft,
      });

      console.log("✅ Writer Actor finished successfully; evaluation queued.");
      return { success: true, notionIdeaId, validationPassed: true };
    } catch (error: any) {
      console.error("❌ Writer Actor failed:", error.message || error);
      throw error;
    }
  },
});
