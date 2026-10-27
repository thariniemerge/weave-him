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
import os, re, json, random, secrets, hashlib, logging, asyncio, uuid

from emergentintegrations.llm.chat import LlmChat, UserMessage
from content import NAMES, VOW_TEMPLATES, GENERIC_VOWS, BANNED, SYSTEM_PROMPT, REWEAVE_PROMPT
from card_render import render_card, og_jpeg

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]
app = FastAPI()
api = APIRouter(prefix="/api")
logger = logging.getLogger("weave")
logging.basicConfig(level=logging.INFO)

MAX_REWEAVES = 3
DEFAULT_CREDIT = "[Inspired-by credit] · Built on Emergent"
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
    site: str = Field(default="", max_length=80)
    credit: str = Field(default="", max_length=120)

    @field_validator("strands", "remembers", "band", "remember_keys")
    @classmethod
    def _cl(cls, v):
        v = [clip(x) for x in v]
        if any(not x for x in v):
            raise ValueError("empty strand")
        return v

    @field_validator("feel")
    @classmethod
    def _f(cls, v):
        if not clip(v):
            raise ValueError("empty feel")
        return clip(v)


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
    keys: Dict[str, str] = {}
    remember_keys: List[str] = []
    site: str = ""
    credit: str = ""
    reweaves: int = 0
    reweaves_left: int = MAX_REWEAVES

    @classmethod
    def from_mongo(cls, doc):
        d = {k: v for k, v in doc.items() if k not in ("_id", "edit_token_hash", "reweaves_left")}
        return cls(**d, reweaves_left=max(0, MAX_REWEAVES - d.get("reweaves", 0)))

    def to_mongo(self):
        return self.model_dump(exclude={"reweaves_left"})


class HusbandCreated(Husband):
    edit_token: str


class ReweaveIn(BaseModel):
    index: int = Field(ge=0, le=4)
    token: str = Field(max_length=64)



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


def vow_ok(v) -> bool:
    if not isinstance(v, str) or not v.strip().lower().startswith(("i'll", "i’ll", "i will")):
        return False
    if len(v.split()) > 18 or len(re.findall(r"[.!?](\s|$)", v.strip())) > 2 or "\n" in v.strip():
        return False
    low = v.lower()
    return not any(re.search(rf"\b{re.escape(b)}\b", low) for b in BANNED)


def vows_ok(vows) -> bool:
    return isinstance(vows, list) and len(vows) == 5 and all(vow_ok(v) for v in vows)


def slider_words(s: Dict[str, int]) -> str:
    def band(v, lo, mid, hi):
        return lo if v < 34 else hi if v > 66 else mid
    return (f"Out together: {band(s.get('out', 50), 'quiet company', 'a balance of chat and quiet', 'constant banter')}. "
            f"Shows love through: {band(s.get('love', 50), 'small daily rituals', 'a mix of rituals and gestures', 'grand gestures')}. "
            f"With him she feels: {band(s.get('feel', 50), 'safe and steady', 'steady with a little mischief', 'swept off her feet')}.")


async def llm_text(system: str, msg: str) -> Optional[str]:
    key = os.environ.get("EMERGENT_LLM_KEY")
    if not key:
        return None

    async def attempt():
        for i in range(3):
            chat = LlmChat(api_key=key, session_id=f"vows-{uuid.uuid4()}", system_message=system).with_model(
                "anthropic", "claude-sonnet-5-5")
            try:
                return await chat.send_message(UserMessage(text=msg))
            except Exception as e:
                if i == 2 or "429" not in str(e):
                    raise
                await asyncio.sleep(0.6 * (i + 1))

    return await asyncio.wait_for(attempt(), timeout=8)


def strands_brief(strands, remembers, feel, sliders) -> str:
    return ("His seven strands:\n" + "\n".join(f"- {s}" for s in strands) +
            f"\nHe remembers: {', '.join(remembers) or 'the small things'}.\nHe should make her feel: {feel}.\n" +
            slider_words(sliders))


async def llm_vows(p: HusbandIn) -> Optional[List[str]]:
    raw = await llm_text(SYSTEM_PROMPT, strands_brief(p.strands, p.remembers, p.feel, p.sliders))
    if not raw:
        return None
    start = raw.find("[")
    try:
        vows, _ = json.JSONDecoder().raw_decode(raw[start:]) if start >= 0 else (None, 0)
    except ValueError:
        vows = None
    vows = [clip(v, 200) for v in vows if isinstance(v, str)] if isinstance(vows, list) else None
    return vows if vows_ok(vows) else None


def render_for(h: "Husband", host: str = "") -> bytes:
    return render_card(h.name, h.number, h.card.line1, h.card.line2, h.card.woven,
                       h.site or host or "weavehim", h.credit or DEFAULT_CREDIT)


async def store_card(h: "Husband", host: str = "") -> dict:
    png = await asyncio.to_thread(render_for, h, host)
    og = await asyncio.to_thread(og_jpeg, png)
    doc = {"id": h.id, "png": png, "og": og, "source": "server", "created_at": datetime.now(timezone.utc).isoformat()}
    await db.cards.replace_one({"id": h.id}, doc, upsert=True)
    return doc


def req_host(request: Request) -> str:
    host = request.headers.get("x-forwarded-host") or request.headers.get("host") or ""
    return re.sub(r"^www\.", "", host.split(",")[0].strip())


