function repairJson(str: string): string {
  let cleaned = str.trim();
  
  // Fix missing commas between properties
  // Matches: "key": "value" [newline] "next_key":
  // Also matches: "key": [...] [newline] "next_key":
  cleaned = cleaned.replace(
    /("[^"]*"\s*:\s*(?:"(?:[^"\\]|\\.)*"|\d+|true|false|null|\[[\s\S]*?\]|{[\s\S]*?}))\s*\n\s*("[^"]*"\s*:)/g,
    "$1,\n$2"
  );

  // Remove trailing commas in arrays/objects
  cleaned = cleaned.replace(/,\s*([\]}])/g, "$1");

  return cleaned;
}

const mockInvalidJson = `{
  "ideas": [
    {
      "title": "3 parallel agents shipping 14 features/week: the cmax terminal setup i run daily",
      "pillar": "AI Prompting & Tools",
      "hookAngle": "Breaking industry update",
      "whyItWorks": "Anchors attention with a specific technical setup (CMAX + parallel agents), then instantly bridges terminal jargon to familiar output metrics."
      "format": "Mid-length",
      "inspiredByScoutedIds": [
        "3704a5db-f371-815e-bba3-fcd0c9660fa5"
      ]
    }
  ]
}`;

console.log("Original String:");
console.log(mockInvalidJson);

console.log("\nAttempting repair...");
const repaired = repairJson(mockInvalidJson);
console.log("\nRepaired String:");
console.log(repaired);

try {
  const parsed = JSON.parse(repaired);
  console.log("\n✅ Success! Repaired JSON parsed successfully:");
  console.log(JSON.stringify(parsed, null, 2));
} catch (error: any) {
  console.log("\n❌ Failed to parse repaired JSON:", error.message);
}
