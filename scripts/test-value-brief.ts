import { buildIdeaPageRawData } from "../src/trigger/idea-scout/draft-ideas";
import {
  validateComprehension,
  normalizeComprehension,
  buildStrategistSourceBlock,
  deriveStepByStepProcess,
  deriveTalkingPoints,
} from "../src/trigger/idea-scout/comprehend-source";
import { budgetTranscript } from "../src/lib/transcript-cleaner";
import { buildWriterPrompt, ExecutionPlan } from "../src/lib/voice-dna";
import { ScoutedContentForDraft } from "../src/lib/notion";

let failed = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    failed++;
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log("=== RUNNING COMPREHENSION / IDEA PAGE TESTS ===");

const source: ScoutedContentForDraft = {
  pageId: "3674a5db-f371-80ad-8ec6-f3e99bdd4191",
  title: "Lead triage automation",
  platform: "YouTube",
  aiSummary: "A founder uses n8n to qualify inbound leads before replying.",
  keyTakeaways: "Check the form, enrich the company, send the best leads to Slack.",
  url: "https://example.com/video",
  pillars: ["Automation"],
  creatorPageId: "creator-id",
  transcriptPreview: "Short preview",
  rawSourceText:
    "The founder checks forms, pulls company context, and sends qualified leads to Slack. They wasted $40 on Apollo before adding a filter node.",
  sourceText:
    "FULL TRANSCRIPT: The founder checks forms, pulls company context, and sends qualified leads to Slack.",
  scoutAnalysis: {
    summary: "n8n lead qualification walkthrough",
    creatorDoing: "Screen-records building a 6-node pipeline",
    contentType: "workflow-walkthrough",
    targetAudience: "solo founders doing outbound",
    primaryPain: "wasting enrichment credits on bad leads",
    teachableUnits: ["qualify before enrich", "Slack handoff"],
    transcriptGems: ["$40 Apollo waste", "filter node before enrichment"],
    guidePotential: "high",
    keyTakeaways: "→ qualify first",
  },
};

const block = buildStrategistSourceBlock(source);
assert(block.includes("FULL TRANSCRIPT / SOURCE TEXT (AUTHORITATIVE)"), "Strategist block leads with transcript");
assert(block.includes("SCOUT ANALYSIS"), "Strategist block includes scout analysis helper");

const longTranscript = "A".repeat(60_000);
const budgeted = budgetTranscript(longTranscript, "YouTube", 30_000);
assert(budgeted.stats.headTailTrimmed, "Long transcript is budgeted for strategist");
assert(budgeted.text.length <= 30_000, "Budgeted transcript respects max char budget");
assert(budgeted.text.startsWith("AAA"), "Budgeted transcript keeps opening context");
assert(budgeted.text.trimEnd().endsWith("AAA"), "Budgeted transcript keeps closing context");

const comprehension = normalizeComprehension({
  contentAbout:
    "This is a twenty-minute YouTube walkthrough where the creator builds an n8n workflow that qualifies inbound leads before enriching them and sends the best ones to Slack. It is a full pipeline demo with real test data, not a generic tool review. The video walks through form intake, company enrichment, qualification rules, Slack routing, and a live test run. The creator emphasizes cost control on enrichment APIs and shows exactly which nodes to wire together. Viewers who run outbound or inbound lead gen would copy this architecture rather than treating n8n as a toy automation layer.",
  creatorDoing: "Screen-records the entire build, explains each node, tests with real leads, and calls out the $40 Apollo mistake.",
  contentType: "workflow-walkthrough",
  creatorIntent: "Teach a reproducible qualify-before-enrich pipeline",
  narrativeArc: "Problem → build → test → mistake → fix → result",
  sourceAudience: "Agency owners doing outbound",
  yourAudience: "Indie hackers and automation builders",
  audienceOverlap: "Both want repeatable systems",
  audienceSophistication: "intermediate",
  primaryPain: "Paying for enrichment on unqualified leads",
  secondaryPains: ["manual Slack updates"],
  painEvidence: ["Creator wasted $40 on Apollo"],
  costOfInaction: "Keep burning API credits",
  coreValue: "Reproducible qualify-before-enrich pipeline",
  valueType: "how-to-guide",
  readerOutcome: "Build the same pipeline",
  whyNow: "Enrichment APIs are expensive",
  teachableUnits: [
    {
      unit: "Qualify before enrich",
      audienceRelevance: "Anyone paying per lead",
      painItSolves: "Wasted credits",
      depthAvailable: "high",
      sourceEvidence: "$40 mistake",
      formatFit: { article: "strong", thread: "strong", midLength: "strong", short: "weak" },
    },
    {
      unit: "Slack notification step",
      audienceRelevance: "Founders",
      painItSolves: "Manual handoff",
      depthAvailable: "medium",
      sourceEvidence: "Slack node config",
      formatFit: { article: "moderate", thread: "strong", midLength: "moderate", short: "weak" },
    },
  ],
  transcriptOnlyGems: ["$40 Apollo waste", "filter node before enrichment"],
  specificTools: ["n8n", "Slack"],
  specificSteps: ["filter", "enrich", "notify"],
  specificMistakes: ["enriching too early"],
  specificProof: ["$40"],
  unsupportedClaims: [],
});

