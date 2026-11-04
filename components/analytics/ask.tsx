"use client";

import { useEffect, useRef, useState } from "react";
import { compact, day, full } from "@/lib/format";
import { POSTS, ROSTER } from "@/lib/roster";
import { CAMPAIGN_START, CHANNELS, GA_DAYS, change, money, price, report, windowOf, type Window } from "@/lib/analytics";
import { Dialog } from "../ui/dialog";
import { Icon } from "../ui/icon";
import styles from "./ask.module.css";
import shared from "../creators/dialogs.module.css";

/*
  Ask about this data (was: the analytics assistant). It answers from the window on screen and nothing else, as the
  product's does, so what it says and what the page shows cannot come apart; every figure it gives is worked out from
  the same report, and it says which. Its three openers (the product's) are a press each; a question it cannot answer
  from these figures says so, and points at what it can.
*/

type Q = "stands" | "channel" | "changed";

const OPENERS: { id: Q; text: string }[] = [
  { id: "stands", text: "What stands out in this window?" },
  { id: "channel", text: "Which channel is driving the most revenue?" },
  { id: "changed", text: "How did the campaign change what the site was doing?" },
];

type Turn = { id: number; q: string; a: React.ReactNode };

const pct = (n: number | null) => (n == null ? "N/A" : `${n >= 0 ? "+" : "−"}${Math.abs(Math.round(n))}%`);

function answer(q: Q, win: Window): React.ReactNode {
  const now = report(win.start, win.end);
  const was = report(win.prev.start, win.prev.end);
  const period = `${day(win.start)} – ${day(win.end)}`;
  const before = `${day(win.prev.start)} – ${day(win.prev.end)}`;

  if (q === "stands") {
    const best = [...now.days].filter((d) => d.settled).sort((a, b) => b.sessions - a.sessions)[0];
    const usual = report(GA_DAYS[0].date, new Date(Date.parse(CAMPAIGN_START) - 864e5).toISOString().slice(0, 10));
    const usualDay = usual.totals.sessions / Math.max(1, usual.days.length);
    const top = POSTS.filter((p) => p.postedAt.slice(0, 10) === best.date).sort((a, b) => b.views - a.views)[0];
    const who = top && ROSTER.find((c) => c.id === top.creatorId);
    const s = now.channels.organicSocial;
    const sw = was.channels.organicSocial;
    return (
      <>
        <p>
          Revenue came to <b>{money(now.totals.revenueCents)}</b> over {period}, <b>{pct(change(now.totals.revenueCents, was.totals.revenueCents))}</b> on {before}, with sales{" "}
          {pct(change(now.totals.transactions, was.totals.transactions))} and sessions {pct(change(now.totals.sessions, was.totals.sessions))}.
        </p>
        <p>
          The busiest day was <b>{day(best.date, true)}</b>: {full(best.sessions)} sessions, {pct(((best.sessions - usualDay) / usualDay) * 100)} on a usual day before 8x
          {who && top ? (
            <>
              , the day {who.name.split(" ")[0]}&rsquo;s post went out ({compact(top.views)} views)
            </>
          ) : null}
          .
        </p>
        <p>
          Organic Social, where creators&rsquo; clicks land, went from {compact(sw.sessions)} to <b>{compact(s.sessions)}</b> sessions and brought{" "}
          {Math.round((s.transactions / Math.max(1, now.totals.transactions)) * 100)}% of the sales.
        </p>
      </>
    );
  }

  if (q === "channel") {
    const ranked = CHANNELS.map((c) => ({ ...c, now: now.channels[c.key].revenueCents, was: was.channels[c.key].revenueCents })).sort((a, b) => b.now - a.now);
    const grew = [...ranked].sort((a, b) => (change(b.now, b.was) ?? -1) - (change(a.now, a.was) ?? -1))[0];
    return (
      <>
        <p>
          <b>{ranked[0].label}</b> brought the most revenue over {period}: {money(ranked[0].now)}, {Math.round((ranked[0].now / Math.max(1, now.totals.revenueCents)) * 100)}% of it.
          Then:
        </p>
        <ol className={styles.list}>
          {ranked.slice(1, 5).map((c) => (
            <li key={c.key}>
              {c.label}, {money(c.now)} <span>({pct(change(c.now, c.was))})</span>
            </li>
          ))}
        </ol>
        <p>
          The one that grew most is <b>{grew.label}</b>, {pct(change(grew.now, grew.was))} on {before}.
        </p>
      </>
    );
  }

  const since = windowOf("since");
  const a = report(since.prev.start, since.prev.end);
  const b = report(since.start, since.end);
  const row = (label: string, x: number, y: number, f: (n: number) => string) => (
    <li key={label}>
      {label}: {f(x)} to <b>{f(y)}</b> <span>({pct(change(y, x))})</span>
    </li>
  );
  return (
    <>
      <p>
        The campaign&rsquo;s {since.days} days against the {since.days} before it began:
      </p>
      <ul className={styles.list}>
        {row("Revenue", a.totals.revenueCents, b.totals.revenueCents, money)}
        {row("Sales", a.totals.transactions, b.totals.transactions, full)}
        {row("Sessions", a.totals.sessions, b.totals.sessions, compact)}
        {row("Visitors", a.totals.users, b.totals.users, compact)}
        {row("New visitors", a.newUsers, b.newUsers, compact)}
      </ul>
      <p>
        Mobile went from {Math.round((a.devices.mobile / a.totals.sessions) * 100)}% of sessions to {Math.round((b.devices.mobile / b.totals.sessions) * 100)}%, as visits from
        the videos arrived. Each sale cost <b>{price(b.spendCents / Math.max(1, b.totals.transactions))}</b> of the spend with 8x; revenue was{" "}
        {(b.totals.revenueCents / Math.max(1, b.spendCents)).toFixed(1)}× that spend.
      </p>
      <p className={styles.caveat}>Everything else you were doing moved too, so read this as what changed alongside the campaign, not what it caused on its own.</p>
    </>
  );
}

