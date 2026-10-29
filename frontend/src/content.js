// All editable copy & config lives here.
import { isPhone } from "./lib/perf";
export const CONFIG = {
  // Leave empty to use the current domain (without https:// or www.)
  SITE_URL: "",
  // *word* is shown in italics
  CREDIT_LINE: "Built with Emergent",
  CREDIT_URL: "https://emergent.sh",
  CARD_CREDIT_LINE: "Built with Emergent",
  // Printed on the share card while running on a preview address (before publishing)
  PREVIEW_SITE_LABEL: "weavehim.[domain]",
};

const isPreviewHost = (h) => /preview\.emergentagent\.com|localhost|127\.0\.0\.1/.test(h);
export const siteHost = () =>
  (CONFIG.SITE_URL || (isPreviewHost(window.location.host) ? CONFIG.PREVIEW_SITE_LABEL : window.location.host)).replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");

export const COPY = {
  guild: "The Basketmaker's Workshop",
  kicker: "The village laughed. So she ordered one.",
  wordmark: "weave him",
  welcomeTitle: ["weave your", "wicker man"],
  tagline: ["Peter Dinklage can't be your basketmaker.", "But that's no reason not to weave your ideal man."],
  steps: ["Answer", "Weave", "Meet him"],
  stepNotes: ["Ten strands. Not one about his looks.", "The basketmaker gets to work.", "A name and five vows, made for you."],
  cta: "Start weaving",
  // Release ribbon on Welcome; switches on RELEASE_DAY (visitor's local time)
  ribbonBefore: "Wicker · in theatres Oct 30",
  ribbonAfter: "Wicker · now showing",
  RELEASE_DAY: "2026-10-30",
  villageToday: (n) => (n < 10 ? "The village is just waking up. The gossip isn't." : `${n} husbands woven today. The village is not coping.`),
  villageTalking: "The village is already talking. Soon they'll be jealous.",
  weavingFinishing: ["Sanding down his rough edges…", "No assembly required. Unlike some husbands."],
  weavingLoading: ["The basketmaker is soaking the willow… (Peter Dinklage would've been faster. Probably.)", "Weaving his shoulders. Skarsgård-width, as requested.", "Checking for splinters. Emotional ones too.", "Bending the willow. Not your standards."],
  counter: "10 questions · 2 minutes · 100% husband material",
  soundtrackWelcome: "Listen to the Wicker soundtrack while you weave",
  soundtrackWeaving: "Weaving to the Wicker soundtrack. Press play →",
  soundtrackMeet: "Meet him to 'Falling in Love Again'",
  orderTitle: "One husband, made to order. No fish required.",
  spinOwn: "Or, spin my own thread. The basketmaker can take it.",
  spinPlaceholder: "He…",
  soFar: "My husband so far",
  weaveStrand: "Weave this strand",
  temperTitle: ["Tune his ", "temperament"],
  temperSub: "slide the woven heart along the thread. Flexible, like good willow.",
  wovenFrom: "So far he's woven from",
  comingTogether: "He's coming together…",
  nextRemembers: "Next: what he remembers",
  remembersTitle: ["What does he ", "remember", " about me?"],
  remembersSub: "pick up to two. He's wicker, not a goldfish.",
  remembersOwn: "Spin my own",
  remembersOwnPlaceholder: "He remembers…",
  nextFeel: "Next: how he makes me feel",
  weaveHim: "Weave him",
  nextGoal: "Next: what I'm looking for",
  goalTitle: ["What I'm ", "looking for"],
  goalSub: "pick the one that's true today",
  nextInterests: "Next: things I love",
  interestsTitle: ["Things I ", "love"],
  interestsSub: "pick up to two. He'll love them too, and so will the jealous neighbours.",
  interestsOwnPlaceholder: "I love…",
  nextMusts: "Next: my non-negotiables",
  mustsTitle: ["My ", "non-negotiables"],
  mustsSub: "pick up to two. I'm checking every bachelor on the harbour.",
  // Shown on the must-haves screen once "Emotionally available" or "Respects my space" is picked
  basketAside: "He'll carry your emotional baggage. He's literally a basket.",
  mustsOwnPlaceholder: "He must…",
  checkTitle: "Suitors on file",
  checkEmpty: "Pick a must-have and I'll check every suitor on file.",
  checkNone: (m) => `None of them have "${m}" yet, so we'll weave it in.`,
  checkVerdict: "Plenty of fish in the sea. None of them woven to order.",
  checkClose: (n) => `${n} came close. Close isn't husband material.`,
  mustsCard: "Must-haves",
  mustsCardSub: "every one of mine, woven in",
  weaving: "The basketmaker is weaving…",
  weavingAside: ["Every strand is one of my answers.", "Not one is about his ", "jawline", ". (Though have you seen the prototype?)"],
  skip: "Skip to him",
  ready: "My commission is ready",
  readyPublic: "A commission, woven by hand",
  biceps: ["Ten strands. Not one of them about his ", "biceps", "."],
  vowsNo: "His vows · No.",
  dearest: "my dear fisherwoman, I promise…",
  yours: "Yours, woven by hand,",
  share: "Show the village",
  inLife: "Is he already in my life?",
  again: "Weave another. The village can't stop you.",
  weaveOwn: "Jealous? Weave your own.",
  tellTitle: ["Is he already ", "in my life?"],
  tellSub: "Some of these strands already exist. Tell the man who's been weaving them, before the village does.",
  sendTo: "Send to",
  strandGave: "The strand he gave me",
  letterBody: (s) => ["You're woven into my wicker husband. Your strand: ", s, ". Turns out you're husband material. Thought you should know."],
  herName: "Sign with my name",
  withLove: "With love,",
  hisName: "His name (optional)",
  sendText: "Send as a text",
  copyLink: "Copy link instead",
  linkCopied: "Link copied",
  pressing: "Pressing his card…",
  // pick-limit hint on the question cards (the "· 1 of 2" count is added after it)
  upToTwo: "Select up to two. The basketmaker only has so much willow.",
  bandsKicker: "Before he's woven",
  bandsTitle: ["Stitch his ", "bands"],
  bandsSub: "Pick 3 bands from your answers below. He'll wear them in the order you tap.",
  bandsLeft: (n) => (n === 3 ? "Pick 3 bands" : n === 1 ? "1 more band" : `${n} more bands`),
  bandsPreviewLabel: "Your wicker husband wearing the bands you've picked. Tap to jump to the bands.",
  shareText: (name) => `Meet ${name}. Finally, actual husband material. #WickerMovie`,
  cardThumb: "His story card",
  cardThumbSub: "tap to view · 1080 × 1920",
  saveImage: "Save image",
  shareShort: "Share",
  reweave: "Reweave this vow",
  reweaveLeft: (n) => `${n} of 3 left`,
  outOfWillow: "The basketmaker is out of willow. Even Dinklage takes breaks.",
  videoError: "The willow snapped. Even husbands need a second try.",
  reweaveTip: "tap a vow to reweave it",
};

