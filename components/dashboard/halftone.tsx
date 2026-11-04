"use client";

import { useEffect, useRef } from "react";
import { useArrived } from "../ui/arrival";

/*
  The light under the campaign's product, drawn in fine dots: a halftone of the glow the object throws on the ink,
  strongest under it and falling off across the card, with a low pool at the far corner. The dots never change size,
  only how lit they are (kit: the fine dot). It arrives once, sweeping left to right with the card, and the dots near
  the pointer lift a little as it passes. It draws only when something changes, never on a loop.
*/

const PITCH = 9;
const R = 1.25;

export function Halftone({ className, source = [0.8, 0.22] }: { className?: string; source?: [number, number] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const on = useArrived();

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const g = canvas?.getContext("2d");
    if (!canvas || !host || !g || !on) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const colour = getComputedStyle(host).getPropertyValue("--vertical-glow").trim() || "#86b4ff";
    let w = 0;
    let h = 0;
    let raf = 0;
    const start = performance.now();
    const pointer = { x: -999, y: -999 };

    const size = () => {
      const r = host.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      kick();
    };

    const draw = (now: number) => {
      raf = 0;
      g.clearRect(0, 0, w, h);
      g.fillStyle = colour;
      // the sweep: a dot shows once the arrival's front has passed it
      const p = still ? 2 : Math.min(2, (now - start) / 700);
      const [sx, sy] = source;
      for (let y = PITCH / 2; y < h; y += PITCH) {
        for (let x = PITCH / 2; x < w; x += PITCH) {
          const u = x / w;
          const v = y / h;
          const front = Math.max(0, Math.min(1, (p - u) * 3));
          if (front <= 0) continue;
          const glow = Math.exp(-(((u - sx) / 0.36) ** 2 + ((v - sy - 0.12) / 0.5) ** 2));
          const pool = 0.45 * Math.exp(-(((u - 0.98) / 0.3) ** 2 + ((v - 1.04) / 0.24) ** 2));
          const near = Math.exp(-((x - pointer.x) ** 2 + (y - pointer.y) ** 2) / (95 * 95));
          const a = Math.min(0.85, 0.035 + 0.5 * glow + pool + 0.42 * near) * front;
          if (a < 0.02) continue;
          g.globalAlpha = a;
          g.beginPath();
          g.arc(x, y, R, 0, Math.PI * 2);
          g.fill();
        }
      }
      if (p < 2) kick();
    };

    function kick() {
      if (!raf) raf = requestAnimationFrame(draw);
    }

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || still) return;
      const r = host.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      kick();
    };
    const leave = () => {
      pointer.x = -999;
      pointer.y = -999;
      kick();
    };

    const ro = new ResizeObserver(size);
    ro.observe(host);
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
    };
  }, [on, source]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
