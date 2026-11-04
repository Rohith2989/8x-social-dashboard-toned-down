/*
  The content plan's sample: what Maya wrote and shared, and everything the brand and Maya did on it since. Every
  word is invented. The shapes follow the product (server/api/brand/campaigns/plan/schema.ts, lib/format-activity.ts,
  lib/brand-flags.ts), and lib/plan.ts derives the rest from here:

    - a plan is named by its first day and runs to its last; its stage (waiting for approval, with creators, over)
      comes from today and whether creators have it
    - a format is a script with a hashtag; carried into a later plan it keeps its hashtag, so its posts add up, and
      each plan's copy has its own references and its own review
    - a script's review state is read from its activity, as the product's columns would have recorded it: an
      approval stands until Maya changes the script, a flag stays until Maya sends it back or changes it
    - a reference is one of the campaign's own posts (an account manager points the next plan at what worked), named
      here by its media (scripts/plan.py cut its clip and frames), or a link the page cannot play
*/

export type PersonKey = "you" | "jordan" | "maya";

export type ScriptFlagReason = "script" | "hook" | "cta" | "brandGuidelines" | "other";

// what Maya's editor calls each field, so a change names the box that changed
export type BriefField = "name" | "angle" | "hook" | "middle" | "close" | "dos" | "donts" | "references";

export type Format = {
  code: string;
  name: string;
  media: "reel" | "carousel";
  angle: string;
  hook: string;
  middle: string;
  close: string;
  dos: string[];
  donts: string[];
};

export type ReferenceSeed =
  | { post: string }
  | { link: string; source: "tiktok" | "instagram" | "youtube" };

export type EventSeed =
  | { kind: "added"; who: PersonKey; at: string }
  | { kind: "comment"; who: PersonKey; at: string; body: string }
  | { kind: "approved"; who: PersonKey; at: string }
  | { kind: "flagged"; who: PersonKey; at: string; reasons: ScriptFlagReason[]; note: string | null }
  | { kind: "flagResolved"; who: PersonKey; at: string; reasons: ScriptFlagReason[]; note: string | null }
  | { kind: "revised"; who: PersonKey; at: string; fields: BriefField[] };

export type ScriptSeed = {
  code: string;
  refs: ReferenceSeed[];
  events: EventSeed[];
  // Maya wrote something the brand has not seen yet
  unread?: boolean;
  // this plan's copy differs from the format as first written
  edits?: Partial<Omit<Format, "code">>;
};

export type PlanSeed = { start: string; end: string; shared: string; published: string | null; scripts: ScriptSeed[] };

/* --- the campaign's formats, as Maya first wrote them --- */

