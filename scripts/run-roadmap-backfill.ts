import { runs, tasks } from "@trigger.dev/sdk/v3";
import dotenv from "dotenv";

dotenv.config({ override: true });
process.env.TRIGGER_SECRET_KEY =
  process.env.TRIGGER_PRODUCTION_KEY ||
  process.env.TRIGGER_SECRET_KEY ||
  process.env.TRIGGER_DEVELOPMENT_KEY;

const batchSize = Math.min(10, Math.max(1, Number(process.argv[2] || 10)));
const days = Math.max(1, Number(process.argv[3] || 30));
const maxBatches = Math.max(1, Number(process.argv[4] || 20));

async function main() {
  let totalCompleted = 0;
  let totalFailed = 0;
  for (let batchNumber = 1; batchNumber <= maxBatches; batchNumber++) {
    const handle = await tasks.trigger("backfill-idea-evaluations", { batchSize, days });
    console.log(`Batch ${batchNumber}: ${handle.id}`);
    const run: any = await runs.poll(handle.id, { pollIntervalMs: 5_000 });
    if (run.status !== "COMPLETED") {
      throw new Error(`Backfill batch ${batchNumber} ended as ${run.status}: ${run.error?.message || "unknown error"}`);
    }
    const output = run.output || {};
    totalCompleted += Number(output.completed || 0);
    totalFailed += Number(output.failed || 0);
    console.log(`Batch ${batchNumber}: completed=${output.completed || 0}, failed=${output.failed || 0}`);
    if (!output.remainingRequiresAnotherRun || Number(output.dispatched || 0) === 0) {
      console.log(JSON.stringify({ totalCompleted, totalFailed, batches: batchNumber }, null, 2));
      return;
    }
  }
  throw new Error(`Backfill stopped after ${maxBatches} batches; run again to continue.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
