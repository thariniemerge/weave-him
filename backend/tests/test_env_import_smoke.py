# Environment smoke/regression tests for the imported Weave Him app (stats, husbands CRUD, reweave, card exports, share page, SPA deep links)
import os
import re
import pytest
import requests

BASE_URL = open("/app/frontend/.env").read().split("REACT_APP_BACKEND_URL=")[1].split()[0].rstrip("/")
HOST = re.sub(r"^https?://", "", BASE_URL)

PAYLOAD = {
    "portrait": "",
    "strands": ["TEST_ makes coffee", "remembers jokes", "laughs easily", "saves the last bite",
                "stays calm", "loves books", "brings pancakes"],
    "keys": {"q1": "coffee", "q2": "pancakes", "q3": "laugh", "q4": "lastbite", "q7": "safe"},
    "sliders": {"out": 60, "love": 40, "feel": 50},
    "remembers": ["your jokes"], "remember_keys": ["jokes"],
    "feel": "safe", "band": ["coffee", "jokes", "calm"],
    "card": {"line1": "He makes coffee", "line2": "and stays", "woven": ["coffee", "jokes", "calm"]},
    "threads": [{"label": "coffee", "sentence": "He makes your coffee."}],
    "goal": "serious", "interests": ["books"],
    "musts": [{"label": "Calm in a fight", "vow": "When we fight, I'll stay and talk it through.", "words": ["fight", "talk"]}],
}


@pytest.fixture(scope="module")
def s():
    return requests.Session()


@pytest.fixture(scope="module")
def husband(s):
    p = dict(PAYLOAD)
    p.pop("portrait")
    r = s.post(f"{BASE_URL}/api/husbands", json=p, timeout=40)
    assert r.status_code == 200, r.text
    return r.json()


# Health / stats
def test_root(s):
    r = s.get(f"{BASE_URL}/api/")
    assert r.status_code == 200 and "Weavers" in r.json()["message"]


def test_stats(s):
    r = s.get(f"{BASE_URL}/api/stats", params={"since": "2026-01-01T00:00:00Z"})
    assert r.status_code == 200
    d = r.json()
    assert isinstance(d["total"], int) and isinstance(d["today"], int)


def test_stats_bad_since(s):
    assert s.get(f"{BASE_URL}/api/stats", params={"since": "nope"}).status_code == 400


# Create + GET persistence
def test_create_husband(husband):
    assert len(husband["id"]) == 8 and husband["edit_token"]
    assert len(husband["vows"]) == 5
    assert husband["vows_source"] in ("llm", "template")
    print("vows_source:", husband["vows_source"], husband["vows"])


def test_get_husband(s, husband):
    r = s.get(f"{BASE_URL}/api/husbands/{husband['id']}")
    assert r.status_code == 200
    d = r.json()
    assert d["name"] == husband["name"] and d["vows"] == husband["vows"]
    assert "edit_token" not in d and "_id" not in d


def test_get_missing(s):
    assert s.get(f"{BASE_URL}/api/husbands/zzzzzzzz").status_code == 404


def test_create_invalid(s):
    assert s.post(f"{BASE_URL}/api/husbands", json={"strands": ["a"], "feel": "x"}).status_code == 422


# Reweave
def test_reweave_bad_token(s, husband):
    r = s.post(f"{BASE_URL}/api/husbands/{husband['id']}/reweave", json={"index": 0, "token": "bad"})
    assert r.status_code == 403


def test_reweave_ok(s, husband):
    r = s.post(f"{BASE_URL}/api/husbands/{husband['id']}/reweave", json={"index": 1, "token": husband["edit_token"]}, timeout=30)
    assert r.status_code == 200
    d = r.json()
    assert d["reweaves"] == 1 and d["reweaves_left"] == 2
    g = s.get(f"{BASE_URL}/api/husbands/{husband['id']}").json()
    assert g["vows"][1] == d["vows"][1]


# Card exports
@pytest.mark.parametrize("ext,ctype,magic", [("card.png", "image/png", b"\x89PNG"), ("card.jpg", "image/jpeg", b"\xff\xd8"), ("og.jpg", "image/jpeg", b"\xff\xd8")])
def test_card_exports(s, husband, ext, ctype, magic):
    r = s.get(f"{BASE_URL}/api/husbands/{husband['id']}/{ext}", timeout=40)
    assert r.status_code == 200
    assert r.headers["content-type"].startswith(ctype)
    assert r.content[:len(magic)] == magic and len(r.content) > 10000


def test_card_missing(s):
    assert s.get(f"{BASE_URL}/api/husbands/zzzzzzzz/card.png").status_code == 404


# Share page uses preview host for og:image
def test_share_page(s, husband):
    r = s.get(f"{BASE_URL}/api/share/{husband['id']}", allow_redirects=False)
    assert r.status_code == 200
    m = re.search(r'og:image" content="([^"]+)"', r.text)
    assert m, r.text[:300]
    assert m.group(1).startswith(f"https://{HOST}/api/husbands/{husband['id']}/og.jpg"), m.group(1)
    img = s.get(m.group(1))
    assert img.status_code == 200 and img.content[:2] == b"\xff\xd8"


# SPA deep links serve index.html
@pytest.mark.parametrize("path", ["/", "/bands", "/strand/1", "/weaving", "/meet/abc", "/h/abc", "/card/abc"])
def test_spa_deeplinks(s, path):
    r = s.get(f"{BASE_URL}{path}")
    assert r.status_code == 200 and '<div id="root"' in r.text
