import { tasks } from "@trigger.dev/sdk/v3";
import dotenv from "dotenv";

dotenv.config({ override: true });
process.env.TRIGGER_SECRET_KEY =
  process.env.TRIGGER_PRODUCTION_KEY ||
  process.env.TRIGGER_SECRET_KEY ||
  process.env.TRIGGER_DEVELOPMENT_KEY;

const taskId = process.argv[2];
const payloadText = process.argv[3] || "{}";

if (!taskId) {
  throw new Error("Usage: tsx scripts/trigger-roadmap-task.ts <task-id> '[JSON payload]'");
}

async function main() {
  const payload = JSON.parse(payloadText);
  const handle = await tasks.trigger(taskId, payload);
  console.log(JSON.stringify({ taskId, runId: handle.id }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
