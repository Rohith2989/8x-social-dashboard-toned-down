"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Icon, type IconName } from "./icon";
import styles from "./actions.module.css";

/*
  A menu of actions behind a button (a card's ⋮, the bell, the brand's card in the sidebar): the panel opens over the
  page, next to its button, above it where there is no room below, and never past the screen's edge. It lives on the
  page's top layer, so no card's rounded clip can cut it. Arrow keys move, Enter acts, Esc and a click outside close it
  and hand focus back; scrolling the page closes it, so it never floats away from its button.
*/

export type Action = {
  id: string;
  label: string;
  icon?: IconName;
  // a richer lead than an icon (a face, a disc), and a second line (when, where)
  lead?: React.ReactNode;
  meta?: string;
  href?: string;
  external?: boolean;
  onSelect?: () => void;
  tone?: "danger";
};

export function ActionMenu({
  label,
  className,
  children,
  items,
  title,
  align = "end",
  width = 248,
  onOpen,
  dataAnimHost = true,
  footer,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
  items: Action[];
  title?: string;
  align?: "start" | "end";
  width?: number;
  onOpen?: () => void;
  dataAnimHost?: boolean;
  footer?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) trigger.current?.focus({ preventScroll: true });
  };

  // place the panel by its button, measured once it is drawn (written straight to its style: nothing to re-render)
  useLayoutEffect(() => {
    const t = trigger.current?.getBoundingClientRect();
    const p = panel.current;
    if (!open || !t || !p) return;
    const w = Math.min(width, window.innerWidth - 16);
    // its width first: its words wrap to it, and only then is its height its own
    p.style.width = `${w}px`;
    const h = p.offsetHeight;
    const left = Math.max(8, Math.min(align === "end" ? t.right - w : t.left, window.innerWidth - w - 8));
    const below = t.bottom + 8;
    const top = below + h > window.innerHeight - 8 && t.top - 8 - h > 8 ? t.top - 8 - h : Math.min(below, window.innerHeight - h - 8);
    p.style.left = `${left}px`;
    p.style.top = `${Math.max(8, top)}px`;
    p.querySelector<HTMLElement>("[role=menuitem]")?.focus({ preventScroll: true });
  }, [open, width, align]);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      const n = e.target as Node;
      if (!panel.current?.contains(n) && !trigger.current?.contains(n)) close(false);
    };
    const gone = (e: Event) => {
      if (!panel.current?.contains(e.target as Node)) close(false);
    };
    window.addEventListener("pointerdown", away);
    window.addEventListener("scroll", gone, true);
    window.addEventListener("resize", gone);
    return () => {
      window.removeEventListener("pointerdown", away);
      window.removeEventListener("scroll", gone, true);
      window.removeEventListener("resize", gone);
    };
  }, [open]);

  const keys = (e: React.KeyboardEvent) => {
    const list = [...(panel.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? [])];
    const at = list.indexOf(document.activeElement as HTMLElement);
    const go = (i: number) => list[(i + list.length) % list.length]?.focus();
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      go(at + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      go(at - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      go(0);
    } else if (e.key === "End") {
      e.preventDefault();
      go(list.length - 1);
    } else if (e.key === "Tab") {
      close(false);
    }
  };

  const item = (a: Action) => {
    const inner = (
      <>
        {a.lead ?? (a.icon && <Icon name={a.icon} size={18} />)}
        <span className={styles.text}>
          <span>{a.label}</span>
          {a.meta && <span className={styles.meta}>{a.meta}</span>}
        </span>
        {a.external && <Icon name="outward" size={15} />}
      </>
    );
    const common = { role: "menuitem", className: styles.item, "data-tone": a.tone, "data-rich": a.lead ? "" : undefined, tabIndex: -1 } as const;
    if (a.href && a.external) {
      return (
        <a {...common} href={a.href} target="_blank" rel="noreferrer" onClick={() => close(false)}>
          {inner}
        </a>
      );
    }
    if (a.href) {
      return (
        <Link
          {...common}
          href={a.href}
          onClick={() => {
            a.onSelect?.();
            close(false);
          }}
        >
          {inner}
        </Link>
      );
    }
    return (
      <button
        {...common}
        type="button"
        onClick={() => {
          close();
          a.onSelect?.();
        }}
      >
        {inner}
      </button>
    );
  };

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className={className}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => {
          if (!open) onOpen?.();
          setOpen((o) => !o);
        }}
        data-anim-host={dataAnimHost || undefined}
      >
        {children}
      </button>
      {open &&
        createPortal(
          <div ref={panel} id={id} className={styles.panel} role="menu" aria-label={title ?? label} onKeyDown={keys}>
            {title && <p className={styles.title}>{title}</p>}
            {items.map((a) => (
              <div key={a.id} className={styles.row}>
                {item(a)}
              </div>
            ))}
            {footer}
          </div>,
          document.body,
        )}
    </>
  );
}
