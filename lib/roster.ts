/*
  The sample roster for the Creators page: 24 creators on the campaign, the accounts they post from and their posts.
  Eighteen are real 8x creators (their faces and stills are from their own videos in the catalog) and all of them are
  in good standing. The six who are idle, dropped or flagged are invented and shown by their initials: a flag or a
  "dropped" next to a real person's face would be a judgement nobody made.

  The shapes follow the product (BrandCreator, SocialAccount, BrandCreatorPost, brand-flags.ts):
    - a creator posts from one account per platform, made for the campaign (creators post from new accounts)
    - status: active (a post in the last 72 hours), idle (none since), dropped (off the campaign)
    - a flag is the brand's word to its account manager; it removes nobody
    - a creator's figures are sums across their accounts, labelled as sums; average per post is views over videos
*/

import { NOW, TOP_POSTS, type Platform } from "./demo";
import { creatorPosts, type GenPost } from "./post-gen";

export type Status = "active" | "idle" | "dropped";

export type FlagReason = "offBrief" | "wrongProduct" | "quality" | "compliance" | "other";

export const FLAG_REASONS: { id: FlagReason; label: string; line: string }[] = [
  { id: "offBrief", label: "Off brief", line: "The videos miss what the brief asked for" },
  { id: "wrongProduct", label: "Wrong product", line: "They show or name the wrong product" },
  { id: "quality", label: "Quality", line: "Sound, light or framing not up to the bar" },
  { id: "compliance", label: "Compliance", line: "A claim, a disclosure or a rule broken" },
  { id: "other", label: "Other", line: "Something else; say what in the note" },
];

export const STATUS_LABELS: Record<Status, string> = { active: "Active", idle: "Idle", dropped: "Dropped" };

export const ACTIVE_HOURS = 72;

// the sample's now (lib/demo.ts): the campaign's 24th day, in the afternoon
export { NOW };

export type Country = { code: "IN" | "BR" | "TR" | "PH" | "AE" | "US"; name: string };

export const COUNTRIES: Record<Country["code"], Country> = {
  IN: { code: "IN", name: "India" },
  BR: { code: "BR", name: "Brazil" },
  TR: { code: "TR", name: "Turkey" },
  PH: { code: "PH", name: "Philippines" },
  AE: { code: "AE", name: "United Arab Emirates" },
  US: { code: "US", name: "United States" },
};

export type Account = {
  id: string;
  platform: Platform;
  handle: string;
  followers: number;
  videos: number;
  views: number;
  likes: number;
  comments: number;
  shares: number | null;
  lastPostAt: string | null;
};

export type RosterPost = { id: string; platform: Platform; poster: string; video?: string; views: number; postedAt: string };

export type Flag = { reasons: FlagReason[]; by: string; at: string; note?: string };

/*
  A creator's banner, 8x's own (never their photos): soft lights in the vertical's colours over one of six grounds
  (components/creators/banner.tsx draws them). Each creator keeps their palette whatever the sort; in the default
  order the palettes take turns, dark and light by turns, so no two neighbours share one at three, four or five
  across.
*/
export type BannerPalette = "cobalt" | "daybreak" | "iris" | "sky" | "night" | "lilac";

const PALETTE_TURNS: BannerPalette[] = ["cobalt", "daybreak", "iris", "sky", "night", "lilac"];

// the roster in its default order (most views first), which sets whose turn each palette is
const BANNER_ORDER = [
  "aastha", "carla", "sevda", "pooja", "mariana", "sultan", "heloisa", "kristine", "sila", "manisha", "gizem", "bhavishay",
  "ozlem", "kubra", "nicole", "dana", "leo", "elif", "krishna", "priya", "shreya", "aleyna", "omar", "jade",
];

const bannerOf = (id: string, index: number): BannerPalette => {
  const at = BANNER_ORDER.indexOf(id);
  return PALETTE_TURNS[(at < 0 ? index : at) % PALETTE_TURNS.length];
};

export type RosterCreator = {
  id: string;
  name: string;
  initials: string;
  avatar: string | null;
  country: Country;
  joinedAt: string;
  status: Status;
  endedAt?: string;
  flag: Flag | null;
  banner: BannerPalette;
  accounts: Account[];
  posts: RosterPost[];
  daily: number[]; // views of their posts by the day they went out, the last 14 days
  // the sums across their accounts
  videos: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  avgPerPost: number;
  engagement: number; // percent
  lastPostAt: string | null;
};

type Seed = {
  id: string;
  name: string;
  country: Country["code"];
  platforms: Platform[];
  views: number;
  videos: number;
  hoursSincePost: number | null;
  joined: string;
  status?: Status;
  endedAt?: string;
  flag?: Flag;
  real?: boolean; // a real creator: face and stills from the catalog
  video?: boolean; // their best post plays (the overview's top posts)
};

