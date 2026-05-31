import dotenv from "dotenv";
import { searchCreatorPosts, getArticle } from "../src/lib/twitter";
import { generateJSON } from "../src/lib/llm";
import { cleanContentUrl } from "../src/lib/notion";

dotenv.config({ override: true });

const SYSTEM_PROMPT = `# Senior Digital Content Strategist - Tweet Analysis Framework

You are a Senior Digital Content Strategist with 10+ years of experience spanning copywriting, social media management, and growth marketing. You have crafted campaigns for top brands and helped individual creators scale to millions of followers.

---

## YOUR EXPERTISE

- **Copywriting:** You understand the nuance of hooks, pacing, and power words.
- **Psychology:** You know exactly why a human stops scrolling (curiosity, fear, status, identity).
- **Data-Driven:** You respect the numbers. You know that "likes" are vanity and "bookmarks" are sanity (value).

---

## YOUR MISSION

Analyze this tweet not just as a piece of data, but as a crafted piece of communication. Deconstruct the *craft* behind it using your multi-disciplinary background.

---

## CLASSIFICATION FRAMEWORK

### CATEGORIES (Select 1-2 Best Fit)

- Content Creators
- Business/Entrepreneurs
- Marketing/Growth
- Finance/Investing
- Productivity/Self-Improvement
- Design/Creative
- Tech/AI
- Web3/Crypto
- Education/Teaching
- Entertainment/Humor
- Case Studies
- Tools/Resources
- Vibe Coding

### HOOK TYPES (Select Exactly One)

- **Story**: "I lost $50k in 2022. Here's how..." (Vulnerability/Narrative)
- **Hot Take**: "SEO is dead." (Contrarian/Pattern Interruption)
- **How-To**: "How to build a brain in 5 steps." (Utility/Promise)
- **Proof**: "Generated $1M in 30 days. Breakdown below." (Authority/Result)
- **Question**: "What's the one tool you can't live without?" (Engagement)
- **Vulnerable**: "I'm scared of failing." (Emotional/Honest)
- **Data**: "78% of startups fail because of this." (Logic/Fact)

### FORMAT (Select Exactly One)

- **Short**: Single standalone tweet
- **Mid-length**: Extended tweet or carousel
- **Thread**: Multi-tweet thread
- **Article**: Long-form article or newsletter
- **Video**: Video content

---

## SCORING MODEL (Hybrid Viral & Value)

Rate 1-5 Stars (⭐). Balance the raw "Viral Reach" (Views) with the "Signal Value" (Bookmarks).

- **⭐⭐⭐⭐⭐ (Holy Grail)**: **Massive Reach OR Massive Value.** Either it reached millions (High Views) OR it was saved by everyone who saw it (High Bookmarks). It dominates attention.
- **⭐⭐⭐⭐ (Great)**: Strong performance. High engagement relative to its niche or strong viral mechanics.
- **⭐⭐⭐ (Good)**: Solid performance. Functional, works well, but lacks the "X-Factor" of a viral hit or deep resource.
- **⭐⭐ (Entertaining)**: "Empty Calories." High Likes but almost NO Bookmarks/Retweets. Good for a quick laugh, but no Authority built.
- **⭐ (Miss)**: Low resonance across all metrics.

---

## OUTPUT SCHEMA

You must output a single, valid JSON object. No markdown fencing, no additional text.

{
  "postTitle": "A catchy, professional headline (5-7 words)",
  "category": "String (comma-separated if multiple, e.g. 'Tech/AI, Productivity')",
  "hookType": "String",
  "format": "String",
  "shortDescription": "One sentence summary from a strategist's perspective",
  "whyItWorks": "A brief, expert insight on the psychological triggers or copywriting technique used",
  "stealablePattern": "The framework or 'skeleton' of the post that other creators can fill in",
  "tweetStructure": "The architecture of the post (e.g. Hook -> Problem -> Agitation -> Solution -> CTA)",
  "rating": "String (e.g. ⭐⭐⭐⭐)"
}`;

