"use client";

import { useState } from "react";
import { compact, day as dayLabel, full } from "@/lib/format";
import { ROSTER } from "@/lib/roster";
import { money, moneyCompact, price } from "@/lib/analytics";
import { ADS, AD_KINDS, DIMENSION_LABELS, EVENTS, LOW_VOLUME, ORGANIC_NOTES, PAID_LABELS, POST_NOUNS, PROVIDER_LABELS, creatorsOf, type AdsProvider, type Dimension } from "@/lib/ads";
import { Card } from "../ui/card";
import { Icon } from "../ui/icon";
import { Face } from "../creators/face";
import styles from "./ads.module.css";

/*
  The ad views (was: the TikTok Ads and Meta Ads views): what the brand's own ads did on the creators' posts, Spark
  Ads on TikTok and partnership ads on Meta, one platform at a time. Four figures (views on the boosted posts, spend,
  conversions as the platform counts them, cost per conversion with the cheapest creator named); the delivery rates
  they imply; views by day, organic and paid; the boosted posts themselves, each opening on Posts & feed; the creators
  by cost per conversion; who saw the ads; and the two platforms side by side, with the warning that each counts its
  own event. Every rate here is worked out from figures on the screen, so any of them can be checked by hand.
*/

const pct = (part: number, whole: number, digits = 1) => (whole ? `${((part / whole) * 100).toFixed(digits)}%` : "N/A");
const who = (id: string) => ROSTER.find((c) => c.id === id);