// the roster, most views first within each group; joined dates are the campaign's first day unless they came later
const SEEDS: Seed[] = [
  { id: "aastha", name: "Aastha Bishnoi", country: "IN", platforms: ["instagram"], views: 241_200, videos: 15, hoursSincePost: 6, joined: "2026-10-11", real: true, video: true },
  { id: "carla", name: "Carla Carvalho", country: "BR", platforms: ["tiktok"], views: 214_800, videos: 16, hoursSincePost: 3, joined: "2026-10-11", real: true, video: true },
  { id: "sevda", name: "Şevda Düzyol", country: "TR", platforms: ["tiktok", "instagram"], views: 198_400, videos: 17, hoursSincePost: 9, joined: "2026-10-11", real: true, video: true },
  { id: "pooja", name: "Pooja B Kittur", country: "IN", platforms: ["instagram"], views: 166_900, videos: 14, hoursSincePost: 20, joined: "2026-10-11", real: true, video: true },
  { id: "mariana", name: "Mariana Fagundes", country: "BR", platforms: ["instagram"], views: 148_300, videos: 14, hoursSincePost: 27, joined: "2026-10-11", real: true, video: true },
  { id: "sultan", name: "Sultan Aydın", country: "TR", platforms: ["instagram"], views: 139_700, videos: 14, hoursSincePost: 30, joined: "2026-10-11", real: true, video: true },
  { id: "heloisa", name: "Heloisa Terui", country: "BR", platforms: ["instagram", "tiktok"], views: 126_100, videos: 16, hoursSincePost: 4, joined: "2026-10-11", real: true },
  { id: "kristine", name: "Kristine Gorgonio", country: "PH", platforms: ["instagram"], views: 117_600, videos: 14, hoursSincePost: 15, joined: "2026-10-11", real: true },
  { id: "sila", name: "Sıla Baysal", country: "TR", platforms: ["instagram", "tiktok"], views: 109_200, videos: 15, hoursSincePost: 11, joined: "2026-10-11", real: true },
  { id: "manisha", name: "Manisha Bharadwaj", country: "IN", platforms: ["instagram"], views: 98_500, videos: 13, hoursSincePost: 22, joined: "2026-10-11", real: true },
  { id: "gizem", name: "Gizem Güzbek", country: "TR", platforms: ["instagram", "tiktok"], views: 92_700, videos: 14, hoursSincePost: 35, joined: "2026-10-11", real: true },
  { id: "bhavishay", name: "Bhavishay Grover", country: "IN", platforms: ["instagram"], views: 86_300, videos: 13, hoursSincePost: 18, joined: "2026-10-11", real: true },
  { id: "ozlem", name: "Özlem Kurnaz", country: "TR", platforms: ["instagram"], views: 79_800, videos: 13, hoursSincePost: 41, joined: "2026-10-11", real: true },
  { id: "kubra", name: "Kübra Arslan", country: "TR", platforms: ["instagram"], views: 71_400, videos: 12, hoursSincePost: 26, joined: "2026-10-11", real: true },
  { id: "nicole", name: "Nicole Santos", country: "AE", platforms: ["instagram"], views: 64_900, videos: 12, hoursSincePost: 48, joined: "2026-10-11", real: true },
  { id: "krishna", name: "Krishna Barot", country: "IN", platforms: ["instagram"], views: 28_600, videos: 4, hoursSincePost: 8, joined: "2026-10-30", real: true },
  { id: "shreya", name: "Shreya B", country: "IN", platforms: ["instagram"], views: 21_900, videos: 3, hoursSincePost: 13, joined: "2026-11-01", real: true },
  { id: "aleyna", name: "Aleyna Özkan", country: "TR", platforms: ["instagram"], views: 14_200, videos: 2, hoursSincePost: 19, joined: "2026-11-02", real: true },
  {
    id: "dana", name: "Dana Kim", country: "US", platforms: ["tiktok", "instagram"], views: 58_400, videos: 9, hoursSincePost: 30, joined: "2026-10-11",
    flag: { reasons: ["offBrief"], by: "Alex Carter", at: "2026-11-01T10:20:00Z", note: "Two of this week's videos never show the app." },
  },
  { id: "leo", name: "Leo Martins", country: "BR", platforms: ["tiktok"], views: 38_900, videos: 6, hoursSincePost: 118, joined: "2026-10-11", status: "idle" },
  { id: "elif", name: "Elif Demir", country: "TR", platforms: ["instagram", "tiktok"], views: 31_600, videos: 5, hoursSincePost: 142, joined: "2026-10-11", status: "idle" },
  { id: "priya", name: "Priya Nair", country: "IN", platforms: ["instagram"], views: 22_300, videos: 4, hoursSincePost: 190, joined: "2026-10-11", status: "idle" },
  { id: "omar", name: "Omar Haddad", country: "AE", platforms: ["tiktok"], views: 12_100, videos: 2, hoursSincePost: 330, joined: "2026-10-11", status: "dropped", endedAt: "2026-10-20" },
  { id: "jade", name: "Jade Wilson", country: "US", platforms: ["instagram"], views: 7_800, videos: 1, hoursSincePost: 410, joined: "2026-10-11", status: "dropped", endedAt: "2026-10-17" },
];

