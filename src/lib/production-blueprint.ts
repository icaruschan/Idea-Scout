import type { ContentFormat } from "./voice-dna";

export const PRODUCTION_PREFLIGHT_VERSION = "v1" as const;
export const PRODUCTION_BLUEPRINT_VERSION = "v1" as const;

export const ASSET_TYPES = [
  "Screenshot",
  "Screen recording",
  "Photograph",
  "Generated image",
  "Before-and-after comparison",
  "Diagram",
  "Chart",
  "Table",
  "Document",
  "Quote or citation",
  "B-roll",
  "Audio",
  "Downloadable resource",
  "External reference",
  "Other",
] as const;

export const NECESSITY_REASONS = [
  "proves_claim",
  "demonstrates_process",
  "clarifies_mechanism",
  "shows_comparison",
  "supplies_context",
  "improves_navigation",
  "creates_reusable_resource",
] as const;

export type AssetType = (typeof ASSET_TYPES)[number];
export type NecessityReason = (typeof NECESSITY_REASONS)[number];
export type DependencyLevel = "None" | "Low" | "Medium" | "High";
export type ProductionComplexity = "Low" | "Medium" | "High";
export type ProductionScope = "Minimum" | "Recommended" | "Premium";
export type BlueprintState = "Pending" | "Generating" | "Ready" | "Failed" | "Stale";
export type ProductionReadiness = "Not Started" | "In Progress" | "Blocked" | "Ready for Review";
export type AssetStatus =
  | "Not Started"
  | "Ready to Capture"
  | "In Progress"
  | "Blocked"
  | "Captured"
  | "Edited"
  | "Placed"
  | "Complete"
  | "Skipped";

export type AcquisitionMethod =
  | "Capture existing material"
  | "Record live process"
  | "Generate with AI"
  | "Design from assets"
  | "Download or source"
  | "Recreate demonstration"
  | "Reuse media library"
  | "No media creation";

export type CaptureTiming =
  | "Before process"
  | "During process"
  | "After result"
  | "Anytime"
  | "Not applicable";

export interface PreflightAsset {
  name: string;
  type: AssetType;
  purpose: string;
  necessityReasons: NecessityReason[];
}

export interface ProductionPreflight {
  state: "Complete" | "Incomplete";
  contentArchetype: string;
  readerTransformation: string;
  importantClaims: string[];
  teachableUnits: string[];
  processesToDemonstrate: string[];
  evidenceRequirements: string[];
  visualizationOpportunities: string[];
  reusableResources: string[];
  requiredAssets: PreflightAsset[];
  requiredAssetCount: number;
  estimatedProductionMinutes: number;
  complexity: ProductionComplexity;
  researchDependency: DependencyLevel;
  proofDependency: DependencyLevel;
  editingIntensity: DependencyLevel;
  liveCaptureRequired: boolean;
  blockers: string[];
  version: typeof PRODUCTION_PREFLIGHT_VERSION;
}

export interface CaptureRunbook {
  what: string;
  why: string;
  when: string;
  prerequisites: string[];
  startState: string;
  actions: string[];
  stopState: string;
  targetDuration: string;
  placement: string;
  editing: string[];
  privacy: string[];
}

export interface ProductionAsset {
  key: string;
  name: string;
  type: AssetType;
  includedIn: ProductionScope[];
  required: boolean;
  necessityReasons: NecessityReason[];
  purpose: string;
  claimSupported: string;
  whyNeeded: string;
  acquisitionMethod: AcquisitionMethod;
  sourceLocation: string;
  toolOrApp: string;
  prerequisites: string[];
  creationSteps: string[];
  captureTiming: CaptureTiming;
  captureRunbook?: CaptureRunbook;
  technicalSpecifications: string[];
  placement: string;
  presentationInstructions: string[];
  editingNotes: string[];
  dependencies: string[];
  fallback: string;
  reuseOpportunities: string[];
  privacyAndRights: string[];
  accessibility: string[];
  qualityCriteria: string[];
  estimatedMinutes: number;
}

