import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import { CONTENT_PILLARS, NOTION_DATABASE_IDS, NOTION_DATA_SOURCE_IDS } from "./constants";
import type { IdeaEvaluation, EvaluationState, RecommendationRole } from "./idea-evaluation";
import { derivePriority } from "./idea-evaluation";
import type { CurationCandidate, CuratedIdea } from "./idea-curation";
import type { ContentFormat, ExecutionPlan } from "./voice-dna";
import { markdownToNotionBlocks, type NotionBlock } from "./notion-markdown-blocks";
import {
  productionPreflightMarkdown,
  type ProductionPreflight,
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
  return { rich_text: [{ type: "text", text: { content: content.slice(0, 2000) } }] };
}

function blockText(block: any): string {
  const content = block?.[block.type];
  return (content?.rich_text || []).map((item: any) => item.plain_text || "").join("");
}

async function listChildren(blockId: string): Promise<any[]> {
  const output: any[] = [];
  let cursor: string | undefined;
  do {
    const response: any = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    output.push(...response.results);
    cursor = response.has_more ? response.next_cursor || undefined : undefined;
  } while (cursor);
  return output;
}

async function collectBlockText(blockId: string, depth = 0): Promise<string> {
  if (depth > 4) return "";
  const blocks = await listChildren(blockId);
  const parts: string[] = [];
  for (const block of blocks) {
    const text = blockText(block);
    if (text) parts.push(text);
    if (block.has_children) {
      const child = await collectBlockText(block.id, depth + 1);
      if (child) parts.push(child);
    }
  }
  return parts.join("\n").trim();
}

async function extractDraftFromPage(pageId: string): Promise<string> {
  const blocks = await listChildren(pageId);
  let best = "";
  for (const block of blocks) {
    const label = blockText(block);
    if (block.type === "toggle" && /draft/i.test(label) && block.has_children) {
      const body = await collectBlockText(block.id, 1);
      if (body.length > best.length) best = body;
    }
  }
  return best;
}

async function appendBlocks(pageId: string, blocks: NotionBlock[]): Promise<void> {
  for (let index = 0; index < blocks.length; index += 100) {
    await notion.blocks.children.append({
      block_id: pageId,
      children: blocks.slice(index, index + 100) as any,
    });
    if (index + 100 < blocks.length) await sleep(350);
  }
}

async function replaceNamedToggle(pageId: string, label: string, markdown: string): Promise<void> {
  const blocks = await listChildren(pageId);
  for (const block of blocks) {
    if (block.type === "toggle" && blockText(block).trim() === label) {
      await notion.blocks.delete({ block_id: block.id });
    }
  }
  const response: any = await notion.blocks.children.append({
    block_id: pageId,
    children: [{
      object: "block",
      type: "toggle",
      toggle: { rich_text: [{ type: "text", text: { content: label } }] },
    }] as any,
  });
  const toggleId = response.results?.[0]?.id;
  if (toggleId) await appendBlocks(toggleId, markdownToNotionBlocks(markdown));
}

export interface IdeaEvaluationRecord {
  pageId: string;
  title: string;
  category: string[];
  format: ContentFormat;
  hook: string;
  draft: string;
  sourceIds: string[];
  libraryIds: string[];
  variationSet: string;
  createdTime: string;
  properties: Record<string, any>;
}

export async function getIdeaForEvaluation(pageId: string): Promise<IdeaEvaluationRecord> {
  const page: any = await notion.pages.retrieve({ page_id: pageId });
  const properties = page.properties || {};
  const preview = textValue(properties["Draft Tweet"]);
  const fullDraft = await extractDraftFromPage(pageId);
  return {
    pageId,
    title: textValue(properties.Idea) || "Untitled idea",
    category: multiSelectValue(properties.Category),
    format: (selectValue(properties["Format Idea"]) || "Mid-length") as ContentFormat,
    hook: textValue(properties["Selected Hook"]) || textValue(properties["Hook Angle"]),
    draft: fullDraft || preview,
    sourceIds: relationIds(properties["Inspired By (Scouted)"]),
    libraryIds: relationIds(properties["Inspired By (Library)"]),
    variationSet: textValue(properties["Variation Set"]),
    createdTime: page.created_time || "",
    properties,
  };
}

