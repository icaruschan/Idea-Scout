import assert from "node:assert/strict";
import {
  buildProductionBlueprintPrompt,
  derivePreflightEffortFit,
  normalizeProductionBlueprint,
  normalizeProductionPreflight,
  type AssetType,
  type NecessityReason,
} from "../src/lib/production-blueprint";
import type { ContentFormat } from "../src/lib/voice-dna";

function asset(key: string, name: string, type: AssetType, necessity: NecessityReason, includedIn = ["Recommended", "Premium"]) {
  const capture = type === "Screenshot" || type === "Screen recording";
  return {
    key,
    name,
    type,
    includedIn,
    required: true,
    necessityReasons: [necessity],
    purpose: `Support the content with ${name}.`,
    claimSupported: `Claim supported by ${name}.`,
    whyNeeded: `${name} adds evidence or clarity that the text alone cannot provide.`,
    acquisitionMethod: capture ? "Capture existing material" : "Design from assets",
    sourceLocation: "Source-specific workspace",
    toolOrApp: capture ? "Chrome" : "Canva",
    prerequisites: ["Final draft is approved"],
    creationSteps: [`Prepare the source for ${name}`, `Create ${name}`, "Check it against the draft"],
    captureTiming: capture ? "During process" : "Not applicable",
    captureRunbook: capture ? {
      what: name,
      why: `Show ${name} as direct support.`,
      when: "After the relevant source state is ready.",
      prerequisites: ["Hide private information"],
      startState: "Open on the exact relevant screen.",
      actions: ["Show the relevant state", "Pause on the evidence"],
      stopState: "End after the evidence is readable.",
      targetDuration: type === "Screenshot" ? "Single frame" : "8-12 seconds",
      placement: "At the matching claim or step.",
      editing: ["Crop distractions"],
      privacy: ["Hide account details"],
    } : undefined,
    technicalSpecifications: ["Readable on mobile"],
    placement: "At the matching claim or section.",
    presentationInstructions: ["Add a concise label"],
    editingNotes: ["Preserve legibility"],
    dependencies: [],
    fallback: "Use a precise text explanation if the asset cannot be obtained.",
    reuseOpportunities: ["Repurpose in the launch post"],
    privacyAndRights: ["Use owned or licensed material"],
    accessibility: ["Add alt text"],
    qualityCriteria: ["Supports the named claim", "Readable on mobile"],
    estimatedMinutes: 20,
  };
}

function rawBlueprint(assets: ReturnType<typeof asset>[]) {
  return {
    productionObjective: "Deliver the draft clearly and credibly.",
    readerTransformation: "The reader can act on the main idea.",
    presentationStrategy: "Use only evidence and explanation the draft genuinely needs.",
    claimsToEvidence: assets.map((item) => ({ claim: item.claimSupported, evidenceNeeded: item.name, assetKeys: [item.key], why: item.whyNeeded })),
    packages: {
      minimum: { objective: "Smallest credible plan", rationale: "Only essential evidence" },
      recommended: { objective: "Balanced plan", rationale: "Best clarity and effort balance" },
      premium: { objective: "Expanded plan", rationale: "Adds repurposing and polish" },
    },
    assets,
    assemblyMap: assets.map((item) => ({ location: item.placement, messagePurpose: item.purpose, assetKeys: [item.key], whyHere: item.whyNeeded })),
    productionSessions: assets.length ? [{ order: 1, name: "Produce evidence", objective: "Create required assets", tasks: assets.map((item) => `Create ${item.name}`), assetKeys: assets.map((item) => item.key) }] : [],
    proofIntegrity: ["Do not invent evidence"],
    finalQualityChecklist: ["Every asset supports the draft"],
    blockers: [],
  };
}

