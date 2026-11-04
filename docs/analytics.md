# Analytics: the redesign

The product's Analytics tab (`src/app/brand/campaigns/[id]/analytics-tab.tsx`) with its parts: the website report
from Google Analytics (`analytics-tab.tsx`, `analytics-chart.tsx`, `lib/brand-analytics.ts`), the ad views for TikTok
and Meta (`analytics-ads.tsx`, `analytics-ads-trend.tsx`, `lib/brand-ads.ts`), the connect panel, and the assistant
(`analytics-chat.tsx`, `analytics-chat-panel.tsx`). Triple Whale, AppStack and RevenueCat appear as sources to connect.
Part by part, and what each becomes. Every behaviour the product has stays; how it looks and how it answers the hand
changes.

The brand comes here to answer the questions the other pages cannot: did the campaign move my business, what did each
sale cost me, where did the visits come from, which days and which posts moved it, and what did my own ads on the
creators' posts do. The page answers them in that order: the headline figures, the chart, where visits came from;
the open day on the right; the ad views behind the switch.

## The page

The same window as the other pages. The sidebar's Analytics is current. The right-hand column becomes the open day: a
day of the chart, pressed (or the best settled day of the window until one is): what the website did that day against
a usual day before 8x, where its visits came from, and the posts that went out that day, which open on Posts & feed.
On the ad views it becomes the open boosted post instead. Below 1360 px either opens as a sheet when pressed.

The source, the window, the metric, the split, the hidden series, the posts on the chart, the open day or post, the
sources' sort and the two dialogs live in the URL, written with the browser's own history so every change shows at
once; defaults stay out of it.

Three sources, one at a time, never added together (the product's rule: a session, a play and an impression are
three different things): the brand's website, and its own ads on the creators' posts on TikTok and on Meta.

Everything adds up with the other pages. The website's sample is generated day by day from the campaign's own
delivery: the visits that arrive through social rise with the views the campaign's posts earned each day (the same
posts as Posts & feed, their views spread over the days after they went out), so the website moves on the days the
posts did. The ad views are the creators' own posts, boosted: their organic views are Posts & feed's, the paid ones
come on top.

## 1. Header (was: the tab's top row)

- **Title** "Analytics", and one line under it that says what happened: "Since 8x started on 11 Oct, ematura.si made
  $69,085, 40% more than in the 24 days before."
- **Connect your data** (stone): the panel of every source this page can read, connected or not.
- **Ask about this data** (the one ink action): the product's assistant, which answers from the figures on screen.

## 2. Toolbar (was: the view switch and the range controls)

