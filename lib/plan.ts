import { BRAND, MANAGER, NOW, TEAMMATES } from "./demo";
import { day } from "./format";
import { POSTS } from "./roster";
import { seeded, type GenPost } from "./post-gen";
import {
  FORMATS,
  PLAN_SEEDS,
  type BriefField,
  type EventSeed,
  type Format,
  type PersonKey,
  type ScriptFlagReason,
} from "./plan-data";

/*
  The Content plan's data, derived from what Maya shared (lib/plan-data.ts) and the campaign's posts (lib/roster.ts):
  the plans and their stages, each plan's scripts with their references, review state, activity and results, and
  the rules the page applies (the product's plan-stages.ts). Every post counts toward one script, the product's rule:
  the plan that was open on its day, the script whose hashtag it carries. So the scripts' posts and views are the
  posts on Posts & feed, and the plans add up to the campaign.
*/

export type { BriefField, Format, PersonKey, ScriptFlagReason };

export const TODAY = new Date(NOW).toISOString().slice(0, 10);

/* --- who: the brand's side by first name, 8x's with "· 8x" (design.md: a brand never sees more of an 8x person) --- */

export const PEOPLE: Record<PersonKey, { name: string; full: string; initials: string; side: "brand" | "team"; photo?: string }> = {
  you: { name: "You", full: BRAND.member.name, initials: BRAND.member.initials, side: "brand", photo: "/media/team/alex.webp" },
  jordan: { name: TEAMMATES[0].name.split(" ")[0], full: TEAMMATES[0].name, initials: TEAMMATES[0].initials, side: "brand", photo: "/media/team/jordan.webp" },
  maya: { name: `${MANAGER.name.split(" ")[0]} · 8x`, full: `${MANAGER.name.split(" ")[0]} · 8x`, initials: MANAGER.name[0], side: "team" },
};

export const MAYA = MANAGER.name.split(" ")[0];

/* --- the words the page uses for a flag's reasons and a change's fields (the product's lists, in their order) --- */

export const SCRIPT_FLAG_REASONS: { id: ScriptFlagReason; label: string; line: string }[] = [
  { id: "script", label: "Script", line: "The idea or the words, as a whole" },
  { id: "hook", label: "Open with", line: "How the video opens" },
  { id: "cta", label: "Close with", line: "How it ends, and what it asks for" },
  { id: "brandGuidelines", label: "Brand guidelines", line: "Against the brief or the posting guidelines" },
  { id: "other", label: "Other", line: "Something else; say what in the note" },
];

export const reasonsLabel = (reasons: readonly ScriptFlagReason[]) =>
  SCRIPT_FLAG_REASONS.filter((r) => reasons.includes(r.id))
    .map((r) => r.label)
    .join(", ");

const FIELD_ORDER: BriefField[] = ["name", "angle", "hook", "middle", "close", "dos", "donts", "references"];

export const FIELD_LABELS: Record<BriefField, string> = {
  name: "Title",
  angle: "Context",
  hook: "Open with",
  middle: "Through the middle",
  close: "Close with",
  dos: "Do's",
  donts: "Don'ts",
  references: "References",
};

export const fieldsLabel = (fields: readonly BriefField[]) =>
  FIELD_ORDER.filter((f) => fields.includes(f))
    .map((f) => FIELD_LABELS[f])
    .join(", ");

/* --- a plan's name and dates (the product's planDisplayName and planWindowLabel) --- */

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY = 86_400_000;
const utc = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
const shift = (iso: string, days: number) => new Date(utc(iso) + days * DAY).toISOString().slice(0, 10);
export const daysBetween = (from: string, to: string) => Math.round((utc(to) - utc(from)) / DAY);

// "October week 2": named by its middle day, weeks counted from the 1st
export function planName(start: string, end: string) {
  const middle = new Date(utc(shift(start, Math.floor(daysBetween(start, end) / 2))));
  return `${MONTHS[middle.getUTCMonth()]} week ${Math.ceil(middle.getUTCDate() / 7)}`;
}

// "11 – 17 Oct", or "28 Oct – 3 Nov" across a month
export const planWindow = (start: string, end: string) =>
  `${start.slice(0, 7) === end.slice(0, 7) ? Number(start.slice(8)) : day(start)} – ${day(end)}`;

/* --- the activity, and the review state read from it --- */

export type ThreadEvent = EventSeed & { id: string };

export type ReviewState = "awaitingReview" | "approved" | "flagged";