export const RECIPIENTS = [
  { id: "so", label: "Significant other", greeting: "My love,", named: (n) => `My love, ${n},`, tint: "#6B2E36" },
  { id: "crush", label: "Crush", greeting: "Hey you,", named: (n) => `Hey you, ${n},`, tint: "#C9CEC1" },
  { id: "friend", label: "Best friend", greeting: "Dear bestie,", named: (n) => `Dear bestie, ${n},`, tint: "#D8C08A" },
  { id: "ex", label: "Ex", greeting: "To whom it may concern,", named: (n) => `To whom it may concern (${n}),`, tint: "#C9CEC1" },
];

// "The strand he gave me": her own strands (minus family-only ones), then fixed ones per recipient, at most 6
export const FAMILY_ONLY = ["Mom's birthday", "My childhood pet"];
const T = (label, sentence, to) => ({ label, sentence, to });
export const LETTER_STRANDS = [
  T("Coffee, unasked", "you bring me coffee before I even think to ask"),
  T("Truly sees me", "you make me feel truly seen"),
  T("Texts back, promptly", "you text me back before I've even put my phone down", ["crush"]),
  T("Still knows my order", "you still know my order, years later", ["ex"]),
  T("Never really left", "you never really left, not completely", ["ex"]),
  T("Left a thread behind", "you left a thread behind, and I never cut it", ["ex"]),
  T("Remembers how we met", "you still remember exactly how we met", ["crush"]),
  T("Remembers how we met", "you remembered exactly how we met", ["ex"]),
  T("Says it plainly", "you say what you mean, so I never have to guess", ["crush"]),
  T("Says it plainly", "you said what you meant, so I never had to guess", ["ex"]),
];
export const MAX_LETTER_STRANDS = 6;

