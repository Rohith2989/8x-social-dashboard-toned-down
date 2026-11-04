"use client";

import { useEffect, useRef, useState } from "react";
import { CAMPAIGN, NOW, PLATFORM_LABELS, type Platform } from "@/lib/demo";
import { planOf, scriptById } from "@/lib/plan";
import { ROSTER } from "@/lib/roster";
import { MILESTONES, keeps, milestoneLabel, type FeedPost, type PostView, type PostsQuery } from "@/lib/posts";
import { day as dayLabel } from "@/lib/format";
import { Icon } from "../ui/icon";
import { Menu } from "../ui/menu";
import { MultiMenu } from "../ui/multi-menu";
import { Segmented } from "../ui/segmented";
import { PlatformIcon } from "../ui/platform-icon";
import { Face } from "../creators/face";
import base from "../creators/toolbar.module.css";
import styles from "./toolbar.module.css";
import type { Patch } from "./posts";

/*
  The toolbar (was: the filter row, its chips and the Feed View switch). The search first and largest, `/` to reach
  it from anywhere and Esc to clear it; the creators by their faces, several at once, each with their posts in scope;
  the platforms on the contract by their own icons; the day, newest first, with each day's count; and the view, Feed
  or Table. What is applied reads as a sentence under it, each part a link that takes itself away.
*/

// "Today, 3 Nov", "Yesterday, 2 Nov", "Fri, 30 Oct"
export function dayName(date: string) {
  const today = new Date(NOW).toISOString().slice(0, 10);
  const yesterday = new Date(NOW - 86_400_000).toISOString().slice(0, 10);
  return date === today ? `Today, ${dayLabel(date)}` : date === yesterday ? `Yesterday, ${dayLabel(date)}` : dayLabel(date, true);
}

export function Toolbar({ query, all, shown, onChange, onClear }: { query: PostsQuery; all: FeedPost[]; shown: number; onChange: (p: Patch) => void; onClear: () => void }) {
  const inScope = (except: "creators" | "platforms" | "day") => all.filter((p) => keeps(p, query, except));

  const byCreator = new Map<string, number>();
  inScope("creators").forEach((p) => byCreator.set(p.creatorId, (byCreator.get(p.creatorId) ?? 0) + 1));
  const creatorOptions = ROSTER.filter((c) => byCreator.has(c.id) || query.creators.includes(c.id))
    .map((c) => ({ id: c.id, label: c.name, short: c.name.split(" ")[0], lead: <Face creator={c} size={24} />, count: byCreator.get(c.id) ?? 0 }))
    .sort((a, b) => b.count - a.count);

  const byDay = new Map<string, number>();
  inScope("day").forEach((p) => byDay.set(p.postedAt.slice(0, 10), (byDay.get(p.postedAt.slice(0, 10)) ?? 0) + 1));
  const days = [...byDay.keys()].sort().reverse();
  if (query.day && !byDay.has(query.day)) days.unshift(query.day);

  const platformScope = inScope("platforms");

  return (
    <div className={base.toolbar}>
      <div className={base.row}>
        <Search value={query.q} total={all.length} onChange={(q) => onChange({ q })} />
        <MultiMenu
          label="Creators"
          all="All creators"
          values={query.creators}
          onChange={(v) => onChange({ creator: v.join(",") || null })}
          lead={<Icon name="creators" size={18} />}
          options={creatorOptions}
        />
      </div>

      <div className={base.row}>
        <div className={base.platforms} role="group" aria-label="Platforms">
          {CAMPAIGN.platforms.map((p: Platform) => {
            const on = query.platforms.includes(p);
            const n = platformScope.filter((x) => x.platform === p).length;
            return (
              <button
                key={p}
                type="button"
                aria-pressed={on}
                className={base.platform}
                onClick={() => {
                  const next = on ? query.platforms.filter((x) => x !== p) : [...query.platforms, p];
                  onChange({ platform: next.join(",") || null });
                }}
                title={`${on ? "Showing" : "Show"} posts on ${PLATFORM_LABELS[p]}`}
              >
                <PlatformIcon platform={p} size={22} />
                <span>{PLATFORM_LABELS[p]}</span>
                <span className={base.n}>{n}</span>
              </button>
            );
          })}
        </div>

        <Menu
          label="Day"
          value={query.day ?? "any"}
          onChange={(d) => onChange({ day: d === "any" ? null : d, at: null })}
          lead={<Icon name="calendar" size={18} />}
          options={[
            { id: "any", label: "Any day", count: inScope("day").length },
            ...days.map((d) => ({ id: d, label: dayName(d), count: byDay.get(d) ?? 0 })),
          ]}
        />

        <div className={`${base.view} ${styles.view}`}>
          <Segmented<PostView>
            label="View"
            size={36}
            value={query.view}
            onChange={(v) => onChange({ view: v, at: null })}
            options={[
              { id: "feed", label: "Feed", icon: <Icon name="grid" size={18} /> },
              { id: "table", label: "Table", icon: <Icon name="rows" size={18} /> },
            ]}
          />
        </div>
      </div>

      <Applied query={query} shown={shown} total={all.length} onChange={onChange} onClear={onClear} />
    </div>
  );
}

