"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { compact, day as dayLabel, full } from "@/lib/format";
import { POSTS, ROSTER } from "@/lib/roster";
import { CAMPAIGN_START, METRICS, SPLITS, daysIn, money, moneyCompact, seriesOf, valueOf, type GaDay, type Metric, type Split, type Window } from "@/lib/analytics";
import { Menu } from "../ui/menu";
import styles from "./chart.module.css";

/*
  The website, with 8x on it (was: the trend chart and its "With 8x posts" overlay). The window lit, beside the same
  number of days before it, quiet, with a seam between them named. The metric is the card's title (the product's
  picker); a split draws a line a series, overlaid, never stacked, with a legend that switches series off and on (never
  the last). Under the plot, the posts that went out each day as fine dots, one a post; over the days a post went big,
  its creator's face, on the line where the website jumped. Days Google Analytics has not settled are hatched. Pointing
  at a day draws its rule and says the day; pressing it opens the day on the right (arrow keys move it).
*/

const PLOT = 270;
const PAD = { top: 40, right: 18, left: 54 };
const TRACK = 44;
const AXIS = 26;
const BIG = 60_000;

const COLOURS: Record<string, string> = {
  total: "var(--vertical-deep)",
  nonPaid: "var(--vertical-deep)",
  paid: "var(--vertical-accent)",
  organicSocial: "var(--vertical-deep)",
  organicSearch: "var(--vertical-glow)",
  direct: "color-mix(in srgb, var(--vertical-ink) 62%, #fff)",
  paidSearch: "var(--vertical-accent)",
  paidSocial: "color-mix(in srgb, var(--vertical-accent) 50%, var(--vertical-deep))",
  email: "var(--mist)",
  referral: "color-mix(in srgb, var(--vertical-glow) 40%, var(--mist))",
};

// the series the eye should land on: the total, the non-paid line, Organic Social (where creators' clicks arrive)
const LEAD = new Set(["total", "nonPaid", "organicSocial"]);

export const formatMetric = (v: number, m: Metric, short = false) => (m === "revenue" ? (short ? moneyCompact(v) : money(v)) : short ? compact(v) : full(v));

const metricWord = (m: Metric, v: number) => {
  const label = METRICS.find((x) => x.key === m)!.label.toLowerCase();
  return m === "revenue" ? "revenue" : v === 1 ? label.replace(/s$/, "") : label;
};

// a usual day before 8x, on a metric: the mean of the days before the campaign the sample holds
export function usualBefore(m: Metric) {
  const before = daysIn("0000-01-01", new Date(Date.parse(`${CAMPAIGN_START}T00:00:00Z`) - 864e5).toISOString().slice(0, 10));
  return before.reduce((a, d) => a + valueOf(d, m), 0) / Math.max(1, before.length);
}

