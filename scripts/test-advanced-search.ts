import dotenv from "dotenv";
import { searchTweets } from "../src/lib/twitter";

dotenv.config({ override: true });

async function run() {
  console.log("🚀 Testing Twitter REST API Advanced Search...");
  const username = "gregisenberg";
  // Search query format for tweets from a user
  const query = `from:${username} (AI OR SaaS OR founder OR build)`;
  
  console.log(`Query: "${query}"`);

  try {
    const tweets = await searchTweets(query);
    console.log(`\nSuccess! Received ${tweets.length} tweets.`);
    
    if (tweets.length > 0) {
      console.log("\nSample Tweet from Advanced Search:");
      const t = tweets[0];
      console.log(`- ID: ${t.id}`);
      console.log(`- Created At: ${t.createdAt || t.created_at}`);
      console.log(`- Views: ${t.viewCount || t.viewsCount || 0}`);
      console.log(`- Likes: ${t.likeCount || t.favorite_count || 0}`);
      console.log(`- Text: "${t.text ? t.text.substring(0, 150) : "No text"}"`);
    } else {
      console.log("⚠️ No tweets matched query.");
    }
  } catch (error: any) {
    console.error("❌ Advanced Search test failed:", error.message || error);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}

run();
