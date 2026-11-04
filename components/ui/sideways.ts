"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/*
  A row that scrolls sideways (the feed's days, the Content plan's plans and scripts): it rests on whole items, a
  mouse can drag it (a drag that moved is not a press), and it says whether there is more to see at either end, so the
  arrows show only where they lead somewhere. The scroll bar is never drawn (the scroller hides it in CSS).
  `item` picks the elements a step is measured on; by default the scroller's own children.
*/

export function useSideways<T extends HTMLElement>(item = ":scope > *") {
  const ref = useRef<T>(null);
  const [edge, setEdge] = useState({ start: true, end: true });
  const drag = useRef({ x: 0, left: 0, moved: false, on: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    const watch = new ResizeObserver(measure);
    watch.observe(el);
    return () => watch.disconnect();
  }, [measure]);

  const step = () => {
    const el = ref.current;
    if (!el) return 0;
    const first = el.querySelector<HTMLElement>(item);
    const gap = parseFloat(getComputedStyle(first?.parentElement ?? el).columnGap || "0") || 0;
    return first ? first.offsetWidth + gap : el.clientWidth;
  };

  // a page of whole items at a time
  const page = (dir: 1 | -1) => {
    const el = ref.current;
    const s = step();
    if (!el || !s) return;
    const per = Math.max(1, Math.floor((el.clientWidth + 8) / s));
    el.scrollBy({ left: dir * per * s, behavior: "smooth" });
  };

  // brings an item into view, whole, without moving the page
  const reveal = useCallback((target: HTMLElement | null, smooth = true) => {
    const el = ref.current;
    if (!el || !target) return;
    const a = target.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    if (a.left >= b.left && a.right <= b.right) return;
    const left = el.scrollLeft + (a.left < b.left ? a.left - b.left : a.right - b.right);
    el.scrollTo({ left, behavior: smooth ? "smooth" : "auto" });
  }, []);

  const bind = {
    onScroll: measure,
    onPointerDown: (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0 || !ref.current) return;
      drag.current = { x: e.clientX, left: ref.current.scrollLeft, moved: false, on: true };
    },
    onPointerMove: (e: React.PointerEvent) => {
      const d = drag.current;
      const el = ref.current;
      if (!d.on || !el) return;
      const dx = e.clientX - d.x;
      if (!d.moved && Math.abs(dx) > 6) {
        d.moved = true;
        el.dataset.dragging = "";
        el.setPointerCapture(e.pointerId);
      }
      if (d.moved) el.scrollLeft = d.left - dx;
    },
    onPointerUp: () => {
      const el = ref.current;
      drag.current.on = false;
      if (el && "dragging" in el.dataset) {
        delete el.dataset.dragging;
        const s = step();
        if (s) el.scrollTo({ left: Math.round(el.scrollLeft / s) * s, behavior: "smooth" });
      }
    },
    onPointerCancel: () => {
      drag.current.on = false;
      if (ref.current) delete ref.current.dataset.dragging;
    },
    onClickCapture: (e: React.MouseEvent) => {
      if (drag.current.moved) {
        e.stopPropagation();
        e.preventDefault();
        drag.current.moved = false;
      }
    },
  };

  return { ref, edge, page, reveal, bind };
}
