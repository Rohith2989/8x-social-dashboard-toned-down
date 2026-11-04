"use client";

import { useState } from "react";
import { MANAGER } from "@/lib/demo";
import { FLAG_REASONS, type FlagReason } from "@/lib/roster";
import { Dialog } from "../ui/dialog";
import { Icon, type IconName } from "../ui/icon";
import { Done, Sending } from "./done";
import styles from "./dialogs.module.css";

/*
  Flagging for the account manager (was: the flag composer), for creators, posts or scripts. What is flagged, by their
  faces or posters (the page hands them in, with their name and the line on what a flag does: it removes nobody, it
  takes no post down, it holds a script back); the reasons as large rows, each with what it means, one or more
  picked (a page with its own list, the Content plan's for a script, hands it in); a note if they want one. Send
  waits for a reason and says so. Sending shows the dot loader, then the dialog becomes its own confirmation, the
  check drawing itself, and the flags land on the page.
*/

type Reason<R extends string> = { id: R; label: string; line: string };

const ICONS: Record<FlagReason, IconName> = { offBrief: "plan", wrongProduct: "package", quality: "eye", compliance: "shield", other: "more" };
const MAX = 1000;

export function FlagDialog<R extends string = FlagReason>({
  names,
  heads,
  line,
  placeholder = "Say what you saw, and in which videos",
  reasons: list = FLAG_REASONS as Reason<string>[] as Reason<R>[],
  icons = ICONS as Record<string, IconName> as Record<R, IconName>,
  done,
  open,
  onClose,
  onSend,
}: {
  names: string;
  heads: React.ReactNode;
  line: string;
  placeholder?: string;
  reasons?: Reason<R>[];
  icons?: Record<R, IconName>;
  // what the confirmation says once it is sent
  done?: string;
  open: boolean;
  onClose: () => void;
  onSend: (reasons: R[], note: string) => void;
}) {
  const [reasons, setReasons] = useState<R[]>([]);
  const [note, setNote] = useState("");
  const [phase, setPhase] = useState<"edit" | "sending" | "sent">("edit");
  // each opening starts clean
  const [was, setWas] = useState(open);
  if (open !== was) {
    setWas(open);
    if (open) {
      setReasons([]);
      setNote("");
      setPhase("edit");
    }
  }

  const first = MANAGER.name.split(" ")[0];

  const send = () => {
    setPhase("sending");
    window.setTimeout(() => {
      setPhase("sent");
      onSend(reasons, note.trim());
      window.setTimeout(onClose, 1500);
    }, 900);
  };

  return (
    <Dialog open={open} onClose={onClose} label={`Flag ${names} for ${first}`} width={560}>
      {phase === "sent" ? (
        <Done title={`Sent to ${first}`} line={done ?? `${first} will look into it and answer in your thread, usually within a few hours.`} onDone={onClose} />
      ) : (
        <div className={styles.body}>
          <div className={styles.head}>
            <span className={styles.faces} aria-hidden>
              {heads}
            </span>
            <h2>
              Flag {names} for {first}
            </h2>
            <p>
              {line} {first} looks into it and answers you in your thread.
            </p>
          </div>

          <fieldset className={styles.reasons}>
            <legend>What&rsquo;s wrong?</legend>
            {list.map((r) => {
              const on = reasons.includes(r.id);
              return (
                <button
                  key={r.id}
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  className={styles.reason}
                  onClick={() => setReasons((all) => (on ? all.filter((x) => x !== r.id) : [...all, r.id]))}
                  data-anim-host
                >
                  <span className={styles.reasonIcon}>
                    <Icon name={icons[r.id]} size={18} />
                  </span>
                  <span className={styles.reasonText}>
                    <strong>{r.label}</strong>
                    <span>{r.line}</span>
                  </span>
                  <span className={styles.tickBox} aria-hidden>
                    <svg viewBox="0 0 20 20">
                      <path d="m5.5 10.2 3 3 6-6.4" />
                    </svg>
                  </span>
                </button>
              );
            })}
          </fieldset>

          <label className={styles.note}>
            <span className={styles.noteLabel}>
              A note for {first} <span>optional</span>
            </span>
            <textarea value={note} maxLength={MAX} onChange={(e) => setNote(e.target.value)} placeholder={placeholder} rows={3} />
            <span className={styles.counter}>
              {note.length.toLocaleString("en-US")} / {MAX.toLocaleString("en-US")}
            </span>
          </label>

          <div className={styles.foot}>
            <button type="button" className={styles.cancel} onClick={onClose}>
              Cancel
            </button>
            <span className={styles.sendWrap} title={reasons.length ? undefined : "Pick a reason first"}>
              <button type="button" className={styles.send} disabled={!reasons.length || phase === "sending"} onClick={send} data-anim-host>
                {phase === "sending" ? (
                  <Sending />
                ) : (
                  <>
                    <Icon name="send" size={18} />
                    Send to {first}
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
