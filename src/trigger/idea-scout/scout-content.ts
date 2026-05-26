import { schedules, task } from "@trigger.dev/sdk/v3";
import {
  getYouTubeCreators,
  getInstagramCreators,
  getTwitterCreators,
  updateCreatorLastChecked,
  getScoutedItemsForCreator,
  cleanContentUrl,
} from "../../lib/notion";
import {
  scrapeYouTubeChannel,
  scrapeInstagramReels,
} from "../../lib/apify";
import { searchCreatorPosts } from "../../lib/twitter";
import { processContent } from "./process-content";
import type { RawContentItem } from "./process-content";
import { draftIdeas } from "./draft-ideas";
import { TWITTER_FILTER_THRESHOLDS } from "../../lib/constants";

// ═══════════════════════════════════════════════════════════════
// IDEA SCOUT — Orchestrator
// ═══════════════════════════════════════════════════════════════
// Runs every Tuesday at 4:30 AM UTC.
// Step 1: Query creators from 3 platforms (YT: 10, IG: 10, X: 24)
// Step 2: Scrape content from each platform
// Step 3: Dispatch each piece of content to process-content task
// Step 4: Once all processing is done, dispatch draft-ideas
// ═══════════════════════════════════════════════════════════════

export const scoutContent = schedules.task({
  id: "scout-content",
  cron: "30 4 * * 2", // Tuesday at 4:30 AM UTC
  maxDuration: 3600,  // 1 hour — accounts for Apify actor wait times
  run: async (payload) => {
    const runTimestamp = payload?.timestamp ?? new Date().toISOString();
    console.log(`🔍 Idea Scout starting at ${runTimestamp}`);

    const allRawContent: RawContentItem[] = [];
    const processedCreatorIds: string[] = [];
    const failedCreators: { name: string; handle: string; platform: string; error: string }[] = [];

    // ─── STEP 1: Gather creators from all 3 platforms ───────────

    const [ytCreators, igCreators, xCreators] = await Promise.all([
      getYouTubeCreators(10),
      getInstagramCreators(10),
      getTwitterCreators(24),
    ]);

    console.log(
      `Creators loaded → YT: ${ytCreators.length}, IG: ${igCreators.length}, X: ${xCreators.length}`,
    );

    // ─── STEP 2A: Scrape YouTube channels ───────────────────────

    for (const creator of ytCreators) {
      if (!creator.handle) continue;

      try {
        const { urls: existingUrls, titles: existingTitles } = await getScoutedItemsForCreator(creator.pageId, "YouTube");

        // Extract handle from channel URL
        const urlParts = creator.handle.replace(/\/$/, "").split("/");
        const channelHandle = urlParts[urlParts.length - 1];

        const videos = await scrapeYouTubeChannel(channelHandle, 5);
        console.log(
          `YT @${channelHandle}: ${videos.length} videos scraped`,
        );

        for (const video of videos) {
          const cleanUrl = cleanContentUrl(video.url);
          const normTitle = video.title.toLowerCase().trim();
          
          const isDuplicate = existingUrls.includes(cleanUrl) || existingTitles.some(t => 
            t === normTitle || t.includes(normTitle) || normTitle.includes(t)
          );

          if (isDuplicate) {
            console.log(`⏭️ Skipping duplicate YT video: "${video.title.substring(0, 60)}"`);
            continue;
          }

          allRawContent.push({
            platform: "YouTube",
            creatorPageId: creator.pageId,
            creatorName: creator.name,
            title: video.title,
            text: video.description,
            url: video.url,
            likes: video.likes,
            views: video.views,
            comments: video.comments,
            publishedDate: video.publishDate,
            transcript: video.transcript || "",
          });
        }

        processedCreatorIds.push(creator.pageId);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.warn(`Failed to scrape YT creator ${creator.name}:`, err);
        failedCreators.push({
          name: creator.name,
          handle: creator.handle || "",
          platform: "YouTube",
          error: errorMsg,
        });
      }
    }

    // Cooldown between platform phases to let Apify actors release memory
    if (ytCreators.length > 0) {
      console.log("⏸️ Cooldown before Instagram phase...");
      await new Promise(r => setTimeout(r, 5000));
    }

    // ─── STEP 2B: Scrape Instagram reels ────────────────────────

    for (const creator of igCreators) {
      if (!creator.handle) continue;

      try {
        const { urls: existingUrls, titles: existingTitles } = await getScoutedItemsForCreator(creator.pageId, "Instagram");
        const reels = await scrapeInstagramReels(creator.handle, 10, existingUrls);
        console.log(
          `IG @${creator.handle}: ${reels.length} reels scraped`,
        );

        for (const reel of reels) {
          const cleanUrl = cleanContentUrl(reel.url);
          const reelTitle = reel.caption.substring(0, 200) || `Reel by ${creator.name}`;
          const normTitle = reelTitle.toLowerCase().trim();

          const isDuplicate = existingUrls.includes(cleanUrl) || existingTitles.some(t => 
            t === normTitle || t.includes(normTitle) || normTitle.includes(t)
          );

          if (isDuplicate) {
            console.log(`⏭️ Skipping duplicate IG reel: "${reelTitle.substring(0, 60)}"`);
            continue;
          }

          allRawContent.push({
            platform: "Instagram",
            creatorPageId: creator.pageId,
            creatorName: creator.name,
            title: reelTitle,
            text: reel.caption,
            url: reel.url,
            likes: reel.likesCount,
            views: reel.videoViewCount || reel.videoPlayCount,
            comments: reel.commentsCount,
            publishedDate: reel.timestamp,
            transcript: reel.transcript,
          });
        }

        processedCreatorIds.push(creator.pageId);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.warn(`Failed to scrape IG creator ${creator.name}:`, err);
        failedCreators.push({
          name: creator.name,
          handle: creator.handle || "",
          platform: "Instagram",
          error: errorMsg,
        });
      }
    }

    // Cooldown between platform phases
    if (igCreators.length > 0) {
      console.log("⏸️ Cooldown before Twitter phase...");
      await new Promise(r => setTimeout(r, 5000));
    }

    // ─── STEP 2C: Scrape Twitter (X) posts ──────────────────────

    for (const creator of xCreators) {
      if (!creator.handle) continue;

      try {
        const { urls: existingUrls, titles: existingTitles } = await getScoutedItemsForCreator(creator.pageId, "X");
        const tweets = await searchCreatorPosts(creator.handle, 14);
        
        // 1. Filter programmatically by minimum views
        const qualifiedTweets = tweets.filter((t: any) => {
          const views = t.viewCount || 0;
          return views >= TWITTER_FILTER_THRESHOLDS.MIN_VIEWS;
        });

        // 2. Filter out duplicates first
        const nonDuplicateTweets = qualifiedTweets.filter((tweet: any) => {
          const tweetUrl = tweet.url || `https://x.com/${creator.handle}/status/${tweet.id}`;
          const cleanUrl = cleanContentUrl(tweetUrl);
          const tweetTitle = (tweet.text || "").substring(0, 200);
          const normTitle = tweetTitle.toLowerCase().trim();

          return !(existingUrls.includes(cleanUrl) || existingTitles.some(t => 
            t === normTitle || t.includes(normTitle) || normTitle.includes(t)
          ));
        });

        // 3. Take the 10 most recent qualified, non-duplicate tweets (prioritizing fresh ideas over just viral hits)
        const recentTweets = nonDuplicateTweets.slice(0, 10);
        
        console.log(
          `X @${creator.handle}: ${recentTweets.length} new tweets scraped (from ${tweets.length} original posts in past 14 days)`,
        );

        for (const tweet of recentTweets) {
          const tweetUrl = tweet.url || `https://x.com/${creator.handle}/status/${tweet.id}`;
          const tweetTitle = (tweet.text || "").substring(0, 200);

          allRawContent.push({
            platform: "X",
            creatorPageId: creator.pageId,
            creatorName: creator.name,
            title: tweetTitle,
            text: tweet.text || "",
            url: tweetUrl,
            likes: tweet.likeCount || 0,
            views: tweet.viewCount || 0,
            comments: tweet.replyCount || 0,
            publishedDate: tweet.createdAt || "",
            transcript: "",
          });
        }

        processedCreatorIds.push(creator.pageId);

        // Rate limit: 5s between Twitter API calls
        await new Promise((r) => setTimeout(r, 5000));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.warn(`Failed to scrape X creator ${creator.handle}:`, err);
        failedCreators.push({
          name: creator.name,
          handle: creator.handle || "",
          platform: "X",
          error: errorMsg,
        });
      }
    }

    console.log(
      `📦 Total raw content items: ${allRawContent.length} from ${processedCreatorIds.length} creators`,
    );

    // ─── STEP 3: Dispatch to process-content ────────────────────
    // Each content item gets AI-filtered and stored in Scouted Content DB

    const processResults: string[] = [];
    let processedCount = 0;
    let skippedCount = 0;

    if (allRawContent.length > 0) {
      try {
        const batch = await processContent.batchTriggerAndWait(
          allRawContent.map((item) => ({
            payload: item,
            options: {
              idempotencyKey: `process-${item.platform}-${item.url?.replace(/\W/g, "").substring(0, 60) || Date.now()}`,
            },
          }))
        );

        for (const res of batch.runs) {
          if (res.ok && res.output?.scoutedContentId) {
            processResults.push(res.output.scoutedContentId);
            processedCount++;
          } else {
            skippedCount++;
          }
        }
      } catch (err) {
        console.error("Batch processing failed:", err);
        // We'll proceed with whatever was processed if it failed midway, 
        // but batchTriggerAndWait usually throws if the batch itself fails
      }
    }

    console.log(
      `✅ Processing complete: ${processedCount} stored, ${skippedCount} skipped/filtered`,
    );

    // ─── STEP 4: Update Last Checked for all processed creators ─

    const uniqueCreatorIds = [...new Set(processedCreatorIds)];
    for (const pageId of uniqueCreatorIds) {
      await updateCreatorLastChecked(pageId);
    }
    console.log(`📅 Updated Last Checked for ${uniqueCreatorIds.length} creators`);

    // ─── STEP 5: Dispatch synthesis/draft step ──────────────────

    if (processResults.length > 0) {
      try {
        const draftResult = await draftIdeas.triggerAndWait(
          { scoutedContentIds: processResults },
          { idempotencyKey: `draft-${new Date().toISOString().split("T")[0]}` },
        );

        if (draftResult.ok) {
          console.log(
            `💡 Draft complete: ${draftResult.output?.ideasCreated || 0} ideas generated`,
          );
        }
      } catch (err) {
        console.error("Draft ideas task failed:", err);
      }
    } else {
      console.log("⚠️ No content passed filtering — skipping draft step");
    }

    if (failedCreators.length > 0) {
      console.warn(
        `⚠️ Failed to scrape ${failedCreators.length} creators:\n` +
          failedCreators.map((f) => `- [${f.platform}] ${f.name} (@${f.handle}): ${f.error}`).join("\n"),
      );
    }

    return {
      rawContentScraped: allRawContent.length,
      contentStored: processedCount,
      contentSkipped: skippedCount,
      creatorsProcessed: uniqueCreatorIds.length,
      creatorsFailedCount: failedCreators.length,
      failedCreators,
    };
  },
});
