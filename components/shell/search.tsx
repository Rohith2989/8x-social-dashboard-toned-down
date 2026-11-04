"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PLATFORM_LABELS } from "@/lib/demo";
import { compact } from "@/lib/format";
import { PLANS, reviewOf } from "@/lib/plan";
import { POSTS, ROSTER } from "@/lib/roster";
import { ACCOUNT_MANAGER, MEMBERS, ROLE_LABELS } from "@/lib/team";
import { Dialog } from "../ui/dialog";
import { Icon, type IconName } from "../ui/icon";
import { Face } from "../creators/face";
import styles from "./search.module.css";

/*
  Search, across the whole workspace: the pages, the creators, their posts (by caption), the content plan's scripts and
  the people. Typed into, it narrows as you type, accents ignored (Şevda is found as sevda); the arrow keys move
  through every result and Enter opens it where it lives. Opened from the overview's search button, or ⌘K / Ctrl K
  anywhere in the window.
*/

type Hit = { id: string; group: string; title: string; meta: string; href: string; lead: React.ReactNode };

const PAGES: { label: string; href: string; icon: IconName; meta: string }[] = [
  { label: "Overview", href: "/", icon: "overview", meta: "The campaign at a glance" },
  { label: "Creators", href: "/creators", icon: "creators", meta: "Who is posting, and how it goes" },
  { label: "Posts & feed", href: "/posts", icon: "posts", meta: "Every post, as a feed or a table" },
  { label: "Content plan", href: "/plan", icon: "plan", meta: "The scripts, to approve or flag" },
  { label: "Analytics", href: "/analytics", icon: "analytics", meta: "What it did for the business" },
  { label: "Team", href: "/team", icon: "team", meta: "People, access requests, your 8x team" },
  { label: "Settings", href: "/settings", icon: "settings", meta: "Your account, the workspace, data" },
];

const fold = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

const STATE_WORDS = { awaitingReview: "Waiting for you", approved: "Approved", flagged: "Flagged" } as const;

