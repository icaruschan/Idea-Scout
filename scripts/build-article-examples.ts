/**
 * Parses X-Creators-2026-All-Native-Articles-Full.md and writes 3 full article examples.
 */
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const SOURCE_MD = path.join(ROOT, "X-Creators-2026-All-Native-Articles-Full.md");
const OUT_JSON = path.join(ROOT, "src/data/article-examples.json");

interface ParsedArticle {
  author: string;
  title: string;
  url: string;
  text: string;
  wordCount: number;
}

function parseArticles(markdown: string): ParsedArticle[] {
  const articles: ParsedArticle[] = [];
  const blocks = markdown.split(/\*\*Full Article Content:\*\*/);

  for (let i = 1; i < blocks.length; i++) {
    const prev = blocks[i - 1];
    const bodyBlock = blocks[i];

    const authorMatch = prev.match(/### @(\w+)/g);
    const author = authorMatch ? authorMatch[authorMatch.length - 1].replace("### @", "") : "unknown";

    const titleMatch = prev.match(/\*\*([^*]+)\*\*\s*\(\d{4}-\d{2}-\d{2}\)/);
    const title = titleMatch?.[1]?.trim() || "Untitled";

    const urlMatch = prev.match(/\*\*Article URL:\*\*\s*(https:\/\/[^\s]+)/);
    const url = urlMatch?.[1] || "";

    const codeMatch = bodyBlock.match(/```\n([\s\S]*?)\n```/);
    const text = codeMatch?.[1]?.trim() || "";
    if (!text) continue;

    articles.push({
      author,
      title,
      url,
      text,
      wordCount: text.split(/\s+/).filter(Boolean).length,
    });
  }

  return articles;
}

const PICKS: { archetype: string; author: string; titleIncludes: string }[] = [
  {
    archetype: "workflow-how-to",
    author: "WorkflowWhisper",
    titleIncludes: "Claude is getting good enough",
  },
  {
    archetype: "tool-breakdown",
    author: "sharbel",
    titleIncludes: "AI Agent Is Not Making You Money",
  },
  {
    archetype: "operator-essay",
    author: "netrovertHQ",
    titleIncludes: "Title/Hook",
  },
];

function main() {
  const md = fs.readFileSync(SOURCE_MD, "utf-8");
  const all = parseArticles(md);
  console.log(`Parsed ${all.length} articles from markdown.`);

  const selected = PICKS.map((pick) => {
    const match = all.find(
      (a) =>
        a.author.toLowerCase() === pick.author.toLowerCase() &&
        a.title.toLowerCase().includes(pick.titleIncludes.toLowerCase()),
    );
    if (!match) {
      throw new Error(`Could not find article for pick: ${pick.archetype} / ${pick.author}`);
    }
    return { ...match, archetype: pick.archetype, pillar: archetypeToPillar(pick.archetype) };
  });

  fs.writeFileSync(OUT_JSON, JSON.stringify(selected, null, 2));
  for (const a of selected) {
    console.log(`✓ [${a.archetype}] @${a.author} — ${a.title} (${a.wordCount} words)`);
  }
  console.log(`\nWrote ${OUT_JSON}`);
}

function archetypeToPillar(archetype: string): string {
  if (archetype === "workflow-how-to") return "Automation";
  if (archetype === "tool-breakdown") return "AI Prompting & Tools";
  return "Creator Economy";
}

main();