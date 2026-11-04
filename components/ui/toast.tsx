"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Icon, type IconName } from "./icon";
import styles from "./toast.module.css";

/*
  Toasts: one line each, in an ink pill at the foot of the screen, with an icon that moves once (the check draws, the
  arrow drops). They stay four seconds; pointing at one holds it. One that can be undone carries Undo, and takes five.
  The region is polite to screen readers.
*/

export type Toast = { text: string; icon?: IconName; undo?: () => void };
type Item = Toast & { id: number; leaving?: boolean };

const ToastContext = createContext<(t: Toast) => void>(() => {});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const timers = useRef(new Map<number, number>());
  const seq = useRef(0);

  const remove = useCallback((id: number) => {
    window.clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setItems((all) => all.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    window.setTimeout(() => setItems((all) => all.filter((t) => t.id !== id)), 260);
  }, []);

  const hold = useCallback(
    (id: number, ms: number) => {
      window.clearTimeout(timers.current.get(id));
      timers.current.set(id, window.setTimeout(() => remove(id), ms));
    },
    [remove],
  );

  const push = useCallback(
    (t: Toast) => {
      const id = ++seq.current;
      setItems((all) => [...all.slice(-2), { ...t, id }]);
      hold(id, t.undo ? 5000 : 4000);
    },
    [hold],
  );

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className={styles.region} role="status" aria-live="polite">
        {items.map((t) => (
          <div
            key={t.id}
            className={`${styles.toast} ${t.leaving ? styles.leaving : ""}`}
            onPointerEnter={() => window.clearTimeout(timers.current.get(t.id))}
            onPointerLeave={() => hold(t.id, 2000)}
            data-arrive="in"
          >
            <span className={styles.icon}>
              <Icon name={t.icon ?? "check"} size={18} stroke={1.8} />
            </span>
            <span className={styles.text}>{t.text}</span>
            {t.undo && (
              <button
                type="button"
                className={styles.undo}
                onClick={() => {
                  t.undo?.();
                  remove(t.id);
                }}
              >
                Undo
              </button>
            )}
            <button type="button" className={styles.dismiss} onClick={() => remove(t.id)} aria-label="Dismiss">
              <Icon name="close" size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
