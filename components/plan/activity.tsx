"use client";

import { useEffect, useRef, useState } from "react";
import { day } from "@/lib/format";
import { MAYA, PEOPLE, TODAY, daysBetween, fieldsLabel, reasonsLabel, type Plan, type Script, type ThreadEvent } from "@/lib/plan";
import { Icon } from "../ui/icon";
import { Sheet } from "../ui/sheet";
import { comment, eventsOf, markRead, reviewIn, usePlanState } from "./store";
import { Glyph } from "./open-plan";
import { stateOf } from "./words";
import styles from "./activity.module.css";

/*
  One script's activity (was: the script's activity panel), in the window's right-hand column (a sheet below 1360 px):
  everything the brand and Maya said and did on it, oldest at the top, opening on the newest, with the box to write in
  under it. Its number, name and state head it, as the sheet says them. Comments carry the writer's initials, name and
  time, the brand's own on the vertical's light, 8x's on a quiet ground; everything else is one line on a mark of its
  kind (approved, flagged with its reasons and note, sent back with Maya's note, changed with the fields it changed,
  added). 8x people by first name with "· 8x". Days read Today, Yesterday, 2 Nov; times are UTC, as every date on
  these screens is. What Maya wrote counts as seen once the thread has been on screen a moment.
*/

export function Activity({ script, plan, onClose }: { script: Script; plan: Plan; onClose?: () => void }) {
  const st = usePlanState();
  const events = [...eventsOf(script, st)].sort((a, b) => (a.at < b.at ? -1 : 1));
  const state = stateOf(reviewIn(script, st), plan);
  const thread = useRef<HTMLDivElement>(null);

  // seen, once the thread has been on screen a moment (a folded-away column is not on screen)
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (thread.current?.getClientRects().length) markRead(script.id);
    }, 1600);
    return () => window.clearTimeout(t);
  }, [script.id]);

  // it opens on the newest, and a new entry keeps the view at the foot
  useEffect(() => {
    const el = thread.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [script.id, events.length]);

  return (
    <div className={styles.activity}>
      <header className={styles.head}>
        <p className={styles.eyebrow}>Script {script.n} · Activity</p>
        <h2>{script.format.name}</h2>
        {state.text && (
          <p className={styles.state} data-tone={state.tone}>
            <Glyph tone={state.tone} />
            {state.text}
          </p>
        )}
        {onClose && (
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close the activity" data-anim-host>
            <Icon name="close" size={18} />
          </button>
        )}
      </header>

      <div ref={thread} className={styles.thread}>
        {events.length === 0 ? <p className={styles.empty}>No comments or changes yet.</p> : <Thread events={events} />}
      </div>

      <Composer key={script.id} scriptId={script.id} />
    </div>
  );
}

export function ActivitySheet({ script, plan, open, onClose }: { script: Script | null; plan: Plan; open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open && !!script} onClose={onClose} label={script ? `Script ${script.n} · Activity` : "Activity"}>
      {script && open && <Activity script={script} plan={plan} onClose={onClose} />}
    </Sheet>
  );
}

function dayLabel(iso: string) {
  const d = daysBetween(iso, TODAY);
  return d === 0 ? "Today" : d === 1 ? "Yesterday" : day(iso);
}

function Thread({ events }: { events: ThreadEvent[] }) {
  const items: React.ReactNode[] = [];
  let last: string | null = null;
  events.forEach((e, i) => {
    const d = e.at.slice(0, 10);
    if (d !== last) {
      last = d;
      items.push(
        <li key={`day-${d}`} className={styles.day}>
          {dayLabel(d)}
        </li>,
      );
    }
    items.push(
      <li key={e.id} className={styles.entry} style={{ "--r": events.length - 1 - i } as React.CSSProperties}>
        {e.kind === "comment" ? <Comment e={e} /> : <Line e={e} />}
      </li>,
    );
  });
  return (
    <ol className={styles.list} aria-label="Activity, oldest first">
      {items}
    </ol>
  );
}

const time = (e: ThreadEvent) => (
  <time dateTime={e.at} className="mono">
    {e.at.slice(11, 16)}
  </time>
);

function Comment({ e }: { e: Extract<ThreadEvent, { kind: "comment" }> }) {
  const who = PEOPLE[e.who];
  return (
    <div className={styles.comment} data-side={who.side} data-you={e.who === "you" || undefined}>
      <span className={styles.disc} aria-hidden>
        {who.photo ? <img src={who.photo} alt="" width={256} height={256} /> : who.initials}
      </span>
      <div className={styles.text}>
        <p className={styles.by}>
          <strong>{who.name}</strong>
          {time(e)}
        </p>
        <p className={styles.words}>{e.body}</p>
      </div>
    </div>
  );
}

const MARKS = {
  approved: (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
      <path d="M8 13.6S2 10.2 2 6.1A3.1 3.1 0 0 1 8 4.6a3.1 3.1 0 0 1 6 1.5c0 4.1-6 7.5-6 7.5Z" fill="currentColor" />
    </svg>
  ),
  flagged: <Icon name="flag" size={15} stroke={2} />,
  flagResolved: <Icon name="check" size={15} stroke={2} />,
  revised: <Icon name="pencil" size={14} stroke={1.8} />,
  added: <Icon name="plus" size={15} stroke={2} />,
} as const;

function Line({ e }: { e: Exclude<ThreadEvent, { kind: "comment" }> }) {
  const who = PEOPLE[e.who];
  const phrase =
    e.kind === "approved"
      ? "approved this script"
      : e.kind === "flagged"
        ? "flagged this script"
        : e.kind === "flagResolved"
          ? "sent it back"
          : e.kind === "revised"
            ? `changed ${fieldsLabel(e.fields)}`
            : "added this script";
  const reasons = e.kind === "flagged" || e.kind === "flagResolved" ? e.reasons : null;
  const note = e.kind === "flagged" || e.kind === "flagResolved" ? e.note : null;
  return (
    <div className={styles.line} data-kind={e.kind}>
      <span className={styles.mark} aria-hidden>
        {MARKS[e.kind]}
      </span>
      <div className={styles.text}>
        <p className={styles.sentence}>
          <strong>{who.name}</strong> {phrase}
          {time(e)}
        </p>
        {reasons && <p className={styles.reasons}>{reasonsLabel(reasons)}</p>}
        {note && <p className={styles.note}>{note}</p>}
      </div>
    </div>
  );
}

// the box to write in: one field with send inside it; Ctrl or Cmd and Enter sends too
function Composer({ scriptId }: { scriptId: string }) {
  const [text, setText] = useState("");
  const send = () => {
    const body = text.trim();
    if (!body) return;
    comment(scriptId, body);
    setText("");
  };
  return (
    <form
      className={styles.composer}
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      <textarea
        rows={1}
        value={text}
        maxLength={2000}
        placeholder={`Write to ${MAYA}`}
        aria-label={`Write to ${MAYA} about this script`}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            send();
          }
        }}
      />
      <button type="submit" disabled={!text.trim()} aria-label="Send" title="Send (Ctrl and Enter)" data-anim-host>
        <Icon name="send" size={17} />
      </button>
    </form>
  );
}
