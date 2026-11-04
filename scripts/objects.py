"""The page's backgroundless objects. Gemini 3 Pro Image renders each on a chroma screen and the mahoraga skill's
gemini_image.py keys it out; nothing else is generated. The look is the brand's object look (the landing's Apply uses
the same): one object, whole, a hard key light from the upper left, isolated, no text. Each is then trimmed to its own
outline and saved with its alpha.

    env -u GEMINI_API_KEY python scripts/objects.py <workdir> [name ...]

<workdir> (kept out of git) holds .env with GEMINI_API_KEY; GEMINI_IMAGE points at gemini_image.py. Raw renders go to
<workdir>/dashboard/raw/<name>.png, the page's to public/media/<name>.webp.
"""
import os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

WORK = sys.argv[1]
ONLY = sys.argv[2:]
M = os.environ.get("GEMINI_IMAGE", "gemini_image.py")
RAW = os.path.join(WORK, "dashboard", "raw")
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "media")

BASE = (
    "A studio product photograph of {thing}. One single object, whole and centred, filling about 62 percent of the "
    "frame, seen from the front and a little above and to the left (a gentle three-quarter view), floating. Its material "
    "and colour: {look}. Lit by one hard key light from the upper left with a soft fill, so it has crisp specular "
    "highlights along its edges and gentle shading of its own. Isolated on a perfectly flat, evenly lit, pure {screen} "
    "chroma background ({hex}), with no floor, no cast shadow and no {screen} reflected on the object. No text, letters, "
    "numbers or words anywhere. Photoreal, premium, minimal, like a product render for a tech brand."
)

# name: (the thing, its look, the screen it is keyed off), longest edge it is saved at
OBJECTS = {
    # (the brand's own logo is no object: scripts/brand.py lays its official files flat, as a brand's mark)
    # Social's own icon (message-circle-heart) made solid, for the card that asks the brand to act
    "social-bubble": (
        "a round speech bubble made solid, about three centimetres deep with softly rounded edges and a short tail at "
        "its lower left; on its front face a small heart, raised",
        "glossy deep cobalt blue (#2350ff) glass with a soft inner glow and a brighter blue rim where the light catches "
        "its edges; the raised heart pure white",
        "green", 640),
}
HEX = {"green": "#00ff00", "blue": "#0000ff"}


def render(name):
    thing, look, screen, edge = OBJECTS[name]
    raw = os.path.join(RAW, f"{name}.png")
    if not os.path.exists(raw):
        prompt = BASE.format(thing=thing, look=look, screen=screen, hex=HEX[screen])
        r = subprocess.run([sys.executable, M, "--env", os.path.join(WORK, ".env"), "--out", raw, "--prompt", prompt,
                            "--aspect", "1:1", "--size", "2K", "--key", screen], capture_output=True, text=True)
        if r.returncode:
            return f"{name}: failed {r.stderr.strip()[-300:]}"
    im = Image.open(raw).convert("RGBA")
    box = im.getchannel("A").point(lambda v: 255 if v > 24 else 0).getbbox()
    im = im.crop(box)
    k = edge / max(im.size)
    im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS).save(
        os.path.join(OUT, f"{name}.webp"), quality=90, method=6)
    return f"{name}: ok {im.size}"


if __name__ == "__main__":
    os.makedirs(RAW, exist_ok=True)
    os.makedirs(OUT, exist_ok=True)
    names = ONLY or list(OBJECTS)
    with ThreadPoolExecutor(4) as ex:
        for line in ex.map(render, names):
            print(line)
