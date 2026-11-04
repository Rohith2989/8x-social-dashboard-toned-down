"use client";

import { compact, full } from "@/lib/format";
import { CHANNELS, DEVICES, money, moneyCompact, type Report } from "@/lib/analytics";
import { Icon, type IconName } from "../ui/icon";
import { PlatformIcon } from "../ui/platform-icon";
import styles from "./sources.module.css";

/*
  Where the visits came from (was: Top sources, Arriving through social and Devices).
  - Top sources (the product's table): source / medium, its channel, paid or not in words, revenue, sessions, sales and
    share of sessions, each figure shaded by its value from the vertical's palest to its light; the four figures sort
    (highest first, lowest, back); the first ten of every pair in the window, the paid and non-paid totals at the foot.
    Narrower, the channel and the share fold away, so it always fits the tray.
  - Through social: the share of sessions, sales and revenue that arrived as Organic Social, where a creator video's
    click lands unless its link was tagged; a line of fine dots each, filled to its share. A floor, not the whole.
  - Devices: one bar, the window's sessions by device.
*/

export type SourceSort = "revenue" | "sessions" | "sales" | "share";

const SORTS: { key: SourceSort; label: string }[] = [
  { key: "revenue", label: "Revenue" },
  { key: "sessions", label: "Sessions" },
  { key: "sales", label: "Sales" },
  { key: "share", label: "Share" },
];

const TOP = 6;
const PAID = new Set(CHANNELS.filter((c) => c.paid).map((c) => c.key));

// Google Analytics' source / medium, said the way a person would; the routes 8x's creators bring visits by are ours
type Who = { name: string; how: string; mark: IconName | "tiktok" | "instagram"; ours?: boolean };

const WHO: Record<string, Who> = {
  "(direct) / (none)": { name: "Direct", how: "Typed in or saved", mark: "globe" },
  "google / organic": { name: "Google", how: "Search", mark: "search" },
  "bing / organic": { name: "Bing", how: "Search", mark: "search" },
  "duckduckgo / organic": { name: "DuckDuckGo", how: "Search", mark: "search" },
  "google / cpc": { name: "Google Ads", how: "Your search ads", mark: "megaphone" },
  "facebook / cpc": { name: "Meta Ads", how: "Your own ads", mark: "megaphone" },
  "newsletter / email": { name: "Newsletter", how: "Your emails", mark: "mail" },
  "tiktok.com / referral": { name: "TikTok", how: "Posts, organic", mark: "tiktok", ours: true },
  "instagram.com / referral": { name: "Instagram", how: "Posts, organic", mark: "instagram", ours: true },
  "l.instagram.com / referral": { name: "Instagram", how: "Links in bio", mark: "instagram", ours: true },
  "youtube.com / referral": { name: "YouTube", how: "Video links", mark: "play" },
  "tiktok / spark_ads": { name: "Spark Ads", how: "Boosted creator posts", mark: "tiktok", ours: true },
  "instagram / partnership_ads": { name: "Partnership ads", how: "Boosted creator reels", mark: "instagram", ours: true },
  "producthunt.com / referral": { name: "Product Hunt", how: "Links from the site", mark: "link" },
  "notion.so / referral": { name: "Notion", how: "Links from the site", mark: "link" },
  "reddit.com / referral": { name: "Reddit", how: "Links from threads", mark: "link" },
};

const whoOf = (name: string): Who => WHO[name] ?? { name: name.split(" / ")[0], how: name.split(" / ")[1] ?? "", mark: "link" };

