"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CAMPAIGN, MANAGER, PLATFORM_LABELS, type Platform } from "@/lib/demo";
import { DEFAULT_QUERY, ROSTER, applies, sorted, type Flag, type FlagReason, type Query, type RosterCreator, type SortKey, type Status } from "@/lib/roster";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { useToast } from "../ui/toast";
import { Aside, PageFooter, PageHeader, Tray } from "../shell/shell";
import { Summary } from "./summary";
import { Toolbar, type View } from "./toolbar";
import { CardGrid } from "./card";
import { RosterTable } from "./table";
import { Profile, ProfileSheet } from "./profile";
import { SelectionBar } from "../ui/selection-bar";
import { FlagDialog } from "./flag-dialog";
import { Face } from "./face";
import { AskDialog } from "./ask-dialog";
import { Empty } from "./empty";
import styles from "./creators.module.css";

/*
  Creators: who is posting for the brand, who is doing best, who has gone quiet or needs a word, and what to send to
  finance (docs/creators.md, part by part). The tray holds the roster; the window's right-hand column holds the one
  creator who is open (a sheet below 1360 px). Everything the reader sets (search, filters, sort, view, the open
  creator) lives in the URL, so back, refresh and a pasted link give the same view. What they pick and the flags they
  raise here live with the page (the product sends flags to the account manager's thread).
*/

const VIEWS: View[] = ["cards", "table"];

function readQuery(p: URLSearchParams): Query & { view: View; open: string | null } {
  const status = p.get("status");
  const sort = p.get("sort");
  return {
    q: p.get("q") ?? "",
    status: status === "active" || status === "idle" || status === "dropped" ? status : "all",
    platforms: (p.get("platform")?.split(",") ?? []).filter((x): x is Platform => x === "tiktok" || x === "instagram"),
    country: (p.get("country") as Query["country"]) ?? "all",
    sort: (["views", "avgPerPost", "videos", "likes", "comments", "lastPost", "name"].includes(sort ?? "") ? sort : DEFAULT_QUERY.sort) as SortKey,
    dir: p.get("dir") === "asc" ? "asc" : "desc",
    view: VIEWS.includes(p.get("view") as View) ? (p.get("view") as View) : "cards",
    open: p.get("open"),
  };
}

