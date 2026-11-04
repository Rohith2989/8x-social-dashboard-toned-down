import { CAMPAIGN, type Day, type Platform } from "./demo";
import { DAYS } from "./days";

/* The figures the overview shows, worked out from the days the way the product works them out. */

export type Range = "lifetime" | "14d" | "7d";

export const RANGES: { id: Range; label: string; days: number }[] = [
  { id: "lifetime", label: "Lifetime", days: CAMPAIGN.day },
  { id: "14d", label: "14 days", days: 14 },
  { id: "7d", label: "7 days", days: 7 },
];

export type Filter = "all" | Platform;

export const daysIn = (range: Range) => DAYS.slice(-RANGES.find((r) => r.id === range)!.days);

const on = (d: Day, f: Filter) => ({
  views: f === "all" ? d.views.tiktok + d.views.instagram : d.views[f],
  posts: f === "all" ? d.posts.tiktok + d.posts.instagram : d.posts[f],
});

export const dayViews = (d: Day, f: Filter = "all") => on(d, f).views;
export const dayPosts = (d: Day, f: Filter = "all") => on(d, f).posts;

export function totals(days: Day[]) {
  const sum = (pick: (d: Day) => number) => days.reduce((a, d) => a + pick(d), 0);
  const views = sum((d) => d.views.tiktok + d.views.instagram);
  const likes = sum((d) => d.likes);
  const comments = sum((d) => d.comments);
  const shares = sum((d) => d.shares);
  return {
    views,
    likes,
    comments,
    shares,
    posts: sum((d) => d.posts.tiktok + d.posts.instagram),
    // (likes + comments + shares) / views, in percent
    engagement: views ? ((likes + comments + shares) / views) * 100 : 0,
    byPlatform: {
      tiktok: { views: sum((d) => d.views.tiktok), posts: sum((d) => d.posts.tiktok) },
      instagram: { views: sum((d) => d.views.instagram), posts: sum((d) => d.posts.instagram) },
    } as Record<Platform, { views: number; posts: number }>,
  };
}

export type Totals = ReturnType<typeof totals>;

// the last 7 days against the 7 before: a percent change, and for the engagement rate a change in points
export function weekChange() {
  const now = totals(DAYS.slice(-7));
  const before = totals(DAYS.slice(-14, -7));
  const pct = (a: number, b: number) => (b ? ((a - b) / b) * 100 : 0);
  return {
    views: pct(now.views, before.views),
    likes: pct(now.likes, before.likes),
    comments: pct(now.comments, before.comments),
    shares: pct(now.shares, before.shares),
    posts: pct(now.posts, before.posts),
    engagement: now.engagement - before.engagement,
  };
}

// the pace: posts out against the plan, prorated to today
export function pace() {
  const delivered = totals(DAYS).posts;
  const expected = Math.round((CAMPAIGN.postsPlanned * CAMPAIGN.day) / CAMPAIGN.days);
  return { delivered, expected, planned: CAMPAIGN.postsPlanned, ahead: delivered - expected, perDay: delivered / CAMPAIGN.day };
}
