# Iteration 16: pixel-scan the Meet cameo screenshot to measure the gap between his shoulders and the opening edge
import math
import sys
from PIL import Image

path, ox, oy, ow, oh = sys.argv[1], *map(float, sys.argv[2:6])
im = Image.open(path).convert("RGB")
cx, cy, rx, ry = ox + ow / 2, oy + oh / 2, ow / 2, oh / 2


def skin(p):
    r, g, b = p
    return r - b > 45 and r > g and r < 235


for frac in [0.55, 0.62, 0.68, 0.74, 0.80, 0.86]:
    y = int(oy + oh * frac)
    if y >= im.height:
        continue
    dy = (y - cy) / ry
    half = rx * math.sqrt(max(0, 1 - dy * dy))
    L, R = int(cx - half) + 2, int(cx + half) - 2
    xs = [x for x in range(L, R) if skin(im.getpixel((x, y)))]
    if xs:
        print(f"y={frac:.2f} opening x[{L},{R}] w={R-L} skin x[{xs[0]},{xs[-1]}] gapL={xs[0]-L} gapR={R-xs[-1]}")
    else:
        print(f"y={frac:.2f} no skin")
