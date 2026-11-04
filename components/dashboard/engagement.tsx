"use client";

import Link from "next/link";
import { DAYS } from "@/lib/days";
import { totals, weekChange } from "@/lib/metrics";
import { compact } from "@/lib/format";
import { useArrival, ArrivalProvider } from "../ui/arrival";
import { Icon, type IconName } from "../ui/icon";
import { RollingNumber } from "../ui/rolling-number";
import { usePlanState, waitingIn } from "../plan/store";
import styles from "./engagement.module.css";

/*
  Engagement, as a strip of warm stone with the grain on it (Halo Lab's): this week's likes, comments and shares and
  the engagement rate, each on its own tile with its icon on a square of the vertical colour sitting half above it,
  the week's direction as a small arrow. The last card is the thing waiting on the brand, the scripts to review on the
  Content plan (counted live, so approving one there takes it off here), in the vertical's light with Social's own
  bubble on it; it breaks out past the strip's edge, and opens the plan.
*/

export function Engagement() {
  const [ref, state] = useArrival<HTMLElement>(0.25);
  const week = totals(DAYS.slice(-7));
  const change = weekChange();
  const waiting = waitingIn(usePlanState()).length;
  const tiles: { label: string; value: string; up: boolean; by: string; icon: IconName }[] = [
    { label: "Likes", value: compact(week.likes), up: change.likes >= 0, by: `${Math.abs(change.likes).toFixed(1)}%`, icon: "heart" },
    { label: "Comments", value: compact(week.comments), up: change.comments >= 0, by: `${Math.abs(change.comments).toFixed(1)}%`, icon: "comment" },
    { label: "Shares", value: compact(week.shares), up: change.shares >= 0, by: `${Math.abs(change.shares).toFixed(1)}%`, icon: "share" },
  ];

  return (
    <div className={styles.holder}>
      <section ref={ref} className={styles.strip} data-arrive={state} aria-labelledby="engagement-title">
        <ArrivalProvider value={state}>
          <div className={styles.intro}>
            <h2 id="engagement-title">Engagement</h2>
            <p>
              On every post, <strong>this week</strong>.
            </p>
          </div>

          <ul className={styles.tiles}>
            {tiles.map((t, i) => (
              <li key={t.label} className={styles.tile} style={{ "--i": i } as React.CSSProperties} data-anim-host>
                <span className={styles.square} aria-hidden>
                  <Icon name={t.icon} size={20} stroke={1.8} />
                </span>
                <span className={styles.label}>{t.label}</span>
                <span className={styles.value}>
                  <RollingNumber value={t.value} className="num" />
                  <span className={`${styles.arrow} ${t.up ? styles.up : styles.down}`} title={`${t.up ? "Up" : "Down"} ${t.by} on the week before`}>
                    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                      <path d={t.up ? "M7 12V2M3 6l4-4 4 4" : "M7 2v10M3 8l4 4 4-4"} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="sr-only">
                      {t.up ? "up" : "down"} {t.by} on the week before
                    </span>
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <Link href="/plan" className={styles.ask} data-anim-host>
            <img src="/media/social-bubble.webp" alt="" width={120} height={120} className={styles.bubble} />
            <strong>
              {waiting ? (
                <>
                  {waiting} new {waiting === 1 ? "script" : "scripts"}
                  <br />
                  to review
                </>
              ) : (
                <>
                  The plan is
                  <br />
                  all reviewed
                </>
              )}
            </strong>
            <span className={styles.go} aria-hidden>
              <Icon name="arrow" size={18} stroke={1.8} />
            </span>
          </Link>
        </ArrivalProvider>
      </section>
    </div>
  );
}
