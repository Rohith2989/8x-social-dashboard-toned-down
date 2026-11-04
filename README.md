# Social dashboard: reference build

The brand's side of 8x Social, fully managed: its home (the newest campaign's overview), Creators, Posts & feed, the
Content plan, Analytics, Team and Settings, and the sign-in page, each in two looks: Daybreak and Night (the switch
above Settings). It is a reference, not the product. Every control on every page does what it says. Every figure is
sample data (the pages say so), and the media are placeholders. Build the real pages from it, and build the other
verticals' dashboards by changing one attribute (below).

```bash
npm install
npm run dev        # http://localhost:3012 (the overview), /creators, /posts, /plan, /analytics, /team, /settings, /sign-in
npm run build      # static build; also runs the type check
npm run lint
```

Next 16.4.3, React 19.2, TypeScript, CSS modules on the brand's tokens. No UI kit, chart library or icon package:
everything is in this repo, so it ports into the product as is.

## The frame

In the visual language of Halo Lab's dashboards (the references: their "Chaart" and "boosto" shots), the app is one
rounded window floating in the vertical's night: its darkest shade with its aura alive in it, the window itself
light. The frame is the dashboard's layout (`app/(dashboard)/layout.tsx`, `components/shell`), so moving between pages
keeps the window, the aura and the sidebar still (the sign-in page stands outside it); each page gives the window its tray (the soft inset panel that scrolls) and its right-hand column.
Nothing shows a scroll bar: the tray, the column, menus, sheets and dialogs all scroll by wheel, trackpad, touch and
keys without one.

- **Every width.** The window fills the screen. Below 1360 px the right-hand column folds into the tray (the overview)
  or becomes a sheet (Creators); below 1200 px the sidebar folds to a rail; on a phone the window opens out and the
  sidebar becomes a drawer. From 2100 px the window is drawn larger rather than stretched thin (`zoom`), so a 2560 px
  screen shows the layout a 1920 px one does. Every view is checked from 320 to 2560 px, open menus and dialogs
  included: on the narrowest phones the segmented controls drop their icons, the wide tables fold one more column,
  and the selection bar keeps its count and every action's icon. On short laptop screens the sidebar closes up, so the Night switch,
  Settings and Log out stay clear of the blob (on the shortest the blob gives way); shorter still, or held sideways, the
  sidebar scrolls. In a narrow tray a page's actions go under its title, and on a phone they fill their row. Headings
  wrap evenly and paragraphs never end on a lone word; dates and figures never split across lines. Small controls keep a
  finger's room (an invisible hit area round them). Each part was looked at, not only measured, at every width.
- **Sidebar** (`shell/sidebar.tsx`): the logo, then the brand as a profile, round: its mark on a white disc inside a
  thin ring of the brand's own blues, with a live dot on the ring while a campaign runs. On hover the ring's light
  turns once round it and a sheen crosses the mark. A click opens the brand's card (below). Then the pages,
  the Night switch (small, above Settings), Settings and Log out, and a blob of the vertical's colours with grain at
  the foot.
- **The brand's card** (`shell/workspace.tsx`): not a list of links the sidebar already has, but the workspace at a
  glance.
  - The brand's own logo across its top: e-Matura's lockup in white on its blue.
  - The live campaign and how far along it is (its day, a track of the posts out of those planned).
  - The 8x account manager, with Write.
  - The people on the workspace and the requests with 8x.
  - Settings and Sign out at its foot.

  It grows out of the brand's photograph with a glint crossing the brass, and is drawn at the window's scale on a
  2560 px screen.

## The overview (`/`)

