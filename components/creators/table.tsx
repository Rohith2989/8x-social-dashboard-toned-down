"use client";

import { Fragment, useState } from "react";
import { PLATFORM_LABELS } from "@/lib/demo";
import { DEFAULT_QUERY, FLAG_REASONS, STATUS_LABELS, since, stamp, type Account, type RosterCreator, type SortKey } from "@/lib/roster";
import { compact, full } from "@/lib/format";
import { Check } from "../ui/check";
import { Icon } from "../ui/icon";
import { PlatformIcon } from "../ui/platform-icon";
import { CountryFlag } from "../ui/country-flag";
import { Face } from "./face";
import { Marked } from "./bits";
import { useFlip } from "./flip";
import styles from "./table.module.css";

/*
  The table view (was: the three-level table), for reading figures across many creators. The same columns in the
  same order. A sortable head cycles highest, lowest, then back to the default, its arrow turning, and the rows glide
  to their new places. A creator opens to their accounts, indented, with the exact per-platform figures; an account
  opens to its posts as a strip of 9:16 tiles. Narrow, the table keeps the columns that matter most.
*/

const COLUMNS: { id: SortKey | "platforms" | "status" | "country"; label: string; sort?: SortKey; hide?: "md" | "sm"; num?: boolean }[] = [
  { id: "platforms", label: "Platforms", hide: "sm" },
  { id: "videos", label: "Videos", sort: "videos", num: true, hide: "sm" },
  { id: "views", label: "Views", sort: "views", num: true },
  { id: "avgPerPost", label: "Avg / post", sort: "avgPerPost", num: true, hide: "md" },
  { id: "likes", label: "Likes", sort: "likes", num: true, hide: "md" },
  { id: "comments", label: "Comments", sort: "comments", num: true, hide: "md" },
  { id: "status", label: "Status" },
  { id: "lastPost", label: "Last post", sort: "lastPost", hide: "sm" },
  { id: "country", label: "Country", hide: "md" },
];

