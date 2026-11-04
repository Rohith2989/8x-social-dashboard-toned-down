import { Suspense } from "react";
import type { Metadata } from "next";
import { Creators } from "@/components/creators/creators";

export const metadata: Metadata = { title: "Creators" };

// the roster's view lives in the URL, read on the client; the page waits for it rather than rendering a second view
export default function Page() {
  return (
    <Suspense>
      <Creators />
    </Suspense>
  );
}
