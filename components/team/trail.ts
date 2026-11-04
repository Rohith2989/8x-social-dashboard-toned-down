import { PLANS, type PersonKey, type Plan, type Script, type ThreadEvent } from "@/lib/plan";
import { eventsOf, type usePlanState } from "../plan/store";

/*
  What a person has done on the content plan, read from the plan's own threads (the product names who did each
  approval, flag and comment there), with this visit's own decisions on top: approving a script on the plan moves the
  card here too.
*/

type PlanState = ReturnType<typeof usePlanState>;

export type Step = { kind: ThreadEvent["kind"]; at: string; script: Script; plan: Plan; count: number };

function eventsBy(who: PersonKey, st: PlanState) {
  const out: { e: ThreadEvent; s: Script; p: Plan }[] = [];
  for (const p of PLANS) for (const s of p.scripts) for (const e of eventsOf(s, st)) if (e.who === who) out.push({ e, s, p });
  return out.sort((a, b) => (a.e.at < b.e.at ? 1 : a.e.at > b.e.at ? -1 : 0));
}

// a brand member's: how many scripts they approved, and the last thing they did
export function memberTrail(who: PersonKey, st: PlanState) {
  const theirs = eventsBy(who, st).filter((x) => x.e.kind === "approved" || x.e.kind === "flagged" || x.e.kind === "comment");
  const last = theirs[0];
  return {
    approved: theirs.filter((x) => x.e.kind === "approved").length,
    latest: last ? ({ kind: last.e.kind, at: last.e.at, script: last.s, plan: last.p, count: 1 } satisfies Step) : null,
  };
}

// the account manager's latest, a plan's scripts shared on one day said once
export function managerTrail(st: PlanState, n = 3) {
  const steps: Step[] = [];
  for (const x of eventsBy("maya", st)) {
    const same = x.e.kind === "added" && steps.find((g) => g.kind === "added" && g.plan.key === x.p.key && g.at.slice(0, 10) === x.e.at.slice(0, 10));
    if (same) same.count += 1;
    else steps.push({ kind: x.e.kind, at: x.e.at, script: x.s, plan: x.p, count: 1 });
  }
  return steps.slice(0, n);
}

// a step in words: what was done, to which script
export function stepText(s: Step, side: "brand" | "team") {
  const name = `“${s.script.format.name}”`;
  switch (s.kind) {
    case "approved":
      return `Approved ${name}`;
    case "flagged":
      return `Flagged ${name}`;
    case "comment":
      return side === "team" ? `Replied on ${name}` : `Commented on ${name}`;
    case "flagResolved":
      return `Answered the flag on ${name}`;
    case "revised":
      return `Revised ${name}`;
    case "added":
      return s.count > 1 ? `Shared ${s.count} scripts${s.plan.stage === "review" ? " to review" : ""}` : `Shared ${name}${s.plan.stage === "review" ? " to review" : ""}`;
  }
}

// where a step opens: its script on the plan, or the plan when it covers several
export const stepHref = (s: Step) => (s.count > 1 ? `/plan?plan=${s.plan.key}` : `/plan?plan=${s.plan.key}&script=${s.script.n}`);
