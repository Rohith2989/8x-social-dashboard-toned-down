"use client";

import { useRef, useState } from "react";
import { refusal, type Invite as Request } from "@/lib/team";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Icon } from "../ui/icon";
import { Sending } from "../creators/done";
import { request } from "./store";
import { flash } from "./flash";
import styles from "./invite.module.css";

/*
  Add your team-mates (the product's invite row, team-controls.tsx): a work email and Request access, on the deep blue,
  the page's one action. Beside it, the way every request goes, with 8x in the middle of it: you ask, 8x reviews (and
  chooses what they see), they sign in from the email 8x sends; the 8x stop counts the requests with 8x now.
  The product's refusals come back word for word under the field, and point at the row they mean. Sent, the page says
  what happens next (the product's dialog), and the new request lands at the top of Access requests.
*/

export function Invite({ invites, waiting, onSent }: { invites: Request[]; waiting: number; onSent: (r: Request) => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<{ text: string; row?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const field = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (busy) return;
    if (!email.trim()) {
      field.current?.focus();
      return;
    }
    const r = refusal(email, invites);
    setError(r);
    if (r) {
      field.current?.focus();
      return;
    }
    setBusy(true);
    // the request goes to 8x (and its Slack): a beat, then the product's answer
    window.setTimeout(() => {
      const fresh = request(email);
      setBusy(false);
      setEmail("");
      onSent(fresh);
    }, 900);
  };

  return (
    <Card tone="aura" order={0} className={styles.invite} label="Add your team-mates">
      <div className={styles.inner}>
        <div className={styles.ask}>
          <h2>Add your team-mates</h2>
          <p className={styles.lede}>8x reviews every request. Once it&rsquo;s approved, we email them how to sign in.</p>

          <form
            className={styles.form}
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <label className={styles.field} data-invalid={!!error || undefined}>
              <Icon name="mail" size={20} />
              <span className="sr-only">Work email</span>
              <input
                ref={field}
                type="email"
                name="email"
                autoComplete="off"
                spellCheck={false}
                placeholder="Work email"
                value={email}
                disabled={busy}
                aria-invalid={!!error}
                aria-describedby="invite-note"
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
              />
            </label>
            <Button type="submit" variant="paper" className={styles.submit} disabled={busy} icon={busy ? undefined : <Icon name="plus" size={18} />}>
              {busy ? <Sending /> : "Request access"}
            </Button>
          </form>

          <p id="invite-note" className={styles.note} data-error={!!error || undefined} role={error ? "alert" : undefined}>
            {error ? (
              <>
                <Icon name="flag" size={15} />
                {error.text}
                {error.row && (
                  <button type="button" onClick={() => flash(error.row as string)} data-anim-host>
                    Show it
                  </button>
                )}
              </>
            ) : (
              <>They join as a member. 8x chooses which of your campaigns they see.</>
            )}
          </p>
        </div>

        <ol className={styles.way} aria-label="How a request goes">
          <li>
            <span className={styles.stop}>
              <Icon name="send" size={20} />
            </span>
            <strong>You ask</strong>
            <span>for a work email</span>
          </li>
          <li data-ours>
            <span className={styles.stop}>
              <img src="/brand/8x-ink.svg" alt="" width={27} height={18} />
            </span>
            <strong>8x reviews</strong>
            <span className={styles.live}>
              {waiting ? (
                <>
                  <i aria-hidden />
                  {waiting} with 8x now
                </>
              ) : (
                "and chooses their campaigns"
              )}
            </span>
          </li>
          <li>
            <span className={styles.stop}>
              <Icon name="check" size={20} />
            </span>
            <strong>They sign in</strong>
            <span>from the email 8x sends</span>
          </li>
        </ol>
      </div>
    </Card>
  );
}