export async function getSourceContext(sourceIds: string[]): Promise<string> {
  const parts: string[] = [];
  for (const sourceId of sourceIds.slice(0, 3)) {
    try {
      const page: any = await notion.pages.retrieve({ page_id: sourceId });
      const p = page.properties || {};
      parts.push([
        `Title: ${textValue(p.Title)}`,
        `Summary: ${textValue(p["AI Summary"])}`,
        `Takeaways: ${textValue(p["Key Takeaways"])}`,
        await collectBlockText(sourceId),
      ].filter(Boolean).join("\n"));
    } catch (error) {
      console.warn(`Could not load scouted source ${sourceId}:`, (error as Error).message);
    }
  }
  return parts.join("\n\n---\n\n").slice(0, 30000);
}

export async function getRecentIdeasForComparison(days = 30): Promise<Array<{ id: string; title: string; angle: string }>> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);
  const response: any = await notion.dataSources.query({
    data_source_id: NOTION_DATA_SOURCE_IDS.IDEAS_BANK,
    filter: { timestamp: "created_time", created_time: { on_or_after: since.toISOString() } },
    sorts: [{ timestamp: "created_time", direction: "descending" }],
    page_size: 100,
  });
  return response.results.map((page: any) => ({
    id: page.id,
    title: textValue(page.properties?.Idea),
    angle: textValue(page.properties?.["Hook Angle"]),
  })).filter((item: any) => item.title);
}

export async function setEvaluationState(pageId: string, state: EvaluationState): Promise<void> {
  await notion.pages.update({
    page_id: pageId,
    properties: { "Evaluation State": { select: { name: state } } },
  });
}

export async function saveIdeaEvaluation(pageId: string, evaluation: IdeaEvaluation): Promise<void> {
  const s = evaluation.scores;
  const status = evaluation.criticalFlags.length > 0 || evaluation.confidenceScore < 6.5
    ? "👀 Needs Review"
    : "📝 Drafted";
  const properties: Record<string, any> = {
    "Source Strength": { number: s.sourceStrength },
    "Audience Fit": { number: s.audienceFit },
    Novelty: { number: s.novelty },
    Usefulness: { number: s.usefulness },
    "Voice Fit": { number: s.voiceFit },
    "Hook Strength": { number: s.hookStrength },
    Timeliness: { number: s.timeliness },
    "Effort Fit": { number: s.effortFit },
    "Confidence Score": { number: evaluation.confidenceScore },
    "Evaluation State": { select: { name: evaluation.evaluationState } },
    "Evaluation Version": richText(evaluation.evaluationVersion),
    "Evaluated At": { date: { start: new Date().toISOString() } },
    "Critical Flags": richText(evaluation.criticalFlags.join(", ")),
    "Improvement Notes": richText(evaluation.improvementNotes.join("\n")),
    "Recommendation Reason": richText(evaluation.recommendationReason),
    "Shelf Life": { select: { name: evaluation.shelfLife } },
    Priority: { select: { name: derivePriority(evaluation.confidenceScore) } },
    Status: { select: { name: status } },
    "Production Complexity": { select: { name: evaluation.productionPreflight.complexity } },
    "Estimated Production Minutes": { number: evaluation.productionPreflight.estimatedProductionMinutes },
    "Preflight Asset Count": { number: evaluation.productionPreflight.requiredAssetCount },
    "Required Assets": richText(evaluation.productionPreflight.requiredAssets.map((asset, index) => `${index + 1}. ${asset.name}`).join("\n")),
    "Preflight Asset Types": { multi_select: [...new Set(evaluation.productionPreflight.requiredAssets.map((asset) => asset.type))].map((name) => ({ name })) },
    "Research Dependency": { select: { name: evaluation.productionPreflight.researchDependency } },
    "Proof Dependency": { select: { name: evaluation.productionPreflight.proofDependency } },
    "Editing Intensity": { select: { name: evaluation.productionPreflight.editingIntensity } },
    "Live Capture Required": { checkbox: evaluation.productionPreflight.liveCaptureRequired },
    "Production Blockers": richText(evaluation.productionPreflight.blockers.join("\n")),
    "Preflight State": { select: { name: evaluation.productionPreflight.state } },
    "Preflight Version": richText(evaluation.productionPreflight.version),
  };
  if (evaluation.expiresAt) properties["Expires At"] = { date: { start: evaluation.expiresAt } };
  await notion.pages.update({ page_id: pageId, properties });
  await replaceNamedToggle(pageId, "🏗️ Production Preflight", productionPreflightMarkdown(evaluation.productionPreflight));
}

