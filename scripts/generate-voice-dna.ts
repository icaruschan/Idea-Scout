/**
 * generate-voice-dna.ts
 * 
 * Takes the parsed tweet samples (yours + creators) and sends them to the LLM
 * with a structured voice extraction prompt. Produces a blended Voice DNA 
 * document saved as `src/lib/voice-dna.ts`.
 * 
 * Blend ratio: 55% user / 45% creators (@sharbel, @zaimiri)
 * 
 * Input:  .tmp/my-top-tweets.json
 *         .tmp/creator-voice-samples.json
 * Output: src/lib/voice-dna.ts (exported VOICE_DNA_PROMPT constant)
 */

import * as fs from "fs";
import * as path from "path";
import { generateText } from "../src/lib/llm";

const TMP_DIR = path.resolve(__dirname, "../.tmp");
const MY_TWEETS_FILE = path.join(TMP_DIR, "my-top-tweets.json");
const CREATOR_TWEETS_FILE = path.join(TMP_DIR, "creator-voice-samples.json");
const OUTPUT_FILE = path.resolve(__dirname, "../src/lib/voice-dna.ts");

// Use a strong model for this one-time extraction
const VOICE_EXTRACTION_MODEL = "qwen/qwen3.6-plus";

interface TweetSample {
  text: string;
  likes: number;
  retweets: number;
  date: string;
  score: number;
}

interface CreatorTweetSample {
  handle: string;
  text: string;
  likes: number;
  retweets: number;
  bookmarks: number;
  views: number;
  date: string;
}

