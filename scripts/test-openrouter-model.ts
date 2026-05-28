import { generateText } from "../src/lib/llm";
import dotenv from "dotenv";

dotenv.config({ override: true });

async function run() {
  console.log("Testing model qwen/qwen3.6-plus on OpenRouter...");
  try {
    const text = await generateText("Hello, respond in 1 word.", "You are a helpful assistant.");
    console.log("Response:", text);
  } catch (error: any) {
    console.error("Error:", error.message || error);
  }
}

run();
