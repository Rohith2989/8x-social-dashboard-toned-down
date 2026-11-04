import { Suspense } from "react";
import type { Metadata } from "next";
import { Posts } from "@/components/posts/posts";

export const metadata: Metadata = { title: "Posts & feed" };

// the page's view lives in the URL, read on the client; the page waits for it rather than rendering a second view
export default function Page() {
  return (
    <Suspense>
      <Posts />
    </Suspense>
  );
}
