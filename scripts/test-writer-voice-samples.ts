import { loadVoiceSamples } from "../src/trigger/idea-scout/write-tweets";
import {
  buildWriterPrompt,
  ContentFormat,
  ValueBrief,
  VoiceMode,
  VOICE_EXAMPLES_PER_PROMPT,
  selectVoiceSamples,
} from "../src/lib/voice-dna";

const samples = loadVoiceSamples();
let failed = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    failed++;
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log("=== RUNNING WRITER VOICE SAMPLE TESTS ===");

assert(samples.length > 0, "Committed voice samples load from src/data");

const handles = new Set(samples.map((sample: any) => sample.handle));
const dreyshqSamples = samples.filter((s: any) => s.handle === "Dreyshq");
assert(dreyshqSamples.length >= 30, `Dreyshq has at least 30 samples (Found: ${dreyshqSamples.length})`);
assert(handles.has("sharbel"), "Sharbel samples are available");
assert(handles.has("zaimiri"), "Zaimiri samples are available");

const voiceModes: VoiceMode[] = [
  "Builder-Retrospective",
  "Tool-Curator",
  "Case-Study",
];

const sampleValueBrief: ValueBrief = {
  ideaTitle: "Transcript Value Test",
  sourcePageId: "3674a5db-f371-80ad-8ec6-f3e99bdd4191",
  sourceTitle: "How an n8n workflow triages inbound leads",
  sourceUrl: "https://example.com/source",
  platform: "YouTube",
  pillar: "Automation",
  voiceMode: "Builder-Retrospective",
  format: "Thread",
  sourceText: "FULL TRANSCRIPT: The workflow uses n8n, Airtable, and Slack to qualify leads before a human replies.",
  sourceThesis: "A simple routing workflow can remove manual lead triage.",
  sourceFacts: [
    "The workflow qualifies inbound leads before a human replies.",
    "Slack is used for the final notification step.",
  ],
  numbersMentioned: ["3-step routing workflow"],
  toolsMentioned: ["n8n", "Airtable", "Slack"],
  specificExamples: ["Inbound leads are scored before the handoff."],
  mechanism: "Use automation to classify, enrich, score, and route each lead.",
  whyThisMatters: "It shows builders how to remove repetitive qualification work.",
  valuableAngles: ["Lead triage as an automation primitive"],
  selectedAngle: "Turn lead triage into a routing system",
  mustUseDetails: ["n8n", "Airtable", "Slack", "lead qualification before human reply"],
  doNotInvent: ["Do not claim revenue lift.", "Do not say the creator personally built it."],
  suggestedStructure: "Hook, source mechanism, 3 steps, practical takeaway.",
  priority: "💡 Good",
  appliedFramework: "Concept Explainer",
  stealablePattern: "Mechanism breakdown",
};

for (const voiceMode of voiceModes) {
  const prompt = buildWriterPrompt(
    { ...sampleValueBrief, voiceMode },
    voiceMode,
    samples,
  );

  assert(
    prompt.userPrompt.includes("Example 1:"),
    `${voiceMode} prompt includes few-shot examples`,
  );

  assert(
    !prompt.userPrompt.includes(`Example ${VOICE_EXAMPLES_PER_PROMPT + 1}:`),
    `${voiceMode} prompt respects VOICE_EXAMPLES_PER_PROMPT limit`,
  );

  assert(
    prompt.userPrompt.includes("FULL SOURCE TEXT / TRANSCRIPT"),
    `${voiceMode} prompt includes full source context section`,
  );

  assert(
    prompt.userPrompt.includes("The workflow qualifies inbound leads before a human replies."),
    `${voiceMode} prompt includes source facts`,
  );

  assert(
    prompt.systemPrompt.includes("Do not invent metrics"),
    `${voiceMode} prompt includes anti-invention rules`,
  );

  const selected = selectVoiceSamples(
    samples,
    voiceMode === "Tool-Curator" ? "sharbel" : voiceMode === "Case-Study" ? "zaimiri" : "Dreyshq",
    voiceMode,
  );
  assert(
    selected.length <= VOICE_EXAMPLES_PER_PROMPT,
    `${voiceMode} selector returns at most ${VOICE_EXAMPLES_PER_PROMPT} samples`,
  );
}

const formats: Record<ContentFormat, string> = {
  Short: "Draft ONE short tweet.",
  "Mid-length": "Draft ONE mid-length tweet.",
  Thread: "Draft a valuable thread.",
  Article: "Draft the final LONG-FORM ARTICLE.",
};

for (const [format, expectedInstruction] of Object.entries(formats) as [ContentFormat, string][]) {
  const prompt = buildWriterPrompt(
    { ...sampleValueBrief, format },
    sampleValueBrief.voiceMode,
    samples,
  );
  assert(
    prompt.userPrompt.includes(expectedInstruction),
    `${format} receives distinct format instructions`,
  );
}

const builderPrompt = buildWriterPrompt(
  { ...sampleValueBrief, voiceMode: "Builder-Retrospective" },
  "Builder-Retrospective",
  samples,
);
const exampleCount = builderPrompt.userPrompt.split("Example ").length - 1;
assert(
  exampleCount === VOICE_EXAMPLES_PER_PROMPT,
  `Builder-Retrospective prompt includes exactly ${VOICE_EXAMPLES_PER_PROMPT} examples (found ${exampleCount})`,
);
assert(
  /idea scout|automation|vibe coding|i built|i spent/i.test(builderPrompt.userPrompt),
  "Builder-Retrospective few-shots skew toward builder/automation voice",
);

console.log("\n======================================");
if (failed > 0) {
  console.error(`❌ Test run failed: ${failed} failed assertions.`);
  process.exit(1);
}

console.log("🎉 Writer voice sample tests passed successfully!");
process.exit(0);