export interface ClaimEvidenceRequirement {
  claim: string;
  evidenceNeeded: string;
  assetKeys: string[];
  why: string;
}

export interface ProductionPackage {
  scope: ProductionScope;
  objective: string;
  rationale: string;
  estimatedMinutes: number;
  assetKeys: string[];
}

export interface AssemblyPlacement {
  location: string;
  messagePurpose: string;
  assetKeys: string[];
  whyHere: string;
}

export interface ProductionSession {
  order: number;
  name: string;
  objective: string;
  tasks: string[];
  assetKeys: string[];
}

export interface ProductionBlueprint {
  version: typeof PRODUCTION_BLUEPRINT_VERSION;
  planningBasis: "Engineered from source and draft";
  productionObjective: string;
  readerTransformation: string;
  presentationStrategy: string;
  format: ContentFormat;
  claimsToEvidence: ClaimEvidenceRequirement[];
  packages: Record<Lowercase<ProductionScope>, ProductionPackage>;
  assets: ProductionAsset[];
  assemblyMap: AssemblyPlacement[];
  productionSessions: ProductionSession[];
  proofIntegrity: string[];
  finalQualityChecklist: string[];
  blockers: string[];
}

const ACQUISITION_METHODS: AcquisitionMethod[] = [
  "Capture existing material",
  "Record live process",
  "Generate with AI",
  "Design from assets",
  "Download or source",
  "Recreate demonstration",
  "Reuse media library",
  "No media creation",
];
const CAPTURE_TIMINGS: CaptureTiming[] = ["Before process", "During process", "After result", "Anytime", "Not applicable"];
const SCOPES: ProductionScope[] = ["Minimum", "Recommended", "Premium"];

function text(value: unknown, fallback = ""): string {
  return String(value ?? fallback).trim();
}

function stringArray(value: unknown, limit = 20): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => text(item)).filter(Boolean))].slice(0, limit);
}

function boundedNumber(value: unknown, fallback = 0, max = 10_000): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.min(max, Math.round(parsed)));
}

function enumValue<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  const candidate = text(value) as T;
  return allowed.includes(candidate) ? candidate : fallback;
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "asset";
}

function normalizeNecessityReasons(value: unknown): NecessityReason[] {
  return stringArray(value)
    .filter((item): item is NecessityReason => NECESSITY_REASONS.includes(item as NecessityReason));
}

function isConcreteAssetName(name: string): boolean {
  if (name.length < 12) return false;
  return !/^(useful|relevant|supporting|nice|good|some|a|an)\s+(image|visual|screenshot|video|asset|graphic)s?$/i.test(name.trim());
}

export function normalizeProductionPreflight(raw: unknown): ProductionPreflight {
  const source = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const candidateAssets = Array.isArray(source.requiredAssets) ? source.requiredAssets : [];
  const requiredAssets: PreflightAsset[] = [];

  for (const candidate of candidateAssets) {
    if (!candidate || typeof candidate !== "object") continue;
    const item = candidate as Record<string, unknown>;
    const name = text(item.name);
    const necessityReasons = normalizeNecessityReasons(item.necessityReasons);
    if (!isConcreteAssetName(name) || necessityReasons.length === 0) continue;
    requiredAssets.push({
      name,
      type: enumValue(item.type, ASSET_TYPES, "Other"),
      purpose: text(item.purpose),
      necessityReasons,
    });
  }

  const contentArchetype = text(source.contentArchetype);
  const readerTransformation = text(source.readerTransformation);
  const hasEstimate = Number.isFinite(Number(source.estimatedProductionMinutes));
  return {
    state: contentArchetype && readerTransformation && hasEstimate ? "Complete" : "Incomplete",
    contentArchetype: contentArchetype || "unknown",
    readerTransformation,
    importantClaims: stringArray(source.importantClaims),
    teachableUnits: stringArray(source.teachableUnits),
    processesToDemonstrate: stringArray(source.processesToDemonstrate),
    evidenceRequirements: stringArray(source.evidenceRequirements),
    visualizationOpportunities: stringArray(source.visualizationOpportunities),
    reusableResources: stringArray(source.reusableResources),
    requiredAssets,
    requiredAssetCount: requiredAssets.length,
    estimatedProductionMinutes: boundedNumber(source.estimatedProductionMinutes, 0, 1440),
    complexity: enumValue(source.complexity, ["Low", "Medium", "High"] as const, "Low"),
    researchDependency: enumValue(source.researchDependency, ["None", "Low", "Medium", "High"] as const, "None"),
    proofDependency: enumValue(source.proofDependency, ["None", "Low", "Medium", "High"] as const, "None"),
    editingIntensity: enumValue(source.editingIntensity, ["None", "Low", "Medium", "High"] as const, "None"),
    liveCaptureRequired: Boolean(source.liveCaptureRequired),
    blockers: stringArray(source.blockers),
    version: PRODUCTION_PREFLIGHT_VERSION,
  };
}

