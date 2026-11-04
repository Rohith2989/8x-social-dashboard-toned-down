"use client";

import { CAMPAIGN } from "@/lib/demo";
import { parseBrief, type BriefBlock, type BriefInline } from "@/lib/brief";
import { MAYA } from "@/lib/plan";
import styles from "./guidelines.module.css";

/*
  What every plan is written to (was: the campaign guidelines card): the brief and the posting guidelines, as Maya
  wrote them, read and never edited. At the foot of the plan rather than above it: a brand opens the page for the
  plan, and comes here to check a script against the rules. Two columns with the product beside them; one Maya has
  not written says so. The account manager's own internal notes never reach the brand.
*/

export function Guidelines({ brief, posting }: { brief: string | null; posting: string | null }) {
  const a = parseBrief(brief);
  const b = parseBrief(posting);
  return (
    <section className={styles.guide} id="guidelines" aria-label="What every plan is written to">
      <div className={styles.head}>
        <span className={styles.product} aria-hidden>
          <img src={CAMPAIGN.product.logo} alt="" width={512} height={512} />
        </span>
        <div>
          <h2>What every plan is written to</h2>
          <p>
            The brief and the posting guidelines for {CAMPAIGN.name}, as {MAYA} wrote them.
          </p>
        </div>
      </div>
      {a.length === 0 && b.length === 0 ? (
        <p className={styles.none}>{MAYA} has not written the campaign guidelines yet.</p>
      ) : (
        <div className={styles.columns}>
          <Column label="The brief" blocks={a} />
          <Column label="Posting guidelines" blocks={b} />
        </div>
      )}
    </section>
  );
}

function Column({ label, blocks }: { label: string; blocks: BriefBlock[] }) {
  return (
    <div className={styles.column}>
      <h3 className={styles.label}>{label}</h3>
      {blocks.length === 0 ? (
        <p className={styles.none}>Not written yet.</p>
      ) : (
        <div className={styles.blocks}>
          {blocks.map((block, i) =>
            block.kind === "heading" ? (
              <p key={i} className={block.level === 2 ? styles.h2 : styles.h3}>
                <Spans spans={block.spans} />
              </p>
            ) : block.kind === "paragraph" ? (
              <p key={i} className={styles.p}>
                <Spans spans={block.spans} />
              </p>
            ) : block.ordered ? (
              <ol key={i} className={styles.list}>
                {block.items.map((spans, k) => (
                  <li key={k}>
                    <Spans spans={spans} />
                  </li>
                ))}
              </ol>
            ) : (
              <ul key={i} className={styles.list}>
                {block.items.map((spans, k) => (
                  <li key={k}>
                    <Spans spans={spans} />
                  </li>
                ))}
              </ul>
            ),
          )}
        </div>
      )}
    </div>
  );
}

function Spans({ spans }: { spans: BriefInline[] }) {
  return spans.map((s, i) =>
    s.kind === "bold" ? (
      <b key={i}>{s.text}</b>
    ) : s.kind === "italic" ? (
      <i key={i}>{s.text}</i>
    ) : s.kind === "link" ? (
      <a key={i} href={s.href} target="_blank" rel="noopener noreferrer">
        {s.text}
      </a>
    ) : (
      <span key={i}>{s.text}</span>
    ),
  );
}
