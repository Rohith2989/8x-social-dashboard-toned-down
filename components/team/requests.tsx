"use client";

import { useState } from "react";
import { day } from "@/lib/format";
import { ACCOUNT_MANAGER, askedBy, canWithdraw, inviteLine, memberById, type Invite } from "@/lib/team";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Dialog } from "../ui/dialog";
import { Icon } from "../ui/icon";
import { useToast } from "../ui/toast";
import { Sending } from "../creators/done";
import shared from "../creators/dialogs.module.css";
import { request, withdraw } from "./store";
import { showEightX } from "./eightx-link";
import styles from "./requests.module.css";

/*
  Access requests (the product's request rows): every request the brand has sent and what 8x decided, newest first; an
  approved one stays until its first sign-in. Each says its state in the product's own words, and draws its way as a
  short track (asked, 8x, signed in) with the stop it is at lit: waiting, the 8x stop beats; approved, it waits at
  signed in; not approved, it stops at 8x. Who at 8x decided is never shown. A request still with 8x can be withdrawn by
  an owner or whoever asked (the product's dialog); one 8x did not approve can be asked again, which reopens it.
*/

const TINT = { pendingApproval: "sky", approved: "blue", declined: "pearl" } as const;

export function Requests({ invites, onSent }: { invites: Invite[]; onSent: (r: Invite) => void }) {
  const toast = useToast();
  const [target, setTarget] = useState<Invite | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  if (invites.length === 0) return null;

  const counts = {
    waiting: invites.filter((i) => i.status === "pendingApproval").length,
    approved: invites.filter((i) => i.status === "approved").length,
    declined: invites.filter((i) => i.status === "declined").length,
  };
  const line = [
    counts.waiting && `${counts.waiting} with 8x`,
    counts.approved && `${counts.approved} approved, not signed in yet`,
    counts.declined && `${counts.declined} not approved`,
  ].filter(Boolean);

  const confirm = () => {
    if (!target || busy) return;
    setBusy(target.id);
    window.setTimeout(() => {
      withdraw(target.id);
      setBusy(null);
      setOpen(false);
      toast({ text: `Withdrew the request for ${target.email}`, icon: "trash" });
    }, 700);
  };

  const again = (i: Invite) => {
    if (busy) return;
    setBusy(i.id);
    window.setTimeout(() => {
      const fresh = request(i.email);
      setBusy(null);
      onSent(fresh);
    }, 800);
  };

  return (
    <section className={styles.requests} aria-labelledby="requests-title">
      <header className={styles.head}>
        <h2 id="requests-title">Access requests</h2>
        <p>{line.join(" · ")}</p>
      </header>

      <ul className={styles.list}>
        {invites.map((i, k) => (
          <li key={i.id} data-row={i.id}>
            <Card order={k + 5} tint={TINT[i.status]} className={styles.card} label={i.email}>
              <div className={styles.row} data-status={i.status}>
                <span className={styles.envelope} aria-hidden>
                  <Icon name="mail" size={20} />
                </span>

                <div className={styles.text}>
                  <strong className={styles.email} title={i.email}>
                    {i.email}
                  </strong>
                  <p className={styles.state}>
                    {inviteLine(i)}
                    {i.status === "declined" && (
                      <>
                        {" "}
                        Ask{" "}
                        <button type="button" className={styles.manager} onClick={showEightX} data-anim-host>
                          {ACCOUNT_MANAGER.first}
                        </button>
                        , your 8x account manager, if this is wrong.
                      </>
                    )}
                  </p>
                  <p className={styles.by}>
                    {askedBy(i)}
                    {i.status !== "pendingApproval" && ` on ${day(i.at.slice(0, 10))}`}
                  </p>
                </div>

                <Track invite={i} />

                <div className={styles.act}>
                  {i.status === "pendingApproval" &&
                    (canWithdraw(i) ? (
                      <Button
                        variant="ghost"
                        size={36}
                        className={styles.trash}
                        icon={<Icon name="trash" size={18} />}
                        label={`Withdraw the request for ${i.email}`}
                        onClick={() => {
                          setTarget(i);
                          setOpen(true);
                        }}
                      />
                    ) : (
                      <span className={styles.locked} title={`Only ${memberById(i.by)?.name.split(" ")[0] ?? "whoever asked"} or an owner can withdraw it`}>
                        <Icon name="shield" size={16} />
                      </span>
                    ))}
                  {i.status === "declined" && (
                    <Button variant="stone" size={36} icon={busy === i.id ? undefined : <Icon name="send" size={16} />} onClick={() => again(i)} disabled={busy === i.id}>
                      {busy === i.id ? <Sending /> : "Ask again"}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <Dialog open={open} onClose={() => !busy && setOpen(false)} label={`Withdraw the request for ${target?.email ?? ""}`} width={480}>
        <div className={shared.body}>
          <div className={shared.head}>
            <span className={styles.dialogMark} aria-hidden>
              <Icon name="trash" size={22} />
            </span>
            <h2>Withdraw this request?</h2>
            <p>
              8x will no longer review this request for <strong className={styles.strong}>{target?.email}</strong>. You can request access for them again at
              any time.
            </p>
          </div>
          <div className={shared.foot}>
            <button type="button" className={shared.cancel} onClick={() => setOpen(false)} disabled={!!busy} data-autofocus>
              Keep it
            </button>
            <button type="button" className={shared.send} onClick={confirm} disabled={!!busy} data-anim-host>
              {busy ? <Sending /> : "Withdraw request"}
            </button>
          </div>
        </div>
      </Dialog>
    </section>
  );
}

// the request's way: asked, 8x, signed in; the stop it is at lit
function Track({ invite: i }: { invite: Invite }) {
  const label =
    i.status === "pendingApproval"
      ? "Asked, now with 8x, not signed in yet"
      : i.status === "approved"
        ? "Asked, approved by 8x, not signed in yet"
        : "Asked, not approved by 8x";
  return (
    <ol className={styles.track} data-status={i.status} aria-label={label}>
      <li data-done>
        <i aria-hidden />
        <span>Asked</span>
      </li>
      <li data-ours data-done={i.status === "approved" || undefined} data-now={i.status === "pendingApproval" || undefined} data-stopped={i.status === "declined" || undefined}>
        <i aria-hidden>
          <img src={i.status === "approved" ? "/brand/8x-paper.svg" : "/brand/8x-ink.svg"} alt="" width={18} height={12} />
          {i.status === "declined" && (
            <b>
              <Icon name="close" size={10} stroke={3} />
            </b>
          )}
        </i>
        <span>{i.status === "pendingApproval" ? "With 8x" : i.status === "approved" ? "Approved" : "Not approved"}</span>
      </li>
      <li data-now={i.status === "approved" || undefined} data-off={i.status === "declined" || undefined}>
        <i aria-hidden />
        <span>{i.status === "approved" ? "Not signed in" : "Signs in"}</span>
      </li>
    </ol>
  );
}
