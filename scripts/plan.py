"""The content plan's references: for every campaign post a script points at as its reference, the video as a short
muted clip, its first frame as the poster, and three frames for the script's beats (how it opens, the middle, how it
closes), cut from the post's own video in the catalog (Downloads/Top 200 Videos).

A reference is one of the campaign's own posts, as an account manager points the next plan at what worked. Which
catalog clip a post's media came from follows scripts/feed.py: a top post is its creator's pinned clip, a feed post
`<creator>-<k>` is their k-th source. The posts are shown as they were posted: no grade, no grain, nothing over them.

Writes public/media/plan/<key>.mp4, <key>.webp and <key>-open.webp, <key>-middle.webp, <key>-close.webp, where the key
is the post's media name (`pooja` for a top post, `nicole-1` for a feed post). lib/plan-data.ts names the same keys.

    python scripts/plan.py
"""
import os, subprocess
import feed

OUT = os.path.join(feed.ROOT, "public", "media", "plan")
CLIP = 16  # seconds of the reference the player loops
BEATS = {"open": 0.05, "middle": 0.5, "close": 0.93}

TOP = ["pooja", "carla", "sultan", "mariana", "aastha", "sevda"]
FEED = ["nicole-1", "heloisa-10", "bhavishay-1", "manisha-4", "heloisa-5", "sevda-7", "heloisa-1", "aleyna-1", "carla-1"]


def source(key, clips):
    if key in TOP:
        return feed.CREATORS[key][1]
    cid, k = key.rsplit("-", 1)
    posts, pinned = feed.CREATORS[cid]
    own = [c for c in clips if feed.NAMES[cid] in c and feed.has_picture(os.path.join(feed.CATALOG, c))]
    others = [c for c in own if c != pinned]
    sources = others + ([pinned] if pinned else [])
    return sources[(int(k) - 1) % len(sources)]


def still(src, t, d, path):
    # a moment that is not a flash between shots, nudged along until it finds one
    img = feed.grab(src, t)
    tries = 0
    while not feed.usable(img) and tries < 6:
        t = min(d - 0.1, t + d * 0.04)
        img = feed.grab(src, t)
        tries += 1
    img.save(path, "WEBP", quality=80, method=6)


def main():
    os.makedirs(OUT, exist_ok=True)
    clips = sorted(os.listdir(feed.CATALOG))
    for key in TOP + FEED:
        src = os.path.join(feed.CATALOG, source(key, clips))
        d = feed.duration(src)
        still(src, 0.3, d, os.path.join(OUT, f"{key}.webp"))
        for beat, at in BEATS.items():
            still(src, max(0.3, d * at), d, os.path.join(OUT, f"{key}-{beat}.webp"))
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", "0.3", "-t", str(min(CLIP, d - 0.3)), "-i", src, "-vf", f"{feed.VF},fps=30", "-an",
                        "-c:v", "libx264", "-preset", "slow", "-crf", "30", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                        os.path.join(OUT, f"{key}.mp4")], check=True)
        print(key, os.path.basename(src), f"{d:.1f}s")
    print("ok")


if __name__ == "__main__":
    main()
