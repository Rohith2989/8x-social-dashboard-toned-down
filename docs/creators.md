# Creators: the redesign

The product's Creators tab (`src/app/brand/campaigns/[id]/creators-tab.tsx` and its neighbours), part by part, and
what each becomes. Every behaviour the product has stays; how it looks and how it answers the hand changes.

The brand comes here to answer four questions: who is posting for us, who is doing best, who has gone quiet or
needs a word, and what do I send to finance. The page answers them top to bottom.

## The page

The same window as the overview. The sidebar's Creators is current. The right column, which is "Coming up" on the
overview, becomes the open creator's profile: the roster on the left, one person on the right, no modal between
them. Below 1360 px the profile slides in over the tray as a sheet.

## 1. Header (was: the tab's title row)

- **Title** "Creators", and one line under it: "24 people are posting for Autumn launch. 3 joined this week."
- **Export** (stone button, download icon): the CSV of the roster as filtered. On hover the arrow drops into the tray;
  on press a toast says "Exported 24 creators".
- **Ask for creators** (the one ink action): 8x does the casting, so the brand's lever is asking. A dialog with how
  many, which platform, which market and a note, sent to the account manager. The button carries the brand's
  current on hover.

## 2. Roster summary (was: the stat strip of four numbers)

Three colour blocks, each with one job:

- **The roster** (deep blue): the people as faces, a wall of the creators on the campaign, and the slots the plan
  still has as rings of fine dots ("24 of 30"). Under it the four figures the strip had: creators, accounts,
  videos, views.
- **Who is posting** (pale tint): the roster by status as people, one dot each, in three runs (active, idle,
  dropped), with the counts. Each run is a button that filters the list to it.
- **Spotlight** (accent): the creator with the most views this week, their face, their views and their best post
  playing.

## 3. Toolbar (was: the filter row and the applied-filter chips)

- **Search**: one large field, "Search 24 creators or @handles". `/` focuses it from anywhere; Esc clears it. The
  list narrows as you type and the matched letters are marked in each name.
- **Status**: a segmented control, All · Active · Idle · Dropped, each with its count. The most used filter, one tap.
- **Platform**: the platforms on the contract as their own icons, toggles (OR within). Off is greyed, on is in
  colour.
- **Country**: a menu with flags and the count in scope (Turkey 6); type-ahead past ten.
- **Sort**: "Most views" and a menu (views, average per post, videos, likes, comments, last post, name); pressing
  the arrow flips the order.
- **View**: Cards or Table, a segmented control; the choice stays in the URL.
- **What is applied** reads as a sentence, never chips: "Showing 12 of 24: active, on TikTok, in Turkey. Clear".
  Each part is a link that removes itself (its × shows on hover).

All of it lives in the URL (tab, search, filters, sort, view, open creator), so back and refresh restore it.

## 4. Creator card (new: the cards view)

- A banner, 8x's own (never their photos, never object pictures): a few large soft lights in the vertical's
  colours, drawn the way the window's aura is, over one of six grounds (cobalt, daybreak, iris, sky, night, lilac,
  taking turns so neighbours differ), with the colour blocks' grain. Where the lights stand comes from the creator's
  name, so each banner is theirs and the same on the card and the profile. Their platforms sit in its lower corner.
  It greys with a dropped or flagged creator.
- The face, large, on a plate of the card's white over the banner's edge, in a ring that says the status: the
  vertical colour for active (it pulses once when the card arrives), amber for idle, grey for dropped.
- Name, country with its flag.
- Views large; average per post and videos under it, labelled ("avg / post" is an average, "videos" a sum).
- A fine-dot sparkline of their last fourteen days.
- Their three best posts as small 9:16 tiles.
- Last post, relative ("2 h ago"), its exact time on hover.
- **Hover**: the card lifts and the banner's light drifts a little under its grain; a check appears at the
  banner's corner to select it; the post tiles brighten.
- **Press**: opens the profile on the right; the card stays outlined in ink while it is open.
- **Flagged**: the card keeps its place, its face greyed, with "Flagged · Off brief" and the flag in red.
- **Dropped**: greyed, with the day it ended.

## 5. Table (was: the three-level table)

The same columns, in the same order: select, creator, platforms, videos, views, avg / post, likes, comments,
status, last post, country.