// Single-choice strands. strand = tag label, tag = "so far" chip, band = band word, sentence = letter form
// woven = how it reads on the share card after "Woven from" (a noun phrase, no commas)
// Footer aside under each strand, keyed by strand number (I–X)
export const STRAND_FOOTERS = {
  1: { footerSetup: "There's no box for 'mocks me at the market.'", footerPunch: "That's the villagers' department." },
  2: { footerSetup: "There's no box for 'quiet dissatisfaction.'", footerPunch: "The village has that covered." },
  3: { footerSetup: "There's no box for 'tells me to be more like the neighbours.'", footerPunch: "The neighbours are the problem." },
  4: { footerSetup: "There's no box for 'three gold coins.'", footerPunch: "The basketmaker took a deposit anyway." },
  5: { footerSetup: "There's no box for 'stiff as a basket.'", footerPunch: "Flexible, like good willow. Slide away." },
  6: { footerSetup: "There's no box for 'forgets our anniversary.'", footerPunch: "Wicker never forgets. It's woven in." },
  7: { footerSetup: "There's no box for 'ashamed of how I smell.'", footerPunch: "He'll never mention the fish." },
  8: { footerSetup: "There's no box for 'approved by the village timetable.'", footerPunch: "It has opinions about everything." },
  9: { footerSetup: "There's no box for 'hobbies the neighbours approve of.'", footerPunch: "Jealousy doesn't count either." },
  10: { footerSetup: "There's no box for height on this form.", footerPunch: "The basketmaker already decided." },
};

export const QUESTIONS = [
  {
    n: 1, key: "q1", text: "When I've had a *terrible* day, he…",
    options: [
      { id: "coffee", label: "Brings me coffee without asking", strand: "coffee, unasked", woven: "unasked-for coffee", tag: "coffee-bringer", band: "COFFEE", sentence: "you bring me coffee before I even think to ask" },
      { id: "vent", label: "Lets me vent. No fixing.", strand: "lets me vent", woven: "room to vent", tag: "good listener", band: "LETS ME VENT", sentence: "you let me vent, and you never try to fix it" },
      { id: "holds", label: "Just holds me. No words.", strand: "holds me, no words", woven: "quiet hugs", tag: "quiet comfort", band: "HOLDS ME", sentence: "you just hold on, and never need any words" },
    ],
  },
  {
    n: 2, key: "q2", text: "On a *lazy* Sunday, he…",
    options: [
      { id: "pancakes", label: "Makes pancakes, badly", strand: "pancakes, badly", woven: "badly made pancakes", tag: "brave cook", band: "PANCAKES", sentence: "you make pancakes, badly, and serve them proudly" },
      { id: "reads", label: "Reads beside me in silence", strand: "reads beside me", woven: "reading side by side", tag: "quiet reader", band: "QUIET READS", sentence: "you read beside me and let the quiet be good" },
      { id: "adventure", label: "Plans an adventure I didn't ask for", strand: "unasked adventures", woven: "unplanned adventures", tag: "adventurer", band: "ADVENTURES", sentence: "you plan the adventures I'd never think to ask for" },
    ],
  },
  {
    n: 3, key: "q3", text: "When I'm *nervous* before something big, he…",
    options: [
      { id: "won", label: "Tells me I've already won", strand: "faith in me", woven: "faith in me", tag: "believer", band: "FAITH IN ME", sentence: "you tell me I've already won" },
      { id: "laugh", label: "Makes me laugh till I forget", strand: "laughs at my worst jokes", woven: "shared laughter", tag: "jester", band: "LAUGHS", sentence: "you make me laugh until I forget to be nervous" },
      { id: "squeeze", label: "Just squeezes my hand", strand: "a squeeze of the hand", woven: "a squeeze of the hand", tag: "hand-squeezer", band: "STEADY HAND", sentence: "you squeeze my hand right when I need it" },
    ],
  },
  {
    n: 4, key: "q4", text: "His love *language*, honestly, is…",
    options: [
      { id: "small", label: "Remembering the small things", strand: "remembers small things", woven: "the small things", tag: "noticer", band: "SMALL THINGS", sentence: "you remember all the small things" },
      { id: "fixing", label: "Fixing things around the house", strand: "fixes the hinges", woven: "mended hinges", tag: "fixer of hinges", band: "FIXES THINGS", sentence: "you quietly fix whatever is creaking around the house" },
      { id: "voice", label: "Long voice notes", strand: "long voice notes", woven: "long voice notes", tag: "voice-noter", band: "VOICE NOTES", sentence: "you send me long voice notes, and I love every minute" },
    ],
  },
  {
    n: 7, key: "q7", text: "How should he make me *feel*?", kicker: "The final strand",
    options: [
      { id: "safe", label: "Safe harbour", strand: "safe harbour", woven: "a safe harbour", tag: "safe harbour", band: "SAFE HAVEN", sentence: "you make me feel safe, like a harbour in a storm" },
      { id: "amused", label: "Endlessly amused", strand: "endlessly amusing", woven: "endless amusement", tag: "amuser", band: "AMUSED", sentence: "you keep me endlessly amused" },
      { id: "seen", label: "Truly seen", strand: "truly sees me", woven: "feeling truly seen", tag: "noticer", band: "TRULY SEEN", sentence: "you make me feel truly seen" },
    ],
  },
];

