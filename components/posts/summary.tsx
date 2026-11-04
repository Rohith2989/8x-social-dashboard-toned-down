"use client";

import { useState } from "react";
import { MILESTONES, keeps, milestoneLabel, type FeedPost, type Milestone, type MilestoneKey, type PostsQuery } from "@/lib/posts";
import { compact } from "@/lib/format";
import { Card } from "../ui/card";
import { RollingNumber } from "../ui/rolling-number";
import styles from "./summary.module.css";

/*
  The summary (was: the stat strip of four totals): two colour blocks, both about the posts in view, so they follow
  every filter, the numbers rolling to their new values.
  - The posts (deep blue): how many are in view, their views large, then likes, comments, shares and the engagement
    rate. Shares a platform has not reported are left out of the sum, and the block says how many.
  - How far they got (pale ground): the product's milestone ladder, each post a dot under the highest milestone it
    passed, the count over each rung and the milestone under it; the rungs nobody has reached yet are outlined in
    dots, the first of them marked as next. Pointing at a rung says what it holds; pressing it shows the posts that
    passed it (the product's performance filter: every bucket from that rung up), pressing it again shows them all.
*/

export function Summary({ all, list, query, onPassed }: { all: FeedPost[]; list: FeedPost[]; query: PostsQuery; onPassed: (m: MilestoneKey | null) => void }) {
  // the ladder counts the posts in view by every filter but its own, so picking a rung keeps the others in sight
  const scope = all.filter((p) => keeps(p, query, "passed"));
  return (
    <div className={styles.rows}>
      <section className={styles.summary} aria-label="The posts in view">
        <Totals list={list} total={all.length} />
        <Ladder scope={scope} passed={query.passed} onPassed={onPassed} />
      </section>
    </div>
  );
}

function Totals({ list, total }: { list: FeedPost[]; total: number }) {
  const sum = (f: (p: FeedPost) => number) => list.reduce((a, p) => a + f(p), 0);
  const views = sum((p) => p.views);
  const likes = sum((p) => p.likes);
  const comments = sum((p) => p.comments);
  const shares = sum((p) => p.shares ?? 0);
  const unreported = list.filter((p) => p.shares == null).length;
  const engagement = views ? ((likes + comments + shares) / views) * 100 : 0;
  return (
    <Card tone="aura" order={0} className={styles.totals} label="The posts">
      <div className={styles.head}>
        <h2>The posts</h2>
        <p>{list.length === total ? <>All {total}</> : <>{list.length} of {total}</>}</p>
      </div>
      <div className={styles.views}>
        <RollingNumber value={compact(views)} className={`num ${styles.big}`} />
        <span>views</span>
      </div>
      <dl className={styles.figures}>
        <div>
          <dt>Likes</dt>
          <dd>
            <RollingNumber value={compact(likes)} className="num" />
          </dd>
        </div>
        <div>
          <dt>Comments</dt>
          <dd>
            <RollingNumber value={compact(comments)} className="num" />
          </dd>
        </div>
        <div title={unreported ? `${unreported} Instagram ${unreported === 1 ? "post has" : "posts have"} not reported shares yet; ${unreported === 1 ? "it counts" : "they count"} as none` : undefined}>
          <dt>
            Shares{unreported ? <span className={styles.na}> · {unreported} N/A</span> : null}
          </dt>
          <dd>
            <RollingNumber value={compact(shares)} className="num" />
          </dd>
        </div>
        <div>
          <dt>Engagement</dt>
          <dd>
            <RollingNumber value={`${engagement.toFixed(1)}%`} className="num" />
          </dd>
        </div>
      </dl>
    </Card>
  );
}

// the posts under each rung: from its milestone up to the next one's
function rungs(scope: FeedPost[]) {
  return MILESTONES.map((m, i) => {
    const next = MILESTONES[i + 1];
    const posts = scope.filter((p) => p.views >= m.at && (!next || p.views < next.at));
    return { m, next, posts };
  });
}

const DOTS_SHOWN = 120;

