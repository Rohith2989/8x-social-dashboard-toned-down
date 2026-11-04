"use client";

import { useCallback, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { CAMPAIGN } from "@/lib/demo";
import {
  MAYA,
  PLANS,
  SCRIPT_FLAG_REASONS,
  TODAY,
  daysBetween,
  defaultPlan,
  filtersFor,
  matchesFilter,
  reviewOf,
  planByKey,
  planCsv,
  scriptById,
  type Filter,
  type Script,
  type ScriptFlagReason,
} from "@/lib/plan";
import { Button } from "../ui/button";
import { Icon, type IconName } from "../ui/icon";
import { useToast } from "../ui/toast";
import { FlagDialog } from "../creators/flag-dialog";
import { Aside, PageFooter, PageHeader, Tray } from "../shell/shell";
import { approve, eventsOf, flag, reviewIn, unreadOf, usePlanState, waitingIn } from "./store";
import { Summary } from "./summary";
import { OpenPlan } from "./open-plan";
import { ScriptSheet } from "./script";
import { Activity, ActivitySheet } from "./activity";
import { ApproveDialog, IdeaDialog } from "./dialogs";
import { Thumb } from "./open-plan";
import { Guidelines } from "./guidelines";
import { GUIDELINES } from "@/lib/plan-data";
import styles from "./plan.module.css";

/*
  Content plan (docs/content-plan.md, part by part): what is waiting for the brand, what creators are making now,
  which scripts work, what one script asks for, and the conversation with Maya about it. The tray holds the plans,
  the open plan's scripts and the open script; the window's right-hand column holds that script's activity (a sheet
  below 1360 px). The open plan, the open script and the filter live in the URL, so a link names the script a brand
  is asking about; what the brand decides lives in the window's plan store (./store.ts).
*/

type Key = "plan" | "script" | "show" | "panel";
export type Patch = Partial<Record<Key, string | null>>;

// a script is flagged for what is written in it (the product's list for a format)
const REASON_ICONS: Record<ScriptFlagReason, IconName> = { script: "plan", hook: "spark", cta: "send", brandGuidelines: "shield", other: "more" };

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ContentPlan() {
  const params = useSearchParams();
  const path = usePathname();
  const st = usePlanState();
  const toast = useToast();
  const [approving, setApproving] = useState<Script[] | null>(null);
  const [flagging, setFlagging] = useState<Script | null>(null);
  const [idea, setIdea] = useState(false);
  // how many times each script was approved here, so the heart bursts on the one that just was
  const [bursts, setBursts] = useState<Record<string, number>>({});

  const set = useCallback(
    (patch: Patch) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v == null || v === "") next.delete(k);
        else next.set(k, v);
      }
      if (next.get("show") === "all") next.delete("show");
      const s = next.toString();
      // the browser's own history (Next keeps useSearchParams in step with it): the view changes at once, with no
      // round trip to the server for a page that reads its state on the client
      window.history.replaceState(null, "", s ? `${path}?${s}` : path);
    },
    [params, path],
  );

  const plan = planByKey(params.get("plan")) ?? defaultPlan();
  if (!plan) return <NoPlans />;

  // a link can carry a filter into a plan that does not offer it; it reads as All
  const asked = params.get("show") as Filter | null;
  const show: Filter = asked && filtersFor(plan.stage).includes(asked) ? asked : "all";
  const shown = plan.scripts.filter((s) => matchesFilter(reviewIn(s, st), show));
  // the open script: the one asked for while the filter shows it; on a plan waiting for approval, the first that was
  // waiting when Maya shared it (read from what she shared, not from this visit, so approving or flagging the open
  // script never moves the page on to the next); else the first shown
  const n = Number(params.get("script"));
  const first = plan.stage === "review" ? plan.scripts.find((s) => reviewOf(s.events).state === "awaitingReview")?.n : undefined;
  const open = shown.find((s) => s.n === n) ?? shown.find((s) => s.n === first) ?? shown[0] ?? null;

  const waiting = waitingIn(st);
  const waitingPlan = PLANS.find((p) => p.stage === "review" && waiting.some((s) => s.plan === p.key));
  const live = PLANS.find((p) => p.stage === "live");

  const approved = (ids: string[]) => {
    approve(ids);
    setBursts((b) => ({ ...b, ...Object.fromEntries(ids.map((id) => [id, (b[id] ?? 0) + 1])) }));
    const one = ids.length === 1 ? scriptById(ids[0]) : null;
    toast({
      text: one ? `Approved Script ${one.n}. ${MAYA} can send it to creators.` : `Approved ${ids.length} scripts. ${MAYA} can send them to creators.`,
      icon: "heart",
    });
  };

  return (
    <>
      <Tray label="Content plan">
        <PageHeader
          title="Content plan"
          line={
            waitingPlan ? (
              <>
                {MAYA} shares a plan a week for {CAMPAIGN.name}. <strong>{waitingPlan.name}</strong> is waiting for you:{" "}
                {waiting.filter((s) => s.plan === waitingPlan.key).length} of its {waitingPlan.scripts.length} scripts.
              </>
            ) : live ? (
              <>
                Nothing is waiting for you. <strong>{live.name}</strong> is with creators, day {daysBetween(live.start, TODAY) + 1} of {live.days}.
              </>
            ) : (
              <>Nothing is waiting for you.</>
            )
          }
        >
          <span title={`${plan.name}'s scripts as a CSV, every field of the brief`}>
            <Button
              variant="stone"
              icon={<Icon name="download" size={18} />}
              onClick={() => {
                download(`content-plan-${plan.name.toLowerCase().replace(/\s+/g, "-")}.csv`, planCsv(plan, (s) => reviewIn(s, st)));
                toast({ text: `Exported the ${plan.scripts.length} scripts of ${plan.name}`, icon: "download" });
              }}
            >
              Export
            </Button>
          </span>
          <Button variant="ink" icon={<Icon name="plus" size={18} />} onClick={() => setIdea(true)}>
            Suggest an idea
          </Button>
        </PageHeader>

        <Summary
          open={plan}
          onPlan={(key) => set({ plan: key, script: null, show: null })}
          onScript={(id) => {
            const s = scriptById(id);
            if (s) set({ plan: s.plan, script: String(s.n), show: null });
          }}
        />

        <OpenPlan
          plan={plan}
          open={open}
          show={show}
          onShow={(f) => set({ show: f, script: null })}
          onOpen={(n) => set({ script: String(n) })}
          onApproveRest={(scripts) => setApproving(scripts)}
        />

        {open && (
          <ScriptSheet
            key={open.id}
            script={open}
            plan={plan}
            review={reviewIn(open, st)}
            comments={eventsOf(open, st).filter((e) => e.kind === "comment").length}
            unread={unreadOf(open, st)}
            burst={bursts[open.id] ?? 0}
            onApprove={() => setApproving([open])}
            onFlag={() => setFlagging(open)}
            onTalk={() => set({ panel: "activity" })}
          />
        )}

        <Guidelines brief={GUIDELINES.brief} posting={GUIDELINES.posting} />

        <PageFooter />
      </Tray>

      <Aside label="Activity">{open && <Activity key={open.id} script={open} plan={plan} />}</Aside>

      <ActivitySheet script={open} plan={plan} open={params.get("panel") === "activity"} onClose={() => set({ panel: null })} />

      <ApproveDialog scripts={approving} plan={plan} onClose={() => setApproving(null)} onApprove={approved} />

      <FlagDialog<ScriptFlagReason>
        names={flagging ? `Script ${flagging.n}` : "the script"}
        heads={flagging ? <Thumb script={flagging} plan={plan} className={styles.flagHead} /> : null}
        line={`Creators won't get it until ${MAYA} sends it back.`}
        placeholder="Say what should change, and where"
        reasons={SCRIPT_FLAG_REASONS}
        icons={REASON_ICONS}
        done={`${MAYA} is told now. You can approve or flag it again once it comes back.`}
        open={!!flagging}
        onClose={() => setFlagging(null)}
        onSend={(reasons, note) => {
          if (flagging) flag(flagging.id, reasons, note);
        }}
      />

      <IdeaDialog open={idea} onClose={() => setIdea(false)} onSend={() => toast({ text: `Sent your idea to ${MAYA}`, icon: "send" })} />
    </>
  );
}

// before Maya shares anything, the page says so rather than drawing empty blocks
function NoPlans() {
  return (
    <Tray label="Content plan">
      <PageHeader title="Content plan" line={<>Nothing to review yet.</>} />
      <p className={styles.none}>{MAYA} has not shared a plan yet. The first one lands here, with every script to review.</p>
      <PageFooter />
    </Tray>
  );
}
