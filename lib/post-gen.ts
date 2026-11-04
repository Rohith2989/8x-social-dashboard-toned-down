/*
  The campaign's posts, generated once and deterministically from the roster's accounts: lib/roster.ts hands every
  creator here with their accounts' figures, so each account's posts add up to exactly what Creators shows for it,
  and the overview's days are counted from these posts (lib/days.ts). Nothing here is random at run time.

  A post carries what the product's row does (BrandPostRow, server/api/brand/campaigns/posts/schema.ts): the account
  and creator it went out from, when, its caption, views, likes, comments and shares, its spark code, its status and
  the brand's open flag on it. The product's rules kept:
    - shares are null where the platform has not reported them: an Instagram post's engagement arrives a day or two
      after it goes out, and missing is not zero
    - a spark code is TikTok's, and only once the creator has shared it
    - a deleted post keeps its figures (they counted toward delivery); a flag removes nothing
  The real creators' posts carry their own stills and, for their best ones, short loops from their videos in the
  catalog (scripts/feed.py cut them; its manifest says how many). The overview's six top posts are pinned as they are.
*/

import manifest from "@/public/media/feed/manifest.json";
import { CAMPAIGN, NOW, TOP_POSTS, type Platform } from "./demo";
import { CAPTIONS } from "./captions";
import type { Flag } from "./roster";

export type PostStatus = "live" | "deleted";

export type GenPost = {
  id: string;
  creatorId: string;
  accountId: string;
  platform: Platform;
  handle: string;
  postedAt: string;
  caption: string;
  duration: string;
  views: number;
  likes: number;
  comments: number;
  shares: number | null;
  sparkCode: string | null;
  status: PostStatus;
  deletedAt: string | null;
  flag: Flag | null;
  poster: string | null;
  video: string | null;
  // one of the overview's top posts
  top: boolean;
};

export type AccountInput = {
  id: string;
  platform: Platform;
  handle: string;
  videos: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  lastPostAt: string | null;
};

export type CreatorInput = {
  id: string;
  joined: string;
  real: boolean;
  accounts: AccountInput[];
  // the invented creators' trouble: how many of their posts were deleted, and which carry their flag
  deleted?: number;
  flag?: Flag;
  flagged?: number;
};

const DAY = 86_400_000;
const HOUR = 3_600_000;
const START = Date.parse(`${CAMPAIGN.startedAt}T00:00:00Z`);
// no single post outside the top six takes more than this, so the overview's top posts stay the top posts
const CAP = 60_000;

