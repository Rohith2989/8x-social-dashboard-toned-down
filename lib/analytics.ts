import { CAMPAIGN, NOW } from "./demo";
import { POSTS } from "./roster";
import { seeded } from "./post-gen";
import { viewSeries } from "./posts";
import { adClicksOn, paidPlaysOn } from "./ads";

/*
  The brand's website as Google Analytics reports it (the product's Website view: lib/brand-analytics.ts and the
  analytics handler's schema). Every figure is sample data, generated once and deterministically, a day at a time from
  24 days before the campaign to today, and kept to the product's rules:
    - sessions, sales and revenue are summed across channels and sources, so a split adds back to the day
    - visitors are unique within each day and channel, so channels add up to more than the day's own visitors, and the
      day's figure is its own (undimensioned) count
    - paid and non-paid follow Google's own channel grouping: Paid Search and Paid Social cost money, the rest do not
    - creator posts arrive as Organic Social unless a link was tagged, so that channel is the floor of 8x's share
    - a day is provisional until Google Analytics stops restating it, 48 hours on; today is part of a day
  How it moves: before 8x the site keeps its own weekly rhythm. From 11 October the visits that arrive through social
  rise with the views the campaign's posts earned that day (Posts & feed's posts, their views spread over the days after
  they went out, less the plays TikTok's ads paid for), search and direct rise a little with them (people look the app
  up after a video), and the clicks the brand's own ads on the creators' posts earned land as Paid Social.
*/

export type Totals = { sessions: number; transactions: number; revenueCents: number; users: number; pageviews: number };

export type ChannelKey = "organicSearch" | "direct" | "organicSocial" | "paidSearch" | "paidSocial" | "email" | "referral";

export const CHANNELS: { key: ChannelKey; label: string; paid: boolean }[] = [
  { key: "organicSearch", label: "Organic Search", paid: false },
  { key: "direct", label: "Direct", paid: false },
  { key: "organicSocial", label: "Organic Social", paid: false },
  { key: "paidSearch", label: "Paid Search", paid: true },
  { key: "paidSocial", label: "Paid Social", paid: true },
  { key: "email", label: "Email", paid: false },
  { key: "referral", label: "Referral", paid: false },
];

export type Device = "mobile" | "desktop" | "tablet";

export const DEVICES: { key: Device; label: string }[] = [
  { key: "mobile", label: "Mobile" },
  { key: "desktop", label: "Desktop" },
  { key: "tablet", label: "Tablet" },
];

export type GaDay = Totals & {
  date: string;
  inCampaign: boolean;
  // Google Analytics restates a day for 48 hours; today is a part of a day
  settled: boolean;
  partial: boolean;
  channels: Record<ChannelKey, Totals>;
  sources: Record<string, Totals & { channel: ChannelKey }>;
  devices: Record<Device, number>;
  newUsers: number;
  sessionSeconds: number;
  purchasers: number;
  firstTimePurchasers: number;
  // the campaign that day: the views its posts earned, and how many posts went out
  earnedViews: number;
  posts: number;
};

export const PROPERTY = {
  name: "meridian.app · GA4",
  account: "analytics@meridian.app",
  currency: "USD",
};

// the brand's spend with 8x: the campaign's monthly contract, prorated by the day
export const CONTRACT_MONTHLY_CENTS = 18_000_00;
export const SPEND_PER_DAY_CENTS = Math.round(CONTRACT_MONTHLY_CENTS / 30);

const DAY = 86_400_000;
const TODAY = new Date(NOW).toISOString().slice(0, 10);
const shift = (iso: string, d: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + d * DAY).toISOString().slice(0, 10);
export const CAMPAIGN_START = CAMPAIGN.startedAt;
const FIRST = shift(CAMPAIGN_START, -CAMPAIGN.day);

// each channel's own habits: a usual day before 8x, how it converts, what a sale is worth, how long a visit lasts,
// pages a visit, the devices it comes from, and how much it rose with the campaign's reach
type Habit = { base: number; cr: number; aov: number; seconds: number; pages: number; mobile: number; desktop: number; halo: number; perView: number };

