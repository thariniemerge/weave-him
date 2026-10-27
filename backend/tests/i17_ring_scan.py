# Iteration 17: count non-ring (dark/brown) pixels in a band just outside the opening ellipse
# usage: python i17_ring_scan.py <zoom.png> ; zoom image = opening box padded 30px (x,y) at DPR 2 (see i17_zoom.py)
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert("RGB")
W, H = im.size
s = 2  # DPR
pad = 30 * s
ow, oh = W - 60 * s, H - 70 * s
cx, cy, rx, ry = pad + ow / 2, pad + oh / 2, ow / 2, oh / 2
regions = {}
bad = 0; tot = 0
for y in range(0, H):
    for x in range(0, W):
        d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
        if 1.015 < d < float(sys.argv[2] if len(sys.argv)>2 else 1.25) and y < pad + oh - 40:  # thin band outside opening, above ribbon zone
            r, g, b = im.getpixel((x, y)); tot += 1
            lum = 0.3 * r + 0.59 * g + 0.11 * b
            if lum < 165:
                bad += 1
                key = ("top" if y < cy - ry * .5 else "bottom" if y > cy + ry * .5 else "mid") + "-" + ("L" if x < cx else "R")
                regions[key] = regions.get(key, 0) + 1
print(sys.argv[1], "dark px outside opening:", bad, "of", tot, f"({100*bad/tot:.1f}%)", regions)
