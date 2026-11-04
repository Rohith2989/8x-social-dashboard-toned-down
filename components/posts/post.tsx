"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MANAGER, PLATFORM_LABELS } from "@/lib/demo";
import { since, stamp } from "@/lib/roster";
import { compact, day as dayLabel, full } from "@/lib/format";
import { milestoneLabel, milestoneOf, nextMilestone, postUrl, reasonLabel, type FeedPost } from "@/lib/posts";
import { planOf, scriptOfPost } from "@/lib/plan";
import { ArrivalProvider } from "../ui/arrival";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { PlatformIcon } from "../ui/platform-icon";
import { Sheet } from "../ui/sheet";
import { Face } from "../creators/face";
import { Mark } from "./mark";
import styles from "./post.module.css";

/*
  One post, in the window's right-hand column (was: the post panel; a sheet below 1360 px). The post as it ran first:
  its video playing, muted, in a 9:16 frame dressed as its platform shows it (the creator, the like, comment and share
  counts down the side, the handle and caption at the foot, the play line along the bottom); a post with no video
  here keeps its poster, with the way to watch it on its platform. Then when it went out and who made it (which
  opens them on Creators), its five figures (views large, the milestone it passed beside them), how far it is from
  the next milestone, its views by day since it went out, an open flag if there is one, and what the brand can do with
  it. Each post arrives fresh, so moving from one to the next reads as a new page.
*/

export type PostActions = { copyLink: () => void; copySpark: () => void; download: () => void; flag: () => void };

export function PostPanel({ post, actions, onUnflag, busy, onClose }: { post: FeedPost; actions: PostActions; onUnflag: () => void; busy: string | null; onClose?: () => void }) {
  const p = post;
  const m = milestoneOf(p.views);
  const next = nextMilestone(p.views);
  const first = MANAGER.name.split(" ")[0];
  const watch = `Watch on ${PLATFORM_LABELS[p.platform]}`;

  return (
    <ArrivalProvider value="in">
      <div key={p.id} className={styles.panel} data-status={p.status}>
        <Frame post={p} watch={watch} onClose={onClose} />

        <p className={styles.when}>
          <time dateTime={p.postedAt} title={stamp(p.postedAt)}>
            {dayLabel(p.postedAt.slice(0, 10), true)}, <span className="mono">{p.postedAt.slice(11, 16)}</span>
          </time>
          <i aria-hidden />
          {since(p.postedAt).toLowerCase()}
          <span className={styles.state} data-status={p.status}>
            <i aria-hidden />
            {p.status === "deleted" ? "Deleted" : "Live"}
          </span>
        </p>

        <Link href={`/creators?open=${p.creatorId}`} className={styles.creator} data-anim-host title={`Open ${p.creator.name} on Creators`}>
          <Face creator={p.creator} size={40} ring />
          <span className={styles.creatorText}>
            <strong>{p.creator.name}</strong>
            <span>
              @{p.handle} · {PLATFORM_LABELS[p.platform]}
            </span>
          </span>
          <Icon name="right" size={18} />
        </Link>

        <MadeTo post={p} />

        {p.flag && (
          <div className={styles.flagged}>
            <p className={styles.flagHead}>
              <Icon name="flag" size={16} stroke={2} />
              Flagged · {reasonLabel(p)}
            </p>
            <p className={styles.flagBy}>
              By {p.flag.by}, {dayLabel(p.flag.at.slice(0, 10))}. {first} is looking into it.
            </p>
            {p.flag.note && <p className={styles.flagNote}>&ldquo;{p.flag.note}&rdquo;</p>}
            <button type="button" className={styles.lift} onClick={onUnflag}>
              Remove the flag
            </button>
          </div>
        )}

        <div className={styles.figures}>
          <div className={styles.viewsRow}>
            <span className={`num ${styles.views}`} title={full(p.views)}>
              {compact(p.views)}
            </span>
            <span className={styles.viewsWord}>views</span>
            <span className={styles.passed}>
              <Mark views={p.views} size={22} label />
            </span>
          </div>
          <dl className={styles.four}>
            <div>
              <dt>Likes</dt>
              <dd className="num">{compact(p.likes)}</dd>
            </div>
            <div>
              <dt>Comments</dt>
              <dd className="num">{compact(p.comments)}</dd>
            </div>
          </dl>
        </div>

        <section className={styles.section} aria-label="Next milestone">
          <p className={styles.label}>
            Next milestone
            <span>{next ? `${compact(next.at - p.views)} more views to ${milestoneLabel(next)}` : "Top milestone reached"}</span>
          </p>
          <Track views={p.views} />
          <p className={styles.trackEnds} aria-hidden>
            <span>{m ? milestoneLabel(m) : "0"}</span>
            <span>{next ? milestoneLabel(next) : "1M+"}</span>
          </p>
        </section>


        <div className={styles.actions}>
          <div className={styles.quick}>
            <button type="button" className={styles.quickBtn} onClick={actions.copyLink} data-anim-host title="Copy the link to this post">
              <Icon name="link" size={18} />
              Copy link
            </button>
            {p.platform === "tiktok" && (
              <button
                type="button"
                className={styles.quickBtn}
                onClick={actions.copySpark}
                disabled={!p.sparkCode}
                data-anim-host
                title={p.sparkCode ? `Spark code ${p.sparkCode}: press to copy it` : "The creator has not shared this post's spark code yet"}
              >
                <Icon name="spark" size={18} />
                {p.sparkCode ? "Spark code" : "No code yet"}
              </button>
            )}
            <button
              type="button"
              className={styles.quickBtn}
              onClick={actions.download}
              disabled={!p.video || !!busy}
              data-anim-host
              title={p.video ? "Download the video" : "No file for this post here"}
            >
              <Icon name="download" size={18} />
              {busy ?? "Download"}
            </button>
          </div>
          {p.flag ? (
            <span title="Already flagged for your account manager">
              <Button variant="stone" icon={<Icon name="flag" size={18} />} disabled>
                Flagged
              </Button>
            </span>
          ) : (
            <span title={`Tell ${first} something about this post needs a look. It takes nothing down.`}>
              <Button variant="stone" icon={<Icon name="flag" size={18} />} onClick={actions.flag}>
                Flag for {first}
              </Button>
            </span>
          )}
          <a className={styles.out} href={postUrl(p)} target="_blank" rel="noreferrer" data-anim-host>
            Open on {PLATFORM_LABELS[p.platform]}
            <Icon name="outward" size={16} />
          </a>
        </div>
      </div>
    </ArrivalProvider>
  );
}