async function main() {
  console.log("🧬 Voice DNA Generator\n");

  // ─── Load samples ─────────────────────────────────────────────
  if (!fs.existsSync(MY_TWEETS_FILE)) {
    console.error(`❌ Missing ${MY_TWEETS_FILE}. Run parse-my-tweets.ts first.`);
    process.exit(1);
  }
  if (!fs.existsSync(CREATOR_TWEETS_FILE)) {
    console.error(`❌ Missing ${CREATOR_TWEETS_FILE}. Run scrape-creator-voice.ts first.`);
    process.exit(1);
  }

  const myTweets: TweetSample[] = JSON.parse(fs.readFileSync(MY_TWEETS_FILE, "utf-8"));
  const creatorTweets: CreatorTweetSample[] = JSON.parse(fs.readFileSync(CREATOR_TWEETS_FILE, "utf-8"));

  console.log(`📊 Loaded ${myTweets.length} of your tweets`);
  console.log(`📊 Loaded ${creatorTweets.length} creator tweets`);

  // Group creator tweets by handle
  const creatorGroups = new Map<string, CreatorTweetSample[]>();
  for (const tweet of creatorTweets) {
    const group = creatorGroups.get(tweet.handle) || [];
    group.push(tweet);
    creatorGroups.set(tweet.handle, group);
  }

  for (const [handle, tweets] of creatorGroups) {
    console.log(`  @${handle}: ${tweets.length} tweets`);
  }

  // ─── Build the voice extraction prompt ────────────────────────
  const myTweetTexts = myTweets
    .slice(0, 150) // Use top 150 to stay within context limits
    .map((t, i) => `[${i + 1}] (${t.likes}❤️ ${t.retweets}🔁) ${t.text}`)
    .join("\n\n---\n\n");

  const creatorSections: string[] = [];
  for (const [handle, tweets] of creatorGroups) {
    const tweetTexts = tweets
      .slice(0, 50)
      .map((t, i) => `[${i + 1}] (${t.views}👀 ${t.likes}❤️ ${t.bookmarks}🔖) ${t.text}`)
      .join("\n\n---\n\n");
    creatorSections.push(`\n══ @${handle} (${tweets.length} tweets) ══\n${tweetTexts}`);
  }

  const systemPrompt = `You are a world-class ghostwriter and voice analyst specializing in Twitter/X creator voices. Your job is to analyze tweet samples and produce a comprehensive, actionable Voice DNA document that an AI can use to perfectly replicate a specific writing style.

You must be extremely precise and specific. Don't say "uses casual tone" — instead say "starts 73% of tweets with lowercase, uses 'tbh', 'ngl', 'lowkey' as transition words, never uses exclamation marks in opening lines."

The output must be a STRUCTURED VOICE GUIDE organized by dimensions, with specific rules, patterns, and examples for each dimension.`;

  const extractionPrompt = `Analyze the following tweet samples and produce a BLENDED VOICE DNA document.

═══════════════════════════════════════════════════════════════════════════════
SECTION 1: THE CREATOR'S OWN TWEETS (PRIMARY VOICE — 55% weight)
═══════════════════════════════════════════════════════════════════════════════
These are the creator's most successful original tweets, ranked by engagement.
Analyze their natural writing voice deeply.

${myTweetTexts}

═══════════════════════════════════════════════════════════════════════════════
SECTION 2: REFERENCE CREATORS (BORROWED ELEMENTS — 45% weight combined)
═══════════════════════════════════════════════════════════════════════════════
These are tweets from creators whose style elements should be blended IN.
Extract what makes each distinctive, then merge the best structural/stylistic 
patterns into the final voice guide.

${creatorSections.join("\n\n")}

═══════════════════════════════════════════════════════════════════════════════
TASK: PRODUCE THE VOICE DNA DOCUMENT
═══════════════════════════════════════════════════════════════════════════════

Create a comprehensive Voice DNA guide. The blend ratio is 55% creator's own voice (foundation) and 45% reference creators combined (@sharbel + @zaimiri).
The guide should feel like ONE unified voice, not a frankenstein. The creator's own patterns are the FOUNDATION — the reference creators add SPICE.

[PIVOT AWAY FROM WEB3 GAMING]
The primary creator is shifting focus away from Web3 gaming and towards modern software engineering, AI tools, developer workflows, and automation. Therefore, you MUST NOT frame the persona, core directive, or writing guidelines around Web3 gaming or crypto. Frame them generally as a Tech/AI/Automation Developer-Builder. Keep the writing style, tone, and formatting patterns, but abstract them away from gaming-specific references (e.g. replace mentions of "playing games" or "projects" with "using tools", "workflows", "codebases", or "software products").

To preserve the hard mechanical data extracted from recent analysis of the primary creator's tweets, you MUST hardcode the following exact mechanical metrics and visual constraints in Sections 2, 3, 4, 5, and 6:

[FIXED MECHANICAL BASELINE - DO NOT ALTER OR HALLUCINATE DIFFERENT STATS]
- Word Limits: 6-12 words per line block. Max 14 words per line.
- Block Constraints: Max 2 lines per paragraph. Never cluster >3 consecutive lines without visual break.
- Visual Spacing: Exactly 1 empty line between thoughts. Double line break before list, quote, or CTA.
- Opening Casing: Predominantly sentence case. Lowercase openings rare (~1%).
- Opening Length: First line 4-8 words (median 6). Max 14 words.
- Opening Emojis: ~1 in 3 openers has a single emoji at the end of the line.
- Opening Shapes: Personal statement/Vulnerability (~25%), Direct Value/Conditional hook (~15%), Ecosystem observation/Metric (~10%), Provocation/question (~5%).
- Closing Mechanics: Statement closes (~77%), Thread pointers (~22% using 👇 or 🧵), Question closes (~2%).
- Visual Layout: ~42% of lines are empty. Lists are dominant (70% of tweets use arrows/checkmarks).
- Bullet Characters: Use →, ➡️, ➠, ➥, ✅. Don't mix styles.
- Formatting Emojis: Placed at the end of a line. Moderate frequency (34% of openers, 36% of closings). No clusters.
- Punctuation: Ellipsis (...) in ~21% of tweets. Colons introduce lists. Em-dashes almost never (~1%).
- Capitalization: Sentence case default. ALL CAPS for surgical 1-2 words.
- Vocabulary: "guys" (17%), "cooking/cooked", "grateful", "shout out", "positioned/positioning", "touch grass", "wild", "insane", "banger".
- Slang: "tbh" (~2%), "ngl" (~1%), "GGs" (~2%), "kings" (~4%), "lol" (~2%) as seasoning, not base.
- Banned Words: "Let's dive in", "In today's world", "Game changer", "Synergy", "Revolutionize", "To the moon", "WAGMI", "LFG", "Bro", "Fam", "Unlock potential", "Paradigm shift", "Leverage", "fudders", "alpha leak", "pump it".

Your primary task is to deeply study the samples to perform a high-fidelity QUALITATIVE extraction for the sections below. Focus on the craft, persona, writing dynamics, and psychological structures of the writing:

REQUIRED SECTIONS:

1. VOICE IDENTITY & PERSONA
   - Clear definition of the core persona: The Trench-Builder Curator. A peer-level developer/automation practitioner who documents real workflows, stress-tests AI tools, and shares hard-won lessons.
   - Describe the blend: how the primary creator’s grounded, community-first warmth blends with Sharbel’s ruthless utility-curation and Zaimiri’s long-term, reputation-protecting operator mindset.
   - Detail the character posture: peer builder (not a guru, speaks from the trenches), protective mentor (warns against short-term burns, advocates for sustainable systems), and practical curator (filters noise, surfaces signal).
   - Describe the conversational relationship: talks *with* a fellow traveler, shares scar tissue, and gives an unvarnished look at tools.
   - NOTE: This core style and tone is the foundation, but explicitly explain that the AI writer has room to explore other structures, formats, and hook angles (e.g., incorporating other viral tweet styles and structures from the VPL) to maintain variety and prevent formatting fatigue.

2. SENTENCE ARCHITECTURE & TECHNICAL CONSTRAINTS
   - Include the fixed mechanical constraints from the baseline above.
   - Describe the rhythmic flow: staccato openings → analytical explanation → punchy payoff. Give examples.

3. OPENING MECHANICS
   - Include the fixed mechanical baseline stats.
   - Provide concrete examples of the 4 opening shapes from the actual tweets: Personal statement/Vulnerability, Direct Value/Conditional hook, Ecosystem observation/Metric, and Provocation/question.
   - Describe how the opening line is front-loaded to grab attention without sounding like clickbait.
   - STRICT GUARDRAILS: Prohibit generic "threadboi" or "guru" openings. Explicitly ban "Introduction frames" (e.g., "This is Cursor / A tool that...") and generic "Community pulses" (e.g., "It's that time of the week again. 🤔"). Opener must always feel natural and builder-native.

4. CLOSING MECHANICS
   - Include the fixed mechanical baseline stats.
   - Describe how the closing line acts as a resolution or thematic anchor.
   - Explain why reflexive sign-offs are avoided.

5. FORMATTING & VISUAL LAYOUT
   - Include the fixed mechanical baseline stats.
   - Describe the structural use of white space and bullet lists.

6. VOCABULARY & REGISTER
   - Include the signature and banned words from the baseline above.
   - Define the linguistic register: how to speak about complex technical concepts (crons, APIs, contracts) in a casual, highly-accessible conversational way.

7. PSYCHOLOGICAL HOOKS & NARRATIVE TENSION (Deep Analysis Required)
   - Dissect *how* hooks are designed.
   - How does @sharbel construct the Curiosity Gap and Specificity Hooks? (e.g., framing a tool by its GitHub stars or cost savings: "SaaS costs $1,200/mo. Someone built the open source alternative for $0. Here's what it does..."). Explain the tension building.
   - How does the primary creator use community milestones or personal vulnerability? (e.g., "I did a thing guys...").
   - How does @zaimiri build hooks from conversational advice ("an honest note to small creators...")?
   - Provide 3-4 structural templates/patterns of these hooks based on the samples.

8. TONE & EMOTIONAL REGISTER
   - Define the default emotional register (low-key, builder-forward, reflective, warm).
   - Explain how the tone shifts dynamically based on content type:
     * *Tech/AI/Automation Analysis:* Metric-dense, objective, highly structured, clean utility.
     * *Personal Milestones/Wins:* Humble, community-focused, highly grateful ("grateful", "😭/🥹").
     * *Philosophical/Reflective:* Lowercase flow, slower pacing, sharing lesson/scar tissue, slightly protective tone ("reputation is everything", "taste matters").
   - Identify the style of humor (e.g., self-deprecating, dry, anti-guru).

9. BLENDED INFLUENCES & CRAFT FORMULAS
   - Detail the specific craft elements absorbed from @sharbel (e.g., "Meme Arrow Narrative" >be Cursor >quietly ship, structured repo breakdowns, SaaS price comparison).
   - Detail the specific craft elements absorbed from @zaimiri (e.g., lowercase reflective flow, big-brother tone of caution, long-term focus).
   - Show how these influences integrate with the primary creator's Tech/AI/Automation/Builder foundation.
   - Provide 2-3 specific Hybrid Formulas (e.g., "The Open Source / Tool Breakdown Formula", "The Reflective Trench-Builder Lesson Formula") with step-by-step structures.

10. ANTI-PATTERNS (STRICT PROHIBITIONS)
    - List what this voice NEVER does, both mechanically and qualitatively (e.g., never sounds like a generic threadboi selling a course, never posts passive summaries, never uses corporate speak, never hypes useless projects).

Output the voice DNA as a clean, well-formatted document. Use markdown headers, bullets, and examples. This will be injected directly into an LLM system prompt, so write it as INSTRUCTIONS that an AI should follow when writing tweets in this voice.`;

  console.log("\n🧠 Sending to LLM for voice extraction (this may take 30-60s)...\n");

  try {
    const voiceDNA = await generateText(
      extractionPrompt,
      systemPrompt,
      0.4, // Low temperature for analytical precision
      VOICE_EXTRACTION_MODEL,
    );

    if (!voiceDNA || voiceDNA.length < 500) {
      console.error("❌ LLM returned insufficient voice DNA output.");
      console.log("Raw output:", voiceDNA);
      process.exit(1);
    }

    console.log(`✅ Voice DNA generated (${voiceDNA.length} chars)\n`);

    // Preview the first 500 chars
    console.log("─── PREVIEW ───");
    console.log(voiceDNA.substring(0, 500));
    console.log("───────────────\n");

    // ─── Write as a TypeScript module ───────────────────────────
    const tsContent = `/**
 * Voice DNA Profile — Auto-generated
 * 
 * Generated on: ${new Date().toISOString().split("T")[0]}
 * Source: ${myTweets.length} personal tweets + ${creatorTweets.length} reference creator tweets
 * Blend: 55% personal voice / 45% borrowed (@${Array.from(creatorGroups.keys()).join(", @")})
 * 
 * DO NOT EDIT MANUALLY — regenerate with: npm run build:voice
 */

export const VOICE_DNA_PROMPT = ${JSON.stringify(voiceDNA)};
`;

    fs.writeFileSync(OUTPUT_FILE, tsContent, "utf-8");
    console.log(`✅ Voice DNA written to: ${OUTPUT_FILE}`);
    console.log(`   File size: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1)} KB`);

    // Also save the raw markdown for human review
    const reviewFile = path.join(TMP_DIR, "voice-dna-review.md");
    fs.writeFileSync(reviewFile, `# Voice DNA Profile\n\n${voiceDNA}`, "utf-8");
    console.log(`📝 Human-readable review saved to: ${reviewFile}`);

  } catch (err: any) {
    console.error("❌ Voice extraction failed:", err.message || err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
