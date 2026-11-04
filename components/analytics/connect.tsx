"use client";

import { useState } from "react";
import { day } from "@/lib/format";
import { PROPERTY } from "@/lib/analytics";
import { ADS } from "@/lib/ads";
import { Dialog } from "../ui/dialog";
import { Icon } from "../ui/icon";
import { PlatformIcon } from "../ui/platform-icon";
import { Sending } from "../creators/done";
import { markConnected, useConnected } from "./connections";
import styles from "./connect.module.css";
import shared from "../creators/dialogs.module.css";

/*
  Connect your data (was: the connect panel): every source this page can read, what each answers, and where it
  stands, over whichever view is open. A dialog rather than a page: connecting is done once, and sending the brand to
  another screen would take them off the figures that made them want to. Google Analytics, TikTok Ads and Meta Ads
  are connected, read-only; Triple Whale, AppStack and RevenueCat wait, each saying what it would read (the product's
  words). Connecting one takes its key and starts its first read, which the row then says.
*/

type Source = { id: string; name: string; mark: React.ReactNode; answers: string; reads?: string[]; key?: string };

// connected: read-only, each with what it reads from and when it last did (Settings lists them too)
export const CONNECTED_SOURCES: (Source & { line: string })[] = [
  {
    id: "ga4",
    name: "Google Analytics",
    mark: <Icon name="globe" size={20} />,
    answers: "What the campaign did on your website: sessions, sales and revenue, a day at a time",
    line: `${PROPERTY.name} · ${PROPERTY.account} · data through ${day("2026-11-03")}`,
  },
  { id: "tiktokAds", name: "TikTok Ads", mark: <PlatformIcon platform="tiktok" size={20} />, answers: "What your Spark Ads did on your creators' posts", line: `${ADS.tiktok.account} · last read at 15:40` },
  { id: "metaAds", name: "Meta Ads", mark: <PlatformIcon platform="instagram" size={20} />, answers: "What your partnership ads did on your creators' reels", line: `${ADS.meta.account} · last read at 15:40` },
];

export const WAITING: Source[] = [
  {
    id: "tripleWhale",
    name: "Triple Whale",
    mark: <Icon name="analytics" size={20} />,
    answers: "What Triple Whale credits your creators' posts with, under the model you choose",
    reads: [
      "Uses an API key you create in Triple Whale; 8x never sees your login.",
      "Reads the orders Triple Whale attributes to your creators' posts: order values only, never who bought.",
      "Writes your creators' posts into Triple Whale as an 8x channel, beside your other ad sources.",
      "Disconnect any time; the key and everything read with it are removed.",
    ],
    key: "API key",
  },
  {
    id: "appstack",
    name: "AppStack",
    mark: <Icon name="package" size={20} />,
    answers: "What happened in the Meridian app: installs and in-app events, by source",
    reads: [
      "Uses the export API key from your app's settings in AppStack; 8x never sees your login.",
      "Reads daily counts of installs and in-app events with their source, campaign and ad. Never a device or user id.",
      "Connect each app: iOS and Android are often separate apps in AppStack.",
      "Disconnect any time; the key and everything read with it are removed.",
    ],
    key: "Export API key",
  },
  {
    id: "revenuecat",
    name: "RevenueCat",
    mark: <Icon name="dollar" size={20} />,
    answers: "What subscriptions in the app brought in: trials, conversions and renewals",
    reads: [
      "Uses a read-only V2 secret key and your Project ID from RevenueCat; 8x never sees your login.",
      "The key needs Charts & Metrics read. Create it in Project settings, then API keys. Only a project Admin in RevenueCat can create one.",
      "Revenue is RevenueCat's own figure. We never add it to AppStack's.",
    ],
    key: "Secret API key",
  },
];

