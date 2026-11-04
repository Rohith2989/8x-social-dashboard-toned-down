"use client";

import { useEffect, useRef } from "react";

/*
  The vertical's aura, alive (the landing's components/aura, made to follow the vertical): a few large soft lights,
  each an ellipse of one of the vertical's colours falling off like a Gaussian (the kit's aura falloff), drawn into a
  small canvas behind a card's content and set at depths. Far lights barely move; near ones drift wider and lean
  toward the pointer, so the colour reads as light in a room rather than a flat fill. It rises far to near when the
  card arrives, draws only while on screen, and holds still with reduced motion. Its colours are read from the
  vertical's tokens, so every vertical's dashboard gets its own aura from the same recipe.
*/

type Tone = "deep" | "core" | "glow" | "light" | "accent" | "white";
type Light = { x: number; y: number; rx: number; ry: number; rot: number; c: Tone; a: number; d: number; p: number };

// the day the dashboard's window floats in (the vertical's lightest palette, the user's ask): white light high on the
// left, the glow high on the right, the accent pooling low on the left and a faint core at the far corner
const DAY: Light[] = [
  { x: 0.02, y: -0.04, rx: 0.55, ry: 0.38, rot: -10, c: "white", a: 0.95, d: 0.1, p: 30 },
  { x: 0.88, y: 0.04, rx: 0.46, ry: 0.32, rot: 12, c: "glow", a: 0.5, d: 0.3, p: 26 },
  { x: 0.5, y: 0.5, rx: 0.7, ry: 0.42, rot: -6, c: "white", a: 0.45, d: 0.4, p: 34 },
  { x: 0.08, y: 0.98, rx: 0.5, ry: 0.32, rot: 10, c: "accent", a: 0.42, d: 0.6, p: 28 },
  { x: 0.98, y: 1.02, rx: 0.46, ry: 0.32, rot: -20, c: "core", a: 0.3, d: 0.85, p: 32 },
];

// the night the dashboard's window floats in: the accent faint high on the left, the core high on the right, the
// deep pooling along the foot and a low glow at the far corner, on the vertical's darkest shade
const NIGHT: Light[] = [
  { x: 0.04, y: -0.02, rx: 0.44, ry: 0.3, rot: -12, c: "accent", a: 0.42, d: 0.15, p: 30 },
  { x: 0.9, y: 0.06, rx: 0.5, ry: 0.34, rot: 14, c: "core", a: 0.5, d: 0.3, p: 26 },
  { x: 0.5, y: 1.08, rx: 0.95, ry: 0.3, rot: -4, c: "deep", a: 0.8, d: 0.6, p: 34 },
  { x: 1.02, y: 0.86, rx: 0.36, ry: 0.28, rot: -25, c: "glow", a: 0.34, d: 0.85, p: 28 },
  { x: -0.02, y: 0.74, rx: 0.34, ry: 0.24, rot: 18, c: "core", a: 0.42, d: 0.7, p: 24 },
];

// behind a chart: the glow high on the left where the title stands, the accent high on the right, the core through
// the middle, a long low horizon under the line, and the deep pooling at the far corner
const CHART: Light[] = [
  { x: 0.06, y: -0.04, rx: 0.56, ry: 0.3, rot: -10, c: "glow", a: 0.85, d: 0.1, p: 26 },
  { x: 0.86, y: 0.02, rx: 0.42, ry: 0.22, rot: 12, c: "accent", a: 0.72, d: 0.25, p: 24 },
  { x: 0.5, y: 0.46, rx: 0.6, ry: 0.32, rot: -12, c: "core", a: 0.5, d: 0.4, p: 30 },
  { x: 0.46, y: 0.84, rx: 0.86, ry: 0.05, rot: -3, c: "glow", a: 0.38, d: 0.5, p: 36 },
  { x: -0.02, y: 1.0, rx: 0.4, ry: 0.24, rot: 14, c: "deep", a: 0.55, d: 0.7, p: 28 },
  { x: 1.02, y: 1.06, rx: 0.5, ry: 0.32, rot: -25, c: "deep", a: 0.8, d: 0.95, p: 32 },
];

