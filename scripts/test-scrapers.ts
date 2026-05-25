import { scrapeYouTubeChannel, scrapeInstagramReels } from "../src/lib/apify";
import dotenv from "dotenv";

dotenv.config();

async function runTests() {
  console.log("🚀 Starting Scraper Verification Tests...\n");

  // Test YouTube Scraper
  try {
    const ytChannel = "fireship"; // A small, active tech channel with short videos (usually has transcripts/captions)
    console.log(`📹 Testing YouTube Scraper for channel: @${ytChannel}...`);
    const ytResults = await scrapeYouTubeChannel(ytChannel, 1);
    console.log(`   ✓ Received ${ytResults.length} video(s)`);
    if (ytResults.length > 0) {
      const video = ytResults[0];
      console.log(`     - Title: ${video.title}`);
      console.log(`     - URL: ${video.url}`);
      console.log(`     - Views: ${video.views}`);
      console.log(`     - Transcript preview (first 150 chars): "${video.transcript ? video.transcript.substring(0, 150) + "..." : "No transcript extracted!"}"`);
      console.log(`     - Transcript total length: ${video.transcript ? video.transcript.length : 0} characters`);
    } else {
      console.log("   ⚠️ No videos returned from YouTube scraper!");
    }
  } catch (error) {
    console.error("   ❌ YouTube Scraper Test Failed:", error);
  }

  console.log("\n--------------------------------------------------\n");

  // Test Instagram Scraper
  try {
    const igUsername = "zuck"; // Mark Zuckerberg's profile, always has reels
    console.log(`📸 Testing Instagram Scraper for profile: @${igUsername}...`);
    const igResults = await scrapeInstagramReels(igUsername, 1);
    console.log(`   ✓ Received ${igResults.length} post(s)/reel(s)`);
    if (igResults.length > 0) {
      const post = igResults[0];
      console.log(`     - Caption: ${post.caption ? post.caption.substring(0, 100) + "..." : "No caption"}`);
      console.log(`     - URL: ${post.url}`);
      console.log(`     - Play/View count: ${post.videoPlayCount || post.videoViewCount}`);
      console.log(`     - Transcript preview (first 150 chars): "${post.transcript ? post.transcript.substring(0, 150) + "..." : "No transcript extracted!"}"`);
      console.log(`     - Transcript total length: ${post.transcript ? post.transcript.length : 0} characters`);
    } else {
      console.log("   ⚠️ No reels returned from Instagram scraper!");
    }
  } catch (error) {
    console.error("   ❌ Instagram Scraper Test Failed:", error);
  }

  console.log("\n🏁 Test Execution Completed.");
}

runTests().catch(console.error);