| Part | File | What it shows |
|---|---|---|
| Greeting | `dashboard/overview.tsx` | Hello, the day, where the campaign is, and the one action (Start a campaign). |
| Performance | `dashboard/performance.tsx` | On ink: views and engagement rate, then what the people behind it just did, each with its check drawn in one of the vertical's colours. |
| Activity | `dashboard/activity.tsx` | On the vertical's palest tint: views, likes or posts by day over a week, two or the whole campaign. A white line over a field of fine dots; one day picked out with an ink marker, a line of dots down to its name in an ink pill, and one tooltip. Pointing moves the pick. |
| Engagement | `dashboard/engagement.tsx` | A strip of the accent's tint with grain: this week's likes, comments, shares and rate, each tile with its icon on a square half above it. The last card (the hooks waiting for review, with Social's bubble) breaks out past the strip. |
| Coming up | `dashboard/coming-up.tsx` | The content plan's next three days: each post at its time, a bar for where it stands, the creator and platform over its title; the account manager at the foot. |
| Your campaigns | `dashboard/campaigns.tsx` | The campaigns as blocks of the vertical's colours: faces, name, posts against the plan; a place for the next one outlined in fine dots. |
| Top-performing posts | `dashboard/top-posts.tsx` | The best posts in 9:16, playing on hover, their progress in dots. |
| Pace | `dashboard/pace.tsx` | A block of the vertical's colour with grain: posts against the plan as rings of white dots, a white tick where the plan says it should be today; beside them how far ahead, the rate so far, the rate the rest needs, and what is left. |
| Posting calendar | `dashboard/rhythm.tsx` | The campaign as a compact month on a pale grain ground: each day a low tile filled on the vertical's six steps by its posts (white to deepest, graded across the campaign's own range), date left, count right; today ringed in ink; days to come outlined in dots, a hollow dot per planned post; the days either side only their faint dates; the key beside the title; the day's creators on hover. |

## Creators (`/creators`)

The product's Creators tab, part by part, redesigned: [docs/creators.md](docs/creators.md) says what each part was,
what it is now, and every state it has. In short:

