import { tasks } from "@trigger.dev/sdk/v3";
import dotenv from "dotenv";
dotenv.config({ override: true });

// Set the Trigger secret key explicitly to the production key so it runs on production
process.env.TRIGGER_SECRET_KEY = process.env.TRIGGER_PRODUCTION_KEY;

async function run() {
  try {
    console.log("Initiating draft-ideas task on Trigger.dev...");
    const handle = await tasks.trigger("draft-ideas", {});
    console.log("✅ Successfully triggered draft-ideas!");
    console.log(`Run ID: ${handle.id}`);
    console.log("You can monitor the run on your Trigger.dev dashboard.");
  } catch (error) {
    console.error("Failed to trigger task:", error);
  }
}

run();
