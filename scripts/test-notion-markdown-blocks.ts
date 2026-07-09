import { markdownToNotionBlocks } from "../src/lib/notion-markdown-blocks";
import {
  buildStrategistBriefMarkdown,
  buildVisibleIdeaPageMarkdown,
  normalizeHookTemplate,
} from "../src/lib/idea-page-blocks";
import { ExecutionPlan } from "../src/lib/voice-dna";

let failed = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    failed++;
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log("=== RUNNING NOTION MARKDOWN BLOCK TESTS ===");

const blocks = markdownToNotionBlocks(
  "## Hook\nEveryone tells you to build AI skills.\n\n## Outline\n\n1. First section\n2. Second section\n\n- bullet one\n- bullet two",
);

assert(
  blocks.some((b) => b.type === "heading_2"),
  "Markdown parser emits heading_2 blocks",
);
assert(
  blocks.filter((b) => b.type === "heading_2").length === 2,
  "Two heading_2 blocks parsed",
);
assert(
  blocks.some((b) => b.type === "numbered_list_item"),
  "Numbered list items parsed",
);
assert(
  blocks.some((b) => b.type === "bulleted_list_item"),
  "Bulleted list items parsed",
);

const longPara = "word ".repeat(500).trim();
const longBlocks = markdownToNotionBlocks(longPara);
assert(longBlocks.length === 1, "Single paragraph stays one block");
const richText = (longBlocks[0] as any).paragraph?.rich_text || [];
const combined = richText.map((r: any) => r.text.content).join("");
assert(
  !combined.includes("wordwo"),
  "Paragraph rich_text chunks do not break mid-word in block split",
);

assert(
  normalizeHookTemplate({ template: "Never ever [mistake]" }) ===
    "Never ever [mistake]",
  "normalizeHookTemplate extracts template field from object",
);
assert(normalizeHookTemplate("[object Object]") === "[object Object]", "String passthrough");

const plan = {
  ideaTitle: "The Compounding Stack",
  format: "Article",
  selectedAngle: "Second brain architecture guide",
  hookFilledExample: "Everyone tells you to build AI skills.",
  hookTemplate: { template: "Never ever [mistake]" },
  comprehensionSummary: "Sales OS on Claude Code.",
  targetAudience: "founders",
  audiencePain: "scattered context",
  creatorDoing: "screen recording",
  sourceUrl: "https://example.com/video",
  voiceMode: "Tool-Curator",
  pillar: "Automation",
  talkingPoints: ["Point A", "Point B"],
  stepByStepProcess: ["1. Connect CRM", "2. Build folders"],
  mustUseDetails: ["Fireflies first"],
} as ExecutionPlan;

const visible = buildVisibleIdeaPageMarkdown(plan);
assert(visible.includes("## Hook"), "Visible page markdown includes Hook section");
assert(visible.includes("## Draft"), "Visible page includes Draft placeholder");
assert(!visible.includes("## Outline"), "Outline stays out of visible section");

const brief = buildStrategistBriefMarkdown(plan);
assert(brief.includes("## Outline"), "Strategist brief includes outline");
assert(brief.includes("## Talking Points"), "Strategist brief includes talking points");
assert(brief.includes("Never ever [mistake]"), "Strategist brief has normalized hook template");

console.log("\n======================================");
if (failed > 0) {
  console.error(`❌ Test run failed: ${failed} failed assertions.`);
  process.exit(1);
}

console.log("🎉 Notion markdown block tests passed successfully!");
process.exit(0);