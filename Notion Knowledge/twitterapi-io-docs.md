# TwitterAPI.io - Complete API Documentation

> **Source:** https://docs.twitterapi.io  
> **Last Updated:** 2026-01-30  
> **Tag Line:** Twitter data, 96% cheaper. No auth, no limits, just API.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [User Endpoints](#user-endpoints)
4. [Tweet Endpoints](#tweet-endpoints)
5. [List Endpoints](#list-endpoints)
6. [Community Endpoints](#community-endpoints)
7. [Trend Endpoint](#trend-endpoint)
8. [Spaces Endpoint](#spaces-endpoint)
9. [My Endpoint](#my-endpoint)
10. [Post & Action Endpoints V2](#post--action-endpoints-v2)
11. [Community Action V2](#community-action-v2)
12. [Webhook/Websocket Filter Rules](#webhookwebsocket-filter-rules)
13. [Stream Endpoint](#stream-endpoint)
14. [Response Codes](#response-codes)
15. [Pricing](#pricing)

---

## Overview

| Property | Value |
|----------|-------|
| **Base URL** | `https://api.twitterapi.io` |
| **Stability** | 1M+ API calls proven |
| **Performance** | ~700ms avg response |
| **Rate Limit** | Up to 200 QPS |
| **Auth Method** | API key in header |

---

## Authentication

All requests require an API key in the header:

```
x-api-key: YOUR_API_KEY
```

### cURL Example
```bash
curl --location 'https://api.twitterapi.io/twitter/user/info?userName=elonmusk' \
--header 'x-api-key: YOUR_API_KEY'
```

### Python Example
```python
import requests

url = 'https://api.twitterapi.io/twitter/user/info'
headers = {'x-api-key': 'YOUR_API_KEY'}
params = {'userName': 'elonmusk'}

response = requests.get(url, headers=headers, params=params)
print(response.json())
```

---

# User Endpoints

## Batch Get User Info By UserIds

Get multiple users by their IDs.

```
GET /twitter/user/batch_info_by_ids
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userIds` | string | Yes | Comma-separated user IDs (max 100) |

**Pricing:** 18 credits/user (single), 10 credits/user (100+ batch)

---

## Get User Info

Get user profile by username.

```
GET /twitter/user/info
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userName` | string | Yes | Twitter handle (without @) |

### Response
```json
{
  "data": {
    "type": "user",
    "userName": "<string>",
    "id": "<string>",
    "name": "<string>",
    "isBlueVerified": true,
    "verifiedType": "<string>",
    "profilePicture": "<string>",
    "coverPicture": "<string>",
    "description": "<string>",
    "location": "<string>",
    "followers": 123456,
    "following": 1234,
    "createdAt": "<string>",
    "favouritesCount": 123,
    "mediaCount": 123,
    "statusesCount": 123,
    "pinnedTweetIds": ["<string>"],
    "profile_bio": {
      "description": "<string>",
      "entities": {}
    }
  }
}
```

---

## Get User Last Tweets

Get recent tweets from a user.

```
GET /twitter/user/last_tweets
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userName` | string | Yes | Twitter handle |
| `cursor` | string | No | Pagination cursor |
| `includeReplies` | boolean | No | Include replies (default: true) |

> **Note:** Returns up to 20 tweets per page, sorted by creation time. If you need real-time updates for 20+ accounts, use `/twitter-stream` instead for cost efficiency.

---

## Get User Followers

Get a user's followers.

```
GET /twitter/user/followers
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userName` | string | Yes | Twitter handle |
| `cursor` | string | No | Pagination cursor |

---

## Get User Followings

Get users that a user follows.

```
GET /twitter/user/followings
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userName` | string | Yes | Twitter handle |
| `cursor` | string | No | Pagination cursor |

---

## Get User Mentions

Get tweets mentioning a user.

```
GET /twitter/user/mentions
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userName` | string | Yes | Twitter handle |
| `cursor` | string | No | Pagination cursor |

---

## Check Follow Relationship

Check if user A follows user B (and vice versa).

```
GET /twitter/user/check_follow_relationship
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `source_user_name` | string | Yes | Screen name of source user |
| `target_user_name` | string | Yes | Screen name of target user |

### Response
```json
{
  "data": {
    "following": true,
    "followed_by": true
  },
  "status": "success",
  "message": "<string>"
}
```

**Pricing:** 100 credits per call

---

## Search User by Keyword

Search for users by keyword.

```
GET /twitter/user/search
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `keyword` | string | Yes | Search keyword |
| `cursor` | string | No | Pagination cursor |

### Response
```json
{
  "users": [
    {
      "type": "user",
      "userName": "<string>",
      "id": "<string>",
      "name": "<string>",
      "isBlueVerified": true,
      "profilePicture": "<string>",
      "description": "<string>",
      "followers": 123,
      "following": 123
    }
  ],
  "has_next_page": true,
  "next_cursor": "<string>"
}
```

---

## Get User Verified Followers

Get a user's verified followers only.

```
GET /twitter/user/verified_followers
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userName` | string | Yes | Twitter handle |
| `cursor` | string | No | Pagination cursor |

---

## Get User Profile About

Get detailed "About" information.

```
GET /twitter/user/about
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userName` | string | Yes | Twitter handle |

---

# Tweet Endpoints

## Get Tweets by IDs

Get tweet details by ID.

```
GET /twitter/tweet
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Tweet ID |

### Batch Get
```
GET /twitter/tweet/multi
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ids` | string | Yes | Comma-separated tweet IDs (max 100) |

**Pricing:** 15 credits/tweet (single), 10 credits/tweet (batch 100+)

---

## Get Tweet Replies

Get replies to a tweet.

```
GET /twitter/tweet/replies
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tweetId` | string | Yes | Tweet ID |
| `cursor` | string | No | Pagination cursor |
| `sinceTime` | number | No | Unix timestamp filter |
| `untilTime` | number | No | Unix timestamp filter |

---

## Get Tweet Replies V2

Enhanced reply fetching with sorting.

```
GET /twitter/tweet/replies_v2
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tweetId` | string | Yes | Tweet ID |
| `cursor` | string | No | Pagination cursor |
| `sortType` | string | No | `Recency` or `Relevance` |

---

## Get Tweet Quotations

Get quote tweets of a tweet.

```
GET /twitter/tweet/quotes
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tweetId` | string | Yes | Tweet ID |
| `cursor` | string | No | Pagination cursor |

Returns 20 quotes per page, ordered by quote time desc.

---

## Get Tweet Retweeters

Get users who retweeted a tweet.

```
GET /twitter/tweet/retweeters
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tweetId` | string | Yes | Tweet ID |
| `cursor` | string | No | Pagination cursor |

---

## Get Tweet Thread Context

Get full thread context of a tweet.

```
GET /twitter/tweet/thread
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tweetId` | string | Yes | Tweet ID |

---

## Get Article

Get Twitter article/note content.

```
GET /twitter/article
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `articleId` | string | Yes | Article ID |

---

## Advanced Search ⭐

Search tweets with advanced filters.

```
GET /twitter/tweet/advanced_search
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search query (see operators below) |
| `queryType` | string | No | `Latest` or `Top` |
| `cursor` | string | No | Pagination cursor |

### Query Operators

| Operator | Example | Description |
|----------|---------|-------------|
| `from:` | `from:elonmusk` | Tweets from user |
| `to:` | `to:elonmusk` | Tweets to user |
| `-filter:replies` | `from:user -filter:replies` | Exclude replies |
| `-filter:retweets` | `from:user -filter:retweets` | Exclude retweets |
| `since:` | `since:2024-01-01` | Tweets after date |
| `until:` | `until:2024-12-31` | Tweets before date |
| `min_faves:` | `min_faves:100` | Min likes |
| `min_retweets:` | `min_retweets:50` | Min retweets |

### Response Schema
```json
{
  "tweets": [
    {
      "type": "tweet",
      "id": "<string>",
      "url": "<string>",
      "text": "<string>",
      "source": "<string>",
      "retweetCount": 123,
      "replyCount": 123,
      "likeCount": 123,
      "quoteCount": 123,
      "viewCount": 123,
      "bookmarkCount": 123,
      "createdAt": "<string>",
      "lang": "<string>",
      "isReply": false,
      "author": {
        "type": "user",
        "userName": "<string>",
        "id": "<string>",
        "name": "<string>",
        "isBlueVerified": true,
        "profilePicture": "<string>",
        "followers": 123
      },
      "media": [
        {
          "type": "photo|video",
          "url": "<string>",
          "width": 1920,
          "height": 1080
        }
      ],
      "quotedTweet": {},
      "retweetedTweet": {}
    }
  ],
  "has_next_page": true,
  "next_cursor": "<string>"
}
```

---

# List Endpoints

## Get List Followers

Get followers of a Twitter list.

```
GET /twitter/list/followers
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `listId` | string | Yes | List ID |
| `cursor` | string | No | Pagination cursor |

---

## Get List Members

Get members of a Twitter list.

```
GET /twitter/list/members
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `listId` | string | Yes | List ID |
| `cursor` | string | No | Pagination cursor |

---

# Community Endpoints

## Get Community Info By Id

Get community details.

```
GET /twitter/community
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `communityId` | string | Yes | Community ID |

---

## Get Community Members

Get members of a community.

```
GET /twitter/community/members
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `communityId` | string | Yes | Community ID |
| `cursor` | string | No | Pagination cursor |

---

## Get Community Moderators

Get moderators of a community.

```
GET /twitter/community/moderators
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `communityId` | string | Yes | Community ID |
| `cursor` | string | No | Pagination cursor |

---

## Get Community Tweets

Get tweets from a community.

```
GET /twitter/community/tweets
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `communityId` | string | Yes | Community ID |
| `cursor` | string | No | Pagination cursor |

---

## Search Tweets From All Community

Search all community tweets.

```
GET /twitter/community/all_tweets
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `communityId` | string | Yes | Community ID |
| `cursor` | string | No | Pagination cursor |

---

# Trend Endpoint

## Get Trends

Get trending topics.

```
GET /twitter/trends
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `woeid` | number | No | Location ID (default: worldwide) |

---

# Spaces Endpoint

## Get Space Detail

Get Twitter Space details.

```
GET /twitter/space
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `spaceId` | string | Yes | Space ID |

---

# My Endpoint

## Get My Account Info

Get authenticated user's info (requires login cookies).

```
GET /twitter/user/me
```

---

# Post & Action Endpoints V2

> **Note:** All POST endpoints require `login_cookies` from `/twitter/user_login_v2`

## Log In

Authenticate and get login cookies.

```
POST /twitter/user_login_v2
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `username` | string | Yes | Twitter username |
| `password` | string | Yes | Twitter password |
| `totp_secret` | string | No | 2FA TOTP secret |
| `proxy` | string | No | Proxy to use |

---

## Create Tweet V2

Create a new tweet.

```
POST /twitter/create_tweet_v2
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `login_cookies` | string | Yes | From `/twitter/user_login_v2` |
| `tweet_text` | string | Yes | Tweet content |
| `proxy` | string | No | Proxy to use |
| `reply_to_tweet_id` | string | No | Tweet ID to reply to |
| `attachment_url` | string | No | URL to attach |
| `community_id` | string | No | Community to post in |
| `is_note_tweet` | boolean | No | Create as Note |
| `media_ids` | array | No | Array of media IDs |

### Response
```json
{
  "tweet_id": "<string>",
  "status": "<string>",
  "msg": "<string>"
}
```

**Pricing:** $0.003 per call

---

## Delete Tweet

Delete a tweet.

```
POST /twitter/delete_tweet
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `login_cookies` | string | Yes | From login |
| `tweet_id` | string | Yes | Tweet to delete |
| `proxy` | string | No | Proxy |

---

## Like Tweet

Like a tweet.

```
POST /twitter/like_tweet
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `auth_session` | string | Yes | Session from `/twitter/login_by_2fa` |
| `tweet_id` | string | Yes | Tweet to like |
| `proxy` | string | No | Proxy |

**Pricing:** $0.001 per call

---

## Unlike Tweet

Unlike a tweet.

```
POST /twitter/unlike_tweet
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `auth_session` | string | Yes | Session from login |
| `tweet_id` | string | Yes | Tweet to unlike |
| `proxy` | string | No | Proxy |

---

## Retweet Tweet

Retweet a tweet.

```
POST /twitter/retweet_tweet
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `login_cookies` | string | Yes | From login |
| `tweet_id` | string | Yes | Tweet to retweet |
| `proxy` | string | No | Proxy |

---

## Follow User

Follow a user.

```
POST /twitter/follow_user_v2
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `login_cookies` | string | Yes | From login |
| `user_id` | string | Yes | User ID to follow |
| `proxy` | string | No | Proxy |

**Pricing:** $0.002 per call

---

## Unfollow User

Unfollow a user.

```
POST /twitter/unfollow_user_v2
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `login_cookies` | string | Yes | From login |
| `user_id` | string | Yes | User ID to unfollow |
| `proxy` | string | No | Proxy |

---

## Send DM V2

Send a direct message.

```
POST /twitter/send_dm_to_user
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `login_cookies` | string | Yes | From login |
| `user_id` | string | Yes | Recipient user ID |
| `text` | string | Yes | Message text |
| `proxy` | string | No | Proxy |
| `media_ids` | array | No | Media to attach |
| `reply_to_message_id` | string | No | Reply to message |

### Response
```json
{
  "message_id": "<string>",
  "status": "<string>",
  "msg": "<string>"
}
```

**Pricing:** $0.003 per call

---

## Upload Media

Upload media for tweets/DMs.

```
POST /twitter/upload_media
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `login_cookies` | string | Yes | From login |
| `media_data` | string | Yes | Base64 encoded media |
| `media_type` | string | Yes | MIME type |
| `proxy` | string | No | Proxy |

---

## Update Avatar

Update profile picture.

```
PATCH /twitter/update_avatar
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `login_cookies` | string | Yes | From login |
| `image_data` | string | Yes | Base64 encoded image |
| `proxy` | string | No | Proxy |

---

## Update Banner

Update profile banner.

```
PATCH /twitter/update_banner
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `login_cookies` | string | Yes | From login |
| `image_data` | string | Yes | Base64 encoded image |
| `proxy` | string | No | Proxy |

---

## Update Profile

Update profile info.

```
PATCH /twitter/update_profile
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `login_cookies` | string | Yes | From login |
| `name` | string | No | Display name |
| `description` | string | No | Bio |
| `location` | string | No | Location |
| `url` | string | No | Website URL |
| `proxy` | string | No | Proxy |

---

# Community Action V2

## Create Community V2

Create a new community.

```
POST /twitter/create_community_v2
```

---

## Delete Community V2

Delete a community.

```
POST /twitter/delete_community_v2
```

---

## Join Community V2

Join a community.

```
POST /twitter/join_community_v2
```

---

## Leave Community V2

Leave a community.

```
POST /twitter/leave_community_v2
```

---

# Webhook/Websocket Filter Rules

## Add Webhook/Websocket Tweet Filter Rule

Add a filter rule for webhooks.

```
POST /twitter/webhook/add_rule
```

---

## Get ALL Webhook/Websocket Tweet Filter Rules

Get all configured filter rules.

```
GET /twitter/webhook/rules
```

---

## Update Webhook/Websocket Tweet Filter Rule

Update an existing filter rule.

```
POST /twitter/webhook/update_rule
```

---

## Delete Webhook/Websocket Tweet Filter Rule

Delete a filter rule.

```
DELETE /twitter/webhook/delete_rule
```

---

# Stream Endpoint

## Add a Twitter User to Monitor His Tweets

Add user to real-time monitoring.

```
POST /oapi/x_user_stream/add_user_to_monitor_tweet
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `x_user_name` | string | Yes | Twitter handle to monitor |

### Response
```json
{
  "status": "success",
  "msg": "<string>"
}
```

> **Note:** Monitor tweets from specified accounts, including direct tweets, quotes, replies, and retweets. See: https://twitterapi.io/twitter-stream

---

# Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad request / Invalid parameters |
| 401 | Unauthorized / Invalid API key |
| 429 | Rate limit exceeded |
| 500 | Server error |

---

# Pricing

## Data Retrieval
| Data Type | Cost per 1K |
|-----------|-------------|
| Tweets | $0.15 |
| User Profiles | $0.18 |
| Followers | $0.15 |
| Min charge | $0.00015/request |

## Actions
| Action | Cost |
|--------|------|
| Create Tweet | $0.003 |
| Send DM | $0.003 |
| Follow User | $0.002 |
| Like Tweet | $0.001 |
| Check Follow Relationship | 100 credits |

## Cost Calculator (72 Creators)

| Use Case | API Calls | Est. Cost |
|----------|-----------|-----------|
| 72 creators × 15 tweets | 72 | ~$0.16 |
| Get user profiles (batch) | 1 | ~$0.013 |
| Weekly refresh | ~150 | ~$0.35 |
| **Monthly total** | ~600 | **~$1.40** |

---

*Documentation compiled from docs.twitterapi.io - January 2026*
