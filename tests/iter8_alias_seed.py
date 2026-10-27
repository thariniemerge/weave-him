# Seeds TEST_ husbands with legacy band data to check BandText aliases / third-line selection
import os, requests, json
BASE = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
base = {"strands": ["TEST_alias strand", "coffee, unasked", "laughs", "small things", "pancakes", "calm", "remembers my childhood pet", "safe harbour"], "keys": {}, "sliders": {}, "remembers": ["my childhood pet"],
        "remember_keys": ["pet"], "feel": "Safe harbour",
        "card": {"line1": "A · B", "line2": "Remembers x", "woven": ["a", "b", "c"]}}
out = {}
cases = {
    # legacy: 4 labels then old SAFE HARBOUR -> must show SAFE HAVEN
    "alias": ["COFFEE", "LAUGHS", "SMALL THINGS", "PANCAKES", "SAFE HARBOUR", "TRULY SEEN"],
    # legacy joined lines + long label first in tail -> must skip to a valid one
    "joined": ["COFFEE · LAUGHS", "SMALL THINGS · PANCAKES", "REMEMBERS EVERYTHING ALWAYS", "CHILDHOOD PET"],
    # only 4 labels -> no third line
    "four": ["COFFEE", "LAUGHS", "SMALL THINGS", "PANCAKES"],
}
for k, band in cases.items():
    r = requests.post(f"{BASE}/api/husbands", json={**base, "band": band}, timeout=60)
    out[k] = r.json().get("id") if r.ok else f"ERR {r.status_code} {r.text[:200]}"
print(json.dumps(out))
