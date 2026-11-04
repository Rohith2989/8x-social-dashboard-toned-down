"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import styles from "./sheet.module.css";

/*
  A sheet from the right, for what a wide screen shows in the window's right-hand column (below 1360 px there is no
  column). It slides in over a light scrim; Esc and the scrim close it. Above 1360 px it never shows.
*/

const subscribe = () => () => {};
const useClient = () => useSyncExternalStore(subscribe, () => true, () => false);

export function Sheet({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: React.ReactNode }) {
  const client = useClient();
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open, onClose]);
  if (!client) return null;
  return createPortal(
    <div className={styles.layer} data-open={open} inert={!open}>
      <div className={styles.scrim} onClick={onClose} aria-hidden />
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label={label}>
        {children}
      </div>
    </div>,
    document.body,
  );
}
