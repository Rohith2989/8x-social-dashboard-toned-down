"use client";

import Link from "next/link";
import { CAMPAIGNS } from "@/lib/demo";
import { day } from "@/lib/format";
import { since } from "@/lib/roster";
import { MEMBERS, ROLE_LABELS, accessLabel, sees, type Member } from "@/lib/team";
import { Card } from "../ui/card";
import { Icon, type IconName } from "../ui/icon";
import { usePlanState } from "../plan/store";
import { fullName, initialsOf, useAccount } from "../settings/account";
import { memberTrail, stepHref, stepText } from "./trail";
import styles from "./people.module.css";

/*
  People on this workspace (the product's member rows): each person a card of their own subtle colour. Their initials on
  a disc of the vertical's colours (the brand's own people: never a photo or a generated face), the member signed in
  ringed and marked "you"; their role in words; the campaigns they can see, lit among the brand's three in each
  campaign's colour; their latest on the content plan, which opens the script; and since when they have been here.
*/

const TINTS = ["sky", "lilac", "blue", "pearl"] as const;

const KIND_ICON: Partial<Record<string, IconName>> = { approved: "tick", flagged: "flag", comment: "comment" };

export function People() {
  const plan = usePlanState();
  const everyAll = MEMBERS.filter((m) => m.campaigns == null).length;
  return (
    <section className={styles.people} aria-labelledby="people-title">
      <header className={styles.head}>
        <h2 id="people-title">People on this workspace</h2>
        <p>
          {MEMBERS.length} {MEMBERS.length === 1 ? "person" : "people"}. {everyAll} {everyAll === 1 ? "sees" : "see"} every campaign; {MEMBERS.length - everyAll} the ones 8x
          opened to them
        </p>
      </header>

      {MEMBERS.length === 0 ? (
        <p className={styles.empty}>Nobody has signed in to this workspace yet.</p>
      ) : (
        <ul className={styles.grid}>
          {MEMBERS.map((m, i) => (
            <li key={m.id} data-row={m.id}>
              <Person member={m} tint={TINTS[i % TINTS.length]} order={i + 1} trail={m.plan ? memberTrail(m.plan, plan) : null} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Person({ member, tint, order, trail }: { member: Member; tint: (typeof TINTS)[number]; order: number; trail: ReturnType<typeof memberTrail> | null }) {
  const latest = trail?.latest ?? null;
  // the member signed in by the name they saved in Settings
  const account = useAccount();
  const m = member.you ? { ...member, name: fullName(account) || member.name, initials: initialsOf(account) || member.initials } : member;
  return (
    <Card order={order} tint={tint} className={styles.card} label={m.name}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <span className={styles.disc} data-tone={tint} data-you={m.you || undefined} aria-hidden>
            {m.initials}
          </span>
          <span className={styles.role} data-role={m.role}>
            {m.role === "owner" && <Icon name="shield" size={16} stroke={2} />}
            {ROLE_LABELS[m.role]}
          </span>
        </div>

        <h3 className={styles.name}>
          {m.name}
          {m.you && (
            <span className={styles.you}>
              <i aria-hidden />
              you
            </span>
          )}
        </h3>
        <p className={styles.email} title={m.email}>
          {m.email}
        </p>

        <dl className={styles.facts}>
          <div title={m.campaigns == null ? "Every campaign the brand runs, now and to come" : "The campaigns 8x opened to them"}>
            <dt>Sees</dt>
            <dd className={styles.access}>
              <span className={styles.marks} aria-hidden>
                {CAMPAIGNS.map((c) => (
                  <i key={c.id} data-tone={c.tone} data-on={sees(m, c.id) || undefined} title={`${c.name}${sees(m, c.id) ? "" : ": not on their list"}`} />
                ))}
              </span>
              <span>{accessLabel(m.campaigns)}</span>
            </dd>
          </div>
          <div>
            <dt>Plan</dt>
            <dd className={styles.trail}>
              {latest ? (
                <>
                  <Link href={stepHref(latest)} className={styles.step} data-anim-host>
                    <Icon name={KIND_ICON[latest.kind] ?? "plan"} size={15} stroke={2} />
                    <span>{stepText(latest, "brand")}</span>
                  </Link>
                  <span className={styles.when}>
                    {since(latest.at)}
                    {trail && trail.approved > 0 && (
                      <>
                        {" "}
                        · {trail.approved} {trail.approved === 1 ? "script" : "scripts"} approved
                      </>
                    )}
                  </span>
                </>
              ) : (
                <span className={styles.quiet}>Nothing on the content plan yet</span>
              )}
            </dd>
          </div>
        </dl>

        <p className={styles.since}>On the workspace since {day(m.since)}</p>
      </div>
    </Card>
  );
}
