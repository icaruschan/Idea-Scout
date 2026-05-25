/**
 * Ideas Bank Audit Script
 *
 * Scans all ideas in the Ideas Bank and identifies problematic ones:
 * - Wrong context (trend keyword doesn't match actual topic)
 * - Dated references (old AI models, past events)
 * - Non-tech topics (sports, entertainment, religion, politics)
 *
 * Outputs a report and optionally archives bad ideas.
 */

import { Client } from "@notionhq/client";
import dotenv from "dotenv";
dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const IDEAS_BANK_DATA_SOURCE_ID = "553eb2c3-82cb-4fb7-abff-6652cb694e4a";

// Known false positive patterns - keywords that often get misidentified
const FALSE_POSITIVE_PATTERNS = [
  // Sports figures with tech-sounding names
  {
    keyword: /kimi/i,
    badContext: /f1|formula|race|antonelli|driver|championship|grand prix/i,
  },
  {
    keyword: /amen/i,
    badContext: /grammy|rockets|nfl|thompson|shaboozey|church|prayer|blessed/i,
  },
  {
    keyword: /jupiter/i,
    badContext: /tiger woods|golf|tgl|planet|moon|astronomy/i,
  },

  // Entertainment
  { keyword: /bully/i, badContext: /kanye|ye|album|music|release|drop/i },
  {
    keyword: /hosanna/i,
    badContext: /palm sunday|easter|church|jesus|blessed/i,
  },

  // Dated references
  { keyword: /nov(ember)?\s*2022/i, badContext: /.*/ },
  { keyword: /40\s*months?\s*(of)?\s*ai/i, badContext: /.*/ },
  { keyword: /chatgpt\s*(burst|launch|release)/i, badContext: /2022|2023/ },

  // Generic sports/entertainment
  {
    keyword: /game\s*2/i,
    badContext: /baseball|basketball|nba|mlb|finals|playoffs|blue jays|reds/i,
  },
  { keyword: /march madness/i, badContext: /.*/ },
  { keyword: /super bowl/i, badContext: /.*/ },
];

// Non-tech categories that should be flagged
const NON_TECH_INDICATORS = [
  /\bf1\b|formula\s*1|grand\s*prix|racing/i,
  /grammy|oscar|emmy|award\s*show/i,
  /nfl|nba|mlb|nhl|soccer|football|basketball|baseball/i,
  /palm\s*sunday|easter|christmas|holy\s*week|blessed\s*is\s*he/i,
  /kanye|ye\b|taylor\s*swift|drake|beyonce/i,
  /tiger\s*woods|golf|pga/i,
  /election|trump|biden|congress|senate/i,
];

interface IdeaAuditResult {
  id: string;
  title: string;
  source: string;
  category: string;
  createdTime: string;
  issues: string[];
  rawContext: string;
  recommendation: "keep" | "review" | "archive";
}

async function fetchAllIdeas(): Promise<any[]> {
  const allResults: any[] = [];
  let hasMore = true;
  let startCursor: string | undefined;

  while (hasMore) {
    const response: any = await notion.dataSources.query({
      data_source_id: IDEAS_BANK_DATA_SOURCE_ID,
      page_size: 100,
      start_cursor: startCursor,
    });

    allResults.push(...response.results);
    hasMore = response.has_more;
    startCursor = response.next_cursor;
  }

  return allResults;
}

function auditIdea(idea: any): IdeaAuditResult {
  const props = idea.properties || {};
  const title = props["Idea"]?.title?.[0]?.plain_text || "Untitled";
  const source = props["Source"]?.select?.name || "Unknown";
  const category =
    props["Category"]?.multi_select?.map((c: any) => c.name).join(", ") ||
    "Uncategorized";
  const createdTime = idea.created_time || "";

  // Get the raw context from the page content (we'd need to fetch page content for this)
  // For now, we'll check the title and hook angle
  const hookAngle = props["Hook Angle"]?.rich_text?.[0]?.plain_text || "";
  const rawContext = `${title} ${hookAngle}`;

  const issues: string[] = [];

  // Check for false positive patterns
  for (const pattern of FALSE_POSITIVE_PATTERNS) {
    if (pattern.keyword.test(title) && pattern.badContext.test(rawContext)) {
      issues.push(`False positive: "${title}" matches bad context pattern`);
    }
  }

  // Check for non-tech indicators in the content
  for (const indicator of NON_TECH_INDICATORS) {
    if (indicator.test(rawContext)) {
      issues.push(
        `Non-tech content detected: ${indicator.source || indicator.toString()}`,
      );
      break; // One is enough
    }
  }

  // Check for dated references
  if (/2022|2023|nov(ember)?\s*2022|40\s*months/i.test(rawContext)) {
    issues.push("Dated reference detected");
  }

  // Check for generic/formulaic titles
  const genericPatterns = [
    /^The\s+\w+\s+(Protocol|Arbitrage|Stack|Audit)$/i,
    /^The\s+\w+\s+\w+\s+(Protocol|Arbitrage|Stack|Audit)$/i,
  ];
  for (const pattern of genericPatterns) {
    if (pattern.test(title) && title.split(" ").length <= 5) {
      issues.push("Generic formulaic title");
    }
  }

  // Determine recommendation
  let recommendation: "keep" | "review" | "archive" = "keep";
  if (issues.length >= 2) {
    recommendation = "archive";
  } else if (issues.length === 1) {
    recommendation = "review";
  }

  return {
    id: idea.id,
    title,
    source,
    category,
    createdTime,
    issues,
    rawContext: rawContext.substring(0, 200),
    recommendation,
  };
}