export async function markEvaluationFailed(pageId: string, message: string): Promise<void> {
  await notion.pages.update({
    page_id: pageId,
    properties: {
      "Evaluation State": { select: { name: "Failed" } },
      "Improvement Notes": richText(`Evaluator failed: ${message}`),
    },
  });
}

export async function getBackfillCandidates(limit = 10, days = 30): Promise<string[]> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);
  const response: any = await notion.dataSources.query({
    data_source_id: NOTION_DATA_SOURCE_IDS.IDEAS_BANK,
    filter: {
      and: [
        { timestamp: "created_time", created_time: { on_or_after: since.toISOString() } },
        { property: "Status", select: { equals: "📝 Drafted" } },
      ],
    },
    sorts: [{ timestamp: "created_time", direction: "descending" }],
    page_size: 100,
  });
  return response.results
    .filter((page: any) => {
      const state = selectValue(page.properties?.["Evaluation State"]);
      return state !== "Scored" && state !== "Pending";
    })
    .slice(0, limit)
    .map((page: any) => page.id);
}

export async function getProductionPreflightBackfillCandidates(limit = 10): Promise<string[]> {
  const response: any = await notion.dataSources.query({
    data_source_id: NOTION_DATA_SOURCE_IDS.IDEAS_BANK,
    filter: { property: "Status", select: { equals: "📝 Drafted" } },
    sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
    page_size: 100,
  });
  return response.results
    .filter((page: any) => selectValue(page.properties?.["Preflight State"]) !== "Complete")
    .slice(0, limit)
    .map((page: any) => page.id);
}

export async function getCurationCandidates(): Promise<CurationCandidate[]> {
  const response: any = await notion.dataSources.query({
    data_source_id: NOTION_DATA_SOURCE_IDS.IDEAS_BANK,
    filter: {
      and: [
        { property: "Status", select: { equals: "📝 Drafted" } },
        { property: "Evaluation State", select: { equals: "Scored" } },
      ],
    },
    page_size: 100,
  });
  return response.results.map((page: any) => {
    const p = page.properties || {};
    return {
      pageId: page.id,
      title: textValue(p.Idea),
      category: multiSelectValue(p.Category),
      format: selectValue(p["Format Idea"]),
      variationSet: textValue(p["Variation Set"]),
      confidenceScore: p["Confidence Score"]?.number || 0,
      effortFit: p["Effort Fit"]?.number || 0,
      novelty: p.Novelty?.number || 0,
      hookStrength: p["Hook Strength"]?.number || 0,
      expiresAt: p["Expires At"]?.date?.start || undefined,
      recommendationDate: p["Recommendation Date"]?.date?.start || undefined,
      createdTime: page.created_time,
    };
  });
}

export async function saveDailyRecommendations(items: CuratedIdea[], date: string): Promise<void> {
  for (const item of items) {
    await notion.pages.update({
      page_id: item.pageId,
      properties: {
        "Recommendation Date": { date: { start: date } },
        "Daily Rank": { number: item.rank },
        "Recommendation Role": { select: { name: item.role } },
      },
    });
    await sleep(350);
  }
}

export interface SelectedIdeaRecord extends IdeaEvaluationRecord {
  pipelineIds: string[];
}