// the seeds' views are shares; scaled so the roster adds up to the campaign's views
const SCALE = 2_401_883 / SEEDS.reduce((a, x) => a + x.views, 0);

const rnd = (n: number) => {
  const x = Math.sin(n * 91.345 + 3.1) * 10_000;
  return x - Math.floor(x);
};
const seedOf = (id: string) => [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
const iso = (ms: number) => new Date(ms).toISOString();
const slug = (name: string) =>
  name
    .split(" ")[0]
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .toLowerCase();

// every post on the campaign, filled as the roster is built (lib/posts.ts reads them, lib/days.ts counts them)
const ALL_POSTS: GenPost[] = [];

// the invented creators' trouble on their posts: a dropped creator's post deleted, the flagged creator's latest two
const TROUBLE: Record<string, { deleted?: number; flagged?: number }> = {
  omar: { deleted: 1 },
  jade: { deleted: 1 },
  dana: { flagged: 2 },
};

const dateOf = (ms: number) => new Date(ms).toISOString().slice(0, 10);

function build(s: Seed, index: number): RosterCreator {
  const k = seedOf(s.id);
  const status: Status = s.status ?? "active";
  const lastPostAt = s.hoursSincePost == null ? null : iso(NOW - s.hoursSincePost * 3_600_000);
  // split their figures across their accounts, the first platform carrying more
  const split = s.platforms.length === 1 ? [1] : [0.62, 0.38];
  const targets = s.platforms.map((platform, i) => {
    const views = Math.round(s.views * SCALE * split[i]);
    const videos = Math.max(1, Math.round(s.videos * split[i]));
    // an account with one of the overview's top posts carries that post's figures and enough for the rest
    const pin = TOP_POSTS.find((p) => p.creator.id === s.id && p.platform === platform);
    const rest = views - (pin?.views ?? 0);
    return {
      id: `${s.id}-${platform}`,
      platform,
      handle: `${slug(s.name)}.meridian`,
      videos,
      views,
      likes: Math.max(Math.round(views * (0.042 + rnd(k + i + 7) * 0.012)), (pin?.likes ?? 0) + Math.round(rest * 0.036)),
      comments: Math.max(Math.round(views * (0.003 + rnd(k + i + 9) * 0.0015)), (pin?.comments ?? 0) + Math.round(rest * 0.0026)),
      shares: Math.max(Math.round(views * (0.003 + rnd(k + i + 13) * 0.002)), (pin?.shares ?? 0) + Math.round(rest * 0.0022)),
      lastPostAt: i === 0 ? lastPostAt : lastPostAt == null ? null : iso(Date.parse(lastPostAt) - (8 + rnd(k) * 30) * 3_600_000),
    };
  });

  const posts = creatorPosts({
    id: s.id,
    joined: s.joined,
    real: !!s.real,
    accounts: targets,
    deleted: TROUBLE[s.id]?.deleted,
    flag: s.flag,
    flagged: TROUBLE[s.id]?.flagged,
  });
  ALL_POSTS.push(...posts);

  // each account's figures are its posts' own sums; shares only where the platform has reported them
  const accounts: Account[] = targets.map((t, i) => {
    const mine = posts.filter((p) => p.accountId === t.id);
    const reported = mine.filter((p) => p.shares != null);
    const newest = mine.reduce<string | null>((a, p) => (a == null || p.postedAt > a ? p.postedAt : a), null);
    return {
      id: t.id,
      platform: t.platform,
      handle: t.handle,
      followers: Math.round((900 + rnd(k + i) * 9_000) * (status === "dropped" ? 0.3 : 1)),
      videos: mine.length,
      views: mine.reduce((a, p) => a + p.views, 0),
      likes: mine.reduce((a, p) => a + p.likes, 0),
      comments: mine.reduce((a, p) => a + p.comments, 0),
      // missing is not zero: an account none of whose posts have reported shares yet has none to sum
      shares: reported.length ? reported.reduce((a, p) => a + (p.shares ?? 0), 0) : null,
      lastPostAt: newest,
    };
  });
  const videos = accounts.reduce((a, x) => a + x.videos, 0);
  const views = accounts.reduce((a, x) => a + x.views, 0);
  const likes = accounts.reduce((a, x) => a + x.likes, 0);
  const comments = accounts.reduce((a, x) => a + x.comments, 0);
  const sharesSum = accounts.reduce((a, x) => a + (x.shares ?? 0), 0);

  // the last fourteen days: the views of their posts by the day each went out
  const daily = Array.from({ length: 14 }, (_, d) => {
    const day = dateOf(NOW - (13 - d) * 86_400_000);
    return posts.filter((p) => p.postedAt.slice(0, 10) === day).reduce((a, p) => a + p.views, 0);
  });

  // their best posts, by views: the real creators' own stills (the invented have none to show)
  const best: RosterPost[] = posts
    .filter((p) => p.poster)
    .sort((a, b) => b.views - a.views)
    .slice(0, 3)
    .map((p) => ({ id: p.id, platform: p.platform, poster: p.poster as string, video: p.video ?? undefined, views: p.views, postedAt: p.postedAt }));

  return {
    id: s.id,
    name: s.name,
    initials: s.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    avatar: s.real ? `/media/people/${s.id}.webp` : null,
    country: COUNTRIES[s.country],
    joinedAt: s.joined,
    status,
    endedAt: s.endedAt,
    flag: s.flag ?? null,
    banner: bannerOf(s.id, index),
    accounts,
    posts: best,
    daily,
    videos,
    views,
    likes,
    comments,
    shares: sharesSum,
    avgPerPost: Math.round(views / Math.max(videos, 1)),
    engagement: views ? ((likes + comments + sharesSum) / views) * 100 : 0,
    lastPostAt: accounts.reduce<string | null>((a, x) => (x.lastPostAt && (a == null || x.lastPostAt > a) ? x.lastPostAt : a), null),
  };
}

export const ROSTER: RosterCreator[] = SEEDS.map(build);

// every post on the campaign, newest first
export const POSTS: GenPost[] = [...ALL_POSTS].sort((a, b) => (a.postedAt < b.postedAt ? 1 : -1));

export const PLANNED_CREATORS = 30;

// "2 h ago", "Yesterday", "4 days ago", "3 weeks ago"
export function since(isoDate: string | null) {
  if (!isoDate) return "Never";
  const h = (NOW - Date.parse(isoDate)) / 3_600_000;
  if (h < 1) return "Just now";
  if (h < 24) return `${Math.floor(h)} h ago`;
  if (h < 48) return "Yesterday";
  if (h < 24 * 14) return `${Math.floor(h / 24)} days ago`;
  return `${Math.floor(h / (24 * 7))} weeks ago`;
}

export function stamp(isoDate: string) {
  const d = new Date(isoDate);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}, ${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")} UTC`;
}

/* --- what the toolbar asks for, and the roster it gives --- */

export type SortKey = "views" | "avgPerPost" | "videos" | "likes" | "comments" | "lastPost" | "name";

export const SORTS: { id: SortKey; label: string }[] = [
  { id: "views", label: "Views" },
  { id: "avgPerPost", label: "Avg per post" },
  { id: "videos", label: "Videos" },
  { id: "likes", label: "Likes" },
  { id: "comments", label: "Comments" },
  { id: "lastPost", label: "Last post" },
  { id: "name", label: "Name" },
];

export type Query = {
  q: string;
  status: Status | "all";
  platforms: Platform[];
  country: Country["code"] | "all";
  sort: SortKey;
  dir: "desc" | "asc";
};

export const DEFAULT_QUERY: Query = { q: "", status: "all", platforms: [], country: "all", sort: "views", dir: "desc" };

const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .toLowerCase();

export const matches = (c: RosterCreator, q: string) =>
  !q || fold(c.name).includes(fold(q)) || c.accounts.some((a) => fold(`@${a.handle}`).includes(fold(q.startsWith("@") ? q : `${q}`)));

// AND across the filters, OR within the platforms; the status is left out when counting the statuses themselves
export function applies(c: RosterCreator, query: Query, skip?: "status" | "country" | "platforms") {
  if (!matches(c, query.q)) return false;
  if (skip !== "status" && query.status !== "all" && c.status !== query.status) return false;
  if (skip !== "platforms" && query.platforms.length && !c.accounts.some((a) => query.platforms.includes(a.platform))) return false;
  if (skip !== "country" && query.country !== "all" && c.country.code !== query.country) return false;
  return true;
}

export function sorted(list: RosterCreator[], sort: SortKey, dir: "desc" | "asc") {
  const value = (c: RosterCreator) =>
    sort === "lastPost" ? (c.lastPostAt ? Date.parse(c.lastPostAt) : 0) : sort === "name" ? 0 : (c[sort] as number);
  const out = [...list].sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : value(b) - value(a)));
  return dir === "asc" ? out.reverse() : out;
}
