import { Suspense } from "react";
import type { Metadata } from "next";
import { SignIn } from "@/components/sign-in/sign-in";

export const metadata: Metadata = { title: "Sign in" };

// outside the dashboard's window: whether you were just signed out lives in the URL, read on the client
export default function Page() {
  return (
    <Suspense>
      <SignIn />
    </Suspense>
  );
}
