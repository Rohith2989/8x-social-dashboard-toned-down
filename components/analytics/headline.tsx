"use client";

import { compact, day, full } from "@/lib/format";
import { change, duration, money, moneyCompact, price, type Report, type Window } from "@/lib/analytics";
import { Card } from "../ui/card";
import { Icon, type IconName } from "../ui/icon";
import { RollingNumber } from "../ui/rolling-number";
import styles from "./headline.module.css";

/*
  The headline figures (was: the four primary tiles): revenue, visitors, sessions and cost per sale, each over the
  smaller figures that explain it (the product's rule: when everything is a headline nothing is). Revenue leads, on
  the vertical's deep blue; the rest are white. Each says how it moved against the same number of days before the
  window, as an arrow and a figure, never a pill; on cost per sale a fall is the good news, and its colour says so.
  A figure the product cannot give says N/A and why, never a zero.
*/

const UNIQUE = "Unique within each day and channel, so days and channels can add up to more than the true number of people.";

export function Headline({ now, was, win }: { now: Report; was: Report; win: Window }) {
  const t = now.totals;
  const against = `against ${day(win.prev.start)} – ${day(win.prev.end)}`;
  const cpa = now.spendCents && t.transactions ? now.spendCents / t.transactions : null;
  const cpaWas = was.spendCents && was.totals.transactions ? was.spendCents / was.totals.transactions : null;
  const social = now.channels.organicSocial;
  const cpaSocial = now.spendCents && social.transactions ? now.spendCents / social.transactions : null;
  const mer = now.spendCents ? t.revenueCents / now.spendCents : null;
  const merSocial = now.spendCents ? social.revenueCents / now.spendCents : null;
  const noSpend = "No campaign days fall in this window, so there is no spend to divide by.";

  return (
    <section className={styles.headline} aria-label="The window's headline figures">
      <Card tone="aura" order={0} className={styles.revenue} label="Revenue">
        <Top icon="dollar" label="Revenue" />
        <p className={styles.big} title={`${money(t.revenueCents)} of purchase revenue, as the site reported it to Google Analytics`}>
          <RollingNumber value={money(t.revenueCents)} className="num" />
        </p>
        <Move now={t.revenueCents} was={was.totals.revenueCents} against={against} tone="aura" />
        <Facts
          facts={[
            { label: "Sales", value: full(t.transactions), hint: "Purchases Google Analytics recorded" },
            { label: "Buyers", value: compact(now.purchasers), hint: `${full(now.purchasers)} people who bought. ${UNIQUE}` },
            { label: "First-time buyers", value: compact(now.firstTimePurchasers), hint: `${full(now.firstTimePurchasers)} buying from meridian.app for the first time ever` },
            { label: "Non-paid / paid", value: `${moneyCompact(now.nonPaid.revenueCents)} / ${moneyCompact(now.paid.revenueCents)}`, hint: "Split by Google's own channel grouping" },
          ]}
        />
      </Card>

      <Card order={1} className={styles.tile} label="Visitors" tint="sky">
        <Top icon="creators" label="Visitors" />
        <p className={styles.big} title={`${full(t.users)} visitors. ${UNIQUE}`}>
          <RollingNumber value={compact(t.users)} className="num" />
        </p>
        <Move now={t.users} was={was.totals.users} against={against} />
        <Facts
          facts={[
            { label: "New", value: compact(now.newUsers), hint: `${Math.round((now.newUsers / Math.max(1, t.users)) * 100)}% were on the site for the first time` },
            { label: "Bought", value: `${((now.purchasers / Math.max(1, t.users)) * 100).toFixed(1)}%`, hint: `${full(now.purchasers)} of ${full(t.users)} visitors bought` },
            { label: "Non-paid / paid", value: `${compact(now.nonPaid.users)} / ${compact(now.paid.users)}`, hint: `Visitors counted per channel. ${UNIQUE}` },
          ]}
        />
      </Card>

      <Card order={2} className={styles.tile} label="Sessions" tint="lilac">
        <Top icon="eye" label="Sessions" />
        <p className={styles.big} title={`${full(t.sessions)} visits in all. One person can make several`}>
          <RollingNumber value={compact(t.sessions)} className="num" />
        </p>
        <Move now={t.sessions} was={was.totals.sessions} against={against} />
        <Facts
          facts={[
            { label: "Pageviews", value: compact(t.pageviews), hint: `${(t.pageviews / Math.max(1, t.sessions)).toFixed(1)} pages a session` },
            { label: "Avg. session", value: t.sessions ? duration(now.sessionSeconds / t.sessions) : "N/A", hint: "Average session length, weighted by sessions a day" },
            { label: "Non-paid / paid", value: `${compact(now.nonPaid.sessions)} / ${compact(now.paid.sessions)}`, hint: "Split by Google's own channel grouping" },
          ]}
        />
      </Card>

      <Card order={3} className={styles.tile} label="Cost per sale" tint="blue">
        <Top icon="tag" label="Cost per sale" />
        {cpa == null ? (
          <p className={`${styles.big} ${styles.na}`} title={now.spendCents ? "No sales in this window to divide by." : noSpend}>
            N/A
          </p>
        ) : (
          <p className={styles.big} title={`${money(now.spendCents)} spend with 8x over ${full(t.transactions)} sales, every channel`}>
            <RollingNumber value={price(cpa)} className="num" />
          </p>
        )}
        {cpa != null && cpaWas != null ? (
          <Move now={cpa} was={cpaWas} against={against} lowerIsBetter />
        ) : (
          <p className={styles.still}>{cpa == null ? " " : "No spend with 8x before it to compare"}</p>
        )}
        <Facts
          facts={[
            { label: "Via social", value: cpaSocial == null ? "N/A" : price(cpaSocial), hint: cpaSocial == null ? noSpend : `${money(now.spendCents)} over the ${full(social.transactions)} sales that arrived through social` },
            { label: "MER", value: mer == null ? "N/A" : `${mer.toFixed(1)}×`, hint: mer == null ? noSpend : `${money(t.revenueCents)} revenue over ${money(now.spendCents)} spend` },
            { label: "MER via social", value: merSocial == null ? "N/A" : `${merSocial.toFixed(1)}×`, hint: merSocial == null ? noSpend : `${money(social.revenueCents)} social revenue over ${money(now.spendCents)} spend` },
            { label: "Spend with 8x", value: now.spendCents ? moneyCompact(now.spendCents) : "N/A", hint: `$18,000 a month, prorated over the ${now.campaignDays} campaign ${now.campaignDays === 1 ? "day" : "days"} in this window` },
          ]}
        />
      </Card>
    </section>
  );
}

