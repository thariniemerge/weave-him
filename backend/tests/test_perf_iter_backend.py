# Mobile-perf iteration backend regression: stats, create husband (vows/llm), card.png/og.jpg, share og:image, static frames
import os
import re
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
SLUGS = ["golden-willow", "candlelit-rogue", "sunlit-curls", "lantern-woodsman", "moorland-scholar"]
EXPR = ["neutral", "blink_half", "blink", "wink", "blush", "heart_eyes", "kiss", "shy"]

PAYLOAD = {
    "strands": ["coffee, unasked", "pancakes, badly", "patience", "remembers small things",
                "banter-prone, steady & sly", "remembers Mom's birthday", "safe harbour"],
    "keys": {"q1": "coffee", "q2": "pancakes"},
    "sliders": {"out": 75, "love": 25, "feel": 50},
    "remembers": ["Mom's birthday"], "remember_keys": ["mom"], "feel": "Safe harbour",
    "band": ["PATIENCE · COFFEE", "PANCAKES · SMALL THINGS", "SAFE HARBOUR"],
    "card": {"line1": "Patience · Coffee, unasked", "line2": "Remembers Mom's birthday", "woven": ["patience", "coffee unasked", "Mom's birthday"]},
    "threads": [], "portrait": "golden-willow",
}


@pytest.fixture(scope="module")
def s():
    return requests.Session()


@pytest.fixture(scope="module")
def husband(s):
    r = s.post(f"{API}/husbands", json=PAYLOAD, timeout=60)
    assert r.status_code == 200, r.text
    return r.json()


def test_stats(s):
    r = s.get(f"{API}/stats")
    assert r.status_code == 200
    d = r.json()
    assert isinstance(d["total"], int) and isinstance(d["today"], int)


def test_create_returns_vows_llm(husband):
    assert isinstance(husband["vows"], list) and len(husband["vows"]) >= 3
    assert all(isinstance(v, str) and v for v in husband["vows"])
    print("vows_source:", husband["vows_source"])
    assert husband["vows_source"] == "llm"
    assert husband["portrait"] == "golden-willow" and husband["edit_token"]


def test_get_persisted(s, husband):
    r = s.get(f"{API}/husbands/{husband['id']}")
    assert r.status_code == 200 and r.json()["vows"] == husband["vows"]


def test_card_png(s, husband):
    r = s.get(f"{API}/husbands/{husband['id']}/card.png", timeout=60)
    assert r.status_code == 200 and r.headers["content-type"] == "image/png" and r.content[:4] == b"\x89PNG"


def test_og_jpg(s, husband):
    r = s.get(f"{API}/husbands/{husband['id']}/og.jpg", timeout=60)
    assert r.status_code == 200 and r.headers["content-type"] == "image/jpeg" and r.content[:2] == b"\xff\xd8"


def test_existing_husband_cards(s):
    for p in ["card.png", "og.jpg"]:
        assert s.get(f"{API}/husbands/4qnv4pay/{p}", timeout=60).status_code == 200


def test_share_og_image_host(s, husband):
    r = s.get(f"{API}/share/{husband['id']}", allow_redirects=False)
    assert r.status_code == 200
    m = re.search(r'og:image" content="([^"]+)"', r.text)
    assert m, r.text[:300]
    host = BASE_URL.split("//")[1]
    assert host in m.group(1) and f"/api/husbands/{husband['id']}/og.jpg" in m.group(1)


def test_share_404(s):
    assert s.get(f"{API}/share/zzzzzzzz").status_code == 404


def test_reweave(s, husband):
    r = s.post(f"{API}/husbands/{husband['id']}/reweave", json={"index": 0, "token": husband["edit_token"]}, timeout=60)
    assert r.status_code == 200 and r.json()["vows"][0] != husband["vows"][0]


@pytest.mark.parametrize("slug", SLUGS)
def test_phone_assets_served(s, slug):
    for e in EXPR:
        for path in (f"/assets/husbands/{slug}/m/{e}.webp?v=8", f"/assets/husbands/{slug}/{e}.webp?v=8"):
            r = s.get(BASE_URL + path)
            assert r.status_code == 200 and "image" in r.headers.get("content-type", ""), path
    for k in ("-bg-m.webp", "-weave-m.webp", "-bg.jpg", "-weave.webp"):
        r = s.get(f"{BASE_URL}/assets/husbands/{slug}{k}?v=8")
        assert r.status_code == 200 and "image" in r.headers.get("content-type", ""), k
