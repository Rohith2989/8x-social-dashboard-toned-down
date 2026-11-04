import { milestoneLabel, milestoneOf } from "@/lib/posts";
import styles from "./mark.module.css";

/*
  A post's milestone, as a mark rather than a capsule (no chips): a ring of five steps, filled from the top round to
  its tier in the vertical's ramp (each step its own depth, so a higher tier reads as further round and deeper), the
  steps it has not reached in ghost. With `label` the milestone it passed sits beside it ("100K"). Under 300 views the
  ring is empty. The product's milestone ring, drawn in the brand's own way; the same five depths everywhere a tier
  is read (the feed's cards, the table, the open post, the ladder).
*/

const STEPS = 5;
const R = 7;
const C = 2 * Math.PI * R;
const GAP = 1.6;

export function Mark({ views, size = 18, label, tone = "paper" }: { views: number; size?: number; label?: boolean; tone?: "paper" | "media" }) {
  const m = milestoneOf(views);
  const tier = m?.tier ?? 0;
  const seg = C / STEPS - GAP;
  return (
    <span className={`${styles.mark} ${styles[tone]}`} title={m ? `Passed ${milestoneLabel(m)} views · tier ${tier} of 5` : "Under 300 views"}>
      <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden>
        {Array.from({ length: STEPS }, (_, i) => (
          <circle
            key={i}
            cx="10"
            cy="10"
            r={R}
            className={i < tier ? styles.on : styles.off}
            data-step={i + 1}
            strokeDasharray={`${seg} ${C - seg}`}
            strokeDashoffset={-(i * (C / STEPS)) + C / 4 - GAP / 2}
          />
        ))}
      </svg>
      {label && <span className={styles.label}>{m ? milestoneLabel(m) : "<300"}</span>}
    </span>
  );
}
