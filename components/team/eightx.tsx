"use client";

import Link from "next/link";
import { CAMPAIGN, CAMPAIGNS } from "@/lib/demo";
import { defaultPlan, TODAY } from "@/lib/plan";
import { POSTS, ROSTER, since } from "@/lib/roster";
import { ACCOUNT_MANAGER } from "@/lib/team";
import { Card } from "../ui/card";
import { Icon, type IconName } from "../ui/icon";
import { Face } from "../creators/face";
import { usePlanState } from "../plan/store";
import { managerTrail, stepHref, stepText } from "./trail";
import styles from "./eightx.module.css";

/*
  Your 8x team (new: the right-hand column; below 1360 px it comes into the tray). The people at 8x and in its network
  working for this brand, as the brand may see them. The account manager by first name with "· 8x", her disc an M
  (design.md: an account manager's last name, email and internal notes never reach a brand): the campaigns she runs and
  where each stands, her latest on the content plan (each opens its script), and the way to write to her, which is the
  plan's own thread. Then the creators making the posts, real ones in good standing, opening Creators.
*/

const STEP_ICON: Record<string, IconName> = {
  added: "send",
  revised: "pencil",
  comment: "comment",
  flagResolved: "flag",
  approved: "tick",
  flagged: "flag",
};

const STATE: Record<(typeof CAMPAIGNS)[number]["status"], string> = {
  live: "Live",
  paused: "Paused",
  ended: "Ended",
};

const ORDER = { live: 0, paused: 1, ended: 2 } as const;

export function EightX({
  inline,
  className,
}: {
  inline?: boolean;
  className?: string;
}) {
  const plan = usePlanState();
  const steps = managerTrail(plan, 3);
  const thread = defaultPlan();
  const faces = ROSTER.filter(
    (c) => c.status === "active" && !c.flag && c.avatar,
  ).slice(0, 5);
  const today = new Set(
    POSTS.filter((p) => p.postedAt.slice(0, 10) === TODAY).map(
      (p) => p.creatorId,
    ),
  ).size;
  const campaigns = [...CAMPAIGNS].sort(
    (a, b) => ORDER[a.status] - ORDER[b.status],
  );
  const { first } = ACCOUNT_MANAGER;

  return (
    <div
      className={`${styles.eightx} ${inline ? styles.inline : ""} ${className ?? ""}`}
    >
      {inline && (
        <header className={styles.head}>
          <h2>Your 8x team</h2>
          <p>
            {first} runs your campaigns; {CAMPAIGN.creators} creators make your
            posts.
          </p>
        </header>
      )}

      <div className={styles.cards}>
        <Card
          tone="ink"
          order={inline ? 8 : 1}
          className={styles.manager}
          label={`${ACCOUNT_MANAGER.label}, your account manager`}
        >
          <div className={styles.managerInner} data-eightx>
            <div className={styles.side}>
              {!inline && (
                <p className={styles.kicker}>
                  <img
                    src="/brand/8x-paper.svg"
                    alt=""
                    width={27}
                    height={18}
                  />
                  Your 8x team
                </p>
              )}

              <div className={styles.who}>
                <span className={styles.disc} aria-hidden>
                  {ACCOUNT_MANAGER.initial}
                </span>
                <span className={styles.whoText}>
                  <strong>{ACCOUNT_MANAGER.label}</strong>
                  <span>
                    {ACCOUNT_MANAGER.role} on{" "}
                    {campaigns.length === 1
                      ? "your campaign"
                      : `all ${campaigns.length} campaigns`}
                  </span>
                </span>
              </div>

              <ul
                className={styles.campaigns}
                aria-label={`The campaigns ${first} runs`}
              >
                {campaigns.map((c) => (
                  <li key={c.id} data-status={c.status}>
                    <i data-tone={c.tone} aria-hidden />
                    <span className={styles.campaignName}>{c.name}</span>
                    <span className={styles.campaignState}>
                      {STATE[c.status]}
                      {c.id === CAMPAIGN.id &&
                        c.status === "live" &&
                        `, day ${CAMPAIGN.day} of ${CAMPAIGN.days}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.work}>
              {steps.length > 0 && (
                <>
                  <h3 className={styles.sub}>Lately, on the content plan</h3>
                  <ol className={styles.lately}>
                    {steps.map((s) => (
                      <li key={`${s.kind}${s.at}`}>
                        <Link
                          href={stepHref(s)}
                          className={styles.step}
                          data-anim-host
                        >
                          <span className={styles.stepIcon}>
                            <Icon
                              name={STEP_ICON[s.kind] ?? "plan"}
                              size={15}
                              stroke={2}
                            />
                          </span>
                          <span className={styles.stepText}>
                            <span>{stepText(s, "team")}</span>
                            <span className={styles.when}>{since(s.at)}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </>
              )}

              {thread && (
                <Link
                  href={`/plan?plan=${thread.key}`}
                  className={styles.write}
                  data-anim-host
                >
                  <Icon name="comment" size={18} />
                  Write to {first}
                </Link>
              )}
              <p className={styles.writeNote}>
                On the content plan&rsquo;s thread, where {first} answers.
              </p>
            </div>
          </div>
        </Card>

        <Card
          tint="lilac"
          order={inline ? 9 : 2}
          className={styles.creators}
          label="The creators making your posts"
        >
          <div className={styles.creatorsInner}>
            <h3>Making your posts</h3>
            <div className={styles.faces}>
              {faces.map((c) => (
                <Face key={c.id} creator={c} size={38} />
              ))}
              <span className={styles.more}>
                +{CAMPAIGN.creators - faces.length}
              </span>
            </div>
            <p className={styles.count}>
              <strong>{CAMPAIGN.creators} creators</strong> on {CAMPAIGN.name}
              {today > 0 && <>, {today} posted today</>}
            </p>
            <Link href="/creators" className={styles.go} data-anim-host>
              See them on Creators
              <Icon name="right" size={16} />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
