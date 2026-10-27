# Share page: relative redirect (no cross-domain), absolute og:image
import os, re, requests, pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")


@pytest.fixture(scope="module")
def hid():
    r = requests.get(f"{BASE_URL}/api/stats", timeout=15)
    assert r.status_code == 200
    # reuse a known husband if provided, else create one (single sequential POST)
    env_id = os.environ.get("SHARE_TEST_ID")
    if env_id:
        return env_id
    pytest.skip("Set SHARE_TEST_ID to an existing husband id")


def test_share_relative_redirect(hid):
    r = requests.get(f"{BASE_URL}/api/share/{hid}", timeout=15, allow_redirects=False)
    assert r.status_code == 200
    html = r.text
    assert f'content="0;url=/h/{hid}"' in html
    assert f'location.replace("/h/{hid}")' in html
    assert f'href="/h/{hid}"' in html
    m = re.search(r'og:image" content="([^"]+)"', html)
    assert m and m.group(1).startswith("http") and m.group(1).endswith(f"/api/husbands/{hid}/og.jpg")


def test_share_404():
    r = requests.get(f"{BASE_URL}/api/share/doesnotexist", timeout=15)
    assert r.status_code == 404
