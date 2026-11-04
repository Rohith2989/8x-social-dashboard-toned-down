"use client";

import { useEffect, useRef } from "react";
import type { BannerPalette, RosterCreator } from "@/lib/roster";
import { useTheme } from "../shell/theme";
import styles from "./banner.module.css";

/*
  A creator's banner, 8x's own (never their photos): a few large soft lights in the vertical's colours over one of
  six grounds, drawn the way the window's aura is (ellipses falling off like a Gaussian, on a small canvas the browser
  smooths as it scales up), with the grain the colour blocks carry. The ground is the creator's palette; where the
  lights stand comes from their name, so every creator's banner is their own and stays the same wherever it shows.
  The colours are read from the vertical's tokens, so every vertical's creators get its own banners. At night the same
  lights stand in the dark (the ground sinks toward the vertical's ink, white light turns to its glow), an aurora
  rather than a pale sky, so no banner glares on the dark cards. Pointing at the card lets the light drift a little
  under the grain. It greys with the creator when they are dropped or flagged.
  Anything placed inside (the card's check and platforms, the sheet's close) sits over it.
*/

type Tone = "deep" | "core" | "glow" | "light" | "accent" | "ink" | "white";
type RGB = [number, number, number];

// each palette: its ground (a tone, or a mix of two), then its lights, largest first: [tone, strength, size]. Each has
// its own character: a hot light and a shadow on the deep ones, a clear colour field on the pale ones (their white
// stands low, never at the edge, so a pale banner keeps its edge on the white card).
const PALETTES: Record<BannerPalette, { ground: [Tone, Tone, number]; lights: [Tone, number, number][] }> = {
  cobalt: { ground: ["deep", "deep", 0], lights: [["glow", 1, 1.15], ["accent", 0.75, 0.9], ["ink", 0.7, 0.9], ["white", 0.5, 0.45]] },
  daybreak: { ground: ["light", "glow", 0.4], lights: [["glow", 1, 1.15], ["white", 0.95, 1], ["accent", 0.6, 0.8], ["core", 0.7, 0.8]] },
  iris: { ground: ["accent", "deep", 0.45], lights: [["glow", 0.85, 1.1], ["accent", 1, 0.95], ["deep", 0.85, 0.9], ["white", 0.45, 0.45]] },
  sky: { ground: ["glow", "core", 0.15], lights: [["white", 0.9, 1.1], ["deep", 0.85, 0.95], ["accent", 0.55, 0.8], ["light", 0.7, 0.6]] },
  night: { ground: ["ink", "ink", 0], lights: [["core", 1, 1.15], ["accent", 0.65, 0.9], ["deep", 0.95, 0.95], ["glow", 0.6, 0.45]] },
  lilac: { ground: ["light", "accent", 0.55], lights: [["accent", 0.95, 1.1], ["white", 0.9, 1], ["core", 0.6, 0.85], ["glow", 0.7, 0.6]] },
};

// where the lights stand, as [x from, x to, y from, y to] of the banner: one high on one side, one low on the
// other, one low on the first side, one at the far top corner (mirrored for half the creators); none under the face
const ZONES = [
  [0, 0.32, -0.25, 0.3],
  [0.62, 1, 0.55, 1.15],
  [0, 0.28, 0.75, 1.2],
  [0.72, 1.05, -0.25, 0.25],
];

// the aura's falloff
const FALL = [1, 0.961, 0.846, 0.662, 0.449, 0.253, 0.117, 0.045, 0.014];
const R = 1.75;
const SCALE = 0.25;

