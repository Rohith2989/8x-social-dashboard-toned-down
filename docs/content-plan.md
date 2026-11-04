# Content plan: the redesign

The product's Content plan tab (`src/app/brand/campaigns/[id]/plan-tab.tsx`) with its parts: the campaign guidelines
(`plan-guidelines.tsx`), the stage tabs, plan picker, filter and script pills (`plan-tab.tsx`, `plan-stages.ts`), the
call sheet (`plan-format.tsx`, `components/content-format/call-sheet.tsx`, `components/reference-pager.tsx`), the rail
(`plan-rail.tsx`), the approval (`plan-approve-button.tsx`) and the script's activity (`plan-activity-panel.tsx`,
`components/content-format/activity-thread.tsx`, `activity-composer.tsx`). Part by part, and what each becomes. Every
behaviour the product has stays; how it looks and how it answers the hand changes.

8x writes the scripts, the brand approves them, creators film them. Maya shares a plan a week: a set of scripts
(the product's formats), each with its hashtag, a reference video, how it goes and its rules. The brand comes here to
answer five questions: what is waiting for me, what are creators making right now, which scripts work, what does this
one script ask for, and how do I tell Maya what to change. The page answers the first three at the top, the fourth in
the open script, and the fifth on the right.

## The page

The same window as the other pages. The open plan, the open script, the filter and the conversation's sheet live in
the URL, written with the browser's own history (Next keeps `useSearchParams` in step with it), so a link names the
script a brand is asking about and every change shows at once, with no trip to the server for a page that reads its
state on the client. What the brand decides (approvals, flags, comments, what it has read) lives in one store for the
window (`components/plan/store.ts`), as entries in the scripts' activity, so a script's state reads the same way before
and after, and the sidebar's count and the overview's card follow it. The sidebar's Content plan is current, its count the scripts waiting for the
brand (it falls as they are approved). The right column, the open post on Posts & feed, becomes the open script's
activity: everything the brand and Maya said and did on it, with the box to write in. The script on the left, the
conversation about it on the right, as the product's panel keeps them side by side. Below 1360 px the activity slides
in over the tray as a sheet, opened from the script.

Everything adds up with the other pages. Every post counts toward one script (the product's rule: the plan that was
open on its day, the script whose hashtag it carries), so a script's posts and views are the posts on Posts & feed,
and the plans' totals are the campaign's 248 posts and 2.40M views.

## 1. Header (was: the tab's title)

- **Title** "Content plan", and one line under it that says what waits: "Maya shares a plan a week for Autumn launch.
  November week 2 is waiting for you: 3 of its 5 scripts." With nothing waiting: "Nothing is waiting for you. November week 1 is with
  creators, day 3 of 7."
- **Export** (stone): the open plan's scripts as a CSV, every field of the call sheet, for a brand that circulates
  scripts to its own legal or social team; a toast says how many.
- **Suggest an idea** (the one ink action, new): 8x writes the scripts, so the brand's lever is asking, as Ask for
  creators is on Creators. A dialog: what creators should make, a video like it (optional), which plan it is for; sent
  to Maya.

## 2. Summary (was: the stage tabs and the plan picker)

Two colour blocks.

- **The plans** (deep blue): the campaign's plans in time, oldest to newest, one column a plan, titled as the product's
  board titles them (`October week 2`, its dates under it). Over the columns, the product's three stages as words:
  Past plans, Live, For approval. In each column the plan's scripts as numbered marks, each in its state (approved,
  flagged, waiting, with creators), and one line of what it is: "71 posts, 640K views", "Day 3 of 7", "3 waiting for
  you" (with when it goes out: "Goes out 8 Nov"), and the plan's days as a strip under it, the ones gone filled and
  today lit. The parts share rows across the columns, so names, marks and lines line up. The open plan is the white
  column; pressing another opens it. A plan with activity the brand has not seen carries the dot. As many columns as
  fit at 136 px or more show at once (a whole number, so the row always rests on whole columns); past that it scrolls
  sideways, by drag, wheel or its arrows, and keeps the open plan in view.
- **What works** (pale ground): the scripts with the most views a post so far, best first, across every plan they
  ran in (a script carried into a later plan keeps its hashtag, so its posts add up): its best post's poster, its
  name, views a post, and how long it ran. Pressing one opens it in the newest plan that carries it. This is what the
  brand weighs a new script against.

## 3. The open plan (was: the picker row, the filter, the timestamps, the pills and Approve all remaining)

- **Head**: the plan's name, large; its dates and length, who shared it and when, last changed and last reviewed
  (each only once it has happened); and where it stands in words: "3 of 5 waiting for you", "With creators since
  1 Nov", "Finished 31 Oct".