@api.get("/")
async def root():
    return {"message": "The Weavers' Guild is open"}


@api.get("/stats")
async def stats():
    return {"total": await db.husbands.count_documents({})}


@api.post("/husbands", response_model=HusbandCreated)
async def create_husband(p: HusbandIn, request: Request):
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
        keys=p.keys, remember_keys=p.remember_keys, site=clip(p.site), credit=clip(p.credit, 120),
    )
    token = secrets.token_urlsafe(18)
    await db.husbands.insert_one({**h.to_mongo(), "edit_token_hash": hashlib.sha256(token.encode()).hexdigest()})
    try:
        await store_card(h, req_host(request))
    except Exception as e:
        logger.warning("Card render failed for %s: %s", h.id, e)
    return HusbandCreated(**h.model_dump(), edit_token=token)


async def get_or_404(hid: str) -> Husband:
    doc = await db.husbands.find_one({"id": hid}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "No husband by that thread")
    return Husband.from_mongo(doc)


@api.get("/husbands/{hid}", response_model=Husband)
async def read_husband(hid: str):
    return await get_or_404(hid)


def reweave_fallback(h: Husband) -> List[str]:
    keys = [*h.keys.values(), *h.remember_keys]
    pool = [VOW_TEMPLATES[k] for k in keys if k in VOW_TEMPLATES] + list(VOW_TEMPLATES.values()) + GENERIC_VOWS
    return [v for v in dict.fromkeys(pool) if v not in h.vows]


@api.post("/husbands/{hid}/reweave", response_model=Husband)
async def reweave_vow(hid: str, body: ReweaveIn):
    doc = await db.husbands.find_one({"id": hid}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "No husband by that thread")
    if doc.get("edit_token_hash") != hashlib.sha256(body.token.encode()).hexdigest():
        raise HTTPException(403, "Only his commissioner may reweave his vows")
    h = Husband.from_mongo(doc)
    if h.reweaves >= MAX_REWEAVES:
        raise HTTPException(409, "The basketmaker is out of willow.")
    old = h.vows[body.index]
    new = None
    try:
        others = "\n".join(f"- {v}" for i, v in enumerate(h.vows) if i != body.index)
        raw = await llm_text(REWEAVE_PROMPT, strands_brief(h.strands, h.remembers, h.feel, h.sliders) +
                             f"\nHis other vows (do not repeat them):\n{others}\nThe vow to replace: {old}")
        cand = clip((raw or "").strip().strip('"').splitlines()[0] if raw else "", 200)
        if vow_ok(cand) and cand.lower() != old.lower() and cand not in h.vows:
            new = cand
    except Exception as e:
        logger.warning("LLM reweave failed: %s", e)
    if not new:
        pool = reweave_fallback(h)
        new = random.choice(pool[:6]) if pool else old
    res = await db.husbands.find_one_and_update(
        {"id": hid, "$or": [{"reweaves": {"$lt": MAX_REWEAVES}}, {"reweaves": {"$exists": False}}]},
        {"$set": {f"vows.{body.index}": new}, "$inc": {"reweaves": 1}}, return_document=True, projection={"_id": 0})
    if not res:
        raise HTTPException(409, "The basketmaker is out of willow.")
    return Husband.from_mongo(res)


async def card_doc(hid: str, request: Request) -> dict:
    doc = await db.cards.find_one({"id": hid})
    if doc and doc.get("source") == "server":
        return doc
    return await store_card(await get_or_404(hid), req_host(request))


@api.get("/husbands/{hid}/og.jpg")
async def card_og(hid: str, request: Request):
    doc = await card_doc(hid, request)
    return Response(content=bytes(doc["og"]), media_type="image/jpeg",
                    headers={"Cache-Control": "public, max-age=86400"})


@api.get("/husbands/{hid}/card.png")
async def card_png(hid: str, request: Request):
    doc = await card_doc(hid, request)
    return Response(content=bytes(doc["png"]), media_type="image/png",
                    headers={"Cache-Control": "public, max-age=86400"})


@api.get("/share/{hid}", response_class=HTMLResponse)
async def share_page(hid: str, request: Request):
    h = await get_or_404(hid)
    proto = request.headers.get("x-forwarded-proto", request.url.scheme)
    host = request.headers.get("x-forwarded-host") or request.headers.get("host")
    base = f"{proto}://{host}"
    page = f"{base}/h/{h.id}"
    rel = f"/h/{h.id}"
    title = escape(f"Meet {h.name}, a wicker husband woven by hand")
    desc = escape(f"Woven from {', '.join(h.card.woven)}. {h.vows[0]}")
    img = f"{base}/api/husbands/{h.id}/og.jpg"
    return f"""<!doctype html><html><head><meta charset="utf-8"><title>{title}</title>
<meta property="og:type" content="website"><meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}"><meta property="og:url" content="{page}">
<meta property="og:image" content="{img}"><meta property="og:image:width" content="720"><meta property="og:image:height" content="1280">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="{img}">
<meta http-equiv="refresh" content="0;url={rel}"></head>
<body style="background:#F6EFE4"><a href="{rel}">Meet {escape(h.name)}</a><script>location.replace({json.dumps(rel)})</script></body></html>"""


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