export async function getSelectedIdeas(limit = 10): Promise<SelectedIdeaRecord[]> {
  const response: any = await notion.dataSources.query({
    data_source_id: NOTION_DATA_SOURCE_IDS.IDEAS_BANK,
    filter: { property: "Status", select: { equals: "✅ Selected" } },
    page_size: limit,
  });
  const output: SelectedIdeaRecord[] = [];
  for (const page of response.results) {
    const idea = await getIdeaForEvaluation(page.id);
    output.push({ ...idea, pipelineIds: relationIds(page.properties?.["Pipeline Item"]) });
  }
  return output;
}

export async function promoteIdeaToPipeline(idea: SelectedIdeaRecord): Promise<string> {
  const existing: any = await notion.dataSources.query({
    data_source_id: NOTION_DATA_SOURCE_IDS.CONTENT_PIPELINE,
    filter: { property: "Based On", relation: { contains: idea.pageId } },
    page_size: 1,
  });
  let pipelineId = existing.results[0]?.id as string | undefined;
  if (!pipelineId) {
    const category = idea.category.filter((item) => CONTENT_PILLARS.includes(item));
    const response: any = await notion.pages.create({
      parent: { database_id: NOTION_DATABASE_IDS.CONTENT_PIPELINE },
      properties: {
        Title: { title: [{ text: { content: idea.title.slice(0, 200) } }] },
        Category: { multi_select: category.map((name) => ({ name })) },
        "Content Type": { select: { name: idea.libraryIds.length > 0 ? "30% Proven ✅" : "70% Experiment 🧪" } },
        Format: { select: { name: idea.format } },
        Platform: { select: { name: "X" } },
        Draft: richText(idea.draft),
        "Based On": { relation: [{ id: idea.pageId }] },
        Status: { select: { name: "📝 Drafting" } },
        "Production Scope": { select: { name: "Recommended" } },
        "Blueprint State": { select: { name: "Pending" } },
        "Production Readiness": { select: { name: "Not Started" } },
        "Asset Progress": { number: 0 },
        "Required Asset Count": { number: idea.properties?.["Preflight Asset Count"]?.number || 0 },
        "Completed Asset Count": { number: 0 },
        "Estimated Production Minutes": { number: idea.properties?.["Estimated Production Minutes"]?.number || 0 },
        "Required Asset Types": { multi_select: multiSelectValue(idea.properties?.["Preflight Asset Types"]).map((name) => ({ name })) },
        "Production Blockers": richText(textValue(idea.properties?.["Production Blockers"])),
      },
    });
    pipelineId = response.id;
    await appendBlocks(pipelineId!, markdownToNotionBlocks(`## Full Draft\n\n${idea.draft}`));
  }
  await notion.pages.update({
    page_id: idea.pageId,
    properties: {
      Status: { select: { name: "➡️ In Pipeline" } },
      "Pipeline Item": { relation: [{ id: pipelineId! }] },
    },
  });
  return pipelineId!;
}

export function preflightFromIdeaProperties(properties: Record<string, any>): ProductionPreflight {
  const requiredNames = textValue(properties["Required Assets"])
    .split("\n")
    .map((line) => line.replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean);
  const types = multiSelectValue(properties["Preflight Asset Types"]);
  return {
    state: selectValue(properties["Preflight State"]) === "Complete" ? "Complete" : "Incomplete",
    contentArchetype: "See strategist context",
    readerTransformation: "See strategist context and final draft",
    importantClaims: [],
    teachableUnits: [],
    processesToDemonstrate: [],
    evidenceRequirements: [],
    visualizationOpportunities: [],
    reusableResources: [],
    requiredAssets: requiredNames.map((name, index) => ({
      name,
      type: (types[index] || "Other") as any,
      purpose: "See full blueprint analysis",
      necessityReasons: ["supplies_context"],
    })),
    requiredAssetCount: properties["Preflight Asset Count"]?.number || requiredNames.length,
    estimatedProductionMinutes: properties["Estimated Production Minutes"]?.number || 0,
    complexity: (selectValue(properties["Production Complexity"]) || "Low") as any,
    researchDependency: (selectValue(properties["Research Dependency"]) || "None") as any,
    proofDependency: (selectValue(properties["Proof Dependency"]) || "None") as any,
    editingIntensity: (selectValue(properties["Editing Intensity"]) || "None") as any,
    liveCaptureRequired: Boolean(properties["Live Capture Required"]?.checkbox),
    blockers: textValue(properties["Production Blockers"]).split("\n").filter(Boolean),
    version: "v1",
  };
}

