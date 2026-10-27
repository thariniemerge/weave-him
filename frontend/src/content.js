// All editable copy & config lives here.
export const CONFIG = {
  // Leave empty to use the current domain (without https:// or www.)
  SITE_URL: "",
  CREDIT_LINE: "[Inspired-by credit line] · Built on Emergent",
  CARD_CREDIT_LINE: "[Inspired-by credit] · Built on Emergent",
};

export const siteHost = () =>
  (CONFIG.SITE_URL || window.location.host).replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");

export const COPY = {
  guild: "The Weavers' Guild",
  howItWorks: "How it works",
  howSteps: [
    { title: "Answer", body: "Seven little questions, seven strands. Not one of them about his looks." },
    { title: "Weave", body: "The basketmaker weaves your answers into willow & wicker, strand by strand." },
    { title: "Meet him", body: "He arrives with an 1800s name and five vows, written just for you." },
  ],
  kicker: "hand-woven for the Season",
  wordmark: "Weave Him",
  tagline: ["He's made of willow & wicker.", "So make him of what matters."],
  steps: ["Answer", "Weave", "Meet him"],
  cta: "Commission your husband",
  counter: (n) => `${n} ${n === 1 ? "husband" : "husbands"} woven by hand · two minutes`,
  orderTitle: "Order for one husband",
  spinOwn: "Or, spin your own thread",
  spinPlaceholder: "He…",
  asideA: "There's no box for height on this form.",
  asideB: "That's rather the point.",
  soFar: "Your husband so far",
  weaveStrand: "Weave this strand",
  temperTitle: ["Tune his ", "temperament"],
  temperSub: "slide the woven heart along the thread",
  wovenFrom: "So far he's woven from",
  comingTogether: "He's coming together…",
  nextRemembers: "Next: what he remembers",
  remembersTitle: ["What he ", "remembers"],
  remembersSub: "pick up to three, he'll never forget them",
  remembersOwn: "Spin your own",
  remembersOwnPlaceholder: "He remembers…",
  nextFeel: "Next: how he makes you feel",
  weaveHim: "Weave him",
  weaving: "The basketmaker is weaving…",
  weavingAside: ["Every strand is one of your answers.", "Not one of them is about his ", "jawline", "."],
  skip: "Skip to him",
  ready: "Your commission is ready",
  readyPublic: "A commission, woven by hand",
  biceps: ["Seven strands. Not one of them about his ", "biceps", "."],
  vowsNo: "His vows · No.",
  dearest: "dearest reader, he promises…",
  yours: "Yours, woven by hand,",
  share: "Share him",
  inLife: "Is he already in your life?",
  again: "Weave another",
  weaveOwn: "Weave your own",
  tellTitle: ["Is he already ", "in your life?"],
  tellSub: "Some of these strands already exist. Tell the man who's been weaving them.",
  sendTo: "Send to",
  strandGave: "The strand he gave you",
  letterBody: (s) => ["You're woven into my wicker husband. Your strand: ", s, ". Thought you should know."],
  herName: "Sign with your name",
  withLove: "With love,",
  hisName: "His name (optional)",
  sendText: "Send as a text",
  copyLink: "Copy link instead",
  linkCopied: "Link copied",
  pressing: "Pressing his card…",
  shareText: (name) => `Meet ${name}, my wicker husband, woven by hand from what matters.`,
  cardThumb: "His story card",
  cardThumbSub: "tap to view · 1080 × 1920",
  saveImage: "Save image",
  shareShort: "Share",
  reweave: "Reweave this vow",
  reweaveLeft: (n) => `${n} of 3 left`,
  outOfWillow: "The basketmaker is out of willow.",
  reweaveTip: "tap a vow to reweave it",
};

export const RECIPIENTS = [
  { id: "partner", label: "Partner", greeting: "My love,", tint: "#9C3D4F" },
  { id: "dad", label: "Dad", greeting: "Dear Dad,", tint: "#CCD9E2" },
  { id: "brother", label: "Brother", greeting: "Dear brother,", tint: "#D3DEC9" },
  { id: "friend", label: "Best friend", greeting: "Dearest friend,", tint: "#EBD9A6" },
];

