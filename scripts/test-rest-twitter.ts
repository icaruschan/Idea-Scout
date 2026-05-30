import dotenv from "dotenv";
import { getLastTweets } from "../src/lib/twitter";

dotenv.config({ override: true });

async function run() {
  const handle = "gregisenberg";
  try {
    const tweets = await getLastTweets(handle);
    if (tweets.length > 0) {
      console.log("Full Tweet Object Keys:");
      console.log(Object.keys(tweets[0]));
      console.log("\nFull Tweet Object Details:");
      console.log(JSON.stringify(tweets[0], null, 2));
    }
  } catch (error) {
    console.error(error);
  }
}

run();