// the post as it ran, in its platform's own dress
function Frame({ post: p, watch, onClose }: { post: FeedPost; watch: string; onClose?: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    v.play().catch(() => {});
  }, [p.id]);

  return (
    <div className={styles.frame} data-platform={p.platform}>
      {p.video ? (
        <video
          ref={video}
          key={p.id}
          src={p.video}
          poster={p.poster ?? undefined}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          onTimeUpdate={(e) => setProgress(e.currentTarget.duration ? e.currentTarget.currentTime / e.currentTarget.duration : 0)}
        />
      ) : p.poster ? (
        <img src={p.poster} alt="" />
      ) : (
        <span className={styles.blank}>
          <PlatformIcon platform={p.platform} size={34} />
        </span>
      )}
      <span className={styles.top} aria-hidden />
      <span className={styles.shade} aria-hidden />

      <span className={styles.app}>
        <PlatformIcon platform={p.platform} size={22} />
        {p.platform === "tiktok" ? "For You" : "Reels"}
      </span>
      {onClose && (
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close" data-anim-host>
          <Icon name="close" size={18} />
        </button>
      )}

      {!p.video && (
        <a className={styles.watch} href={postUrl(p)} target="_blank" rel="noreferrer" data-anim-host>
          <Icon name="play" size={14} stroke={0} />
          {watch}
          <Icon name="outward" size={14} />
        </a>
      )}

      <span className={styles.rail} aria-hidden>
        <span className={styles.railFace}>
          <Face creator={p.creator} size={38} />
        </span>
        <span>
          <Icon name="heart" size={26} />
          {compact(p.likes)}
        </span>
        <span>
          <Icon name="comment" size={24} />
          {compact(p.comments)}
        </span>
        <span>
          <Icon name="send" size={24} />
          {p.shares == null ? "–" : compact(p.shares)}
        </span>
      </span>

      <span className={styles.foot}>
        <strong>@{p.handle}</strong>
        <span className={styles.footCaption}>{p.caption}</span>
      </span>

      {p.video && <span className={styles.progress} style={{ "--p": progress } as React.CSSProperties} aria-hidden />}
      {p.status === "deleted" && (
        <span className={styles.deleted}>
          Deleted {p.deletedAt ? dayLabel(p.deletedAt.slice(0, 10)) : ""}. Its figures still count.
        </span>
      )}
    </div>
  );
}

// from the milestone it passed to the next one, in fine dots, lit to where it is
const TRACK = 34;

function Track({ views }: { views: number }) {
  const m = milestoneOf(views);
  const next = nextMilestone(views);
  const from = m?.at ?? 0;
  const to = next?.at ?? from;
  const share = next ? (views - from) / (to - from) : 1;
  const lit = Math.max(1, Math.round(share * TRACK));
  return (
    <span className={styles.track} role="img" aria-label={next ? `${Math.round(share * 100)}% of the way from ${m ? milestoneLabel(m) : "0"} to ${milestoneLabel(next)}` : "Top milestone reached"}>
      {Array.from({ length: TRACK }, (_, i) => (
        <i key={i} className={i < lit ? styles.trackOn : undefined} style={{ "--k": i } as React.CSSProperties} />
      ))}
    </span>
  );
}

// a post's poster, small: the selection bar's and the flag composer's heads
export function Poster({ post, className }: { post: FeedPost; className?: string }) {
  return (
    <span className={`${styles.poster} ${className ?? ""}`}>
      {post.poster ? <img src={post.poster} alt="" /> : <PlatformIcon platform={post.platform} size={14} />}
    </span>
  );
}

export function PostSheet({ post, onClose, actions, onUnflag, busy }: { post: FeedPost | null; onClose: () => void; actions: PostActions | null; onUnflag: () => void; busy: string | null }) {
  return (
    <Sheet open={!!post} onClose={onClose} label={post ? `@${post.handle}'s post` : "Post"}>
      {post && actions && <PostPanel post={post} actions={actions} onUnflag={onUnflag} busy={busy} onClose={onClose} />}
    </Sheet>
  );
}

// the script it was made to (its hashtag, the plan that was open on its day), which opens it on the Content plan
function MadeTo({ post }: { post: FeedPost }) {
  const s = scriptOfPost(post.id);
  if (!s) return null;
  const plan = planOf(s);
  return (
    <Link href={`/plan?plan=${plan.key}&script=${s.n}`} className={styles.creator} data-anim-host title={`Open Script ${s.n} on the Content plan`}>
      <span className={styles.madeMark} aria-hidden>
        <Icon name="plan" size={20} />
      </span>
      <span className={styles.creatorText}>
        <strong>{s.format.name}</strong>
        <span>
          Script {s.n} of {plan.name}
        </span>
      </span>
      <Icon name="right" size={18} />
    </Link>
  );
}
