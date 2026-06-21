/**
 * MiniMax-M3 Full Pipeline Simulation
 * ─────────────────────────────────────
 * Simulates the FULL process-content flow (filter + summarize)
 * AND disambiguation edge cases — using only MiniMax-M3.
 *
 * ⚠️  No Notion writes. No OpenRouter. No Apify. No paid APIs touched.
 */
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.tokenrouter.com/v1",
  apiKey: "sk-5ZR6j6adOmAPTIvqRMHDE8fhBGrpuMHrIPMzUMmWujVbJd1u",
});

const RELEVANCE_SYSTEM_PROMPT = `You are a content relevance analyst for a Twitter (X) creator who covers AI, automation, coding, and creator economy topics.

THE 8 ACTIVE CONTENT PILLARS:
1. Automation (n8n, Make.com, AI agents, pipelines)
2. AI Creative (AI video/image gen, UGC, ad creatives)
3. AI Prompting & Tools (prompt engineering, Claude, ChatGPT tips)
4. Vibe Coding (Cursor, Claude Code, coding with LLMs)
5. Creator Economy (audience growth, monetization, digital products)
6. Copywriting and Storytelling (hooks, tweet structures)
7. Personal/Vulnerability (founder stories, failures, transparency)
8. Building in Public (MRR milestones, shipping, build logs)

DISAMBIGUATION — verify context before matching any ambiguous term:
- "Kimi" → relevant ONLY if discussing the AI model, NOT F1 racing
- "Amen" → relevant ONLY if discussing tech/tools, NOT sports
- "Game 2" → relevant ONLY if about gamification, NOT sports playoffs
- RULE: If a word could mean pop culture/sports, verify context is tech/business first.

REJECT if: generic hype, no actionable angle, entertainment, non-English content, VC fundraising with no builder story.

Respond with pure JSON — no markdown fences.`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripThinkTags(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}

