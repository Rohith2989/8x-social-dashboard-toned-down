"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./icon";
import styles from "./dialog.module.css";

/*
  A dialog (kit: dialogs float on a soft shadow over a light scrim, radius 24). It rises a little as it opens and
  sinks as it closes; it stays mounted and inert while closed, so there is no state to juggle for the way out. Esc,
  the scrim and the close button all close it. Focus moves into it on open, is held inside it, and goes back to
  where it came from on close.
*/

const subscribe = () => () => {};
const useClient = () => useSyncExternalStore(subscribe, () => true, () => false);

export function Dialog({
  open,
  onClose,
  label,
  children,
  width = 540,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
  width?: number;
}) {
  const client = useClient();
  const panel = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    back.current = document.activeElement as HTMLElement | null;
    const el = panel.current;
    // the first thing to act on, else the panel itself
    const first = el?.querySelector<HTMLElement>("[data-autofocus]") ?? el?.querySelector<HTMLElement>("button:not([disabled]), input, textarea");
    const t = window.setTimeout(() => (first ?? el)?.focus({ preventScroll: true }), 60);
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Tab" && el) {
        const items = [...el.querySelectorAll<HTMLElement>("button:not([disabled]), input, textarea, a[href], [tabindex='0']")];
        if (!items.length) return;
        const [a, z] = [items[0], items[items.length - 1]];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          z.focus();
        } else if (!e.shiftKey && document.activeElement === z) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    window.addEventListener("keydown", key);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", key);
      back.current?.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!client) return null;
  return createPortal(
    <div className={styles.layer} data-open={open} inert={!open}>
      <div className={styles.scrim} onClick={onClose} aria-hidden />
      <div ref={panel} className={styles.panel} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} style={{ width: `min(${width}px, calc(100vw - 32px))` }}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close" data-anim-host>
          <Icon name="close" size={18} />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
