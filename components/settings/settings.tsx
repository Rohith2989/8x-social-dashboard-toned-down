"use client";

import { useState } from "react";
import Link from "next/link";
import { BRAND, CAMPAIGN, CAMPAIGNS } from "@/lib/demo";
import { day } from "@/lib/format";
import { defaultPlan } from "@/lib/plan";
import { ACCOUNT_MANAGER, MEMBERS, ROLE_LABELS, YOU, accessLabel, sees } from "@/lib/team";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Icon, type IconName } from "../ui/icon";
import { useToast } from "../ui/toast";
import { Aside, PageFooter, PageHeader, Tray } from "../shell/shell";
import { CONNECTED_SOURCES, ConnectDialog, WAITING } from "../analytics/connect";
import { useConnected } from "../analytics/connections";
import { useInvites, withEightX } from "../team/store";
import { memberTrail } from "../team/trail";
import { usePlanState } from "../plan/store";
import { ACCOUNT_EMAIL, fullName, initialsOf, saveAccount, useAccount, type Account } from "./account";
import styles from "./settings.module.css";

/*
  Settings (docs/settings.md): the product has no brand settings page, so this gathers what a member can see and change
  about themselves and their workspace from the product's own data: the workspace as 8x holds it (read-only), their own
  fields, the six data connections (the same dialog as Analytics), and this browser's sign-in, with sign out. Every
  card has a subtle colour of its own.
*/

const STATE = { live: "Live", paused: "Paused", ended: "Ended" } as const;
const ORDER = { live: 0, paused: 1, ended: 2 } as const;

// where a connected source's figures are read on Analytics
const OPEN_IN: Record<string, string> = { ga4: "/analytics", tiktokAds: "/analytics?view=tiktok", metaAds: "/analytics?view=meta" };

export function Settings() {
  const [connect, setConnect] = useState<{ focus?: string; n: number } | null>(null);
  return (
    <>
      <Tray label="Settings">
        <PageHeader title="Settings" line={<>Your account, and {BRAND.name}&rsquo;s workspace on 8x.</>} />

        <div className={styles.stack}>
          <Workspace />
          <div className={styles.pair}>
            <YourAccount />
            <Connections onConnect={(focus) => setConnect((c) => ({ focus, n: (c?.n ?? 0) + 1 }))} />
          </div>
          <div className={styles.inline}>
            <ThisBrowser order={8} />
            <NeedAChange order={9} />
          </div>
        </div>

        <PageFooter />
      </Tray>

      <Aside label="This browser">
        <div className={styles.aside}>
          <ThisBrowser order={1} />
          <NeedAChange order={2} />
        </div>
      </Aside>

      <ConnectDialog key={connect?.n ?? 0} open={!!connect} focus={connect?.focus} onClose={() => setConnect(null)} />
    </>
  );
}

/* --- the workspace, as 8x holds it --- */

