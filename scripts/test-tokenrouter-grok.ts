import dotenv from "dotenv";
import { generateTextTokenRouter, MODELS } from "../src/lib/llm";

dotenv.config({ override: true });

async function main() {
  if (!process.env.TOKENROUTER_API_KEY) {
    console.error("❌ TOKENROUTER_API_KEY not set in .env");
    process.exit(1);
  }

  console.log(`Testing TokenRouter writer model: ${MODELS.WRITER}`);
  const start = Date.now();
  const { content, finishReason } = await generateTextTokenRouter(
    "Reply with exactly: GROK_OK",
    "You are a test assistant. Be brief.",
    0.2,
    MODELS.WRITER,
    64,
  );
  const ms = Date.now() - start;
  console.log(`Response (${ms}ms, finish=${finishReason}): ${content.trim().slice(0, 200)}`);
  if (!/GROK_OK/i.test(content)) {
    console.warn("⚠️ Unexpected response — model may still be reachable.");
  } else {
    console.log("✅ TokenRouter Grok writer path works.");
  }
}

main().catch((err) => {
  console.error("❌ Grok test failed:", err.message || err);
  process.exit(1);
});