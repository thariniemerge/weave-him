# Iteration 4: server card rendering (card.png / og.jpg / share og:image), edit_token secrecy, vow reweaving limits
import io
import os
import re
import time
import pytest
import requests
from PIL import Image
from pymongo import MongoClient
from dotenv import dotenv_values

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
BENV = dotenv_values("/app/backend/.env")
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
    "threads": [{"label": "Coffee, unasked", "sentence": "you bring me coffee"}],
}


@pytest.fixture(scope="module")
def s():
    return requests.Session()


@pytest.fixture(scope="module")
def mdb():
    c = MongoClient(BENV["MONGO_URL"])
    yield c[BENV["DB_NAME"]]
    c.close()


@pytest.fixture(scope="module")
def created(s):
    t = time.time()
    r = s.post(f"{API}/husbands", json=PAYLOAD, timeout=40)
    print(f"create took {time.time() - t:.1f}s")
    assert r.status_code == 200, r.text
    return r.json()


def vow_rules(v):
    assert v.lower().startswith(("i'll", "i’ll")), v
    assert len(v.split()) <= 18, v
    low = v.lower()
    for b in BANNED:
        assert not re.search(rf"\b{b}\b", low), v


class TestCreateAndSecrecy:
    def test_create_returns_token(self, created):
        assert isinstance(created["edit_token"], str) and len(created["edit_token"]) >= 16
        assert created["reweaves_left"] == 3
        assert "edit_token_hash" not in created and "_id" not in created

    def test_get_hides_token(self, s, created):
        d = s.get(f"{API}/husbands/{created['id']}").json()
        assert "edit_token" not in d and "edit_token_hash" not in d
        assert d["reweaves_left"] == 3 and d["vows"] == created["vows"]

    def test_card_stored_at_creation(self, mdb, created):
        doc = mdb.cards.find_one({"id": created["id"]})
        assert doc is not None and doc.get("source") == "server"


class TestServerCard:
    def test_card_png(self, s, created):
        r = s.get(f"{API}/husbands/{created['id']}/card.png", timeout=30)
        assert r.status_code == 200 and r.headers["content-type"] == "image/png"
        assert Image.open(io.BytesIO(r.content)).size == (1080, 1920)

    def test_og_jpg(self, s, created):
        r = s.get(f"{API}/husbands/{created['id']}/og.jpg", timeout=30)
        assert r.status_code == 200 and r.headers["content-type"] == "image/jpeg"
        im = Image.open(io.BytesIO(r.content))
        assert im.format == "JPEG" and im.size == (720, 1280)

    def test_share_og_image(self, s, created):
        t = s.get(f"{API}/share/{created['id']}", allow_redirects=False).text
        m = re.search(r'og:image" content="([^"]+)"', t)
        assert m and m.group(1).endswith(f"/api/husbands/{created['id']}/og.jpg")
        assert 'og:image:width" content="720"' in t

    def test_card_404_unknown(self, s):
        assert s.get(f"{API}/husbands/nosuchid/card.png").status_code == 404
        assert s.get(f"{API}/husbands/nosuchid/og.jpg").status_code == 404

    def test_on_demand_for_old_husband(self, s, mdb, created):
        mdb.cards.delete_one({"id": created["id"]})
        assert mdb.cards.find_one({"id": created["id"]}) is None
        r = s.get(f"{API}/husbands/{created['id']}/card.png", timeout=30)
        assert r.status_code == 200
        assert Image.open(io.BytesIO(r.content)).size == (1080, 1920)
        assert mdb.cards.find_one({"id": created["id"]})["source"] == "server"


class TestReweave:
    def test_wrong_token_403(self, s, created):
        r = s.post(f"{API}/husbands/{created['id']}/reweave", json={"index": 1, "token": "nope"})
        assert r.status_code == 403

    def test_unknown_id_404(self, s):
        r = s.post(f"{API}/husbands/nosuchid/reweave", json={"index": 1, "token": "x"})
        assert r.status_code == 404

    @pytest.mark.parametrize("idx", [-1, 5])
    def test_bad_index_422(self, s, created, idx):
        r = s.post(f"{API}/husbands/{created['id']}/reweave", json={"index": idx, "token": created["edit_token"]})
        assert r.status_code == 422

    def test_three_reweaves_then_409(self, s, created):
        hid, tok = created["id"], created["edit_token"]
        prev = s.get(f"{API}/husbands/{hid}").json()["vows"]
        for n, idx in enumerate([1, 1, 3], start=1):
            t = time.time()
            r = s.post(f"{API}/husbands/{hid}/reweave", json={"index": idx, "token": tok}, timeout=30)
            print(f"reweave {n} idx={idx} took {time.time() - t:.1f}s -> {r.status_code}")
            assert r.status_code == 200, r.text
            d = r.json()
            assert d["reweaves_left"] == 3 - n
            assert "edit_token_hash" not in d and "edit_token" not in d
            new = d["vows"]
            print("  old:", prev[idx], "\n  new:", new[idx])
            assert new[idx] != prev[idx]
            assert [v for i, v in enumerate(new) if i != idx] == [v for i, v in enumerate(prev) if i != idx]
            vow_rules(new[idx])
            g = s.get(f"{API}/husbands/{hid}").json()
            assert g["vows"] == new and g["reweaves_left"] == 3 - n
            prev = new
        r = s.post(f"{API}/husbands/{hid}/reweave", json={"index": 0, "token": tok}, timeout=30)
        assert r.status_code == 409
        assert r.json()["detail"] == "The basketmaker is out of willow."
        assert s.get(f"{API}/husbands/{hid}").json()["vows"] == prev
