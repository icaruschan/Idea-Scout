/**
 * merge-dreyshq-samples.ts
 *
 * Replaces Dreyshq entries in src/data/creator-voice-samples.json with
 * curated builder-focused samples from archive scoring + pinned exemplars.
 *
 * Run: npx tsx scripts/merge-dreyshq-samples.ts
 */

import * as fs from "fs";
import * as path from "path";

const DATA_PATH = path.resolve(__dirname, "../src/data/creator-voice-samples.json");
const CANDIDATES_PATH = path.resolve(__dirname, "../.tmp/dreyshq-candidate-samples.json");
const LEGACY_TMP_PATH = path.resolve(__dirname, "../.tmp/creator-voice-samples.json");

interface VoiceSample {
  handle: string;
  text: string;
  likes: number;
  retweets: number;
  bookmarks: number;
  views: number;
  date: string;
  relevanceScore?: number;
}

const PINNED_TEXT_PREFIXES = [
  "staring at a blank page hoping for inspiration",
  "Creativity is the MOAT",
];

const HARD_EXCLUDE = [
  "ronin taco",
  "persona ip",
  "immutable",
  "pixel heroes",
  "bonsai",
  "virtuals_io",
  "sei network",
  "star platinum",
  "ready player one",
  "goro taniguchi",
  "ravenquest",
  "pudgy party",
  "shatterline",
  "abstract coded",
  "kaito gave",
  "mr beast makes",
  "among us",
  "fps game",
  "auto clicking",
  "tibia",
  "ravenquest",
  "chaingpt",
  "blockchain that's a crazy mix",
];

function normalizeSample(sample: VoiceSample): VoiceSample {
  const { relevanceScore, ...rest } = sample;
  return {
    handle: "Dreyshq",
    text: rest.text.trim(),
    likes: rest.likes ?? 0,
    retweets: rest.retweets ?? 0,
    bookmarks: rest.bookmarks ?? 0,
    views: rest.views ?? 0,
    date: rest.date ?? "",
  };
}

function isExcluded(text: string): boolean {
  const low = text.toLowerCase();
  return HARD_EXCLUDE.some((term) => low.includes(term));
}

function dedupe(samples: VoiceSample[]): VoiceSample[] {
  const seen = new Set<string>();
  const out: VoiceSample[] = [];
  for (const sample of samples) {
    const key = sample.text.slice(0, 160);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(sample);
  }
  return out;
}

function main() {
  const all = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8")) as VoiceSample[];
  const others = all.filter((s) => s.handle !== "Dreyshq");

  const candidates: VoiceSample[] = fs.existsSync(CANDIDATES_PATH)
    ? JSON.parse(fs.readFileSync(CANDIDATES_PATH, "utf-8"))
    : [];

  const legacy: VoiceSample[] = fs.existsSync(LEGACY_TMP_PATH)
    ? JSON.parse(fs.readFileSync(LEGACY_TMP_PATH, "utf-8")).filter(
        (s: VoiceSample) => s.handle === "Dreyshq",
      )
    : [];

  const pinned = legacy.filter((s) =>
    PINNED_TEXT_PREFIXES.some((prefix) => s.text.startsWith(prefix)),
  );

  const merged = dedupe(
    [...pinned, ...candidates.map(normalizeSample)].filter(
      (s) => !isExcluded(s.text) && s.text.length >= 80,
    ),
  );

  if (merged.length < 30) {
    throw new Error(
      `Only ${merged.length} curated Dreyshq samples after merge (need >= 30).`,
    );
  }

  const dreyshq = merged.slice(0, 50);
  const output = [...others, ...dreyshq];

  fs.writeFileSync(DATA_PATH, JSON.stringify(output, null, 2), "utf-8");

  console.log(`✅ Wrote ${dreyshq.length} Dreyshq + ${others.length} other samples`);
  console.log(`   Total: ${output.length}`);
  console.log("\nTop 5 Dreyshq by likes in new pool:");
  dreyshq
    .slice()
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 5)
    .forEach((s, i) =>
      console.log(`  ${i + 1}. [${s.likes}❤️] ${s.text.slice(0, 85).replace(/\n/g, " ")}...`),
    );
}

main();