export async function getIdeaPlanningContext(pageId: string): Promise<string> {
  return collectBlockText(pageId);
}

export interface PostedPipelineRecord {
  pageId: string;
  title: string;
  category: string[];
  format: string;
  platform: string;
  draft: string;
  postedUrl: string;
  ideaIds: string[];
  trackerIds: string[];
}

export async function getPostedPipelineItems(limit = 20): Promise<PostedPipelineRecord[]> {
  const response: any = await notion.dataSources.query({
    data_source_id: NOTION_DATA_SOURCE_IDS.CONTENT_PIPELINE,
    filter: {
      and: [
        { property: "Status", select: { equals: "🚀 Posted" } },
        { property: "Move to Tracker", checkbox: { equals: true } },
        { property: "Posted URL", url: { is_not_empty: true } },
      ],
    },
    page_size: limit,
  });
  return response.results.map((page: any) => {
    const p = page.properties || {};
    return {
      pageId: page.id,
      title: textValue(p.Title),
      category: multiSelectValue(p.Category),
      format: selectValue(p.Format),
      platform: selectValue(p.Platform) || "X",
      draft: textValue(p.Draft),
      postedUrl: p["Posted URL"]?.url || "",
      ideaIds: relationIds(p["Based On"]),
      trackerIds: relationIds(p["Tracker Item"]),
    };
  });
}

export async function syncPipelineItemToTracker(item: PostedPipelineRecord): Promise<string> {
  const existing: any = await notion.dataSources.query({
    data_source_id: NOTION_DATA_SOURCE_IDS.MY_CONTENT_TRACKER,
    filter: { property: "Origin Pipeline", relation: { contains: item.pageId } },
    page_size: 1,
  });
  let trackerId = existing.results[0]?.id as string | undefined;
  if (!trackerId) {
    const response: any = await notion.pages.create({
      parent: { database_id: NOTION_DATABASE_IDS.MY_CONTENT_TRACKER },
      properties: {
        "Post Title": { title: [{ text: { content: item.title.slice(0, 200) } }] },
        Content: richText(item.draft),
        Category: { multi_select: item.category.filter((c) => CONTENT_PILLARS.includes(c)).map((name) => ({ name })) },
        Platform: { select: { name: item.platform } },
        Format: { select: { name: item.format } },
        "Post URL": { url: item.postedUrl },
        "Date Posted": { date: { start: new Date().toISOString().slice(0, 10) } },
        Status: { select: { name: "Posted" } },
        "Origin Pipeline": { relation: [{ id: item.pageId }] },
        "Origin Idea": { relation: item.ideaIds.map((id) => ({ id })) },
      },
    });
    trackerId = response.id;
    if (item.draft.length > 1900) {
      await appendBlocks(trackerId!, markdownToNotionBlocks(`## Published Content\n\n${item.draft}`));
    }
  }
  await notion.pages.update({
    page_id: item.pageId,
    properties: { "Tracker Item": { relation: [{ id: trackerId! }] } },
  });
  return trackerId!;
}

export interface TasteSignal {
  title: string;
  rating: string;
  tasteNote: string;
  rejectionReason: string;
  category: string[];
  format: string;
  hook: string;
  confidence: number;
}

export async function getTasteSignals(): Promise<TasteSignal[]> {
  const response: any = await notion.dataSources.query({
    data_source_id: NOTION_DATA_SOURCE_IDS.IDEAS_BANK,
    filter: { property: "Human Rating", select: { is_not_empty: true } },
    sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
    page_size: 100,
  });
  return response.results.map((page: any) => {
    const p = page.properties || {};
    return {
      title: textValue(p.Idea),
      rating: selectValue(p["Human Rating"]),
      tasteNote: textValue(p["Taste Note"]),
      rejectionReason: selectValue(p["Rejection Reason"]),
      category: multiSelectValue(p.Category),
      format: selectValue(p["Format Idea"]),
      hook: textValue(p["Selected Hook"]) || textValue(p["Hook Angle"]),
      confidence: p["Confidence Score"]?.number || 0,
    };
  });
}

