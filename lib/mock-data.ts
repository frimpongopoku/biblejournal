export const dailyVerse = {
  ref: "Lamentations 3:22–23",
  version: "ESV",
  text: "The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness.",
};

export const streak = {
  days: 47,
  weekDots: [true, true, true, false, true, true, true],
};

export const collections = [
  { id: "all", label: "All Notes", count: 84, color: null },
  { id: "sermon", label: "Sermon Notes", count: 23, color: "#C9A96E" },
  { id: "study", label: "Bible Study", count: 19, color: "#6E9E8A" },
  { id: "reflections", label: "Daily Reflections", count: 31, color: "#B07BAC" },
  { id: "prep", label: "Sermon Prep", count: 7, color: "#E07B54" },
  { id: "archive", label: "Archive", count: 4, color: null },
];

export const tags = [
  { id: "grace", label: "grace", count: 18 },
  { id: "waiting", label: "waiting", count: 9 },
  { id: "identity", label: "identity", count: 14 },
  { id: "covenant", label: "covenant", count: 6 },
  { id: "lament", label: "lament", count: 4 },
  { id: "kingdom", label: "kingdom", count: 11 },
];

export const entries = [
  {
    id: "1",
    title: "What it means to abide",
    folder: "Bible Study",
    tags: ["identity", "grace"],
    date: "Today",
    excerpt: "John 15 keeps pulling me back. There's something about the word 'abide' — meno in Greek — that feels so different from 'obey'...",
    pinned: true,
    body: [
      { type: "p", text: "John 15 keeps pulling me back. There's something about the word 'abide' — meno in Greek — that feels so different from 'obey'. Obedience can be external, mechanical. But abiding suggests intimacy, dependency, like a branch that can't pretend to be separate from its vine." },
      { type: "verse", ref: "John 15:4", text: "Abide in me, and I in you. As the branch cannot bear fruit by itself, unless it abides in the vine, neither can you, unless you abide in me." },
      { type: "p", text: "I've been performing Christianity for years in some ways. Checking boxes. Reading because I should. This hits differently." },
      { type: "callout", text: "The question is not 'what must I do?' but 'where must I remain?'" },
    ],
  },
  {
    id: "2",
    title: "Sermon prep: The God who sees",
    folder: "Sermon Prep",
    tags: ["grace", "kingdom"],
    date: "Yesterday",
    excerpt: "Hagar is one of the most overlooked figures in Genesis. Cast out, alone, dying in the wilderness — and yet she becomes the first person...",
    pinned: false,
    body: [],
  },
  {
    id: "3",
    title: "Morning prayer — March weight",
    folder: "Daily Reflections",
    tags: ["lament", "waiting"],
    date: "2 days ago",
    excerpt: "I don't know how to carry this season. But I opened Psalm 13 this morning and David's words felt like permission...",
    pinned: false,
    body: [],
  },
  {
    id: "4",
    title: "Covenant theology overview",
    folder: "Bible Study",
    tags: ["covenant"],
    date: "Mar 18",
    excerpt: "Started working through Graeme Goldsworthy's framework. The covenant of works, the covenant of grace — how they thread through...",
    pinned: false,
    body: [],
  },
  {
    id: "5",
    title: "Identity crisis and Ephesians 1",
    folder: "Daily Reflections",
    tags: ["identity", "grace"],
    date: "Mar 14",
    excerpt: "Six times Paul says 'in Christ' or 'in him' in the first 14 verses. Six times. He doesn't want us to miss it...",
    pinned: true,
    body: [],
  },
];

export const prayers = [
  { id: "1", subject: "Dad's health", status: "praying" as const, streak: 12, body: "Lord, be near to my father. Let the doctors have wisdom. Let him feel your peace that surpasses understanding.", updated: "Today" },
  { id: "2", subject: "Grace for this season", status: "praying" as const, streak: 47, body: "I'm asking for endurance. Not just survival, but genuine grace — the kind that makes others curious.", updated: "Today" },
  { id: "3", subject: "Direction for the ministry", status: "praying" as const, streak: 8, body: "Open or close the doors clearly, Lord. I don't want to force anything. But I don't want to miss it either.", updated: "Yesterday" },
  { id: "4", subject: "Reconciliation with James", status: "answered" as const, streak: 0, body: "He reached out yesterday. After 14 months. Only God could have done that.", updated: "Mar 20" },
  { id: "5", subject: "New home", status: "answered" as const, streak: 0, body: "Keys in hand. Grateful beyond words. You heard every cry.", updated: "Feb 28" },
];

export const bibleChapter = {
  book: "John",
  chapter: 15,
  version: "ESV",
  verses: [
    { n: 1, text: "I am the true vine, and my Father is the vinedresser." },
    { n: 2, text: "Every branch in me that does not bear fruit he takes away, and every branch that does bear fruit he prunes, that it may bear more fruit." },
    { n: 3, text: "Already you are clean because of the word that I have spoken to you." },
    { n: 4, text: "Abide in me, and I in you. As the branch cannot bear fruit by itself, unless it abides in the vine, neither can you, unless you abide in me.", highlight: true },
    { n: 5, text: "I am the vine; you are the branches. Whoever abides in me and I in him, he it is that bears much fruit, for apart from me you can do nothing.", highlight: true },
    { n: 6, text: "If anyone does not abide in me he is thrown away like a branch and withers; and the branches are gathered, thrown into the fire, and burned." },
    { n: 7, text: "If you abide in me, and my words abide in you, ask whatever you wish, and it will be done for you." },
    { n: 8, text: "By this my Father is glorified, that you bear much fruit and so prove to be my disciples." },
    { n: 9, text: "As the Father has loved me, so have I loved you. Abide in my love." },
    { n: 10, text: "If you keep my commandments, you will abide in my love, just as I have kept my Father's commandments and abide in his love." },
    { n: 11, text: "These things I have spoken to you, that my joy may be in you, and that your joy may be full." },
  ],
};

export const crossRefs = [
  { ref: "Psalm 80:8–11", note: "Israel as God's vine, brought from Egypt" },
  { ref: "Isaiah 5:1–7", note: "The vineyard of the Lord — a lament" },
  { ref: "Romans 11:17–24", note: "Gentiles grafted in as wild branches" },
  { ref: "Colossians 1:10", note: "Bearing fruit in every good work" },
];

export const aiInsights = [
  { title: "Greek word study", body: "μένω (meno) — to remain, to stay, to continue. Appears 40× in John's Gospel, more than any other NT book. It implies settled, unhurried residence — not a brief visit." },
  { title: "Theological thread", body: "The vine metaphor echoes Israel's identity (Ps 80, Isa 5). Jesus redefines what it means to be God's people: not ethnic lineage, but vital union with him." },
  { title: "Connected entry", body: "Your note on Ephesians 1 explores 'in Christ' language — 6 occurrences in 14 verses. This is the same union John 15 describes from the vine's perspective." },
];

export const readingPlan = {
  name: "Gospels in 30 Days",
  day: 18,
  total: 30,
  today: "John 15–17",
  nextUp: "John 18–19",
};
