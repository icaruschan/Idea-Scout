/**
 * GPT-5.4 vs GPT-5.4-mini Pipeline Benchmark
 * ─────────────────────────────────────────────
 * Uses complimentary daily tokens from OpenAI data-sharing program.
 * Same prompts as MiniMax benchmark for direct comparison.
 * ⚠️  No Notion / OpenRouter / Apify calls.
 */
import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a content relevance analyst for a Twitter (X) creator who covers AI, automation, coding, and creator economy topics.

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
- RULE: If a word could mean pop culture/sports, verify context is tech/business first.

REJECT if: generic hype, no actionable angle, entertainment, non-English, VC fundraising with no builder story.

Respond with pure JSON — no markdown fences.`;

const MODELS = ["gpt-5.4", "gpt-5.4-mini"];

const TEST_ITEMS = [
  {
    label: "✅ Automation (should PASS)",
    platform: "YouTube",
    creatorName: "Liam Ottley",
    title: "I Automated My Entire Business With n8n",
    content: `After 6 months of building, I finally automated 90% of my business using n8n:
1. Lead capture → CRM → Slack (saves 2hrs/day)
2. Invoice → Stripe → Notion (fully hands-off)
3. Customer support → GPT-4 draft → Gmail (handles 80% without me)
4. Long video → transcript → 10 tweets → scheduled posts
5. GA4 + Stripe + Twitter → weekly PDF report

Build time: 40 hours. Time saved: 18hrs/week. Cost: $75/month.`,
    likes: 8400, views: 210000, comments: 720,
  },
  {
    label: "❌ F1 Kimi (should FAIL)",
    platform: "YouTube",
    creatorName: "F1TV",
    title: "Kimi Antonelli's First F1 Win: Full Race Breakdown",
    content: `18-year-old Kimi Antonelli secured his maiden Formula 1 victory at the Spanish Grand Prix, driving for Mercedes. The young Italian showed remarkable composure managing tire degradation over 66 laps.`,
    likes: 45000, views: 1800000, comments: 3200,
  },
  {
    label: "✅ AI Kimi model (should PASS)",
    platform: "X",
    creatorName: "rohanpaul_ai",
    title: "Kimi K2 just destroyed GPT-4o on coding benchmarks",
    content: `Kimi K2 from Moonshot AI dropped today:
- HumanEval: 94.2% (GPT-4o: 87.1%)
- SWE-bench: 65.8% (Claude Sonnet: 49%)
- Price: $0.15/1M input tokens
I tested it on 50 real coding tasks. Rewrote a 2,000-line Python codebase in 4 minutes, zero errors. Switching my Cursor background agent to this immediately.`,
    likes: 6200, views: 280000, comments: 890,
  },
  {
    label: "❌ VC funding, no builder angle (should FAIL)",
    platform: "X",
    creatorName: "TechCrunch",
    title: "OpenAI raises $40B at $340B valuation",
    content: `OpenAI closed $40B at $340B valuation. Investors include SoftBank, Microsoft, UAE/Saudi sovereign funds. Funds go toward compute infrastructure and AGI research. Most valuable private company in history.`,
    likes: 18000, views: 5400000, comments: 4100,
  },
  {
    label: "✅ Building in Public MRR (should PASS)",
    platform: "X",
    creatorName: "marc_louvion",
    title: "Month 6: $0 to $12,400 MRR",
    content: `Month 6 update:
MRR: $12,400 (+$3,100)
Churn: 3.2%
What worked: Cold DMs to niche communities (35% conversion), SEO blog (40% of signups)
What didn't: Twitter ads ($800 spent, 3 signups), ProductHunt relaunch
Lesson: Fix churn before acquisition.`,
    likes: 3800, views: 95000, comments: 287,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function callModel(model: string, content: string, platform: string): Promise<{
  relevant: boolean | null;
  confidence: number | null;
  pillars: string[];
  reasoning: string;
  tokens: number;
  latencyMs: number;
  error?: string;
}> {
  const start = Date.now();
  const prompt = `Evaluate this ${platform} content for relevance:

