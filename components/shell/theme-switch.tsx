"use client";

import { useRef } from "react";
import { setTheme, useTheme } from "./theme";
import styles from "./theme-switch.module.css";

/*
  The switch between Daybreak and Night, small, above Settings: a toggle whose track is a sliver of 8x's sky. By day
  a clear blue with the sun as its knob; at night the vertical's deep navy with a few stars, the knob now the moon.
  The page's new look spreads out from it. Its look follows <html data-theme> from the first paint; to a screen
  reader it is a switch, "Night mode".
*/

// where the stars come out: x and y in % of the track, size in px
const STARS: [number, number, number][] = [
  [16, 30, 1.4],
  [30, 64, 1],
  [42, 26, 1.1],
  [24, 46, 0.8],
];

export function ThemeSwitch() {
  const night = useTheme() === "dark";
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={night}
      aria-label="Night mode"
      title={night ? "Back to Daybreak" : "Switch to Night"}
      className={styles.switch}
      onClick={() => setTheme(night ? "light" : "dark", ref.current?.getBoundingClientRect())}
    >
      <span className={styles.track} aria-hidden>
        <span className={styles.night} />
        <span className={styles.stars}>
          {STARS.map(([x, y, s], i) => (
            <i key={i} style={{ left: `${x}%`, top: `${y}%`, width: s * 2, height: s * 2, "--i": i } as React.CSSProperties} />
          ))}
        </span>
        <span className={styles.cloud} />
        <span className={styles.orb}>
          <span className={styles.sun} />
          <span className={styles.moon}>
            <i />
            <i />
          </span>
        </span>
      </span>
    </button>
  );
}