export type Review = {
  state: ReviewState;
  // an approval that still stands: given, and not changed by Maya since
  approval: { at: string; who: PersonKey } | null;
  flag: { at: string; who: PersonKey; reasons: ScriptFlagReason[]; note: string | null } | null;
  // when Maya last changed it; the brand's approval clears it
  revisedAt: string | null;
};

export function reviewOf(events: readonly ThreadEvent[]): Review {
  let approval: Review["approval"] = null;
  let flag: Review["flag"] = null;
  let revisedAt: string | null = null;
  for (const e of [...events].sort((a, b) => (a.at < b.at ? -1 : 1))) {
    if (e.kind === "approved") {
      approval = { at: e.at, who: e.who };
      revisedAt = null;
    } else if (e.kind === "flagged") {
      flag = { at: e.at, who: e.who, reasons: e.reasons, note: e.note };
      approval = null;
    } else if (e.kind === "flagResolved") flag = null;
    else if (e.kind === "revised") {
      revisedAt = e.at;
      approval = null;
    }
  }
  return { state: flag ? "flagged" : approval ? "approved" : "awaitingReview", approval, flag, revisedAt };
}

/* --- plans and scripts --- */

export type Stage = "review" | "live" | "past";

export const STAGE_LABELS: Record<Stage, string> = { past: "Past plans", live: "Live", review: "For approval" };

export type Reference =
  | { kind: "post"; key: string; post: GenPost; poster: string; video: string; frames: Record<"open" | "middle" | "close", string> }
  | { kind: "link"; url: string; source: "tiktok" | "instagram" | "youtube" };

export const SOURCE_LABELS = { tiktok: "TikTok", instagram: "Instagram", youtube: "YouTube" } as const;

export type Results = { posts: number; views: number; avg: number | null; engagement: number | null };

export type Script = {
  id: string;
  // its place in the whole plan: "Script 3"
  n: number;
  plan: string;
  format: Format;
  references: Reference[];
  events: ThreadEvent[];
  unread: boolean;
  // the posts made to it, most viewed first
  posts: GenPost[];
  results: Results;
};

export type Plan = {
  key: string;
  start: string;
  end: string;
  days: number;
  name: string;
  window: string;
  shared: string;
  published: string | null;
  stage: Stage;
  scripts: Script[];
  lastModified: string | null;
  lastReviewed: string | null;
};

const FORMAT_BY_CODE = new Map(FORMATS.map((f) => [f.code, f]));
const postByMedia = (key: string) =>
  POSTS.find((p) => p.poster === (key.includes("-") ? `/media/feed/${key}.webp` : `/media/posts/${key}.webp`)) ?? null;

function reference(seed: PlanSeedRef): Reference {
  if ("link" in seed) return { kind: "link", url: seed.link, source: seed.source };
  const post = postByMedia(seed.post);
  if (!post) throw new Error(`No post has the media ${seed.post}`);
  const base = `/media/plan/${seed.post}`;
  return {
    kind: "post",
    key: seed.post,
    post,
    poster: `${base}.webp`,
    video: `${base}.mp4`,
    frames: { open: `${base}-open.webp`, middle: `${base}-middle.webp`, close: `${base}-close.webp` },
  };
}

type PlanSeedRef = (typeof PLAN_SEEDS)[number]["scripts"][number]["refs"][number];

const stageOf = (start: string, end: string, published: string | null): Stage =>
  end < TODAY ? "past" : published && start <= TODAY ? "live" : "review";

export const PLANS: Plan[] = PLAN_SEEDS.map((seed) => {
  const scripts: Script[] = seed.scripts.map((s, i) => {
    const base = FORMAT_BY_CODE.get(s.code);
    if (!base) throw new Error(`No format ${s.code}`);
    const id = `${seed.start}-${i + 1}`;
    return {
      id,
      n: i + 1,
      plan: seed.start,
      format: { ...base, ...s.edits },
      references: s.refs.map(reference),
      events: s.events.map((e, k) => ({ ...e, id: `${id}:${k}` })),
      unread: s.unread ?? false,
      posts: [],
      results: { posts: 0, views: 0, avg: null, engagement: null },
    };
  });
  const all = scripts.flatMap((s) => s.events);
  const latest = (pick: (e: ThreadEvent) => boolean) =>
    all.filter(pick).reduce<string | null>((a, e) => (a == null || e.at > a ? e.at : a), null);
  return {
    key: seed.start,
    start: seed.start,
    end: seed.end,
    days: daysBetween(seed.start, seed.end) + 1,
    name: planName(seed.start, seed.end),
    window: planWindow(seed.start, seed.end),
    shared: seed.shared,
    published: seed.published,
    stage: stageOf(seed.start, seed.end, seed.published),
    scripts,
    lastModified: latest((e) => e.kind === "added" || e.kind === "revised"),
    lastReviewed: latest((e) => PEOPLE[e.who].side === "brand"),
  };
});

