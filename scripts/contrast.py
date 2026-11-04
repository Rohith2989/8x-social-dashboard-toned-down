"""Every visible word's contrast against what is really drawn behind it, in both looks.

    npm run dev                                   # the dashboard on :3012
    python scripts/contrast.py [out.json] [pages...]
    CROPS=dir python scripts/contrast.py ...       # also a crop of each low one

For each page, look (Daybreak and Night) and width (1440 and 390): the window is grown until nothing scrolls, then every
text on screen (not covered, clipped away or faded out) is measured: its colour (any CSS colour, read back through a
canvas) with its own alpha and every ancestor's opacity, laid over the background taken from the screenshot in a thin
ring round the words. Small words need 4.5:1, large ones (24px, or 18.66px bold) 3:1. Placeholders are measured too.
A page may carry an action after a "|" (JavaScript run before measuring, to open a menu or a dialog).
"""
import json, sys, time, io
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

PAGES = ["/", "/creators", "/creators?open=sevda", "/posts", "/posts?view=table", "/plan", "/analytics",
         "/analytics?view=tiktok", "/analytics?view=meta", "/team", "/settings", "/sign-in", "/sign-in?out=1"]
WIDTHS = [1440, 390]
THEMES = ["light", "dark"]
import os
CROPS = os.environ.get("CROPS", "")

COLLECT = r"""
(() => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  const rgba = (c) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  const opacityOf = (el) => { let o = 1; for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') return 0; o *= parseFloat(cs.opacity); } return o; };
  const name = (el) => { const c = (el.className && el.className.baseVal === undefined) ? el.className : ''; return (el.tagName.toLowerCase() + (c ? '.' + c.split(/\s+/).map(s => s.replace(/^[a-z-]+-module__[A-Za-z0-9_-]+__/, '')).join('.') : '')).slice(0, 90); };
  const path = (el) => { const p = []; for (let e = el, k = 0; e && e !== document.body && k < 4; e = e.parentElement, k++) p.push(name(e)); return p.join(' < '); };
  const out = [];
  const W = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = W.nextNode())) {
    const t = n.textContent.replace(/\s+/g, ' ').trim();
    if (!t) continue;
    const el = n.parentElement;
    if (!el || el.closest('script,style,noscript,svg,title')) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const fill = cs.webkitTextFillColor;
    if (cs.backgroundClip === 'text' || cs.webkitBackgroundClip === 'text' || (fill && rgba(fill)[3] === 0)) continue;
    const r = document.createRange(); r.selectNodeContents(n);
    const rects = [...r.getClientRects()].filter(q => q.width >= 3 && q.height >= 6);
    if (!rects.length) continue;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const q of rects) { x0 = Math.min(x0, q.left); y0 = Math.min(y0, q.top); x1 = Math.max(x1, q.right); y1 = Math.max(y1, q.bottom); }
    if (x1 < 0 || y1 < 0 || x0 > innerWidth || y0 > innerHeight) continue;
    const q = rects[0];
    const hit = document.elementFromPoint(Math.min(innerWidth - 1, q.left + Math.min(q.width / 2, 8)), Math.min(innerHeight - 1, q.top + q.height / 2));
    const visible = !!hit && (hit === el || el.contains(hit) || hit.contains(el));
    const op = opacityOf(el);
    if (op < 0.05) continue;
    if (hit && /^(IMG|VIDEO|CANVAS)$/.test(hit.tagName)) continue;
    const eb = el.getBoundingClientRect();
    if (eb.width <= 2 || eb.height <= 2 || /sr-only/.test(el.className || '')) continue;
    const mx = (q.left + q.right) / 2, my = (q.top + q.bottom) / 2;
    let clipped = false;
    for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) {
      const ec = getComputedStyle(e);
      if (ec.overflowX !== 'visible' || ec.overflowY !== 'visible') {
        const cb = e.getBoundingClientRect();
        if (mx < cb.left - 1 || mx > cb.right + 1 || my < cb.top - 1 || my > cb.bottom + 1) { clipped = true; break; }
      }
    }
    if (clipped) continue;
    out.push({ t: t.slice(0, 70), x0, y0, x1, y1, color: rgba(cs.color), op, fs: parseFloat(cs.fontSize), fw: parseInt(cs.fontWeight), who: path(el), visible });
  }
  for (const inp of document.querySelectorAll('input[placeholder], textarea[placeholder]')) {
    if (inp.value) continue;
    const b = inp.getBoundingClientRect(); if (b.width < 3 || b.height < 6) continue;
    if (opacityOf(inp) < 0.05) continue;
    const ih = document.elementFromPoint(Math.min(innerWidth - 1, b.left + 20), Math.min(innerHeight - 1, b.top + b.height / 2));
    if (!ih || !(ih === inp || inp.contains(ih) || ih.contains(inp) || ih.closest('label') === inp.closest('label'))) continue;
    const ics = getComputedStyle(inp); const fs = parseFloat(ics.fontSize);
    const pl = parseFloat(ics.paddingLeft);
    const ps = getComputedStyle(inp, '::placeholder');
    const x0 = b.left + pl, x1 = Math.min(b.right - 4, x0 + inp.placeholder.length * fs * 0.48);
    out.push({ t: 'placeholder: ' + inp.placeholder.slice(0, 60), x0, y0: b.top + b.height / 2 - fs * 0.62, x1, y1: b.top + b.height / 2 + fs * 0.62, color: rgba(ps.color), op: opacityOf(inp), fs, fw: parseInt(ics.fontWeight), who: path(inp), visible: true });
  }
  return out;
})()
"""

