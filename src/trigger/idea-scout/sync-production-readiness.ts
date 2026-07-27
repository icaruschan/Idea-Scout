import { schedules, tasks } from "@trigger.dev/sdk/v3";
import {
  claimRegeneration,
  getProductionSyncCandidates,
  syncOneProductionReadiness,
} from "../../lib/production-notion";

export const syncProductionReadiness = schedules.task({
  id: "sync-production-readiness",
  cron: { pattern: "*/15 * * * *", timezone: "Africa/Lagos", environments: ["PRODUCTION"] },
  maxDuration: 900,
  retry: { maxAttempts: 2 },
  run: async () => {
    const candidates = await getProductionSyncCandidates();
    const synced: string[] = [];
    const regenerated: string[] = [];
    const failed: Array<{ pipelineId: string; error: string }> = [];
    for (const item of candidates) {
      try {
        if (item.regenerate) {
          await claimRegeneration(item.pageId);
          await tasks.trigger("generate-production-blueprint", { pipelineId: item.pageId, force: true });
          regenerated.push(item.pageId);
        } else {
          await syncOneProductionReadiness(item.pageId);
          synced.push(item.pageId);
        }
      } catch (error) {
        failed.push({ pipelineId: item.pageId, error: (error as Error).message });
      }
    }
    return { synced, regenerated, failed };
  },
});
