"use client";

import { useState } from "react";
import { BRAND } from "@/lib/demo";
import { MEMBERS, type Invite as Request } from "@/lib/team";
import { Dialog } from "../ui/dialog";
import { Done } from "../creators/done";
import { Aside, PageFooter, PageHeader, Tray } from "../shell/shell";
import { useInvites, withEightX } from "./store";
import { Invite } from "./invite";
import { People } from "./people";
import { Requests } from "./requests";
import { EightX } from "./eightx";
import { flash } from "./flash";
import styles from "./team.module.css";

/*
  Team (docs/team.md, part by part): who on the brand's side can see its campaigns, how to bring someone in, where each
  request stands with 8x, and who at 8x works for the brand. The workspace's page, not a campaign's (the product keeps
  it outside the campaign shell). Every card has a subtle colour of its own; the invite is on the deep blue.
*/

export function Team() {
  const invites = useInvites();
  const waiting = withEightX(invites);
  // a request just sent (asked for, or asked again): the product's dialog says what happens next, then its row lights
  const [sent, setSent] = useState<Request | null>(null);
  const [open, setOpen] = useState(false);
  const onSent = (r: Request) => {
    setSent(r);
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    if (sent) window.setTimeout(() => flash(sent.id), 260);
  };
  return (
    <>
      <Tray label="Team">
        <PageHeader
          title="Team"
          line={
            <>
              {MEMBERS.length} people on {BRAND.name}&rsquo;s workspace
              {waiting > 0 && (
                <>
                  , and{" "}
                  <strong>
                    {waiting} {waiting === 1 ? "request" : "requests"} with 8x
                  </strong>
                </>
              )}
              .
            </>
          }
        />

        <div className={styles.stack}>
          <Invite invites={invites} waiting={waiting} onSent={onSent} />
          <People />
          <Requests invites={invites} onSent={onSent} />
          <EightX inline className={styles.inline} />
        </div>

        <PageFooter />
      </Tray>

      <Aside label="Your 8x team">
        <EightX />
      </Aside>

      <Dialog open={open} onClose={close} label="Request sent to 8x" width={460}>
        <Done
          title="Request sent to 8x"
          line={`8x will review access for ${sent?.email ?? ""}. If it's approved, we'll email them how to sign in. You can withdraw the request until then.`}
          onDone={close}
        />
      </Dialog>
    </>
  );
}
