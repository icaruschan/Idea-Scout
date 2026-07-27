import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import { CONTENT_PILLARS, NOTION_DATA_SOURCE_IDS } from "../src/lib/constants";

dotenv.config({ override: true });
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const dryRun = process.argv.includes("--dry-run");

type PropertyMap = Record<string, any>;

const number = () => ({ type: "number", number: { format: "number" } });
const text = () => ({ type: "rich_text", rich_text: {} });
const date = () => ({ type: "date", date: {} });
const checkbox = () => ({ type: "checkbox", checkbox: {} });
const select = (names: string[]) => ({
  type: "select",
  select: { options: names.map((name) => ({ name })) },
});
const multiSelect = (names: string[]) => ({
  type: "multi_select",
  multi_select: { options: names.map((name) => ({ name })) },
});
const relation = (dataSourceId: string) => ({
  type: "relation",
  relation: { data_source_id: dataSourceId, type: "single_property", single_property: {} },
});

const ideaProperties: PropertyMap = {
  "Source Strength": number(),
  "Audience Fit": number(),
  Novelty: number(),
  Usefulness: number(),
  "Voice Fit": number(),
  "Hook Strength": number(),
  Timeliness: number(),
  "Effort Fit": number(),
  "Confidence Score": number(),
  "Evaluation State": select(["Pending", "Scored", "Failed", "Skipped"]),
  "Evaluation Version": text(),
  "Evaluated At": date(),
  "Critical Flags": text(),
  "Improvement Notes": text(),
  "Recommendation Reason": text(),
  "Shelf Life": select(["24h", "3d", "7d", "30d", "Evergreen"]),
  "Expires At": date(),
  "Recommendation Date": date(),
  "Daily Rank": number(),
  "Recommendation Role": select(["Best Overall", "Quick Win", "Bold Bet"]),
  "Human Rating": select(["🔥 Fire", "✅ Usable", "😐 Mid", "❌ Not Me", "🧠 Good Idea / Weak Draft", "🗑️ Reject"]),
  "Taste Note": text(),
  "Rejection Reason": select(["Too generic", "Weak source", "Repeated angle", "Does not sound like me", "Too polished", "Too much hype", "Missing proof", "Wrong audience", "Wrong pillar", "Too much effort", "Trend expired", "Good idea / weak execution", "Not aligned with current goals"]),
  "Pipeline Item": relation(NOTION_DATA_SOURCE_IDS.CONTENT_PIPELINE),
  "Hook A": text(),
  "Hook B": text(),
  "Hook C": text(),
  "Selected Hook": text(),
  "Hook Psychology": multiSelect(["Mistake", "Contrarian", "Proof", "How-to", "Comparison", "Tool stack", "Warning", "Personal story", "Resource drop", "Curiosity gap", "Status shift"]),
  "Production Complexity": select(["Low", "Medium", "High"]),
  "Estimated Production Minutes": number(),
  "Preflight Asset Count": number(),
  "Required Assets": text(),
  "Preflight Asset Types": multiSelect(["Screenshot", "Screen recording", "Photograph", "Generated image", "Before-and-after comparison", "Diagram", "Chart", "Table", "Document", "Quote or citation", "B-roll", "Audio", "Downloadable resource", "External reference", "Other"]),
  "Research Dependency": select(["None", "Low", "Medium", "High"]),
  "Proof Dependency": select(["None", "Low", "Medium", "High"]),
  "Editing Intensity": select(["None", "Low", "Medium", "High"]),
  "Live Capture Required": checkbox(),
  "Production Blockers": text(),
  "Preflight State": select(["Complete", "Incomplete"]),
  "Preflight Version": text(),
};

const pipelineProperties: PropertyMap = {
  Platform: select(["X", "YouTube", "Instagram", "Newsletter"]),
  "Tracker Item": relation(NOTION_DATA_SOURCE_IDS.MY_CONTENT_TRACKER),
  "Production Scope": select(["Minimum", "Recommended", "Premium"]),
  "Applied Production Scope": select(["Minimum", "Recommended", "Premium"]),
  "Blueprint State": select(["Pending", "Generating", "Ready", "Failed", "Stale"]),
  "Blueprint Version": text(),
  "Blueprint Generated At": date(),
  "Blueprint Error": text(),
  "Generate or Regenerate Blueprint": checkbox(),
  "Production Assets": relation(NOTION_DATA_SOURCE_IDS.PRODUCTION_ASSETS),
  "Production Readiness": select(["Not Started", "In Progress", "Blocked", "Ready for Review"]),
  "Asset Progress": number(),
  "Required Asset Count": number(),
  "Completed Asset Count": number(),
  "Estimated Production Minutes": number(),
  "Required Asset Types": multiSelect(["Screenshot", "Screen recording", "Photograph", "Generated image", "Before-and-after comparison", "Diagram", "Chart", "Table", "Document", "Quote or citation", "B-roll", "Audio", "Downloadable resource", "External reference", "Other"]),
  "Production Blockers": text(),
  "Blueprint Change Summary": text(),
};

