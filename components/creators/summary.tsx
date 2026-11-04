"use client";

import { useRef, useState } from "react";
import { PLANNED_CREATORS, STATUS_LABELS, type RosterCreator, type Status } from "@/lib/roster";
import { compact } from "@/lib/format";
import { useArrival, ArrivalProvider } from "../ui/arrival";
import { Icon } from "../ui/icon";
import { CountryFlag } from "../ui/country-flag";
import { RollingNumber } from "../ui/rolling-number";
import { Face } from "./face";
import styles from "./summary.module.css";

/*
  The roster at a glance, three blocks of colour each with one job (was: a strip of four numbers).
  - The roster: the people as faces, most viewed first, and the places the plan still has as rings of fine dots;
    under them the four figures the strip had. A face opens that creator.
  - Who is posting: the roster by status, a dot a person, and each status a row that filters the list to it.
  - Creator of the week: the most views in the last seven days, with their best post.
*/

const LINES: Record<Status, string> = {
  active: "Posted in the last 3 days",
  idle: "No post for 3 days or more",
  dropped: "Off the campaign",
};

export function Summary({
  roster,
  status,
  onStatus,
  onOpen,
}: {
  roster: RosterCreator[];
  status: Status | "all";
  onStatus: (s: Status | null) => void;
  onOpen: (id: string) => void;
}) {
  const [ref, state] = useArrival<HTMLElement>(0.2);
  const faces = [...roster].sort((a, b) => (a.status === "dropped" ? 1 : 0) - (b.status === "dropped" ? 1 : 0) || b.views - a.views);
  const open = Math.max(0, PLANNED_CREATORS - roster.length);
  const videos = roster.reduce((a, c) => a + c.videos, 0);
  const views = roster.reduce((a, c) => a + c.views, 0);
  const week = (c: RosterCreator) => c.daily.slice(-7).reduce((a, v) => a + v, 0);
  const star = [...roster].filter((c) => c.status === "active" && !c.flag && c.posts.length).sort((a, b) => week(b) - week(a))[0];
  const by = (s: Status) => roster.filter((c) => c.status === s);

  return (
    <section ref={ref} className={styles.holder} data-arrive={state} aria-label="The roster at a glance">
      <div className={styles.row}>
        <ArrivalProvider value={state}>
          {/* the roster, as people */}
          <div className={`${styles.block} ${styles.roster}`}>
            <div className={styles.head}>
              <h2>Your roster</h2>
              <p>
                <RollingNumber value={String(roster.length)} className="num" />
                <span>of {PLANNED_CREATORS} planned</span>
              </p>
            </div>
            <ul className={styles.wall}>
              {faces.map((c, i) => (
                <li key={c.id} style={{ "--i": i } as React.CSSProperties}>
                  <button type="button" className={styles.face} onClick={() => onOpen(c.id)} data-dropped={c.status === "dropped"} aria-label={`Open ${c.name}`}>
                    <Face creator={c} size={38} />
                    <span className={styles.tip} role="tooltip">
                      {c.name}
                    </span>
                  </button>
                </li>
              ))}
              {Array.from({ length: open }, (_, i) => (
                <li key={`open-${i}`} className={styles.place} style={{ "--i": faces.length + i } as React.CSSProperties} title="A place the plan still has">
                  <svg viewBox="0 0 38 38" aria-hidden>
                    <circle cx="19" cy="19" r="17.5" />
                  </svg>
                </li>
              ))}
            </ul>
            <dl className={styles.figures}>
              <div>
                <dt>Videos</dt>
                <dd className="num">{videos}</dd>
              </div>
              <div>
                <dt>Views</dt>
                <dd className="num">{compact(views)}</dd>
              </div>
            </dl>
          </div>

          {/* who is posting, a dot a person; each status filters the list */}
          <div className={`${styles.block} ${styles.posting}`}>
            <div className={styles.head}>
              <h2>Who is posting</h2>
            </div>
            <div className={styles.people} aria-hidden>
              {(["active", "idle", "dropped"] as Status[]).flatMap((s) =>
                by(s).map((c, i) => <i key={c.id} data-status={s} style={{ "--i": i } as React.CSSProperties} />),
              )}
            </div>
            <div className={styles.statuses}>
              {(["active", "idle", "dropped"] as Status[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={styles.status}
                  aria-pressed={status === s}
                  onClick={() => onStatus(status === s ? null : s)}
                  data-anim-host
                >
                  <i data-status={s} aria-hidden />
                  <span className={`num ${styles.count}`}>{by(s).length}</span>
                  <span className={styles.statusText} title={LINES[s]}>
                    <strong>{STATUS_LABELS[s]}</strong>
                  </span>
                  <Icon name={status === s ? "close" : "right"} size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* the creator of the week */}
          {star && <Spotlight creator={star} views={week(star)} onOpen={() => onOpen(star.id)} />}
        </ArrivalProvider>
      </div>
    </section>
  );
}

function Spotlight({ creator, views, onOpen }: { creator: RosterCreator; views: number; onOpen: () => void }) {
  const best = creator.posts[0];
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  return (
    <div className={`${styles.block} ${styles.spotlight}`}>
      <div className={styles.head}>
        <h2>Creator of the week</h2>
      </div>
      <div className={styles.star}>
        <div className={styles.who}>
          <Face creator={creator} size={64} ring />
          <p className={styles.name}>{creator.name}</p>
          <p className={styles.where}>
            <CountryFlag country={creator.country} size={18} />
            {creator.country.name}
          </p>
          <p className={styles.weekViews}>
            <RollingNumber value={compact(views)} className="num" />
            <span>views this week</span>
          </p>
          <button type="button" className={styles.openLink} onClick={onOpen} data-anim-host>
            Open profile
            <Icon name="arrow" size={16} />
          </button>
        </div>
        {best && (
          <button
            type="button"
            className={`${styles.post} ${playing ? styles.playing : ""}`}
            onPointerEnter={() => best.video && video.current?.play().then(() => setPlaying(true)).catch(() => {})}
            onPointerLeave={() => {
              video.current?.pause();
              setPlaying(false);
            }}
            onClick={onOpen}
            aria-label={`${creator.name}'s best post, ${compact(best.views)} views`}
          >
            {best.video ? <video ref={video} src={best.video} poster={best.poster} muted loop playsInline preload="none" /> : <img src={best.poster} alt="" />}
            <span className={styles.postViews}>
              <Icon name="play" size={12} />
              {compact(best.views)}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
