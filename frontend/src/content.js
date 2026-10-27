// All editable copy & config lives here.
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
  guild: "The Weavers' Guild",
  howItWorks: "How it works",
  howSteps: [
    { title: "Answer", body: "Seven little questions, seven strands. Not one of them about his looks." },
    { title: "Weave", body: "The basketmaker weaves my answers into willow & wicker, strand by strand." },
    { title: "Meet him", body: "He arrives with an 1800s name and five vows, written just for me." },
  ],
  kicker: "hand-woven for the Season",
  wordmark: "weave him",
  tagline: ["He's made of willow & wicker.", "So make him of what matters."],
  steps: ["Answer", "Weave", "Meet him"],
  cta: "Commission my husband",
  counter: (n) => `${n} ${n === 1 ? "husband" : "husbands"} woven by hand · two minutes`,
  orderTitle: "Order for one husband",
  spinOwn: "Or, spin my own thread",
  spinPlaceholder: "He…",
  asideA: "There's no box for height on this form.",
  asideB: "That's rather the point.",
  soFar: "My husband so far",
  weaveStrand: "Weave this strand",
  temperTitle: ["Tune his ", "temperament"],
  temperSub: "slide the woven heart along the thread",
  wovenFrom: "So far he's woven from",
  comingTogether: "He's coming together…",
  nextRemembers: "Next: what he remembers",
  remembersTitle: ["What does he ", "remember", " about me?"],
  remembersSub: "pick up to three, he'll never forget them",
  remembersOwn: "Spin my own",
  remembersOwnPlaceholder: "He remembers…",
  nextFeel: "Next: how he makes me feel",
  weaveHim: "Weave him",
  weaving: "The basketmaker is weaving…",
  weavingAside: ["Every strand is one of my answers.", "Not one of them is about his ", "jawline", "."],
  skip: "Skip to him",
  ready: "My commission is ready",
  readyPublic: "A commission, woven by hand",
  biceps: ["Seven strands. Not one of them about his ", "biceps", "."],
  vowsNo: "His vows · No.",
  dearest: "dearest reader, he promises…",
  yours: "Yours, woven by hand,",
  share: "Share him",
  inLife: "Is he already in my life?",
  again: "Weave another",
  weaveOwn: "Weave your own",
  tellTitle: ["Is he already ", "in my life?"],
  tellSub: "Some of these strands already exist. Tell the man who's been weaving them.",
  sendTo: "Send to",
  strandGave: "The strand he gave me",
  letterBody: (s) => ["You're woven into my wicker husband. Your strand: ", s, ". Thought you should know."],
  herName: "Sign with my name",
  withLove: "With love,",
  hisName: "His name (optional)",
  sendText: "Send as a text",
  copyLink: "Copy link instead",
  linkCopied: "Link copied",
  pressing: "Pressing his card…",
  disclaimer: "A fan-made tribute, not affiliated with the makers of Wicker.",
  upToThree: "up to three",
  bandsKicker: "Before he's woven",
  bandsTitle: ["Stitch his ", "bands"],
  bandsSub: "Choose three strands for him to wear. Tap them in order.",
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
  { id: "partner", label: "Partner", greeting: "My love,", tint: "#6B2E36" },
  { id: "dad", label: "Dad", greeting: "Dear Dad,", tint: "#C9CEC1" },
  { id: "brother", label: "Brother", greeting: "Dear brother,", tint: "#C9CEC1" },
  { id: "friend", label: "Best friend", greeting: "Dearest friend,", tint: "#D8C08A" },
];

// Single-choice strands. strand = tag label, tag = "so far" chip, band = band word, sentence = letter form
export const QUESTIONS = [
  {
    n: 1, key: "q1", text: "When I've had a *terrible* day, he…",
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
    n: 3, key: "q3", text: "When I'm *nervous* before something big, he…",
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
    n: 7, key: "q7", text: "How should he make me *feel*?", kicker: "The final strand",
    options: [
      { id: "safe", label: "Safe harbour", strand: "safe harbour", tag: "safe harbour", band: "SAFE HAVEN", sentence: "you make me feel safe, like a harbour in a storm" },
      { id: "amused", label: "Endlessly amused", strand: "endlessly amusing", tag: "amuser", band: "AMUSED", sentence: "you keep me endlessly amused" },
      { id: "seen", label: "Truly seen", strand: "truly sees me", tag: "noticer", band: "TRULY SEEN", sentence: "you make me feel truly seen" },
      { id: "alone", label: "Never alone", strand: "never alone", tag: "constant", band: "NEVER ALONE", sentence: "you make sure I never feel alone" },
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

export const REMEMBERS = [
  { id: "mom", label: "Mom's birthday", short: "Mom's birthday", band: "MOM'S DAY", sentence: "you always remember Mom's birthday" },
  { id: "coffeeorder", label: "How I take my coffee", short: "my coffee order", band: "COFFEE ORDER", sentence: "you know exactly how I take my coffee" },
  { id: "jokes", label: "My worst jokes", short: "my worst jokes", band: "WORST JOKES", sentence: "you laugh at my worst jokes, every time" },
  { id: "song", label: "My favourite song", short: "my favourite song", band: "OUR SONG", sentence: "you never forget my favourite song" },
  { id: "pet", label: "The name of my childhood pet", short: "my childhood pet", band: "PET'S NAME", sentence: "you remember the name of my childhood pet" },
  { id: "surprises", label: "That I hate surprises", short: "no surprises", band: "NO SURPRISES", sentence: "you remember that I hate surprises" },
];

export const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII"];
