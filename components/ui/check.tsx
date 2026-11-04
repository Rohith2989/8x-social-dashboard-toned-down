import styles from "./check.module.css";

/*
  The brand's checkbox: a soft square that fills with ink, its check drawing itself when ticked (kit: checkboxes fill
  in ink and draw in). Mixed shows a bar, for a "select all" with some rows picked. The label can be hidden, never
  absent.
*/

export function Check({
  checked,
  mixed,
  onChange,
  label,
  hideLabel,
  className,
  tone = "paper",
}: {
  checked: boolean;
  mixed?: boolean;
  onChange: (next: boolean) => void;
  label: string;
  hideLabel?: boolean;
  className?: string;
  tone?: "paper" | "glass";
}) {
  return (
    <label className={`${styles.check} ${styles[tone]} ${className ?? ""}`} onClick={(e) => e.stopPropagation()}>
      <input
        type="checkbox"
        checked={checked}
        ref={(el) => {
          if (el) el.indeterminate = !!mixed && !checked;
        }}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={styles.box} aria-hidden>
        <svg viewBox="0 0 20 20">
          {mixed && !checked ? <path d="M6 10h8" className={styles.bar} /> : <path d="m5.5 10.2 3 3 6-6.4" className={styles.tick} />}
        </svg>
      </span>
      <span className={hideLabel ? "sr-only" : styles.label}>{label}</span>
    </label>
  );
}
