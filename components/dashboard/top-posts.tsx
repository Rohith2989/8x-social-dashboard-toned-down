"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TOP_POSTS, PLATFORM_LABELS, type Post } from "@/lib/demo";
import { POSTS } from "@/lib/roster";
import { compact, day } from "@/lib/format";
import { Card } from "../ui/card";
import { Avatar } from "../ui/bits";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { PlatformIcon } from "../ui/platform-icon";
import styles from "./top-posts.module.css";

/*
  The posts that did best (kit: individual posts third), as they went out: 9:16, the creator's own video, framed
  only by the platform's icon and its length. Pointing at one plays it, muted, with its progress in fine dots along
  its foot; on a touch screen a tap plays it. The best one's rank is lit. Its caption opens it in Posts & feed, and
  View all opens the feed.
*/

export function TopPosts() {
  return (
    <section id="top-posts" className={styles.section} aria-labelledby="top-posts-title">
      <div className={styles.head}>
        <div>
          <h2 id="top-posts-title">Top-performing posts</h2>
          <p>By views, since the campaign began</p>
        </div>
        <Button variant="stone" iconAfter={<Icon name="arrow" size={18} />} href="/posts">
          View all {POSTS.length}
        </Button>
      </div>
      <ol className={styles.list}>
        {TOP_POSTS.map((p, i) => (
          <li key={p.id}>
            <PostCard post={p} rank={i + 1} order={i} />
          </li>
        ))}
      </ol>
    </section>
  );
}

const TICKS = 22;

function PostCard({ post, rank, order }: { post: Post; rank: number; order: number }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [lit, setLit] = useState(0);

  // the progress in dots, while it plays
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      const v = video.current;
      if (v && v.duration) setLit(Math.round((v.currentTime / v.duration) * TICKS));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const play = () => {
    const v = video.current;
    if (!v) return;
    v.play().then(() => setPlaying(true)).catch(() => {});
  };
  const stop = () => {
    video.current?.pause();
    setPlaying(false);
  };

  return (
    <Card order={order} className={styles.card} label={`${rank}. ${post.creator.name} on ${PLATFORM_LABELS[post.platform]}`}>
      <div
        className={`${styles.media} ${playing ? styles.playing : ""}`}
        onPointerEnter={(e) => e.pointerType === "mouse" && play()}
        onPointerLeave={(e) => e.pointerType === "mouse" && stop()}
      >
        <video ref={video} src={post.video} poster={post.poster} muted loop playsInline preload="none" aria-label={`${post.creator.name}: ${post.caption}`} />
        <PlatformIcon platform={post.platform} size={28} className={styles.platform} />
        <button type="button" className={styles.play} onClick={() => (playing ? stop() : play())} aria-label={playing ? "Pause" : "Play"} data-anim-host>
          <Icon name={playing ? "pause" : "play"} size={18} />
        </button>
        <span className={`${styles.duration} mono`}>
          <span className={styles.posted}>{day(post.postedAt)}</span>
          <i aria-hidden />
          {post.duration}
        </span>
        <span className={styles.progress} aria-hidden>
          {Array.from({ length: TICKS }, (_, k) => (
            <i key={k} className={k < lit ? styles.tickLit : undefined} />
          ))}
        </span>
      </div>

      <div className={styles.info}>
        <div className={styles.top}>
          <span className={`num ${styles.rank} ${rank === 1 ? styles.first : ""}`}>{String(rank).padStart(2, "0")}</span>
          <p className={styles.views}>
            <span className="num">{compact(post.views)}</span>
            <span className={styles.viewsWord}> views</span>
          </p>
        </div>
        <Link className={styles.caption} href={`/posts?open=${POSTS.find((x) => x.top && x.creatorId === post.creator.id)?.id ?? ""}`} title="Open this post in Posts & feed">
          {post.caption}
        </Link>
        <div className={styles.who}>
          <Avatar src={post.creator.avatar} size={26} />
          <span className={styles.name}>{post.creator.name}</span>
        </div>
        <dl className={styles.metrics}>
          <div title="Likes">
            <dt>
              <Icon name="heart" size={16} />
              <span className="sr-only">Likes</span>
            </dt>
            <dd className="mono">{compact(post.likes)}</dd>
          </div>
          <div title="Comments">
            <dt>
              <Icon name="comment" size={16} />
              <span className="sr-only">Comments</span>
            </dt>
            <dd className="mono">{compact(post.comments)}</dd>
          </div>
          <div title="Shares">
            <dt>
              <Icon name="share" size={16} />
              <span className="sr-only">Shares</span>
            </dt>
            <dd className="mono">{post.shares === null ? "N/A" : compact(post.shares)}</dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}