export function RosterTable({
  list,
  q,
  selected,
  openId,
  sort,
  dir,
  onSort,
  onSelect,
  onSelectAll,
  onOpen,
}: {
  list: RosterCreator[];
  q: string;
  selected: string[];
  openId: string | null;
  sort: SortKey;
  dir: "desc" | "asc";
  onSort: (sort: SortKey | null, dir: "desc" | "asc" | null) => void;
  onSelect: (id: string, on: boolean) => void;
  onSelectAll: (on: boolean) => void;
  onOpen: (id: string) => void;
}) {
  const body = useFlip<HTMLTableSectionElement>(list.map((c) => c.id).join());
  const [openRows, setOpenRows] = useState<string[]>([]);
  const [openAccounts, setOpenAccounts] = useState<string[]>([]);
  const all = list.length > 0 && list.every((c) => selected.includes(c.id));
  const some = list.some((c) => selected.includes(c.id));

  // highest, lowest, then back to the page's default order
  const cycle = (key: SortKey) => {
    if (sort !== key) onSort(key, "desc");
    else if (dir === "desc") onSort(key, "asc");
    else onSort(DEFAULT_QUERY.sort, null);
  };

  const flip = (ids: string[], id: string) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
  const ariaSort = (key?: SortKey) => (key && sort === key ? (dir === "desc" ? "descending" : "ascending") : undefined);

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.pick}>
              <Check checked={all} mixed={some} onChange={onSelectAll} label="Select every creator shown" hideLabel />
            </th>
            <th className={styles.who} aria-sort={ariaSort("name")}>
              <Head label="Creator" active={sort === "name"} dir={dir} onClick={() => cycle("name")} />
            </th>
            {COLUMNS.map((col) => (
              <th key={col.id} className={`${col.num ? styles.num : ""} ${col.hide ? styles[col.hide] : ""}`} aria-sort={ariaSort(col.sort)}>
                {col.sort ? <Head label={col.label} active={sort === col.sort} dir={dir} onClick={() => cycle(col.sort!)} num={col.num} /> : <span className={styles.plain}>{col.label}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody ref={body}>
          {list.map((c) => {
            const expanded = openRows.includes(c.id);
            return (
              <Fragment key={c.id}>
                <tr
                  data-flip={c.id}
                  className={`${styles.row} ${selected.includes(c.id) ? styles.selected : ""} ${openId === c.id ? styles.open : ""}`}
                  data-flagged={!!c.flag}
                  data-status={c.status}
                  onClick={() => onOpen(c.id)}
                >
                  <td className={styles.pick} onClick={(e) => e.stopPropagation()}>
                    <Check checked={selected.includes(c.id)} onChange={(on) => onSelect(c.id, on)} label={`Select ${c.name}`} hideLabel />
                  </td>
                  <td className={styles.who}>
                    <span className={styles.person}>
                      <button
                        type="button"
                        className={styles.caret}
                        aria-expanded={expanded}
                        aria-label={`${expanded ? "Hide" : "Show"} ${c.name}'s accounts`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenRows((r) => flip(r, c.id));
                        }}
                      >
                        <Icon name="right" size={16} stroke={2} />
                      </button>
                      <Face creator={c} size={38} ring />
                      <span className={styles.names}>
                        <button type="button" className={styles.name} onClick={() => onOpen(c.id)}>
                          <Marked text={c.name} q={q} />
                        </button>
                        <span className={styles.accounts}>
                          {c.accounts.length} {c.accounts.length === 1 ? "account" : "accounts"}
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className={styles.sm}>
                    <span className={styles.marks}>
                      {c.accounts.map((a) => (
                        <PlatformIcon key={a.id} platform={a.platform} size={22} />
                      ))}
                    </span>
                  </td>
                  <td className={`${styles.num} ${styles.sm}`}>{c.videos}</td>
                  <td className={`${styles.num} ${styles.strong}`} title={full(c.views)}>
                    {compact(c.views)}
                  </td>
                  <td className={`${styles.num} ${styles.md}`}>{compact(c.avgPerPost)}</td>
                  <td className={`${styles.num} ${styles.md}`}>{compact(c.likes)}</td>
                  <td className={`${styles.num} ${styles.md}`}>{compact(c.comments)}</td>
                  <td>
                    <span className={styles.status}>
                      <span className={styles.state} data-status={c.status}>
                        <i />
                        {STATUS_LABELS[c.status]}
                      </span>
                      {c.flag && (
                        <span className={styles.flag}>
                          <Icon name="flag" size={13} stroke={2} />
                          {c.flag.reasons.map((r) => FLAG_REASONS.find((x) => x.id === r)?.label).join(", ")}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className={styles.sm} title={c.lastPostAt ? stamp(c.lastPostAt) : undefined}>
                    <span className={styles.muted}>{since(c.lastPostAt)}</span>
                  </td>
                  <td className={styles.md}>
                    <span className={styles.country}>
                      <CountryFlag country={c.country} size={20} />
                      {c.country.name}
                    </span>
                  </td>
                </tr>
                {expanded &&
                  c.accounts.map((a) => (
                    <AccountRows
                      key={a.id}
                      account={a}
                      creator={c}
                      open={openAccounts.includes(a.id)}
                      onToggle={() => setOpenAccounts((o) => flip(o, a.id))}
                    />
                  ))}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Head({ label, active, dir, onClick, num }: { label: string; active: boolean; dir: "desc" | "asc"; onClick: () => void; num?: boolean }) {
  return (
    <button
      type="button"
      className={`${styles.head} ${active ? styles.active : ""} ${num ? styles.headNum : ""}`}
      onClick={onClick}
      title={active ? (dir === "desc" ? "Highest first; next, lowest first" : "Lowest first; next, back to the default") : "Sort, highest first"}
      data-dir={dir}
    >
      {label}
      <Icon name="arrow-down" size={14} stroke={2} />
    </button>
  );
}

// an account under its creator, with the exact figures; open, its posts as tiles
function AccountRows({ account: a, creator, open, onToggle }: { account: Account; creator: RosterCreator; open: boolean; onToggle: () => void }) {
  const posts = creator.posts.filter((p) => p.platform === a.platform);
  return (
    <>
      <tr className={styles.account}>
        <td />
        <td className={styles.who}>
          <span className={styles.accountWho}>
            <button type="button" className={styles.caret} aria-expanded={open} aria-label={`${open ? "Hide" : "Show"} posts by @${a.handle}`} onClick={onToggle}>
              <Icon name="right" size={16} stroke={2} />
            </button>
            <PlatformIcon platform={a.platform} size={22} />
            <span className={styles.handle}>@{a.handle}</span>
            <span className={styles.followers}>{compact(a.followers)} followers</span>
          </span>
        </td>
        <td className={styles.sm}>
          <span className={styles.muted}>{PLATFORM_LABELS[a.platform]}</span>
        </td>
        <td className={`${styles.num} ${styles.sm}`}>{a.videos}</td>
        <td className={styles.num}>{compact(a.views)}</td>
        <td className={`${styles.num} ${styles.md}`}>{compact(Math.round(a.views / Math.max(1, a.videos)))}</td>
        <td className={`${styles.num} ${styles.md}`}>{compact(a.likes)}</td>
        <td className={`${styles.num} ${styles.md}`}>{compact(a.comments)}</td>
        <td />
        <td className={styles.sm}>
          <span className={styles.muted}>{since(a.lastPostAt)}</span>
        </td>
        <td className={styles.md} />
      </tr>
      {open && (
        <tr className={styles.postsRow}>
          <td />
          <td colSpan={10}>
            {posts.length ? (
              <span className={styles.posts}>
                {posts.map((p) => (
                  <span key={p.id} className={styles.post}>
                    <img src={p.poster} alt="" loading="lazy" />
                    <span className={styles.postViews}>{compact(p.views)}</span>
                  </span>
                ))}
              </span>
            ) : (
              <span className={styles.muted}>No previews of these posts in the sample.</span>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