function Workspace() {
  const invites = useInvites();
  const waiting = withEightX(invites);
  const campaigns = [...CAMPAIGNS].sort((a, b) => ORDER[a.status] - ORDER[b.status]);
  return (
    <Card order={0} tint="lilac" className={styles.workspace} label={`${BRAND.name}'s workspace`}>
      <div className={styles.workspaceInner}>
        <div className={styles.brand}>
          <img src={CAMPAIGN.product.logo} alt="" width={512} height={512} className={styles.logo} />
          <div>
            <h2>{BRAND.name}</h2>
            <p>Brand workspace on 8x Social, fully managed</p>
          </div>
        </div>

        <dl className={styles.facts}>
          <Fact icon="shield" label="Your role" value={ROLE_LABELS[YOU.role]} line={YOU.role === "owner" ? "You can withdraw any access request" : "You can withdraw the requests you sent"} />
          <Fact icon="team" label="People" value={`${MEMBERS.length} on the workspace`} line={waiting ? `${waiting} ${waiting === 1 ? "request" : "requests"} with 8x` : "No requests with 8x"} href="/team" go="Open Team" />
          <Fact icon="dollar" label="Currency" value="US dollars (USD)" line="What Analytics' revenue and spend are in" />
          <Fact icon="calendar" label="On 8x since" value={`${day("2026-06-02")} 2026`} line={`When ${BRAND.name}'s workspace opened`} />
          <div className={`${styles.fact} ${styles.campaignsFact}`}>
            <dt>
              <span className={styles.factIcon}>
                <Icon name="overview" size={17} />
              </span>
              Campaigns
            </dt>
            <dd>
              <ul className={styles.campaigns}>
                {campaigns.map((c) => (
                  <li key={c.id} data-status={c.status}>
                    <i data-tone={c.tone} aria-hidden />
                    <strong>{c.name}</strong>
                    <span>
                      {STATE[c.status]}
                      {c.id === CAMPAIGN.id && c.status === "live" && `, day ${CAMPAIGN.day} of ${CAMPAIGN.days}`}
                    </span>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>

        <p className={styles.setBy}>
          <img src="/brand/8x-ink.svg" alt="" width={21} height={14} />
          Set by 8x. To change the workspace&rsquo;s name or currency, ask {ACCOUNT_MANAGER.first}.
        </p>
      </div>
    </Card>
  );
}

function Fact({ icon, label, value, line, href, go }: { icon: IconName; label: string; value: string; line: string; href?: string; go?: string }) {
  return (
    <div className={styles.fact}>
      <dt>
        <span className={styles.factIcon}>
          <Icon name={icon} size={17} />
        </span>
        {label}
      </dt>
      <dd>
        <strong>{value}</strong>
        <span>{line}</span>
        {href && (
          <Link href={href} className={styles.go} data-anim-host>
            {go}
            <Icon name="right" size={15} />
          </Link>
        )}
      </dd>
    </div>
  );
}

/* --- your own fields --- */

function YourAccount() {
  const saved = useAccount();
  const toast = useToast();
  const trail = memberTrail("you", usePlanState());
  const [draft, setDraft] = useState<Account | null>(null);
  const a = draft ?? saved;
  const dirty = !!draft && (draft.first.trim() !== saved.first || draft.last.trim() !== saved.last || draft.phone.trim() !== saved.phone);
  const firstMissing = !a.first.trim();
  const phoneBad = !!a.phone.trim() && !/^\+?[\d\s()-]{6,20}$/.test(a.phone.trim());
  const set = (k: keyof Account) => (e: React.ChangeEvent<HTMLInputElement>) => setDraft({ ...a, [k]: e.target.value });

  const save = () => {
    if (!dirty || firstMissing || phoneBad) return;
    saveAccount(a);
    setDraft(null);
    toast({ text: "Saved your details", icon: "check" });
  };

  return (
    <Card order={1} tint="sky" className={styles.account} label="Your account">
      <form
        className={styles.accountInner}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <div className={styles.who}>
          <span className={styles.disc} aria-hidden>
            {initialsOf(saved)}
          </span>
          <div>
            <h2>{fullName(saved)}</h2>
            <p>
              {ROLE_LABELS[YOU.role]} of {BRAND.name}&rsquo;s workspace
            </p>
          </div>
        </div>

        <div className={styles.fields}>
          <label className={styles.field} data-invalid={firstMissing || undefined}>
            <span>First name</span>
            <input value={a.first} onChange={set("first")} autoComplete="given-name" aria-invalid={firstMissing} aria-describedby={firstMissing ? "first-note" : undefined} />
            {firstMissing && (
              <em id="first-note" role="alert">
                Your first name can&rsquo;t be empty
              </em>
            )}
          </label>
          <label className={styles.field}>
            <span>Last name</span>
            <input value={a.last} onChange={set("last")} autoComplete="family-name" />
          </label>
          <label className={styles.field} data-locked>
            <span>Work email</span>
            <span className={styles.locked}>
              <input value={ACCOUNT_EMAIL} readOnly aria-describedby="email-note" />
              <Icon name="shield" size={16} />
            </span>
            <em id="email-note">You sign in with a 6-digit code sent here. No passwords.</em>
          </label>
          <label className={styles.field} data-invalid={phoneBad || undefined}>
            <span>
              Phone <i>optional</i>
            </span>
            <input value={a.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" aria-invalid={phoneBad} aria-describedby={phoneBad ? "phone-note" : undefined} />
            {phoneBad && (
              <em id="phone-note" role="alert">
                Use digits, spaces, brackets and a leading +
              </em>
            )}
          </label>
        </div>

        <div className={styles.formFoot}>
          {dirty && (
            <button type="button" className={styles.cancel} onClick={() => setDraft(null)} data-anim-host>
              Cancel
            </button>
          )}
          <span title={dirty ? undefined : "Change something first"}>
            <Button type="submit" variant="ink" icon={<Icon name="check" size={18} />} disabled={!dirty || firstMissing || phoneBad}>
              Save changes
            </Button>
          </span>
        </div>

        <dl className={styles.access}>
          <div>
            <dt>Sees</dt>
            <dd>
              <span className={styles.marks} aria-hidden>
                {CAMPAIGNS.map((c) => (
                  <i key={c.id} data-tone={c.tone} data-on={sees(YOU, c.id) || undefined} />
                ))}
              </span>
              {accessLabel(YOU.campaigns)}
            </dd>
          </div>
          <div>
            <dt>Since</dt>
            <dd>{day(YOU.since)} 2026, on the workspace</dd>
          </div>
          <div>
            <dt>Plan</dt>
            <dd>
              <Link href="/plan" className={styles.go} data-anim-host>
                {trail.approved} {trail.approved === 1 ? "script" : "scripts"} approved
                <Icon name="right" size={15} />
              </Link>
            </dd>
          </div>
        </dl>
      </form>
    </Card>
  );
}

/* --- the six sources --- */

function Connections({ onConnect }: { onConnect: (focus?: string) => void }) {
  const done = useConnected();
  const on = CONNECTED_SOURCES.length + WAITING.filter((s) => done[s.id]).length;
  const total = CONNECTED_SOURCES.length + WAITING.length;
  return (
    <Card order={2} tint="pearl" className={styles.connections} label="Connected data">
      <div className={styles.connectionsInner}>
        <div className={styles.cardHead}>
          <h2>Connected data</h2>
          <p>
            {on} of {total} connected. Read-only, every one: 8x can see reports, never change them.
          </p>
        </div>
        <ul className={styles.sources}>
          {CONNECTED_SOURCES.map((s) => (
            <li key={s.id}>
              <span className={styles.mark}>{s.mark}</span>
              <span className={styles.sourceText}>
                <strong>{s.name}</strong>
                <span className={styles.state} data-state="on">
                  <i aria-hidden />
                  Connected · {s.line}
                </span>
              </span>
              <Link href={OPEN_IN[s.id]} className={styles.sourceGo} aria-label={`Open ${s.name} on Analytics`} title={`Open ${s.name} on Analytics`} data-anim-host>
                <Icon name="right" size={16} />
              </Link>
            </li>
          ))}
          {WAITING.map((s) => (
            <li key={s.id}>
              <span className={styles.mark}>{s.mark}</span>
              <span className={styles.sourceText}>
                <strong>{s.name}</strong>
                {done[s.id] ? (
                  <span className={styles.state} data-state="reading">
                    <i aria-hidden />
                    Reading for the first time
                  </span>
                ) : (
                  <span className={styles.state}>
                    <i aria-hidden />
                    Not connected · {s.answers.charAt(0).toLowerCase() + s.answers.slice(1)}
                  </span>
                )}
              </span>
              {!done[s.id] && (
                <Button variant="stone" size={36} onClick={() => onConnect(s.id)} className={styles.connect}>
                  Connect
                </Button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

/* --- this browser, and the way to 8x --- */

function ThisBrowser({ order }: { order: number }) {
  return (
    <Card order={order} tone="ink" className={styles.browser} label="This browser">
      <div className={styles.browserInner}>
        <p className={styles.kicker}>
          <Icon name="globe" size={16} />
          This browser
        </p>
        <h2>Signed in</h2>
        <p className={styles.as}>
          as <strong>{ACCOUNT_EMAIL}</strong>, with a 6-digit code sent there. No passwords to change.
        </p>
        <Link href="/sign-in?out=1" className={styles.signOut} data-anim-host>
          <Icon name="logout" size={18} />
          Sign out
        </Link>
      </div>
    </Card>
  );
}

function NeedAChange({ order }: { order: number }) {
  const thread = defaultPlan();
  const { first } = ACCOUNT_MANAGER;
  return (
    <Card order={order} tint="sky" className={styles.change} label={`Need a change? ${ACCOUNT_MANAGER.label}`}>
      <div className={styles.changeInner}>
        <div className={styles.manager}>
          <span className={styles.managerDisc} aria-hidden>
            {ACCOUNT_MANAGER.initial}
          </span>
          <span>
            <strong>{ACCOUNT_MANAGER.label}</strong>
            <span>Your account manager</span>
          </span>
        </div>
        <h2>Need a change?</h2>
        <p>The workspace&rsquo;s name, currency and campaigns, and who sees which, are 8x&rsquo;s to change. {first} does it for you.</p>
        {thread && (
          <Link href={`/plan?plan=${thread.key}`} className={styles.write} data-anim-host>
            <Icon name="comment" size={17} />
            Write to {first}
          </Link>
        )}
      </div>
    </Card>
  );
}