export const SLIDERS = [
  {
    key: "out", title: "When we're out together", left: "Quiet company", right: "Constant banter", tint: "#C9CEC1", def: 75,
    steps: [
      { tag: "quiet company", caption: "He's happy to say nothing at all, together." },
      { tag: "easy company", caption: "A good word, then a good silence." },
      { tag: "banter-prone", caption: "He'll narrate the entire grocery run." },
    ],
  },
  {
    key: "love", title: "How he shows his love", left: "Small daily rituals", right: "Grand gestures", tint: "#C9CEC1", def: 25,
    steps: [
      { tag: "ritual-keeper", caption: "Coffee on the nightstand, every single morning." },
      { tag: "note-leaver", caption: "A note in my coat pocket, now and then." },
      { tag: "grand-gesturer", caption: "He'll hire a string quartet. For a Tuesday." },
    ],
  },
  {
    key: "feel", title: "With him, I feel", left: "Safe and steady", right: "Swept off my feet", tint: "#D8C08A", def: 50,
    steps: [
      { tag: "steady", caption: "The porch light is always on." },
      { tag: "steady & sly", caption: "Steady hands, and a little mischief." },
      { tag: "sweeping", caption: "He'll ask me to dance in the kitchen." },
    ],
  },
];

// Strand VI. `links` are earlier answers each one relates to (see topByLinks): only her best three show
export const REMEMBERS = [
  { id: "mom", label: "Mom's birthday", short: "Mom's birthday", woven: "Mom's birthday", band: "MOM'S DAY", sentence: "you always remember Mom's birthday", links: ["q4:small", "love:low"] },
  { id: "coffeeorder", label: "How I take my coffee", short: "my coffee order", woven: "my coffee order", band: "COFFEE ORDER", sentence: "you know exactly how I take my coffee", links: ["q1:coffee", "q4:small", "love:low"] },
  { id: "jokes", label: "My worst jokes", short: "my worst jokes", woven: "my worst jokes", band: "WORST JOKES", sentence: "you laugh at my worst jokes, every time", links: ["q3:laugh", "q2:pancakes", "out:high"] },
  { id: "song", label: "My favourite song", short: "my favourite song", woven: "our song", band: "OUR SONG", sentence: "you never forget my favourite song", links: ["q4:voice", "love:high", "feel:high"] },
  { id: "pet", label: "The name of my childhood pet", short: "my childhood pet", woven: "my childhood pet", band: "PET'S NAME", sentence: "you remember the name of my childhood pet", links: ["q4:small", "q1:vent"] },
  { id: "surprises", label: "That I hate surprises", short: "no surprises", woven: "zero surprises", band: "NO SURPRISES", sentence: "you remember that I hate surprises", links: ["love:low", "feel:low", "q2:reads"] },
];

