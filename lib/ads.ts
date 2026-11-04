import { NOW } from "./demo";
import { POSTS } from "./roster";
import { seeded, type GenPost } from "./post-gen";
import { viewSeries } from "./posts";

/*
  The brand's own ads on the creators' posts (the product's TikTok Ads and Meta Ads views, lib/brand-ads.ts): Spark
  Ads on TikTok posts and partnership ads on Instagram reels, the campaign's own posts from Posts & feed, boosted.
  Every figure is sample data, made once and deterministically from the posts, and kept to the product's rules:
    - TikTok counts a Spark Ad's plays in the post's own views, so a boosted post's organic views are its views less
      the plays the ads paid for, and the campaign's totals do not change
    - Instagram does not add ad plays to a reel's views, so Meta's paid figure is impressions, on top
    - each platform counts its own conversion event (TikTok here a registration, Meta a purchase), so the two costs
      are compared for their direction, never as one price
    - below five conversions a cost per conversion is a rough signal, not a price
  The clicks the ads earned land on the brand's website as Paid Social sessions (lib/analytics.ts reads them).
*/

export type AdsProvider = "tiktok" | "meta";

export const PROVIDERS: AdsProvider[] = ["tiktok", "meta"];

export const PROVIDER_LABELS: Record<AdsProvider, string> = { tiktok: "TikTok Ads", meta: "Meta Ads" };

export const PAID_LABELS: Record<AdsProvider, string> = { tiktok: "Paid views", meta: "Paid impressions" };

export const POST_NOUNS: Record<AdsProvider, { one: string; many: string }> = {
  tiktok: { one: "post", many: "posts" },
  meta: { one: "reel", many: "reels" },
};

export const AD_KINDS: Record<AdsProvider, string> = { tiktok: "Spark Ads", meta: "partnership ads" };

export const EVENTS: Record<AdsProvider, { label: string; one: string; many: string }> = {
  tiktok: { label: "Complete registration", one: "sign-up", many: "Sign-ups" },
  meta: { label: "Purchase", one: "purchase", many: "Purchases" },
};

export const ORGANIC_NOTES: Record<AdsProvider, string> = {
  tiktok: "Organic is the post's own views minus the plays the ads paid for.",
  meta: "Organic is the reel's own views; Instagram does not add ad plays to them.",
};

export const LOW_VOLUME = 5;

export type AdDay = { date: string; paid: number; impressions: number; clicks: number; spendCents: number };

export type BoostedPost = {
  post: GenPost;
  provider: AdsProvider;
  // the post's own views, and what the ads added (plays on TikTok, impressions on Meta)
  organicViews: number;
  paidViews: number;
  impressions: number;
  clicks: number;
  conversions: number;
  spendCents: number;
  days: AdDay[];
};

export type Dimension = "age" | "gender" | "country";

export const DIMENSION_LABELS: Record<Dimension, string> = { age: "Age", gender: "Gender", country: "Country" };

export type AudienceRow = { dimension: Dimension; bucket: string; impressions: number };

export type AdsTotals = { organicViews: number; paidViews: number; impressions: number; clicks: number; conversions: number; spendCents: number };

export type AdsPlatform = {
  provider: AdsProvider;
  currency: "USD";
  account: string;
  posts: BoostedPost[];
  // how many of the campaign's posts are on this platform, so the page can say how many carried paid delivery
  campaignPostCount: number;
  totals: AdsTotals;
  // Meta counts reach; TikTok estimates it, so it has none to divide by
  reach: number | null;
  audience: AudienceRow[];
  trend: { date: string; organicViews: number; paidViews: number; spendCents: number }[];
};

const TODAY = new Date(NOW).toISOString().slice(0, 10);
const DAY = 86_400_000;
const shift = (iso: string, d: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + d * DAY).toISOString().slice(0, 10);

// who saw them, as each platform splits its delivery (shares of impressions; the rest is unspecified)
const AUDIENCE: Record<AdsProvider, Record<Dimension, [string, number][]>> = {
  tiktok: {
    age: [["18-24", 0.53], ["25-34", 0.29], ["35-44", 0.1], ["45-54", 0.04], ["55+", 0.02], ["Unspecified", 0.02]],
    gender: [["Female", 0.58], ["Male", 0.4], ["Unspecified", 0.02]],
    country: [["United States", 0.41], ["India", 0.21], ["United Kingdom", 0.19], ["Brazil", 0.09], ["Turkey", 0.06], ["Everywhere else", 0.04]],
  },
  meta: {
    age: [["18-24", 0.37], ["25-34", 0.36], ["35-44", 0.15], ["45-54", 0.07], ["55+", 0.04], ["Unspecified", 0.01]],
    gender: [["Female", 0.64], ["Male", 0.35], ["Unspecified", 0.01]],
    country: [["United States", 0.46], ["United Kingdom", 0.22], ["India", 0.16], ["Brazil", 0.08], ["Turkey", 0.05], ["Everywhere else", 0.03]],
  },
};

