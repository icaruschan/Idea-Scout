const RICH_TEXT_CHUNK_SIZE = 2000;
const MAX_RICH_TEXT_CHUNKS = 100;

export type NotionBlock = Record<string, unknown>;

function toRichText(text: string): Array<{ text: { content: string } }> {
  const str = String(text ?? "");
  if (!str) return [{ text: { content: " " } }];

  const chunks: string[] = [];
  for (
    let i = 0;
    i < str.length && chunks.length < MAX_RICH_TEXT_CHUNKS;
    i += RICH_TEXT_CHUNK_SIZE
  ) {
    chunks.push(str.substring(i, i + RICH_TEXT_CHUNK_SIZE));
  }

  return chunks.map((chunk) => ({ text: { content: chunk } }));
}

function paragraphBlock(text: string): NotionBlock {
  return {
    object: "block",
    type: "paragraph",
    paragraph: { rich_text: toRichText(text) },
  };
}

function headingBlock(level: 2 | 3, text: string): NotionBlock {
  const key = level === 2 ? "heading_2" : "heading_3";
  return {
    object: "block",
    type: key,
    [key]: { rich_text: toRichText(text) },
  };
}

function bulletBlock(text: string): NotionBlock {
  return {
    object: "block",
    type: "bulleted_list_item",
    bulleted_list_item: { rich_text: toRichText(text) },
  };
}

function numberedBlock(text: string): NotionBlock {
  return {
    object: "block",
    type: "numbered_list_item",
    numbered_list_item: { rich_text: toRichText(text) },
  };
}

function dividerBlock(): NotionBlock {
  return { object: "block", type: "divider", divider: {} };
}

function flushParagraph(lines: string[], blocks: NotionBlock[]) {
  const text = lines.join("\n").trim();
  if (text) blocks.push(paragraphBlock(text));
  lines.length = 0;
}

/**
 * Convert lightweight markdown into native Notion blocks (headings, lists, paragraphs).
 * Splits on line boundaries — never mid-word like the legacy 2000-char paragraph chunker.
 */
export function markdownToNotionBlocks(text: string): NotionBlock[] {
  const normalized = String(text ?? "").replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const blocks: NotionBlock[] = [];
  const paragraphLines: string[] = [];

  for (const rawLine of normalized.split("\n")) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph(paragraphLines, blocks);
      continue;
    }

    if (trimmed === "---" || trimmed === "***") {
      flushParagraph(paragraphLines, blocks);
      blocks.push(dividerBlock());
      continue;
    }

    const h2 = trimmed.match(/^##\s+(.+)$/);
    if (h2) {
      flushParagraph(paragraphLines, blocks);
      blocks.push(headingBlock(2, h2[1].trim()));
      continue;
    }

    const h3 = trimmed.match(/^###\s+(.+)$/);
    if (h3) {
      flushParagraph(paragraphLines, blocks);
      blocks.push(headingBlock(3, h3[1].trim()));
      continue;
    }

    const bullet = trimmed.match(/^[-*•→]\s+(.+)$/);
    if (bullet) {
      flushParagraph(paragraphLines, blocks);
      blocks.push(bulletBlock(bullet[1].trim()));
      continue;
    }

    const numbered = trimmed.match(/^\d+\.\s+(.+)$/);
    if (numbered) {
      flushParagraph(paragraphLines, blocks);
      blocks.push(numberedBlock(numbered[1].trim()));
      continue;
    }

    paragraphLines.push(trimmed);
  }

  flushParagraph(paragraphLines, blocks);
  return blocks;
}