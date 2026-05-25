import dotenv from "dotenv";
import {
  getYouTubeCreators,
  getInstagramCreators,
  getTwitterCreators,
  createScoutedContent,
} from "../src/lib/notion";
import {
  scrapeYouTubeChannel,
  scrapeInstagramReels,
} from "../src/lib/apify";
import { searchCreatorPosts } from "../src/lib/twitter";
import { generateJSON } from "../src/lib/llm";
import { CONTENT_PILLARS } from "../src/lib/constants";

dotenv.config({ override: true });

const RELEVANCE_SYSTEM_PROMPT = `You are a content relevance analyst for a Twitter (X) creator who covers AI, automation, coding, Web3, and creator economy topics.
Your job is to evaluate whether a piece of content is relevant to the creator's content pillars.
THE 9 ACTIVE CONTENT PILLARS:
${CONTENT_PILLARS.map((p, i) => `${i + 1}. ${p}`).join("\n")}
Respond with pure JSON only:
{
  "relevant": true/false,
  "confidence": 0.0-1.0,
  "matchedPillars": ["Pillar1"],
  "reasoning": "Brief explanation"
}`;

async function testPipeline() {
  console.log("🚀 Starting End-to-End Pipeline Integration Test");

  // 1. GATHER CREATORS
  console.log("\n--- Step 1: Gathering Creators from Notion ---");
  const ytCreators = await getYouTubeCreators(1);
  const igCreators = await getInstagramCreators(1);
  const xCreators = await getTwitterCreators(1);

  const ytCreator = ytCreators[0];
  const igCreator = igCreators[0];
  const xCreator = xCreators[0];

  console.log("YouTube Creator Selected:", ytCreator);
  console.log("Instagram Creator Selected:", igCreator);
  console.log("Twitter Creator Selected:", xCreator);

  if (!ytCreator || !igCreator || !xCreator) {
    console.error("Missing one or more creators in the database. Cannot proceed.");
    return;
  }

  // Helper to process a raw item (running relevance check, summarizing, and writing to Notion)
  async function processItem(rawItem: any) {
    console.log(`\nEvaluating: "${rawItem.title.substring(0, 80)}..."`);
    const contentBody = `${rawItem.title}\n\n${rawItem.text}\n\n${rawItem.transcript || ""}`.substring(0, 6000);

    const filterPrompt = `Evaluate this ${rawItem.platform} content for relevance:
CREATOR: ${rawItem.creatorName}
TITLE: ${rawItem.title}
CONTENT:
${contentBody}
ENGAGEMENT: ${rawItem.likes} likes, ${rawItem.views} views, ${rawItem.comments} comments`;

    console.log(`Running LLM relevance filter for ${rawItem.platform}...`);
    const filterResult = await generateJSON(filterPrompt, RELEVANCE_SYSTEM_PROMPT, 0.3);
    console.log("Filter Result:", filterResult);

    // For testing purposes, we will write to Notion even if relevance score is low, but we'll flag if it was filtered
    console.log("Running LLM summarization...");
    const summaryPrompt = `Summarize this content:
CREATOR: ${rawItem.creatorName}
TITLE: ${rawItem.title}
CONTENT:
${contentBody}`;

    const summaryResult = await generateJSON(
      summaryPrompt,
      "Summarize the core message in 2 sentences. Return JSON: { \"summary\": \"string\", \"keyTakeaways\": \"string (bullet points with →)\", \"tweetAngle\": \"string\" }",
      0.5
    );
    console.log("Summary Result:", summaryResult);

    console.log(`Writing to Notion Scouted Content database for ${rawItem.platform}...`);
    const pageId = await createScoutedContent({
      title: rawItem.title,
      platform: rawItem.platform,
      url: rawItem.url,
      likes: rawItem.likes,
      views: rawItem.views,
      comments: rawItem.comments,
      publishedDate: rawItem.publishedDate,
      aiSummary: summaryResult.summary,
      keyTakeaways: summaryResult.keyTakeaways,
      transcript: rawItem.transcript || "",
      creatorPageId: rawItem.creatorPageId,
    });
    console.log(`✅ Success! Created Notion page: https://notion.so/${pageId.replace(/-/g, "")}`);
  }

  // 2. SCRAPE AND PROCESS YOUTUBE
  console.log("\n--- Step 2A: Scraping YouTube Channel ---");
  try {
    const urlParts = ytCreator.handle.replace(/\/$/, "").split("/");
    const channelHandle = urlParts[urlParts.length - 1];
    console.log(`Scraping YouTube handle: ${channelHandle}`);
    const videos = await scrapeYouTubeChannel(channelHandle, 1);
    if (videos.length > 0) {
      const video = videos[0];
      await processItem({
        platform: "YouTube",
        creatorPageId: ytCreator.pageId,
        creatorName: ytCreator.name,
        title: video.title,
        text: video.description,
        url: video.url,
        likes: video.likes,
        views: video.views,
        comments: video.comments,
        publishedDate: video.publishDate,
        transcript: video.transcript || "",
      });
    } else {
      console.log("No videos scraped.");
    }
  } catch (err) {
    console.error("YouTube step failed:", err);
  }

  // 3. SCRAPE AND PROCESS INSTAGRAM
  console.log("\n--- Step 2B: Scraping Instagram Reels ---");
  try {
    console.log(`Scraping Instagram handle: ${igCreator.handle}`);
    const reels = await scrapeInstagramReels(igCreator.handle, 1);
    if (reels.length > 0) {
      const reel = reels[0];
      await processItem({
        platform: "Instagram",
        creatorPageId: igCreator.pageId,
        creatorName: igCreator.name,
        title: reel.caption?.substring(0, 150) || `Reel by ${igCreator.name}`,
        text: reel.caption || "",
        url: reel.url,
        likes: reel.likesCount || 0,
        views: reel.videoViewCount || reel.videoPlayCount || 0,
        comments: reel.commentsCount || 0,
        publishedDate: reel.timestamp,
        transcript: reel.transcript || "",
      });
    } else {
      console.log("No reels scraped.");
    }
  } catch (err) {
    console.error("Instagram step failed:", err);
  }

  // 4. SCRAPE AND PROCESS TWITTER (X)
  console.log("\n--- Step 2C: Scraping Twitter (X) ---");
  try {
    console.log(`Scraping X handle: ${xCreator.handle}`);
    const tweets = await searchCreatorPosts(xCreator.handle, 30);
    if (tweets.length > 0) {
      const tweet = tweets[0];
      await processItem({
        platform: "X",
        creatorPageId: xCreator.pageId,
        creatorName: xCreator.name,
        title: tweet.text?.substring(0, 150) || `Tweet by ${xCreator.name}`,
        text: tweet.text || "",
        url: tweet.url || `https://x.com/${xCreator.handle}/status/${tweet.id}`,
        likes: tweet.likeCount || 0,
        views: tweet.viewCount || 0,
        comments: tweet.replyCount || 0,
        publishedDate: tweet.createdAt,
        transcript: "",
      });
    } else {
      console.log("No tweets scraped.");
    }
  } catch (err) {
    console.error("Twitter step failed:", err);
  }
}

testPipeline();
