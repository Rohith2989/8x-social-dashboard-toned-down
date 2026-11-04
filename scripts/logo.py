"""Meridian's logo: the sample brand's mark, as a professional app icon. Gemini 3 Pro Image renders the artwork as a
full-bleed square (no corners, no frame, no text); the rounded corners are ours, cut here as a smooth superellipse, so
the edge stays crisp at every size.

    env -u GEMINI_API_KEY python scripts/logo.py <workdir> takes [concept ...]  # render concepts to <workdir>/dashboard/raw
    python scripts/logo.py <workdir> thicken zenith 11     # its white lines ~2.6x as thick -> meridian-logo-zenith-thick
    python scripts/logo.py <workdir> build zenith-thick    # the chosen one -> public/media/meridian-logo(-64).webp

The chosen mark (2026-11-04): "zenith", the sun at its highest over the horizon, which is what a meridian is: the
render's thin line vanished at sidebar size, so it is thickened here (a max filter on its white, the amber sun put back
over it), not re-rendered: the bold takes read as a cloche or a person.

<workdir> (kept out of git) holds .env with GEMINI_API_KEY; GEMINI_IMAGE points at the mahoraga skill's gemini_image.py.
"""
import os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from PIL import Image, ImageFilter

WORK = sys.argv[1]
MODE = sys.argv[2]
M = os.environ.get("GEMINI_IMAGE", "gemini_image.py")
RAW = os.path.join(WORK, "dashboard", "raw")
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "media")

BASE = (
    "A professional brand logo for Meridian, a calm, premium planning and study app. Show it as square app-icon "
    "artwork that fills the entire square canvas edge to edge: the image itself is the icon's face, its ground running "
    "into all four corners (the corners are rounded later, not in this image), no border, no device, no frame, nothing "
    "around it and no shadow outside it. The ground: {ground}. Centred on it, one mark: {mark}. Flat vector "
    "design with crisp geometric shapes, precise even line weights and generous space around the mark (it spans about "
    "44 percent of the width), perfectly centred. The craft of the icons of the best apps (Linear, Things, Arc, "
    "Notion). No text, letters or words. No 3D, glass, gloss, bevel, glow, sparkle, drop shadow, texture or noise."
)

CONCEPTS = {
    # the sun at its highest: the meridian is noon's line
    "zenith": (
        "a smooth, very subtle vertical gradient from deep midnight navy (#0D1838) at the bottom to a slightly lighter "
        "indigo navy (#1C2B63) at the top",
        "a thin white half-circle arc, the sun's path across the sky, standing on a short horizontal white line, the "
        "horizon, with a small solid warm amber (#FFB547) disc sitting exactly at the top of the arc, its highest point",
    ),
    # the zenith again, drawn bold enough to read at 32 px (the first take's line vanished small)
    "zenith-bold": (
        "a smooth, very subtle vertical gradient from deep midnight navy (#0D1838) at the bottom to a slightly lighter "
        "indigo navy (#1C2B63) at the top",
        "a bold white half-circle arc with rounded ends, its stroke about one fourteenth of the icon's width, standing on "
        "a bold horizontal white line of the same weight with rounded ends, the horizon, a little wider than the arc; a "
        "solid warm amber (#FFB547) disc, a little wider than the stroke, sitting exactly on the top of the arc",
    ),
    "zenith-dome": (
        "a smooth, very subtle vertical gradient from deep midnight navy (#0D1838) at the bottom to a slightly lighter "
        "indigo navy (#1C2B63) at the top",
        "a solid white half-disc, a dome, resting on an invisible horizon in the lower middle of the icon, and a solid "
        "warm amber (#FFB547) circle floating just above the dome's highest point, centred over it, with a clear gap "
        "between them",
    ),
    "zenith-day": (
        "a flat, warm off-white (#F5F2EC)",
        "a bold deep midnight-navy (#14214D) half-circle arc with rounded ends, its stroke about one fourteenth of the "
        "icon's width, standing on a bold horizontal navy line of the same weight with rounded ends, the horizon, a little "
        "wider than the arc; a solid warm amber (#FFA928) disc, a little wider than the stroke, sitting exactly on the top "
        "of the arc",
    ),
    # a planet and its one meridian, where the sun crosses it
    "meridian": (
        "a smooth, very subtle vertical gradient from deep midnight navy (#0D1838) at the bottom to a slightly lighter "
        "indigo navy (#1C2B63) at the top, running all the way to every edge and corner of the image",
        "a circle drawn as a bold white ring, its stroke about one sixteenth of the icon's width, and inside it one bold "
        "white meridian of the same weight: a vertical half-ellipse arc from the ring's top point to its bottom point, "
        "bulging to the right; a small solid warm amber (#FFB547) disc sits on the ring's top point, where the meridian "
        "begins",
    ),
    "meridian-solid": (
        "a flat, warm off-white (#F5F2EC), running all the way to every edge and corner of the image",
        "a solid deep midnight-navy (#14214D) circle with one bold off-white meridian cut through it: a vertical "
        "half-ellipse arc from the circle's top to its bottom, bulging to the right, its stroke about one sixteenth of the "
        "icon's width; a small solid warm amber (#FFA928) disc just above the circle's top point",
    ),
    # a globe's meridian, its far half in night
    "globe": (
        "a flat, warm off-white (#F5F2EC)",
        "a geometric globe in a confident deep ink-navy (#14214D): a circle outline with one vertical ellipse inside it "
        "(a meridian), the circle's right half filled solid ink-navy, so it reads as day and night",
    ),
    # two arches make the M
    "arches": (
        "a smooth diagonal gradient from deep teal (#0A4A46) at the lower left to a rich emerald (#0F7A5C) at the upper "
        "right",
        "an abstract letter M formed by two tall rounded arches side by side, drawn as one continuous thick white "
        "stroke with rounded ends",
    ),
    # noon's line through the day
    "noon": (
        "a flat, soft cream (#F3EEE4)",
        "a bold solid deep blue (#1E3BD0) circle with a single vertical white line through its centre that runs a "
        "little past the circle at the top and bottom, and a small white dot at the line's top end",
    ),
    # a horizon split into day and night
    "split": (
        "flat solid ink black (#111317)",
        "a perfect circle divided by one elegant vertical S-shaped curve into two halves, the left half white and the "
        "right half a warm coral (#FF6A48)",
    ),
}


