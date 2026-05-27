import OpenAI from "openai";
import dotenv from "dotenv";
import { CONTENT_PILLARS } from "./constants";
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

// Build pillar descriptions dynamically from constants.ts — single source of truth
const PILLAR_DESCRIPTIONS: Record<string, string> = {
  "Automation": "n8n, Make, Zapier, agentic workflows, multi-step AI pipelines, replacing human labour with AI agents, AI automation agencies (AIAA), autonomous systems, Apify web scraping, browser automation, API orchestration, webhook chains, no-code/low-code AI, trigger-based workflows, Trigger.dev, Temporal, LangChain agents, CrewAI, AutoGPT, custom GPTs as workers, RPA vs AI agents",
  "AI Creative": "AI-generated UGC ads, AI video (Kling, Runway, Pika, Sora, Luma, HeyGen, Synthesia), TikTok Shop automation, faceless content pages, monetising AI output, AI image generation (Midjourney, DALL-E, Flux, Stable Diffusion), AI voiceover (ElevenLabs, PlayHT), AI avatars, product photography automation, ad creative at scale, Canva AI, Adobe Firefly, ComfyUI workflows, LoRA training, consistent characters, AI music (Suno, Udio)",
  "AI Prompting & Tools": "Power user guides for Claude/ChatGPT/Gemini/Grok/Perplexity/DeepSeek, config hacks, hidden features, reverse prompting, tool comparisons, system prompts, prompt chaining, few-shot prompting, chain-of-thought, Claude Projects, Custom GPTs, Gemini Gems, API vs chat interface, context window optimization, MCP (Model Context Protocol), token cost optimization, model selection strategy, AI coding assistants, RAG pipelines, knowledge bases",
  "Vibe Coding": "Building software with AI (Cursor, Claude Code, Windsurf, Copilot, Cline, Aider, Replit Agent, Bolt, Lovable, v0), shipping products without traditional coding, indie hacker dev workflows, AI-assisted debugging, prompt-to-app, full-stack AI development, rapid prototyping, SaaS in a weekend, MCP servers, AI pair programming, code generation best practices, deploying AI-built apps (Vercel, Railway, Fly.io)",
  "Web3": "Crypto, DeFi, on-chain tools, token launches, Web3 community, NFT utility, DAOs, smart contracts, Solana, Base, Ethereum L2s, airdrop farming, Web3 marketing, crypto Twitter culture, on-chain analytics (Dune, Nansen), DEX trading, memecoin meta, Web3 x AI convergence, decentralized compute, tokenized AI agents",
  "Creator Economy": "Monetisation, audience building, newsletters (Beehiiv, Substack, ConvertKit), digital products (Gumroad, Lemon Squeezy, Whop), personal brand, platform growth tactics, X/Twitter growth, LinkedIn growth, YouTube automation, community building (Skool, Discord, Circle), sponsorship deals, paid communities, course creation, info products, creator tools, analytics and metrics, follower-to-revenue conversion, lead magnets, email funnels",
  "Copywriting and Storytelling": "Hook formulas, headline writing, persuasion, sales copy, tweet structure techniques, storytelling frameworks (PAS, AIDA, BAB), thread writing, long-form vs short-form, cold DM scripts, landing page copy, email sequences, power words, curiosity gaps, pattern interrupts, open loops, contrast hooks, specificity in copy, social proof framing, call-to-action psychology",
  "Psychology": "Behavioural psychology, decision-making biases (anchoring, loss aversion, social proof, scarcity), habit formation, mindset, productivity systems, dopamine and motivation, cognitive load theory, persuasion principles (Cialdini), attention economics, flow state, procrastination science, identity-based habits, mental models for creators, stoic philosophy for builders, burnout prevention, deep work, time blocking",
  "Personal/Vulnerability": "Personal stories, failures, lessons learned, behind-the-scenes, emotional resonance, imposter syndrome, career pivots, money transparency, relationship with work, mental health in tech, founder loneliness, public accountability, raw unfiltered takes, contrarian life decisions",
  "Building in Public": "Progress updates, revenue milestones, startup journeys, accountability, \"day N of building X\", MRR tracking, user growth sharing, product launches, feature shipping logs, indie hacking, solopreneur journey, transparent metrics, build logs, launch retrospectives, pivots and failures, open-source building, community feedback loops",
};

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
