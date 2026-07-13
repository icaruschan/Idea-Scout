import assert from "node:assert/strict";
import {
  inferHookPsychology,
  normalizeHookVariants,
  type HookTemplate,
} from "../src/lib/hook-matcher";

const hooks: HookTemplate[] = [
  { number: 1, template: "How to [result] in [steps]", original: "How to ship in 3 steps", examples: [] },
  { number: 2, template: "Stop making this [mistake]", original: "Stop making this automation mistake", examples: [] },
  { number: 3, template: "The unpopular truth about [topic]", original: "The unpopular truth about AI agents", examples: [] },
];

assert.ok(inferHookPsychology(hooks[0]).includes("How-to"));
assert.ok(inferHookPsychology(hooks[1]).includes("Mistake"));
assert.ok(inferHookPsychology(hooks[2]).includes("Contrarian"));

const variants = normalizeHookVariants([], "A grounded fallback hook", hooks);
assert.deepEqual(variants.map((item) => item.label), ["Safe", "Sharp", "Bold"]);
assert.ok(variants.every((item) => item.text.length > 0));
console.log("✅ Hook intelligence tests passed");
