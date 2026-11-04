import { Suspense } from "react";
import type { Metadata } from "next";
import { Analytics } from "@/components/analytics/analytics";

export const metadata: Metadata = { title: "Analytics" };

// the source, window, metric and open day live in the URL, read on the client; the page waits for them
export default function Page() {
  return (
    <Suspense>
      <Analytics />
    </Suspense>
  );
}
