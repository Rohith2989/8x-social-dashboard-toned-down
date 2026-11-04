"""The sample brand's people (the brand's team on the workspace) as faces, not initials (the user, 2026-11-04: "put some
face placeholders for Alex Carter, Jordan Reyes ... so that it looks good"). They are invented people, so generated
faces stand in for them; they are never creators (real 8x creators are only ever their own footage).

    env -u GEMINI_API_KEY python scripts/team.py <workdir> takes [id ...]   # render to <workdir>/dashboard/raw
    python scripts/team.py <workdir> build [id ...]                          # -> public/media/team/<id>.webp

Each is a real-looking team-page headshot from one shoot: the same soft window light, the same pale blue-grey wall,
an 85 mm lens, true skin with its texture, a natural smile. Built square at 256 px, the face centred and lit, so a
round crop at 24 px still shows a face.

<workdir> (kept out of git) holds .env with GEMINI_API_KEY; GEMINI_IMAGE points at the mahoraga skill's gemini_image.py.
"""
import os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageOps

WORK = sys.argv[1]
MODE = sys.argv[2]
M = os.environ.get("GEMINI_IMAGE", "gemini_image.py")
RAW = os.path.join(WORK, "dashboard", "raw")
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "media", "team")

SHOOT = (
    "A real, candid headshot photograph for a company's team page, from one professional shoot: {who}, head and "
    "shoulders, looking at the camera with a natural, relaxed smile. Soft window light from the left, a plain pale "
    "blue-grey wall behind, softly out of focus. Shot on an 85 mm lens at f/2. True-to-life skin with its natural "
    "texture and small imperfections, no retouching gloss, no glamour make-up, natural hair. Square, the face centred, "
    "the top of the head a little below the top edge. A real photographer's portrait of a real person, not a render."
)

# the four people on the brand's workspace (lib/team.ts), each their own person
PEOPLE = {
    "alex": "a woman in her mid-thirties, the company's head of growth, shoulder-length light brown hair, in a navy fine-knit sweater",
    "jordan": "a Latino man in his late twenties, the social lead, short dark curly hair and a neatly trimmed beard, in a light grey overshirt",
    "sam": "a Black man in his early thirties, short cropped hair, in a crisp white oxford shirt with the collar open",
    "nina": "a Nigerian-British woman in her late twenties, long braids tied back, small gold earrings, in a cream silk blouse",
}


def take(pid):
    raw = os.path.join(RAW, f"team-{pid}.png")
    if os.path.exists(raw):
        return f"{pid}: kept"
    r = subprocess.run([sys.executable, M, "--env", os.path.join(WORK, ".env"), "--out", raw,
                        "--prompt", SHOOT.format(who=PEOPLE[pid]), "--aspect", "1:1", "--size", "1K"],
                       capture_output=True, text=True)
    return f"{pid}: {'failed ' + r.stderr.strip()[-300:] if r.returncode else 'ok'}"


# where each face sits in its render (x, y of the face's centre, as fractions), so the crop holds the face
FACE = {"alex": (0.5, 0.42), "jordan": (0.49, 0.41), "sam": (0.5, 0.4), "nina": (0.53, 0.41)}


def build(pid, size=256):
    im = Image.open(os.path.join(RAW, f"team-{pid}.png")).convert("RGB")
    # a square around the face, close enough that a round crop at 24 px still shows a face
    side = int(min(im.size) * 0.62)
    fx, fy = FACE.get(pid, (0.5, 0.42))
    cx, cy = int(im.width * fx), int(im.height * fy)
    box = (cx - side // 2, max(0, cy - side // 2), cx + side // 2, max(0, cy - side // 2) + side)
    im = ImageOps.fit(im.crop(box), (size, size), Image.LANCZOS)
    os.makedirs(OUT, exist_ok=True)
    im.save(os.path.join(OUT, f"{pid}.webp"), quality=86, method=6)
    return f"built {pid}"


if __name__ == "__main__":
    os.makedirs(RAW, exist_ok=True)
    ids = sys.argv[3:] or list(PEOPLE)
    if MODE == "takes":
        with ThreadPoolExecutor(4) as ex:
            for line in ex.map(take, ids):
                print(line, flush=True)
    elif MODE == "build":
        for pid in ids:
            print(build(pid))
