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
};

const pipelineProperties: PropertyMap = {
  Platform: select(["X", "YouTube", "Instagram", "Newsletter"]),
  "Tracker Item": relation(NOTION_DATA_SOURCE_IDS.MY_CONTENT_TRACKER),
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
