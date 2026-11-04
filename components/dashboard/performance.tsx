"use client";

import Link from "next/link";
import { UPDATES } from "@/lib/demo";
import { DAYS } from "@/lib/days";
import { daysIn, totals } from "@/lib/metrics";
import { compact } from "@/lib/format";
import { Card } from "../ui/card";
import { Icon } from "../ui/icon";
import { ActionMenu } from "../ui/actions";
import { useToast } from "../ui/toast";
import { RollingNumber } from "../ui/rolling-number";
import { Halftone } from "./halftone";
import styles from "./performance.module.css";

/*
  Performance, on ink: the two figures that sum the campaign up (its views and its engagement rate), then what the
  people behind it just did, each a done thing with its check drawn in one of the vertical's colours. The light in the
  far corner is the brand's fine dots.
*/

const TONES = ["deep", "glow", "accent"] as const;

// the campaign's days as a CSV, a day a row (the product's figures: posts, views, likes, comments, shares)
function exportDays() {
  const rows = DAYS.map((d) => [d.date, d.posts.tiktok + d.posts.instagram, d.views.tiktok + d.views.instagram, d.likes, d.comments, d.shares].join(","));
  const csv = ["Date,Posts,Views,Likes,Comments,Shares", ...rows].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  Object.assign(document.createElement("a"), { href: url, download: "autumn-launch-days.csv" }).click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return rows.length;
}

export function Performance() {
  const t = totals(daysIn("lifetime"));
  const toast = useToast();
  return (
    <Card tone="ink" order={0} className={styles.card} label="Performance">
      <div className={styles.inner}>
        <Halftone className={styles.halftone} source={[1.02, -0.05]} />

        <div className={styles.head}>
          <h2>Performance</h2>
          <ActionMenu
            label="Performance, more"
            className={styles.more}
            title="Performance"
            items={[
              { id: "export", label: "Export the days (CSV)", icon: "download", onSelect: () => toast({ text: `Exported ${exportDays()} days`, icon: "download" }) },
              { id: "analytics", label: "Open Analytics", icon: "analytics", href: "/analytics" },
              { id: "posts", label: "See every post", icon: "posts", href: "/posts" },
            ]}
          >
            <Icon name="more-v" size={16} />
          </ActionMenu>
        </div>

        <div className={styles.pair}>
          <div>
            <RollingNumber value={compact(t.views)} className="num" />
            <span className={styles.what}>Views</span>
          </div>
          <i aria-hidden />
          <div>
            <RollingNumber value={`${t.engagement.toFixed(1)}%`} className="num" />
            <span className={styles.what}>Engagement</span>
          </div>
        </div>

        <ul className={styles.done}>
          {UPDATES.filter((u) => u.kind !== "plan").slice(0, 2).map((u, i) => (
            <li key={u.id}>
              <span className={styles.check} data-tone={TONES[i]}>
                <Icon name="tick" size={17} stroke={2.6} />
              </span>
              {u.kind === "plan" ? (
                <p>
                  <Link href="/plan" className={styles.updateLink}>
                    <strong>{u.who}</strong> {u.what}
                  </Link>
                </p>
              ) : (
                <p>
                  <strong>{u.kind === "posted" ? `${DAYS[DAYS.length - 1].creators.length} creators` : u.who}</strong> {u.what}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
