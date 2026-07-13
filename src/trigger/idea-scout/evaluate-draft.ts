import { task } from "@trigger.dev/sdk/v3";
import { generateJSONStrategist } from "../../lib/llm";
import {
  buildEvaluationPrompt,
  normalizeIdeaEvaluation,
} from "../../lib/idea-evaluation";
import {
  getIdeaForEvaluation,
  getRecentIdeasForComparison,
  getSourceContext,
  markEvaluationFailed,
  saveIdeaEvaluation,
  setEvaluationState,
  setIdeaHooks,
} from "../../lib/idea-roadmap-notion";
import type { ExecutionPlan } from "../../lib/voice-dna";

export interface EvaluateDraftPayload {
  notionIdeaId: string;
  valueBrief?: ExecutionPlan;
  draft?: string;
}

const EVALUATOR_SYSTEM = `You are Idea Scout's strict editorial evaluator.
Judge source grounding, audience value, originality, voice, hook payoff, and timing.
Do not reward hype, length, or fashionable topics. A 5 is average and a 9 is exceptional.
Return valid JSON only and never invent source facts.`;

export async function runEvaluateDraft(payload: EvaluateDraftPayload) {
  const { notionIdeaId, valueBrief } = payload;
  await setEvaluationState(notionIdeaId, "Pending");
  try {
    const [idea, recentIdeas] = await Promise.all([
      getIdeaForEvaluation(notionIdeaId),
      getRecentIdeasForComparison(30),
    ]);
    const draft = payload.draft?.trim() || idea.draft;
    if (!draft) {
      await setEvaluationState(notionIdeaId, "Skipped");
      return { success: false, notionIdeaId, skipped: true, reason: "No draft text" };
    }
    const sourceContext = valueBrief?.sourceText || await getSourceContext(idea.sourceIds);
    const raw = await generateJSONStrategist(
      buildEvaluationPrompt({
        title: idea.title,
        category: idea.category,
        format: idea.format,
        hook: idea.hook || valueBrief?.hookFilledExample || "",
        draft,
        plan: valueBrief,
        sourceContext,
        recentIdeas: recentIdeas.filter((item) => item.id !== notionIdeaId),
      }),
      EVALUATOR_SYSTEM,
      0.2,
    );
    const evaluation = normalizeIdeaEvaluation(raw, idea.format, draft);
    await saveIdeaEvaluation(notionIdeaId, evaluation);

    const variants = valueBrief?.hookVariants;
    if (variants?.length) {
      const safe = variants.find((item) => item.label === "Safe")?.text || variants[0]?.text || "";
      const sharp = variants.find((item) => item.label === "Sharp")?.text || valueBrief?.hookFilledExample || safe;
      const bold = variants.find((item) => item.label === "Bold")?.text || variants.at(-1)?.text || sharp;
      await setIdeaHooks(notionIdeaId, {
        safe,
        sharp,
        bold,
        selected: valueBrief?.selectedHookVariant || sharp,
        psychology: [...new Set(variants.flatMap((item) => item.psychology || []))],
      });
    }

    return { success: true, notionIdeaId, evaluation };
  } catch (error) {
    const message = (error as Error).message || String(error);
    await markEvaluationFailed(notionIdeaId, message);
    throw error;
  }
}

export const evaluateDraft = task({
  id: "evaluate-draft",
  maxDuration: 600,
  retry: { maxAttempts: 2 },
  run: runEvaluateDraft,
});