def take(name):
    ground, mark = CONCEPTS[name]
    raw = os.path.join(RAW, f"meridian-logo-{name}.png")
    if os.path.exists(raw):
        return f"{name}: kept"
    r = subprocess.run([sys.executable, M, "--env", os.path.join(WORK, ".env"), "--out", raw,
                        "--prompt", BASE.format(ground=ground, mark=mark), "--aspect", "1:1", "--size", "1K"],
                       capture_output=True, text=True)
    return f"{name}: {'failed ' + r.stderr.strip()[-300:] if r.returncode else 'ok'}"


def squircle(size, n=5.0):
    # a superellipse |x|^n + |y|^n <= 1, antialiased by supersampling: the app-icon corner, not a plain radius
    s = size * 4
    y, x = np.mgrid[0:s, 0:s]
    u = np.abs((x + 0.5) / s * 2 - 1)
    v = np.abs((y + 0.5) / s * 2 - 1)
    m = ((u ** n + v ** n) <= 1).astype(np.uint8) * 255
    return Image.fromarray(m, "L").resize((size, size), Image.LANCZOS)


def thicken(name, px):
    # the mark's white lines grown by a max filter of px, the ground under them read from the margin row by row, and
    # the amber sun composited back on top
    a = np.asarray(Image.open(os.path.join(RAW, f"meridian-logo-{name}.png")).convert("RGB")).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    white = np.clip((np.minimum(np.minimum(r, g), b) - 120) / 115, 0, 1)
    amber = np.clip((r - b - 40) / 90, 0, 1)[..., None]
    ground = np.repeat(a[:, 40:120].mean(axis=1)[:, None, :], a.shape[1], axis=1)
    grown = Image.fromarray((white * 255).astype(np.uint8), "L").filter(ImageFilter.MaxFilter(px)).filter(ImageFilter.GaussianBlur(0.8))
    t = np.asarray(grown).astype(np.float32)[..., None] / 255
    out = ground * (1 - t) + 255 * t
    out = out * (1 - amber) + np.array([255, 181, 71], np.float32) * amber
    Image.fromarray(out.clip(0, 255).astype(np.uint8)).save(os.path.join(RAW, f"meridian-logo-{name}-thick.png"))
    return f"thickened {name}"


def build(name, size=512):
    im = Image.open(os.path.join(RAW, f"meridian-logo-{name}.png")).convert("RGB")
    side = min(im.size)
    im = im.crop(((im.width - side) // 2, (im.height - side) // 2, (im.width + side) // 2, (im.height + side) // 2))
    im = im.resize((size, size), Image.LANCZOS).convert("RGBA")
    im.putalpha(squircle(size))
    im.save(os.path.join(OUT, "meridian-logo.webp"), quality=92, method=6)
    im.resize((64, 64), Image.LANCZOS).save(os.path.join(OUT, "meridian-logo-64.webp"), quality=92, method=6)
    return f"built {name}"


if __name__ == "__main__":
    os.makedirs(RAW, exist_ok=True)
    if MODE == "takes":
        with ThreadPoolExecutor(5) as ex:
            for line in ex.map(take, sys.argv[3:] or list(CONCEPTS)):
                print(line)
    elif MODE == "thicken":
        print(thicken(sys.argv[3], int(sys.argv[4])))
    elif MODE == "build":
        print(build(sys.argv[3]))
