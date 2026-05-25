# Fast YouTube Scraper API - Extract Videos, Channels, Playlists (`apidojo/youtube-scraper-api`) Actor

YouTube Scraper API - extract videos from channels, playlists, searches, trending & Shorts with one powerful actor. Transparent event-based pricing from $0.005/video, 30-100 free items per query, 10-19 videos/sec, rich JSON output, no proxies or login - perfect for research & analytics.

- **URL**: https://apify.com/apidojo/youtube-scraper-api.md
- **Developed by:** [API Dojo](https://apify.com/apidojo) (community)
- **Categories:** Videos, Developer tools, Automation
- **Stats:** 359 total users, 96 monthly users, 99.9% runs succeeded, 17 bookmarks
- **User rating**: 5.00 out of 5 stars

## Pricing

from $0.50 / 1,000 youtube video items

This Actor is paid per event. You are not charged for the Apify platform usage, but only a fixed price for specific events.
Since this Actor supports Apify Store discounts, the price gets lower the higher subscription plan you have.

Learn more: https://docs.apify.com/platform/actors/running/actors-in-store#pay-per-event

## What's an Apify Actor?

Actors are a software tools running on the Apify platform, for all kinds of web data extraction and automation use cases.
In Batch mode, an Actor accepts a well-defined JSON input, performs an action which can take anything from a few seconds to a few hours,
and optionally produces a well-defined JSON output, datasets with results, or files in key-value store.
In Standby mode, an Actor provides a web server which can be used as a website, API, or an MCP server.
Actors are written with capital "A".

## How to integrate an Actor?

If asked about integration, you help developers integrate Actors into their projects.
You adapt to their stack and deliver integrations that are safe, well-documented, and production-ready.
The best way to integrate Actors is as follows.

In JavaScript/TypeScript projects, use official [JavaScript/TypeScript client](https://docs.apify.com/api/client/js.md):

```bash
npm install apify-client
```

In Python projects, use official [Python client library](https://docs.apify.com/api/client/python.md):

```bash
pip install apify-client
```

In shell scripts, use [Apify CLI](https://docs.apify.com/cli/docs.md):

````bash
# MacOS / Linux
curl -fsSL https://apify.com/install-cli.sh | bash
# Windows
irm https://apify.com/install-cli.ps1 | iex
```bash

In AI frameworks, you might use the [Apify MCP server](https://docs.apify.com/platform/integrations/mcp.md).

If your project is in a different language, use the [REST API](https://docs.apify.com/api/v2.md).

For usage examples, see the [API](#api) section below.

For more details, see Apify documentation as [Markdown index](https://docs.apify.com/llms.txt) and [Markdown full-text](https://docs.apify.com/llms-full.txt).


# README

![](https://www.dropbox.com/scl/fi/rhxkyh5sszcsh997ui752/youtube-scraper-api.png?rlkey=0sgt3q1zlro646v3xyficjo7q&dl=1)

## 📺 YouTube Scraper API - Extract Videos, Channels, Playlists & Metadata at Scale

**Extract videos, channels, playlists, search results, trending content, Shorts, and Live Streams from YouTube-no API keys, no proxy setup required.**

Scrape @MrBeast, @kurzgesagt, any playlist, or search query in seconds. Get video metadata, engagement metrics (views, likes, comment counts), channel statistics, captions, and 50+ data fields in clean JSON/CSV format.

**Simple pricing:** $0.015 per channel/search query includes 30 FREE videos. Additional videos just $0.0005 each.

**💰 Pricing:** $0.015/query (30 videos FREE) + $0.0005/video  
**⚡ Speed:** 10-20 videos/second  
**📊 Output:** JSON/CSV with 50+ fields per video  
**🌍 Coverage:** 100+ languages, all countries  
**🚀 Start now:** Proxy handled • API & MCP ready

#### Why Teams Choose This Scraper

- ✅ **10-19 videos/second** - High-speed extraction (varies by query type and region)
- ✅ **30-100 free videos per query** - Generous free tier included
- ✅ **No API key required** - Works without official YouTube Data API access
- ✅ **No proxy setup** - Infrastructure handled automatically on Apify
- ✅ **8 query types** - Videos, channels, playlists, search, trending, Shorts, Live Streams, handles
- ✅ **MCP compatible** - Works with AI agents and LLM workflows
- ✅ **100+ languages** - Localized results via `gl` and `hl` parameters

Ideal for competitor analysis, content tracking, influencer research, market intelligence, and ML dataset building.

|                          |                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| **Use this if you need** | Channel/playlist/search/trending/Shorts/Live Streams metadata at scale                           |
| **Returns**              | JSON/CSV; key fields: `id`, `title`, `views`, `likes`, `comments` (count), `channel`, `captions` |
| **Typical speed**        | 10-19 videos/sec depending on query type                                                         |
| **Pricing**              | $0.015/query (30 videos FREE), then $0.0005/video                                                |



### 📋 Table of Contents

- [🧭 What Does YouTube Scraper Do?](#-what-does-youtube-scraper-do)
- [⚡ Features & YouTube Entity Coverage](#-features--youtube-entity-coverage)
- [💰 Pricing](#-pricing-transparent-event-based-costs)
- [🍚 Input Parameters](#-input-parameters)
- [💡 Strategy Guide](#-youtube-scraper-strategy-guide)
- [📦 Output](#-output)
- [🧩 Custom Map Function](#-custom-map-function)
- [⚖️ YouTube Data API vs Scraper](#-youtube-data-api-vs-scraper-comparison)
- [🛡️ Reliability & Limitations](#-reliability--limitations)
- [🤖 MCP Integration](#-mcp-integration-for-ai-agents--llm-workflows)
- [🈴 Related YouTube Scrapers](#-related-youtube-scrapers--data-extraction-tools)
- [🔧 Troubleshooting](#-troubleshooting-common-issues)
- [🎯 Use Cases](#-use-cases--industries)
- [💡 Quick Start Guide](#-quick-start-guide)
- [❓ FAQ](#-frequently-asked-questions)
- [📞 Contact](#-contact)

### 🧭 What Does YouTube Scraper Do?

YouTube scraping automates the extraction of video metadata, channel statistics, playlist content, engagement metrics, and search results from YouTube.com. This enables content analysis, competitor monitoring, influencer research, trend tracking, and building ML datasets at scale.

The Api Dojo YouTube Scraper is a powerful, all-in-one actor built to extract videos, channels, playlists, searches, trending content, and Shorts. Collect structured metadata quickly and reliably-without API keys or complex setup.

This scraper serves as a practical alternative to the official YouTube Data API for bulk extraction. No quota limits, no API key management-just straightforward data access through Apify's infrastructure.

#### Complete YouTube Entity Coverage

This scraper understands and extracts all core YouTube entities:

| Entity                       | What You Get                                                                               | Use Case                               |
| ---------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------- |
| 🎬 **YouTube Video**          | Title, description, views, likes, comments, duration, thumbnails, streaming URLs, captions | Video analytics, content research      |
| 👤 **YouTube Channel**        | Name, handle, subscriber count, video count, thumbnails, badges, verification              | Channel analysis, influencer discovery |
| 📋 **YouTube Playlist**       | All videos in playlist, playlist metadata, video order                                     | Content curation, course analysis      |
| 💬 **YouTube Comment**        | Comment text, author, likes, replies (via Comments Scraper)                                | Sentiment analysis, audience insights  |
| 🎥 **YouTube Shorts**         | Short-form video data with full metadata                                                   | Shorts trend tracking                  |
| 📺 **YouTube Live Streams**   | Past and active live stream data with full metadata                                        | Live content monitoring                |
| 🔍 **YouTube Search Results** | Videos matching keywords with filters                                                      | Keyword research, content discovery    |
| 📈 **YouTube Trending**       | Currently trending videos by country                                                       | Trend analysis, viral content          |

### ⚡ Features & YouTube Entity Coverage

Complete, structured access to YouTube's public data-videos, channels, playlists, search, trending, Shorts, and Live Streams. Built for content analysis and growth intelligence at scale.

#### 8 Query Types for Complete Coverage

| Query Type           | What It Extracts                       | Example Input                              |
| -------------------- | -------------------------------------- | ------------------------------------------ |
| 🎬 **Single Video**   | Detailed data from individual videos   | `https://www.youtube.com/watch?v=VIDEO_ID` |
| 👤 **Channel**        | All videos from any YouTube channel    | `https://www.youtube.com/@MrBeast`         |
| 📋 **Playlist**       | Complete playlists with all video data | `https://www.youtube.com/playlist?list=ID` |
| 🔍 **Search**         | Videos matching specific keywords      | `machine learning tutorial`                |
| 📈 **Trending**       | Currently trending videos by country   | `getTrending: true`                        |
| 🎥 **Shorts**         | YouTube Shorts from channels           | `includeShorts: true`                      |
| 📺 **Live Streams**   | Past and active live streams           | `includeLiveStreams: true`                  |
| 🔥 **Handle**         | Channels by handle (@username)         | `@kurzgesagt`                              |

#### Core Features

| Feature                   | Description                                      | Benefit                                    |
| ------------------------- | ------------------------------------------------ | ------------------------------------------ |
| 💰 **Event-Based Pricing** | Pay only for videos you extract-no subscriptions | Cost control: Only pay for what you scrape |
| 🎁 **30-100 Free Videos**  | Generous free tier with every query              | Budget-friendly: Substantial free data     |
| ⚡ **10-19 Videos/Second** | High-speed extraction across all query types     | Time savings: Extract thousands in minutes |
| 🔑 **No API Key Required** | Works without YouTube Data API access            | Simple: No quota limits or API setup       |
| 🚀 **No Proxy Setup**      | Infrastructure handled on Apify                  | Cost savings: No proxy management          |
| 🌍 **100+ Languages**      | Multi-language and country support               | Global: Localized content extraction       |
| 📅 **Advanced Filters**    | Upload date, duration, features, sorting         | Precision: Target specific content         |
| 🎯 **Query Wizard**        | Build queries without technical knowledge        | Easy: No coding required                   |
| 📊 **Rich Metadata**       | 50+ fields including captions and streaming URLs | Complete: All video data in one call       |
| 🤖 **MCP Compatible**      | Works with AI agents and LLM workflows           | Future-ready: AI-native integration        |
| 📥 **JSON/CSV Export**     | Clean structured output for analysis             | Integration-ready: Direct pipeline import  |

### 💰 Pricing: Transparent Event-Based Costs

Pay-per-use pricing with no subscriptions, hidden fees, or monthly minimums. Significantly more affordable than most alternatives for bulk extraction.

#### 📊 Event Costs by Query Type

| Event Type             | Price       | Free Videos Included | What Triggers It                |
| ---------------------- | ----------- | -------------------- | ------------------------------- |
| **Playlist Query**     | **$0.05**   | **100 videos FREE**  | Scraping a YouTube playlist     |
| **Trending Query**     | **$0.025**  | **50 videos FREE**   | Getting trending videos         |
| **Shorts Query**       | **$0.02**   | **40 videos FREE**   | When `includeShorts` is enabled       |
| **Live Streams Query** | **$0.02**   | **40 videos FREE**   | When `includeLiveStreams` is enabled   |
| **Channel Query**      | **$0.015**  | **30 videos FREE**   | Scraping a YouTube channel      |
| **Search Query**       | **$0.015**  | **30 videos FREE**   | Performing a keyword search     |
| **Single Video Query** | **$0.005**  | **Flat rate**        | Fetching a single video         |
| **Dataset Item**       | **$0.0005** | N/A                  | Each video beyond free quota    |

#### 💡 How Charges Work

**Playlist Queries ($0.05):**
- Each query includes **100 videos FREE**
- Additional videos beyond 100 cost $0.0005 each

**Trending Queries ($0.025):**
- Each query includes **50 videos FREE**
- Additional videos beyond 50 cost $0.0005 each

**Channel/Search Queries ($0.015):**
- Each query includes **30 videos FREE**
- Additional videos beyond 30 cost $0.0005 each

**Single Video Queries ($0.005):**
- Flat rate per video (returns 1 video per query)
- No additional charges

#### 📈 Cost Examples

| Scenario                   | Charges                  | Calculation                    | Total Cost |
| -------------------------- | ------------------------ | ------------------------------ | ---------- |
| **1 channel, 30 videos**   | 1 channel query          | $0.015                         | **$0.015** |
| **1 channel, 200 videos**  | 1 query + 170 items      | $0.015 + ($0.0005 × 170)       | **$0.100** |
| **1 playlist, 100 videos** | 1 playlist query         | $0.05                          | **$0.050** |
| **1 playlist, 500 videos** | 1 query + 400 items      | $0.05 + ($0.0005 × 400)        | **$0.250** |
| **5 searches, 300 videos** | 5 queries + 150 items    | ($0.015 × 5) + ($0.0005 × 150) | **$0.150** |
| **Trending, 100 videos**   | 1 query + 50 items       | $0.025 + ($0.0005 × 50)        | **$0.050** |
| **10 single videos**       | 10 queries               | $0.005 × 10                    | **$0.050** |
| **10,000 videos**          | Multiple queries + items | Varies by source               | **~$5.00** |


💡 **Pro Tip**  
Each query includes generous FREE videos! This makes **YouTube data collection** incredibly **cost-effective** for market research, content analysis, and **YouTube data for machine learning** projects.

### 🍚 Input Parameters

Flexible input options for targeting multiple YouTube data surfaces - videos, channels, playlists, search, trending, and Shorts - with simple configuration.

| Field                 | Type    | Description                                             | Default    |
| --------------------- | ------- | ------------------------------------------------------- | ---------- |
| **startUrls**         | array   | YouTube URLs (Video, Channel, Playlist, Shorts, Search) | `[]`       |
| **youtubeHandles**    | array   | YouTube handles (e.g., @MrBeast, @kurzgesagt)           | `[]`       |
| **keywords**          | array   | Search keywords for YouTube search                      | `[]`       |
| **getTrending**       | boolean | Retrieve currently trending videos                      | `false`    |
| **includeShorts**     | boolean | Include YouTube Shorts from channels                    | `false`    |
| **includeLiveStreams** | boolean | Include YouTube Live Streams from channels              | `false`    |
| **gl**                | string  | Country code (US, GB, DE, etc.)                         | `US`       |
| **hl**                | string  | Language code (en, es, de, etc.)                        | `en`       |
| **uploadDate**        | string  | Filter: any, hour, today, week, month, year             | `all`      |
| **duration**          | string  | Filter: any, short, long                                | `all`      |
| **features**          | string  | Filter: 4k, hd, live, movie, cc, subtitles, etc.        | `all`      |
| **sort**              | string  | Sort: relevance, upload_date, view_count, rating        | `r`        |
| **maxItems**          | integer | Maximum total videos to output                          | `Infinity` |
| **customMapFunction** | string  | JavaScript function to transform output                 | `null`     |

**Note:** Provide at least one of: `startUrls`, `youtubeHandles`, `keywords`, or enable `getTrending`.

#### Supported URL Types

| URL Type             | Format                                                 | Example                                                                    |
| -------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------- |
| 🎬 **Single Video**   | `https://www.youtube.com/watch?v=ID`                   | `https://www.youtube.com/watch?v=dQw4w9WgXcQ`                              |
| 👤 **Channel**        | `https://www.youtube.com/@handle`                      | `https://www.youtube.com/@MrBeast`                                         |
| 📋 **Playlist**       | `https://www.youtube.com/playlist?list=ID`             | `https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf` |
| 🔍 **Search**         | `https://www.youtube.com/results?search_query=keyword` | `https://www.youtube.com/results?search_query=AI`                          |
| 🎥 **Shorts**         | `https://www.youtube.com/shorts/ID`                    | `https://www.youtube.com/shorts/abc123`                                    |
| 📺 **Channel Shorts**        | `https://www.youtube.com/@handle/shorts`   | `https://www.youtube.com/@MrBeast/shorts`   |
| 🔴 **Channel Live Streams**  | `https://www.youtube.com/@handle/streams`  | `https://www.youtube.com/@MrBeast/streams`  |

### 💡 YouTube Scraper Strategy Guide

Choose the right strategy based on your data needs and budget. Each approach optimizes for different **YouTube data extraction** use cases.

#### Strategy 1: Scrape YouTube Channel (Creator Analysis)

**Best for:** YouTube competitor analysis, influencer research, content performance tracking

```json
{
  "startUrls": ["https://www.youtube.com/@kurzgesagt"],
  "maxItems": 200
}
````

| Cost Breakdown        | Calculation            |
| --------------------- | ---------------------- |
| 1 channel query       | $0.015                 |
| 170 additional videos | $0.0005 × 170 = $0.085 |
| **Total**             | **$0.100**             |

**Use case:** Extract complete channel data for **YouTube channel statistics API** analysis, content strategy research, and creator benchmarking.

***

#### Strategy 2: Scrape YouTube Playlist (Course/Series Analysis)

**Best for:** Educational content research, playlist curation, series analysis

```json
{
  "startUrls": ["https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf"],
  "maxItems": 500
}
```

| Cost Breakdown        | Calculation            |
| --------------------- | ---------------------- |
| 1 playlist query      | $0.05                  |
| 400 additional videos | $0.0005 × 400 = $0.200 |
| **Total**             | **$0.250**             |

**Use case:** Extract complete playlist for course analysis, content curation, and **YouTube playlist** research.

***

#### Strategy 3: YouTube Search Scraping (Keyword Research)

**Best for:** YouTube keyword search API, content discovery, market research

```json
{
  "keywords": ["machine learning tutorial", "AI for beginners"],
  "hl": "en",
  "gl": "US",
  "uploadDate": "month",
  "maxItems": 200
}
```

| Cost Breakdown        | Calculation            |
| --------------------- | ---------------------- |
| 2 search queries      | $0.015 × 2 = $0.030    |
| 140 additional videos | $0.0005 × 140 = $0.070 |
| **Total**             | **$0.100**             |

**Use case:** **Scrape YouTube search results** for keyword research, content gap analysis, and **YouTube trending videos API** discovery.

***

#### Strategy 4: YouTube Trending Videos (Trend Analysis)

**Best for:** Viral content discovery, trend tracking, cultural analysis

```json
{
  "getTrending": true,
  "gl": "US",
  "maxItems": 100
}
```

| Cost Breakdown       | Calculation           |
| -------------------- | --------------------- |
| 1 trending query     | $0.025                |
| 50 additional videos | $0.0005 × 50 = $0.025 |
| **Total**            | **$0.050**            |

**Use case:** Track **YouTube trending videos** for viral content analysis and cultural trend research.

***

#### Strategy 5: Single Video Extraction (Specific Content)

**Best for:** Competitor video analysis, viral content study, specific video data

```json
{
  "startUrls": [
    "https://www.youtube.com/watch?v=xuCn8ux2gbs",
    "https://www.youtube.com/watch?v=kXYiU_JCYtU"
  ]
}
```

| Cost Breakdown         | Calculation         |
| ---------------------- | ------------------- |
| 2 single video queries | $0.005 × 2 = $0.010 |
| **Total**              | **$0.010**          |

**Use case:** Get detailed **YouTube video stats API** data for specific videos.

***

#### Strategy 6: Channel + Shorts (Complete Creator Data)

**Best for:** Full creator analysis including short-form content

```json
{
  "youtubeHandles": ["@MrBeast"],
  "includeShorts": true,
  "maxItems": 200
}
```

| Cost Breakdown        | Calculation            |
| --------------------- | ---------------------- |
| 1 channel query       | $0.015                 |
| 1 shorts query        | $0.02                  |
| 130 additional videos | $0.0005 × 130 = $0.065 |
| **Total**             | **$0.100**             |

**Use case:** Complete creator analysis including **YouTube Shorts** for comprehensive content strategy research.

***

#### Strategy Comparison Table

| Strategy           | Best For         | Cost per 100 Videos | Free Videos    |
| ------------------ | ---------------- | ------------------- | -------------- |
| 👤 Channel          | Creator analysis | $0.050              | 30             |
| 📋 Playlist         | Course/series    | $0.050              | 100            |
| 🔍 Search           | Keyword research | $0.050              | 30 per keyword |
| 📈 Trending         | Trend analysis   | $0.050              | 50             |
| 🎬 Single Video     | Specific content | $0.005/video        | N/A            |
| 🎥 Channel + Shorts | Full creator     | $0.065              | 70             |

#### Pro Tips for Cost Optimization

##### ✅ Maximize Free Videos

- **Use playlists** - 100 free videos per playlist query
- **Batch channels** - 30 free videos per channel
- **Combine searches** - 30 free videos per keyword

##### ✅ Control Spending

- **Set `maxItems`** - Limit total videos to control costs
- **Use filters** - Narrow results with uploadDate, duration, features
- **Start small** - Test with 50-100 videos before scaling

### 📦 Output

Clean, structured JSON output with comprehensive video information. Each video object contains 50+ fields.

#### Minimal Example (Core Fields)

```json
{
  "id": "lfR7Qj04-UA",
  "title": "The Ultimate Pixel Art Tutorial",
  "url": "https://www.youtube.com/watch?v=lfR7Qj04-UA",
  "description": "Learn pixel art fundamentals in this comprehensive tutorial...",
  "duration": 854,
  "views": 1997072,
  "likes": 93698,
  "comments": 1449,
  "channel": {
    "id": "UCMLJ_TROV89ll587opuuY4w",
    "name": "Saultoons",
    "handle": "/@saultoons",
    "subscriberCount": "177K subscribers",
    "badges": ["Verified"]
  },
  "keywords": ["pixel art tutorial", "pixel art", "aseprite"],
  "category": "Entertainment",
  "publishDate": "2021-06-17T10:46:54-07:00",
  "isLive": false,
  "isFamilySafe": true
}
```

#### Field Availability Guarantees

Understanding which fields are always present vs. conditionally available helps you build reliable integrations.

| Field           | Availability | Data Type | Notes                             |
| --------------- | ------------ | --------- | --------------------------------- |
| `id`            | ✅ Always     | string    | Unique video ID                   |
| `url`           | ✅ Always     | string    | Full video URL                    |
| `title`         | ✅ Always     | string    | Video title                       |
| `channel.id`    | ✅ Always     | string    | Channel ID                        |
| `channel.name`  | ✅ Always     | string    | Channel display name              |
| `views`         | ✅ Always     | integer   | Total view count                  |
| `duration`      | ✅ Always     | integer   | Length in seconds                 |
| `publishDate`   | ✅ Always     | ISO-8601  | Publication timestamp             |
| `likes`         | ⚠️ Sometimes  | integer   | Hidden on some videos             |
| `comments`      | ⚠️ Sometimes  | integer   | Disabled on some videos           |
| `captions`      | ⚠️ Sometimes  | array     | Not all videos have captions      |
| `streamingData` | ⚠️ Sometimes  | object    | May be restricted; optional field |
| `description`   | ⚠️ Sometimes  | string    | May be empty                      |

**Note:** `streamingData` contains direct video URLs in multiple qualities. This field is optional and may not be available for all videos (age-restricted, geo-blocked, or premium content). Use `customMapFunction` to exclude it if not needed.

<details>
<summary><strong>📋 Full Example Output (click to expand)</strong></summary>

```json
{
  "inputSource": "pixel art",
  "type": "video",
  "id": "lfR7Qj04-UA",
  "title": "The Ultimate Pixel Art Tutorial",
  "status": "OK",
  "url": "https://www.youtube.com/watch?v=lfR7Qj04-UA",
  "description": "Learn pixel art fundamentals...",
  "duration": 854,
  "views": 1997072,
  "likes": 93698,
  "comments": 1449,
  "channel": {
    "id": "UCMLJ_TROV89ll587opuuY4w",
    "name": "Saultoons",
    "handle": "/@saultoons",
    "url": "https://www.youtube.com/channel/UCMLJ_TROV89ll587opuuY4w",
    "subscriberCount": "177K subscribers",
    "thumbnails": [{"url": "...", "width": 176, "height": 176}],
    "badges": ["Verified"]
  },
  "keywords": ["pixel art tutorial", "pixel art", "aseprite", "..."],
  "superTitle": "#pixelarttutorial #pixelart #tutorial",
  "isRatingsAllowed": true,
  "isLive": false,
  "isFamilySafe": true,
  "category": "Entertainment",
  "isPrivate": false,
  "thumbnails": [{"url": "...", "width": 1280, "height": 720}],
  "embedUrl": "https://www.youtube.com/embed/lfR7Qj04-UA",
  "isEmbeddable": true,
  "publishDate": "2021-06-17T10:46:54-07:00",
  "uploadDate": "2021-06-17T10:46:54-07:00",
  "captions": {"captionTracks": [{"name": "English", "languageCode": "en"}]},
  "streamingData": {"formats": [{"qualityLabel": "1080p", "...": "..."}]},
  "videoPreviews": [{"url": "...", "width": 320, "height": 180}]
}
```

</details>

#### Export Options

- **JSON:** Complete datasets with nested objects-ideal for programmatic processing
- **CSV:** Direct download from Apify Console-perfect for spreadsheets and databases
- **API:** RESTful endpoints for Python, Node.js, or any HTTP client

### 🧩 Custom Map Function

Transform output using the `customMapFunction` parameter. This JavaScript function receives each video object and returns your desired format-add engagement metrics, flatten channel data, or calculate custom analytics.

**Important:** Custom map function is for data transformation-**not for filtering**. Filtering items may result in automatic restrictions.

#### Example: Engagement Rate Calculation

```javascript
(object) => ({
  ...object,
  engagementRate: (object.likes / object.views * 100).toFixed(2),
  channelName: object.channel?.name,
  subscriberCount: object.channel?.subscriberCount,
  durationMinutes: Math.floor(object.duration / 60),
  isViral: object.views > 1000000,
  streamingData: undefined,
  captions: undefined
})
```

#### Common Transformations

| Use Case                | What to Add                                           |
| ----------------------- | ----------------------------------------------------- |
| **Engagement Analysis** | `engagementRate`, `likesToViews`, `performanceScore`  |
| **Channel Flattening**  | `channelName`, `subscriberCount`, `isVerified`        |
| **Viral Detection**     | `isViral`, `viralTier`, `viewsPerDay`                 |
| **Data Cleanup**        | Set `streamingData: undefined`, `captions: undefined` |

### ⚖️ YouTube Data API vs Scraper Comparison

Choosing between the official YouTube Data API and a scraper depends on your use case, volume, and budget. Here's an honest comparison.

| Factor               | Official YouTube Data API       | YouTube Scraper (This Tool)                                                          |
| -------------------- | ------------------------------- | ------------------------------------------------------------------------------------ |
| **Quota limits**     | 10,000 units/day (strict)       | No quota limits                                                                      |
| **Setup complexity** | OAuth, API keys, project setup  | No setup-runs on Apify                                                               |
| **Cost at scale**    | Free tier, then complex pricing | $0.50 per 1,000 videos                                                               |
| **Data coverage**    | Official but limited fields     | 50+ fields including streaming URLs                                                  |
| **Rate limiting**    | Aggressive throttling           | Managed automatically                                                                |
| **Comment threads**  | Requires separate API calls     | Use [Comments Scraper](https://apify.com/apidojo/youtube-comments-scraper?fpr=yhdrb) |
| **Compliance**       | Official, ToS-compliant         | Public data extraction                                                               |

#### When to Use the Official API

- You need **write access** (upload, modify playlists)
- Your app requires **OAuth user authentication**
- You're building a **production app** that needs official support
- Volume is **low** (<10K requests/day)

#### When to Use This Scraper

- You need **bulk data extraction** (10K+ videos)
- You want **no quota limits** or API key management
- You need **additional fields** not in the official API
- You're doing **research, analysis, or ML training**
- You want **predictable, transparent pricing**

### 🛡️ Reliability & Limitations

Transparency about what this scraper can and cannot do helps you plan integrations and set realistic expectations.

#### What Affects Speed

| Factor                 | Impact                                  |
| ---------------------- | --------------------------------------- |
| **Query type**         | Playlists are faster than searches      |
| **Region**             | Some regions have slower response times |
| **Time of day**        | Peak hours may be slightly slower       |
| **Video availability** | Deleted/private videos are skipped      |

**Typical performance:** 10-19 videos/second under normal conditions. Large playlists (1000+ videos) may take longer due to pagination.

#### Data That May Be Missing

| Field           | When It's Missing                               |
| --------------- | ----------------------------------------------- |
| `likes`         | Creator has hidden like counts                  |
| `comments`      | Comments are disabled on the video              |
| `captions`      | No captions uploaded for the video              |
| `streamingData` | Age-restricted, geo-blocked, or premium content |
| `description`   | Creator left description empty                  |

#### Content We Cannot Access

- ❌ **Private videos** - Not publicly accessible
- ❌ **Member-only content** - Requires channel membership
- ❌ **Age-restricted videos** - May have limited data
- ❌ **Geo-blocked content** - Depends on Apify server location
- ❌ **Deleted videos** - No longer exist on YouTube

#### Retry Behavior

The scraper automatically retries failed requests with exponential backoff. If a video consistently fails, it's skipped and logged. Check the run log for any skipped items.

#### Compliance Note

This scraper extracts publicly available data from YouTube. It does not bypass any authentication, access private content, or violate user privacy. Use extracted data responsibly and in accordance with applicable laws and YouTube's Terms of Service.

### 🤖 MCP Integration for AI Agents & LLM Workflows

This scraper is **MCP (Model Context Protocol) compatible**, making it ideal for AI agents, LLM workflows, and automated intelligence systems.

#### What is MCP?

MCP (Model Context Protocol) is an emerging standard for connecting AI models to external data sources and tools. It enables AI agents like Claude, GPT, and custom LLMs to access real-time YouTube data for analysis, research, and decision-making.

#### Why MCP Matters for YouTube Data

| Capability                | Benefit                                                          |
| ------------------------- | ---------------------------------------------------------------- |
| **Real-time data access** | AI agents can query live YouTube trends, not just training data  |
| **Structured output**     | Clean JSON format integrates seamlessly with LLM context windows |
| **Automated workflows**   | Trigger scrapes based on AI agent decisions                      |
| **Research augmentation** | Enhance AI research with current video intelligence              |

#### MCP Use Cases

- **AI-Powered Content Analysis** - LLMs analyze YouTube trends in real-time
- **Automated Competitor Monitoring** - AI agents track competitor channels
- **Content Strategy Bots** - Automated content research and ideation
- **Brand Monitoring Agents** - AI monitors brand mentions and sentiment
- **Research Assistants** - AI researchers access current YouTube data

#### Integration Example

```python
## Example: Using YouTube Scraper with AI agent via Apify API
from apify_client import ApifyClient

client = ApifyClient("YOUR_API_TOKEN")

## Run YouTube Scraper
run = client.actor("apidojo/youtube-scraper").call(run_input={
    "keywords": ["AI tutorial"],
    "maxItems": 100
})

## Get results for LLM context
dataset = client.dataset(run["defaultDatasetId"]).list_items()

## Feed to AI agent for analysis
youtube_context = json.dumps(dataset.items)
## Pass youtube_context to your LLM/AI agent
```

### 🈴 Related YouTube Scrapers & Data Extraction Tools

Expand your **YouTube data extraction** capabilities with our complete suite of specialized YouTube scraper APIs. Each tool focuses on specific data types for comprehensive video intelligence.

#### 📦 Complete Apidojo YouTube Scraper Ecosystem

| Tool                                                                                           | What It Extracts                                      | Best For                                 |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------- |
| 📺 **YouTube Scraper**                                                                          | Videos, channels, playlists, search, trending, Shorts | All-in-one extraction **(You are here)** |
| 💬 **[YouTube Comments Scraper](https://apify.com/apidojo/youtube-comments-scraper?fpr=yhdrb)** | Comments, replies, user interactions                  | Sentiment analysis, audience insights    |
| 👤 **[YouTube Channel Scraper](https://apify.com/apidojo/youtube-channel-scraper?fpr=yhdrb)**   | Channel statistics, subscriber data                   | Channel analysis, influencer research    |
| 📋 **[YouTube Playlist Scraper](https://apify.com/apidojo/youtube-playlist-scraper?fpr=yhdrb)** | Playlist videos, course content                       | Educational content, series analysis     |

#### 🌐 Cross-Platform Social Media Scrapers

| Platform    | Tool                                                                           | What It Extracts                    |
| ----------- | ------------------------------------------------------------------------------ | ----------------------------------- |
| 🎵 TikTok    | **[TikTok Scraper](https://apify.com/apidojo/tiktok-scraper?fpr=yhdrb)**       | Videos, profiles, hashtags, sounds  |
| 📸 Instagram | **[Instagram Scraper](https://apify.com/apidojo/instagram-scraper?fpr=yhdrb)** | Posts, profiles, hashtags, comments |
| 🐦 Twitter   | **[Twitter Scraper](https://apify.com/apidojo/twitter-scraper?fpr=yhdrb)**     | Tweets, profiles, followers         |

### 🔧 Troubleshooting Common Issues

#### ❓ Getting Fewer Results Than Expected?

**Problem:** Extraction returns fewer YouTube videos than anticipated

**Solutions:**

✅ **Check `maxItems` setting** - Increase the limit if you need more videos\
✅ **Verify filters** - Ensure `uploadDate`, `duration`, `features` aren't too restrictive\
✅ **Remember free tiers** - Each query includes 30-100 FREE videos automatically

***

#### 💰 Unexpected Costs?

**Problem:** Your YouTube Scraper run cost more than anticipated

**Solutions:**

✅ **Each URL/keyword creates a separate query** - 10 channels = 10 × $0.015 = $0.15 in base costs\
✅ **Playlist queries cost more** - $0.05 vs $0.015 for channels, but include 100 free videos\
✅ **Use `maxItems` to cap spending** - Set a limit to control total extraction volume

***

#### ❓ No Results Returned?

**Problem:** Extraction completes but returns empty dataset

**Solutions:**

✅ **Verify input format** - Provide at least one of: `startUrls`, `youtubeHandles`, `keywords`, or `getTrending`\
✅ **Check URLs** - Must be valid YouTube URLs\
✅ **Test filters** - Overly restrictive filters may return no results

***

#### ❓ Missing Data Fields?

**Problem:** Some expected fields are missing from output

**Solutions:**

✅ **Open Storage tab** - Full datasets available in Apify Console, not all fields show in preview\
✅ **Check video availability** - Private or deleted videos won't appear in results

### 🎯 Use Cases & Industries

This scraper serves professionals who need fast, structured YouTube insights-from competitor analysis to ML dataset building.

***

#### 📊 Marketing & Campaign Strategy

Track content performance, analyze trends, and optimize campaigns.

- Analyze competitor channel strategies
- Track views, likes, and engagement across campaigns
- Monitor trending videos for viral opportunities

**Example:** Benchmark your content against 5 competitor channels.

***

#### 🔬 Research & Data Science

Build large-scale datasets for academic research, NLP, and ML training.

- Extract 100K+ videos for research datasets
- Structured JSON/CSV for statistical analysis
- Analyze cultural trends and social movements

**Example:** Build a 50K video dataset on climate change content.

***

#### 🎥 Influencer Marketing

Discover creators, analyze engagement, and measure campaign ROI.

- Track subscriber counts and engagement rates
- Vet influencers with channel metadata
- Discover emerging creators by niche

**Example:** Find tech creators with 50K-500K subscribers.

***

#### 🏢 Brand & Competitive Intelligence

Monitor brand mentions and track competitor activity.

- Track brand mentions in video titles/descriptions
- Monitor competitor channel growth
- Analyze sentiment via [Comments Scraper](https://apify.com/apidojo/youtube-comments-scraper?fpr=yhdrb)

**Example:** Track brand keywords vs. competitor mentions.

***

#### 🎵 Music & Entertainment

Track music trends, discover artists, and analyze audience engagement.

- Monitor music video performance
- Discover trending artists and genres
- Track viral content patterns

**Example:** Identify emerging artists for talent scouting.

***

#### 📈 SEO & Content Strategy

Research keywords, analyze rankings, and plan content.

- Analyze top-ranking videos for target keywords
- Extract video tags for keyword research
- Track trending topics for content ideation

**Example:** Analyze top 100 videos for "Python tutorial".

***

#### 🎓 Academic & Education

Collect data for media studies, cultural research, and educational content analysis.

- Build datasets for communication research
- Analyze educational playlists and courses
- Track content virality patterns

**Example:** Analyze how online learning content is structured.

### 💡 Quick Start Guide

Simple setup-whether extracting a single video or building a database of thousands.

#### Copy-Paste Examples by Persona

**For Analysts (Channel → CSV):**

```json
{
  "startUrls": ["https://www.youtube.com/@kurzgesagt"],
  "maxItems": 100
}
```

→ Run, then export to CSV from Storage tab.

**For Developers (API → JSON):**

```python
from apify_client import ApifyClient
client = ApifyClient("YOUR_TOKEN")
run = client.actor("apidojo/youtube-scraper").call(run_input={
    "keywords": ["machine learning"],
    "maxItems": 50
})
items = client.dataset(run["defaultDatasetId"]).list_items().items
```

**For AI Agents (MCP pattern):**

```python
## Fetch data, then pass to LLM
youtube_data = client.dataset(run["defaultDatasetId"]).list_items().items
context = json.dumps(youtube_data[:10])  ## First 10 videos as context
## Pass context to your AI agent
```

#### 3 Steps to Get Started

1. **Choose input:** URLs, handles (@username), keywords, or enable `getTrending`
2. **Configure:** Set `maxItems`, `gl` (country), `hl` (language), filters
3. **Run & Export:** Click Start, then download JSON/CSV from Storage tab

***

#### 📋 Method 1: Scrape by URL

**Best for:** Specific channels, playlists, videos

```json
{
  "startUrls": [
    "https://www.youtube.com/@kurzgesagt",
    "https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf"
  ],
  "maxItems": 500
}
```

***

#### 📋 Method 2: Scrape by Keywords

**Best for:** Content discovery, trend research, market analysis

```json
{
  "keywords": ["AI tutorial", "machine learning", "data science"],
  "gl": "US",
  "hl": "en",
  "uploadDate": "month",
  "maxItems": 300
}
```

***

#### 📋 Method 3: Get Trending Videos

**Best for:** Viral content discovery, trend tracking

```json
{
  "getTrending": true,
  "gl": "US",
  "maxItems": 100
}
```

***

#### 🔧 Best Practices for YouTube Scraping

##### ✅ DO:

- **Start with test runs** - Use 50-100 videos to validate output format
- **Use filters** - Narrow results with uploadDate, duration, features
- **Batch similar sources** - Combine related channels or keywords in one run
- **Set `maxItems`** - Control costs by limiting total extraction

##### ❌ DON'T:

- **Use customMapFunction for filtering** - This causes automatic blocking
- **Scrape private content** - Only public YouTube data is accessible
- **Use overly restrictive filters** - May return zero results

### ❓ Frequently Asked Questions

#### What is a YouTube Scraper API?

A tool that programmatically extracts YouTube data-videos, channels, playlists, and engagement metrics. It serves as an alternative to the official YouTube Data API without quota limits or API key requirements.

#### How much does it cost to scrape 10,000 videos?

**$5.00** total ($0.50 per 1,000 videos)-significantly cheaper than most alternatives.

#### Can I scrape YouTube comments?

This actor extracts video-level data including comment *counts*. For full comment threads, use our [YouTube Comments Scraper](https://apify.com/apidojo/youtube-comments-scraper?fpr=yhdrb).

#### Does this work for channel scraping?

Yes. Provide a channel URL or handle. Each channel query costs $0.015 and includes 30 videos FREE.

#### Can I export to CSV?

Yes. Download directly from Apify Console in JSON, CSV, or Excel format.

#### Can I use Python?

Yes. Full Python support via the Apify Client library. See the [copy-paste examples](#copy-paste-examples-by-persona) above.

#### Is this faster than the official YouTube API?

Yes. 10-19 videos/second without quota limits. The official API has strict daily quotas (10K units/day).

#### Can I scrape YouTube Shorts?

Yes. Enable `includeShorts: true`. Shorts queries cost $0.02 and include 40 videos FREE.

#### Can I scrape YouTube Live Streams?

Yes. Enable `includeLiveStreams: true`, or pass a channel `/streams` URL directly. Live Streams queries cost $0.02 and include 40 videos FREE.

#### Can I scrape trending videos?

Yes. Enable `getTrending: true` to extract trending videos by country. Costs $0.025 with 50 videos FREE.

#### Can I use this for machine learning datasets?

Yes. Extract structured JSON with 50+ fields per video-ideal for NLP, computer vision, and trend prediction models.

### 📞 Contact

Questions or support: **apidojo10@gmail.com**

***

**Ready to start?** Transparent pricing, 10-19 videos/sec, no API key required, 7 query types. Start extracting YouTube data today. 📺

# Actor input Schema

## `startUrls` (type: `array`):

YouTube URLs to scrape. Supports: Video, Channel, Playlist, Shorts, Search URLs. Required if keywords, youtubeHandles, or getTrending is not provided.

## `youtubeHandles` (type: `array`):

YouTube handles/channels to scrape (e.g., @MrBeast, @nike). Required if startUrls, keywords, or getTrending is not provided.

## `includeShorts` (type: `boolean`):

When enabled, includes YouTube Shorts from channels. This triggers additional Shorts Query charges.

## `includeLiveStreams` (type: `boolean`):

When enabled, includes YouTube Live Streams from channels. This triggers additional Live Streams Query charges.

## `getTrending` (type: `boolean`):

If enabled, retrieves currently trending YouTube videos. Triggers Trending Query charge.

## `keywords` (type: `array`):

Search keywords for YouTube search. Required if startUrls, youtubeHandles, or getTrending is not provided.

## `gl` (type: `string`):

Location for the search results, which is passed to YouTube as the gl URL query parameter. (US, AF, AL, etc...)

## `hl` (type: `string`):

Language for the search results, which is passed to YouTube as the hl URL query parameter. (af, tr, de, etc...)

## `uploadDate` (type: `string`):

Upload date for the search results, which is passed to YouTube as the upload date URL query parameter. (any, hour, today, week, month, year)

## `duration` (type: `string`):

Duration of the video for the search results, which is passed to YouTube as the duration URL query parameter. (any, short, long)

## `features` (type: `string`):

Features for video. (any, 4k, hd, live, movie, cc, 3d, hdr, location, purchased, subtitles, vr180, vr360)

## `sort` (type: `string`):

Sorts search results by the given option. Only works with search keywords.

## `maxItems` (type: `integer`):

Maximum total videos to output across entire run.

## `customMapFunction` (type: `string`):

JavaScript function to transform each output video. Use to add computed fields, modify values, or remove unnecessary data. NOT intended for filtering - filtering may result in automatic bans.

## Actor input object example

```json
{
  "startUrls": [
    "https://www.youtube.com/results?search_query=never+gonna+give+you+up"
  ],
  "gl": "us",
  "hl": "en",
  "uploadDate": "all",
  "duration": "all",
  "features": "all",
  "sort": "r",
  "maxItems": 1000,
  "customMapFunction": "(object) => { return {...object} }"
}
```

# Actor output Schema

## `overview` (type: `string`):

No description

# API

You can run this Actor programmatically using our API. Below are code examples in JavaScript, Python, and CLI, as well as the OpenAPI specification and MCP server setup.

## JavaScript example

```javascript
import { ApifyClient } from 'apify-client';

// Initialize the ApifyClient with your Apify API token
// Replace the '<YOUR_API_TOKEN>' with your token
const client = new ApifyClient({
    token: '<YOUR_API_TOKEN>',
});

// Prepare Actor input
const input = {
    "startUrls": [
        "https://www.youtube.com/results?search_query=never+gonna+give+you+up"
    ],
    "uploadDate": "all",
    "duration": "all",
    "features": "all",
    "sort": "r",
    "maxItems": 1000,
    "customMapFunction": (object) => { return {...object} }
};

// Run the Actor and wait for it to finish
const run = await client.actor("apidojo/youtube-scraper-api").call(input);

// Fetch and print Actor results from the run's dataset (if any)
console.log('Results from dataset');
console.log(`💾 Check your data here: https://console.apify.com/storage/datasets/${run.defaultDatasetId}`);
const { items } = await client.dataset(run.defaultDatasetId).listItems();
items.forEach((item) => {
    console.dir(item);
});

// 📚 Want to learn more 📖? Go to → https://docs.apify.com/api/client/js/docs

```

## Python example

```python
from apify_client import ApifyClient

# Initialize the ApifyClient with your Apify API token
# Replace '<YOUR_API_TOKEN>' with your token.
client = ApifyClient("<YOUR_API_TOKEN>")

# Prepare the Actor input
run_input = {
    "startUrls": ["https://www.youtube.com/results?search_query=never+gonna+give+you+up"],
    "uploadDate": "all",
    "duration": "all",
    "features": "all",
    "sort": "r",
    "maxItems": 1000,
    "customMapFunction": "(object) => { return {...object} }",
}

# Run the Actor and wait for it to finish
run = client.actor("apidojo/youtube-scraper-api").call(run_input=run_input)

# Fetch and print Actor results from the run's dataset (if there are any)
print("💾 Check your data here: https://console.apify.com/storage/datasets/" + run["defaultDatasetId"])
for item in client.dataset(run["defaultDatasetId"]).iterate_items():
    print(item)

# 📚 Want to learn more 📖? Go to → https://docs.apify.com/api/client/python/docs/quick-start

```

## CLI example

```bash
echo '{
  "startUrls": [
    "https://www.youtube.com/results?search_query=never+gonna+give+you+up"
  ],
  "uploadDate": "all",
  "duration": "all",
  "features": "all",
  "sort": "r",
  "maxItems": 1000,
  "customMapFunction": "(object) => { return {...object} }"
}' |
apify call apidojo/youtube-scraper-api --silent --output-dataset

```

## MCP server setup

```json
{
    "mcpServers": {
        "apify": {
            "command": "npx",
            "args": [
                "mcp-remote",
                "https://mcp.apify.com/?tools=apidojo/youtube-scraper-api",
                "--header",
                "Authorization: Bearer <YOUR_API_TOKEN>"
            ]
        }
    }
}

```

## OpenAPI specification

```json
{
    "openapi": "3.0.1",
    "info": {
        "title": "Fast YouTube Scraper API - Extract Videos, Channels, Playlists",
        "description": "YouTube Scraper API - extract videos from channels, playlists, searches, trending & Shorts with one powerful actor. Transparent event-based pricing from $0.005/video, 30-100 free items per query, 10-19 videos/sec, rich JSON output, no proxies or login - perfect for research & analytics.",
        "version": "0.0",
        "x-build-id": "uaJgjW0Hc0DCAPVr8"
    },
    "servers": [
        {
            "url": "https://api.apify.com/v2"
        }
    ],
    "paths": {
        "/acts/apidojo~youtube-scraper-api/run-sync-get-dataset-items": {
            "post": {
                "operationId": "run-sync-get-dataset-items-apidojo-youtube-scraper-api",
                "x-openai-isConsequential": false,
                "summary": "Executes an Actor, waits for its completion, and returns Actor's dataset items in response.",
                "tags": [
                    "Run Actor"
                ],
                "requestBody": {
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/inputSchema"
                            }
                        }
                    }
                },
                "parameters": [
                    {
                        "name": "token",
                        "in": "query",
                        "required": true,
                        "schema": {
                            "type": "string"
                        },
                        "description": "Enter your Apify token here"
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK"
                    }
                }
            }
        },
        "/acts/apidojo~youtube-scraper-api/runs": {
            "post": {
                "operationId": "runs-sync-apidojo-youtube-scraper-api",
                "x-openai-isConsequential": false,
                "summary": "Executes an Actor and returns information about the initiated run in response.",
                "tags": [
                    "Run Actor"
                ],
                "requestBody": {
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/inputSchema"
                            }
                        }
                    }
                },
                "parameters": [
                    {
                        "name": "token",
                        "in": "query",
                        "required": true,
                        "schema": {
                            "type": "string"
                        },
                        "description": "Enter your Apify token here"
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/runsResponseSchema"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/acts/apidojo~youtube-scraper-api/run-sync": {
            "post": {
                "operationId": "run-sync-apidojo-youtube-scraper-api",
                "x-openai-isConsequential": false,
                "summary": "Executes an Actor, waits for completion, and returns the OUTPUT from Key-value store in response.",
                "tags": [
                    "Run Actor"
                ],
                "requestBody": {
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/inputSchema"
                            }
                        }
                    }
                },
                "parameters": [
                    {
                        "name": "token",
                        "in": "query",
                        "required": true,
                        "schema": {
                            "type": "string"
                        },
                        "description": "Enter your Apify token here"
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK"
                    }
                }
            }
        }
    },
    "components": {
        "schemas": {
            "inputSchema": {
                "type": "object",
                "properties": {
                    "startUrls": {
                        "title": "Start URLs",
                        "type": "array",
                        "description": "YouTube URLs to scrape. Supports: Video, Channel, Playlist, Shorts, Search URLs. Required if keywords, youtubeHandles, or getTrending is not provided.",
                        "items": {
                            "type": "string"
                        }
                    },
                    "youtubeHandles": {
                        "title": "Youtube handles",
                        "type": "array",
                        "description": "YouTube handles/channels to scrape (e.g., @MrBeast, @nike). Required if startUrls, keywords, or getTrending is not provided.",
                        "items": {
                            "type": "string"
                        }
                    },
                    "includeShorts": {
                        "title": "Include Shorts",
                        "type": "boolean",
                        "description": "When enabled, includes YouTube Shorts from channels. This triggers additional Shorts Query charges."
                    },
                    "includeLiveStreams": {
                        "title": "Include Live Streams",
                        "type": "boolean",
                        "description": "When enabled, includes YouTube Live Streams from channels. This triggers additional Live Streams Query charges."
                    },
                    "getTrending": {
                        "title": "Get trending videos",
                        "type": "boolean",
                        "description": "If enabled, retrieves currently trending YouTube videos. Triggers Trending Query charge."
                    },
                    "keywords": {
                        "title": "Search Keywords",
                        "type": "array",
                        "description": "Search keywords for YouTube search. Required if startUrls, youtubeHandles, or getTrending is not provided.",
                        "items": {
                            "type": "string"
                        }
                    },
                    "gl": {
                        "title": "Country",
                        "enum": [
                            "us",
                            "af",
                            "al",
                            "dz",
                            "as",
                            "ad",
                            "ao",
                            "ai",
                            "aq",
                            "ag",
                            "ar",
                            "am",
                            "aw",
                            "au",
                            "at",
                            "az",
                            "bs",
                            "bh",
                            "bd",
                            "bb",
                            "by",
                            "be",
                            "bz",
                            "bj",
                            "bm",
                            "bt",
                            "bo",
                            "ba",
                            "bw",
                            "bv",
                            "br",
                            "io",
                            "bn",
                            "bg",
                            "bf",
                            "bi",
                            "kh",
                            "cm",
                            "ca",
                            "cv",
                            "ky",
                            "cf",
                            "td",
                            "cl",
                            "cn",
                            "cx",
                            "cc",
                            "co",
                            "km",
                            "cg",
                            "cd",
                            "ck",
                            "cr",
                            "ci",
                            "hr",
                            "cu",
                            "cy",
                            "cz",
                            "dk",
                            "dj",
                            "dm",
                            "do",
                            "ec",
                            "eg",
                            "sv",
                            "gq",
                            "er",
                            "ee",
                            "et",
                            "fk",
                            "fo",
                            "fj",
                            "fi",
                            "fr",
                            "gf",
                            "pf",
                            "tf",
                            "ga",
                            "gm",
                            "ge",
                            "de",
                            "gh",
                            "gi",
                            "gr",
                            "gl",
                            "gd",
                            "gp",
                            "gu",
                            "gt",
                            "gn",
                            "gw",
                            "gy",
                            "ht",
                            "hm",
                            "va",
                            "hn",
                            "hk",
                            "hu",
                            "is",
                            "in",
                            "id",
                            "ir",
                            "iq",
                            "ie",
                            "il",
                            "it",
                            "jm",
                            "jp",
                            "jo",
                            "kz",
                            "ke",
                            "ki",
                            "kp",
                            "kr",
                            "kw",
                            "kg",
                            "la",
                            "lv",
                            "lb",
                            "ls",
                            "lr",
                            "ly",
                            "li",
                            "lt",
                            "lu",
                            "mo",
                            "mk",
                            "mg",
                            "mw",
                            "my",
                            "mv",
                            "ml",
                            "mt",
                            "mh",
                            "mq",
                            "mr",
                            "mu",
                            "yt",
                            "mx",
                            "fm",
                            "md",
                            "mc",
                            "mn",
                            "ms",
                            "ma",
                            "mz",
                            "mm",
                            "na",
                            "nr",
                            "np",
                            "nl",
                            "an",
                            "nc",
                            "nz",
                            "ni",
                            "ne",
                            "ng",
                            "nu",
                            "nf",
                            "mp",
                            "no",
                            "om",
                            "pk",
                            "pw",
                            "ps",
                            "pa",
                            "pg",
                            "py",
                            "pe",
                            "ph",
                            "pn",
                            "pl",
                            "pt",
                            "pr",
                            "qa",
                            "re",
                            "ro",
                            "ru",
                            "rw",
                            "sh",
                            "kn",
                            "lc",
                            "pm",
                            "vc",
                            "ws",
                            "sm",
                            "st",
                            "sa",
                            "sn",
                            "cs",
                            "sc",
                            "sl",
                            "sg",
                            "sk",
                            "si",
                            "sb",
                            "so",
                            "za",
                            "gs",
                            "es",
                            "lk",
                            "sd",
                            "sr",
                            "sj",
                            "sz",
                            "se",
                            "ch",
                            "sy",
                            "tw",
                            "tj",
                            "tz",
                            "th",
                            "tl",
                            "tg",
                            "tk",
                            "to",
                            "tt",
                            "tn",
                            "tr",
                            "tm",
                            "tc",
                            "tv",
                            "ug",
                            "ua",
                            "ae",
                            "gb",
                            "um",
                            "uy",
                            "uz",
                            "vu",
                            "ve",
                            "vn",
                            "vg",
                            "vi",
                            "wf",
                            "eh",
                            "ye",
                            "zm",
                            "zw"
                        ],
                        "type": "string",
                        "description": "Location for the search results, which is passed to YouTube as the gl URL query parameter. (US, AF, AL, etc...)",
                        "default": "us"
                    },
                    "hl": {
                        "title": "Language",
                        "enum": [
                            "en",
                            "af",
                            "ak",
                            "sq",
                            "ws",
                            "am",
                            "ar",
                            "hy",
                            "az",
                            "eu",
                            "be",
                            "bem",
                            "bn",
                            "bh",
                            "xx-bork",
                            "bs",
                            "br",
                            "bg",
                            "bt",
                            "km",
                            "ca",
                            "chr",
                            "ny",
                            "zh-cn",
                            "zh-tw",
                            "co",
                            "hr",
                            "cs",
                            "da",
                            "nl",
                            "xx-elmer",
                            "eo",
                            "et",
                            "ee",
                            "fo",
                            "tl",
                            "fi",
                            "fr",
                            "fy",
                            "gaa",
                            "gl",
                            "ka",
                            "de",
                            "el",
                            "kl",
                            "gn",
                            "gu",
                            "xx-hacker",
                            "ht",
                            "ha",
                            "haw",
                            "iw",
                            "hi",
                            "hu",
                            "is",
                            "ig",
                            "id",
                            "ia",
                            "ga",
                            "it",
                            "ja",
                            "jw",
                            "kn",
                            "kk",
                            "rw",
                            "rn",
                            "xx-klingon",
                            "kg",
                            "ko",
                            "kri",
                            "ku",
                            "ckb",
                            "ky",
                            "lo",
                            "la",
                            "lv",
                            "ln",
                            "lt",
                            "loz",
                            "lg",
                            "ach",
                            "mk",
                            "mg",
                            "my",
                            "ml",
                            "mt",
                            "mv",
                            "mi",
                            "mr",
                            "mfe",
                            "mo",
                            "mn",
                            "sr-me",
                            "ne",
                            "pcm",
                            "nso",
                            "no",
                            "nn",
                            "oc",
                            "or",
                            "om",
                            "ps",
                            "fa",
                            "xx-pirate",
                            "pl",
                            "pt",
                            "pt-br",
                            "pt-pt",
                            "pa",
                            "qu",
                            "ro",
                            "rm",
                            "nyn",
                            "ru",
                            "gd",
                            "sr",
                            "sh",
                            "st",
                            "tn",
                            "crs",
                            "sn",
                            "sd",
                            "si",
                            "sk",
                            "sl",
                            "so",
                            "es",
                            "es-419",
                            "su",
                            "sw",
                            "sv",
                            "tg",
                            "ta",
                            "tt",
                            "te",
                            "th",
                            "ti",
                            "to",
                            "lua",
                            "tum",
                            "tr",
                            "tk",
                            "tw",
                            "ug",
                            "uk",
                            "ur",
                            "uz",
                            "vu",
                            "vi",
                            "cy",
                            "wo",
                            "xh",
                            "yi",
                            "yo",
                            "zu"
                        ],
                        "type": "string",
                        "description": "Language for the search results, which is passed to YouTube as the hl URL query parameter. (af, tr, de, etc...)",
                        "default": "en"
                    },
                    "uploadDate": {
                        "title": "Upload date",
                        "enum": [
                            "all",
                            "l",
                            "t",
                            "w",
                            "m",
                            "y"
                        ],
                        "type": "string",
                        "description": "Upload date for the search results, which is passed to YouTube as the upload date URL query parameter. (any, hour, today, week, month, year)"
                    },
                    "duration": {
                        "title": "Video duration",
                        "enum": [
                            "all",
                            "s",
                            "l"
                        ],
                        "type": "string",
                        "description": "Duration of the video for the search results, which is passed to YouTube as the duration URL query parameter. (any, short, long)"
                    },
                    "features": {
                        "title": "Video features",
                        "enum": [
                            "all",
                            "h",
                            "hd",
                            "s",
                            "c",
                            "3d",
                            "3",
                            "li",
                            "lo",
                            "4"
                        ],
                        "type": "string",
                        "description": "Features for video. (any, 4k, hd, live, movie, cc, 3d, hdr, location, purchased, subtitles, vr180, vr360)"
                    },
                    "sort": {
                        "title": "Sort by",
                        "enum": [
                            "r",
                            "ra",
                            "u",
                            "v"
                        ],
                        "type": "string",
                        "description": "Sorts search results by the given option. Only works with search keywords."
                    },
                    "maxItems": {
                        "title": "Maximum number of items on output",
                        "type": "integer",
                        "description": "Maximum total videos to output across entire run."
                    },
                    "customMapFunction": {
                        "title": "Custom map function",
                        "type": "string",
                        "description": "JavaScript function to transform each output video. Use to add computed fields, modify values, or remove unnecessary data. NOT intended for filtering - filtering may result in automatic bans."
                    }
                }
            },
            "runsResponseSchema": {
                "type": "object",
                "properties": {
                    "data": {
                        "type": "object",
                        "properties": {
                            "id": {
                                "type": "string"
                            },
                            "actId": {
                                "type": "string"
                            },
                            "userId": {
                                "type": "string"
                            },
                            "startedAt": {
                                "type": "string",
                                "format": "date-time",
                                "example": "2025-01-08T00:00:00.000Z"
                            },
                            "finishedAt": {
                                "type": "string",
                                "format": "date-time",
                                "example": "2025-01-08T00:00:00.000Z"
                            },
                            "status": {
                                "type": "string",
                                "example": "READY"
                            },
                            "meta": {
                                "type": "object",
                                "properties": {
                                    "origin": {
                                        "type": "string",
                                        "example": "API"
                                    },
                                    "userAgent": {
                                        "type": "string"
                                    }
                                }
                            },
                            "stats": {
                                "type": "object",
                                "properties": {
                                    "inputBodyLen": {
                                        "type": "integer",
                                        "example": 2000
                                    },
                                    "rebootCount": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "restartCount": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "resurrectCount": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "computeUnits": {
                                        "type": "integer",
                                        "example": 0
                                    }
                                }
                            },
                            "options": {
                                "type": "object",
                                "properties": {
                                    "build": {
                                        "type": "string",
                                        "example": "latest"
                                    },
                                    "timeoutSecs": {
                                        "type": "integer",
                                        "example": 300
                                    },
                                    "memoryMbytes": {
                                        "type": "integer",
                                        "example": 1024
                                    },
                                    "diskMbytes": {
                                        "type": "integer",
                                        "example": 2048
                                    }
                                }
                            },
                            "buildId": {
                                "type": "string"
                            },
                            "defaultKeyValueStoreId": {
                                "type": "string"
                            },
                            "defaultDatasetId": {
                                "type": "string"
                            },
                            "defaultRequestQueueId": {
                                "type": "string"
                            },
                            "buildNumber": {
                                "type": "string",
                                "example": "1.0.0"
                            },
                            "containerUrl": {
                                "type": "string"
                            },
                            "usage": {
                                "type": "object",
                                "properties": {
                                    "ACTOR_COMPUTE_UNITS": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "DATASET_READS": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "DATASET_WRITES": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "KEY_VALUE_STORE_READS": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "KEY_VALUE_STORE_WRITES": {
                                        "type": "integer",
                                        "example": 1
                                    },
                                    "KEY_VALUE_STORE_LISTS": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "REQUEST_QUEUE_READS": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "REQUEST_QUEUE_WRITES": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "DATA_TRANSFER_INTERNAL_GBYTES": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "DATA_TRANSFER_EXTERNAL_GBYTES": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "PROXY_RESIDENTIAL_TRANSFER_GBYTES": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "PROXY_SERPS": {
                                        "type": "integer",
                                        "example": 0
                                    }
                                }
                            },
                            "usageTotalUsd": {
                                "type": "number",
                                "example": 0.00005
                            },
                            "usageUsd": {
                                "type": "object",
                                "properties": {
                                    "ACTOR_COMPUTE_UNITS": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "DATASET_READS": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "DATASET_WRITES": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "KEY_VALUE_STORE_READS": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "KEY_VALUE_STORE_WRITES": {
                                        "type": "number",
                                        "example": 0.00005
                                    },
                                    "KEY_VALUE_STORE_LISTS": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "REQUEST_QUEUE_READS": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "REQUEST_QUEUE_WRITES": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "DATA_TRANSFER_INTERNAL_GBYTES": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "DATA_TRANSFER_EXTERNAL_GBYTES": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "PROXY_RESIDENTIAL_TRANSFER_GBYTES": {
                                        "type": "integer",
                                        "example": 0
                                    },
                                    "PROXY_SERPS": {
                                        "type": "integer",
                                        "example": 0
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
```
