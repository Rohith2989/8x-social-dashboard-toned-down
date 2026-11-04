"""The coarse grain on the dashboard's textured grounds (the Engagement strip, the gradient cards, the blob): a
seamless 256 px tile of light and dark specks with a soft alpha, laid over a colour so it reads as a printed, tactile
surface. The fine grain (media/grain.webp) is the landing's own, for the backdrop.

    python scripts/grain.py
"""
import os
import numpy as np
from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "media", "grain-coarse.webp")
S = 256
rng = np.random.default_rng(8)

# white noise, lightly clustered so a speck is a pixel or two, never a smooth haze
n = rng.normal(0, 1, (S, S))
n = (n + 0.5 * np.roll(n, 1, 0) + 0.5 * np.roll(n, 1, 1)) / 1.6
light = np.clip(n, 0, None)
dark = np.clip(-n, 0, None)
rgba = np.zeros((S, S, 4), np.uint8)
is_light = light > dark
rgba[..., :3] = np.where(is_light[..., None], 255, 20)
rgba[..., 3] = np.clip(np.where(is_light, light, dark) * 34, 0, 72).astype(np.uint8)
Image.fromarray(rgba, "RGBA").save(OUT, lossless=True)
print(OUT, rgba[..., 3].mean().round(1))