NEED = r"""(() => { let extra = 0; for (const e of document.querySelectorAll('*')) { const cs = getComputedStyle(e); if ((cs.overflowY === 'auto' || cs.overflowY === 'scroll') && e.scrollHeight > e.clientHeight + 2 && e.clientHeight > 40) extra = Math.max(extra, e.scrollHeight - e.clientHeight); } return Math.max(extra, document.documentElement.scrollHeight - innerHeight); })()"""


def lum(c):
    c = np.asarray(c, float) / 255
    c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def ratio(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def ring(img, x0, y0, x1, y1, pad=3):
    H, W = img.shape[:2]
    X0, Y0, X1, Y1 = int(max(0, x0 - pad)), int(max(0, y0 - pad)), int(min(W, x1 + pad)), int(min(H, y1 + pad))
    if X1 - X0 < 2 or Y1 - Y0 < 2:
        return None
    box = img[Y0:Y1, X0:X1].reshape(-1, 3)
    ix0, iy0, ix1, iy1 = int(max(0, x0)), int(max(0, y0)), int(min(W, x1)), int(min(H, y1))
    mask = np.ones((Y1 - Y0, X1 - X0), bool)
    mask[iy0 - Y0:iy1 - Y0, ix0 - X0:ix1 - X0] = False
    px = img[Y0:Y1, X0:X1][mask]
    if len(px) < 6:
        px = box
    return np.median(px, axis=0)


def run(out_path, pages):
    rows = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        for theme in THEMES:
            for w in WIDTHS:
                ctx = b.new_context(viewport={"width": w, "height": 900}, color_scheme=theme, device_scale_factor=1, reduced_motion="reduce")
                ctx.add_init_script(f"try {{ localStorage.setItem('8x-theme', '{theme}') }} catch (e) {{}}")
                pg = ctx.new_page()
                for entry in pages:
                    url, _, act = entry.partition("|")
                    pg.set_viewport_size({"width": w, "height": 900})
                    pg.goto("http://localhost:3012" + url, wait_until="networkidle")
                    time.sleep(1.2)
                    if act:
                        pg.evaluate(act)
                        time.sleep(1.2)
                    h = 900
                    for _ in range(0 if act else 4):
                        need = pg.evaluate(NEED)
                        if need <= 2:
                            break
                        h = min(15000, h + int(need) + 40)
                        pg.set_viewport_size({"width": w, "height": h})
                        time.sleep(0.6)
                    time.sleep(2.2)
                    items = pg.evaluate(COLLECT)
                    img = np.asarray(Image.open(io.BytesIO(pg.screenshot())).convert("RGB")).astype(float)
                    for it in items:
                        if not it["visible"]:
                            continue
                        bg = ring(img, it["x0"], it["y0"], it["x1"], it["y1"])
                        if bg is None:
                            continue
                        r, g, bl, a = it["color"]
                        a = a * it["op"]
                        txt = a * np.array([r, g, bl], float) + (1 - a) * bg
                        cr = ratio(txt, bg)
                        large = it["fs"] >= 24 or (it["fs"] >= 18.66 and it["fw"] >= 700)
                        need_r = 3.0 if large else 4.5
                        if cr < need_r:
                            if CROPS:
                                k = len(rows)
                                X0, Y0 = max(0, int(it["x0"]) - 24), max(0, int(it["y0"]) - 16)
                                X1, Y1 = min(img.shape[1], int(it["x1"]) + 24), min(img.shape[0], int(it["y1"]) + 16)
                                Image.fromarray(img[Y0:Y1, X0:X1].astype("uint8")).save(f"{CROPS}/{k:04d}.png")
                            rows.append({"url": url, "theme": theme, "w": w, "ratio": round(cr, 2), "need": need_r, "fs": it["fs"], "fw": it["fw"],
                                         "op": round(it["op"], 2), "t": it["t"], "who": it["who"], "box": [round(it["x0"]), round(it["y0"]), round(it["x1"]), round(it["y1"])],
                                         "txt": [int(v) for v in txt], "bg": [int(v) for v in bg]})
                    print(theme, w, url, "texts", len(items), "low", sum(1 for r in rows if r["url"] == url and r["theme"] == theme and r["w"] == w), flush=True)
                ctx.close()
        b.close()
    json.dump(rows, open(out_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("low total", len(rows))


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "contrast.json"
    pages = sys.argv[2:] or PAGES
    run(out, pages)
