import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import { NOTION_DATA_SOURCE_IDS } from "../src/lib/constants";

dotenv.config({ override: true });
const notion = new Client({ auth: process.env.NOTION_API_KEY });

function selectName(property: any): string {
  return property?.select?.name || "Empty";
}

async function allIdeas(): Promise<any[]> {
  const rows: any[] = [];
  let cursor: string | undefined;
  do {
    const response: any = await notion.dataSources.query({
      data_source_id: NOTION_DATA_SOURCE_IDS.IDEAS_BANK,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    rows.push(...response.results);
    cursor = response.has_more ? response.next_cursor || undefined : undefined;
  } while (cursor);
  return rows;
}

function countBy(rows: any[], propertyName: string): Record<string, number> {
  return rows.reduce((counts, page) => {
    const value = selectName(page.properties?.[propertyName]);
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
}

async function main() {
  const rows = await allIdeas();
  const scored = rows.filter((page) => selectName(page.properties?.["Evaluation State"]) === "Scored");
  const scores = scored.map((page) => page.properties?.["Confidence Score"]?.number).filter(Number.isFinite);
  const today = new Date().toISOString().slice(0, 10);
  const recommendedToday = rows.filter((page) => page.properties?.["Recommendation Date"]?.date?.start?.slice(0, 10) === today);
  console.log(JSON.stringify({
    totalIdeas: rows.length,
    status: countBy(rows, "Status"),
    evaluationState: countBy(rows, "Evaluation State"),
    scored: scores.length,
    averageConfidence: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10 : null,
    recommendedToday: recommendedToday.map((page) => ({
      title: page.properties?.Idea?.title?.[0]?.plain_text || "Untitled",
      rank: page.properties?.["Daily Rank"]?.number || null,
      role: selectName(page.properties?.["Recommendation Role"]),
      confidence: page.properties?.["Confidence Score"]?.number || null,
    })),
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