const HABITS: Record<ChannelKey, Habit> = {
  organicSearch: { base: 1150, cr: 0.0155, aov: 3650, seconds: 138, pages: 2.9, mobile: 0.6, desktop: 0.35, halo: 0.14, perView: 0.0016 },
  direct: { base: 820, cr: 0.0185, aov: 3820, seconds: 124, pages: 2.6, mobile: 0.55, desktop: 0.4, halo: 0.1, perView: 0.0011 },
  organicSocial: { base: 210, cr: 0.0118, aov: 3290, seconds: 71, pages: 1.9, mobile: 0.86, desktop: 0.11, halo: 0, perView: 0.0086 },
  paidSearch: { base: 480, cr: 0.0215, aov: 3740, seconds: 112, pages: 2.4, mobile: 0.6, desktop: 0.35, halo: 0.03, perView: 0 },
  paidSocial: { base: 320, cr: 0.0098, aov: 3380, seconds: 64, pages: 1.8, mobile: 0.88, desktop: 0.09, halo: 0, perView: 0 },
  email: { base: 160, cr: 0.0315, aov: 4120, seconds: 171, pages: 3.4, mobile: 0.58, desktop: 0.38, halo: 0, perView: 0 },
  referral: { base: 140, cr: 0.013, aov: 3560, seconds: 132, pages: 2.7, mobile: 0.45, desktop: 0.5, halo: 0.04, perView: 0 },
};

// where each channel's sessions come from, by source / medium (Organic Social's mix moves toward the campaign's
// platforms as their share of it grows)
const SOURCES: Record<Exclude<ChannelKey, "organicSocial" | "paidSocial">, [string, number][]> = {
  organicSearch: [["google / organic", 0.88], ["bing / organic", 0.08], ["duckduckgo / organic", 0.04]],
  direct: [["(direct) / (none)", 1]],
  paidSearch: [["google / cpc", 1]],
  email: [["newsletter / email", 1]],
  referral: [["producthunt.com / referral", 0.42], ["notion.so / referral", 0.33], ["reddit.com / referral", 0.25]],
};

const SOCIAL_BEFORE: [string, number][] = [["instagram.com / referral", 0.5], ["tiktok.com / referral", 0.3], ["youtube.com / referral", 0.2]];
const SOCIAL_CAMPAIGN: [string, number][] = [["tiktok.com / referral", 0.47], ["instagram.com / referral", 0.37], ["l.instagram.com / referral", 0.12], ["youtube.com / referral", 0.04]];

// the week's own rhythm: weekends are quieter
const WEEKDAY = [0.86, 1.04, 1.06, 1.05, 1.02, 0.96, 0.84];

// the views the campaign's posts earned each day, less the plays TikTok's ads paid for
const EARNED = new Map<string, number>();
for (const p of POSTS) for (const d of viewSeries(p)) EARNED.set(d.date, (EARNED.get(d.date) ?? 0) + d.added);

const zero = (): Totals => ({ sessions: 0, transactions: 0, revenueCents: 0, users: 0, pageviews: 0 });

function addTo(t: Totals, s: Totals) {
  t.sessions += s.sessions;
  t.transactions += s.transactions;
  t.revenueCents += s.revenueCents;
  t.users += s.users;
  t.pageviews += s.pageviews;
}

