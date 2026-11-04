import { BRAND, CAMPAIGNS, MANAGER, TEAMMATES } from "./demo";
import { day } from "./format";
import { since } from "./roster";
import type { PersonKey } from "./plan-data";

/*
  The brand's workspace (the product's Team page: src/app/brand/team, src/server/api/brand/members): who is on it, the
  access requests the brand has sent to 8x and what 8x decided, and the 8x person on its campaigns as the brand may see
  them. The shapes follow the product's `brandMemberSchema` and `brandMemberInviteSchema` (entities.ts), so an engineer
  swaps this file for the list handler. Every person here is invented (the brand's own people): initials, never a face.

  The product's rules the sample keeps (src/lib/brand-members.ts, design.md):
    - two roles, owner and member; a request is always for a member, and nothing changes a role yet
    - a member's campaigns: null is every campaign the brand runs (an owner, and memberships from before the invite flow)
    - a request waits on 8x; approved, it stays until the first sign-in; 8x chooses what the person may read
    - an owner, or whoever asked, can withdraw a request until 8x answers it; a declined address asked again reopens
    - who at 8x decided is never shown, and an 8x person reaches a brand by first name with "· 8x", never more
*/

export type Role = "owner" | "member";

export const ROLE_LABELS: Record<Role, string> = { owner: "Owner", member: "Member" };

export type InviteStatus = "pendingApproval" | "approved" | "declined";

// how each state reads to a brand, whose half of the flow ends at "asked" (the product's BRAND_INVITE_STATUS_LABELS)
export const INVITE_LABELS: Record<InviteStatus, string> = {
  pendingApproval: "Waiting for 8x approval",
  approved: "Approved by 8x",
  declined: "Not approved by 8x",
};

export type Member = {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: Role;
  // the campaigns this person may read; null is every campaign the brand runs
  campaigns: string[] | null;
  since: string;
  you?: boolean;
  // who they are on the content plan's threads, where the product names each approval, flag and comment
  plan?: PersonKey;
};

export type Invite = {
  id: string;
  email: string;
  status: InviteStatus;
  // the member who asked; null when 8x invited the address outright
  by: string | null;
  at: string;
  decidedAt: string | null;
};

// the owner first, then by when they joined (the product's list order)
export const MEMBERS: Member[] = [
  { id: "alex", name: BRAND.member.name, initials: BRAND.member.initials, email: "alex@meridian.app", role: "owner", campaigns: null, since: "2026-06-02", you: true, plan: "you" },
  { id: "jordan", name: TEAMMATES[0].name, initials: TEAMMATES[0].initials, email: "jordan@meridian.app", role: "member", campaigns: null, since: "2026-06-02", plan: "jordan" },
  { id: "sam", name: "Sam Whitaker", initials: "SW", email: "sam@meridian.app", role: "member", campaigns: ["campus-week", "autumn-launch"], since: "2026-09-08" },
  { id: "nina", name: "Nina Okafor", initials: "NO", email: "nina@meridian.app", role: "member", campaigns: ["autumn-launch"], since: "2026-10-06" },
];

export const YOU = MEMBERS.find((m) => m.you) as Member;

// every request the brand has sent, newest first; an approved one stays until its first sign-in
export const INVITES: Invite[] = [
  { id: "r-lena", email: "lena@meridian.app", status: "pendingApproval", by: "jordan", at: "2026-11-01T09:40:00Z", decidedAt: null },
  { id: "r-omar", email: "omar@meridian.app", status: "approved", by: "alex", at: "2026-10-28T15:10:00Z", decidedAt: "2026-10-30T11:05:00Z" },
  { id: "r-northfield", email: "hello@northfield.studio", status: "declined", by: "jordan", at: "2026-10-20T10:00:00Z", decidedAt: "2026-10-22T12:00:00Z" },
];

export const memberById = (id: string | null) => MEMBERS.find((m) => m.id === id) ?? null;

/* --- the brand's campaigns, as a member's access names them --- */

export const campaignById = (id: string) => CAMPAIGNS.find((c) => c.id === id) ?? null;

// what a member's campaigns read as in one line (the product's brandCampaignAccessLabel)
export function accessLabel(campaigns: string[] | null) {
  if (campaigns == null) return CAMPAIGNS.length === 1 ? "The 1 campaign" : `All ${CAMPAIGNS.length} campaigns`;
  if (campaigns.length === 0) return "No campaigns yet";
  return campaigns.map((id) => campaignById(id)?.name ?? id).join(", ");
}

export const sees = (m: Member, campaignId: string) => m.campaigns == null || m.campaigns.includes(campaignId);

/* --- 8x, as the brand may see it --- */

const first = MANAGER.name.split(" ")[0];

// the account manager on every campaign the brand runs (CampaignAccountManager): by first name with "· 8x", and an M
export const ACCOUNT_MANAGER = {
  first,
  label: `${first} · 8x`,
  initial: first[0],
  role: "Account manager",
  campaigns: CAMPAIGNS.map((c) => c.id),
};

/* --- a request's state line, word for word as the product writes it --- */

export function inviteLine(i: Invite) {
  const label = INVITE_LABELS[i.status];
  const decided = i.decidedAt ? day(i.decidedAt.slice(0, 10)) : "Decision date unavailable";
  if (i.status === "pendingApproval") return `${label} · requested ${since(i.at).toLowerCase()}`;
  if (i.status === "approved") return `${label} · ${decided} · hasn't signed in yet`;
  return `${label} · ${decided}.`;
}

// who asked, as the request's second line: the member by first name, "you", or 8x when it invited outright
export function askedBy(i: Invite) {
  if (i.by == null) return "Asked by 8x";
  const m = memberById(i.by);
  if (!m) return "Asked by a former member";
  return m.you ? "Asked by you" : `Asked by ${m.name.split(" ")[0]}`;
}

// an owner withdraws any request still with 8x; a member only their own
export const canWithdraw = (i: Invite) => i.status === "pendingApproval" && (YOU.role === "owner" || i.by === YOU.id);

/* --- asking for an address: the product's refusals, word for word, and the row each one points at --- */

const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-z]{2,}$/i;

export function refusal(raw: string, invites: Invite[]): { text: string; row?: string } | null {
  const email = raw.trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 200) return { text: "Enter a full work email address, like name@company.com." };
  if (email === YOU.email) return { text: "You are already on this workspace" };
  const member = MEMBERS.find((m) => m.email === email);
  if (member) return { text: "That address is already on this workspace", row: member.id };
  const invite = invites.find((i) => i.email === email);
  if (invite?.status === "pendingApproval") return { text: "That address has already been requested and is with 8x", row: invite.id };
  if (invite?.status === "approved") return { text: "8x has already approved that address. They haven't signed in yet.", row: invite.id };
  return null;
}
