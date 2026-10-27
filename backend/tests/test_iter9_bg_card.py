# Iteration 9: POST /api/husbands returns without waiting for card render (_bg_card), band order kept, card persisted in background
import os
import time
import pytest
import requests
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv("/app/backend/.env")
BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"


def payload():
    return {
        "strands": ["TEST believes in me", "TEST brings coffee", "TEST makes pancakes", "TEST holds my hand",
                    "TEST calm, gentle", "remembers my coffee order", "TEST safe harbour"],
        "keys": {"q1": "coffee", "q2": "pancakes", "q3": "won", "q4": "holds", "q7": "harbour"},
        "sliders": {"out": 50, "love": 50, "feel": 50},
        "remembers": ["my coffee order"], "remember_keys": ["coffee"],
        "feel": "Safe harbour",
        "band": ["SAFE HAVEN", "COFFEE", "FAITH IN ME", "PANCAKES"],
        "card": {"line1": "Faith in me · Coffee", "line2": "Remembers my coffee order", "woven": ["a", "b", "c"]},
        "threads": [{"label": "Coffee", "sentence": "you bring me coffee"}],
        "site": "weavehim.test", "credit": "Built with Emergent",
    }


@pytest.fixture(scope="module")
def created():
    t0 = time.time()
    r = requests.post(f"{API}/husbands", json=payload(), timeout=60)
    dt = time.time() - t0
    assert r.status_code == 200, r.text
    return r.json(), dt


@pytest.fixture(scope="module")
def db():
    return MongoClient(os.environ["MONGO_URL"])[os.environ["DB_NAME"]]


class TestBgCard:
    def test_post_fast(self, created):
        h, dt = created
        print(f"POST took {dt:.2f}s source={h.get('vows_source')}")
        assert dt < 11, dt
        assert len(h["vows"]) == 5 and all(isinstance(v, str) and v for v in h["vows"])
        assert h["edit_token"]

    def test_band_order_kept(self, created):
        h, _ = created
        g = requests.get(f"{API}/husbands/{h['id']}", timeout=30).json()
        assert g["band"][:3] == ["SAFE HAVEN", "COFFEE", "FAITH IN ME"]
        assert "_id" not in g

    def test_card_rendered_in_background(self, created, db):
        h, _ = created
        doc = None
        for _ in range(20):
            doc = db.cards.find_one({"id": h["id"]}, {"_id": 0, "id": 1, "source": 1})
            if doc:
                break
            time.sleep(0.5)
        assert doc and doc["source"] == "server", "background card not stored within 10s"

    def test_card_jpg(self, created):
        h, _ = created
        r = requests.get(f"{API}/husbands/{h['id']}/card.jpg", timeout=30)
        assert r.status_code == 200
        assert r.headers["content-type"].startswith("image/jpeg")
        assert len(r.content) > 20000

    def test_og_jpg(self, created):
        h, _ = created
        r = requests.get(f"{API}/husbands/{h['id']}/og.jpg", timeout=30)
        assert r.status_code == 200 and r.content[:2] == b"\xff\xd8"
