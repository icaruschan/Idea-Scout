import { tasks } from "@trigger.dev/sdk/v3";
import dotenv from "dotenv";

dotenv.config();

// Fix the env variable mapping for Trigger.dev v3
if (!process.env.TRIGGER_SECRET_KEY && process.env.TRIGGER_DEVELOPMENT_KEY) {
  process.env.TRIGGER_SECRET_KEY = process.env.TRIGGER_DEVELOPMENT_KEY;
}

async function run() {
  console.log("Triggering scout-content...");
  const result = await tasks.trigger("scout-content", {});
  console.log("Trigger result:", result);
}

run().catch(console.error);