const validation = validateComprehension(comprehension, source.rawSourceText.length);
assert(validation.valid, "Rich comprehension passes validation gate");

const samplePlan: ExecutionPlan = {
  ideaTitle: "Lead Triage Guide",
  sourcePageId: source.pageId,
  sourceTitle: source.title,
  sourceUrl: source.url,
  platform: source.platform,
  pillar: "Automation",
  voiceMode: "Tool-Curator",
  format: "Article",
  sourceText: source.sourceText,
  sourceThesis: "Qualify leads before enriching them.",
  sourceFacts: ["n8n checks lead forms before reply."],
  numbersMentioned: ["$40"],
  toolsMentioned: ["n8n", "Slack"],
  specificExamples: ["Qualified leads go to Slack."],
  mechanism: "Filter → enrich → notify",
  whyThisMatters: "Saves API spend",
  targetAudience: "solo founders qualifying inbound leads by hand",
  audiencePain: "they waste money enriching bad leads",
  valueProposition: "qualify leads faster without hiring ops help",
  readerOutcome: "build a simple workflow that sends good leads to Slack",
  whyNow: "enrichment APIs are expensive",
  contentPromise: "learn how to qualify before you enrich",
  valuableAngles: ["Lead qualification before reply"],
  selectedAngle: "Qualify leads before enriching",
  mustUseDetails: ["n8n", "Slack", "$40 Apollo waste"],
  doNotInvent: ["Do not claim revenue lift."],
  suggestedStructure: "Hook → problem → pipeline → mistakes → takeaways",
  priority: "💡 Good",
  comprehensionSummary: comprehension.contentAbout,
  creatorDoing: comprehension.creatorDoing,
  contentArchetype: "workflow-walkthrough",
  detailedOutline: [
    { heading: "The $40 mistake", purpose: "Hook with pain", sourceUnits: [], mustInclude: ["$40"] },
    { heading: "Pipeline architecture", purpose: "Mechanism", sourceUnits: [], mustInclude: ["n8n"] },
  ],
  hookTemplate: "Never ever ever **ever** [mistake]",
  hookFilledExample: "Never enrich a lead you haven't qualified (cost me $40)",
  hookRationale: "Pain + proof",
  viralTweetStructure: "Hook → Problem → Mechanism → Steps → Takeaway",
  stealablePattern: "Pain → Mechanism → Workflow",
  minWordTarget: 1500,
  minSectionCount: 4,
  talkingPoints: [
    "Filter bad leads before enrichment",
    "$40 Apollo waste on unqualified leads",
    "n8n → Slack handoff for qualified leads",
  ],
  stepByStepProcess: ["1. Filter", "2. Enrich", "3. Notify Slack"],
};

const talkingPoints = deriveTalkingPoints(
  [],
  comprehension,
  {
    workingTitle: "Lead Triage",
    format: "Article",
    angle: "Qualify first",
    isPrimaryValueBomb: true,
    targetAudience: "founders",
    painAddressed: "waste",
    valueProposition: "save money",
    readerOutcome: "build workflow",
    hookDirection: "Never enrich unqualified leads",
    sourceUnitsUsed: ["filter node"],
    transcriptGemsUsed: ["$40 Apollo waste"],
    estimatedDepth: "2000 words",
    priority: "💡 Good",
    rationale: "workflow",
    formatFitScore: 9,
  },
  samplePlan.mustUseDetails,
  samplePlan.sourceFacts,
);
assert(talkingPoints.length >= 3, "Talking points derive from gems and must-use details");
assert(
  talkingPoints.some((point) => point.includes("$40")),
  "Talking points include transcript gem",
);

const steps = deriveStepByStepProcess([], comprehension, "Article");
assert(steps.length === 3, "Step-by-step derives from comprehension.specificSteps");
assert(steps[0].startsWith("1."), "Steps are numbered");

const rawData = buildIdeaPageRawData(samplePlan);
assert(rawData.includes("## What This Source Is About"), "Idea page uses readable headers");
assert(rawData.includes("## Hook"), "Idea page includes hook section");
assert(rawData.includes("## Talking Points"), "Idea page includes talking points");
assert(rawData.includes("## Step by Step Process"), "Idea page includes step-by-step process");
assert(!rawData.includes("Full ValueBrief JSON"), "Idea page has no JSON dump");
assert(!rawData.includes("doNotInvent"), "Idea page hides writer-internal fields");
assert(rawData.includes("$40 Apollo waste"), "Idea page shows key source gems");

const { userPrompt } = buildWriterPrompt(samplePlan, samplePlan.voiceMode, []);
assert(userPrompt.includes("TALKING POINTS"), "Writer prompt includes talking points");
assert(userPrompt.includes("STEP BY STEP PROCESS"), "Writer prompt includes step-by-step process");

console.log("\n======================================");
if (failed > 0) {
  console.error(`❌ Test run failed: ${failed} failed assertions.`);
  process.exit(1);
}

console.log("🎉 Comprehension / idea page tests passed!");
process.exit(0);