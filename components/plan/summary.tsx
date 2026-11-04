"use client";

import { useEffect } from "react";
import { compact, day } from "@/lib/format";
import { PLANS, STAGE_LABELS, TODAY, WHAT_WORKS, daysBetween, type Plan, type ReviewState, type Stage } from "@/lib/plan";
import { Card } from "../ui/card";
import { Icon } from "../ui/icon";
import { useSideways } from "../ui/sideways";
import { reviewIn, unreadOf, usePlanState } from "./store";
import styles from "./summary.module.css";

/*
  The summary (was: the stage tabs and the plan picker): two colour blocks.
  - The plans (deep blue): the campaign's plans in time, oldest to newest, a column a plan, the product's stages over
    them as words. Each column: the plan's name and dates, its scripts as numbered marks in their state, one line of
    what it is, and its days as a strip, today lit. The open plan is the white column; pressing another opens it.
    Past a handful of plans the row scrolls sideways, resting on whole columns, and keeps the open one in view.
  - What works (pale ground): the scripts with the most views a post so far, across every plan they ran in, each with
    its best post; pressing one opens it in the newest plan that carries it.
*/

export function Summary({ open, onPlan, onScript }: { open: Plan; onPlan: (key: string) => void; onScript: (id: string) => void }) {
  return (
    <div className={styles.rows}>
      <div className={styles.summary}>
        <Plans open={open} onPlan={onPlan} />
        <Works onScript={onScript} />
      </div>
    </div>
  );
}

// the product's stages, in the order the plans run, with how many plans each holds
const ERAS: Stage[] = ["past", "live", "review"];

function Plans({ open, onPlan }: { open: Plan; onPlan: (key: string) => void }) {
  const st = usePlanState();
  const { ref, edge, page, reveal, bind } = useSideways<HTMLDivElement>("li");

  // the open plan stays in view: on arrival, and when another is opened from elsewhere
  useEffect(() => {
    reveal(ref.current?.querySelector<HTMLElement>(`[data-plan="${open.key}"]`) ?? null, false);
  }, [open.key, ref, reveal]);

  const eras = ERAS.map((stage) => ({ stage, count: PLANS.filter((p) => p.stage === stage).length })).filter((e) => e.count);

  return (
    <Card tone="aura" order={0} className={styles.plans} label="The plans">
      <div className={styles.head}>
        <h2>The plans</h2>
        <p>One a week since {day(PLANS[0].start)}</p>
      </div>
      <div className={styles.laneWrap} data-start={edge.start || undefined} data-end={edge.end || undefined}>
        <button type="button" className={`${styles.arrow} ${styles.prev}`} onClick={() => page(-1)} aria-label="Earlier plans" tabIndex={edge.start ? -1 : 0} data-anim-host>
          <Icon name="left" size={18} stroke={2} />
        </button>
        <div ref={ref} className={styles.lane} {...bind}>
          <div className={styles.grid} style={{ "--plans": PLANS.length } as React.CSSProperties}>
            <div className={styles.eras} aria-hidden>
              {eras.map((e) => (
                <span key={e.stage} style={{ gridColumn: `span ${e.count}` }} data-stage={e.stage}>
                  {STAGE_LABELS[e.stage]}
                </span>
              ))}
            </div>
            <ol className={styles.track} aria-label="Plans, oldest first">
              {PLANS.map((p, i) => (
                <li key={p.key} data-plan={p.key} style={{ "--i": i } as React.CSSProperties}>
                  <PlanColumn plan={p} open={p.key === open.key} states={p.scripts.map((s) => reviewIn(s, st).state)} unread={p.scripts.some((s) => unreadOf(s, st))} onOpen={() => onPlan(p.key)} />
                </li>
              ))}
            </ol>
          </div>
        </div>
        <button type="button" className={`${styles.arrow} ${styles.next}`} onClick={() => page(1)} aria-label="Later plans" tabIndex={edge.end ? -1 : 0} data-anim-host>
          <Icon name="right" size={18} stroke={2} />
        </button>
      </div>
    </Card>
  );
}

function PlanColumn({ plan, open, states, unread, onOpen }: { plan: Plan; open: boolean; states: ReviewState[]; unread: boolean; onOpen: () => void }) {
  const posts = plan.scripts.reduce((a, s) => a + s.results.posts, 0);
  const views = plan.scripts.reduce((a, s) => a + s.results.views, 0);
  const waiting = states.filter((s) => s === "awaitingReview").length;
  const flagged = states.filter((s) => s === "flagged").length;
  const today = daysBetween(plan.start, TODAY);

  // what it is, in two short lines: the figure that matters, and what goes with it
  const [line, under] =
    plan.stage === "past"
      ? [`${posts} posts`, `${compact(views)} views`]
      : plan.stage === "live"
        ? [`Day ${today + 1} of ${plan.days}`, `${posts} posts so far`]
        : [waiting ? `${waiting} waiting for you` : flagged ? `${flagged} flagged` : "All approved", `Goes out ${day(plan.start)}`];

  // a script's mark: on a plan creators have, an approval reads as done and a change since as updated
  const mark = (s: ReviewState, i: number) => {
    if (s === "flagged") return "flagged";
    if (s === "approved") return "approved";
    if (plan.stage !== "review") return plan.scripts[i].events.some((e) => e.kind === "revised") ? "updated" : "approved";
    return "waiting";
  };

  return (
    <button
      type="button"
      className={styles.plan}
      data-stage={plan.stage}
      aria-pressed={open}
      onClick={onOpen}
      aria-label={`${plan.name}, ${plan.window}: ${line}, ${under}${unread ? ". New from Maya" : ""}`}
    >
      {unread && <i className={styles.unread} aria-hidden />}
      <span className={styles.title}>
        <strong className={styles.name}>{plan.name}</strong>
        <span className={styles.window}>{plan.window}</span>
      </span>
      <span className={styles.marks} aria-hidden>
        {states.map((s, i) => (
          <i key={i} data-mark={mark(s, i)}>
            {mark(s, i) === "waiting" && (
              <svg viewBox="0 0 20 20">
                <rect x="0.8" y="0.8" width="18.4" height="18.4" rx="5.6" />
              </svg>
            )}
            {i + 1}
          </i>
        ))}
      </span>
      <span className={styles.line}>{line}</span>
      <span className={styles.under}>{under}</span>
    </button>
  );
}

function Works({ onScript }: { onScript: (id: string) => void }) {
  const top = WHAT_WORKS.slice(0, 3);
  return (
    <Card order={1} className={styles.works} label="What works">
      <div className={styles.head}>
        <h2>What works</h2>
        <p>Views a post</p>
      </div>
      <ol className={styles.workList}>
        {top.map((w, i) => (
          <li key={w.code} style={{ "--i": i } as React.CSSProperties}>
            <button type="button" className={styles.work} onClick={() => onScript(w.newest.id)} data-anim-host>
              <span className={styles.poster} aria-hidden>
                {w.best.poster && <img src={w.best.poster} alt="" width={45} height={80} loading="lazy" />}
              </span>
              <span className={styles.workText} title={`${w.posts} posts over ${w.plans} ${w.plans === 1 ? "plan" : "plans"}`}>
                <strong>{w.name}</strong>
              </span>
              <span className={styles.figure}>
                <b className="num">{compact(w.avg)}</b>
                <span>a post</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </Card>
  );
}
