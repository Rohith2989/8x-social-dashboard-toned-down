# Posts & feed: the redesign

The product's two post tabs, Posts (the table, `src/app/brand/campaigns/[id]/posts-tab.tsx`) and Feed (the days,
`feed-tab.tsx`), with their shared head (`posts-chrome.tsx`, `posts-filters.tsx`), the post panel (`post-panel.tsx`,
`post-flag-button.tsx`) and the selection bar's post actions, part by part, and what each becomes. Every behaviour the
product has stays; how it looks and how it answers the hand changes. The two tabs become one page with two views,
because the product already treats them as one set drawn two ways (the same filters and totals over both).

The brand comes here to answer five questions: what went out, and when; which posts are doing best; how is this one
post growing; what do I hand to the ads team (links, spark codes, the videos); and which post needs a word with the
account manager. The page answers them top to bottom, and the open post answers the third on the right.

## The page

The same window as the overview and Creators. The sidebar's Posts & feed is current. The right column, "Coming up" on
the overview and the open creator on Creators, becomes the open post: the posts on the left, the one post on the
right, playing, with no modal between them (the product's panel already keeps the list readable beside it). Below
1360 px the post slides in over the tray as a sheet.

Everything adds up with the other pages. The posts are generated from the roster's own accounts (each account's posts
sum to its views, videos, likes, comments and shares on Creators), and the overview's days are counted from the posts,
so the posting calendar, the chart, the creators' cards and this page always agree.

## 1. Header (was: the tab title and the export row)

- **Title** "Posts & feed", and one line under it: "248 posts went out for Autumn launch. 12 today, the last one
  40 min ago."
- **Export** (stone button, download icon): the CSV of the posts as filtered, every column the table has.
- **Copy spark codes** (the one ink action, new): every TikTok spark code in view, one per line, for the ads team; a
  toast says how many. Disabled, and says why, when nothing in view is on TikTok (spark codes are TikTok-only). The
  product copies them from a selection; this does the same for the set the filters already chose.

## 2. Summary (was: the stat strip of four totals)

Two colour blocks, each with one job. Both describe the posts in view, so they follow every filter, the numbers
rolling to their new values.

- **The posts** (deep blue): how many are in view ("62 of 248"), their views large, then likes, comments, shares and
  the engagement rate. Shares the platform does not report are left out of the sum and said so.
