# Iteration 16: render server card for short + long names and check name shrink/fit in the cartouche
import io
import sys
sys.path.insert(0, "/app/backend")
from PIL import Image
from card_render import render_card, fit, text_width, font

for nm in ["Hollis", "Bartholomew", "Maximilian-Fitzwilliam"]:
    s = fit([nm.upper()], "cg", 64, 30, 2, 300, 0.06)
    w = text_width(nm.upper(), font("cg", s), s * 0.06)
    print(nm, "size", s, "width", round(w, 1))
    png = render_card(nm, "0417", "a · b", "c", ["a squeeze of the hand", "holds me no words", "my childhood pet"], "weavehim.com", "Built with Emergent")
    im = Image.open(io.BytesIO(png)).convert("RGB")
    im.crop((280, 1150, 800, 1420)).save(f"/app/.screenshots/i16_card_name_{nm}.png")
    if nm == "Maximilian-Fitzwilliam":
        im.resize((540, 960)).save("/app/.screenshots/i16_card_longname_full.png")
