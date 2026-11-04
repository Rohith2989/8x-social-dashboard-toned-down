// "Ask Maya": brings the 8x team's card into view, wherever it is on this screen (the right-hand column, or the tray
// below 1360 px), and lights it for a moment
export function showEightX() {
  const el = [...document.querySelectorAll<HTMLElement>("[data-eightx]")].find((e) => e.offsetParent !== null);
  if (!el) return;
  el.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  el.removeAttribute("data-flash");
  window.requestAnimationFrame(() => {
    el.setAttribute("data-flash", "");
    window.setTimeout(() => el.removeAttribute("data-flash"), 1600);
  });
  el.querySelector<HTMLElement>("a, button")?.focus({ preventScroll: true });
}
