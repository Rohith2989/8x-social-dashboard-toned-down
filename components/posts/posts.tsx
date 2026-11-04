"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CAMPAIGN, MANAGER, type Platform } from "@/lib/demo";
import { since, type Flag, type FlagReason } from "@/lib/roster";
import { scriptById } from "@/lib/plan";
import {
  FEED,
  FEED_DAYS,
  MILESTONES,
  TABLE_ROWS,
  byDay,
  keeps,
  ordered,
  postUrl,
  postsCsv,
  type FeedPost,
  type MilestoneKey,
  type PostSort,
  type PostView,
  type PostsQuery,
} from "@/lib/posts";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { useToast } from "../ui/toast";
import { SelectionBar } from "../ui/selection-bar";
import { Aside, PageFooter, PageHeader, Tray } from "../shell/shell";
import { FlagDialog } from "../creators/flag-dialog";
import { Summary } from "./summary";
import { Toolbar } from "./toolbar";
import { Feed } from "./feed";
import { PostTable } from "./table";
import { PostPanel, PostSheet, Poster } from "./post";
import { NoPosts } from "./empty";
import styles from "./posts.module.css";

/*
  Posts & feed (docs/posts.md, part by part): what went out and when, which posts are doing best, how one post is
  growing, and what to hand the ads team. The tray holds the posts, as the feed's days or the table; the window's
  right-hand column holds the one post that is open, playing (a sheet below 1360 px). Everything the reader sets
  (search, filters, view, the open post, how far the feed and the table run) lives in the URL, so back, refresh and a
  pasted link give the same view. The flags they raise live with the page (the product sends them to the account
  manager's thread).
*/

const SORTS: PostSort[] = ["account", "posted", "platform", "views", "likes", "comments", "shares", "engagement", "status", "sparkCode", "country"];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

type Key = "q" | "creator" | "platform" | "passed" | "day" | "script" | "view" | "sort" | "dir" | "open" | "days" | "rows" | "at";
export type Patch = Partial<Record<Key, string | null>>;

function readQuery(p: URLSearchParams): PostsQuery {
  const sort = p.get("sort") as PostSort | null;
  const passed = p.get("passed");
  const day = p.get("day");
  const at = p.get("at");
  const n = (k: string, d: number) => Math.max(d, Number(p.get(k)) || d);
  return {
    q: p.get("q") ?? "",
    creators: p.get("creator")?.split(",").filter(Boolean) ?? [],
    platforms: (p.get("platform")?.split(",") ?? []).filter((x): x is Platform => x === "tiktok" || x === "instagram"),
    passed: MILESTONES.some((m) => m.key === passed) ? (passed as MilestoneKey) : null,
    day: day && DATE.test(day) ? day : null,
    script: scriptById(p.get("script"))?.id ?? null,
    view: p.get("view") === "table" ? "table" : "feed",
    sort: sort && SORTS.includes(sort) ? sort : null,
    dir: p.get("dir") === "asc" ? "asc" : "desc",
    open: p.get("open"),
    days: n("days", FEED_DAYS),
    rows: n("rows", TABLE_ROWS),
    at: at && DATE.test(at) ? at : null,
  };
}

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

export const firstName = (p: FeedPost) => p.creator.name.split(" ")[0];

