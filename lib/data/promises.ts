import { OT_BOOKS, type BookName } from "@/lib/bible-books";

// ── Types ─────────────────────────────────────────────────

export type PromiseCategoryId =
  | "presence" | "provision" | "protection" | "peace" | "strength"
  | "guidance" | "healing" | "forgiveness" | "restoration" | "salvation"
  | "faithfulness" | "blessing" | "wisdom" | "hope" | "justice"
  | "identity" | "spirit" | "return" | "rest";

export interface PromiseCategory {
  id: PromiseCategoryId;
  label: string;
  blurb: string;
  icon: string;
  color: string;
}

export interface Promise {
  id: string;
  category: PromiseCategoryId;
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

// ── Categories ────────────────────────────────────────────

export const PROMISE_CATEGORIES: PromiseCategory[] = [
  { id: "presence",     label: "Presence",        blurb: "He is near, not distant",         icon: "Sun",       color: "#D4A24E" },
  { id: "provision",    label: "Provision",       blurb: "He meets every need",              icon: "Wheat",     color: "#C98A4B" },
  { id: "protection",   label: "Protection",      blurb: "He shields and defends",           icon: "Shield",    color: "#5B7C99" },
  { id: "peace",        label: "Peace",           blurb: "He calms the storm",               icon: "Feather",   color: "#7FA98C" },
  { id: "strength",     label: "Strength & Courage", blurb: "He renews the weary",           icon: "Mountain",  color: "#A65D57" },
  { id: "guidance",     label: "Guidance",        blurb: "He directs the path",              icon: "Route",     color: "#6B8CAE" },
  { id: "healing",      label: "Healing",         blurb: "He restores what's broken",        icon: "HeartPulse",color: "#C0616B" },
  { id: "forgiveness",  label: "Forgiveness & Mercy", blurb: "He removes every stain",       icon: "Droplets",  color: "#7FA5C4" },
  { id: "restoration",  label: "Restoration",     blurb: "He returns what was lost",         icon: "Sunrise",   color: "#E08E45" },
  { id: "salvation",    label: "Salvation & Eternal Life", blurb: "He rescues and gives life", icon: "Infinity", color: "#8E6FA8" },
  { id: "faithfulness", label: "Faithfulness & Covenant", blurb: "His word never fails",     icon: "Anchor",    color: "#4F7C82" },
  { id: "blessing",     label: "Blessing & Prosperity", blurb: "He causes you to flourish",  icon: "Sprout",    color: "#6E9E5C" },
  { id: "wisdom",       label: "Wisdom & Understanding", blurb: "He gives understanding freely", icon: "Lightbulb", color: "#C9A227" },
  { id: "hope",         label: "Hope & the Future", blurb: "He secures the future",          icon: "Star",      color: "#4A6FA5" },
  { id: "justice",      label: "Justice & Vindication", blurb: "He makes all things right",  icon: "Scale",     color: "#8A7256" },
  { id: "identity",     label: "Identity & Sonship", blurb: "He names you His own",          icon: "Crown",     color: "#B08D3E" },
  { id: "spirit",       label: "The Holy Spirit & Power", blurb: "He empowers from within",  icon: "Wind",      color: "#6FA0A0" },
  { id: "return",       label: "Christ's Return & New Creation", blurb: "He is coming again", icon: "Gem",      color: "#9B6BA8" },
  { id: "rest",         label: "Rest",            blurb: "He gives what striving can't",     icon: "Moon",      color: "#5C6E9E" },
];

export function getCategory(id: PromiseCategoryId): PromiseCategory {
  return PROMISE_CATEGORIES.find((c) => c.id === id)!;
}

// ── Promises ──────────────────────────────────────────────

export const PROMISES: Promise[] = [
  // ── Presence ──────────────────────────────────────────
  {
    id: "presence-1", category: "presence",
    title: "I am with you and will keep you wherever you go",
    reference: "Genesis 28:15", book: "Genesis", chapter: 28, verse: 15,
    context: "Jacob is fleeing his brother Esau's fury after stealing the family blessing, alone and afraid on the road to Haran. God meets him in a dream with a stairway reaching to heaven and promises His personal presence and an eventual return to the land — the start of Jacob's lifelong encounter with a covenant-keeping God.",
  },
  {
    id: "presence-2", category: "presence",
    title: "He will never leave you nor forsake you",
    reference: "Deuteronomy 31:6", book: "Deuteronomy", chapter: 31, verse: 6,
    context: "Moses, at the very end of his life, commissions Joshua and the whole nation just before they cross into the Promised Land without him. Facing walled cities and unfamiliar enemies, they are told that God Himself goes before them and will not abandon them.",
  },
  {
    id: "presence-3", category: "presence",
    title: "As I was with Moses, so I will be with you",
    reference: "Joshua 1:5", book: "Joshua", chapter: 1, verse: 5,
    context: "Spoken directly to Joshua immediately after Moses' death, as leadership of a nation of former slaves now rests on him. God ties His presence with Joshua to the very same presence that parted the Red Sea under Moses.",
  },
  {
    id: "presence-4", category: "presence",
    title: "Fear not, for I am with you",
    reference: "Isaiah 41:10", book: "Isaiah", chapter: 41, verse: 10,
    context: "Israel lives under the shadow of coming conquest and exile, feeling forgotten among the nations. Isaiah delivers this as part of a courtroom-style declaration reminding a frightened, scattered people that their God has not lost sight of them.",
  },
  {
    id: "presence-5", category: "presence",
    title: "I am with you always, to the end of the age",
    reference: "Matthew 28:20", book: "Matthew", chapter: 28, verse: 20,
    context: "The resurrected Jesus's final words to His eleven remaining disciples on a mountain in Galilee, just before His ascension, commissioning them to make disciples of every nation under the promise of His ongoing presence.",
  },
  {
    id: "presence-6", category: "presence",
    title: "The LORD your God is in your midst, and he will rejoice over you with gladness",
    reference: "Zephaniah 3:17", book: "Zephaniah", chapter: 3, verse: 17,
    context: "Zephaniah prophesies to a Judah steeped in idolatry and impending judgment, yet closes his short book with a startling image: God not merely tolerating His people, but singing over them with joy once restoration comes.",
  },
  {
    id: "presence-7", category: "presence",
    title: "Draw near to God, and he will draw near to you",
    reference: "James 4:8", book: "James", chapter: 4, verse: 8,
    context: "James writes to scattered, quarrelsome believers torn between friendship with the world and devotion to God, framing closeness with God as a responsive relationship — the first step is always open to whoever will take it.",
  },

  // ── Provision ─────────────────────────────────────────
  {
    id: "provision-1", category: "provision",
    title: "The LORD Will Provide",
    reference: "Genesis 22:14", book: "Genesis", chapter: 22, verse: 14,
    context: "At the climax of the most severe test of Abraham's faith — being asked to offer his long-awaited son Isaac on Mount Moriah — God provides a ram caught in a thicket at the last moment. Abraham names the place \"The LORD Will Provide,\" a name that became a byword in Israel.",
  },
  {
    id: "provision-2", category: "provision",
    title: "The LORD is my shepherd; I shall not want",
    reference: "Psalm 23:1", book: "Psalms", chapter: 23, verse: 1,
    context: "David, a former shepherd, draws on firsthand knowledge of how a good shepherd cares for sheep — leading them to pasture, water, and safety — to picture God's provision over his own life in the most beloved of all psalms.",
  },
  {
    id: "provision-3", category: "provision",
    title: "Seek first the kingdom of God, and all these things will be added to you",
    reference: "Matthew 6:33", book: "Matthew", chapter: 6, verse: 33,
    context: "Part of the Sermon on the Mount, spoken to a crowd anxious about food and clothing under Roman occupation and agrarian uncertainty. Jesus points to the birds and wildflowers as evidence that a Father who feeds them will not neglect His own children.",
  },
  {
    id: "provision-4", category: "provision",
    title: "My God will supply every need of yours",
    reference: "Philippians 4:19", book: "Philippians", chapter: 4, verse: 19,
    context: "Paul writes from prison, having just thanked the Philippian church for a financial gift they sent him despite their own poverty. He assures them that the same generosity they showed him will be repaid by God's abundant supply.",
  },
  {
    id: "provision-5", category: "provision",
    title: "Those who seek the LORD lack no good thing",
    reference: "Psalm 34:10", book: "Psalms", chapter: 34, verse: 10,
    context: "David composed this psalm after feigning madness to escape King Achish of Gath — a humiliating but effective survival tactic. Having just escaped death, he testifies that dependence on God, not scheming, is what truly sustains a person.",
  },
  {
    id: "provision-6", category: "provision",
    title: "Bring the full tithe... and see if I will not pour down for you a blessing",
    reference: "Malachi 3:10", book: "Malachi", chapter: 3, verse: 10,
    context: "The last Old Testament prophet confronts a post-exilic Judah grown spiritually apathetic, withholding offerings and going through religious motions without heart. God issues a direct challenge to test His faithfulness through generosity.",
  },
  {
    id: "provision-7", category: "provision",
    title: "God is able to make all grace abound to you",
    reference: "2 Corinthians 9:8", book: "2 Corinthians", chapter: 9, verse: 8,
    context: "Paul urges the Corinthian church to follow through on a promised collection for suffering believers in Jerusalem, teaching that generous giving flows from — and is replenished by — God's abundant grace rather than personal lack.",
  },

  // ── Protection ────────────────────────────────────────
  {
    id: "protection-1", category: "protection",
    title: "He who dwells in the shelter of the Most High will abide in the shadow of the Almighty",
    reference: "Psalm 91:1", book: "Psalms", chapter: 91, verse: 1,
    context: "Traditionally linked to Moses or written for those facing plague and war, Psalm 91 meditates on the safety found in intimate nearness to God rather than in visible security — a psalm soldiers, travelers, and the sick have leaned on for millennia.",
  },
  {
    id: "protection-2", category: "protection",
    title: "The LORD will keep you from all evil; he will keep your life",
    reference: "Psalm 121:7", book: "Psalms", chapter: 121, verse: 7,
    context: "A \"Song of Ascents\" sung by pilgrims climbing the dangerous, bandit-prone roads up to Jerusalem for festival worship, expressing confidence that the God who never slumbers watches every step of the journey, coming and going.",
  },
  {
    id: "protection-3", category: "protection",
    title: "No weapon that is fashioned against you shall succeed",
    reference: "Isaiah 54:17", book: "Isaiah", chapter: 54, verse: 17,
    context: "Isaiah speaks to a nation about to endure exile and national humiliation, promising that beyond the coming judgment lies a future where God Himself vindicates and defends His people against every accusation and attack.",
  },
  {
    id: "protection-4", category: "protection",
    title: "The name of the LORD is a strong tower; the righteous run into it and are safe",
    reference: "Proverbs 18:10", book: "Proverbs", chapter: 18, verse: 10,
    context: "One of Solomon's compact wisdom sayings, drawing on the image of fortified towers city-dwellers fled to during an attack, teaching that God's character itself is the safest refuge a person can run to.",
  },
  {
    id: "protection-5", category: "protection",
    title: "The Lord is faithful. He will establish you and guard you against the evil one",
    reference: "2 Thessalonians 3:3", book: "2 Thessalonians", chapter: 3, verse: 3,
    context: "Paul writes to a young church confused and shaken by false teaching about the timing of Christ's return, reassuring them that whatever chaos surrounds them, God's faithfulness to guard them personally does not waver.",
  },
  {
    id: "protection-6", category: "protection",
    title: "The LORD is my light and my salvation; whom shall I fear?",
    reference: "Psalm 27:1", book: "Psalms", chapter: 27, verse: 1,
    context: "David wrote this while surrounded by enemies seeking his life, likely during Saul's pursuit of him, turning fear into worship by fixing his confidence on God's character rather than his circumstances.",
  },

  // ── Peace ─────────────────────────────────────────────
  {
    id: "peace-1", category: "peace",
    title: "Peace I leave with you; my peace I give to you",
    reference: "John 14:27", book: "John", chapter: 14, verse: 27,
    context: "Spoken in the upper room during the Last Supper, hours before His arrest, as Jesus prepares grieving disciples for His departure by leaving them a peace unlike anything the anxious world around them could offer.",
  },
  {
    id: "peace-2", category: "peace",
    title: "The peace of God, which surpasses all understanding, will guard your hearts and minds",
    reference: "Philippians 4:7", book: "Philippians", chapter: 4, verse: 7,
    context: "Written from a Roman prison cell, Paul instructs a church he loves not to be anxious about anything but to bring every concern to God in prayer, promising a peace that defies rational explanation given his own circumstances.",
  },
  {
    id: "peace-3", category: "peace",
    title: "You keep him in perfect peace whose mind is stayed on you",
    reference: "Isaiah 26:3", book: "Isaiah", chapter: 26, verse: 3,
    context: "Part of a victory song Isaiah gives Judah to sing \"in that day\" of deliverance, contrasting the crumbling security of proud cities with the unshakeable peace available to anyone who fixes their thoughts on God.",
  },
  {
    id: "peace-4", category: "peace",
    title: "In the world you will have tribulation. But take heart; I have overcome the world",
    reference: "John 16:33", book: "John", chapter: 16, verse: 33,
    context: "The closing words of Jesus's final teaching before His crucifixion, honestly preparing His disciples for coming persecution while grounding their courage not in the absence of trouble but in His victory over it.",
  },
  {
    id: "peace-5", category: "peace",
    title: "The LORD bless you and keep you... and give you peace",
    reference: "Numbers 6:24", book: "Numbers", chapter: 6, verse: 24,
    context: "God gives Moses this priestly benediction for Aaron and his sons to formally pronounce over the whole camp of Israel in the wilderness — the oldest known blessing still spoken over God's people today.",
  },
  {
    id: "peace-6", category: "peace",
    title: "Let the peace of Christ rule in your hearts",
    reference: "Colossians 3:15", book: "Colossians", chapter: 3, verse: 15,
    context: "Paul writes to a church in a Roman trade city exposed to competing philosophies, urging believers to let Christ's peace — not circumstance or status — be the deciding authority in their relationships and decisions.",
  },

  // ── Strength & Courage ────────────────────────────────
  {
    id: "strength-1", category: "strength",
    title: "Be strong and courageous... for the LORD your God is with you wherever you go",
    reference: "Joshua 1:9", book: "Joshua", chapter: 1, verse: 9,
    context: "Repeated three times in this opening chapter alone, this charge comes as Joshua stands on the edge of the Jordan about to lead an untested generation into fortified Canaanite territory without Moses at his side.",
  },
  {
    id: "strength-2", category: "strength",
    title: "Those who wait for the LORD shall renew their strength; they shall mount up with wings like eagles",
    reference: "Isaiah 40:31", book: "Isaiah", chapter: 40, verse: 31,
    context: "Addressed to exhausted, exiled Israelites who felt their cause was disregarded by God, Isaiah reminds them of the incomparable Creator's inexhaustible power, available to the weary who wait on Him rather than their own strength.",
  },
  {
    id: "strength-3", category: "strength",
    title: "I can do all things through him who strengthens me",
    reference: "Philippians 4:13", book: "Philippians", chapter: 4, verse: 13,
    context: "Paul writes this immediately after describing how he has learned contentment in both abundance and hunger, in plenty and in need — the strength in view is endurance through any circumstance, not unlimited achievement.",
  },
  {
    id: "strength-4", category: "strength",
    title: "My grace is sufficient for you, for my power is made perfect in weakness",
    reference: "2 Corinthians 12:9", book: "2 Corinthians", chapter: 12, verse: 9,
    context: "Paul had pleaded three times for God to remove a painful, unnamed \"thorn in the flesh.\" This is God's direct answer, reframing unhealed weakness as the very platform where divine power is most visibly displayed.",
  },
  {
    id: "strength-5", category: "strength",
    title: "As your days, so shall your strength be",
    reference: "Deuteronomy 33:25", book: "Deuteronomy", chapter: 33, verse: 25,
    context: "Part of Moses' final blessing spoken over each tribe of Israel before his death, assuring God's people that strength would be supplied in exact proportion to whatever each day demanded — no more, no less.",
  },
  {
    id: "strength-6", category: "strength",
    title: "God is our refuge and strength, a very present help in trouble",
    reference: "Psalm 46:1", book: "Psalms", chapter: 46, verse: 1,
    context: "Likely composed during a national crisis such as Jerusalem's deliverance from Assyrian siege in Hezekiah's day, this psalm pictures a world in upheaval — mountains falling into the sea — met by the unshaken security of God's presence.",
  },

  // ── Guidance ──────────────────────────────────────────
  {
    id: "guidance-1", category: "guidance",
    title: "Trust in the LORD with all your heart... he will make straight your paths",
    reference: "Proverbs 3:5", book: "Proverbs", chapter: 3, verse: 5,
    context: "Solomon writes as a father instructing his son in wisdom for life, contrasting reliance on human understanding with wholehearted trust in God as the path to a rightly-ordered, well-directed life.",
  },
  {
    id: "guidance-2", category: "guidance",
    title: "I will instruct you and teach you in the way you should go",
    reference: "Psalm 32:8", book: "Psalms", chapter: 32, verse: 8,
    context: "David writes this psalm of confession after finally admitting his sin with Bathsheba rather than concealing it, discovering that honest repentance opens him back up to receive God's close, personal guidance.",
  },
  {
    id: "guidance-3", category: "guidance",
    title: "Your ears shall hear a word behind you, saying, 'This is the way, walk in it'",
    reference: "Isaiah 30:21", book: "Isaiah", chapter: 30, verse: 21,
    context: "Spoken to a rebellious Judah that kept seeking political alliances with Egypt instead of trusting God, promising that even after their stubbornness brings hardship, God will still personally direct them once they turn to listen.",
  },
  {
    id: "guidance-4", category: "guidance",
    title: "The Spirit of truth... will guide you into all the truth",
    reference: "John 16:13", book: "John", chapter: 16, verse: 13,
    context: "Part of Jesus's Upper Room teaching the night before His death, promising the disciples that His physical absence would be more than compensated for by the ongoing, personal guidance of the Holy Spirit.",
  },
  {
    id: "guidance-5", category: "guidance",
    title: "The steps of a man are established by the LORD, when he delights in his way",
    reference: "Psalm 37:23", book: "Psalms", chapter: 37, verse: 23,
    context: "An acrostic wisdom psalm written in David's old age, reflecting on a lifetime of watching the wicked prosper temporarily and the righteous find their direction quietly but surely established by God.",
  },
  {
    id: "guidance-6", category: "guidance",
    title: "He leads the humble in what is right, and teaches the humble his way",
    reference: "Psalm 25:9", book: "Psalms", chapter: 25, verse: 9,
    context: "David prays this in a psalm marked by requests for forgiveness and direction amid enemies, noting that the posture God responds to with guidance is humility, not self-sufficiency.",
  },

  // ── Healing ───────────────────────────────────────────
  {
    id: "healing-1", category: "healing",
    title: "I am the LORD, your healer",
    reference: "Exodus 15:26", book: "Exodus", chapter: 15, verse: 26,
    context: "Given right after Israel's first stop in the wilderness following the Red Sea crossing, where God turns the bitter water at Marah sweet. This healing name is revealed alongside a call to obedience, tying wholeness to covenant relationship.",
  },
  {
    id: "healing-2", category: "healing",
    title: "I will restore health to you, and your wounds I will heal",
    reference: "Jeremiah 30:17", book: "Jeremiah", chapter: 30, verse: 17,
    context: "Spoken into the darkest section of Jeremiah's prophecy — a nation Jeremiah calls incurably wounded and abandoned by other nations — as a promise that God alone will do what no one else could for a broken and exiled people.",
  },
  {
    id: "healing-3", category: "healing",
    title: "Who forgives all your iniquity, who heals all your diseases",
    reference: "Psalm 103:3", book: "Psalms", chapter: 103, verse: 3,
    context: "David's soul-anthem of praise pairs forgiveness and healing side by side, reflecting a Hebrew worldview where spiritual and physical restoration flow from the same compassionate character of God.",
  },
  {
    id: "healing-4", category: "healing",
    title: "With his wounds we are healed",
    reference: "Isaiah 53:5", book: "Isaiah", chapter: 53, verse: 5,
    context: "Part of Isaiah's \"Suffering Servant\" song, written centuries before crucifixion existed as a punishment, describing a coming figure whose suffering would accomplish healing for others — a passage the New Testament identifies with Jesus.",
  },
  {
    id: "healing-5", category: "healing",
    title: "The prayer of faith will save the one who is sick",
    reference: "James 5:15", book: "James", chapter: 5, verse: 15,
    context: "James gives the early church a practical model of elders praying and anointing the sick with oil, treating physical healing as something the gathered community actively pursues together through prayer.",
  },
  {
    id: "healing-6", category: "healing",
    title: "I pray that... you may prosper and be in good health, as it goes well with your soul",
    reference: "3 John 1:2", book: "3 John", chapter: 1, verse: 2,
    context: "A brief personal letter from the apostle John to his friend Gaius, opening with an everyday greeting of goodwill that ties bodily health to the deeper flourishing of the soul.",
  },

  // ── Forgiveness & Mercy ───────────────────────────────
  {
    id: "forgiveness-1", category: "forgiveness",
    title: "If we confess our sins, he is faithful and just to forgive us",
    reference: "1 John 1:9", book: "1 John", chapter: 1, verse: 9,
    context: "John writes against early teachers claiming to be sinless, offering instead a simple, repeatable path: honest confession met by God's reliable, righteous forgiveness — not earned, but consistent with His own character.",
  },
  {
    id: "forgiveness-2", category: "forgiveness",
    title: "As far as the east is from the west, so far does he remove our transgressions",
    reference: "Psalm 103:12", book: "Psalms", chapter: 103, verse: 12,
    context: "East and west never meet, unlike north and south which reach a pole. David's image communicates a forgiveness with no measurable limit or point of return, unlike the shame that often lingers after sin.",
  },
  {
    id: "forgiveness-3", category: "forgiveness",
    title: "Though your sins are like scarlet, they shall be as white as snow",
    reference: "Isaiah 1:18", book: "Isaiah", chapter: 1, verse: 18,
    context: "Isaiah opens his prophecy indicting a Judah performing empty religious ritual while practicing injustice, yet God still invites them to \"reason together\" — offering total cleansing even for the deepest stains, if they will turn.",
  },
  {
    id: "forgiveness-4", category: "forgiveness",
    title: "He will cast all our sins into the depths of the sea",
    reference: "Micah 7:19", book: "Micah", chapter: 7, verse: 19,
    context: "Micah closes his prophecy — largely devoted to judgment against corrupt leaders — with a sudden hymn of praise to a God whose defining trait is delighting in mercy rather than staying angry forever.",
  },
  {
    id: "forgiveness-5", category: "forgiveness",
    title: "I will forgive their iniquity, and I will remember their sin no more",
    reference: "Jeremiah 31:34", book: "Jeremiah", chapter: 31, verse: 34,
    context: "The heart of Jeremiah's New Covenant prophecy, given to a people about to lose their temple and land, promising a future relationship with God defined not by external law alone but by internal transformation and total forgiveness.",
  },
  {
    id: "forgiveness-6", category: "forgiveness",
    title: "While he was still a long way off, his father saw him and felt compassion, and ran",
    reference: "Luke 15:20", book: "Luke", chapter: 15, verse: 20,
    context: "Jesus tells the parable of the prodigal son to Pharisees grumbling that He welcomes sinners, picturing God not as a reluctant judge waiting to be persuaded but as a father scanning the horizon, already running toward anyone who turns back.",
  },

  // ── Restoration ───────────────────────────────────────
  {
    id: "restoration-1", category: "restoration",
    title: "I will restore to you the years that the swarming locust has eaten",
    reference: "Joel 2:25", book: "Joel", chapter: 2, verse: 25,
    context: "Joel prophesies after a devastating locust plague had stripped Judah's land bare, using the agricultural disaster as a picture of coming spiritual devastation — and promising that whatever seasons are lost can still be restored.",
  },
  {
    id: "restoration-2", category: "restoration",
    title: "To grant to those who mourn in Zion... beauty for ashes",
    reference: "Isaiah 61:3", book: "Isaiah", chapter: 61, verse: 3,
    context: "Isaiah describes the mission of a coming Anointed One sent to comfort mourners in Zion — a passage Jesus later reads aloud in the Nazareth synagogue and applies directly to Himself.",
  },
  {
    id: "restoration-3", category: "restoration",
    title: "Weeping may tarry for the night, but joy comes with the morning",
    reference: "Psalm 30:5", book: "Psalms", chapter: 30, verse: 5,
    context: "David wrote this psalm of dedication after recovering from a serious illness he believed was near-fatal, testifying that God's anger, when it comes, is momentary compared to the lasting favor that follows.",
  },
  {
    id: "restoration-4", category: "restoration",
    title: "The LORD restored the fortunes of Job... and gave Job twice as much as he had before",
    reference: "Job 42:10", book: "Job", chapter: 42, verse: 10,
    context: "After thirty-some chapters of unexplained suffering, failed answers from friends, and Job's own wrestling with God, the book closes not with an explanation but with restoration — Job's relationships and fortune doubled.",
  },
  {
    id: "restoration-5", category: "restoration",
    title: "God works all things together for good, for those who are called according to his purpose",
    reference: "Romans 8:28", book: "Romans", chapter: 8, verse: 28,
    context: "Paul writes this in the middle of a passage about groaning creation and the Spirit interceding for believers in weakness, framing God's redemptive work as active even within suffering, not just after it ends.",
  },
  {
    id: "restoration-6", category: "restoration",
    title: "I will cause breath to enter you, and you shall live",
    reference: "Ezekiel 37:5", book: "Ezekiel", chapter: 37, verse: 5,
    context: "Ezekiel prophesies to Judean exiles in Babylon who felt utterly hopeless — \"our bones are dried up, our hope is lost\" — using this vision of a valley of scattered bones reassembled and given breath as a promise of national and spiritual resurrection.",
  },

  // ── Salvation & Eternal Life ──────────────────────────
  {
    id: "salvation-1", category: "salvation",
    title: "For God so loved the world, that he gave his only Son, that whoever believes in him... shall have eternal life",
    reference: "John 3:16", book: "John", chapter: 3, verse: 16,
    context: "Jesus speaks these words during a private nighttime conversation with Nicodemus, a respected Pharisee and member of the Jewish ruling council who came secretly to question this new teacher, unpacking what it means to be \"born again.\"",
  },
  {
    id: "salvation-2", category: "salvation",
    title: "If you confess with your mouth that Jesus is Lord... you will be saved",
    reference: "Romans 10:9", book: "Romans", chapter: 10, verse: 9,
    context: "Paul explains to a Roman church of both Jewish and Gentile believers that righteousness before God no longer depends on law-keeping but is available to anyone, near or far, through simple faith and confession.",
  },
  {
    id: "salvation-3", category: "salvation",
    title: "By grace you have been saved through faith... not a result of works",
    reference: "Ephesians 2:8", book: "Ephesians", chapter: 2, verse: 8,
    context: "Paul reminds Gentile believers in Ephesus — once considered \"far off\" from God's covenant people — that their inclusion rests entirely on grace received by faith, leaving no room for anyone to claim credit.",
  },
  {
    id: "salvation-4", category: "salvation",
    title: "I give them eternal life, and they will never perish, and no one will snatch them out of my hand",
    reference: "John 10:28", book: "John", chapter: 10, verse: 28,
    context: "Jesus speaks this during the Feast of Dedication in Jerusalem while describing Himself as the Good Shepherd, responding to religious leaders demanding He state plainly whether He is the Messiah.",
  },
  {
    id: "salvation-5", category: "salvation",
    title: "Believe in the Lord Jesus, and you will be saved, you and your household",
    reference: "Acts 16:31", book: "Acts", chapter: 16, verse: 31,
    context: "Spoken by Paul and Silas to a terrified Philippian jailer after an earthquake had shaken open the prison doors during their midnight worship, on the very night the jailer had been ready to take his own life.",
  },
  {
    id: "salvation-6", category: "salvation",
    title: "The free gift of God is eternal life in Christ Jesus our Lord",
    reference: "Romans 6:23", book: "Romans", chapter: 6, verse: 23,
    context: "Paul closes a section on the believer's freedom from sin's mastery by contrasting sin's inevitable payout with the entirely unearned gift God offers instead — the language of wages versus gift is deliberate.",
  },

  // ── Faithfulness & Covenant ───────────────────────────
  {
    id: "faithfulness-1", category: "faithfulness",
    title: "I set my bow in the cloud... a sign of the covenant",
    reference: "Genesis 9:13", book: "Genesis", chapter: 9, verse: 13,
    context: "Given to Noah and his family as they step off the ark into a completely reshaped, empty world, this is the first covenant God makes with all humanity and every living creature, marked by a sign visible to every generation since.",
  },
  {
    id: "faithfulness-2", category: "faithfulness",
    title: "I will make of you a great nation... in you all the families of the earth shall be blessed",
    reference: "Genesis 12:2", book: "Genesis", chapter: 12, verse: 2,
    context: "God calls Abram, a childless 75-year-old man in Ur, to leave everything familiar on the promise of descendants and land he would not live to fully see, later confirming it by having him count the uncountable stars.",
  },
  {
    id: "faithfulness-3", category: "faithfulness",
    title: "Your throne shall be established forever",
    reference: "2 Samuel 7:16", book: "2 Samuel", chapter: 7, verse: 16,
    context: "David, now settled in his palace after decades of conflict, wants to build God a temple. Instead, through the prophet Nathan, God reverses the offer — promising to build David an eternal house and dynasty instead.",
  },
  {
    id: "faithfulness-4", category: "faithfulness",
    title: "His mercies... are new every morning; great is your faithfulness",
    reference: "Lamentations 3:23", book: "Lamentations", chapter: 3, verse: 23,
    context: "Written in the smoldering rubble of Jerusalem after Babylon destroyed the city and temple, this is arguably the Bible's most surprising declaration of hope, rising directly out of the book's most graphic grief.",
  },
  {
    id: "faithfulness-5", category: "faithfulness",
    title: "God is not man, that he should lie, nor a son of man, that he should change his mind",
    reference: "Numbers 23:19", book: "Numbers", chapter: 23, verse: 19,
    context: "The pagan prophet Balaam, hired by King Balak to curse Israel, finds himself unable to speak anything but blessing over God's people, declaring that unlike the fickle promises of kings, God's word cannot be reversed.",
  },
  {
    id: "faithfulness-6", category: "faithfulness",
    title: "I will not violate my covenant or alter the word that went forth from my lips",
    reference: "Psalm 89:34", book: "Psalms", chapter: 89, verse: 34,
    context: "Written when it looked like David's royal line had failed, this psalm wrestles honestly with the apparent gap between God's covenant promise and painful present reality, while still affirming that God's word cannot break.",
  },

  // ── Blessing & Prosperity ─────────────────────────────
  {
    id: "blessing-1", category: "blessing",
    title: "All these blessings shall come upon you and overtake you, if you obey the voice of the LORD",
    reference: "Deuteronomy 28:2", book: "Deuteronomy", chapter: 28, verse: 2,
    context: "Spoken by Moses on the plains of Moab just before Israel enters Canaan, laying out in vivid detail the blessings of covenant faithfulness — set directly opposite the curses later in the chapter as two paths before the nation.",
  },
  {
    id: "blessing-2", category: "blessing",
    title: "Meditate on it day and night... then you will make your way prosperous",
    reference: "Joshua 1:8", book: "Joshua", chapter: 1, verse: 8,
    context: "Given to Joshua alongside the charge to be strong and courageous, tying prosperity and success in the coming conquest not to military strategy alone but to continual meditation on God's word.",
  },
  {
    id: "blessing-3", category: "blessing",
    title: "He is like a tree planted by streams of water... whose leaf does not wither",
    reference: "Psalm 1:3", book: "Psalms", chapter: 1, verse: 3,
    context: "The very first psalm sets up the whole Psalter's central choice — the way of the righteous versus the way of the wicked — comparing the person who delights in God's law to a deeply rooted, continually fruitful tree.",
  },
  {
    id: "blessing-4", category: "blessing",
    title: "I will bless you... and you will be a blessing",
    reference: "Genesis 12:2", book: "Genesis", chapter: 12, verse: 2,
    context: "Part of God's original call to Abram, making clear from the outset that the blessing given to him was never meant to terminate with him alone but to flow outward to others through him.",
  },
  {
    id: "blessing-5", category: "blessing",
    title: "The blessing of the LORD makes rich, and he adds no sorrow with it",
    reference: "Proverbs 10:22", book: "Proverbs", chapter: 10, verse: 22,
    context: "One of Solomon's contrast-sayings between the righteous and the wicked, distinguishing God-given prosperity — which carries no hidden cost — from wealth gained through oppression or shortcuts.",
  },
  {
    id: "blessing-6", category: "blessing",
    title: "Give, and it will be given to you... pressed down, shaken together, running over",
    reference: "Luke 6:38", book: "Luke", chapter: 6, verse: 38,
    context: "Part of Jesus's Sermon on the Plain to a crowd including the poor and marginalized, describing a generosity so overflowing it uses the image of a merchant filling a grain measure until it spills into the buyer's lap.",
  },

  // ── Wisdom & Understanding ────────────────────────────
  {
    id: "wisdom-1", category: "wisdom",
    title: "If any of you lacks wisdom, let him ask God, who gives generously to all without reproach",
    reference: "James 1:5", book: "James", chapter: 1, verse: 5,
    context: "James writes to believers scattered by persecution and facing real trials, teaching that wisdom for navigating hardship isn't hoarded by God but freely available for the asking, without shame or reluctance.",
  },
  {
    id: "wisdom-2", category: "wisdom",
    title: "The LORD gives wisdom; from his mouth come knowledge and understanding",
    reference: "Proverbs 2:6", book: "Proverbs", chapter: 2, verse: 6,
    context: "Solomon frames wisdom not as something achieved through cleverness alone but as a gift God dispenses to those who genuinely seek it \"like silver\" and \"hidden treasure,\" described earlier in the chapter.",
  },
  {
    id: "wisdom-3", category: "wisdom",
    title: "Christ Jesus, who became to us wisdom from God",
    reference: "1 Corinthians 1:30", book: "1 Corinthians", chapter: 1, verse: 30,
    context: "Paul writes to a Corinthian church enamored with rhetorical skill and status, arguing that true wisdom is found not in eloquence but in the seemingly foolish message of a crucified Messiah.",
  },
  {
    id: "wisdom-4", category: "wisdom",
    title: "I give you a wise and discerning mind",
    reference: "1 Kings 3:12", book: "1 Kings", chapter: 3, verse: 12,
    context: "Early in his reign, at a nighttime encounter in Gibeon, God offers young King Solomon anything he wishes for. His request for wisdom to govern rather than wealth or long life pleases God, who grants it along with what he didn't ask for.",
  },
  {
    id: "wisdom-5", category: "wisdom",
    title: "Blessed is the one who finds wisdom... she is more precious than jewels",
    reference: "Proverbs 3:13", book: "Proverbs", chapter: 3, verse: 13,
    context: "Solomon personifies wisdom as more valuable than any material gain, part of an extended poem urging his son toward a treasure that outlasts silver, gold, and every other pursuit.",
  },
  {
    id: "wisdom-6", category: "wisdom",
    title: "In him are hidden all the treasures of wisdom and knowledge",
    reference: "Colossians 2:3", book: "Colossians", chapter: 2, verse: 3,
    context: "Paul writes to a church in the Lycus Valley being pulled toward mystical philosophies claiming secret spiritual knowledge, countering that everything worth knowing is already found complete in Christ.",
  },

  // ── Hope & the Future ─────────────────────────────────
  {
    id: "hope-1", category: "hope",
    title: "Plans for welfare and not for evil, to give you a future and a hope",
    reference: "Jeremiah 29:11", book: "Jeremiah", chapter: 29, verse: 11,
    context: "Written in a letter to the first wave of Judean exiles carried off to Babylon, contradicting false prophets who promised a quick return, this promise came attached to the hard instruction to settle in, build houses, and wait seventy years.",
  },
  {
    id: "hope-2", category: "hope",
    title: "May the God of hope fill you with all joy and peace in believing",
    reference: "Romans 15:13", book: "Romans", chapter: 15, verse: 13,
    context: "Paul closes a long section addressing tension between Jewish and Gentile believers over dietary and calendar disputes, praying that hope — not uniformity of custom — would be the source of the church's unity and joy.",
  },
  {
    id: "hope-3", category: "hope",
    title: "No eye has seen, nor ear heard... what God has prepared for those who love him",
    reference: "1 Corinthians 2:9", book: "1 Corinthians", chapter: 2, verse: 9,
    context: "Paul contrasts the wisdom of the age, which crucified \"the Lord of glory,\" with the hidden wisdom of God, describing a future beyond human imagination reserved for those who love Him.",
  },
  {
    id: "hope-4", category: "hope",
    title: "He will wipe away every tear from their eyes, and death shall be no more",
    reference: "Revelation 21:4", book: "Revelation", chapter: 21, verse: 4,
    context: "Given to John in exile on the island of Patmos, this vision of the new heaven and new earth closes out the Bible's entire story arc, answering the grief and mortality that entered the world in Genesis with a promised undoing of it all.",
  },
  {
    id: "hope-5", category: "hope",
    title: "Waiting for our blessed hope, the appearing of the glory of our great God and Savior Jesus Christ",
    reference: "Titus 2:13", book: "Titus", chapter: 2, verse: 13,
    context: "Paul instructs Titus, left to organize the fledgling church on Crete, that sound living in the present is fueled by anticipation of Christ's return — hope functions as ethical motivation, not passive daydreaming.",
  },
  {
    id: "hope-6", category: "hope",
    title: "Hope in God; for I shall again praise him, my salvation and my God",
    reference: "Psalm 42:11", book: "Psalms", chapter: 42, verse: 11,
    context: "Written by a worship leader cut off from the temple, likely during exile or flight, repeatedly asking his own soul why it is downcast — modeling the discipline of preaching hope to oneself rather than only feeling it.",
  },

  // ── Justice & Vindication ─────────────────────────────
  {
    id: "justice-1", category: "justice",
    title: "Vengeance is mine, I will repay, says the Lord",
    reference: "Romans 12:19", book: "Romans", chapter: 12, verse: 19,
    context: "Paul instructs a persecuted Roman church not to repay evil for evil or take personal revenge, but to entrust ultimate justice to God — freeing believers to bless enemies rather than settle scores themselves.",
  },
  {
    id: "justice-2", category: "justice",
    title: "He will bring forth your righteousness as the light, and your justice as the noonday",
    reference: "Psalm 37:6", book: "Psalms", chapter: 37, verse: 6,
    context: "David's wisdom psalm addresses the age-old frustration of watching the wicked prosper, urging patient trust that God will eventually and publicly vindicate those who commit their way to Him.",
  },
  {
    id: "justice-3", category: "justice",
    title: "I the LORD love justice; I hate robbery and wrong",
    reference: "Isaiah 61:8", book: "Isaiah", chapter: 61, verse: 8,
    context: "Immediately following the famous \"beauty for ashes\" passage, God ties His restoration of Zion directly to His own character as a God who cannot ignore exploitation and injustice against the vulnerable.",
  },
  {
    id: "justice-4", category: "justice",
    title: "God is just: he will repay with affliction those who afflict you",
    reference: "2 Thessalonians 1:6", book: "2 Thessalonians", chapter: 1, verse: 6,
    context: "Paul writes to comfort a church enduring real persecution, assuring them that the apparent triumph of their oppressors is temporary and that God keeps precise moral account, to be settled at Christ's return.",
  },
  {
    id: "justice-5", category: "justice",
    title: "What does the LORD require of you but to do justice, and to love kindness, and to walk humbly",
    reference: "Micah 6:8", book: "Micah", chapter: 6, verse: 8,
    context: "Micah answers Judah's question of what sacrifice could satisfy God's demands, redirecting from ritual performance to a life shaped by justice, mercy, and humility — the just character of God to be lived out, not just longed for.",
  },

  // ── Identity & Sonship ────────────────────────────────
  {
    id: "identity-1", category: "identity",
    title: "You are no longer a slave, but a son, and if a son, then an heir through God",
    reference: "Galatians 4:7", book: "Galatians", chapter: 4, verse: 7,
    context: "Paul writes to Galatian believers being pressured by teachers to add Jewish law-keeping to their faith, insisting their adoption as God's own children is already complete and secure, not something to be earned through ritual.",
  },
  {
    id: "identity-2", category: "identity",
    title: "We are children of God, and if children, then heirs — heirs of God and fellow heirs with Christ",
    reference: "Romans 8:17", book: "Romans", chapter: 8, verse: 17,
    context: "Paul contrasts a spirit of slavery and fear with the Spirit of adoption believers have received, describing an inheritance shared jointly with Christ Himself, secured through suffering as well as glory.",
  },
  {
    id: "identity-3", category: "identity",
    title: "If anyone is in Christ, he is a new creation. The old has passed away",
    reference: "2 Corinthians 5:17", book: "2 Corinthians", chapter: 5, verse: 17,
    context: "Paul writes this in a passage about reconciliation, having just described no longer regarding anyone \"according to the flesh\" — the new identity is tied directly to a transformed way of seeing both self and others.",
  },
  {
    id: "identity-4", category: "identity",
    title: "You are a chosen race, a royal priesthood, a holy nation, a people for his own possession",
    reference: "1 Peter 2:9", book: "1 Peter", chapter: 2, verse: 9,
    context: "Peter writes to believers scattered across Asia Minor facing social ostracism and suspicion for their faith, applying language once reserved for Israel at Sinai to this new, mixed community of Jew and Gentile believers.",
  },
  {
    id: "identity-5", category: "identity",
    title: "We are his workmanship, created in Christ Jesus for good works",
    reference: "Ephesians 2:10", book: "Ephesians", chapter: 2, verse: 10,
    context: "Immediately following his statement that salvation is by grace through faith, not works, Paul clarifies that good works are still the intended outcome — the fruit of new identity, not the means of earning it.",
  },
  {
    id: "identity-6", category: "identity",
    title: "To all who did receive him... he gave the right to become children of God",
    reference: "John 1:12", book: "John", chapter: 1, verse: 12,
    context: "Part of John's prologue introducing Jesus as the eternal Word who came into the world He made, yet was rejected by His own — those who receive Him are given something no bloodline could grant: adoption as God's children.",
  },

  // ── The Holy Spirit & Power ───────────────────────────
  {
    id: "spirit-1", category: "spirit",
    title: "You will receive power when the Holy Spirit has come upon you",
    reference: "Acts 1:8", book: "Acts", chapter: 1, verse: 8,
    context: "Jesus's final words to His disciples on the Mount of Olives before ascending to heaven, redirecting their question about restoring Israel's kingdom toward a global mission empowered by the coming Spirit.",
  },
  {
    id: "spirit-2", category: "spirit",
    title: "I will pour out my Spirit on all flesh; your sons and your daughters shall prophesy",
    reference: "Joel 2:28", book: "Joel", chapter: 2, verse: 28,
    context: "Joel prophesies this in the wake of a devastating locust plague and national repentance, promising a coming era when the Spirit would no longer be limited to select prophets and kings but poured out broadly — a promise Peter cites at Pentecost.",
  },
  {
    id: "spirit-3", category: "spirit",
    title: "He will give you another Helper, to be with you forever",
    reference: "John 14:16", book: "John", chapter: 14, verse: 16,
    context: "Jesus promises this the night of the Last Supper, using a legal-courtroom term (\"Helper\" / \"Advocate\") to describe a Spirit who would take up permanent residence with believers rather than the temporary visitations under the old covenant.",
  },
  {
    id: "spirit-4", category: "spirit",
    title: "A new heart I will give you... I will put my Spirit within you",
    reference: "Ezekiel 36:26", book: "Ezekiel", chapter: 36, verse: 26,
    context: "Spoken to exiles in Babylon whose national identity and worship had been stripped away, this promise of internal transformation — not merely external return to the land — anticipates the New Testament experience of regeneration.",
  },
  {
    id: "spirit-5", category: "spirit",
    title: "The Spirit of him who raised Jesus from the dead dwells in you",
    reference: "Romans 8:11", book: "Romans", chapter: 8, verse: 11,
    context: "Paul assures believers wrestling with the ongoing struggle against sin and mortality that the same resurrection power that raised Christ is not a future hope only but a present indwelling reality.",
  },
  {
    id: "spirit-6", category: "spirit",
    title: "Not by might, nor by power, but by my Spirit, says the LORD",
    reference: "Zechariah 4:6", book: "Zechariah", chapter: 4, verse: 6,
    context: "Given to Zerubbabel, tasked with rebuilding the temple amid discouraging opposition and a mountain of rubble, reminding the small, under-resourced remnant that the work would be accomplished by the Spirit, not human strength.",
  },

  // ── Christ's Return & New Creation ────────────────────
  {
    id: "return-1", category: "return",
    title: "I go to prepare a place for you... I will come again and will take you to myself",
    reference: "John 14:3", book: "John", chapter: 14, verse: 3,
    context: "Spoken during the Last Supper to comfort deeply troubled disciples who had just learned Jesus would be betrayed and was leaving them, framing His departure not as abandonment but as preparation for reunion.",
  },
  {
    id: "return-2", category: "return",
    title: "This Jesus, who was taken up from you into heaven, will come in the same way",
    reference: "Acts 1:11", book: "Acts", chapter: 1, verse: 11,
    context: "Two angelic messengers speak this to the disciples as they stand staring at the sky after watching Jesus ascend on the Mount of Olives, redirecting their gaze from wonder back to mission with a concrete promise of return.",
  },
  {
    id: "return-3", category: "return",
    title: "The Lord himself will descend... and so we will always be with the Lord",
    reference: "1 Thessalonians 4:17", book: "1 Thessalonians", chapter: 4, verse: 17,
    context: "Paul writes to comfort Thessalonian believers grieving fellow Christians who had died before Christ's return, assuring them the dead in Christ will be raised first and no one will be left behind or forgotten.",
  },
  {
    id: "return-4", category: "return",
    title: "Behold, I am making all things new",
    reference: "Revelation 21:5", book: "Revelation", chapter: 21, verse: 5,
    context: "Spoken by God from the throne in John's climactic vision of the new heaven and new earth descending, following the destruction of the old order — a declaration of total renewal, not mere repair, of creation.",
  },
  {
    id: "return-5", category: "return",
    title: "I stand at the door and knock. If anyone hears my voice and opens the door, I will come in",
    reference: "Revelation 3:20", book: "Revelation", chapter: 3, verse: 20,
    context: "Part of Christ's letter to the lukewarm church in Laodicea, a wealthy city that considered itself self-sufficient — the image is of Christ locked outside His own church, still patiently seeking entry to anyone who will respond.",
  },
  {
    id: "return-6", category: "return",
    title: "He will transform our lowly body to be like his glorious body",
    reference: "Philippians 3:21", book: "Philippians", chapter: 3, verse: 21,
    context: "Paul contrasts the citizenship of heaven with earthly status-seeking he's just described among false teachers, grounding the believer's hope in a coming bodily transformation, not merely spiritual survival.",
  },

  // ── Rest ──────────────────────────────────────────────
  {
    id: "rest-1", category: "rest",
    title: "Come to me, all who labor and are heavy laden, and I will give you rest",
    reference: "Matthew 11:28", book: "Matthew", chapter: 11, verse: 28,
    context: "Jesus speaks this after His disciples have been criticized by religious leaders for breaking Sabbath traditions, offering an easy yoke and light burden in deliberate contrast to the exhausting weight of externally-imposed religious performance.",
  },
  {
    id: "rest-2", category: "rest",
    title: "There remains a Sabbath rest for the people of God",
    reference: "Hebrews 4:9", book: "Hebrews", chapter: 4, verse: 9,
    context: "The writer of Hebrews has just traced Israel's failure to enter God's rest in the wilderness due to unbelief, offering a greater, still-available rest found through faith rather than through the old Sabbath law alone.",
  },
  {
    id: "rest-3", category: "rest",
    title: "My presence will go with you, and I will give you rest",
    reference: "Exodus 33:14", book: "Exodus", chapter: 33, verse: 14,
    context: "Spoken to Moses after the golden calf crisis threatened to end the covenant relationship entirely, as Moses pleads for God's continued presence with the people — rest here is inseparable from God going with them.",
  },
  {
    id: "rest-4", category: "rest",
    title: "For God alone my soul waits in silence; from him comes my salvation",
    reference: "Psalm 62:1", book: "Psalms", chapter: 62, verse: 1,
    context: "David, likely facing conspiracy and slander from those plotting to bring him down, deliberately quiets his soul before God rather than reacting, modeling rest as an active discipline of trust rather than a passive feeling.",
  },
  {
    id: "rest-5", category: "rest",
    title: "In returning and rest you shall be saved; in quietness and in trust shall be your strength",
    reference: "Isaiah 30:15", book: "Isaiah", chapter: 30, verse: 15,
    context: "Spoken to a Judah frantically seeking military alliance with Egypt instead of trusting God, this promise came paired with the sober note that the people \"would not\" — rest was offered but refused, a caution alongside the promise.",
  },
];

// ── Helpers ───────────────────────────────────────────────

export function getPromiseById(id: string): Promise | undefined {
  return PROMISES.find((p) => p.id === id);
}

export function promisesInCategory(category: PromiseCategoryId): Promise[] {
  return PROMISES.filter((p) => p.category === category);
}

/** Deterministic daily pick — stable for the whole calendar day, changes automatically the next. */
export function promiseOfTheDay(date: Date = new Date()): Promise {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const diff = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - start;
  const dayOfYear = Math.floor(diff / 86400000);
  return PROMISES[dayOfYear % PROMISES.length];
}
