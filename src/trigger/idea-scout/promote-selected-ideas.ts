import { schedules } from "@trigger.dev/sdk/v3";
import { getSelectedIdeas, promoteIdeaToPipeline } from "../../lib/idea-roadmap-notion";

export const promoteSelectedIdeas = schedules.task({
  id: "promote-selected-ideas",
  cron: { pattern: "*/15 * * * *", timezone: "Africa/Lagos", environments: ["PRODUCTION"] },
  maxDuration: 600,
  retry: { maxAttempts: 2 },
  run: async () => {
    const selected = await getSelectedIdeas(10);
    const promoted: Array<{ ideaId: string; pipelineId: string }> = [];
    const failed: Array<{ ideaId: string; error: string }> = [];
    for (const idea of selected) {
      try {
        const pipelineId = await promoteIdeaToPipeline(idea);
        promoted.push({ ideaId: idea.pageId, pipelineId });
      } catch (error) {
        failed.push({ ideaId: idea.pageId, error: (error as Error).message });
      }
    }
    return { promoted, failed };
  },
});