const productionAssetProperties: PropertyMap = {
  "Asset Key": text(),
  "Pipeline Item": relation(NOTION_DATA_SOURCE_IDS.CONTENT_PIPELINE),
  "Origin Idea": relation(NOTION_DATA_SOURCE_IDS.IDEAS_BANK),
  "Asset Type": select(["Screenshot", "Screen recording", "Photograph", "Generated image", "Before-and-after comparison", "Diagram", "Chart", "Table", "Document", "Quote or citation", "B-roll", "Audio", "Downloadable resource", "External reference", "Other"]),
  "Included In": multiSelect(["Minimum", "Recommended", "Premium"]),
  Active: checkbox(),
  "Blueprint Required": checkbox(),
  Required: checkbox(),
  Status: select(["Not Started", "Ready to Capture", "In Progress", "Blocked", "Captured", "Edited", "Placed", "Complete", "Skipped"]),
  "Sort Order": number(),
  Purpose: text(),
  "Claim Supported": text(),
  "Why Needed": text(),
  "Acquisition Method": select(["Capture existing material", "Record live process", "Generate with AI", "Design from assets", "Download or source", "Recreate demonstration", "Reuse media library", "No media creation"]),
  "Tool or App": text(),
  "Source Location": text(),
  "Capture Timing": select(["Before process", "During process", "After result", "Anytime", "Not applicable"]),
  "Estimated Minutes": number(),
  Dependencies: relation(NOTION_DATA_SOURCE_IDS.PRODUCTION_ASSETS),
  Placement: text(),
  Blocker: text(),
  "Human Notes": text(),
  "Needs Review": checkbox(),
  "Completed At": date(),
  "Blueprint Version": text(),
};

const trackerProperties: PropertyMap = {
  "Origin Pipeline": relation(NOTION_DATA_SOURCE_IDS.CONTENT_PIPELINE),
  "Origin Idea": relation(NOTION_DATA_SOURCE_IDS.IDEAS_BANK),
};

async function retrieve(dataSourceId: string): Promise<any> {
  return notion.dataSources.retrieve({ data_source_id: dataSourceId });
}

function optionNames(property: any): string[] {
  return (property?.select?.options || property?.multi_select?.options || []).map((option: any) => option.name);
}

function mergedOptionProperty(property: any, names: string[], kind: "select" | "multi_select"): any {
  const merged = [...new Set([...optionNames(property), ...names])];
  return kind === "select" ? select(merged) : multiSelect(merged);
}

async function ensureProperties(label: string, dataSourceId: string, desired: PropertyMap): Promise<void> {
  const current = await retrieve(dataSourceId);
  const missing: PropertyMap = {};
  for (const [name, definition] of Object.entries(desired)) {
    if (!current.properties?.[name]) missing[name] = definition;
  }
  if (Object.keys(missing).length === 0) {
    console.log(`${label}: all roadmap properties already exist`);
    return;
  }
  console.log(`${label}: adding ${Object.keys(missing).join(", ")}`);
  if (!dryRun) {
    await notion.dataSources.update({ data_source_id: dataSourceId, properties: missing as any });
  }
}

async function mergeOptions(
  label: string,
  dataSourceId: string,
  propertyName: string,
  names: string[],
  kind: "select" | "multi_select",
): Promise<void> {
  const current = await retrieve(dataSourceId);
  const property = current.properties?.[propertyName];
  if (!property) throw new Error(`${label}.${propertyName} does not exist`);
  const missing = names.filter((name) => !optionNames(property).includes(name));
  if (missing.length === 0) return;
  console.log(`${label}.${propertyName}: adding options ${missing.join(", ")}`);
  if (!dryRun) {
    await notion.dataSources.update({
      data_source_id: dataSourceId,
      properties: { [propertyName]: mergedOptionProperty(property, names, kind) } as any,
    });
  }
}

async function main() {
  console.log(`Idea Scout roadmap migration (${dryRun ? "dry run" : "apply"})`);
  await ensureProperties("Ideas Bank", NOTION_DATA_SOURCE_IDS.IDEAS_BANK, ideaProperties);
  await mergeOptions("Ideas Bank", NOTION_DATA_SOURCE_IDS.IDEAS_BANK, "Status", ["👀 Needs Review", "✅ Selected", "➡️ In Pipeline"], "select");
  await ensureProperties("Content Pipeline", NOTION_DATA_SOURCE_IDS.CONTENT_PIPELINE, pipelineProperties);
  await ensureProperties("Production Assets", NOTION_DATA_SOURCE_IDS.PRODUCTION_ASSETS, productionAssetProperties);
  await ensureProperties("My Content Tracker", NOTION_DATA_SOURCE_IDS.MY_CONTENT_TRACKER, trackerProperties);
  await mergeOptions("My Content Tracker", NOTION_DATA_SOURCE_IDS.MY_CONTENT_TRACKER, "Platform", ["Instagram"], "select");
  await mergeOptions("Content Pipeline", NOTION_DATA_SOURCE_IDS.CONTENT_PIPELINE, "Category", CONTENT_PILLARS, "multi_select");
  await mergeOptions("My Content Tracker", NOTION_DATA_SOURCE_IDS.MY_CONTENT_TRACKER, "Category", CONTENT_PILLARS, "multi_select");
  console.log(dryRun ? "Dry run complete; no schema changes were made." : "Migration complete.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
