"""The sample roster's faces, from real 8x creators' own videos in the catalog.

For each creator: a square face (found with OpenCV's face detector across a few frames, the largest clear one kept).
Their posts' posters and loops are cut by scripts/feed.py. Nothing is generated or graded. Creators taken off the
landing (Sandhya, @sahilxstyles) are never used, and only creators in good standing are drawn from the catalog: the
sample's idle, dropped and flagged creators are invented and shown by their initials.

    python scripts/roster.py
"""
import os, subprocess
import cv2
import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), "..")
CATALOG = r"C:\Users\rohit\Downloads\Top 200 Videos"
PEOPLE = os.path.join(ROOT, "public", "media", "people")
CASCADE = cv2.CascadeClassifier(os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml"))

# id: clips (the first gives the face); a face is only cut for the ones without one. Where the detector picks the
# wrong face (a guest in the frame), or its square takes in the creator's burned-in caption, the face is placed by hand:
# (time, size, left, top) in the clip's pixels, and which of the creator's clips (the first unless a fifth number says).
ROSTER = {
    "bhavishay": ["161_instagram_Bhavishay_Grover.mp4"],
    "heloisa": ["059_instagram_Heloisa_Yumi_de_Souza_Terui.mp4", "097_tiktok_Heloisa_Yumi_de_Souza_Terui.mp4"],
    "ozlem": ["006_instagram_zlem_Kurnaz.mp4"],
    "manisha": ["034_instagram_Manisha_Bharadwaj.mp4"],
    "sila": ["082_instagram_S_la_Baysal.mp4", "126_tiktok_S_la_Baysal.mp4"],
    "gizem": ["075_instagram_Gizem_G_z_bek.mp4", "129_tiktok_Gizem_G_z_bek.mp4"],
    "kubra": ["083_instagram_K_bra_arslan.mp4"],
    "nicole": ["065_instagram_Nicole_Santos.mp4"],
    "krishna": ["076_instagram_Krishna_Barot.mp4"],
    "shreya": ["172_instagram_Shreya_B.mp4"],
    "aleyna": ["101_instagram_Aleyna_zkan.mp4", "040_instagram_Aleyna_zkan.mp4"],
    # the first seven have faces already; they get more stills
    "kristine": ["009_instagram_Kristine_Mae_Gorgonio.mp4"],
    "aastha": ["005_instagram_Aastha_Bishnoi.mp4"],
    "carla": ["012_tiktok_Carla_Carvalho.mp4", "016_tiktok_Carla_Carvalho.mp4"],
    "sevda": ["087_tiktok_evda_D_zyol.mp4", "019_instagram_evda_D_zyol.mp4"],
    "pooja": ["071_instagram_Pooja_B_Kittur.mp4", "032_instagram_Pooja_B_Kittur.mp4"],
    "mariana": ["089_instagram_Mariana_Tavares_Campos_Fagunde.mp4"],
    "sultan": ["038_instagram_sultan_ayd_n.mp4", "002_instagram_sultan_ayd_n.mp4"],
}

PLACED = {
    "krishna": (24.1, 620, 280, 430),  # the creator, not her guest in front
    "shreya": (11.5, 900, 540, 480),  # a 1440 x 2560 clip
    "gizem": (32.1, 640, 90, 400),
    "nicole": (3.0, 700, 250, 570),
    # clear of the captions across their videos (2026-11-04)
    "aleyna": (4.3, 601, 275, 327, 1),
    "kubra": (1.73, 695, 250, 458),
    "manisha": (1.95, 797, 180, 605),
    "bhavishay": (2.66, 1080, 0, 397),
}


def duration(path):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).decode().strip())


def frame(path, t, w=None):
    vf = ["-vf", f"scale={w}:-2"] if w else []
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-ss", f"{t:.2f}", "-i", path, "-frames:v", "1", *vf, "-f", "image2pipe", "-vcodec", "png", "-"])
    return cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)


def face(path):
    """The largest face across a few frames, as a square crop round it (a little more room above than below)."""
    d = duration(path)
    best = None
    for k in range(1, 8):
        img = frame(path, d * k / 8, 720)
        grey = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        found = CASCADE.detectMultiScale(grey, scaleFactor=1.1, minNeighbors=6, minSize=(90, 90))
        for (x, y, w, h) in found:
            if best is None or w * h > best[0]:
                best = (w * h, img, (x, y, w, h))
    if best is None:
        return None
    _, img, (x, y, w, h) = best
    side = int(w * 2.0)
    cx, cy = x + w / 2, y + h / 2 + h * 0.08
    x0 = int(max(0, min(img.shape[1] - side, cx - side / 2)))
    y0 = int(max(0, min(img.shape[0] - side, cy - side / 2)))
    side = min(side, img.shape[1] - x0, img.shape[0] - y0)
    return cv2.resize(img[y0 : y0 + side, x0 : x0 + side], (160, 160), interpolation=cv2.INTER_AREA)


def main():
    os.makedirs(PEOPLE, exist_ok=True)
    for cid, clips in ROSTER.items():
        paths = [os.path.join(CATALOG, c) for c in clips]
        av = os.path.join(PEOPLE, f"{cid}.webp")
        if not os.path.exists(av) and cid in PLACED:
            t, size, left, top, *clip = PLACED[cid]
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(t), "-i", paths[clip[0] if clip else 0], "-frames:v", "1",
                            "-vf", f"crop={size}:{size}:{left}:{top},scale=160:160", "-c:v", "libwebp", "-quality", "86", av],
                           check=True)
        if not os.path.exists(av):
            crop = face(paths[0])
            if crop is None:
                print(cid, "no face found")
            else:
                cv2.imwrite(av, crop, [cv2.IMWRITE_WEBP_QUALITY, 86])
        print(cid, "ok")


if __name__ == "__main__":
    main()
