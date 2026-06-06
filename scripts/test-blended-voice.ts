import dotenv from "dotenv";
import { generateText } from "../src/lib/llm";
import { VOICE_DNA_PROMPT } from "../src/lib/voice-dna";

dotenv.config({ override: true });

async function run() {
  console.log("🧬 Starting Blended Voice Test...");

  const testIdeas = [
    {
      framework: "Sharbel's SaaS-Killer Framework",
      type: "Curator-Builder (Open-Source Alternative)",
      concept: "n8n (open-source backend) vs Zapier ($20-$100/mo subscription for high-volume automated webhook mapping)."
    },
    {
      framework: "Sharbel's Macro Narrative Case-Study",
      type: "Curator-Builder (Industry Paradigm Shift)",
      concept: "A lone developer building a production micro-SaaS with zero code using only Cursor Composer and custom MCP tools in 24 hours."
    },
    {
      framework: "Zaimiri's Reputation / Taste Warning",
      type: "Reflective Operator (Long-term Capital)",
      concept: "Warning small tech creators against promoting cheap, unverified AI wrappers or tools that they wouldn't use themselves in production."
    },
    {
      framework: "Zaimiri's Analogical Concept Explainer",
      type: "Reflective Operator (Technical Simplifier)",
      concept: "Explaining how MCP (Model Context Protocol) connects agents to databases and file systems."
    }
  ];

  for (const idea of testIdeas) {
    console.log(`\n\n======================================================================`);
    console.log(`🎬 Framework: ${idea.framework}`);
    console.log(`💡 Concept: ${idea.concept}`);
    console.log(`======================================================================`);

    const prompt = `Write a ready-to-post tweet draft or short thread about the following concept.
    
Concept: "${idea.concept}"
Target Framework: "${idea.framework}"

You MUST write this following the instructions in the VOICE_DNA_PROMPT. Apply the mechanical rules (lengths, spacing, paragraph constraints, word limits per line) and qualitative guidelines.
Make sure to strictly emulate the targeted framework's structural flow:
- For SaaS-Killer: Pain -> Open-source alternative -> Indented feature list using '→' -> Cost comparison block -> Github stars & license -> "100% Open Source."
- For Macro Case-Study: Narrative hook -> Direct quote/stat -> Paradigm shift shift -> "What happens when...?" question.
- For Reputation Warning: Direct warning -> Trap narrative -> Personal scar tissue -> Taste/Trust list -> Philosophical closing.
- For Concept Explainer: Simple version hook -> Nested analogical stack -> Tool requirements -> "Massive upgrade." close.

Do not output anything else, only the draft.`;

    try {
      const draft = await generateText(prompt, VOICE_DNA_PROMPT, 0.7, "qwen/qwen3.6-plus");
      console.log(draft);
    } catch (err: any) {
      console.error(`❌ Failed:`, err.message || err);
    }
  }
}

run();

