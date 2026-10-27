# Weave Him backend API regression tests: stats, husbands CRUD, card upload, og image, share page
import io
import os
import re
import time
import pytest
import requests
from PIL import Image

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
NAMES = ["Rowan", "Edmund", "Ambrose", "Felix", "Jasper", "Lucian", "Theodore", "Silas", "Augustin", "Percival", "Hollis", "Ellis"]
BANNED = ["beautiful", "money", "rich", "body", "eyes", "face", "kiss", "tall", "handsome"]

PAYLOAD = {
    "strands": ["coffee, unasked", "pancakes, badly", "patience", "remembers small things",
                "banter-prone, ritual-keeper, steady & sly", "remembers Mom's birthday & my worst jokes", "safe harbour"],
    "keys": {"q1": "coffee", "q2": "pancakes", "q3": "rehearse", "q4": "small", "q7": "safe"},
    "sliders": {"out": 75, "love": 25, "feel": 50},
    "remembers": ["Mom's birthday", "my worst jokes"],
    "remember_keys": ["mom", "jokes"],
    "feel": "Safe harbour",
    "band": ["PATIENCE · COFFEE", "PANCAKES · SMALL THINGS", "REMEMBERS MOM'S BIRTHDAY · SAFE HARBOUR"],
    "card": {"line1": "Patience · Coffee, unasked", "line2": "Remembers Mom's birthday",
             "woven": ["patience", "coffee unasked", "Mom's birthday"]},
    "threads": [{"label": "Coffee, unasked", "sentence": "you bring me coffee before I even think to ask"}],
}


@pytest.fixture(scope="module")
def s():
    return requests.Session()


@pytest.fixture(scope="module")
def husband(s):
    t = time.time()
    r = s.post(f"{API}/husbands", json=PAYLOAD, timeout=30)
    print(f"create took {time.time() - t:.1f}s")
    assert r.status_code == 200, r.text
    return r.json()


def png_bytes(w=1080, h=1920):
    b = io.BytesIO()
    Image.new("RGB", (w, h), (246, 239, 228)).save(b, "PNG")
    return b.getvalue()


class TestHealthStats:
    def test_root(self, s):
        r = s.get(f"{API}/")
        assert r.status_code == 200 and "message" in r.json()

    def test_stats_increments(self, s):
        before = s.get(f"{API}/stats").json()["total"]
        assert isinstance(before, int)
        r = s.post(f"{API}/husbands", json=PAYLOAD, timeout=30)
        assert r.status_code == 200
        after = s.get(f"{API}/stats").json()["total"]
        assert after == before + 1


class TestHusbands:
    def test_create_shape(self, husband):
        h = husband
        assert re.fullmatch(r"[a-z2-9]{8}", h["id"])
        assert h["name"] in NAMES
        assert re.fullmatch(r"\d{4}", h["number"])
        assert len(h["vows"]) == 5
        assert h["vows_source"] in ("llm", "template")
        print("vows_source:", h["vows_source"], h["vows"])
        for v in h["vows"]:
            assert v.lower().startswith(("i'll", "i’ll", "i will")), v
            low = v.lower()
            for b in BANNED:
                assert not re.search(rf"\b{b}\b", low), v
        assert "_id" not in h

    def test_name_deterministic(self, s, husband):
        r = s.post(f"{API}/husbands", json=PAYLOAD, timeout=30)
        assert r.json()["name"] == husband["name"]

    def test_get_persisted(self, s, husband):
        r = s.get(f"{API}/husbands/{husband['id']}")
        assert r.status_code == 200
        d = r.json()
        assert d["name"] == husband["name"] and d["vows"] == husband["vows"]
        assert d["strands"] == PAYLOAD["strands"]

    def test_get_404(self, s):
        assert s.get(f"{API}/husbands/nosuchid").status_code == 404

    @pytest.mark.parametrize("n", [6, 8])
    def test_strand_count_validation(self, s, n):
        p = dict(PAYLOAD, strands=PAYLOAD["strands"][:6] + ["x"] * (n - 6))
        assert s.post(f"{API}/husbands", json=p).status_code == 422

    def test_missing_card_validation(self, s):
        p = {k: v for k, v in PAYLOAD.items() if k != "card"}
        assert s.post(f"{API}/husbands", json=p).status_code == 422

    def test_too_many_remembers(self, s):
        p = dict(PAYLOAD, remembers=["a", "b", "c", "d"])
        assert s.post(f"{API}/husbands", json=p).status_code == 422


# TestCard (client upload) retired in iteration 4: cards are server-rendered; see test_server_card_reweave.py


class TestShare:
    def test_share_html(self, s, husband):
        r = s.get(f"{API}/share/{husband['id']}", allow_redirects=False)
        assert r.status_code == 200
        t = r.text
        assert 'property="og:image"' in t and f"/api/husbands/{husband['id']}/og.jpg" in t
        assert f"/h/{husband['id']}" in t and "http-equiv=\"refresh\"" in t
        assert husband["name"] in t
        m = re.search(r'og:image" content="([^"]+)"', t)
        print("og:image =", m.group(1))
        assert m.group(1).startswith("https://"), m.group(1)

    def test_share_404(self, s):
        assert s.get(f"{API}/share/nosuchid").status_code == 404
