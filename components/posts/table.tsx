"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PLATFORM_LABELS } from "@/lib/demo";
import { stamp } from "@/lib/roster";
import { compact, day as dayLabel, full } from "@/lib/format";
import { reasonLabel, type FeedPost, type PostSort } from "@/lib/posts";
import { Check } from "../ui/check";
import { Icon } from "../ui/icon";
import { PlatformIcon } from "../ui/platform-icon";
import { CountryFlag } from "../ui/country-flag";
import { Marked } from "../creators/bits";
import { useFlip } from "../creators/flip";
import { Mark } from "./mark";
import base from "../creators/table.module.css";
import styles from "./table.module.css";

/*
  The table (was: the post table), for reading figures across many posts. The product's columns in its order, two of
  them folded into the cells they belong to so all of it fits the tray: select; the post (its poster, caption,
  handle and platform); posted; views, with the milestone it passed beside the number it grades (the product's
  performance column); likes, comments, shares, engagement rate, status, spark code, country. A sortable head cycles
  highest, lowest, then back to the newest first (words A to Z first), its arrow turning, and the rows glide to their
  new places. The poster opens the post on
  the right; the handle opens the creator on Creators. A deleted or flagged row dims, all but its status, which is
  the explanation. A day taken to from the feed is tinted, its first row brought to the top. Fifty rows at a time.
  Narrow, the table keeps the columns that matter most.
*/

type Col = { id: string; label: string; sort?: PostSort; num?: boolean; hide?: "lg" | "md" | "sm" | "xs"; text?: boolean };

const COLUMNS: Col[] = [
  { id: "posted", label: "Posted", sort: "posted", hide: "sm" },
  { id: "views", label: "Views", sort: "views", num: true },
  { id: "likes", label: "Likes", sort: "likes", num: true, hide: "md" },
  { id: "comments", label: "Comments", sort: "comments", num: true, hide: "md" },
  { id: "shares", label: "Shares", sort: "shares", num: true, hide: "lg" },
  { id: "engagement", label: "Eng. rate", sort: "engagement", num: true, hide: "lg" },
  { id: "status", label: "Status", sort: "status", text: true, hide: "xs" },
  { id: "sparkCode", label: "Spark code", sort: "sparkCode", text: true, hide: "lg" },
  { id: "country", label: "Country", sort: "country", text: true, hide: "lg" },
];

