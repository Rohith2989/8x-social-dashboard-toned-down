"use client";

import { CAMPAIGN } from "@/lib/demo";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { Aside, PageFooter, PageHeader, SquareButton, Tray, useShellActions } from "../shell/shell";
import { useAccount } from "../settings/account";
import { Performance } from "./performance";
import { Activity } from "./activity";
import { Engagement } from "./engagement";
import { Campaigns } from "./campaigns";
import { ComingUp } from "./coming-up";
import { TopPosts } from "./top-posts";
import { Pace } from "./pace";
import { Rhythm } from "./rhythm";
import styles from "./overview.module.css";

/*
  The brand's home in Social. The tray holds the story, top to bottom (performance and its trend, engagement, the
  campaigns, the posts that did best, the pace); the right-hand column is what goes out next. Colour comes in blocks,
  all of them the vertical's own: ink, the pale aura, the accent with grain, the deep blue, the glow.
  Below 1360 px the calendar moves into the tray.
*/

export function Overview() {
  const first = useAccount().first;
  const actions = useShellActions();
  return (
    <>
      <Tray label="Overview">
        <PageHeader
          title={`Hello, ${first}`}
          line={
            <>
              Tuesday, 3 November. <strong>{CAMPAIGN.name}</strong> is on day {CAMPAIGN.day} of {CAMPAIGN.days}.
            </>
          }
        >
          <SquareButton icon={<Icon name="search" />} label="Search (Ctrl K)" onClick={actions.search} />
          <Button variant="ink" icon={<Icon name="plus" size={18} />} onClick={actions.start}>
            Start a campaign
          </Button>
        </PageHeader>

        <div className={styles.rows}>
          <div className={styles.top}>
            <Performance />
            <Activity />
          </div>
        </div>

        <Engagement />

        <ComingUp inline className={styles.inlineCalendar} />

        <Campaigns />

        <TopPosts />

        <div className={styles.rows}>
          <section className={styles.pace} aria-label="Pace and rhythm">
            <Pace />
            <Rhythm />
          </section>
        </div>

        <PageFooter />
      </Tray>

      <Aside label="Coming up">
        <ComingUp className={styles.calendar} />
      </Aside>
    </>
  );
}
