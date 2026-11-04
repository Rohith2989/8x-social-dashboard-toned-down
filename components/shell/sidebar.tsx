"use client";

import { useEffect, useId, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND, CAMPAIGN } from "@/lib/demo";
import { POSTS } from "@/lib/roster";
import { MEMBERS } from "@/lib/team";
import { Icon, type IconName } from "../ui/icon";
import { usePlanState, waitingIn } from "../plan/store";
import { ThemeSwitch } from "./theme-switch";
import { WorkspaceCard } from "./workspace";
import styles from "./sidebar.module.css";

/*
  The sidebar, as Halo Lab draws it: the logo, then who this is, large (the brand's own logo, e-Matura's mortarboard E,
  with a live dot while a campaign runs; a sheen crosses it on hover, and a click opens the brand's card), then
  the pages, quiet, the current one on a soft pill with its icon in the vertical colour. At the foot, a blob of the
  vertical's colours with the grain on it.
*/

// every page links. Content plan counts the scripts waiting for the brand (live); Team, the people on the workspace
const NAV: { href: string; label: string; icon: IconName; count?: string; fresh?: boolean }[] = [
  { href: "/", label: "Overview", icon: "overview" },
  { href: "/creators", label: "Creators", icon: "creators", count: String(CAMPAIGN.creators) },
  { href: "/posts", label: "Posts & feed", icon: "posts", count: String(POSTS.length) },
  { href: "/plan", label: "Content plan", icon: "plan", fresh: true },
  { href: "/analytics", label: "Analytics", icon: "analytics" },
  { href: "/team", label: "Team", icon: "team", count: String(MEMBERS.length) },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const path = usePathname();
  const waiting = waitingIn(usePlanState()).length;
  const ref = useRef<HTMLElement>(null);

  // on a screen too short for it all (a phone held sideways), the sidebar scrolls and its blob gives way: measured
  // against the room the foot keeps for the blob (--foot-space), so taking the blob away never flips it back
  useEffect(() => {
    const side = ref.current;
    if (!side) return;
    const check = () => {
      const foot = side.querySelector<HTMLElement>("[data-foot]");
      if (!foot) return;
      const room = parseFloat(getComputedStyle(side).getPropertyValue("--foot-space")) || 0;
      const kept = parseFloat(getComputedStyle(foot).paddingBottom) || 0;
      const need = side.scrollHeight - kept + room;
      if (need > side.clientHeight + 1) side.dataset.overflow = "";
      else delete side.dataset.overflow;
    };
    check();
    const watch = new ResizeObserver(check);
    watch.observe(side);
    window.addEventListener("resize", check);
    return () => {
      watch.disconnect();
      window.removeEventListener("resize", check);
    };
  }, []);
  return (
    <>
      <div className={`${styles.scrim} ${open ? styles.scrimOn : ""}`} onClick={onClose} aria-hidden />
      <aside ref={ref} className={`${styles.sidebar} ${open ? styles.open : ""}`} aria-label="Workspace">
        <div className={styles.top}>
          <Link href="/" className={styles.lockup} aria-label="Social, home" onClick={onClose}>
            <img src="/brand/social-lockup-ink.svg" alt="" width={110} height={25} className={styles.full} />
            <img src="/brand/8x-ink.svg" alt="" width={33} height={22} className={styles.mark} />
          </Link>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close menu" data-anim-host>
            <Icon name="close" />
          </button>
        </div>

        <WorkspaceCard className={styles.profile} onNavigate={onClose}>
          <span className={styles.avatar}>
            <span className={styles.pic} data-pic>
              <span className={styles.markBox}>
                <img src={BRAND.avatar} alt="" width={360} height={128} />
                <span className={styles.glint} aria-hidden />
              </span>
            </span>
            <span className={styles.badge} aria-hidden>
              <i />
            </span>
          </span>
          <strong>{BRAND.name}</strong>
          <span className={styles.role}>{BRAND.workspace}</span>
        </WorkspaceCard>

        <nav className={styles.nav} aria-label="Pages">
          {NAV.map((n) => ({ ...n, count: n.href === "/plan" ? (waiting ? String(waiting) : undefined) : n.count })).map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`${styles.item} ${path === n.href ? styles.current : ""}`}
              aria-current={path === n.href ? "page" : undefined}
              data-anim-host
              title={n.label}
              onClick={onClose}
            >
              <Icon name={n.icon} />
              <span className={styles.label}>{n.label}</span>
              {n.count && (
                <span className={`${styles.count} ${n.fresh ? styles.fresh : ""}`}>
                  {n.count}
                  {n.fresh && <span className="sr-only"> new</span>}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className={styles.foot} data-foot>
          <ThemeSwitch />
          <Link
            href="/settings"
            className={`${styles.item} ${path === "/settings" ? styles.current : ""}`}
            aria-current={path === "/settings" ? "page" : undefined}
            data-anim-host
            title="Settings"
            onClick={onClose}
          >
            <Icon name="settings" />
            <span className={styles.label}>Settings</span>
          </Link>
          <Link href="/sign-in?out=1" className={styles.item} data-anim-host title="Log out">
            <Icon name="logout" />
            <span className={styles.label}>Log out</span>
          </Link>
        </div>

        <Blob />
      </aside>
    </>
  );
}

// the foot's blob: the deep blue rising into the glow, a pale moon of the accent on it, and the grain over both
function Blob() {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={styles.blob} viewBox="0 0 236 190" aria-hidden preserveAspectRatio="xMinYMax slice">
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="1" x2="0.9" y2="0.1">
          <stop offset="0" style={{ stopColor: "var(--vertical-deep)" }} />
          <stop offset="0.55" style={{ stopColor: "var(--vertical)" }} />
          <stop offset="1" style={{ stopColor: "var(--vertical-glow)" }} />
        </linearGradient>
        <radialGradient id={`${id}b`} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" style={{ stopColor: "var(--vertical-light)" }} />
          <stop offset="1" style={{ stopColor: "var(--vertical-accent)" }} />
        </radialGradient>
        <pattern id={`${id}g`} width="96" height="96" patternUnits="userSpaceOnUse">
          <image href="/media/grain-coarse.webp" width="96" height="96" />
        </pattern>
        <clipPath id={`${id}c`}>
          <path d="M-12 200C-22 132 4 84 52 78c44-6 58 38 98 46 40 8 74 16 96 76Z" />
          <circle cx="104" cy="112" r="40" />
        </clipPath>
      </defs>
      <path d="M-12 200C-22 132 4 84 52 78c44-6 58 38 98 46 40 8 74 16 96 76Z" fill={`url(#${id}a)`} />
      <circle cx="104" cy="112" r="40" fill={`url(#${id}b)`} opacity="0.92" />
      <rect width="236" height="190" fill={`url(#${id}g)`} clipPath={`url(#${id}c)`} />
    </svg>
  );
}