function Search({ value, total, onChange }: { value: string; total: number; onChange: (q: string | null) => void }) {
  const [text, setText] = useState(value);
  // the URL can change under the field (Clear all, back): the field follows it
  const [prev, setPrev] = useState(value);
  if (value !== prev) {
    setPrev(value);
    if (value !== text.trim()) setText(value);
  }
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef(0);

  // `/` reaches the search from anywhere on the page
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !/input|textarea/i.test(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);

  const type = (v: string) => {
    setText(v);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onChange(v.trim() || null), 140);
  };

  return (
    <label className={base.search} data-anim-host>
      <Icon name="search" />
      <input
        ref={input}
        type="search"
        value={text}
        onChange={(e) => type(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            type("");
            input.current?.blur();
          }
        }}
        placeholder={`Search ${total} posts, captions or @handles`}
        aria-label="Search posts, captions or handles"
        maxLength={80}
      />
      {text ? (
        <button type="button" className={base.clear} onClick={() => type("")} aria-label="Clear search">
          <Icon name="close" size={16} />
        </button>
      ) : (
        <kbd className={base.key} aria-hidden>
          /
        </kbd>
      )}
    </label>
  );
}

// what is applied, as a sentence; each part takes itself away
function Applied({ query, shown, total, onChange, onClear }: { query: PostsQuery; shown: number; total: number; onChange: (p: Patch) => void; onClear: () => void }) {
  const names = query.creators.map((id) => ROSTER.find((c) => c.id === id)?.name.split(" ")[0] ?? id);
  const people = names.length <= 2 ? names.join(" and ") : `${names.slice(0, 2).join(", ")} and ${names.length - 2} more`;
  const m = MILESTONES.find((x) => x.key === query.passed);
  const parts: { key: string; text: React.ReactNode; off: Patch }[] = [];
  if (query.platforms.length) parts.push({ key: "platform", text: `on ${query.platforms.map((p) => PLATFORM_LABELS[p]).join(" or ")}`, off: { platform: null } });
  if (m) parts.push({ key: "passed", text: `that passed ${milestoneLabel(m)} views`, off: { passed: null } });
  if (names.length) parts.push({ key: "creator", text: `by ${people}`, off: { creator: null } });
  if (query.day) parts.push({ key: "day", text: `on ${dayName(query.day)}`, off: { day: null } });
  if (query.q) parts.push({ key: "q", text: <>matching &lsquo;{query.q}&rsquo;</>, off: { q: null } });
  const script = scriptById(query.script);
  if (script) parts.push({ key: "script", text: `made to Script ${script.n} of ${planOf(script).name}, ${script.format.name}`, off: { script: null } });

  const order =
    query.view === "feed"
      ? "newest day first, the biggest posts leading each day"
      : query.sort
        ? `by ${SORT_WORDS[query.sort]}, ${query.dir === "desc" ? "highest" : "lowest"} first`
        : "newest first";

  return (
    <p className={base.applied} aria-live="polite">
      {parts.length === 0 ? (
        <>
          Showing all <strong>{total}</strong> posts, {order}.
        </>
      ) : (
        <>
          Showing <strong>{shown}</strong> of {total}:{" "}
          {parts.map((p, i) => (
            <span key={p.key}>
              <button type="button" className={base.part} onClick={() => onChange(p.off)} title="Remove">
                {p.text}
                <Icon name="close" size={14} />
              </button>
              {i < parts.length - 1 ? ", " : ". "}
            </span>
          ))}
          <button type="button" className={base.clearAll} onClick={onClear}>
            Clear all
          </button>
        </>
      )}
    </p>
  );
}

const SORT_WORDS: Record<NonNullable<PostsQuery["sort"]>, string> = {
  account: "account",
  posted: "date posted",
  platform: "platform",
  views: "views",
  likes: "likes",
  comments: "comments",
  shares: "shares",
  engagement: "engagement",
  status: "status",
  sparkCode: "spark code",
  country: "country",
};