async function callJSON<T>(
  userPrompt: string,
  label: string,
  temp = 0.3
): Promise<{ data: T | null; tokens: number; latencyMs: number; error?: string }> {
  const start = Date.now();
  try {
    const res = await client.chat.completions.create({
      model: "MiniMax-M3",
      stream: false,
      temperature: temp,
      max_tokens: 600,
      messages: [
        { role: "system", content: RELEVANCE_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });
    const latencyMs = Date.now() - start;
    const raw = stripThinkTags(res.choices[0].message.content ?? "");
    const tokens = res.usage?.total_tokens ?? 0;

    // Extract JSON even if wrapped in backticks
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object found in response");
    const data = JSON.parse(match[0]) as T;
    return { data, tokens, latencyMs };
  } catch (err: any) {
    return { data: null, tokens: 0, latencyMs: Date.now() - start, error: err?.message ?? String(err) };
  }
}

// ─── Content Items ────────────────────────────────────────────────────────────

const FULL_FLOW_ITEMS = [
  {
    label: "n8n Automation Tutorial",
    platform: "YouTube",
    creatorName: "Liam Ottley",
    title: "I Automated My Entire Business With n8n (Here's Every Workflow)",
    content: `After 6 months of building, I finally automated 90% of my business operations using n8n. Here's every workflow I built:

1. Lead capture → CRM update → Slack notification (saves 2hrs/day)
2. Invoice generation → Stripe payment → Notion update (fully hands-off)
3. Customer support email triage → GPT-4 draft → Gmail send (handles 80% without me)
4. Social media repurposing: long video → transcript → 10 tweets → scheduled posts
5. Weekly analytics report: GA4 + Stripe + Twitter → PDF → email to myself

Total time to build all workflows: 40 hours over 6 months
Time saved per week: ~18 hours
Monthly cost: $45 (n8n cloud) + $30 (API costs)

Net ROI: Thousands per month in reclaimed time. If you're not automating your business in 2025, you're leaving money on the table.`,
    likes: 8400,
    views: 210000,
    comments: 720,
  },
];

const EDGE_CASE_ITEMS = [
  {
    label: "🔴 EDGE: 'Kimi' — F1 driver, should FAIL",
    platform: "YouTube",
    creatorName: "F1TV",
    title: "Kimi Antonelli's First F1 Win: Full Race Breakdown",
    content: `18-year-old Kimi Antonelli secured his maiden Formula 1 victory at the Spanish Grand Prix, driving for Mercedes AMG Petronas. The young Italian prodigy showed remarkable composure under pressure, managing tire degradation perfectly over 66 laps. His win marks the start of what many believe will be a legendary career in motorsport.`,
    likes: 45000,
    views: 1800000,
    comments: 3200,
  },
  {
    label: "🟡 EDGE: 'Kimi' — AI model, should PASS",
    platform: "X",
    creatorName: "rohanpaul_ai",
    title: "Kimi K2 just destroyed GPT-4o on coding benchmarks",
    content: `Kimi K2 from Moonshot AI dropped today and the numbers are wild:

- HumanEval: 94.2% (GPT-4o: 87.1%)  
- SWE-bench: 65.8% (Claude Sonnet: 49%)
- Context window: 128K tokens
- Price: $0.15/1M input tokens

I tested it on 50 real-world coding tasks. It rewrote a 2,000-line Python codebase in 4 minutes with zero errors.

This is the model I'm switching my Cursor background agent to immediately.`,
    likes: 6200,
    views: 280000,
    comments: 890,
  },
  {
    label: "🔴 EDGE: VC fundraising, no builder angle, should FAIL",
    platform: "X",
    creatorName: "TechCrunch",
    title: "OpenAI raises $40B at $340B valuation",
    content: `OpenAI has closed its largest funding round to date: $40 billion at a $340 billion post-money valuation. Lead investors include SoftBank, Microsoft, and a consortium of sovereign wealth funds from the UAE and Saudi Arabia. CEO Sam Altman confirmed the funds will be used to expand compute infrastructure and accelerate AGI research timelines. This makes OpenAI the most valuable private company in history.`,
    likes: 18000,
    views: 5400000,
    comments: 4100,
  },
  {
    label: "🔴 EDGE: Non-English content, should FAIL",
    platform: "YouTube",
    creatorName: "TechFrançais",
    title: "Comment j'ai automatisé mon business avec l'IA",
    content: `Dans cette vidéo, je vous explique comment j'ai automatisé 80% de mon business en utilisant des outils d'IA comme n8n et Make.com. J'ai économisé plus de 20 heures par semaine et augmenté mon chiffre d'affaires de 40%. Voici mes 5 workflows préférés...`,
    likes: 2100,
    views: 45000,
    comments: 310,
  },
];

// ─── Full Flow Runner ─────────────────────────────────────────────────────────

async function runFullFlow(item: (typeof FULL_FLOW_ITEMS)[0]) {
  console.log(`\n📋 FULL FLOW: ${item.label}`);
  console.log(`   Creator: ${item.creatorName} | ${item.platform}\n`);

  // --- Pass 1: Relevance Filter ---
  console.log("   Pass 1 — Relevance Filter...");
  const filterPrompt = `Evaluate this ${item.platform} content for relevance:

CREATOR: ${item.creatorName}
TITLE: ${item.title}
CONTENT:
${item.content}

ENGAGEMENT: ${item.likes} likes, ${item.views} views, ${item.comments} comments

Return JSON:
{
  "relevant": true/false,
  "confidence": 0.0-1.0,
  "matchedPillars": ["Pillar1"],
  "reasoning": "Brief explanation"
}`;

  const filter = await callJSON<{
    relevant: boolean;
    confidence: number;
    matchedPillars: string[];
    reasoning: string;
  }>(filterPrompt, "filter");

  if (filter.error || !filter.data) {
    console.log(`   ❌ Filter failed: ${filter.error}`);
    return;
  }

  const f = filter.data;
  console.log(`   ${f.relevant ? "✅ RELEVANT" : "🚫 FILTERED"} | Confidence: ${f.confidence}`);
  console.log(`   Pillars: [${f.matchedPillars.join(", ")}]`);
  console.log(`   Reasoning: ${f.reasoning}`);
  console.log(`   ⏱  ${filter.latencyMs}ms | 🪙 ${filter.tokens} tokens`);

  if (!f.relevant || f.confidence < 0.6) {
    console.log("   ⏭️  Skipping summarization (filtered out)\n");
    return;
  }

  // --- Pass 2: Summarization ---
  console.log("\n   Pass 2 — Summarization...");
  const summaryPrompt = `Summarize this ${item.platform} content for a Twitter creator looking for tweet ideas:

CREATOR: ${item.creatorName}
TITLE: ${item.title}
MATCHED PILLARS: ${f.matchedPillars.join(", ")}
CONTENT:
${item.content}

Return JSON:
{
  "summary": "2-3 sentence summary of the core insight",
  "keyTakeaways": "3-5 bullets using → arrows. Focus on numbers, tools, and contrarian angles.",
  "tweetAngle": "One sentence: the strongest tweet angle from this content"
}`;

  const summary = await callJSON<{
    summary: string;
    keyTakeaways: string;
    tweetAngle: string;
  }>(summaryPrompt, "summary", 0.5);

  if (summary.error || !summary.data) {
    console.log(`   ❌ Summary failed: ${summary.error}`);
    return;
  }

  const s = summary.data;
  console.log(`\n   📝 Summary:\n   ${s.summary}`);
  console.log(`\n   🔑 Key Takeaways:\n   ${s.keyTakeaways}`);
  console.log(`\n   🐦 Tweet Angle:\n   ${s.tweetAngle}`);
  console.log(`\n   ⏱  ${summary.latencyMs}ms | 🪙 ${summary.tokens} tokens`);
  console.log(`\n   ✅ TOTAL: ${filter.latencyMs + summary.latencyMs}ms | ${filter.tokens + summary.tokens} tokens for full item`);
}

// ─── Edge Case Runner ─────────────────────────────────────────────────────────

async function runEdgeCases() {
  console.log("\n\n═══════════════════════════════════════════════");
  console.log("   EDGE CASE DISAMBIGUATION TEST");
  console.log("═══════════════════════════════════════════════");

  const results: { label: string; correct: boolean; latencyMs: number; tokens: number }[] = [];

  for (const item of EDGE_CASE_ITEMS) {
    console.log(`\n   ${item.label}`);

    const prompt = `Evaluate this ${item.platform} content for relevance:

CREATOR: ${item.creatorName}
TITLE: ${item.title}
CONTENT:
${item.content}

Return JSON:
{
  "relevant": true/false,
  "confidence": 0.0-1.0,
  "matchedPillars": [],
  "reasoning": "Brief explanation"
}`;

    const result = await callJSON<{
      relevant: boolean;
      confidence: number;
      matchedPillars: string[];
      reasoning: string;
    }>(prompt, item.label);

    const shouldPass = item.label.includes("🟡");
    const shouldFail = item.label.includes("🔴");
    const correct = shouldPass ? result.data?.relevant === true : !result.data?.relevant;

    console.log(`   Result: ${result.data?.relevant ? "✅ RELEVANT" : "🚫 FILTERED"} (${result.data?.confidence}) — ${correct ? "✅ CORRECT" : "❌ WRONG"}`);
    console.log(`   ${result.data?.reasoning}`);
    console.log(`   ⏱  ${result.latencyMs}ms | 🪙 ${result.tokens} tokens`);

    results.push({ label: item.label, correct: correct ?? false, latencyMs: result.latencyMs, tokens: result.tokens });

    await new Promise(r => setTimeout(r, 300));
  }

  const passed = results.filter(r => r.correct).length;
  const totalTokens = results.reduce((s, r) => s + r.tokens, 0);
  const avgLatency = Math.round(results.reduce((s, r) => s + r.latencyMs, 0) / results.length);

  console.log("\n───────────────────────────────────────────────");
  console.log(`   Edge case accuracy: ${passed}/${results.length} correct`);
  console.log(`   Avg latency:        ${avgLatency}ms`);
  console.log(`   Total tokens:       ${totalTokens}`);
  console.log(`   Total cost:         $0.00`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════");
  console.log("   MiniMax-M3 Full Pipeline Test");
  console.log("   ⚠️  No Notion / OpenRouter / Apify calls");
  console.log("═══════════════════════════════════════════════");

  // Part 1: Full process-content flow (filter + summarize)
  console.log("\n📦 PART 1 — Full process-content simulation");
  for (const item of FULL_FLOW_ITEMS) {
    await runFullFlow(item);
    await new Promise(r => setTimeout(r, 500));
  }

  // Part 2: Disambiguation edge cases
  await runEdgeCases();

  console.log("\n═══════════════════════════════════════════════");
  console.log("   Done. All calls via TokenRouter only.");
  console.log("═══════════════════════════════════════════════\n");
}

main().catch(console.error);
