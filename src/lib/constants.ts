export const NOTION_DATABASE_IDS = {
  VIRAL_POST_LIBRARY: "9c392141-a928-4813-a18e-676560fc4f62",
  IDEAS_BANK: "38f85f8c-eccf-4679-a2d3-6c0e6d386e7d",
  CONTENT_PIPELINE: "8cc7a479-7eea-4092-a11b-81381d4524b0",
  MY_CONTENT_TRACKER: "69f828a6-5d4d-4ae1-bd62-b415abefe757",
  CREATORS: "18d75163-a3d6-455d-9d3d-2076f20d2fed",
  TRENDING_TOPICS: "3174a5db-f371-80cc-94a0-e4753a115f3a",
  YOUTUBE_CREATORS: "3674a5db-f371-80f9-8822-c0459d34168e",
  INSTAGRAM_CREATORS: "3674a5db-f371-809a-88a9-d122c712139b",
  SCOUTED_CONTENT: "3674a5db-f371-80ad-8ec6-f3e99bdd4191",
  TASTE_PROFILES: "fb5e5bd1-9ff3-4a4c-a369-3f7f8322bc8a",
};

export const NOTION_DATA_SOURCE_IDS = {
  VIRAL_POST_LIBRARY: "93504640-6cf8-4676-9b4a-f74c8b706387",
  IDEAS_BANK: "553eb2c3-82cb-4fb7-abff-6652cb694e4a",
  TRENDING_TOPICS: "3174a5db-f371-800c-b1a4-000bbeb4c669",
  MY_CONTENT_TRACKER: "75600b9e-4eba-4594-92ac-ce01fa85b0a8",
  CONTENT_PIPELINE: "4bfdc801-348f-4203-8966-9720d3e11088",
  CREATORS: "24e6bb9b-b226-4ff6-86b4-f6a72493029d",
  YOUTUBE_CREATORS: "3674a5db-f371-80d3-bac9-000befffdd42",
  INSTAGRAM_CREATORS: "3674a5db-f371-80d2-bece-000b0dd38da2",
  SCOUTED_CONTENT: "3674a5db-f371-802c-b23e-000b7d73be04",
  TASTE_PROFILES: "39652859-413b-42aa-8d75-0ac42e24a7fc",
};

/**
 * The 8 ACTIVE content pillars used by the Idea Scout pipeline.
 * Psychology is FROZEN — existing data stays, but no new ideas are generated for it.
 * "Copywriting" was renamed to "Copywriting and Storytelling" in v2.
 */
export const CONTENT_PILLARS = [
  "Automation",
  "AI Creative",
  "AI Prompting & Tools",
  "Vibe Coding",
  "Creator Economy",
  "Copywriting and Storytelling",
  "Personal/Vulnerability",
  "Building in Public",
];

/** Legacy pillars kept for backwards compatibility with existing Notion data */
export const FROZEN_PILLARS = ["Psychology", "Web3"];

// Build pillar descriptions dynamically from constants.ts — single source of truth
export const PILLAR_DESCRIPTIONS: Record<string, string> = {
  "Automation": "n8n, Make, Zapier, agentic workflows, multi-step AI pipelines, replacing human labour with AI agents, AI automation agencies (AIAA), autonomous systems, Apify web scraping, browser automation, API orchestration, webhook chains, no-code/low-code AI, trigger-based workflows, Trigger.dev, Temporal, LangChain agents, CrewAI, AutoGPT, custom GPTs as workers, RPA vs AI agents",
  "AI Creative": "AI-generated UGC ads, AI video (Kling, Runway, Pika, Sora, Luma, HeyGen, Synthesia), TikTok Shop automation, faceless content pages, monetising AI output, AI image generation (Midjourney, DALL-E, Flux, Stable Diffusion), AI voiceover (ElevenLabs, PlayHT), AI avatars, product photography automation, ad creative at scale, Canva AI, Adobe Firefly, ComfyUI workflows, LoRA training, consistent characters, AI music (Suno, Udio)",
  "AI Prompting & Tools": "Power user guides for Claude/ChatGPT/Gemini/Grok/Perplexity/DeepSeek, config hacks, hidden features, reverse prompting, tool comparisons, system prompts, prompt chaining, few-shot prompting, chain-of-thought, Claude Projects, Custom GPTs, Gemini Gems, API vs chat interface, context window optimization, MCP (Model Context Protocol), token cost optimization, model selection strategy, AI coding assistants, RAG pipelines, knowledge bases",
  "Vibe Coding": "Building software with AI (Cursor, Claude Code, Windsurf, Copilot, Cline, Aider, Replit Agent, Bolt, Lovable, v0), shipping products without traditional coding, indie hacker dev workflows, AI-assisted debugging, prompt-to-app, full-stack AI development, rapid prototyping, SaaS in a weekend, MCP servers, AI pair programming, code generation best practices, deploying AI-built apps (Vercel, Railway, Fly.io)",
  "Creator Economy": "Monetisation, audience building, newsletters (Beehiiv, Substack, ConvertKit), digital products (Gumroad, Lemon Squeezy, Whop), personal brand, platform growth tactics, X/Twitter growth, LinkedIn growth, YouTube automation, community building (Skool, Discord, Circle), sponsorship deals, paid communities, course creation, info products, creator tools, analytics and metrics, follower-to-revenue conversion, lead magnets, email funnels",
  "Copywriting and Storytelling": "Hook formulas, headline writing, persuasion, sales copy, tweet structure techniques, storytelling frameworks (PAS, AIDA, BAB), thread writing, long-form vs short-form, cold DM scripts, landing page copy, email sequences, power words, curiosity gaps, pattern interrupts, open loops, contrast hooks, specificity in copy, social proof framing, call-to-action psychology",
  "Personal/Vulnerability": "Personal stories, failures, lessons learned, behind-the-scenes, emotional resonance, imposter syndrome, career pivots, money transparency, relationship with work, mental health in tech, founder loneliness, public accountability, raw unfiltered takes, contrarian life decisions",
  "Building in Public": "Progress updates, revenue milestones, startup journeys, accountability, \"day N of building X\", MRR tracking, user growth sharing, product launches, feature shipping logs, indie hacking, solopreneur journey, transparent metrics, build logs, launch retrospectives, pivots and failures, open-source building, community feedback loops",
};


export const TWITTER_FILTER_THRESHOLDS = {
  MIN_VIEWS: parseInt(process.env.TWITTER_MIN_VIEWS || "3000", 10),
};
