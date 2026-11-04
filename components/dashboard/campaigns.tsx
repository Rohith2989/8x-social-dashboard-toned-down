"use client";

import { useState } from "react";
import { CAMPAIGN, CAMPAIGNS, CREATORS, type CampaignCard } from "@/lib/demo";
import { ACCOUNT_MANAGER } from "@/lib/team";
import { useArrival, ArrivalProvider } from "../ui/arrival";
import { Avatar } from "../ui/bits";
import { Icon } from "../ui/icon";
import { ActionMenu, type Action } from "../ui/actions";
import { Dialog } from "../ui/dialog";
import { useShellActions } from "../shell/shell";
import shared from "../creators/dialogs.module.css";
import styles from "./campaigns.module.css";

/*
  The brand's campaigns as blocks of colour (Halo Lab's project cards), each in one of the vertical's shades: who is
  on it by their faces, its name large, its posts against the plan as a bar. The last place is for the next one,
  drawn in fine dots, the brand's way of showing a place still to fill.
*/

const STATUS = { live: "Live", paused: "Paused", ended: "Ended" };

// what each card's menu offers: the live campaign's pages, or what an earlier one did
const menuOf = (c: CampaignCard, show: (id: string) => void): Action[] =>
  c.id === CAMPAIGN.id
    ? [
        { id: "creators", label: "Open Creators", icon: "creators", href: "/creators" },
        { id: "posts", label: "Open Posts & feed", icon: "posts", href: "/posts" },
        { id: "plan", label: "Open the content plan", icon: "plan", href: "/plan" },
      ]
    : [{ id: "what", label: "See what it did", icon: "eye", onSelect: () => show(c.id) }];

export function Campaigns() {
  const [ref, state] = useArrival<HTMLElement>(0.2);
  const actions = useShellActions();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <section ref={ref} className={styles.section} data-arrive={state} aria-labelledby="campaigns-title">
      <ArrivalProvider value={state}>
        <div className={styles.head}>
          <h2 id="campaigns-title">Your campaigns</h2>
          <button type="button" className={styles.all} onClick={() => setOpen("all")} data-anim-host>
            See all
            <Icon name="arrow" size={16} />
          </button>
        </div>
        <ul className={styles.cards}>
          {CAMPAIGNS.map((c, i) => {
            const pct = Math.round((c.posts / c.planned) * 100);
            return (
              <li key={c.id} className={`${styles.card} ${styles[c.tone]}`} style={{ "--i": i, "--pct": `${pct}%` } as React.CSSProperties}>
                <div className={styles.top}>
                  <span className={styles.faces}>
                    {c.faces.map((id) => (
                      <Avatar key={id} src={CREATORS[id].avatar} size={34} ring="currentColor" />
                    ))}
                    <span className={styles.more}>+{c.creators - c.faces.length}</span>
                  </span>
                  <ActionMenu label={`${c.name}, more`} className={styles.kebab} items={menuOf(c, setOpen)} title={c.name}>
                    <Icon name="more-v" size={18} />
                  </ActionMenu>
                </div>
                <p className={styles.status}>
                  <i aria-hidden data-status={c.status} />
                  {STATUS[c.status]}
                </p>
                <h3>{c.name}</h3>
                <p className={styles.meta}>
                  <span className="mono">{c.posts}</span> of <span className="mono">{c.planned}</span> posts
                </p>
                <span className={styles.bar} role="img" aria-label={`${c.posts} of ${c.planned} posts`}>
                  <i />
                </span>
              </li>
            );
          })}
          <li className={styles.add}>
            <svg className={styles.dotted} aria-hidden>
              <rect x="1.5" y="1.5" rx="24" />
            </svg>
            <button type="button" onClick={actions.start} data-anim-host>
              <span className={styles.plus}>
                <Icon name="plus" size={20} stroke={2} />
              </span>
              <span>
                Start a<br />
                campaign
              </span>
            </button>
          </li>
        </ul>
      </ArrivalProvider>
      <CampaignsDialog open={open} onClose={() => setOpen(null)} />
    </section>
  );
}

const STATE_LINE = { live: "Live", paused: "Paused", ended: "Ended" } as const;

// every campaign, newest first: where it stands and what it did; one opened from its card is lit
function CampaignsDialog({ open, onClose }: { open: string | null; onClose: () => void }) {
  return (
    <Dialog open={!!open} onClose={onClose} label="Your campaigns" width={600}>
      <div className={shared.body}>
        <div className={shared.head}>
          <span className={shared.askMark} aria-hidden>
            <Icon name="overview" size={24} />
          </span>
          <h2>Your campaigns</h2>
          <p>
            {CAMPAIGNS.length} with 8x, the newest first. {ACCOUNT_MANAGER.first} runs every one.
          </p>
        </div>
        <ul className={styles.list}>
          {CAMPAIGNS.map((c) => {
            const pct = Math.round((c.posts / c.planned) * 100);
            return (
              <li key={c.id} className={styles.row} data-lit={open === c.id || undefined} data-tone={c.tone}>
                <i className={styles.rowMark} aria-hidden />
                <div className={styles.rowText}>
                  <strong>{c.name}</strong>
                  <span>
                    {STATE_LINE[c.status]}
                    {c.id === CAMPAIGN.id && `, day ${CAMPAIGN.day} of ${CAMPAIGN.days}`} · {c.creators} creators
                  </span>
                  <span className={styles.rowBar} role="img" aria-label={`${c.posts} of ${c.planned} posts`}>
                    <i style={{ width: `${pct}%` }} />
                  </span>
                </div>
                <div className={styles.rowFigure}>
                  <strong className="num">{c.posts}</strong>
                  <span>of {c.planned} posts</span>
                </div>
              </li>
            );
          })}
        </ul>
        <div className={shared.foot}>
          <button type="button" className={shared.send} onClick={onClose} data-autofocus>
            Done
          </button>
        </div>
      </div>
    </Dialog>
  );
}
