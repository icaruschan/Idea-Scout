# Instagram Reel Scraper (`apify/instagram-reel-scraper`) Actor

Scrape or download Instagram reels. Just add Instagram profile or reel URL, and get caption, timestamp, transcript, hashtags, mentions, tagged users, comments, likes, shares, views, duration, and downloaded video. Export scraped data, schedule via API, and integrate with other tools or AI workflows.

- **URL**: https://apify.com/apify/instagram-reel-scraper.md
- **Developed by:** [Apify](https://apify.com/apify) (Apify)
- **Categories:** Social media, Videos
- **Stats:** 100,832 total users, 6,881 monthly users, 100.0% runs succeeded, 1,544 bookmarks
- **User rating**: 4.52 out of 5 stars

## Pricing

from $1.00 / 1,000 reels

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

> 🚀 **New features: download reels and scrape transcripts.** You can now export reels for offline use and extract reels transcripts to analyze content, trends, or creator messaging at scale. Try them out and let us know what you think in a [review](https://apify.com/apify/instagram-reel-scraper/reviews)!

### What can Instagram Reel Scraper do?

Instagram Reel Scraper **extracts data from public Instagram reels** beyond what the Instagram API provides. Add one or multiple Instagram usernames, profile URLs, or profile IDs, and you can:

🎥 Get **detailed stats for the latest reels**, including likes, shares, comments, views, plays, and timestamps

🧩 Extract **metadata about each reel**, such as captions, transcripts, product tags, pinned status, co-authors, music data, and 10 latest comments with details&metrics

🌐 Analyze **hashtags, mentions, and tagged users** to track trends or identify collaborations

👀 **Download reel media**, including videos and images

⬇️ Export reel data in **JSON, CSV, Excel, or XML**

🦾 Access the data programmatically via SDKs (Python & Node.js), API endpoints, and webhooks

🤳 Explore our other [social media scrapers](https://apify.com/store/categories/social-media-scrapers?search=instagram&managedBy=APIFY)

Add Instagram Reel Scraper to your short-form video performance toolkit to help you out with **influencer research, campaign tracking, competition monitoring, and content auditing.**

### What data can I scrape from Instagram Reels?

Instagram Reel Scraper can extract every key detail from a reel, including:

<table>
<tr>
<td>🎥 Reel ID</td>
<td>🔗 Reel URL</td>
<td>🧑‍🎤 Owner username</td>
<td>👤 Owner full name</td>
</tr>
<tr>
<td>❤️ Likes count</td>
<td>🔄 Shares count</td>
<td>💬 Comments count</td>
<td>👁️ Video views and play count</td>
</tr>
<tr>
<td>🏷️ Hashtags</td>
<td>📢 Mentions</td>
<td>👤 Tagged users</td>
<td>📎 Product type</td>
</tr>
<tr>
<td>✍️ Video transcript </td>
<td>🕒 Timestamp</td>
<td>📝 Caption</td> 
<td>💬 Latest comments (10) with replies, likes, and timestamps</td>
</tr>
<tr>
<td>📽️ Downloaded video URL and original video URL</td>
<td>⏱️ Video duration (seconds)</td>
<td>🎶 Music info (artist, song, original audio)</td>
<td>🖼️ Images (thumbnails or sidecar frames)</td>
</tr>
<tr>
<td>📌 Is sponsored?</td>
<td>❌ Are comments disabled?</td>
<td>👥 Co-author producers</td>
<td>📊 Media dimensions (height & width)</td>
</tr>
</table>

**Example:** For a NASA Reel from September 2025, Instagram Reel Scraper extracted:

- Reel caption, mentions, and URL
- 161k likes, 2.2k comments, 1.1M views
- Video duration (98 seconds), video URL, and downloaded video URL
- Display images (thumbnails), transcript, and tagged users
- Music information, including original audio
- Latest comments with timestamps, likes, and any replies

> Tip: For **popular reels discovery and reels research** (rather than targeted reels scraping), use the `scrape reels` option in the 🔗 [Instagram Hashtag Scraper](https://apify.com/apify/instagram-hashtag-scraper). You’ll find Reels related to your chosen hashtag, along with their details and authors.

### How to scrape Instagram Reels?

1. [Create](https://console.apify.com/) a free Apify account.
2. Open [Instagram Reel Scraper](https://apify.com/apify/instagram-reel-scraper).
3. Add **one or multiple Instagram usernames, profile URLs, or profile IDs or reel URLs**.
4. Click **"Save & Start"** and wait for the datasets to be generated.
5. Download your data in **JSON, CSV, Excel, or XML**, or access it via API.

If you want more guidance on how to use Instagram Reel Scraper, here's a tutorial on [How to scrape reels](https://blog.apify.com/scrape-instagram-reels/) and a full video that shadows it:

https://www.youtube.com/watch?v=qQDtmXC1Ijw

> If you would like to scrape not only reels data but also all their comments — go for our 🔗 [Instagram Comments Scraper](https://apify.com/apify/instagram-comment-scraper).

### How much will scraping Instagram Reels cost?

Instagram Reel Scraper uses a **pay-per-result (PPR)** model. On the Free plan, it costs $2.60 per 1,000 results ($0.0026 per result), giving **nearly 2,000 results for free with the $5 credit**.

Paid plans offer discounted rates and more monthly credit. For example, the Starter plan charges $2.30 per 1,000 results, which allows for **over 12,600 results per month**. Check the [pricing tab](https://apify.com/apify/instagram-reel-scraper/pricing) for full details.

### ⬇️ Input

Enter either a **profile URL, Instagram username, or profile ID**. Alternatively, you can start with reel URLs themselves. You can input URLs individually or in bulk using the **Bulk edit** function.
<a href="https://console.apify.com/actors/dSCLg0C3YEZ83HzYX/">
<img src="https://raw.githubusercontent.com/apify-projects/actor-readme-images/refs/heads/master/Instagram%20reels%20data%20input.png" alt="Instagram Reel API input" style="width:70%;"> </a>

### ⬆️ Output

The results appear in a dataset in the **Storage** tab. You can view them as a table, download in **JSON, CSV, Excel, or XML**, or use API endpoints.

<a href="https://console.apify.com/actors/dSCLg0C3YEZ83HzYX/">
<img src="https://raw.githubusercontent.com/apify-projects/actor-readme-images/7c8e0167e680302eadb5e5237fe45cfbaa53a03f/Screenshot 2025-10-17 at 18.22.26.png" alt="Instagram Reel Scraper input" style="width:100%;"> </a>

Besides the table view, you can also view your data as JSON, as well as download it as CSV, XML, Excel file, or through an API. Here’s an abridged version of the output for NASA’s profile.

#### 🎥 Extracted Instagram Reel data sample

```json
[
    {
        "id": "3350638485823625271",
        "type": "Video",
        "shortCode": "C5_2_NORRg3",
        "caption": "How many lakes did you recognize? Also, sorry for disappearing. I melted into a puddle after finishing this 🫠 #spookylake #spookylakemonth #booktok #writingabook #illustrating #gouache",
        "hashtags": ["spookylake", "spookylakemonth", "booktok", "writingabook", "illustrating", "gouache"],
        "mentions": [],
        "url": "https://www.instagram.com/p/C5_2_NORRg3/",
        "commentsCount": 1444,
        "dimensionsHeight": 1920,
        "dimensionsWidth": 1080,
        "downloadedVideo": "https://api.apify.com/v2/key-value-stores/fk2M6aWXeLVhFVgjb/records/DQe66uuEask_Videobygeodesaurus",
        "images": [
            "https://scontent-iad3-2.cdninstagram.com/v/t51.2885-15/503582861_1747875799135896_8982400632385527085_n.jpg?stp=dst-jpg_e35_p828x828_sh0.08_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkNMSVBTLmltYWdlX3VybGdlbi4xMTcweDIwODAuc2RyLmY3MTg3OC5kZWZhdWx0X2NvdmVyX2ZyYW1lLmMyIn0&_nc_ht=scontent-iad3-2.cdninstagram.com&_nc_cat=100&_nc_oc=Q6cZ2QFOg52ehR1GL2d8R8F-nHX3zZuldu1vphPDzp_Ei2M1dTmqp1yN-nkqm2FatwRXfRs&_nc_ohc=yhbg707U3qoQ7kNvwGHLPpJ&_nc_gid=PrP0UBGPsac2AFkT9rkIYg&edm=ACHbZRIBAAAA&ccb=7-5&ig_cache_key=MzM1MDYzODQ4NTgyMzYyNTI3MQ%3D%3D.3-ccb7-5&oh=00_AfdmXtFfgTd12ZS_HDPXHIzmEkkk4qeKxyk_fqgiXyTx8g&oe=68F85BB1&_nc_sid=c024bc",
            "https://scontent-iad3-2.cdninstagram.com/v/t51.2885-15/503582861_1747875799135896_8982400632385527085_n.jpg?stp=dst-jpg_e15_p320x320_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkNMSVBTLmltYWdlX3VybGdlbi4xMTcweDIwODAuc2RyLmY3MTg3OC5kZWZhdWx0X2NvdmVyX2ZyYW1lLmMyIn0&_nc_ht=scontent-iad3-2.cdninstagram.com&_nc_cat=100&_nc_oc=Q6cZ2QFOg52ehR1GL2d8R8F-nHX3zZuldu1vphPDzp_Ei2M1dTmqp1yN-nkqm2FatwRXfRs&_nc_ohc=yhbg707U3qoQ7kNvwGHLPpJ&_nc_gid=PrP0UBGPsac2AFkT9rkIYg&edm=ACHbZRIBAAAA&ccb=7-5&ig_cache_key=MzM1MDYzODQ4NTgyMzYyNTI3MQ%3D%3D.3-ccb7-5&oh=00_Afcy-7OyPvlWaLU5zL6Jr53x56ItJ6mC7GXx3Hfu01E-fQ&oe=68F85BB1&_nc_sid=c024bc"
        ],
        "videoUrl": "https://scontent-atl3-3.cdninstagram.com/o1/v/t16/f2/m82/AQMulaqFDhfyocJD8c2sQVNyyPS6X9GDmpyjFY4MQq2qXsmxSw8EJtHYPyWDzUf1rkis9ziMt8Xgjg7M9-kqY-2ucKLwvYw3e7eqnF8.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2xpcHMuYzIuNzIwLmJhc2VsaW5lIn0&_nc_cat=109&vs=421520660597168_221266948&_nc_vs=HBksFQIYT2lnX3hwdl9yZWVsc19wZXJtYW5lbnRfcHJvZC85ODQ5OEE2RUNFOENGNDVDMzQ4MDM1RDU5MUIyOTRBNl92aWRlb19kYXNoaW5pdC5tcDQVAALIARIAFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HRXl1dmhqLUxzNy1zNFFEQUQzWjN6d0VBbDg1YnFfRUFBQUYVAgLIARIAKAAYABsAFQAAJpyX3Kqmz6RAFQIoAkMzLBdAVoC0OVgQYhgSZGFzaF9iYXNlbGluZV8xX3YxEQB1%2Fgdl5p0BAA%3D%3D&_nc_rid=5ed0db973e&ccb=9-4&oh=00_Afew9VDsnn8XDiw8-N7glQ4w_ZeuwuRiuV5qHIQwHYyW6Q&oe=68F4667A&_nc_sid=10d13b",
        "transcript": "Um yes, hello. It's not spooky lake month anymore, but for the last year and a half I've been writing and illustrating a spooky lake book. I have never written or illustrated a book before, so the process was intimidating to say the least. Especially at the beginning because I found writing the book much harder, and I fretted and procrastinated and succumbed to my imposter syndrome as an artist trying to write a science and history book. Even after I got over the hurdle of writing the text, then every next step of the process was new to me, and I just didn't conceptualize how much time each next step would take. As a result, I got behind on the deadline, and come October 1st last year, I had only around 10 out of the 150 paintings done. So when spooky lake month ended, I began my grueling journey of painting every day all day for the next four months. While this sounds like a bad thing, and it was stressful, I've never worked so consistently in my life. There was no way that I was able to procrastinate during this time because I knew that if I didn't finish each painting in the allotted time that I set aside for it, I wasn't going to finish the book in time. Even though I have a degree in art, I think I would have been bogged down by doubt at this point if it wasn't for that looming deadline. One of the weirdest parts of the book was that I painted the front cover first and the back cover last. And finally, on February 15th, after 1800 hours of painting, my mom helped me pack everything up to ship it to the publisher. I can't wait for you to see it in September, conveniently right before a new spooky lake month begins.",
        "likesCount": 32905,
        "sharesCount": 2028,
        "timestamp": "2024-04-20T21:09:52.000Z",
        "ownerFullName": "Geo Rutherford",
        "ownerUsername": "geodesaurus",
        "ownerId": "407580734",
        "productType": "clips",
        "videoDuration": 90.011,
        "inputUrl": "https://www.instagram.com/geodesaurus/",
        "firstComment": "Rad!",
        "latestComments": [
            {
                "id": "17983161272870036",
                "text": "Rad!",
                "ownerUsername": "juliamariemadness",
                "ownerProfilePicUrl": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-19/65631387_423243471599785_35801816587304960_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=101&_nc_oc=Q6cZ2QEMpiiW-g13sCVEInc7t9Q6uzlBCA4f02TnXMB2rnJolwfTnuQKYJG51oYCH8wBL4w&_nc_ohc=APBilyfQsPkQ7kNvwET5wGr&_nc_gid=wXYnWhg5btp8NV3GYsJ7cw&edm=APs17CUBAAAA&ccb=7-5&oh=00_Afdllgmwjmi1JDxtrCI9FcMSYt_Z94O5FSFcuI-mBOijzQ&oe=68F85D78&_nc_sid=10d13b",
                "timestamp": "2025-10-17T13:37:10.000Z",
                "repliesCount": 0,
                "replies": [],
                "likesCount": 0,
                "owner": {
                    "id": "2057814100",
                    "is_verified": false,
                    "profile_pic_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-19/65631387_423243471599785_35801816587304960_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=101&_nc_oc=Q6cZ2QEMpiiW-g13sCVEInc7t9Q6uzlBCA4f02TnXMB2rnJolwfTnuQKYJG51oYCH8wBL4w&_nc_ohc=APBilyfQsPkQ7kNvwET5wGr&_nc_gid=wXYnWhg5btp8NV3GYsJ7cw&edm=APs17CUBAAAA&ccb=7-5&oh=00_Afdllgmwjmi1JDxtrCI9FcMSYt_Z94O5FSFcuI-mBOijzQ&oe=68F85D78&_nc_sid=10d13b",
                    "username": "juliamariemadness"
                }
            },
            {
                "id": "18077378351470366",
                "text": "Wait. I saw this at the store today! 😮",
                "ownerUsername": "tera_montoya_",
                "ownerProfilePicUrl": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-19/420982792_1792938077801161_8224545790436863627_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby45MTQuYzIifQ&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=101&_nc_oc=Q6cZ2QEMpiiW-g13sCVEInc7t9Q6uzlBCA4f02TnXMB2rnJolwfTnuQKYJG51oYCH8wBL4w&_nc_ohc=YD9Vo869ViwQ7kNvwGrart8&_nc_gid=wXYnWhg5btp8NV3GYsJ7cw&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfcOVeIFW8wGlMxdK3J67qNdFQwI-BHttyTQVetXgVD2KQ&oe=68F8638F&_nc_sid=10d13b",
                "timestamp": "2025-10-17T04:49:19.000Z",
                "repliesCount": 0,
                "replies": [],
                "likesCount": 1,
                "owner": {
                    "id": "64422110718",
                    "is_verified": false,
                    "profile_pic_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-19/420982792_1792938077801161_8224545790436863627_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby45MTQuYzIifQ&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=101&_nc_oc=Q6cZ2QEMpiiW-g13sCVEInc7t9Q6uzlBCA4f02TnXMB2rnJolwfTnuQKYJG51oYCH8wBL4w&_nc_ohc=YD9Vo869ViwQ7kNvwGrart8&_nc_gid=wXYnWhg5btp8NV3GYsJ7cw&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfcOVeIFW8wGlMxdK3J67qNdFQwI-BHttyTQVetXgVD2KQ&oe=68F8638F&_nc_sid=10d13b",
                    "username": "tera_montoya_"
                }
            },
            {
                "id": "18079755953024513",
                "text": "Love your book! Got it last year and the kids love looking for ghosts and the content is interesting and fun for all of us!",
                "ownerUsername": "jraejames",
                "ownerProfilePicUrl": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/11887207_875265575884248_1062749208_a.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4yMDAuYzIifQ&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=100&_nc_oc=Q6cZ2QEMpiiW-g13sCVEInc7t9Q6uzlBCA4f02TnXMB2rnJolwfTnuQKYJG51oYCH8wBL4w&_nc_ohc=ZBsW0roJDp0Q7kNvwG0jV-k&_nc_gid=wXYnWhg5btp8NV3GYsJ7cw&edm=APs17CUBAAAA&ccb=7-5&oh=00_AffMl80OLonql7OJKfXiTzoZH0nvKZonWgEXeGue4nq-MA&oe=68F873C0&_nc_sid=10d13b",
                "timestamp": "2025-10-17T01:37:20.000Z",
                "repliesCount": 0,
                "replies": [],
                "likesCount": 1,
                "owner": {
                    "id": "199946534",
                    "is_verified": false,
                    "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/11887207_875265575884248_1062749208_a.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4yMDAuYzIifQ&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=100&_nc_oc=Q6cZ2QEMpiiW-g13sCVEInc7t9Q6uzlBCA4f02TnXMB2rnJolwfTnuQKYJG51oYCH8wBL4w&_nc_ohc=ZBsW0roJDp0Q7kNvwG0jV-k&_nc_gid=wXYnWhg5btp8NV3GYsJ7cw&edm=APs17CUBAAAA&ccb=7-5&oh=00_AffMl80OLonql7OJKfXiTzoZH0nvKZonWgEXeGue4nq-MA&oe=68F873C0&_nc_sid=10d13b",
                    "username": "jraejames"
                }
            },
            {
                "id": "18095024380695871",
                "text": "Just saw my first video by you about 15 minutes ago and learning about the paint type you did and the effort in this I bought a calendar and the book. Dope stuff, the spooky lake videos are awesome and a nice pairing to each page",
                "ownerUsername": "robert.spil",
                "ownerProfilePicUrl": "https://scontent-atl3-3.cdninstagram.com/v/t51.2885-19/12104969_849454198503751_159701131_a.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby43NDcuYzIifQ&_nc_ht=scontent-atl3-3.cdninstagram.com&_nc_cat=107&_nc_oc=Q6cZ2QEMpiiW-g13sCVEInc7t9Q6uzlBCA4f02TnXMB2rnJolwfTnuQKYJG51oYCH8wBL4w&_nc_ohc=u4EXqDj3M_UQ7kNvwE1Y-RD&_nc_gid=wXYnWhg5btp8NV3GYsJ7cw&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfeBdTPdJRuvxQs5jTzv0U7hCB3ULbCkRlHMql5tDIXMQQ&oe=68F856DA&_nc_sid=10d13b",
                "timestamp": "2025-10-16T16:08:38.000Z",
                "repliesCount": 0,
                "replies": [],
                "likesCount": 3,
                "owner": {
                    "id": "1694669410",
                    "is_verified": false,
                    "profile_pic_url": "https://scontent-atl3-3.cdninstagram.com/v/t51.2885-19/12104969_849454198503751_159701131_a.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby43NDcuYzIifQ&_nc_ht=scontent-atl3-3.cdninstagram.com&_nc_cat=107&_nc_oc=Q6cZ2QEMpiiW-g13sCVEInc7t9Q6uzlBCA4f02TnXMB2rnJolwfTnuQKYJG51oYCH8wBL4w&_nc_ohc=u4EXqDj3M_UQ7kNvwE1Y-RD&_nc_gid=wXYnWhg5btp8NV3GYsJ7cw&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfeBdTPdJRuvxQs5jTzv0U7hCB3ULbCkRlHMql5tDIXMQQ&oe=68F856DA&_nc_sid=10d13b",
                    "username": "robert.spil"
                }
            },
            {
                "id": "18187570693332737",
                "text": "What kind of paper did you use??",
                "ownerUsername": "emmablank",
                "ownerProfilePicUrl": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/498923162_18505318189044474_8211560090135163373_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=106&_nc_oc=Q6cZ2QEMpiiW-g13sCVEInc7t9Q6uzlBCA4f02TnXMB2rnJolwfTnuQKYJG51oYCH8wBL4w&_nc_ohc=Vby58deh2O8Q7kNvwHiayDq&_nc_gid=wXYnWhg5btp8NV3GYsJ7cw&edm=APs17CUBAAAA&ccb=7-5&oh=00_Aff5JXBIvcy1FVmYDAKyxIphZsQfH44B_tW2QeZe1vScfQ&oe=68F851CF&_nc_sid=10d13b",
                "timestamp": "2025-10-15T15:15:51.000Z",
                "repliesCount": 0,
                "replies": [],
                "likesCount": 0,
                "owner": {
                    "id": "10860473",
                    "is_verified": false,
                    "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/498923162_18505318189044474_8211560090135163373_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=106&_nc_oc=Q6cZ2QEMpiiW-g13sCVEInc7t9Q6uzlBCA4f02TnXMB2rnJolwfTnuQKYJG51oYCH8wBL4w&_nc_ohc=Vby58deh2O8Q7kNvwHiayDq&_nc_gid=wXYnWhg5btp8NV3GYsJ7cw&edm=APs17CUBAAAA&ccb=7-5&oh=00_Aff5JXBIvcy1FVmYDAKyxIphZsQfH44B_tW2QeZe1vScfQ&oe=68F851CF&_nc_sid=10d13b",
                    "username": "emmablank"
                }
            },
            {
                "id": "17985759362863395",
                "text": "Just ordered 2 of your books! 1 for me and 1 for my sister who would love this",
                "ownerUsername": "trash.norris",
                "ownerProfilePicUrl": "https://scontent-atl3-3.cdninstagram.com/v/t51.2885-19/190854325_158831169539311_3540378345715348562_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-atl3-3.cdninstagram.com&_nc_cat=107&_nc_oc=Q6cZ2QEMpiiW-g13sCVEInc7t9Q6uzlBCA4f02TnXMB2rnJolwfTnuQKYJG51oYCH8wBL4w&_nc_ohc=XCtgh8AzpNMQ7kNvwF6mPp5&_nc_gid=wXYnWhg5btp8NV3GYsJ7cw&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfcBLtdF3NPIxUY7pED8XnSk_hA0Zc_TMLJ5FidW7vOgHw&oe=68F85433&_nc_sid=10d13b",
                "timestamp": "2025-10-15T07:27:27.000Z",
                "repliesCount": 0,
                "replies": [],
                "likesCount": 0,
                "owner": {
                    "id": "2126209675",
                    "is_verified": false,
                    "profile_pic_url": "https://scontent-atl3-3.cdninstagram.com/v/t51.2885-19/190854325_158831169539311_3540378345715348562_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-atl3-3.cdninstagram.com&_nc_cat=107&_nc_oc=Q6cZ2QEMpiiW-g13sCVEInc7t9Q6uzlBCA4f02TnXMB2rnJolwfTnuQKYJG51oYCH8wBL4w&_nc_ohc=XCtgh8AzpNMQ7kNvwF6mPp5&_nc_gid=wXYnWhg5btp8NV3GYsJ7cw&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfcBLtdF3NPIxUY7pED8XnSk_hA0Zc_TMLJ5FidW7vOgHw&oe=68F85433&_nc_sid=10d13b",
                    "username": "trash.norris"
                }
            },
            {
                "id": "17951539752011186",
                "text": "Fantastic art and be proud of this, as an artist deadlines and imposter syndrome are my 2 worse enemies, i literally gave up doing commission almost entirely (I currently will only do them for close friends and some family, with no deadline set, and mostly just for fun/free even then) because i am beyond hopeless with deadlines and it feels nice to gift unique presents to the people who matter to me so they dont pay unless its huge and/or extremely time consuming OR they offer to pay for it and it's not their bday or Xmas, you should be proud of what you have achieved, I cant wait to see what you might make in future, even a series of prints on scrolls or tapestries of some kind, keep up the great work spooky lake queen",
                "ownerUsername": "_emobabyspice_",
                "ownerProfilePicUrl": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-19/497874803_17994205271796113_5587591476848587335_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_oc=Q6cZ2QEMpiiW-g13sCVEInc7t9Q6uzlBCA4f02TnXMB2rnJolwfTnuQKYJG51oYCH8wBL4w&_nc_ohc=li3I4FEMDcgQ7kNvwGh_ZiG&_nc_gid=wXYnWhg5btp8NV3GYsJ7cw&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfeiBhZVUQR5-DYg_AgfsCOqnlR_P_Pq2BrQbXL73qfORA&oe=68F885C4&_nc_sid=10d13b",
                "timestamp": "2025-10-15T00:00:31.000Z",
                "repliesCount": 0,
                "replies": [],
                "likesCount": 3,
                "owner": {
                    "id": "53864324112",
                    "is_verified": false,
                    "profile_pic_url": "https://scontent-atl3-2.cdninstagram.com/v/t51.2885-19/497874803_17994205271796113_5587591476848587335_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-atl3-2.cdninstagram.com&_nc_cat=105&_nc_oc=Q6cZ2QEMpiiW-g13sCVEInc7t9Q6uzlBCA4f02TnXMB2rnJolwfTnuQKYJG51oYCH8wBL4w&_nc_ohc=li3I4FEMDcgQ7kNvwGh_ZiG&_nc_gid=wXYnWhg5btp8NV3GYsJ7cw&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfeiBhZVUQR5-DYg_AgfsCOqnlR_P_Pq2BrQbXL73qfORA&oe=68F885C4&_nc_sid=10d13b",
                    "username": "_emobabyspice_"
                }
            },
            {
                "id": "18116617972522616",
                "text": "I just got my copy! It's so fun and interesting. Amazing job❤️🙌",
                "ownerUsername": "candycanes1414",
                "ownerProfilePicUrl": "https://scontent-atl3-3.cdninstagram.com/v/t51.2885-19/492152174_18500959009039822_5718899618904483229_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-atl3-3.cdninstagram.com&_nc_cat=110&_nc_oc=Q6cZ2QEMpiiW-g13sCVEInc7t9Q6uzlBCA4f02TnXMB2rnJolwfTnuQKYJG51oYCH8wBL4w&_nc_ohc=lhOQ0ybDhWkQ7kNvwEumSXJ&_nc_gid=wXYnWhg5btp8NV3GYsJ7cw&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfdLFz4_JynwqeSRhp1nXytpa8W5UYy-brbwc2RTVItVrA&oe=68F87D0D&_nc_sid=10d13b",
                "timestamp": "2025-10-13T15:09:56.000Z",
                "repliesCount": 0,
                "replies": [],
                "likesCount": 5,
                "owner": {
                    "id": "1918759821",
                    "is_verified": false,
                    "profile_pic_url": "https://scontent-atl3-3.cdninstagram.com/v/t51.2885-19/492152174_18500959009039822_5718899618904483229_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-atl3-3.cdninstagram.com&_nc_cat=110&_nc_oc=Q6cZ2QEMpiiW-g13sCVEInc7t9Q6uzlBCA4f02TnXMB2rnJolwfTnuQKYJG51oYCH8wBL4w&_nc_ohc=lhOQ0ybDhWkQ7kNvwEumSXJ&_nc_gid=wXYnWhg5btp8NV3GYsJ7cw&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfdLFz4_JynwqeSRhp1nXytpa8W5UYy-brbwc2RTVItVrA&oe=68F87D0D&_nc_sid=10d13b",
                    "username": "candycanes1414"
                }
            },
            {
                "id": "18087535951729072",
                "text": "😘😗😗😗😗😉😚😚😚😚😉😚😚😗🤷‍♀️😗🤷‍♀️🤷‍♀️😗😗🤷‍♀️7f7,,Z😮Zzz😮",
                "ownerUsername": "jennifurcoat",
                "ownerProfilePicUrl": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/491443263_651030937824171_967711112607006177_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=103&_nc_oc=Q6cZ2QEMpiiW-g13sCVEInc7t9Q6uzlBCA4f02TnXMB2rnJolwfTnuQKYJG51oYCH8wBL4w&_nc_ohc=5O1BnpJZ4AgQ7kNvwGV4HdZ&_nc_gid=wXYnWhg5btp8NV3GYsJ7cw&edm=APs17CUBAAAA&ccb=7-5&oh=00_Afc2Ul-2mznhmJKPT7JLXQp5cU21fstDPQhm1m8K0C4RpQ&oe=68F86C45&_nc_sid=10d13b",
                "timestamp": "2025-10-13T07:13:47.000Z",
                "repliesCount": 0,
                "replies": [],
                "likesCount": 0,
                "owner": {
                    "id": "35243128",
                    "is_verified": false,
                    "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/491443263_651030937824171_967711112607006177_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=103&_nc_oc=Q6cZ2QEMpiiW-g13sCVEInc7t9Q6uzlBCA4f02TnXMB2rnJolwfTnuQKYJG51oYCH8wBL4w&_nc_ohc=5O1BnpJZ4AgQ7kNvwGV4HdZ&_nc_gid=wXYnWhg5btp8NV3GYsJ7cw&edm=APs17CUBAAAA&ccb=7-5&oh=00_Afc2Ul-2mznhmJKPT7JLXQp5cU21fstDPQhm1m8K0C4RpQ&oe=68F86C45&_nc_sid=10d13b",
                    "username": "jennifurcoat"
                }
            },
            {
                "id": "18074933599912028",
                "text": "O",
                "ownerUsername": "jennifurcoat",
                "ownerProfilePicUrl": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/491443263_651030937824171_967711112607006177_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=103&_nc_oc=Q6cZ2QEMpiiW-g13sCVEInc7t9Q6uzlBCA4f02TnXMB2rnJolwfTnuQKYJG51oYCH8wBL4w&_nc_ohc=5O1BnpJZ4AgQ7kNvwGV4HdZ&_nc_gid=wXYnWhg5btp8NV3GYsJ7cw&edm=APs17CUBAAAA&ccb=7-5&oh=00_Afc2Ul-2mznhmJKPT7JLXQp5cU21fstDPQhm1m8K0C4RpQ&oe=68F86C45&_nc_sid=10d13b",
                "timestamp": "2025-10-13T07:13:12.000Z",
                "repliesCount": 0,
                "replies": [],
                "likesCount": 0,
                "owner": {
                    "id": "35243128",
                    "is_verified": false,
                    "profile_pic_url": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-19/491443263_651030937824171_967711112607006177_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=103&_nc_oc=Q6cZ2QEMpiiW-g13sCVEInc7t9Q6uzlBCA4f02TnXMB2rnJolwfTnuQKYJG51oYCH8wBL4w&_nc_ohc=5O1BnpJZ4AgQ7kNvwGV4HdZ&_nc_gid=wXYnWhg5btp8NV3GYsJ7cw&edm=APs17CUBAAAA&ccb=7-5&oh=00_Afc2Ul-2mznhmJKPT7JLXQp5cU21fstDPQhm1m8K0C4RpQ&oe=68F86C45&_nc_sid=10d13b",
                    "username": "jennifurcoat"
                }
            }
        ],
        "displayUrl": "https://scontent-atl3-1.cdninstagram.com/v/t51.2885-15/503582861_1747875799135896_8982400632385527085_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=scontent-atl3-1.cdninstagram.com&_nc_cat=100&_nc_oc=Q6cZ2QEMpiiW-g13sCVEInc7t9Q6uzlBCA4f02TnXMB2rnJolwfTnuQKYJG51oYCH8wBL4w&_nc_ohc=yhbg707U3qoQ7kNvwGa0Q7J&_nc_gid=wXYnWhg5btp8NV3GYsJ7cw&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfemqIWtZ4wo-v0O72CkGjmGQK3kUPZewAftzfahSJNoIQ&oe=68F85BB1&_nc_sid=10d13b",
        "alt": null,
        "videoViewCount": 196508,
        "videoPlayCount": 521136,
        "childPosts": [],
        "musicInfo": {
            "artist_name": "geodesaurus",
            "song_name": "Original audio",
            "uses_original_audio": true,
            "should_mute_audio": false,
            "should_mute_audio_reason": "",
            "audio_id": "395558153367106"
        },
        "isCommentsDisabled": false
    },
    {
        "id": "3745229100865552738",
        "type": "Video",
        "shortCode": "DP5ugYvjAFi",
        "caption": "Зустрівся з керівниками американських енергетичних компаній. Зараз виклик очевидний: Україні потрібно більше сили, і можемо забезпечити її разом. Обговорили нагальні потреби цього часу, і це дуже конкретні речі, щоб підтримати нашу енергосистему, а також довгострокову співпрацю. Є конкретні проєкти, які можуть дати більше можливостей обом нашим країнам. Дякую!\n\n——\n\nI met with executives of American energy companies. The challenge is clear – Ukraine needs more strength, and we can achieve this together. We discussed the urgent needs of the moment – very concrete measures to support our energy system, as well as long-term cooperation. There are specific projects that could create more opportunities for both our countries. Thank you!",
        "hashtags": [],
        "mentions": [],
        "url": "https://www.instagram.com/p/DP5ugYvjAFi/",
        "commentsCount": 534,
        "dimensionsHeight": 1920,
        "dimensionsWidth": 1080,
        "downloadedVideo": "https://api.apify.com/v2/key-value-stores/OydPAzeKI1aUUVdva/records/DTHvCkVDDbI_Videobyzelenskyy_official.mp4",
        "images": [
            "https://instagram.fcha1-1.fna.fbcdn.net/v/t51.2885-15/566616429_18374725024154970_4972917005564934761_n.jpg?stp=dst-jpg_e35_p828x828_sh0.08_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkNMSVBTLmltYWdlX3VybGdlbi4xMTM0eDIwMTYuc2RyLmY4Mjc4Ny5kZWZhdWx0X2NvdmVyX2ZyYW1lLmMyIn0&_nc_ht=instagram.fcha1-1.fna.fbcdn.net&_nc_cat=106&_nc_oc=Q6cZ2QFX-O7oU0bnbjJD7fQDTapxG3BNVtE-W7_gtnCrZXBOBH1vimK1DPqHOxR1QDQsF4M&_nc_ohc=pBsF-NoD8VYQ7kNvwEQqNq7&_nc_gid=5sFmted_niX-y0SefNf4Vg&edm=ACHbZRIBAAAA&ccb=7-5&ig_cache_key=Mzc0NTIyOTEwMDg2NTU1MjczODE4Mzc0NzI1MDE4MTU0OTcw.3-ccb7-5&oh=00_AfclWV9U0P5H7EK1YRAbsTJ35ep8gsGzKS6cp5qv0LEFeg&oe=68F87314&_nc_sid=c024bc",
            "https://instagram.fcha1-1.fna.fbcdn.net/v/t51.2885-15/566616429_18374725024154970_4972917005564934761_n.jpg?stp=dst-jpg_e15_p320x320_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkNMSVBTLmltYWdlX3VybGdlbi4xMTM0eDIwMTYuc2RyLmY4Mjc4Ny5kZWZhdWx0X2NvdmVyX2ZyYW1lLmMyIn0&_nc_ht=instagram.fcha1-1.fna.fbcdn.net&_nc_cat=106&_nc_oc=Q6cZ2QFX-O7oU0bnbjJD7fQDTapxG3BNVtE-W7_gtnCrZXBOBH1vimK1DPqHOxR1QDQsF4M&_nc_ohc=pBsF-NoD8VYQ7kNvwEQqNq7&_nc_gid=5sFmted_niX-y0SefNf4Vg&edm=ACHbZRIBAAAA&ccb=7-5&ig_cache_key=Mzc0NTIyOTEwMDg2NTU1MjczODE4Mzc0NzI1MDE4MTU0OTcw.3-ccb7-5&oh=00_Affr0vkpUtIZ7Jn3RtCJTesJI6R-tYmGFwEVz90N3qYguQ&oe=68F87314&_nc_sid=c024bc"
        ],
        "videoUrl": "https://scontent-lga3-2.cdninstagram.com/o1/v/t16/f2/m86/AQMnZC1H4thDCGHzv2t8v-MHZ7vzo0FyJccGHaww3UArW5r8VD4EBxQZwUEtloGYacZSKoMQr0z0-MJHYf_iBkrU-hJw6nbwh3bx108.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2xpcHMuYzIuNzIwLmJhc2VsaW5lIn0&_nc_cat=105&vs=1386750452863532_1272138470&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC80QTRGNDUwODNEOUMwRTFBNERFNzExNDlERDUwOEVBRl92aWRlb19kYXNoaW5pdC5tcDQVAALIARIAFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HS1hudlNHX2gyZWJmZFFDQUhlbkNQa2I2UEVJYnN0VEFRQUYVAgLIARIAKAAYABsAFQAAJviB2ZbnvcQ%2FFQIoAkMzLBdAMRR64UeuFBgSZGFzaF9iYXNlbGluZV8xX3YxEQB1%2Fgdl5p0BAA%3D%3D&_nc_rid=6b67bf9a23&ccb=9-4&oh=00_AfcPf5ZbnpbY9xPilivzu2f0wfplLSL77q_4Yrx9Cp5HXQ&oe=68F46232&_nc_sid=10d13b",
        "transcript": "energy terminals and then",
        "likesCount": 7804,
        "sharesCount": 26,
        "timestamp": "2025-10-17T07:29:07.000Z",
        "ownerFullName": "Володимир Зеленський",
        "ownerUsername": "zelenskyy_official",
        "ownerId": "4731970969",
        "productType": "clips",
        "videoDuration": 17.08,
        "inputUrl": "https://www.instagram.com/zelenskyy_official",
        "firstComment": "Мда",
        "latestComments": [
            {
                "id": "18344742340162476",
                "text": "Мда",
                "ownerUsername": "ann230807",
                "ownerProfilePicUrl": "https://scontent-lga3-1.cdninstagram.com/v/t51.2885-19/502731623_17913246801108362_3512302403021061191_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-lga3-1.cdninstagram.com&_nc_cat=102&_nc_oc=Q6cZ2QGcSzUDQp22rI66SwC31bvdPhj8S2mj4gwPD2V5H3SAtnsPDW4cXWMRagI4rBGhgUA&_nc_ohc=TivtiOIb38QQ7kNvwH5YlrI&_nc_gid=Oa2eRCGZIyKEhuZ-Um-MgQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_AffW1y54lde81yhBixm4ONLyrXdPXCg1dDjkiJYzSaK55A&oe=68F86AB0&_nc_sid=10d13b",
                "timestamp": "2025-10-17T19:35:10.000Z",
                "repliesCount": 0,
                "replies": [],
                "likesCount": 0,
                "owner": {
                    "id": "63203524361",
                    "is_verified": false,
                    "profile_pic_url": "https://scontent-lga3-1.cdninstagram.com/v/t51.2885-19/502731623_17913246801108362_3512302403021061191_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-lga3-1.cdninstagram.com&_nc_cat=102&_nc_oc=Q6cZ2QGcSzUDQp22rI66SwC31bvdPhj8S2mj4gwPD2V5H3SAtnsPDW4cXWMRagI4rBGhgUA&_nc_ohc=TivtiOIb38QQ7kNvwH5YlrI&_nc_gid=Oa2eRCGZIyKEhuZ-Um-MgQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_AffW1y54lde81yhBixm4ONLyrXdPXCg1dDjkiJYzSaK55A&oe=68F86AB0&_nc_sid=10d13b",
                    "username": "ann230807"
                }
            },
            {
                "id": "18083324120291035",
                "text": "Зустріч путіна це морква для Пр.Д.Трампа, путін  тягне  час готуяся до мобілізації свого стада і заробляти  з китаєм гроши для війни і з Америкою ✨️✨️✨️",
                "ownerUsername": "ostrenko_vasil",
                "ownerProfilePicUrl": "https://scontent-lga3-2.cdninstagram.com/v/t51.2885-19/404057527_644624527746355_9110061233151105994_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-lga3-2.cdninstagram.com&_nc_cat=107&_nc_oc=Q6cZ2QGcSzUDQp22rI66SwC31bvdPhj8S2mj4gwPD2V5H3SAtnsPDW4cXWMRagI4rBGhgUA&_nc_ohc=ucDWzQKrAEcQ7kNvwGR7Dhc&_nc_gid=Oa2eRCGZIyKEhuZ-Um-MgQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_Affbh6Ocwsdrso5ydegMPzO-UhIqzD8MaoJsv_CPO4W2og&oe=68F88869&_nc_sid=10d13b",
                "timestamp": "2025-10-17T19:35:07.000Z",
                "repliesCount": 0,
                "replies": [],
                "likesCount": 0,
                "owner": {
                    "id": "32661436210",
                    "is_verified": false,
                    "profile_pic_url": "https://scontent-lga3-2.cdninstagram.com/v/t51.2885-19/404057527_644624527746355_9110061233151105994_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-lga3-2.cdninstagram.com&_nc_cat=107&_nc_oc=Q6cZ2QGcSzUDQp22rI66SwC31bvdPhj8S2mj4gwPD2V5H3SAtnsPDW4cXWMRagI4rBGhgUA&_nc_ohc=ucDWzQKrAEcQ7kNvwGR7Dhc&_nc_gid=Oa2eRCGZIyKEhuZ-Um-MgQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_Affbh6Ocwsdrso5ydegMPzO-UhIqzD8MaoJsv_CPO4W2og&oe=68F88869&_nc_sid=10d13b",
                    "username": "ostrenko_vasil"
                }
            },
            {
                "id": "17976127079936535",
                "text": "https://www.instagram.com/reel/DPwZEabjasz/?igsh=aGNmdndycWplb3Fm а украинцев залужный не хочет спасти? Только Европу используя до смерти украинца? А нам что европа дала кроме обмана?",
                "ownerUsername": "sribnazirka21",
                "ownerProfilePicUrl": "https://scontent-lga3-3.cdninstagram.com/v/t51.2885-19/509818484_17849377158500182_8171625262676716039_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-lga3-3.cdninstagram.com&_nc_cat=110&_nc_oc=Q6cZ2QGcSzUDQp22rI66SwC31bvdPhj8S2mj4gwPD2V5H3SAtnsPDW4cXWMRagI4rBGhgUA&_nc_ohc=ROPhpOeEikwQ7kNvwHlvB-N&_nc_gid=Oa2eRCGZIyKEhuZ-Um-MgQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfcfffGmwJA60e4C8DfoKx3kSPksqJjRBjTV8If50q_FZA&oe=68F85E4E&_nc_sid=10d13b",
                "timestamp": "2025-10-17T19:31:01.000Z",
                "repliesCount": 0,
                "replies": [],
                "likesCount": 0,
                "owner": {
                    "id": "74969940181",
                    "is_verified": false,
                    "profile_pic_url": "https://scontent-lga3-3.cdninstagram.com/v/t51.2885-19/509818484_17849377158500182_8171625262676716039_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-lga3-3.cdninstagram.com&_nc_cat=110&_nc_oc=Q6cZ2QGcSzUDQp22rI66SwC31bvdPhj8S2mj4gwPD2V5H3SAtnsPDW4cXWMRagI4rBGhgUA&_nc_ohc=ROPhpOeEikwQ7kNvwHlvB-N&_nc_gid=Oa2eRCGZIyKEhuZ-Um-MgQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfcfffGmwJA60e4C8DfoKx3kSPksqJjRBjTV8If50q_FZA&oe=68F85E4E&_nc_sid=10d13b",
                    "username": "sribnazirka21"
                }
            },
            {
                "id": "18365994943157691",
                "text": "Free Ukraine from Z€L€N$KY !!!",
                "ownerUsername": "lillarroww",
                "ownerProfilePicUrl": "https://scontent-lga3-1.cdninstagram.com/v/t51.2885-19/486042914_1363728058087883_8277836945347761266_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-lga3-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QGcSzUDQp22rI66SwC31bvdPhj8S2mj4gwPD2V5H3SAtnsPDW4cXWMRagI4rBGhgUA&_nc_ohc=LkG_kabCaNwQ7kNvwF-VQdi&_nc_gid=Oa2eRCGZIyKEhuZ-Um-MgQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfeGlmq4yrN8zu610MG3toCNT_CejflCf_fzB0l06fblNA&oe=68F86487&_nc_sid=10d13b",
                "timestamp": "2025-10-17T19:30:57.000Z",
                "repliesCount": 0,
                "replies": [],
                "likesCount": 0,
                "owner": {
                    "id": "57471167180",
                    "is_verified": false,
                    "profile_pic_url": "https://scontent-lga3-1.cdninstagram.com/v/t51.2885-19/486042914_1363728058087883_8277836945347761266_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-lga3-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QGcSzUDQp22rI66SwC31bvdPhj8S2mj4gwPD2V5H3SAtnsPDW4cXWMRagI4rBGhgUA&_nc_ohc=LkG_kabCaNwQ7kNvwF-VQdi&_nc_gid=Oa2eRCGZIyKEhuZ-Um-MgQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfeGlmq4yrN8zu610MG3toCNT_CejflCf_fzB0l06fblNA&oe=68F86487&_nc_sid=10d13b",
                    "username": "lillarroww"
                }
            },
            {
                "id": "17857788729536768",
                "text": "Просит оружие для чего? На кого его направлять собрался?",
                "ownerUsername": "badger.510817",
                "ownerProfilePicUrl": "https://scontent-lga3-3.cdninstagram.com/v/t51.2885-19/462052848_886582746365034_9196322878061224833_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby42NDAuYzIifQ&_nc_ht=scontent-lga3-3.cdninstagram.com&_nc_cat=106&_nc_oc=Q6cZ2QGcSzUDQp22rI66SwC31bvdPhj8S2mj4gwPD2V5H3SAtnsPDW4cXWMRagI4rBGhgUA&_nc_ohc=dpL1smsTrPUQ7kNvwGb87Os&_nc_gid=Oa2eRCGZIyKEhuZ-Um-MgQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfeS11CcD7ik6SlA7ScQLEuBF8SK6I1BTa-SBdbe5uAPEg&oe=68F853E1&_nc_sid=10d13b",
                "timestamp": "2025-10-17T19:28:38.000Z",
                "repliesCount": 0,
                "replies": [],
                "likesCount": 0,
                "owner": {
                    "id": "70100336518",
                    "is_verified": false,
                    "profile_pic_url": "https://scontent-lga3-3.cdninstagram.com/v/t51.2885-19/462052848_886582746365034_9196322878061224833_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby42NDAuYzIifQ&_nc_ht=scontent-lga3-3.cdninstagram.com&_nc_cat=106&_nc_oc=Q6cZ2QGcSzUDQp22rI66SwC31bvdPhj8S2mj4gwPD2V5H3SAtnsPDW4cXWMRagI4rBGhgUA&_nc_ohc=dpL1smsTrPUQ7kNvwGb87Os&_nc_gid=Oa2eRCGZIyKEhuZ-Um-MgQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfeS11CcD7ik6SlA7ScQLEuBF8SK6I1BTa-SBdbe5uAPEg&oe=68F853E1&_nc_sid=10d13b",
                    "username": "badger.510817"
                }
            },
            {
                "id": "18089899579715447",
                "text": "вместо Тамагавков Пит Гексед с галстуком в цветах флага рф….вова по моему по губам поводили….",
                "ownerUsername": "koss.stick",
                "ownerProfilePicUrl": "https://scontent-lga3-1.cdninstagram.com/v/t51.2885-19/515148898_17873801913380762_5194098495381989419_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDI0LmMyIn0&_nc_ht=scontent-lga3-1.cdninstagram.com&_nc_cat=102&_nc_oc=Q6cZ2QGcSzUDQp22rI66SwC31bvdPhj8S2mj4gwPD2V5H3SAtnsPDW4cXWMRagI4rBGhgUA&_nc_ohc=if7_4NLZxNUQ7kNvwHXuf5O&_nc_gid=Oa2eRCGZIyKEhuZ-Um-MgQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfeIPongsGFcUwANs4UDWGOOn-Snx6N62kR5oVl0A6V5CQ&oe=68F8866B&_nc_sid=10d13b",
                "timestamp": "2025-10-17T19:26:08.000Z",
                "repliesCount": 0,
                "replies": [],
                "likesCount": 0,
                "owner": {
                    "id": "71442156761",
                    "is_verified": false,
                    "profile_pic_url": "https://scontent-lga3-1.cdninstagram.com/v/t51.2885-19/515148898_17873801913380762_5194098495381989419_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDI0LmMyIn0&_nc_ht=scontent-lga3-1.cdninstagram.com&_nc_cat=102&_nc_oc=Q6cZ2QGcSzUDQp22rI66SwC31bvdPhj8S2mj4gwPD2V5H3SAtnsPDW4cXWMRagI4rBGhgUA&_nc_ohc=if7_4NLZxNUQ7kNvwHXuf5O&_nc_gid=Oa2eRCGZIyKEhuZ-Um-MgQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfeIPongsGFcUwANs4UDWGOOn-Snx6N62kR5oVl0A6V5CQ&oe=68F8866B&_nc_sid=10d13b",
                    "username": "koss.stick"
                }
            },
            {
                "id": "17888241684243376",
                "text": "Шукаю хлопця з Яким можно пошленько поспiлкуватись або познаймимся😚",
                "ownerUsername": "violettkka",
                "ownerProfilePicUrl": "https://scontent-lga3-1.cdninstagram.com/v/t51.2885-19/566352026_17844752937592791_7933739077879173658_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-lga3-1.cdninstagram.com&_nc_cat=103&_nc_oc=Q6cZ2QGcSzUDQp22rI66SwC31bvdPhj8S2mj4gwPD2V5H3SAtnsPDW4cXWMRagI4rBGhgUA&_nc_ohc=Ge67hf9s6HUQ7kNvwF27bVK&_nc_gid=Oa2eRCGZIyKEhuZ-Um-MgQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfcwpnwygsGgA4P-m8iBgf6_eifK_dwm9cCV_S05Dkf57A&oe=68F86535&_nc_sid=10d13b",
                "timestamp": "2025-10-17T19:18:08.000Z",
                "repliesCount": 0,
                "replies": [],
                "likesCount": 1,
                "owner": {
                    "id": "77845688790",
                    "is_verified": false,
                    "profile_pic_url": "https://scontent-lga3-1.cdninstagram.com/v/t51.2885-19/566352026_17844752937592791_7933739077879173658_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-lga3-1.cdninstagram.com&_nc_cat=103&_nc_oc=Q6cZ2QGcSzUDQp22rI66SwC31bvdPhj8S2mj4gwPD2V5H3SAtnsPDW4cXWMRagI4rBGhgUA&_nc_ohc=Ge67hf9s6HUQ7kNvwF27bVK&_nc_gid=Oa2eRCGZIyKEhuZ-Um-MgQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfcwpnwygsGgA4P-m8iBgf6_eifK_dwm9cCV_S05Dkf57A&oe=68F86535&_nc_sid=10d13b",
                    "username": "violettkka"
                }
            },
            {
                "id": "18082048759966224",
                "text": "Надо было читать Гоголя. Там Манилов мосты воздушные строил. И ничего. А Зеленский мечтает о трубе.",
                "ownerUsername": "alla89836",
                "ownerProfilePicUrl": "https://scontent-lga3-2.cdninstagram.com/v/t51.2885-19/549717776_17847292362563421_1136938949728462656_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-lga3-2.cdninstagram.com&_nc_cat=109&_nc_oc=Q6cZ2QGcSzUDQp22rI66SwC31bvdPhj8S2mj4gwPD2V5H3SAtnsPDW4cXWMRagI4rBGhgUA&_nc_ohc=U71pthdc3mQQ7kNvwHnlj-Y&_nc_gid=Oa2eRCGZIyKEhuZ-Um-MgQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfeOKAVV7wZpwM3Mr5hPKCI2y_RquNqkaFPiWBEl-MXLHg&oe=68F86180&_nc_sid=10d13b",
                "timestamp": "2025-10-17T19:13:40.000Z",
                "repliesCount": 0,
                "replies": [],
                "likesCount": 0,
                "owner": {
                    "id": "76981227420",
                    "is_verified": false,
                    "profile_pic_url": "https://scontent-lga3-2.cdninstagram.com/v/t51.2885-19/549717776_17847292362563421_1136938949728462656_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-lga3-2.cdninstagram.com&_nc_cat=109&_nc_oc=Q6cZ2QGcSzUDQp22rI66SwC31bvdPhj8S2mj4gwPD2V5H3SAtnsPDW4cXWMRagI4rBGhgUA&_nc_ohc=U71pthdc3mQQ7kNvwHnlj-Y&_nc_gid=Oa2eRCGZIyKEhuZ-Um-MgQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfeOKAVV7wZpwM3Mr5hPKCI2y_RquNqkaFPiWBEl-MXLHg&oe=68F86180&_nc_sid=10d13b",
                    "username": "alla89836"
                }
            }
        ],
        "displayUrl": "https://scontent-lga3-3.cdninstagram.com/v/t51.2885-15/566616429_18374725024154970_4972917005564934761_n.jpg?stp=dst-jpg_e35_p1080x1080_sh0.08_tt6&_nc_ht=scontent-lga3-3.cdninstagram.com&_nc_cat=106&_nc_oc=Q6cZ2QGcSzUDQp22rI66SwC31bvdPhj8S2mj4gwPD2V5H3SAtnsPDW4cXWMRagI4rBGhgUA&_nc_ohc=pBsF-NoD8VYQ7kNvwE--ykL&_nc_gid=Oa2eRCGZIyKEhuZ-Um-MgQ&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfcdLb0D3bQiWBC0j-EHEbB_o6FuW7CO8gL3jaNk7BCI0A&oe=68F87314&_nc_sid=10d13b",
        "alt": null,
        "videoViewCount": 36707,
        "videoPlayCount": 290293,
        "childPosts": [],
        "musicInfo": {
            "artist_name": "zelenskyy_official",
            "song_name": "Original audio",
            "uses_original_audio": true,
            "should_mute_audio": false,
            "should_mute_audio_reason": "",
            "audio_id": "1154139066671780"
        },
        "isCommentsDisabled": false
    },
    {
        "id": "3744826465381670359",
        "type": "Video",
        "shortCode": "DP4S9ROjl3X",
        "caption": "Dear New York closes in four short days. It has been an absolutely magical and historic two weeks. But it is not yet a finished work. Dear New York is an immersive art installation by people, for people, and about people. Everyone who visits Grand Central Station becomes part of it. With the crowds seeming to grow 20% each passing day, the work continues to grow more and more meaningful. Come join us this weekend as Dear New York reaches full bloom. When you arrive you will find a Grand Central completely cleared of advertising. If you come by subway, you’ll enter through an immersive installation covering all three levels of Grand Central subway station, designed by @trabuccocampos and his team at @pentagramdesign. You’ll then emerge into an iconic main concourse which has been completely transformed with light projections into a showcase of NYC’s humanity. For the first time in history, the main concourse has also been transformed by two weeks of musical programming performed by the celebrated students and alumni of @juilliardschool . After taking in a performance, be sure to swing by Vanderbilt Hall to experience the most-visited, most-talked-about art exhibit in town, designed by the legendary @davidkorins , and featuring the work of eleven highly notable NYC photographers alongside the work of 600 school-aged student artists—every participant given the same museum-quality printing and framing by @pictonewyork .  At 8 PM on Sunday night, there will be a short closing ceremony featuring a performance by a 200-strong chorus from @ypcofnyc. Afterwards Dear New York will go dark forever. It is incredibly tragic that it must die so soon. But also, that’s the reason it’s so alive.",
        "hashtags": [],
        "mentions": [
            "trabuccocampos",
            "pentagramdesign.",
            "juilliardschool",
            "davidkorins",
            "pictonewyork",
            "ypcofnyc."
        ],
        "url": "https://www.instagram.com/p/DP4S9ROjl3X/",
        "commentsCount": 102,
        "dimensionsHeight": 1136,
        "dimensionsWidth": 640,
        "downloadedVideo": "https://api.apify.com/v2/key-value-stores/nzaLnr7sqB6fIfQKI/records/DP4S9ROjl3X_Videobyhumansofny.mp4",
        "images": [
            "https://scontent-iad3-1.cdninstagram.com/v/t51.2885-15/563840618_1778777802828085_3644182393649940087_n.jpg?stp=dst-jpg_e15_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkNMSVBTLmltYWdlX3VybGdlbi42NDB4MTEzNi5zZHIuZjcxODc4Lm5mcmFtZV9jb3Zlcl9mcmFtZS5jMiJ9&_nc_ht=scontent-iad3-1.cdninstagram.com&_nc_cat=101&_nc_oc=Q6cZ2QGZaY0vAZovnKffv6C_iqBk5o89Gzj9tQdbya28ZICNOAvuaRKwlaOqz_6M3kF0vrQ&_nc_ohc=GQL9YeVYZKQQ7kNvwGMk9Pj&_nc_gid=sy4SaS5OuHaffCHqH8d8Bw&edm=ACHbZRIBAAAA&ccb=7-5&ig_cache_key=Mzc0NDgyNjQ2NTM4MTY3MDM1OQ%3D%3D.3-ccb7-5&oh=00_AfdUaqAqxS-HAXTonUYG4IfzLKOcT1HQgOJ952UJLGZVDQ&oe=68F878BA&_nc_sid=c024bc",
            "https://scontent-iad3-1.cdninstagram.com/v/t51.2885-15/563840618_1778777802828085_3644182393649940087_n.jpg?stp=dst-jpg_e15_p320x320_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkNMSVBTLmltYWdlX3VybGdlbi42NDB4MTEzNi5zZHIuZjcxODc4Lm5mcmFtZV9jb3Zlcl9mcmFtZS5jMiJ9&_nc_ht=scontent-iad3-1.cdninstagram.com&_nc_cat=101&_nc_oc=Q6cZ2QGZaY0vAZovnKffv6C_iqBk5o89Gzj9tQdbya28ZICNOAvuaRKwlaOqz_6M3kF0vrQ&_nc_ohc=GQL9YeVYZKQQ7kNvwGMk9Pj&_nc_gid=sy4SaS5OuHaffCHqH8d8Bw&edm=ACHbZRIBAAAA&ccb=7-5&ig_cache_key=Mzc0NDgyNjQ2NTM4MTY3MDM1OQ%3D%3D.3-ccb7-5&oh=00_AfdIoCMGI1MPBLxwnLWNesua-hmh_0bESZgKhmUOmN5zPg&oe=68F878BA&_nc_sid=c024bc"
        ],
        "videoUrl": "https://scontent-ord5-1.cdninstagram.com/o1/v/t16/f2/m86/AQNdwXAxfFTKafNT6N83VT2pGUrvVlXG9nLi_kqcpvKDyDZxsqgVrOQDcJ9T_FE5V2_WNT9rJq5NsVVu_fkMQgCKOzoBdq4UHwnCl2o.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2xpcHMuYzIuNzIwLmJhc2VsaW5lIn0&_nc_cat=108&vs=1359331559185736_2753592044&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC84RjQ4ODQ1OThEQUYwNTIzQzNEN0Y5M0VDQzA5NEY5OF92aWRlb19kYXNoaW5pdC5tcDQVAALIARIAFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HQWJydXlIZi1UN0lOYXNGQUFUTU5lSExGaXN3YnN0VEFRQUYVAgLIARIAKAAYABsAFQAAJtSZv%2Bbnhtc%2FFQIoAkMzLBdAOdvnbItDlhgSZGFzaF9iYXNlbGluZV8xX3YxEQB1%2Fgdl5p0BAA%3D%3D&_nc_rid=40281ce572&ccb=9-4&oh=00_AfeHt-exr9_qwAvtO2fr8mW86l1gb5xTemxUPottk8-Tvw&oe=68F45D8C&_nc_sid=10d13b",
        "transcript": "This is New York's largest public art installation in 20 years.",
        "likesCount": 9678,
        "sharesCount": 1445,
        "timestamp": "2025-10-16T18:12:10.000Z",
        "ownerFullName": "Humans of New York",
        "ownerUsername": "humansofny",
        "ownerId": "242598499",
        "productType": "clips",
        "videoDuration": 25.859,
        "inputUrl": "https://www.instagram.com/242598499",
        "firstComment": "@woolfandcompanybooks  Hi Shelby!",
        "latestComments": [
            {
                "id": "18129945511475814",
                "text": "@woolfandcompanybooks  Hi Shelby!",
                "ownerUsername": "tessusa",
                "ownerProfilePicUrl": "https://scontent-ord5-2.cdninstagram.com/v/t51.2885-19/373607579_9899447943461798_1856164344657410888_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-ord5-2.cdninstagram.com&_nc_cat=102&_nc_oc=Q6cZ2QGDypY6d8Tn5kp7pWZLZZ3fvUMoW0E_V1CC7VKvJ1cLTwomOWjJWUBwvni-RfLN1Y4&_nc_ohc=9RxRbZUHY5YQ7kNvwHyT7G6&_nc_gid=Ibh5orRh6Ty0zr6b058pog&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfcBkSrFlO0HCBFfei5T7KA5ojLZ94rkzyi4ZVYl6LY2Hg&oe=68F86424&_nc_sid=10d13b",
                "timestamp": "2025-10-17T18:15:39.000Z",
                "repliesCount": 0,
                "replies": [],
                "likesCount": 0,
                "owner": {
                    "id": "852917786",
                    "is_verified": false,
                    "profile_pic_url": "https://scontent-ord5-2.cdninstagram.com/v/t51.2885-19/373607579_9899447943461798_1856164344657410888_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-ord5-2.cdninstagram.com&_nc_cat=102&_nc_oc=Q6cZ2QGDypY6d8Tn5kp7pWZLZZ3fvUMoW0E_V1CC7VKvJ1cLTwomOWjJWUBwvni-RfLN1Y4&_nc_ohc=9RxRbZUHY5YQ7kNvwHyT7G6&_nc_gid=Ibh5orRh6Ty0zr6b058pog&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfcBkSrFlO0HCBFfei5T7KA5ojLZ94rkzyi4ZVYl6LY2Hg&oe=68F86424&_nc_sid=10d13b",
                    "username": "tessusa"
                }
            },
            {
                "id": "17864729598417070",
                "text": "Love this so much ❤️",
                "ownerUsername": "bellazy",
                "ownerProfilePicUrl": "https://scontent-ord5-3.cdninstagram.com/v/t51.2885-19/561511567_18538076743048651_413474961410540562_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-ord5-3.cdninstagram.com&_nc_cat=107&_nc_oc=Q6cZ2QGDypY6d8Tn5kp7pWZLZZ3fvUMoW0E_V1CC7VKvJ1cLTwomOWjJWUBwvni-RfLN1Y4&_nc_ohc=Xy3e2CIWCNoQ7kNvwFhR1O-&_nc_gid=Ibh5orRh6Ty0zr6b058pog&edm=APs17CUBAAAA&ccb=7-5&oh=00_AffI_FjMWp6qHL-WDXiC7H9PWf-RNAcWCauY5RFGoPjvIg&oe=68F87F4B&_nc_sid=10d13b",
                "timestamp": "2025-10-17T17:56:21.000Z",
                "repliesCount": 0,
                "replies": [],
                "likesCount": 0,
                "owner": {
                    "id": "28464650",
                    "is_verified": false,
                    "profile_pic_url": "https://scontent-ord5-3.cdninstagram.com/v/t51.2885-19/561511567_18538076743048651_413474961410540562_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-ord5-3.cdninstagram.com&_nc_cat=107&_nc_oc=Q6cZ2QGDypY6d8Tn5kp7pWZLZZ3fvUMoW0E_V1CC7VKvJ1cLTwomOWjJWUBwvni-RfLN1Y4&_nc_ohc=Xy3e2CIWCNoQ7kNvwFhR1O-&_nc_gid=Ibh5orRh6Ty0zr6b058pog&edm=APs17CUBAAAA&ccb=7-5&oh=00_AffI_FjMWp6qHL-WDXiC7H9PWf-RNAcWCauY5RFGoPjvIg&oe=68F87F4B&_nc_sid=10d13b",
                    "username": "bellazy"
                }
            },
            {
                "id": "18079355132117073",
                "text": "🔥🔥🔥🙌🙌🙌",
                "ownerUsername": "tylerkennedyhackner",
                "ownerProfilePicUrl": "https://scontent-ord5-2.cdninstagram.com/v/t51.2885-19/163533037_367744117668723_5601890203235098143_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-ord5-2.cdninstagram.com&_nc_cat=103&_nc_oc=Q6cZ2QGDypY6d8Tn5kp7pWZLZZ3fvUMoW0E_V1CC7VKvJ1cLTwomOWjJWUBwvni-RfLN1Y4&_nc_ohc=sIWUCTLHjtAQ7kNvwGDM7Th&_nc_gid=Ibh5orRh6Ty0zr6b058pog&edm=APs17CUBAAAA&ccb=7-5&oh=00_Affr_zqeVAt0bYbqfgv3eF3Rx8tKq58n4VA1jJxEtUkwPg&oe=68F876DD&_nc_sid=10d13b",
                "timestamp": "2025-10-17T16:21:17.000Z",
                "repliesCount": 0,
                "replies": [],
                "likesCount": 0,
                "owner": {
                    "id": "6334848289",
                    "is_verified": false,
                    "profile_pic_url": "https://scontent-ord5-2.cdninstagram.com/v/t51.2885-19/163533037_367744117668723_5601890203235098143_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-ord5-2.cdninstagram.com&_nc_cat=103&_nc_oc=Q6cZ2QGDypY6d8Tn5kp7pWZLZZ3fvUMoW0E_V1CC7VKvJ1cLTwomOWjJWUBwvni-RfLN1Y4&_nc_ohc=sIWUCTLHjtAQ7kNvwGDM7Th&_nc_gid=Ibh5orRh6Ty0zr6b058pog&edm=APs17CUBAAAA&ccb=7-5&oh=00_Affr_zqeVAt0bYbqfgv3eF3Rx8tKq58n4VA1jJxEtUkwPg&oe=68F876DD&_nc_sid=10d13b",
                    "username": "tylerkennedyhackner"
                }
            },
            {
                "id": "17965788449824567",
                "text": "I am so excited to go and see this today!! 🙌",
                "ownerUsername": "carlyjoanphotos",
                "ownerProfilePicUrl": "https://scontent-ord5-3.cdninstagram.com/v/t51.2885-19/544895074_18533587363043865_1493287846380526264_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-ord5-3.cdninstagram.com&_nc_cat=109&_nc_oc=Q6cZ2QGDypY6d8Tn5kp7pWZLZZ3fvUMoW0E_V1CC7VKvJ1cLTwomOWjJWUBwvni-RfLN1Y4&_nc_ohc=aytFIhcmfkwQ7kNvwHOehoV&_nc_gid=Ibh5orRh6Ty0zr6b058pog&edm=APs17CUBAAAA&ccb=7-5&oh=00_Afdi-pFj1fYd7LiCyGK13pEXHa32kqVnQK8ivXVWFy5nvg&oe=68F854EF&_nc_sid=10d13b",
                "timestamp": "2025-10-17T15:57:01.000Z",
                "repliesCount": 0,
                "replies": [],
                "likesCount": 0,
                "owner": {
                    "id": "33387864",
                    "is_verified": false,
                    "profile_pic_url": "https://scontent-ord5-3.cdninstagram.com/v/t51.2885-19/544895074_18533587363043865_1493287846380526264_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-ord5-3.cdninstagram.com&_nc_cat=109&_nc_oc=Q6cZ2QGDypY6d8Tn5kp7pWZLZZ3fvUMoW0E_V1CC7VKvJ1cLTwomOWjJWUBwvni-RfLN1Y4&_nc_ohc=aytFIhcmfkwQ7kNvwHOehoV&_nc_gid=Ibh5orRh6Ty0zr6b058pog&edm=APs17CUBAAAA&ccb=7-5&oh=00_Afdi-pFj1fYd7LiCyGK13pEXHa32kqVnQK8ivXVWFy5nvg&oe=68F854EF&_nc_sid=10d13b",
                    "username": "carlyjoanphotos"
                }
            },
            {
                "id": "18108629752584631",
                "text": "Congratulations on this extraordinary achievement and vision.",
                "ownerUsername": "rmgoggins",
                "ownerProfilePicUrl": "https://scontent-ord5-1.cdninstagram.com/v/t51.2885-19/467406356_1630282177556180_8952127808114116644_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-ord5-1.cdninstagram.com&_nc_cat=108&_nc_oc=Q6cZ2QGDypY6d8Tn5kp7pWZLZZ3fvUMoW0E_V1CC7VKvJ1cLTwomOWjJWUBwvni-RfLN1Y4&_nc_ohc=-kPnOAXaloEQ7kNvwFCasyx&_nc_gid=Ibh5orRh6Ty0zr6b058pog&edm=APs17CUBAAAA&ccb=7-5&oh=00_Afer2eDa-_fz67xijuS1doxN6Y0mfoQjuELU0Jin8kWoqg&oe=68F86DF2&_nc_sid=10d13b",
                "timestamp": "2025-10-17T15:54:56.000Z",
                "repliesCount": 0,
                "replies": [],
                "likesCount": 0,
                "owner": {
                    "id": "177110476",
                    "is_verified": false,
                    "profile_pic_url": "https://scontent-ord5-1.cdninstagram.com/v/t51.2885-19/467406356_1630282177556180_8952127808114116644_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-ord5-1.cdninstagram.com&_nc_cat=108&_nc_oc=Q6cZ2QGDypY6d8Tn5kp7pWZLZZ3fvUMoW0E_V1CC7VKvJ1cLTwomOWjJWUBwvni-RfLN1Y4&_nc_ohc=-kPnOAXaloEQ7kNvwFCasyx&_nc_gid=Ibh5orRh6Ty0zr6b058pog&edm=APs17CUBAAAA&ccb=7-5&oh=00_Afer2eDa-_fz67xijuS1doxN6Y0mfoQjuELU0Jin8kWoqg&oe=68F86DF2&_nc_sid=10d13b",
                    "username": "rmgoggins"
                }
            },
            {
                "id": "18083813335990389",
                "text": "Incredible!",
                "ownerUsername": "jaelcayemitte",
                "ownerProfilePicUrl": "https://scontent-ord5-3.cdninstagram.com/v/t51.2885-19/420893977_1344473329771656_5986768279667907359_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-ord5-3.cdninstagram.com&_nc_cat=100&_nc_oc=Q6cZ2QGDypY6d8Tn5kp7pWZLZZ3fvUMoW0E_V1CC7VKvJ1cLTwomOWjJWUBwvni-RfLN1Y4&_nc_ohc=-ZtDfiv4RCQQ7kNvwEKbgBY&_nc_gid=Ibh5orRh6Ty0zr6b058pog&edm=APs17CUBAAAA&ccb=7-5&oh=00_AffruRGBAEfPwX-A1iDHCH6Axe_JbHmH8wTLEDvGaJFU6g&oe=68F88805&_nc_sid=10d13b",
                "timestamp": "2025-10-17T14:54:44.000Z",
                "repliesCount": 0,
                "replies": [],
                "likesCount": 0,
                "owner": {
                    "id": "227450701",
                    "is_verified": false,
                    "profile_pic_url": "https://scontent-ord5-3.cdninstagram.com/v/t51.2885-19/420893977_1344473329771656_5986768279667907359_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-ord5-3.cdninstagram.com&_nc_cat=100&_nc_oc=Q6cZ2QGDypY6d8Tn5kp7pWZLZZ3fvUMoW0E_V1CC7VKvJ1cLTwomOWjJWUBwvni-RfLN1Y4&_nc_ohc=-ZtDfiv4RCQQ7kNvwEKbgBY&_nc_gid=Ibh5orRh6Ty0zr6b058pog&edm=APs17CUBAAAA&ccb=7-5&oh=00_AffruRGBAEfPwX-A1iDHCH6Axe_JbHmH8wTLEDvGaJFU6g&oe=68F88805&_nc_sid=10d13b",
                    "username": "jaelcayemitte"
                }
            },
            {
                "id": "18332054746225369",
                "text": "🙌🙌🙌🙌🙌🙌😍😍😍😍😍😍😍😍😍😍😍😍😍",
                "ownerUsername": "janetr59",
                "ownerProfilePicUrl": "https://scontent-ord5-3.cdninstagram.com/v/t51.2885-19/10499280_1439623296303031_547608423_a.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xNTAuYzIifQ&_nc_ht=scontent-ord5-3.cdninstagram.com&_nc_cat=107&_nc_oc=Q6cZ2QGDypY6d8Tn5kp7pWZLZZ3fvUMoW0E_V1CC7VKvJ1cLTwomOWjJWUBwvni-RfLN1Y4&_nc_ohc=gjq15E_bLlwQ7kNvwGI3Pui&_nc_gid=Ibh5orRh6Ty0zr6b058pog&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfcRy_EsY40dK019xzHQFnoNXJh_PiWqzi7zGWll2BMztQ&oe=68F887B0&_nc_sid=10d13b",
                "timestamp": "2025-10-17T14:34:45.000Z",
                "repliesCount": 0,
                "replies": [],
                "likesCount": 1,
                "owner": {
                    "id": "1223883480",
                    "is_verified": false,
                    "profile_pic_url": "https://scontent-ord5-3.cdninstagram.com/v/t51.2885-19/10499280_1439623296303031_547608423_a.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xNTAuYzIifQ&_nc_ht=scontent-ord5-3.cdninstagram.com&_nc_cat=107&_nc_oc=Q6cZ2QGDypY6d8Tn5kp7pWZLZZ3fvUMoW0E_V1CC7VKvJ1cLTwomOWjJWUBwvni-RfLN1Y4&_nc_ohc=gjq15E_bLlwQ7kNvwGI3Pui&_nc_gid=Ibh5orRh6Ty0zr6b058pog&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfcRy_EsY40dK019xzHQFnoNXJh_PiWqzi7zGWll2BMztQ&oe=68F887B0&_nc_sid=10d13b",
                    "username": "janetr59"
                }
            },
            {
                "id": "17902807854275644",
                "text": "I was lucky to see it during my visit! Such a great idea!",
                "ownerUsername": "uncannilyrandom",
                "ownerProfilePicUrl": "https://scontent-ord5-3.cdninstagram.com/v/t51.2885-19/567143129_18536242717009354_3625039568111563255_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby45MjMuYzIifQ&_nc_ht=scontent-ord5-3.cdninstagram.com&_nc_cat=110&_nc_oc=Q6cZ2QGDypY6d8Tn5kp7pWZLZZ3fvUMoW0E_V1CC7VKvJ1cLTwomOWjJWUBwvni-RfLN1Y4&_nc_ohc=QedD4gsbSqAQ7kNvwFs0f2v&_nc_gid=Ibh5orRh6Ty0zr6b058pog&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfdP40pwiOPGBNBsQ-ln38Sd7xCheS0CGEJrgXDfqBdCVw&oe=68F8667D&_nc_sid=10d13b",
                "timestamp": "2025-10-17T14:25:23.000Z",
                "repliesCount": 0,
                "replies": [],
                "likesCount": 0,
                "owner": {
                    "id": "400905353",
                    "is_verified": false,
                    "profile_pic_url": "https://scontent-ord5-3.cdninstagram.com/v/t51.2885-19/567143129_18536242717009354_3625039568111563255_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby45MjMuYzIifQ&_nc_ht=scontent-ord5-3.cdninstagram.com&_nc_cat=110&_nc_oc=Q6cZ2QGDypY6d8Tn5kp7pWZLZZ3fvUMoW0E_V1CC7VKvJ1cLTwomOWjJWUBwvni-RfLN1Y4&_nc_ohc=QedD4gsbSqAQ7kNvwFs0f2v&_nc_gid=Ibh5orRh6Ty0zr6b058pog&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfdP40pwiOPGBNBsQ-ln38Sd7xCheS0CGEJrgXDfqBdCVw&oe=68F8667D&_nc_sid=10d13b",
                    "username": "uncannilyrandom"
                }
            },
            {
                "id": "18103863772624417",
                "text": "You have given the city back it’s humanity by reminding everyone what it’s made of. 🙏🏽 Thank you.",
                "ownerUsername": "fotosfinos",
                "ownerProfilePicUrl": "https://scontent-ord5-1.cdninstagram.com/v/t51.2885-19/488263228_9462325380551027_5049961125834682081_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-ord5-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QGDypY6d8Tn5kp7pWZLZZ3fvUMoW0E_V1CC7VKvJ1cLTwomOWjJWUBwvni-RfLN1Y4&_nc_ohc=46uYC3M97OMQ7kNvwFevMaw&_nc_gid=Ibh5orRh6Ty0zr6b058pog&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfcPOFXsfYEl_JcAQXx61ZJBe6YOtQPKdfbyauQpaHe9sQ&oe=68F868B2&_nc_sid=10d13b",
                "timestamp": "2025-10-17T13:09:09.000Z",
                "repliesCount": 0,
                "replies": [],
                "likesCount": 0,
                "owner": {
                    "id": "34149200364",
                    "is_verified": false,
                    "profile_pic_url": "https://scontent-ord5-1.cdninstagram.com/v/t51.2885-19/488263228_9462325380551027_5049961125834682081_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-ord5-1.cdninstagram.com&_nc_cat=111&_nc_oc=Q6cZ2QGDypY6d8Tn5kp7pWZLZZ3fvUMoW0E_V1CC7VKvJ1cLTwomOWjJWUBwvni-RfLN1Y4&_nc_ohc=46uYC3M97OMQ7kNvwFevMaw&_nc_gid=Ibh5orRh6Ty0zr6b058pog&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfcPOFXsfYEl_JcAQXx61ZJBe6YOtQPKdfbyauQpaHe9sQ&oe=68F868B2&_nc_sid=10d13b",
                    "username": "fotosfinos"
                }
            },
            {
                "id": "18207638635310104",
                "text": "This is a MASTERPIECE.",
                "ownerUsername": "prairietoparkave",
                "ownerProfilePicUrl": "https://scontent-ord5-3.cdninstagram.com/v/t51.2885-19/563881228_17844558969590916_707073752189662699_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-ord5-3.cdninstagram.com&_nc_cat=100&_nc_oc=Q6cZ2QGDypY6d8Tn5kp7pWZLZZ3fvUMoW0E_V1CC7VKvJ1cLTwomOWjJWUBwvni-RfLN1Y4&_nc_ohc=OaAcE0PTtpYQ7kNvwGTROyg&_nc_gid=Ibh5orRh6Ty0zr6b058pog&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfeIOajnE9UeqLjqqgmInxZ2WJcQ2QHKfmFGH5wLrElIWg&oe=68F886B9&_nc_sid=10d13b",
                "timestamp": "2025-10-17T12:58:48.000Z",
                "repliesCount": 0,
                "replies": [],
                "likesCount": 0,
                "owner": {
                    "id": "77614654915",
                    "is_verified": true,
                    "profile_pic_url": "https://scontent-ord5-3.cdninstagram.com/v/t51.2885-19/563881228_17844558969590916_707073752189662699_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-ord5-3.cdninstagram.com&_nc_cat=100&_nc_oc=Q6cZ2QGDypY6d8Tn5kp7pWZLZZ3fvUMoW0E_V1CC7VKvJ1cLTwomOWjJWUBwvni-RfLN1Y4&_nc_ohc=OaAcE0PTtpYQ7kNvwGTROyg&_nc_gid=Ibh5orRh6Ty0zr6b058pog&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfeIOajnE9UeqLjqqgmInxZ2WJcQ2QHKfmFGH5wLrElIWg&oe=68F886B9&_nc_sid=10d13b",
                    "username": "prairietoparkave"
                }
            }
        ],
        "displayUrl": "https://scontent-ord5-1.cdninstagram.com/v/t51.2885-15/563840618_1778777802828085_3644182393649940087_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=scontent-ord5-1.cdninstagram.com&_nc_cat=101&_nc_oc=Q6cZ2QGDypY6d8Tn5kp7pWZLZZ3fvUMoW0E_V1CC7VKvJ1cLTwomOWjJWUBwvni-RfLN1Y4&_nc_ohc=GQL9YeVYZKQQ7kNvwH_W3n-&_nc_gid=Ibh5orRh6Ty0zr6b058pog&edm=APs17CUBAAAA&ccb=7-5&oh=00_Afe8Dn6DZwVb7YTsEll3lkt7m0SCb6tuKcRKVtCEpWVLbw&oe=68F878BA&_nc_sid=10d13b",
        "alt": null,
        "videoViewCount": 89603,
        "videoPlayCount": 371480,
        "childPosts": [],
        "taggedUsers": [
            {
                "full_name": "Pentagram",
                "id": "55663052",
                "is_verified": false,
                "profile_pic_url": "https://scontent-ord5-2.cdninstagram.com/v/t51.2885-19/508686140_18504312463047053_1045568769824133322_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-ord5-2.cdninstagram.com&_nc_cat=105&_nc_oc=Q6cZ2QGDypY6d8Tn5kp7pWZLZZ3fvUMoW0E_V1CC7VKvJ1cLTwomOWjJWUBwvni-RfLN1Y4&_nc_ohc=SJNSAjGTZYMQ7kNvwHhxf9D&_nc_gid=Ibh5orRh6Ty0zr6b058pog&edm=APs17CUBAAAA&ccb=7-5&oh=00_Aff6m4to000hRxRlRj3iQLLpurqIvd9VdaYONVVxkoWiPw&oe=68F85B46&_nc_sid=10d13b",
                "username": "pentagramdesign"
            },
            {
                "full_name": "The Juilliard School",
                "id": "1499933579",
                "is_verified": true,
                "profile_pic_url": "https://scontent-ord5-2.cdninstagram.com/v/t51.2885-19/514492136_18516755629029580_787838455735165582_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-ord5-2.cdninstagram.com&_nc_cat=104&_nc_oc=Q6cZ2QGDypY6d8Tn5kp7pWZLZZ3fvUMoW0E_V1CC7VKvJ1cLTwomOWjJWUBwvni-RfLN1Y4&_nc_ohc=II_mQmUYzmwQ7kNvwEw6IvU&_nc_gid=Ibh5orRh6Ty0zr6b058pog&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfcSTrsnwYCazS2o83pYpoPMY5o_2Ugphe7s5Jr5bDf72g&oe=68F86A16&_nc_sid=10d13b",
                "username": "juilliardschool"
            },
            {
                "full_name": "David Korins",
                "id": "34932957",
                "is_verified": true,
                "profile_pic_url": "https://scontent-ord5-2.cdninstagram.com/v/t51.2885-19/354806373_808714434245655_744218965210919337_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-ord5-2.cdninstagram.com&_nc_cat=103&_nc_oc=Q6cZ2QGDypY6d8Tn5kp7pWZLZZ3fvUMoW0E_V1CC7VKvJ1cLTwomOWjJWUBwvni-RfLN1Y4&_nc_ohc=1AsjSDt-FdMQ7kNvwGxLmjn&_nc_gid=Ibh5orRh6Ty0zr6b058pog&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfeQq5F2OCdm6q57K5uJSEjVNy9tDNabqHcF1Ek9FH6Lyg&oe=68F88589&_nc_sid=10d13b",
                "username": "davidkorins"
            },
            {
                "full_name": "Andrea A. Trabucco-Campos",
                "id": "393694503",
                "is_verified": false,
                "profile_pic_url": "https://scontent-ord5-3.cdninstagram.com/v/t51.2885-19/405216666_371996991967747_7850373264035619068_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-ord5-3.cdninstagram.com&_nc_cat=107&_nc_oc=Q6cZ2QGDypY6d8Tn5kp7pWZLZZ3fvUMoW0E_V1CC7VKvJ1cLTwomOWjJWUBwvni-RfLN1Y4&_nc_ohc=q4WbmBC0jkwQ7kNvwGYGddL&_nc_gid=Ibh5orRh6Ty0zr6b058pog&edm=APs17CUBAAAA&ccb=7-5&oh=00_Afd13X2NVbcsAWVh27BVjpyFW-cft01bnSsvJPX23BYm1w&oe=68F8569B&_nc_sid=10d13b",
                "username": "trabuccocampos"
            },
            {
                "full_name": "Picto NY",
                "id": "2160932271",
                "is_verified": false,
                "profile_pic_url": "https://scontent-ord5-1.cdninstagram.com/v/t51.2885-19/70933449_1509041619258656_8193633101990068224_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby40MDAuYzIifQ&_nc_ht=scontent-ord5-1.cdninstagram.com&_nc_cat=108&_nc_oc=Q6cZ2QGDypY6d8Tn5kp7pWZLZZ3fvUMoW0E_V1CC7VKvJ1cLTwomOWjJWUBwvni-RfLN1Y4&_nc_ohc=wf6lsy-rWcQQ7kNvwGSy6Mu&_nc_gid=Ibh5orRh6Ty0zr6b058pog&edm=APs17CUBAAAA&ccb=7-5&oh=00_Afd07C9gI5rAg5XrBuesxcgdgZzoKu4uk2EaYJrAkjH4xw&oe=68F874DF&_nc_sid=10d13b",
                "username": "pictonewyork"
            }
        ],
        "musicInfo": {
            "artist_name": "humansofny",
            "song_name": "Original audio",
            "uses_original_audio": true,
            "should_mute_audio": false,
            "should_mute_audio_reason": "",
            "audio_id": "1292468502894301"
        },
        "coauthorProducers": [
            {
                "id": "34932957",
                "is_verified": true,
                "profile_pic_url": "https://scontent-ord5-2.cdninstagram.com/v/t51.2885-19/354806373_808714434245655_744218965210919337_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-ord5-2.cdninstagram.com&_nc_cat=103&_nc_oc=Q6cZ2QGDypY6d8Tn5kp7pWZLZZ3fvUMoW0E_V1CC7VKvJ1cLTwomOWjJWUBwvni-RfLN1Y4&_nc_ohc=1AsjSDt-FdMQ7kNvwGxLmjn&_nc_gid=Ibh5orRh6Ty0zr6b058pog&edm=APs17CUBAAAA&ccb=7-5&oh=00_AfeQq5F2OCdm6q57K5uJSEjVNy9tDNabqHcF1Ek9FH6Lyg&oe=68F88589&_nc_sid=10d13b",
                "username": "davidkorins"
            },
            {
                "id": "2160932271",
                "is_verified": false,
                "profile_pic_url": "https://scontent-ord5-1.cdninstagram.com/v/t51.2885-19/70933449_1509041619258656_8193633101990068224_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby40MDAuYzIifQ&_nc_ht=scontent-ord5-1.cdninstagram.com&_nc_cat=108&_nc_oc=Q6cZ2QGDypY6d8Tn5kp7pWZLZZ3fvUMoW0E_V1CC7VKvJ1cLTwomOWjJWUBwvni-RfLN1Y4&_nc_ohc=wf6lsy-rWcQQ7kNvwGSy6Mu&_nc_gid=Ibh5orRh6Ty0zr6b058pog&edm=APs17CUBAAAA&ccb=7-5&oh=00_Afd07C9gI5rAg5XrBuesxcgdgZzoKu4uk2EaYJrAkjH4xw&oe=68F874DF&_nc_sid=10d13b",
                "username": "pictonewyork"
            },
            {
                "id": "55663052",
                "is_verified": false,
                "profile_pic_url": "https://scontent-ord5-2.cdninstagram.com/v/t51.2885-19/508686140_18504312463047053_1045568769824133322_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-ord5-2.cdninstagram.com&_nc_cat=105&_nc_oc=Q6cZ2QGDypY6d8Tn5kp7pWZLZZ3fvUMoW0E_V1CC7VKvJ1cLTwomOWjJWUBwvni-RfLN1Y4&_nc_ohc=SJNSAjGTZYMQ7kNvwHhxf9D&_nc_gid=Ibh5orRh6Ty0zr6b058pog&edm=APs17CUBAAAA&ccb=7-5&oh=00_Aff6m4to000hRxRlRj3iQLLpurqIvd9VdaYONVVxkoWiPw&oe=68F85B46&_nc_sid=10d13b",
                "username": "pentagramdesign"
            },
            {
                "id": "393694503",
                "is_verified": false,
                "profile_pic_url": "https://scontent-ord5-3.cdninstagram.com/v/t51.2885-19/405216666_371996991967747_7850373264035619068_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=scontent-ord5-3.cdninstagram.com&_nc_cat=107&_nc_oc=Q6cZ2QGDypY6d8Tn5kp7pWZLZZ3fvUMoW0E_V1CC7VKvJ1cLTwomOWjJWUBwvni-RfLN1Y4&_nc_ohc=q4WbmBC0jkwQ7kNvwGYGddL&_nc_gid=Ibh5orRh6Ty0zr6b058pog&edm=APs17CUBAAAA&ccb=7-5&oh=00_Afd13X2NVbcsAWVh27BVjpyFW-cft01bnSsvJPX23BYm1w&oe=68F8569B&_nc_sid=10d13b",
                "username": "trabuccocampos"
            }
        ],
        "isCommentsDisabled": false
    }
]
````

### Want to get other details from an Instagram account?

You can use the other dedicated scrapers below if you want to scrape specific Instagram data:

<table>
<td>🎞️ <a href="https://apify.com/apify/facebook-reels-scraper">Facebook Reels Scraper</a></td>
<td>💾 <a href="https://apify.com/apify/export-instagram-comments-posts">Export Instagram Comments and Posts Tool</a></td>
</tr>
<tr>
<td>#️⃣ <a href="https://apify.com/apify/instagram-hashtag-scraper">Instagram Hashtag Scraper</a></td>
<td>🔢 <a href="https://apify.com/apify/instagram-hashtag-stats">Instagram Related Hashtag Stats Scraper</a></td>
</tr>
<tr>
<td>📷 <a href="https://apify.com/apify/instagram-post-scraper">Instagram Post Scraper</a></td>
<td>💬 <a href="https://apify.com/apify/instagram-comment-scraper">Instagram Comments Scraper</a></td>
</tr>
<tr>
<tr>
<td>👤 <a href="https://apify.com/apify/instagram-profile-scraper">Instagram Profile Scraper</a></td>
<td>🏷️ <a href="https://apify.com/apify/instagram-tagged-scraper">Instagram Mentions Scraper</a></td>
</tr>
<tr>
<td>👥 <a href="https://apify.com/apify/instagram-followers-count-scraper">Instagram Followers Count Scraper</a></td>
<td>🔎 <a href="https://apify.com/apify/instagram-search-scraper">Instagram Search Scraper</a></td>
</tr>
</table>

> If you're comfortable with more complex settings, use our more advanced 🔗 [Instagram Scraper](https://apify.com/apify/instagram-scraper) or 🔗 [Instagram API Scraper](https://apify.com/apify/instagram-api-scraper). They cover almost all functionalities of the dedicated scrapers.

### ❓FAQ

#### Why did we introduce `downloadedVideo` URLs to download reels instead of relying on CDN-based video links?

`downloadedVideo` URLs are more reliable and globally accessible, with predictable expiration (downloaded video expires after 3 days) and no IP blocks. While CDN URLs were a cheaper option, they also expire unpredictably, are region-restricted, cause IP blocks on large runs, and sometimes separate audio from video which is not what users would want from their downloaded reels.

#### Can I track reel metrics over time?

Yes. Metrics like views, likes, comments, and shares are included in each scrape. You can store and track them over time to monitor performance.

#### Can I scrape multiple reels at once?

Yes. You can provide a list of reel URLs or an Instagram profile URL to scrape all Reels from that profile.

#### Are comments included in the reels scraping?

Yes, the latest 10 comments are included, along with replies, likes, and timestamps. You can also see if comments are disabled for a reel. If you want to scrape all

#### Can I scrape reels from private accounts?

No. The scraper only works for public reels. Private reels content will not be accessible.

#### Can I skip pinned reels when scraping Instagram reels?

Yes. You can choose whether to include or exclude pinned reels when scraping. Since pinned reels can sometimes be very old (and not relevant to your scrape), skipping them just makes sense sometimes. However, this option is only available in the JSON input, not in the user-facing UI. You can control it by setting it to `true`or `false`. For more details, check the [Input tab](https://apify.com/apify/instagram-post-scraper/input-schema) of the Actor.

#### Can I exclude pinned reels even if they are within the date range?

That’s not possible to filter out before scraping. The scraper will always include pinned reels if they match your Date filter settings. If you want to exclude them, you’ll need to filter the output data after the run by checking for `isPinned: true` and removing those items.

#### Is there any way to scrape only new reels (including pinned ones) while filtering out older pinned reels?

Yes, there is. You can combine the **Date filter** with **Pinned posts** parameter in JSON input. If you want to see reels newer than a certain date (using the Date filter `onlyPostsNewerThan`) and also include Pinned reels only if they meet that condition, set:

```json
"skipPinnedPosts": true,
"onlyPostsNewerThan": "1 day"
```

With this setup:

- Pinned reels that are newer than the time restriction will still be included.
- Older pinned reels will be skipped.

This way you’ll get the result you want: “Scrape pinned reels only if they fit the date restriction”.

#### How is video data returned?

Videos are returned as direct MP4 URLs. You also get all associated images for the reel in multiple resolutions.

#### Is there support for original audio?

Yes. You get full details on the audio, including artist, song name, and whether the original audio is used.

#### Is it legal to scrape Instagram reels?

Our Instagram Reel scraper only collects data that is publicly available on Instagram. It does not access private content. You should be aware that some public data may be considered personal data under regulations like the [GDPR](https://en.wikipedia.org/wiki/General_Data_Protection_Regulation). Only scrape data if you have a legitimate reason. For guidance, see our blog on [the legality of web scraping](https://blog.apify.com/is-web-scraping-legal/).

#### Can I integrate Instagram Reel data with other services?

Yes. Scraped reel data can be integrated with almost any cloud service or web app. Apify supports **Zapier, n8n, Slack, Make, Airbyte, Gumloop, CrewAI, IFTTT, Lindy, GitHub, Google Sheets, Google Drive**, [and more](https://apify.com/integrations). You can also use [webhooks](https://docs.apify.com/integrations/webhooks) to trigger actions whenever a run finishes, like sending notifications or syncing datasets.

#### Can I use the Instagram Reel Scraper with the Apify API?

Yes. The Apify API provides programmatic access to run Actors, fetch datasets, monitor performance, and manage tasks. For Node.js, use the apify-client [NPM package](https://apify.com/apify/instagram-reel-scraper/api/javascript). For Python, use the apify-client [PyPI package](https://apify.com/apify/instagram-reel-scraper/api/python). Full API docs are available in the [Apify API reference](https://docs.apify.com/api/v2).

#### Can I get Instagram Reel details through an MCP server?

Yes. You can [connect](https://apify.com/apify/instagram-reel-scraper/api/mcp) to an MCP server using clients like ClaudeDesktop or LibreChat, or build your own integration. For Instagram Reel Scraper:

1. Start a Server-Sent Events (SSE) session to receive a `sessionId`.
2. Send API messages using that `sessionId` to trigger the scraper.
3. The message starts the Instagram Reel Scraper with the provided input.
4. The response should be: Accepted.

Learn more in [MCP setup guide](https://blog.apify.com/how-to-use-mcp/).

#### Instagram Reel Scraper not working

The Apify team constantly improves Actor performance. If you find bugs or technical issues, please create an issue on the Actor’s [Issues tab](https://apify.com/apify/instagram-reel-scraper/issues/open).

# Actor input Schema

## `username` (type: `array`):

Add Instagram usernames, profile URLs, IDs, or direct reel URLs. Each item will be processed individually.

## `resultsLimit` (type: `integer`):

Set how many reels should be scraped per profile. For example, if set to 5, the scraper will extract up to 5 reels from each profile. This setting is ignored when scraping direct reel URLs.

## `onlyPostsNewerThan` (type: `string`):

Scrape reels from the provided date up to the present. Supported formats include `YYYY-MM-DD`, full ISO timestamps (e.g. `2025-09-23T10:02:01`), or relative time such as `1 day`, `2 weeks`, or `3 months`. All times are evaluated in UTC.

## `skipPinnedPosts` (type: `boolean`):

Enable this option if you want to exclude pinned reels from the overall results.

## `includeSharesCount` (type: `boolean`):

Extract the number of shares for each reel. Available for paying users only. Upgrade to the <a href='https://console.apify.com/billing/subscription' target='_blank' rel='noopener'>Starter plan</a> to unlock it.

## `includeTranscript` (type: `boolean`):

Extract a text transcript of the reel audio for content analysis. This <a href='https://apify.com/apify/instagram-reel-scraper/pricing' target='_blank' rel='noopener'>add-on feature</a> is charged per minute of audio.

## `includeDownloadedVideo` (type: `boolean`):

Download the reel video and store a local copy before Instagram links expire. This <a href='https://apify.com/apify/instagram-reel-scraper/pricing' target='_blank' rel='noopener'>add-on feature</a> is charged per 1 MB downloaded.

## Actor input object example

```json
{
  "username": [
    "natgeo"
  ],
  "resultsLimit": 27,
  "skipPinnedPosts": false,
  "includeSharesCount": false,
  "includeTranscript": false,
  "includeDownloadedVideo": false
}
```

# Actor output Schema

## `dataset` (type: `string`):

Dataset containing all scraped reels

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
    "username": [
        "natgeo"
    ],
    "resultsLimit": 27
};

// Run the Actor and wait for it to finish
const run = await client.actor("apify/instagram-reel-scraper").call(input);

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
    "username": ["natgeo"],
    "resultsLimit": 27,
}

# Run the Actor and wait for it to finish
run = client.actor("apify/instagram-reel-scraper").call(run_input=run_input)

# Fetch and print Actor results from the run's dataset (if there are any)
print("💾 Check your data here: https://console.apify.com/storage/datasets/" + run["defaultDatasetId"])
for item in client.dataset(run["defaultDatasetId"]).iterate_items():
    print(item)

# 📚 Want to learn more 📖? Go to → https://docs.apify.com/api/client/python/docs/quick-start

```

## CLI example

```bash
echo '{
  "username": [
    "natgeo"
  ],
  "resultsLimit": 27
}' |
apify call apify/instagram-reel-scraper --silent --output-dataset

```

## MCP server setup

```json
{
    "mcpServers": {
        "apify": {
            "command": "npx",
            "args": [
                "mcp-remote",
                "https://mcp.apify.com/?tools=apify/instagram-reel-scraper",
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
        "title": "Instagram Reel Scraper",
        "description": "Scrape or download Instagram reels. Just add Instagram profile or reel URL, and get caption, timestamp, transcript, hashtags, mentions, tagged users, comments, likes, shares, views, duration, and downloaded video. Export scraped data, schedule via API, and integrate with other tools or AI workflows.",
        "version": "0.0",
        "x-build-id": "01vy6F1SjaW9tK6UQ"
    },
    "servers": [
        {
            "url": "https://api.apify.com/v2"
        }
    ],
    "paths": {
        "/acts/apify~instagram-reel-scraper/run-sync-get-dataset-items": {
            "post": {
                "operationId": "run-sync-get-dataset-items-apify-instagram-reel-scraper",
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
        "/acts/apify~instagram-reel-scraper/runs": {
            "post": {
                "operationId": "runs-sync-apify-instagram-reel-scraper",
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
        "/acts/apify~instagram-reel-scraper/run-sync": {
            "post": {
                "operationId": "run-sync-apify-instagram-reel-scraper",
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
                "required": [
                    "username"
                ],
                "properties": {
                    "username": {
                        "title": "🎞️ Instagram username, profile URL, ID, or reel URL",
                        "type": "array",
                        "description": "Add Instagram usernames, profile URLs, IDs, or direct reel URLs. Each item will be processed individually.",
                        "items": {
                            "type": "string"
                        }
                    },
                    "resultsLimit": {
                        "title": "💯 Maximum reels per profile",
                        "minimum": 1,
                        "type": "integer",
                        "description": "Set how many reels should be scraped per profile. For example, if set to 5, the scraper will extract up to 5 reels from each profile. This setting is ignored when scraping direct reel URLs."
                    },
                    "onlyPostsNewerThan": {
                        "title": "📅 Scrape reels newer than",
                        "pattern": "^(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])(T[0-2]\\d:[0-5]\\d(:[0-5]\\d)?(\\.\\d+)?Z?)?$|^(\\d+)\\s*(minute|hour|day|week|month|year)s?$",
                        "type": "string",
                        "description": "Scrape reels from the provided date up to the present. Supported formats include `YYYY-MM-DD`, full ISO timestamps (e.g. `2025-09-23T10:02:01`), or relative time such as `1 day`, `2 weeks`, or `3 months`. All times are evaluated in UTC."
                    },
                    "skipPinnedPosts": {
                        "title": "📌 Skip pinned reels",
                        "type": "boolean",
                        "description": "Enable this option if you want to exclude pinned reels from the overall results.",
                        "default": false
                    },
                    "includeSharesCount": {
                        "title": "$ Include shares count",
                        "type": "boolean",
                        "description": "Extract the number of shares for each reel. Available for paying users only. Upgrade to the <a href='https://console.apify.com/billing/subscription' target='_blank' rel='noopener'>Starter plan</a> to unlock it.",
                        "default": false
                    },
                    "includeTranscript": {
                        "title": "$ Include transcript",
                        "type": "boolean",
                        "description": "Extract a text transcript of the reel audio for content analysis. This <a href='https://apify.com/apify/instagram-reel-scraper/pricing' target='_blank' rel='noopener'>add-on feature</a> is charged per minute of audio.",
                        "default": false
                    },
                    "includeDownloadedVideo": {
                        "title": "$ Include downloaded video",
                        "type": "boolean",
                        "description": "Download the reel video and store a local copy before Instagram links expire. This <a href='https://apify.com/apify/instagram-reel-scraper/pricing' target='_blank' rel='noopener'>add-on feature</a> is charged per 1 MB downloaded.",
                        "default": false
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