- **Show** (a menu, the product's filter): All scripts, Flagged, Not flagged, and on a plan waiting for approval Approved
  and Not approved, each with its count. A link that names one a stage does not offer reads as All.
- **Approve the 3 waiting** (on a plan waiting for approval, while any script waits; Approve all when none is decided
  yet): approves every script still waiting; flagged scripts stay flagged. It asks first.
- **Where it opens**: the script the URL names; on a plan waiting for approval, the first that was waiting when Maya
  shared it (read from what Maya shared, not from this visit, so approving the open script never moves the page on);
  else the first shown.
- **The scripts**: "Script 1" to "Script N" in the plan's order (a brand talks about scripts by number), each a tile
  with its reference's poster, its number, its name and its state in words (Approved, Flagged, Waiting for you,
  Updated 2 Nov), the activity dot where Maya wrote something new. The number is the script's place in the whole plan,
  so a filter that hides some leaves the rest their numbers. The open one is outlined in ink. The row scrolls
  sideways when it outgrows the tray.

## 4. The script (was: the call sheet and the rail)

- **The reference**, in its own column, which stays in view while the words are read: the video playing, muted, in a
  9:16 frame with its play line (pausing on hover); several page in place ("1 of 2", arrows); one says "The
  reference". A reference that is one of the campaign's own posts says whose it was, when and its views, and opens it
  on Posts & feed. One that cannot play here is a card with the way to it on its platform. A script with none has no
  column (the product's rule), and its line says "no reference video".
- **Who and what**: "Script 3", its name large, "Reel · #AUTUMN12 · post by 9 Nov", and where it stands in words, with
  the reasons on a flag and the day on an approval.
- **The decision**: Approve (the heart; it asks first, with Cancel focused, and when it lands the heart pops and a ring
  and eight sparks of the vertical's colours burst from it) and Flag (the composer, for a script). Each is disabled
  with the product's reason as its title when it cannot be done: flagged and waiting on Maya; approved, so a comment is
  the way; a plan creators already have; a plan that has finished. Approved reads as done (filled heart, the vertical's
  light), a blocked Approve as quietly unavailable. Below 1360 px a third button opens the conversation, with its count
  and Maya's new-message dot.
- **The context**: Maya's paragraph on what the script is for.
- **How it goes**: the three beats in the order they are filmed (open with, through the middle, close with), each
  beside the reference's own frame at that moment (cut by `scripts/plan.py`), so the beats read as a storyboard rather
  than a form; the frames follow the reference on screen. On a wide sheet the three stand side by side, each frame over
  its words.
- **Do and Do not**: two columns, a drawn tick and cross, one rule a line.
- **How it did** (once creators have it): posts, views, views a post and the engagement rate, and its posts as posters,
  which open on Posts & feed; all of them there, filtered to its hashtag. A live script nobody has posted to yet says
  so rather than printing zeros.

## 5. Activity (was: the script's activity panel)

The right column (a sheet below 1360 px):

- The script's number, name and state, as the sheet says them.
- **The thread**, oldest first, opening on the newest: comments with the writer's face, name and time, the brand's
  own on the vertical's light, 8x's on a quiet ground; everything else one line on a mark of its kind (approved,
  flagged with its reasons and note, sent back with Maya's note, changed with the fields it changed, added). 8x people
  by first name with "· 8x". Days as Today, Yesterday, 2 Nov. "No comments or changes yet." when empty.
- **The box**: "Write to Maya", send inside it, Ctrl or Cmd+Enter sends; the message is drawn at once and settles.
- **Flag**: the composer the other pages use (`creators/flag-dialog.tsx`, which now takes a page's own reasons), for a
  script: the product's reasons for a format (the script, open with, close with, the brand guidelines, other), a note,
  and what follows ("Creators won't get it until Maya sends it back"; once sent, "Maya is told now. You can approve or
  flag it again once it comes back").
- **Seen**: what Maya wrote counts as seen once the thread has been on screen a moment (a folded-away column is not on
  screen), and its dot leaves the tile and the plan.

## 6. What every plan is written to (was: the campaign guidelines card)

At the foot of the plan rather than above it: the brief and the posting guidelines, as Maya wrote them, read and
never edited, in two columns with the product beside them. "Not written yet." for a column Maya has not written.

## 7. The way in (new wiring)

- The sidebar's Content plan opens the page, with the count of scripts waiting (live: approving one takes it off).
- The overview's card waiting on the brand counts the same scripts ("3 new scripts to review", or "The plan is all
  reviewed") and opens the plan; its update "Maya shared 3 new scripts to review" opens it too.
- On Posts & feed, the open post says the script it was made to (its name, its number and plan) and opens it here; a
  script's posts open there, filtered to it ("made to Script 4 of October week 4, My exact stack", which removes
  itself like every applied filter).
- What works and the plans row open scripts and plans in place.

## Header actions, as built

- **Export** writes the open plan's scripts as a CSV: plan, dates, number, name, hashtag, type, post by, where it
  stands, the context, the three beats, the rules, the references and, once creators have it, its results.
- **Suggest an idea** asks what creators should make, takes a link to a video like it (refused politely when it is not
  a link) and which plan it is for, and sends it to Maya with the dialogs' dot loader and drawn check.

## Empty and edge states

- No plan shared yet: "Maya has not shared a plan yet."
- A plan with no scripts: "This plan has no scripts in it yet."
- A filter that leaves none: the product's lines ("Nothing in this plan is flagged.").
- A reference that cannot play here: "This one opens on TikTok", with Open the reference.
- The guidelines not written: "Maya has not written the campaign guidelines yet."
