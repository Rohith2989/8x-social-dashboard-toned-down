"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BRAND } from "@/lib/demo";
import { Aura } from "../shell/aura";
import { Icon } from "../ui/icon";
import { Sending } from "../creators/done";
import styles from "./sign-in.module.css";

/*
  Signing in (the product's page, src/app/sign-in: "Sign in to 8x", a 6-digit code by email, no passwords), in the
  dashboard's own world: one light card on the window's night aura. Signed out on purpose, it says so first. The
  steps and their words are the product's: Work email, Email me a code, then the code in six slots (one real field
  under them, so paste and the phone's one-time-code fill work), Verify and sign in, Send a new code. In the sample any
  six digits sign in, and the page says so; signing in lands on the overview.
*/

const CODE = 6;
const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-z]{2,}$/i;
const TRIAL = "https://web.8x.social/onboarding";
const SITE = "https://www.8x.social";

export function SignIn() {
  const out = useSearchParams().get("out") === "1";
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<"send" | "verify" | "again" | "google" | null>(null);
  const [notice, setNotice] = useState<{ tone: "good" | "bad"; text: string } | null>(out ? { tone: "good", text: `You’re signed out of ${BRAND.name}’s workspace.` } : null);
  const codeField = useRef<HTMLInputElement>(null);

  const send = () => {
    if (busy) return;
    if (!EMAIL.test(email.trim())) {
      setNotice({ tone: "bad", text: "Enter a full work email address, like name@company.com." });
      return;
    }
    setNotice(null);
    setBusy("send");
    window.setTimeout(() => {
      setBusy(null);
      setStep("code");
      window.setTimeout(() => codeField.current?.focus(), 30);
    }, 900);
  };

  const verify = () => {
    if (busy || code.length < CODE) return;
    setBusy("verify");
    window.setTimeout(() => router.push("/"), 800);
  };

  const again = () => {
    if (busy) return;
    setBusy("again");
    setCode("");
    window.setTimeout(() => {
      setBusy(null);
      setNotice({ tone: "good", text: `A new code is on its way to ${email.trim().toLowerCase()}.` });
      codeField.current?.focus();
    }, 900);
  };

  return (
    <main className={styles.stage}>
      <div className={styles.backdrop} aria-hidden>
        <Aura recipe="night" className={styles.aura} />
      </div>

      <header className={styles.top}>
        <a href={SITE} className={styles.home} aria-label="8x for brands home">
          <img src="/brand/8x-paper.svg" alt="" width={39} height={26} />
          <i aria-hidden />
          <span>for brands</span>
        </a>
        <a href={SITE} className={styles.back}>
          <Icon name="left" size={16} />
          Back to the site
        </a>
      </header>

      <section className={styles.card} aria-labelledby="sign-in-title">
        <p className={styles.eyebrow}>Welcome back</p>
        <h1 id="sign-in-title">Sign in to 8x</h1>
        <p className={styles.lede}>We email you a 6‑digit code. No passwords.</p>

        {notice && (
          <p className={styles.notice} data-tone={notice.tone} role={notice.tone === "bad" ? "alert" : "status"}>
            <Icon name={notice.tone === "bad" ? "flag" : "check"} size={16} stroke={2} />
            {notice.text}
          </p>
        )}

        {step === "email" ? (
          <form
            className={styles.form}
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <label className={styles.field}>
              <span>Work email</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                spellCheck={false}
                placeholder="you@example.com"
                value={email}
                disabled={!!busy}
                aria-invalid={notice?.tone === "bad"}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (notice?.tone === "bad") setNotice(null);
                }}
              />
            </label>
            <button type="submit" className={styles.primary} disabled={!!busy} data-anim-host>
              {busy === "send" ? (
                <>
                  <Sending />
                  Sending code…
                </>
              ) : (
                "Email me a code"
              )}
            </button>

            <div className={styles.or}>
              <i />
              or
              <i />
            </div>
            <button
              type="button"
              className={styles.google}
              disabled={!!busy}
              onClick={() => {
                setBusy("google");
                window.setTimeout(() => router.push("/"), 900);
              }}
              data-anim-host
            >
              {busy === "google" ? (
                "Redirecting…"
              ) : (
                <>
                  <GoogleMark />
                  Continue with Google
                </>
              )}
            </button>
          </form>
        ) : (
          <form
            className={styles.form}
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              verify();
            }}
          >
            <div className={styles.sent}>
              <p>
                Sent to <strong>{email.trim().toLowerCase()}</strong>
              </p>
              <button
                type="button"
                className={styles.quiet}
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setNotice(null);
                }}
                disabled={!!busy}
                data-anim-host
              >
                Change
              </button>
            </div>

            <label className={styles.code}>
              <span className="sr-only">{CODE}-digit sign-in code</span>
              <input
                ref={codeField}
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={CODE}
                value={code}
                disabled={busy === "verify"}
                aria-label={`${CODE}-digit sign-in code`}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, CODE))}
              />
              <span className={styles.slots} aria-hidden>
                {Array.from({ length: CODE }, (_, i) => (
                  <span key={i} data-on={i === Math.min(code.length, CODE - 1) || undefined} data-filled={i < code.length || undefined}>
                    {code[i] ?? ""}
                  </span>
                ))}
              </span>
            </label>
            <p className={styles.sample}>In this sample, any six digits sign you in.</p>

            <button type="submit" className={styles.primary} disabled={code.length < CODE || !!busy} data-anim-host>
              {busy === "verify" ? (
                <>
                  <Sending />
                  Signing in…
                </>
              ) : (
                <>
                  Verify and sign in
                  <Icon name="arrow" size={18} />
                </>
              )}
            </button>
            <button type="button" className={styles.quiet} onClick={again} disabled={!!busy} data-anim-host>
              {busy === "again" ? "Sending…" : "Send a new code"}
            </button>
          </form>
        )}

        <p className={styles.signup}>
          New to 8x?{" "}
          <a href={TRIAL} target="_blank" rel="noreferrer">
            Start your free trial
          </a>
        </p>
      </section>
    </main>
  );
}

// Google's own four-colour G, as its sign-in buttons draw it
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}
