"use client";

import { useSyncExternalStore } from "react";
import { NOW } from "@/lib/demo";
import { PLANS, reviewOf, type ScriptFlagReason, type Script, type ThreadEvent } from "@/lib/plan";

/*
  What the brand does on the Content plan in this visit: approvals, flags, comments, and the threads they have read.
  Each is an entry in a script's activity, as the product writes it, so a script's state is read from its activity
  the same way before and after. One store for the whole window: the sidebar's count and the overview's card read it
  too, so approving a script takes it off every count at once.
*/

type State = { added: Record<string, ThreadEvent[]>; read: Record<string, true> };

const EMPTY: State = { added: {}, read: {} };
let state: State = EMPTY;
const listeners = new Set<() => void>();

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

const update = (next: State) => {
  state = next;
  listeners.forEach((fn) => fn());
};

export const usePlanState = () =>
  useSyncExternalStore(
    subscribe,
    () => state,
    () => EMPTY,
  );

// the sample's clock: its now, plus the time since the page loaded, so a new entry lands after everything before it
const LOADED = Date.now();
const nowIso = () => new Date(NOW + Math.max(0, Date.now() - LOADED)).toISOString();

type NewEvent = { kind: "approved" } | { kind: "flagged"; reasons: ScriptFlagReason[]; note: string | null } | { kind: "comment"; body: string };

let count = 0;

function add(scriptId: string, event: NewEvent) {
  const e: ThreadEvent = { ...event, id: `${scriptId}:new${count++}`, who: "you", at: nowIso() };
  update({ ...state, added: { ...state.added, [scriptId]: [...(state.added[scriptId] ?? []), e] }, read: { ...state.read, [scriptId]: true } });
}

export const approve = (ids: string[]) => ids.forEach((id) => add(id, { kind: "approved" }));

export const flag = (id: string, reasons: ScriptFlagReason[], note: string) => add(id, { kind: "flagged", reasons, note: note || null });

export const comment = (id: string, body: string) => add(id, { kind: "comment", body });

export const markRead = (id: string) => {
  if (!state.read[id]) update({ ...state, read: { ...state.read, [id]: true } });
};

export const eventsOf = (s: Script, st: State) => (st.added[s.id] ? [...s.events, ...st.added[s.id]] : s.events);

export const unreadOf = (s: Script, st: State) => s.unread && !st.read[s.id];

export const reviewIn = (s: Script, st: State) => reviewOf(eventsOf(s, st));

// the scripts waiting for the brand: every one still to review on a plan waiting for approval
export const waitingIn = (st: State) =>
  PLANS.filter((p) => p.stage === "review").flatMap((p) => p.scripts.filter((s) => reviewIn(s, st).state === "awaitingReview"));