const FALL = [1, 0.961, 0.846, 0.662, 0.449, 0.253, 0.117, 0.045, 0.014];
const R = 1.75;
const SCALE = 0.25;

const rgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "").trim();
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const RECIPES = { day: DAY, night: NIGHT, chart: CHART };

export function Aura({ className, recipe = "chart" }: { className?: string; recipe?: keyof typeof RECIPES }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const g = canvas?.getContext("2d");
    if (!canvas || !host || !g) return;
    const css = getComputedStyle(host);
    const tone = (name: string, fallback: string) => rgb(css.getPropertyValue(name).trim() || fallback);
    const COLOURS: Record<Tone, [number, number, number]> = {
      deep: tone("--vertical-deep", "#2350ff"),
      core: tone("--vertical", "#3d7bff"),
      glow: tone("--vertical-glow", "#86b4ff"),
      light: tone("--vertical-light", "#e4eeff"),
      accent: tone("--vertical-accent", "#a79bff"),
      white: [255, 255, 255],
    };
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 1;
    let h = 1;
    let raf = 0;
    let on = false;
    let arrived = still ? 0 : -1;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const LIGHTS = RECIPES[recipe];
    const phase = LIGHTS.map((_, i) => i * 1.7);

    const draw = (now: number) => {
      g.clearRect(0, 0, w, h);
      const t = now / 1000;
      LIGHTS.forEach((l, i) => {
        const k = still ? 1 : arrived < 0 ? 0 : Math.max(0, Math.min(1, (now - arrived - l.d * 500) / 1300));
        const rise = 1 - Math.pow(1 - k, 3);
        if (rise <= 0) return;
        const drift = still ? 0 : 1;
        const a = (Math.PI * 2 * t) / l.p + phase[i];
        const dx = drift * (0.015 + 0.045 * l.d) * Math.sin(a) + pointer.x * l.d * 0.05;
        const dy = drift * (0.012 + 0.03 * l.d) * Math.cos(a * 0.8) + pointer.y * l.d * 0.04;
        const s = (0.9 + 0.1 * rise) * (1 + drift * 0.05 * Math.sin(a * 0.6 + 1));
        g.save();
        g.translate((l.x + dx) * w, (l.y + dy) * h);
        g.rotate(((l.rot + drift * 4 * Math.sin(a * 0.5)) * Math.PI) / 180);
        g.scale(l.rx * w * s, l.ry * w * s);
        const grad = g.createRadialGradient(0, 0, 0, 0, 0, R);
        const [cr, cg, cb] = COLOURS[l.c];
        FALL.forEach((f, j) => grad.addColorStop(j / (FALL.length - 1), `rgba(${cr},${cg},${cb},${(l.a * f * rise).toFixed(4)})`));
        g.fillStyle = grad;
        g.fillRect(-R, -R, 2 * R, 2 * R);
        g.restore();
      });
    };

    const size = () => {
      const r = host.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width * SCALE));
      h = Math.max(1, Math.round(r.height * SCALE));
      canvas.width = w;
      canvas.height = h;
      if (still) draw(0);
    };

    const frame = (now: number) => {
      raf = 0;
      if (!on) return;
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;
      draw(now);
      raf = requestAnimationFrame(frame);
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = host.getBoundingClientRect();
      pointer.tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      pointer.ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
    };
    const leave = () => {
      pointer.tx = 0;
      pointer.ty = 0;
    };

    const io = new IntersectionObserver(
      (es) => {
        const e = es[es.length - 1];
        on = e.isIntersecting;
        if (on && arrived < 0 && e.intersectionRatio >= 0.15) arrived = performance.now();
        if (on && !still && !raf) raf = requestAnimationFrame(frame);
      },
      { threshold: [0, 0.15] },
    );
    const ro = new ResizeObserver(size);
    size();
    io.observe(host);
    ro.observe(host);
    if (!still) {
      host.addEventListener("pointermove", move);
      host.addEventListener("pointerleave", leave);
    }
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
    };
  }, [recipe]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
