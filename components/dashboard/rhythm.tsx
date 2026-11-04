"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CAMPAIGN, SCHEDULE } from "@/lib/demo";
import { DAYS } from "@/lib/days";
import { ROSTER } from "@/lib/roster";
import { dayPosts, dayViews } from "@/lib/metrics";
import { compact, day, weekdayOf } from "@/lib/format";
import { Card } from "../ui/card";
import { Avatar } from "../ui/bits";
import styles from "./rhythm.module.css";

/*
  The campaign as a month, small enough to read in one look: every day it has run is a low tile filled on the
  vertical's six steps by how many posts went out, graded across the campaign's own range (its quietest day to its
  busiest, which alone takes the deepest), its date on the left and its count on the right. Today is ringed in ink;
  the days to come are outlined in fine dots, one hollow dot for each post the content plan has for them. The days
  either side of the campaign are only their dates, faint, so the month reads whole. Pointing at a day lifts it and
  shows who posted; pressing it opens the feed at that day. The tiles fill in turn when the card arrives, first day
  to today.
*/

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// six steps across the campaign's own range; only the busiest day takes the sixth
const step = (posts: number, min: number, max: number) =>
  posts >= max ? 6 : 1 + Math.floor(((posts - min) / Math.max(1, max - min)) * 4.999);

export function Rhythm() {
  const start = Date.parse(CAMPAIGN.startedAt);
  const lead = (weekdayOf(CAMPAIGN.startedAt) + 6) % 7; // days from Monday to the first day
  const cells = Math.ceil((lead + CAMPAIGN.days) / 7) * 7;
  const counts = DAYS.map((d) => dayPosts(d));
  const max = Math.max(...counts);
  const min = Math.min(...counts);
  const planned = new Map(SCHEDULE.map((s) => [s.date, s.slots.length]));
  const [over, setOver] = useState<number | null>(null);
  const router = useRouter();

  return (
    <Card order={1} className={styles.card} label="Posting calendar">
      <div className={styles.head}>
        <div>
          <h2>Posting calendar</h2>
          <p>
            {day(CAMPAIGN.startedAt)} to {day(CAMPAIGN.endsAt)}
          </p>
        </div>

        <div className={styles.key} aria-hidden>
          <span className={styles.ramp}>
            <span>Fewer</span>
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <i key={s} data-step={s} />
            ))}
            <span>More</span>
          </span>
          <span className={styles.marks}>
            <i className={styles.keyToday} />
            <span>Today</span>
            <i className={styles.keyPlan} />
            <span>Planned</span>
          </span>
        </div>
      </div>

      <div className={styles.week} aria-hidden>
        {WEEK.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <ol className={styles.month} onPointerLeave={() => setOver(null)}>
        {Array.from({ length: cells }, (_, k) => {
          const i = k - lead;
          const at = new Date(start + i * 864e5);
          const iso = at.toISOString().slice(0, 10);
          const date = at.getUTCDate();

          // the days either side of the campaign: only their dates, faint
          if (i < 0 || i >= CAMPAIGN.days) {
            return (
              <li key={k} className={styles.out} aria-hidden>
                <span className={`${styles.date} mono`}>{date}</span>
              </li>
            );
          }

          const d = DAYS[i];
          const today = i === CAMPAIGN.day - 1;

          if (!d) {
            const plan = planned.get(iso) ?? 0;
            return (
              <li key={k} className={`${styles.day} ${styles.future}`} aria-label={`${day(iso, true)}: ${plan ? `${plan} planned` : "to come"}`}>
                <svg className={styles.dotted} aria-hidden>
                  <rect x="1" y="1" rx="7" />
                </svg>
                <span className={`${styles.date} mono`}>{date}</span>
                {plan > 0 && (
                  <span className={styles.slots} aria-hidden>
                    {Array.from({ length: Math.min(plan, 4) }, (_, j) => (
                      <i key={j} />
                    ))}
                  </span>
                )}
              </li>
            );
          }

          const posts = dayPosts(d);
          const s = step(posts, min, max);
          const faces = d.creators.slice(0, 3).map((id) => ROSTER.find((c) => c.id === id)).filter((c) => c != null);
          return (
            <li
              key={k}
              className={`${styles.day} ${today ? styles.today : ""}`}
              data-step={s}
              style={{ "--k": i } as React.CSSProperties}
              onPointerEnter={() => setOver(i)}
              tabIndex={0}
              role="link"
              onFocus={() => setOver(i)}
              onBlur={() => setOver(null)}
              onClick={() => router.push(`/posts?day=${iso}`)}
              onKeyDown={(e) => e.key === "Enter" && router.push(`/posts?day=${iso}`)}
              title="Open the feed at this day"
              aria-label={`${today ? "Today, " : ""}${day(iso, true)}: ${posts} posts, ${compact(dayViews(d))} views. Open the feed at this day`}
            >
              <span className={`${styles.date} mono`}>{date}</span>
              {over === i && (
                <span className={styles.pop} role="tooltip">
                  <strong>{today ? `Today, ${day(iso)}` : day(iso, true)}</strong>
                  <span className={styles.popLine}>
                    <span className="num">{posts}</span> posts, <span className="num">{compact(dayViews(d))}</span> views
                  </span>
                  <span className={styles.popFaces}>
                    {faces.map((c) => (
                      <Avatar key={c.id} src={c.avatar ?? undefined} initials={c.initials} size={26} ring="#fff" />
                    ))}
                    <span>
                      {d.creators.length} {d.creators.length === 1 ? "creator" : "creators"}
                    </span>
                  </span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
