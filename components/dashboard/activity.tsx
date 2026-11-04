"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { type Day } from "@/lib/demo";
import { DAYS } from "@/lib/days";
import { dayPosts, dayViews } from "@/lib/metrics";
import { compact, day, full, weekdayOf } from "@/lib/format";
import { Card } from "../ui/card";
import { Icon, type IconName } from "../ui/icon";
import { useArrived } from "../ui/arrival";
import styles from "./activity.module.css";

/*
  The trend, on the vertical's palest tint (Halo Lab's activity card): views, likes or posts by the day their posts
  went out, over a week, two or the whole campaign. A white line runs edge to edge over a field of fine white dots,
  dense at the line and fading toward the days; one day is picked out, with an ink marker, a line of dots down to its
  name in an ink pill, and its figure in a single tooltip. Pointing moves the pick; it starts on the best day.
*/

type Metric = "views" | "likes" | "posts";

const METRICS: { id: Metric; label: string; unit: string; icon: IconName; of: (d: Day) => number }[] = [
  { id: "views", label: "Views", unit: "Views", icon: "eye", of: (d) => dayViews(d) },
  { id: "likes", label: "Likes", unit: "Likes", icon: "heart", of: (d) => d.likes },
  { id: "posts", label: "Posts", unit: "Posts", icon: "posts", of: (d) => dayPosts(d) },
];

const RANGES = [
  { id: 7, label: "Week" },
  { id: 14, label: "2 weeks" },
  { id: DAYS.length, label: "Lifetime" },
];

const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Activity() {
  const [metric, setMetric] = useState<Metric>("views");
  const [span, setSpan] = useState(7);
  const m = METRICS.find((x) => x.id === metric)!;
  const days = useMemo(() => DAYS.slice(-span), [span]);
  const values = useMemo(() => days.map(m.of), [days, m]);
  const best = values.indexOf(Math.max(...values));
  const [pick, setPick] = useState<number | null>(null);
  const active = pick ?? best;

  return (
    <Card tone="pastel" order={1} className={styles.card} label="Activity">
      <div className={styles.inner}>
        <div className={styles.head}>
          <div className={styles.tabs} role="tablist" aria-label="Measure">
            {METRICS.map((x) => (
              <button
                key={x.id}
                type="button"
                role="tab"
                aria-selected={metric === x.id}
                className={styles.tab}
                onClick={() => {
                  setMetric(x.id);
                  setPick(null);
                }}
              >
                {x.label}
              </button>
            ))}
          </div>
          <RangeMenu value={span} onChange={(v) => { setSpan(v); setPick(null); }} />
        </div>
        <p className={styles.note}>
          Your numbers update every <strong>3 hours</strong>
        </p>

        <Chart
          key={`${metric}-${span}`}
          values={values}
          labels={days.map((d) => (span <= 7 ? WEEK[weekdayOf(d.date)] : day(d.date)))}
          long={days.map((d) => day(d.date, true))}
          active={active}
          onPick={setPick}
          unit={m.unit}
          icon={m.icon}
          whole={metric === "posts"}
        />
      </div>
    </Card>
  );
}

