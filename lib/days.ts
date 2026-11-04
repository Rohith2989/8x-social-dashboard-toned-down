import { CAMPAIGN, type Day, type Platform } from "./demo";
import { POSTS } from "./roster";

/*
  The campaign's days, counted from its posts (lib/roster.ts makes them from the roster's accounts), so the overview's
  calendar and chart, the creators' cards and the feed always agree. A day's views, likes, comments and shares are the
  lifetime figures of the posts that went out that day (the product's rule: older days have had longer to grow); a
  share the platform has not reported counts as none. Its creators are everyone who posted, the most viewed first.
*/

const dates = Array.from({ length: CAMPAIGN.day }, (_, i) => new Date(Date.parse(CAMPAIGN.startedAt) + i * 864e5).toISOString().slice(0, 10));

export const DAYS: Day[] = dates.map((date) => {
  const list = POSTS.filter((p) => p.postedAt.slice(0, 10) === date);
  const on = (platform: Platform) => list.filter((p) => p.platform === platform);
  const byCreator = new Map<string, number>();
  list.forEach((p) => byCreator.set(p.creatorId, (byCreator.get(p.creatorId) ?? 0) + p.views));
  return {
    date,
    posts: { tiktok: on("tiktok").length, instagram: on("instagram").length },
    views: { tiktok: on("tiktok").reduce((a, p) => a + p.views, 0), instagram: on("instagram").reduce((a, p) => a + p.views, 0) },
    likes: list.reduce((a, p) => a + p.likes, 0),
    comments: list.reduce((a, p) => a + p.comments, 0),
    shares: list.reduce((a, p) => a + (p.shares ?? 0), 0),
    creators: [...byCreator.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id),
  };
});
