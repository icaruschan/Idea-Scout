import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';
import { cleanContentUrl } from './notion';
dotenv.config({ override: true });

// ─────────────────────────────────────────────────────────────
// Multi-Key Rotation and Failover Logic
// ─────────────────────────────────────────────────────────────

const getKeys = (): string[] => {
  const keys: string[] = [];
  
  if (process.env.APIFY_TOKEN) keys.push(process.env.APIFY_TOKEN);
  if (process.env.BACKUP_APIFY_TOKEN) keys.push(process.env.BACKUP_APIFY_TOKEN);
  
  for (let index = 2; index <= 20; index++) {
    const key = process.env[`BACKUP_APIFY_TOKEN_${index}`];
    if (key) keys.push(key);
  }
  
  const filteredKeys = keys.filter((key): key is string => typeof key === 'string' && key.trim().length > 0);

  if (filteredKeys.length === 0) {
    throw new Error('No Apify API keys found in environment variables (APIFY_TOKEN or BACKUP_APIFY_TOKEN/BACKUP_APIFY_TOKEN_X).');
  }
  return filteredKeys;
};

// Initialize index to a random key in the pool for Round-Robin distribution
let activeKeyIndex = Math.floor(Math.random() * 100);

function rotateKey(currentKeyUsed: string) {
  const keys = getKeys();
  const matchedIndex = keys.indexOf(currentKeyUsed);
  if (matchedIndex !== -1 && matchedIndex === activeKeyIndex % keys.length) {
    // Only increment if the active index hasn't already been rotated by another concurrent call
    activeKeyIndex = (matchedIndex + 1) % keys.length;
    console.warn(`🔄 Apify API key failed. Rotated to index ${activeKeyIndex} in the key pool.`);
  }
}

/**
 * Execute an Apify task using the current active key. If the key is exhausted (402), 
 * rate-limited (429), or invalid (401), automatically rotate key and retry the operation.
 */
export async function withApifyClient<T>(fn: (client: ApifyClient) => Promise<T>): Promise<T> {
  const keys = getKeys();
  let lastError: any = null;

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const token = keys[activeKeyIndex % keys.length];
    const client = new ApifyClient({ token });

    try {
      return await fn(client);
    } catch (error: any) {
      lastError = error;

      const isQuotaOrAuthError =
        error?.statusCode === 429 || // Too Many Requests
        error?.statusCode === 402 || // Payment Required (Credits exhausted)
        error?.statusCode === 401 || // Unauthorized (Invalid key)
        error?.message?.toLowerCase().includes('limit') ||
        error?.message?.toLowerCase().includes('credit') ||
        error?.message?.toLowerCase().includes('unauthorized') ||
        error?.message?.toLowerCase().includes('token');

      if (isQuotaOrAuthError && keys.length > 1) {
        console.warn(`⚠️ Apify call failed on attempt ${attempt + 1} with error status ${error?.statusCode || 'unknown'}: ${error?.message || 'Unknown error'}`);
        rotateKey(token);
        continue;
      } else {
        // Normal code error or only one key available
        throw error;
      }
    }
  }

  throw lastError || new Error('Apify operation failed on all available API keys.');
}

// ─────────────────────────────────────────────────────────────
// Actor 1: Karamelo Twitter Trends (legacy, used by Trend Scout)
// ─────────────────────────────────────────────────────────────

