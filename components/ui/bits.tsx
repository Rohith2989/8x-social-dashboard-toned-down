"use client";

import { Icon } from "./icon";
import styles from "./bits.module.css";

/* Small parts the cards share. */

// a change as an arrow and a figure, never a capsule (no chips); up reads as good, down as worth a look
export function Change({ value, unit = "%", digits = 1, tone = "paper", caption }: { value: number; unit?: string; digits?: number; tone?: "paper" | "ink" | "aura"; caption?: string }) {
  const up = value >= 0;
  const figure = `${Math.abs(value).toFixed(digits)}${unit === "pts" ? " pts" : unit}`;
  return (
    <span className={`${styles.change} ${styles[tone]} ${up ? styles.up : styles.down}`}>
      <Icon name={up ? "up" : "fall"} size={18} stroke={1.75} />
      <span className={styles.figure}>{figure}</span>
      {caption && <span className={styles.caption}>{caption}</span>}
      <span className="sr-only">{up ? "up" : "down"}</span>
    </span>
  );
}

export function Avatar({ src, initials, size = 32, ring, className }: { src?: string; initials?: string; size?: number; ring?: string; className?: string }) {
  return (
    <span className={`${styles.avatar} ${className ?? ""}`} style={{ width: size, height: size, "--ring": ring } as React.CSSProperties}>
      {src ? <img src={src} alt="" width={size} height={size} loading="lazy" /> : <span className={styles.initials} style={{ fontSize: size * 0.38 }}>{initials}</span>}
    </span>
  );
}
