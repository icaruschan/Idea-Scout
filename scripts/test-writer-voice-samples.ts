import { loadVoiceSamples } from "../src/trigger/idea-scout/write-tweets";
import {
  buildWriterPrompt,
  StrategyBrief,
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

const sampleStrategy: StrategyBrief = {
  title: "Voice Sample Test",
  pillar: "Automation",
  voiceMode: "Builder-Retrospective",
  appliedFramework: "General Blended",
  hookAngle: "Show a practical automation lesson",
  whyItWorks: "It gives builders a concrete takeaway",
  format: "Thread",
  stealablePattern: "Specific problem into repeatable steps",
  tweetStructure: "Hook, context, steps, payoff",
  crossPollinationLogic: "Test strategy only",
};

for (const voiceMode of voiceModes) {
  const prompt = buildWriterPrompt(
    { ...sampleStrategy, voiceMode },
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

  const selected = selectVoiceSamples(samples, voiceMode === "Tool-Curator" ? "sharbel" : voiceMode === "Case-Study" ? "zaimiri" : "Dreyshq", voiceMode);
  assert(
    selected.length <= VOICE_EXAMPLES_PER_PROMPT,
    `${voiceMode} selector returns at most ${VOICE_EXAMPLES_PER_PROMPT} samples`,
  );
}

const builderPrompt = buildWriterPrompt(
  { ...sampleStrategy, voiceMode: "Builder-Retrospective" },
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