// `focus`: a source to open at once (Settings' Connect on its row); give the dialog a new key each time it opens
export function ConnectDialog({ open, onClose, focus }: { open: boolean; onClose: () => void; focus?: string }) {
  const [opened, setOpened] = useState<string | null>(focus ?? null);
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const done = useConnected();

  const connect = (id: string) => {
    setBusy(id);
    window.setTimeout(() => {
      setBusy(null);
      markConnected(id);
      setOpened(null);
    }, 1100);
  };

  return (
    <Dialog open={open} onClose={onClose} label="Connect your data" width={640}>
      <div className={shared.body}>
        <div className={shared.head}>
          <span className={shared.askMark} aria-hidden>
            <Icon name="link" size={24} />
          </span>
          <h2>Connect your data</h2>
          <p>
            Each source answers a different question about the same campaign: what it did on your website, what your own ads did on your creators&rsquo; posts, what
            Triple Whale credits them with, and what AppStack and RevenueCat record in your app. Connect any one of them on its own.
          </p>
        </div>

        <ul className={styles.sources}>
          {CONNECTED_SOURCES.map((s) => (
            <Connected key={s.id} mark={s.mark} name={s.name} answers={s.answers} line={s.line} />
          ))}

          {WAITING.map((s) => {
            const isOpen = opened === s.id;
            const value = keys[s.id] ?? "";
            return (
              <li key={s.id} className={styles.source} data-open={isOpen || undefined}>
                <div className={styles.row}>
                  <span className={styles.mark}>{s.mark}</span>
                  <span className={styles.text}>
                    <strong>{s.name}</strong>
                    <span>{s.answers}</span>
                    {done[s.id] ? (
                      <span className={styles.state} data-state="reading">
                        <i aria-hidden />
                        Reading for the first time: the figures arrive within the hour
                      </span>
                    ) : (
                      <span className={styles.state}>
                        <i aria-hidden />
                        Not connected
                      </span>
                    )}
                  </span>
                  {!done[s.id] && (
                    <button type="button" className={styles.connect} onClick={() => setOpened(isOpen ? null : s.id)} aria-expanded={isOpen} data-anim-host>
                      {isOpen ? "Not now" : "Connect"}
                    </button>
                  )}
                </div>
                {isOpen && (
                  <div className={styles.form}>
                    <ul className={styles.reads}>
                      {s.reads?.map((r) => (
                        <li key={r}>
                          <Icon name="check" size={16} stroke={2} />
                          {r}
                        </li>
                      ))}
                    </ul>
                    <label className={styles.key}>
                      <span>{s.key}</span>
                      <input
                        type="password"
                        autoComplete="off"
                        spellCheck={false}
                        value={value}
                        placeholder={`Paste your ${s.name} ${s.key?.toLowerCase()}`}
                        onChange={(e) => setKeys((k) => ({ ...k, [s.id]: e.target.value }))}
                      />
                    </label>
                    <div className={styles.formFoot}>
                      <span title={value.trim().length >= 12 ? undefined : "Paste the whole key first"}>
                        <button type="button" className={shared.send} disabled={value.trim().length < 12 || busy === s.id} onClick={() => connect(s.id)} data-anim-host>
                          {busy === s.id ? (
                            <Sending />
                          ) : (
                            <>
                              <Icon name="link" size={18} />
                              Connect {s.name}
                            </>
                          )}
                        </button>
                      </span>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <p className={styles.foot}>Read-only, every one: 8x can see reports, never change them. Disconnect any time, and everything read from a source goes with it.</p>
      </div>
    </Dialog>
  );
}

function Connected({ mark, name, answers, line }: { mark: React.ReactNode; name: string; answers: string; line: string }) {
  return (
    <li className={styles.source}>
      <div className={styles.row}>
        <span className={styles.mark}>{mark}</span>
        <span className={styles.text}>
          <strong>{name}</strong>
          <span>{answers}</span>
          <span className={styles.state} data-state="on">
            <i aria-hidden />
            Connected · {line}
          </span>
        </span>
      </div>
    </li>
  );
}