const fixtures: Array<{ name: string; format: ContentFormat; assets: ReturnType<typeof asset>[] }> = [
  { name: "AI UGC tutorial article", format: "Article", assets: [
    asset("ugc-result-comparison", "Controlled comparison of generic and realism-focused UGC character outputs", "Before-and-after comparison", "shows_comparison"),
    asset("ugc-prompt-evidence", "Screenshot of the final realism prompt section that produced the tested character", "Screenshot", "proves_claim"),
    asset("ugc-consistency-results", "Grid of repeated character generations testing consistency across scenes", "Generated image", "proves_claim"),
  ] },
  { name: "Automation workflow thread", format: "Thread", assets: [
    asset("workflow-map", "Diagram of the Trigger.dev scout-to-draft automation stages", "Diagram", "clarifies_mechanism"),
    asset("failed-retry-run", "Screenshot of the Trigger.dev run showing the failed retry and recovery", "Screenshot", "demonstrates_process"),
  ] },
  { name: "AI tool comparison", format: "Mid-length", assets: [
    asset("same-task-results", "Side-by-side table of both AI tools completing the same evaluation task", "Table", "shows_comparison"),
  ] },
  { name: "Personal story", format: "Short", assets: [] },
  { name: "Founder retrospective", format: "Thread", assets: [
    asset("revenue-timeline", "Chart of the product revenue milestones referenced in the founder retrospective", "Chart", "proves_claim"),
  ] },
  { name: "Contrarian essay", format: "Article", assets: [] },
  { name: "Software tutorial", format: "Article", assets: [
    asset("settings-screen", "Screenshot of the exact project settings required before starting the tutorial", "Screenshot", "demonstrates_process"),
    asset("workflow-recording", "Screen recording of the complete configuration and successful test run", "Screen recording", "demonstrates_process"),
    asset("troubleshooting-reference", "Downloadable troubleshooting reference for the errors covered in the tutorial", "Downloadable resource", "creates_reusable_resource"),
  ] },
];

const normalized = fixtures.map((fixture) => ({
  ...fixture,
  blueprint: normalizeProductionBlueprint(rawBlueprint(fixture.assets), fixture.format),
}));

assert.equal(normalized.find((item) => item.name === "Personal story")?.blueprint.assets.length, 0);
assert.equal(normalized.find((item) => item.name === "Contrarian essay")?.blueprint.assets.length, 0);
assert.equal(new Set(normalized.map((item) => item.blueprint.assets.length)).size >= 4, true, "Asset counts should vary by content needs");
for (const fixture of normalized.filter((item) => !item.name.includes("UGC"))) {
  assert.equal(fixture.blueprint.assets.some((item) => /ugc|character prompt/i.test(item.name)), false, `${fixture.name} leaked UGC assets`);
}
for (const fixture of normalized) {
  const minimum = new Set(fixture.blueprint.packages.minimum.assetKeys);
  const recommended = new Set(fixture.blueprint.packages.recommended.assetKeys);
  const premium = new Set(fixture.blueprint.packages.premium.assetKeys);
  for (const key of minimum) assert.ok(recommended.has(key));
  for (const key of recommended) assert.ok(premium.has(key));
}

const easy = normalizeProductionPreflight({ contentArchetype: "personal-story", readerTransformation: "Relate to the lesson", requiredAssets: [], estimatedProductionMinutes: 20, complexity: "Low", researchDependency: "None", proofDependency: "None", editingIntensity: "None", liveCaptureRequired: false });
const hard = normalizeProductionPreflight({ contentArchetype: "research-comparison", readerTransformation: "Make a tested choice", requiredAssets: fixtures[0].assets.map((item) => ({ name: item.name, type: item.type, purpose: item.purpose, necessityReasons: item.necessityReasons })), estimatedProductionMinutes: 360, complexity: "High", researchDependency: "High", proofDependency: "High", editingIntensity: "High", liveCaptureRequired: true });
assert.equal(easy.requiredAssetCount, 0);
assert.equal(hard.requiredAssetCount, 3);
assert.ok(derivePreflightEffortFit(easy) > derivePreflightEffortFit(hard));

const unrelatedPrompt = buildProductionBlueprintPrompt({ title: "Why simple systems survive", format: "Short", hook: "Complexity compounds", draft: "Simple systems are easier to maintain.", sourceContext: "An essay about maintenance costs.", strategistContext: "Text-first operator principle.", preflight: easy });
assert.equal(/AI UGC|realistic character|prompt anatomy/i.test(unrelatedPrompt), false, "Prompt must not contain example-specific asset names");

assert.throws(() => normalizeProductionBlueprint(rawBlueprint([
  asset("vague", "Useful screenshot", "Screenshot", "supplies_context"),
]), "Article"), /Vague production asset rejected/);

console.log(`✅ Dynamic production blueprint tests passed across ${fixtures.length} distinct content fixtures.`);