async function archiveIdeas(ids: string[]): Promise<void> {
  console.log(`\n🗑️  Archiving ${ids.length} ideas...`);

  for (const id of ids) {
    try {
      await notion.pages.update({
        page_id: id,
        archived: true,
      });
      console.log(`   ✓ Archived: ${id}`);
    } catch (err) {
      console.error(`   ✗ Failed to archive ${id}:`, err);
    }
  }

  console.log(`\n✅ Archive complete.`);
}

async function main() {
  const args = process.argv.slice(2);
  const shouldArchive = args.includes("--archive");

  console.log("🔍 Fetching all ideas from Ideas Bank...\n");

  const ideas = await fetchAllIdeas();
  console.log(`Found ${ideas.length} ideas total.\n`);

  const results: IdeaAuditResult[] = [];

  for (const idea of ideas) {
    const result = auditIdea(idea);
    results.push(result);
  }

  // Categorize results
  const toArchive = results.filter((r) => r.recommendation === "archive");
  const toReview = results.filter((r) => r.recommendation === "review");
  const toKeep = results.filter((r) => r.recommendation === "keep");

  console.log("=".repeat(80));
  console.log("📊 AUDIT SUMMARY");
  console.log("=".repeat(80));
  console.log(`✅ Keep: ${toKeep.length}`);
  console.log(`⚠️  Review: ${toReview.length}`);
  console.log(`🗑️  Archive: ${toArchive.length}`);
  console.log();

  if (toArchive.length > 0) {
    console.log("=".repeat(80));
    console.log("🗑️  IDEAS TO ARCHIVE (multiple issues detected)");
    console.log("=".repeat(80));
    for (const idea of toArchive) {
      console.log(`\n📄 ${idea.title}`);
      console.log(`   ID: ${idea.id}`);
      console.log(`   Source: ${idea.source} | Category: ${idea.category}`);
      console.log(`   Created: ${idea.createdTime}`);
      console.log(`   Issues:`);
      for (const issue of idea.issues) {
        console.log(`     - ${issue}`);
      }
    }
  }

  if (toReview.length > 0) {
    console.log("\n" + "=".repeat(80));
    console.log("⚠️  IDEAS TO REVIEW (single issue detected)");
    console.log("=".repeat(80));
    for (const idea of toReview.slice(0, 20)) {
      // Show first 20
      console.log(`\n📄 ${idea.title}`);
      console.log(`   Issues: ${idea.issues.join(", ")}`);
    }
    if (toReview.length > 20) {
      console.log(`\n   ... and ${toReview.length - 20} more`);
    }
  }

  // Output IDs for bulk archiving
  if (toArchive.length > 0) {
    console.log("\n" + "=".repeat(80));
    console.log("📋 IDs TO ARCHIVE (copy for bulk operation)");
    console.log("=".repeat(80));
    console.log(toArchive.map((i) => i.id).join("\n"));
  }

  // Archive if flag is set
  if (shouldArchive && toArchive.length > 0) {
    await archiveIdeas(toArchive.map((i) => i.id));
  } else if (toArchive.length > 0) {
    console.log(
      "\n💡 To archive these ideas, run: npx tsx scripts/audit-ideas.ts --archive",
    );
  }

  return {
    total: ideas.length,
    keep: toKeep.length,
    review: toReview.length,
    archive: toArchive.length,
    archiveIds: toArchive.map((i) => i.id),
  };
}

main().catch(console.error);
