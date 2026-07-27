import { task } from "@trigger.dev/sdk/v3";
import { generateJSONStrategist } from "../../lib/llm";
import { getSourceContext } from "../../lib/idea-roadmap-notion";
import {
  getPipelineProductionContext,
  markBlueprintFailed,
  saveProductionBlueprint,
  setBlueprintState,
} from "../../lib/production-notion";
import {
  buildProductionBlueprintPrompt,
  normalizeProductionBlueprint,
} from "../../lib/production-blueprint";

export interface GenerateProductionBlueprintPayload {
  pipelineId: string;
  force?: boolean;
}

const PRODUCTION_PLANNER_SYSTEM = `You are Idea Scout's content production and execution engineer.
Plan only what this exact source-grounded draft genuinely needs.
Zero media assets is a valid and often excellent result.
Every recommended asset must prove, demonstrate, clarify, compare, contextualize, navigate, or create a reusable resource.
Never copy asset names from examples or unrelated topics.
Never claim to have observed source visuals; this plan is engineered from source text, strategist context, and the final draft.
The human creates and captures all media. Return valid JSON only.`;

export async function runGenerateProductionBlueprint(payload: GenerateProductionBlueprintPayload) {
  const context = await getPipelineProductionContext(payload.pipelineId);
  if (context.blueprintState === "Ready" && !payload.force) {
    return { success: true, skipped: true, reason: "Blueprint already ready", pipelineId: payload.pipelineId };
  }
  await setBlueprintState(payload.pipelineId, "Generating");
  try {
    const sourceContext = await getSourceContext(context.idea.sourceIds);
    const raw = await generateJSONStrategist(
      buildProductionBlueprintPrompt({
        title: context.title,
        format: context.format,
        hook: context.idea.hook,
        draft: context.idea.draft,
        sourceContext,
        strategistContext: context.strategistContext,
        preflight: context.preflight,
      }),
      PRODUCTION_PLANNER_SYSTEM,
      0.25,
    );
    const blueprint = normalizeProductionBlueprint(raw, context.format);
    const saved = await saveProductionBlueprint(context, blueprint);
    return { success: true, pipelineId: payload.pipelineId, blueprint, saved };
  } catch (error) {
    const message = (error as Error).message || String(error);
    await markBlueprintFailed(payload.pipelineId, message);
    throw error;
  }
}

export const generateProductionBlueprint = task({
  id: "generate-production-blueprint",
  maxDuration: 900,
  retry: { maxAttempts: 2 },
  run: runGenerateProductionBlueprint,
});
