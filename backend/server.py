from fastapi import FastAPI, APIRouter, HTTPException, Request, Response
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Optional
from datetime import datetime, timezone
from html import escape
from pathlib import Path
import os, re, io, json, random, secrets, hashlib, logging, asyncio, uuid
from PIL import Image

from emergentintegrations.llm.chat import LlmChat, UserMessage
from content import NAMES, VOW_TEMPLATES, GENERIC_VOWS, BANNED, SYSTEM_PROMPT

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]
app = FastAPI()
api = APIRouter(prefix="/api")
logger = logging.getLogger("weave")
logging.basicConfig(level=logging.INFO)

ID_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"


def clip(s: str, n: int = 80) -> str:
    return re.sub(r"\s+", " ", str(s)).strip()[:n]


class Thread(BaseModel):
    label: str
    sentence: str

    @field_validator("label", "sentence")
    @classmethod
    def _c(cls, v):
        return clip(v, 120)


class CardText(BaseModel):
    line1: str
    line2: str
    woven: List[str] = Field(max_length=3)


class HusbandIn(BaseModel):
    strands: List[str] = Field(min_length=7, max_length=7)
    keys: Dict[str, str] = {}
    sliders: Dict[str, int] = {}
    remembers: List[str] = Field(default=[], max_length=3)
    remember_keys: List[str] = Field(default=[], max_length=3)
    feel: str
    band: List[str] = Field(default=[], max_length=3)
    card: CardText
    threads: List[Thread] = Field(default=[], max_length=10)

    @field_validator("strands", "remembers", "band", "remember_keys")
    @classmethod
    def _cl(cls, v):
        return [clip(x) for x in v]


class Husband(BaseModel):
    id: str
    name: str
    number: str
    strands: List[str]
    sliders: Dict[str, int]
    remembers: List[str]
    feel: str
    vows: List[str]
    vows_source: str
    band: List[str]
    card: CardText
    threads: List[Thread]
    created_at: str

    @classmethod
    def from_mongo(cls, doc):
        return cls(**{k: v for k, v in doc.items() if k != "_id"})

    def to_mongo(self):
        return self.model_dump()


def pick_name(strands: List[str]) -> str:
    h = int(hashlib.sha256("|".join(s.lower() for s in strands).encode()).hexdigest(), 16)
    return NAMES[h % len(NAMES)]


def template_vows(p: HusbandIn) -> List[str]:
    k = p.keys
    order = [k.get("q1"), *(p.remember_keys[:1]), k.get("q3"), k.get("q4") or k.get("q2"), k.get("q7")]
    vows = []
    for key in order:
        v = VOW_TEMPLATES.get(key or "")
        if v and v not in vows:
            vows.append(v)
    for key in [k.get("q2"), *p.remember_keys[1:]]:
        v = VOW_TEMPLATES.get(key or "")
        if len(vows) < 5 and v and v not in vows:
            vows.insert(len(vows) - 1, v)
    for g in GENERIC_VOWS:
        if len(vows) < 5 and g not in vows:
            vows.insert(len(vows) - 1 if vows else 0, g)
    return vows[:5]


def vows_ok(vows) -> bool:
    if not isinstance(vows, list) or len(vows) != 5:
        return False
    for v in vows:
        if not isinstance(v, str) or not v.strip().lower().startswith(("i'll", "i’ll", "i will")):
            return False
        if len(v.split()) > 18 or len(re.findall(r"[.!?](\s|$)", v.strip())) > 2 or "\n" in v.strip():
            return False
        low = v.lower()
        if any(re.search(rf"\b{re.escape(b)}\b", low) for b in BANNED):
            return False
    return True


def slider_words(s: Dict[str, int]) -> str:
    def band(v, lo, mid, hi):
        return lo if v < 34 else hi if v > 66 else mid
    return (f"Out together: {band(s.get('out', 50), 'quiet company', 'a balance of chat and quiet', 'constant banter')}. "
            f"Shows love through: {band(s.get('love', 50), 'small daily rituals', 'a mix of rituals and gestures', 'grand gestures')}. "
            f"With him she feels: {band(s.get('feel', 50), 'safe and steady', 'steady with a little mischief', 'swept off her feet')}.")


async def llm_vows(p: HusbandIn) -> Optional[List[str]]:
    key = os.environ.get("EMERGENT_LLM_KEY")
    if not key:
        return None
    chat = LlmChat(api_key=key, session_id=f"vows-{uuid.uuid4()}", system_message=SYSTEM_PROMPT).with_model(
        "anthropic", "claude-sonnet-5-5")
    msg = ("His seven strands:\n" + "\n".join(f"- {s}" for s in p.strands) +
           f"\nHe remembers: {', '.join(p.remembers) or 'the small things'}.\nHe should make her feel: {p.feel}.\n" +
           slider_words(p.sliders))
    raw = await asyncio.wait_for(chat.send_message(UserMessage(text=msg)), timeout=8)
    m = re.search(r"\[.*\]", raw, re.S)
    vows = [clip(v, 200) for v in json.loads(m.group(0))] if m else None
    return vows if vows_ok(vows) else None


