# Iteration 19: goal / interests / must-haves on POST+GET /api/husbands, must-have vow, legacy husbands, card v12
import copy
import io
import os
import pytest
import requests
from PIL import Image

from test_weave_api import PAYLOAD

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"

MUSTS = {
    "calm": {"label": "Handles a fight calmly", "vow": "When we fight, I'll stay and talk it through.", "words": ["fight", "argue", "talk it through", "calm"]},
    "time": {"label": "Makes time for me", "vow": "I'll always make time for you, and I'll guard it.", "words": ["time for you", "make time", "make the time"]},
    "family": {"label": "Gets along with my family", "vow": "I'll win over your family, one Sunday lunch at a time.", "words": ["family", "your mom", "your mother"]},
    "available": {"label": "Emotionally available", "vow": "I'll tell you what I'm feeling, even the clumsy parts.", "words": ["feel", "heart", "open"]},
    "space": {"label": "Respects my space", "vow": "I'll give you room to breathe, and I'll still be here.", "words": ["space", "room to breathe", "room"]},
    "wants": {"label": "Actually wants a relationship", "vow": "I'll choose us on purpose, every single day.", "words": ["choose us", "relationship", "together", "stay"]},
}


def payload(musts, goal="something serious", interests=("Books", "Coffee")):
    p = copy.deepcopy(PAYLOAD)
    p.update(goal=goal, interests=list(interests), musts=[MUSTS[m] for m in musts])
    return p


@pytest.fixture(scope="module")
def s():
    return requests.Session()


@pytest.fixture(scope="module")
def calm_h(s):
    r = s.post(f"{API}/husbands", json=payload(["calm"]), timeout=60)
    assert r.status_code == 200, r.text
    return r.json()


class TestMusts:
    def test_create_returns_new_fields(self, calm_h):
        assert calm_h["goal"] == "something serious"
        assert calm_h["interests"] == ["Books", "Coffee"]
        assert calm_h["musts"][0]["label"] == "Handles a fight calmly"
        assert calm_h["musts"][0]["vow"] == MUSTS["calm"]["vow"]
        print("vows_source", calm_h["vows_source"], calm_h["vows"])

    def test_calm_vow_present(self, calm_h):
        assert len(calm_h["vows"]) == 5
        assert MUSTS["calm"]["vow"] in calm_h["vows"]

    def test_get_persists_musts(self, s, calm_h):
        r = s.get(f"{API}/husbands/{calm_h['id']}")
        assert r.status_code == 200
        d = r.json()
        assert d["musts"] == calm_h["musts"]
        assert d["goal"] == "something serious"
        assert d["interests"] == ["Books", "Coffee"]
        assert "_id" not in d

    @pytest.mark.parametrize("m", ["time", "family", "available", "space", "wants"])
    def test_each_must_vow_kept(self, s, m):
        r = s.post(f"{API}/husbands", json=payload([m]), timeout=60)
        assert r.status_code == 200, r.text
        vows = r.json()["vows"]
        print(m, vows)
        # Strict: the must-have's own vow (or its key words) is actually in the vows
        assert MUSTS[m]["vow"] in vows, f"{m} vow missing; vows={vows}"

    def test_custom_must(self, s):
        p = payload([])
        p["musts"] = [{"label": "Loves dogs", "vow": "I'll keep this promise above all: loves dogs.", "words": ["loves dogs"]}]
        r = s.post(f"{API}/husbands", json=p, timeout=60)
        assert r.status_code == 200, r.text
        assert "I'll keep this promise above all: loves dogs." in r.json()["vows"]

    def test_legacy_no_musts(self, s):
        r = s.post(f"{API}/husbands", json=copy.deepcopy(PAYLOAD), timeout=60)
        assert r.status_code == 200
        d = s.get(f"{API}/husbands/{r.json()['id']}").json()
        assert d["musts"] == [] and d["goal"] == "" and d["interests"] == []

    def test_too_many_musts_422(self, s):
        p = payload([])
        p["musts"] = [MUSTS["calm"]] * 7
        assert s.post(f"{API}/husbands", json=p, timeout=30).status_code == 422

    def test_card_v12(self, s, calm_h):
        r = s.get(f"{API}/husbands/{calm_h['id']}/card.jpg?v=12", timeout=60)
        assert r.status_code == 200
        assert "jpeg" in r.headers.get("content-type", "")
        img = Image.open(io.BytesIO(r.content))
        assert img.size == (1080, 1920)
        img.save("/tmp/card_v12.jpg")