export function Posts() {
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const query = readQuery(new URLSearchParams(params.toString()));
  const toast = useToast();

  const set = useCallback(
    (patch: Patch) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v == null || v === "") next.delete(k);
        else next.set(k, v);
      }
      // the defaults stay out of the URL, so a plain link is the plain view
      if (next.get("view") === "feed") next.delete("view");
      if (next.get("dir") === "desc") next.delete("dir");
      if (next.get("days") === String(FEED_DAYS)) next.delete("days");
      if (next.get("rows") === String(TABLE_ROWS)) next.delete("rows");
      const s = next.toString();
      router.replace(s ? `${path}?${s}` : path, { scroll: false });
    },
    [params, path, router],
  );

  // flags raised or lifted on this page, over the posts' own
  const [flags, setFlags] = useState<Record<string, Flag | null>>({});
  const all = useMemo(() => FEED.map((p) => (p.id in flags ? { ...p, flag: flags[p.id] } : p)), [flags]);
  const list = useMemo(() => all.filter((p) => keeps(p, query)), [all, query]);
  const days = useMemo(() => byDay(list), [list]);
  const rows = useMemo(() => ordered(list, query.sort, query.dir), [list, query.sort, query.dir]);

  const [selected, setSelected] = useState<string[]>([]);
  const [flagging, setFlagging] = useState<string[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  // the open post: the one asked for, or the first the view shows that plays here (else simply the first)
  const inView = query.view === "feed" ? days.flatMap((d) => d.posts) : rows;
  const first = inView.slice(0, 12).find((p) => p.video) ?? inView[0];
  const openId = query.open ?? first?.id ?? null;
  const open = all.find((p) => p.id === openId) ?? null;

  const toggle = (id: string, on: boolean) => setSelected((s) => (on ? [...new Set([...s, id])] : s.filter((x) => x !== id)));
  const chosen = all.filter((p) => selected.includes(p.id));
  const flaggingPosts = flagging ? all.filter((p) => flagging.includes(p.id)) : [];

  const exportCsv = (who: FeedPost[], name: string) => {
    download(name, postsCsv(who));
    toast({ text: `Exported ${who.length} ${who.length === 1 ? "post" : "posts"}`, icon: "download" });
  };

  const copy = async (lines: string[], what: [string, string]) => {
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast({ text: `Copied ${lines.length} ${lines.length === 1 ? what[0] : what[1]}`, icon: "copy" });
    } catch {
      toast({ text: "The browser blocked the copy", icon: "close" });
    }
  };

  const sparkCodes = (who: FeedPost[]) => who.map((p) => p.sparkCode).filter((c): c is string => !!c);

  // the footage, one file after another, saying where it is; a post with no file here is counted, not hidden
  const downloadVideos = async (who: FeedPost[]) => {
    const files = who.filter((p) => p.video);
    for (let i = 0; i < files.length; i++) {
      setBusy(`${i + 1} of ${files.length}`);
      const a = Object.assign(document.createElement("a"), { href: files[i].video as string, download: `${files[i].id}.mp4` });
      a.click();
      await wait(450);
    }
    setBusy(null);
    const missing = who.length - files.length;
    toast({
      text: files.length
        ? `Downloaded ${files.length} ${files.length === 1 ? "video" : "videos"}${missing ? `; ${missing} with no file here` : ""}`
        : "None of these has a file to download here",
      icon: "download",
    });
  };

  const raise = (ids: string[], reasons: FlagReason[], note: string) => {
    const before = Object.fromEntries(ids.map((id) => [id, all.find((p) => p.id === id)?.flag ?? null]));
    const flag: Flag = { reasons, by: "Alex Carter", at: new Date().toISOString(), note: note || undefined };
    setFlags((f) => ({ ...f, ...Object.fromEntries(ids.map((id) => [id, flag])) }));
    setSelected([]);
    const one = all.find((p) => p.id === ids[0]);
    toast({
      text: `Flagged ${ids.length === 1 && one ? `${firstName(one)}'s post` : `${ids.length} posts`} for ${MANAGER.name.split(" ")[0]}`,
      icon: "flag",
      undo: () => setFlags((f) => ({ ...f, ...before })),
    });
  };

  const lift = (id: string) => {
    const was = all.find((p) => p.id === id)?.flag ?? null;
    setFlags((f) => ({ ...f, [id]: null }));
    toast({ text: "Flag removed", icon: "flag", undo: () => setFlags((f) => ({ ...f, [id]: was })) });
  };

  const today = FEED.filter((p) => p.postedAt.slice(0, 10) === FEED[0].postedAt.slice(0, 10));
  const codes = sparkCodes(list);
  const filtered = list.length !== all.length;
  const clear = () => set({ q: null, creator: null, platform: null, passed: null, day: null, script: null, at: null });
  const actions = (who: FeedPost[]) => ({
    copyLink: () => copy([postUrl(who[0])], ["link", "links"]),
    copySpark: () => copy(sparkCodes(who), ["spark code", "spark codes"]),
    download: () => downloadVideos(who),
    flag: () => setFlagging(who.map((p) => p.id)),
  });

  return (
    <>
      <Tray label="Posts & feed">
        <PageHeader
          title="Posts & feed"
          line={
            <>
              <strong>{FEED.length} posts</strong> went out for {CAMPAIGN.name}. {today.length} today, the last one {since(FEED[0].postedAt).toLowerCase()}.
            </>
          }
        >
          <Button variant="stone" icon={<Icon name="download" size={18} />} onClick={() => exportCsv(list, filtered ? "posts-autumn-launch-filtered.csv" : "posts-autumn-launch.csv")}>
            Export
          </Button>
          <span title={codes.length ? `Every TikTok spark code ${filtered ? "in view" : "on the campaign"}, one per line` : "Spark codes are TikTok-only, and nothing in view has one"}>
            <Button variant="ink" icon={<Icon name="spark" size={18} />} disabled={!codes.length} onClick={() => copy(codes, ["spark code", "spark codes"])}>
              Copy spark codes
            </Button>
          </span>
        </PageHeader>

        <Summary all={all} list={list} query={query} onPassed={(m) => set({ passed: m })} />

        <Toolbar query={query} all={all} shown={list.length} onChange={set} onClear={clear} />

        <div className={`${styles.list} ${selected.length ? styles.withBar : ""}`}>
          {list.length === 0 ? (
            <NoPosts query={query} onClear={clear} />
          ) : query.view === "feed" ? (
            <Feed
              days={days}
              shown={query.days}
              q={query.q}
              selected={selected}
              openId={openId}
              onSelect={toggle}
              onOpen={(id) => set({ open: id })}
              onMore={() => set({ days: String(query.days + FEED_DAYS) })}
              onTable={(date) => set({ view: "table", at: date, sort: null, dir: null, open: null })}
            />
          ) : (
            <PostTable
              rows={rows}
              shown={query.rows}
              at={query.at}
              q={query.q}
              sort={query.sort}
              dir={query.dir}
              selected={selected}
              openId={openId}
              onSort={(sort, dir) => set({ sort, dir, at: null })}
              onSelect={toggle}
              onSelectAll={(ids, on) => setSelected((s) => (on ? [...new Set([...s, ...ids])] : s.filter((x) => !ids.includes(x))))}
              onOpen={(id) => set({ open: id })}
              onMore={() => set({ rows: String(query.rows + TABLE_ROWS) })}
              onCopied={() => toast({ text: "Copied the spark code", icon: "spark" })}
            />
          )}
        </div>

        <p className={styles.note}>
          A post&rsquo;s figures are its lifetime so far; a day&rsquo;s are the posts that went out that day. Shares a platform has not reported
          read N/A and count as none.
        </p>

        <PageFooter />

        <SelectionBar
          count={chosen.length}
          noun={["post", "posts"]}
          heads={chosen.slice(0, 3).map((p) => (
            <Poster key={p.id} post={p} className={styles.head} />
          ))}
          onClear={() => setSelected([])}
          actions={[
            { id: "links", icon: "link", label: "Copy links", title: "Copy their links, one per line", onClick: () => copy(chosen.map(postUrl), ["link", "links"]) },
            {
              id: "spark",
              icon: "spark",
              label: "Spark codes",
              title: sparkCodes(chosen).length ? "Copy their spark codes, one per line" : "Spark codes are TikTok-only, and nothing selected has one",
              onClick: () => copy(sparkCodes(chosen), ["spark code", "spark codes"]),
              disabled: !sparkCodes(chosen).length,
            },
            { id: "download", icon: "download", label: "Download", title: "Download their videos", onClick: () => downloadVideos(chosen), busy: busy ?? undefined },
            { id: "export", icon: "rows", label: "Export", title: "Export them as CSV, every column the table has", onClick: () => exportCsv(chosen, "posts-autumn-launch-selected.csv") },
            {
              id: "flag",
              icon: "flag",
              label: `Flag for ${MANAGER.name.split(" ")[0]}`,
              title: `Flag them for ${MANAGER.name}. It takes nothing down.`,
              onClick: () => setFlagging(chosen.map((p) => p.id)),
              tone: "flag",
            },
          ]}
        />
      </Tray>

      <Aside label="Post">
        {open && <PostPanel post={open} actions={actions([open])} onUnflag={() => lift(open.id)} busy={busy} />}
      </Aside>

      <PostSheet post={query.open ? open : null} onClose={() => set({ open: null })} actions={open ? actions([open]) : null} onUnflag={() => open && lift(open.id)} busy={busy} />

      <FlagDialog
        names={flaggingPosts.length === 1 ? `${firstName(flaggingPosts[0])}'s post` : `${flaggingPosts.length} posts`}
        heads={flaggingPosts.slice(0, 4).map((p) => (
          <Poster key={p.id} post={p} className={styles.flagHead} />
        ))}
        line="A flag takes nothing down: the post stays up and still counts."
        placeholder="Say what you saw in the post"
        open={!!flagging}
        onClose={() => setFlagging(null)}
        onSend={(reasons, note) => {
          if (flagging) raise(flagging, reasons, note);
        }}
      />
    </>
  );
}
