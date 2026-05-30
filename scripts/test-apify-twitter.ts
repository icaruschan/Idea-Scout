import dotenv from "dotenv";
import { scrapeTwitterProfiles } from "../src/lib/apify";
import { TWITTER_FILTER_THRESHOLDS } from "../src/lib/constants";

dotenv.config({ override: true });

async function run() {
  console.log("🚀 Testing Apify Twitter Scraper...");
  console.log(`Configured TWITTER_FILTER_THRESHOLDS.MIN_VIEWS: ${TWITTER_FILTER_THRESHOLDS.MIN_VIEWS}`);

  const testHandles = ["gregisenberg", "levelsio", "heydavesh"];
  console.log(`Handles: ${testHandles.join(", ")}`);

  try {
    const tweets = await scrapeTwitterProfiles(testHandles, 5);
    console.log(`\nTotal tweets returned by Apify: ${tweets.length}`);

    if (tweets.length === 0) {
      console.log("⚠️ Apify returned 0 tweets. Check Apify console or actor logs.");
      return;
    }

    tweets.forEach((t, i) => {
      console.log(`\nTweet #${i + 1}:`);
      console.log(`- Author: @${t.author?.userName} (${t.author?.name})`);
      console.log(`- Views: ${t.views}`);
      console.log(`- Likes: ${t.likes}`);
      console.log(`- URL: ${t.url}`);
      console.log(`- Text: "${t.text.substring(0, 150)}..."`);
      
      const passedViews = t.views >= TWITTER_FILTER_THRESHOLDS.MIN_VIEWS;
      console.log(`- Views >= Min Views (${TWITTER_FILTER_THRESHOLDS.MIN_VIEWS})? ${passedViews ? "✅ YES" : "❌ NO"}`);
    });

  } catch (error: any) {
    console.error("❌ Test failed with error:", error.message || error);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

run();