function csv(list: RosterCreator[]) {
  const head = ["Creator", "Country", "Status", "Accounts", "Videos", "Views", "Avg views per post", "Likes", "Comments", "Last post"];
  const rows = list.map((c) => [c.name, c.country.name, c.status, c.accounts.map((a) => `@${a.handle} (${PLATFORM_LABELS[a.platform]})`).join("; "), c.videos, c.views, c.avgPerPost, c.likes, c.comments, c.lastPostAt ?? ""]);
  return [head, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
}

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const profileUrl = (platform: Platform, handle: string) =>
  platform === "tiktok" ? `https://www.tiktok.com/@${handle}` : `https://www.instagram.com/${handle}`;

export function Creators() {
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const query = readQuery(new URLSearchParams(params.toString()));
  const toast = useToast();

  const set = useCallback(
    (patch: Partial<Record<"q" | "status" | "platform" | "country" | "sort" | "dir" | "view" | "open", string | null>>) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v == null || v === "" || v === "all") next.delete(k);
        else next.set(k, v);
      }
      // the defaults stay out of the URL, so a plain link is the plain view
      if (next.get("sort") === DEFAULT_QUERY.sort) next.delete("sort");
      if (next.get("dir") === "desc") next.delete("dir");
      if (next.get("view") === "cards") next.delete("view");
      const s = next.toString();
      router.replace(s ? `${path}?${s}` : path, { scroll: false });
    },
    [params, path, router],
  );

  // flags raised or lifted on this page, over the roster's own
  const [flags, setFlags] = useState<Record<string, Flag | null>>({});
  const roster = useMemo(() => ROSTER.map((c) => (c.id in flags ? { ...c, flag: flags[c.id] } : c)), [flags]);
  const list = useMemo(() => sorted(roster.filter((c) => applies(c, query)), query.sort, query.dir), [roster, query]);

  const [selected, setSelected] = useState<string[]>([]);
  const [flagging, setFlagging] = useState<string[] | null>(null);
  const [asking, setAsking] = useState(false);

  const openId = query.open ?? list[0]?.id ?? roster[0].id;
  const open = roster.find((c) => c.id === openId) ?? null;

  const toggle = (id: string, on: boolean) => setSelected((s) => (on ? [...new Set([...s, id])] : s.filter((x) => x !== id)));

  const exportList = (who: RosterCreator[], name: string) => {
    download(name, csv(who));
    toast({ text: `Exported ${who.length} ${who.length === 1 ? "creator" : "creators"}`, icon: "download" });
  };

  const copyLinks = async (who: RosterCreator[]) => {
    const links = who.flatMap((c) => c.accounts.map((a) => profileUrl(a.platform, a.handle)));
    try {
      await navigator.clipboard.writeText(links.join("\n"));
      toast({ text: `Copied ${links.length} profile ${links.length === 1 ? "link" : "links"}`, icon: "copy" });
    } catch {
      toast({ text: "The browser blocked the copy", icon: "close" });
    }
  };

  const raise = (ids: string[], reasons: FlagReason[], note: string) => {
    const before = Object.fromEntries(ids.map((id) => [id, roster.find((c) => c.id === id)?.flag ?? null]));
    const flag: Flag = { reasons, by: "Alex Carter", at: new Date().toISOString(), note: note || undefined };
    setFlags((f) => ({ ...f, ...Object.fromEntries(ids.map((id) => [id, flag])) }));
    setSelected([]);
    toast({
      text: `Flagged ${ids.length === 1 ? roster.find((c) => c.id === ids[0])?.name.split(" ")[0] : `${ids.length} creators`} for ${MANAGER.name.split(" ")[0]}`,
      icon: "flag",
      undo: () => setFlags((f) => ({ ...f, ...before })),
    });
  };

  const lift = (id: string) => {
    const was = roster.find((c) => c.id === id)?.flag ?? null;
    setFlags((f) => ({ ...f, [id]: null }));
    toast({ text: "Flag removed", icon: "flag", undo: () => setFlags((f) => ({ ...f, [id]: was })) });
  };

  const counts = useMemo(() => {
    const scope = roster.filter((c) => applies(c, query, "status"));
    const by = (s: Status) => scope.filter((c) => c.status === s).length;
    return { all: scope.length, active: by("active"), idle: by("idle"), dropped: by("dropped") };
  }, [roster, query]);

  const joined = roster.filter((c) => Date.parse(c.joinedAt) >= Date.parse("2026-10-28")).length;
  const chosen = roster.filter((c) => selected.includes(c.id));
  const flaggingWho = flagging ? roster.filter((c) => flagging.includes(c.id)) : [];

  // why the list is empty, when it is: a search or a filter matched nobody, or nobody has posted lately
  const empty = roster.length === 0 ? "none" : !query.q && !query.platforms.length && query.country === "all" && query.status === "active" ? "nobody" : "nomatch";

  return (
    <>
      <Tray label="Creators">
        <PageHeader
          title="Creators"
          line={
            <>
              <strong>{roster.length} people</strong> are posting for {CAMPAIGN.name}. {joined} joined this week.
            </>
          }
        >
          <Button variant="stone" icon={<Icon name="download" size={18} />} onClick={() => exportList(list, "creators-autumn-launch.csv")}>
            Export
          </Button>
          <Button variant="ink" icon={<Icon name="join" size={18} />} onClick={() => setAsking(true)}>
            Ask for creators
          </Button>
        </PageHeader>

        <Summary roster={roster} status={query.status} onStatus={(s) => set({ status: s })} onOpen={(id) => set({ open: id })} />

        <Toolbar
          query={query}
          view={query.view}
          counts={counts}
          roster={roster}
          shown={list.length}
          onChange={(patch) => set(patch)}
          onClear={() => set({ q: null, status: null, platform: null, country: null })}
        />

        <div className={`${styles.list} ${selected.length ? styles.withBar : ""}`}>
          {list.length === 0 ? (
            <Empty
              kind={empty}
              q={query.q}
              onClear={() => set({ q: null, platform: null, country: null, status: null })}
              onEveryone={() => set({ status: null })}
            />
          ) : query.view === "cards" ? (
            <CardGrid list={list} q={query.q} selected={selected} openId={openId} onSelect={toggle} onOpen={(id) => set({ open: id })} />
          ) : (
            <RosterTable
              list={list}
              q={query.q}
              selected={selected}
              openId={openId}
              sort={query.sort}
              dir={query.dir}
              onSort={(sort, dir) => set({ sort, dir })}
              onSelect={toggle}
              onSelectAll={(on) => setSelected(on ? list.map((c) => c.id) : [])}
              onOpen={(id) => set({ open: id })}
            />
          )}
        </div>

        <p className={styles.note}>
          A creator&rsquo;s figures add up their accounts; average per post is their views over their videos. Everything here is
          the whole campaign so far.
        </p>

        <PageFooter />

        <SelectionBar
          count={chosen.length}
          noun={["creator", "creators"]}
          heads={chosen.slice(0, 3).map((c) => (
            <Face key={c.id} creator={c} size={32} />
          ))}
          onClear={() => setSelected([])}
          actions={[
            { id: "copy", icon: "copy", label: "Copy links", title: "Copy their profile links, one per line", onClick: () => copyLinks(chosen) },
            { id: "export", icon: "download", label: "Export", title: "Export them as CSV, in the columns shown", onClick: () => exportList(chosen, "creators-autumn-launch-selected.csv") },
            {
              id: "flag",
              icon: "flag",
              label: `Flag for ${MANAGER.name.split(" ")[0]}`,
              title: `Flag them for ${MANAGER.name.split(" ")[0]} at 8x. This removes nobody.`,
              onClick: () => setFlagging(chosen.map((c) => c.id)),
              tone: "flag",
            },
          ]}
        />
      </Tray>

      <Aside label="Creator">
        {open && <Profile creator={open} onFlag={() => setFlagging([open.id])} onUnflag={() => lift(open.id)} />}
      </Aside>

      <ProfileSheet
        creator={query.open ? open : null}
        onClose={() => set({ open: null })}
        onFlag={() => open && setFlagging([open.id])}
        onUnflag={() => open && lift(open.id)}
      />

      <FlagDialog
        names={flaggingWho.length === 1 ? flaggingWho[0].name : `${flaggingWho.length} creators`}
        heads={flaggingWho.slice(0, 4).map((c) => (
          <Face key={c.id} creator={c} size={40} />
        ))}
        line="A flag removes nobody."
        open={!!flagging}
        onClose={() => setFlagging(null)}
        onSend={(reasons, note) => {
          if (flagging) raise(flagging, reasons, note);
        }}
      />

      <AskDialog
        open={asking}
        onClose={() => setAsking(false)}
        onSend={(n) => toast({ text: `Asked ${MANAGER.name.split(" ")[0]} for ${n} more creators`, icon: "send" })}
      />
    </>
  );
}