- **How far they got** (pale ground): the product's milestone ladder (300, 1K, 5K, 10K, 50K, 100K, 500K, 750K, 1M+)
  as columns of fine dots, one dot a post, each post at the highest milestone it passed. The count sits over each
  column and the milestone under it; the rungs nobody has reached yet are outlined in dots, the first with "next"
  where its count would be (so every milestone stays on one line), and a rung below the highest that no post stopped
  at reads a quiet 0. Pointing at a rung says what it holds;
  pressing it shows the posts that passed it (the product's performance filter, every bucket from that rung up), and
  pressing it again shows them all.

## 3. Toolbar (was: the filter row, the applied-filter chips and the Feed View switch)

- **Search**: "Search 248 posts, captions or @handles". `/` focuses it from anywhere; Esc clears it. Matched words are
  marked in the captions and handles.
- **Creators**: a menu of the creators with their faces and how many posts each has in scope; pick one or more.
- **Platforms**: the platforms on the contract as their own icons, toggles, with their counts.
- **Day**: a menu of the days that have posts, newest first, with their counts. The overview's calendar sets it when a
  day is pressed there (the product's `date`, set from a chart column or a calendar cell).
- **View**: Feed or Table, a segmented control (the product's Feed View switch, now two named views).
- **What is applied** reads as a sentence, never chips: "Showing 62 of 248: on TikTok, that passed 10K views, by
  Aastha and Carla, on 30 Oct. Clear". Each part is a link that removes itself.

All of it lives in the URL (search, filters, view, the open post, how many days the feed shows, the table's sort and
page), so back and refresh restore it.

## 4. Feed (was: the feed tab's days)

- Newest day first; inside a day the biggest posts lead (the product's order).
- Each day has a heading that stays at the top while its posts are in view: "Today, 3 Nov", the day's count and views
  ("12 posts, 186K views"), and **In the table**, which opens the table at that day with its rows tinted (the
  product's "View details", taken to the day rather than filtered to it).
- The day's posts run in one row that scrolls sideways, as in the product: a drag, the wheel or the arrows at its
  ends, which appear only where there is more to see. The scroll bar is never drawn.
- **A post card**: the post's own poster, 9:16, its platform's icon in the corner, its views over the foot with the
  milestone mark beside them (a ring of five steps, filled to its tier). Under it the creator's face and name, the
  caption in two lines, and likes, comments and shares.
- **Hover**: the card lifts and the poster plays the post where there is a video to play; a check appears to select it.
- **Press**: opens the post on the right; the card stays outlined in ink while it is open.
- **Flagged**: the post keeps its place, greyed, with "Flagged · Off brief" in red under it. **Deleted**: greyed, the
  poster faded, with the day it was deleted.
- Seven days at a time; **Show the 7 days before** at the foot (the product's pager by posting day).
- **Sparse results** (a search, or one creator, that leaves a post or so a day): the posts read as one grid of whole
  cards, newest first, each saying its day, rather than a row a day with one card in it.

## 5. Table (was: the post table)

The product's columns, in its order, two of them folded into the cells they belong to so the table always fits the
tray: select; post (its poster, caption, handle and platform); posted; views, with the milestone it passed beside the
number it grades (the product's performance column; design.md: a qualifier sits next to the number it grades);
likes, comments, shares, engagement rate, status, spark code, country (its flag and code, the name on hover).

- The poster opens the post on the right; the handle opens the creator on Creators.
- Sortable heads cycle highest, lowest, off; rows move to their new places rather than jump.
- **Performance** is the milestone mark beside the views, never a capsule; its title says the milestone and tier.
- **Shares** a platform does not report read N/A, with why on hover.
- **Status** is a dot and a word: Live, or Deleted with the day; a flag adds "Flagged · reason" in red under it.
- **Spark code** is the code's first five characters with a copy button; Copied, with a drawn check, for a moment.
  A TikTok post whose creator has not shared it yet says Not yet; an Instagram post's cell is a quiet dash.
- A deleted or flagged row dims, all but its status, which is the explanation. On a phone, where the status column
  has folded away, the reason sits under the post's name instead, at full strength.
- A day taken to from the feed is tinted, its first row scrolled to the top.
- Fifty rows at a time; **Show the next 50** at the foot.
- Narrower, the less used columns fold away: below 1240 px shares, engagement, spark code and country; below 790 px
  likes and comments; below 680 px posted; on a phone the status. On the narrowest phones the post's poster and words
  close up and the views lose their ring, so the table never runs past the tray.

## 6. Post (was: the post panel)

The right column (a sheet below 1360 px):

- **The post as it ran**: its video playing, muted, in a 9:16 frame dressed as its platform shows it (the like,
  comment and share counts down the side, the handle and caption at the foot). A post with no video here keeps its
  poster, with Watch on TikTok over it.
- When and where: "Fri 30 Oct, 18:40 · 4 days ago", Live or Deleted, and the creator (face, name, handle), which opens
  them on Creators.
- **Five figures**: views large, then likes, comments, shares (N/A where the platform does not report them) and the
  engagement rate.
- **Next milestone**: a line of fine dots from the milestone it passed to the next one, lit to where it is, with how
  many views it needs ("18.2K to 100K"); "Top milestone reached" past 1M.
- **Views by day**: what each day since it went out added, a column of fine dots a day (the busiest day to the
  top), so its shape shows: a fast start, then a tail; pointing at a day says what it added and the total by then. A
  deleted post's days stop at its deletion; a short life sits together on the left; one day is said, not drawn.
- **Actions**: Copy link, Spark code (TikTok only; it copies the code, which its title shows, or says No code yet),
  Download the video, Flag for Maya (or the open flag, its reason and "Remove the flag"), and Open on TikTok (the one
  link that leaves the app). In a narrow column the three quick buttons stand each icon over its word.

## 7. Selection bar (was: the brand selection bar, posts)

Selecting a card or a row pins a bar to the foot of the tray, as on Creators: the posters and "3 posts selected";
Copy links, Copy spark codes (disabled, with why, when none of them is on TikTok), Download with its progress ("2 of
5"), Export CSV and Flag for Maya inline; Clear on the right (Esc does the same).

## 8. Flag composer (was: the flag modal, for posts)

The Creators composer, for posts: "Flag 2 posts for Maya" with their posters, the same five reasons, the note, Send.
The flagged posts grey and gain their flag line; a toast offers Undo for five seconds.

## 9. The way in (new wiring)

- The sidebar's Posts & feed opens the page.
- The overview's calendar: pressing a day opens the feed at that day.
- The overview's top posts: a post opens here, open; "View all 248" opens the feed.
- A creator's best posts on Creators open here.

## Empty and edge states

- No post matches: what was searched or filtered, and Clear.
- A search that only matches a deleted post still shows it, dimmed.
- A day the post ceiling cut short says "first N posts" rather than a count it does not have (the product's rule;
  the sample never reaches it).
- A post that has only been synced once: its views over time are said ("One day of views so far"), not drawn.

## Calm pass (2026-11-04)

- The posts: the vertical's colour made subtle; views, then likes, comments and engagement (shares, with their
  unreported count, went).
- A feed card: the poster with its views and length, who made it, the caption. The counts went (they are the open
  post's), and the time shows only where the cards are not under a day.
- The table: post, posted, views, likes, comments, status, spark code. Shares, the engagement rate and the country went.
- The open post: its views with likes and comments, the next milestone, the actions. Its views by day went.
- Room: 40 px between days, 20 px between cards, a step smaller words.