@api.get("/")
async def root():
    return {"message": "The Weavers' Guild is open"}


@api.get("/stats")
async def stats():
    return {"total": await db.husbands.count_documents({})}


@api.post("/husbands", response_model=Husband)
async def create_husband(p: HusbandIn):
    vows, source = None, "llm"
    try:
        vows = await llm_vows(p)
    except Exception as e:
        logger.warning("LLM vows failed: %s", e)
    if not vows:
        vows, source = template_vows(p), "template"
    h = Husband(
        id="".join(secrets.choice(ID_ALPHABET) for _ in range(8)),
        name=pick_name(p.strands), number=f"{random.randint(0, 9999):04d}",
        strands=p.strands, sliders={k: max(0, min(100, int(v))) for k, v in p.sliders.items()},
        remembers=p.remembers, feel=clip(p.feel), vows=vows, vows_source=source, band=p.band,
        card=p.card, threads=p.threads, created_at=datetime.now(timezone.utc).isoformat(),
    )
    await db.husbands.insert_one(h.to_mongo())
    return h


async def get_or_404(hid: str) -> Husband:
    doc = await db.husbands.find_one({"id": hid}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "No husband by that thread")
    return Husband.from_mongo(doc)


@api.get("/husbands/{hid}", response_model=Husband)
async def read_husband(hid: str):
    return await get_or_404(hid)


@api.post("/husbands/{hid}/card")
async def upload_card(hid: str, request: Request):
    await get_or_404(hid)
    body = await request.body()
    if not body.startswith(b"\x89PNG") or len(body) > 8_000_000:
        raise HTTPException(400, "Expected a PNG under 8MB")
    if await db.cards.find_one({"id": hid}, {"_id": 1}):
        return {"ok": True, "existing": True}
    try:
        im = Image.open(io.BytesIO(body)).convert("RGB").resize((720, 1280), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, "JPEG", quality=82, optimize=True)
        og = buf.getvalue()
    except Exception:
        raise HTTPException(400, "Unreadable PNG")
    await db.cards.insert_one({"id": hid, "png": body, "og": og, "created_at": datetime.now(timezone.utc).isoformat()})
    return {"ok": True}


@api.get("/husbands/{hid}/og.jpg")
async def card_og(hid: str):
    doc = await db.cards.find_one({"id": hid}, {"og": 1})
    if not doc:
        raise HTTPException(404, "Card not pressed yet")
    return Response(content=bytes(doc["og"]), media_type="image/jpeg",
                    headers={"Cache-Control": "public, max-age=86400"})


@api.get("/husbands/{hid}/card.png")
async def card_png(hid: str):
    doc = await db.cards.find_one({"id": hid})
    if not doc:
        raise HTTPException(404, "Card not pressed yet")
    return Response(content=bytes(doc["png"]), media_type="image/png",
                    headers={"Cache-Control": "public, max-age=86400"})


@api.get("/share/{hid}", response_class=HTMLResponse)
async def share_page(hid: str, request: Request):
    h = await get_or_404(hid)
    proto = request.headers.get("x-forwarded-proto", request.url.scheme)
    host = request.headers.get("x-forwarded-host") or request.headers.get("host")
    base = f"{proto}://{host}"
    page = f"{base}/h/{h.id}"
    title = escape(f"Meet {h.name}, a wicker husband woven by hand")
    desc = escape(f"Woven from {', '.join(h.card.woven)}. {h.vows[0]}")
    img = f"{base}/api/husbands/{h.id}/og.jpg"
    return f"""<!doctype html><html><head><meta charset="utf-8"><title>{title}</title>
<meta property="og:type" content="website"><meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}"><meta property="og:url" content="{page}">
<meta property="og:image" content="{img}"><meta property="og:image:width" content="720"><meta property="og:image:height" content="1280">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="{img}">
<meta http-equiv="refresh" content="0;url={page}"></head>
<body style="background:#F6EFE4"><a href="{page}">Meet {escape(h.name)}</a><script>location.replace({json.dumps(page)})</script></body></html>"""


app.include_router(api)
app.add_middleware(CORSMiddleware, allow_credentials=True,
                   allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","), allow_methods=["*"], allow_headers=["*"])


@app.on_event("startup")
async def startup():
    await db.husbands.create_index("id", unique=True)
    await db.cards.create_index("id", unique=True)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
