import { task } from "@trigger.dev/sdk/v3";
import { getProductionPreflightBackfillCandidates, setEvaluationState } from "../../lib/idea-roadmap-notion";
import { evaluateDraft } from "./evaluate-draft";

export const backfillProductionPreflights = task({
  id: "backfill-production-preflights",
  maxDuration: 900,
  retry: { maxAttempts: 2 },
  run: async (payload: { batchSize?: number } = {}) => {
    const batchSize = Math.min(10, Math.max(1, payload.batchSize || 10));
    const ids = await getProductionPreflightBackfillCandidates(batchSize);
    for (const notionIdeaId of ids) await setEvaluationState(notionIdeaId, "Pending");
    const batch = ids.length
      ? await evaluateDraft.batchTriggerAndWait(ids.map((notionIdeaId) => ({ payload: { notionIdeaId }, options: { idempotencyKey: `production-preflight-v1-${notionIdeaId}` } })))
      : { runs: [] };
    return {
      dispatched: ids.length,
      completed: batch.runs.filter((run) => run.ok).length,
      failed: batch.runs.filter((run) => !run.ok).length,
      ideaIds: ids,
      remainingRequiresAnotherRun: ids.length === batchSize,
    };
  },
});
