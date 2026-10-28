# Iter3: early vow drafts (/api/vows/draft), create with draft/fast, late upgrade /api/husbands/{id}/vows
import copy
import subprocess
import time
import requests
import pytest
from test_weave_api import API, PAYLOAD


@pytest.fixture(scope="module")
def draft():
    t = time.time()
    r = requests.post(f"{API}/vows/draft", json=PAYLOAD, timeout=30)
    print(f"draft roundtrip {time.time() - t:.2f}s body={r.json()}")
    assert r.status_code == 200
    d = r.json()
    assert "draft" in d and isinstance(d["ms"], int)
    assert d["draft"], "LLM draft failed (None)"
    return d["draft"]


def test_draft_shape(draft):
    assert isinstance(draft, str) and len(draft) == 32


def test_create_with_draft_is_llm_and_fast(draft):
    t = time.time()
    r = requests.post(f"{API}/husbands", json={**PAYLOAD, "draft": draft}, timeout=30)
    dt = time.time() - t
    print(f"create w/ draft {dt:.2f}s")
    assert r.status_code == 200
    h = r.json()
    assert h["vows_source"] == "llm" and len(h["vows"]) == 5
    assert dt < 1.5  # network overhead incl.; server side should be <0.5s
    assert requests.get(f"{API}/husbands/{h['id']}").json()["vows"] == h["vows"]


def test_create_fast_is_template():
    t = time.time()
    r = requests.post(f"{API}/husbands", json={**PAYLOAD, "fast": True}, timeout=30)
    print(f"create fast {time.time() - t:.2f}s")
    assert r.status_code == 200 and r.json()["vows_source"] == "template"


def test_bogus_draft_falls_back_template():
    r = requests.post(f"{API}/husbands", json={**PAYLOAD, "draft": "nope"}, timeout=30)
    assert r.status_code == 200 and r.json()["vows_source"] == "template"


def test_upgrade_flow(draft):
    h = requests.post(f"{API}/husbands", json={**PAYLOAD, "fast": True}, timeout=30).json()
    hid, tok = h["id"], h["edit_token"]
    assert requests.post(f"{API}/husbands/{hid}/vows", json={"token": "bad", "draft": draft}).status_code == 403
    assert requests.post(f"{API}/husbands/{hid}/vows", json={"token": tok, "draft": "missing"}).status_code == 404
    r = requests.post(f"{API}/husbands/{hid}/vows", json={"token": tok, "draft": draft})
    assert r.status_code == 200 and r.json()["vows_source"] == "llm"
    assert "edit_token" not in r.json()
    g = requests.get(f"{API}/husbands/{hid}").json()
    assert g["vows_source"] == "llm" and g["vows"] == r.json()["vows"]
    assert requests.post(f"{API}/husbands/{hid}/vows", json={"token": tok, "draft": draft}).status_code == 409


def test_upgrade_mismatched_draft_404(draft):
    p = copy.deepcopy(PAYLOAD)
    p["feel"] = "Swept off my feet"
    h = requests.post(f"{API}/husbands", json={**p, "fast": True}, timeout=30).json()
    r = requests.post(f"{API}/husbands/{h['id']}/vows", json={"token": h["edit_token"], "draft": draft})
    assert r.status_code == 404


def test_upgrade_unknown_husband_404(draft):
    assert requests.post(f"{API}/husbands/zzzzzzzz/vows", json={"token": "x", "draft": draft}).status_code == 404


def test_timing_log_present():
    out = subprocess.run("tail -n 400 /var/log/supervisor/backend.err.log /var/log/supervisor/backend.out.log 2>/dev/null | grep 'LLM claude-haiku-4-5-20251001 call took' | tail -5",
                         shell=True, capture_output=True, text=True).stdout
    print(out)
    assert "call took" in out
