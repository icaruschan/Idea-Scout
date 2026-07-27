import type { ContentFormat, VoiceMode } from "./voice-dna";
import type { HookRiskLevel, HookVariant } from "./hook-matcher";

export type ContentArchetype =
  | "workflow-walkthrough"
  | "tool-demo"
  | "tool-comparison"
  | "case-study"
  | "contrarian-essay"
  | "operator-principle"
  | "news-reaction"
  | "listicle"
  | "personal-story";

export type FormatFitLevel = "weak" | "moderate" | "strong";

export interface TeachableUnit {
  unit: string;
  audienceRelevance: string;
  painItSolves: string;
  depthAvailable: "low" | "medium" | "high";
  sourceEvidence: string;
  formatFit: {
    article: FormatFitLevel;
    thread: FormatFitLevel;
    midLength: FormatFitLevel;
    short: FormatFitLevel;
  };
}

export interface ScoutAnalysis {
  summary: string;
  creatorDoing: string;
  contentType: string;
  targetAudience: string;
  primaryPain: string;
  teachableUnits: string[];
  transcriptGems: string[];
  guidePotential: "low" | "medium" | "high";
  keyTakeaways: string;
}

export interface SourceComprehension {
  contentAbout: string;
  creatorDoing: string;
  contentType: ContentArchetype;
  creatorIntent: string;
  narrativeArc: string;
  sourceAudience: string;
  yourAudience: string;
  audienceOverlap: string;
  audienceSophistication: "beginner" | "intermediate" | "advanced";
  primaryPain: string;
  secondaryPains: string[];
  painEvidence: string[];
  costOfInaction: string;
  coreValue: string;
  valueType:
    | "workflow"
    | "framework"
    | "warning"
    | "tool-discovery"
    | "mindset-shift"
    | "case-proof"
    | "how-to-guide";
  readerOutcome: string;
  whyNow: string;
  teachableUnits: TeachableUnit[];
  transcriptOnlyGems: string[];
  specificTools: string[];
  specificSteps: string[];
  specificMistakes: string[];
  specificProof: string[];
  unsupportedClaims: string[];
}

export interface ValueBomb {
  insight: string;
  pain: string;
  mechanism: string;
  proof: string;
  bestFormat: ContentFormat;
  whyThisFormat: string;
  sourceEvidence: string[];
}

export interface BrainstormedOutput {
  workingTitle: string;
  format: ContentFormat;
  angle: string;
  isPrimaryValueBomb: boolean;
  targetAudience: string;
  painAddressed: string;
  valueProposition: string;
  readerOutcome: string;
  hookDirection: string;
  sourceUnitsUsed: string[];
  transcriptGemsUsed: string[];
  estimatedDepth: string;
  priority: "🔥 Hot" | "💡 Good" | "📝 Maybe";
  rationale: string;
  formatFitScore: number;
  primaryValueBomb?: ValueBomb;
}

export interface OutlineSection {
  heading: string;
  purpose: string;
  sourceUnits: string[];
  mustInclude: string[];
  targetWords?: number;
}

export interface ViralTemplateRef {
  id: string;
  tweetStructure: string;
  stealablePattern: string;
  whyItWorks: string;
  hookType: string;
  format: string;
  rating: string;
}

export interface ExecutionPlanPayload {
  ideaTitle: string;
  sourcePageId: string;
  sourceTitle: string;
  sourceUrl: string;
  platform: string;
  pillar: string;
  voiceMode: VoiceMode;
  format: ContentFormat;
  sourceText: string;
  sourceThesis: string;
  sourceFacts: string[];
  numbersMentioned: string[];
  toolsMentioned: string[];
  specificExamples: string[];
  mechanism: string;
  whyThisMatters: string;
  targetAudience: string;
  audiencePain: string;
  valueProposition: string;
  readerOutcome: string;
  whyNow: string;
  contentPromise: string;
  valuableAngles: string[];
  selectedAngle: string;
  mustUseDetails: string[];
  doNotInvent: string[];
  suggestedStructure: string;
  priority?: "🔥 Hot" | "💡 Good" | "📝 Maybe";
  appliedFramework?: string;
  stealablePattern?: string;
  inspiredByLibraryId?: string;
  comprehensionSummary: string;
  creatorDoing: string;
  contentArchetype: ContentArchetype;
  primaryValueBomb?: ValueBomb;
  detailedOutline: OutlineSection[];
  hookTemplate: string;
  hookFilledExample: string;
  hookRationale: string;
  hookVariants: HookVariant[];
  selectedHookVariant: HookRiskLevel;
  viralTemplateId?: string;
  viralTweetStructure: string;
  viralWhyItWorks: string;
  minWordTarget: number;
  minSectionCount?: number;
  minPostCount?: number;
  /** Publishable bullets the writer must hit (3–7 source-backed points). */
  talkingPoints: string[];
  /** Ordered how-to steps from the source (threads/articles; empty when N/A). */
  stepByStepProcess: string[];
}
