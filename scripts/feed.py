"""The feed's media: a poster for every post of the real creators, and a short loop for their best ones.

Each real creator on the roster gets as many stills as they have posts (less the one top post that already has its own
loop and poster in media/posts), cut from their own videos in the catalog (Downloads/Top 200 Videos): their other
clips first, one each, then further moments of the same clips. The first still from each of their other clips also
gets a four-second loop that starts on that very frame, so the poster never jumps when it plays. The posts are shown
as they were posted: no grade, no grain, nothing over them. Creators taken off the landing (Sandhya, @sahilxstyles)
are not on the roster and never used; the invented creators have no media at all.

Writes public/media/feed/<creator>-<k>.webp (and .mp4 for the loops) and public/media/feed/manifest.json, which the
post generator (lib/post-gen.ts) reads: the k-th still goes to the creator's k-th most viewed post.

    python scripts/feed.py
"""
import json, os, subprocess
from io import BytesIO
from PIL import Image, ImageStat

ROOT = os.path.join(os.path.dirname(__file__), "..")
CATALOG = r"C:\Users\rohit\Downloads\Top 200 Videos"
OUT = os.path.join(ROOT, "public", "media", "feed")
W, H = 360, 640
LOOP = 4

# creator: (posts on the roster, the clip their top post already uses, or None)
CREATORS = {
    "aastha": (15, "005_instagram_Aastha_Bishnoi.mp4"),
    "carla": (16, "012_tiktok_Carla_Carvalho.mp4"),
    "sevda": (17, "087_tiktok_evda_D_zyol.mp4"),
    "pooja": (14, "071_instagram_Pooja_B_Kittur.mp4"),
    "mariana": (14, "089_instagram_Mariana_Tavares_Campos_Fagunde.mp4"),
    "sultan": (14, "038_instagram_sultan_ayd_n.mp4"),
    "heloisa": (16, None),
    "kristine": (14, None),
    "sila": (15, None),
    "manisha": (13, None),
    "gizem": (14, None),
    "bhavishay": (13, None),
    "ozlem": (13, None),
    "kubra": (12, None),
    "nicole": (12, None),
    "krishna": (4, None),
    "shreya": (3, None),
    "aleyna": (2, None),
}

# how each creator's clips are named in the catalog
NAMES = {
    "aastha": "Aastha_Bishnoi", "carla": "Carla_Carvalho", "sevda": "evda_D_zyol", "pooja": "Pooja_B_Kittur",
    "mariana": "Mariana_Tavares", "sultan": "sultan_ayd_n", "heloisa": "Heloisa_Yumi", "kristine": "Kristine_Mae",
    "sila": "S_la_Baysal", "manisha": "Manisha_Bharadwaj", "gizem": "Gizem_G_z_bek", "bhavishay": "Bhavishay_Grover",
    "ozlem": "zlem_Kurnaz", "kubra": "K_bra_arslan", "nicole": "Nicole_Santos", "krishna": "Krishna_Barot",
    "shreya": "Shreya_B", "aleyna": "Aleyna_zkan",
}

# where in a clip a still is taken, by how many times the clip has been used already
MOMENTS = [0.14, 0.46, 0.74, 0.3, 0.6, 0.88, 0.22, 0.52, 0.8, 0.38, 0.66, 0.94]

VF = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}"


def duration(path):
    # the picture's own length: some clips carry sound past their last frame
    out = subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=duration", "-of", "csv=p=0", path])
    text = out.decode().strip().splitlines()[0].split(",")[0] if out.strip() else ""
    if not text or text == "N/A":
        out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path])
        text = out.decode().strip().split(",")[0]
    return float(text) - 0.25


def grab(path, t):
    # a moment with no frame (past the picture's end) steps back until it finds one
    for at in (t, t * 0.7, t * 0.4, 0.5):
        done = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{at:.2f}", "-i", path, "-frames:v", "1", "-vf", VF, "-f", "image2pipe", "-vcodec", "png", "-"], capture_output=True)
        if done.returncode == 0 and done.stdout:
            return Image.open(BytesIO(done.stdout)).convert("RGB")
    raise RuntimeError(f"no frame in {path}")


def has_picture(path):
    # some catalog files are a photo post's sound alone
    out = subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=codec_type", "-of", "csv=p=0", path])
    return b"video" in out


def usable(img):
    # not a black or white flash between shots
    lum = ImageStat.Stat(img.convert("L")).mean[0]
    return 28 < lum < 232


def main():
    os.makedirs(OUT, exist_ok=True)
    clips = sorted(os.listdir(CATALOG))
    manifest = {}
    for cid, (posts, pinned) in CREATORS.items():
        own = [c for c in clips if NAMES[cid] in c and has_picture(os.path.join(CATALOG, c))]
        others = [c for c in own if c != pinned]
        sources = others + ([pinned] if pinned else [])
        need = posts - (1 if pinned else 0)
        used = {c: 0 for c in sources}
        loops = []
        for k in range(1, need + 1):
            clip = sources[(k - 1) % len(sources)]
            src = os.path.join(CATALOG, clip)
            d = duration(src)
            r = used[clip]
            used[clip] += 1
            # a moment that is not a flash; loops need four seconds after it
            span = max(0.5, d - (LOOP + 0.3))
            t = min(span, d * MOMENTS[r % len(MOMENTS)])
            img = grab(src, t)
            tries = 0
            while not usable(img) and tries < 6:
                t = (t + d * 0.07) % span
                img = grab(src, t)
                tries += 1
            img.save(os.path.join(OUT, f"{cid}-{k}.webp"), "WEBP", quality=80, method=6)
            if r == 0 and clip != pinned:
                subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{t:.2f}", "-t", str(LOOP), "-i", src, "-vf", f"{VF},fps=30", "-an",
                                "-c:v", "libx264", "-preset", "slow", "-crf", "28", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                                os.path.join(OUT, f"{cid}-{k}.mp4")], check=True)
                loops.append(k)
        manifest[cid] = {"stills": need, "loops": loops}
        print(cid, "stills", need, "loops", loops, "from", len(sources), "clips")
    with open(os.path.join(OUT, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=1)
    print("ok")


if __name__ == "__main__":
    main()
