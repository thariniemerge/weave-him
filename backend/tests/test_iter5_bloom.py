# Iteration 5: undash vows, card.jpg 1080x1920 JPEG, long custom strand ellipsis, share title, favicons, legacy band
import io
import os
import re
import sys
import pytest
import requests
from PIL import Image

sys.path.insert(0, "/app/backend")

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
LONG = "Extraordinarilylongwordthatneverends writes poems on mirrors"

PAYLOAD = {
    "strands": [LONG.lower(), "market", "won", "fixing", "banter-prone, ritual-keeper, steady & sly",
                "remembers the song & the pet", "amused"],
    "keys": {"q1": "custom", "q2": "market", "q3": "won", "q4": "fixing", "q7": "amused"},
    "sliders": {"out": 75, "love": 25, "feel": 50},
    "remembers": ["the song", "the pet"],
    "remember_keys": ["song", "pet"],
    "feel": "Amused",
    "band": ["WON", "WRITES POEMS", "FIXING", "MARKET", "SONG", "AMUSED"],
    "card": {"line1": f"Won · {LONG}", "line2": "Remembers the song",
             "woven": ["won", LONG.lower(), "the song"]},
    "threads": [{"label": LONG, "sentence": f"“{LONG}”"}],
}
LEGACY = {**PAYLOAD, "band": ["PATIENCE · COFFEE", "PANCAKES · SMALL THINGS"]}


@pytest.fixture(scope="module")
def s():
    return requests.Session()


@pytest.fixture(scope="module")
def created(s):
    r = s.post(f"{API}/husbands", json=PAYLOAD, timeout=60)
    assert r.status_code == 200, r.text
    return r.json()


def test_undash_unit():
    from server import undash
    assert "—" not in undash("I'll stay — always") and "–" not in undash("I'll stay – always")
    assert undash("I'll stay—always") == "I'll stay, always"


def test_create_vows_no_dashes(created):
    assert len(created["vows"]) == 5
    for v in created["vows"]:
        assert "—" not in v and "–" not in v, v
    print("source", created["vows_source"], created["vows"])
    with open("/tmp/long_id", "w") as f:
        f.write(created["id"] + " " + created["edit_token"] + " " + created["name"])


def test_reweave_no_dashes(s, created):
    r = s.post(f"{API}/husbands/{created['id']}/reweave", json={"index": 1, "token": created["edit_token"]}, timeout=60)
    assert r.status_code == 200, r.text
    v = r.json()["vows"][1]
    assert "—" not in v and "–" not in v, v


def test_card_jpg(s, created):
    r = s.get(f"{API}/husbands/{created['id']}/card.jpg", timeout=60)
    assert r.status_code == 200
    assert r.headers["content-type"] == "image/jpeg"
    assert len(r.content) < 1_000_000, len(r.content)
    im = Image.open(io.BytesIO(r.content))
    assert im.format == "JPEG" and im.size == (1080, 1920)


def test_clamp_lines_ellipsis():
    import card_render
    import inspect
    sig = inspect.signature(card_render.clamp_lines)
    print("clamp_lines sig", sig)
    src = inspect.getsource(card_render)
    assert "clamp_lines(" in src.split("def clamp_lines")[1] or src.count("clamp_lines(") >= 2


def test_share_title(s, created):
    r = s.get(f"{API}/share/{created['id']}", timeout=30)
    assert r.status_code == 200
    assert f"<title>Meet {created['name']} · Weave Him</title>" in r.text


def test_legacy_band_persists(s):
    r = s.post(f"{API}/husbands", json=LEGACY, timeout=60)
    assert r.status_code == 200, r.text
    g = s.get(f"{API}/husbands/{r.json()['id']}").json()
    assert g["band"] == ["PATIENCE · COFFEE", "PANCAKES · SMALL THINGS"]
    with open("/tmp/legacy_id", "w") as f:
        f.write(g["id"])


@pytest.mark.parametrize("path,ctype", [("/favicon.ico", "image"), ("/favicon.svg", "svg"),
                                        ("/apple-touch-icon.png", "png"), ("/site.webmanifest", "")])
def test_favicons(s, path, ctype):
    r = s.get(f"{BASE_URL}{path}", timeout=20)
    assert r.status_code == 200
    assert "text/html" not in r.headers.get("content-type", ""), r.headers.get("content-type")


def test_index_links(s):
    t = s.get(BASE_URL, timeout=20).text
    for frag in ['href="/favicon.ico"', 'href="/favicon.svg"', 'href="/apple-touch-icon.png"', 'href="/site.webmanifest"', '#9C3D4F', "<title>Weave Him</title>"]:
        assert frag in t, frag
