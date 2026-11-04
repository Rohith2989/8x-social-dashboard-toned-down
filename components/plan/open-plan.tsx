"use client";

import { useEffect } from "react";
import { day } from "@/lib/format";
import { FILTER_EMPTY, FILTER_LABELS, MAYA, filtersFor, matchesFilter, type Filter, type Plan, type Script } from "@/lib/plan";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { Menu } from "../ui/menu";
import { PlatformIcon } from "../ui/platform-icon";
import { useSideways } from "../ui/sideways";
import { reviewIn, unreadOf, usePlanState } from "./store";
import { planState, resultsOf, stateOf, when, type Tone } from "./words";
import styles from "./open-plan.module.css";

/*
  The open plan (was: the picker row, the filter, the timestamps, the pills and Approve all remaining). Its name, its
  dates, who shared it and when, when it last changed and when the brand last reviewed it, and where it stands in
  words. Show narrows the scripts (the product's filter, approval only while the plan waits for it). On a plan waiting
  for approval, Approve the ones waiting does what it says, asking first; flagged scripts stay flagged.
  The scripts as tiles in the plan's order, "Script 1" to "Script N" (a brand talks about scripts by number): each
  with a picture of what it asks for (its reference while it waits, its best post once creators have it), its name,
  where it stands in words, and on a plan creators have, what its posts came to. The open one is outlined in ink; a
  dot says Maya wrote something new. They wrap on a laptop and run sideways on a phone.
*/

