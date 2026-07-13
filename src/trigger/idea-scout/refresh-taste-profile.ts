import { schedules } from "@trigger.dev/sdk/v3";
import { generateJSONStrategist } from "../../lib/llm";
import { getTasteSignals, getTrackedPerformance, saveTasteProfile } from "../../lib/idea-roadmap-notion";

const TASTE_SYSTEM = `You maintain a conservative creator taste profile.
Infer preferences only from repeated evidence. Separate explicit human taste from performance observations.
Never claim a pattern from one example. Return concise valid JSON only.`;

export const refreshTasteProfile = schedules.task({
  id: "refresh-taste-profile",
  cron: { pattern: "0 8 * * 0", timezone: "Africa/Lagos", environments: ["PRODUCTION"] },
  maxDuration: 600,
  retry: { maxAttempts: 2 },
  run: async () => {
    const [signals, tracked] = await Promise.all([getTasteSignals(), getTrackedPerformance()]);
    if (signals.length < 10) {
      return { created: false, reason: "At least 10 human-rated ideas are required", ratedIdeas: signals.length };
    }
    const completePerformance = tracked.filter((post) => post.views > 0);
    const raw = await generateJSONStrategist(
      `HUMAN-RATED IDEAS (${signals.length}):\n${JSON.stringify(signals, null, 2)}\n\nTRACKED PERFORMANCE (${completePerformance.length} complete):\n${JSON.stringify(completePerformance, null, 2)}\n\nPerformance may be descriptive at 10 complete posts but must not recommend score-weight changes until 20.\n\nReturn JSON: {"summary":"...","preferredHooks":"...","rejectedPatterns":"...","voiceNotes":"...","formatPreferences":"...","promptGuidance":["..."]}`,
      TASTE_SYSTEM,
      0.25,
    );
    const profileJson = JSON.stringify(raw);
    const pageId = await saveTasteProfile({
      summary: String(raw.summary || "Taste profile generated from human ratings."),
      preferredHooks: String(raw.preferredHooks || "Insufficient repeated hook evidence."),
      rejectedPatterns: String(raw.rejectedPatterns || "Insufficient repeated rejection evidence."),
      voiceNotes: String(raw.voiceNotes || "Preserve the existing Voice DNA."),
      formatPreferences: String(raw.formatPreferences || "No strong format preference yet."),
      profileJson,
      ratedIdeas: signals.length,
      trackedPosts: completePerformance.length,
    });
    return { created: true, pageId, ratedIdeas: signals.length, trackedPosts: completePerformance.length };
  },
});