function hitsFor(q: string): Hit[] {
  const f = fold(q.trim());
  const has = (s: string) => fold(s).includes(f);
  const pages = PAGES.filter((p) => !f || has(p.label)).map<Hit>((p) => ({
    id: `page-${p.href}`,
    group: "Pages",
    title: p.label,
    meta: p.meta,
    href: p.href,
    lead: (
      <span className={styles.tile}>
        <Icon name={p.icon} size={18} />
      </span>
    ),
  }));
  if (!f) return pages;
  const creators = ROSTER.filter((c) => has(c.name) || c.accounts.some((a) => has(a.handle)))
    .slice(0, 5)
    .map<Hit>((c) => ({
      id: `creator-${c.id}`,
      group: "Creators",
      title: c.name,
      meta: `${c.videos} videos · ${compact(c.views)} views`,
      href: `/creators?open=${c.id}`,
      lead: <Face creator={c} size={34} />,
    }));
  const posts = POSTS.filter((p) => has(p.caption))
    .slice(0, 5)
    .map<Hit>((p) => {
      const c = ROSTER.find((r) => r.id === p.creatorId);
      return {
        id: `post-${p.id}`,
        group: "Posts",
        title: p.caption,
        meta: `${c?.name ?? p.handle} · ${PLATFORM_LABELS[p.platform]} · ${compact(p.views)} views`,
        href: `/posts?open=${p.id}`,
        lead: c ? <Face creator={c} size={34} /> : <span className={styles.tile}><Icon name="posts" size={18} /></span>,
      };
    });
  const scripts = PLANS.flatMap((p) => p.scripts.map((s) => ({ p, s })))
    .filter(({ s }) => has(s.format.name))
    .slice(0, 5)
    .map<Hit>(({ p, s }) => ({
      id: `script-${s.id}`,
      group: "Scripts",
      title: s.format.name,
      meta: `${p.name} · script ${s.n} · ${STATE_WORDS[reviewOf(s.events).state]}`,
      href: `/plan?plan=${p.key}&script=${s.n}`,
      lead: (
        <span className={styles.tile}>
          <Icon name="plan" size={18} />
        </span>
      ),
    }));
  const people = [
    ...MEMBERS.map((m) => ({ id: m.id, title: m.name, meta: `${ROLE_LABELS[m.role]} · ${m.email}`, initials: m.initials, photo: m.photo })),
    { id: "maya", title: ACCOUNT_MANAGER.label, meta: `Your ${ACCOUNT_MANAGER.role.toLowerCase()}`, initials: ACCOUNT_MANAGER.initial, photo: undefined },
  ]
    .filter((m) => has(m.title) || has(m.meta))
    .map<Hit>((m) => ({
      id: `person-${m.id}`,
      group: "People",
      title: m.title,
      meta: m.meta,
      href: "/team",
      lead: <span className={styles.initials}>{m.photo ? <img src={m.photo} alt="" width={256} height={256} /> : m.initials}</span>,
    }));
  return [...pages, ...creators, ...posts, ...scripts, ...people];
}

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hi, setHi] = useState(0);
  const list = useRef<HTMLDivElement>(null);
  const hits = useMemo(() => hitsFor(q), [q]);
  const at = Math.min(hi, Math.max(0, hits.length - 1));

  const go = (h: Hit | undefined) => {
    if (!h) return;
    onClose();
    router.push(h.href);
  };

  const move = (to: number) => {
    const n = (to + hits.length) % hits.length;
    setHi(n);
    list.current?.querySelector<HTMLElement>(`[data-i="${n}"]`)?.scrollIntoView({ block: "nearest" });
  };

  let group = "";
  return (
    <Dialog open={open} onClose={onClose} label="Search" width={640}>
      <div className={styles.search}>
        <label className={styles.field}>
          <Icon name="search" size={20} />
          <span className="sr-only">Search the workspace</span>
          <input
            data-autofocus
            value={q}
            placeholder="Search creators, posts, scripts, people…"
            spellCheck={false}
            autoComplete="off"
            role="combobox"
            aria-expanded="true"
            aria-controls="search-results"
            aria-activedescendant={hits[at] ? `hit-${hits[at].id}` : undefined}
            onChange={(e) => {
              setQ(e.target.value);
              setHi(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" && hits.length) {
                e.preventDefault();
                move(at + 1);
              } else if (e.key === "ArrowUp" && hits.length) {
                e.preventDefault();
                move(at - 1);
              } else if (e.key === "Enter") {
                e.preventDefault();
                go(hits[at]);
              }
            }}
          />
          <kbd>Esc</kbd>
        </label>

        <div ref={list} className={styles.results} id="search-results" role="listbox" aria-label="Results">
          {hits.length === 0 ? (
            <p className={styles.none}>
              Nothing called &ldquo;{q.trim()}&rdquo;. Try a creator&rsquo;s name, words from a caption or a script&rsquo;s title.
            </p>
          ) : (
            hits.map((h, i) => {
              const head = h.group !== group ? h.group : null;
              group = h.group;
              return (
                <div key={h.id}>
                  {head && <p className={styles.group}>{head}</p>}
                  <button
                    type="button"
                    id={`hit-${h.id}`}
                    role="option"
                    aria-selected={i === at}
                    data-i={i}
                    className={styles.hit}
                    onPointerMove={() => i !== at && setHi(i)}
                    onClick={() => go(h)}
                    tabIndex={-1}
                  >
                    {h.lead}
                    <span className={styles.text}>
                      <strong>{h.title}</strong>
                      <span>{h.meta}</span>
                    </span>
                    {i === at && <Icon name="right" size={16} />}
                  </button>
                </div>
              );
            })
          )}
        </div>
        <p className={styles.keys}>
          <kbd>↑</kbd>
          <kbd>↓</kbd> to move, <kbd>Enter</kbd> to open
        </p>
      </div>
    </Dialog>
  );
}
