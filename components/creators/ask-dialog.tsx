"use client";

import { useState } from "react";
import { CAMPAIGN, MANAGER, PLATFORM_LABELS, type Platform } from "@/lib/demo";
import { COUNTRIES, type Country } from "@/lib/roster";
import { Dialog } from "../ui/dialog";
import { Icon } from "../ui/icon";
import { Menu } from "../ui/menu";
import { PlatformIcon } from "../ui/platform-icon";
import { CountryFlag } from "../ui/country-flag";
import { Done, Sending } from "./done";
import styles from "./dialogs.module.css";

/*
  Asking for more creators (new): 8x does the casting, so the brand's lever is asking. How many, on which platforms,
  in which market, and anything they should have; sent to the account manager, who answers in the thread.
*/

export function AskDialog({ open, onClose, onSend }: { open: boolean; onClose: () => void; onSend: (n: number) => void }) {
  const [n, setN] = useState(6);
  const [platforms, setPlatforms] = useState<Platform[]>([...CAMPAIGN.platforms]);
  const [market, setMarket] = useState<Country["code"] | "any">("any");
  const [note, setNote] = useState("");
  const [phase, setPhase] = useState<"edit" | "sending" | "sent">("edit");
  const [was, setWas] = useState(open);
  if (open !== was) {
    setWas(open);
    if (open) {
      setN(6);
      setPlatforms([...CAMPAIGN.platforms]);
      setMarket("any");
      setNote("");
      setPhase("edit");
    }
  }
  const first = MANAGER.name.split(" ")[0];

  const send = () => {
    setPhase("sending");
    window.setTimeout(() => {
      setPhase("sent");
      onSend(n);
      window.setTimeout(onClose, 1500);
    }, 900);
  };

  return (
    <Dialog open={open} onClose={onClose} label={`Ask ${first} for more creators`} width={540}>
      {phase === "sent" ? (
        <Done title={`Asked ${first} for ${n} more`} line={`${first} will cast them and tell you in your thread when they join.`} onDone={onClose} />
      ) : (
        <div className={styles.body}>
          <div className={styles.head}>
            <span className={styles.askMark} aria-hidden>
              <Icon name="join" size={24} />
            </span>
            <h2>Ask {first} for more creators</h2>
            <p>8x finds, vets and briefs them. Say what you need and {first} takes it from there.</p>
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>How many</span>
            <span className={styles.stepper}>
              <button type="button" onClick={() => setN((v) => Math.max(1, v - 1))} aria-label="Fewer" disabled={n <= 1}>
                <Icon name="minus" size={18} stroke={2} />
              </button>
              <output className="num" aria-live="polite">
                {n}
              </output>
              <button type="button" onClick={() => setN((v) => Math.min(30, v + 1))} aria-label="More" disabled={n >= 30}>
                <Icon name="plus" size={18} stroke={2} />
              </button>
            </span>
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>Platforms</span>
            <span className={styles.toggles}>
              {CAMPAIGN.platforms.map((p) => {
                const on = platforms.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={on}
                    className={styles.toggle}
                    onClick={() => setPlatforms((all) => (on ? (all.length > 1 ? all.filter((x) => x !== p) : all) : [...all, p]))}
                    title={on && platforms.length === 1 ? "At least one platform" : undefined}
                  >
                    <PlatformIcon platform={p} size={22} />
                    {PLATFORM_LABELS[p]}
                  </button>
                );
              })}
            </span>
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>Market</span>
            <Menu
              label="Market"
              value={market}
              onChange={setMarket}
              align="end"
              lead={market === "any" ? <Icon name="globe" size={18} /> : undefined}
              options={[{ id: "any" as const, label: "Any market" }, ...Object.values(COUNTRIES).map((k) => ({ id: k.code, label: k.name, lead: <CountryFlag country={k} size={20} /> }))]}
            />
          </div>

          <label className={styles.note}>
            <span className={styles.noteLabel}>
              Anything they should have <span>optional</span>
            </span>
            <textarea value={note} maxLength={1000} onChange={(e) => setNote(e.target.value)} placeholder="Students who study late, at ease on camera" rows={3} />
          </label>

          <div className={styles.foot}>
            <button type="button" className={styles.cancel} onClick={onClose}>
              Cancel
            </button>
            <button type="button" className={styles.send} onClick={send} disabled={phase === "sending"} data-anim-host>
              {phase === "sending" ? (
                <Sending />
              ) : (
                <>
                  <Icon name="send" size={18} />
                  Send to {first}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
