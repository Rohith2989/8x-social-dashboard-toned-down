"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { compact, day, full } from "@/lib/format";
import { ROSTER } from "@/lib/roster";
import { MAYA, PEOPLE, SOURCE_LABELS, approveBlocked, flagBlocked, type Plan, type Reference, type Review, type Script } from "@/lib/plan";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { PlatformIcon } from "../ui/platform-icon";
import { Glyph } from "./open-plan";
import { stateOf } from "./words";
import styles from "./script.module.css";

/*
  One script (was: the call sheet and its rail), laid out the way the creator's brief reads, with the brand's
  decision on it:
  - the reference in its own column, playing, muted; several page in place; one of the campaign's own posts says
    whose it was and opens it on Posts & feed; one that cannot play here opens on its platform
  - its number, its name large, what it is and when it is due, and where it stands in words, with Approve (the heart:
    a burst of the vertical's sparks the moment it lands) and Flag, each disabled with the product's reason when it
    cannot be done; below 1360 px a third button opens the conversation
  - Maya's paragraph on what it is for
  - how it did, once creators have it: the product's four figures and its posts, which open on Posts & feed
  - how it goes: the three beats in the order they are filmed, each beside the reference's own frame at that moment,
    so the beats read as a storyboard; the frames follow the reference on screen
  - do and do not, one rule a line
*/

const SPARKS = [0, 1, 2, 3, 4, 5, 6, 7];