function makeDay(date: string, i: number): GaDay {
  const r = seeded(`ga:${date}`);
  const inCampaign = date >= CAMPAIGN_START;
  const k = inCampaign ? Math.round((Date.parse(date) - Date.parse(CAMPAIGN_START)) / DAY) : -1;
  const partial = date === TODAY;
  // today is the day so far: it is a quarter past four in the afternoon
  const part = partial ? 0.66 : 1;
  const week = WEEKDAY[new Date(`${date}T12:00:00Z`).getUTCDay()];
  // the site's own slow growth, so the window before 8x is not flat
  const drift = 1 + i * 0.0016;
  const earned = inCampaign ? Math.max(0, (EARNED.get(date) ?? 0) - paidPlaysOn(date)) : 0;
  const clicks = adClicksOn(date);
  // the halo builds over the campaign's first week
  const ramp = inCampaign ? Math.min(1, (k + 1) / 6) : 0;

  const channels = {} as Record<ChannelKey, Totals>;
  const sources: GaDay["sources"] = {};
  const devices: Record<Device, number> = { mobile: 0, desktop: 0, tablet: 0 };
  const day: GaDay = { ...zero(), date, inCampaign, settled: Date.parse(TODAY) - Date.parse(date) >= 2 * DAY, partial, channels, sources, devices, newUsers: 0, sessionSeconds: 0, purchasers: 0, firstTimePurchasers: 0, earnedViews: inCampaign ? (EARNED.get(date) ?? 0) : 0, posts: POSTS.filter((p) => p.postedAt.slice(0, 10) === date).length };
  let usersSum = 0;

  for (const { key } of CHANNELS) {
    const h = HABITS[key];
    const noise = 0.92 + r() * 0.16;
    let sessions = h.base * week * drift * noise * (1 + h.halo * ramp) + h.perView * earned;
    if (key === "paidSocial") sessions += (clicks.tiktok + clicks.meta) * 0.84;
    sessions = Math.round(sessions * part);
    // a visit from a creator's video is a little warmer than one from a cold ad
    const cr = h.cr * (key === "organicSocial" && inCampaign ? 1.14 : 1) * (0.9 + r() * 0.2);
    const transactions = Math.round(sessions * cr);
    const revenueCents = Math.round(transactions * h.aov * (0.94 + r() * 0.12));
    const users = Math.round(sessions * (0.8 + r() * 0.04));
    const pageviews = Math.round(sessions * h.pages * (0.95 + r() * 0.1));
    const t: Totals = { sessions, transactions, revenueCents, users, pageviews };
    channels[key] = t;
    addTo(day, t);
    usersSum += users;
    day.sessionSeconds += Math.round(sessions * h.seconds * (0.93 + r() * 0.14));
    devices.mobile += Math.round(sessions * h.mobile);
    devices.desktop += Math.round(sessions * h.desktop);
    devices.tablet += sessions - Math.round(sessions * h.mobile) - Math.round(sessions * h.desktop);

    // its sources, splitting the channel's figures by their shares
    let mix: [string, number][];
    if (key === "organicSocial") {
      const own = inCampaign ? Math.min(1, (h.perView * earned) / Math.max(1, sessions / part)) : 0;
      const names = [...new Set([...SOCIAL_BEFORE, ...SOCIAL_CAMPAIGN].map(([n]) => n))];
      mix = names.map((n) => [n, (1 - own) * (SOCIAL_BEFORE.find(([x]) => x === n)?.[1] ?? 0) + own * (SOCIAL_CAMPAIGN.find(([x]) => x === n)?.[1] ?? 0)]);
    } else if (key === "paidSocial") {
      const ads = (clicks.tiktok + clicks.meta) * 0.84 * part;
      const own = sessions ? Math.min(1, ads / sessions) : 0;
      const tiktokShare = clicks.tiktok + clicks.meta ? clicks.tiktok / (clicks.tiktok + clicks.meta) : 0;
      mix = [
        ["facebook / cpc", 1 - own],
        ["tiktok / spark_ads", own * tiktokShare],
        ["instagram / partnership_ads", own * (1 - tiktokShare)],
      ];
    } else mix = SOURCES[key];
    for (const [name, share] of mix) {
      if (share <= 0) continue;
      const s = (sources[name] ??= { ...zero(), channel: key });
      s.sessions += Math.round(sessions * share);
      s.transactions += Math.round(transactions * share);
      s.revenueCents += Math.round(revenueCents * share);
      s.users += Math.round(users * share);
      s.pageviews += Math.round(pageviews * share);
    }
  }

  // visitors are unique within the day: the same person by two routes is one visitor today
  day.users = Math.round(usersSum * 0.93);
  day.newUsers = Math.round(day.users * (inCampaign ? 0.62 + 0.06 * ramp : 0.58) * (0.97 + r() * 0.06));
  day.purchasers = Math.round(day.transactions * 0.96);
  day.firstTimePurchasers = Math.round(day.purchasers * (inCampaign ? 0.7 + 0.04 * ramp : 0.66));
  return day;
}

export const GA_DAYS: GaDay[] = Array.from({ length: Math.round((Date.parse(TODAY) - Date.parse(FIRST)) / DAY) + 1 }, (_, i) => makeDay(shift(FIRST, i), i));

/* --- the window a reader looks at, and the same number of days before it --- */

export type WindowKey = "since" | "14" | "7";

export const WINDOWS: { key: WindowKey; label: string }[] = [
  { key: "since", label: "Since 8x" },
  { key: "14", label: "14 days" },
  { key: "7", label: "7 days" },
];

export type Window = { key: WindowKey; start: string; end: string; days: number; prev: { start: string; end: string } };

export function windowOf(key: WindowKey): Window {
  const days = key === "since" ? CAMPAIGN.day : Number(key);
  const start = key === "since" ? CAMPAIGN_START : shift(TODAY, -(days - 1));
  return { key, start, end: TODAY, days, prev: { start: shift(start, -days), end: shift(start, -1) } };
}

export const daysIn = (start: string, end: string) => GA_DAYS.filter((d) => d.date >= start && d.date <= end);

export type Report = {
  days: GaDay[];
  totals: Totals;
  channels: Record<ChannelKey, Totals>;
  paid: Totals;
  nonPaid: Totals;
  newUsers: number;
  sessionSeconds: number;
  purchasers: number;
  firstTimePurchasers: number;
  devices: Record<Device, number>;
  sources: (Totals & { name: string; channel: ChannelKey })[];
  spendCents: number;
  campaignDays: number;
};