// a smooth line through the points that never overshoots them (monotone in x), so a quiet day never dips below zero
function smooth(points: [number, number][]) {
  if (points.length < 2) return points.length ? `M${points[0][0]},${points[0][1]}` : "";
  const n = points.length;
  const dx = points.slice(1).map((p, i) => p[0] - points[i][0]);
  const m = points.slice(1).map((p, i) => (p[1] - points[i][1]) / dx[i]);
  const t = points.map((_, i) => {
    if (i === 0) return m[0];
    if (i === n - 1) return m[n - 2];
    return m[i - 1] * m[i] <= 0 ? 0 : (3 * (dx[i - 1] + dx[i])) / ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i]);
  });
  let d = `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += ` C${(points[i][0] + h).toFixed(1)},${(points[i][1] + h * t[i]).toFixed(1)} ${(points[i + 1][0] - h).toFixed(1)},${(points[i + 1][1] - h * t[i + 1]).toFixed(1)} ${points[i + 1][0].toFixed(1)},${points[i + 1][1].toFixed(1)}`;
  }
  return d;
}

// round steps for the scale (1, 2, 2.5 or 5 of a power of ten), four or so of them, the top one above the highest day
function niceScale(top: number) {
  const raw = Math.max(1, top) / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((k) => k * mag).find((v) => v >= raw) ?? 10 * mag;
  const ticks: number[] = [];
  for (let v = step; v < top * 1.08 + step; v += step) ticks.push(v);
  return { ticks, max: Math.max(top * 1.14, ticks[ticks.length - 1] * 1.04) };
}

const postsOn = (date: string) => POSTS.filter((p) => p.postedAt.slice(0, 10) === date).sort((a, b) => b.views - a.views);

export function WebsiteChart({
  win,
  metric,
  split,
  hidden,
  showPosts,
  openDay,
  onMetric,
  onSplit,
  onHidden,
  onPosts,
  onDay,
}: {
  win: Window;
  metric: Metric;
  split: Split;
  hidden: string[];
  showPosts: boolean;
  openDay: string;
  onMetric: (m: Metric) => void;
  onSplit: (s: Split) => void;
  onHidden: (keys: string[]) => void;
  onPosts: (on: boolean) => void;
  onDay: (date: string) => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => setW(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const days = useMemo(() => [...daysIn(win.prev.start, win.prev.end), ...daysIn(win.start, win.end)], [win]);
  const seam = days.findIndex((d) => d.date >= win.start);
  const keys = seriesOf(days[0], split).map((s) => ({ key: s.key, label: s.label }));
  const off = new Set(hidden.filter((k) => keys.some((s) => s.key === k)));
  const shown = keys.filter((s) => !off.has(s.key));
  const usual = usualBefore(metric);

  const height = PAD.top + PLOT + (showPosts ? TRACK : 0) + AXIS;
  const plotW = Math.max(10, w - PAD.left - PAD.right);
  const col = plotW / days.length;
  const values = days.map((d) => Object.fromEntries(seriesOf(d, split).map((s) => [s.key, valueOf(s.totals, metric)])) as Record<string, number>);
  const scale = niceScale(Math.max(1, ...values.flatMap((v) => shown.map((s) => v[s.key]))));
  const max = scale.max;
  const x = (i: number) => PAD.left + (i + 0.5) * col;
  const y = (v: number) => PAD.top + PLOT - (v / max) * PLOT;
  const base = PAD.top + PLOT;
  const seamX = PAD.left + seam * col;
  const firstLoose = days.findIndex((d) => !d.settled);
  const openIndex = days.findIndex((d) => d.date === openDay);
  const ticks = scale.ticks.filter((v) => v <= max);
  // the dates: every so many days (a date and its room take about 76 px), and always the last, the one before it
  // dropped if they would touch
  const every = Math.max(1, Math.ceil(days.length / Math.max(3, Math.floor(plotW / 76))));
  const labelled = new Set(days.map((_, i) => i).filter((i) => i % every === 0));
  const lastLabel = Math.max(...labelled);
  if ((days.length - 1 - lastLabel) * col < 56) labelled.delete(lastLabel);
  labelled.add(days.length - 1);
  const drawKey = `${metric}-${split}-${win.key}`;

  // the faces: the posts that went big in the days drawn, each on the line over its day
  const faces = (() => {
    if (!showPosts || !w) return [];
    const out: { id: string; src: string; name: string; views: number; x: number; y: number; date: string }[] = [];
    days.forEach((d, i) => {
      const best = postsOn(d.date)[0];
      const who = best && ROSTER.find((c) => c.id === best.creatorId);
      if (best && best.views >= BIG && who?.avatar) {
        const lead = shown.find((s) => LEAD.has(s.key)) ?? shown[0];
        out.push({ id: best.id, src: who.avatar, name: who.name.split(" ")[0], views: best.views, x: x(i), y: y(values[i][lead?.key ?? "total"] ?? 0) - 26, date: d.date });
      }
    });
    // the biggest first, each kept only where it has room of its own (a face never sits on another, nor stacks over
    // the peak and hides it); a narrow plot keeps fewer
    const room = col >= 14 ? 6 : col >= 9 ? 4 : 3;
    const kept: typeof out = [];
    for (const f of [...out].sort((a, b) => b.views - a.views)) {
      if (kept.length >= room) break;
      if (kept.every((k) => Math.hypot(k.x - f.x, k.y - f.y) >= 38)) kept.push(f);
    }
    return kept.sort((a, b) => a.x - b.x).map((f) => ({ ...f, y: Math.max(16, f.y) }));
  })();

  const pick = (clientX: number) => {
    const r = wrap.current?.getBoundingClientRect();
    if (!r) return null;
    const i = Math.floor((clientX - r.left - PAD.left) / col);
    return i >= 0 && i < days.length ? i : null;
  };

  const tip = hover != null ? days[hover] : null;

  return (
    <section className={styles.card} aria-label="The website, with 8x on it">
      <header className={styles.head}>
        <div className={styles.title}>
          <Menu variant="title" label="Metric" value={metric} onChange={onMetric} options={METRICS.map((m) => ({ id: m.key, label: m.label }))} />
          <p>
            {win.key === "since" ? "A day at a time since 8x started, beside the days before it" : `The last ${win.days} days, beside the ${win.days} before them`}
          </p>
        </div>
        <div className={styles.controls}>
          <button type="button" className={styles.toggle} aria-pressed={showPosts} onClick={() => onPosts(!showPosts)} data-anim-host>
            <span className={styles.switch} aria-hidden />
            8x posts
          </button>
          <Menu label="Split" value={split} onChange={onSplit} align="end" options={SPLITS.map((s) => ({ id: s.key, label: s.label }))} />
        </div>
      </header>

      <div
        ref={wrap}
        className={styles.plot}
        style={{ height }}
        tabIndex={0}
        role="group"
        aria-label={`${METRICS.find((m) => m.key === metric)!.label} a day, ${dayLabel(days[0].date)} to ${dayLabel(days[days.length - 1].date)}. Left and right arrows move the open day.`}
        onPointerMove={(e) => setHover(pick(e.clientX))}
        onPointerLeave={() => setHover(null)}
        onClick={(e) => {
          const i = pick(e.clientX);
          if (i != null) onDay(days[i].date);
        }}
        onKeyDown={(e) => {
          if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
          e.preventDefault();
          const i = Math.min(days.length - 1, Math.max(0, (openIndex < 0 ? days.length - 1 : openIndex) + (e.key === "ArrowRight" ? 1 : -1)));
          onDay(days[i].date);
        }}
      >
        {w > 0 && (
          <svg width={w} height={height} className={styles.svg} aria-hidden>
            <defs>
              <linearGradient id="an-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="var(--vertical)" stopOpacity="0.32" />
                <stop offset="1" stopColor="var(--vertical)" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="an-before" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="var(--mist)" stopOpacity="0.22" />
                <stop offset="1" stopColor="var(--mist)" stopOpacity="0.02" />
              </linearGradient>
              <pattern id="an-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="7" stroke="var(--vertical-glow)" strokeWidth="1.4" strokeOpacity="0.45" />
              </pattern>
              <clipPath id="an-was">
                <rect x={0} y={0} width={seamX} height={height} />
              </clipPath>
              <clipPath id="an-now">
                <rect x={seamX} y={0} width={w - seamX} height={height} />
              </clipPath>
            </defs>

            {/* the scale: four quiet lines and their figures */}
            {ticks.map((v) => (
              <g key={v} className={styles.tick}>
                <line x1={PAD.left} x2={w - PAD.right} y1={y(v)} y2={y(v)} />
                <text x={PAD.left - 10} y={y(v) + 4} textAnchor="end">
                  {formatMetric(v, metric, true)}
                </text>
              </g>
            ))}
            <line className={styles.base} x1={PAD.left} x2={w - PAD.right} y1={base} y2={base} />

            {/* the days not settled yet, hatched */}
            {firstLoose >= 0 && (
              <g className={styles.loose}>
                <rect x={PAD.left + firstLoose * col} y={PAD.top} width={(days.length - firstLoose) * col} height={PLOT} fill="url(#an-hatch)" />
              </g>
            )}

            {/* the open day */}
            {openIndex >= 0 && <rect className={styles.openBand} x={PAD.left + openIndex * col + 1} y={PAD.top - 6} width={Math.max(2, col - 2)} height={PLOT + 6} rx={Math.min(8, col / 2)} />}

            {/* the area under the lead line: lit in the window, quiet before it */}
            {shown.length === 1 &&
              (() => {
                const k = shown[0].key;
                const pts = days.map((_, i) => [x(i), y(values[i][k])] as [number, number]);
                const line = smooth(pts);
                const area = `${line} L${x(days.length - 1)},${base} L${x(0)},${base} Z`;
                return (
                  <g key={`area-${drawKey}`} className={styles.areas}>
                    <path d={area} fill="url(#an-before)" clipPath="url(#an-was)" />
                    <path d={area} fill="url(#an-area)" clipPath="url(#an-now)" />
                  </g>
                );
              })()}

            {/* the lines: muted before the seam, in their colour after it */}
            {shown.map((s) => {
              const pts = days.map((_, i) => [x(i), y(values[i][s.key])] as [number, number]);
              const d = smooth(pts);
              const lead = LEAD.has(s.key);
              return (
                <g key={`${s.key}-${drawKey}`}>
                  <path d={d} className={styles.before} strokeWidth={lead ? 2 : 1.4} clipPath="url(#an-was)" />
                  <path d={d} className={styles.line} stroke={COLOURS[s.key]} strokeWidth={lead ? 2.8 : 1.8} clipPath="url(#an-now)" pathLength={1} />
                </g>
              );
            })}

            {/* the seam, named on both sides */}
            {seam > 0 && (
              <g className={styles.seam}>
                <line x1={seamX} x2={seamX} y1={PAD.top - 22} y2={base} />
                <text x={seamX - 10} y={PAD.top - 12} textAnchor="end" className={styles.seamBefore}>
                  {win.key === "since" ? `The ${win.days} days before 8x` : `The ${win.days} days before`}
                </text>
                <text x={seamX + 10} y={PAD.top - 12} className={styles.seamNow}>
                  {win.key === "since" ? `8x starts, ${dayLabel(win.start)}` : `The last ${win.days} days`}
                </text>
              </g>
            )}

            {/* the hover rule and the series' dots on it */}
            {hover != null && (
              <g className={styles.rule}>
                <line x1={x(hover)} x2={x(hover)} y1={PAD.top - 4} y2={base} />
                {shown.map((s) => (
                  <circle key={s.key} cx={x(hover)} cy={y(values[hover][s.key])} r={4.5} stroke={hover >= seam ? COLOURS[s.key] : "var(--mist)"} />
                ))}
              </g>
            )}
            {openIndex >= 0 && hover == null && shown[0] && (
              <circle className={styles.openDot} cx={x(openIndex)} cy={y(values[openIndex][(shown.find((s) => LEAD.has(s.key)) ?? shown[0]).key])} r={5.5} />
            )}

            {/* the posts, a dot a post, under each day */}
            {showPosts && (
              <g className={styles.track}>
                <text x={PAD.left - 10} y={base + TRACK - 6} textAnchor="end" className={styles.trackLabel}>
                  Posts
                </text>
                {days.map((d, i) => {
                  if (!d.posts) return null;
                  const per = Math.max(1, Math.floor((col - 3) / 5.2));
                  const rows = Math.ceil(d.posts / per);
                  const step = Math.min(5.2, (col - 3) / per, (TRACK - 14) / rows);
                  const r = Math.max(0.9, Math.min(1.6, step * 0.34));
                  return Array.from({ length: d.posts }, (_, k) => {
                    const cx = x(i) - ((Math.min(per, d.posts) - 1) * step) / 2 + (k % per) * step;
                    const cy = base + TRACK - 8 - Math.floor(k / per) * step;
                    return <circle key={`${d.date}-${k}`} cx={cx} cy={cy} r={r} className={i >= seam ? styles.postDot : styles.postDotBefore} />;
                  });
                })}
              </g>
            )}

            {/* the dates */}
            {days.map((d, i) =>
              labelled.has(i) ? (
                <text key={d.date} x={x(i)} y={height - 8} textAnchor="middle" className={styles.date} data-now={i >= seam || undefined}>
                  {dayLabel(d.date)}
                </text>
              ) : null,
            )}
          </svg>
        )}

        {/* the faces of the posts that went big, over the days they went out */}
        {faces.map((f, i) => (
          <span key={f.id} className={styles.face} style={{ left: f.x, top: f.y, "--i": i } as React.CSSProperties} title={`${f.name}'s post, ${compact(f.views)} views`}>
            <img src={f.src} alt="" width={30} height={30} />
          </span>
        ))}

        {tip && hover != null && (
          <Tip
            day={tip}
            x={x(hover)}
            w={w}
            metric={metric}
            value={values[hover]}
            series={shown}
            usual={usual}
            inWindow={hover >= seam}
          />
        )}
      </div>

      {keys.length > 1 && (
        <ul className={styles.legend} aria-label="Series">
          {keys.map((s) => {
            const isOff = off.has(s.key);
            const last = !isOff && shown.length === 1;
            const total = daysIn(win.start, win.end).reduce((a, d) => a + valueOf(seriesOf(d, split).find((x) => x.key === s.key)!.totals, metric), 0);
            return (
              <li key={s.key}>
                <button
                  type="button"
                  aria-pressed={!isOff}
                  disabled={last}
                  title={last ? "The last series showing stays on" : isOff ? `Show ${s.label}` : `Hide ${s.label}`}
                  onClick={() => onHidden(isOff ? [...off].filter((k) => k !== s.key) : [...off, s.key])}
                >
                  <i style={{ background: COLOURS[s.key] }} aria-hidden />
                  {s.label}
                  <span className="num">{formatMetric(total, metric, true)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {metric === "users" && split !== "none" && <p className={styles.note}>Each series counts its own visitors, so together they can add up to more than the day&rsquo;s.</p>}
    </section>
  );
}

function Tip({ day, x, w, metric, value, series, usual, inWindow }: { day: GaDay; x: number; w: number; metric: Metric; value: Record<string, number>; series: { key: string; label: string }[]; usual: number; inWindow: boolean }) {
  const v = valueOf(day, metric);
  const posts = postsOn(day.date);
  const best = posts[0];
  const who = best && ROSTER.find((c) => c.id === best.creatorId);
  const vs = usual ? ((v - usual) / usual) * 100 : 0;
  const left = Math.min(Math.max(x - 120, 8), w - 248);
  return (
    <div className={styles.tip} style={{ left }} role="status">
      <p className={styles.tipDate}>
        {dayLabel(day.date, true)}
        {!day.settled && <span>{day.partial ? "Today so far" : "Provisional"}</span>}
      </p>
      <p className={styles.tipValue}>
        <strong className="num">{formatMetric(v, metric)}</strong> {metricWord(metric, v)}
      </p>
      {day.inCampaign && Math.abs(vs) >= 1 && (
        <p className={styles.tipVs} data-up={vs > 0 || undefined}>
          {vs > 0 ? "+" : "−"}
          {Math.abs(Math.round(vs))}% on a usual day before 8x
        </p>
      )}
      {!day.inCampaign && <p className={styles.tipVs}>Before 8x</p>}
      {series.length > 1 && (
        <ul className={styles.tipSeries}>
          {series
            .slice()
            .sort((a, b) => value[b.key] - value[a.key])
            .slice(0, 4)
            .map((s) => (
              <li key={s.key}>
                <i style={{ background: COLOURS[s.key] }} />
                {s.label}
                <span className="num">{formatMetric(value[s.key], metric, true)}</span>
              </li>
            ))}
        </ul>
      )}
      {posts.length > 0 && (
        <p className={styles.tipPosts} data-dim={!inWindow || undefined}>
          {who?.avatar && <img src={who.avatar} alt="" width={22} height={22} />}
          <span>
            {posts.length} {posts.length === 1 ? "post" : "posts"} went out
            {best && `, ${who?.name.split(" ")[0] ?? "the best"}'s at ${compact(best.views)}`}
          </span>
        </p>
      )}
    </div>
  );
}