function RangeMenu({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [open]);
  return (
    <div ref={ref} className={styles.range}>
      <button type="button" className={styles.rangeButton} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((o) => !o)} data-anim-host>
        {RANGES.find((r) => r.id === value)?.label}
        <Icon name="down" size={16} stroke={2} />
      </button>
      {open && (
        <ul className={styles.menu} role="listbox" aria-label="Period">
          {RANGES.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                role="option"
                aria-selected={r.id === value}
                onClick={() => {
                  onChange(r.id);
                  setOpen(false);
                }}
              >
                {r.label}
                {r.id === value && <Icon name="tick" size={16} stroke={2} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const H = 222;
const PAD = 28;
const PITCH = 8;

const smooth = (pts: [number, number][]) =>
  pts.reduce((d, [x, y], i, a) => {
    if (!i) return `M${x},${y}`;
    const [px, py] = a[i - 1];
    const cx = (px + x) / 2;
    return `${d} C${cx},${py} ${cx},${y} ${x},${y}`;
  }, "");

function interp(pts: [number, number][], x: number) {
  for (let i = 1; i < pts.length; i++) {
    if (x <= pts[i][0]) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const t = (x - x0) / (x1 - x0 || 1);
      return y0 + (y1 - y0) * t * t * (3 - 2 * t);
    }
  }
  return pts[pts.length - 1][1];
}

function Chart({
  values,
  labels,
  long,
  active,
  onPick,
  unit,
  icon,
  whole,
}: {
  values: number[];
  labels: string[];
  long: string[];
  active: number;
  onPick: (i: number) => void;
  unit: string;
  icon: IconName;
  whole: boolean;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const on = useArrived();

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = values.length;
  const base = H - 50; // where the field fades out, above the days
  const top = 58; // room for the tooltip over the highest day
  const col = (w - 2 * PAD) / n;
  const X = (i: number) => PAD + (i + 0.5) * col;

  const geo = useMemo(() => {
    if (!w) return null;
    const max = Math.max(...values) * 1.06 || 1;
    const Y = (v: number) => base - (v / max) * (base - top);
    const pts = values.map((v, i) => [X(i), Y(v)] as [number, number]);
    // the line runs out to both edges of the card
    const run: [number, number][] = [[0, pts[0][1] + 6], ...pts, [w, pts[n - 1][1] + 6]];
    const dots: { x: number; y: number; o: number }[] = [];
    for (let x = PITCH / 2; x < w; x += PITCH) {
      const ly = interp(run, x);
      for (let y = base + 6; y > ly + 3; y -= PITCH) {
        const t = (y - ly) / (base + 6 - ly);
        dots.push({ x, y, o: Math.max(0.05, 0.9 * Math.pow(1 - t, 1.8)) });
      }
    }
    return { pts, run, dots, path: smooth(run), area: `${smooth(run)} L${w},${base + 8} L0,${base + 8} Z` };
    // X depends only on w and n
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, values]);

  const step = n <= 7 ? 1 : n <= 14 ? 2 : 4;
  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    // the window may be drawn larger than it is laid out (zoom on wide screens): back to the chart's own pixels
    const scale = r.width / (e.currentTarget.offsetWidth || r.width);
    const i = Math.floor(((e.clientX - r.left) / scale - PAD) / col);
    if (i >= 0 && i < n && i !== active) onPick(i);
  };

  const ax = X(active);
  const ay = geo ? geo.pts[active][1] : 0;
  const side = ax < 110 ? "start" : ax > w - 110 ? "end" : "mid";

  return (
    <div ref={wrap} className={`${styles.chart} ${on ? styles.on : ""}`} style={{ height: H }} onPointerMove={move}>
      {geo && (
        <svg width={w} height={H} className={styles.svg} role="img" aria-label={`${unit} by day; ${long[active]}: ${full(values[active])}`}>
          <defs>
            <linearGradient id="activity-glow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0.32" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={geo.area} fill="url(#activity-glow)" className={styles.area} />
          {geo.dots.map((d, k) => (
            <circle key={k} cx={d.x} cy={d.y.toFixed(1)} r={1.5} className={styles.dot} style={{ "--o": d.o.toFixed(2), animationDelay: `${Math.round(d.x * 0.7)}ms` } as React.CSSProperties} />
          ))}
          <path d={geo.path} className={styles.line} pathLength={1} />

          {/* the picked day: a line of dots down to its name */}
          <g className={styles.pick}>
            {Array.from({ length: Math.max(0, Math.floor((H - 40 - (ay + 14)) / 6)) }, (_, k) => (
              <circle key={k} cx={ax} cy={ay + 14 + k * 6} r={1.3} className={styles.drop} />
            ))}
            <circle cx={ax} cy={ay} r={7.5} className={styles.marker} />
          </g>
        </svg>
      )}

      <div className={styles.days} aria-hidden>
        {labels.map((l, i) => (
          <span
            key={i}
            style={{ left: X(i) }}
            className={i === active ? styles.dayOn : i % step === 0 && (step === 1 || Math.abs(i - active) >= step) ? undefined : styles.dayOff}
          >
            {l}
          </span>
        ))}
      </div>

      {geo && (
        <div className={styles.tip} data-side={side} style={{ left: ax, top: ay }}>
          <span className={styles.tipIcon}>
            <Icon name={icon} size={18} stroke={1.8} />
          </span>
          <span className={styles.tipText}>
            <strong className="num">{whole ? values[active] : compact(values[active])}</strong>
            <span>
              {unit}, {long[active]}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
