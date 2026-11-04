"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CAMPAIGN } from "@/lib/demo";
import { compact, day as dayLabel } from "@/lib/format";
import type { FeedDay, FeedPost } from "@/lib/posts";
import { reasonLabel } from "@/lib/posts";
import { Icon } from "../ui/icon";
import { Check } from "../ui/check";
import { PlatformIcon } from "../ui/platform-icon";
import { Face } from "../creators/face";
import { Marked } from "../creators/bits";
import { Mark } from "./mark";
import { dayName } from "./toolbar";
import styles from "./feed.module.css";

/*
  The feed (was: the feed tab's days): the newest day first and, inside a day, the biggest posts leading (the
  product's order). Each day's heading stays at the top while its posts are in view, with the day's count and views
  and the way into the table at that day. A day's posts run in one row that moves sideways, as in the product, by
  drag, trackpad or the arrows at its ends (shown only where there is more to see); the row is sized so it only ever
  rests on whole cards, never one cut at the edge, and it moves a page of them at a time. The scroll bar is never
  drawn. Seven days at a time, then the seven before.
*/

export function Feed({
  days,
  shown,
  q,
  selected,
  openId,
  onSelect,
  onOpen,
  onMore,
  onTable,
}: {
  days: FeedDay[];
  shown: number;
  q: string;
  selected: string[];
  openId: string | null;
  onSelect: (id: string, on: boolean) => void;
  onOpen: (id: string) => void;
  onMore: () => void;
  onTable: (date: string) => void;
}) {
  const visible = days.slice(0, shown);
  const next = days.slice(shown, shown + 7);
  const total = days.reduce((a, d) => a + d.posts.length, 0);

  // a search or a narrow filter leaves a post or so a day: then the posts read as one grid, newest first, each dated
  if (days.length > 2 && total / days.length < 2) {
    const posts = days.flatMap((d) => d.posts);
    return (
      <div className={styles.feed} data-selecting={selected.length > 0 || undefined}>
        <ul className={styles.grid}>
          {posts.map((p, i) => (
            <li key={p.id} style={{ "--i": Math.min(i, 12) } as React.CSSProperties}>
              <PostCard post={p} q={q} dated selected={selected.includes(p.id)} open={openId === p.id} onSelect={(on) => onSelect(p.id, on)} onOpen={() => onOpen(p.id)} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className={styles.feed} data-selecting={selected.length > 0 || undefined}>
      {visible.map((d, i) => (
        <section key={d.date} className={styles.day} aria-label={dayName(d.date)} style={{ "--i": Math.min(i, 4) } as React.CSSProperties}>
          <header className={styles.head}>
            <h2>{dayName(d.date)}</h2>
            <p>
              <span className="mono">{d.posts.length}</span> {d.posts.length === 1 ? "post" : "posts"}
              <i aria-hidden />
              <span className="mono">{compact(d.views)}</span> views
            </p>
            <button type="button" className={styles.toTable} onClick={() => onTable(d.date)} data-anim-host title={`Open the table at ${dayName(d.date)}`}>
              In the table
              <Icon name="right" size={16} />
            </button>
          </header>
          <Row posts={d.posts} q={q} selected={selected} openId={openId} onSelect={onSelect} onOpen={onOpen} />
        </section>
      ))}

      {next.length > 0 ? (
        <button type="button" className={styles.more} onClick={onMore} data-anim-host>
          <span>
            Show the {next.length === 1 ? "day" : `${next.length} days`} before
            <em>
              {dayLabel(next[next.length - 1].date)} to {dayLabel(next[0].date)}
            </em>
          </span>
          <Icon name="down" size={18} />
        </button>
      ) : (
        days.length > 1 && <p className={styles.end}>That&rsquo;s every day with a post since the campaign began on {dayLabel(CAMPAIGN.startedAt)}.</p>
      )}
    </div>
  );
}

function Row({
  posts,
  q,
  selected,
  openId,
  onSelect,
  onOpen,
}: {
  posts: FeedPost[];
  q: string;
  selected: string[];
  openId: string | null;
  onSelect: (id: string, on: boolean) => void;
  onOpen: (id: string) => void;
}) {
  const ref = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: true });
  const drag = useRef({ x: 0, left: 0, moved: false, on: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    const watch = new ResizeObserver(measure);
    watch.observe(el);
    return () => watch.disconnect();
  }, [measure, posts.length]);

  // a page of whole cards at a time
  const page = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "16") : el.clientWidth;
    const per = Math.max(1, Math.round((el.clientWidth + 16) / step));
    el.scrollBy({ left: dir * per * step, behavior: "smooth" });
  };

  // drag sideways with the mouse; a drag that moved is not a press
  const down = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || !ref.current) return;
    drag.current = { x: e.clientX, left: ref.current.scrollLeft, moved: false, on: true };
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    const el = ref.current;
    if (!d.on || !el) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      el.dataset.dragging = "";
      el.setPointerCapture(e.pointerId);
    }
    if (d.moved) el.scrollLeft = d.left - dx;
  };
  const up = () => {
    const el = ref.current;
    drag.current.on = false;
    if (el && "dragging" in el.dataset) {
      delete el.dataset.dragging;
      // let it settle on a whole card
      const card = el.firstElementChild as HTMLElement | null;
      if (card) {
        const step = card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "16");
        el.scrollTo({ left: Math.round(el.scrollLeft / step) * step, behavior: "smooth" });
      }
    }
  };

  return (
    <div className={styles.rowWrap} data-start={edge.start || undefined} data-end={edge.end || undefined}>
      <button type="button" className={`${styles.arrow} ${styles.prev}`} onClick={() => page(-1)} aria-label="Earlier posts of the day" tabIndex={edge.start ? -1 : 0} data-anim-host>
        <Icon name="left" size={20} stroke={2} />
      </button>
      <ul
        ref={ref}
        className={styles.row}
        onScroll={measure}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onClickCapture={(e) => {
          if (drag.current.moved) {
            e.stopPropagation();
            e.preventDefault();
            drag.current.moved = false;
          }
        }}
      >
        {posts.map((p) => (
          <li key={p.id}>
            <PostCard post={p} q={q} selected={selected.includes(p.id)} open={openId === p.id} onSelect={(on) => onSelect(p.id, on)} onOpen={() => onOpen(p.id)} />
          </li>
        ))}
      </ul>
      <button type="button" className={`${styles.arrow} ${styles.next}`} onClick={() => page(1)} aria-label="More posts of the day" tabIndex={edge.end ? -1 : 0} data-anim-host>
        <Icon name="right" size={20} stroke={2} />
      </button>
    </div>
  );
}

