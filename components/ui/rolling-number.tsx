"use client";

import { useArrived } from "./arrival";
import styles from "./rolling-number.module.css";

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/*
  A number rolls to its value, digit by digit, when its card arrives (kit: numbers roll, Counting Number), and rolls
  again when the value changes. Each digit is a column that slides to its place; the right-hand digits move first, so
  it reads like a counter settling. The text itself is there for assistive tech; the columns are decoration.
*/
export function RollingNumber({ value, className }: { value: string; className?: string }) {
  const on = useArrived();
  const chars = value.split("");
  return (
    <span className={`${styles.number} ${className ?? ""}`}>
      <span className="sr-only">{value}</span>
      <span aria-hidden className={styles.chars}>
        {chars.map((ch, i) => {
          if (!/\d/.test(ch)) {
            return (
              <span key={`${i}-${ch}`} className={styles.sep}>
                {ch}
              </span>
            );
          }
          const d = on ? Number(ch) : 0;
          return (
            <span key={`${i}-${chars.length}`} className={styles.col}>
              <span
                className={styles.strip}
                style={{ transform: `translateY(${-d * 10}%)`, transitionDelay: `${(chars.length - i) * 45}ms` }}
              >
                {DIGITS.map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
