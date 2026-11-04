import { Suspense } from "react";
import type { Metadata } from "next";
import { ContentPlan } from "@/components/plan/plan";

export const metadata: Metadata = { title: "Content plan" };

// the open plan and script live in the URL, read on the client; the page waits for them rather than drawing another
export default function Page() {
  return (
    <Suspense>
      <ContentPlan />
    </Suspense>
  );
}