function Ladder({ scope, passed, onPassed }: { scope: FeedPost[]; passed: MilestoneKey | null; onPassed: (m: MilestoneKey | null) => void }) {
  const [over, setOver] = useState<number | null>(null);
  const all = rungs(scope);
  const under = scope.filter((p) => p.views < MILESTONES[0].at).length;
  const top = [...all].reverse().find((r) => r.posts.length);
  const topAt = top ? all.indexOf(top) : -1;
  // only the rungs above the highest reached are still to reach; an empty rung below it was passed on the way up
  const unreached = (i: number) => scope.length > 0 && i > topAt;
  const firstEmpty = scope.length ? topAt + 1 : -1;
  const at = passed ? MILESTONES.findIndex((m) => m.key === passed) : -1;
  const passedCount = at >= 0 ? scope.filter((p) => p.views >= MILESTONES[at].at).length : 0;
  const reached = (m: Milestone) => scope.filter((p) => p.views >= m.at).length;

  // the line under the title: the rung pointed at, or what is picked, or the highest rung the posts have reached
  const hovered = over != null ? all[over] : null;
  const line = hovered
    ? hovered.posts.length
      ? `${hovered.posts.length} ${hovered.posts.length === 1 ? "post" : "posts"} between ${milestoneLabel(hovered.m)} and ${hovered.next ? milestoneLabel(hovered.next) : "beyond"} views. Press to show the ${reached(hovered.m)} that passed ${milestoneLabel(hovered.m)}.`
      : unreached(over as number)
        ? `No post has reached ${milestoneLabel(hovered.m)} views yet.`
        : `No post in view stopped between ${milestoneLabel(hovered.m)} and ${hovered.next ? milestoneLabel(hovered.next) : "beyond"}.`
    : passed
      ? `Showing the ${passedCount} that passed ${milestoneLabel(MILESTONES[at])} views.`
      : top
        ? `${reached(top.m)} passed ${milestoneLabel(top.m)} views; most land between ${milestoneLabel(busiest(all).m)} and ${busiest(all).next ? milestoneLabel(busiest(all).next as Milestone) : "beyond"}.`
        : scope.length
          ? "No post has passed 300 views yet."
          : "No posts in view.";

  return (
    <Card order={1} className={styles.ladderCard} label="How far they got">
      <div className={styles.head}>
        <h2>How far they got</h2>
        {passed && (
          <button type="button" className={styles.all} onClick={() => onPassed(null)}>
            Show all
          </button>
        )}
      </div>
      <p className={styles.line} aria-live="polite">
        {line}
      </p>

      <ol className={styles.ladder} onPointerLeave={() => setOver(null)} data-picked={passed ? "" : undefined}>
        {all.map((r, i) => {
          const empty = !r.posts.length;
          const on = at >= 0 && i >= at;
          return (
            <li key={r.m.key}>
              <button
                type="button"
                className={styles.rung}
                data-tier={r.m.tier}
                data-empty={empty || undefined}
                data-on={on || undefined}
                aria-pressed={i === at}
                disabled={empty}
                onPointerEnter={() => setOver(i)}
                onFocus={() => setOver(i)}
                onBlur={() => setOver(null)}
                onClick={() => onPassed(i === at ? null : r.m.key)}
                aria-label={empty ? `${milestoneLabel(r.m)}: no post yet` : `${milestoneLabel(r.m)}: ${r.posts.length} posts. Show the ${reached(r.m)} that passed it`}
              >
                <span className={`num ${styles.count}`}>
                  {empty ? i === firstEmpty ? <em className={styles.next}>next</em> : unreached(i) || !scope.length ? "" : "0" : r.posts.length}
                </span>
                <span className={styles.dots} aria-hidden>
                  {empty ? (
                    unreached(i) ? (
                      <svg className={styles.outline}>
                        <rect x="1" y="1" rx="9" />
                      </svg>
                    ) : null
                  ) : (
                    r.posts.slice(0, DOTS_SHOWN).map((p, k) => <i key={p.id} style={{ "--k": k } as React.CSSProperties} />)
                  )}
                </span>
                <span className={styles.label}>{milestoneLabel(r.m)}</span>
              </button>
            </li>
          );
        })}
      </ol>
      {under > 0 && <p className={styles.under}>{under} under 300 views</p>}
    </Card>
  );
}

const busiest = (all: ReturnType<typeof rungs>) => all.reduce((a, r) => (r.posts.length > a.posts.length ? r : a), all[0]);
