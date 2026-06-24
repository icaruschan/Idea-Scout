import type { ContentFormat } from "./voice-dna";
import { IDEA_SCOUT_CONFIG } from "./idea-scout-config";

export interface DraftValidationOptions {
  truncated?: boolean;
}

export interface DraftValidationResult {
  passed: boolean;
  format: ContentFormat;
  metrics: Record<string, number>;
  issues: string[];
  retryHint?: string;
}

function looksTruncated(draft: string): boolean {
  const trimmed = draft.trim();
  if (!trimmed) return true;
  if (/[.!?…"')\]]\s*$/.test(trimmed)) return false;
  const lastWord = trimmed.split(/\s+/).pop() || "";
  return lastWord.length > 0 && lastWord.length <= 4 && /^[A-Za-z]+$/.test(lastWord);
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countLines(text: string): number {
  return text.split(/\n/).filter((l) => l.trim().length > 0).length;
}

function countThreadPosts(text: string): number {
  const markers = text.match(/\[\d+\s*\/\s*\d+\]|\(\d+\s*\/\s*\d+\)/g);
  if (markers && markers.length > 0) return markers.length;
  const numbered = text.match(/^(\d+)[.)]\s/mg);
  return numbered?.length || countLines(text);
}

function countArticleSections(text: string): number {
  return (text.match(/^##\s+/gm) || []).length;
}

function countSourceSpecificSignals(text: string, mustUse: string[]): number {
  const low = text.toLowerCase();
  let hits = 0;
  for (const detail of mustUse) {
    const trimmed = detail.trim().toLowerCase();
    if (trimmed.length > 2 && low.includes(trimmed)) hits++;
  }
  const numberHits = (text.match(/\$?\d+[%kKmM]?|\d+\s*(minutes|hours|days|steps)/gi) || []).length;
  return hits + Math.min(numberHits, 3);
}

export function validateDraft(
  draft: string,
  format: ContentFormat,
  mustUseDetails: string[] = [],
  options: DraftValidationOptions = {},
): DraftValidationResult {
  const issues: string[] = [];
  const truncated = options.truncated || looksTruncated(draft);
  const metrics: Record<string, number> = {
    words: countWords(draft),
    lines: countLines(draft),
    sections: countArticleSections(draft),
    posts: countThreadPosts(draft),
    sourceSignals: countSourceSpecificSignals(draft, mustUseDetails),
  };

  const targets = IDEA_SCOUT_CONFIG.formatWordTargets;

  if (truncated) {
    issues.push("Draft appears truncated (output cut off mid-sentence)");
  }

  if (format === "Article") {
    if (metrics.words < targets.article.validateMin) {
      issues.push(`Article too short: ${metrics.words} words (need ${targets.article.validateMin}+)`);
    }
    if (metrics.sections < targets.article.minSections) {
      issues.push(`Article needs ${targets.article.minSections}+ ## sections (found ${metrics.sections})`);
    }
    if (metrics.sourceSignals < 3) {
      issues.push("Article lacks source-specific details (tools, numbers, steps)");
    }
  } else if (format === "Thread") {
    if (metrics.posts < targets.thread.validateMinPosts) {
      issues.push(`Thread too few posts: ${metrics.posts} (need ${targets.thread.validateMinPosts}+)`);
    }
  } else if (format === "Mid-length") {
    if (metrics.lines < targets.midLength.validateMinLines) {
      issues.push(`Mid-length too short: ${metrics.lines} lines (need ${targets.midLength.validateMinLines}+)`);
    }
  } else if (format === "Short") {
    if (metrics.lines < targets.short.validateMinLines) {
      issues.push(`Short tweet too short: ${metrics.lines} lines`);
    }
  }

  let retryHint: string | undefined;
  if (issues.length > 0) {
    if (format === "Article") {
      retryHint = `Expand to ${targets.article.min}+ words. Add ${targets.article.minSections}+ ## sections with mechanism, examples, and takeaways per section. Include these source details: ${mustUseDetails.slice(0, 5).join("; ")}`;
    } else if (format === "Thread") {
      retryHint = `Write ${targets.thread.minPosts}+ thread posts with [n/m] markers. Each post needs a concrete source-backed point.`;
    } else if (format === "Mid-length") {
      retryHint = `Write ${targets.midLength.minLines}+ lines covering pain → mechanism → proof → takeaway as one complete value bomb.`;
    } else {
      retryHint = `Write at least ${targets.short.minLines} punchy lines with one clear source-backed insight.`;
    }
  }

  return {
    passed: issues.length === 0,
    format,
    metrics,
    issues,
    retryHint,
  };
}