export async function fetchApifyTrends() {
  const input = {};
  try {
    console.log('Starting Karamelo Twitter Trends actor...');
    return await withApifyClient(async (client) => {
      const run = await client.actor('karamelo/twitter-trends-scraper').call(input);
      console.log('Actor finished. Fetching dataset items...');
      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      return items;
    });
  } catch (error) {
    console.error('Failed to run Apify trends actor:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// Actor 3: YouTube Scraper (apidojo/youtube-scraper-api)
// Returns video metadata including title, description, views,
// likes, comments, duration, publishDate, and captions.
// ─────────────────────────────────────────────────────────────

export interface YouTubeVideo {
  id: string;
  title: string;
  url: string;
  description: string;
  views: number;
  likes: number;
  comments: number;
  duration: number;
  publishDate: string;
  channel: {
    id: string;
    name: string;
    handle: string;
  };
  transcript?: string;
}

// Private helper to parse duration string (e.g. "00:03:17" or "29:54") into seconds
function parseDuration(durationStr: string | number | undefined | null): number {
  if (durationStr === null || durationStr === undefined) return 0;
  if (typeof durationStr === 'number') return durationStr;
  if (typeof durationStr !== 'string') return 0;
  
  const parts = durationStr.split(':').map(Number);
  if (parts.some(isNaN)) return 0;

  if (parts.length === 1) {
    return parts[0];
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 4) {
    // DD:HH:MM:SS
    return parts[0] * 86400 + parts[1] * 3600 + parts[2] * 60 + parts[3];
  }
  return 0;
}

// Private helper to clean SRT subtitle content into a clean string transcript
function cleanSRT(srtText: string): string {
  if (!srtText) return '';
  return srtText
    .split('\n')
    .map(line => line.trim())
    .filter(line => {
      if (line.includes('-->')) return false; // timestamp line
      if (/^\d+$/.test(line)) return false; // sequence number line
      return line.length > 0;
    })
    .join(' ');
}

/**
 * Scrape recent videos from a YouTube channel.
 * Uses streamers/youtube-scraper to extract video metadata and transcript files.
 * 
 * Cost: $2.40 / 1000 videos ($0.0024/video)
 */
export async function scrapeYouTubeChannel(
  channelHandle: string,
  maxItems: number = 5,
): Promise<YouTubeVideo[]> {
  try {
    // Normalize handle: ensure it starts with @
    const handle = channelHandle.startsWith('@') ? channelHandle : `@${channelHandle}`;

    const input = {
      startUrls: [{ url: `https://www.youtube.com/${handle}/videos` }],
      maxResults: maxItems,
      maxResultsShorts: 0,
      maxResultStreams: 0,
      downloadSubtitles: true,
      subtitlesLanguage: 'en',
      preferAutoGeneratedSubtitles: true,
      subtitlesFormat: 'srt',
      sortVideosBy: 'NEWEST',
    };

    console.log(`Scraping YouTube channel: ${handle} (max ${maxItems} videos)...`);
    
    return await withApifyClient(async (client) => {
      const run = await client.actor('streamers/youtube-scraper').call(input);
      const { items } = await client.dataset(run.defaultDatasetId).listItems();

      return (items as any[]).map((item) => {
        const srtSub = item.subtitles?.find((sub: any) => sub.srt);
        const transcript = srtSub ? cleanSRT(srtSub.srt) : '';

        return {
          id: item.id || '',
          title: item.title || '',
          url: item.url || `https://www.youtube.com/watch?v=${item.id}`,
          description: (item.text || '').substring(0, 2000),
          views: item.viewCount || 0,
          likes: item.likes || 0,
          comments: item.commentsCount || 0,
          duration: parseDuration(item.duration),
          publishDate: item.date || '',
          channel: {
            id: item.channelUrl?.split('/').pop() || '',
            name: item.channelName || '',
            handle: handle,
          },
          transcript,
        };
      });
    });
  } catch (error) {
    console.error(`Failed to scrape YouTube channel ${channelHandle}:`, error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// Actor 4: Instagram Combined Scraping Flow
// ─────────────────────────────────────────────────────────────

export interface InstagramReel {
  id: string;
  caption: string;
  url: string;
  transcript: string;
  likesCount: number;
  commentsCount: number;
  videoViewCount: number;
  videoPlayCount: number;
  sharesCount: number;
  videoDuration: number;
  timestamp: string;
  ownerUsername: string;
  ownerFullName: string;
  hashtags: string[];
}

/**
 * Scrape recent reels from an Instagram profile.
 * Uses apidojo/instagram-scraper-api for cheap, high-speed metadata scraping,
 * combined with apple_yang/instagram-transcripts-scraper for dual-strategy transcription.
 *
 * Cost: $0.005 flat per profile search + $0.005/reel transcription.
 */
export async function scrapeInstagramReels(
  username: string,
  resultsLimit: number = 10,
  excludeUrls: string[] = [],
): Promise<InstagramReel[]> {
  try {
    // Clean username: strip @ and URL prefix if present
    const cleanUsername = username
      .replace(/^@/, '')
      .replace(/^https?:\/\/(www\.)?instagram\.com\//, '')
      .replace(/\/$/, '');

    // Fetch a larger batch to find top performers (minimum 30 or 2x resultsLimit)
    const fetchLimit = Math.max(30, resultsLimit * 2);
    const metadataInput = {
      username: [cleanUsername],
      resultsLimit: fetchLimit,
    };

    const selectedReels = await withApifyClient(async (client) => {
      console.log(`Scraping Instagram reel metadata for @${cleanUsername} (max ${fetchLimit} for mix)...`);
      const metadataRun = await client.actor('apify/instagram-reel-scraper').call(metadataInput);
      const { items: metadataItems } = await client.dataset(metadataRun.defaultDatasetId).listItems();

      if (!metadataItems || metadataItems.length === 0) {
        console.log(`No Instagram reels found for @${cleanUsername}.`);
        return [];
      }

      // Filter out duplicate reels based on url BEFORE selection & transcription to save credits
      const nonDuplicateItems = metadataItems.filter((item: any) => {
        if (!item.url) return true;
        const cleanUrl = cleanContentUrl(item.url);
        return !excludeUrls.includes(cleanUrl);
      });

      if (nonDuplicateItems.length === 0) {
        console.log(`All Instagram reels for @${cleanUsername} are duplicates.`);
        return [];
      }

      // Determine how many newest vs top to pick
      const newestCount = Math.ceil(resultsLimit / 2); // e.g. 5
      const topCount = resultsLimit - newestCount;     // e.g. 5

      // Newest are just the first ones returned (metadata is sorted chronologically)
      const latestReels = nonDuplicateItems.slice(0, newestCount);

      // From the remaining, find the top performers based on play count/views
      const remainingReels = nonDuplicateItems.slice(newestCount);
      const topReels = remainingReels
        .sort((a: any, b: any) => {
          const aViews = a.videoPlayCount || a.playCount || a.videoViewCount || a.viewCount || 0;
          const bViews = b.videoPlayCount || b.playCount || b.videoViewCount || b.viewCount || 0;
          return bViews - aViews;
        })
        .slice(0, topCount);

      return [...latestReels, ...topReels];
    });

    if (selectedReels.length === 0) {
      return [];
    }

    const reelUrls = selectedReels
      .map((item: any) => item.url)
      .filter((url: string | undefined): url is string => typeof url === 'string' && url.length > 0);

    const transcriptsByCode = new Map<string, string>();

    if (reelUrls.length > 0) {
      try {
        console.log(`Transcribing ${reelUrls.length} reels for @${cleanUsername} using apple_yang...`);
        // Process transcripts in chunks to avoid Apify memory exhaustion (free tier: 8192MB)
        const TRANSCRIPT_CONCURRENCY = 3;
        for (let i = 0; i < reelUrls.length; i += TRANSCRIPT_CONCURRENCY) {
          const chunk = reelUrls.slice(i, i + TRANSCRIPT_CONCURRENCY);
          await Promise.all(chunk.map(async (url) => {
            try {
              await withApifyClient(async (client) => {
                const run = await client.actor('apple_yang/instagram-transcripts-scraper').call({ videoUrl: url });
                const { items } = await client.dataset(run.defaultDatasetId).listItems();
                
                if (items && items.length > 0) {
                  const item = items[0] as any;
                  if (item.code && item.text) {
                    transcriptsByCode.set(item.code, item.text);
                  }
                }
              });
            } catch (err) {
              console.error(`Failed to transcribe reel ${url}:`, err);
            }
          }));
          // Cooldown between chunks to let Apify actors release memory
          if (i + TRANSCRIPT_CONCURRENCY < reelUrls.length) {
            await new Promise(r => setTimeout(r, 2000));
          }
        }
      } catch (transcribeError) {
        console.error(`Failed to transcribe reels for @${cleanUsername}:`, transcribeError);
      }
    }

    return selectedReels.map((item: any) => {
      const shortCode = item.shortCode || item.code || '';
      const transcript = transcriptsByCode.get(shortCode) || '';
      const hashtags = (item.caption || '').match(/#\w+/g)?.map((tag: string) => tag.replace('#', '')) || [];

      return {
        id: item.id || shortCode || '',
        caption: (item.caption || '').substring(0, 2000),
        url: item.url || '',
        transcript: transcript.substring(0, 5000),
        likesCount: item.likesCount || item.likeCount || 0,
        commentsCount: item.commentsCount || item.commentCount || 0,
        videoViewCount: item.videoViewCount || item.viewCount || item.videoPlayCount || item.playCount || 0,
        videoPlayCount: item.videoPlayCount || item.playCount || item.videoViewCount || item.viewCount || 0,
        sharesCount: item.sharesCount || item.shareCount || 0,
        videoDuration: item.videoDuration || 0,
        timestamp: item.timestamp || item.createdAt || '',
        ownerUsername: item.ownerUsername || item.owner?.username || cleanUsername,
        ownerFullName: item.ownerFullName || item.owner?.fullName || '',
        hashtags,
      };
    });
  } catch (error) {
    console.error(`Failed to scrape Instagram reels for ${username}:`, error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// Actor 5: Twitter (X) Batch Scraper (apidojo/twitter-scraper-lite)
// ─────────────────────────────────────────────────────────────

export interface TwitterTweet {
  id: string;
  text: string;
  url: string;
  likes: number;
  retweets: number;
  replies: number;
  views: number;
  publishedDate: string;
  author: {
    userName: string;
    name: string;
  };
}

/**
 * Bulk scrape recent tweets for a list of Twitter handles using Apify.
 * Uses apidojo/twitter-scraper-lite for cost-effective event-based scraping.
 * Returns an array of parsed tweets.
 */
export async function scrapeTwitterProfiles(
  handles: string[],
  maxItemsPerHandle: number = 5,
): Promise<TwitterTweet[]> {
  try {
    if (!handles || handles.length === 0) return [];

    // Clean handles by removing "@"
    const cleanHandles = handles.map(h => h.replace(/^@/, ""));

    const input = {
      twitterHandles: cleanHandles,
      sort: "Latest", // Fetch chronological
      maxItems: handles.length * maxItemsPerHandle,
    };

    console.log(`Scraping Twitter profiles via Apify for ${handles.length} handles (max ${input.maxItems} items)...`);

    return await withApifyClient(async (client) => {
      const run = await client.actor("apidojo/twitter-scraper-lite").call(input);
      const { items } = await client.dataset(run.defaultDatasetId).listItems();

      // Only parse actual "tweet" objects (ignore any other noise the actor might return)
      const tweets = (items as any[]).filter(item => item.type === "tweet").map((item) => {
        return {
          id: item.id || "",
          text: item.text || item.full_text || "",
          url: item.url || item.twitterUrl || `https://x.com/${item.author?.userName}/status/${item.id}`,
          likes: item.likeCount || item.favorite_count || 0,
          retweets: item.retweetCount || item.retweet_count || 0,
          replies: item.replyCount || item.reply_count || 0,
          views: item.viewCount || item.views || 0,
          publishedDate: item.createdAt || item.created_at || "",
          author: {
            userName: item.author?.userName || "",
            name: item.author?.name || "",
          },
        };
      });

      console.log(`Apify Twitter scrape returned ${tweets.length} tweets.`);
      return tweets;
    });
  } catch (error) {
    console.error("Failed to scrape Twitter profiles via Apify:", error);
    throw error;
  }
}
