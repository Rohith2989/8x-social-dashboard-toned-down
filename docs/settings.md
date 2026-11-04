# Settings, signing out and in, and every control live

The product has no brand Settings page. What a brand member can see and change about themselves and their workspace
is spread across it: the sidebar's foot (the brand's mark and name, the signed-in address, a menu with Sign out:
`components/admin-user-footer.tsx`), the data connections (Analytics' connect panel), the people (Team), and the
models behind them (`User`: first and last name, email, phone; `Brand`: name, currency, status, since when;
`BrandMember`: role and campaign scope; the six connections). Settings gathers them in one place, from that data and
nothing else. Signing in is the product's own page (`src/app/sign-in`: "Sign in to 8x", a 6-digit code by email, no
passwords).

## The page (`/settings`)

The same window; the sidebar's Settings is current. Every card has a subtle colour of its own. The right-hand column
holds this browser's sign-in and the way to Maya; below 1360 px it comes into the tray, last.

### 1. Header

"Settings", and one line: "Your account, and Meridian's workspace on 8x."

### 2. The workspace (new)

The brand as 8x holds it, read-only, on a pale ground with grain: Meridian's logo large, its name, "Brand workspace on
8x Social, fully managed", then the facts, each a line with its own mark:

- **Your role**: Owner, and what it lets you do ("You can withdraw any access request").
- **Campaigns**: the three, each in its colour, with where it stands (live, day 24 of 30; paused; ended).
- **People**: 4 on the workspace, 1 request with 8x, opening Team.
- **Currency**: US dollars, what Analytics' revenue and spend are in (`Brand.currency`).
- **On 8x since**: 2 Jun 2026 (`Brand.createdAt`).
- "Set by 8x. To change the name or the currency, ask Maya." with the way to her.

### 3. Your account (new: `User`'s own fields)

- Their initials on a disc, their name and role.
- **First name**, **Last name** and **Phone** (optional), editable; **Work email** read-only, with the product's sign-in
  line under it ("You sign in with a 6-digit code sent here. No passwords.").
- **Save changes** wakes when something changed, with **Cancel** beside it; saving says so in a toast, and the new name
  shows wherever the page names you (the overview's greeting, Team's card).
- A first name left empty says so under the field and cannot be saved; a phone takes digits, spaces, brackets and a
  leading +.
- At the card's foot, what your account reaches: the campaigns you see (lit among the three), since when you have been
  on the workspace, and how many scripts you approved on the content plan (it opens the plan).

### 4. Connected data (was: Analytics' connect panel)

The six sources in one card, each with its mark, what it answers and where it stands: Google Analytics, TikTok Ads and
Meta Ads connected (the property or ad account, last read); Triple Whale, AppStack and RevenueCat not connected, each
with **Connect**, which opens the same Connect dialog as Analytics. One store for both pages: a source connected on one
is connected on the other ("Reading for the first time").

### 5. This browser (the right-hand column)

- **Signed in** as the address, with the product's line on how ("a 6-digit code, no passwords").
- **Sign out** (the product's menu item): signs out of this browser and opens the sign-in page.
- **Need a change?** Maya · 8x: the workspace's name, currency and campaigns, and who sees which, are 8x's to change;
  **Write to Maya** opens the content plan's thread.

## Signing out and in (`/sign-in`, the product's page)

The window's night aura behind one light card, as the product's sign-in sits on its brands art:

- The 8x mark, "Welcome back", **Sign in to 8x**, "We email you a 6-digit code. No passwords."
- Signed out on purpose, a line says so first ("You're signed out of Meridian's workspace").
- **Work email** ("you@example.com"), **Email me a code** ("Sending code…"); an address that is not whole says so.
- The code step: "Sent to …" with **Change**; six slots in one field (paste fills them; typing moves along; Backspace
  goes back); **Verify and sign in** ("Signing in…"); **Send a new code** ("Sending…", then "A new code is on its way").
- In the sample any six digits sign in (the page says so under the slots) and land on the overview.
- **Continue with Google** ("Redirecting…"), as the product offers it; in the sample it signs in too.
- "New to 8x? Start your free trial", to 8x's own page.

## Every control live

Nothing on any page is drawn without doing what it says:

- **The sidebar**: Settings and Log out lead where they say; the brand's card opens a small menu (Settings, Team,
  Sign out) instead of a workspace switch that has nothing to switch to.
- **Overview, Search**: a search across the workspace (creators, posts, scripts, people and pages), arrow keys and
  Enter to open.
- **Start a campaign** (the header's and the campaigns' tile): the team's rule, both ways side by side: Self Service
  (start on web.8x.social) or Full Service (book a call with 8x).
- **Your campaigns**: See all and each card's menu open the campaign: the live one is this overview; the paused and
  ended ones show what they did.
- **Coming up**: the bell opens the latest from 8x and the creators (read when opened); each day's menu opens it on the
  content plan or copies its schedule.
- **Performance**: its menu exports the days, opens Analytics or every post.

## Edge states

- A name saved empty cannot be; a phone may be cleared.
- Every source connected: the card says so and offers nothing to connect.
