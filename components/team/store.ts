"use client";

import { useSyncExternalStore } from "react";
import { NOW } from "@/lib/demo";
import { INVITES, YOU, type Invite } from "@/lib/team";

/*
  The access requests as this visit leaves them: the ones asked for here, reopened, or withdrawn. One store for the
  window, so the header's line, the requests, the invite block's count and the sidebar fall together.
*/

let state: Invite[] = INVITES;
const listeners = new Set<() => void>();

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

const update = (next: Invite[]) => {
  state = next;
  listeners.forEach((fn) => fn());
};

export const useInvites = () =>
  useSyncExternalStore(
    subscribe,
    () => state,
    () => INVITES,
  );

// the sample's clock: its now, plus the time since the page loaded, so a new request lands after everything before it
const LOADED = Date.now();
const nowIso = () => new Date(NOW + Math.max(0, Date.now() - LOADED)).toISOString();

let count = 0;

// asking for an address: a new request at the top; a declined one asked again reopens under a new id (the product's rule)
export function request(email: string): Invite {
  const address = email.trim().toLowerCase();
  const fresh: Invite = { id: `r-new${count++}`, email: address, status: "pendingApproval", by: YOU.id, at: nowIso(), decidedAt: null };
  update([fresh, ...state.filter((i) => i.email !== address)]);
  return fresh;
}

export const withdraw = (id: string) => update(state.filter((i) => i.id !== id));

export const withEightX = (list: Invite[]) => list.filter((i) => i.status === "pendingApproval").length;
