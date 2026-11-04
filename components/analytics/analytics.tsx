"use client";

import { useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { CAMPAIGN } from "@/lib/demo";
import { day } from "@/lib/format";
import { CAMPAIGN_START, METRICS, PROPERTY, SPLITS, WINDOWS, change, daysCsv, daysIn, money, report, valueOf, windowOf, type Metric, type Split, type WindowKey } from "@/lib/analytics";
import { ADS, PROVIDERS, PROVIDER_LABELS, type AdsProvider } from "@/lib/ads";
import { Button } from "../ui/button";
import { useToast } from "../ui/toast";
import { Icon } from "../ui/icon";
import { PlatformIcon } from "../ui/platform-icon";
import { Segmented } from "../ui/segmented";
import { Aside, PageFooter, PageHeader, Tray } from "../shell/shell";
import { Headline } from "./headline";
import { WebsiteChart } from "./chart";
import { DaySheet, OpenDay } from "./day";
import { Sources, type SourceSort } from "./sources";
import { AdsView } from "./ads";
import { AdPost, AdPostSheet } from "./ad-post";
import { ConnectDialog } from "./connect";
import { AskDialog } from "./ask";
import styles from "./analytics.module.css";

/*
  Analytics (docs/analytics.md, part by part): did the campaign move the brand's business, what each sale cost, where
  the visits came from, which days and posts moved it, and what the brand's own ads on the creators' posts did. One
  source at a time (the website, TikTok Ads, Meta Ads), never added together. The window, the metric, the split and
  the open day live in the URL, written with the browser's own history so every change shows at once.
*/

export type View = "website" | AdsProvider;
type Key = "view" | "window" | "metric" | "split" | "hide" | "posts" | "day" | "post" | "sort" | "dir" | "connect" | "ask";
export type Patch = Partial<Record<Key, string | null>>;

const VIEWS: View[] = ["website", ...PROVIDERS];

export function Analytics() {
  const params = useSearchParams();
  const path = usePathname();
  const toast = useToast();

  const set = useCallback(
    (patch: Patch) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v == null || v === "") next.delete(k);
        else next.set(k, v);
      }
      // the defaults stay out of the URL, so a plain link is the plain view
      if (next.get("view") === "website") next.delete("view");
      if (next.get("window") === "since") next.delete("window");
      if (next.get("metric") === "sessions") next.delete("metric");
      if (next.get("split") === "none") next.delete("split");
      const s = next.toString();
      window.history.replaceState(null, "", s ? `${path}?${s}` : path);
    },
    [params, path],
  );

  const view = (VIEWS.find((v) => v === params.get("view")) ?? "website") as View;
  const win = windowOf((WINDOWS.find((w) => w.key === params.get("window"))?.key ?? "since") as WindowKey);
  const metric = (METRICS.find((m) => m.key === params.get("metric"))?.key ?? "sessions") as Metric;
  const split = (SPLITS.find((s) => s.key === params.get("split"))?.key ?? "none") as Split;
  const hidden = params.get("hide")?.split(",").filter(Boolean) ?? [];
  const showPosts = params.get("posts") !== "0";
  // on an ad view, the open boosted post: the one asked for, else the one the most was spent on
  const adPosts = view === "website" ? [] : ADS[view].posts;
  const openPost = adPosts.find((b) => b.post.id === params.get("post"))?.post.id ?? adPosts[0]?.post.id ?? "";
  // the open day: the one asked for if the window holds it, else the window's best settled day on the metric
  const inWin = daysIn(win.start, win.end);
  const best = [...inWin].filter((d) => d.settled).sort((a, b) => valueOf(b, metric) - valueOf(a, metric))[0] ?? inWin[inWin.length - 1];
  const openDay = inWin.some((d) => d.date === params.get("day")) || daysIn(win.prev.start, win.prev.end).some((d) => d.date === params.get("day")) ? (params.get("day") as string) : best.date;

  // the campaign so far against the same number of days before it: the line the page leads with
  const since = windowOf("since");
  const now = report(since.start, since.end);
  const was = report(since.prev.start, since.prev.end);
  const up = change(now.totals.revenueCents, was.totals.revenueCents) ?? 0;

  return (
    <>
      <Tray label="Analytics">
        <PageHeader
          title="Analytics"
          line={
            <>
              Since 8x started on {day(CAMPAIGN_START)}, meridian.app made <strong>{money(now.totals.revenueCents)}</strong>,{" "}
              {Math.round(Math.abs(up))}% {up >= 0 ? "more" : "less"} than in the {CAMPAIGN.day} days before.
            </>
          }
        >
          <Button variant="stone" icon={<Icon name="link" size={18} />} onClick={() => set({ connect: "1" })}>
            Connect your data
          </Button>
          <Button variant="ink" icon={<Icon name="spark" size={18} />} onClick={() => set({ ask: "1" })}>
            Ask about this data
          </Button>
        </PageHeader>

        <div className={styles.toolbar}>
          <Segmented<View>
            label="Source"
            value={view}
            onChange={(v) => set({ view: v, day: null, post: null, sort: null, dir: null })}
            options={[
              { id: "website", label: "Website", icon: <Icon name="globe" size={18} /> },
              { id: "tiktok", label: PROVIDER_LABELS.tiktok, icon: <PlatformIcon platform="tiktok" size={18} /> },
              { id: "meta", label: PROVIDER_LABELS.meta, icon: <PlatformIcon platform="instagram" size={18} /> },
            ]}
          />
          {view === "website" && (
            <div className={styles.window}>
              <Segmented<WindowKey> label="Window" value={win.key} onChange={(w) => set({ window: w, day: null })} options={WINDOWS.map((w) => ({ id: w.key, label: w.label }))} />
              <p>
                Against {day(win.prev.start)} – {day(win.prev.end)}, {win.key === "since" ? `the ${win.days} days before 8x` : `the ${win.days} days before`}
              </p>
              <span title="The window's days as a CSV, a day a row with every figure">
                <Button
                  variant="stone"
                  size={36}
                  icon={<Icon name="download" size={16} />}
                  onClick={() => {
                    const days = daysIn(win.start, win.end);
                    const url = URL.createObjectURL(new Blob([daysCsv(days)], { type: "text/csv" }));
                    const a = Object.assign(document.createElement("a"), { href: url, download: `analytics-autumn-launch-${win.start}-to-${win.end}.csv` });
                    a.click();
                    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
                    toast({ text: `Exported ${days.length} days`, icon: "download" });
                  }}
                >
                  Export
                </Button>
              </span>
            </div>
          )}
        </div>

        {view === "website" ? (
          <>
            <Headline now={report(win.start, win.end)} was={report(win.prev.start, win.prev.end)} win={win} />
            <WebsiteChart
              win={win}
              metric={metric}
              split={split}
              hidden={hidden}
              showPosts={showPosts}
              openDay={openDay}
              onMetric={(m) => set({ metric: m })}
              onSplit={(sp) => set({ split: sp, hide: null })}
              onHidden={(keys) => set({ hide: keys.join(",") || null })}
              onPosts={(on) => set({ posts: on ? null : "0" })}
              onDay={(d) => set({ day: d })}
            />
            <Sources
              now={report(win.start, win.end)}
              sort={(["revenue", "sessions", "sales", "share"].includes(params.get("sort") ?? "") ? params.get("sort") : "revenue") as SourceSort}
              dir={params.get("dir") === "asc" ? "asc" : "desc"}
              onSort={(sort, dir) => set({ sort, dir })}
            />
            <p className={styles.footnote}>
              {PROPERTY.name} · {PROPERTY.account} · data through {day(win.end)}, last read at 15:40. Google Analytics settles a day up to 48 hours
              later, so the latest days are provisional. Figures are in {PROPERTY.currency}, in the property&rsquo;s time zone.
            </p>
          </>
        ) : (
          <AdsView key={view} provider={view} openId={openPost} onOpen={(id) => set({ post: id })} />
        )}

        <PageFooter />
      </Tray>

      <Aside label={view === "website" ? "The open day" : "The open post"}>
        {view === "website" ? <OpenDay key={openDay} date={openDay} metric={metric} /> : <AdPost key={openPost} provider={view} id={openPost} />}
      </Aside>

      {view !== "website" && <AdPostSheet provider={view} id={openPost} open={!!params.get("post")} onClose={() => set({ post: null })} />}

      <ConnectDialog open={params.get("connect") === "1"} onClose={() => set({ connect: null })} />
      <AskDialog open={params.get("ask") === "1"} onClose={() => set({ ask: null })} win={win} />

      {view === "website" && <DaySheet date={openDay} metric={metric} open={!!params.get("day")} onClose={() => set({ day: null })} />}
    </>
  );
}
