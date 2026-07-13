import { runs } from "@trigger.dev/sdk/v3";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.TRIGGER_SECRET_KEY) {
  process.env.TRIGGER_SECRET_KEY =
    process.env.TRIGGER_PRODUCTION_KEY || process.env.TRIGGER_DEVELOPMENT_KEY;
}

const runId = process.argv[2];

if (!runId) {
  console.error("Please provide a runId");
  process.exit(1);
}

async function checkStatus() {
  const run = await runs.retrieve(runId);
  console.log(`Status: ${run.status}`);
  if (run.status === "COMPLETED" || run.status === "FAILED" || run.status === "CANCELED" || run.status === "TIMED_OUT" || run.status === "SYSTEM_FAILURE") {
    console.log("Run completed.");
    console.log(JSON.stringify(run, null, 2));
    process.exit(0);
  }
}

setInterval(checkStatus, 5000);
checkStatus();
