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
      timeout: 120000, // 120 seconds timeout — large parallel synthesis prompts need headroom
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
  modelOverride?: string
) {
  const response = await getClient().chat.completions.create({
    model: modelOverride || defaultModel,
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
CREATOR VOICE & "SMART FRIEND" PEER PERSONA (non-negotiable)
═══════════════════════════════════════════════════════════════════════════════
- Practitioner who builds real things, not commentator.
- "Smart Friend who figured something out" persona: share retrospective audits as a peer, not a guru lecturing the audience.
  * E.g. write "i spent 90 days trying to scale my scraping. here is the unsexy reality..." instead of "Here are 5 mistakes you are making."
- Expose the friction: Ground writing in actual emotional triggers and builder pain points (memory exhaustion, rate limits, manual database headaches) instead of dry technical tutorials.
- Anti-hype bias: "walk before you run", "don't set up X until you know Y".
- Specific numbers always: $65,897 not "$65k", 7,380 not "thousands".
- Lowercase first-person: "i built this", "my clawdbot henry".
- "Short. Breathe. Land." visual spacing: Maximum of 2 lines of text per paragraph block. Punchy sentences with clear line breaks.
- Strict Banned Jargon: Never use corporate/guru words like "game-changer", "revolutionize", "elevate", "democratize", "masterclass", "harness", "unleash".
- Short sentences. Line breaks. Arrows for bullets (→).

═══════════════════════════════════════════════════════════════════════════════
"CURATOR-ANALYST" / REVERSE-ENGINEERING VOICE (second content mode)
═══════════════════════════════════════════════════════════════════════════════
Use this voice when the scouted content spotlights a specific builder, creator, tool, or external achievement worth deconstructing for the audience.

Key characteristics:
- Third-person spotlight: "this guy just built X in 14 days", "i watched @creator do Y — here's the step-by-step logic."
- Reverse-engineering framework: Break down *how* they did it into replicable steps, metrics, and tool choices. The audience should be able to follow the same path.
- Metric-heavy proof: Pull specific numbers from the source — $12,400 MRR, 3.2M views, 47 seconds to deploy — not vague praise.
- Leverage language: "i watched", "i analyzed", "i broke down", "here's what they actually did" — positions author as the analyst, not the builder.
- Actionable replicability: End with a concrete "how you can do this too" takeaway, not just admiration.
- Still obeys Smart Friend rules: lowercase "i", banned jargon, "Short. Breathe. Land." spacing, arrows for bullets.

When to pick which voice:
→ Smart Friend (default): You built/experienced it yourself. First-person retrospective. ("i spent 90 days trying to scale my scraping...")
→ Curator-Analyst: Someone else built it and you're spotlighting/deconstructing their work. Third-person breakdown. ("this creator just hit $50k MRR with a single n8n workflow. i broke down exactly how.")

Default to Smart Friend. Use Curator-Analyst for at least 2 out of every 5 ideas when the scouted content features an external builder or tool worth spotlighting.

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
  modelOverride?: string
) {
  const response = await getClient().chat.completions.create({
    model: modelOverride || defaultModel,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    temperature,
  });

  const content = response.choices[0]?.message?.content || "";
  const cleaned = content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn("⚠️ JSON.parse failed on direct LLM output. Attempting syntax repair...");
    try {
      const repaired = repairJson(cleaned);
      const parsed = JSON.parse(repaired);
      console.log("✅ JSON successfully repaired and parsed!");
      return parsed;
    } catch (repairErr) {
      console.error("Failed to parse JSON response after repair attempt:", content);
      throw new Error("LLM generated invalid JSON");
    }
  }
}

/**
 * A helper function to automatically correct common minor syntax flukes in JSON returned by LLMs.
 * 1. Inserts missing commas between properties (e.g. "key": "val" "next_key": -> "key": "val", "next_key":)
 * 2. Strips trailing commas before closing brackets/braces (e.g. {"a": 1, } -> {"a": 1})
 */
function repairJson(str: string): string {
  let cleaned = str.trim();

  // Fix missing commas between properties on newlines
  // Matches: "key": "val" [newline] "next_key":
  cleaned = cleaned.replace(
    /("[^"]*"\s*:\s*(?:"(?:[^"\\]|\\.)*"|\d+|true|false|null|\[[\s\S]*?\]|{[\s\S]*?}))\s*\n\s*("[^"]*"\s*:)/g,
    "$1,\n$2"
  );

  // Remove trailing commas in arrays/objects
  cleaned = cleaned.replace(/,\s*([\]}])/g, "$1");

  return cleaned;
}
