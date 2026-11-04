import type { PostsQuery } from "@/lib/posts";
import { Icon } from "../ui/icon";
import { dayName } from "./toolbar";
import styles from "./empty.module.css";

/*
  When no post matches: why, and the one thing to do about it, over three empty posters outlined in fine dots, the
  way a day to come is drawn on the calendar (was: one line, "No posts match these filters.").
*/

export function NoPosts({ query, onClear }: { query: PostsQuery; onClear: () => void }) {
  return (
    <div className={styles.empty}>
      <span className={styles.fan} aria-hidden>
        {[0, 1, 2].map((i) => (
          <svg key={i} viewBox="0 0 54 96" style={{ "--i": i } as React.CSSProperties}>
            <rect x="1.5" y="1.5" width="51" height="93" rx="10" />
          </svg>
        ))}
        <span className={styles.center}>
          <Icon name="search" size={24} />
        </span>
      </span>
      <h3>
        {query.q ? (
          <>No posts match &lsquo;{query.q}&rsquo;</>
        ) : query.day ? (
          <>Nothing went out on {dayName(query.day)} with these filters</>
        ) : (
          "No posts match these filters"
        )}
      </h3>
      <p>Try another word or @handle, or take a filter off.</p>
      <button type="button" className={styles.action} onClick={onClear}>
        Clear the search and filters
      </button>
    </div>
  );
}