${content}

Return JSON:
{
  "relevant": true/false,
  "confidence": 0.0-1.0,
  "matchedPillars": ["Pillar name"],
  "reasoning": "Brief explanation"
}`;

  try {
    const res = await client.chat.completions.create({
      model,
      stream: false,
      temperature: 0.3,
      max_tokens: 400,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    });

    const latencyMs = Date.now() - start;
    const raw = res.choices[0].message.content ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON in response");
    const parsed = JSON.parse(match[0]);

    return {
      relevant: parsed.relevant,
      confidence: parsed.confidence,
      pillars: parsed.matchedPillars ?? [],
      reasoning: parsed.reasoning ?? "",
      tokens: res.usage?.total_tokens ?? 0,
      latencyMs,
    };
  } catch (err: any) {
    return {
      relevant: null,
      confidence: null,
      pillars: [],
      reasoning: "",
      tokens: 0,
      latencyMs: Date.now() - start,
      error: err?.message ?? String(err),
    };
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("   GPT-5.4 vs GPT-5.4-mini — Pipeline Benchmark");
  console.log("   ⚠️  Complimentary tokens only. No Notion/OpenRouter calls.");
  console.log("═══════════════════════════════════════════════════════════\n");

  const summary: Record<string, { correct: number; totalMs: number; totalTokens: number; calls: number }> = {};
  for (const model of MODELS) summary[model] = { correct: 0, totalMs: 0, totalTokens: 0, calls: 0 };

  for (const item of TEST_ITEMS) {
    const shouldPass = item.label.startsWith("✅");
    console.log(`─── ${item.label}`);

    const content = `CREATOR: ${item.creatorName}
TITLE: ${item.title}
CONTENT: ${item.content}
ENGAGEMENT: ${item.likes} likes, ${item.views} views`;

    for (const model of MODELS) {
      const r = await callModel(model, content, item.platform);
      const correct = r.error ? false : (shouldPass ? r.relevant === true : r.relevant === false);
      summary[model].correct += correct ? 1 : 0;
      summary[model].totalMs += r.latencyMs;
      summary[model].totalTokens += r.tokens;
      summary[model].calls++;

      if (r.error) {
        console.log(`    ${model.padEnd(14)} ❌ ERROR: ${r.error}`);
      } else {
        const verdict = r.relevant ? "✅ PASS" : "🚫 FAIL";
        const tag = correct ? "✅" : "❌ WRONG";
        console.log(`    ${model.padEnd(14)} ${verdict} (${r.confidence}) ${tag} — ${r.reasoning.substring(0, 80)}...`);
        console.log(`    ${"".padEnd(14)} ⏱ ${r.latencyMs}ms | 🪙 ${r.tokens} tokens`);
      }

      // Small delay between calls
      await new Promise(r => setTimeout(r, 300));
    }
    console.log();
  }

  // ─── Summary Table ───────────────────────────────────────────────────────
  console.log("═══════════════════════════════════════════════════════════");
  console.log("   RESULTS SUMMARY");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`   ${"Model".padEnd(16)} ${"Accuracy".padEnd(12)} ${"Avg Latency".padEnd(14)} ${"Total Tokens".padEnd(14)} Cost`);
  console.log("   " + "─".repeat(60));

  for (const model of MODELS) {
    const s = summary[model];
    const accuracy = `${s.correct}/${s.calls}`;
    const avgMs = `${Math.round(s.totalMs / s.calls)}ms`;
    console.log(`   ${model.padEnd(16)} ${accuracy.padEnd(12)} ${avgMs.padEnd(14)} ${String(s.totalTokens).padEnd(14)} $0.00`);
  }

  console.log("\n   (MiniMax-M3 from previous run for reference)");
  console.log(`   ${"MiniMax-M3".padEnd(16)} ${"4/4".padEnd(12)} ${"4504ms".padEnd(14)} ${"3233".padEnd(14)} $0.00`);
  console.log("═══════════════════════════════════════════════════════════\n");
}

main().catch(console.error);
