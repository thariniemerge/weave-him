"""Exports the user's husband portraits for the app (resized only) plus the raw-willow sepia weaving state."""
from pathlib import Path
from PIL import Image, ImageOps, ImageStat

SRC = Path("/app/scripts/portraits")
OUT = Path("/app/frontend/public/assets/husbands")
OUT.mkdir(parents=True, exist_ok=True)
SLUGS = ["golden-willow", "candlelit-rogue", "sunlit-curls", "lantern-woodsman", "moorland-scholar"]
W = 750
TARGET = 0.42  # same mean brightness for every sepia figure

for s in SLUGS:
    im = Image.open(SRC / "transparent" / f"{s}.png").convert("RGBA")
    im = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
    im.save(OUT / f"{s}.webp", "WEBP", quality=88, method=6)
    a = im.split()[3]
    g = ImageOps.grayscale(im.convert("RGB"))
    mean = ImageStat.Stat(g, mask=a.point(lambda v: 255 if v > 128 else 0)).mean[0] / 255
    k = TARGET / max(mean, 0.05)
    g = g.point(lambda v: min(255, round(v * k)))
    # warm raw-willow ramp: dark umber to pale straw
    sep = ImageOps.colorize(g, black="#2B1D10", mid="#9A7A4E", white="#F2E2BE")
    sep.putalpha(a)
    sep.save(OUT / f"{s}-weave.webp", "WEBP", quality=86, method=6)
    bg = Image.open(SRC / "with-background" / f"{s}.jpg").convert("RGB")
    bg.resize((W, round(bg.height * W / bg.width)), Image.LANCZOS).save(OUT / f"{s}-bg.jpg", "JPEG", quality=88, optimize=True, progressive=True)
    print(s, round(mean, 3), "->", TARGET)
