import { matchPillar, filterCategoryList } from "../src/lib/pillar-utils";

interface TestCase {
  input: string;
  expected: string;
}

const testCases: TestCase[] = [
  // Bug fix cases
  { input: "AI Tools", expected: "AI Prompting & Tools" },
  { input: "AI", expected: "AI Prompting & Tools" },
  { input: "AI Strategy", expected: "AI Prompting & Tools" },
  { input: "Audience Growth", expected: "Creator Economy" },
  
  // Exact match cases
  { input: "Automation", expected: "Automation" },
  { input: "Vibe Coding", expected: "Vibe Coding" },
  { input: "AI Creative", expected: "AI Creative" },
  { input: "Creator Economy", expected: "Creator Economy" },
  { input: "Copywriting and Storytelling", expected: "Copywriting and Storytelling" },
  { input: "Personal/Vulnerability", expected: "Personal/Vulnerability" },
  { input: "Building in Public", expected: "Building in Public" },
  
  // Legacy / Frozen cases expected to fallback to Unknown
  { input: "Web3", expected: "Unknown" },
  { input: "solana", expected: "Unknown" },
  { input: "crypto", expected: "Unknown" },

  // Case insensitivity
  { input: "automation", expected: "Automation" },
  { input: "vIBE cODING", expected: "Vibe Coding" },

  // Keyword / Heuristic cases
  { input: "biz development", expected: "Creator Economy" },
  { input: "marketing and growth", expected: "Creator Economy" }, // maps via "growth"
  { input: "indie hacker dev workflow", expected: "Vibe Coding" }, // maps via "indie hacker dev"

  // Edge-cases pinning key-length sorting (order-independence)
  { input: "growth and vibe coding", expected: "Vibe Coding" }, // "vibe coding" (11) > "growth" (6)
  { input: "ai automation", expected: "Automation" }, // "automation" (10) > "ai" (2)
  { input: "personal and copywriting", expected: "Copywriting and Storytelling" }, // "copywriting" (11) > "personal" (8)

  // Fallback case
  { input: "invalid random category name", expected: "Unknown" },
];

console.log("=== RUNNING PILLAR MATCHING TESTS ===");
let failed = 0;

for (const tc of testCases) {
  const result = matchPillar(tc.input);
  if (result !== tc.expected) {
    console.error(`❌ FAILED: Input: "${tc.input}" -> Expected: "${tc.expected}", got: "${result}"`);
    failed++;
  } else {
    console.log(`✅ PASSED: Input: "${tc.input}" -> Resolved: "${result}"`);
  }
}

console.log("\n=== RUNNING CATEGORY MITIGATION TESTS ===");
const filterTestCases = [
  { input: ["Unknown", "Automation"], expected: ["Automation"] },
  { input: ["Web3", "Vibe Coding", "Psychology"], expected: ["Vibe Coding"] },
  { input: ["Automation", "Creator Economy"], expected: ["Automation", "Creator Economy"] },
  { input: ["Unknown", "Web3"], expected: [] }
];

for (const tc of filterTestCases) {
  const result = filterCategoryList(tc.input);
  const resultStr = JSON.stringify(result);
  const expectedStr = JSON.stringify(tc.expected);
  if (resultStr !== expectedStr) {
    console.error(`❌ FAILED: Input: ${JSON.stringify(tc.input)} -> Expected: ${expectedStr}, got: ${resultStr}`);
    failed++;
  } else {
    console.log(`✅ PASSED: Input: ${JSON.stringify(tc.input)} -> Filtered: ${resultStr}`);
  }
}

console.log("\n======================================");
if (failed > 0) {
  console.error(`❌ Test run failed: ${failed} failed assertions.`);
  process.exit(1);
} else {
  console.log("🎉 All pillar-matching and category mitigation tests passed successfully!");
  process.exit(0);
}
