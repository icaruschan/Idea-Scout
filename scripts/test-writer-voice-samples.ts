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
  targetAudience: "solo founders qualifying inbound leads by hand",
  audiencePain: "they reply late because every lead takes manual checking",
  valueProposition: "show them how to qualify leads faster without hiring ops help",
  readerOutcome: "they can design a simple n8n workflow that sends the best leads to Slack",
  whyNow: "AI workflow tools are cheap enough for solo operators to use daily",
  contentPromise: "learn how to turn messy lead forms into faster replies",
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

  assert(
    prompt.systemPrompt.includes("Plain-language rule") ||
      prompt.systemPrompt.includes("PLAIN-LANGUAGE RULE"),
    `${voiceMode} prompt includes plain-language rule`,
  );

  assert(
    prompt.systemPrompt.includes("routing system") &&
      prompt.systemPrompt.includes("operational layer") &&
      prompt.systemPrompt.includes("signal extraction workflow"),
    `${voiceMode} prompt includes fake-smart language anti-patterns`,
  );

  assert(
    prompt.systemPrompt.includes("Cursor") &&
      prompt.systemPrompt.includes("Claude Code") &&
      prompt.systemPrompt.includes("n8n") &&
      prompt.systemPrompt.includes("MCP"),
    `${voiceMode} prompt allows niche-native terms`,
  );

  assert(
    prompt.userPrompt.includes("Target Audience:") &&
      prompt.userPrompt.includes("solo founders qualifying inbound leads by hand"),
    `${voiceMode} prompt includes target audience`,
  );

  assert(
    prompt.userPrompt.includes("Value Proposition:") &&
      prompt.userPrompt.includes("qualify leads faster"),
    `${voiceMode} prompt includes value proposition`,
  );

  assert(
    prompt.userPrompt.includes("Content Promise:") &&
      prompt.userPrompt.includes("messy lead forms"),
    `${voiceMode} prompt includes content promise`,
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

const articlePrompt = buildWriterPrompt(
  { ...sampleValueBrief, format: "Article" },
  sampleValueBrief.voiceMode,
  samples,
);
assert(
  articlePrompt.userPrompt.includes("complete workflow") &&
    articlePrompt.userPrompt.includes("deep argument") &&
    articlePrompt.userPrompt.includes("several examples") &&
    articlePrompt.userPrompt.includes("long-form breakdown"),
  "Article format instructions mention workflow/depth triggers",
);

const threadPrompt = buildWriterPrompt(
  { ...sampleValueBrief, format: "Thread" },
  sampleValueBrief.voiceMode,
  samples,
);
assert(
  threadPrompt.userPrompt.includes("5-8 teachable steps") &&
    threadPrompt.userPrompt.includes("lessons") &&
    threadPrompt.userPrompt.includes("examples"),
  "Thread format instructions mention steps/lessons/examples",
);

const shortPrompt = buildWriterPrompt(
  { ...sampleValueBrief, format: "Short" },
  sampleValueBrief.voiceMode,
  samples,
);
assert(
  shortPrompt.userPrompt.includes("one punchy, self-contained insight"),
  "Short format instructions stay narrow",
);

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
