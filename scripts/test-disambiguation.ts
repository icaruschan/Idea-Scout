import dotenv from "dotenv";
import { processContent } from "../src/trigger/idea-scout/process-content";
import { getYouTubeCreators } from "../src/lib/notion";
import { runs } from "@trigger.dev/sdk/v3";

dotenv.config();

// Fix the env variable mapping for Trigger.dev v3
if (!process.env.TRIGGER_SECRET_KEY && process.env.TRIGGER_DEVELOPMENT_KEY) {
  process.env.TRIGGER_SECRET_KEY = process.env.TRIGGER_DEVELOPMENT_KEY;
}

async function waitForRun(runId: string) {
  console.log(`Waiting for run ${runId} to complete...`);
  while (true) {
    const run = await runs.retrieve(runId);
    if (
      run.status === "COMPLETED" ||
      run.status === "FAILED" ||
      run.status === "CRASHED" ||
      run.status === "SYSTEM_FAILURE" ||
      run.status === "CANCELED"
    ) {
      return run;
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
}

async function runDisambiguationTest() {
  console.log("🧪 Starting Disambiguation Relevance Filter Test...\n");

  // Get a valid creator page ID to use for the tests
  console.log("Fetching a sample creator from Notion to get a valid pageId...");
  const creators = await getYouTubeCreators(1);
  if (creators.length === 0) {
    console.error("❌ No creators found in Notion. Please check your Notion connection.");
    return;
  }
  const sampleCreator = creators[0];
  console.log(`Using sample creator: ${sampleCreator.name} (ID: ${sampleCreator.pageId})\n`);

  const testCases = [
    {
      name: "False Positive: Kimi Antonelli (F1 Racing)",
      payload: {
        platform: "YouTube" as const,
        creatorPageId: sampleCreator.pageId,
        creatorName: sampleCreator.name,
        title: "Kimi Antonelli makes dramatic debut in Formula 1 practice session",
        text: "Italian sensation Kimi Antonelli drove the Mercedes W15 at Monza, showing extreme pace before a crash at Parabolica. Here is what Toto Wolff said about his future as a successor to Lewis Hamilton.",
        url: "https://www.youtube.com/watch?v=kimi_f1_test_case_" + Date.now(),
        likes: 1200,
        views: 45000,
        comments: 230,
        publishedDate: new Date().toISOString(),
        transcript: "So Kimi Antonelli is out on track. He's putting in some really fast lap times. The Mercedes is looking stable through Curva Grande, but oh! He has spun off at Parabolica. That is a heavy impact into the barriers. Toto Wolff doesn't look pleased but says his speed is undeniable.",
      }
    },
    {
      name: "True Positive: Moonshot Kimi AI (Large Context Model)",
      payload: {
        platform: "YouTube" as const,
        creatorPageId: sampleCreator.pageId,
        creatorName: sampleCreator.name,
        title: "Moonshot Kimi AI model breaks records with 2 million token context window",
        text: "Kimi is the new chat assistant developed by Moonshot AI, offering unprecedented context length. We test it on codebases and large document analysis to see if it outperforms Claude 3.5 Sonnet and GPT-4o.",
        url: "https://www.youtube.com/watch?v=kimi_ai_test_case_" + Date.now(),
        likes: 850,
        views: 22000,
        comments: 115,
        publishedDate: new Date().toISOString(),
        transcript: "Welcome back guys. Today we are looking at Kimi, the new chatbot model from Moonshot AI. It supports up to two million tokens. We are going to upload a full code repository, look at its RAG capabilities, search speed, and output accuracy.",
      }
    },
    {
      name: "False Positive: Amen Thompson (NBA Basketball)",
      payload: {
        platform: "Instagram" as const,
        creatorPageId: sampleCreator.pageId,
        creatorName: sampleCreator.name,
        title: "Amen Thompson flashes elite defensive potential in Rockets win",
        text: "Amen Thompson had a stellar night with 15 points, 10 rebounds, 5 assists, and 3 blocks. Rockets show why the Overtime Elite star was a top 5 draft pick.",
        url: "https://www.instagram.com/reel/amen_nba_test_case_" + Date.now(),
        likes: 9500,
        views: 180000,
        comments: 420,
        publishedDate: new Date().toISOString(),
        transcript: "Look at the athleticism from Amen Thompson! Swiping the ball, running the fast break, finishing with a huge dunk. He is locking down defenders and shows why he is a franchise player.",
      }
    },
    {
      name: "True Positive: Standard Automation Idea (n8n & Apify)",
      payload: {
        platform: "X" as const,
        creatorPageId: sampleCreator.pageId,
        creatorName: sampleCreator.name,
        title: "How to automate your content research with n8n and Apify in 10 minutes",
        text: "A step-by-step tutorial on building a fully autonomous content engine that scrapes creators using Apify, filters relevance via LLM, and drafts tweets automatically. Zero-code required.",
        url: "https://x.com/sample_creator/status/automation_test_case_" + Date.now(),
        likes: 450,
        views: 12000,
        comments: 45,
        publishedDate: new Date().toISOString(),
        transcript: "",
      }
    }
  ];

  for (const tc of testCases) {
    console.log(`==================================================`);
    console.log(`RUNNING TEST CASE: ${tc.name}`);
    console.log(`==================================================`);
    
    // Trigger the task
    const handle = await processContent.trigger(tc.payload);
    
    // Wait for completion
    const runResult = await waitForRun(handle.id);
    
    console.log(`\nResult for "${tc.name}":`);
    console.log(`- Status: ${runResult.status}`);
    if (runResult.status === "COMPLETED") {
      const output = runResult.output as any;
      console.log(`- Filtered? ${output.filtered}`);
      console.log(`- Scouted Content ID: ${output.scoutedContentId}`);
    } else {
      console.error(`- Run failed with error:`, runResult.error);
    }
    console.log(`\n`);
  }

  console.log("==================================================");
  console.log("🏁 Disambiguation relevance filter test complete.");
}

runDisambiguationTest().catch(console.error);
