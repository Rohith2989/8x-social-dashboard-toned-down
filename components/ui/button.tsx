import styles from "./button.module.css";

/*
  Buttons are pills (kit: 36 / 46 / 56). Ink for the one action that matters on a screen, stone for quiet, ghost for
  the rest; glass sits on the aura, paper on ink. Each carries the brand's current: on hover a band of fine dots runs
  in from the left and the fill follows behind its curved edge, then ebbs back when the pointer leaves.
*/

type Variant = "ink" | "stone" | "ghost" | "glass" | "paper";

export function Button({
  variant = "stone",
  size = 46,
  icon,
  iconAfter,
  children,
  className,
  label,
  onClick,
  href,
  pressed,
  disabled,
  type = "button",
}: {
  variant?: Variant;
  size?: 36 | 46;
  icon?: React.ReactNode;
  iconAfter?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  label?: string;
  onClick?: () => void;
  href?: string;
  pressed?: boolean;
  // a button that cannot act now says why in its title, set by the page around it
  disabled?: boolean;
  // a form's own button sends it (Enter in its field does too)
  type?: "button" | "submit";
}) {
  const cls = `${styles.button} ${styles[variant]} ${size === 36 ? styles.small : ""} ${children ? "" : styles.round} ${className ?? ""}`;
  const inner = (
    <>
      <span className={styles.current} aria-hidden>
        <span className={styles.motion}>
          <i className={styles.dots} />
          <i className={styles.solid} />
        </span>
      </span>
      {icon}
      {children && <span className={styles.label}>{children}</span>}
      {iconAfter}
    </>
  );
  if (href) {
    return (
      <a className={cls} href={href} aria-label={label} data-anim-host>
        {inner}
      </a>
    );
  }
  return (
    <button type={type === "submit" ? "submit" : "button"} className={cls} aria-label={label} aria-pressed={pressed} onClick={onClick} disabled={disabled} data-anim-host>
      {inner}
    </button>
  );
}
