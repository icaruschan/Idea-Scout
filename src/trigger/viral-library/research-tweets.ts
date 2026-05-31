import { task } from "@trigger.dev/sdk/v3";
import {
  getTwitterCreators,
  getExistingViralPostUrls,
  createViralPost,
  cleanContentUrl,
} from "../../lib/notion";
import { searchCreatorPosts, getArticle } from "../../lib/twitter";
import { generateJSON } from "../../lib/llm";

export interface ResearchTweetsPayload {
  modelOverride?: string;
  minViews?: number;
  minBookmarks?: number;
  limit?: number;
}

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

export const researchTweets = task({
  id: "research-tweets",
  maxDuration: 14400, // 4 hours — accounts for extensive searches and sequential LLM processing
  run: async (payload?: ResearchTweetsPayload) => {
    const model = payload?.modelOverride || "xiaomi/mimo-v2.5-pro";
    const minViews = payload?.minViews ?? 3000;
    const minBookmarks = payload?.minBookmarks ?? 10;
    const limit = payload?.limit ?? 150;

    console.log(`🚀 Starting Twitter content research manual run.`);
    console.log(`Params -> Model: ${model}, Min Views: ${minViews}, Min Bookmarks: ${minBookmarks}, Limit: ${limit}`);

    // 1. Fetch Focus Creators
    console.log("👤 Fetching active focus creators from Notion...");
    const creators = await getTwitterCreators(100);
    console.log(`Loaded ${creators.length} focus creators.`);

    if (creators.length === 0) {
      console.log("No focus creators found. Exiting task.");
      return { status: "success", message: "No creators found." };
    }

    // 2. Fetch Existing Post URLs (last 30 days) for deduplication
    console.log("📚 Fetching recently added post URLs in the library for deduplication...");
    const existingUrlsList = await getExistingViralPostUrls(30);
    const existingUrls = new Set(existingUrlsList);
    console.log(`Found ${existingUrls.size} existing posts in the past 30 days.`);

    const allQualifiedTweets: any[] = [];

    // 3. Sequentially query each creator's tweets
    for (const creator of creators) {
      if (!creator.handle) continue;

      console.log(`\n🔍 Searching tweets for @${creator.handle} from the last 30 days...`);
      try {
        const tweets = await searchCreatorPosts(creator.handle, 30);
        console.log(`Retrieved ${tweets.length} raw tweets for @${creator.handle}`);

        let creatorQualifiedCount = 0;

        for (const tweet of tweets) {
          const authorHandle = tweet.author?.userName || tweet.authorUserName || creator.handle;
          const tweetUrl = tweet.url || `https://x.com/${authorHandle}/status/${tweet.id}`;
          const cleanUrl = cleanContentUrl(tweetUrl);

          // Deduplication check
          if (existingUrls.has(cleanUrl)) {
            continue;
          }

          const views = parseInt(tweet.viewCount || tweet.viewsCount || tweet.views || 0, 10);
          const bookmarks = parseInt(tweet.bookmarkCount || tweet.bookmarksCount || tweet.bookmarks || 0, 10);
          const likes = parseInt(tweet.likeCount || tweet.likesCount || tweet.likes || 0, 10);
          const retweets = parseInt(tweet.retweetCount || tweet.retweetsCount || tweet.retweets || 0, 10);
          const replies = parseInt(tweet.replyCount || tweet.repliesCount || tweet.replies || 0, 10);

          // Filter thresholds
          if (views < minViews || bookmarks < minBookmarks) {
            continue;
          }

          // Calculate Hybrid Viral Score
          const viralScore =
            bookmarks * 10 +
            retweets * 5 +
            replies * 2 +
            Math.floor(views / 1000);

          const hasMedia = !!(
            tweet.extendedEntities?.media?.length ||
            tweet.entities?.media?.length
          );

          allQualifiedTweets.push({
            id: tweet.id,
            text: tweet.text || "",
            postUrl: cleanUrl,
            authorName: tweet.author?.name || tweet.authorName || creator.name,
            authorHandle: authorHandle,
            views,
            bookmarks,
            likes,
            retweets,
            replies,
            viralScore,
            hasMedia,
            tweetObject: tweet,
          });

          creatorQualifiedCount++;
        }

        console.log(`✅ Found ${creatorQualifiedCount} qualified tweets for @${creator.handle}`);
      } catch (err) {
        console.error(`❌ Failed to search tweets for @${creator.handle}:`, err);
      }

      // Respect REST API 1 QPS rate limits (5.5s delay between creator calls)
      await new Promise((resolve) => setTimeout(resolve, 5500));
    }

    console.log(`\n📦 Collected ${allQualifiedTweets.length} qualified tweets across all creators.`);

    if (allQualifiedTweets.length === 0) {
      console.log("No new qualified tweets matched the criteria. Exiting task.");
      return { status: "success", message: "No new tweets matched filters." };
    }

    // 4. Sort and Rank (Top limit, e.g. 100)
    console.log("📊 Sorting and ranking tweets by virality score...");
    const topTweets = allQualifiedTweets
      .sort((a, b) => b.viralScore - a.viralScore)
      .slice(0, limit);

    console.log(`Selecting top ${topTweets.length} tweets for strategist analysis.`);

    // 5. Sequence through analysis and write to Notion
    let analyzedCount = 0;
    for (let index = 0; index < topTweets.length; index++) {
      const tweet = topTweets[index];
      console.log(`\n🧠 [${index + 1}/${topTweets.length}] Analyzing tweet by @${tweet.authorHandle}: "${tweet.text.substring(0, 50)}..."`);

      // Detect X Article and fetch full text
      let fullText = tweet.text;
      const isArticle =
        tweet.tweetObject?.article !== null && tweet.tweetObject?.article !== undefined ||
        tweet.postUrl.includes("/article/") ||
        (tweet.tweetObject?.entities?.urls || []).some((u: any) =>
          u.expanded_url?.includes("/article/")
        );

      if (isArticle && tweet.id) {
        console.log(`📄 Fetching full X Article text via REST...`);
        try {
          const articleText = await getArticle(tweet.id);
          if (articleText) {
            fullText = articleText;
            console.log(`Fetched full text (${fullText.length} chars).`);
          }
        } catch (e) {
          console.warn(`Failed to fetch article text for ${tweet.id}:`, e);
        }
      }

      const userPrompt = `Analyze the following tweet data:

**Author**: ${tweet.authorName} (@${tweet.authorHandle})

**Metrics**:
- Views: ${tweet.views}
- Likes: ${tweet.likes}
- Bookmarks: ${tweet.bookmarks}
- Replies: ${tweet.replies}
- Retweets: ${tweet.retweets}

**Tweet Content**:
"""
${fullText}
"""

**Media Present**: ${tweet.hasMedia}`;

      let analysis: any = {};
      try {
        analysis = await generateJSON(userPrompt, SYSTEM_PROMPT, 0.5, model);
      } catch (err) {
        console.error(`❌ LLM analysis failed for tweet ${tweet.postUrl}:`, err);
        analysis = {
          postTitle: tweet.authorName + "'s Tweet",
          category: "Tech/AI",
          hookType: "Story",
          format: "Short",
          rating: "⭐⭐⭐",
          whyItWorks: "Unable to parse AI analysis",
          stealablePattern: "",
          tweetStructure: "",
          shortDescription: fullText.substring(0, 100),
        };
      }

      // Format rating properly (Number -> Stars)
      let rating = analysis.rating || "⭐⭐⭐";
      if (typeof rating === "number") {
        const ratingMap: Record<number, string> = {
          1: "⭐",
          2: "⭐⭐",
          3: "⭐⭐⭐",
          4: "⭐⭐⭐⭐",
          5: "⭐⭐⭐⭐⭐",
        };
        rating = ratingMap[rating] || "⭐⭐⭐";
      }

      // Handle category formatting
      let categories: string[] = [];
      if (typeof analysis.category === "string") {
        categories = analysis.category.split(",").map((c: string) => c.trim());
      } else if (Array.isArray(analysis.category)) {
        categories = analysis.category;
      } else {
        categories = ["Tech/AI"];
      }

      // Write to Notion database
      console.log(`📝 Writing analyzed post to Notion...`);
      try {
        const pageId = await createViralPost({
          postTitle: analysis.postTitle || (fullText.substring(0, 50) + "..."),
          postUrl: tweet.postUrl,
          author: `@${tweet.authorHandle}`,
          postContent: fullText,
          shortDescription: analysis.shortDescription || "",
          platform: "X",
          format: analysis.format || "Short",
          hookType: analysis.hookType || "Story",
          category: categories,
          rating: rating,
          likes: tweet.likes,
          bookmarks: tweet.bookmarks,
          retweets: tweet.retweets,
          replies: tweet.replies,
          views: tweet.views,
          whyItWorks: analysis.whyItWorks || "",
          stealablePattern: analysis.stealablePattern || "",
          tweetStructure: analysis.tweetStructure || "",
        });
        console.log(`✅ Stored successfully! Notion Page ID: ${pageId}`);
        analyzedCount++;
      } catch (err) {
        console.error(`❌ Failed to write post to Notion:`, err);
      }

      // Cooldown to respect Notion's QPS limits (500ms delay between writes)
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log(`\n🎉 Task completed successfully! Analyzed and stored ${analyzedCount}/${topTweets.length} tweets.`);
    return {
      status: "success",
      totalTweetsQualified: allQualifiedTweets.length,
      tweetsAnalyzed: analyzedCount,
    };
  },
});
