import { compact, day } from "@/lib/format";
import { MAYA, TODAY, daysBetween, reasonsLabel, type Plan, type Review, type Script } from "@/lib/plan";

/*
  The Content plan's words for where things stand, said once and used everywhere a script or a plan is drawn (the
  product's ReviewStateBadge and the plan picker's badges): a state is always said in words, never a mark alone.
*/

export type Tone = "waiting" | "approved" | "flagged" | "updated" | "none";

// where the script stands in the brand's review: flagged and why, approved and when, waiting while the plan waits for
// approval, and on a plan creators already have, a change Maya made since (else nothing: nobody decided anything)
export function stateOf(review: Review, plan: Plan): { tone: Tone; text: string } {
  if (review.flag) return { tone: "flagged", text: `Flagged: ${reasonsLabel(review.flag.reasons)}` };
  if (review.approval) return { tone: "approved", text: `Approved ${day(review.approval.at.slice(0, 10))}` };
  if (plan.stage === "review") return { tone: "waiting", text: "Waiting for you" };
  if (review.revisedAt) return { tone: "updated", text: `Updated ${day(review.revisedAt.slice(0, 10))}` };
  return { tone: "none", text: "" };
}

// what a script's posts came to, once creators have it
export const resultsOf = (s: Script) =>
  s.results.posts ? `${s.results.posts} ${s.results.posts === 1 ? "post" : "posts"}, ${compact(s.results.views)} views` : "No posts yet";

// "today", "yesterday", "on 2 Nov"
export function when(iso: string) {
  const d = daysBetween(iso.slice(0, 10), TODAY);
  return d === 0 ? "today" : d === 1 ? "yesterday" : `on ${day(iso.slice(0, 10))}`;
}

// where a plan stands, in a line
export function planState(plan: Plan, waiting: number, flagged: number) {
  if (plan.stage === "past") return `Finished ${day(plan.end)}`;
  if (plan.stage === "live") return `With creators since ${day(plan.start)}, day ${daysBetween(plan.start, TODAY) + 1} of ${plan.days}`;
  if (waiting) return `${waiting} of ${plan.scripts.length} waiting for you`;
  if (flagged) return `${flagged} flagged, waiting on ${MAYA}`;
  return `All approved. ${MAYA} sends it to creators on ${day(plan.start)}`;
}
