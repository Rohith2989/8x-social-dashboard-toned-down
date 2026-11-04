import styles from "./dialogs.module.css";

// the brand's dot loader: three dots rising in turn, only while something is on its way
export function Sending() {
  return (
    <span className={styles.loader} role="status" aria-label="Sending">
      <i />
      <i />
      <i />
    </span>
  );
}

// a dialog's own confirmation: the check draws itself in the vertical colour
export function Done({ title, line, onDone }: { title: string; line: string; onDone: () => void }) {
  return (
    <div className={styles.done}>
      <span className={styles.doneMark} aria-hidden>
        <svg viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="30" />
          <path d="m20 33 8.5 8.5L45 24" />
        </svg>
      </span>
      <h2>{title}</h2>
      <p>{line}</p>
      <button type="button" className={styles.doneButton} onClick={onDone} data-autofocus>
        Done
      </button>
    </div>
  );
}
