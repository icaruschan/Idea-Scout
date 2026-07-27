import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import { NOTION_DATABASE_IDS, NOTION_DATA_SOURCE_IDS } from "./constants";
import {
  getIdeaForEvaluation,
  getIdeaPlanningContext,
  preflightFromIdeaProperties,
  type IdeaEvaluationRecord,
} from "./idea-roadmap-notion";
import { markdownToNotionBlocks, type NotionBlock } from "./notion-markdown-blocks";
import {
  productionAssetMarkdown,
  productionBlueprintMarkdown,
  type AssetStatus,
  type ProductionAsset,
  type ProductionBlueprint,
  type ProductionPreflight,
  type ProductionReadiness,
  type ProductionScope,
} from "./production-blueprint";

dotenv.config({ override: true });
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function textValue(property: any): string {
  return (property?.rich_text || property?.title || [])
    .map((item: any) => item?.plain_text || item?.text?.content || "")
    .join("")
    .trim();
}

function selectValue(property: any): string {
  return property?.select?.name || property?.status?.name || "";
}

function multiSelectValue(property: any): string[] {
  return (property?.multi_select || []).map((item: any) => item.name).filter(Boolean);
}

function relationIds(property: any): string[] {
  return (property?.relation || []).map((item: any) => item.id).filter(Boolean);
}

function richText(content: string): any {
  return { rich_text: [{ type: "text", text: { content: String(content || "").slice(0, 2000) } }] };
}

function blockText(block: any): string {
  const content = block?.[block.type];
  return (content?.rich_text || []).map((item: any) => item.plain_text || "").join("");
}

async function listChildren(blockId: string): Promise<any[]> {
  const output: any[] = [];
  let cursor: string | undefined;
  do {
    const response: any = await notion.blocks.children.list({ block_id: blockId, page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) });
    output.push(...response.results);
    cursor = response.has_more ? response.next_cursor || undefined : undefined;
  } while (cursor);
  return output;
}

async function appendBlocks(pageId: string, blocks: NotionBlock[]): Promise<void> {
  for (let index = 0; index < blocks.length; index += 100) {
    await notion.blocks.children.append({ block_id: pageId, children: blocks.slice(index, index + 100) as any });
    if (index + 100 < blocks.length) await sleep(350);
  }
}

async function replaceNamedToggle(pageId: string, label: string, markdown: string): Promise<void> {
  for (const block of await listChildren(pageId)) {
    if (block.type === "toggle" && blockText(block).trim() === label) await notion.blocks.delete({ block_id: block.id });
  }
  const response: any = await notion.blocks.children.append({
    block_id: pageId,
    children: [{ object: "block", type: "toggle", toggle: { rich_text: [{ type: "text", text: { content: label } }] } }] as any,
  });
  const toggleId = response.results?.[0]?.id;
  if (toggleId) await appendBlocks(toggleId, markdownToNotionBlocks(markdown));
}

export interface PipelineProductionContext {
  pageId: string;
  title: string;
  format: IdeaEvaluationRecord["format"];
  scope: ProductionScope;
  appliedScope?: ProductionScope;
  blueprintState: string;
  idea: IdeaEvaluationRecord;
  preflight: ProductionPreflight;
  strategistContext: string;
}

export async function getPipelineProductionContext(pageId: string): Promise<PipelineProductionContext> {
  const page: any = await notion.pages.retrieve({ page_id: pageId });
  const properties = page.properties || {};
  const ideaId = relationIds(properties["Based On"])[0];
  if (!ideaId) throw new Error(`Pipeline item ${pageId} has no Based On idea relation.`);
  const idea = await getIdeaForEvaluation(ideaId);
  return {
    pageId,
    title: textValue(properties.Title) || idea.title,
    format: (selectValue(properties.Format) || idea.format) as IdeaEvaluationRecord["format"],
    scope: (selectValue(properties["Production Scope"]) || "Recommended") as ProductionScope,
    appliedScope: selectValue(properties["Applied Production Scope"]) as ProductionScope || undefined,
    blueprintState: selectValue(properties["Blueprint State"]),
    idea,
    preflight: preflightFromIdeaProperties(idea.properties),
    strategistContext: await getIdeaPlanningContext(ideaId),
  };
}

