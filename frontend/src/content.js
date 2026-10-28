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
    { title: "Answer", body: "Ten little questions, ten strands. Not one of them about his looks." },
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
  nextGoal: "Next: what I'm looking for",
  goalTitle: ["What I'm ", "looking for"],
  goalSub: "pick the one that's true today",
  nextInterests: "Next: things I love",
  interestsTitle: ["Things I ", "love"],
  interestsSub: "pick up to five, he'll love them too",
  interestsOwnPlaceholder: "I love…",
  nextMusts: "Next: my non-negotiables",
  mustsTitle: ["My ", "non-negotiables"],
  mustsSub: "pick up to five, I'm checking the suitors on file",
  mustsOwnPlaceholder: "He must…",
  checkTitle: "Suitors on file",
  checkEmpty: "Pick a must-have and I'll check every suitor on file.",
  checkNone: (m) => `None of them have "${m}" yet, so we'll weave it in.`,
  checkVerdict: "None of them had it all. So we'll weave one who does.",
  checkClose: (n) => `${n} came close. But we'll weave one who has it all.`,
  mustsCard: "Must-haves",
  mustsCardSub: "every one of mine, woven in",
  weaving: "The basketmaker is weaving…",
  weavingAside: ["Every strand is one of my answers.", "Not one of them is about his ", "jawline", "."],
  skip: "Skip to him",
  ready: "My commission is ready",
  readyPublic: "A commission, woven by hand",
  biceps: ["Ten strands. Not one of them about his ", "biceps", "."],
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
export const portraitSrc = (slug, kind = "") => `/assets/husbands/${slug}${kind}.${kind === "-bg" ? "jpg" : "webp"}?v=${PORTRAIT_V}`;
// His expression frames (aligned, same box as the portrait). Hold = seconds at full strength.
export const EXPRESSIONS = ["neutral", "blink_half", "blink", "wink", "blush", "heart_eyes", "kiss", "shy"];
export const HOLD = { wink: 0.9, blush: 1.8, heart_eyes: 1.8, kiss: 1.5, shy: 1.8 };
export const TAP_ORDER = ["wink", "blush", "heart_eyes", "kiss", "shy"];
export const frameSrc = (slug, e) => `/assets/husbands/${slug}/${e}.webp?v=${PORTRAIT_V}`;
export const lipsOf = (slug) => (PORTRAITS.find((p) => p.slug === slug) || PORTRAITS[0]).lips;

// Strand VIII: what I'm looking for (pick one)
export const GOALS = [
  { id: "serious", label: "Something serious", short: "something serious" },
  { id: "marriage", label: "Marriage someday", short: "marriage someday" },
  { id: "slow", label: "Taking it slow", short: "taking it slow" },
  { id: "unsure", label: "Not sure yet", short: "not sure yet" },
];

// Strand IX: things I love (up to five, plus my own)
export const INTERESTS = [
  { id: "books", label: "Books" }, { id: "cooking", label: "Cooking" }, { id: "travel", label: "Travel" },
  { id: "music", label: "Music" }, { id: "films", label: "Films" }, { id: "fitness", label: "Fitness" },
  { id: "walks", label: "Nature walks" }, { id: "art", label: "Art" }, { id: "games", label: "Games" },
  { id: "markets", label: "Markets" }, { id: "dancing", label: "Dancing" }, { id: "coffee", label: "Coffee" },
];

// Strand X: my non-negotiables (up to five, plus my own). `vow` is his promise; `words` help check the vows keep it.
export const MUSTHAVES = [
  { id: "wants", label: "Actually wants a relationship", vow: "I'll choose us on purpose, every single day.", words: ["choose us", "relationship"] },
  { id: "calm", label: "Handles a fight calmly", vow: "When we fight, I'll stay and talk it through.", words: ["fight", "argue", "talk it through", "calm"] },
  { id: "available", label: "Emotionally available", vow: "I'll tell you what I'm feeling, even the clumsy parts.", words: ["feeling", "feelings"] },
  { id: "honest", label: "Honest even when it's hard", vow: "I'll tell you the truth, even when it's hard to say.", words: ["truth", "honest"] },
  { id: "loyal", label: "Loyal", vow: "I'll be on your side, in every room you walk into.", words: ["your side", "loyal"] },
  { id: "time", label: "Makes time for me", vow: "I'll always make time for you, and I'll guard it.", words: ["time for you", "make time", "make the time"] },
  { id: "family", label: "Gets along with my family", vow: "I'll win over your family, one Sunday lunch at a time.", words: ["your family"] },
  { id: "kids", label: "Wants kids someday", vow: "I'll want a little family with you, someday.", words: ["kids", "children", "little family"] },
  { id: "space", label: "Respects my space", vow: "I'll give you room to breathe, and I'll still be here.", words: ["your space", "room to breathe"] },
  { id: "ambitious", label: "Ambitious", vow: "I'll chase big things with you, and cheer yours louder.", words: ["big things", "ambition"] },
];

// Demo "suitors on file" for the live check. Each has a playful reason for every must-have he fails.
export const SUITORS = [
  { id: "rogue", name: "Silas Thorne", title: "The Rogue", goal: "slow", interests: ["travel", "dancing", "music", "markets"],
    no: { wants: "says he's not ready to settle down.", loyal: "winks at every governess in the county.", kids: "asks if children come with a return policy.", family: "called your aunt \"old girl\" at supper." } },
  { id: "poet", name: "Ambrose Vale", title: "The Poet", goal: "marriage", interests: ["books", "art", "walks", "coffee"],
    no: { calm: "goes quiet for three days after a fight.", time: "misses supper whenever the moon is pretty.", ambitious: "his life plan is one unfinished sonnet.", family: "read your father a poem about his moustache." } },
  { id: "woodsman", name: "Barnaby Ashcroft", title: "The Woodsman", goal: "serious", interests: ["walks", "cooking", "fitness", "coffee"],
    no: { time: "is always out in the forest.", available: "shares his feelings only with the oak trees.", family: "brought your mother a live badger as a gift." } },
  { id: "scholar", name: "Edmund Pryce", title: "The Scholar", goal: "marriage", interests: ["books", "games", "films", "music"],
    no: { time: "is married to his library until Thursday.", kids: "would need to read three books on it first.", family: "corrected your grandmother's Latin. Twice." } },
  { id: "captain", name: "Rafe Merriweather", title: "The Captain", goal: "serious", interests: ["travel", "fitness", "games", "dancing"],
    no: { space: "salutes you good morning, noon and night.", time: "is at sea eight months of the year.", family: "challenged your brother to a duel over cards." } },
  { id: "dandy", name: "Percival Finch", title: "The Dandy", goal: "unsure", interests: ["art", "markets", "films", "dancing"],
    no: { honest: "said he loved your hat. He did not.", ambitious: "his one ambition is a finer waistcoat.", family: "spent the whole family dinner in the mirror." } },
];
// A must-have of her own words: none of them have heard of it yet
export const CUSTOM_NO = "hasn't learned that one yet.";