/*
  A post card: the post's own poster, 9:16, its platform in the corner and its views over the foot with the milestone
  mark beside them; under it the creator's face and name and the time it went out, the caption in two lines, and its
  likes, comments and shares. Hover lifts it and plays the post where there is a video to play (the video is only
  made then, so a long feed carries none until asked); the check comes up to select it. The open post stays outlined
  in ink. A flagged post keeps its place, greyed, its flag in red; a deleted one fades, with the day it went.
*/
export function PostCard({
  post: p,
  q,
  dated,
  selected,
  open,
  onSelect,
  onOpen,
}: {
  post: FeedPost;
  q: string;
  // out of its day's row (the grid), a card says its day rather than its time
  dated?: boolean;
  selected: boolean;
  open: boolean;
  onSelect: (on: boolean) => void;
  onOpen: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const time = dated ? dayLabel(p.postedAt.slice(0, 10)) : p.postedAt.slice(11, 16);

  useEffect(() => {
    if (playing) video.current?.play().catch(() => {});
  }, [playing]);

  return (
    <article
      className={styles.card}
      data-open={open || undefined}
      data-selected={selected || undefined}
      data-status={p.status}
      data-flagged={!!p.flag || undefined}
      role="button"
      tabIndex={0}
      aria-pressed={open}
      aria-label={`@${p.handle}, ${compact(p.views)} views: ${p.caption}. Open`}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      onPointerEnter={(e) => e.pointerType === "mouse" && p.video && setPlaying(true)}
      onPointerLeave={() => setPlaying(false)}
    >
      <div className={styles.poster} data-blank={!p.poster || undefined}>
        {p.poster ? (
          <img src={p.poster} alt="" loading="lazy" draggable={false} />
        ) : (
          <span className={styles.blank}>
            <PlatformIcon platform={p.platform} size={26} />
          </span>
        )}
        {playing && p.video && <video ref={video} src={p.video} poster={p.poster ?? undefined} muted loop playsInline className={styles.video} />}
        <span className={styles.shade} aria-hidden />
        <PlatformIcon platform={p.platform} size={24} className={styles.platform} />
        <Check checked={selected} onChange={onSelect} label={`Select @${p.handle}'s post`} hideLabel tone="glass" className={styles.check} />
        <span className={styles.over}>
          <Mark views={p.views} size={17} tone={p.poster ? "media" : "paper"} />
          <span className={`num ${styles.views}`}>{compact(p.views)}</span>
          <span className={styles.viewsWord}>views</span>
          <span className={`mono ${styles.duration}`}>
            {p.video && <Icon name="play" size={10} stroke={0} className={styles.playMark} />}
            {p.duration}
          </span>
        </span>
      </div>

      <div className={styles.who}>
        <Face creator={p.creator} size={26} />
        <span className={styles.name}>
          <Marked text={p.creator.name} q={q} />
        </span>
        {dated && (
          <time className="mono" dateTime={p.postedAt}>
            {time}
          </time>
        )}
      </div>
      <p className={styles.caption}>
        <Marked text={p.caption} q={q} />
      </p>
      {p.flag ? (
        <p className={styles.flagLine}>
          <Icon name="flag" size={14} stroke={2} />
          Flagged · {reasonLabel(p)}
        </p>
      ) : p.status === "deleted" ? (
        <p className={styles.gone}>Deleted {p.deletedAt ? dayLabel(p.deletedAt.slice(0, 10)) : ""}</p>
      ) : null}
    </article>
  );
}
