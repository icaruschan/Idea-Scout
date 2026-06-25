import type { ContentFormat } from "./voice-dna";

export const IDEA_SCOUT_CONFIG = {
  outputsPerSource: 2,
  minFormatFitScoreForSecondOutput: 7,
  preferFormatDiversity: true,
  minComprehensionWords: 80,
  minTeachableUnits: 2,
  minTranscriptGemsForLongSource: 1,
  longSourceCharThreshold: 2000,
  formatDepthSoftThresholds: {
    article: 3000,
    thread: 1500,
  },
  hardShortOnlyCharThreshold: 500,
  formatWordTargets: {
    article: { min: 1500, ideal: 2500, validateMin: 1200, minSections: 4 },
    thread: { minPosts: 8, idealPosts: 12, validateMinPosts: 8 },
    midLength: { minLines: 15, validateMinLines: 12 },
    short: { minLines: 4, validateMinLines: 4 },
  },
  platformFormatBias: {
    YouTube: ["Article", "Thread", "Mid-length"] as ContentFormat[],
    Instagram: ["Thread", "Article", "Mid-length"] as ContentFormat[],
    X: ["Mid-length", "Thread", "Short"] as ContentFormat[],
  },
  strategistTemperature: {
    comprehend: 0.4,
    brainstorm: 0.5,
    plan: 0.45,
  },
  /** MiniMax HTTP timeout per strategist call (comprehend / brainstorm / plan). */
  strategistTimeoutMs: 300_000,
  strategistRetries: 1,
  /** Scout Pass 1 content body cap (after deterministic cleaning). */
  scoutMaxContentChars: 100_000,
  /** Strategist transcript budget: clean first, head+tail only if still over. */
  strategistMaxTranscriptChars: 30_000,
  /** Stream M3 responses to keep TokenRouter gateway connections alive during <think> phase. */
  strategistUseStreaming: true,
  /** On timeout retry, halve transcript budget (Option C). */
  strategistTimeoutRetryTranscriptFactor: 0.5,
  /** Cap sources processed per draft-ideas run (serial pipeline is slow). */
  maxSourcesPerRun: 10,
  writerTimeoutMs: 600_000,
  writerTemperature: 0.7,
  writerMaxTokens: {
    article: 16384,
    articleRetry: 32768,
    thread: 8192,
    threadRetry: 16384,
    midLength: 4096,
    short: 2048,
    default: 4096,
  },
  hookMatchLimit: 12,
  viralTemplateLimit: 8,
} as const;