// a typed question, matched to what this page can answer from its figures
function match(text: string): Q | null {
  const t = text.toLowerCase();
  if (/channel|source|where.*(from|come)|revenue.*(from|driv)|driv/.test(t)) return "channel";
  if (/before|after|since|change|campaign|8x|impact|differen/.test(t)) return "changed";
  if (/stand|notable|happen|summary|summar|best|overview|what.*(going|up)/.test(t)) return "stands";
  return null;
}

let ids = 0;

export function AskDialog({ open, onClose, win }: { open: boolean; onClose: () => void; win: Window }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [turns.length]);

  const ask = (q: string, id: Q | null) =>
    setTurns((all) => [
      ...all,
      {
        id: ids++,
        q,
        a:
          id == null ? (
            <p>
              That is not something these figures can answer. I can only read the window on screen: what stands out in it, which channels drive revenue, and how the site
              changed with the campaign.
            </p>
          ) : (
            answer(id, win)
          ),
      },
    ]);

  return (
    <Dialog open={open} onClose={onClose} label="Ask about this data" width={600}>
      <div className={`${shared.body} ${styles.body}`}>
        <div className={shared.head}>
          <span className={shared.askMark} aria-hidden>
            <Icon name="spark" size={24} />
          </span>
          <h2>Ask about this data</h2>
          <p>
            Answers come from the window on screen, {day(win.start)} – {day(win.end)}, and nothing else.
          </p>
        </div>

        <div className={styles.thread} aria-live="polite">
          {turns.map((t) => (
            <div key={t.id} className={styles.turn}>
              <p className={styles.q}>{t.q}</p>
              <div className={styles.a}>{t.a}</div>
            </div>
          ))}
          <div ref={end} />
        </div>

        <div className={styles.openers}>
          {OPENERS.map((o) => (
            <button key={o.id} type="button" onClick={() => ask(o.text, o.id)} data-anim-host>
              {o.text}
              <Icon name="right" size={16} />
            </button>
          ))}
        </div>

        <form
          className={styles.box}
          onSubmit={(e) => {
            e.preventDefault();
            const q = text.trim();
            if (!q) return;
            ask(q, match(q));
            setText("");
          }}
        >
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask about this window" aria-label="Ask about this window" maxLength={300} />
          <button type="submit" disabled={!text.trim()} aria-label="Ask">
            <Icon name="send" size={17} />
          </button>
        </form>
      </div>
    </Dialog>
  );
}