export async function setBlueprintState(pageId: string, state: "Pending" | "Generating" | "Ready" | "Failed" | "Stale", error = ""): Promise<void> {
  await notion.pages.update({
    page_id: pageId,
    properties: {
      "Blueprint State": { select: { name: state } },
      "Blueprint Error": richText(error),
    },
  });
}

interface ExistingAsset {
  pageId: string;
  key: string;
  name: string;
  type: string;
  purpose: string;
  whyNeeded: string;
  placement: string;
  status: AssetStatus;
  includedIn: ProductionScope[];
  blueprintRequired: boolean;
  active: boolean;
  required: boolean;
  blocker: string;
  sourceLocation: string;
  humanNotes: string;
  completedAt?: string;
  estimatedMinutes: number;
}

async function getExistingAssets(pipelineId: string): Promise<ExistingAsset[]> {
  const response: any = await notion.dataSources.query({
    data_source_id: NOTION_DATA_SOURCE_IDS.PRODUCTION_ASSETS,
    filter: { property: "Pipeline Item", relation: { contains: pipelineId } },
    page_size: 100,
  });
  return response.results.map((page: any) => {
    const p = page.properties || {};
    return {
      pageId: page.id,
      key: textValue(p["Asset Key"]),
      name: textValue(p.Asset),
      type: selectValue(p["Asset Type"]),
      purpose: textValue(p.Purpose),
      whyNeeded: textValue(p["Why Needed"]),
      placement: textValue(p.Placement),
      status: (selectValue(p.Status) || "Not Started") as AssetStatus,
      includedIn: multiSelectValue(p["Included In"]) as ProductionScope[],
      blueprintRequired: Boolean(p["Blueprint Required"]?.checkbox),
      active: Boolean(p.Active?.checkbox),
      required: Boolean(p.Required?.checkbox),
      blocker: textValue(p.Blocker),
      sourceLocation: textValue(p["Source Location"]),
      humanNotes: textValue(p["Human Notes"]),
      completedAt: p["Completed At"]?.date?.start || undefined,
      estimatedMinutes: p["Estimated Minutes"]?.number || 0,
    };
  });
}

function assetChanged(existing: ExistingAsset, asset: ProductionAsset): boolean {
  return existing.name !== asset.name || existing.type !== asset.type || existing.purpose !== asset.purpose || existing.whyNeeded !== asset.whyNeeded || existing.placement !== asset.placement;
}

function aiAssetProperties(asset: ProductionAsset, pipelineId: string, ideaId: string, scope: ProductionScope, order: number): Record<string, any> {
  const active = asset.includedIn.includes(scope);
  return {
    Asset: { title: [{ text: { content: asset.name.slice(0, 200) } }] },
    "Asset Key": richText(asset.key),
    "Pipeline Item": { relation: [{ id: pipelineId }] },
    "Origin Idea": { relation: [{ id: ideaId }] },
    "Asset Type": { select: { name: asset.type } },
    "Included In": { multi_select: asset.includedIn.map((name) => ({ name })) },
    Active: { checkbox: active },
    "Blueprint Required": { checkbox: asset.required },
    Required: { checkbox: active && asset.required },
    "Sort Order": { number: order },
    Purpose: richText(asset.purpose),
    "Claim Supported": richText(asset.claimSupported),
    "Why Needed": richText(asset.whyNeeded),
    "Acquisition Method": { select: { name: asset.acquisitionMethod } },
    "Tool or App": richText(asset.toolOrApp),
    "Capture Timing": { select: { name: asset.captureTiming } },
    "Estimated Minutes": { number: asset.estimatedMinutes },
    Placement: richText(asset.placement),
    "Blueprint Version": richText("v1"),
  };
}

export interface BlueprintSaveResult {
  added: number;
  updated: number;
  unchanged: number;
  deactivated: number;
  assetIds: string[];
}

