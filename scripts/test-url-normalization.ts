import { cleanContentUrl } from "../src/lib/notion";

const testCases = [
  {
    input: "https://twitter.com/OpenAI/status/1792600000000000000?s=20&t=123",
    expected: "https://x.com/OpenAI/status/1792600000000000000",
  },
  {
    input: "https://mobile.twitter.com/OpenAI/status/1792600000000000000",
    expected: "https://x.com/OpenAI/status/1792600000000000000",
  },
  {
    input: "https://www.twitter.com/OpenAI/status/1792600000000000000",
    expected: "https://x.com/OpenAI/status/1792600000000000000",
  },
  {
    input: "https://www.x.com/OpenAI/status/1792600000000000000?s=12",
    expected: "https://x.com/OpenAI/status/1792600000000000000",
  },
  {
    input: "https://instagram.com/reel/C7X123456/?igsh=MzRlODBiNWFlZA==",
    expected: "https://instagram.com/reel/C7X123456",
  },
  {
    input: "https://www.instagram.com/p/C7X123456/?igsh=MzRlODBiNWFlZA==&utm_source=ig_web_copy_link",
    expected: "https://www.instagram.com/p/C7X123456",
  },
  {
    input: "https://youtu.be/dQw4w9WgXcQ?si=tracker_param",
    expected: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    input: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&si=another_tracker",
    expected: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    input: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&s=20&t=10s&ref=external&ref_src=twsrc&src=hash&fbclid=123",
    expected: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
];

console.log("Running URL normalization tests...");
let passed = 0;
for (const tc of testCases) {
  const result = cleanContentUrl(tc.input);
  if (result === tc.expected) {
    console.log(`✅ Passed: ${tc.input} -> ${result}`);
    passed++;
  } else {
    console.error(`❌ Failed:\n  Input:    ${tc.input}\n  Expected: ${tc.expected}\n  Got:      ${result}`);
  }
}

if (passed === testCases.length) {
  console.log(`\n🎉 All ${passed} tests passed!`);
  process.exit(0);
} else {
  console.error(`\n❌ Some tests failed (${passed}/${testCases.length} passed).`);
  process.exit(1);
}