export function OpenPlan({
  plan,
  open,
  show,
  onShow,
  onOpen,
  onApproveRest,
}: {
  plan: Plan;
  open: Script | null;
  show: Filter;
  onShow: (f: Filter) => void;
  onOpen: (n: number) => void;
  onApproveRest: (scripts: Script[]) => void;
}) {
  const st = usePlanState();
  const reviews = new Map(plan.scripts.map((s) => [s.id, reviewIn(s, st)]));
  const shown = plan.scripts.filter((s) => matchesFilter(reviews.get(s.id)!, show));
  const waiting = plan.scripts.filter((s) => reviews.get(s.id)!.state === "awaitingReview");
  const flagged = plan.scripts.filter((s) => reviews.get(s.id)!.state === "flagged");
  const approvable = plan.stage === "review" ? waiting : [];
  const counts: Record<Filter, number> = {
    all: plan.scripts.length,
    flagged: flagged.length,
    unflagged: plan.scripts.length - flagged.length,
    approved: plan.scripts.filter((s) => reviews.get(s.id)!.state === "approved").length,
    unapproved: plan.scripts.length - plan.scripts.filter((s) => reviews.get(s.id)!.state === "approved").length,
  };

  const { ref, reveal, bind } = useSideways<HTMLOListElement>();
  useEffect(() => {
    reveal(ref.current?.querySelector<HTMLElement>(`[data-script="${open?.id}"]`) ?? null);
  }, [open?.id, ref, reveal]);

  return (
    <section className={styles.panel} aria-label={plan.name}>
      <header className={styles.head}>
        <div className={styles.title}>
          <h2>{plan.name}</h2>
          <p className={styles.meta}>
            <span>
              {plan.window}, {plan.days} {plan.days === 1 ? "day" : "days"}
            </span>
            <span>
              {MAYA} shared it {when(plan.shared)}
            </span>
            {plan.lastModified && <span>Last changed {day(plan.lastModified.slice(0, 10))}</span>}
            {plan.lastReviewed && <span>Last reviewed {day(plan.lastReviewed.slice(0, 10))}</span>}
          </p>
          <p className={styles.where} data-stage={plan.stage}>
            {planState(plan, waiting.length, flagged.length)}
          </p>
        </div>
        {plan.scripts.length > 0 && (
          <div className={styles.tools}>
            <Menu
              label="Show"
              value={show}
              onChange={onShow}
              align="end"
              options={filtersFor(plan.stage).map((f) => ({ id: f, label: FILTER_LABELS[f], count: counts[f] }))}
            />
            {approvable.length > 0 && (
              <span title={`Approves the ${approvable.length === 1 ? "script" : `${approvable.length} scripts`} you have not approved yet. Flagged scripts stay flagged.`}>
                <Button variant="ink" icon={<Icon name="heart" size={18} />} onClick={() => onApproveRest(approvable)}>
                  {approvable.length === plan.scripts.length ? "Approve all" : `Approve the ${approvable.length} waiting`}
                </Button>
              </span>
            )}
          </div>
        )}
      </header>

      {plan.scripts.length === 0 ? (
        <p className={styles.empty}>This plan has no scripts in it yet.</p>
      ) : shown.length === 0 ? (
        <p className={styles.empty}>
          {FILTER_EMPTY[show]}{" "}
          <button type="button" onClick={() => onShow("all")}>
            Show all {plan.scripts.length}
          </button>
        </p>
      ) : (
        <ol ref={ref} className={styles.scripts} aria-label="Scripts in this plan" {...bind}>
          {shown.map((s, i) => {
            const state = stateOf(reviews.get(s.id)!, plan);
            const unread = unreadOf(s, st);
            return (
              <li key={s.id} data-script={s.id} style={{ "--i": i } as React.CSSProperties}>
                <button
                  type="button"
                  className={styles.tile}
                  aria-current={s.id === open?.id ? "true" : undefined}
                  onClick={() => onOpen(s.n)}
                  aria-label={`Script ${s.n}, ${s.format.name}${state.text ? `: ${state.text}` : ""}${unread ? `. New from ${MAYA}` : ""}`}
                >
                  <Thumb script={s} plan={plan} />
                  <span className={styles.text}>
                    <span className={styles.number}>Script {s.n}</span>
                    <strong className={styles.name}>{s.format.name}</strong>
                    {state.text && (
                      <span className={styles.state} data-tone={state.tone}>
                        <Glyph tone={state.tone} />
                        {state.text}
                      </span>
                    )}
                    {plan.stage !== "review" && <span className={styles.results}>{resultsOf(s)}</span>}
                  </span>
                  {unread && <i className={styles.unread} title={`New from ${MAYA}`} />}
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

// a picture of what the script asks for: its reference while the plan waits, its best post once creators have it
export function Thumb({ script, plan, className }: { script: Script; plan: Plan; className?: string }) {
  const best = plan.stage !== "review" ? script.posts.find((p) => p.poster) : undefined;
  const ref = script.references[0];
  const src = best?.poster ?? (ref?.kind === "post" ? ref.poster : null);
  return (
    <span className={`${styles.thumb} ${className ?? ""}`} aria-hidden data-blank={src ? undefined : ""}>
      {src ? (
        <img src={src} alt="" width={45} height={80} loading="lazy" />
      ) : (
        <>
          <svg viewBox="0 0 45 80" preserveAspectRatio="none">
            <rect x="1" y="1" width="43" height="78" rx="9" />
          </svg>
          {ref?.kind === "link" && ref.source !== "youtube" ? <PlatformIcon platform={ref.source} size={18} /> : <Icon name={ref ? "play" : "plan"} size={18} />}
        </>
      )}
    </span>
  );
}

// the mark before a state's words
export function Glyph({ tone }: { tone: Tone }) {
  if (tone === "flagged") return <Icon name="flag" size={14} stroke={2} />;
  if (tone === "approved")
    return (
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
        <path d="M8 13.6S2 10.2 2 6.1A3.1 3.1 0 0 1 8 4.6a3.1 3.1 0 0 1 6 1.5c0 4.1-6 7.5-6 7.5Z" fill="currentColor" />
      </svg>
    );
  if (tone === "waiting")
    return (
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
        <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="0 3.4" />
      </svg>
    );
  if (tone === "updated")
    return (
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
        <circle cx="8" cy="8" r="3.4" fill="currentColor" />
      </svg>
    );
  return null;
}
