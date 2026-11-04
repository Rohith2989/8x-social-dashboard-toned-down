"use client";

import { useSyncExternalStore } from "react";

/*
  The sources connected in this visit. One store for the window, so a source connected from Analytics' dialog is
  connected on Settings too, and the other way round.
*/

const EMPTY: Record<string, true> = {};
let state: Record<string, true> = EMPTY;
const listeners = new Set<() => void>();

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

export const useConnected = () =>
  useSyncExternalStore(
    subscribe,
    () => state,
    () => EMPTY,
  );

export function markConnected(id: string) {
  state = { ...state, [id]: true };
  listeners.forEach((fn) => fn());
}
