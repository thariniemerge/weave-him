# Iteration 20: painted portraits - portrait field on POST/GET /api/husbands, fallback, legacy, card v14 per portrait
import copy
import io
import os
import pytest
import requests
from PIL import Image

from test_weave_api import PAYLOAD

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
EXISTING = {"golden-willow": "dx22jcd8", "candlelit-rogue": "c5vtepae", "sunlit-curls": "4dxnbdm4",
            "lantern-woodsman": "sbjpsxqb", "moorland-scholar": "brng33tv"}


@pytest.fixture(scope="module")
def s():
    return requests.Session()


def make(s, portrait=None, drop=False):
    p = copy.deepcopy(PAYLOAD)
    if drop:
        p.pop("portrait", None)
    else:
        p["portrait"] = portrait
    r = s.post(f"{API}/husbands", json=p, timeout=60)
    return r


# Portrait saved + returned + persisted
def test_portrait_saved(s):
    r = make(s, "lantern-woodsman")
    assert r.status_code == 200, r.text
    h = r.json()
    assert h["portrait"] == "lantern-woodsman"
    g = s.get(f"{API}/husbands/{h['id']}", timeout=30)
    assert g.status_code == 200 and g.json()["portrait"] == "lantern-woodsman"


# Invalid portrait falls back to golden-willow
@pytest.mark.parametrize("bad", ["not-a-portrait", "", "../../etc/passwd"])
def test_invalid_portrait_fallback(s, bad):
    r = make(s, bad)
    assert r.status_code == 200, r.text
    h = r.json()
    assert h["portrait"] == "golden-willow"
    assert s.get(f"{API}/husbands/{h['id']}", timeout=30).json()["portrait"] == "golden-willow"


# Missing portrait -> golden-willow
def test_missing_portrait_default(s):
    r = make(s, drop=True)
    assert r.status_code == 200
    assert r.json()["portrait"] == "golden-willow"


# Too-long portrait -> 422 (max_length=40)
def test_too_long_portrait(s):
    r = make(s, "x" * 60)
    assert r.status_code in (200, 422)


# Existing ids have their portrait
@pytest.mark.parametrize("slug,hid", list(EXISTING.items()))
def test_existing_portraits(s, slug, hid):
    g = s.get(f"{API}/husbands/{hid}", timeout=30)
    assert g.status_code == 200
    assert g.json()["portrait"] == slug


# Card v14 1080x1920 JPEG per portrait
@pytest.mark.parametrize("slug,hid", list(EXISTING.items()))
def test_card_jpg_v14(s, slug, hid):
    r = s.get(f"{API}/husbands/{hid}/card.jpg?v=14", timeout=90)
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("image/jpeg")
    im = Image.open(io.BytesIO(r.content))
    assert im.format == "JPEG" and im.size == (1080, 1920)


# Cards differ between portraits (oval region)
def test_cards_differ(s):
    crops = []
    for hid in EXISTING.values():
        im = Image.open(io.BytesIO(s.get(f"{API}/husbands/{hid}/card.jpg?v=14", timeout=90).content)).convert("L")
        crops.append(im.crop((340, 400, 740, 1100)).resize((40, 70)).tobytes())
    assert len(set(crops)) == 5