export async function getTrackedPerformance(): Promise<any[]> {
  const response: any = await notion.dataSources.query({
    data_source_id: NOTION_DATA_SOURCE_IDS.MY_CONTENT_TRACKER,
    page_size: 100,
  });
  return response.results.map((page: any) => {
    const p = page.properties || {};
    return {
      title: textValue(p["Post Title"]),
      category: multiSelectValue(p.Category),
      format: selectValue(p.Format),
      hookType: selectValue(p["Hook Type"]),
      views: p["Metrics - Views"]?.number || 0,
      likes: p["Metrics - Likes"]?.number || 0,
      replies: p["Metrics - Replies"]?.number || 0,
      reposts: p["Metrics - RTs"]?.number || 0,
      bookmarks: p["Metrics - Bookmarks"]?.number || 0,
    };
  });
}

export async function getActiveTasteProfile(): Promise<string> {
  const response: any = await notion.dataSources.query({
    data_source_id: NOTION_DATA_SOURCE_IDS.TASTE_PROFILES,
    filter: { property: "Status", select: { equals: "Active" } },
    sorts: [{ property: "Generated At", direction: "descending" }],
    page_size: 1,
  });
  const page = response.results[0];
  if (!page) return "";
  return textValue(page.properties?.["Profile JSON"]) || textValue(page.properties?.Summary);
}

export async function saveTasteProfile(input: {
  summary: string;
  preferredHooks: string;
  rejectedPatterns: string;
  voiceNotes: string;
  formatPreferences: string;
  profileJson: string;
  ratedIdeas: number;
  trackedPosts: number;
}): Promise<string> {
  const active: any = await notion.dataSources.query({
    data_source_id: NOTION_DATA_SOURCE_IDS.TASTE_PROFILES,
    filter: { property: "Status", select: { equals: "Active" } },
    page_size: 100,
  });
  for (const page of active.results) {
    await notion.pages.update({
      page_id: page.id,
      properties: { Status: { select: { name: "Superseded" } } },
    });
  }
  const now = new Date().toISOString();
  const response: any = await notion.pages.create({
    parent: { database_id: NOTION_DATABASE_IDS.TASTE_PROFILES },
    properties: {
      Profile: { title: [{ text: { content: `Taste Profile — ${now.slice(0, 10)}` } }] },
      Status: { select: { name: "Active" } },
      "Generated At": { date: { start: now } },
      "Rated Ideas": { number: input.ratedIdeas },
      "Tracked Posts": { number: input.trackedPosts },
      Summary: richText(input.summary),
      "Preferred Hooks": richText(input.preferredHooks),
      "Rejected Patterns": richText(input.rejectedPatterns),
      "Voice Notes": richText(input.voiceNotes),
      "Format Preferences": richText(input.formatPreferences),
      "Profile JSON": richText(input.profileJson),
    },
  });
  return response.id;
}

export async function setIdeaHooks(pageId: string, hooks: {
  safe: string;
  sharp: string;
  bold: string;
  selected: string;
  psychology?: string[];
}): Promise<void> {
  const notionPsychologyName = (name: string) => ({
    "Tool Stack": "Tool stack",
    "Personal Story": "Personal story",
    "Resource Drop": "Resource drop",
    "Curiosity Gap": "Curiosity gap",
    "Status Shift": "Status shift",
  }[name] || name);
  await notion.pages.update({
    page_id: pageId,
    properties: {
      "Hook A": richText(hooks.safe),
      "Hook B": richText(hooks.sharp),
      "Hook C": richText(hooks.bold),
      "Selected Hook": richText(hooks.selected),
      "Hook Psychology": {
        multi_select: [...new Set(hooks.psychology || [])]
          .map(notionPsychologyName)
          .map((name) => ({ name })),
      },
    },
  });
}

export type { ExecutionPlan, RecommendationRole };
