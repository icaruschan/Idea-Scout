import { IDEA_SCOUT_CONFIG } from "./idea-scout-config";

export type TranscriptPlatform = "YouTube" | "Instagram" | "X" | string;

export interface TranscriptCleanStats {
  originalChars: number;
  cleanedChars: number;
  finalChars: number;
  cleaned: boolean;
  headTailTrimmed: boolean;
  reductionPct: number;
}

const VIDEO_PLATFORMS = new Set(["YouTube", "Instagram"]);

const BRACKETED_SFX =
  /[\[\(][^\]\)]{0,80}?(music|applause|laughter|laughing|sound|effect|inaudible|cheering|crowd)[^\]\)]{0,80}?[\]\)]/gi;

const FILLER_ONLY_LINE =
  /^(um+|uh+|yeah|yep|yup|so+|okay|ok|right|like|well|hmm+)\.?$/i;

const CHAPTER_ONLY_LINE =
  /^(chapter\s+\d+|\d{1,2}:\d{2}(:\d{2})?|\d{1,3})$/i;

export function shouldCleanTranscript(platform: TranscriptPlatform): boolean {
  return VIDEO_PLATFORMS.has(platform);
}

export function collapseWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function stripBracketedSfx(text: string): string {
  return text.replace(BRACKETED_SFX, " ").replace(/ {2,}/g, " ");
}

export function stripChapterMarkers(text: string): string {
  return text
    .split("\n")
    .filter((line) => !CHAPTER_ONLY_LINE.test(line.trim()))
    .join("\n");
}

export function dropFillerOnlyLines(text: string): string {
  return text
    .split("\n")
    .filter((line) => !FILLER_ONLY_LINE.test(line.trim()))
    .join("\n");
}

function tokenize(line: string): string[] {
  return line
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** Word Jaccard similarity — fast enough for consecutive-line dedupe. */
export function lineSimilarity(a: string, b: string): number {
  const ta = tokenize(a);
  const tb = tokenize(b);
  if (ta.length === 0 && tb.length === 0) return 1;
  if (ta.length === 0 || tb.length === 0) return 0;
  const setA = new Set(ta);
  const setB = new Set(tb);
  let intersection = 0;
  for (const t of setA) {
    if (setB.has(t)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

export function dedupeConsecutive(
  text: string,
  threshold = 0.85,
  minWords = 8,
): string {
  const lines = text.split("\n");
  if (lines.length <= 1) return text;

  const out: string[] = [];
  let prev = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      out.push(line);
      prev = "";
      continue;
    }

    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
    if (
      prev &&
      wordCount >= minWords &&
      tokenize(prev).length >= minWords &&
      lineSimilarity(prev, trimmed) >= threshold
    ) {
      continue;
    }

    out.push(line);
    prev = trimmed;
  }

  return out.join("\n");
}

export function headTailTrim(
  text: string,
  maxChars: number,
  marker = "\n\n[... middle of transcript omitted — use scout analysis teachable units and transcript gems ...]\n\n",
): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return trimmed;

  const budget = maxChars - marker.length;
  const headChars = Math.floor(budget * 0.65);
  const tailChars = budget - headChars;

  return `${trimmed.slice(0, headChars)}${marker}${trimmed.slice(-tailChars)}`;
}

export function cleanTranscript(text: string, platform: TranscriptPlatform): string {
  if (!text?.trim() || !shouldCleanTranscript(platform)) {
    return text?.trim() || "";
  }

  let out = text;
  out = collapseWhitespace(out);
  out = stripBracketedSfx(out);
  out = stripChapterMarkers(out);
  out = dedupeConsecutive(out, 0.85, 8);
  out = dropFillerOnlyLines(out);
  return collapseWhitespace(out);
}

export function budgetTranscript(
  text: string,
  platform: TranscriptPlatform,
  maxChars: number,
): { text: string; stats: TranscriptCleanStats } {
  const originalChars = (text || "").trim().length;
  const cleaned = cleanTranscript(text, platform);
  const cleanedChars = cleaned.length;

  if (cleanedChars <= maxChars) {
    return {
      text: cleaned,
      stats: {
        originalChars,
        cleanedChars,
        finalChars: cleanedChars,
        cleaned: cleanedChars < originalChars,
        headTailTrimmed: false,
        reductionPct:
          originalChars > 0
            ? Math.round(((originalChars - cleanedChars) / originalChars) * 100)
            : 0,
      },
    };
  }

  const final = headTailTrim(cleaned, maxChars);
  return {
    text: final,
    stats: {
      originalChars,
      cleanedChars,
      finalChars: final.length,
      cleaned: cleanedChars < originalChars,
      headTailTrimmed: true,
      reductionPct:
        originalChars > 0
          ? Math.round(((originalChars - final.length) / originalChars) * 100)
          : 0,
    },
  };
}

/** Scout Pass 1 — clean video transcripts before gem extraction. */
export function prepareScoutContentBody(parts: {
  title: string;
  text: string;
  transcript: string;
  platform: TranscriptPlatform;
  maxChars?: number;
}): string {
  const maxChars = parts.maxChars ?? IDEA_SCOUT_CONFIG.scoutMaxContentChars;
  const cleanedTranscript = cleanTranscript(parts.transcript, parts.platform);

  return [
    parts.title,
    parts.text,
    cleanedTranscript ? `[Transcript]: ${cleanedTranscript}` : "",
  ]
    .filter(Boolean)
    .join("\n\n")
    .substring(0, maxChars);
}