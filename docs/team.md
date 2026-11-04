# Team: the redesign

The product's Team page (`src/app/brand/team/`: `page.tsx`, `team-panel.tsx`, `team-controls.tsx`, `actions.ts`), its
data (`src/server/api/brand/members/`: the list, invite and cancel-invite handlers, `entities.ts`) and its rules
(`src/lib/brand-members.ts`, `src/server/brands/auto-refused-invite.ts`, design.md). Part by part, and what each
becomes. Every behaviour the product has stays; how it looks and how it answers the hand changes.

The brand comes here to answer: who on my side can see this, how do I bring someone in, where does a request I sent
stand, and who at 8x is working for me. The product answers the first three; the redesign adds the fourth, because 8x
is in every one of them (8x approves each request, 8x chooses what each person sees, and "ask your 8x account manager"
is the product's answer to a decline).

## The page

Team is the workspace's, not a campaign's (the product keeps it outside the campaign shell: who is on the workspace is
a fact about the brand). The same window; the sidebar's Team is current. The right-hand column becomes **Your 8x
team**; below 1360 px it comes into the tray after the requests.

Every card carries a subtle colour of its own (the user, 2026-11-04: "subtle, not vibrant, so every card has some
character"): the people in turn sky, lilac, blue and pearl; the invite on the deep blue, the 8x team on ink.

## 1. Header (was: the frame's header)

- **Title** "Team", and one line that says where things stand: "4 people on e-Matura's workspace, and 1 request with
  8x." It follows the visit (a new request counts at once).
- No actions in the header: the page's one action, bringing someone in, opens the page.

## 2. Add your team-mates (was: the invite row)

The deep blue block with grain, the page's one action:

- The product's title, and the line its success dialog says: "8x reviews every request. Once it's approved, we email
  them how to sign in."
- **Work email**, with its envelope, and **Request access**; under them, in words, "They join as a member. 8x chooses
  which of your campaigns they see." (the product's role select is drawn but not writable: every request is for a
  member).
- Beside them (under them when the block is narrow), the way a request goes, on one line: **You ask** (for a work
  email), **8x reviews** (the 8x mark in white, with the live count: "1 with 8x now", its dot beating), **They sign in**
  (from the email 8x sends).
- The product's refusals, word for word, under the field: "Enter a full work email address, like name@company.com.";
  "You are already on this workspace"; "That address is already on this workspace"; "That address has already been
  requested and is with 8x"; "8x has already approved that address. They haven't signed in yet." The ones about a row
  on the page carry **Show it**, which brings that row into view and lights it. Typing clears the refusal.
- An address 8x did not approve, asked again, reopens as a new request (the product's rule).
- Requesting shows the dot loader, then the product's dialog: **Request sent to 8x**, "8x will review access for
  lena@ematura.si. If it's approved, we'll email them how to sign in. You can withdraw the request until then."
  Done. The request lands at the top of Access requests.

## 3. People on this workspace (was: the member rows)

The head says how many and what they see ("4 people. 2 see every campaign; 2 the ones 8x opened to them"). Four
across where they fit, two by two narrower, one under another on a phone. Each member is a card of its own colour:

- **Their face** on a disc. They are the sample's invented people, so their faces are generated (`scripts/team.py`):
  one real-looking shoot, the same window light and wall. The user asked for faces over initials, 2026-11-04. Their
  initials on the vertical's colours stand in where there is no face. The same faces show on the brand's card,
  Settings, search and the content plan's thread.
  The member signed in wears a white ring and "you" (the product's "· you").
- **Name**, **email**, and the **role** in words with its mark: Owner (the shield) or Member. Never a pill; never a
  select that cannot change (the product's is disabled: nothing on the server changes a role yet).
- **What they can see**: the brand's three campaigns as three marks in each campaign's colour, lit for the ones this
  person sees, and in words: "All 3 campaigns" (an owner, and memberships from before the invite flow, are unscoped),
  the campaigns' names, or "No campaigns yet" (`brandCampaignAccessLabel`).
- **Their latest on the content plan**, from the plan's own activity (the product's thread names who did each): its
  icon and "Flagged “Storytime”", which opens the script, then "6 h ago · 16 scripts approved"; else "Nothing on the
  content plan yet". It follows the visit: approve a script on the plan and the card says "Approved …, Just now".
- **On the workspace since** the day they joined.
- Nobody yet: "Nobody has signed in to this workspace yet." (the product's words).

## 4. Access requests (was: the request rows)

Every request the brand has sent and its decision, newest first; an approved one stays until its first sign-in (the
product's rule). Not drawn when there are none. The head counts them: "1 with 8x · 1 approved, not signed in yet · 1
not approved". Each row's colour follows its state (with 8x sky, approved blue, not approved pearl).

- An envelope disc (the product's), **the address**, and who asked: "Asked by Jordan", "Asked by you on 28 Oct" once
  decided ("Asked by 8x" when 8x invited outright).
- **The product's state line, word for word**: "Waiting for 8x approval · requested 2 days ago"; "Approved by 8x · 30
  Oct · hasn't signed in yet"; "Not approved by 8x · 22 Oct. Ask your 8x account manager if this is wrong.", with the
  account manager named and linked ("Ask Maya").
- **Its way, as a short track**: Asked, With 8x, Signs in. Waiting, the 8x stop beats; approved, it fills ("Approved")
  and the track waits at "Not signed in", beating; not approved, the 8x stop greys with a cross ("Not approved") and
  the rest fades. Who at 8x decided is never shown (design.md: attribution trails stay internal). "Ask Maya" brings the
  8x team's card into view and lights it. Below 880 px the track goes under the address; on a phone it takes the row.
- **Withdraw** (the trash, its lid lifting) on a waiting request, for an owner or whoever asked (the product's rule):
  the product's dialog, "Withdraw this request?", "8x will no longer review this request for …. You can request access
  for them again at any time.", Keep it (focused first) / Withdraw request; then a toast. Without the right, no
  control, and the reason on hover.
- **Ask again** on a declined one: reopens it, as typing the address would, with the same "Request sent to 8x".

## 5. Your 8x team (new: the right-hand column)

The people at 8x and in its network working for this brand, as the brand may see them:

- **Maya · 8x**, the account manager on all three campaigns (`CampaignAccountManager`). By first name with "· 8x", her
  disc an M: an account manager's last name, email and internal notes never reach a brand (design.md).
  - On ink with grain, lit by the vertical. What she runs: the three campaigns, each in its colour, and where each
    stands under its name ("Live, day 24 of 30", "Paused", "Ended").
  - "Lately, on the content plan": her three latest (replied, revised, shared, a flag answered; a plan's scripts shared
    on one day said once), each opening its script.
  - **Write to Maya**: opens the plan waiting for approval, whose thread is the product's channel to the account
    manager.
- **Making your posts**: five creators' faces (real ones in good standing only) and the rest counted ("+19"), "24
  creators on Autumn launch, 8 posted today", and the way to Creators.
- How access works is the invite block's way, not repeated here.
- Below 1360 px the two cards come into the tray after the requests, under their own head ("Maya runs your campaigns;
  24 creators make your posts."); wide enough, her card reads in two columns and the creators' in one line.

## The way in

- The sidebar's Team (its count: the people on the workspace).
- The overview: the account manager's card at the foot of Coming up ("Maya · 8x, Your account manager") opens Team.
- Each person's latest opens their script on the content plan; "Write to Maya" opens the plan; the creators' card opens
  Creators.
- Across the dashboard, 8x people as the product shows them: "Maya · 8x", her disc an M (the overview's card and the
  plan thread's discs showed her last name).

## Empty and edge states

- No members: the product's line. No requests: the section is not drawn.
- Asking for an address already on the page says which list it is on (the refusals above), and points at its row.
- The product's stale withdrawals ("This request has changed") cannot happen in the sample: one visit is the only
  writer.
