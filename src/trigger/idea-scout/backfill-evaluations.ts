import { task } from "@trigger.dev/sdk/v3";
import { getBackfillCandidates, setEvaluationState } from "../../lib/idea-roadmap-notion";
import { evaluateDraft } from "./evaluate-draft";

export const backfillEvaluations = task({
  id: "backfill-idea-evaluations",
  maxDuration: 600,
  retry: { maxAttempts: 2 },
  run: async (payload: { batchSize?: number; days?: number } = {}) => {
    const batchSize = Math.min(10, Math.max(1, payload.batchSize || 10));
    const ids = await getBackfillCandidates(batchSize, payload.days || 30);
    const dispatched: string[] = [];
    for (const notionIdeaId of ids) {
      await setEvaluationState(notionIdeaId, "Pending");
      dispatched.push(notionIdeaId);
    }
    const batch = ids.length > 0
      ? await evaluateDraft.batchTriggerAndWait(ids.map((notionIdeaId) => ({
          payload: { notionIdeaId },
          options: { idempotencyKey: `evaluate-backfill-${notionIdeaId}` },
        })))
      : { runs: [] };
    const completed = batch.runs.filter((run) => run.ok).length;
    const failed = batch.runs.length - completed;
    return {
      dispatched: dispatched.length,
      completed,
      failed,
      ideaIds: dispatched,
      remainingRequiresAnotherRun: ids.length === batchSize,
    };
  },
});