export function ScriptSheet({
  script,
  plan,
  review,
  comments,
  unread,
  burst,
  onApprove,
  onFlag,
  onTalk,
}: {
  script: Script;
  plan: Plan;
  review: Review;
  comments: number;
  unread: boolean;
  // how many times this script has been approved here; a new one plays the burst
  burst: number;
  onApprove: () => void;
  onFlag: () => void;
  onTalk: () => void;
}) {
  const [index, setIndex] = useState(0);
  const f = script.format;
  const ref = script.references[index] ?? null;
  const state = stateOf(review, plan);
  const approveWhy = approveBlocked(review, plan);
  const flagWhy = flagBlocked(review);
  const approved = review.state === "approved";

  return (
    <article className={styles.sheet} aria-label={`Script ${script.n}, ${f.name}`}>
      <div className={styles.layout} data-ref={script.references.length ? undefined : "none"}>
      {script.references.length > 0 && (
      <div className={styles.refColumn}>
        <ReferenceFrame reference={ref} title={f.name} />
        {script.references.length > 1 ? (
          <div className={styles.pager}>
            <button type="button" className={styles.page} onClick={() => setIndex((i) => (i + script.references.length - 1) % script.references.length)} aria-label="Previous reference" data-anim-host>
              <Icon name="left" size={18} stroke={2} />
            </button>
            <span aria-live="polite" className="num">
              {index + 1} of {script.references.length}
            </span>
            <button type="button" className={styles.page} onClick={() => setIndex((i) => (i + 1) % script.references.length)} aria-label="Next reference" data-anim-host>
              <Icon name="right" size={18} stroke={2} />
            </button>
          </div>
        ) : (
          script.references.length === 1 && <p className={styles.refWord}>The reference</p>
        )}
        {ref && <RefCaption reference={ref} />}
      </div>
      )}

      <div className={styles.body}>
        <header className={styles.head}>
          <div className={styles.who}>
            <p className={styles.eyebrow}>Script {script.n}</p>
            <h2>{f.name}</h2>
            <p className={styles.meta}>
              {f.media === "reel" ? "Reel" : "Carousel"} · <span className="mono">#{f.code}</span> · post by {day(plan.end)}
              {script.references.length === 0 && " · no reference video"}
            </p>
            {state.text && (
              <p className={styles.state} data-tone={state.tone}>
                <Glyph tone={state.tone} />
                {state.text}
              </p>
            )}
          </div>
          <div className={styles.decide}>
            <span className={styles.approveWrap} title={approved ? `Approved ${day(review.approval!.at.slice(0, 10))}. Leave a comment if something needs to change.` : (approveWhy ?? `Approve Script ${script.n}`)}>
              <Button
                variant="ink"
                className={approved ? styles.approved : approveWhy ? styles.blocked : undefined}
                icon={
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden className={`${styles.heart} ${burst > 0 && approved ? styles.pop : ""}`} key={burst}>
                    <path
                      d="M12 20.5S3 15.4 3 9.1A4.7 4.7 0 0 1 12 6.9a4.7 4.7 0 0 1 9 2.2c0 6.3-9 11.4-9 11.4Z"
                      fill={approved ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
                disabled={approved || !!approveWhy}
                pressed={approved}
                onClick={onApprove}
              >
                {approved ? "Approved" : "Approve"}
              </Button>
              {burst > 0 && approved && (
                <span key={burst} className={styles.burst} aria-hidden>
                  <i className={styles.ring} />
                  {SPARKS.map((k) => (
                    <i key={k} className={styles.spark} style={{ "--k": k } as React.CSSProperties} />
                  ))}
                </span>
              )}
            </span>
            <span title={flagWhy ?? `Flag Script ${script.n} for ${MAYA}`}>
              <Button variant="stone" className={review.state === "flagged" ? styles.flaggedButton : undefined} icon={<Icon name="flag" size={18} />} disabled={!!flagWhy} onClick={onFlag}>
                {review.state === "flagged" ? "Flagged" : "Flag"}
              </Button>
            </span>
            <button type="button" className={styles.talk} onClick={onTalk} aria-label={`Activity${comments ? `, ${comments} comments` : ""}${unread ? `, new from ${MAYA}` : ""}`} data-anim-host>
              <Icon name="comment" size={18} />
              {comments > 0 && <span className="num">{comments}</span>}
              {unread && <i aria-hidden />}
            </button>
          </div>
        </header>

        {review.flag && (
          <div className={styles.flagNote}>
            <p>
              {PEOPLE[review.flag.who].name} flagged it {day(review.flag.at.slice(0, 10))}. It waits with {MAYA} until it comes back.
            </p>
            {review.flag.note && <blockquote>&ldquo;{review.flag.note}&rdquo;</blockquote>}
          </div>
        )}

        <p className={styles.angle}>{f.angle}</p>

        {plan.stage !== "review" && <Results script={script} />}

        <section className={styles.section} aria-label="How it goes">
          <h3 className={styles.label}>How it goes</h3>
          <ol className={styles.beats} data-frames={ref?.kind === "post" || undefined}>
            {(
              [
                ["open", "Open with", f.hook],
                ["middle", "Through the middle", f.middle],
                ["close", "Close with", f.close],
              ] as const
            ).map(([k, label, text], i) => (
              <li key={k} className={styles.beat} style={{ "--i": i } as React.CSSProperties}>
                {ref?.kind === "post" && (
                  <span className={styles.frame}>
                    <img key={ref.frames[k]} src={ref.frames[k]} alt={`The reference, ${label.toLowerCase()}`} width={90} height={160} loading="lazy" />
                  </span>
                )}
                <span className={styles.step} aria-hidden>
                  {i + 1}
                </span>
                <div className={styles.beatText}>
                  <span className={styles.beatLabel}>{label}</span>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {(f.dos.length > 0 || f.donts.length > 0) && (
          <section className={styles.rules} aria-label="Do and do not">
            <Rules title="Do" rules={f.dos} tone="do" />
            <Rules title="Do not" rules={f.donts} tone="dont" />
          </section>
        )}
      </div>
      </div>
    </article>
  );
}

function Rules({ title, rules, tone }: { title: string; rules: string[]; tone: "do" | "dont" }) {
  if (!rules.length) return null;
  return (
    <div className={styles.ruleColumn} data-tone={tone}>
      <h3 className={styles.label}>{title}</h3>
      <ul>
        {rules.map((r) => (
          <li key={r}>
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
              {tone === "do" ? <path d="m3.5 8.4 2.9 2.9 6-6.4" /> : <path d="m4.5 4.5 7 7m0-7-7 7" />}
            </svg>
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
}

// what its posts came to: the product's four figures, then the posts themselves, which open on Posts & feed
function Results({ script }: { script: Script }) {
  const r = script.results;
  if (!r.posts) {
    return (
      <section className={styles.section} aria-label="How it did">
        <h3 className={styles.label}>How it did</h3>
        <p className={styles.none}>No posts with its hashtag yet.</p>
      </section>
    );
  }
  const shown = script.posts.filter((p) => p.poster).slice(0, 6);
  return (
    <section className={styles.section} aria-label="How it did">
      <h3 className={styles.label}>
        How it did
        <Link href={`/posts?script=${script.id}`} className={styles.all} data-anim-host>
          All {r.posts} on Posts &amp; feed
          <Icon name="right" size={16} />
        </Link>
      </h3>
      <dl className={styles.four}>
        <div>
          <dt>Posts</dt>
          <dd className="num">{full(r.posts)}</dd>
        </div>
        <div>
          <dt>Views</dt>
          <dd className="num" title={full(r.views)}>
            {compact(r.views)}
          </dd>
        </div>
        <div>
          <dt>Views a post</dt>
          <dd className="num">{r.avg == null ? "–" : compact(r.avg)}</dd>
        </div>
        <div>
          <dt>Engagement</dt>
          <dd className="num">{r.engagement == null ? "–" : `${r.engagement.toFixed(1)}%`}</dd>
        </div>
      </dl>
      {shown.length > 0 && (
        <ul className={styles.posts}>
          {shown.map((p) => (
            <li key={p.id}>
              <Link href={`/posts?open=${p.id}`} className={styles.post} title={`Open it on Posts & feed: ${p.caption}`}>
                <img src={p.poster!} alt="" width={68} height={120} loading="lazy" />
                <span className="num">{compact(p.views)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// the reference as it plays here, or the way to it
function ReferenceFrame({ reference, title }: { reference: Reference | null; title: string }) {
  if (!reference) return null;
  if (reference.kind === "link") {
    return (
      <div className={styles.refBlank}>
        <svg viewBox="0 0 200 200" preserveAspectRatio="none" aria-hidden>
          <rect x="1" y="1" width="198" height="198" rx="20" />
        </svg>
        {reference.source === "youtube" ? <Icon name="play" size={22} /> : <PlatformIcon platform={reference.source} size={28} />}
        <p>This one opens on {SOURCE_LABELS[reference.source]}</p>
        <a href={reference.url} target="_blank" rel="noreferrer noopener" className={styles.outLink}>
          Open the reference
          <Icon name="outward" size={16} />
        </a>
      </div>
    );
  }
  return <RefVideo key={reference.key} src={reference.video} poster={reference.poster} title={title} />;
}

function RefVideo({ src, poster, title }: { src: string; poster: string; title: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);

  // it plays on its own, muted, unless the reader asked for less motion
  useEffect(() => {
    const v = video.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    v.play().catch(() => {});
  }, [src]);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  return (
    <div className={styles.refFrame}>
      <video
        ref={video}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={`The reference for ${title}, playing without sound`}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime / (e.currentTarget.duration || 1))}
      />
      <button type="button" className={styles.playToggle} onClick={toggle} aria-label={playing ? "Pause the reference" : "Play the reference"} data-anim-host>
        <Icon name={playing ? "pause" : "play"} size={16} />
      </button>
      <span className={styles.progress} aria-hidden>
        <i style={{ transform: `scaleX(${progress})` }} />
      </span>
    </div>
  );
}

// whose post the reference is, which opens it on Posts & feed
function RefCaption({ reference }: { reference: Reference }) {
  if (reference.kind !== "post") return null;
  const p = reference.post;
  const name = ROSTER.find((c) => c.id === p.creatorId)?.name.split(" ")[0] ?? "A creator";
  return (
    <Link href={`/posts?open=${p.id}`} className={styles.refCaption} title="Open it on Posts & feed" data-anim-host>
      <span className={styles.refWho}>
        <strong>{name}&rsquo;s post</strong>
        <span>
          {day(p.postedAt.slice(0, 10))}, <span className="num">{compact(p.views)}</span> views
        </span>
      </span>
      <Icon name="right" size={16} />
    </Link>
  );
}
