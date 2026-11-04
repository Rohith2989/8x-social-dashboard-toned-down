"use client";

import { useSyncExternalStore } from "react";

/*
  Daybreak and Night: the dashboard's two looks, set on <html data-theme> before the first paint (the script in
  app/layout.tsx: the member's own choice, else the device's) and changed here. A change spreads out from the switch
  that made it, as a soft-edged pool of the new light (or the new dark) over the old: a view transition, so the page
  itself swaps at once underneath and nothing is drawn twice. With reduced motion, or where the browser has no view
  transitions, the look simply changes.
*/

export type Theme = "light" | "dark";

export const THEME_KEY = "8x-theme";

const listeners = new Set<() => void>();

const read = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

export const useTheme = () => useSyncExternalStore(subscribe, read, () => "light" as Theme);

type Transitioning = Document & { startViewTransition?: (update: () => void) => { finished: Promise<void> } };

export function setTheme(next: Theme, from?: DOMRect) {
  const root = document.documentElement;
  const apply = () => {
    root.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
    listeners.forEach((fn) => fn());
  };
  const doc = document as Transitioning;
  if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    apply();
    return;
  }
  // where the new look starts: the switch's centre; how far it must reach: the screen's farthest corner
  const x = from ? from.left + from.width / 2 : window.innerWidth / 2;
  const y = from ? from.top + from.height / 2 : window.innerHeight / 2;
  const reach = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  root.style.setProperty("--vt-x", `${x}px`);
  root.style.setProperty("--vt-y", `${y}px`);
  root.style.setProperty("--vt-reach", `${Math.ceil(reach)}px`);
  root.dataset.themeTo = next;
  doc.startViewTransition(apply).finished.finally(() => {
    delete root.dataset.themeTo;
  });
}