| Part | File | What it does |
|---|---|---|
| The page | `creators/creators.tsx` | Search, filters, sort, view and the open creator live in the URL; picks and new flags live with the page. Export (CSV of the list as filtered) and Ask for creators. |
| Roster summary | `creators/summary.tsx` | The roster as a wall of faces with the plan's open places in dotted rings; who is posting, a dot a person, each status a filter; the creator of the week. |
| Toolbar | `creators/toolbar.tsx` | Search (`/` to reach it, Esc to clear), status with counts, platforms by their icons, countries by their flags with counts in scope, sort and direction, cards or table; what is applied as a sentence whose parts remove themselves. |
| Cards | `creators/card.tsx` | A creator per card: their banner (8x's own, `creators/banner.tsx`: soft lights in the vertical's colours over one of six grounds, placed from their name, with grain) and their platforms, the face in its status ring on a plate over the banner's edge, views with a dot sparkline, best posts; hover lifts it, lets the banner's light drift and shows its check; the open one is outlined in ink. Cards glide to their new places on a sort or a filter (`flip.ts`). |
| Table | `creators/table.tsx` | The same columns as the product; heads cycle highest, lowest, default; a creator opens to their accounts, an account to its posts. |
| Profile | `creators/profile.tsx` | The open creator in the right-hand column (a sheet when narrow): their banner and face, status in words, four figures, fourteen days across the column (a day's views on hover), accounts with their figures and live links, best posts, flag or lift a flag. |
| Selection bar | `ui/selection-bar.tsx` | Rises with the first pick: copy profile links, export, flag for the account manager, clear (Esc). |
| Dialogs | `creators/flag-dialog.tsx`, `ask-dialog.tsx` | Flag: the five reasons as rows, a note, Send waits for a reason, the dot loader, then the dialog's own confirmation and an Undo toast. Ask: how many, platforms, market, a note. |
| Empty states | `creators/empty.tsx` | Nothing matches, nobody posted lately, nobody cast yet: why, and the one thing to do, over a ring of empty places in dots. |

## Posts & feed (`/posts`)

The product's Posts and Feed tabs as one page with two views, part by part: [docs/posts.md](docs/posts.md). In short:

| Part | File | What it does |
|---|---|---|
| The page | `posts/posts.tsx` | Search, filters, view, the open post and how far the feed and table run live in the URL; picks and new flags live with the page. Export (CSV of the posts as filtered) and Copy spark codes (every TikTok code in view). |
| Summary | `posts/summary.tsx` | The posts in view, totals rolling as the filters change; how far they got, the milestone ladder with a dot a post, each rung a filter. |
| Toolbar | `posts/toolbar.tsx` | Search, creators by their faces (several at once), platforms, the day, Feed or Table; what is applied as a sentence. |
| Feed | `posts/feed.tsx` | The days, newest first, each heading sticky, its posts in a sideways row that rests on whole cards; a card plays its post on hover. Sparse results read as one dated grid. |
| Table | `posts/table.tsx` | The product's columns, two folded into their cells so it always fits; sortable heads; spark codes to copy; a day taken to from the feed, tinted. |
| Post | `posts/post.tsx` | The open post in the right-hand column (a sheet when narrow): playing in its platform's dress, its five figures, the next milestone in dots, its views by day, copy link, spark code, download, flag. |
| Milestone mark | `posts/mark.tsx` | A ring of five steps filled to the post's tier, in the vertical's ramp. |
| Empty state | `posts/empty.tsx` | Three empty posters outlined in dots, why nothing matches, Clear. |

## Content plan (`/plan`)

The product's Content plan tab, part by part: [docs/content-plan.md](docs/content-plan.md). 8x writes the scripts, the
brand approves them, creators film them. In short:

| Part | File | What it does |
|---|---|---|
| The page | `plan/plan.tsx` | The open plan, script, filter and the conversation's sheet live in the URL (the browser's own history, so it changes at once). Export (the open plan's scripts as CSV) and Suggest an idea (to Maya). |
| Summary | `plan/summary.tsx` | The plans in time on the deep blue, a column a plan under the product's stages (Past plans, Live, For approval): scripts as numbered marks in their state, what it came to, its days with today lit; the open one white. What works: the scripts with the most views a post, across every plan they ran in. |
| The open plan | `plan/open-plan.tsx` | Name, dates, who shared it and when, last changed and reviewed, where it stands; Show (the product's filter); Approve the ones waiting; the scripts as tiles with a picture of what each asks for, its state in words, its results once creators have it. |
| The script | `plan/script.tsx` | The reference playing in its own column; the name large, hashtag, due date, state; Approve (the heart and its burst) and Flag, disabled with the product's reasons; context; how it did with its posts; how it goes as a storyboard of the reference's own frames; do and do not. |
| Activity | `plan/activity.tsx` | The script's thread with Maya in the right-hand column (a sheet when narrow): comments and every change, approval, flag and send-back, oldest first, opening on the newest; the box to write in. |
| Guidelines | `plan/guidelines.tsx` | What every plan is written to: the brief and the posting guidelines, read from Maya's markdown (`lib/brief.ts`). |
| Dialogs | `plan/dialogs.tsx` | Approve asks first, naming the scripts by their pictures; Suggest an idea. Flagging uses the shared composer with the script's own reasons. |
| Store | `plan/store.ts` | What the brand does in the visit, as entries in the scripts' activity; the sidebar's count and the overview's card read it too. |

## Analytics (`/analytics`)

The product's Analytics tab, part by part: [docs/analytics.md](docs/analytics.md). What the campaign did for the
brand's business, one source at a time (the website, TikTok Ads, Meta Ads), never added together. In short:

| Part | File | What it does |
|---|---|---|
| The page | `analytics/analytics.tsx` | The source, the window (since 8x, 14 or 7 days, each against the days before it), the metric, split, open day and the dialogs live in the URL. |
| Headline figures | `analytics/headline.tsx` | Revenue on the deep blue, visitors, sessions and cost per sale, each moved as an arrow and a figure (on cost, down is good) over the facts that explain it. |
| The chart | `analytics/chart.tsx` | The website with 8x on it: the window lit beside the days before it, a named seam, a split's lines in the vertical's ramp with a legend that switches them, the posts as dots under the days and the creators' faces on the jumps; a day's card on hover; pressing a day opens it. |
| The open day | `analytics/day.tsx` | The right-hand column: the day against a usual day before 8x, its channels as one bar, the views the campaign earned and the posts that went out. |
| Sources | `analytics/sources.tsx` | Top sources by name and how the visit came (Google Analytics' source / medium on hover), the routes 8x's creators bring marked with the 8x mark; sortable and shaded by value, folding to fit; the share through social in dots; devices as one bar. |
| Ad views | `analytics/ads.tsx`, `ad-post.tsx` | TikTok Ads and Meta Ads: four figures, delivery rates, views by day, the boosted posts (the open one plays on the right), creators by cost, who saw them, the two side by side. |
| Dialogs | `analytics/connect.tsx`, `ask.tsx` | Connect your data: every source and its state, a key to connect the rest. Ask about this data: the product's three openers, answered from the window's figures. |

## Team (`/team`)

The product's Team page, part by part: [docs/team.md](docs/team.md). Who on the brand's side can see its campaigns,
how to bring someone in, where each request stands with 8x, and who at 8x works for the brand. The workspace's page,
not a campaign's. In short:

| Part | File | What it does |
|---|---|---|
| The page | `team/team.tsx` | The line says how many people and how many requests are with 8x; a request just sent opens the product's "Request sent to 8x" and lights its row. |
| Add your team-mates | `team/invite.tsx` | A work email and Request access on the deep blue, with the way every request goes beside it (you ask, 8x reviews, they sign in; the 8x stop counts the requests with 8x now). The product's refusals word for word, each pointing at the row it means. |
| People | `team/people.tsx` | Every member a card of its own subtle colour: their face on a disc (initials where there is none), the role in words, the campaigns they see lit among the brand's three, their latest on the content plan (it opens the script, and follows the visit's approvals), since when. |
| Access requests | `team/requests.tsx` | Each request in the product's words, its way drawn as a short track (asked, 8x, signed in); withdraw (the product's dialog) and ask again. Who at 8x decided is never shown. |
| Your 8x team | `team/eightx.tsx` | The right-hand column (in the tray below 1360 px): Maya · 8x, the campaigns she runs, her latest on the plan, the way to write to her (the plan's thread); the creators making the posts. |

8x people reach the brand the product's way everywhere: by first name with "· 8x", their disc an initial; an account
manager's last name and email never show (design.md).

## Settings (`/settings`) and signing in (`/sign-in`)

The product has no brand Settings page; this one gathers what a member can see and change from the product's own data:
[docs/settings.md](docs/settings.md). In short:

| Part | File | What it does |
|---|---|---|
| The workspace | `settings/settings.tsx` | The brand's logo and name, your role, the people, the currency, since when, the three campaigns and where each stands; set by 8x, so the way to Maya. |
| Your account | `settings/settings.tsx`, `account.ts` | First and last name and phone, editable (Save wakes on a change; an empty first name cannot be saved); the work email read-only, with the product's sign-in line. A saved name shows on the overview and on Team. Then what you reach: the campaigns you see, since when, the scripts you approved. |
| Connected data | `settings/settings.tsx` | The six sources and where each stands; Connect opens the same dialog as Analytics, and one store keeps both pages agreeing. |
| This browser | `settings/settings.tsx` | The right-hand column: signed in as whom and how, Sign out, and Need a change? with Maya. |
| Sign in | `sign-in/sign-in.tsx` | The product's page in the window's night: Work email, Email me a code, the six-slot code (paste and one-time-code fill work), Verify and sign in, Send a new code, Continue with Google. Signed out on purpose, it says so. In the sample any six digits sign in. |

**Every control acts.** The window's own: search across the workspace (the overview's button, or ⌘K / Ctrl K
anywhere: pages, creators, posts, scripts, people), and Start a campaign, which asks which way (Self Service: start a
free trial on web.8x.social; Full Service: book a call), from the overview's header and the campaigns' empty place.
The brand's card in the sidebar opens the workspace at a glance. On the overview, See all and each campaign's ⋮ open
the campaigns (the live one's pages; what the paused and ended ones did), the bell opens the latest and marks it
read, each day's ⋮ opens it on the content plan or copies its schedule, and Performance's ⋮ exports the days, opens
Analytics or every post. The menus are one part, `components/ui/actions.tsx`: on the page's top layer, kept on screen,
arrow keys and Esc.

Shared parts in `components/ui`: the card resolve, buttons with the brand's current, icons with their own motions,
the drawn checkbox, segmented controls, the one dropdown (`menu.tsx`) and its multi-select (`multi-menu.tsx`), the
selection bar (`selection-bar.tsx`, each page hands it its own actions), a sideways row that rests on whole items
(`sideways.ts`), dialog, sheet, toasts, country flags drawn as SVG (Windows shows emoji flags as letters), platform
icons, rolling numbers.

## The design system

All of it comes from the brand kit (8x brand kit v6: `references/tokens.css`, `dataviz.md`, `components.md`,
`icons.md`).

**Colour.** `app/globals.css` holds the tokens. Ink `#0B0B0C` for the one action that matters, paper cards on a ground
taken from the vertical's own light (never the kit's warm stone: a warm ground beside white read as "skin and white"),
greys mixed from the vertical's ink, and one vertical colour for the moment that matters. The vertical is set
once in `app/layout.tsx`:

```tsx
<html data-vertical="social">   // social | linkedin | research | sales | hiring
```

Every vertical colour on the page reads `--vertical`, `--vertical-deep`, `--vertical-glow`, `--vertical-light`,
`--vertical-tint`, `--vertical-accent` and `--vertical-ink`, including the aura and the dots drawn in canvas. Change
the attribute and the whole dashboard is that vertical's.

**Type.** Archivo 900 at width 62 for numbers (`.num`), Hanken Grotesk for everything you read, Geist Mono for values
(`.mono`). Nothing you need to read is under 15 px; chart ticks and small values are 12.5 to 14 px in Geist Mono.

**Shape.** The window radius 38, the tray 30, cards 26 and tiles 22, soft shadows instead of hairlines (Halo Lab's).
Buttons are pills; the period menu and icon buttons are rounded squares.

**A colour for every card.** A paper card can carry a subtle colour of its own (`tint` on `Card`, or `data-tint`): sky,
lilac, blue or pearl, each mixed from the vertical's own tokens and lit softly from its top right, with the colour
blocks' grain faint behind the content (`app/globals.css`). Subtle, never vibrant: the headline tiles, the sources and
every Team card wear one.

**Readable in both looks.** Every word on every page, in Daybreak and in Night, open menus and dialogs too, is
measured against what is really drawn behind it (`scripts/contrast.py`): 4.5:1 for small words, 3:1 for large ones. A flagged, deleted or
dropped item fades its pictures, never its words (they take the quiet colour instead). The cobalt blocks' corner light
is the vertical deepened, not whitened, so the words in that corner read too.

**No chips.** A change is an arrow and a figure (`Change` in `components/ui/bits.tsx`), a status is a dot and a word.
Values never sit in small rounded badges.

## Night

Every page has a dark look of its own, Night, designed part by part (`docs/night.md`). It is not grey on black: the
window becomes a navy-black pane in the lit aura and its tray a deeper well; the cards are a step up, lit faintly from
above. The vertical's colour is the light in it: the lead blocks glow on the tray, the chart's line glows, the lit
dots shine, the creators' banners become auroras.

- **One ladder of surfaces.** Ink blocks, tray, window, popover, float, deepest first. A white tile in Daybreak becomes
  glass at Night.
- **Tokens.** Night redefines the day's tokens on `<html data-theme="dark">`, each mixed from the vertical's own, so
  every vertical gets its own night. The new tokens hold Daybreak's old values, so Daybreak did not move.
- **Each part.** Every component's stylesheet ends with its own Night block.
- **The switch** (`shell/theme-switch.tsx`): a small toggle above Settings. Its track is a sliver of sky: the sun by
  day, the moon and the stars at night.
- **The change** (`shell/theme.ts`): the new look spreads from the switch as a soft-edged pool (a view transition;
  instant with reduced motion).
- **Saved and early.** The choice is saved (`localStorage`, `8x-theme`), and the first visit follows the device. A
  script sets the look before the first paint.

## The dots

The brand counts in people, so its one mark is the fine dot. On this page:

- **Charts** (`dot-field.tsx`): a ghost grid of every place a dot could be; under the line the field is lit, bright
  at the line and fading to the base; the latest value gets an end circle and its number in Archivo. For posts, one
  dot is one post.
- **Progress** (`pace.tsx`): rings of dots filling clockwise from the top. Never a pie or a gauge.
- **Planned** (`rhythm.tsx`): a day to come is outlined in round dots, with a hollow dot for each post planned.
- **The pick** (`activity.tsx`): a line of dots from the marker down to the day's name.
- **A place to fill** (`campaigns.tsx`): the next campaign's card outlined in round dots.
- **Arrival** (`card.tsx`): a card's shell settles in, then its content resolves behind a band of fine dots sweeping
  left to right, the brand's loading resolving into the real layout. Numbers roll to their value
  (`rolling-number.tsx`), dots arrive left to right, a done check draws itself.
- **The current** (`button.tsx`): on hover a band of dots runs in ahead of the fill's curved edge, and ebbs back.
- **Light** (`halftone.tsx`): a corner of the ink card lit in dots that lift near the pointer.

Motion runs once, when something happens, and stops with reduced motion. The aura behind the window is the one thing
that keeps moving, slowly.

**Texture.** The grounds carry grain, as the references do: `media/grain.webp` (the landing's, fine) over the aura,
`media/grain-coarse.webp` (from `scripts/grain.py`) on the colour blocks, the gradient cards, the blob and (in
overlay, so a pale one never looks dusty) the creators' banners.

## Icons

`components/ui/icon.tsx`: the brand's Lucide set at a 1.5 px stroke, inlined. Each icon has its own motion, played
once when the element around it (`data-anim-host`) is hovered or focused: the bell swings, the arrow drops into the
tray, the send flies out, the clapperboard claps, the check draws itself when its card arrives.

## Data

`lib/demo.ts` holds the campaign and `lib/roster.ts` the Creators roster (24 creators and their accounts, adding up
to the campaign's 248 videos and 2.40M views). Every post is generated from those accounts (`lib/post-gen.ts`, once and
deterministically, its captions in `lib/captions.ts`), so each account's posts sum to its figures, and the overview's
days are counted from the posts (`lib/days.ts`): the calendar, the chart, the creators' cards and Posts & feed always
agree. `lib/posts.ts` is the page's own: the milestone ladder, the filters, the days, the table's order, the CSV.
The Content plan's sample is `lib/plan-data.ts`: the formats Maya wrote, five weekly plans with their scripts and
references, every script's activity, and the campaign guidelines. `lib/plan.ts` derives the rest the product's way:
each plan's stage from today, each script's review state from its activity (an approval stands until Maya changes it, a
flag until Maya sends it back), the rules for Approve and Flag, and every post counted toward one script (the plan open
on its day, the script its caption reads as), so the scripts' posts and views are Posts & feed's and the five plans
add up to the campaign.
Analytics has its own sample, made the same way: `lib/analytics.ts` builds the brand's website a day at a time from 24
days before the campaign (Google Analytics' channels, sources and devices, a day provisional until it settles), its
visits through social rising with the views the campaign's posts earned that day; `lib/ads.ts` boosts the best of the
campaign's own posts on TikTok and Meta, and their clicks land on the website as Paid Social. So the site moves on the
days the posts did, and the ad views' organic figures are Posts & feed's.
Settings keeps your own fields in `components/settings/account.ts` and the sources connected in this visit in
`components/analytics/connections.ts`, each one store for the window, so every page that shows them agrees.
Team's sample is `lib/team.ts`: the workspace's members (an owner and three members, two of them scoped to the
campaigns 8x opened to them), the requests the brand sent and 8x's decisions, the account manager as the brand may see
her, and the product's refusals and state lines word for word. `components/team/store.ts` keeps the visit's requests
(asked, reopened, withdrawn), and each person's latest is read from the content plan's own threads. Its shapes follow the product's models (`BrandCampaign`, `BrandCreator`,
`BrandCreatorPost`, `PostMetricSnapshot`), and `lib/metrics.ts` works the figures out the way the product does:

- engagement rate = (likes + comments + shares) / views
- a change compares the last 7 days with the 7 before
- a day's views are the lifetime views of the posts that went out that day
- missing is not zero: a share count that is not there is `null` and prints N/A
- only the platforms on the contract are shown

Swap `lib/demo.ts` for the product's handlers and the page follows. The Activity card's period (Week, 2 weeks, Lifetime)
redraws its chart from the days.

## Media

Placeholders, in `public/media`:

- `posts/`: six real 8x creators' own videos from the catalog, cut to six-second loops as they were posted, with
  their first frames as posters. Shown here with sample figures. `scripts/media.py` makes them.
- `feed/`: a still for every post of the real creators, and a four-second loop for their best ones, cut from their
  own videos in the catalog by `scripts/feed.py` (the k-th still goes to the creator's k-th most viewed post; its
  manifest says which have loops). As posted: no grade, no grain.
- `plan/`: the content plan's references, each one of the campaign's own posts that a script points at: the video as
  a sixteen-second muted clip, its first frame, and its frames at the opening, the middle and the close for the
  script's beats, cut from the post's own video in the catalog by `scripts/plan.py`. As posted.
- `people/`: real 8x creators' faces, cut from their own videos (`scripts/roster.py`). Generated people never stand in
  for a creator, and only creators in good standing are drawn from the catalog: the roster's idle, dropped and
  flagged creators are invented and shown by their initials.
- `ematura-icon.webp` (and `-96`, the phone's bar) and `ematura-banner.webp`: the sample brand, **e-Matura**, a real
  client of 8x (ematura.si: online prep for the matura exam, by Procademy in Ljubljana), shown by its official logo.
  - **The logo files** are e-Matura's own, as published on ematura.si (`scripts/assets/`): its mark, a mortarboard
    whose board is an E, and the mark over the name. Its colours are the logo's: blue `#1b75bc` and grey `#58595b`.
  - **The icon:** the mark in its colours on white, for the workspace on Settings and the content plan's brief; the
    mark alone (`ematura-mark.webp`) sits on the sidebar's round profile, and a round-friendly small one is the
    phone's bar.
  - **The banner:** the lockup in white on the brand's blue, softly lit, with the dashboard's fine grain, across the
    top of the brand's card.
  - **How:** `scripts/brand.py` lays the official files out; nothing is redrawn or generated. (The made-up brand
    before it, Meridian, and its generated pictures are gone.)
- `team/`: the faces of the four people on the brand's workspace. They are invented, so the faces are generated: one
  real-looking headshot shoot (`scripts/team.py`). Generated faces never stand in for a creator.
- `social-bubble.webp`: Social's own icon made solid (the card that asks the brand to act), rendered with Gemini on a
  chroma screen and keyed out by `scripts/objects.py`. Both scripts need a work folder with a `.env` holding the
  Gemini key; the key is never in this repo. `public/brand/`: the 8x logo, the Social lockup and the favicon from the
  brand kit.

The sample brand is real (e-Matura, a client of 8x, by its official logo); its campaign, its figures, the account
manager, the brand's four people and the signed-in person are invented, and their addresses are the sample's.
