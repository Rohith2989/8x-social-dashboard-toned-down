"use client";

import { useLayoutEffect, useRef, useState } from "react";
import styles from "./segmented.module.css";

/*
  A segmented control: pills on a soft track, the chosen one a white pill that glides to it (kit: tabs are pills on
  stone, the active one white with Animate UI's gliding highlight). Each option can carry a count, in Geist Mono, and
  an icon. Arrow keys move along it.
*/

export type Segment<T extends string> = { id: T; label: string; count?: number; icon?: React.ReactNode; hideLabel?: boolean };

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  size = 40,
}: {
  value: T;
  options: Segment<T>[];
  onChange: (v: T) => void;
  label: string;
  size?: 36 | 40;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);

  useLayoutEffect(() => {
    const place = () => {
      const el = track.current?.querySelector<HTMLElement>(`[data-seg="${value}"]`);
      if (el) setPill({ x: el.offsetLeft, w: el.offsetWidth });
    };
    place();
    const ro = new ResizeObserver(place);
    if (track.current) ro.observe(track.current);
    return () => ro.disconnect();
  }, [value, options.length]);

  const key = (e: React.KeyboardEvent) => {
    const i = options.findIndex((o) => o.id === value);
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : null;
    if (next == null) return;
    e.preventDefault();
    const o = options[(next + options.length) % options.length];
    onChange(o.id);
    track.current?.querySelector<HTMLElement>(`[data-seg="${o.id}"]`)?.focus();
  };

  return (
    <div ref={track} className={`${styles.track} ${size === 36 ? styles.small : ""}`} role="radiogroup" aria-label={label} onKeyDown={key}>
      <span className={styles.pill} style={pill ? { transform: `translateX(${pill.x}px)`, width: pill.w } : { opacity: 0 }} aria-hidden />
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          aria-label={o.hideLabel ? o.label : undefined}
          title={o.hideLabel ? o.label : undefined}
          tabIndex={value === o.id ? 0 : -1}
          data-seg={o.id}
          className={styles.seg}
          onClick={() => onChange(o.id)}
          data-anim-host
        >
          {o.icon}
          {!o.hideLabel && <span>{o.label}</span>}
          {o.count != null && <span className={styles.count}>{o.count}</span>}
        </button>
      ))}
    </div>
  );
}
