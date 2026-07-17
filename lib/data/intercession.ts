import { OT_BOOKS, type BookName } from "@/lib/bible-books";

// ── Types ─────────────────────────────────────────────────

export type IntercessionCategoryId =
  | "called-to-intercede" | "christs-intercession" | "spirits-intercession" | "standing-in-gap"
  | "intercessors-examples" | "praying-for-others" | "praying-for-enemies" | "praying-for-leaders"
  | "persistent-intercession" | "corporate-intercession" | "gods-heart" | "fruit-of-intercession";

export type IntercessionKind = "promise" | "principle" | "warning" | "wisdom";

export interface IntercessionCategory {
  id: IntercessionCategoryId;
  label: string;
  blurb: string;
  icon: string;
  color: string;
}

export interface IntercessionEntry {
  id: string;
  category: IntercessionCategoryId;
  kind: IntercessionKind;
  title: string;
  reference: string;
  book: BookName;
  chapter: number;
  verse: number;
  context: string;
}

export type Testament = "OT" | "NT";

export function testamentOf(book: BookName): Testament {
  return OT_BOOKS.has(book) ? "OT" : "NT";
}

export const INTERCESSION_KINDS: { id: IntercessionKind; label: string; color: string }[] = [
  { id: "promise",   label: "Promise",   color: "var(--bj-gold-deep)" },
  { id: "principle", label: "Principle", color: "var(--bj-ink3)" },
  { id: "warning",   label: "Warning",   color: "var(--bj-ember)" },
  { id: "wisdom",    label: "Wisdom",    color: "var(--bj-sage)" },
];

// ── Categories ────────────────────────────────────────────

export const INTERCESSION_CATEGORIES: IntercessionCategory[] = [
  { id: "called-to-intercede",  label: "Called to Intercede",        blurb: "A right, not a presumption",      icon: "BadgeCheck",    color: "#B08D3E" },
  { id: "christs-intercession", label: "Christ's Intercession",      blurb: "He is praying for you now",       icon: "Flame",         color: "#C98A4B" },
  { id: "spirits-intercession", label: "The Spirit's Intercession",  blurb: "Groanings too deep for words",    icon: "Wind",          color: "#6FA0A0" },
  { id: "standing-in-gap",      label: "Standing in the Gap",        blurb: "Where God looked and found no one", icon: "Fence",       color: "#A65D57" },
  { id: "intercessors-examples", label: "Intercessors in Scripture", blurb: "Ordinary people who stood in",    icon: "Users",         color: "#8A7256" },
  { id: "praying-for-others",   label: "Praying for One Another",    blurb: "Carrying each other before God",  icon: "MessageCircle", color: "#7FA5C4" },
  { id: "praying-for-enemies",  label: "Praying for Enemies",        blurb: "The hardest prayer, commanded",   icon: "Swords",        color: "#9B6BA8" },
  { id: "praying-for-leaders",  label: "Praying for Leaders & Nations", blurb: "The welfare of the city",      icon: "Landmark",      color: "#5B7C99" },
  { id: "persistent-intercession", label: "Persistent, Fervent Prayer", blurb: "Not losing heart",             icon: "Hourglass",     color: "#C9A227" },
  { id: "corporate-intercession", label: "Praying Together",         blurb: "Agreement multiplies",            icon: "UsersRound",    color: "#6B8CAE" },
  { id: "gods-heart",           label: "God's Heart for an Intercessor", blurb: "He is looking for someone",  icon: "Heart",         color: "#C0616B" },
  { id: "fruit-of-intercession", label: "The Fruit of Intercession", blurb: "What changed because someone prayed", icon: "Sprout",   color: "#6E9E5C" },
];

export function getIntercessionCategory(id: IntercessionCategoryId): IntercessionCategory {
  return INTERCESSION_CATEGORIES.find((c) => c.id === id)!;
}

export function getIntercessionKind(id: IntercessionKind) {
  return INTERCESSION_KINDS.find((k) => k.id === id)!;
}

// ── Entries ───────────────────────────────────────────────