export const FORMATS: Format[] = [
  {
    code: "AUTUMN01",
    name: "The lesson I do first",
    media: "reel",
    angle:
      "The first ten minutes of the day. Before messages, the creator does one e‑Matura lesson and its quiz, and the day starts with something done. The calm of a head start, never a lecture about discipline.",
    hook: "In bed, phone in hand: “The first app I open every morning isn't Instagram.” Open e‑Matura on today's lesson.",
    middle: "Play a minute of the lesson, then the quiz after it, answered on screen. A line about each question, in your own words.",
    close: "Show the quiz score and get up. “One subject done before breakfast.”",
    dos: ["Film in your real morning light", "Show the quiz for at least three seconds", "Keep it under 30 seconds"],
    donts: ["No alarm or snooze jokes", "No notifications from other apps on screen"],
  },
  {
    code: "AUTUMN02",
    name: "Plan my week with me",
    media: "reel",
    angle:
      "A Sunday ritual people save: the week's revision lined up in five minutes. e‑Matura has the lessons; the creator decides which go on which day.",
    hook: "“It's Sunday, and this is the only planning I do all week.” Coffee, laptop, a five-minute timer on screen.",
    middle: "Pick the week's subjects, line up a lesson for each day and add the week's live webinar. Speed the footage up; keep your voice as it was.",
    close: "Scroll the week in one go. “Five minutes. Done until next Sunday.”",
    dos: ["Use your real subjects and blur anything private", "Show a lesson being picked", "Say how long it took"],
    donts: ["Don't call it homework", "No paper planners in frame"],
  },
  {
    code: "AUTUMN03",
    name: "Give me 60 days",
    media: "reel",
    angle:
      "A promise with a date on it. The creator commits on camera to a lesson a day until the matura, so every post after it is a check-in people come back for.",
    hook: "The promise as text over your face: “Give me 60 days and you won't recognise my grades.” Say the day you start.",
    middle: "Quick cuts of the habit, a different day in each, with that day's lesson and its quiz score on screen between them.",
    close: "Turn to the side and hold it. “Day one is tomorrow. Follow along.”",
    dos: ["Put the start date in the text", "Show a quiz score in each check-in", "Frame every cut the same way"],
    donts: ["Don't promise a grade", "No before-and-after claims about marks"],
  },
  {
    code: "AUTUMN04",
    name: "Three apps I can't study without",
    media: "reel",
    angle: "A list people save. Three study tools, each named on screen as it comes up, and e‑Matura kept for last, where the list lands.",
    hook: "To camera, with the list's promise on screen: “Three study apps I can't believe people still don't know.”",
    middle: "Name each one as a label while you show what it does. e‑Matura is the third: open a lesson and its quiz.",
    close: "“Save this before the matura.” Hold on e‑Matura's name.",
    dos: ["Name each app on screen as you say it", "Keep e‑Matura third", "Give e‑Matura the longest turn"],
    donts: ["No other matura prep platforms in the list", "Don't rank the three"],
  },
  {
    code: "AUTUMN05",
    name: "Study with me",
    media: "reel",
    angle: "How a student gets through five subjects in an afternoon: a short lesson for each does the explaining. Calm, never a grind.",
    hook: "To camera, a snack in hand: “This is how I study five subjects in under three hours.”",
    middle: "Screen-record e‑Matura: pick a subject, play the lesson, do its exercises, take the quiz, on to the next.",
    close: "Back to camera: “Then I just repeat it. Every day.”",
    dos: ["Show the lesson and the quiz, not only the score", "Real subjects and the real matura date", "Hold the phone or laptop steady"],
    donts: ["Don't promise grades", "No music with words under the voice"],
  },
  {
    code: "AUTUMN06",
    name: "Stuck? Try this",
    media: "reel",
    angle: "A tip for the exercise everyone gets stuck on: the creator's real one, and the e‑Matura lesson that got them through it.",
    hook: "A line people say out loud, on screen: “Stuck on the same exercise for an hour?” Your hands busy with your notes from the first frame.",
    middle: "Show the exercise you were stuck on, then the minute of the lesson that explains it, then the same exercise done.",
    close: "Show the quiz after the lesson and say your score.",
    dos: ["Use a real exercise from your subject", "Show the explanation on screen", "Say the score out loud"],
    donts: ["Don't knock teachers or tutors", "No prices or discounts unless 8x gives them to you"],
  },
  {
    code: "AUTUMN07",
    name: "Storytime",
    media: "reel",
    angle: "A story told to camera in one take, the kind people stay to the end for. e‑Matura is how the story turns, never how it starts.",
    hook: "Start mid-story with the line on screen: “My friends laughed at my study plan. Here's what happened.”",
    middle: "Tell it to camera in one take. Cut away once, to the moment e‑Matura changed what happened.",
    close: "Ask the audience to judge it: “Who was right?” Put the question in the caption too.",
    dos: ["One take for the story", "Show the app once, where the story turns", "A real story, in your own words"],
    donts: ["Don't read from a script", "No other apps by name"],
  },
  {
    code: "AUTUMN08",
    name: "My exact stack",
    media: "reel",
    angle: "The tools behind a result people want, built up as a numbered list on screen. e‑Matura is the one that holds the revision together.",
    hook: "The goal as a title on screen: “How I got through mock exam season.” Say it like someone who has.",
    middle: "Build the list a line at a time, up to five, e‑Matura among them, each with one line of why.",
    close: "Show the whole list and say which one you'd keep if you could only keep one.",
    dos: ["Number the list on screen", "One line of why for each tool", "Your own result, said plainly"],
    donts: ["No paid links in the list", "Don't put e‑Matura first: let it land"],
  },
  {
    code: "AUTUMN09",
    name: "What I covered this month",
    media: "reel",
    angle: "The month in one number. The creator keeps their hands busy, talks through how they studied, and ends on how many lessons they finished.",
    hook: "On screen: “How I study with a part-time job.” Your hands at work from the first frame.",
    middle: "Talk through the one change that saved the most time while you keep working; no cutaways.",
    close: "Show the month's finished lessons in e‑Matura and say the number out loud.",
    dos: ["Say a real number", "Keep your hands in frame", "Show your lessons for three seconds"],
    donts: ["Don't promise grades", "No school logins or personal details on screen"],
  },
  {
    code: "AUTUMN10",
    name: "Before and after",
    media: "reel",
    angle: "The mess, then the fix: two halves of one video. Revision before e‑Matura, then the same desk with it.",
    hook: "“My revision before:” over the real chaos, a buried desk and five open tabs.",
    middle: "Step by step on screen: “1. Pick the subject.” “2. Play the lesson.” “3. Take the quiz.”",
    close: "End on the quiz result, full screen: “And this is it after.”",
    dos: ["Film before and after in the same place", "Number the steps on screen", "End on the quiz result"],
    donts: ["Don't stage a mess", "No other apps in frame"],
  },
  {
    code: "AUTUMN11",
    name: "If this existed in real life",
    media: "reel",
    angle: "A film everybody remembers where someone learns a whole subject in seconds. e‑Matura is the nearest thing to it, for real.",
    hook: "A still of the scene you mean, then your face: “If someone made this in real life, would you use it?”",
    middle: "Do it in e‑Matura: pick a subject, play a lesson, take the quiz.",
    close: "“Well, someone nearly did.” Hold on the app.",
    dos: ["Pick a scene people will name in the comments", "Show the lesson doing what the scene promised"],
    donts: ["A still only, never the film's clip or its sound", "Don't name the film in the caption"],
  },
  {
    code: "AUTUMN12",
    name: "Until I found this",
    media: "reel",
    angle: "A problem everyone has, said with feeling, then the find. The turn is the app on screen.",
    hook: "Say the problem first: “Matura revision was a mess. Until I found this.” Point at the screen, the line on screen with you.",
    middle: "Show three things it does for you, each a line on screen as you show it: the lessons, the quiz after each, the notes.",
    close: "“Some webinars are even free. The link's in my bio.”",
    dos: ["Name the problem in the first two seconds", "Three features, three lines"],
    donts: ["Don't call it a game-changer", "No pretend surprise"],
  },
  {
    code: "AUTUMN13",
    name: "POV: the night before",
    media: "reel",
    angle: "A POV students know: the night before the matura. The revision was done with e‑Matura weeks ago, so the panic is the joke, not the story.",
    hook: "POV text over your face, mid-panic: “POV: it's the night before the matura and you planned nothing.”",
    middle: "Cut to the screen: the lessons you did, one after another, the last quiz's score on screen.",
    close: "Back to your face, calm now: “Sorted.”",
    dos: ["Keep the POV line on screen the whole video", "Show your lessons for three seconds"],
    donts: ["No cheating jokes", "Don't name a real school"],
  },
];