/* --- every post to one script: the plan open on its day, then the script its caption reads as --- */

// the overview's six top posts, each made to the script it made famous
const PINNED: Record<string, string> = {
  aastha: "AUTUMN08",
  carla: "AUTUMN05",
  sevda: "AUTUMN07",
  pooja: "AUTUMN03",
  mariana: "AUTUMN04",
  sultan: "AUTUMN06",
};

const KEYWORDS: Record<string, string[]> = {
  AUTUMN01: ["first", "morning", "start", "open"],
  AUTUMN02: ["plan", "week", "sunday", "organis"],
  AUTUMN03: ["day ", "60", "30 days", "check-in", "update", "progress", "habit", "tracker", "glow", "halfway", "one month"],
  AUTUMN04: ["apps", "sites", "tools", "websites", " ai "],
  AUTUMN05: ["study", "exam", "revise", "notes", "flashcard", "lecture", "student"],
  AUTUMN06: ["budget", "spend", "spent", "salary", "money", "cheap", "debt", "lira", "dirham", "aed", "groceries", "receipt", "saving", "paying", "buying", "cost"],
  AUTUMN07: ["storytime", "pov", "imagine", "friend", "nobody", "let go", "story", "sign", "message", "news"],
  AUTUMN08: ["stack", "setup", "hackathon", "desk", "built", "code", "coding", "project", "tool", "learn"],
  AUTUMN09: ["saved", "save", "month", "salary", "emergency", "income"],
  AUTUMN10: ["before", "after", "outfit", "closet", "wardrobe", "changed", "bag"],
};

const SCRIPT_OF = new Map<string, Script>();

for (const p of [...POSTS].sort((a, b) => (a.postedAt < b.postedAt ? -1 : a.postedAt > b.postedAt ? 1 : a.id < b.id ? -1 : 1))) {
  const d = p.postedAt.slice(0, 10);
  const plan = PLANS.find((x) => x.start <= d && d <= x.end && x.stage !== "review");
  if (!plan) continue;
  const pinned = p.top ? plan.scripts.find((s) => s.format.code === PINNED[p.creatorId]) : undefined;
  let pick = pinned;
  if (!pick) {
    const caption = ` ${p.caption.toLowerCase()} `;
    const scores = plan.scripts.map((s) => (KEYWORDS[s.format.code] ?? []).filter((k) => caption.includes(k)).length);
    const best = Math.max(...scores);
    const tied = plan.scripts.filter((_, i) => scores[i] === best);
    pick = tied[Math.floor(seeded(p.id)() * tied.length)];
  }
  SCRIPT_OF.set(p.id, pick);
  pick.posts.push(p);
}

for (const s of PLANS.flatMap((x) => x.scripts)) {
  s.posts.sort((a, b) => b.views - a.views);
  const views = s.posts.reduce((a, p) => a + p.views, 0);
  const acts = s.posts.reduce((a, p) => a + p.likes + p.comments + (p.shares ?? 0), 0);
  s.results = { posts: s.posts.length, views, avg: s.posts.length ? views / s.posts.length : null, engagement: views ? (acts / views) * 100 : null };
}

export const scriptOfPost = (postId: string) => SCRIPT_OF.get(postId) ?? null;

export const planByKey = (key: string | null) => PLANS.find((p) => p.key === key) ?? null;

export const scriptById = (id: string | null) => PLANS.flatMap((p) => p.scripts).find((s) => s.id === id) ?? null;

export const planOf = (s: Script) => planByKey(s.plan) as Plan;

/* --- the rules the page applies (the product's plan-stages.ts) --- */

const flaggedReason = `Flagged. You can review it again once ${MAYA} sends it back.`;

// why Approve cannot approve this script, or null when it can
export function approveBlocked(review: Review, plan: Plan) {
  if (review.state === "flagged") return flaggedReason;
  if (plan.stage === "live") return "Creators already have this plan.";
  if (plan.stage === "past") return "This plan has finished.";
  return plan.end < TODAY ? "This plan’s last day has passed." : null;
}

// why Flag cannot open, or null when it can
export function flagBlocked(review: Review) {
  if (review.state === "approved") return "Approved. Leave a comment if something needs to change.";
  return review.state === "flagged" ? flaggedReason : null;
}

