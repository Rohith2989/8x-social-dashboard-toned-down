"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "./icon";
import styles from "./menu.module.css";

/*
  The one dropdown, for picking several (the product's multi-select: it applies on every pick and stays open, so the
  list behind it follows each one). The trigger names what is picked ("All creators", "Aastha Bishnoi", "Aastha and
  2 more") and wears its first faces; the panel leads with the way back to everyone, then each option with what leads
  it, its count in scope and a box that fills when it is picked. Past ten options it can be typed into. Arrow keys
  move, Enter or Space picks, Esc and a click outside close and hand focus back to the trigger.
*/

export type MultiOption<T extends string> = { id: T; label: string; short?: string; lead?: React.ReactNode; count?: number };

export function MultiMenu<T extends string>({
  values,
  options,
  onChange,
  label,
  all,
  lead,
  align = "start",
}: {
  values: T[];
  options: MultiOption<T>[];
  onChange: (v: T[]) => void;
  label: string;
  // what the trigger and the first row say when nothing is picked ("All creators")
  all: string;
  lead?: React.ReactNode;
  align?: "start" | "end";
}) {
  const [open, setOpen] = useState(false);
  const [find, setFind] = useState("");
  const [hi, setHi] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const picked = options.filter((o) => values.includes(o.id));
  const shown = options.filter((o) => !find || o.label.toLowerCase().includes(find.toLowerCase()));
  const searchable = options.length > 10;
  // the first row is the way back to everyone; the options follow it
  const rows = shown.length + 1;

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", away);
    return () => window.removeEventListener("pointerdown", away);
  }, [open]);

  const toggle = () => {
    setFind("");
    setHi(0);
    setOpen((o) => !o);
  };

  const flip = (v: T) => onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);

  const choose = (row: number) => {
    if (row === 0) onChange([]);
    else if (shown[row - 1]) flip(shown[row - 1].id);
  };

  const key = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      trigger.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHi((h) => Math.min(rows - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHi((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter" || (e.key === " " && (e.target as HTMLElement).tagName !== "INPUT")) {
      e.preventDefault();
      choose(hi);
    }
  };

  const name = (o: MultiOption<T>) => o.short ?? o.label;
  const said =
    picked.length === 0 ? all : picked.length === 1 ? picked[0].label : picked.length === 2 ? `${name(picked[0])} and ${name(picked[1])}` : `${name(picked[0])} and ${picked.length - 1} more`;

  return (
    <div ref={root} className={styles.menu} onKeyDown={key}>
      <button
        ref={trigger}
        type="button"
        className={`${styles.trigger} ${open ? styles.open : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        onClick={toggle}
        data-anim-host
      >
        {picked.length ? <span className={styles.leads}>{picked.slice(0, 3).map((o) => <span key={o.id}>{o.lead}</span>)}</span> : lead}
        <span className={styles.value}>
          <span className="sr-only">{label}: </span>
          {said}
        </span>
        <Icon name="down" size={16} stroke={2} />
      </button>
      {open && (
        <div className={`${styles.panel} ${align === "end" ? styles.end : ""}`}>
          {searchable && (
            <input
              autoFocus
              className={styles.find}
              placeholder={`Find a ${label.toLowerCase()}`}
              value={find}
              onChange={(e) => {
                setFind(e.target.value);
                setHi(0);
              }}
            />
          )}
          <ul id={id} role="listbox" aria-label={label} aria-multiselectable className={styles.list}>
            <li>
              <button
                type="button"
                role="option"
                aria-selected={values.length === 0}
                className={`${styles.option} ${hi === 0 ? styles.hi : ""}`}
                onPointerEnter={() => setHi(0)}
                onClick={() => choose(0)}
              >
                <span className={styles.label}>{all}</span>
                <span className={styles.mark} aria-hidden>
                  {values.length === 0 && <Icon name="tick" size={16} stroke={2.2} />}
                </span>
              </button>
            </li>
            {shown.map((o, i) => {
              const on = values.includes(o.id);
              return (
                <li key={o.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={on}
                    className={`${styles.option} ${i + 1 === hi ? styles.hi : ""}`}
                    onPointerEnter={() => setHi(i + 1)}
                    onClick={() => choose(i + 1)}
                    disabled={o.count === 0 && !on}
                  >
                    {o.lead}
                    <span className={styles.label}>{o.label}</span>
                    {o.count != null && <span className={styles.count}>{o.count}</span>}
                    <span className={styles.box} data-on={on} aria-hidden>
                      <svg viewBox="0 0 20 20">
                        <path d="m5.5 10.2 3 3 6-6.4" />
                      </svg>
                    </span>
                  </button>
                </li>
              );
            })}
            {shown.length === 0 && <li className={styles.none}>Nothing matches</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
