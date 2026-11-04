"use client";

import { CAMPAIGN } from "@/lib/demo";
import { pace } from "@/lib/metrics";
import { Card } from "../ui/card";
import { Change } from "../ui/bits";
import { RollingNumber } from "../ui/rolling-number";
import { useArrived } from "../ui/arrival";
import styles from "./pace.module.css";

/*
  The pace against the plan, on the vertical's colour made subtle. Rings of fine dots fill clockwise from the top (the
  kit's progress, never a pie or a gauge), the posts out lit; a tick across the rings is where the plan says the
  campaign should be today, so ahead or behind reads at a glance. Beside the rings, how far ahead (or behind) it is.
*/

const RINGS = [100, 89, 78, 67];
const C = 112;

export function Pace() {
  const p = pace();
  const done = p.delivered / p.planned;
  const due = p.expected / p.planned;

  return (
    <Card tone="aura" order={0} className={styles.card} label="Pace">
      <div className={styles.head}>
        <h2>Pace</h2>
        <p>
          Day <span className="mono">{CAMPAIGN.day}</span> of <span className="mono">{CAMPAIGN.days}</span>
        </p>
      </div>

      <div className={styles.main}>
        <div className={styles.ring}>
          <svg viewBox="0 0 224 224" role="img" aria-label={`${p.delivered} of ${p.planned} posts out; the plan expects ${p.expected} by today`}>
            <Dots done={done} />
            <PlanMark due={due} />
          </svg>
          <div className={styles.center}>
            <RollingNumber value={String(p.delivered)} className={`num ${styles.big}`} />
            <span>
              of <span className="mono">{p.planned}</span> posts
            </span>
          </div>
        </div>

        <div className={styles.read}>
          <p className={styles.ahead}>
            <Change value={p.ahead} unit="" digits={0} tone="aura" />
            <span>{p.ahead >= 0 ? "posts ahead of the plan" : "posts behind the plan"}</span>
          </p>
        </div>
      </div>
    </Card>
  );
}

// where the plan says the campaign should be today: a white tick across the rings, drawn once they have filled
function PlanMark({ due }: { due: number }) {
  const on = useArrived();
  const a = -Math.PI / 2 + due * Math.PI * 2;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const at = (r: number) => ({ x: (C + r * cos).toFixed(2), y: (C + r * sin).toFixed(2) });
  const from = at(61);
  const to = at(109);
  const label = at(118);
  const anchor = Math.abs(cos) < 0.3 ? "middle" : cos < 0 ? "end" : "start";
  const dy = Math.abs(cos) < 0.3 ? (sin < 0 ? -2 : 12) : 5;
  return (
    <g className={`${styles.plan} ${on ? styles.planOn : ""}`}>
      <line className={styles.halo} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
      <text x={label.x} y={Number(label.y) + dy} textAnchor={anchor}>
        Plan
      </text>
    </g>
  );
}

function Dots({ done }: { done: number }) {
  return (
    <g>
      {RINGS.map((R, ri) => {
        const n = Math.round(R * 0.6);
        return Array.from({ length: n }, (_, i) => {
          const ang = -Math.PI / 2 + (i / n) * Math.PI * 2;
          const lit = i / n < done;
          return (
            <circle
              key={`${ri}-${i}`}
              cx={(C + R * Math.cos(ang)).toFixed(2)}
              cy={(C + R * Math.sin(ang)).toFixed(2)}
              r={lit ? 2.7 : 1.6}
              className={lit ? styles.lit : styles.ghost}
              style={{ "--o": lit ? (1 - ri * 0.15).toFixed(2) : "1", animationDelay: `${Math.round(i * 12 + ri * 50)}ms` } as React.CSSProperties}
            />
          );
        });
      })}
    </g>
  );
}
