# Iteration 12: Willow & Mist retheme - server share card (CARD_VERSION=5) + core API regression
import io
import os
import pytest
import requests
from PIL import Image

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
HID = "a5yxsmhb"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


# Card endpoint: size + dark green background
class TestCard:
    def test_card_jpg(self, s):
        r = s.get(f"{API}/husbands/{HID}/card.jpg", timeout=90)
        assert r.status_code == 200
        assert r.headers["content-type"].startswith("image/jpeg")
        im = Image.open(io.BytesIO(r.content)).convert("RGB")
        assert im.size == (1080, 1920)
        px = im.getpixel((40, 960))
        print("pixel (40,960):", px)
        r_, g, b = px
        assert max(px) < 90, f"not dark: {px}"
        assert g >= r_, f"red dominates (umber?): {px}"

    def test_card_png(self, s):
        r = s.get(f"{API}/husbands/{HID}/card.png", timeout=90)
        assert r.status_code == 200
        im = Image.open(io.BytesIO(r.content))
        assert im.size == (1080, 1920)

    def test_og(self, s):
        r = s.get(f"{API}/husbands/{HID}/og.jpg", timeout=90)
        assert r.status_code == 200
        assert r.headers["content-type"].startswith("image/")


# Core API regression
class TestCore:
    def test_root_and_stats(self, s):
        assert s.get(f"{API}/").status_code == 200
        r = s.get(f"{API}/stats")
        assert r.status_code == 200 and isinstance(r.json().get("total"), int)

    def test_get_husband(self, s):
        r = s.get(f"{API}/husbands/{HID}")
        assert r.status_code == 200
        d = r.json()
        assert d["id"] == HID and "_id" not in d and d.get("name")

    def test_share_html(self, s):
        r = s.get(f"{API}/share/{HID}")
        assert r.status_code == 200 and "og:image" in r.text

    def test_404(self, s):
        assert s.get(f"{API}/husbands/zzzzzzzz").status_code == 404