export function AdsView({ provider, openId, onOpen }: { provider: AdsProvider; openId: string; onOpen: (id: string) => void }) {
  const p = ADS[provider];
  const t = p.totals;
  const ev = EVENTS[provider];
  const creators = creatorsOf(p);
  const priced = creators.filter((c) => !c.lowVolume);
  const best = priced[0];
  const cpm = t.impressions ? (t.spendCents / t.impressions) * 1000 : null;
  const perClick = t.clicks ? t.spendCents / t.clicks : null;
  const cost = t.conversions ? t.spendCents / t.conversions : null;
  const tiktok = provider === "tiktok";

  return (
    <div className={styles.ads}>
      <p className={styles.intro}>
        {p.posts.length} of {p.campaignPostCount} {POST_NOUNS[provider].many} in this campaign carried paid delivery, as {AD_KINDS[provider]}. Ads on anything else are not
        counted here. Amounts are in the ad account&rsquo;s own currency, {p.currency}, read from {p.account}.
      </p>

      <section className={styles.tiles} aria-label={`${PROVIDER_LABELS[provider]} in figures`}>
        <Card tone="aura" order={0} className={styles.lead} label={tiktok ? "Views on boosted posts" : PAID_LABELS.meta}>
          <h2>{tiktok ? "Views on boosted posts" : PAID_LABELS.meta}</h2>
          <p className={`num ${styles.big}`}>{compact(tiktok ? t.organicViews + t.paidViews : t.paidViews)}</p>
          <p className={styles.hint}>
            {tiktok ? `Organic ${compact(t.organicViews)} · paid ${compact(t.paidViews)}` : p.reach ? `Reach ${compact(p.reach)} people` : ""}
          </p>
          <p className={styles.detail}>{tiktok ? `${pct(t.paidViews, t.organicViews + t.paidViews)} of these views came from ads` : `Organic views on the same reels: ${full(t.organicViews)}`}</p>
        </Card>
        <Card order={1} className={styles.tile} label="Spend" tint="sky">
          <h2>Spend</h2>
          <p className={`num ${styles.big}`}>{money(t.spendCents)}</p>
          <p className={styles.hint}>{cpm == null ? "" : `${price(cpm)} CPM`}</p>
          <p className={styles.detail}>{perClick == null ? "" : `${price(perClick)} a click`}</p>
        </Card>
        <Card order={2} className={styles.tile} label={ev.many} tint="lilac">
          <h2>{ev.many}</h2>
          <p className={`num ${styles.big}`}>{full(t.conversions)}</p>
          <p className={styles.hint}>
            Counted by {tiktok ? "TikTok" : "Meta"} as &ldquo;{ev.label}&rdquo;
          </p>
          <p className={styles.detail}>
            {full(t.clicks)} clicks, {pct(t.conversions, t.clicks)} of them converted
          </p>
        </Card>
        <Card order={3} className={styles.tile} label="Cost per conversion" tint="blue">
          <h2>Cost per {ev.one}</h2>
          <p className={`num ${styles.big}`}>{cost == null ? "N/A" : price(cost)}</p>
          <p className={styles.hint}>
            {best?.cost != null && (
              <>
                Lowest:{" "}
                <a href="#ad-creators" className={styles.inline}>
                  {who(best.creatorId)?.name.split(" ")[0]}
                </a>{" "}
                at {price(best.cost)}
              </>
            )}
          </p>
          <p className={styles.detail}>
            Priced from the {priced.length} of {creators.length} creators with {LOW_VOLUME} or more
          </p>
        </Card>
      </section>

      <section className={styles.card} aria-label="Delivery rates" data-tint="pearl">
        <h2 className={styles.title}>Delivery rates</h2>
        <dl className={styles.rates}>
          <Rate label="CTR" value={pct(t.clicks, t.impressions, 2)} detail={`${full(t.clicks)} clicks from ${compact(t.impressions)} impressions`} />
          <Rate label="CPM" value={cpm == null ? "N/A" : price(cpm)} detail="What a thousand impressions cost" />
          <Rate
            label="Blended CPM"
            value={t.impressions + t.organicViews ? price((t.spendCents / (t.impressions + t.organicViews)) * 1000) : "N/A"}
            detail={`The same spend over the impressions and the ${compact(t.organicViews)} organic views beside them`}
          />
          <Rate
            label="Frequency"
            value={p.reach ? `${(t.impressions / p.reach).toFixed(1)}×` : "N/A"}
            detail={p.reach ? `Times the average person met these ads` : "TikTok estimates reach rather than counting it, so a frequency here would not add up"}
          />
        </dl>
      </section>

      <Trend provider={provider} />

      <section className={styles.card} aria-label="The boosted posts">
        <h2 className={styles.title}>The boosted {POST_NOUNS[provider].many}</h2>
        <p className={styles.sub}>{ORGANIC_NOTES[provider]} Most spent first; each opens on the right.</p>
        <div className={styles.postHead} aria-hidden>
          <span />
          <span>Post</span>
          <span>Organic and paid</span>
          <span>Spend</span>
          <span>{ev.many}</span>
          <span>Each</span>
        </div>
        <ul className={styles.posts}>
          {p.posts.map((b) => {
            const c = who(b.post.creatorId);
            const whole = b.organicViews + b.paidViews;
            return (
              <li key={b.post.id}>
                <button type="button" className={styles.post} aria-current={b.post.id === openId ? "true" : undefined} onClick={() => onOpen(b.post.id)}>
                  <span className={styles.poster}>{b.post.poster && <img src={b.post.poster} alt="" width={36} height={64} loading="lazy" />}</span>
                  <span className={styles.postText}>
                    <strong>{b.post.caption}</strong>
                    <span>
                      {c?.name.split(" ")[0]} · {dayLabel(b.post.postedAt.slice(0, 10))}
                    </span>
                  </span>
                  <span className={styles.splitCell}>
                    <span className={styles.split} aria-label={`${compact(b.organicViews)} organic, ${compact(b.paidViews)} paid`}>
                      <i style={{ flexGrow: b.organicViews }} />
                      <i style={{ flexGrow: b.paidViews }} data-paid />
                    </span>
                    <span className={styles.splitKey}>
                      <span>{compact(b.organicViews)}</span>
                      <span>
                        {compact(b.paidViews)} paid · {pct(b.paidViews, whole, 0)}
                      </span>
                    </span>
                  </span>
                  <span className={styles.fig}>
                    <b className="num">{money(b.spendCents)}</b>
                  </span>
                  <span className={styles.fig}>
                    <b className="num">{full(b.conversions)}</b>
                  </span>
                  <span className={styles.fig}>
                    <b className="num">{b.conversions ? price(b.spendCents / b.conversions) : "N/A"}</b>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <div className={styles.pair}>
        <section className={styles.card} id="ad-creators" aria-label="Creators by cost per conversion" data-tint="lilac">
          <h2 className={styles.title}>Creators, cheapest first</h2>
          <p className={styles.sub}>
            Cost per {ev.one} across each creator&rsquo;s boosted {POST_NOUNS[provider].many}. Under {LOW_VOLUME} {ev.many.toLowerCase()} is a rough signal, not a price.
          </p>
          <ol className={styles.creators}>
            {creators.map((c, i) => {
              const r = who(c.creatorId);
              return (
                <li key={c.creatorId} data-low={c.lowVolume || undefined}>
                  <span className={styles.rank}>{c.lowVolume ? "" : i + 1}</span>
                  {r && <Face creator={r} size={34} />}
                  <span className={styles.creatorText}>
                    <strong>{r?.name ?? c.creatorId}</strong>
                    <span>
                      {c.posts} boosted · {compact(c.paidViews)} paid · {money(c.spendCents)}
                    </span>
                  </span>
                  <span className={styles.cost}>
                    <b className="num">{c.cost == null ? "N/A" : price(c.cost)}</b>
                    <span>{c.lowVolume ? `only ${c.conversions}` : `${full(c.conversions)} ${ev.many.toLowerCase()}`}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        <section className={styles.card} aria-label="Who saw these ads" data-tint="sky">
          <h2 className={styles.title}>Who saw these ads</h2>
          <div className={styles.audience}>
            {(["age", "gender", "country"] as Dimension[]).map((d) => (
              <Audience key={d} provider={provider} dimension={d} />
            ))}
          </div>
          <p className={styles.sub}>
            Shares of impressions over the campaign, each counted on its own (so a share of 25 to 34s and a share of women cannot be crossed). {PROVIDER_LABELS[provider]}{" "}
            reports who it could not classify as unspecified, shown rather than dropped.
          </p>
        </section>
      </div>

      <SideBySide />
    </div>
  );
}

function Rate({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className="num">{value}</dd>
      <p>{detail}</p>
    </div>
  );
}

function Audience({ provider, dimension }: { provider: AdsProvider; dimension: Dimension }) {
  const rows = ADS[provider].audience.filter((r) => r.dimension === dimension).sort((a, b) => b.impressions - a.impressions);
  const total = rows.reduce((a, r) => a + r.impressions, 0);
  return (
    <div className={styles.dimension}>
      <h3>{DIMENSION_LABELS[dimension]}</h3>
      <ul>
        {rows.map((r) => (
          <li key={r.bucket} data-quiet={r.bucket === "Unspecified" || r.bucket === "Everywhere else" || undefined}>
            <span className={styles.bucket}>
              {r.bucket}
              <b>{pct(r.impressions, total, 0)}</b>
            </span>
            <span className={styles.bar}>
              <i style={{ width: `${(r.impressions / Math.max(1, total)) * 100}%` }} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// organic and paid views on the boosted posts, a day at a time, and what was spent
function Trend({ provider }: { provider: AdsProvider }) {
  const trend = ADS[provider].trend;
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...trend.map((d) => d.organicViews + d.paidViews));
  const h = hover != null ? trend[hover] : null;
  return (
    <section className={styles.card} aria-label="Views by day">
      <div className={styles.trendHead}>
        <div>
          <h2 className={styles.title}>Views by day</h2>
          <p className={styles.sub}>On the boosted {POST_NOUNS[provider].many}, from the day the first was boosted</p>
        </div>
        <p className={styles.key}>
          <span>
            <i data-paid /> {PAID_LABELS[provider]}
          </span>
          <span>
            <i /> Organic
          </span>
        </p>
      </div>
      <div className={styles.columns} onPointerLeave={() => setHover(null)}>
        {trend.map((d, i) => (
          <button
            type="button"
            key={d.date}
            className={styles.column}
            onPointerEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            aria-label={`${dayLabel(d.date)}: ${full(d.organicViews)} organic, ${full(d.paidViews)} paid, ${money(d.spendCents)} spent`}
            style={{ "--i": i } as React.CSSProperties}
          >
            <span className={styles.stack} style={{ height: `${((d.organicViews + d.paidViews) / max) * 100}%` }}>
              <i data-paid style={{ flexGrow: d.paidViews }} />
              <i style={{ flexGrow: d.organicViews }} />
            </span>
            <span className={styles.colDate}>{i % 4 === 0 ? dayLabel(d.date) : ""}</span>
          </button>
        ))}
        {h && (
          <p className={styles.trendTip} style={{ left: `${((hover! + 0.5) / trend.length) * 100}%` }}>
            <strong>{dayLabel(h.date, true)}</strong>
            <span>
              {compact(h.paidViews)} paid · {compact(h.organicViews)} organic
            </span>
            <span>{money(h.spendCents)} spent</span>
          </p>
        )}
      </div>
      <p className={styles.trendFoot}>
        {dayLabel(trend[0].date)} to {dayLabel(trend[trend.length - 1].date)} · {moneyCompact(trend.reduce((a, d) => a + d.spendCents, 0))} spent in all
      </p>
    </section>
  );
}

// TikTok and Meta in one table: each counts its own event, so read the direction, not the exact price
function SideBySide() {
  return (
    <section className={styles.card} aria-label="TikTok and Meta, side by side" data-tint="pearl">
      <h2 className={styles.title}>TikTok and Meta, side by side</h2>
      <p className={styles.sub}>Each platform counts its own conversion event, so compare the direction rather than the exact price.</p>
      <div className={styles.compare}>
        <table>
          <thead>
            <tr>
              <th>Platform</th>
              <th>Spend</th>
              <th>Per 1,000 shown</th>
              <th>Per click</th>
              <th>Converted</th>
              <th>Cost per conversion</th>
              <th>Counted event</th>
            </tr>
          </thead>
          <tbody>
            {(["tiktok", "meta"] as AdsProvider[]).map((k) => {
              const t = ADS[k].totals;
              return (
                <tr key={k}>
                  <td>
                    <strong>{PROVIDER_LABELS[k]}</strong>
                  </td>
                  <td className="num">{money(t.spendCents)}</td>
                  <td className="num">{t.paidViews ? price((t.spendCents / t.paidViews) * 1000) : "N/A"}</td>
                  <td className="num">{t.clicks ? price(t.spendCents / t.clicks) : "N/A"}</td>
                  <td className="num">{pct(t.conversions, t.clicks)}</td>
                  <td className="num">
                    <strong>{t.conversions ? price(t.spendCents / t.conversions) : "N/A"}</strong>
                  </td>
                  <td>{EVENTS[k].label}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className={styles.link}>
        <Icon name="right" size={14} /> Per 1,000 shown counts {PAID_LABELS.tiktok.toLowerCase()} on TikTok and {PAID_LABELS.meta.toLowerCase()} on Meta.
      </p>
    </section>
  );
}
