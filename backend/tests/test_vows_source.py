# Vows source check: LLM vows (raw_decode fix) should usually succeed; template fallback always valid. Sequential POSTs only (LLM key = 1 concurrent).
import os
import time
import requests
from test_weave_api import API, PAYLOAD


def test_stats_200():
    r = requests.get(f"{API}/stats", timeout=15)
    assert r.status_code == 200 and isinstance(r.json()["total"], int)


def test_vows_source_mostly_llm():
    sources = []
    for _ in range(5):
        t = time.time()
        r = requests.post(f"{API}/husbands", json=PAYLOAD, timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert len(d["vows"]) == 5
        sources.append(d["vows_source"])
        print(f"{time.time() - t:.1f}s {d['vows_source']} {d['vows']}")
        time.sleep(1)
    print("sources:", sources)
    assert sources.count("llm") >= 3, sources
