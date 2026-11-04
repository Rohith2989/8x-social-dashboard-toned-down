"use client";

import { useArrived } from "../ui/arrival";
import styles from "./bits.module.css";

/* Small parts the Creators page shares. */

// the letters a search matched, marked in the name
export function Marked({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i").toLowerCase();
  const at = fold(text).indexOf(fold(q));
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <mark className={styles.mark}>{text.slice(at, at + q.length)}</mark>
      {text.slice(at + q.length)}
    </>
  );
}

// the last fourteen days as columns of fine dots: lit to the day's share of their best day, ghost where nothing went
// out (kit: dot columns, the dot never changes size)
export function Spark({ daily, rows = 4, tone = "paper" }: { daily: number[]; rows?: number; tone?: "paper" | "ink" }) {
  const on = useArrived();
  const max = Math.max(...daily, 1);
  return (
    <span className={`${styles.spark} ${styles[tone]}`} style={{ "--rows": rows } as React.CSSProperties} role="img" aria-label="Views over the last 14 days">
      {daily.map((v, d) => {
        const lit = v > 0 ? Math.max(1, Math.round((v / max) * rows)) : 0;
        return (
          <span key={d} className={styles.col}>
            {Array.from({ length: rows }, (_, k) => (
              <i key={k} className={k < lit && on ? styles.lit : undefined} style={{ transitionDelay: `${d * 30 + k * 20}ms` }} />
            ))}
          </span>
        );
      })}
    </span>
  );
}