export const INTERCESSION_ENTRIES: IntercessionEntry[] = [
  // ── Called to Intercede ────────────────────────────────
  {
    id: "called-to-intercede-1", category: "called-to-intercede", kind: "principle",
    title: "I urge that supplications, prayers, intercessions, and thanksgivings be made for all people",
    reference: "1 Timothy 2:1", book: "1 Timothy", chapter: 2, verse: 1,
    context: "Paul instructs Timothy on priorities for public worship in Ephesus, placing intercession for \"all people\" — not just fellow believers — as the very first item of instruction for how the gathered church should pray.",
  },
  {
    id: "called-to-intercede-2", category: "called-to-intercede", kind: "principle",
    title: "You are a royal priesthood, a holy nation",
    reference: "1 Peter 2:9", book: "1 Peter", chapter: 2, verse: 9,
    context: "Peter applies language once reserved for Israel's priesthood to all believers scattered across Asia Minor. A priest's core function was to stand between God and people — intercession is a natural extension of this identity, not a special gift reserved for a few.",
  },
  {
    id: "called-to-intercede-3", category: "called-to-intercede", kind: "promise",
    title: "Let us then with confidence draw near to the throne of grace",
    reference: "Hebrews 4:16", book: "Hebrews", chapter: 4, verse: 16,
    context: "The writer grounds bold access to God's presence in Christ's sympathetic high priesthood, the same access that makes interceding for others possible rather than presumptuous.",
  },
  {
    id: "called-to-intercede-4", category: "called-to-intercede", kind: "principle",
    title: "We have confidence to enter the holy places by the blood of Jesus",
    reference: "Hebrews 10:19", book: "Hebrews", chapter: 10, verse: 19,
    context: "Under the old covenant, only the high priest could enter God's presence, once a year. The writer announces this restriction has been permanently removed for every believer through Christ's own blood.",
  },
  {
    id: "called-to-intercede-5", category: "called-to-intercede", kind: "principle",
    title: "Praying at all times in the Spirit, with all prayer and supplication... for all the saints",
    reference: "Ephesians 6:18", book: "Ephesians", chapter: 6, verse: 18,
    context: "Immediately after describing the armor of God, Paul names prayer for others as part of the believer's ongoing spiritual equipment, not a separate, optional activity from the battle just described.",
  },
  {
    id: "called-to-intercede-6", category: "called-to-intercede", kind: "wisdom",
    title: "My servant Job shall pray for you, for I will accept his prayer",
    reference: "Job 42:8", book: "Job", chapter: 42, verse: 8,
    context: "After thirty-some chapters of Job's friends giving him bad theology and worse comfort, God instructs them to bring offerings and have Job — the one they had accused — pray on their behalf, designating a specific intercessor rather than leaving them to approach God alone.",
  },

  // ── Christ's Intercession ──────────────────────────────
  {
    id: "christs-intercession-1", category: "christs-intercession", kind: "promise",
    title: "He always lives to make intercession for them",
    reference: "Hebrews 7:25", book: "Hebrews", chapter: 7, verse: 25,
    context: "The writer describes Christ's permanent, unending priesthood — unlike Israel's high priests, who died and were replaced, Christ's intercession for those who come to God through Him never stops.",
  },
  {
    id: "christs-intercession-2", category: "christs-intercession", kind: "principle",
    title: "Christ Jesus... is at the right hand of God, who indeed is interceding for us",
    reference: "Romans 8:34", book: "Romans", chapter: 8, verse: 34,
    context: "Paul lists this alongside Christ's death and resurrection as part of the unshakeable security believers have against any accusation — the resurrected Christ is not passive in heaven, but actively interceding.",
  },
  {
    id: "christs-intercession-3", category: "christs-intercession", kind: "principle",
    title: "If anyone does sin, we have an advocate with the Father, Jesus Christ the righteous",
    reference: "1 John 2:1", book: "1 John", chapter: 2, verse: 1,
    context: "John writes this so that his readers \"may not sin,\" but immediately provides for the reality that they will — Christ's advocacy is presented as the ordinary remedy for ongoing failure, not a one-time transaction.",
  },
  {
    id: "christs-intercession-4", category: "christs-intercession", kind: "wisdom",
    title: "I have prayed for you that your faith may not fail",
    reference: "Luke 22:32", book: "Luke", chapter: 22, verse: 32,
    context: "Jesus tells Peter this the same night He predicts Peter will deny Him three times — Christ's intercession is aimed not at preventing the failure but at ensuring it doesn't become final.",
  },
  {
    id: "christs-intercession-5", category: "christs-intercession", kind: "wisdom",
    title: "I do not ask for these only, but also for those who will believe in me through their word",
    reference: "John 17:20", book: "John", chapter: 17, verse: 20,
    context: "Part of Jesus's high priestly prayer on the night of His arrest, where He deliberately widens His intercession beyond the eleven disciples in the room to every believer who would come after them — including today.",
  },

  // ── The Spirit's Intercession ──────────────────────────
  {
    id: "spirits-intercession-1", category: "spirits-intercession", kind: "principle",
    title: "The Spirit himself intercedes for us with groanings too deep for words",
    reference: "Romans 8:26", book: "Romans", chapter: 8, verse: 26,
    context: "Paul writes this in the middle of a passage about groaning creation and suffering believers, describing prayer that happens beneath and beyond articulate language, when a person genuinely doesn't know what to pray.",
  },
  {
    id: "spirits-intercession-2", category: "spirits-intercession", kind: "principle",
    title: "The Spirit intercedes for the saints according to the will of God",
    reference: "Romans 8:27", book: "Romans", chapter: 8, verse: 27,
    context: "Continuing the previous verse, Paul assures believers that even when their own prayers are inarticulate or misguided, the Spirit's intercession on their behalf is always perfectly aligned with God's will.",
  },
  {
    id: "spirits-intercession-3", category: "spirits-intercession", kind: "principle",
    title: "Praying in the Holy Spirit",
    reference: "Jude 1:20", book: "Jude", chapter: 1, verse: 20,
    context: "Jude writes to believers facing infiltration by false teachers, instructing them to build themselves up through prayer that is actively enabled and shaped by the Spirit, not merely their own words.",
  },
  {
    id: "spirits-intercession-4", category: "spirits-intercession", kind: "promise",
    title: "I will pour out... a spirit of grace and pleas for mercy",
    reference: "Zechariah 12:10", book: "Zechariah", chapter: 12, verse: 10,
    context: "Zechariah prophesies a coming day when God Himself would give His people the very capacity to plead for mercy — the Spirit not only hears intercession but produces the desire and words for it.",
  },
  {
    id: "spirits-intercession-5", category: "spirits-intercession", kind: "principle",
    title: "God has sent the Spirit of his Son into our hearts, crying, 'Abba! Father!'",
    reference: "Galatians 4:6", book: "Galatians", chapter: 4, verse: 6,
    context: "Paul describes the Spirit as the one actually voicing intimate access to the Father within believers, the same Spirit-given confidence that makes approaching God on behalf of others possible.",
  },

  // ── Standing in the Gap ─────────────────────────────────
  {
    id: "standing-in-gap-1", category: "standing-in-gap", kind: "warning",
    title: "I sought for a man among them who should build up the wall and stand in the gap before me for the land, but I found none",
    reference: "Ezekiel 22:30", book: "Ezekiel", chapter: 22, verse: 30,
    context: "Spoken into a Judah so thoroughly corrupt — princes, priests, prophets, and people all indicted in the surrounding verses — that God searches specifically for one intercessor who might avert judgment, and finds no one.",
  },
  {
    id: "standing-in-gap-2", category: "standing-in-gap", kind: "warning",
    title: "He saw that there was no man, and wondered that there was no one to intercede",
    reference: "Isaiah 59:16", book: "Isaiah", chapter: 59, verse: 16,
    context: "Isaiah describes a society so saturated with injustice that God's own astonishment is recorded at finding no intercessor — the verse continues that His own arm brought salvation since none was found.",
  },
  {
    id: "standing-in-gap-3", category: "standing-in-gap", kind: "wisdom",
    title: "Moses, his chosen one, stood in the breach before him, to turn away his wrath from destroying them",
    reference: "Psalm 106:23", book: "Psalms", chapter: 106, verse: 23,
    context: "This psalm recounts Israel's repeated failures in the wilderness, singling out Moses's intercession after the golden calf as the specific thing that stood between the nation and its own destruction.",
  },
  {
    id: "standing-in-gap-4", category: "standing-in-gap", kind: "wisdom",
    title: "The LORD relented from the disaster that he had spoken of bringing on his people",
    reference: "Exodus 32:14", book: "Exodus", chapter: 32, verse: 14,
    context: "Immediately after Israel worships the golden calf, Moses argues with God on the mountain — appealing to God's own reputation and prior promises — and this verse records the outcome of that intercession.",
  },
  {
    id: "standing-in-gap-5", category: "standing-in-gap", kind: "wisdom",
    title: "Will you indeed sweep away the righteous with the wicked?",
    reference: "Genesis 18:32", book: "Genesis", chapter: 18, verse: 32,
    context: "Abraham negotiates with God over the fate of Sodom, repeatedly lowering the number of righteous people required to spare the city, down to just ten — a striking picture of an intercessor pressing into God's mercy on behalf of people who never asked him to.",
  },

  // ── Intercessors in Scripture ───────────────────────────
  {
    id: "intercessors-examples-1", category: "intercessors-examples", kind: "principle",
    title: "Far be it from me that I should sin against the LORD by ceasing to pray for you",
    reference: "1 Samuel 12:23", book: "1 Samuel", chapter: 12, verse: 23,
    context: "Samuel says this to Israel after they demand a king, rejecting his leadership — despite being personally sidelined, he considers it a sin to stop interceding for the very people who rejected him.",
  },
  {
    id: "intercessors-examples-2", category: "intercessors-examples", kind: "wisdom",
    title: "O Lord, hear; O Lord, forgive... for your own sake, O my God, because your city and your people are called by your name",
    reference: "Daniel 9:19", book: "Daniel", chapter: 9, verse: 19,
    context: "Daniel, an exile in Babylon with no personal political power, spends this chapter confessing his nation's sins as his own and pleading for Jerusalem's restoration, grounding his appeal in God's own name and reputation rather than Israel's merit.",
  },
  {
    id: "intercessors-examples-3", category: "intercessors-examples", kind: "wisdom",
    title: "I continued praying and fasting before the God of heaven",
    reference: "Nehemiah 1:6", book: "Nehemiah", chapter: 1, verse: 6,
    context: "Nehemiah, a Jewish cupbearer serving in the Persian court, weeps and intercedes for days upon hearing that Jerusalem's walls lie in ruins, confessing the sins of a people he had never personally lived among.",
  },
  {
    id: "intercessors-examples-4", category: "intercessors-examples", kind: "wisdom",
    title: "If I perish, I perish",
    reference: "Esther 4:16", book: "Esther", chapter: 4, verse: 16,
    context: "Esther, urged by Mordecai to intervene for her people, calls for a three-day fast before she dares approach the king uninvited — a capital offense — risking her own life to intercede for a nation under threat of extermination.",
  },
  {
    id: "intercessors-examples-5", category: "intercessors-examples", kind: "wisdom",
    title: "God healed Abimelech, and also healed his wife and female slaves so that they bore children",
    reference: "Genesis 20:17", book: "Genesis", chapter: 20, verse: 17,
    context: "After Abimelech unknowingly takes Sarah into his household, God tells him Abraham is a prophet who will pray for him — Abraham then intercedes for the very king his own deception had endangered, and healing follows.",
  },

  // ── Praying for One Another ─────────────────────────────
  {
    id: "praying-for-others-1", category: "praying-for-others", kind: "principle",
    title: "Confess your sins to one another and pray for one another, that you may be healed",
    reference: "James 5:16", book: "James", chapter: 5, verse: 16,
    context: "James ties mutual confession directly to mutual intercession, presenting healing — physical and relational — as something the gathered community pursues together rather than in isolation.",
  },
  {
    id: "praying-for-others-2", category: "praying-for-others", kind: "wisdom",
    title: "We have not ceased to pray for you, asking that you be filled with the knowledge of his will",
    reference: "Colossians 1:9", book: "Colossians", chapter: 1, verse: 9,
    context: "Paul writes this to a church he had never personally visited, modeling intercession that reaches people known only by reputation, asking specifically for their spiritual growth rather than only their circumstances.",
  },
  {
    id: "praying-for-others-3", category: "praying-for-others", kind: "wisdom",
    title: "I do not cease to give thanks for you, remembering you in my prayers",
    reference: "Ephesians 1:16", book: "Ephesians", chapter: 1, verse: 16,
    context: "Paul opens this letter by describing his own ongoing, specific practice of remembering the Ephesian believers before God, pairing thanksgiving with intercession as a single habit rather than two separate disciplines.",
  },
  {
    id: "praying-for-others-4", category: "praying-for-others", kind: "wisdom",
    title: "It is my prayer that your love may abound more and more, with knowledge and all discernment",
    reference: "Philippians 1:9", book: "Philippians", chapter: 1, verse: 9,
    context: "Writing from prison, Paul's intercession for the Philippian church he loves is aimed at their character and discernment growing, not merely at his own release or comfort.",
  },
  {
    id: "praying-for-others-5", category: "praying-for-others", kind: "wisdom",
    title: "We always pray for you, that our God may make you worthy of his calling",
    reference: "2 Thessalonians 1:11", book: "2 Thessalonians", chapter: 1, verse: 11,
    context: "Paul writes to a young, persecuted church, describing continual intercession focused on their endurance and faithfulness under pressure rather than the removal of the pressure itself.",
  },
  {
    id: "praying-for-others-6", category: "praying-for-others", kind: "principle",
    title: "Bear one another's burdens, and so fulfill the law of Christ",
    reference: "Galatians 6:2", book: "Galatians", chapter: 6, verse: 2,
    context: "Paul instructs a church wrestling with legalistic division that carrying each other's burdens — including, implicitly, in prayer — is itself the practical fulfillment of Christ's law of love.",
  },

  // ── Praying for Enemies ──────────────────────────────────
  {
    id: "praying-for-enemies-1", category: "praying-for-enemies", kind: "principle",
    title: "Love your enemies and pray for those who persecute you",
    reference: "Matthew 5:44", book: "Matthew", chapter: 5, verse: 44,
    context: "Jesus radically extends the definition of \"neighbor\" in the Sermon on the Mount, confronting a culture — and a human instinct — that limited intercession to allies and family alone.",
  },
  {
    id: "praying-for-enemies-2", category: "praying-for-enemies", kind: "wisdom",
    title: "Father, forgive them, for they know not what they do",
    reference: "Luke 23:34", book: "Luke", chapter: 23, verse: 34,
    context: "Jesus prays this from the cross itself, interceding for the soldiers actively crucifying Him — the ultimate demonstration of praying for enemies while the harm is still being done.",
  },
  {
    id: "praying-for-enemies-3", category: "praying-for-enemies", kind: "wisdom",
    title: "Lord, do not hold this sin against them",
    reference: "Acts 7:60", book: "Acts", chapter: 7, verse: 60,
    context: "Stephen, the first Christian martyr, kneels and prays this as he is being stoned to death, echoing Jesus's own prayer from the cross and modeling the same posture toward his killers, one of whom — Saul — later becomes the apostle Paul.",
  },
  {
    id: "praying-for-enemies-4", category: "praying-for-enemies", kind: "principle",
    title: "Bless those who persecute you; bless and do not curse them",
    reference: "Romans 12:14", book: "Romans", chapter: 12, verse: 14,
    context: "Paul writes to a Roman church that would soon face real persecution under Nero, instructing them toward blessing rather than cursing as the default response to those causing them harm.",
  },
  {
    id: "praying-for-enemies-5", category: "praying-for-enemies", kind: "principle",
    title: "Do not repay evil for evil... but on the contrary, bless, that you may obtain a blessing",
    reference: "1 Peter 3:9", book: "1 Peter", chapter: 3, verse: 9,
    context: "Peter writes to believers scattered across the empire facing social hostility for their faith, tying the blessing they themselves have inherited to their willingness to extend blessing back to those who mistreat them.",
  },

  // ── Praying for Leaders & Nations ────────────────────────
  {
    id: "praying-for-leaders-1", category: "praying-for-leaders", kind: "principle",
    title: "For kings and all who are in high positions, that we may lead a peaceful and quiet life",
    reference: "1 Timothy 2:2", book: "1 Timothy", chapter: 2, verse: 2,
    context: "Paul instructs Timothy's church to pray for the very Roman authorities who held no particular goodwill toward Christians, tying societal peace to the church's intercession rather than its political maneuvering.",
  },
  {
    id: "praying-for-leaders-2", category: "praying-for-leaders", kind: "principle",
    title: "Seek the welfare of the city where I have sent you into exile, and pray to the LORD on its behalf",
    reference: "Jeremiah 29:7", book: "Jeremiah", chapter: 29, verse: 7,
    context: "Jeremiah writes to Judean exiles in Babylon — the very empire that destroyed their homeland — instructing them to intercede for their captors' city, since \"in its welfare you will find your welfare.\"",
  },
  {
    id: "praying-for-leaders-3", category: "praying-for-leaders", kind: "wisdom",
    title: "That they may offer... pray for the life of the king and his sons",
    reference: "Ezra 6:10", book: "Ezra", chapter: 6, verse: 10,
    context: "A Persian royal decree, quoted in Ezra, actually funds temple sacrifices in Jerusalem on the condition that the priests pray for the pagan king's life — even a foreign ruler recognized the value of intercession he didn't personally believe in.",
  },
  {
    id: "praying-for-leaders-4", category: "praying-for-leaders", kind: "promise",
    title: "If my people who are called by my name humble themselves, and pray... then I will hear from heaven and will heal their land",
    reference: "2 Chronicles 7:14", book: "2 Chronicles", chapter: 7, verse: 14,
    context: "God gives this promise to Solomon after the temple dedication, tying national healing directly to the humility and intercession of His own people, not to the righteousness of the nation's rulers alone.",
  },
  {
    id: "praying-for-leaders-5", category: "praying-for-leaders", kind: "principle",
    title: "Pray for the peace of Jerusalem: 'May they be secure who love you!'",
    reference: "Psalm 122:6", book: "Psalms", chapter: 122, verse: 6,
    context: "A pilgrim's song sung on the way up to Jerusalem for festival worship, turning love for the city into a specific, spoken intercession for its peace and security rather than mere sentiment.",
  },

  // ── Persistent, Fervent Prayer ────────────────────────────
  {
    id: "persistent-intercession-1", category: "persistent-intercession", kind: "principle",
    title: "They ought always to pray and not lose heart",
    reference: "Luke 18:1", book: "Luke", chapter: 18, verse: 1,
    context: "Jesus introduces the parable of the persistent widow who wears down an unjust judge with this stated purpose, teaching that God's willingness to answer is nothing like the judge's reluctance — but persistence still matters.",
  },
  {
    id: "persistent-intercession-2", category: "persistent-intercession", kind: "wisdom",
    title: "Elijah... prayed fervently that it might not rain, and for three years and six months it did not rain",
    reference: "James 5:17", book: "James", chapter: 5, verse: 17,
    context: "James deliberately notes Elijah \"was a man with a nature like ours\" before citing this example, insisting fervent, effective intercession isn't reserved for spiritual superheroes but is available to ordinary people.",
  },
  {
    id: "persistent-intercession-3", category: "persistent-intercession", kind: "wisdom",
    title: "Always struggling on your behalf in his prayers, that you may stand mature and fully assured",
    reference: "Colossians 4:12", book: "Colossians", chapter: 4, verse: 12,
    context: "Paul describes Epaphras, a leader from the Colossian church itself, wrestling in intercession for his own congregation from a distance — the word translated \"struggling\" evokes an athlete's exhausting effort.",
  },
  {
    id: "persistent-intercession-4", category: "persistent-intercession", kind: "wisdom",
    title: "I will not let you go unless you bless me",
    reference: "Genesis 32:26", book: "Genesis", chapter: 32, verse: 26,
    context: "Jacob wrestles all night with a mysterious figure before crossing back into the land where his estranged brother Esau awaits him, refusing to release his grip until he receives a blessing — a vivid picture of refusing to let go in prayer.",
  },
  {
    id: "persistent-intercession-5", category: "persistent-intercession", kind: "principle",
    title: "Because of his impudence he will rise and give him whatever he needs",
    reference: "Luke 11:8", book: "Luke", chapter: 11, verse: 8,
    context: "Part of the parable of the friend who keeps knocking at midnight for bread, Jesus uses shameless persistence — not politeness or worthiness — as the quality that gets a response, immediately followed by \"ask, seek, knock.\"",
  },

  // ── Praying Together ──────────────────────────────────────
  {
    id: "corporate-intercession-1", category: "corporate-intercession", kind: "promise",
    title: "If two of you agree on earth about anything they ask, it will be done for them",
    reference: "Matthew 18:19", book: "Matthew", chapter: 18, verse: 19,
    context: "Jesus ties this promise to agreement between even just two people, immediately after teaching on church discipline and reconciliation, framing united prayer as an exercise of real kingdom authority.",
  },
  {
    id: "corporate-intercession-2", category: "corporate-intercession", kind: "wisdom",
    title: "Earnest prayer for him was made to God by the church",
    reference: "Acts 12:5", book: "Acts", chapter: 12, verse: 5,
    context: "While Peter sits in prison awaiting execution the morning after Herod's arrest, the church gathers in continuous, earnest intercession — an angel frees him that same night, arriving so unexpectedly that the praying believers don't initially believe it's really him at the door.",
  },
  {
    id: "corporate-intercession-3", category: "corporate-intercession", kind: "wisdom",
    title: "All these with one accord were devoting themselves to prayer",
    reference: "Acts 1:14", book: "Acts", chapter: 1, verse: 14,
    context: "Between Jesus's ascension and Pentecost, the disciples — along with Mary and Jesus's brothers — gather in sustained, unified prayer, the corporate posture out of which the church's mission would be launched.",
  },
  {
    id: "corporate-intercession-4", category: "corporate-intercession", kind: "wisdom",
    title: "They lifted their voices together to God",
    reference: "Acts 4:24", book: "Acts", chapter: 4, verse: 24,
    context: "After Peter and John are released from custody and threatened by the religious council, the gathered church responds not with strategy meetings but with united prayer — the place where they were praying is later described as being physically shaken.",
  },
  {
    id: "corporate-intercession-5", category: "corporate-intercession", kind: "principle",
    title: "You also must help us by prayer, so that... many will give thanks on our behalf",
    reference: "2 Corinthians 1:11", book: "2 Corinthians", chapter: 1, verse: 11,
    context: "Paul openly asks the Corinthian church to intercede for him after describing a crisis in Asia so severe he \"despaired of life itself,\" treating their prayer as a genuine, necessary contribution to his deliverance.",
  },

  // ── God's Heart for an Intercessor ────────────────────────
  {
    id: "gods-heart-1", category: "gods-heart", kind: "principle",
    title: "I have set watchmen on your walls... who put the LORD in remembrance, take no rest",
    reference: "Isaiah 62:6", book: "Isaiah", chapter: 62, verse: 6,
    context: "Isaiah pictures God Himself appointing intercessors like watchmen on Jerusalem's walls, whose task is to keep reminding God of His own promises until the city's restoration is complete.",
  },
  {
    id: "gods-heart-2", category: "gods-heart", kind: "wisdom",
    title: "Shall I hide from Abraham what I am about to do?",
    reference: "Genesis 18:17", book: "Genesis", chapter: 18, verse: 17,
    context: "Before revealing His plans for Sodom, God deliberately chooses to let Abraham in on what He's about to do — the intercession that follows is only possible because God first invited Abraham into His confidence.",
  },
  {
    id: "gods-heart-3", category: "gods-heart", kind: "principle",
    title: "Surely the Lord GOD does nothing without revealing his secret to his servants the prophets",
    reference: "Amos 3:7", book: "Amos", chapter: 3, verse: 7,
    context: "Amos states a pattern seen throughout scripture: God shares His intentions with those close enough to Him to intercede, rather than acting in secret — friendship with God precedes effective intercession for others.",
  },
  {
    id: "gods-heart-4", category: "gods-heart", kind: "warning",
    title: "Run to and fro through the streets of Jerusalem... if you can find a man... who seeks truth, that I may pardon her",
    reference: "Jeremiah 5:1", book: "Jeremiah", chapter: 5, verse: 1,
    context: "God issues an open search through the corrupt capital, echoing the same grief later expressed in Ezekiel 22 — He is actively looking for even one person whose intercession might change the coming outcome.",
  },
  {
    id: "gods-heart-5", category: "gods-heart", kind: "principle",
    title: "I have called you friends, for all that I have heard from my Father I have made known to you",
    reference: "John 15:15", book: "John", chapter: 15, verse: 15,
    context: "Jesus redefines His relationship with the disciples from servants to friends at the Last Supper, tying that friendship to shared knowledge of the Father's business — the same relational basis intercession has always required.",
  },

  // ── The Fruit of Intercession ──────────────────────────────
  {
    id: "fruit-of-intercession-1", category: "fruit-of-intercession", kind: "wisdom",
    title: "The LORD restored the fortunes of Job when he had prayed for his friends",
    reference: "Job 42:10", book: "Job", chapter: 42, verse: 10,
    context: "Job's own restoration is explicitly tied to the moment he intercedes for the three friends who had wrongly accused him throughout the book — his healing and their forgiveness arrive in the very same act.",
  },
  {
    id: "fruit-of-intercession-2", category: "fruit-of-intercession", kind: "wisdom",
    title: "Moses prayed for the people... and the LORD said to Moses, 'Make a fiery serpent'",
    reference: "Numbers 21:7", book: "Numbers", chapter: 21, verse: 7,
    context: "After venomous snakes strike the complaining Israelites in the wilderness, the people ask Moses to intercede — God's answer provides a specific, visible means of healing for anyone who would look at it in faith.",
  },
  {
    id: "fruit-of-intercession-3", category: "fruit-of-intercession", kind: "wisdom",
    title: "The LORD listened to the voice of Elijah, and the life of the child came into him again",
    reference: "1 Kings 17:22", book: "1 Kings", chapter: 17, verse: 22,
    context: "Elijah stretches himself over the dead body of a widow's son three times and cries out to God on the boy's behalf — a foreign widow's grief becomes the occasion for one of the Old Testament's clearest resurrection accounts.",
  },
  {
    id: "fruit-of-intercession-4", category: "fruit-of-intercession", kind: "wisdom",
    title: "God remembered Abraham and sent Lot out of the midst of the overthrow",
    reference: "Genesis 19:29", book: "Genesis", chapter: 19, verse: 29,
    context: "Though Sodom is ultimately destroyed, this verse ties Lot's rescue directly back to Abraham's earlier intercession in the previous chapter — the prayer didn't save the city, but it did reach the one relative inside it.",
  },
  {
    id: "fruit-of-intercession-5", category: "fruit-of-intercession", kind: "wisdom",
    title: "Peter... knelt down and prayed... 'Tabitha, arise'",
    reference: "Acts 9:40", book: "Acts", chapter: 9, verse: 40,
    context: "Called to the room where a beloved disciple named Tabitha lay dead, Peter prays before he speaks a word to the body — the raising that follows is presented as an answer to intercession, not a command performed on his own authority.",
  },
];

// ── Helpers ───────────────────────────────────────────────

export function getIntercessionEntryById(id: string): IntercessionEntry | undefined {
  return INTERCESSION_ENTRIES.find((e) => e.id === id);
}

export function intercessionEntriesInCategory(category: IntercessionCategoryId): IntercessionEntry[] {
  return INTERCESSION_ENTRIES.filter((e) => e.category === category);
}

/** Deterministic daily pick — stable for the whole calendar day, changes automatically the next. */
export function intercessionEntryOfTheDay(date: Date = new Date()): IntercessionEntry {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const diff = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - start;
  const dayOfYear = Math.floor(diff / 86400000);
  return INTERCESSION_ENTRIES[dayOfYear % INTERCESSION_ENTRIES.length];
}
