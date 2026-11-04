// brings a row on the page into view and lights it for a moment (a refusal's "Show it", a request just sent)
export function flash(id: string) {
  const el = document.querySelector<HTMLElement>(`[data-row="${CSS.escape(id)}"]`);
  if (!el) return;
  el.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  el.removeAttribute("data-flash");
  // a frame apart, so lighting the same row twice runs its light again
  window.requestAnimationFrame(() => {
    el.setAttribute("data-flash", "");
    window.setTimeout(() => el.removeAttribute("data-flash"), 1600);
  });
}
