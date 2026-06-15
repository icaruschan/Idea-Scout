/**
 * curate-dreyshq-samples.ts
 *
 * Scores Twitter archive originals for Builder-Retrospective voice fit,
 * writes ranked candidates to .tmp/dreyshq-candidate-samples.json.
 *
 * Run: npx tsx scripts/curate-dreyshq-samples.ts
 */

import * as fs from "fs";
import * as path from "path";

const ARCHIVE_DIR = path.resolve(__dirname, "../My Twitter Data/data");
const OUTPUT = path.resolve(__dirname, "../.tmp/dreyshq-candidate-samples.json");
const TARGET_COUNT = 50;

const BUILDER_POSITIVE = [
  "i built",
  "i spent",
  "i finally",
  "i tried",
  "i did a thing",
  "vibe coding",
  "automation",
  "workflow",
  "agent",
  "claude",
  "cursor",
  "n8n",
  "trigger",
  "pipeline",
  "scout",
  "scrape",
  "notion",
  "open source",
  "github",
  "api",
  "llm",
  "prompt",
  "shipping",
  "shipped",
  "debug",
  "fixed my",
  "lesson",
  "scar tissue",
  "burned out",
  "burnout",
  "creativity is the moat",
  "idea scout",
];

const BUILDER_NEGATIVE = [
  "ronin",
  "persona ip",
  "azuki",
  "immutable",
  "pixel heroes",
  "bonsai",
  "virtuals_io",
  "sei network",
  "web3",
  "crypto",
  "nft",
  "memecoin",
  "gaming",
  "mmorpg",
  "pudgy",
  "ravenquest",
  "tibia",
  "shatterline",
  "lumiterra",
  "abstract coded",
  "kaito",
  "star platinum",
  "mr beast",
  "ready player one",
  "uptober",
  "charts",
  "virgen",
  "yapping",
  "among us",
  "fps game",
  "auto clicking",
  "tibia",
  "ravenquest",
  "hooked with @",
  "chaingpt",
  "blockchain",
];

interface ScoredTweet {
  handle: "Dreyshq";
  text: string;
  likes: number;
  retweets: number;
  bookmarks: number;
  views: number;
  date: string;
  relevanceScore: number;
}

function loadArchiveFile(filename: string): any[] {
  const filePath = path.join(ARCHIVE_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  const jsonStr = raw.replace(/^window\.YTD\.\w+\.part0\s*=\s*/, "").trim();
  return JSON.parse(jsonStr);
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
  return (tweet.full_text || "").startsWith("RT @");
}

function scoreTweet(text: string, likes: number, retweets: number): number {
  const low = text.toLowerCase();
  let score = 0;

  for (const term of BUILDER_POSITIVE) {
    if (low.includes(term)) score += 12;
  }
  for (const term of BUILDER_NEGATIVE) {
    if (low.includes(term)) score -= 25;
  }

  if (/\[1\/\d+\]/.test(text)) score -= 8;
  if (low.includes("this is ") && low.includes("he's known")) score -= 15;
  if (low.startsWith("day ") && low.includes("journey")) score -= 20;

  if (/\bi (built|spent|fixed|tried|learned|finally)\b/i.test(text)) score += 18;
  if (/\b(how it works|here's what|step \d|→)\b/i.test(text)) score += 10;

  const engagement = Math.log10(Math.max(1, likes + retweets * 3 + 1));
  score += engagement * 4;

  return score;
}

function main() {
  const tweetsRaw = loadArchiveFile("tweets.js");
  const scored: ScoredTweet[] = [];

  for (const entry of tweetsRaw) {
    const tweet = entry.tweet;
    if (!tweet || isReply(tweet) || isRetweet(tweet)) continue;

    let text = tweet.full_text || "";
    if (tweet.note_tweet?.note_tweet_results?.result?.text) {
      text = tweet.note_tweet.note_tweet_results.result.text;
    }
    text = text.replace(/\s*https:\/\/t\.co\/\w+$/g, "").trim();
    if (text.length < 80) continue;

    const likes = parseInt(tweet.favorite_count || "0", 10);
    const retweets = parseInt(tweet.retweet_count || "0", 10);
    const relevanceScore = scoreTweet(text, likes, retweets);
    if (relevanceScore < 8) continue;

    scored.push({
      handle: "Dreyshq",
      text,
      likes,
      retweets,
      bookmarks: 0,
      views: 0,
      date: tweet.created_at || "",
      relevanceScore,
    });
  }

  scored.sort((a, b) => b.relevanceScore - a.relevanceScore);

  const seen = new Set<string>();
  const unique: ScoredTweet[] = [];
  for (const item of scored) {
    const key = item.text.slice(0, 120);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }

  const selected = unique.slice(0, TARGET_COUNT);

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(selected, null, 2), "utf-8");

  console.log(`Scored ${scored.length} candidates, wrote ${selected.length} to ${OUTPUT}`);
  console.log("\nTop 10 by relevance:");
  for (const t of selected.slice(0, 10)) {
    console.log(
      `[${t.relevanceScore.toFixed(1)}] ${t.likes}❤️ ${t.text.slice(0, 90).replace(/\n/g, " ")}...`,
    );
  }
}

main();