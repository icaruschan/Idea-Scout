import OpenAI from "openai";
import dotenv from "dotenv";
import { CONTENT_PILLARS, PILLAR_DESCRIPTIONS } from "./constants";
import { VOICE_DNA_PROMPT } from "./voice-dna";
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
      timeout: 120000, // 120 seconds timeout — large source-study prompts need headroom
    });
  }
  return _client;
}

// ─── TokenRouter client (MiniMax-M3 — free tier) ────────────────────────────
export const MODELS = {
  STRATEGIST: "MiniMax-M3",
  WRITER: "x-ai/grok-4.3",
} as const;

const MINIMAX_MODEL = MODELS.STRATEGIST;
let _tokenRouterClient: OpenAI | null = null;
function getTokenRouterClient() {
  if (!_tokenRouterClient) {
    _tokenRouterClient = new OpenAI({
      apiKey: process.env.TOKENROUTER_API_KEY || "",
      baseURL: "https://api.tokenrouter.com/v1",
      timeout: 120000,
    });
  }
  return _tokenRouterClient;
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

export interface TokenRouterTextResult {
  content: string;
  finishReason: string | null;
}

/** Writer path — TokenRouter only (Idea Scout). */
export async function generateTextTokenRouter(
  prompt: string,
  systemPrompt: string,
  temperature: number = 0.7,
  model: string = MODELS.WRITER,
  maxTokens?: number,
): Promise<TokenRouterTextResult> {
  const response = await getTokenRouterClient().chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    temperature,
    ...(maxTokens ? { max_tokens: maxTokens } : {}),
  });

  const choice = response.choices[0];
  return {
    content: choice?.message?.content || "",
    finishReason: choice?.finish_reason ?? null,
  };
}

export async function generateJSON(
  prompt: string,
  systemPrompt: string = `You are the content brain for a Twitter (X) creator. Audience: sharp founders, indie hackers, developers — not beginners.

═══════════════════════════════════════════════════════════════════════════════
VOICE DNA — DATA-DRIVEN WRITING GUIDE (non-negotiable)
═══════════════════════════════════════════════════════════════════════════════
${VOICE_DNA_PROMPT}

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
 * generateJSONFree — tries MiniMax-M3 via TokenRouter (free) first.
 * Falls back to the specified OpenRouter model on any error.
 * Automatically strips MiniMax's <think> chain-of-thought tags before parsing.
 */
export async function generateJSONFree(
  prompt: string,
  systemPrompt: string,
  temperature: number = 1,
  _ignoredFallbackModel?: string,
  retries: number = 1
): Promise<any> {
  try {
    const response = await getTokenRouterClient().chat.completions.create({
      model: MINIMAX_MODEL,
      stream: false as any,
      temperature,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });

    const raw = response.choices[0]?.message?.content || "";
    // Strip <think> chain-of-thought tags MiniMax-M3 emits
    const content = raw.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    const cleaned = content.replace(/```json/g, "").replace(/```/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    const jsonStr = match ? match[0] : cleaned;

    try {
      return JSON.parse(jsonStr);
    } catch {
      console.warn("⚠️ MiniMax JSON.parse failed, attempting repair...");
      return JSON.parse(repairJson(jsonStr));
    }
  } catch (err) {
    if (retries > 0) {
      console.warn(`⚠️ MiniMax-M3 failed, retrying (${retries} left)... Error:`, (err as Error).message);
      return generateJSONFree(prompt, systemPrompt, temperature, undefined, retries - 1);
    }
    console.error("❌ MiniMax-M3 failed after retries. Error:", (err as Error).message);
    throw err;
  }
}

/**
 * Strategist path — MiniMax M3 via TokenRouter only. No OpenRouter fallback.
 * Idea Scout skips the source on failure.
 */
export async function generateJSONStrategist(
  prompt: string,
  systemPrompt: string,
  temperature: number = 0.4,
): Promise<Record<string, unknown>> {
  const response = await getTokenRouterClient().chat.completions.create({
    model: MINIMAX_MODEL,
    stream: false as any,
    temperature,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
  });

  const raw = response.choices[0]?.message?.content || "";
  const content = raw.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  const cleaned = content.replace(/```json/g, "").replace(/```/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  const jsonStr = match ? match[0] : cleaned;

  try {
    return JSON.parse(jsonStr) as Record<string, unknown>;
  } catch {
    console.warn("⚠️ Strategist JSON.parse failed, attempting repair...");
    return JSON.parse(repairJson(jsonStr)) as Record<string, unknown>;
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