- **Source**: Website, TikTok Ads, Meta Ads, a segmented control (the product's switch; one source at a time).
- **Window**: Since 8x (the campaign's days), 14 days, 7 days. Every figure compares with the same number of days
  before the window, and says so: "against 17 Sep – 10 Oct, the 24 days before 8x".
- The window's line says what it is compared with: "Against 17 Sep – 10 Oct, the 24 days before 8x".
- **Export** (beside it): the window's days as a CSV, a day a row with every figure, its channels and its posts, and
  whether Google Analytics has settled it (the product's CSV link).

## 3. The headline figures (was: the four primary tiles)

Four, each over the smaller figures that explain it (the product's rule: when everything is a headline nothing is):

- **Revenue** (the deep blue block): the window's revenue large, its change as an arrow and a figure (never a pill);
  sales, buyers, first-time buyers, non-paid and paid.
- **Visitors**: new visitors, the share who bought, non-paid and paid; "unique within each day and channel" said where
  it matters.
- **Sessions**: pageviews (pages a session), the average session, non-paid and paid.
- **Cost per sale**: the spend with 8x over every sale (a fall is good news, and the arrow says so in the vertical
  colour); via social, MER, MER via social, and the spend itself (the contract prorated over the window's days).

A figure the product cannot give says N/A and why on hover, never a zero.

## 4. The website, with 8x on it (was: the trend chart and its overlay)

The centrepiece, a white card:

- **Title** is the metric picker (Sessions, Sales, Revenue, Visitors, Pageviews), as the product draws it; beside it
  the split (No split, Paid and non-paid, By channel).
- **The plot**: the window lit (a line over an area of the vertical's light) beside the same span before it, quiet
  (the product's previous window, drawn rather than only subtracted), a seam between them named ("8x starts, 11 Oct"
  on the default window). A split draws one line a series, overlaid, never stacked (the product's rule), each in the
  vertical's ramp, with a legend that switches series off and on.
- **The posts** (on by default; the product's "With 8x posts", a switch): under the plot, the posts that went out each
  day as fine dots, one a post, a day's stack shrinking to fit its track; over the days a post passed 60K views, its
  creator's face in a white ring, on the line where the website jumped (as many as the plot has room for, the biggest
  first; two a day apart stand one above the other). Pointing at a day draws its rule and a dark card: the day's
  figure, against a usual day before 8x, each series that day, and its posts with the best one's face.
- **The scale** runs in round steps (2K, 4K, 6K); the dates thin out to fit, the last always shown.
- **Days not in yet**: the days Google Analytics has not settled are hatched and said ("Provisional: Google Analytics
  settles a day up to 48 hours later").
- Pressing a day opens it on the right.

## 5. Where the visits came from (was: Top sources, Arriving through social, Devices)

- **Top sources** (the product's table): each source by name and how the visit came, with its mark ("Google, Search";
  "Spark Ads, Boosted creator posts"), Google Analytics' own source / medium on hover. The routes 8x's creators bring
  visits by (their posts on TikTok and Instagram, links in bio, Spark Ads, partnership ads) carry the 8x mark and the
  vertical's ring. Then the channel with a dot that says paid (lilac) or not (blue), revenue, sessions, sales and share
  of sessions, each figure shaded by its value; the four figures sort (highest, lowest, back), the ten chosen by the
  column sorted on; the paid and non-paid totals at the foot. Narrower, the channel folds away, then the share and the
  sales go, so it always fits.
- Every card here has a subtle colour of its own (the user, 2026-11-04): the headline tiles sky, lilac and blue beside
  revenue's deep blue; Top sources pearl, Through social lilac, Devices sky.
- **Through social**: the share of sessions, sales and revenue that arrived as Organic Social (where a creator video's
  click lands unless its link is tagged), each a line of dots filled to its share, with the product's caveat (a floor,
  not the whole picture).
- **Devices**: one bar split by device, its shares and sessions.

## 6. The open day (new: the right-hand column)

- The day, and its place in the window ("Thu 30 Oct, day 20 of 24").
- Its figure on the chart's metric, large, against the usual day before 8x ("+62% on a usual day before 8x").
- Sessions, sales and revenue that day; where its visits came from as a single bar by channel.
- The posts that went out that day, best first, as posters with their views, opening on Posts & feed; "All 11 that
  day" opens the feed at the day.
- Provisional days say so.

## 7. The ad views (was: the TikTok Ads and Meta Ads views)

What the brand's own ads did on the creators' posts (Spark Ads on TikTok, partnership ads on Meta):

- **Four figures**: views on boosted posts (organic and paid; the share from ads); spend (CPM, per click);
  conversions as the platform counts them ("Sign-ups", the event named); cost per conversion, with the lowest creator
  named and linked to their row.
- **Delivery rates**: CTR, CPM, blended CPM (the spend over paid and organic views), frequency.
- **Views by day**: organic and paid views on the boosted posts, and the spend.
- **Boosted posts**: each post's poster, its creator, its organic and paid views as one bar, spend, conversions and
  cost per conversion; the post opens on Posts & feed.
- **Creators**: cost per conversion by creator, cheapest first, the ones with too few conversions to price said so.
- **Who saw them**: age, gender and country, each a share of impressions, with the product's caveat.
- **Side by side**: TikTok and Meta in one table, with the warning that each counts its own event.

- **The open boosted post** (the right-hand column on the ad views, the product's ad post panel): the post playing,
  who made it and when it was boosted, its paid against organic views as one bar, spend, conversions and their cost,
  impressions, clicks and CTR, its paid delivery a day at a time, and the way to it on Posts & feed, with Copy spark
  code on TikTok (the code itself in its title). The boosted posts list opens it; the most spent on opens first.
  - **Paid delivery by day**: a bar a day. Up to five days, each bar carries its figure and its day; more, the peak's
    figure and the span's first and last days. The line under it says the day that took the most and its share,
    worked out from the figures; pointing at a bar says that day's paid views, spend and clicks.

## 8. Connect your data (was: the connect panel)

A dialog over the page: every source, what it answers, and its state. Google Analytics (connected: the property, the
Google account, data through), TikTok Ads and Meta Ads (connected: the ad account, last read), Triple Whale, AppStack
and RevenueCat (not connected). Connect opens a row: what it would read, in the product's words, and its key; Connect
waits for a whole key, shows the dot loader, and the row then says it is reading for the first time (the product's
first-read state). Read-only, every one.

## 9. Ask about this data (was: the analytics assistant)

A dialog over the page that answers from the window on screen and nothing else, as the product's does: its three
openers ("What stands out in this window?", "Which channel is driving the most revenue?", "How did the campaign change
what the site was doing?") answered from the figures, with the numbers they come from (the busiest day and whose post
went out on it; the channels by revenue and the one that grew most; the campaign's days against the days before it).
A typed question is matched to what the figures can answer; anything else is told so, and what it can answer.

## The way in

- The sidebar's Analytics opens the page.
- A day's posts open on Posts & feed; a boosted post opens there too.

## Empty and edge states

- No source connected: the connect card, what each source answers, and Connect.
- A window with no campaign days has no spend: cost per sale says N/A and why.
- A metric's split that has one series draws no legend controls.
- The last series showing cannot be switched off (the product's rule).
