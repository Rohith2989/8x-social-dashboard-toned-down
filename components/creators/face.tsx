import type { RosterCreator } from "@/lib/roster";
import styles from "./face.module.css";

/*
  A creator's face. The real creators by their photo; the invented ones by their initials on the vertical's colour.
  With `ring` it wears its status: the vertical colour for active, amber for idle, grey for dropped; a flag adds a
  small red flag at its foot. A dropped creator's face is greyed.
*/

export function Face({
  creator,
  size = 40,
  ring,
  tone = "paper",
}: {
  creator: RosterCreator;
  size?: number;
  ring?: boolean;
  tone?: "paper" | "deep";
}) {
  return (
    <span
      className={`${styles.face} ${ring ? styles.ring : ""} ${styles[tone]}`}
      data-status={creator.status}
      data-flagged={!!creator.flag}
      style={{ "--size": `${size}px` } as React.CSSProperties}
    >
      {creator.avatar ? (
        <img src={creator.avatar} alt="" width={size} height={size} loading="lazy" />
      ) : (
        <span className={styles.initials} style={{ fontSize: Math.max(10.5, size * 0.38) }}>
          {creator.initials}
        </span>
      )}
      {ring && creator.flag && (
        <span className={styles.flag} aria-hidden>
          <svg viewBox="0 0 24 24">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <path d="M4 22v-7" />
          </svg>
        </span>
      )}
    </span>
  );
}
