"use client";

import Link from "next/link";
import { compact, day as dayLabel, full } from "@/lib/format";
import { POSTS, ROSTER } from "@/lib/roster";
import { CAMPAIGN_START, CHANNELS, METRICS, money, valueOf, GA_DAYS, type Metric } from "@/lib/analytics";
import { Icon } from "../ui/icon";
import { Sheet } from "../ui/sheet";
import { formatMetric, usualBefore } from "./chart";
import styles from "./day.module.css";

/*
  The open day (new: the right-hand column; a sheet below 1360 px): a day of the chart, pressed, or the window's best
  until one is. What the website did that day on the chart's metric, against a usual day before 8x; its sessions,
  sales and revenue; where its visits came from, one bar by channel, Organic Social (where creators' clicks land)
  named; the views the campaign's posts earned that day; and the posts that went out, best first, which open on Posts &
  feed. A day Google Analytics has not settled says so.
*/

const SHADES: Record<string, string> = {
  organicSocial: "var(--vertical-deep)",
  organicSearch: "var(--vertical-glow)",
  direct: "color-mix(in srgb, var(--vertical-ink) 62%, #fff)",
  paidSearch: "var(--vertical-accent)",
  paidSocial: "color-mix(in srgb, var(--vertical-accent) 50%, var(--vertical-deep))",
  email: "var(--mist)",
  referral: "color-mix(in srgb, var(--vertical-glow) 40%, var(--mist))",
};

export function OpenDay({ date, metric, onClose }: { date: string; metric: Metric; onClose?: () => void }) {
  const d = GA_DAYS.find((x) => x.date === date);
  if (!d) return null;
  const v = valueOf(d, metric);
  const usual = usualBefore(metric);
  const vs = usual ? ((v - usual) / usual) * 100 : 0;
  const k = Math.round((Date.parse(date) - Date.parse(CAMPAIGN_START)) / 864e5);
  const posts = POSTS.filter((p) => p.postedAt.slice(0, 10) === date).sort((a, b) => b.views - a.views);
  const label = METRICS.find((m) => m.key === metric)!.label.toLowerCase();
  const channels = CHANNELS.map((c) => ({ ...c, sessions: d.channels[c.key].sessions })).sort((a, b) => b.sessions - a.sessions);

  return (
    <div className={styles.day} key={date}>
      <header className={styles.head}>
        <p className={styles.eyebrow}>{d.inCampaign ? `Day ${k + 1} of the campaign` : "Before 8x"}</p>
        <h2>{dayLabel(date, true)}</h2>
        {!d.settled && <p className={styles.loose}>{d.partial ? "Today so far: Google Analytics settles a day up to 48 hours later." : "Provisional: Google Analytics settles a day up to 48 hours later."}</p>}
        {onClose && (
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close the day" data-anim-host>
            <Icon name="close" size={18} />
          </button>
        )}
      </header>

      <div className={styles.lead}>
        <p className={styles.big}>
          <span className="num">{formatMetric(v, metric)}</span> {metric === "revenue" ? "revenue" : label}
        </p>
        {Math.abs(vs) >= 1 && (
          <p className={styles.vs} data-up={vs > 0 || undefined}>
            {vs > 0 ? "+" : "−"}
            {Math.abs(Math.round(vs))}% on a usual day before 8x <span>({formatMetric(Math.round(usual), metric, true)})</span>
          </p>
        )}
      </div>

      <dl className={styles.three}>
        <div>
          <dt>Sessions</dt>
          <dd className="num">{compact(d.sessions)}</dd>
        </div>
        <div>
          <dt>Sales</dt>
          <dd className="num">{full(d.transactions)}</dd>
        </div>
        <div>
          <dt>Revenue</dt>
          <dd className="num">{money(d.revenueCents)}</dd>
        </div>
      </dl>

      <section className={styles.section} aria-label="Where its visits came from">
        <h3 className={styles.label}>Where its visits came from</h3>
        <div className={styles.bar} aria-hidden>
          {channels.map((c) => (
            <i key={c.key} style={{ flexGrow: c.sessions, background: SHADES[c.key] }} />
          ))}
        </div>
        <ul className={styles.channels}>
          {channels.map((c) => (
            <li key={c.key} data-lead={c.key === "organicSocial" || undefined}>
              <i style={{ background: SHADES[c.key] }} aria-hidden />
              <span>{c.label}</span>
              <span className="num">{full(c.sessions)}</span>
              <span className={styles.share}>{Math.round((c.sessions / Math.max(1, d.sessions)) * 100)}%</span>
            </li>
          ))}
        </ul>
        {d.inCampaign && <p className={styles.note}>Organic Social is where a creator video&rsquo;s click lands, unless its link was tagged.</p>}
      </section>

      <section className={styles.section} aria-label="The posts that day">
        <h3 className={styles.label}>
          {posts.length ? `${posts.length} ${posts.length === 1 ? "post" : "posts"} went out` : "No posts went out"}
          {posts.length > 0 && (
            <Link href={`/posts?day=${date}`} className={styles.all} data-anim-host>
              All on Posts &amp; feed
              <Icon name="right" size={15} />
            </Link>
          )}
        </h3>
        {d.inCampaign && (
          <p className={styles.earned}>
            The campaign&rsquo;s posts earned <strong className="num">{compact(d.earnedViews)}</strong> views that day, old ones and new.
          </p>
        )}
        {posts.length > 0 ? (
          <ul className={styles.posts}>
            {posts.slice(0, 6).map((p) => {
              const who = ROSTER.find((c) => c.id === p.creatorId);
              return (
                <li key={p.id}>
                  <Link href={`/posts?open=${p.id}`} className={styles.post} title={`${who?.name ?? "A creator"}: ${p.caption}`}>
                    {p.poster ? <img src={p.poster} alt="" width={84} height={150} loading="lazy" /> : <span className={styles.blank} aria-hidden />}
                    <span className={styles.postFoot}>
                      <span className="num">{compact(p.views)}</span>
                      <span>{who?.name.split(" ")[0]}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={styles.none}>{d.inCampaign ? "A quiet day: nothing new went out, and the older posts kept earning." : "This was before the campaign began."}</p>
        )}
      </section>
    </div>
  );
}

export function DaySheet({ date, metric, open, onClose }: { date: string; metric: Metric; open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} label={`The day, ${dayLabel(date, true)}`}>
      {open && <OpenDay date={date} metric={metric} onClose={onClose} />}
    </Sheet>
  );
}
