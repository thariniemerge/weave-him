# Iteration 6: new oval-sky (v=2), fresh server card (CARD_VERSION=3), site label, credit line, audio assets, CREDITS.md
import io
import os
import re
import pytest
import requests
from PIL import Image

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
EXISTING = "284b7xvg"  # created in iteration 5
OUT = "/app/test_reports/img"


@pytest.fixture(scope="module")
def s():
    return requests.Session()


# Static asset: the new oval sky
class TestAssets:
    def test_oval_sky_v2(self, s):
        r = s.get(f"{BASE_URL}/assets/oval-sky.webp?v=2", timeout=30)
        assert r.status_code == 200
        assert r.content[:4] == b"RIFF" and r.content[8:12] == b"WEBP"
        assert 120_000 < len(r.content) < 180_000, len(r.content)
        im = Image.open(io.BytesIO(r.content))
        assert im.size == (1100, 1600)

    @pytest.mark.parametrize("ext,ctype", [("ogg", "ogg"), ("mp3", "mpeg")])
    def test_audio_files(self, s, ext, ctype):
        r = s.get(f"{BASE_URL}/audio/welcome-theme.{ext}", timeout=30)
        assert r.status_code == 200
        assert len(r.content) > 100_000
        assert not r.content.lstrip().startswith(b"<"), "got HTML fallback"
        if ext == "ogg":
            assert r.content[:4] == b"OggS"

    def test_sharecard_references_v2(self):
        src = open("/app/frontend/src/components/weave/ShareCard.jsx").read()
        assert "oval-sky.webp?v=2" in src

    def test_credits_md(self):
        src = open("/app/CREDITS.md").read()
        assert "Original score, made for Weave Him" in src
        assert "welcome-theme" in src


# Server-rendered card for an existing husband
class TestCard:
    def test_card_jpg_existing(self, s):
        r = s.get(f"{API}/husbands/{EXISTING}/card.jpg", timeout=60)
        assert r.status_code == 200
        assert r.headers["content-type"] == "image/jpeg"
        assert len(r.content) < 1_000_000, len(r.content)
        im = Image.open(io.BytesIO(r.content))
        assert im.format == "JPEG" and im.size == (1080, 1920)
        os.makedirs(OUT, exist_ok=True)
        open(f"{OUT}/iter6_card_{EXISTING}.jpg", "wb").write(r.content)

    def test_og_jpg(self, s):
        r = s.get(f"{API}/husbands/{EXISTING}/og.jpg", timeout=60)
        assert r.status_code == 200
        im = Image.open(io.BytesIO(r.content))
        assert im.size == (720, 1280)

    def test_card_version_in_db(self):
        from pymongo import MongoClient
        env = dict(l.strip().split("=", 1) for l in open("/app/backend/.env") if "=" in l)
        db = MongoClient(env["MONGO_URL"].strip('"'))[env["DB_NAME"].strip('"')]
        doc = db.cards.find_one({"id": EXISTING}, {"v": 1})
        assert doc and doc["v"] == 3

    def test_render_for_site_and_credit(self):
        import sys
        sys.path.insert(0, "/app/backend")
        import server
        assert server.CARD_VERSION == 3
        assert server.PREVIEW_SITE_LABEL == "weavehim.[domain]"
        assert "*Wicker*" in server.DEFAULT_CREDIT_LINE

    def test_card_404(self, s):
        r = s.get(f"{API}/husbands/zzzzzzzz/card.jpg", timeout=30)
        assert r.status_code == 404

    def test_share_page_og(self, s):
        r = s.get(f"{API}/share/{EXISTING}", timeout=30)
        assert r.status_code == 200
        assert re.search(r'og:image" content="[^"]+/api/husbands/%s/og.jpg' % EXISTING, r.text)
