import dotenv from "dotenv";
import { searchCreatorPosts } from "../src/lib/twitter";
import { TWITTER_FILTER_THRESHOLDS } from "../src/lib/constants";

dotenv.config({ override: true });

async function testTwitterFiltering() {
  console.log("🚀 Testing Programmatic Twitter Filter Logic");
  console.log(`Configured Thresholds:`);
  console.log(`- Minimum Views: ${TWITTER_FILTER_THRESHOLDS.MIN_VIEWS}`);

  const handle = "gregisenberg";
  console.log(`\nFetching posts for @${handle} from past 14 days...`);

  try {
    const tweets = await searchCreatorPosts(handle, 14);
    console.log(`Total tweets received from API: ${tweets.length}`);

    if (tweets.length === 0) {
      console.log("No tweets found. Try another creator handle.");
      return;
    }

    let passedCount = 0;
    let failedCount = 0;

    console.log("\n--- Detailed Filtering Breakdown ---");
    tweets.forEach((tweet: any, index: number) => {
      const views = tweet.viewCount || 0;
      const textPreview = (tweet.text || "").replace(/\n/g, " ").substring(0, 60);

      const passed = views >= TWITTER_FILTER_THRESHOLDS.MIN_VIEWS;

      if (passed) {
        passedCount++;
        console.log(`[PASS] #${index + 1}: Views: ${views} | "${textPreview}..."`);
      } else {
        failedCount++;
        console.log(`[FAIL] #${index + 1}: Views: ${views} | Views too low (${views} < ${TWITTER_FILTER_THRESHOLDS.MIN_VIEWS}) | "${textPreview}..."`);
      }
    });

    console.log("\n--- Summary ---");
    console.log(`✅ Passed: ${passedCount}`);
    console.log(`❌ Failed: ${failedCount}`);
    console.log(`Total checked: ${tweets.length}`);

  } catch (error) {
    console.error("Test failed with error:", error);
  }
}

testTwitterFiltering();
