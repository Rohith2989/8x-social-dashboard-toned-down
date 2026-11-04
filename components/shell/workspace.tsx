"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { BRAND, CAMPAIGN, CAMPAIGNS } from "@/lib/demo";
import { defaultPlan } from "@/lib/plan";
import { ACCOUNT_MANAGER, MEMBERS } from "@/lib/team";
import { Icon } from "../ui/icon";
import { initialsOf, useAccount } from "../settings/account";
import { useInvites, withEightX } from "../team/store";
import styles from "./workspace.module.css";

/*
  The brand's card. Clicking the brand in the sidebar opens the workspace as a card of its own, not a list of links the
  sidebar already has: the brand's own logo across its top (e-Matura's lockup in white on its blue, with a line on what
  the workspace is on 8x), then what a member wants of the workspace at a glance: the campaign that is live and how far along it is,
  their 8x account manager and the way to write to her, the people on the workspace; Settings and Sign out at its foot.
  It grows out of the brand's picture with a band of light crossing the logo; Esc, a click outside or its × closes
  it and gives focus back to the brand. On a 2560 screen it is drawn at the window's own scale.
*/

const LIVE = CAMPAIGNS.find((c) => c.status === "live") ?? CAMPAIGNS[0];
const SINCE = (() => {
  const d = new Date(`${MEMBERS[0].since}T12:00:00Z`);
  return d.toLocaleString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
})();

export function WorkspaceCard({ className, children, onNavigate }: { className?: string; children: React.ReactNode; onNavigate?: () => void }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) trigger.current?.focus({ preventScroll: true });
  };
  const go = () => {
    close(false);
    onNavigate?.();
  };

  // placed over the sidebar, its picture where the brand's picture is (beside the rail when the sidebar is folded),
  // and never past the screen; measured once drawn and written straight to its style
  useLayoutEffect(() => {
    const t = trigger.current;
    const p = panel.current;
    if (!open || !t || !p) return;
    const z = parseFloat(getComputedStyle(p).zoom) || 1;
    const side = t.closest("aside")?.getBoundingClientRect() ?? t.getBoundingClientRect();
    const pic = (t.querySelector("[data-pic]") ?? t).getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = Math.min(380, (vw - 16) / z);
    p.style.width = `${w}px`;
    // its laid-out height (the opening animation scales it, so its drawn box is smaller at first), at the screen's scale
    const h = parseFloat(getComputedStyle(p).height) * z;
    const rail = vw >= 768 && side.width < 140;
    const left = Math.max(8, Math.min(rail ? side.right + 12 : side.left + 10, vw - w * z - 8));
    const top = Math.max(8, Math.min(pic.top - 12, vh - h - 8));
    p.style.left = `${left / z}px`;
    p.style.top = `${top / z}px`;
    p.style.transformOrigin = `${(pic.left + pic.width / 2 - left) / z}px ${(pic.top + pic.height / 2 - top) / z}px`;
    p.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      const n = e.target as Node;
      if (!panel.current?.contains(n) && !trigger.current?.contains(n)) close(false);
    };
    const resize = () => close(false);
    window.addEventListener("pointerdown", away);
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("pointerdown", away);
      window.removeEventListener("resize", resize);
    };
  }, [open]);

  const keys = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };
  // focus leaving the card (Tab past its last link) closes it
  const blur = (e: React.FocusEvent) => {
    const next = e.relatedTarget as Node | null;
    if (next && !panel.current?.contains(next) && !trigger.current?.contains(next)) close(false);
  };

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className={className}
        aria-label={`${BRAND.name}, ${BRAND.workspace.toLowerCase()}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen((o) => !o)}
        data-anim-host
      >
        {children}
      </button>
      {open &&
        createPortal(
          <div
            ref={panel}
            id={id}
            role="dialog"
            aria-labelledby={`${id}t`}
            className={styles.card}
            tabIndex={-1}
            onKeyDown={keys}
            onBlur={blur}
          >
            <Body titleId={`${id}t`} onClose={() => close()} onGo={go} />
          </div>,
          document.body,
        )}
    </>
  );
}

function Body({ titleId, onClose, onGo }: { titleId: string; onClose: () => void; onGo: () => void }) {
  const account = useAccount();
  const requests = withEightX(useInvites());
  const thread = defaultPlan();
  const share = LIVE.posts / LIVE.planned;
  const people = MEMBERS.map((m) => (m.you ? { ...m, initials: initialsOf(account) } : m));

  return (
    <>
      <div className={styles.banner}>
        <img className={styles.photo} src="/media/ematura-banner.webp" alt="" width={1280} height={560} />
        <span className={styles.glint} aria-hidden />
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close" data-anim-host>
          <Icon name="close" size={16} />
        </button>
        {/* the banner's own logo is the name; the words say what the workspace is */}
        <div className={styles.who}>
          <h2 id={titleId} className="sr-only">
            {BRAND.name}
          </h2>
          <p>
            <img src="/brand/8x-paper.svg" alt="" width={386} height={264} />
            {BRAND.workspace} · fully managed, since {SINCE}
          </p>
        </div>
      </div>

      <div className={styles.body}>
        <Link href="/" className={styles.live} onClick={onGo} data-tint="blue" style={{ "--share": share } as React.CSSProperties}>
          <span className={styles.liveTop}>
            <span className={styles.state}>
              <i aria-hidden />
              Live
            </span>
            <strong>{LIVE.name}</strong>
            <span className={styles.day}>
              Day {CAMPAIGN.day} of {CAMPAIGN.days}
            </span>
          </span>
          <span className={styles.track} aria-hidden>
            <span />
          </span>
          <span className={styles.liveFoot}>
            {LIVE.creators} creators posting · {LIVE.posts} of {LIVE.planned} posts out
          </span>
        </Link>

        <div className={styles.row}>
          <span className={styles.disc} aria-hidden>
            {ACCOUNT_MANAGER.initial}
          </span>
          <span className={styles.rowText}>
            <strong>{ACCOUNT_MANAGER.label}</strong>
            <span>Your account manager</span>
          </span>
          {thread && (
            <Link href={`/plan?plan=${thread.key}`} className={styles.write} onClick={onGo} data-anim-host>
              <Icon name="comment" size={16} />
              Write
            </Link>
          )}
        </div>

        <Link href="/team" className={`${styles.row} ${styles.people}`} onClick={onGo}>
          <span className={styles.faces} aria-hidden>
            {people.map((m, i) => (
              <span key={m.id} data-tone={i % 4}>
                {m.photo ? <img src={m.photo} alt="" width={256} height={256} /> : m.initials}
              </span>
            ))}
          </span>
          <span className={styles.rowText}>
            <strong>{people.length} people</strong>
            <span>{requests ? `${requests} request with 8x` : "No requests waiting"}</span>
          </span>
          <Icon name="right" size={18} />
        </Link>
      </div>

      <div className={styles.foot}>
        <Link href="/settings" onClick={onGo} data-anim-host>
          <Icon name="settings" size={18} />
          Settings
        </Link>
        <Link href="/sign-in?out=1" className={styles.out} data-anim-host>
          <Icon name="logout" size={18} />
          Sign out
        </Link>
      </div>
    </>
  );
}
