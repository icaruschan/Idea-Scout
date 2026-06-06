/**
 * scrape-creator-voice.ts
 * 
 * Scrapes recent tweets from target creators (@sharbel, @zaimiri) using
 * the existing TwitterAPI.io client. Filters by views >= 1000 and outputs
 * the top 50 tweets per creator for voice profile extraction.
 * 
 * Output: .tmp/creator-voice-samples.json
 */

import * as fs from "fs";
import * as path from "path";
import { searchCreatorPosts } from "../src/lib/twitter";

const OUTPUT_DIR = path.resolve(__dirname, "../.tmp");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "creator-voice-samples.json");

const CREATORS = ["sharbel", "zaimiri"];
const DAYS_BACK = 60;
const MIN_VIEWS = 1000;
const TOP_PER_CREATOR = 50;

interface CreatorTweet {
  handle: string;
  text: string;
  likes: number;
  retweets: number;
  bookmarks: number;
  views: number;
  date: string;
}

async function main() {
  console.log("🔍 Scraping creator tweets for voice profile extraction...\n");

  const allSamples: CreatorTweet[] = [];

  for (const handle of CREATORS) {
    console.log(`\n📡 Fetching tweets for @${handle} (last ${DAYS_BACK} days)...`);

    try {
      const tweets = await searchCreatorPosts(handle, DAYS_BACK);
      console.log(`  Raw tweets fetched: ${tweets.length}`);

      // Filter by views and extract text
      const filtered: CreatorTweet[] = [];

      for (const tweet of tweets) {
        const views = parseInt(tweet.viewCount || tweet.views || "0", 10);
        if (views < MIN_VIEWS) continue;

        // Get tweet text — prefer note_tweet expanded text if available
        let text = tweet.text || tweet.full_text || "";

        // Skip if it's just a link or too short
        text = text.replace(/\s*https:\/\/t\.co\/\w+$/g, "").trim();
        if (text.length < 30) continue;

        filtered.push({
          handle,
          text,
          likes: parseInt(tweet.likeCount || tweet.favorite_count || "0", 10),
          retweets: parseInt(tweet.retweetCount || tweet.retweet_count || "0", 10),
          bookmarks: parseInt(tweet.bookmarkCount || "0", 10),
          views,
          date: tweet.createdAt || tweet.created_at || "",
        });
      }

      // Sort by views (best indicator of reach/resonance) and take top N
      filtered.sort((a, b) => b.views - a.views);
      const top = filtered.slice(0, TOP_PER_CREATOR);

      console.log(`  After filtering (views >= ${MIN_VIEWS}, len >= 30): ${filtered.length}`);
      console.log(`  Selected top ${top.length} tweets`);

      if (top.length > 0) {
        const avgViews = top.reduce((s, t) => s + t.views, 0) / top.length;
        console.log(`  Avg views: ${avgViews.toFixed(0)}`);
        console.log(`  Top tweet preview: "${top[0].text.substring(0, 100)}..."`);
      }

      allSamples.push(...top);
    } catch (err: any) {
      console.error(`  ❌ Failed to scrape @${handle}:`, err.message || err);
    }
  }

  console.log(`\n📊 Total creator samples collected: ${allSamples.length}`);

  // ─── Write output ─────────────────────────────────────────────
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allSamples, null, 2), "utf-8");
  console.log(`✅ Output written to: ${OUTPUT_FILE}`);
  console.log(`   File size: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1)} KB`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
