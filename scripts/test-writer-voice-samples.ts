import { loadVoiceSamples } from "../src/trigger/idea-scout/write-tweets";
import { buildWriterPrompt, StrategyBrief, VoiceMode } from "../src/lib/voice-dna";

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
assert(handles.has("Dreyshq"), "Dreyshq samples are available");
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
}

console.log("\n======================================");
if (failed > 0) {
  console.error(`❌ Test run failed: ${failed} failed assertions.`);
  process.exit(1);
}

console.log("🎉 Writer voice sample tests passed successfully!");
process.exit(0);