export function Sources({ now, sort, dir, onSort }: { now: Report; sort: SourceSort; dir: "desc" | "asc"; onSort: (s: SourceSort | null, d: "desc" | "asc" | null) => void }) {
  const value = (r: Report["sources"][number]) => (sort === "revenue" ? r.revenueCents : sort === "sales" ? r.transactions : r.sessions);
  // the top ten are chosen by the column sorted on, not merely reordered (the product's rule)
  const ranked = [...now.sources].sort((a, b) => value(b) - value(a));
  const rows = (dir === "asc" ? ranked.slice(-TOP).reverse() : ranked.slice(0, TOP));
  const max = {
    revenue: Math.max(...now.sources.map((s) => s.revenueCents)),
    sessions: Math.max(...now.sources.map((s) => s.sessions)),
    sales: Math.max(...now.sources.map((s) => s.transactions)),
  };
  const heat = (v: number, top: number) => ({ "--heat": `${Math.round(8 + 62 * (top ? v / top : 0))}%` }) as React.CSSProperties;
  const t = now.totals;
  const press = (k: SourceSort) => {
    if (sort !== k) onSort(k, "desc");
    else if (dir === "desc") onSort(k, "asc");
    else onSort(null, null);
  };

  return (
    <div className={styles.where}>
      <section className={styles.table} aria-label="Top sources" data-tint="pearl">
        <header className={styles.head}>
          <h2>Top sources</h2>
          <p>
            The {Math.min(TOP, now.sources.length)} of {now.sources.length} with the most {sort === "share" ? "sessions" : sort}
            {dir === "asc" ? ", the fewest first" : ""}. The <span className={styles.ours}>8x</span> mark is where your creators&rsquo; posts bring visits; Google
            Analytics&rsquo; own source and medium are on each name.
          </p>
        </header>
        <table>
          <thead>
            <tr>
              <th className={styles.name}>Source</th>
              <th className={styles.channel}>Channel</th>
              {SORTS.map((s) => (
                <th key={s.key} className={`${styles.num} ${s.key === "share" ? styles.shareCol : ""}`} aria-sort={sort === s.key ? (dir === "desc" ? "descending" : "ascending") : undefined}>
                  <button type="button" onClick={() => press(s.key)} data-on={sort === s.key || undefined} title={`Rank by ${s.label.toLowerCase()}`}>
                    {s.label}
                    <span className={styles.arrow} data-dir={sort === s.key ? dir : undefined} aria-hidden>
                      <Icon name="down" size={14} stroke={2.2} />
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <td className={styles.name}>
                  <Source raw={r.name} />
                </td>
                <td className={styles.channel}>
                  <span className={styles.kind} data-paid={PAID.has(r.channel) || undefined} title={PAID.has(r.channel) ? "Paid, by Google's own channel grouping" : "Non-paid, by Google's own channel grouping"}>
                    <i aria-hidden />
                    {CHANNELS.find((c) => c.key === r.channel)?.label}
                  </span>
                </td>
                <td className={`${styles.num} ${styles.heat}`} style={heat(r.revenueCents, max.revenue)}>
                  <span className="num">{money(r.revenueCents)}</span>
                </td>
                <td className={`${styles.num} ${styles.heat}`} style={heat(r.sessions, max.sessions)}>
                  <span className="num">{full(r.sessions)}</span>
                </td>
                <td className={`${styles.num} ${styles.heat}`} style={heat(r.transactions, max.sales)}>
                  <span className="num">{full(r.transactions)}</span>
                </td>
                <td className={`${styles.num} ${styles.shareCol} ${styles.quiet}`}>{((r.sessions / Math.max(1, t.sessions)) * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            {[
              { label: "Non-paid, every source", totals: now.nonPaid, paid: false },
              { label: "Paid, every source", totals: now.paid, paid: true },
            ].map((row) => (
              <tr key={row.label}>
                <td className={styles.name}>
                  <span className={styles.kind} data-paid={row.paid || undefined}>
                    <i aria-hidden />
                    {row.label}
                  </span>
                </td>
                <td className={styles.channel} />
                <td className={styles.num}>
                  <span className="num">{money(row.totals.revenueCents)}</span>
                </td>
                <td className={styles.num}>
                  <span className="num">{full(row.totals.sessions)}</span>
                </td>
                <td className={styles.num}>
                  <span className="num">{full(row.totals.transactions)}</span>
                </td>
                <td className={`${styles.num} ${styles.shareCol} ${styles.quiet}`}>{((row.totals.sessions / Math.max(1, t.sessions)) * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tfoot>
        </table>
      </section>

      <div className={styles.side}>
        <section className={styles.social} aria-label="Through social" data-tint="lilac">
          <h2>Through social</h2>
          <p className={styles.sub}>What arrived as Organic Social, where a creator video&rsquo;s click lands</p>
          {[
            { label: "Sessions", part: now.channels.organicSocial.sessions, whole: t.sessions, f: compact },
            { label: "Sales", part: now.channels.organicSocial.transactions, whole: t.transactions, f: full },
            { label: "Revenue", part: now.channels.organicSocial.revenueCents, whole: t.revenueCents, f: moneyCompact },
          ].map((row) => (
            <Share key={row.label} {...row} />
          ))}
          <p className={styles.caveat}>A floor, not the whole picture: your own posts land here too, and a tagged link lands elsewhere.</p>
        </section>

        <section className={styles.devices} aria-label="Devices" data-tint="sky">
          <h2>Devices</h2>
          <div className={styles.deviceBar} aria-hidden>
            {DEVICES.map((d, i) => (
              <i key={d.key} style={{ flexGrow: now.devices[d.key], "--i": i } as React.CSSProperties} data-device={d.key} />
            ))}
          </div>
          <ul>
            {DEVICES.map((d) => (
              <li key={d.key} data-device={d.key}>
                <i aria-hidden />
                <span>{d.label}</span>
                <span className="num">{compact(now.devices[d.key])}</span>
                <strong>{Math.round((now.devices[d.key] / Math.max(1, t.sessions)) * 100)}%</strong>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

const DOTS = 30;

function Share({ label, part, whole, f }: { label: string; part: number; whole: number; f: (n: number) => string }) {
  const share = whole ? part / whole : 0;
  const lit = Math.round(share * DOTS);
  return (
    <div className={styles.share}>
      <p className={styles.shareHead}>
        <span>
          {label}
          <span className={styles.ofWhole}>
            {f(part)} of {f(whole)}
          </span>
        </span>
        <strong className="num">{(share * 100).toFixed(1)}%</strong>
      </p>
      <p className={styles.dots} aria-hidden>
        {Array.from({ length: DOTS }, (_, i) => (
          <i key={i} data-on={i < lit || undefined} style={{ "--i": i } as React.CSSProperties} />
        ))}
      </p>
    </div>
  );
}

// a source: its mark, its name, how the visit came; ours in the vertical's colour, with the 8x mark
function Source({ raw }: { raw: string }) {
  const w = whoOf(raw);
  return (
    <span className={styles.who} title={`${raw} in Google Analytics`} data-ours={w.ours || undefined}>
      <span className={styles.mark} aria-hidden>
        {w.mark === "tiktok" || w.mark === "instagram" ? <PlatformIcon platform={w.mark} size={18} /> : <Icon name={w.mark} size={17} stroke={1.8} />}
      </span>
      <span className={styles.whoText}>
        <strong>
          <span className={styles.whoName}>{w.name}</span>
          {w.ours && <img src="/brand/8x-ink.svg" alt="8x" width={18} height={12} className={styles.eight} />}
        </strong>
        <span>{w.how}</span>
      </span>
    </span>
  );
}