function boost(post: GenPost, provider: AdsProvider): BoostedPost {
  const r = seeded(`ad:${post.id}`);
  const from = shift(post.postedAt.slice(0, 10), 1);
  const last = shift(TODAY, -1);
  const span = Math.max(1, Math.round((Date.parse(last) - Date.parse(from)) / DAY) + 1);
  const tiktok = provider === "tiktok";
  // the paid figure: on TikTok a share of the post's own plays; on Meta impressions on top of the reel's views
  const paidViews = Math.round(post.views * (tiktok ? 0.24 + r() * 0.2 : 0.55 + r() * 0.6));
  const impressions = Math.round(paidViews * (tiktok ? 1.28 + r() * 0.16 : 1));
  const clicks = Math.round(impressions * (tiktok ? 0.008 + r() * 0.007 : 0.007 + r() * 0.005));
  const conversions = Math.round(clicks * (tiktok ? 0.09 + r() * 0.08 : 0.03 + r() * 0.035));
  const spendCents = Math.round((impressions / 1000) * (tiktok ? 600 + r() * 300 : 850 + r() * 350));
  // delivery spread over the days since the boost began, front-loaded as the platforms spend
  const weights = Array.from({ length: span }, (_, d) => Math.exp(-0.11 * d) * (0.8 + r() * 0.4));
  const sum = weights.reduce((a, b) => a + b, 0);
  const days: AdDay[] = weights.map((w, d) => ({
    date: shift(from, d),
    paid: Math.round((paidViews * w) / sum),
    impressions: Math.round((impressions * w) / sum),
    clicks: Math.round((clicks * w) / sum),
    spendCents: Math.round((spendCents * w) / sum),
  }));
  return { post, provider, organicViews: tiktok ? post.views - paidViews : post.views, paidViews, impressions, clicks, conversions, spendCents, days };
}

const sumTotals = (posts: BoostedPost[]): AdsTotals => ({
  organicViews: posts.reduce((a, p) => a + p.organicViews, 0),
  paidViews: posts.reduce((a, p) => a + p.paidViews, 0),
  impressions: posts.reduce((a, p) => a + p.impressions, 0),
  clicks: posts.reduce((a, p) => a + p.clicks, 0),
  conversions: posts.reduce((a, p) => a + p.conversions, 0),
  spendCents: posts.reduce((a, p) => a + p.spendCents, 0),
});

function platform(provider: AdsProvider): AdsPlatform {
  const on = POSTS.filter((p) => p.platform === (provider === "tiktok" ? "tiktok" : "instagram"));
  // the brand boosted its best posts once they had shown they could travel: the real creators' posts with their
  // own footage, at least two days old, the best of them (and on TikTok, only those whose creator shared the code)
  const picked = on
    .filter((p) => p.poster && p.status === "live" && p.postedAt.slice(0, 10) <= shift(TODAY, -2) && (provider === "meta" || p.sparkCode))
    .sort((a, b) => b.views - a.views)
    .slice(0, provider === "tiktok" ? 10 : 8);
  const posts = picked.map((p) => boost(p, provider)).sort((a, b) => b.spendCents - a.spendCents);
  const totals = sumTotals(posts);
  const audience = (Object.entries(AUDIENCE[provider]) as [Dimension, [string, number][]][]).flatMap(([dimension, rows]) =>
    rows.map(([bucket, share]) => ({ dimension, bucket, impressions: Math.round(totals.impressions * share) })),
  );
  const dates = [...new Set(posts.flatMap((p) => p.days.map((d) => d.date)))].sort();
  const organicByDay = new Map<string, number>();
  for (const b of posts) {
    for (const d of viewSeries(b.post)) organicByDay.set(d.date, (organicByDay.get(d.date) ?? 0) + Math.round(d.added * (b.organicViews / Math.max(1, b.post.views))));
  }
  const trend = dates.map((date) => ({
    date,
    organicViews: organicByDay.get(date) ?? 0,
    paidViews: posts.reduce((a, p) => a + (p.days.find((d) => d.date === date)?.paid ?? 0), 0),
    spendCents: posts.reduce((a, p) => a + (p.days.find((d) => d.date === date)?.spendCents ?? 0), 0),
  }));
  return {
    provider,
    currency: "USD",
    account: provider === "tiktok" ? "e‑Matura · TikTok Ads" : "e‑Matura · Meta Business",
    posts,
    campaignPostCount: on.length,
    totals,
    reach: provider === "meta" ? Math.round(totals.impressions / 1.74) : null,
    audience,
    trend,
  };
}

export const ADS: Record<AdsProvider, AdsPlatform> = { tiktok: platform("tiktok"), meta: platform("meta") };

// a creator's boosted posts on one platform, cheapest per conversion first; those with too few conversions to price
// go last, said so rather than ranked
export type AdCreator = { creatorId: string; posts: number; paidViews: number; spendCents: number; conversions: number; cost: number | null; lowVolume: boolean };

export function creatorsOf(p: AdsPlatform): AdCreator[] {
  const by = new Map<string, BoostedPost[]>();
  for (const b of p.posts) by.set(b.post.creatorId, [...(by.get(b.post.creatorId) ?? []), b]);
  return [...by.entries()]
    .map(([creatorId, list]) => {
      const t = sumTotals(list);
      return { creatorId, posts: list.length, paidViews: t.paidViews, spendCents: t.spendCents, conversions: t.conversions, cost: t.conversions ? t.spendCents / t.conversions : null, lowVolume: t.conversions < LOW_VOLUME };
    })
    .sort((a, b) => Number(a.lowVolume) - Number(b.lowVolume) || (a.cost ?? Infinity) - (b.cost ?? Infinity));
}

// the clicks the ads earned each day, by platform: they land on the website as Paid Social sessions
export function adClicksOn(date: string) {
  let tiktok = 0;
  let meta = 0;
  for (const provider of PROVIDERS) {
    for (const b of ADS[provider].posts) {
      const d = b.days.find((x) => x.date === date);
      if (d) {
        if (provider === "tiktok") tiktok += d.clicks;
        else meta += d.clicks;
      }
    }
  }
  return { tiktok, meta };
}

// the plays TikTok's ads paid for on a day, which are not the creators' organic reach
export function paidPlaysOn(date: string) {
  return ADS.tiktok.posts.reduce((a, b) => a + (b.days.find((d) => d.date === date)?.paid ?? 0), 0);
}
