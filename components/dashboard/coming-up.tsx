"use client";

import { useState } from "react";
import Link from "next/link";
import { CREATORS, PLATFORM_LABELS, SCHEDULE, UPDATES } from "@/lib/demo";
import { day } from "@/lib/format";
import { PLANS } from "@/lib/plan";
import { ACCOUNT_MANAGER } from "@/lib/team";
import { Avatar } from "../ui/bits";
import { Icon, type IconName } from "../ui/icon";
import { ActionMenu, type Action } from "../ui/actions";
import { useToast } from "../ui/toast";
import { PlatformIcon } from "../ui/platform-icon";
import styles from "./coming-up.module.css";

/*
  What goes out next (Halo Lab's calendar column): the content plan's next three days, each post at its time with a
  bar in one of the vertical's colours for where it stands (approved, still with the brand for review, scheduled), the
  creator and the platform above its title. At the foot, the person who runs it all.
*/

const STATUS = { approved: "Approved", review: "In review", scheduled: "Scheduled" };

// the latest from 8x and the creators (the overview's updates), each opening where it happened
const UPDATE_ICON: Record<string, IconName> = { approved: "tick", posted: "posts", plan: "plan", joined: "join" };
const UPDATE_HREF: Record<string, string> = { u1: "/posts", u2: "/posts?day=2026-11-03", u3: "/plan", u4: "/creators?open=pooja" };

// the plan a day falls in, so its menu can open it
const planOn = (date: string) => PLANS.find((p) => p.start <= date && date <= p.end) ?? null;

export function ComingUp({ className, inline }: { className?: string; inline?: boolean }) {
  const [read, setRead] = useState(false);
  const toast = useToast();
  const latest: Action[] = UPDATES.map((u) => ({
    id: u.id,
    label: `${u.who} ${u.what}`,
    meta: u.when,
    href: UPDATE_HREF[u.id],
    lead: (
      <span className={styles.noteIcon} data-kind={u.kind}>
        <Icon name={UPDATE_ICON[u.kind] ?? "bell"} size={15} stroke={2} />
      </span>
    ),
  }));
  const dayMenu = (d: (typeof SCHEDULE)[number]): Action[] => {
    const plan = planOn(d.date);
    return [
      ...(plan ? [{ id: "plan", label: "Open it on the content plan", icon: "plan" as IconName, href: `/plan?plan=${plan.key}` }] : []),
      {
        id: "copy",
        label: "Copy the day's schedule",
        icon: "copy",
        onSelect: () => {
          const text = [`${d.label}, ${day(d.date)}`, ...d.slots.map((s) => `${s.time}  ${CREATORS[s.creator]?.name}, ${PLATFORM_LABELS[s.platform]}: ${s.title} (${STATUS[s.status]})`)].join("\n");
          navigator.clipboard?.writeText(text).catch(() => {});
          toast({ text: `Copied ${d.label.toLowerCase()}'s ${d.slots.length} posts`, icon: "copy" });
        },
      },
    ];
  };
  return (
    <aside className={`${styles.panel} ${inline ? styles.inline : ""} ${className ?? ""}`} aria-label="Coming up">
      <div className={styles.head}>
        <h2>Coming up</h2>
        <ActionMenu
          label={read ? "Notifications" : `Notifications, ${UPDATES.length} new`}
          className={styles.bell}
          items={latest}
          title="The latest"
          width={320}
          onOpen={() => setRead(true)}
        >
          <Icon name="bell" />
          {!read && <i aria-hidden />}
        </ActionMenu>
      </div>

      <div className={styles.days}>
        {SCHEDULE.map((d, k) => (
          <section key={d.date} className={styles.day} style={{ "--k": k } as React.CSSProperties}>
            <div className={styles.date}>
              <span>
                {d.label}, {day(d.date)}
              </span>
              <ActionMenu label={`${d.label}, more`} className={styles.dayMore} items={dayMenu(d)} title={`${d.label}, ${day(d.date)}`}>
                <Icon name="more" size={18} />
              </ActionMenu>
            </div>
            <ol className={styles.slots}>
              {d.slots.map((s) => (
                <li key={s.time + s.creator} className={styles.slot}>
                  <time className={styles.time}>{s.time}</time>
                  <i className={styles.bar} data-status={s.status} aria-hidden />
                  <div className={styles.what}>
                    <span className={styles.who}>
                      <PlatformIcon platform={s.platform} size={16} className={styles.platform} />
                      {CREATORS[s.creator].name.split(" ")[0]}
                      <span className="sr-only">on {PLATFORM_LABELS[s.platform]}</span>
                      {s.status === "review" ? (
                        <span className={styles.state} data-status={s.status}>
                          {STATUS[s.status]}
                        </span>
                      ) : (
                        <span className="sr-only">, {STATUS[s.status]}</span>
                      )}
                    </span>
                    <strong>{s.title}</strong>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <Link href="/team" className={styles.manager} title="Your 8x team, on Team" data-anim-host>
        <Avatar initials={ACCOUNT_MANAGER.initial} size={44} />
        <div className={styles.managerText}>
          <strong>{ACCOUNT_MANAGER.label}</strong>
          <span>Your {ACCOUNT_MANAGER.role.toLowerCase()}</span>
        </div>
        <span className={styles.managerGo} aria-hidden>
          <Icon name="right" size={16} />
        </span>
      </Link>
    </aside>
  );
}