export function PostTable({
  rows,
  shown,
  at,
  q,
  sort,
  dir,
  selected,
  openId,
  onSort,
  onSelect,
  onSelectAll,
  onOpen,
  onMore,
}: {
  rows: FeedPost[];
  shown: number;
  at: string | null;
  q: string;
  sort: PostSort | null;
  dir: "desc" | "asc";
  selected: string[];
  openId: string | null;
  onSort: (sort: PostSort | null, dir: "desc" | "asc" | null) => void;
  onSelect: (id: string, on: boolean) => void;
  onSelectAll: (ids: string[], on: boolean) => void;
  onOpen: (id: string) => void;
  onMore: () => void;
  onCopied?: () => void;
}) {
  // a day taken to from the feed is always on the page, however far down it starts
  const lastOfDay = at ? rows.reduce((a, p, i) => (p.postedAt.slice(0, 10) === at ? i : a), -1) : -1;
  const limit = Math.max(shown, lastOfDay + 1);
  const page = rows.slice(0, limit);
  const body = useFlip<HTMLTableSectionElement>(page.map((p) => p.id).join());
  const ids = page.map((p) => p.id);
  const all = ids.length > 0 && ids.every((id) => selected.includes(id));
  const some = ids.some((id) => selected.includes(id));
  const firstOfDay = at ? page.findIndex((p) => p.postedAt.slice(0, 10) === at) : -1;
  const anchor = useRef<HTMLTableRowElement>(null);

  // the day taken to comes to the top of the tray
  useEffect(() => {
    if (at) anchor.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [at]);

  // numbers and dates highest first, words A to Z first; then the other way; then back to the newest first
  const cycle = (c: Col) => {
    const firstDir = c.text ? "asc" : "desc";
    if (sort !== c.sort) onSort(c.sort ?? null, firstDir);
    else if (dir === firstDir) onSort(c.sort, firstDir === "desc" ? "asc" : "desc");
    else onSort(null, null);
  };
  const ariaSort = (key?: PostSort) => (key && sort === key ? (dir === "desc" ? "descending" : "ascending") : undefined);

  return (
    <>
      <div className={`${base.wrap} ${styles.wrap}`}>
        <table className={base.table}>
          <thead>
            <tr>
              <th className={base.pick}>
                <Check checked={all} mixed={some} onChange={(on) => onSelectAll(ids, on)} label="Select every post shown" hideLabel />
              </th>
              <th className={styles.post} aria-sort={ariaSort("account")}>
                <Head label="Post" active={sort === "account"} dir={dir} onClick={() => cycle({ id: "account", label: "Post", sort: "account", text: true })} />
              </th>
              {COLUMNS.map((c) => (
                <th key={c.id} className={`${c.num ? base.num : ""} ${c.hide ? styles[c.hide] : ""}`} aria-sort={ariaSort(c.sort)}>
                  {c.sort ? <Head label={c.label} active={sort === c.sort} dir={dir} onClick={() => cycle(c)} num={c.num} /> : <span className={base.plain}>{c.label}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody ref={body}>
            {page.map((p, i) => (
              <Row
                key={p.id}
                post={p}
                q={q}
                selected={selected.includes(p.id)}
                open={openId === p.id}
                tinted={!!at && p.postedAt.slice(0, 10) === at}
                rowRef={i === firstOfDay ? anchor : undefined}
                onSelect={(on) => onSelect(p.id, on)}
                onOpen={() => onOpen(p.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > limit && (
        <button type="button" className={styles.more} onClick={onMore} data-anim-host>
          <span>
            Show the next {Math.min(50, rows.length - limit)}
            <em>
              {limit} of {rows.length} shown
            </em>
          </span>
          <Icon name="down" size={18} />
        </button>
      )}
    </>
  );
}

function Head({ label, active, dir, onClick, num }: { label: string; active: boolean; dir: "desc" | "asc"; onClick: () => void; num?: boolean }) {
  return (
    <button type="button" className={`${base.head} ${active ? base.active : ""} ${num ? base.headNum : ""}`} onClick={onClick} data-dir={dir} title={active ? "Press for the other way, then for the newest first" : "Sort by this"}>
      {label}
      <Icon name="arrow-down" size={14} stroke={2} />
    </button>
  );
}

function Row({
  post: p,
  q,
  selected,
  open,
  tinted,
  rowRef,
  onSelect,
  onOpen,
}: {
  post: FeedPost;
  q: string;
  selected: boolean;
  open: boolean;
  tinted: boolean;
  rowRef?: React.Ref<HTMLTableRowElement>;
  onSelect: (on: boolean) => void;
  onOpen: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const dim = p.status === "deleted" || !!p.flag;

  const copy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!p.sparkCode) return;
    try {
      await navigator.clipboard.writeText(p.sparkCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // the browser said no; the code stays on its title for copying by hand
    }
  };

  return (
    <tr
      ref={rowRef}
      data-flip={p.id}
      className={`${base.row} ${styles.row} ${selected ? base.selected : ""} ${open ? base.open : ""} ${tinted ? styles.tinted : ""}`}
      data-dim={dim || undefined}
      onClick={onOpen}
    >
      <td className={base.pick} onClick={(e) => e.stopPropagation()}>
        <Check checked={selected} onChange={onSelect} label={`Select @${p.handle}'s post`} hideLabel />
      </td>
      <td className={styles.post}>
        <span className={styles.postCell}>
          <button type="button" className={styles.thumb} onClick={onOpen} aria-label={`Open @${p.handle}'s post`} title={p.video ? "Open and play this post" : "Open this post"}>
            {p.poster ? <img src={p.poster} alt="" loading="lazy" /> : <PlatformIcon platform={p.platform} size={16} />}
            {p.video && (
              <span className={styles.play} aria-hidden>
                <Icon name="play" size={9} stroke={0} />
              </span>
            )}
          </button>
          <span className={styles.text}>
            <span className={styles.caption} title={p.caption}>
              <Marked text={p.caption} q={q} />
            </span>
            <span className={styles.byline}>
              <PlatformIcon platform={p.platform} size={16} />
              <span className="sr-only">{PLATFORM_LABELS[p.platform]}, </span>
              <Link className={styles.handle} href={`/creators?open=${p.creatorId}`} onClick={(e) => e.stopPropagation()} title={`Open ${p.creator.name} on Creators`}>
                @<Marked text={p.handle} q={q.replace(/^@/, "")} />
              </Link>
            </span>
          </span>
        </span>
      </td>
      <td className={`${styles.sm} ${styles.when}`} title={stamp(p.postedAt)}>
        <span>{dayLabel(p.postedAt.slice(0, 10))}</span>
        <span className="mono">{p.postedAt.slice(11, 16)}</span>
      </td>
      <td className={`${base.num} ${base.strong}`} title={full(p.views)}>
        <span className={styles.views}>
          <Mark views={p.views} size={16} />
          {compact(p.views)}
        </span>
      </td>
      <td className={`${base.num} ${styles.md}`} title={full(p.likes)}>
        {compact(p.likes)}
      </td>
      <td className={`${base.num} ${styles.md}`} title={full(p.comments)}>
        {compact(p.comments)}
      </td>
      <td className={`${base.num} ${styles.lg} ${p.shares == null ? styles.na : ""}`} title={p.shares == null ? "Instagram has not reported this post's shares yet" : full(p.shares)}>
        {p.shares == null ? "N/A" : compact(p.shares)}
      </td>
      <td className={`${base.num} ${styles.lg}`}>{p.engagement.toFixed(1)}%</td>
      <td className={`${styles.status} ${styles.xs}`}>
        <span className={styles.state} data-status={p.status}>
          <i />
          {p.status === "deleted" ? `Deleted ${p.deletedAt ? dayLabel(p.deletedAt.slice(0, 10)) : ""}` : "Live"}
        </span>
        {p.flag && (
          <span className={styles.flag}>
            <Icon name="flag" size={13} stroke={2} />
            Flagged · {reasonLabel(p)}
          </span>
        )}
      </td>
      <td className={styles.lg}>
        {p.sparkCode ? (
          <button type="button" className={styles.spark} data-copied={copied || undefined} onClick={copy} title={`${p.sparkCode}: press to copy`} data-anim-host>
            <span className="mono">{copied ? "Copied" : `${p.sparkCode.slice(0, 5)}…`}</span>
            {copied ? (
              <svg viewBox="0 0 20 20" className={styles.copiedTick} aria-hidden>
                <path d="m5.5 10.2 3 3 6-6.4" />
              </svg>
            ) : (
              <Icon name="copy" size={14} />
            )}
          </button>
        ) : (
          <span className={styles.none} title={p.platform === "tiktok" ? "The creator has not shared this post's spark code yet" : "Spark codes are TikTok's"}>
            {p.platform === "tiktok" ? "Not yet" : "–"}
          </span>
        )}
      </td>
      <td className={styles.lg}>
        <span className={styles.country} title={p.creator.country.name}>
          <CountryFlag country={p.creator.country} size={18} />
          <span className="mono">{p.creator.country.code}</span>
        </span>
      </td>
    </tr>
  );
}
