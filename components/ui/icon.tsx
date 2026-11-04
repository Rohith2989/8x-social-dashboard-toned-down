import styles from "./icon.module.css";

/*
  The brand's icons: Lucide's shapes (kit v6, references/icons.md) at a 1.5 px stroke, outline only, ink by default.
  Each moves once, 300-600 ms, when something happens, and the motion is authored per icon (the bell swings, the
  arrow drops, the check draws itself), never a wiggle. An icon plays its motion when an element marked
  `data-anim-host` around it is hovered or focused; `show` icons play when their card arrives.
  Paths are Lucide's (ISC), inlined so the dashboard needs no icon package.
*/

export type IconName =
  | "overview" | "creators" | "posts" | "plan" | "analytics" | "team" | "help" | "settings"
  | "bell" | "download" | "search" | "updown" | "down" | "right" | "outward" | "arrow"
  | "up" | "fall" | "eye" | "heart" | "comment" | "share" | "send" | "play" | "pause" | "calendar"
  | "check" | "plan-ready" | "join" | "more" | "menu" | "close" | "clock" | "social"
  | "plus" | "tick" | "logout" | "percent" | "more-v"
  | "flag" | "copy" | "grid" | "rows" | "sort" | "minus" | "globe" | "arrow-down" | "shield" | "package"
  | "left" | "spark" | "link" | "pencil" | "dollar" | "tag" | "mail" | "megaphone" | "trash";

const P = ({ d, c }: { d: string; c?: string }) => <path d={d} className={c} />;

