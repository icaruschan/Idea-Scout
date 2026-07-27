import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import { NOTION_DATA_SOURCE_IDS } from "../src/lib/constants";

dotenv.config({ override: true });
const notion = new Client({ auth: process.env.NOTION_API_KEY });

const required: Record<string, { id: string; properties: string[]; options?: Record<string, string[]> }> = {
  "Ideas Bank": {
    id: NOTION_DATA_SOURCE_IDS.IDEAS_BANK,
    properties: ["Source Strength", "Audience Fit", "Novelty", "Usefulness", "Voice Fit", "Hook Strength", "Timeliness", "Effort Fit", "Confidence Score", "Evaluation State", "Recommendation Date", "Daily Rank", "Recommendation Role", "Human Rating", "Taste Note", "Rejection Reason", "Pipeline Item", "Hook A", "Hook B", "Hook C", "Selected Hook", "Hook Psychology", "Production Complexity", "Estimated Production Minutes", "Preflight Asset Count", "Required Assets", "Preflight Asset Types", "Research Dependency", "Proof Dependency", "Editing Intensity", "Live Capture Required", "Production Blockers", "Preflight State", "Preflight Version"],
    options: { Status: ["📝 Drafted", "👀 Needs Review", "✅ Selected", "➡️ In Pipeline"] },
  },
  "Content Pipeline": {
    id: NOTION_DATA_SOURCE_IDS.CONTENT_PIPELINE,
    properties: ["Platform", "Tracker Item", "Based On", "Move to Tracker", "Posted URL", "Production Scope", "Applied Production Scope", "Blueprint State", "Blueprint Version", "Blueprint Generated At", "Blueprint Error", "Generate or Regenerate Blueprint", "Production Assets", "Production Readiness", "Asset Progress", "Required Asset Count", "Completed Asset Count", "Estimated Production Minutes", "Required Asset Types", "Production Blockers", "Blueprint Change Summary"],
  },
  "My Content Tracker": {
    id: NOTION_DATA_SOURCE_IDS.MY_CONTENT_TRACKER,
    properties: ["Origin Pipeline", "Origin Idea", "Metrics - Views", "Metrics - Likes", "Metrics - Replies", "Metrics - RTs", "Metrics - Bookmarks"],
    options: { Platform: ["X", "YouTube", "Instagram", "Newsletter"] },
  },
  "Taste Profiles": {
    id: NOTION_DATA_SOURCE_IDS.TASTE_PROFILES,
    properties: ["Profile", "Status", "Generated At", "Rated Ideas", "Tracked Posts", "Summary", "Profile JSON"],
  },
  "Production Assets": {
    id: NOTION_DATA_SOURCE_IDS.PRODUCTION_ASSETS,
    properties: ["Asset", "Asset Key", "Pipeline Item", "Origin Idea", "Asset Type", "Included In", "Active", "Blueprint Required", "Required", "Status", "Sort Order", "Purpose", "Claim Supported", "Why Needed", "Acquisition Method", "Tool or App", "Source Location", "Capture Timing", "Estimated Minutes", "Dependencies", "Placement", "Blocker", "Human Notes", "Needs Review", "Completed At", "Blueprint Version"],
    options: { Status: ["Not Started", "Ready to Capture", "In Progress", "Blocked", "Captured", "Edited", "Placed", "Complete", "Skipped"] },
  },
};

async function main() {
  let failures = 0;
  for (const [label, config] of Object.entries(required)) {
    try {
      const source: any = await notion.dataSources.retrieve({ data_source_id: config.id });
      const missing = config.properties.filter((name) => !source.properties?.[name]);
      const missingOptions = Object.entries(config.options || {}).flatMap(([propertyName, names]) => {
        const property = source.properties?.[propertyName];
        const actual = (property?.select?.options || property?.multi_select?.options || []).map((option: any) => option.name);
        return names.filter((name) => !actual.includes(name)).map((name) => `${propertyName}.${name}`);
      });
      if (missing.length > 0 || missingOptions.length > 0) {
        failures++;
        console.error(`${label}: missing ${[...missing, ...missingOptions].join(", ")}`);
      } else {
        console.log(`${label}: schema OK`);
      }
    } catch (error) {
      failures++;
      console.error(`${label}: access failed — ${(error as Error).message}`);
    }
  }
  if (failures > 0) throw new Error(`${failures} schema verification group(s) failed`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
