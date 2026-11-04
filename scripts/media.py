"""Placeholder media for the reference build: the top posts' videos and posters, and the creators' faces.

Every post is a real 8x creator's own video from the catalog (Downloads/Top 200 Videos), cut to a short loop, as it
was posted: no grade, no grain, nothing over it. The faces are the landing's tour avatars (real creators only: its generated "everyday" people never stand in for a
creator), plus one cut here for Pooja.
Creators taken off the landing (Sandhya, @sahilxstyles) are never used.

    python scripts/media.py
"""
import os, shutil, subprocess

ROOT = os.path.join(os.path.dirname(__file__), "..")
CATALOG = r"C:\Users\rohit\Downloads\Top 200 Videos"
LANDING = os.path.join(ROOT, "..", "8x-social-landing", "public", "tour")
POSTS = os.path.join(ROOT, "public", "media", "posts")
PEOPLE = os.path.join(ROOT, "public", "media", "people")

# id: (catalog clip, start s) : six seconds from where the creator is on camera
CLIPS = {
    "aastha": ("005_instagram_Aastha_Bishnoi.mp4", 0.3),
    "carla": ("012_tiktok_Carla_Carvalho.mp4", 0.3),
    "sevda": ("087_tiktok_evda_D_zyol.mp4", 0.3),
    "pooja": ("071_instagram_Pooja_B_Kittur.mp4", 0.3),
    "mariana": ("089_instagram_Mariana_Tavares_Campos_Fagunde.mp4", 0.3),
    "sultan": ("038_instagram_sultan_ayd_n.mp4", 0.3),
}
SECONDS = 6
W, H = 480, 854


def run(*args):
    subprocess.run(args, check=True, capture_output=True)


def main():
    os.makedirs(POSTS, exist_ok=True)
    os.makedirs(PEOPLE, exist_ok=True)
    for cid, (clip, start) in CLIPS.items():
        src = os.path.join(CATALOG, clip)
        vf = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps=30"
        run("ffmpeg", "-y", "-v", "error", "-ss", str(start), "-t", str(SECONDS), "-i", src, "-vf", vf, "-an",
            "-c:v", "libx264", "-preset", "slow", "-crf", "27", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
            os.path.join(POSTS, f"{cid}.mp4"))
        # the poster is the loop's own first frame, so nothing jumps when it starts playing
        run("ffmpeg", "-y", "-v", "error", "-ss", str(start), "-i", src, "-frames:v", "1", "-vf", vf,
            "-c:v", "libwebp", "-quality", "82", os.path.join(POSTS, f"{cid}.webp"))
        print("post", cid)
    for cid in ("aastha", "carla", "sevda", "kristine", "mariana", "sultan"):
        shutil.copy(os.path.join(LANDING, f"av-{cid}.webp"), os.path.join(PEOPLE, f"{cid}.webp"))
    # Pooja's face, from her clip's first second (square round her face, as the tour's avatars are)
    run("ffmpeg", "-y", "-v", "error", "-ss", "1.8", "-i", os.path.join(CATALOG, CLIPS["pooja"][0]), "-frames:v", "1",
        "-vf", "crop=600:600:250:520,scale=160:160", "-c:v", "libwebp", "-quality", "86", os.path.join(PEOPLE, "pooja.webp"))
    print("people ok")


if __name__ == "__main__":
    main()