function Top({ icon, label }: { icon: IconName; label: string }) {
  return (
    <div className={styles.top}>
      <span className={styles.icon} aria-hidden>
        <Icon name={icon} size={18} stroke={1.8} />
      </span>
      <h2>{label}</h2>
    </div>
  );
}

// how a figure moved, as an arrow and a figure; good is up, except where lower is better
function Move({ now, was, against, tone = "paper", lowerIsBetter }: { now: number; was: number; against: string; tone?: "paper" | "aura"; lowerIsBetter?: boolean }) {
  const c = change(now, was);
  if (c == null || Math.round(c) === 0) return <p className={styles.still}>About the same as {against.replace("against ", "")}</p>;
  const up = c > 0;
  const good = lowerIsBetter ? !up : up;
  return (
    <p className={styles.move} data-tone={tone} data-good={good || undefined} title={`${up ? "Up" : "Down"} ${Math.abs(c).toFixed(1)}% ${against}, the same number of days before this window`}>
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
        <path d={up ? "M7 12V2M3 6l4-4 4 4" : "M7 2v10M3 8l4 4 4-4"} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <strong>{Math.abs(c).toFixed(Math.abs(c) < 10 ? 1 : 0)}%</strong>
      <span>{against}</span>
    </p>
  );
}

function Facts({ facts }: { facts: { label: string; value: string; hint?: string }[] }) {
  return (
    <dl className={styles.facts}>
      {facts.map((f) => (
        <div key={f.label} title={f.hint}>
          <dt>{f.label}</dt>
          <dd className="num">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}