/* --- the plans Maya shared, one a week, back to back --- */

const at = (day: string, time: string) => `${day}T${time}:00Z`;
const added = (when: string): EventSeed => ({ kind: "added", who: "maya", at: when });
const approved = (who: PersonKey, when: string): EventSeed => ({ kind: "approved", who, at: when });
const comment = (who: PersonKey, when: string, body: string): EventSeed => ({ kind: "comment", who, at: when, body });

const MORNING_TIKTOK: ReferenceSeed = { link: "https://www.tiktok.com/@morning.lessons/video/7425133590012741890", source: "tiktok" };
const SIXTY_DAYS_REEL: ReferenceSeed = { link: "https://www.instagram.com/reel/C8y2kQ1sR4p/", source: "instagram" };
const STUDY_SHORT: ReferenceSeed = { link: "https://www.youtube.com/shorts/x8Qp2LkT0aE", source: "youtube" };

export const PLAN_SEEDS: PlanSeed[] = [
  {
    start: "2026-10-11",
    end: "2026-10-17",
    shared: at("2026-10-09", "14:05"),
    published: at("2026-10-11", "08:00"),
    scripts: [
      {
        code: "AUTUMN01",
        refs: [MORNING_TIKTOK],
        events: [
          added(at("2026-10-09", "14:05")),
          comment("you", at("2026-10-09", "16:40"), "Can it open on the lock screen widget? It's the part of the app people don't know about."),
          { kind: "revised", who: "maya", at: at("2026-10-09", "17:02"), fields: ["hook"] },
          comment("maya", at("2026-10-09", "17:03"), "Yes: the hook now shows the widget before the app opens."),
          approved("you", at("2026-10-10", "09:06")),
        ],
      },
      { code: "AUTUMN02", refs: [], events: [added(at("2026-10-09", "14:05")), approved("jordan", at("2026-10-09", "17:20"))] },
      { code: "AUTUMN03", refs: [SIXTY_DAYS_REEL], events: [added(at("2026-10-09", "14:05")), approved("jordan", at("2026-10-09", "17:24"))] },
      { code: "AUTUMN04", refs: [], events: [added(at("2026-10-09", "14:05")), approved("you", at("2026-10-10", "09:10"))] },
      { code: "AUTUMN05", refs: [STUDY_SHORT], events: [added(at("2026-10-09", "14:05")), approved("you", at("2026-10-10", "09:12"))] },
    ],
  },
  {
    start: "2026-10-18",
    end: "2026-10-24",
    shared: at("2026-10-16", "08:45"),
    published: at("2026-10-18", "08:00"),
    scripts: [
      { code: "AUTUMN05", refs: [STUDY_SHORT], events: [added(at("2026-10-16", "08:45")), approved("you", at("2026-10-16", "10:02"))] },
      {
        code: "AUTUMN03",
        refs: [{ post: "pooja" }],
        events: [
          added(at("2026-10-16", "08:45")),
          comment("maya", at("2026-10-16", "08:47"), "Carried over: Pooja's was the most watched post of the first week."),
          approved("you", at("2026-10-16", "10:04")),
        ],
      },
      { code: "AUTUMN06", refs: [{ post: "nicole-1" }], events: [added(at("2026-10-16", "08:45")), approved("you", at("2026-10-16", "10:07"))] },
      {
        code: "AUTUMN07",
        refs: [{ post: "heloisa-10" }],
        edits: { donts: ["Don't read from a script"] },
        events: [
          added(at("2026-10-16", "08:45")),
          comment("jordan", at("2026-10-16", "11:15"), "Are the stories written for them? Ours always do better when they're real."),
          comment("maya", at("2026-10-16", "11:48"), "Real ones only. Creators bring their own story; the hook is an example of the shape."),
          approved("jordan", at("2026-10-16", "14:20")),
        ],
      },
      { code: "AUTUMN01", refs: [MORNING_TIKTOK], events: [added(at("2026-10-16", "08:45")), approved("you", at("2026-10-16", "10:09"))] },
    ],
  },
  {
    start: "2026-10-25",
    end: "2026-10-31",
    shared: at("2026-10-24", "08:30"),
    published: at("2026-10-25", "08:00"),
    scripts: [
      { code: "AUTUMN05", refs: [{ post: "carla" }], events: [added(at("2026-10-24", "08:30")), approved("you", at("2026-10-24", "09:31"))] },
      {
        code: "AUTUMN07",
        refs: [{ post: "heloisa-10" }],
        events: [
          added(at("2026-10-24", "08:30")),
          {
            kind: "flagged",
            who: "jordan",
            at: at("2026-10-24", "10:15"),
            reasons: ["brandGuidelines"],
            note: "Two of last week's storytimes named other apps. Can we rule that out?",
          },
          { kind: "revised", who: "maya", at: at("2026-10-24", "12:38"), fields: ["donts"] },
          {
            kind: "flagResolved",
            who: "maya",
            at: at("2026-10-24", "12:40"),
            reasons: ["brandGuidelines"],
            note: "Added a don't: no other apps by name. Sending it back.",
          },
          approved("jordan", at("2026-10-24", "15:02")),
        ],
      },
      { code: "AUTUMN06", refs: [{ post: "sultan" }, { post: "nicole-1" }], events: [added(at("2026-10-24", "08:30")), approved("you", at("2026-10-24", "09:36"))] },
      {
        code: "AUTUMN08",
        refs: [{ post: "bhavishay-1" }],
        events: [
          added(at("2026-10-24", "08:30")),
          comment("you", at("2026-10-24", "09:38"), "Can the goal be something other than a hackathon? Not every creator codes."),
          comment("maya", at("2026-10-24", "10:02"), "Creators pick their own goal. The hackathon is just the example."),
          approved("you", at("2026-10-24", "10:20")),
        ],
      },
      { code: "AUTUMN04", refs: [{ post: "manisha-4" }], events: [added(at("2026-10-24", "08:30")), approved("you", at("2026-10-24", "09:40"))] },
    ],
  },
  {
    start: "2026-11-01",
    end: "2026-11-07",
    shared: at("2026-10-31", "09:00"),
    published: at("2026-11-01", "08:00"),
    scripts: [
      {
        code: "AUTUMN08",
        refs: [{ post: "aastha" }],
        events: [
          added(at("2026-10-31", "09:00")),
          comment("maya", at("2026-10-31", "09:02"), "Aastha's is our best post yet, so this one leads the week."),
          approved("you", at("2026-10-31", "10:02")),
        ],
      },
      { code: "AUTUMN07", refs: [{ post: "sevda" }], events: [added(at("2026-10-31", "09:00")), approved("you", at("2026-10-31", "10:04"))] },
      {
        code: "AUTUMN04",
        refs: [{ post: "mariana" }],
        unread: true,
        events: [
          added(at("2026-10-31", "09:00")),
          approved("jordan", at("2026-10-31", "11:40")),
          comment("maya", at("2026-11-03", "12:10"), "A good start: the first posts on it are in. Mariana's from last week is still the one to beat."),
        ],
      },
      { code: "AUTUMN09", refs: [{ post: "heloisa-5" }], events: [added(at("2026-10-31", "09:00")), approved("you", at("2026-10-31", "10:08"))] },
      {
        code: "AUTUMN10",
        refs: [{ post: "sevda-7" }],
        events: [
          added(at("2026-10-31", "09:00")),
          approved("you", at("2026-10-31", "10:10")),
          { kind: "revised", who: "maya", at: at("2026-11-02", "11:20"), fields: ["close"] },
          comment("maya", at("2026-11-02", "11:22"), "Creators asked to end on the week rather than on their face, so the close changed. Nothing else did."),
        ],
      },
    ],
  },
  {
    start: "2026-11-08",
    end: "2026-11-09",
    shared: at("2026-11-02", "15:10"),
    published: null,
    scripts: [
      { code: "AUTUMN08", refs: [{ post: "aastha" }, { post: "bhavishay-1" }], events: [added(at("2026-11-02", "15:10")), approved("you", at("2026-11-03", "09:12"))] },
      {
        code: "AUTUMN07",
        refs: [{ post: "sevda" }],
        unread: true,
        edits: { close: "Ask the audience to judge it, then: “And it's free, so no excuses.”" },
        events: [
          added(at("2026-11-02", "15:10")),
          {
            kind: "flagged",
            who: "you",
            at: at("2026-11-03", "09:20"),
            reasons: ["cta", "brandGuidelines"],
            note: "The close says the app is free. Our guidelines say free to start.",
          },
          comment("maya", at("2026-11-03", "10:05"), "Good catch. I'll change the close and send it back this afternoon."),
        ],
      },
      {
        code: "AUTUMN11",
        refs: [{ post: "heloisa-1" }],
        events: [
          added(at("2026-11-02", "15:10")),
          comment("maya", at("2026-11-02", "15:12"), "New this week, after Heloisa's post on 31 Oct. Creators pick their own scene."),
        ],
      },
      {
        code: "AUTUMN12",
        refs: [{ post: "aleyna-1" }, { post: "bhavishay-1" }],
        unread: true,
        events: [
          added(at("2026-11-02", "15:10")),
          comment("jordan", at("2026-11-03", "11:30"), "Can the hook say what the problem was? “Until I found this” on its own is everywhere this month."),
          { kind: "revised", who: "maya", at: at("2026-11-03", "13:40"), fields: ["hook"] },
          comment("maya", at("2026-11-03", "13:41"), "Done: the hook names the problem first now."),
        ],
      },
      { code: "AUTUMN13", refs: [{ post: "carla-1" }], events: [added(at("2026-11-02", "15:10"))] },
    ],
  },
];

/* --- the campaign's standing rules, as Maya wrote them (the product stores them as markdown) --- */

export const GUIDELINES = {
  brief: `## e‑Matura, matura prep a lesson at a time

e‑Matura gets students ready for the matura online: short video lessons with exercises and a quiz after each, notes to keep, live webinars and tutoring, across a dozen subjects. This campaign brings it to students in their last two years of school, as the first thing they open when they sit down to study.

### What people should feel
That the matura is handled, a lesson at a time. Calm, a little proud, and real: never a lecture about studying.

### What to show
- A lesson playing, for at least three seconds
- The quiz after it, and the score
- The subject you are on
- A live webinar, if you joined one

### The line
**Ready for the matura.** Say it in your own words; never read it out.`,
  posting: `- Put the script's hashtag in the caption (**#AUTUMN07**), so the post counts toward its script.
- Tag e‑Matura's account (8x sends you the handle) and turn on the platform's paid-partnership label.
- Some webinars are **free**; never call e‑Matura free.
- Show the app on screen for at least three seconds. No other matura prep platforms in frame.
- Keep it between 15 and 60 seconds, with music from the platform's commercial library.
- Post between 7am and 10pm where you live, one post a day at most.
- No promises about grades or results: say what worked for you.`,
};
