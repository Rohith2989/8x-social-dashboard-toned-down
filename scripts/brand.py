"""The sample brand's pictures, from its official logo: e-Matura, one of 8x's clients (ematura.si, the online matura
prep platform run by Procademy in Ljubljana).

The logo files are e-Matura's own, as published on ematura.si (downloaded with the user's go-ahead on 2026-11-04):

  scripts/assets/ematura-cap.png      the mark: a mortarboard whose board is an E, its tassel (Logo7.png)
  scripts/assets/ematura-lockup.png   the mark over the name, "e-Matura" (cropped-e-Matura_LogoWebsite.png)

Its colours are the logo's: blue #1b75bc and grey #58595b. Nothing is redrawn or generated:

  public/media/ematura-icon.webp (512): the mark in its colours on white, the workspace on Settings and the content
    plan's brief
  public/media/ematura-mark.webp: the mark alone, on nothing, for the sidebar's round profile (set on its white disc
    inside the ring)
  public/media/ematura-icon-96.webp: the mark on white with room round it, so it sits in a circle (the phone's bar)
  public/media/ematura-banner.webp (1280 x 560): the lockup in white on the brand's blue, softly lit, with the
    dashboard's fine grain, across the top of the brand's card

    python scripts/brand.py
"""
import os
import numpy as np
from PIL import Image

HERE = os.path.dirname(__file__)
MEDIA = os.path.join(HERE, "..", "public", "media")
CAP = os.path.join(HERE, "assets", "ematura-cap.png")
LOCKUP = os.path.join(HERE, "assets", "ematura-lockup.png")
GRAIN = os.path.join(MEDIA, "grain.webp")

BLUE = np.array([0x1B, 0x75, 0xBC], float)


def trimmed(path: str) -> Image.Image:
    im = Image.open(path).convert("RGBA")
    return im.crop(im.getchannel("A").getbbox())


def fit(im: Image.Image, width: int) -> Image.Image:
    return im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)


def grain(w: int, h: int) -> np.ndarray:
    g = np.asarray(Image.open(GRAIN).convert("L"), float) / 255 - 0.5
    return np.tile(g, (h // g.shape[0] + 1, w // g.shape[1] + 1))[:h, :w]


def icon():
    """The mark in its own colours, centred on white."""
    tile = Image.new("RGBA", (512, 512), (255, 255, 255, 255))
    cap = fit(trimmed(CAP), 446)
    tile.alpha_composite(cap, ((512 - cap.width) // 2, (512 - cap.height) // 2 + 6))
    tile = tile.convert("RGB")
    tile.save(os.path.join(MEDIA, "ematura-icon.webp"), quality=94)


def mark():
    """The mark alone on nothing (the round profile sets it on its own disc), and a small round-friendly icon."""
    cap = fit(trimmed(CAP), 360)
    cap.save(os.path.join(MEDIA, "ematura-mark.webp"), quality=94)
    round_ = Image.new("RGBA", (384, 384), (255, 255, 255, 255))
    small = fit(trimmed(CAP), 244)
    round_.alpha_composite(small, ((384 - small.width) // 2, (384 - small.height) // 2 + 4))
    round_.convert("RGB").resize((96, 96), Image.LANCZOS).save(os.path.join(MEDIA, "ematura-icon-96.webp"), quality=94)
    print("mark", cap.size)


def banner():
    """The lockup knocked out in white on the brand's blue: lit from the top left, deeper to the right, fine grain."""
    w, h = 1280, 560
    yy, xx = np.mgrid[0:h, 0:w].astype(float)
    d = np.clip(np.sqrt(((xx - 0.18 * w) / (1.1 * w)) ** 2 + ((yy + 0.1 * h) / (1.25 * h)) ** 2), 0, 1)[..., None]
    lit = BLUE * 1.12 + 10
    deep = BLUE * 0.62
    img = lit * (1 - d) + deep * d
    img += grain(w, h)[..., None] * 8
    ground = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).convert("RGBA")
    lock = fit(trimmed(LOCKUP), 540)
    white = Image.new("RGBA", lock.size, (255, 255, 255, 255))
    white.putalpha(lock.getchannel("A"))
    ground.alpha_composite(white, ((w - lock.width) // 2, round(h * 0.42 - lock.height / 2)))
    ground.convert("RGB").save(os.path.join(MEDIA, "ematura-banner.webp"), quality=92)


if __name__ == "__main__":
    icon()
    mark()
    banner()
    print("ematura-icon.webp, ematura-mark.webp, ematura-icon-96.webp, ematura-banner.webp")
