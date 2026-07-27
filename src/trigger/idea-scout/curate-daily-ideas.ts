import { schedules } from "@trigger.dev/sdk/v3";
import { curateDailyIdeas, recommendationDate } from "../../lib/idea-curation";
import { getCurationCandidates, saveDailyRecommendations } from "../../lib/idea-roadmap-notion";

export const curateDailyIdeaTask = schedules.task({
  id: "curate-daily-ideas",
  cron: { pattern: "0 7 * * *", timezone: "Africa/Lagos", environments: ["PRODUCTION"] },
  maxDuration: 300,
  run: async () => {
    const candidates = await getCurationCandidates();
    const selected = curateDailyIdeas(candidates);
    const date = recommendationDate();
    await saveDailyRecommendations(selected, date);
    return {
      date,
      candidateCount: candidates.length,
      selected: selected.map((item) => ({ id: item.pageId, rank: item.rank, role: item.role, title: item.title })),
    };
  },
});
