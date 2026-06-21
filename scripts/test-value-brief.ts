import {
  buildIdeaPageRawData,
  buildValueStrategistPrompt,
  normalizeValueBrief,
} from "../src/trigger/idea-scout/draft-ideas";
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

console.log("=== RUNNING VALUE BRIEF TESTS ===");

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
  sourceText: "FULL TRANSCRIPT: The founder checks forms, pulls company context, and sends qualified leads to Slack.",
};

const strategistPrompt = buildValueStrategistPrompt({
  source,
  pillar: "Automation",
  viralSummary: "Template: pain → mechanism → outcome",
  existingTitles: [],
  underservedPillars: [],
});

for (const field of [
  "targetAudience",
  "audiencePain",
  "valueProposition",
  "readerOutcome",
  "whyNow",
  "contentPromise",
]) {
  assert(
    strategistPrompt.includes(`"${field}"`),
    `Strategist JSON shape includes ${field}`,
  );
}

assert(
  strategistPrompt.includes("audiencePain + source mechanism + readerOutcome"),
  "Strategist prompt defines hook inputs",
);
assert(
  strategistPrompt.includes("Choose \"Article\"") &&
    strategistPrompt.includes("complete workflow") &&
    strategistPrompt.includes("deep argument"),
  "Strategist prompt includes Article format selection rule",
);
assert(
  strategistPrompt.includes("Choose \"Short\" only"),
  "Strategist prompt keeps Short narrow",
);

const normalizedWithFallbacks = normalizeValueBrief(
  {
    ideaTitle: "Lead Triage",
    pillar: "Automation",
    voiceMode: "Tool-Curator",
    format: "Mid-length",
    sourceThesis: "Lead qualification can happen before a human replies.",
    sourceFacts: ["n8n checks lead forms before reply."],
    mustUseDetails: ["n8n", "Slack"],
    selectedAngle: "Qualify leads before replying",
    mechanism: "Check the form, pull context, and notify the right person.",
  },
  source,
  "Automation",
);

assert(Boolean(normalizedWithFallbacks), "Normalization keeps source-backed brief");
assert(
  normalizedWithFallbacks?.targetAudience.includes("Builders") ||
    normalizedWithFallbacks?.targetAudience.includes("builders"),
  "Normalization fills targetAudience fallback",
);
assert(
  normalizedWithFallbacks?.valueProposition.includes("source-backed") ||
    normalizedWithFallbacks?.valueProposition.includes("practical"),
  "Normalization fills valueProposition fallback",
);
assert(
  normalizedWithFallbacks?.sourceText.includes("FULL TRANSCRIPT"),
  "Normalization preserves full source text",
);

const normalizedComplete = normalizeValueBrief(
  {
    ideaTitle: "Lead Triage",
    pillar: "Automation",
    voiceMode: "Tool-Curator",
    format: "Article",
    sourceThesis: "Lead qualification can happen before a human replies.",
    sourceFacts: ["n8n checks lead forms before reply."],
    numbersMentioned: ["3 steps"],
    toolsMentioned: ["n8n", "Slack"],
    specificExamples: ["Qualified leads go to Slack."],
    mechanism: "Check the form, pull context, and notify the right person.",
    whyThisMatters: "Founders can reply faster.",
    targetAudience: "solo founders handling inbound manually",
    audiencePain: "they waste time checking every lead by hand",
    valueProposition: "qualify leads faster without hiring ops help",
    readerOutcome: "build a simple workflow that sends good leads to Slack",
    whyNow: "workflow tools are cheap enough to run this daily",
    contentPromise: "learn how to reply to good leads before they go cold",
    valuableAngles: ["Lead qualification before reply"],
    selectedAngle: "Qualify leads before replying",
    mustUseDetails: ["n8n", "Slack"],
    doNotInvent: ["Do not claim revenue lift."],
    suggestedStructure: "Pain, mechanism, workflow, payoff.",
  },
  source,
  "Automation",
);

assert(Boolean(normalizedComplete), "Normalization keeps complete brief");
if (normalizedComplete) {
  const rawData = buildIdeaPageRawData(normalizedComplete);
  assert(rawData.includes("Target Audience:"), "Idea page body includes target audience");
  assert(rawData.includes("Audience Pain:"), "Idea page body includes audience pain");
  assert(rawData.includes("Value Proposition:"), "Idea page body includes value proposition");
  assert(rawData.includes("Reader Outcome:"), "Idea page body includes reader outcome");
  assert(rawData.includes("Why Now:"), "Idea page body includes why now");
  assert(rawData.includes("Content Promise:"), "Idea page body includes content promise");
}

console.log("\n======================================");
if (failed > 0) {
  console.error(`❌ Test run failed: ${failed} failed assertions.`);
  process.exit(1);
}

console.log("🎉 ValueBrief tests passed successfully!");
process.exit(0);
