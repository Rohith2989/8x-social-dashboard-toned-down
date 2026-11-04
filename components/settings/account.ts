"use client";

import { useSyncExternalStore } from "react";
import { BRAND } from "@/lib/demo";

/*
  The signed-in member's own fields (the product's User: first and last name, phone; the email is how they sign in and
  stays as it is). One store for the window: a name saved in Settings shows wherever the page names you (the overview's
  greeting, your card on Team).
*/

export type Account = { first: string; last: string; phone: string };

const [first, ...rest] = BRAND.member.name.split(" ");

// a fictional number (555-01xx is set aside for fiction)
export const ACCOUNT_DEFAULT: Account = { first, last: rest.join(" "), phone: "+1 415 555 0142" };

export const ACCOUNT_EMAIL = "alex@ematura.si";

let state: Account = ACCOUNT_DEFAULT;
const listeners = new Set<() => void>();

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

export const useAccount = () =>
  useSyncExternalStore(
    subscribe,
    () => state,
    () => ACCOUNT_DEFAULT,
  );

export function saveAccount(next: Account) {
  state = { first: next.first.trim(), last: next.last.trim(), phone: next.phone.trim() };
  listeners.forEach((fn) => fn());
}

export const fullName = (a: Account) => [a.first, a.last].filter(Boolean).join(" ");

export const initialsOf = (a: Account) => `${a.first[0] ?? ""}${a.last[0] ?? ""}`.toUpperCase();