async function run() {
  const testHandle = process.argv[2] || "levelsio";
  const model = process.argv[3] || "xiaomi/mimo-v2.5-pro";

  console.log(`🚀 Starting Local Tweet Research Test for @${testHandle}...`);
  console.log(`Using model: ${model}`);

  try {
    console.log(`🔍 Querying tweets from the last 30 days for @${testHandle}...`);
    const tweets = await searchCreatorPosts(testHandle, 30);
    console.log(`Retrieved ${tweets.length} raw tweets.`);

    const qualified: any[] = [];
    for (const t of tweets) {
      const views = parseInt(t.viewCount || t.viewsCount || t.views || 0, 10);
      const bookmarks = parseInt(t.bookmarkCount || t.bookmarksCount || t.bookmarks || 0, 10);
      const likes = parseInt(t.likeCount || t.likesCount || t.likes || 0, 10);
      const retweets = parseInt(t.retweetCount || t.retweetsCount || t.retweets || 0, 10);
      const replies = parseInt(t.replyCount || t.repliesCount || t.replies || 0, 10);

      const score = bookmarks * 10 + retweets * 5 + replies * 2 + Math.floor(views / 1000);

      if (views >= 3000 && bookmarks >= 10) {
        qualified.push({
          id: t.id,
          text: t.text || "",
          views,
          bookmarks,
          likes,
          retweets,
          replies,
          viralScore: score,
          tweetObject: t,
        });
      }
    }

    console.log(`✅ ${qualified.length} tweets met thresholds (views >= 3000, bookmarks >= 10).`);

    if (qualified.length === 0) {
      console.log("No tweets met the threshold. Exiting test.");
      return;
    }

    // Sort by viralScore
    qualified.sort((a, b) => b.viralScore - a.viralScore);
    const topTweet = qualified[0];
    
    console.log(`\n🔥 Top Tweet selected for analysis (Score: ${topTweet.viralScore}, Views: ${topTweet.views}, Bookmarks: ${topTweet.bookmarks}):`);
    console.log(`Text: "${topTweet.text.substring(0, 150)}..."`);

    let fullText = topTweet.text;
    const isArticle =
      topTweet.tweetObject?.article !== null && topTweet.tweetObject?.article !== undefined ||
      (topTweet.tweetObject?.url || "").includes("/article/") ||
      (topTweet.tweetObject?.entities?.urls || []).some((u: any) =>
        u.expanded_url?.includes("/article/")
      );

    if (isArticle && topTweet.id) {
      console.log(`📄 Detected X Article, fetching full text via REST...`);
      try {
        const articleText = await getArticle(topTweet.id);
        if (articleText) {
          fullText = articleText;
          console.log(`Fetched full text (${fullText.length} chars).`);
        }
      } catch (e) {
        console.warn(`Failed to fetch article text:`, e);
      }
    }

    const hasMedia = !!(
      topTweet.tweetObject?.extendedEntities?.media?.length ||
      topTweet.tweetObject?.entities?.media?.length
    );

    const userPrompt = `Analyze the following tweet data:

**Author**: Test Author (@${testHandle})

**Metrics**:
- Views: ${topTweet.views}
- Likes: ${topTweet.likes}
- Bookmarks: ${topTweet.bookmarks}
- Replies: ${topTweet.replies}
- Retweets: ${topTweet.retweets}

**Tweet Content**:
"""
${fullText}
"""

**Media Present**: ${hasMedia}`;

    console.log(`\n🧠 Running LLM Content Strategist analysis...`);
    const analysis = await generateJSON(userPrompt, SYSTEM_PROMPT, 0.5, model);
    console.log("\n✅ Analysis Result:");
    console.log(JSON.stringify(analysis, null, 2));

  } catch (error: any) {
    console.error("\n❌ Test failed:", error.message || error);
  }
}

run();
