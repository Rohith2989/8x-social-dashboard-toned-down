"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "./icon";
import styles from "./menu.module.css";

/*
  The one dropdown (the product's rule: one panel everywhere, never the OS menu). A trigger that names what is
  chosen, and a panel of options, each with what leads it (a flag, an icon) and its count in scope, so filtering is
  never trial and error. Past ten options it can be typed into. Arrow keys move, Enter picks, Esc and a click outside
  close; picking closes it and hands focus back to the trigger.
*/

export type MenuOption<T extends string> = { id: T; label: string; lead?: React.ReactNode; count?: number };

export function Menu<T extends string>({
  value,
  options,
  onChange,
  label,
  lead,
  align = "start",
  variant = "pill",
}: {
  value: T;
  options: MenuOption<T>[];
  onChange: (v: T) => void;
  label: string;
  lead?: React.ReactNode;
  align?: "start" | "end";
  // "title": the trigger is drawn as a card's title, for a menu that says what a card shows
  variant?: "pill" | "title";
}) {
  const [open, setOpen] = useState(false);
  const [find, setFind] = useState("");
  const [hi, setHi] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const chosen = options.find((o) => o.id === value) ?? options[0];
  const shown = options.filter((o) => !find || o.label.toLowerCase().includes(find.toLowerCase()));
  const searchable = options.length > 10;

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
    setHi(Math.max(0, options.findIndex((o) => o.id === value)));
    setOpen((o) => !o);
  };

  const pick = (v: T) => {
    onChange(v);
    setOpen(false);
    trigger.current?.focus();
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
      setHi((h) => Math.min(shown.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHi((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (shown[hi]) pick(shown[hi].id);
    }
  };

  return (
    <div ref={root} className={styles.menu} onKeyDown={key}>
      <button
        ref={trigger}
        type="button"
        className={`${styles.trigger} ${variant === "title" ? styles.titleTrigger : ""} ${open ? styles.open : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        onClick={toggle}
        data-anim-host
      >
        {lead ?? chosen.lead}
        <span className={styles.value}>
          <span className="sr-only">{label}: </span>
          {chosen.label}
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
          <ul id={id} role="listbox" aria-label={label} className={styles.list}>
            {shown.map((o, i) => (
              <li key={o.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={o.id === value}
                  className={`${styles.option} ${i === hi ? styles.hi : ""}`}
                  onPointerEnter={() => setHi(i)}
                  onClick={() => pick(o.id)}
                  disabled={o.count === 0 && o.id !== value}
                >
                  {o.lead}
                  <span className={styles.label}>{o.label}</span>
                  {o.count != null && <span className={styles.count}>{o.count}</span>}
                  <span className={styles.mark} aria-hidden>
                    {o.id === value && <Icon name="tick" size={16} stroke={2.2} />}
                  </span>
                </button>
              </li>
            ))}
            {shown.length === 0 && <li className={styles.none}>Nothing matches</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
