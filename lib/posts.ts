import { NOW, PLATFORM_LABELS, type Platform } from "./demo";
import { FLAG_REASONS, POSTS, ROSTER, type RosterCreator } from "./roster";
import { engagementOf, type GenPost } from "./post-gen";
import { scriptOfPost } from "./plan";

/*
  Posts & feed's data (docs/posts.md): every post on the campaign with its creator, the product's milestone ladder,
  what the toolbar asks for and the posts it gives, the feed's days, the table's order, the CSV, and a post's views
  over time. The posts themselves are made with the roster (lib/post-gen.ts), so they add up with Creators and the
  overview.
*/

export type FeedPost = GenPost & { creator: RosterCreator; engagement: number };

const BY_ID = new Map(ROSTER.map((c) => [c.id, c]));

export const FEED: FeedPost[] = POSTS.map((p) => ({ ...p, creator: BY_ID.get(p.creatorId) as RosterCreator, engagement: engagementOf(p) }));

export const postById = (id: string | null) => (id ? (FEED.find((p) => p.id === id) ?? null) : null);

/* --- the milestone ladder (the product's src/lib/brand-milestones.ts): a post's tier is the highest it passed --- */

export const MILESTONES = [
  { key: "300", at: 300, tier: 1 },
  { key: "1K", at: 1_000, tier: 2 },
  { key: "5K", at: 5_000, tier: 2 },
  { key: "10K", at: 10_000, tier: 3 },
  { key: "50K", at: 50_000, tier: 3 },
  { key: "100K", at: 100_000, tier: 4 },
  { key: "500K", at: 500_000, tier: 4 },
  { key: "750K", at: 750_000, tier: 5 },
  { key: "1M", at: 1_000_000, tier: 5 },
] as const;

export type Milestone = (typeof MILESTONES)[number];
export type MilestoneKey = Milestone["key"];

export const milestoneLabel = (m: Milestone) => (m.key === "1M" ? "1M+" : m.key);

export function milestoneOf(views: number): Milestone | null {
  let reached: Milestone | null = null;
  for (const m of MILESTONES) if (views >= m.at) reached = m;
  return reached;
}

export const nextMilestone = (views: number): Milestone | null => MILESTONES.find((m) => views < m.at) ?? null;

/* --- what the toolbar asks for --- */

export type PostView = "feed" | "table";
export type PostSort = "account" | "posted" | "platform" | "views" | "likes" | "comments" | "shares" | "engagement" | "status" | "sparkCode" | "country";

export type PostsQuery = {
  q: string;
  creators: string[];
  platforms: Platform[];
  // the ladder's pick: the posts that passed this milestone
  passed: MilestoneKey | null;
  day: string | null;
  view: PostView;
  sort: PostSort | null;
  dir: "desc" | "asc";
  open: string | null;
  // the posts made to one script of the Content plan (a plan's first day and the script's number)
  script: string | null;
  // the feed: how many of its days are shown; the table: how many rows; the day the table was taken to
  days: number;
  rows: number;
  at: string | null;
};

export const FEED_DAYS = 7;
export const TABLE_ROWS = 50;

export const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .toLowerCase();

type Facet = "q" | "creators" | "platforms" | "passed" | "day" | "script";

// a post the query keeps; `except` leaves one facet out, for that facet's own counts
export function keeps(p: FeedPost, q: PostsQuery, except?: Facet) {
  if (except !== "q" && q.q) {
    const t = fold(q.q.replace(/^@/, ""));
    if (!fold(`${p.caption} ${p.handle} ${p.creator.name}`).includes(t)) return false;
  }
  if (except !== "creators" && q.creators.length && !q.creators.includes(p.creatorId)) return false;
  if (except !== "platforms" && q.platforms.length && !q.platforms.includes(p.platform)) return false;
  if (except !== "passed" && q.passed) {
    const m = MILESTONES.find((x) => x.key === q.passed);
    if (m && p.views < m.at) return false;
  }
  if (except !== "day" && q.day && p.postedAt.slice(0, 10) !== q.day) return false;
  if (except !== "script" && q.script && scriptOfPost(p.id)?.id !== q.script) return false;
  return true;
}

/* --- the feed's days: newest first, and inside a day the biggest posts lead (the product's order) --- */

