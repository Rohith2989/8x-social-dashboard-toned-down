"use client";

import { STATUS_LABELS, FLAG_REASONS, since, stamp, type RosterCreator } from "@/lib/roster";
import { compact, day } from "@/lib/format";
import { useArrival, ArrivalProvider } from "../ui/arrival";
import { Check } from "../ui/check";
import { Icon } from "../ui/icon";
import { PlatformIcon } from "../ui/platform-icon";
import { CountryFlag } from "../ui/country-flag";
import { Face } from "./face";
import { Banner } from "./banner";
import { Marked, Spark } from "./bits";
import { useFlip } from "./flip";
import styles from "./card.module.css";

/*
  The cards view: a creator per card, as a person first (their banner, 8x's own soft lights in the vertical's colours,
  with the platforms they post on; their face in its status ring on a plate over the banner's edge; their name and
  where they are), then how they are doing (views, the average per post and the videos, a fine-dot line of their
  last fourteen days), then their best posts as small 9:16 tiles, and when they last posted.
  Hover lifts the card, lets the banner's light drift and brings up its check; pressing the card opens the creator
  on the right, and the open one stays outlined in ink. A flagged creator keeps their place, greyed, with the flag
  and its reason in red.
*/

export function CardGrid({
  list,
  q,
  selected,
  openId,
  onSelect,
  onOpen,
}: {
  list: RosterCreator[];
  q: string;
  selected: string[];
  openId: string | null;
  onSelect: (id: string, on: boolean) => void;
  onOpen: (id: string) => void;
}) {
  const grid = useFlip<HTMLUListElement>(list.map((c) => c.id).join());
  const [ref, state] = useArrival<HTMLDivElement>(0.05);
  return (
    <div ref={ref} data-arrive={state}>
      <ArrivalProvider value={state}>
        <ul ref={grid} className={styles.grid} data-selecting={selected.length > 0}>
          {list.map((c, i) => (
            <li key={c.id} data-flip={c.id} style={{ "--i": Math.min(i, 12) } as React.CSSProperties}>
              <CreatorCard creator={c} q={q} selected={selected.includes(c.id)} open={openId === c.id} onSelect={(on) => onSelect(c.id, on)} onOpen={() => onOpen(c.id)} />
            </li>
          ))}
        </ul>
      </ArrivalProvider>
    </div>
  );
}

function CreatorCard({
  creator: c,
  q,
  selected,
  open,
  onSelect,
  onOpen,
}: {
  creator: RosterCreator;
  q: string;
  selected: boolean;
  open: boolean;
  onSelect: (on: boolean) => void;
  onOpen: () => void;
}) {
  const reasons = c.flag?.reasons.map((r) => FLAG_REASONS.find((x) => x.id === r)?.label).join(", ");
  return (
    <article
      className={`${styles.card} ${open ? styles.open : ""} ${selected ? styles.selected : ""}`}
      data-status={c.status}
      data-flagged={!!c.flag}
      role="button"
      tabIndex={0}
      aria-pressed={open}
      aria-label={`${c.name}, ${STATUS_LABELS[c.status].toLowerCase()}, ${compact(c.views)} views. Open`}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <Banner creator={c} className={styles.banner}>
        <Check checked={selected} onChange={onSelect} label={`Select ${c.name}`} hideLabel tone="glass" className={styles.check} />
        <span className={styles.platforms}>
          {c.accounts.map((a) => (
            <PlatformIcon key={a.id} platform={a.platform} size={22} />
          ))}
        </span>
      </Banner>

      <div className={styles.person}>
        <span className={styles.plate}>
          <Face creator={c} size={72} ring />
        </span>
        <h3 className={styles.name}>
          <Marked text={c.name} q={q} />
        </h3>
        <p className={styles.where}>
          <CountryFlag country={c.country} size={18} />
          {c.country.name}
        </p>
      </div>

      <div className={styles.figures}>
        <div className={styles.views}>
          <span className="num">{compact(c.views)}</span>
          <span>views</span>
        </div>
        <Spark daily={c.daily} />
      </div>
      <p className={styles.sub}>
        <span>
          <span className="mono">{compact(c.avgPerPost)}</span> avg / post
        </span>
        <i aria-hidden />
        <span>
          <span className="mono">{c.videos}</span> videos
        </span>
      </p>

      <div className={styles.posts} aria-hidden>
        {c.posts.length
          ? c.posts.map((p) => (
              <span key={p.id} className={styles.tile}>
                <img src={p.poster} alt="" loading="lazy" />
              </span>
            ))
          : c.accounts.concat(c.accounts).slice(0, 3).map((a, i) => (
              <span key={i} className={`${styles.tile} ${styles.blank}`}>
                <PlatformIcon platform={a.platform} size={18} />
              </span>
            ))}
      </div>

      <p className={styles.foot}>
        {c.flag ? (
          <span className={styles.flagLine}>
            <Icon name="flag" size={15} stroke={2} />
            Flagged · {reasons}
          </span>
        ) : c.status === "dropped" ? (
          <span className={styles.state}>
            <i data-status="dropped" />
            Dropped{c.endedAt ? ` ${day(c.endedAt)}` : ""}
          </span>
        ) : (
          <span className={styles.state} title={c.lastPostAt ? stamp(c.lastPostAt) : undefined}>
            <i data-status={c.status} />
            {STATUS_LABELS[c.status]} · {since(c.lastPostAt)}
          </span>
        )}
        <Icon name="right" size={16} />
      </p>
    </article>
  );
}
