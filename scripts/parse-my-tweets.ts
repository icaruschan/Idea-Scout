/**
 * parse-my-tweets.ts
 * 
 * Parses the Twitter data archive to extract original tweets (no replies, no RTs),
 * ranks them by engagement, and outputs the top 200 for voice profile extraction.
 * 
 * Input:  My Twitter Data/data/tweets.js (63MB archive)
 *         My Twitter Data/data/note-tweet.js (long-form tweets)
 * Output: .tmp/my-top-tweets.json
 */

import * as fs from "fs";
import * as path from "path";

const ARCHIVE_DIR = path.resolve(__dirname, "../My Twitter Data/data");
const OUTPUT_DIR = path.resolve(__dirname, "../.tmp");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "my-top-tweets.json");
const TOP_N = 200;

interface ParsedTweet {
  text: string;
  likes: number;
  retweets: number;
  date: string;
  score: number;
  isNoteTweet: boolean;
  charCount: number;
}

function loadArchiveFile(filename: string, prefix: string): any[] {
  const filePath = path.join(ARCHIVE_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ File not found: ${filePath}`);
    return [];
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  // Strip the `window.YTD.xxx.part0 = ` prefix to get valid JSON
  const jsonStr = raw.replace(/^window\.YTD\.\w+\.part0\s*=\s*/, "").trim();
  
  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error(`❌ Failed to parse ${filename}:`, err);
    return [];
  }
}

function isReply(tweet: any): boolean {
  return !!(
    tweet.in_reply_to_status_id ||
    tweet.in_reply_to_status_id_str ||
    tweet.in_reply_to_user_id
  );
}

function isRetweet(tweet: any): boolean {
  if (tweet.retweeted === true) return true;
  const text = tweet.full_text || "";
  return text.startsWith("RT @");
}

function parseTweetDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split("T")[0];
    }
  } catch {}
  return dateStr;
}

function main() {
  console.log("📦 Loading Twitter archive...");

  // ─── Load tweets.js ───────────────────────────────────────────
  const tweetsRaw = loadArchiveFile("tweets.js", "tweets");
  console.log(`  tweets.js: ${tweetsRaw.length} total entries`);

  // ─── Load note-tweet.js (long-form tweets) ────────────────────
  const noteTweetsRaw = loadArchiveFile("note-tweet.js", "note_tweet");
  console.log(`  note-tweet.js: ${noteTweetsRaw.length} total entries`);

  // Build a map of noteTweetId → full text for enrichment
  const noteTweetMap = new Map<string, string>();
  for (const entry of noteTweetsRaw) {
    const nt = entry.noteTweet;
    if (nt?.noteTweetId && nt?.core?.text) {
      noteTweetMap.set(nt.noteTweetId, nt.core.text);
    }
  }
  console.log(`  Note tweet lookup map: ${noteTweetMap.size} entries`);

  // ─── Filter and process tweets ────────────────────────────────
  let filtered = 0;
  let replies = 0;
  let rts = 0;
  let tooShort = 0;

  const originalTweets: ParsedTweet[] = [];

  for (const entry of tweetsRaw) {
    const tweet = entry.tweet;
    if (!tweet) continue;

    // Filter out replies
    if (isReply(tweet)) {
      replies++;
      continue;
    }

    // Filter out retweets
    if (isRetweet(tweet)) {
      rts++;
      continue;
    }

    // Get the best available text
    // Check if this tweet has a note_tweet (long-form) version
    let text = tweet.full_text || "";
    let isNoteTweet = false;

    // The tweet object may reference a note_tweet with the expanded text
    if (tweet.note_tweet?.note_tweet_results?.result?.text) {
      text = tweet.note_tweet.note_tweet_results.result.text;
      isNoteTweet = true;
    }

    // Clean up: remove t.co links at the end (they're just media/link previews)
    text = text.replace(/\s*https:\/\/t\.co\/\w+$/g, "").trim();

    // Filter out very short tweets (likely just links or one-word reactions)
    if (text.length < 30) {
      tooShort++;
      continue;
    }

    const likes = parseInt(tweet.favorite_count || "0", 10);
    const retweets = parseInt(tweet.retweet_count || "0", 10);
    // Weight: RTs are 3x the signal of likes (more indicative of shareability/voice resonance)
    const score = likes + retweets * 3;

    originalTweets.push({
      text,
      likes,
      retweets,
      date: parseTweetDate(tweet.created_at || ""),
      score,
      isNoteTweet,
      charCount: text.length,
    });

    filtered++;
  }

  console.log(`\n📊 Filtering results:`);
  console.log(`  Total entries: ${tweetsRaw.length}`);
  console.log(`  Replies removed: ${replies}`);
  console.log(`  Retweets removed: ${rts}`);
  console.log(`  Too short (<30 chars): ${tooShort}`);
  console.log(`  Original tweets kept: ${filtered}`);
  console.log(`  Of which note tweets: ${originalTweets.filter((t) => t.isNoteTweet).length}`);

  // ─── Sort by engagement score and take top N ──────────────────
  originalTweets.sort((a, b) => b.score - a.score);
  const topTweets = originalTweets.slice(0, TOP_N);

  // Stats
  const avgScore = topTweets.reduce((sum, t) => sum + t.score, 0) / topTweets.length;
  const avgChars = topTweets.reduce((sum, t) => sum + t.charCount, 0) / topTweets.length;
  const noteTweetCount = topTweets.filter((t) => t.isNoteTweet).length;

  console.log(`\n🏆 Top ${TOP_N} tweets selected:`);
  console.log(`  Avg engagement score: ${avgScore.toFixed(1)}`);
  console.log(`  Avg character count: ${avgChars.toFixed(0)}`);
  console.log(`  Note tweets (long-form): ${noteTweetCount}`);
  console.log(`  Score range: ${topTweets[topTweets.length - 1]?.score} → ${topTweets[0]?.score}`);

  // Show top 5 previews
  console.log(`\n📝 Top 5 tweets by engagement:`);
  for (const t of topTweets.slice(0, 5)) {
    console.log(`  [${t.score} pts, ${t.likes}❤️, ${t.retweets}🔁] ${t.text.substring(0, 100)}...`);
  }

  // ─── Write output ─────────────────────────────────────────────
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Strip the score/metadata for the output — keep just what the LLM needs
  const output = topTweets.map((t) => ({
    text: t.text,
    likes: t.likes,
    retweets: t.retweets,
    date: t.date,
    score: t.score,
  }));

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), "utf-8");
  console.log(`\n✅ Output written to: ${OUTPUT_FILE}`);
  console.log(`   File size: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1)} KB`);
}

main();