export function incompleteProductionPreflight(): ProductionPreflight {
  return {
    state: "Incomplete",
    contentArchetype: "unknown",
    readerTransformation: "",
    importantClaims: [],
    teachableUnits: [],
    processesToDemonstrate: [],
    evidenceRequirements: [],
    visualizationOpportunities: [],
    reusableResources: [],
    requiredAssets: [],
    requiredAssetCount: 0,
    estimatedProductionMinutes: 0,
    complexity: "Low",
    researchDependency: "None",
    proofDependency: "None",
    editingIntensity: "None",
    liveCaptureRequired: false,
    blockers: ["Production preflight was not generated; Effort Fit used the format fallback."],
    version: PRODUCTION_PREFLIGHT_VERSION,
  };
}

function dependencyPenalty(level: DependencyLevel): number {
  return level === "High" ? 0.5 : level === "Medium" ? 0.25 : 0;
}

export function derivePreflightEffortFit(preflight: ProductionPreflight): number {
  const minutes = preflight.estimatedProductionMinutes;
  const timePenalty = minutes > 240 ? 4 : minutes > 120 ? 3 : minutes > 60 ? 2 : minutes > 30 ? 1 : 0;
  const count = preflight.requiredAssetCount;
  const assetPenalty = count >= 7 ? 1.5 : count >= 4 ? 1 : count >= 2 ? 0.5 : 0;
  const editingPenalty = preflight.editingIntensity === "High" ? 1 : preflight.editingIntensity === "Medium" ? 0.5 : 0;
  const dependencyPenalties = dependencyPenalty(preflight.researchDependency) + dependencyPenalty(preflight.proofDependency);
  const capturePenalty = preflight.liveCaptureRequired ? 0.5 : 0;
  return Math.max(1, Math.min(10, Math.round((10 - timePenalty - assetPenalty - editingPenalty - dependencyPenalties - capturePenalty) * 10) / 10));
}

function normalizeCaptureRunbook(raw: unknown): CaptureRunbook | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const source = raw as Record<string, unknown>;
  return {
    what: text(source.what),
    why: text(source.why),
    when: text(source.when),
    prerequisites: stringArray(source.prerequisites),
    startState: text(source.startState),
    actions: stringArray(source.actions, 30),
    stopState: text(source.stopState),
    targetDuration: text(source.targetDuration),
    placement: text(source.placement),
    editing: stringArray(source.editing),
    privacy: stringArray(source.privacy),
  };
}

function validateCaptureRunbook(asset: ProductionAsset): void {
  if (asset.type !== "Screenshot" && asset.type !== "Screen recording") return;
  const runbook = asset.captureRunbook;
  if (!runbook || !runbook.what || !runbook.why || !runbook.when || !runbook.startState || !runbook.stopState || !runbook.placement || runbook.actions.length === 0) {
    throw new Error(`Asset ${asset.key} requires a concrete capture runbook.`);
  }
}

