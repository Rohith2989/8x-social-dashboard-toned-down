/*
  Sample data for the brand dashboard's reference build. Every figure is invented; the page says so ("Sample data").
  The people are real 8x creators and their posts are their own videos from the catalog, shown with sample figures.
  The shapes follow the product's own data, so an engineer swaps this file for the real handlers:

    Brand, BrandMember            brand.prisma            the workspace and the person signed in
    BrandCampaign                 campaign.prisma         status, platforms on the contract, dates, targets
    CampaignAccountManager        campaign.prisma         the 8x person who runs it
    BrandCreator, SocialAccount   content.prisma          a creator on the campaign and their accounts
    BrandCreatorPost              payments.prisma         a post: views, likes, comments, shares
    PostMetricSnapshot            content.prisma          the daily figures the trend is built from

  The product's rules the data keeps (src/lib/brand-dashboard.ts, design.md):
    - engagement rate = (likes + comments + shares) / views
    - a change compares the last 7 days with the 7 before
    - a day's views are the lifetime views of the posts published that day, so older days have had longer to grow
    - missing is not zero: a platform without shares has `null`, printed N/A
    - only the platforms on the contract are shown
*/

export type Platform = "tiktok" | "instagram";

export const PLATFORM_LABELS: Record<Platform, string> = { tiktok: "TikTok", instagram: "Instagram" };

export type Person = { name: string; role: string; initials: string };

export type Creator = { id: string; name: string; handle: string; avatar: string };

export type Day = {
  date: string; // ISO, the day the posts went out
  posts: Record<Platform, number>;
  views: Record<Platform, number>; // lifetime views of that day's posts
  likes: number;
  comments: number;
  shares: number;
  creators: string[]; // who posted that day (ids), most viewed first
};

export type Post = {
  id: string;
  creator: Creator;
  platform: Platform;
  postedAt: string;
  caption: string;
  views: number;
  likes: number;
  comments: number;
  shares: number | null;
  video: string;
  poster: string;
  duration: string;
};

export type Update = {
  id: string;
  kind: "approved" | "posted" | "plan" | "joined";
  who: string;
  what: string;
  when: string;
  action?: string;
};

// the sample's now: the campaign's 24th day, in the afternoon
export const NOW = Date.parse("2026-11-03T16:00:00Z");

export const BRAND = {
  // a real client of 8x, by its official logo: e-Matura (ematura.si), online prep for the matura exam
  name: "e‑Matura",
  workspace: "Brand workspace",
  // its mark, small (the phone's top bar): the mortarboard whose board is an E, in its own blue and grey on white
  // (scripts/brand.py); the full one is CAMPAIGN.product.logo, and the lockup in white on its blue is the card's banner
  mark: "/media/ematura-icon-96.webp",
  member: { name: "Alex Carter", role: "Head of growth", initials: "AC" } satisfies Person,
};

export const MANAGER: Person = { name: "Maya Chen", role: "Account manager", initials: "MC" };

// the brand's other people on the workspace (the member signed in is BRAND.member)
export const TEAMMATES: Person[] = [{ name: "Jordan Reyes", role: "Social lead", initials: "JR" }];

export const CAMPAIGN = {
  id: "autumn-launch",
  name: "Autumn launch",
  status: "live" as "live" | "paused" | "ended",
  country: "Slovenia",
  startedAt: "2026-10-11",
  endsAt: "2026-11-09",
  day: 24, // today is its 24th day
  days: 30,
  platforms: ["tiktok", "instagram"] as Platform[], // on the contract, in the order the brand sees them
  postsPlanned: 300,
  creatorsTarget: 30,
  creators: 24,
  creatorsThisWeek: 3,
  product: { name: "e‑Matura", logo: "/media/ematura-icon.webp" },
};

// the brand's campaigns, newest first; each card takes one of the vertical's colours
export type CampaignCard = {
  id: string;
  name: string;
  status: "live" | "paused" | "ended";
  posts: number;
  planned: number;
  creators: number;
  faces: string[];
  tone: "deep" | "glow" | "accent";
};

export const CAMPAIGNS: CampaignCard[] = [
  { id: "autumn-launch", name: "Autumn launch", status: "live", posts: 248, planned: 300, creators: 24, faces: ["aastha", "carla"], tone: "deep" },
  { id: "summer-sampling", name: "Summer sampling", status: "ended", posts: 300, planned: 300, creators: 30, faces: ["mariana", "sultan"], tone: "glow" },
  { id: "campus-week", name: "Campus week", status: "paused", posts: 96, planned: 240, creators: 12, faces: ["pooja", "sevda"], tone: "accent" },
];