export async function saveProductionBlueprint(context: PipelineProductionContext, blueprint: ProductionBlueprint): Promise<BlueprintSaveResult> {
  const existing = await getExistingAssets(context.pageId);
  const byKey = new Map(existing.map((asset) => [asset.key, asset]));
  const idsByKey = new Map<string, string>();
  let added = 0;
  let updated = 0;
  let unchanged = 0;

  for (let index = 0; index < blueprint.assets.length; index++) {
    const asset = blueprint.assets[index];
    const current = byKey.get(asset.key);
    const properties = aiAssetProperties(asset, context.pageId, context.idea.pageId, context.scope, index + 1);
    if (current) {
      const changed = assetChanged(current, asset);
      if (current.status === "Complete" && changed) properties["Needs Review"] = { checkbox: true };
      await notion.pages.update({ page_id: current.pageId, properties });
      await replaceNamedToggle(current.pageId, "🎬 Production Instructions", productionAssetMarkdown(asset));
      idsByKey.set(asset.key, current.pageId);
      changed ? updated++ : unchanged++;
    } else {
      const response: any = await notion.pages.create({
        parent: { database_id: NOTION_DATABASE_IDS.PRODUCTION_ASSETS },
        properties: { ...properties, Status: { select: { name: "Not Started" } }, "Source Location": richText(asset.sourceLocation) },
      });
      await replaceNamedToggle(response.id, "🎬 Production Instructions", productionAssetMarkdown(asset));
      idsByKey.set(asset.key, response.id);
      added++;
    }
    await sleep(350);
  }

  for (const asset of blueprint.assets) {
    const pageId = idsByKey.get(asset.key);
    if (!pageId) continue;
    const dependencies = asset.dependencies.map((key) => idsByKey.get(key)).filter(Boolean).map((id) => ({ id: id! }));
    await notion.pages.update({ page_id: pageId, properties: { Dependencies: { relation: dependencies } } });
    await sleep(350);
  }

  let deactivated = 0;
  const currentKeys = new Set(blueprint.assets.map((asset) => asset.key));
  for (const old of existing) {
    if (currentKeys.has(old.key)) continue;
    await notion.pages.update({ page_id: old.pageId, properties: { Active: { checkbox: false }, Required: { checkbox: false } } });
    idsByKey.set(old.key, old.pageId);
    deactivated++;
  }

  const activeAssets = blueprint.assets.filter((asset) => asset.includedIn.includes(context.scope));
  const requiredAssets = activeAssets.filter((asset) => asset.required);
  const changeSummary = `Added ${added}; updated ${updated}; unchanged ${unchanged}; deactivated ${deactivated}. Human statuses, notes, resource locations, blockers, and completion history were preserved.`;
  await replaceNamedToggle(context.pageId, "🎬 Content Production Blueprint", productionBlueprintMarkdown(blueprint));
  await notion.pages.update({
    page_id: context.pageId,
    properties: {
      "Blueprint State": { select: { name: "Ready" } },
      "Blueprint Version": richText(blueprint.version),
      "Blueprint Generated At": { date: { start: new Date().toISOString() } },
      "Blueprint Error": richText(""),
      "Generate or Regenerate Blueprint": { checkbox: false },
      "Applied Production Scope": { select: { name: context.scope } },
      "Production Assets": { relation: [...idsByKey.values()].map((id) => ({ id })) },
      "Required Asset Count": { number: requiredAssets.length },
      "Completed Asset Count": { number: 0 },
      "Asset Progress": { number: requiredAssets.length === 0 ? 100 : 0 },
      "Estimated Production Minutes": { number: requiredAssets.reduce((sum, asset) => sum + asset.estimatedMinutes, 0) },
      "Required Asset Types": { multi_select: [...new Set(requiredAssets.map((asset) => asset.type))].map((name) => ({ name })) },
      "Production Blockers": richText(blueprint.blockers.join("\n")),
      "Blueprint Change Summary": richText(changeSummary),
      "Production Readiness": { select: { name: requiredAssets.length === 0 && blueprint.blockers.length === 0 ? "Ready for Review" : "Not Started" } },
    },
  });
  await syncOneProductionReadiness(context.pageId);
  return { added, updated, unchanged, deactivated, assetIds: [...idsByKey.values()] };
}

