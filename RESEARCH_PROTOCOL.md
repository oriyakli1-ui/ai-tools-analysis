# Channel validation protocol (run in a session that can use your Chrome)

Three candidates stay fixed for this test. Only the data may change the ranking.
- **A. Everyday science:** "why does that happen?" series (home, phone, weather, body habits), 30 s Shorts plus 6 to 10 min lessons.
- **B. How money works:** beginner mechanics (interest, inflation, credit, how a bank works), global English.
- **C. History micro-stories:** 30 to 45 s stories, later 8 to 10 min episodes.

## Prompt to paste into a Claude Code session on your own computer, with the Claude in Chrome extension connected
```
Use my Chrome (signed in to YouTube) to validate three YouTube channel ideas with measured data, not blog claims.
Ideas: A) everyday science explainers, B) how money works for beginners, C) history micro-stories.
For each idea, run the steps below and write results to research_results.md with a table per idea, the exact search phrases, links to every video and channel used, and the date. Never estimate a number you did not see; write "not visible" instead.

1. Search YouTube for 12 phrases per idea (a mix of question phrases people type and series phrases). Use the filters "This year" and sort by view count, then repeat with "Shorts".
2. For each phrase record the top 10 results: channel, subscribers, video views, upload date, length, and views divided by channel subscribers.
3. Find OUTLIERS: videos from channels under 100,000 subscribers with at least 100,000 views, uploaded in the last 12 months. List them with links. Count how many outliers each idea has. Many different small channels with outliers = open niche. Only large channels = hard niche.
4. Check the top 5 competitor channels per idea: upload frequency, median views of the last 15 videos, share of Shorts vs long videos, whether they use animation.
5. Open vidIQ, Social Blade, or YouTube Studio's Research tab if available and record search volume or "demand vs supply" for the 12 phrases.
6. Check Google Trends for 5 years for 3 core phrases per idea.
7. Read the top 20 comments on 3 outlier videos per idea. Quote verbatim what viewers ask for and what they say they will share.
8. Check which videos include affiliate links or sponsor reads, and which products.
9. Score each idea 1 to 5 on: demand, open niche (outlier count), shareability (comments, shares), monetization (long-video views, sponsor or affiliate presence), fit for 2D cartoon explainers. Show the numbers behind every score and say which idea wins and why.
Stop and tell me if YouTube asks for a login, a CAPTCHA, or blocks the page.
```

## Decision rules (write them before looking at the data)
1. **Open niche:** 5 or more outliers (under 100,000 subscribers, over 100,000 views, last 12 months) from at least 3 different channels in the sub-niche. If fewer than 3, the niche is closed or unproven.
2. **Demand:** the core phrases show steady or rising interest in Google Trends over 5 years, and the top results for question phrases have more than 100,000 views.
3. **Shareability:** comments contain "sent this to", "my mum/dad/friend", "needs to see this", or save and share counts are high relative to views.
4. **Monetization:** at least 3 competitors use affiliate links or sponsors in descriptions, and long videos in the niche reach 100,000+ views.
5. **Winner:** the idea that meets the most rules. If tied, choose the one with the most outliers from small channels.

## Then test with real videos (30 days)
Make 3 Shorts and 1 long video for the winning idea. Compare: views, average view duration, subscribers per 1,000 views, and shares. Keep going only if the numbers beat the channel's first 5 videos.
