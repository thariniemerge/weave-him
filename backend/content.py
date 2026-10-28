PORTRAITS = ["golden-willow", "candlelit-rogue", "sunlit-curls", "lantern-woodsman", "moorland-scholar"]
NAMES = ["Rowan", "Alistair", "Cornelius", "Felix", "Jasper", "Lucian", "Theodore", "Laurence", "Augustin", "Tobias", "Hollis", "Ellis"]

# Fallback vow per answer key
VOW_TEMPLATES = {
    "coffee": "I'll have your coffee ready before you remember you need it.",
    "vent": "I'll let you vent, and I won't fix it unless you ask.",
    "takeout": "I'll order the takeout and pick the film, so you needn't decide a thing.",
    "holds": "I'll hold you close and let the quiet do the talking.",
    "pancakes": "I'll make you pancakes on Sundays, badly, and with great ceremony.",
    "reads": "I'll read beside you and never once ask what you're thinking.",
    "market": "I'll drag you to the farmers' market and carry every single bag.",
    "adventure": "I'll plan the adventures you'd never think to ask for.",
    "rehearse": "I'll rehearse it with you as many times as it takes.",
    "won": "I'll remind you that you've already won, before you even begin.",
    "laugh": "I'll make you laugh until you forget you were ever nervous.",
    "squeeze": "I'll squeeze your hand at exactly the right moment.",
    "small": "I'll remember the small things, especially the ones you think I missed.",
    "fixing": "I'll fix the creaking hinge before you've had a chance to mention it.",
    "voice": "I'll send you long voice notes, and I'll ramble charmingly.",
    "lastbite": "I'll always save you the last bite. Always.",
    "mom": "I'll remember your mom's birthday, and I'll call her.",
    "coffeeorder": "I'll know exactly how you take your coffee, and never get it wrong.",
    "jokes": "I'll laugh at the joke. Even the third time.",
    "song": "I'll hum your favourite song when you least expect it.",
    "pet": "I'll remember your childhood pet's name, and ask after their memory fondly.",
    "surprises": "I'll never spring a surprise on you. You'll always know the plan.",
    "safe": "I'll always leave the porch light on.",
    "amused": "I'll keep you endlessly amused, even on the dullest of Tuesdays.",
    "seen": "I'll notice you, truly, every single day.",
    "alone": "I'll make sure you're never alone unless you'd like to be.",
}
GENERIC_VOWS = [
    "I'll keep my promises, the small ones most of all.",
    "I'll be the steady thread when the rest comes loose.",
    "I'll always leave the porch light on.",
]

BANNED = [
    "beautiful", "pretty", "handsome", "gorgeous", "looks", "body", "bodies", "abs", "biceps", "muscle", "muscles",
    "jawline", "tall", "height", "weight", "thin", "fat", "skinny", "sexy", "hot", "kiss", "kisses", "bed", "naked",
    "lips", "money", "rich", "wealth", "wealthy", "salary", "diamond", "diamonds", "fortune", "mine", "belong",
    "possess", "own you", "jealous", "obey", "touch", "desire", "lust", "curves", "face", "eyes", "figure", "dollars",
]

SYSTEM_PROMPT = """You are the basketmaker of a seaside village workshop, weaving a wicker husband from a woman's answers.
Write his five vows to her.
Rules:
- Exactly 5 vows, each a single sentence (a short trailing fragment like "Even the third time." is allowed), max 18 words.
- First person, each begins with "I'll".
- Warm, specific to the strands given, lightly witty, old-village fairy-tale tinged but modern-readable.
- Never use em dashes or en dashes; use commas or full stops.
- Never mention appearance, bodies, money, gifts of value, anything physical, romantic-physical or sexual, and nothing possessive or controlling.
Example style:
I'll have your coffee ready before you remember you need it.
I'll let you vent, and I won't fix it unless you ask.
I'll laugh at the joke. Even the third time.
I'll remember your mom's birthday, and I'll call her.
I'll always leave the porch light on.
Return ONLY a JSON array of 5 strings, nothing else."""

REWEAVE_PROMPT = """You are the basketmaker of a seaside village workshop, reweaving ONE vow of a wicker husband.
Write a single replacement vow, different from the one being replaced and from his other vows.
Rules: one sentence (a short trailing fragment like "Even the third time." is allowed), max 18 words, begins with "I'll",
warm, specific to his strands, lightly witty, old-village fairy-tale tinged but modern-readable.
Never use em dashes or en dashes; use commas or full stops.
Never mention appearance, bodies, money, gifts of value, anything physical, romantic-physical or sexual, and nothing possessive.
Return ONLY the vow text, nothing else."""