export type Filter = "all" | "flagged" | "unflagged" | "approved" | "unapproved";

export const FILTER_LABELS: Record<Filter, string> = {
  all: "All scripts",
  flagged: "Flagged",
  unflagged: "Not flagged",
  approved: "Approved",
  unapproved: "Not approved",
};

export const FILTER_EMPTY: Record<Filter, string> = {
  all: "This plan has no scripts in it yet.",
  flagged: "Nothing in this plan is flagged.",
  unflagged: "Every script in this plan is flagged.",
  approved: "Nothing in this plan is approved yet.",
  unapproved: "Every script in this plan is approved.",
};

// approval is a question only while the plan waits for it, so only then is it a filter
export const filtersFor = (stage: Stage): Filter[] =>
  stage === "review" ? ["all", "flagged", "unflagged", "approved", "unapproved"] : ["all", "flagged", "unflagged"];

export function matchesFilter(review: Review, filter: Filter) {
  if (filter === "approved" || filter === "unapproved") return (filter === "approved") === (review.state === "approved");
  return filter === "all" || (filter === "flagged") === (review.state === "flagged");
}

// the one mark a script carries, by the first state that holds
export type Mark = "flag" | "unread" | "approved" | "updated" | null;

export function markOf(review: Review, unread: boolean): Mark {
  if (review.state === "flagged") return "flag";
  if (unread) return "unread";
  if (review.state === "approved") return "approved";
  return review.revisedAt ? "updated" : null;
}

/* --- what works: each format across the plans it ran in, by views a post --- */

export type Work = { code: string; name: string; posts: number; views: number; avg: number; plans: number; best: GenPost; newest: Script };

export const WHAT_WORKS: Work[] = FORMATS.map((f) => {
  const scripts = PLANS.flatMap((p) => p.scripts).filter((s) => s.format.code === f.code);
  const posts = scripts.flatMap((s) => s.posts);
  const views = posts.reduce((a, p) => a + p.views, 0);
  return {
    code: f.code,
    name: f.name,
    posts: posts.length,
    views,
    avg: posts.length ? views / posts.length : 0,
    plans: scripts.filter((s) => s.posts.length > 0).length,
    best: [...posts].sort((a, b) => b.views - a.views)[0],
    newest: scripts[scripts.length - 1],
  };
})
  .filter((w) => w.posts >= 6)
  .sort((a, b) => b.avg - a.avg);

/* --- where the page opens: the plan waiting for the brand at its first script waiting, else the live one --- */

export function defaultPlan() {
  return PLANS.find((p) => p.stage === "review") ?? PLANS.find((p) => p.stage === "live") ?? PLANS[PLANS.length - 1] ?? null;
}

export const WAITING = PLANS.filter((p) => p.stage === "review").flatMap((p) => p.scripts.filter((s) => reviewOf(s.events).state === "awaitingReview"));

/* --- the open plan as a CSV, every field of the brief, for a brand that circulates scripts to its own team --- */

export function planCsv(plan: Plan, reviewOfScript: (s: Script) => Review) {
  const head = ["Plan", "Dates", "Script", "Name", "Hashtag", "Type", "Post by", "Where it stands", "Context", "Open with", "Through the middle", "Close with", "Do", "Do not", "References", "Posts", "Views", "Views a post", "Engagement rate"];
  const rows = plan.scripts.map((s) => {
    const r = reviewOfScript(s);
    const state = r.flag
      ? `Flagged: ${reasonsLabel(r.flag.reasons)}`
      : r.approval
        ? `Approved ${r.approval.at.slice(0, 10)}`
        : plan.stage === "review"
          ? "Waiting for review"
          : r.revisedAt
            ? `Updated ${r.revisedAt.slice(0, 10)}`
            : "";
    const refs = s.references.map((x) => (x.kind === "link" ? x.url : `/posts?open=${x.post.id}`)).join(" ");
    const live = plan.stage !== "review";
    return [
      plan.name,
      plan.window,
      `Script ${s.n}`,
      s.format.name,
      `#${s.format.code}`,
      s.format.media === "reel" ? "Reel" : "Carousel",
      plan.end,
      state,
      s.format.angle,
      s.format.hook,
      s.format.middle,
      s.format.close,
      s.format.dos.join("\n"),
      s.format.donts.join("\n"),
      refs,
      live ? s.results.posts : "",
      live ? s.results.views : "",
      live && s.results.avg != null ? Math.round(s.results.avg) : "",
      live && s.results.engagement != null ? `${s.results.engagement.toFixed(1)}%` : "",
    ];
  });
  return [head, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
}
