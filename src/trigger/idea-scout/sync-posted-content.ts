import { schedules } from "@trigger.dev/sdk/v3";
import { getPostedPipelineItems, syncPipelineItemToTracker } from "../../lib/idea-roadmap-notion";

export const syncPostedContent = schedules.task({
  id: "sync-posted-content-to-tracker",
  cron: { pattern: "5 * * * *", timezone: "Africa/Lagos", environments: ["PRODUCTION"] },
  maxDuration: 600,
  retry: { maxAttempts: 2 },
  run: async () => {
    const posted = await getPostedPipelineItems(20);
    const synced: Array<{ pipelineId: string; trackerId: string }> = [];
    const failed: Array<{ pipelineId: string; error: string }> = [];
    for (const item of posted) {
      try {
        const trackerId = await syncPipelineItemToTracker(item);
        synced.push({ pipelineId: item.pageId, trackerId });
      } catch (error) {
        failed.push({ pipelineId: item.pageId, error: (error as Error).message });
      }
    }
    return { synced, failed };
  },
});
