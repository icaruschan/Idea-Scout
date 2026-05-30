import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import { NOTION_DATABASE_IDS } from "../src/lib/constants";

dotenv.config({ override: true });

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const creators = [
  {
    name: "Cami's Ad Lab",
    url: "https://www.youtube.com/@adswithcami",
  },
];

async function addCreator(name: string, url: string) {
  const databaseId = NOTION_DATABASE_IDS.YOUTUBE_CREATORS;
  console.log(`➕ Adding creator: "${name}" (${url})...`);

  // Try 1: status property format
  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: {
          title: [{ text: { content: name } }],
        },
        "Channel URL": {
          url: url,
        },
        Status: {
          status: { name: "Active" },
        },
      },
    });
    console.log(`✅ Successfully added "${name}" (ID: ${response.id}) using status property.`);
    return;
  } catch (error: any) {
    console.log(`ℹ️ "status" property format failed, trying "select" format...`);
  }

  // Try 2: select property format
  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: {
          title: [{ text: { content: name } }],
        },
        "Channel URL": {
          url: url,
        },
        Status: {
          select: { name: "Active" },
        },
      },
    });
    console.log(`✅ Successfully added "${name}" (ID: ${response.id}) using select property.`);
    return;
  } catch (error: any) {
    console.log(`ℹ️ "select" property format failed, trying without status...`);
  }

  // Try 3: without Status property
  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: {
          title: [{ text: { content: name } }],
        },
        "Channel URL": {
          url: url,
        },
      },
    });
    console.log(`✅ Successfully added "${name}" (ID: ${response.id}) without Status property.`);
  } catch (error: any) {
    console.error(`❌ Failed to add "${name}":`, error.message || error);
  }
}

async function run() {
  for (const c of creators) {
    await addCreator(c.name, c.url);
    // 350ms delay between writes
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
  console.log("\n🎉 Done adding creators!");
}

run();
