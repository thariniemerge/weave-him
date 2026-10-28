# Iteration 7: multi-pick payload (strands/band up to 24), card credit "Built with Emergent", CARD_VERSION=4, source copy checks
import io
import os
import re
import pytest
import requests
from PIL import Image

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
OUT = "/app/test_reports/img"
SRC = "/app/frontend/src"


def payload(n_strands=20, n_band=12):
    strands = [f"TEST strand {i}" for i in range(n_strands)]
    return {
        "strands": strands,
        "keys": {"q1": "coffee,vent,holds", "q2": "pancakes", "q3": "won,squeeze", "q4": "x", "q7": "y"},
        "sliders": {"out": 50, "love": 50, "feel": 80},
        "remembers": ["my coffee order"], "remember_keys": ["coffee"],
        "feel": "Safe & Seen",
        "band": [f"LABEL{i}" for i in range(n_band)],
        "card": {"line1": "Faith in me · Coffee", "line2": "Remembers my coffee order", "woven": ["a", "b", "c"]},
        "threads": [{"label": "Coffee", "sentence": "you bring me coffee"}],
        "site": "weavehim.test", "credit": "Built with Emergent",
    }


@pytest.fixture(scope="module")
def s():
    return requests.Session()


@pytest.fixture(scope="module")
def created(s):
    r = s.post(f"{API}/husbands", json=payload(20, 12), timeout=120)
    assert r.status_code == 200, r.text
    return r.json()


# Backend: multi-pick husband creation
class TestMultiPick:
    def test_create_20_strands(self, created, s):
        assert len(created["strands"]) == 20
        assert len(created["band"]) == 12
        assert len(created["vows"]) == 5
        g = s.get(f"{API}/husbands/{created['id']}", timeout=30).json()
        assert g["strands"] == created["strands"]

    def test_vows_use_you(self, created):
        joined = " ".join(created["vows"]).lower()
        assert re.search(r"\byou(r)?\b", joined), created["vows"]
        assert "—" not in joined

    def test_25_strands_rejected(self, s):
        r = s.post(f"{API}/husbands", json=payload(25, 4), timeout=30)
        assert r.status_code == 422

    def test_25_band_rejected(self, s):
        r = s.post(f"{API}/husbands", json=payload(8, 25), timeout=30)
        assert r.status_code == 422

    def test_card_jpg_credit(self, created, s):
        r = s.get(f"{API}/husbands/{created['id']}/card.jpg", timeout=90)
        assert r.status_code == 200 and r.headers["content-type"] == "image/jpeg"
        im = Image.open(io.BytesIO(r.content))
        assert im.size == (1080, 1920)
        os.makedirs(OUT, exist_ok=True)
        open(f"{OUT}/iter7_card_{created['id']}.jpg", "wb").write(r.content)

    def test_card_existing_long(self, s):
        r = s.get(f"{API}/husbands/a5yxsmhb/card.jpg", timeout=90)
        assert r.status_code == 200
        open(f"{OUT}/iter7_card_a5yxsmhb.jpg", "wb").write(r.content)


# Source checks: credit, version, copy
class TestSource:
    def test_server_credit_and_version(self):
        src = open("/app/backend/server.py").read()
        assert "CARD_VERSION = 4" in src
        assert "Inspired by" not in src

    def test_no_inspired_by_in_frontend(self):
        hits = []
        for root, _, files in os.walk(SRC):
            for f in files:
                p = os.path.join(root, f)
                if "Inspired by Wicker" in open(p, errors="ignore").read():
                    hits.append(p)
        assert not hits, hits

    def test_no_em_dash_in_copy(self):
        for p in ["content.js", "lib/weave.js"]:
            assert "—" not in open(os.path.join(SRC, p)).read(), p

    @pytest.mark.parametrize("phrase", [
        "When I've had a *terrible* day, he…", "When I'm *nervous* before something big, he…",
        "Commission my husband", "My commission is ready", "Is he already in my life?",
        "The strand he gave me", "Sign with my name",
    ])
    def test_first_person_copy(self, phrase):
        assert phrase in open(os.path.join(SRC, "content.js")).read()


# Disclaimer sentence removed app-wide (iteration 2)
def test_no_fan_disclaimer_anywhere():
    import re
    hits = []
    for root, _, files in os.walk(SRC):
        for f in files:
            if f.endswith((".js", ".jsx")):
                fp = os.path.join(root, f)
                if re.search(r"fan-made|not affiliated|makers of Wicker|fan-disclaimer", open(fp, errors="ignore").read(), re.I):
                    hits.append(fp)
    assert not hits, hits
