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

let lastRequestTime = 0;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function throttleRequest() {
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  // Free tier has QPS limit of 1 request every 5 seconds. Use 5500ms to be safe.
  if (timeSinceLast < 5500) {
    const waitTime = 5500 - timeSinceLast;
    await sleep(waitTime);
  }
  lastRequestTime = Date.now();
}

async function getWithRetry(url: string, config?: any, retries = 4, initialDelay = 6000): Promise<any> {
  let delay = initialDelay;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await throttleRequest();
      return await client.get(url, config);
    } catch (error: any) {
      const status = error.response?.status;
      const errorData = error.response?.data;
      const errorMsg = errorData?.message || errorData?.error || error.message;
      const isRateLimit = status === 429 || errorMsg?.toLowerCase().includes("too many requests");
      const is5xx = status >= 500 && status < 600;

      if ((isRateLimit || is5xx) && attempt < retries) {
        console.warn(
          `[Twitter API] ${isRateLimit ? "Rate limited (429)" : `Server error (${status})`} on ${url}. ` +
          `Waiting ${delay}ms before retry ${attempt}/${retries}. Error: ${errorMsg}`
        );
        await sleep(delay);
        delay *= 2; // exponential backoff
        continue;
      }
      throw error;
    }
  }
}

export async function getLastTweets(username: string) {
  try {
    const response = await getWithRetry("/user/last_tweets", {
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
    const response = await getWithRetry("/tweet/advanced_search", {
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

      const response = await getWithRetry("/tweet/advanced_search", { params });
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
    throw error;
  }
}



export async function getTrends() {
  try {
    const response = await getWithRetry("/trends", { params: { woeid: 1 } });
    return response.data?.trends || response.data || [];
  } catch (error) {
    console.error("Error fetching trends:", error);
    throw error;
  }
}

export async function getArticle(tweetId: string) {
  try {
    const response = await getWithRetry("/article", {
      params: { articleId: tweetId },
    });
    // The response schema for /article contains the full text
    return response.data?.article?.text || response.data?.text || ""; 
  } catch (error) {
    console.error(`Error fetching article for tweet ${tweetId}:`, error);
    return ""; // Soft fail: return empty so we can fallback to preview text
  }
}
