"use client";

import Link from "next/link";
import { useState } from "react";
import { compact, day as dayLabel, full } from "@/lib/format";
import { ROSTER } from "@/lib/roster";
import { money, price } from "@/lib/analytics";
import { ADS, AD_KINDS, EVENTS, PAID_LABELS, type AdsProvider, type BoostedPost } from "@/lib/ads";
import { Icon } from "../ui/icon";
import { Sheet } from "../ui/sheet";
import { useToast } from "../ui/toast";
import { Face } from "../creators/face";
import styles from "./ad-post.module.css";

/*
  The open boosted post (was: the ad post panel), in the right-hand column on the ad views (a sheet below 1360 px):
  the post playing, who made it and when, what the ads added to it (paid against organic, one bar), what they cost and
  what they brought, the paid delivery a day at a time, and the way to it on Posts & feed; on TikTok its spark code,
  the one the ads team boosted it with.
*/

export function AdPost({ provider, id, onClose }: { provider: AdsProvider; id: string; onClose?: () => void }) {
  const b = ADS[provider].posts.find((x) => x.post.id === id) ?? ADS[provider].posts[0];
  const toast = useToast();
  if (!b) return null;
  const p = b.post;
  const c = ROSTER.find((x) => x.id === p.creatorId);
  const ev = EVENTS[provider];
  const whole = b.organicViews + b.paidViews;
  const tiktok = provider === "tiktok";

  const copy = async () => {
    if (!p.sparkCode) return;
    try {
      await navigator.clipboard.writeText(p.sparkCode);
      toast({ text: "Copied the spark code", icon: "spark" });
    } catch {
      toast({ text: "The browser blocked the copy", icon: "close" });
    }
  };

  return (
    <div className={styles.panel} key={p.id}>
      <div className={styles.frame}>
        {p.video ? <video src={p.video} poster={p.poster ?? undefined} muted loop playsInline autoPlay aria-label={`${c?.name ?? "The creator"}'s post, playing without sound`} /> : p.poster && <img src={p.poster} alt="" />}
        <span className={styles.badge}>
          <Icon name="spark" size={14} />
          Boosted with {AD_KINDS[provider]}
        </span>
        {onClose && (
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close the post" data-anim-host>
            <Icon name="close" size={18} />
          </button>
        )}
      </div>

      {c && (
        <Link href={`/creators?open=${c.id}`} className={styles.creator} title={`Open ${c.name} on Creators`} data-anim-host>
          <Face creator={c} size={38} />
          <span>
            <strong>{c.name}</strong>
            <span>
              {dayLabel(p.postedAt.slice(0, 10), true)}, boosted from {dayLabel(b.days[0]?.date ?? p.postedAt.slice(0, 10))}
            </span>
          </span>
          <Icon name="right" size={16} />
        </Link>
      )}
      <p className={styles.caption}>{p.caption}</p>

      <div className={styles.lead}>
        <p className={styles.big}>
          <span className="num">{compact(b.paidViews)}</span> {PAID_LABELS[provider].toLowerCase()}
        </p>
        <span className={styles.split} aria-hidden>
          <i style={{ flexGrow: b.organicViews }} />
          <i style={{ flexGrow: b.paidViews }} data-paid />
        </span>
        <p className={styles.splitKey}>
          <span>{compact(b.organicViews)} organic</span>
          <span>{tiktok ? `${Math.round((b.paidViews / Math.max(1, whole)) * 100)}% of its views` : "on top of its views"}</span>
        </p>
      </div>

      <dl className={styles.figures}>
        <div>
          <dt>Spend</dt>
          <dd className="num">{money(b.spendCents)}</dd>
        </div>
        <div>
          <dt>{ev.many}</dt>
          <dd className="num">{full(b.conversions)}</dd>
        </div>
        <div>
          <dt>Per {ev.one}</dt>
          <dd className="num">{b.conversions ? price(b.spendCents / b.conversions) : "N/A"}</dd>
        </div>
        <div>
          <dt>Impressions</dt>
          <dd className="num">{compact(b.impressions)}</dd>
        </div>
        <div>
          <dt>Clicks</dt>
          <dd className="num">{full(b.clicks)}</dd>
        </div>
        <div>
          <dt>CTR</dt>
          <dd className="num">{b.impressions ? `${((b.clicks / b.impressions) * 100).toFixed(2)}%` : "N/A"}</dd>
        </div>
      </dl>

      <section className={styles.section} aria-label="Paid delivery by day">
        <p className={styles.label}>
          Paid delivery by day <span>{money(b.spendCents)} over {b.days.length} days</span>
        </p>
        <Days b={b} />
      </section>

      <div className={styles.actions}>
        <Link href={`/posts?open=${p.id}`} className={styles.action} data-anim-host>
          <Icon name="posts" size={18} />
          Open on Posts &amp; feed
        </Link>
        {tiktok && p.sparkCode && (
          <button type="button" className={styles.action} onClick={copy} title={`Spark code ${p.sparkCode}`} data-anim-host>
            <Icon name="spark" size={18} />
            Copy spark code
          </button>
        )}
      </div>
    </div>
  );
}

function Days({ b }: { b: BoostedPost }) {
  const [hover, setHover] = useState<number | null>(null);
  const n = b.days.length;
  const max = Math.max(1, ...b.days.map((d) => d.paid));
  const total = Math.max(1, b.days.reduce((a, d) => a + d.paid, 0));
  const peak = b.days.reduce((best, d, i) => (d.paid > b.days[best].paid ? i : best), 0);
  // up to five days, every bar carries its figure and its day; more, the peak's figure and the span's two ends
  const few = n <= 5;
  const h = hover != null ? b.days[hover] : null;
  return (
    <div className={styles.days} onPointerLeave={() => setHover(null)}>
      <div className={styles.cols}>
        {b.days.map((d, i) => (
          <span
            key={d.date}
            className={styles.col}
            onPointerEnter={() => setHover(i)}
            data-edge={few ? undefined : i === 0 ? "start" : i === n - 1 ? "end" : undefined}
            data-on={hover === i || undefined}
            style={{ "--i": i, "--h": d.paid / max } as React.CSSProperties}
          >
            {(few || i === peak) && <b className="num">{compact(d.paid)}</b>}
            <i />
          </span>
        ))}
      </div>
      <p className={styles.axis} data-few={few || undefined} aria-hidden>
        {(few ? b.days : [b.days[0], b.days[n - 1]]).map((d) => (
          <span key={d.date}>{dayLabel(d.date)}</span>
        ))}
      </p>
      <p className={styles.daysNote}>
        {h ? (
          <>
            <strong>{dayLabel(h.date, true)}</strong>: {compact(h.paid)} paid, {money(h.spendCents)}, {full(h.clicks)} clicks
          </>
        ) : (
          <>
            The most on <strong>{dayLabel(b.days[peak].date, true)}</strong>: {Math.round((b.days[peak].paid / total) * 100)}% of the{" "}
            {PAID_LABELS[b.provider].toLowerCase()}
          </>
        )}
      </p>
    </div>
  );
}

export function AdPostSheet({ provider, id, open, onClose }: { provider: AdsProvider; id: string; open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} label="The boosted post">
      {open && <AdPost provider={provider} id={id} onClose={onClose} />}
    </Sheet>
  );
}
