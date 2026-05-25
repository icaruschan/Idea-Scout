All Actors
Twitter Trends Scraper avatar
Twitter Trends Scraper
$0.39 / 1,000 results
karamelo/twitter-trends-scraper


5.0

(2)

31
963
107
Crafted by
karamelo avatar
karamelo
Save & Start
Save as a new task
API

Scrape the top trends for each data point spanning 8 time periods from live... to... 3 days about trending tweets and hashtags and topics on Twitter from any of the countries listed below. Including volume of tweets. Pricing from $0.09 per 1000 results.
Input
Information
Runs
0

Builds
5

Integrations
0

Monitoring
Issues
0

Saved tasks
0

Reviews
Build
0.0.33 / latest


Readme


Input

Twitter Trends Proxy Scraper
If you want to know what's trending on twitter right now, or one hour ago or three or maybe what was trending twitter yesterday, or three days ago, this is the place.

Scrape trending tweets and hashtags on Twitter from any country 🌍.
This actor scrapes the top 50 for each datapoint spanning 8 time periods about trending topics, tweets, hashtags on Twitter from any of the countries listed below. It utilizes proxies to ensure reliable scraping and to avoid rate limits imposed by the endpoint. The actor outputs the trends for each country as an array of JSON objects, including the time of scraping, trend name, the time it was trending, and its volume of tweets. This data can be useful for:

Market research 📊: Analyze trending topics to understand consumer interests and preferences in different regions.
Social media monitoring 📢: Track trending topics to identify emerging news and conversations.
Content creation ✍️: Use trending topics as inspiration for content creation relevant to specific audiences.
Competitive analysis 📈: Monitor competitor activity and industry trends.
Supported Countries:
The actor currently supports scraping trends from the following countries:

1 World
2 United States
3 Canada
4 Mexico
5 United Kingdom
6 France
7 Germany
8 Italy
9 Spain
10 Portugal
11 Netherlands
12 Denmark
13 Austria
14 Belgium
15 Switzerland
16 Greece
17 Russian Federation
18 Turkey
19 Korea
20 Singapore
21 Indonesia
22 Philippines
23 Viet Nam
24 Thailand
25 Australia
26 Israel
27 United Arab Emirates
28 Saudi Arabia
29 Argentina
30 Brazil
31 Egypt
32 Nigeria
33 Kenya
34 South Africa
35 Japan
The actor outputs a JSON array containing objects, where each object represents a trending topic at a specific point in time. Here's an example:

Time periods are:
Live
1 hour ago
3 hours ago
6 hours ago
12 hour ago
24 hours ago
2 days ago
3 days ago

Important update: X (formerly Twitter) has recently removed the tweet/post count display from trends. This change started around January 13, 2026, and users have reported it widely across forums and social media.

Reason for Change:
X implemented this as part of a UI simplification effort to promote more natural engagement, reducing focus on raw numbers that could be manipulated by bots or paid promotions. It's not a bug but a deliberate update, similar to past tweaks in how trends and metrics appear.

Output Example:
[
  {
    "time": "2024-09-09T01:11:10.312Z",
    "timePeriod": "Live",
    "trend": "Browns",
    "volume": "94,633Tweets"
  },
   // ... more Live trends ...  
    "time": "2024-09-09T01:11:10.312Z",
    "timePeriod": "1 hour ago",
    "trend": "Browns",
    "volume": "85,079Tweets"
  },
  // ... more 1 hour ago trends ...
  {
    "time": "2024-09-09T01:11:10.312Z",
    "timePeriod": "3 hour ago",
    "trend": "Panthers",
    "volume": "63,266Tweets"
  },
  // ... more 3 hours ago trends ...
  // ... and so on ...
]

Understanding the timePeriod Field

The timePeriod field is crucial for understanding the context of each trend. It indicates when the specific trend was observed, relative to the time the actor was run. Here's a breakdown of possible values:

"Live" : This means the trend is currently trending in real-time.
"X hour(s) ago" : This indicates the trend was trending X hours before the actor's execution.
"X day(s) ago" : This indicates the trend was trending X days before the actor's execution.
By analyzing the timePeriod along with the trend itself, you can gain valuable insights into how trends evolve over time. For example, you can identify trends that are quickly gaining popularity ("Live") versus trends that have been sustained for a longer period ("X days ago").

Notes

Twitter may occasionally change its website structure or API, which could impact the actor's functionality. If you encounter any issues, please report them on the issues tab.
The actor relies on proxies to avoid being blocked and stay anonymous. However, there's always a small chance to be detected and block the proxies. If this happens, you might need to adjust your proxy settings to Residential, they are fast and much less blocked.