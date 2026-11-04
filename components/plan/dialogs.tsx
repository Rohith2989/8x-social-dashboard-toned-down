"use client";

import { useState } from "react";
import { MAYA, PLANS, type Plan, type Script } from "@/lib/plan";
import { Dialog } from "../ui/dialog";
import { Icon } from "../ui/icon";
import { Menu } from "../ui/menu";
import { Done, Sending } from "../creators/done";
import { Thumb } from "./open-plan";
import styles from "./dialogs.module.css";
import shared from "../creators/dialogs.module.css";

/*
  The Content plan's two dialogs.
  - Approving asks first (the product's review confirmation): which scripts, by their pictures and names, and what an
    approval leads to. Cancel is where focus starts; only Approve sends it.
  - Suggesting an idea (new): 8x writes the scripts, so the brand's lever is asking, as Ask for creators is on
    Creators. What creators should make, a video like it, which plan it is for; sent to Maya.
*/

export function ApproveDialog({ scripts, plan, onClose, onApprove }: { scripts: Script[] | null; plan: Plan; onClose: () => void; onApprove: (ids: string[]) => void }) {
  const list = scripts ?? [];
  const one = list.length === 1;
  const title = one ? `Approve Script ${list[0].n}?` : `Approve ${list.length} scripts?`;
  return (
    <Dialog open={!!scripts && list.length > 0} onClose={onClose} label={title} width={500}>
      <div className={shared.body}>
        <div className={shared.head}>
          <span className={shared.askMark} aria-hidden>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M12 20.5S3 15.4 3 9.1A4.7 4.7 0 0 1 12 6.9a4.7 4.7 0 0 1 9 2.2c0 6.3-9 11.4-9 11.4Z" fill="currentColor" />
            </svg>
          </span>
          <h2>{title}</h2>
          <p>
            {one
              ? `${MAYA} can send it to creators. You won't be able to flag it unless ${MAYA} changes it.`
              : `${MAYA} can send them to creators. You won't be able to flag them unless ${MAYA} changes them.`}
          </p>
        </div>
        <ul className={styles.scripts}>
          {list.map((s) => (
            <li key={s.id}>
              <Thumb script={s} plan={plan} className={styles.thumb} />
              <span>
                <span className={styles.number}>Script {s.n}</span>
                <strong>{s.format.name}</strong>
              </span>
            </li>
          ))}
        </ul>
        <div className={shared.foot}>
          <button type="button" className={shared.cancel} onClick={onClose} data-autofocus>
            Cancel
          </button>
          <button
            type="button"
            className={shared.send}
            onClick={() => {
              onApprove(list.map((s) => s.id));
              onClose();
            }}
            data-anim-host
          >
            <Icon name="heart" size={18} />
            {one ? "Approve" : `Approve ${list.length}`}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

type For = "any" | string;

export function IdeaDialog({ open, onClose, onSend }: { open: boolean; onClose: () => void; onSend: () => void }) {
  const [idea, setIdea] = useState("");
  const [link, setLink] = useState("");
  const [target, setTarget] = useState<For>("any");
  const [phase, setPhase] = useState<"edit" | "sending" | "sent">("edit");
  // each opening starts clean
  const [was, setWas] = useState(open);
  if (open !== was) {
    setWas(open);
    if (open) {
      setIdea("");
      setLink("");
      setTarget("any");
      setPhase("edit");
    }
  }

  const upcoming = PLANS.filter((p) => p.stage === "review");
  const linkOk = !link.trim() || /^https?:\/\/\S+\.\S+/.test(link.trim());

  const send = () => {
    setPhase("sending");
    window.setTimeout(() => {
      setPhase("sent");
      onSend();
      window.setTimeout(onClose, 1500);
    }, 900);
  };

  return (
    <Dialog open={open} onClose={onClose} label={`Suggest an idea to ${MAYA}`} width={540}>
      {phase === "sent" ? (
        <Done title={`Sent to ${MAYA}`} line={`${MAYA} will look at it for the next plan and answer you in your thread.`} onDone={onClose} />
      ) : (
        <div className={shared.body}>
          <div className={shared.head}>
            <span className={shared.askMark} aria-hidden>
              <Icon name="plus" size={24} />
            </span>
            <h2>Suggest an idea to {MAYA}</h2>
            <p>8x writes the scripts. Say what you&rsquo;d like creators to make, and {MAYA} turns it into one for a plan.</p>
          </div>

          <label className={shared.note}>
            <span className={shared.noteLabel}>What should creators make?</span>
            <textarea value={idea} maxLength={1000} onChange={(e) => setIdea(e.target.value)} placeholder="Students showing the week view the night before a deadline" rows={3} />
          </label>

          <label className={styles.linkField}>
            <span className={shared.noteLabel}>
              A video like it <span>optional</span>
            </span>
            <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://www.tiktok.com/@…" aria-invalid={!linkOk || undefined} />
            {!linkOk && <span className={styles.linkWhy}>That doesn&rsquo;t look like a link to a video</span>}
          </label>

          <div className={shared.field}>
            <span className={shared.fieldLabel}>For</span>
            <Menu
              label="For"
              value={target}
              onChange={setTarget}
              align="end"
              options={[{ id: "any", label: "Whichever plan fits" }, ...upcoming.map((p) => ({ id: p.key, label: p.name }))]}
            />
          </div>

          <div className={shared.foot}>
            <button type="button" className={shared.cancel} onClick={onClose}>
              Cancel
            </button>
            <span className={shared.sendWrap} title={idea.trim() ? undefined : "Say what the idea is first"}>
              <button type="button" className={shared.send} onClick={send} disabled={!idea.trim() || !linkOk || phase === "sending"} data-anim-host>
                {phase === "sending" ? (
                  <Sending />
                ) : (
                  <>
                    <Icon name="send" size={18} />
                    Send to {MAYA}
                  </>
                )}
              </button>
            </span>
          </div>
        </div>
      )}
    </Dialog>
  );
}