// a small seeded generator, so a creator's lights always stand in the same places
function seeded(id: string) {
  let a = 0;
  for (const ch of id) a = (a * 31 + ch.charCodeAt(0)) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rgb = (hex: string, fallback: RGB): RGB => {
  const h = hex.replace("#", "").trim();
  if (!/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(h)) return fallback;
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const mix = (a: RGB, b: RGB, t: number): RGB => [0, 1, 2].map((i) => Math.round(a[i] * (1 - t) + b[i] * t)) as RGB;

function draw(canvas: HTMLCanvasElement, palette: BannerPalette, id: string, night: boolean) {
  const host = canvas.parentElement;
  const g = canvas.getContext("2d");
  if (!host || !g || !host.offsetWidth || !host.offsetHeight) return;
  const css = getComputedStyle(host);
  const token = (name: string, fallback: RGB) => rgb(css.getPropertyValue(name), fallback);
  const tones: Record<Tone, RGB> = {
    deep: token("--vertical-deep", [35, 80, 255]),
    core: token("--vertical", [61, 123, 255]),
    glow: token("--vertical-glow", [134, 180, 255]),
    light: token("--vertical-light", [228, 238, 255]),
    accent: token("--vertical-accent", [167, 155, 255]),
    ink: token("--vertical-ink", [8, 33, 89]),
    white: [255, 255, 255],
  };
  // drawn at a quarter of its size: the browser's smoothing as it scales up is part of the softness
  const w = (canvas.width = Math.max(8, Math.round(host.offsetWidth * SCALE)));
  const h = (canvas.height = Math.max(4, Math.round(host.offsetHeight * SCALE)));
  const p = PALETTES[palette];
  const r = seeded(id);
  const ground = mix(tones[p.ground[0]], tones[p.ground[1]], p.ground[2]);
  // at night the ground sinks toward the ink and the white light becomes the glow
  const dark = mix(tones.ink, [5, 9, 24], 0.55);
  g.fillStyle = `rgb(${(night ? mix(ground, dark, 0.66) : ground).join(",")})`;
  g.fillRect(0, 0, w, h);
  const flip = r() < 0.5;
  p.lights.forEach(([tone, strength, size], i) => {
    const [x0, x1, y0, y1] = ZONES[i];
    const x = x0 + r() * (x1 - x0);
    const y = y0 + r() * (y1 - y0);
    const rx = (0.32 + r() * 0.16) * size;
    const ry = (0.5 + r() * 0.3) * size;
    const rot = (r() - 0.5) * 50;
    g.save();
    g.translate((flip ? 1 - x : x) * w, y * h);
    g.rotate((rot * Math.PI) / 180);
    g.scale(rx * w, ry * h);
    const grad = g.createRadialGradient(0, 0, 0, 0, 0, R);
    const lit = night && (tone === "white" || tone === "light") ? "glow" : tone;
    const [cr, cg, cb] = tones[lit];
    const a = night ? strength * (lit === tone ? 0.82 : 0.5) : strength;
    FALL.forEach((f, j) => grad.addColorStop(j / (FALL.length - 1), `rgba(${cr},${cg},${cb},${(a * f).toFixed(4)})`));
    g.fillStyle = grad;
    g.fillRect(-R, -R, 2 * R, 2 * R);
    g.restore();
  });
  canvas.dataset.on = "";
}

export function Banner({
  creator,
  size = "card",
  className,
  children,
}: {
  creator: RosterCreator;
  size?: "card" | "profile";
  className?: string;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { id, banner } = creator;
  const night = useTheme() === "dark";

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    draw(canvas, banner, id, night);
    // redrawn when the banner changes shape (a column more or less in the grid, the window resized)
    let last = `${host.offsetWidth}x${host.offsetHeight}`;
    const watch = new ResizeObserver(() => {
      const now = `${host.offsetWidth}x${host.offsetHeight}`;
      if (now === last) return;
      last = now;
      draw(canvas, banner, id, night);
    });
    watch.observe(host);
    return () => watch.disconnect();
  }, [banner, id, night]);

  return (
    <div className={`${styles.banner} ${styles[size]} ${className ?? ""}`} data-palette={banner} data-muted={creator.status === "dropped" || !!creator.flag}>
      <canvas ref={ref} className={styles.light} data-light aria-hidden />
      {children}
    </div>
  );
}
