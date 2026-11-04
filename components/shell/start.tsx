"use client";

import { CAMPAIGN } from "@/lib/demo";
import { ACCOUNT_MANAGER } from "@/lib/team";
import { Dialog } from "../ui/dialog";
import { Icon } from "../ui/icon";
import shared from "../creators/dialogs.module.css";
import styles from "./start.module.css";

/*
  Start a campaign (the 8x team's rule, 2026-11-01: every Start a campaign asks which way). Both ways side by side, as
  the site draws its plans, day and night: Self Service, run on 8x's platform (Start free trial, web.8x.social's
  onboarding), and Full Service, run by 8x as this campaign is (Book a call, 8x.social's booking page). Each opens 8x's
  own page in a new tab; nothing is decided here.
*/

const SELF = "https://web.8x.social/onboarding";
const FULL = "https://www.8x.social/en/book-call";

export function StartDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} label="Start a campaign" width={720}>
      <div className={shared.body}>
        <div className={shared.head}>
          <span className={shared.askMark} aria-hidden>
            <Icon name="plus" size={24} />
          </span>
          <h2>Start a campaign</h2>
          <p>Two ways to run the next one with 8x. Choose how much of it you want in your hands.</p>
        </div>

        <div className={styles.ways}>
          <section className={styles.way} data-way="self" aria-labelledby="way-self">
            <span className={styles.icon} aria-hidden>
              <Icon name="spark" size={22} />
            </span>
            <h3 id="way-self">Self Service</h3>
            <p>Run it yourself on 8x&rsquo;s platform, at your own pace.</p>
            <a href={SELF} target="_blank" rel="noreferrer" className={styles.go} data-autofocus data-anim-host>
              Start free trial
              <Icon name="outward" size={16} />
            </a>
          </section>

          <section className={styles.way} data-way="full" aria-labelledby="way-full">
            <span className={styles.icon} aria-hidden>
              <img src="/brand/8x-paper.svg" alt="" width={27} height={18} />
            </span>
            <h3 id="way-full">Full Service</h3>
            <p>
              8x runs it for you, as with {CAMPAIGN.name}: the scripts, the creators and the posts, with {ACCOUNT_MANAGER.first} as your account manager.
            </p>
            <a href={FULL} target="_blank" rel="noreferrer" className={styles.go} data-anim-host>
              Book a call
              <Icon name="outward" size={16} />
            </a>
          </section>
        </div>
      </div>
    </Dialog>
  );
}