const SHAPES: Record<IconName, React.ReactNode> = {
  // layout-dashboard: its four panes trade heights
  overview: (
    <>
      <rect width="7" height="9" x="3" y="3" rx="1" className={styles.paneA} />
      <rect width="7" height="5" x="14" y="3" rx="1" className={styles.paneB} />
      <rect width="7" height="9" x="14" y="12" rx="1" className={styles.paneC} />
      <rect width="7" height="5" x="3" y="16" rx="1" className={styles.paneD} />
    </>
  ),
  // users: the one behind steps out
  creators: (
    <>
      <P d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <g className={styles.behind}>
        <P d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <P d="M16 3.13a4 4 0 0 1 0 7.75" />
      </g>
    </>
  ),
  // clapperboard: it claps
  posts: (
    <>
      <g className={styles.clapper}>
        <P d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z" />
        <P d="m6.2 5.3 3.1 3.9" />
        <P d="m12.4 3.4 3.1 4" />
      </g>
      <P d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </>
  ),
  // file-text: its lines write themselves
  plan: (
    <>
      <P d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <P d="M14 2v4a2 2 0 0 0 2 2h4" />
      <P d="M10 9H8" c={styles.write} />
      <P d="M16 13H8" c={styles.write} />
      <P d="M16 17H8" c={styles.write} />
    </>
  ),
  // chart-spline: the line draws
  analytics: (
    <>
      <P d="M3 3v16a2 2 0 0 0 2 2h16" />
      <P d="M7 16c.5-2 1.5-7 4-7 2 0 2 3 4 3 2.5 0 4.5-5 5-7" c={styles.draw} />
    </>
  ),
  // users-round: the one behind steps out
  team: (
    <>
      <P d="M18 21a8 8 0 0 0-16 0" />
      <circle cx="10" cy="8" r="5" />
      <P d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" c={styles.behind} />
    </>
  ),
  // circle-help: the question nods
  help: (
    <>
      <circle cx="12" cy="12" r="10" />
      <g className={styles.nod}>
        <P d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <P d="M12 17h.01" />
      </g>
    </>
  ),
  // settings: a quarter turn
  settings: (
    <g className={styles.turn}>
      <P d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </g>
  ),
  // bell: it swings
  bell: (
    <g className={styles.swing}>
      <P d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <P d="M10.3 21a1.94 1.94 0 0 0 3.4 0" c={styles.clapperBell} />
    </g>
  ),
  // download: the arrow drops in
  download: (
    <>
      <P d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <g className={styles.drop}>
        <P d="m7 10 5 5 5-5" />
        <P d="M12 15V3" />
      </g>
    </>
  ),
  search: (
    <g className={styles.look}>
      <circle cx="11" cy="11" r="8" />
      <P d="m21 21-4.3-4.3" />
    </g>
  ),
  updown: (
    <>
      <P d="m7 15 5 5 5-5" c={styles.downHalf} />
      <P d="m7 9 5-5 5 5" c={styles.upHalf} />
    </>
  ),
  down: <P d="m6 9 6 6 6-6" c={styles.dip} />,
  right: <P d="m9 18 6-6-6-6" c={styles.nudge} />,
  left: <P d="m15 18-6-6 6-6" c={styles.nudgeBack} />,
  // zap: TikTok's spark code; it flashes
  spark: <P d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" c={styles.flash} />,
  // link: its two halves close in
  link: (
    <>
      <P d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" c={styles.linkA} />
      <P d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" c={styles.linkB} />
    </>
  ),
  outward: (
    <g className={styles.out}>
      <P d="M7 7h10v10" />
      <P d="M7 17 17 7" />
    </g>
  ),
  arrow: (
    <g className={styles.nudge}>
      <P d="M5 12h14" />
      <P d="m12 5 7 7-7 7" />
    </g>
  ),
  // trending-up: it rises when its number shows
  up: (
    <g className={styles.rise}>
      <P d="M22 7 13.5 15.5 8.5 10.5 2 17" />
      <P d="M16 7h6v6" />
    </g>
  ),
  fall: (
    <>
      <P d="M22 17 13.5 8.5 8.5 13.5 2 7" />
      <P d="M16 17h6v-6" />
    </>
  ),
  eye: (
    <g className={styles.blink}>
      <P d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </g>
  ),
  heart: <P d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" c={styles.beat} />,
  comment: <P d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
  share: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <P d="m8.59 13.51 6.83 3.98" />
      <P d="m15.41 6.51-6.82 3.98" />
    </>
  ),
  // send: it flies out
  send: (
    <g className={styles.fly}>
      <P d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
      <P d="m21.854 2.147-10.94 10.939" />
    </g>
  ),
  play: <P d="M6 3.8v16.4a.8.8 0 0 0 1.2.7l13.4-8.2a.8.8 0 0 0 0-1.4L7.2 3.1A.8.8 0 0 0 6 3.8z" />,
  pause: (
    <>
      <rect x="14" y="4" width="4" height="16" rx="1" />
      <rect x="6" y="4" width="4" height="16" rx="1" />
    </>
  ),
  calendar: (
    <>
      <P d="M8 2v4" />
      <P d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <P d="M3 10h18" />
    </>
  ),
  // circle-check: the check draws itself
  check: (
    <>
      <circle cx="12" cy="12" r="10" />
      <P d="m9 12 2 2 4-4" c={styles.tick} />
    </>
  ),
  "plan-ready": (
    <>
      <P d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <P d="M14 2v4a2 2 0 0 0 2 2h4" />
      <P d="m9 15 2 2 4-4" c={styles.tick} />
    </>
  ),
  join: (
    <>
      <P d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <g className={styles.plus}>
        <P d="M19 8v6" />
        <P d="M22 11h-6" />
      </g>
    </>
  ),
  more: (
    <>
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </>
  ),
  menu: (
    <>
      <P d="M4 6h16" />
      <P d="M4 12h16" />
      <P d="M4 18h16" />
    </>
  ),
  close: (
    <>
      <P d="M18 6 6 18" />
      <P d="m6 6 12 12" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <P d="M12 6v6l4 2" />
    </>
  ),
  plus: (
    <g className={styles.plus}>
      <P d="M5 12h14" />
      <P d="M12 5v14" />
    </g>
  ),
  // check: it draws itself when its card arrives
  tick: <P d="M20 6 9 17l-5-5" c={styles.tickLong} />,
  logout: (
    <>
      <P d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <g className={styles.nudge}>
        <P d="m16 17 5-5-5-5" />
        <P d="M21 12H9" />
      </g>
    </>
  ),
  percent: (
    <>
      <P d="M19 5 5 19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </>
  ),
  "more-v": (
    <>
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="19" r="1" />
    </>
  ),
  // flag: its cloth ripples
  flag: (
    <>
      <P d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" c={styles.cloth} />
      <P d="M4 22v-7" />
    </>
  ),
  // copy: the front sheet lifts off the one behind
  copy: (
    <>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" className={styles.sheet} />
      <P d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </>
  ),
  // circle-dollar-sign: money in
  dollar: (
    <>
      <circle cx="12" cy="12" r="10" />
      <P d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <P d="M12 18V6" />
    </>
  ),
  // mail: a visit from an email
  mail: (
    <>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <P d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>
  ),
  // megaphone: the brand's own ads
  megaphone: (
    <>
      <P d="m3 11 18-5v12L3 14v-3z" />
      <P d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </>
  ),
  // tag: what a thing cost
  tag: (
    <>
      <P d="M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.42l8.7 8.7a2.43 2.43 0 0 0 3.42 0l6.58-6.58a2.43 2.43 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r="1.2" />
    </>
  ),
  // pencil: a change Maya made
  pencil: (
    <>
      <P d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z" />
      <P d="m15 5 4 4" />
    </>
  ),
  grid: (
    <>
      <rect width="7" height="7" x="3" y="3" rx="1.5" className={styles.paneA} />
      <rect width="7" height="7" x="14" y="3" rx="1.5" />
      <rect width="7" height="7" x="14" y="14" rx="1.5" className={styles.paneC} />
      <rect width="7" height="7" x="3" y="14" rx="1.5" />
    </>
  ),
  rows: (
    <>
      <P d="M3 6h.01" />
      <P d="M3 12h.01" />
      <P d="M3 18h.01" />
      <P d="M8 6h13" c={styles.write} />
      <P d="M8 12h13" c={styles.write} />
      <P d="M8 18h13" c={styles.write} />
    </>
  ),
  sort: (
    <>
      <P d="m21 16-4 4-4-4" c={styles.downHalf} />
      <P d="M17 20V4" />
      <P d="m3 8 4-4 4 4" c={styles.upHalf} />
      <P d="M7 4v16" />
    </>
  ),
  "arrow-down": (
    <>
      <P d="M12 5v14" />
      <P d="m19 12-7 7-7-7" />
    </>
  ),
  minus: <P d="M5 12h14" />,
  // trash-2: the lid lifts off
  trash: (
    <>
      <g className={styles.lid}>
        <P d="M3 6h18" />
        <P d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      </g>
      <P d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <P d="M10 11v6" />
      <P d="M14 11v6" />
    </>
  ),
  shield: (
    <>
      <P d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <P d="m9 12 2 2 4-4" c={styles.tick} />
    </>
  ),
  package: (
    <>
      <P d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
      <P d="M12 22V12" />
      <P d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7" />
      <P d="m7.5 4.27 9 5.15" />
    </>
  ),
  globe: (
    <g className={styles.turn}>
      <circle cx="12" cy="12" r="10" />
      <P d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <P d="M2 12h20" />
    </g>
  ),
  // message-circle-heart: Social's own icon
  social: (
    <>
      <P d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      <P d="M15.8 9.2a2.5 2.5 0 0 0-3.5 0l-.3.4-.35-.3a2.42 2.42 0 1 0-3.2 3.6l3.6 3.5 3.6-3.5c1.2-1.2 1.1-2.7.2-3.7" c={styles.beat} />
    </>
  ),
};

export function Icon({
  name,
  size = 20,
  stroke = 1.5,
  className,
  label,
}: {
  name: IconName;
  size?: number;
  stroke?: number;
  className?: string;
  label?: string;
}) {
  const filled = name === "play" || name === "pause";
  return (
    <svg
      className={`${styles.icon} ${className ?? ""}`}
      data-icon={name}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {SHAPES[name]}
    </svg>
  );
}