function normalizeAsset(raw: Record<string, unknown>, seen: Set<string>): ProductionAsset {
  const name = text(raw.name);
  if (!isConcreteAssetName(name)) throw new Error(`Vague production asset rejected: ${name || "unnamed"}`);
  let key = slug(text(raw.key) || name);
  let suffix = 2;
  while (seen.has(key)) key = `${slug(text(raw.key) || name)}-${suffix++}`;
  seen.add(key);
  const reasons = normalizeNecessityReasons(raw.necessityReasons);
  if (reasons.length === 0) throw new Error(`Asset ${key} has no valid necessity reason.`);
  const rawScopes = stringArray(raw.includedIn).filter((item): item is ProductionScope => SCOPES.includes(item as ProductionScope));
  if (rawScopes.length === 0) throw new Error(`Asset ${key} is not assigned to a production package.`);
  const includedIn = new Set<ProductionScope>(rawScopes);
  if (includedIn.has("Minimum")) { includedIn.add("Recommended"); includedIn.add("Premium"); }
  if (includedIn.has("Recommended")) includedIn.add("Premium");
  const asset: ProductionAsset = {
    key,
    name,
    type: enumValue(raw.type, ASSET_TYPES, "Other"),
    includedIn: SCOPES.filter((scope) => includedIn.has(scope)),
    required: raw.required !== false,
    necessityReasons: reasons,
    purpose: text(raw.purpose),
    claimSupported: text(raw.claimSupported),
    whyNeeded: text(raw.whyNeeded),
    acquisitionMethod: enumValue(raw.acquisitionMethod, ACQUISITION_METHODS, "Capture existing material"),
    sourceLocation: text(raw.sourceLocation),
    toolOrApp: text(raw.toolOrApp),
    prerequisites: stringArray(raw.prerequisites),
    creationSteps: stringArray(raw.creationSteps, 30),
    captureTiming: enumValue(raw.captureTiming, CAPTURE_TIMINGS, "Not applicable"),
    captureRunbook: normalizeCaptureRunbook(raw.captureRunbook),
    technicalSpecifications: stringArray(raw.technicalSpecifications),
    placement: text(raw.placement),
    presentationInstructions: stringArray(raw.presentationInstructions),
    editingNotes: stringArray(raw.editingNotes),
    dependencies: stringArray(raw.dependencies),
    fallback: text(raw.fallback),
    reuseOpportunities: stringArray(raw.reuseOpportunities),
    privacyAndRights: stringArray(raw.privacyAndRights),
    accessibility: stringArray(raw.accessibility),
    qualityCriteria: stringArray(raw.qualityCriteria),
    estimatedMinutes: boundedNumber(raw.estimatedMinutes, 0, 1440),
  };
  if (!asset.purpose || !asset.whyNeeded || asset.creationSteps.length === 0 || !asset.placement) {
    throw new Error(`Asset ${key} is missing purpose, rationale, steps, or placement.`);
  }
  validateCaptureRunbook(asset);
  return asset;
}

