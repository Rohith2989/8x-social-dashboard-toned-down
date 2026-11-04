"use client";

import { ArrivalProvider } from "./arrival";
import { Icon, type IconName } from "./icon";
import { RollingNumber } from "./rolling-number";
import styles from "./selection-bar.module.css";

/*
  The selection bar (was: the brand selection bar): picking a card or a row pins it to the foot of the tray, what is
  picked (faces, or posters) and its count on the left, the things to do with them inline, and Clear on the right;
  Esc clears too. It rises in with the first pick and sinks with the last. The list keeps room at its foot while it
  is up, so it never covers a row. Each page hands it its own noun and actions (Creators: copy links, export, flag;
  Posts & feed: copy links, spark codes, download, export, flag). An action that cannot apply to this pick is
  disabled and says why; one that takes time says where it is in place of its label.
*/

export type SelectionAction = {
  id: string;
  icon: IconName;
  label: string;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  busy?: string;
  tone?: "flag";
};

export function SelectionBar({
  count,
  noun,
  heads,
  actions,
  onClear,
}: {
  count: number;
  noun: [string, string];
  heads: React.ReactNode;
  actions: SelectionAction[];
  onClear: () => void;
}) {
  const up = count > 0;
  return (
    <div
      className={styles.bar}
      data-up={up}
      data-many={actions.length > 3 || undefined}
      inert={!up}
      role="region"
      aria-label={`Selected ${noun[1]}`}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClear();
      }}
    >
      <div className={styles.who}>
        <span className={styles.heads} aria-hidden>
          {heads}
        </span>
        <ArrivalProvider value="in">
          <span className={styles.count}>
            <RollingNumber value={String(count)} className="num" />
            <span>{count === 1 ? noun[0] : noun[1]} selected</span>
          </span>
        </ArrivalProvider>
      </div>
      <div className={styles.actions}>
        {actions.map((a) => (
          <button
            key={a.id}
            type="button"
            className={`${styles.action} ${a.tone === "flag" ? styles.flag : ""}`}
            onClick={a.onClick}
            disabled={a.disabled || !!a.busy}
            data-busy={a.busy ? "" : undefined}
            data-anim-host
            title={a.title}
          >
            <Icon name={a.icon} size={18} />
            <span>{a.busy ?? a.label}</span>
          </button>
        ))}
      </div>
      <button type="button" className={styles.clear} onClick={onClear} aria-label="Clear the selection" title="Clear (Esc)" data-anim-host>
        <Icon name="close" size={18} />
      </button>
    </div>
  );
}