export const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
export const TOTAL_STRANDS = 10;

// Her husband's painted portrait, chosen from her answers. Signs: "q1:coffee" (a pick), "love:low"/"love:high" (a slider side), "rem:song" (a remembered thing).
export const PORTRAITS = [
  { slug: "golden-willow", lips: [0.53, 0.46], name: "Golden Willow", signs: ["q1:coffee", "love:low", "feel:low", "q4:small", "q7:safe"] },
  { slug: "candlelit-rogue", lips: [0.57, 0.5], name: "Candlelit Rogue", signs: ["love:high", "feel:high", "q4:voice", "q7:seen", "rem:song"] },
  { slug: "sunlit-curls", lips: [0.57, 0.4], name: "Sunlit Curls", signs: ["q3:laugh", "q2:pancakes", "out:high", "q7:amused", "rem:jokes"] },
  { slug: "lantern-woodsman", lips: [0.6, 0.4], name: "Lantern Woodsman", signs: ["q1:holds", "q4:fixing", "q3:squeeze", "q2:adventure", "q7:alone"] },
  { slug: "moorland-scholar", lips: [0.58, 0.45], name: "Moorland Scholar", signs: ["q1:vent", "q2:reads", "out:low", "q3:rehearse", "q3:won"] },
];
export const PORTRAIT_V = 8;
// Phones get 600px-wide WebP copies (`-m` / `m/`); `full` keeps the originals (share card exports)
export const portraitSrc = (slug, kind = "", full = false) =>
  `/assets/husbands/${slug}${kind}${!full && kind && isPhone() ? "-m.webp" : kind === "-bg" ? ".jpg" : ".webp"}?v=${PORTRAIT_V}`;
// His expression frames (aligned, same box as the portrait). Hold = seconds at full strength.
// Only blush and shy play (no wink, heart eyes or kiss); blinks are natural, not an emotion
export const EXPRESSIONS = ["neutral", "blink_half", "blink", "blush", "shy"];
export const HOLD = { blush: 1.8, shy: 1.8 };
export const TAP_ORDER = ["blush", "shy"];
export const frameSrc = (slug, e, full = false) => `/assets/husbands/${slug}/${!full && isPhone() ? "m/" : ""}${e}.webp?v=${PORTRAIT_V}`;
export const lipsOf = (slug) => (PORTRAITS.find((p) => p.slug === slug) || PORTRAITS[0]).lips;

// Strand VIII: what I'm looking for (pick one)
export const GOALS = [
  { id: "serious", label: "Something serious", short: "something serious" },
  { id: "marriage", label: "Marriage someday", short: "marriage someday" },
  { id: "slow", label: "Taking it slow", short: "taking it slow" },
  { id: "unsure", label: "Not sure yet", short: "not sure yet" },
];

// Strand IX: things I love (up to two, her own included). `links` as for REMEMBERS
export const INTERESTS = [
  { id: "books", label: "Books", links: ["q2:reads", "out:low"] }, { id: "cooking", label: "Cooking", links: ["q2:pancakes", "love:low"] }, { id: "travel", label: "Travel", links: ["q2:adventure", "feel:high"] },
  { id: "music", label: "Music", links: ["q4:voice", "rem:song", "feel:high"] }, { id: "films", label: "Films", links: ["q7:amused", "out:low"] }, { id: "fitness", label: "Fitness", links: ["q2:adventure"] },
  { id: "walks", label: "Nature walks", links: ["q2:adventure", "out:low"] }, { id: "art", label: "Art", links: ["q7:seen", "q2:reads"] }, { id: "games", label: "Games", links: ["q3:laugh", "q7:amused", "out:high"] },
  { id: "markets", label: "Markets", links: ["out:high"] }, { id: "dancing", label: "Dancing", links: ["feel:high", "love:high", "rem:song"] }, { id: "coffee", label: "Coffee", links: ["q1:coffee", "rem:coffeeorder"] },
];

