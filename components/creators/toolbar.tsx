"use client";

import { useEffect, useRef, useState } from "react";
import { CAMPAIGN, PLATFORM_LABELS, type Platform } from "@/lib/demo";
import { COUNTRIES, SORTS, STATUS_LABELS, applies, type Query, type RosterCreator, type SortKey, type Status } from "@/lib/roster";
import { Icon } from "../ui/icon";
import { Menu } from "../ui/menu";
import { Segmented } from "../ui/segmented";
import { PlatformIcon } from "../ui/platform-icon";
import { CountryFlag } from "../ui/country-flag";
import styles from "./toolbar.module.css";

/*
  The toolbar (was: the filter row and its chips). The search first and largest, with `/` to reach it from anywhere
  and Esc to clear it; the status, the most used filter, one tap away with its counts; then the platforms on the
  contract by their own icons, the countries by their flags with their counts in scope, the sort and its direction,
  and the view. What is applied reads as a sentence under it, each part a link that takes itself away.
*/

export type View = "cards" | "table";

type Patch = Partial<Record<"q" | "status" | "platform" | "country" | "sort" | "dir" | "view", string | null>>;

export function Toolbar({
  query,
  view,
  counts,
  roster,
  shown,
  onChange,
  onClear,
}: {
  query: Query;
  view: View;
  counts: { all: number; active: number; idle: number; dropped: number };
  roster: RosterCreator[];
  shown: number;
  onChange: (p: Patch) => void;
  onClear: () => void;
}) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.row}>
        <Search value={query.q} total={roster.length} onChange={(q) => onChange({ q })} />
        <Segmented<Status | "all">
          label="Status"
          value={query.status}
          onChange={(s) => onChange({ status: s })}
          options={[
            { id: "all", label: "All", count: counts.all },
            { id: "active", label: "Active", count: counts.active },
            { id: "idle", label: "Idle", count: counts.idle },
            { id: "dropped", label: "Dropped", count: counts.dropped },
          ]}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.platforms} role="group" aria-label="Platforms">
          {CAMPAIGN.platforms.map((p) => {
            const on = query.platforms.includes(p);
            const n = roster.filter((c) => applies(c, { ...query, platforms: [p] }, undefined)).length;
            return (
              <button
                key={p}
                type="button"
                aria-pressed={on}
                className={styles.platform}
                onClick={() => {
                  const next = on ? query.platforms.filter((x) => x !== p) : [...query.platforms, p];
                  onChange({ platform: next.join(",") || null });
                }}
                title={`${on ? "Showing" : "Show"} creators on ${PLATFORM_LABELS[p]}`}
              >
                <PlatformIcon platform={p} size={22} />
                <span>{PLATFORM_LABELS[p]}</span>
                <span className={styles.n}>{n}</span>
              </button>
            );
          })}
        </div>

        <Menu
          label="Country"
          value={query.country}
          onChange={(c) => onChange({ country: c })}
          lead={query.country === "all" ? <Icon name="globe" size={18} /> : undefined}
          options={[
            { id: "all" as const, label: "All countries", count: roster.filter((c) => applies(c, query, "country")).length },
            ...Object.values(COUNTRIES)
              .map((k) => ({
                id: k.code,
                label: k.name,
                lead: <CountryFlag country={k} size={20} />,
                count: roster.filter((c) => applies(c, { ...query, country: k.code })).length,
              }))
              .sort((a, b) => b.count - a.count),
          ]}
        />

        <div className={styles.sort}>
          <Menu<SortKey>
            label="Sort by"
            value={query.sort}
            onChange={(sort) => onChange({ sort })}
            lead={<Icon name="sort" size={18} />}
            options={SORTS.map((s) => ({ id: s.id, label: s.label }))}
          />
          <button
            type="button"
            className={styles.dir}
            data-dir={query.dir}
            onClick={() => onChange({ dir: query.dir === "desc" ? "asc" : "desc" })}
            aria-label={query.dir === "desc" ? (query.sort === "name" ? "A to Z; show Z to A" : "Highest first; show lowest first") : query.sort === "name" ? "Z to A; show A to Z" : "Lowest first; show highest first"}
            title={query.dir === "desc" ? "Highest first" : "Lowest first"}
          >
            <Icon name="arrow-down" size={18} />
          </button>
        </div>

        <div className={styles.view}>
          <Segmented<View>
            label="View"
            size={36}
            value={view}
            onChange={(v) => onChange({ view: v })}
            options={[
              { id: "cards", label: "Cards", icon: <Icon name="grid" size={18} />, hideLabel: true },
              { id: "table", label: "Table", icon: <Icon name="rows" size={18} />, hideLabel: true },
            ]}
          />
        </div>
      </div>

      <Applied query={query} shown={shown} total={roster.length} onChange={onChange} onClear={onClear} />
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
    <label className={styles.search} data-anim-host>
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
        placeholder={`Search ${total} creators or @handles`}
        aria-label="Search creators or handles"
        maxLength={80}
      />
      {text ? (
        <button type="button" className={styles.clear} onClick={() => type("")} aria-label="Clear search">
          <Icon name="close" size={16} />
        </button>
      ) : (
        <kbd className={styles.key} aria-hidden>
          /
        </kbd>
      )}
    </label>
  );
}

// what is applied, as a sentence; each part takes itself away
function Applied({ query, shown, total, onChange, onClear }: { query: Query; shown: number; total: number; onChange: (p: Patch) => void; onClear: () => void }) {
  const parts: { key: string; text: React.ReactNode; off: Patch }[] = [];
  if (query.status !== "all") parts.push({ key: "status", text: STATUS_LABELS[query.status].toLowerCase(), off: { status: null } });
  if (query.platforms.length) parts.push({ key: "platform", text: `on ${query.platforms.map((p: Platform) => PLATFORM_LABELS[p]).join(" or ")}`, off: { platform: null } });
  if (query.country !== "all") parts.push({ key: "country", text: `in ${COUNTRIES[query.country].name}`, off: { country: null } });
  if (query.q) parts.push({ key: "q", text: <>matching &lsquo;{query.q}&rsquo;</>, off: { q: null } });
  const order = SORTS.find((s) => s.id === query.sort)!.label.toLowerCase();

  return (
    <p className={styles.applied} aria-live="polite">
      {parts.length === 0 ? (
        <>
          Showing all <strong>{total}</strong> creators, {query.sort === "name" ? (query.dir === "desc" ? "A to Z" : "Z to A") : `${query.dir === "desc" ? "most" : "fewest"} ${order} first`}.
        </>
      ) : (
        <>
          Showing <strong>{shown}</strong> of {total}:{" "}
          {parts.map((p, i) => (
            <span key={p.key}>
              <button type="button" className={styles.part} onClick={() => onChange(p.off)} title="Remove">
                {p.text}
                <Icon name="close" size={14} />
              </button>
              {i < parts.length - 1 ? ", " : ". "}
            </span>
          ))}
          <button type="button" className={styles.clearAll} onClick={onClear}>
            Clear all
          </button>
        </>
      )}
    </p>
  );
}
