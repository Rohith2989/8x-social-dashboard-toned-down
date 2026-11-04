"use client";

import { ArrivalProvider, useArrival } from "./arrival";
import styles from "./card.module.css";

/*
  A card holds one thing (soft white, radius 26, as the Halo Lab references draw them). It arrives the brand's way:
  its shell settles in, then its content resolves behind a band of fine dots sweeping left to right, the leading
  edge of the brand's current.
  `order` staggers cards in reading order, top left first. Tones: paper (default), ink, aura (the vertical's colour),
  pastel (the vertical's palest tint).
*/

export function Card({
  tone = "paper",
  order = 0,
  className,
  children,
  label,
  id,
  tint,
}: {
  tone?: "paper" | "ink" | "aura" | "pastel";
  // a paper card's subtle colour of its own (globals.css)
  tint?: "sky" | "lilac" | "blue" | "pearl";
  order?: number;
  className?: string;
  children: React.ReactNode;
  label?: string;
  id?: string;
}) {
  const [ref, state, setState] = useArrival<HTMLElement>();
  return (
    <section
      ref={ref}
      id={id}
      aria-label={label}
      className={`${styles.card} ${styles[tone]} ${className ?? ""}`}
      data-arrive={state}
      data-tint={tint}
      style={{ "--order": order } as React.CSSProperties}
    >
      <ArrivalProvider value={state}>
        <div className={styles.body} onAnimationEnd={(e) => e.target === e.currentTarget && setState("done")}>
          {children}
        </div>
      </ArrivalProvider>
      {state !== "done" && <i className={styles.resolve} aria-hidden />}
    </section>
  );
}