// Single-choice strands. strand = tag label, tag = "so far" chip, band = band word, sentence = letter form
export const QUESTIONS = [
  {
    n: 1, key: "q1", text: "When you've had a *terrible* day, he…",
    options: [
      { id: "coffee", label: "Brings me coffee without asking", strand: "coffee, unasked", tag: "coffee-bringer", band: "COFFEE", sentence: "you bring me coffee before I even think to ask" },
      { id: "vent", label: "Lets me vent. No fixing.", strand: "lets me vent", tag: "good listener", band: "LETS ME VENT", sentence: "you let me vent, and you never try to fix it" },
      { id: "takeout", label: "Orders takeout, picks the movie", strand: "takeout & a film", tag: "film-picker", band: "TAKEOUT", sentence: "you order the takeout and pick the movie when I can't" },
      { id: "holds", label: "Just holds me. No words.", strand: "holds me, no words", tag: "quiet comfort", band: "HOLDS ME", sentence: "you just hold on, and never need any words" },
    ],
  },
  {
    n: 2, key: "q2", text: "On a *lazy* Sunday, he…",
    options: [
      { id: "pancakes", label: "Makes pancakes, badly", strand: "pancakes, badly", tag: "brave cook", band: "PANCAKES", sentence: "you make pancakes, badly, and serve them proudly" },
      { id: "reads", label: "Reads beside me in silence", strand: "reads beside me", tag: "quiet reader", band: "QUIET READS", sentence: "you read beside me and let the quiet be good" },
      { id: "market", label: "Drags me to a farmers' market", strand: "farmers' markets", tag: "market-goer", band: "MARKET DAYS", sentence: "you drag me to the farmers' market and make it fun" },
      { id: "adventure", label: "Plans an adventure I didn't ask for", strand: "unasked adventures", tag: "adventurer", band: "ADVENTURES", sentence: "you plan the adventures I'd never think to ask for" },
    ],
  },
  {
    n: 3, key: "q3", text: "When you're *nervous* before something big, he…",
    options: [
      { id: "rehearse", label: "Rehearses it with me", strand: "patience", tag: "patient rehearser", band: "PATIENCE", sentence: "you rehearse it with me, as many times as it takes" },
      { id: "won", label: "Tells me I've already won", strand: "faith in me", tag: "believer", band: "FAITH IN ME", sentence: "you tell me I've already won" },
      { id: "laugh", label: "Makes me laugh till I forget", strand: "laughs at my worst jokes", tag: "jester", band: "LAUGHS", sentence: "you make me laugh until I forget to be nervous" },
      { id: "squeeze", label: "Just squeezes my hand", strand: "a squeeze of the hand", tag: "hand-squeezer", band: "STEADY HAND", sentence: "you squeeze my hand right when I need it" },
    ],
  },
  {
    n: 4, key: "q4", text: "His love *language*, honestly, is…",
    options: [
      { id: "small", label: "Remembering the small things", strand: "remembers small things", tag: "noticer", band: "SMALL THINGS", sentence: "you remember all the small things" },
      { id: "fixing", label: "Fixing things around the house", strand: "fixes the hinges", tag: "fixer of hinges", band: "FIXES THINGS", sentence: "you quietly fix whatever is creaking around the house" },
      { id: "voice", label: "Long voice notes", strand: "long voice notes", tag: "voice-noter", band: "VOICE NOTES", sentence: "you send me long voice notes, and I love every minute" },
      { id: "lastbite", label: "Saving me the last bite", strand: "saves the last bite", tag: "last-bite saver", band: "LAST BITE", sentence: "you always save me the last bite" },
    ],
  },
  {
    n: 7, key: "q7", text: "How should he make you *feel*?", kicker: "The final strand",
    options: [
      { id: "safe", label: "Safe harbour", strand: "safe harbour", tag: "safe harbour", band: "SAFE HARBOUR", sentence: "you make me feel safe, like a harbour in a storm" },
      { id: "amused", label: "Endlessly amused", strand: "endlessly amusing", tag: "amuser", band: "AMUSED", sentence: "you keep me endlessly amused" },
      { id: "seen", label: "Truly seen", strand: "truly sees me", tag: "noticer", band: "TRULY SEEN", sentence: "you make me feel truly seen" },
      { id: "alone", label: "Never alone", strand: "never alone", tag: "constant", band: "NEVER ALONE", sentence: "you make sure I never feel alone" },
    ],
  },
];

export const SLIDERS = [
  {
    key: "out", title: "When you're out together", left: "Quiet company", right: "Constant banter", tint: "#CCD9E2", def: 75,
    steps: [
      { tag: "quiet company", caption: "He's happy to say nothing at all, together." },
      { tag: "easy company", caption: "A good word, then a good silence." },
      { tag: "banter-prone", caption: "He'll narrate the entire grocery run." },
    ],
  },
  {
    key: "love", title: "How he shows his love", left: "Small daily rituals", right: "Grand gestures", tint: "#E4DCEB", def: 25,
    steps: [
      { tag: "ritual-keeper", caption: "Coffee on the nightstand, every single morning." },
      { tag: "note-leaver", caption: "A note in your coat pocket, now and then." },
      { tag: "grand-gesturer", caption: "He'll hire a string quartet. For a Tuesday." },
    ],
  },
  {
    key: "feel", title: "With him, you feel", left: "Safe and steady", right: "Swept off your feet", tint: "#EBD9A6", def: 50,
    steps: [
      { tag: "steady", caption: "The porch light is always on." },
      { tag: "steady & sly", caption: "Steady hands, and a little mischief." },
      { tag: "sweeping", caption: "He'll ask you to dance in the kitchen." },
    ],
  },
];

export const REMEMBERS = [
  { id: "mom", label: "Mom's birthday", short: "Mom's birthday", band: "MOM'S BIRTHDAY", sentence: "you always remember Mom's birthday" },
  { id: "coffeeorder", label: "How I take my coffee", short: "my coffee order", band: "COFFEE ORDER", sentence: "you know exactly how I take my coffee" },
  { id: "jokes", label: "My worst jokes", short: "my worst jokes", band: "WORST JOKES", sentence: "you laugh at my worst jokes, every time" },
  { id: "song", label: "My favourite song", short: "my favourite song", band: "FAVOURITE SONG", sentence: "you never forget my favourite song" },
  { id: "pet", label: "The name of my childhood pet", short: "my childhood pet", band: "CHILDHOOD PET", sentence: "you remember the name of my childhood pet" },
  { id: "surprises", label: "That I hate surprises", short: "no surprises", band: "NO SURPRISES", sentence: "you remember that I hate surprises" },
];

export const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII"];