function validateDependencies(assets: ProductionAsset[]): void {
  const keys = new Set(assets.map((asset) => asset.key));
  for (const asset of assets) {
    asset.dependencies = asset.dependencies.filter((key) => keys.has(key) && key !== asset.key);
  }
  const graph = new Map(assets.map((asset) => [asset.key, asset.dependencies]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (key: string) => {
    if (visiting.has(key)) throw new Error(`Production asset dependency cycle detected at ${key}.`);
    if (visited.has(key)) return;
    visiting.add(key);
    for (const dependency of graph.get(key) || []) if (keys.has(dependency)) visit(dependency);
    visiting.delete(key);
    visited.add(key);
  };
  for (const key of keys) visit(key);
}

function normalizePackage(scope: ProductionScope, raw: unknown, assets: ProductionAsset[]): ProductionPackage {
  const source = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const assetKeys = assets.filter((asset) => asset.includedIn.includes(scope)).map((asset) => asset.key);
  return {
    scope,
    objective: text(source.objective, `${scope} execution package`),
    rationale: text(source.rationale),
    estimatedMinutes: assetKeys.reduce((sum, key) => sum + (assets.find((asset) => asset.key === key)?.estimatedMinutes || 0), 0),
    assetKeys,
  };
}

export function normalizeProductionBlueprint(raw: Record<string, unknown>, format: ContentFormat): ProductionBlueprint {
  const seen = new Set<string>();
  const assets = (Array.isArray(raw.assets) ? raw.assets : [])
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => normalizeAsset(item, seen));
  validateDependencies(assets);
  const rawPackages = raw.packages && typeof raw.packages === "object" ? raw.packages as Record<string, unknown> : {};
  const claims = (Array.isArray(raw.claimsToEvidence) ? raw.claimsToEvidence : []).map((item) => {
    const source = item && typeof item === "object" ? item as Record<string, unknown> : {};
    return {
      claim: text(source.claim),
      evidenceNeeded: text(source.evidenceNeeded),
      assetKeys: stringArray(source.assetKeys).filter((key) => seen.has(key)),
      why: text(source.why),
    };
  }).filter((item) => item.claim && item.evidenceNeeded);
  const normalizePlacements = (value: unknown): AssemblyPlacement[] => (Array.isArray(value) ? value : []).map((item) => {
    const source = item && typeof item === "object" ? item as Record<string, unknown> : {};
    return { location: text(source.location), messagePurpose: text(source.messagePurpose), assetKeys: stringArray(source.assetKeys).filter((key) => seen.has(key)), whyHere: text(source.whyHere) };
  }).filter((item) => item.location && item.messagePurpose);
  const normalizeSessions = (value: unknown): ProductionSession[] => (Array.isArray(value) ? value : []).map((item, index) => {
    const source = item && typeof item === "object" ? item as Record<string, unknown> : {};
    return { order: boundedNumber(source.order, index + 1, 100), name: text(source.name, `Session ${index + 1}`), objective: text(source.objective), tasks: stringArray(source.tasks, 30), assetKeys: stringArray(source.assetKeys).filter((key) => seen.has(key)) };
  }).sort((a, b) => a.order - b.order);
  return {
    version: PRODUCTION_BLUEPRINT_VERSION,
    planningBasis: "Engineered from source and draft",
    productionObjective: text(raw.productionObjective),
    readerTransformation: text(raw.readerTransformation),
    presentationStrategy: text(raw.presentationStrategy),
    format,
    claimsToEvidence: claims,
    packages: {
      minimum: normalizePackage("Minimum", rawPackages.minimum, assets),
      recommended: normalizePackage("Recommended", rawPackages.recommended, assets),
      premium: normalizePackage("Premium", rawPackages.premium, assets),
    },
    assets,
    assemblyMap: normalizePlacements(raw.assemblyMap),
    productionSessions: normalizeSessions(raw.productionSessions),
    proofIntegrity: stringArray(raw.proofIntegrity),
    finalQualityChecklist: stringArray(raw.finalQualityChecklist, 30),
    blockers: stringArray(raw.blockers),
  };
}

export function buildProductionBlueprintPrompt(input: {
  title: string;
  format: ContentFormat;
  hook: string;
  draft: string;
  sourceContext: string;
  strategistContext: string;
  preflight: ProductionPreflight;
}): string {
  return `Engineer a content production blueprint for THIS specific draft.

TITLE: ${input.title}
FORMAT: ${input.format}
HOOK: ${input.hook || "Not supplied"}

PRODUCTION PREFLIGHT:
${JSON.stringify(input.preflight, null, 2)}

STRATEGIST CONTEXT:
${input.strategistContext.slice(0, 20000)}

SOURCE CONTEXT:
${input.sourceContext.slice(0, 30000)}

FINAL DRAFT:
${input.draft.slice(0, 30000)}

CORE RULES:
- Derive every asset from the source, draft, reader outcome, claims, mechanisms, evidence needs, and selected format.
- Zero assets is valid. Never force media for decoration or to fill a package.
- Every asset needs at least one necessityReasons value: proves_claim, demonstrates_process, clarifies_mechanism, shows_comparison, supplies_context, improves_navigation, creates_reusable_resource.
- Asset names must be concrete and content-specific. Reject vague names such as useful screenshot, relevant visual, or supporting image.
- Do not reuse example asset names from unrelated topics.
- Short usually needs zero or one asset unless more are essential. Mid-length stays focused. Thread assets map to posts. Article assets map to claims and sections.
- You are ENGINEERING a plan from text and source knowledge. Never claim you observed the original creator's visuals.
- Minimum is the smallest credible subset. Recommended contains Minimum. Premium contains Recommended. Asset counts are never targets.
- This system plans and tracks assets. It does not create or capture them.
- Screenshot and Screen recording assets require a complete captureRunbook with what, why, when, prerequisites, startState, actions, stopState, targetDuration, placement, editing, privacy.

Return JSON only with this shape:
{
  "productionObjective": "",
  "readerTransformation": "",
  "presentationStrategy": "",
  "claimsToEvidence": [{"claim":"","evidenceNeeded":"","assetKeys":[],"why":""}],
  "packages": {
    "minimum": {"objective":"","rationale":""},
    "recommended": {"objective":"","rationale":""},
    "premium": {"objective":"","rationale":""}
  },
  "assets": [{
    "key": "stable-topic-specific-key",
    "name": "Concrete content-specific asset name",
    "type": "${ASSET_TYPES.join("|")}",
    "includedIn": ["Recommended","Premium"],
    "required": true,
    "necessityReasons": ["proves_claim"],
    "purpose": "",
    "claimSupported": "",
    "whyNeeded": "",
    "acquisitionMethod": "${ACQUISITION_METHODS.join("|")}",
    "sourceLocation": "",
    "toolOrApp": "",
    "prerequisites": [],
    "creationSteps": [],
    "captureTiming": "${CAPTURE_TIMINGS.join("|")}",
    "captureRunbook": null,
    "technicalSpecifications": [],
    "placement": "",
    "presentationInstructions": [],
    "editingNotes": [],
    "dependencies": [],
    "fallback": "",
    "reuseOpportunities": [],
    "privacyAndRights": [],
    "accessibility": [],
    "qualityCriteria": [],
    "estimatedMinutes": 0
  }],
  "assemblyMap": [{"location":"","messagePurpose":"","assetKeys":[],"whyHere":""}],
  "productionSessions": [{"order":1,"name":"","objective":"","tasks":[],"assetKeys":[]}],
  "proofIntegrity": [],
  "finalQualityChecklist": [],
  "blockers": []
}`;
}

export function productionPreflightMarkdown(preflight: ProductionPreflight): string {
  const assets = preflight.requiredAssets.length
    ? preflight.requiredAssets.map((asset, index) => `${index + 1}. ${asset.name} — ${asset.purpose}`).join("\n")
    : "No media required. The idea is credible and clear as text-only content.";
  return `## Production Preflight
**State:** ${preflight.state}
**Complexity:** ${preflight.complexity}
**Estimated production:** ${preflight.estimatedProductionMinutes} minutes
**Required assets:** ${preflight.requiredAssetCount}
**Research dependency:** ${preflight.researchDependency}
**Proof dependency:** ${preflight.proofDependency}
**Editing intensity:** ${preflight.editingIntensity}
**Live capture required:** ${preflight.liveCaptureRequired ? "Yes" : "No"}

### Required Asset List
${assets}

### Reader Transformation
${preflight.readerTransformation || "Not specified."}

### Known Blockers
${preflight.blockers.length ? preflight.blockers.map((item) => `- ${item}`).join("\n") : "- None identified."}`;
}

export function productionAssetMarkdown(asset: ProductionAsset): string {
  const bullets = (items: string[]) => items.length ? items.map((item) => `- ${item}`).join("\n") : "- None";
  const capture = asset.captureRunbook ? `
## Capture Runbook
**What:** ${asset.captureRunbook.what}
**Why:** ${asset.captureRunbook.why}
**When:** ${asset.captureRunbook.when}
**Start state:** ${asset.captureRunbook.startState}
**Stop state:** ${asset.captureRunbook.stopState}
**Target duration:** ${asset.captureRunbook.targetDuration}

### Capture Actions
${asset.captureRunbook.actions.map((item, index) => `${index + 1}. ${item}`).join("\n")}

### Privacy Check
${bullets(asset.captureRunbook.privacy)}` : "";
  return `## Purpose
${asset.purpose}

**Why needed:** ${asset.whyNeeded}
**Claim supported:** ${asset.claimSupported || "Supporting explanation or navigation"}
**Necessity:** ${asset.necessityReasons.join(", ")}
**Placement:** ${asset.placement}

## Creation or Collection Steps
${asset.creationSteps.map((item, index) => `${index + 1}. ${item}`).join("\n")}
${capture}

## Technical Specifications
${bullets(asset.technicalSpecifications)}

## Presentation and Editing
${bullets([...asset.presentationInstructions, ...asset.editingNotes])}

## Dependencies
${bullets(asset.dependencies)}

## Fallback
${asset.fallback || "No fallback specified."}

## Reuse Opportunities
${bullets(asset.reuseOpportunities)}

## Privacy, Rights, and Accessibility
${bullets([...asset.privacyAndRights, ...asset.accessibility])}

## Completion Criteria
${bullets(asset.qualityCriteria)}`;
}

export function productionBlueprintMarkdown(blueprint: ProductionBlueprint): string {
  const packageLine = (pkg: ProductionPackage) => `- **${pkg.scope}:** ${pkg.assetKeys.length} assets, ${pkg.estimatedMinutes} minutes — ${pkg.rationale || pkg.objective}`;
  const assetLines = blueprint.assets.length
    ? blueprint.assets.map((asset, index) => `${index + 1}. **${asset.name}** (${asset.type}) — ${asset.whyNeeded}`).join("\n")
    : "No media assets are required for this content.";
  return `## Content Production Blueprint
**Planning basis:** ${blueprint.planningBasis}
**Format:** ${blueprint.format}
**Objective:** ${blueprint.productionObjective}
**Reader transformation:** ${blueprint.readerTransformation}

## Presentation Strategy
${blueprint.presentationStrategy}

## Execution Packages
${packageLine(blueprint.packages.minimum)}
${packageLine(blueprint.packages.recommended)}
${packageLine(blueprint.packages.premium)}

## Asset Inventory
${assetLines}

## Claims to Evidence
${blueprint.claimsToEvidence.length ? blueprint.claimsToEvidence.map((item) => `- **${item.claim}:** ${item.evidenceNeeded} — ${item.why}`).join("\n") : "- No additional visual evidence is required."}

## Assembly Map
${blueprint.assemblyMap.length ? blueprint.assemblyMap.map((item) => `- **${item.location}:** ${item.messagePurpose} — ${item.whyHere}`).join("\n") : "- Follow the final draft structure."}

## Production Sessions
${blueprint.productionSessions.length ? blueprint.productionSessions.map((session) => `### ${session.order}. ${session.name}\n${session.tasks.map((task) => `- ${task}`).join("\n")}`).join("\n\n") : "- No media-production sessions required."}

## Proof Integrity
${blueprint.proofIntegrity.length ? blueprint.proofIntegrity.map((item) => `- ${item}`).join("\n") : "- Keep all claims faithful to the authoritative source."}

## Final Quality Checklist
${blueprint.finalQualityChecklist.map((item) => `- ${item}`).join("\n")}`;
}