export async function markBlueprintFailed(pageId: string, error: string): Promise<void> {
  await notion.pages.update({
    page_id: pageId,
    properties: {
      "Blueprint State": { select: { name: "Failed" } },
      "Blueprint Error": richText(error),
      "Generate or Regenerate Blueprint": { checkbox: false },
    },
  });
}

function calculateReadiness(assets: ExistingAsset[], blueprintReady: boolean): { readiness: ProductionReadiness; required: number; completed: number; progress: number; blockers: string[] } {
  const required = assets.filter((asset) => asset.active && asset.required);
  const completed = required.filter((asset) => asset.status === "Complete");
  const blocked = required.filter((asset) => asset.status === "Blocked" || asset.status === "Skipped");
  const blockers = blocked.map((asset) => asset.blocker || `${asset.name} is ${asset.status}.`);
  let readiness: ProductionReadiness = "Not Started";
  if (blocked.length) readiness = "Blocked";
  else if (blueprintReady && required.length === completed.length) readiness = "Ready for Review";
  else if (required.some((asset) => asset.status !== "Not Started" && asset.status !== "Ready to Capture")) readiness = "In Progress";
  return { readiness, required: required.length, completed: completed.length, progress: required.length === 0 ? (blueprintReady ? 100 : 0) : Math.round((completed.length / required.length) * 100), blockers };
}

export async function syncOneProductionReadiness(pipelineId: string): Promise<void> {
  const page: any = await notion.pages.retrieve({ page_id: pipelineId });
  const p = page.properties || {};
  const scope = (selectValue(p["Production Scope"]) || "Recommended") as ProductionScope;
  const appliedScope = selectValue(p["Applied Production Scope"]);
  let assets = await getExistingAssets(pipelineId);
  if (scope !== appliedScope) {
    for (const asset of assets) {
      const active = asset.includedIn.includes(scope);
      await notion.pages.update({
        page_id: asset.pageId,
        properties: { Active: { checkbox: active }, Required: { checkbox: active && asset.blueprintRequired } },
      });
      await sleep(350);
    }
    assets = await getExistingAssets(pipelineId);
  }
  for (const asset of assets) {
    if (asset.status === "Complete" && !asset.completedAt) {
      await notion.pages.update({ page_id: asset.pageId, properties: { "Completed At": { date: { start: new Date().toISOString() } } } });
    }
  }
  const result = calculateReadiness(assets, selectValue(p["Blueprint State"]) === "Ready");
  const activeRequired = assets.filter((asset) => asset.active && asset.required);
  await notion.pages.update({
    page_id: pipelineId,
    properties: {
      "Applied Production Scope": { select: { name: scope } },
      "Production Readiness": { select: { name: result.readiness } },
      "Required Asset Count": { number: result.required },
      "Completed Asset Count": { number: result.completed },
      "Asset Progress": { number: result.progress },
      "Estimated Production Minutes": { number: activeRequired.reduce((sum, asset) => sum + asset.estimatedMinutes, 0) },
      "Production Blockers": richText(result.blockers.join("\n")),
    },
  });
}

export async function getProductionSyncCandidates(): Promise<Array<{ pageId: string; regenerate: boolean; blueprintState: string }>> {
  const response: any = await notion.dataSources.query({ data_source_id: NOTION_DATA_SOURCE_IDS.CONTENT_PIPELINE, page_size: 100 });
  return response.results.map((page: any) => ({
    pageId: page.id,
    regenerate: Boolean(page.properties?.["Generate or Regenerate Blueprint"]?.checkbox),
    blueprintState: selectValue(page.properties?.["Blueprint State"]),
  })).filter((item: any) => item.regenerate || item.blueprintState === "Ready");
}

export async function claimRegeneration(pageId: string): Promise<void> {
  await notion.pages.update({
    page_id: pageId,
    properties: {
      "Generate or Regenerate Blueprint": { checkbox: false },
      "Blueprint State": { select: { name: "Pending" } },
    },
  });
}