// Strand X: my non-negotiables (up to two, her own included). `vow` is his promise; `words` help check the vows keep it.
// `links` as for REMEMBERS (goal signs come from strand VIII)
export const MUSTHAVES = [
  { id: "wants", label: "Actually wants a relationship", vow: "I'll choose us on purpose, every single day.", words: ["choose us", "relationship"], links: ["goal:serious", "goal:marriage"] },
  { id: "calm", label: "Handles a fight calmly", vow: "When we fight, I'll stay and talk it through.", words: ["fight", "argue", "talk it through", "calm"], links: ["q1:vent", "q3:squeeze", "feel:low"] },
  { id: "available", label: "Emotionally available", vow: "I'll tell you what I'm feeling, even the clumsy parts.", words: ["feeling", "feelings"], links: ["q1:vent", "q4:voice", "q7:seen"] },
  { id: "honest", label: "Honest even when it's hard", vow: "I'll tell you the truth, even when it's hard to say.", words: ["truth", "honest"], links: ["q7:seen", "q1:vent"] },
  { id: "loyal", label: "Loyal", vow: "I'll be on your side, in every room you walk into.", words: ["your side", "loyal"], links: ["q7:safe", "q1:holds", "feel:low"] },
  { id: "time", label: "Makes time for me", vow: "I'll always make time for you, and I'll guard it.", words: ["time for you", "make time", "make the time"], links: ["love:low", "q4:small", "q2:reads"] },
  { id: "family", label: "Gets along with my family", vow: "I'll win over your family, one Sunday lunch at a time.", words: ["your family"], links: ["rem:mom", "goal:marriage"] },
  { id: "kids", label: "Wants kids someday", vow: "I'll want a little family with you, someday.", words: ["kids", "children", "little family"], links: ["goal:marriage", "goal:serious"] },
  { id: "space", label: "Respects my space", vow: "I'll give you room to breathe, and I'll still be here.", words: ["your space", "room to breathe"], links: ["goal:slow", "out:low", "q2:reads"] },
  { id: "ambitious", label: "Ambitious", vow: "I'll chase big things with you, and cheer yours louder.", words: ["big things", "ambition"], links: ["q3:won", "q2:adventure", "feel:high"] },
];

// Demo "suitors on file" for the live check. Each has a playful reason for every must-have he fails.
export const SUITORS = [
  { id: "rogue", name: "Silas Thorne", title: "The Rogue", goal: "slow", interests: ["travel", "dancing", "music", "markets"],
    no: { wants: "says he's not ready to settle down.", loyal: "winks at every fishwife on the harbour.", kids: "asks if children come with a return policy.", family: "called your aunt \"old girl\" at supper." } },
  { id: "poet", name: "Ambrose Vale", title: "The Poet", goal: "marriage", interests: ["books", "art", "walks", "coffee"],
    no: { calm: "goes quiet for three days after a fight.", time: "misses supper whenever the moon is pretty.", ambitious: "his life plan is one unfinished sonnet.", family: "read your father a poem about his moustache." } },
  { id: "woodsman", name: "Barnaby Ashcroft", title: "The Woodsman", goal: "serious", interests: ["walks", "cooking", "fitness", "coffee"],
    no: { time: "is always out in the forest.", available: "shares his feelings only with the oak trees.", family: "brought your mother a live badger as a gift." } },
  { id: "scholar", name: "Edmund Pryce", title: "The Scholar", goal: "marriage", interests: ["books", "games", "films", "music"],
    no: { time: "is married to his library until Thursday.", kids: "would need to read three books on it first.", family: "corrected your grandmother's Latin. Twice." } },
  { id: "fisherman", name: "Rafe Merriweather", title: "The Fisherman", goal: "serious", interests: ["travel", "fitness", "games", "dancing"],
    no: { space: "mends his nets in your kitchen, every evening.", time: "loves the sea more than you. Says so.", family: "smells of mackerel, permanently." } },
  { id: "tailor", name: "Percival Finch", title: "The Tailor", goal: "unsure", interests: ["art", "markets", "films", "dancing"],
    no: { wants: "is already spoken for. His wife keeps eyeing your husband.", honest: "said he loved your hat. He did not.", ambitious: "his one ambition is a finer waistcoat.", family: "took your father's measurements without asking." } },
];
// A must-have of her own words: none of them have heard of it yet
export const CUSTOM_NO = "hasn't learned that one yet.";