- Sortable heads cycle highest, lowest, off, with the arrow turning; rows move to their new places rather than jump.
- A creator row opens to their accounts (indented, the exact per-platform figures); an account opens to its posts,
  as a strip of 9:16 tiles rather than a third table.
- Status is a dot and a word; a flag adds "Flagged · reason" in red under it.
- Hover tints the row and shows Open at its end.

## 6. Creator profile (was: the account preview panel)

The right column (a sheet below 1360 px):

- Their banner, the same lights as on their card but taller, and their face over its edge; name, country,
  "joined 11 Oct". In the sheet the close sits over the banner's left corner.
- The status as a line of words, never a capsule: "Active · posted 2 h ago", or "Idle · no post for 4 days" in
  amber, with what the words mean on hover (active: a post in the last 72 hours).
- Four figures: views, avg / post, videos, engagement.
- Their last fourteen days across the column: a column of fine dots a day, lit by the views of that day's posts;
  pointing at a day dims the others and says its date and views.
- Their accounts: platform, @handle, then views, videos and followers, each kept whole (one that does not fit moves
  to the next line, never cut short), and "Open on TikTok ↗" (the one link that leaves the app).
- Best posts: a strip of 9:16 tiles that play on hover.
- Actions: Flag for Maya (opens the composer for this creator), Close.

## 7. Selection bar (was: the brand selection bar)

Selecting a card or a row pins a bar to the foot of the tray: the faces and "3 creators selected" on the left;
Copy profile links, Export CSV and Flag for Maya inline; Clear on the right (Esc does the same). It rises in when the
first row is picked and sinks when the last is cleared. A copy turns its button into "Copied 3 links" with a drawn
check for a moment. It never covers the rows: the list gets room at its foot while it is up.

## 8. Flag composer (was: the flag modal)

- Title with the faces: "Flag 2 creators for Maya".
- One line on what it does: flagging removes nobody; Maya looks into it and answers in your thread.
- The five reasons as large rows, each with its icon and a line on what it means (Off brief, Wrong product, Quality,
  Compliance, Other); pick one or more.
- A note, optional, with its count to 1,000.
- Send stays disabled until a reason is picked, and says so on hover. Sending shows the dot loader, then the
  dialog turns into its own confirmation (the check draws itself: "Sent to Maya"), and closes.
- The flagged cards grey and gain their flag line; a toast offers Undo for five seconds.

## 9. Ask for creators (new)

A dialog: how many (a stepper), platform (icons), market (menu), a note. "Send to Maya". The same confirmation as the
flag.

## 10. Toasts

Ink pills at the foot of the tray, one line each, with an icon that moves once (the check draws, the arrow drops).
Four seconds; pointing at one holds it; Undo where something can be undone.

## 11. Empty states (were: three lines of text)

Each with the brand's dotted ring of empty places and one action:

- Nothing matches: "No creators match ‘zoe’" and Clear search.
- Active only and nobody posted: "Nobody has posted in the last 3 days" and Show everyone.
- No creators yet: "Maya is casting your creators. They appear here as they join."

## 12. Loading

The summary's blocks rise in turn, the faces pop onto the wall one by one, the status dots fill in, the cards rise in
reading order and each active ring pulses once. The overview's cards resolve behind the band of fine dots.

## Motion

Once, short, when something happens: the card resolve, the numbers rolling, the status ring's pulse, rows and
cards gliding to their new places on a sort or a filter, the selection bar rising, the check drawing. Nothing
loops. Reduced motion makes all of it instant.

## Calm pass (2026-11-04)

Toned down for room, on the user's word ("tone it down ... give every element some breathing room ... remove some
information"):

- The roster is the vertical's colour made subtle (pale light, dark words); under the faces, two figures: videos and
  views (the creators' count is in its heading).
- Who is posting: each status its dot, count and word; what the word means is in its title.
- The creator of the week keeps its lilac, as a soft tint.
- A creator's card: banner, face, name, country, views, three posts, status. The dot sparkline and the averages went.
  The banners sit under a veil of the card's light, so they keep their hue but stay soft.
- The open creator: views and videos, accounts, best posts. The fourteen days of dots went.
- Room: 44 px between the page's parts, 20 px between cards, a step smaller words inside them.
