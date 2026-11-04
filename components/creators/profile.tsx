"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { MANAGER, PLATFORM_LABELS } from "@/lib/demo";
import { ACTIVE_HOURS, FLAG_REASONS, NOW, STATUS_LABELS, since, stamp, type RosterCreator, type RosterPost } from "@/lib/roster";
import { compact, day } from "@/lib/format";
import { ArrivalProvider } from "../ui/arrival";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { PlatformIcon } from "../ui/platform-icon";
import { CountryFlag } from "../ui/country-flag";
import { Sheet } from "../ui/sheet";
import { Face } from "./face";
import { Banner } from "./banner";
import styles from "./profile.module.css";

/*
  One creator, in the window's right-hand column (was: the account preview panel). Who they are first (their banner,
  the same soft lights as on their card; their face in its status ring on a plate over the banner's edge; name,
  where, since when), what their status means in words, their four figures, their last fourteen
  days, the accounts they post from (the one link that leaves the app opens the live profile), their best posts
  (they play under the pointer), and what the brand can do: flag them for the account manager, or lift a flag.
  Each creator's profile arrives fresh, so switching from one to the next reads as a new page.
*/

export function Profile({ creator: c, onFlag, onUnflag, onClose }: { creator: RosterCreator; onFlag: () => void; onUnflag: () => void; onClose?: () => void }) {
  const reasons = c.flag?.reasons.map((r) => FLAG_REASONS.find((x) => x.id === r)?.label).join(", ");
  const status =
    c.status === "active"
      ? `Posted ${since(c.lastPostAt).toLowerCase()}`
      : c.status === "idle"
        ? `No post for ${since(c.lastPostAt).replace(" ago", "")}`
        : `Off the campaign since ${c.endedAt ? day(c.endedAt) : "it began"}`;
  const meaning =
    c.status === "active"
      ? `Active: a post in the last ${ACTIVE_HOURS} hours`
      : c.status === "idle"
        ? `Idle: no post in the last ${ACTIVE_HOURS} hours. ${MANAGER.name.split(" ")[0]} follows up with idle creators.`
        : "Dropped: no longer posting for this campaign. Their posts stay counted.";

  return (
    <ArrivalProvider value="in">
      <div key={c.id} className={styles.profile} data-status={c.status}>
        <Banner creator={c} size="profile" className={styles.banner}>
          {onClose && (
            <button type="button" className={styles.close} onClick={onClose} aria-label="Close" data-anim-host>
              <Icon name="close" size={18} />
            </button>
          )}
        </Banner>

        <div className={styles.head}>
          <span className={styles.plate}>
            <Face creator={c} size={88} ring />
          </span>
          <h2>{c.name}</h2>
          <p className={styles.where}>
            <CountryFlag country={c.country} size={18} />
            {c.country.name}
            <i aria-hidden />
            joined {day(c.joinedAt)}
          </p>
          <p className={styles.status} data-status={c.status}>
            <i aria-hidden />
            <strong>{STATUS_LABELS[c.status]}</strong>
            <span>{status}</span>
            <span className={styles.what} aria-label={meaning} tabIndex={0}>
              ?<span className={styles.whatTip}>{meaning}</span>
            </span>
          </p>
        </div>

        {c.flag && (
          <div className={styles.flagged}>
            <p className={styles.flagHead}>
              <Icon name="flag" size={16} stroke={2} />
              Flagged · {reasons}
            </p>
            <p className={styles.flagBy}>
              By {c.flag.by}, {day(c.flag.at.slice(0, 10))}. {MANAGER.name.split(" ")[0]} is looking into it.
            </p>
            {c.flag.note && <p className={styles.flagNote}>&ldquo;{c.flag.note}&rdquo;</p>}
            <button type="button" className={styles.lift} onClick={onUnflag}>
              Remove the flag
            </button>
          </div>
        )}

        <dl className={styles.figures}>
          <div>
            <dt>Views</dt>
            <dd className="num">{compact(c.views)}</dd>
          </div>
          <div>
            <dt>Avg / post</dt>
            <dd className="num">{compact(c.avgPerPost)}</dd>
          </div>
          <div>
            <dt>Videos</dt>
            <dd className="num">{c.videos}</dd>
          </div>
          <div>
            <dt>Engagement</dt>
            <dd className="num">{c.engagement.toFixed(1)}%</dd>
          </div>
        </dl>

        <div className={styles.section}>
          <p className={styles.label}>
            Last 14 days <span>by the day posts went out</span>
          </p>
          <Days daily={c.daily} />
        </div>

        <div className={styles.section}>
          <p className={styles.label}>
            Accounts <span>made for this campaign</span>
          </p>
          <ul className={styles.accounts}>
            {c.accounts.map((a) => (
              <li key={a.id}>
                <PlatformIcon platform={a.platform} size={32} />
                <span className={styles.accountText}>
                  <strong>@{a.handle}</strong>
                  <span className={styles.accountFigures}>
                    <span>
                      <b className="mono">{compact(a.views)}</b> views
                    </span>
                    <span>
                      <b className="mono">{a.videos}</b> videos
                    </span>
                    <span>
                      <b className="mono">{compact(a.followers)}</b> followers
                    </span>
                  </span>
                </span>
                <a
                  href={a.platform === "tiktok" ? `https://www.tiktok.com/@${a.handle}` : `https://www.instagram.com/${a.handle}`}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.out}
                  aria-label={`Open @${a.handle} on ${PLATFORM_LABELS[a.platform]}`}
                  title={`Open on ${PLATFORM_LABELS[a.platform]}`}
                  data-anim-host
                >
                  <Icon name="outward" size={18} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.section}>
          <p className={styles.label}>
            Best posts <span>{c.posts.length ? "by views" : ""}</span>
          </p>
          {c.posts.length ? (
            <div className={styles.posts}>
              {c.posts.map((p) => (
                <PostTile key={p.id} post={p} />
              ))}
            </div>
          ) : (
            <p className={styles.none}>No previews of their posts in the sample.</p>
          )}
        </div>

        <div className={styles.actions}>
          {c.flag ? (
            <Button variant="stone" icon={<Icon name="flag" size={18} />} onClick={onFlag}>
              Add to the flag
            </Button>
          ) : (
            <Button variant="stone" icon={<Icon name="flag" size={18} />} onClick={onFlag}>
              Flag for {MANAGER.name.split(" ")[0]}
            </Button>
          )}
          <p className={styles.small}>{c.lastPostAt ? `Last post ${stamp(c.lastPostAt)}` : "No posts yet"}</p>
        </div>
      </div>
    </ArrivalProvider>
  );
}

/*
  Their last fourteen days across the column's width: a column of fine dots for each day, lit from the foot by the
  views of the posts that went out that day (the busiest day lit to the top), today at the right. Pointing at a day
  dims the others and says its date and views.
*/
const DAY_ROWS = 8;

function Days({ daily }: { daily: number[] }) {
  const [over, setOver] = useState<number | null>(null);
  const max = Math.max(...daily, 1);
  const first = new Date(NOW - 13 * 86_400_000).toISOString().slice(0, 10);
  const total = daily.reduce((a, v) => a + v, 0);
  return (
    <div className={styles.days} data-pointing={over !== null || undefined} onPointerLeave={() => setOver(null)}>
      <div className={styles.dayCols} role="img" aria-label={`${compact(total)} views from posts in the last 14 days, by the day they went out`}>
        {daily.map((v, d) => {
          const lit = v > 0 ? Math.max(1, Math.round((v / max) * DAY_ROWS)) : 0;
          const at = new Date(NOW - (13 - d) * 86_400_000).toISOString().slice(0, 10);
          const edge = d < 3 ? "start" : d > 10 ? "end" : "middle";
          return (
            <span key={d} className={styles.dayCol} data-over={over === d || undefined} onPointerEnter={() => setOver(d)}>
              {Array.from({ length: DAY_ROWS * 2 }, (_, k) => {
                const level = DAY_ROWS - 1 - Math.floor(k / 2);
                return <i key={k} className={level < lit ? styles.dayLit : undefined} style={{ "--delay": `${d * 28 + level * 22}ms` } as React.CSSProperties} />;
              })}
              {over === d && (
                <span className={styles.dayTip} data-edge={edge} role="tooltip">
                  <strong>{d === 13 ? "Today" : day(at, true)}</strong>
                  <span>{v ? `${compact(v)} views` : "No post"}</span>
                </span>
              )}
            </span>
          );
        })}
      </div>
      <p className={styles.dayAxis} aria-hidden>
        <span>{day(first)}</span>
        <span>Today</span>
      </p>
    </div>
  );
}

function PostTile({ post }: { post: RosterPost }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  return (
    <Link
      href={`/posts?open=${post.id}`}
      title="Open this post in Posts & feed"
      className={`${styles.post} ${playing ? styles.playing : ""}`}
      onPointerEnter={() => post.video && video.current?.play().then(() => setPlaying(true)).catch(() => {})}
      onPointerLeave={() => {
        video.current?.pause();
        setPlaying(false);
      }}
    >
      {post.video ? <video ref={video} src={post.video} poster={post.poster} muted loop playsInline preload="none" /> : <img src={post.poster} alt="" loading="lazy" />}
      <PlatformIcon platform={post.platform} size={18} className={styles.postMark} />
      <span className={styles.postViews}>{compact(post.views)}</span>
    </Link>
  );
}

export function ProfileSheet({ creator, onClose, onFlag, onUnflag }: { creator: RosterCreator | null; onClose: () => void; onFlag: () => void; onUnflag: () => void }) {
  return (
    <Sheet open={!!creator} onClose={onClose} label={creator?.name ?? "Creator"}>
      {creator && <Profile creator={creator} onFlag={onFlag} onUnflag={onUnflag} onClose={onClose} />}
    </Sheet>
  );
}
