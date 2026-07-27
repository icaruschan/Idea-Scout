import fs from "node:fs";
import path from "node:path";
import {
  inferHookPsychology,
  inferHookRiskLevel,
  type HookPsychology,
  type HookTemplate,
} from "../src/lib/hook-matcher";

const file = path.resolve(process.cwd(), "src/data/viral-hook-templates.json");
const hooks = JSON.parse(fs.readFileSync(file, "utf8")) as HookTemplate[];

function bestFor(psychology: HookPsychology[]): string[] {
  const values = new Set<string>();
  if (psychology.some((item) => ["How-to", "Tool Stack", "Resource Drop"].includes(item))) {
    values.add("workflow-walkthrough");
    values.add("tool-demo");
  }
  if (psychology.includes("Comparison")) values.add("tool-comparison");
  if (psychology.some((item) => ["Proof", "Personal Story"].includes(item))) values.add("case-study");
  if (psychology.includes("Contrarian")) values.add("contrarian-essay");
  if (psychology.some((item) => ["Mistake", "Warning", "Status Shift"].includes(item))) values.add("operator-principle");
  if (psychology.includes("Curiosity Gap")) values.add("news-reaction");
  return [...values.size ? values : new Set(["operator-principle"])];
}

const enriched = hooks.map((hook) => {
  const psychology = inferHookPsychology(hook);
  return {
    ...hook,
    psychology,
    bestFor: bestFor(psychology),
    riskLevel: inferHookRiskLevel(hook),
    requiresProof: hook.requiresProof ?? psychology.includes("Proof"),
  };
});

fs.writeFileSync(file, `${JSON.stringify(enriched, null, 2)}\n`, "utf8");
console.log(`Enriched ${enriched.length} hook templates with psychology and risk metadata.`);