// what goes out next, from the content plan: approved, still in review with the brand, or scheduled
export type Slot = { time: string; creator: string; platform: Platform; title: string; status: "approved" | "review" | "scheduled" };

export const SCHEDULE: { date: string; label: string; slots: Slot[] }[] = [
  {
    date: "2026-11-03",
    label: "Today",
    slots: [
      { time: "10:00", creator: "carla", platform: "tiktok", title: "Study with me, part two", status: "approved" },
      { time: "13:20", creator: "aastha", platform: "instagram", title: "My hackathon desk, a week later", status: "approved" },
      { time: "18:00", creator: "kristine", platform: "instagram", title: "Three outfits, one bag", status: "review" },
    ],
  },
  {
    date: "2026-11-04",
    label: "Tomorrow",
    slots: [
      { time: "09:30", creator: "sevda", platform: "tiktok", title: "Breakfast in five minutes", status: "approved" },
      { time: "12:00", creator: "mariana", platform: "instagram", title: "The app I open first", status: "review" },
    ],
  },
  {
    date: "2026-11-05",
    label: "Thursday",
    slots: [
      { time: "11:00", creator: "pooja", platform: "instagram", title: "Day 30 of 60", status: "scheduled" },
      { time: "16:40", creator: "sultan", platform: "instagram", title: "What I saved this month", status: "scheduled" },
    ],
  },
];

// real 8x creators (the landing's tour and the ring light's take), with their own handles
export const CREATORS: Record<string, Creator> = {
  aastha: { id: "aastha", name: "Aastha Bishnoi", handle: "aastha.codes", avatar: "/media/people/aastha.webp" },
  carla: { id: "carla", name: "Carla Carvalho", handle: "estudandocomcarla", avatar: "/media/people/carla.webp" },
  sevda: { id: "sevda", name: "Şevda Düzyol", handle: "foodbysevda", avatar: "/media/people/sevda.webp" },
  pooja: { id: "pooja", name: "Pooja B Kittur", handle: "", avatar: "/media/people/pooja.webp" },
  mariana: { id: "mariana", name: "Mariana Fagundes", handle: "maarifagundes_", avatar: "/media/people/mariana.webp" },
  sultan: { id: "sultan", name: "Sultan Aydın", handle: "sultanduyguayd", avatar: "/media/people/sultan.webp" },
  kristine: { id: "kristine", name: "Kristine Gorgonio", handle: "closetby.krstn", avatar: "/media/people/kristine.webp" },
};

const POST = (id: string, platform: Platform, postedAt: string, caption: string, duration: string, views: number, likes: number, comments: number, shares: number | null): Post => ({
  id,
  creator: CREATORS[id],
  platform,
  postedAt,
  caption,
  views,
  likes,
  comments,
  shares,
  video: `/media/posts/${id}.mp4`,
  poster: `/media/posts/${id}.webp`,
  duration,
});

// the six most viewed, each on the day it went out (their days carry them in DAYS below)
export const TOP_POSTS: Post[] = [
  POST("aastha", "instagram", "2026-10-29", "How to win a hackathon: my exact stack", "0:26", 182_410, 9_120, 412, 688),
  POST("carla", "tiktok", "2026-10-18", "How I study five subjects in under three hours", "0:44", 146_212, 7_031, 288, 541),
  POST("sevda", "tiktok", "2026-10-30", "Storytime: what my friends did this time", "1:03", 121_904, 6_440, 301, 412),
  POST("pooja", "instagram", "2026-10-14", "Give me 60 days", "0:08", 98_310, 4_903, 190, 233),
  POST("mariana", "instagram", "2026-10-27", "Three sites I can't work without", "0:57", 76_402, 3_380, 142, 167),
  POST("sultan", "instagram", "2026-10-21", "No budget for takeaway? Try this", "0:44", 64_908, 2_980, 120, 214),
];

export const UPDATES: Update[] = [
  { id: "u1", kind: "approved", who: "Maya", what: "approved 6 videos", when: "2 h ago" },
  { id: "u2", kind: "posted", who: "9 creators", what: "posted today", when: "Today" },
  { id: "u3", kind: "plan", who: "Maya", what: "shared 3 new scripts to review", when: "Yesterday", action: "Review" },
  { id: "u4", kind: "joined", who: "Pooja B Kittur", what: "joined the campaign", when: "Mon" },
];