export function report(start: string, end: string): Report {
  const days = daysIn(start, end);
  const totals = zero();
  const channels = Object.fromEntries(CHANNELS.map((c) => [c.key, zero()])) as Record<ChannelKey, Totals>;
  const devices: Record<Device, number> = { mobile: 0, desktop: 0, tablet: 0 };
  const src = new Map<string, Totals & { name: string; channel: ChannelKey }>();
  let newUsers = 0;
  let sessionSeconds = 0;
  let purchasers = 0;
  let firstTimePurchasers = 0;
  for (const d of days) {
    addTo(totals, d);
    for (const c of CHANNELS) addTo(channels[c.key], d.channels[c.key]);
    for (const k of DEVICES) devices[k.key] += d.devices[k.key];
    for (const [name, s] of Object.entries(d.sources)) {
      const row = src.get(name) ?? { ...zero(), name, channel: s.channel };
      addTo(row, s);
      src.set(name, row);
    }
    newUsers += d.newUsers;
    sessionSeconds += d.sessionSeconds;
    purchasers += d.purchasers;
    firstTimePurchasers += d.firstTimePurchasers;
  }
  const paid = zero();
  const nonPaid = zero();
  for (const c of CHANNELS) addTo(c.paid ? paid : nonPaid, channels[c.key]);
  const campaignDays = days.filter((d) => d.inCampaign).length;
  return {
    days,
    totals,
    channels,
    paid,
    nonPaid,
    newUsers,
    sessionSeconds,
    purchasers,
    firstTimePurchasers,
    devices,
    sources: [...src.values()].sort((a, b) => b.revenueCents - a.revenueCents),
    spendCents: campaignDays * SPEND_PER_DAY_CENTS,
    campaignDays,
  };
}

/* --- the metrics a chart can draw, and how each is read off a day --- */

export type Metric = "sessions" | "transactions" | "revenue" | "users" | "pageviews";

export const METRICS: { key: Metric; label: string }[] = [
  { key: "sessions", label: "Sessions" },
  { key: "transactions", label: "Sales" },
  { key: "revenue", label: "Revenue" },
  { key: "users", label: "Visitors" },
  { key: "pageviews", label: "Pageviews" },
];

export const valueOf = (t: Totals, m: Metric) => (m === "revenue" ? t.revenueCents : t[m]);

export type Split = "none" | "paid" | "channel";

export const SPLITS: { key: Split; label: string }[] = [
  { key: "none", label: "No split" },
  { key: "paid", label: "Paid and non-paid" },
  { key: "channel", label: "By channel" },
];

// the series a split draws for a day, in draw order
export function seriesOf(d: GaDay, split: Split): { key: string; label: string; totals: Totals }[] {
  if (split === "none") return [{ key: "total", label: "Total", totals: d }];
  if (split === "paid") {
    const paid = zero();
    const nonPaid = zero();
    for (const c of CHANNELS) addTo(c.paid ? paid : nonPaid, d.channels[c.key]);
    return [
      { key: "nonPaid", label: "Non-paid", totals: nonPaid },
      { key: "paid", label: "Paid", totals: paid },
    ];
  }
  return CHANNELS.map((c) => ({ key: c.key, label: c.label, totals: d.channels[c.key] }));
}

/* --- money, the product's way --- */

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usdCents = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

// whole units, read for its size; past ten thousand, the compact form ("$63.2K") where a tile is short of room
export const money = (cents: number) => usd.format(Math.round(cents / 100));

export const moneyCompact = (cents: number) => {
  const v = cents / 100;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e4) return `$${+(v / 1e3).toFixed(1)}K`;
  return usd.format(Math.round(v));
};

// a price: whole units from ten up, cents below that (a sale that costs six cents must not read as $0)
export const price = (cents: number) => (Math.abs(cents) < 1000 ? usdCents.format(cents / 100) : usd.format(Math.round(cents / 100)));

// how a figure moved against the window before; null where there is nothing to divide by
export const change = (now: number, before: number) => (before ? ((now - before) / before) * 100 : null);

export const duration = (seconds: number) => {
  const s = Math.max(0, Math.round(seconds));
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
};

/* --- the window's days as a CSV, a day a row with every figure (the product's export) --- */

export function daysCsv(days: GaDay[]) {
  const head = ["Date", "Sessions", "Sales", "Revenue (USD)", "Visitors", "New visitors", "Pageviews", ...CHANNELS.map((c) => `${c.label} sessions`), "8x posts that day", "Views the campaign earned", "Settled"];
  const rows = days.map((d) => [
    d.date,
    d.sessions,
    d.transactions,
    (d.revenueCents / 100).toFixed(2),
    d.users,
    d.newUsers,
    d.pageviews,
    ...CHANNELS.map((c) => d.channels[c.key].sessions),
    d.posts,
    d.earnedViews,
    d.settled ? "yes" : d.partial ? "no, today so far" : "no, provisional",
  ]);
  return [head, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
}
