import axios from "axios";
import dotenv from "dotenv";
dotenv.config({ override: true });

const API_KEY = process.env.TWITTER_API_KEY || process.env.BACKUP_TWITTER_API_KEY;
const API_BASE = "https://api.twitterapi.io/twitter";

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    "X-API-Key": API_KEY,
  },
});

export async function getLastTweets(username: string) {
  try {
    const response = await client.get("/user/last_tweets", {
      params: { userName: username },
    });
    return response.data?.data?.tweets || [];
  } catch (error) {
    console.error("Error fetching last tweets:", error);
    throw error;
  }
}

export async function searchTweets(query: string) {
  try {
    const response = await client.get("/tweet/advanced_search", {
      params: { query, queryType: "Latest" },
    });
    return response.data?.tweets || [];
  } catch (error) {
    console.error("Error searching tweets:", error);
    throw error;
  }
}

/**
 * Search a creator's original posts from the past N days.
 * Uses Advanced Search with filters to exclude replies and retweets.
 * Returns tweets with full engagement metrics (bookmarks, likes, RTs, views).
 */
export async function searchCreatorPosts(
  handle: string,
  sinceDaysAgo: number = 7,
) {
  try {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - sinceDaysAgo);
    const sinceDateStr = sinceDate.toISOString().split("T")[0];

    const query = `from:${handle} -filter:replies -filter:retweets since:${sinceDateStr}`;
    let allTweets: any[] = [];
    let nextCursor: string | undefined = undefined;
    let page = 1;

    do {
      const params: any = { query, queryType: "Latest" };
      if (nextCursor) {
        params.cursor = nextCursor;
      }

      const response = await client.get("/tweet/advanced_search", { params });
      const tweets = response.data?.tweets || [];
      allTweets = allTweets.concat(tweets);

      const hasNext = response.data?.has_next_page;
      nextCursor = response.data?.next_cursor;

      if (!hasNext || !nextCursor) {
        break;
      }

      page++;
    } while (page <= 3);

    return allTweets;
  } catch (error) {
    console.error(`Error fetching posts for @${handle}:`, error);
    return []; // Non-blocking — return empty on failure
  }
}

export async function getTrends() {
  try {
    const response = await client.get("/trends", { params: { woeid: 1 } });
    return response.data?.trends || response.data || [];
  } catch (error) {
    console.error("Error fetching trends:", error);
    throw error;
  }
}
