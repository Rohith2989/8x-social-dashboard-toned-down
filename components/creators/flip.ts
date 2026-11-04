"use client";

import { useLayoutEffect, useRef } from "react";

/*
  Things glide to their new places when a list re-sorts or filters, rather than jumping (FLIP: note where each was,
  let the list change, then play each from where it was to where it is). Newcomers fade up into their place. The
  window may be drawn larger than it is laid out (zoom on wide screens), so screen distances are turned back into
  the list's own pixels.
*/

export function useFlip<T extends HTMLElement>(order: string) {
  const ref = useRef<T>(null);
  const last = useRef(new Map<string, DOMRect>());

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const items = [...root.querySelectorAll<HTMLElement>("[data-flip]")];
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scale = root.getBoundingClientRect().width / (root.offsetWidth || 1) || 1;
    const next = new Map<string, DOMRect>();
    for (const el of items) next.set(el.dataset.flip!, el.getBoundingClientRect());
    if (!still && last.current.size) {
      for (const el of items) {
        const a = last.current.get(el.dataset.flip!);
        const b = next.get(el.dataset.flip!)!;
        if (a) {
          const dx = (a.left - b.left) / scale;
          const dy = (a.top - b.top) / scale;
          if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
            el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: 560, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
          }
        } else {
          el.animate([{ opacity: 0, transform: "translateY(10px) scale(0.97)" }, { opacity: 1, transform: "none" }], { duration: 420, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
        }
      }
    }
    last.current = next;
  }, [order]);

  return ref;
}
