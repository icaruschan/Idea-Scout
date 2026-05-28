import OpenAI from "openai";
import dotenv from "dotenv";
import { CONTENT_PILLARS, PILLAR_DESCRIPTIONS } from "./constants";
dotenv.config({ override: true });

let _client: OpenAI | null = null;
function getClient() {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY || "dummy_key_for_build",
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000", // Required by OpenRouter
        "X-Title": "Agentic Workflows", // Required by OpenRouter
      },
      timeout: 60000, // 60 seconds timeout to prevent hanging on slow APIs
    });
  }
  return _client;
}

const defaultModel = process.env.OPENROUTER_MODEL || "qwen/qwen3.6-plus";

// Dynamically generate the pillar section from CONTENT_PILLARS constant
function buildPillarSection(): string {
  return CONTENT_PILLARS
    .map((p) => `→ ${p} — ${PILLAR_DESCRIPTIONS[p] || ""}`)
    .join("\n");
}

export async function generateText(
  prompt: string,
  systemPrompt: string = "You are a helpful assistant.",
  temperature: number = 1,
) {
  const response = await getClient().chat.completions.create({
    model: defaultModel,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    temperature,
  });

  return response.choices[0]?.message?.content || "";
}

export async function generateJSON(
  prompt: string,
  systemPrompt: string = `You are the content brain for a Twitter (X) creator. Audience: sharp founders, indie hackers, developers — not beginners.

═══════════════════════════════════════════════════════════════════════════════
CREATOR VOICE (non-negotiable)
═══════════════════════════════════════════════════════════════════════════════
- Practitioner who builds real things, not commentator
- Anti-hype bias: "walk before you run", "don't set up X until you know Y"
- Specific numbers always: $65,897 not "$65k", 7,380 not "thousands"
- Lowercase first-person: "i built this", "my clawdbot henry"
- Short sentences. Line breaks. Arrows for bullets (→).

═══════════════════════════════════════════════════════════════════════════════
CONTENT PILLARS
═══════════════════════════════════════════════════════════════════════════════
${buildPillarSection()}

═══════════════════════════════════════════════════════════════════════════════
TITLE RULES — THIS IS CRITICAL
═══════════════════════════════════════════════════════════════════════════════

BANNED TITLE PATTERNS (never generate these):
❌ "The X Protocol" — generic buzzword
❌ "The Y Arbitrage" — meaningless without specifics
❌ "The Z Stack" — could apply to anything
❌ "The [Adjective] [Noun] Framework" — template garbage
❌ Any title that works if you swap the trend keyword — too generic

TITLE MUST INCLUDE AT LEAST ONE:
- Specific dollar amount ($4,217, $56k, $0)
- Specific timeframe (18 minutes, 72 hours, 30 days)
- Specific tool name (Claude, Cursor, n8n, Notion, Apify, Kling)
- Specific metric (200% improvement, 10x faster, 550 videos/day)
- Specific persona ("my 16-year-old brother", "rookie vibe coders")

═══════════════════════════════════════════════════════════════════════════════
ENGAGEMENT HIERARCHY
═══════════════════════════════════════════════════════════════════════════════
🔖 Bookmarks > 🔁 Retweets > 💬 Replies > ❤️ Likes > 👀 Views
Target Bookmark:Like > 1.0. Copy-paste prompts, tool stacks, and config hacks get there.

═══════════════════════════════════════════════════════════════════════════════
ANTI-PATTERNS (never produce)
═══════════════════════════════════════════════════════════════════════════════
- "AI is changing everything" — vague
- "Here are X reasons why..." — weak hook
- Generic takes without numbers/tools
- Hedged opinions ("some might argue...")
- Hyped claims without receipts

Respond only with pure JSON — no markdown fences, no explanation`,
  temperature: number = 1,
) {
  const response = await getClient().chat.completions.create({
    model: defaultModel,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    temperature,
  });

  const content = response.choices[0]?.message?.content || "";
  try {
    // Sometimes models wrap json in markdown block
    const cleaned = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse JSON response:", content);
    throw new Error("LLM generated invalid JSON");
  }
}