// a small seeded generator per creator, so their posts are the same on every load
export function seeded(seed: string) {
  let a = 0;
  for (const ch of seed) a = (Math.imul(a, 31) + ch.charCodeAt(0)) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// splits a total into whole parts in proportion to the weights (largest remainder), so the parts add up exactly
export function allocate(total: number, weights: number[]) {
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const raw = weights.map((w) => (Math.max(0, total) * w) / sum);
  const out = raw.map(Math.floor);
  let left = Math.max(0, total) - out.reduce((a, b) => a + b, 0);
  raw
    .map((r, i) => [r - Math.floor(r), i] as const)
    .sort((a, b) => b[0] - a[0])
    .forEach(([, i]) => {
      if (left > 0) {
        out[i] += 1;
        left -= 1;
      }
    });
  return out;
}

// as allocate, with no part over the cap: what a capped part cannot take goes to the others
function allocateCapped(total: number, weights: number[], cap: number) {
  let parts = allocate(total, weights);
  for (let pass = 0; pass < 6 && parts.some((p) => p > cap); pass++) {
    const over = parts.reduce((a, p) => a + Math.max(0, p - cap), 0);
    const open = weights.map((w, i) => (parts[i] < cap ? w : 0));
    const extra = allocate(over, open);
    parts = parts.map((p, i) => Math.min(cap, p) + extra[i]);
  }
  return parts;
}

const SPARK = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const time = (ms: number) => new Date(ms).toISOString();

// a post's lifetime views grow fastest in its first days, so a newer post has had less time to gather them
const grown = (at: number) => 0.32 + 0.68 * Math.min((NOW - at) / DAY, 4) / 4;

// when an account's posts went out: spread through its window, the last at the account's last post
function slots(n: number, firstDay: number, lastAt: number, r: () => number) {
  const lastDay = Math.floor((lastAt - START) / DAY);
  const span = Math.max(0, lastDay - firstDay);
  const out: number[] = [];
  for (let j = 0; j < n - 1; j++) {
    const f = n === 1 ? 1 : j / (n - 1);
    const wobble = (r() - 0.5) * Math.min(1.8, span / Math.max(1, n));
    const d = Math.min(lastDay, Math.max(firstDay, Math.round(firstDay + f * span + wobble)));
    let at = START + d * DAY + (8 + r() * 13) * HOUR + Math.floor(r() * 60) * 60_000;
    if (at >= lastAt) at = lastAt - (2 + r() * 20) * HOUR;
    out.push(Math.max(START + firstDay * DAY + 7 * HOUR, at));
  }
  out.push(lastAt);
  return out.sort((a, b) => a - b);
}

export function creatorPosts(c: CreatorInput): GenPost[] {
  const r = seeded(`posts:${c.id}`);
  const captions = CAPTIONS[c.id] ?? ["A post for Autumn launch"];
  const media = (manifest as Record<string, { stills: number; loops: number[] }>)[c.id];
  // the early starters begin within the first five days, so the campaign's first week ramps up
  const joinedDay = Math.max(0, Math.floor((Date.parse(`${c.joined}T00:00:00Z`) - START) / DAY));
  const firstDay = joinedDay === 0 ? Math.floor(r() * 5) : joinedDay;
  const posts: GenPost[] = [];
  let caption = 0;

  for (const a of c.accounts) {
    if (!a.lastPostAt || a.videos <= 0) continue;
    const lastAt = Date.parse(a.lastPostAt);
    const at = slots(a.videos, Math.min(firstDay, Math.floor((lastAt - START) / DAY)), lastAt, r);

    // the overview's top post on this account, pinned on its own day
    const pin = TOP_POSTS.find((p) => p.creator.id === c.id && p.platform === a.platform);
    let pinAt = -1;
    if (pin) {
      const day = Date.parse(`${pin.postedAt}T17:40:00Z`);
      let best = 0;
      at.slice(0, -1).forEach((t, i) => {
        if (Math.abs(t - day) < Math.abs(at[best] - day)) best = i;
      });
      at[best] = day;
      at.sort((x, y) => x - y);
      pinAt = at.indexOf(day);
    }

    const free = at.map((_, i) => i).filter((i) => i !== pinAt);
    const weight = free.map((i) => grown(at[i]) * Math.exp(1.5 * (r() + r() + r() - 1.5)));
    const views = allocateCapped(a.views - (pin?.views ?? 0), weight, CAP).map((v) => Math.max(60, v));
    const likes = allocate(a.likes - (pin?.likes ?? 0), views.map((v) => v * (0.85 + 0.3 * r())));
    const comments = allocate(a.comments - (pin?.comments ?? 0), views.map((v) => v * (0.8 + 0.4 * r())));
    // an Instagram post's shares arrive once the platform has reported them, a day or two after it goes out
    const fetched = free.map((i) => a.platform === "tiktok" || NOW - at[i] > 2 * DAY);
    const shareParts = allocate(a.shares - (pin?.shares ?? 0), views.map((v, j) => (fetched[j] ? v * (0.8 + 0.4 * r()) : 0)));

    at.forEach((t, i) => {
      const n = String(i + 1).padStart(2, "0");
      const id = `${c.id}-${a.platform === "tiktok" ? "tt" : "ig"}${n}`;
      const j = free.indexOf(i);
      const isPin = i === pinAt && pin;
      const secs = 9 + Math.floor(r() * 52);
      posts.push({
        id,
        creatorId: c.id,
        accountId: a.id,
        platform: a.platform,
        handle: a.handle,
        postedAt: time(t),
        caption: isPin ? pin.caption : captions[caption++ % captions.length],
        duration: isPin ? pin.duration : `0:${String(secs).padStart(2, "0")}`,
        views: isPin ? pin.views : views[j],
        likes: isPin ? pin.likes : likes[j],
        comments: isPin ? pin.comments : comments[j],
        shares: isPin ? pin.shares : fetched[j] ? shareParts[j] : null,
        // TikTok's code, once the creator has shared it (a post from the last half day may not have one yet)
        sparkCode:
          a.platform === "tiktok" && NOW - t > 12 * HOUR
            ? `#${Array.from({ length: 44 }, () => SPARK[Math.floor(r() * SPARK.length)]).join("")}`
            : null,
        status: "live",
        deletedAt: null,
        flag: null,
        poster: isPin ? pin.poster : null,
        video: isPin ? pin.video : null,
        top: !!isPin,
      });
    });
  }

  // the real creators' own stills, most viewed post first, and the loops for the best of them
  if (c.real && media) {
    posts
      .filter((p) => !p.top)
      .sort((x, y) => y.views - x.views)
      .forEach((p, i) => {
        const k = (i % media.stills) + 1;
        p.poster = `/media/feed/${c.id}-${k}.webp`;
        p.video = media.loops.includes(k) ? `/media/feed/${c.id}-${k}.mp4` : null;
      });
  }

  posts.sort((x, y) => Date.parse(x.postedAt) - Date.parse(y.postedAt));

  // the invented creators' trouble: their earliest posts deleted a day or two later, their latest flagged
  for (let i = 0; i < (c.deleted ?? 0) && i < posts.length; i++) {
    posts[i].status = "deleted";
    posts[i].deletedAt = time(Date.parse(posts[i].postedAt) + (26 + r() * 30) * HOUR);
  }
  const flagged = Math.min(c.flagged ?? 0, posts.length);
  if (c.flag && flagged > 0) {
    posts.slice(posts.length - flagged).forEach((p) => (p.flag = c.flag ?? null));
  }

  return posts;
}

// (likes + comments + shares) / views, in percent; a share count the platform has not reported counts as none
export const engagementOf = (p: Pick<GenPost, "views" | "likes" | "comments" | "shares">) =>
  p.views ? ((p.likes + p.comments + (p.shares ?? 0)) / p.views) * 100 : 0;
