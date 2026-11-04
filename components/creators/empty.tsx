import { MANAGER } from "@/lib/demo";
import { ACTIVE_HOURS } from "@/lib/roster";
import { Icon } from "../ui/icon";
import styles from "./empty.module.css";

/*
  When the list is empty, why it is and the one thing to do about it, over the brand's ring of empty places in fine
  dots (was: three lines of text).
*/

export function Empty({ kind, q, onClear, onEveryone }: { kind: "nomatch" | "nobody" | "none"; q: string; onClear: () => void; onEveryone: () => void }) {
  const first = MANAGER.name.split(" ")[0];
  return (
    <div className={styles.empty}>
      <span className={styles.ring} aria-hidden>
        {Array.from({ length: 8 }, (_, i) => (
          <svg key={i} viewBox="0 0 30 30" style={{ "--i": i } as React.CSSProperties}>
            <circle cx="15" cy="15" r="13" />
          </svg>
        ))}
        <span className={styles.center}>
          <Icon name={kind === "nobody" ? "clock" : kind === "none" ? "join" : "search"} size={26} />
        </span>
      </span>
      {kind === "nomatch" && (
        <>
          <h3>{q ? <>No creators match &lsquo;{q}&rsquo;</> : "No creators match these filters"}</h3>
          <p>Try another name or @handle, or take a filter off.</p>
          <button type="button" className={styles.action} onClick={onClear}>
            Clear the search and filters
          </button>
        </>
      )}
      {kind === "nobody" && (
        <>
          <h3>Nobody has posted in the last {ACTIVE_HOURS / 24} days</h3>
          <p>{first} follows up with creators who go quiet. Everyone else is still on the campaign.</p>
          <button type="button" className={styles.action} onClick={onEveryone}>
            Show everyone
          </button>
        </>
      )}
      {kind === "none" && (
        <>
          <h3>{first} is casting your creators</h3>
          <p>They appear here as they join, with their accounts and their first posts.</p>
        </>
      )}
    </div>
  );
}