export type FeedDay = { date: string; posts: FeedPost[]; views: number };

export function byDay(list: FeedPost[]): FeedDay[] {
  const days = new Map<string, FeedPost[]>();
  for (const p of list) {
    const d = p.postedAt.slice(0, 10);
    days.set(d, [...(days.get(d) ?? []), p]);
  }
  return [...days.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, posts]) => ({ date, posts: posts.sort((a, b) => b.views - a.views), views: posts.reduce((a, p) => a + p.views, 0) }));
}

/* --- the table's order: a column, highest first or lowest; with none, the newest first --- */

const VALUE: Record<PostSort, (p: FeedPost) => number | string> = {
  account: (p) => p.handle,
  posted: (p) => p.postedAt,
  platform: (p) => p.platform,
  views: (p) => p.views,
  likes: (p) => p.likes,
  comments: (p) => p.comments,
  // a share count the platform has not reported sorts below every reported one
  shares: (p) => p.shares ?? -1,
  engagement: (p) => p.engagement,
  status: (p) => (p.status === "deleted" ? 0 : p.flag ? 1 : 2),
  sparkCode: (p) => p.sparkCode ?? "",
  country: (p) => p.creator.country.name,
};

export function ordered(list: FeedPost[], sort: PostSort | null, dir: "desc" | "asc") {
  if (!sort) return [...list].sort((a, b) => (a.postedAt < b.postedAt ? 1 : -1));
  const v = VALUE[sort];
  const out = [...list].sort((a, b) => {
    const x = v(a);
    const y = v(b);
    return typeof x === "number" && typeof y === "number" ? y - x : String(y).localeCompare(String(x));
  });
  return dir === "asc" ? out.reverse() : out;
}

/* --- links, the CSV, a post's views over time --- */

// the sample's own addresses on the platforms (the product carries the post's real URL)
export const postUrl = (p: GenPost) => {
  const n = [...p.id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 1_000_000_007, 7);
  return p.platform === "tiktok"
    ? `https://www.tiktok.com/@${p.handle}/video/74${String(n).padStart(17, "3")}`
    : `https://www.instagram.com/reel/C${n.toString(36).padStart(10, "x")}/`;
};

export const reasonLabel = (p: GenPost) => p.flag?.reasons.map((r) => FLAG_REASONS.find((x) => x.id === r)?.label).join(", ") ?? "";

export function postsCsv(list: FeedPost[]) {
  const head = ["Post", "Account", "Creator", "Posted (UTC)", "Platform", "Caption", "Milestone", "Views", "Likes", "Comments", "Shares", "Engagement rate", "Status", "Flag", "Spark code", "Country"];
  const rows = list.map((p) => {
    const m = milestoneOf(p.views);
    return [
      postUrl(p),
      `@${p.handle}`,
      p.creator.name,
      p.postedAt.replace("T", " ").slice(0, 16),
      PLATFORM_LABELS[p.platform],
      p.caption,
      m ? milestoneLabel(m) : "Under 300",
      p.views,
      p.likes,
      p.comments,
      p.shares ?? "N/A",
      `${p.engagement.toFixed(1)}%`,
      p.status === "deleted" ? "Deleted" : "Live",
      reasonLabel(p),
      p.sparkCode ?? "",
      p.creator.country.name,
    ];
  });
  return [head, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
}

// its views by day since it went out (or until it was deleted): most come in its first days, so the running total
// rises fast and then settles; `added` is what each day brought
export function viewSeries(p: GenPost) {
  const start = Date.parse(`${p.postedAt.slice(0, 10)}T00:00:00Z`);
  const end = p.deletedAt ? Math.min(NOW, Date.parse(p.deletedAt)) : NOW;
  const days = Math.max(1, Math.floor((end - start) / 86_400_000) + 1);
  const k = 0.85;
  const f = (d: number) => 1 - Math.exp(-k * (d + 0.6));
  const top = f(days - 1);
  const total = Array.from({ length: days }, (_, d) => (d === days - 1 ? p.views : Math.round((p.views * f(d)) / top)));
  return total.map((views, d) => ({
    date: new Date(start + d * 86_400_000).toISOString().slice(0, 10),
    views,
    added: views - (d ? total[d - 1] : 0),
  }));
}
