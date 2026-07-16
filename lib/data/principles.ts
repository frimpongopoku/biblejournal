import { OT_BOOKS, type BookName } from "@/lib/bible-books";

// ── Types ─────────────────────────────────────────────────

export type PrincipleCategoryId =
  | "sowing-reaping" | "tongue" | "authority" | "stewardship" | "justice"
  | "wisdom" | "love" | "faith-works" | "humility" | "discipline"
  | "rest-sabbath" | "marriage-family" | "generosity" | "kingdom-greatness"
  | "unity-order" | "grace-law" | "spiritual-renewal" | "witness-mission";

export interface PrincipleCategory {
  id: PrincipleCategoryId;
  label: string;
  blurb: string;
  icon: string;
  color: string;
}

export interface Principle {
  id: string;
  category: PrincipleCategoryId;
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

export const PRINCIPLE_CATEGORIES: PrincipleCategory[] = [
  { id: "sowing-reaping",    label: "Sowing & Reaping",       blurb: "What you plant, you harvest",     icon: "Sprout",        color: "#6E9E5C" },
  { id: "tongue",            label: "The Tongue",             blurb: "Words carry power",                icon: "MessageCircle", color: "#7FA5C4" },
  { id: "authority",         label: "Authority & Order",      blurb: "Order under God",                  icon: "Landmark",      color: "#8A7256" },
  { id: "stewardship",       label: "Stewardship",            blurb: "Manage what's entrusted",          icon: "Coins",         color: "#C9A227" },
  { id: "justice",           label: "Justice & Fairness",     blurb: "Fair in every measure",             icon: "Scale",         color: "#5B7C99" },
  { id: "wisdom",            label: "Wisdom & Counsel",       blurb: "Counsel before action",             icon: "Lightbulb",     color: "#C98A4B" },
  { id: "love",              label: "Love & Relationships",   blurb: "The law fulfilled",                 icon: "Heart",         color: "#C0616B" },
  { id: "faith-works",       label: "Faith & Works",          blurb: "Belief proven by action",           icon: "Handshake",     color: "#4F7C82" },
  { id: "humility",          label: "Humility & Pride",       blurb: "The low place lifted",              icon: "Feather",       color: "#7FA98C" },
  { id: "discipline",        label: "Discipline & Correction", blurb: "Correction that builds",           icon: "Gavel",         color: "#A65D57" },
  { id: "rest-sabbath",      label: "Rest & Sabbath",         blurb: "Rhythm of work and rest",           icon: "Moon",          color: "#5C6E9E" },
  { id: "marriage-family",   label: "Marriage & Family",      blurb: "The first institution",             icon: "Users",         color: "#B08D3E" },
  { id: "generosity",        label: "Generosity & Giving",    blurb: "Give and it returns",                icon: "Gift",          color: "#D4A24E" },
  { id: "kingdom-greatness", label: "Kingdom & Greatness",    blurb: "Greatness through service",         icon: "Crown",         color: "#9B6BA8" },
  { id: "unity-order",       label: "Unity & Order",          blurb: "One body, many parts",              icon: "Puzzle",        color: "#6B8CAE" },
  { id: "grace-law",         label: "Grace & the Law",        blurb: "From letter to Spirit",              icon: "KeyRound",      color: "#8E6FA8" },
  { id: "spiritual-renewal", label: "Spiritual Renewal",      blurb: "Transformed thinking",               icon: "Brain",         color: "#4A6FA5" },
  { id: "witness-mission",   label: "Witness & Mission",      blurb: "Sent to every nation",               icon: "Globe",         color: "#E08E45" },
];

export function getPrincipleCategory(id: PrincipleCategoryId): PrincipleCategory {
  return PRINCIPLE_CATEGORIES.find((c) => c.id === id)!;
}

// ── Principles ────────────────────────────────────────────

export const PRINCIPLES: Principle[] = [
  // ── Sowing & Reaping ──────────────────────────────────
  {
    id: "sowing-reaping-1", category: "sowing-reaping",
    title: "Whatever a man sows, that he will also reap",
    reference: "Galatians 6:7", book: "Galatians", chapter: 6, verse: 7,
    context: "Paul warns the Galatian churches not to be deceived: the moral universe operates like a farm, where the kind of seed planted determines the kind of harvest that comes, whether sown to please the flesh or the Spirit.",
  },
  {
    id: "sowing-reaping-2", category: "sowing-reaping",
    title: "The one who sows sparingly will also reap sparingly, and the one who sows bountifully will also reap bountifully",
    reference: "2 Corinthians 9:6", book: "2 Corinthians", chapter: 9, verse: 6,
    context: "Paul applies the sowing-reaping principle directly to generosity, encouraging the Corinthian church toward cheerful, proportionate giving rather than reluctant minimalism.",
  },
  {
    id: "sowing-reaping-3", category: "sowing-reaping",
    title: "They sow the wind, and they reap the whirlwind",
    reference: "Hosea 8:7", book: "Hosea", chapter: 8, verse: 7,
    context: "Hosea indicts Israel's political scheming and idol-making, showing that reaping isn't always proportionate to sowing — small unfaithfulness can multiply into disproportionate consequences.",
  },
  {
    id: "sowing-reaping-4", category: "sowing-reaping",
    title: "Those who plow iniquity and sow trouble reap the same",
    reference: "Job 4:8", book: "Job", chapter: 4, verse: 8,
    context: "Job's friend Eliphaz states this principle while wrongly accusing innocent Job of hidden sin — the book as a whole shows the principle is generally true while warning against assuming it explains every hardship.",
  },
  {
    id: "sowing-reaping-5", category: "sowing-reaping",
    title: "Whoever sows injustice will reap calamity",
    reference: "Proverbs 22:8", book: "Proverbs", chapter: 22, verse: 8,
    context: "Solomon extends the sowing principle to social ethics, tying oppressive behavior toward others directly to eventual downfall for the oppressor.",
  },
  {
    id: "sowing-reaping-6", category: "sowing-reaping",
    title: "Give, and it will be given to you... with the measure you use it will be measured back to you",
    reference: "Luke 6:38", book: "Luke", chapter: 6, verse: 38,
    context: "Jesus states the reciprocity principle during His Sermon on the Plain, teaching that the measure a person extends to others in generosity and judgment becomes the measure returned to them.",
  },

  // ── The Tongue ────────────────────────────────────────
  {
    id: "tongue-1", category: "tongue",
    title: "Death and life are in the power of the tongue",
    reference: "Proverbs 18:21", book: "Proverbs", chapter: 18, verse: 21,
    context: "Solomon teaches that speech is not neutral; words carry the weight to build up or destroy, and \"those who love it will eat its fruit\" — meaning we live with the consequences of our own words.",
  },
  {
    id: "tongue-2", category: "tongue",
    title: "The tongue is a fire... it sets on fire the entire course of life",
    reference: "James 3:5", book: "James", chapter: 3, verse: 5,
    context: "James compares the tongue's outsized influence to a small spark capable of setting a whole forest ablaze, urging believers scattered among quarreling communities toward disciplined speech.",
  },
  {
    id: "tongue-3", category: "tongue",
    title: "By your words you will be justified, and by your words you will be condemned",
    reference: "Matthew 12:36", book: "Matthew", chapter: 12, verse: 36,
    context: "Jesus warns religious leaders who had just accused Him of casting out demons by demonic power that every careless word will be accounted for on the day of judgment, elevating the moral weight of ordinary speech.",
  },
  {
    id: "tongue-4", category: "tongue",
    title: "Let no corrupting talk come out of your mouths, but only such as is good for building up",
    reference: "Ephesians 4:29", book: "Ephesians", chapter: 4, verse: 29,
    context: "Paul instructs a young, ethnically mixed church to make speech purposeful and constructive, tied to giving grace to whoever hears it rather than tearing down.",
  },
  {
    id: "tongue-5", category: "tongue",
    title: "A soft answer turns away wrath, but a harsh word stirs up anger",
    reference: "Proverbs 15:1", book: "Proverbs", chapter: 15, verse: 1,
    context: "A compact wisdom saying on how tone and word choice shape the emotional trajectory of a conflict, not just its content — the same disagreement can de-escalate or explode depending on delivery.",
  },
  {
    id: "tongue-6", category: "tongue",
    title: "The tongue of the wise brings healing",
    reference: "Proverbs 12:18", book: "Proverbs", chapter: 12, verse: 18,
    context: "Solomon contrasts careless speech, described as \"like sword thrusts,\" with wise speech, framing the tongue as a healing agent as much as a destructive one, depending entirely on how it is used.",
  },

  // ── Authority & Order ─────────────────────────────────
  {
    id: "authority-1", category: "authority",
    title: "Let every person be subject to the governing authorities, for there is no authority except from God",
    reference: "Romans 13:1", book: "Romans", chapter: 13, verse: 1,
    context: "Paul instructs the Roman church, living under the very empire that would later persecute them, that human government exists within a structure of authority God has permitted for order in society.",
  },
  {
    id: "authority-2", category: "authority",
    title: "Honor your father and your mother, that your days may be long in the land",
    reference: "Exodus 20:12", book: "Exodus", chapter: 20, verse: 12,
    context: "The fifth of the Ten Commandments, and the first tied to a specific promise, establishing family authority as foundational to a stable, long-lived society at Sinai.",
  },
  {
    id: "authority-3", category: "authority",
    title: "Obey your leaders and submit to them, for they are keeping watch over your souls",
    reference: "Hebrews 13:17", book: "Hebrews", chapter: 13, verse: 17,
    context: "Written to a congregation possibly tempted to drift back from the faith under pressure, this instructs believers to honor spiritual oversight as a form of care rather than mere control.",
  },
  {
    id: "authority-4", category: "authority",
    title: "Be subject for the Lord's sake to every human institution",
    reference: "1 Peter 2:13", book: "1 Peter", chapter: 2, verse: 13,
    context: "Peter writes to persecuted believers scattered across the Roman provinces, teaching that respecting lawful authority is itself a form of witness, done \"for the Lord's sake\" rather than out of fear alone.",
  },
  {
    id: "authority-5", category: "authority",
    title: "I will give you the keys of the kingdom of heaven, and whatever you bind on earth shall be bound in heaven",
    reference: "Matthew 16:19", book: "Matthew", chapter: 16, verse: 19,
    context: "Spoken to Peter immediately after his confession that Jesus is the Christ, establishing a principle of delegated spiritual authority that carries into the church's ongoing governance.",
  },
  {
    id: "authority-6", category: "authority",
    title: "Submitting to one another out of reverence for Christ",
    reference: "Ephesians 5:21", book: "Ephesians", chapter: 5, verse: 21,
    context: "Paul frames mutual submission as the governing posture underneath all the relationships described in the household code that immediately follows — marriage, parenting, and work.",
  },

  // ── Stewardship ───────────────────────────────────────
  {
    id: "stewardship-1", category: "stewardship",
    title: "Well done, good and faithful servant. You have been faithful over a little; I will set you over much",
    reference: "Matthew 25:21", book: "Matthew", chapter: 25, verse: 21,
    context: "From the Parable of the Talents, where a master distributes resources unequally among his servants but rewards proportional faithfulness rather than the raw amount managed.",
  },
  {
    id: "stewardship-2", category: "stewardship",
    title: "One who is faithful in a very little is also faithful in much",
    reference: "Luke 16:10", book: "Luke", chapter: 16, verse: 10,
    context: "Jesus teaches this just after the parable of the dishonest manager, establishing that trustworthiness with small, unglamorous responsibilities is the proving ground for greater ones.",
  },
  {
    id: "stewardship-3", category: "stewardship",
    title: "It is required of stewards that they be found faithful",
    reference: "1 Corinthians 4:2", book: "1 Corinthians", chapter: 4, verse: 2,
    context: "Paul describes himself and the apostles as stewards of God's mysteries to a status-conscious Corinthian church, defining the single metric by which a steward is measured: not brilliance, but faithfulness.",
  },
  {
    id: "stewardship-4", category: "stewardship",
    title: "As each has received a gift, use it to serve one another, as good stewards of God's varied grace",
    reference: "1 Peter 4:10", book: "1 Peter", chapter: 4, verse: 10,
    context: "Peter frames every believer's ability or resource as a grace given specifically to be spent in service to others, not hoarded for personal benefit.",
  },
  {
    id: "stewardship-5", category: "stewardship",
    title: "The LORD God took the man and put him in the garden of Eden to work it and keep it",
    reference: "Genesis 2:15", book: "Genesis", chapter: 2, verse: 15,
    context: "Humanity's very first assignment, given before the fall, establishes stewardship — not ownership — as the intended relationship between people and creation.",
  },
  {
    id: "stewardship-6", category: "stewardship",
    title: "Will man rob God? Yet you are robbing me",
    reference: "Malachi 3:8", book: "Malachi", chapter: 3, verse: 8,
    context: "Malachi confronts a post-exilic people who had begun treating what belonged to God as their own to withhold, framing the tithe as returning to God what was always His rather than an additional gift.",
  },

  // ── Justice & Fairness ────────────────────────────────
  {
    id: "justice-1", category: "justice",
    title: "You shall have just balances, just weights",
    reference: "Leviticus 19:36", book: "Leviticus", chapter: 19, verse: 36,
    context: "Part of the Holiness Code given at Sinai, tying honest commerce directly to Israel's identity as a people set apart, since dishonest scales were a common everyday form of exploiting the poor.",
  },
  {
    id: "justice-2", category: "justice",
    title: "Justice, and only justice, you shall follow",
    reference: "Deuteronomy 16:20", book: "Deuteronomy", chapter: 16, verse: 20,
    context: "Instructions for judges appointed across the tribes, explicitly forbidding bribery and partiality in legal proceedings so that the land they were entering would remain theirs.",
  },
  {
    id: "justice-3", category: "justice",
    title: "You shall not be partial to the poor or defer to the great, but in righteousness shall you judge",
    reference: "Leviticus 19:15", book: "Leviticus", chapter: 19, verse: 15,
    context: "A strikingly even-handed command forbidding favoring either the poor out of pity or the powerful out of fear, insisting on impartial judgment regardless of a person's social standing.",
  },
  {
    id: "justice-4", category: "justice",
    title: "Eye for eye, tooth for tooth",
    reference: "Exodus 21:24", book: "Exodus", chapter: 21, verse: 24,
    context: "Part of Israel's early case law, this principle of proportional retribution was actually a restraint on escalating revenge common in the ancient world, limiting punishment to match — not exceed — the harm done.",
  },
  {
    id: "justice-5", category: "justice",
    title: "Let justice roll down like waters, and righteousness like an ever-flowing stream",
    reference: "Amos 5:24", book: "Amos", chapter: 5, verse: 24,
    context: "Amos confronts a wealthy, religiously observant Israel that celebrated festivals while ignoring the poor, insisting that worship without justice is worthless to God.",
  },
  {
    id: "justice-6", category: "justice",
    title: "You shall not pervert the justice due to the sojourner or to the fatherless",
    reference: "Deuteronomy 24:17", book: "Deuteronomy", chapter: 24, verse: 17,
    context: "Part of Israel's covenant law code, extending impartial justice specifically to the most vulnerable in society — foreigners, orphans, and widows — who had no family structure to advocate for them.",
  },

  // ── Wisdom & Counsel ──────────────────────────────────
  {
    id: "wisdom-1", category: "wisdom",
    title: "Where there is no guidance, a people falls, but in an abundance of counselors there is safety",
    reference: "Proverbs 11:14", book: "Proverbs", chapter: 11, verse: 14,
    context: "Solomon's wisdom collection repeatedly commends seeking multiple perspectives before major decisions rather than relying on a single voice, including one's own.",
  },
  {
    id: "wisdom-2", category: "wisdom",
    title: "Iron sharpens iron, and one man sharpens another",
    reference: "Proverbs 27:17", book: "Proverbs", chapter: 27, verse: 17,
    context: "A picture of how honest relationship, and even friction between people, refines character and thinking — the opposite of isolation or unchallenged agreement.",
  },
  {
    id: "wisdom-3", category: "wisdom",
    title: "Train up a child in the way he should go; even when he is old he will not depart from it",
    reference: "Proverbs 22:6", book: "Proverbs", chapter: 22, verse: 6,
    context: "Part of Solomon's instruction to his own son, framing early formation as a principle with long-range, though not mechanically guaranteed, effect on a person's later life.",
  },
  {
    id: "wisdom-4", category: "wisdom",
    title: "The fear of the LORD is the beginning of wisdom",
    reference: "Proverbs 9:10", book: "Proverbs", chapter: 9, verse: 10,
    context: "The foundational claim of the entire wisdom literature: reverence for God, not intellect or experience alone, is the starting point from which true understanding grows.",
  },
  {
    id: "wisdom-5", category: "wisdom",
    title: "Without counsel plans fail, but with many advisers they succeed",
    reference: "Proverbs 15:22", book: "Proverbs", chapter: 15, verse: 22,
    context: "Reinforces the principle of seeking multiple counselors with a direct cause-and-effect framing tied specifically to planning and strategy rather than everyday decisions alone.",
  },
  {
    id: "wisdom-6", category: "wisdom",
    title: "A threefold cord is not quickly broken",
    reference: "Ecclesiastes 4:12", book: "Ecclesiastes", chapter: 4, verse: 12,
    context: "The Teacher's practical observations on labor and companionship conclude that partnership provides strength and resilience that isolation cannot — wisdom that argues against going it alone.",
  },

  // ── Love & Relationships ──────────────────────────────
  {
    id: "love-1", category: "love",
    title: "You shall love the Lord your God... and love your neighbor as yourself",
    reference: "Matthew 22:37", book: "Matthew", chapter: 22, verse: 37,
    context: "Jesus responds to a Pharisee testing Him about the greatest commandment, distilling the entire Law and Prophets into these two inseparable loves — of God, and of others.",
  },
  {
    id: "love-2", category: "love",
    title: "Whatever you wish that others would do to you, do also to them",
    reference: "Matthew 7:12", book: "Matthew", chapter: 7, verse: 12,
    context: "The Golden Rule, part of the Sermon on the Mount, offering a single practical test for behavior toward others rooted in imagining yourself on the receiving end.",
  },
  {
    id: "love-3", category: "love",
    title: "Love your enemies and pray for those who persecute you",
    reference: "Matthew 5:44", book: "Matthew", chapter: 5, verse: 44,
    context: "Jesus radically extends the definition of \"neighbor\" in the Sermon on the Mount, confronting both a cultural norm and a human instinct that limited love and prayer to allies alone.",
  },
  {
    id: "love-4", category: "love",
    title: "Love is patient and kind; love does not envy or boast",
    reference: "1 Corinthians 13:4", book: "1 Corinthians", chapter: 13, verse: 4,
    context: "Paul writes this in the middle of a letter correcting a fractured, competitive church, describing love not as a feeling but as a set of concrete behaviors that could specifically address their divisions.",
  },
  {
    id: "love-5", category: "love",
    title: "A man shall leave his father and his mother and hold fast to his wife, and they shall become one flesh",
    reference: "Genesis 2:24", book: "Genesis", chapter: 2, verse: 24,
    context: "The foundational statement on marriage, given at creation before the fall, establishing a new primary bond that both Jesus and Paul later cite as authoritative for all relationships to come.",
  },
  {
    id: "love-6", category: "love",
    title: "By this all people will know that you are my disciples, if you have love for one another",
    reference: "John 13:35", book: "John", chapter: 13, verse: 35,
    context: "Spoken at the Last Supper just after Jesus washes the disciples' feet, making sacrificial love the defining, visible mark of His followers to a watching world.",
  },

  // ── Faith & Works ─────────────────────────────────────
  {
    id: "faith-works-1", category: "faith-works",
    title: "Faith by itself, if it does not have works, is dead",
    reference: "James 2:17", book: "James", chapter: 2, verse: 17,
    context: "James writes to a scattered Jewish-Christian audience possibly using \"faith alone\" language as an excuse for indifference toward the poor, insisting genuine faith inevitably produces visible action.",
  },
  {
    id: "faith-works-2", category: "faith-works",
    title: "The righteous shall live by his faith",
    reference: "Habakkuk 2:4", book: "Habakkuk", chapter: 2, verse: 4,
    context: "Spoken to a prophet confused about God using a more wicked nation, Babylon, to judge a less wicked one, Judah — this becomes the anchor verse Paul later builds his entire theology of justification by faith upon.",
  },
  {
    id: "faith-works-3", category: "faith-works",
    title: "Faith is the assurance of things hoped for, the conviction of things not seen",
    reference: "Hebrews 11:1", book: "Hebrews", chapter: 11, verse: 1,
    context: "The writer's definition opens the \"hall of faith\" chapter, cataloguing Old Testament figures whose actions were driven by trust in promises not yet visibly fulfilled.",
  },
  {
    id: "faith-works-4", category: "faith-works",
    title: "Faith comes from hearing, and hearing through the word of Christ",
    reference: "Romans 10:17", book: "Romans", chapter: 10, verse: 17,
    context: "Paul explains the mechanism by which saving faith is generated, tying it directly to the proclamation of the gospel message rather than independent human effort or feeling.",
  },
  {
    id: "faith-works-5", category: "faith-works",
    title: "Those who have believed God may be careful to devote themselves to good works",
    reference: "Titus 3:8", book: "Titus", chapter: 3, verse: 8,
    context: "Paul instructs Titus to insist on this point confidently in his teaching on Crete, treating good works not as a means of earning favor but as the natural evidence and outworking of genuine belief.",
  },
  {
    id: "faith-works-6", category: "faith-works",
    title: "Faith working through love",
    reference: "Galatians 5:6", book: "Galatians", chapter: 5, verse: 6,
    context: "Paul's summary phrase after arguing at length against requiring circumcision for salvation — genuine faith, he concludes, always expresses itself through love in action.",
  },

  // ── Humility & Pride ──────────────────────────────────
  {
    id: "humility-1", category: "humility",
    title: "Pride goes before destruction, and a haughty spirit before a fall",
    reference: "Proverbs 16:18", book: "Proverbs", chapter: 16, verse: 18,
    context: "One of Solomon's most quoted proverbs, describing pride not as a static character flaw but as a trajectory that predictably ends in collapse.",
  },
  {
    id: "humility-2", category: "humility",
    title: "God opposes the proud but gives grace to the humble",
    reference: "James 4:6", book: "James", chapter: 4, verse: 6,
    context: "Quoting Proverbs 3:34, James frames humility and pride as the deciding factor in whether a quarreling, worldly-minded community receives or resists God's grace.",
  },
  {
    id: "humility-3", category: "humility",
    title: "Everyone who exalts himself will be humbled, and he who humbles himself will be exalted",
    reference: "Luke 14:11", book: "Luke", chapter: 14, verse: 11,
    context: "Jesus teaches this after observing guests jockeying for the seats of honor at a banquet, turning an everyday social dynamic into a kingdom principle.",
  },
  {
    id: "humility-4", category: "humility",
    title: "Count others more significant than yourselves",
    reference: "Philippians 2:3", book: "Philippians", chapter: 2, verse: 3,
    context: "Paul grounds the call to humility not in abstract virtue but in the concrete example of Christ, who \"emptied himself, taking the form of a servant,\" described in the verses that follow.",
  },
  {
    id: "humility-5", category: "humility",
    title: "Humble yourselves under the mighty hand of God, so that at the proper time he may exalt you",
    reference: "1 Peter 5:6", book: "1 Peter", chapter: 5, verse: 6,
    context: "Peter writes to suffering, scattered churches, tying humility before God directly to His own timing for eventual vindication and honor rather than self-promotion.",
  },
  {
    id: "humility-6", category: "humility",
    title: "When pride comes, then comes disgrace, but with the humble is wisdom",
    reference: "Proverbs 11:2", book: "Proverbs", chapter: 11, verse: 2,
    context: "Pairs pride's certain companion, disgrace, against humility's companion, wisdom, reinforcing the same trajectory principle found throughout Solomon's proverbs.",
  },

  // ── Discipline & Correction ───────────────────────────
  {
    id: "discipline-1", category: "discipline",
    title: "The Lord disciplines the one he loves, and chastises every son whom he receives",
    reference: "Hebrews 12:6", book: "Hebrews", chapter: 12, verse: 6,
    context: "Quoting Proverbs, the writer reframes hardship experienced by discouraged believers not as punishment or abandonment but as evidence of genuine sonship.",
  },
  {
    id: "discipline-2", category: "discipline",
    title: "Whoever spares the rod hates his son, but he who loves him is diligent to discipline him",
    reference: "Proverbs 13:24", book: "Proverbs", chapter: 13, verse: 24,
    context: "Part of Solomon's parental wisdom instructions, linking loving parenting directly to a willingness to correct rather than indulge a child.",
  },
  {
    id: "discipline-3", category: "discipline",
    title: "The LORD reproves him whom he loves, as a father the son in whom he delights",
    reference: "Proverbs 3:11", book: "Proverbs", chapter: 3, verse: 11,
    context: "Establishes the same principle later echoed in Hebrews 12, framing divine correction as an expression of delight in the one being corrected, not rejection of them.",
  },
  {
    id: "discipline-4", category: "discipline",
    title: "If your brother sins against you, go and tell him his fault, between you and him alone",
    reference: "Matthew 18:15", book: "Matthew", chapter: 18, verse: 15,
    context: "Jesus lays out a step-by-step process for confronting sin within the community: private conversation first, then a small group, then the whole church, before any final separation.",
  },
  {
    id: "discipline-5", category: "discipline",
    title: "Those whom I love, I reprove and discipline, so be zealous and repent",
    reference: "Revelation 3:19", book: "Revelation", chapter: 3, verse: 19,
    context: "Spoken to the lukewarm church of Laodicea, a wealthy city that considered itself self-sufficient, tying God's correction of a complacent church directly to His love for it, not indifference.",
  },
  {
    id: "discipline-6", category: "discipline",
    title: "You who are spiritual should restore him in a spirit of gentleness",
    reference: "Galatians 6:1", book: "Galatians", chapter: 6, verse: 1,
    context: "Paul instructs mature believers to correct a fellow believer caught in sin carefully, watching themselves lest they too be tempted, framing discipline as restoration rather than punishment.",
  },

  // ── Rest & Sabbath ────────────────────────────────────
  {
    id: "rest-sabbath-1", category: "rest-sabbath",
    title: "Remember the Sabbath day, to keep it holy... you shall not do any work",
    reference: "Exodus 20:8", book: "Exodus", chapter: 20, verse: 8,
    context: "The fourth commandment, establishing a rhythm of work and rest built into the created order itself, applying even to servants and animals within the household.",
  },
  {
    id: "rest-sabbath-2", category: "rest-sabbath",
    title: "On the seventh day God rested from all his work... God blessed the seventh day and made it holy",
    reference: "Genesis 2:2", book: "Genesis", chapter: 2, verse: 2,
    context: "God's own rest after creation establishes the pattern before it is ever commanded of people, making Sabbath rest an imitation of God rather than merely an arbitrary rule.",
  },
  {
    id: "rest-sabbath-3", category: "rest-sabbath",
    title: "The Sabbath was made for man, not man for the Sabbath",
    reference: "Mark 2:27", book: "Mark", chapter: 2, verse: 27,
    context: "Jesus responds to Pharisees accusing His disciples of breaking Sabbath law by picking grain, reorienting the purpose of the command back to human flourishing rather than rigid ritual.",
  },
  {
    id: "rest-sabbath-4", category: "rest-sabbath",
    title: "In the seventh year there shall be a Sabbath of solemn rest for the land",
    reference: "Leviticus 25:3", book: "Leviticus", chapter: 25, verse: 3,
    context: "Extends the Sabbath principle beyond people to the land itself, requiring the soil to rest and recover on a seven-year cycle rather than being farmed continuously.",
  },
  {
    id: "rest-sabbath-5", category: "rest-sabbath",
    title: "You shall consecrate the fiftieth year... it shall be a jubilee for you",
    reference: "Leviticus 25:10", book: "Leviticus", chapter: 25, verse: 10,
    context: "The Year of Jubilee, occurring every fifty years, when debts were released, slaves freed, and ancestral land returned — a systemic economic reset built directly into Israel's calendar.",
  },
  {
    id: "rest-sabbath-6", category: "rest-sabbath",
    title: "On the seventh day you shall rest; that your ox and your donkey may have rest",
    reference: "Exodus 23:12", book: "Exodus", chapter: 23, verse: 12,
    context: "Ties Sabbath rest to compassion for laborers, servants, and even work animals, not personal piety alone — rest as a mercy extended downward, not just a rule kept upward.",
  },

  // ── Marriage & Family ─────────────────────────────────
  {
    id: "marriage-family-1", category: "marriage-family",
    title: "Husbands, love your wives, as Christ loved the church and gave himself up for her",
    reference: "Ephesians 5:25", book: "Ephesians", chapter: 5, verse: 25,
    context: "Paul instructs husbands within a household code addressed to a mixed Jewish-Gentile congregation, grounding marital love in Christ's self-sacrificing pattern rather than cultural norms of authority alone.",
  },
  {
    id: "marriage-family-2", category: "marriage-family",
    title: "Children, obey your parents in the Lord, for this is right",
    reference: "Ephesians 6:1", book: "Ephesians", chapter: 6, verse: 1,
    context: "Continues Paul's household code by extending it to children, framing obedience within the family as inherently right rather than merely enforced by fear.",
  },
  {
    id: "marriage-family-3", category: "marriage-family",
    title: "Fathers, do not provoke your children to anger, but bring them up in the discipline and instruction of the Lord",
    reference: "Ephesians 6:4", book: "Ephesians", chapter: 6, verse: 4,
    context: "A notable check on parental authority itself, warning fathers specifically against harsh, exasperating treatment of their children even while calling for real instruction.",
  },
  {
    id: "marriage-family-4", category: "marriage-family",
    title: "Children are a heritage from the LORD, the fruit of the womb a reward",
    reference: "Psalm 127:3", book: "Psalms", chapter: 127, verse: 3,
    context: "Part of a psalm on the futility of labor and ambition without God's blessing, naming children specifically as a gift to be received rather than a burden or an accident.",
  },
  {
    id: "marriage-family-5", category: "marriage-family",
    title: "I hate divorce, says the LORD",
    reference: "Malachi 2:16", book: "Malachi", chapter: 2, verse: 16,
    context: "Malachi confronts a generation of Judean men treating their wives unfaithfully, grounding marital faithfulness in God's original design and desire for godly offspring from marriage.",
  },
  {
    id: "marriage-family-6", category: "marriage-family",
    title: "The husband should give to his wife her conjugal rights, and likewise the wife to her husband",
    reference: "1 Corinthians 7:3", book: "1 Corinthians", chapter: 7, verse: 3,
    context: "Paul answers a specific question from the Corinthian church about marriage, describing a relationship of mutual obligation and devotion rather than one-sided authority.",
  },

  // ── Generosity & Giving ───────────────────────────────
  {
    id: "generosity-1", category: "generosity",
    title: "Whoever brings blessing will be enriched, and one who waters will himself be watered",
    reference: "Proverbs 11:25", book: "Proverbs", chapter: 11, verse: 25,
    context: "Solomon ties generosity toward others directly to personal enrichment — not as a formula to manipulate outcomes, but as an observed pattern in a well-ordered life.",
  },
  {
    id: "generosity-2", category: "generosity",
    title: "God loves a cheerful giver",
    reference: "2 Corinthians 9:7", book: "2 Corinthians", chapter: 9, verse: 7,
    context: "Paul instructs the Corinthian church, while organizing a relief offering for suffering believers in Jerusalem, that the posture of giving matters as much as the amount given.",
  },
  {
    id: "generosity-3", category: "generosity",
    title: "It is more blessed to give than to receive",
    reference: "Acts 20:35", book: "Acts", chapter: 20, verse: 35,
    context: "Paul quotes these words of Jesus, not recorded directly in the Gospels, in his farewell address to the Ephesian elders, justifying his own pattern of working to support the weak rather than depending on others.",
  },
  {
    id: "generosity-4", category: "generosity",
    title: "You shall give to him freely, and your heart shall not be grudging when you give",
    reference: "Deuteronomy 15:10", book: "Deuteronomy", chapter: 15, verse: 10,
    context: "Instructions regarding lending to the poor within Israel, insisting that the internal attitude of the giver matters as much as the external act of giving.",
  },
  {
    id: "generosity-5", category: "generosity",
    title: "Whoever is generous to the poor lends to the LORD, and he will repay him for his deed",
    reference: "Proverbs 19:17", book: "Proverbs", chapter: 19, verse: 17,
    context: "Frames generosity toward the poor as, in effect, a transaction directly with God Himself, who considers Himself the one in debt to be repaid.",
  },
  {
    id: "generosity-6", category: "generosity",
    title: "They all contributed out of their abundance, but she out of her poverty",
    reference: "Mark 12:43", book: "Mark", chapter: 12, verse: 43,
    context: "Jesus, watching temple offerings and noticing a widow's two small copper coins, redefines generosity by proportion and sacrifice rather than raw amount given.",
  },

  // ── Kingdom & Greatness ───────────────────────────────
  {
    id: "kingdom-greatness-1", category: "kingdom-greatness",
    title: "Whoever would be great among you must be your servant",
    reference: "Mark 10:43", book: "Mark", chapter: 10, verse: 43,
    context: "Jesus responds to James and John requesting the best seats in His kingdom, redefining greatness entirely around service rather than status or proximity to power.",
  },
  {
    id: "kingdom-greatness-2", category: "kingdom-greatness",
    title: "The last will be first, and the first last",
    reference: "Matthew 20:16", book: "Matthew", chapter: 20, verse: 16,
    context: "Closes the parable of the workers in the vineyard, where all laborers receive the same wage regardless of hours worked, unsettling ordinary expectations of merit and reward.",
  },
  {
    id: "kingdom-greatness-3", category: "kingdom-greatness",
    title: "Whoever exalts himself will be humbled, and whoever humbles himself will be exalted",
    reference: "Matthew 23:12", book: "Matthew", chapter: 23, verse: 12,
    context: "Spoken as part of Jesus's public rebuke of the scribes and Pharisees' status-seeking religious performance, done for the praise of onlookers rather than God.",
  },
  {
    id: "kingdom-greatness-4", category: "kingdom-greatness",
    title: "The one who is least among you all is the one who is great",
    reference: "Luke 9:48", book: "Luke", chapter: 9, verse: 48,
    context: "Jesus places a child among the disciples arguing about who is greatest, using the least-regarded member of ancient society as the model of kingdom status.",
  },
  {
    id: "kingdom-greatness-5", category: "kingdom-greatness",
    title: "Blessed are the poor in spirit, for theirs is the kingdom of heaven",
    reference: "Matthew 5:3", book: "Matthew", chapter: 5, verse: 3,
    context: "The opening beatitude of the Sermon on the Mount, establishing spiritual poverty — not wealth, power, or self-sufficiency — as the entry posture of the kingdom.",
  },
  {
    id: "kingdom-greatness-6", category: "kingdom-greatness",
    title: "You also ought to wash one another's feet",
    reference: "John 13:14", book: "John", chapter: 13, verse: 14,
    context: "Jesus performs the lowest servant task of the household Himself at the Last Supper, then commands His disciples to follow the same pattern with one another.",
  },

  // ── Unity & Order ─────────────────────────────────────
  {
    id: "unity-order-1", category: "unity-order",
    title: "The body is one and has many members, and all the members... are one body",
    reference: "1 Corinthians 12:12", book: "1 Corinthians", chapter: 12, verse: 12,
    context: "Paul addresses a Corinthian church ranking spiritual gifts by status, using the human body as an image where diverse, unequal-seeming parts are all indispensable to the whole.",
  },
  {
    id: "unity-order-2", category: "unity-order",
    title: "God is not a God of confusion but of peace",
    reference: "1 Corinthians 14:33", book: "1 Corinthians", chapter: 14, verse: 33,
    context: "Part of Paul's instructions correcting chaotic, competitive use of spiritual gifts in worship gatherings, grounding orderly practice in God's own character.",
  },
  {
    id: "unity-order-3", category: "unity-order",
    title: "All things should be done decently and in order",
    reference: "1 Corinthians 14:40", book: "1 Corinthians", chapter: 14, verse: 40,
    context: "Closes Paul's extended correction of the Corinthian worship service, summarizing the underlying principle behind all his specific instructions on tongues and prophecy.",
  },
  {
    id: "unity-order-4", category: "unity-order",
    title: "Eager to maintain the unity of the Spirit in the bond of peace",
    reference: "Ephesians 4:3", book: "Ephesians", chapter: 4, verse: 3,
    context: "Paul urges a church likely including both Jewish and Gentile believers with real cultural tension to actively protect a unity that already exists rather than manufacture one.",
  },
  {
    id: "unity-order-5", category: "unity-order",
    title: "Behold, how good and pleasant it is when brothers dwell in unity!",
    reference: "Psalm 133:1", book: "Psalms", chapter: 133, verse: 1,
    context: "A short \"Song of Ascents\" celebrating relational harmony, likely sung by pilgrims and families traveling together up to Jerusalem's festivals.",
  },
  {
    id: "unity-order-6", category: "unity-order",
    title: "Do two walk together, unless they have agreed to meet?",
    reference: "Amos 3:3", book: "Amos", chapter: 3, verse: 3,
    context: "Part of Amos's rhetorical case for why judgment is coming upon Israel, using an everyday image of agreement as a prerequisite for any real partnership.",
  },

  // ── Grace & the Law ───────────────────────────────────
  {
    id: "grace-law-1", category: "grace-law",
    title: "Sin will have no dominion over you, since you are not under law but under grace",
    reference: "Romans 6:14", book: "Romans", chapter: 6, verse: 14,
    context: "Paul assures Roman believers that grace is not a license for sin but the actual power that breaks sin's controlling grip, unlike law, which could only identify sin without curing it.",
  },
  {
    id: "grace-law-2", category: "grace-law",
    title: "The law was our guardian until Christ came, in order that we might be justified by faith",
    reference: "Galatians 3:24", book: "Galatians", chapter: 3, verse: 24,
    context: "Paul describes the Mosaic law's temporary, protective function — like a household guardian escorting a child to school — pointing forward to its fulfillment in Christ.",
  },
  {
    id: "grace-law-3", category: "grace-law",
    title: "Think not that I have come to abolish the Law or the Prophets... but to fulfill them",
    reference: "Matthew 5:17", book: "Matthew", chapter: 5, verse: 17,
    context: "Jesus clarifies at the start of the Sermon on the Mount that His teaching intensifies and completes the Law's intent rather than discarding it.",
  },
  {
    id: "grace-law-4", category: "grace-law",
    title: "I will put my law within them, and I will write it on their hearts",
    reference: "Jeremiah 31:33", book: "Jeremiah", chapter: 31, verse: 33,
    context: "Part of Jeremiah's New Covenant prophecy to a people about to lose their temple and land, describing a shift from an externally imposed law to an internally transformed will.",
  },
  {
    id: "grace-law-5", category: "grace-law",
    title: "By works of the law no human being will be justified... since through the law comes knowledge of sin",
    reference: "Romans 3:20", book: "Romans", chapter: 3, verse: 20,
    context: "Paul explains the law's actual function was never to save but to expose the reality and extent of sin, preparing the way for the righteousness that comes through faith.",
  },
  {
    id: "grace-law-6", category: "grace-law",
    title: "If you really fulfill the royal law... 'You shall love your neighbor as yourself,' you are doing well",
    reference: "James 2:8", book: "James", chapter: 2, verse: 8,
    context: "James identifies the love command as the summary \"royal law\" that fulfills the rest, tying grace-filled living back to a concrete, checkable ethical standard.",
  },

  // ── Spiritual Renewal ──────────────────────────────────
  {
    id: "spiritual-renewal-1", category: "spiritual-renewal",
    title: "Do not be conformed to this world, but be transformed by the renewal of your mind",
    reference: "Romans 12:2", book: "Romans", chapter: 12, verse: 2,
    context: "Paul instructs believers that changed behavior flows from changed thinking, not the reverse, pivoting from eleven chapters of doctrine into practical, everyday transformation.",
  },
  {
    id: "spiritual-renewal-2", category: "spiritual-renewal",
    title: "Put on the whole armor of God, that you may be able to stand against the schemes of the devil",
    reference: "Ephesians 6:11", book: "Ephesians", chapter: 6, verse: 11,
    context: "Paul, likely writing while chained to a Roman soldier in prison, uses the guard's own armor as a metaphor for the spiritual readiness available to every believer.",
  },
  {
    id: "spiritual-renewal-3", category: "spiritual-renewal",
    title: "We take every thought captive to obey Christ",
    reference: "2 Corinthians 10:5", book: "2 Corinthians", chapter: 10, verse: 5,
    context: "Paul describes spiritual warfare not primarily as external combat but as the discipline of subjecting one's own reasoning and imagination to Christ's authority.",
  },
  {
    id: "spiritual-renewal-4", category: "spiritual-renewal",
    title: "Whatever is true, whatever is honorable... think about these things",
    reference: "Philippians 4:8", book: "Philippians", chapter: 4, verse: 8,
    context: "Paul closes his letter with a practical filter for mental focus, written to a church he repeatedly urges toward joy despite writing from his own imprisonment.",
  },
  {
    id: "spiritual-renewal-5", category: "spiritual-renewal",
    title: "Walk by the Spirit, and you will not gratify the desires of the flesh",
    reference: "Galatians 5:16", book: "Galatians", chapter: 5, verse: 16,
    context: "Paul describes an internal conflict between two opposing drives within every believer, resolved not by willpower alone but by active, moment-by-moment dependence on the Spirit.",
  },
  {
    id: "spiritual-renewal-6", category: "spiritual-renewal",
    title: "Set your minds on things that are above, not on things that are on earth",
    reference: "Colossians 3:2", book: "Colossians", chapter: 3, verse: 2,
    context: "Paul writes to a church tempted by competing mystical philosophies, urging a reoriented focus rooted in their identity as already raised with Christ.",
  },

  // ── Witness & Mission ─────────────────────────────────
  {
    id: "witness-mission-1", category: "witness-mission",
    title: "Go therefore and make disciples of all nations",
    reference: "Matthew 28:19", book: "Matthew", chapter: 28, verse: 19,
    context: "Jesus's final commissioning of the disciples on a mountain in Galilee, expanding the mission from Israel alone to every nation on earth.",
  },
  {
    id: "witness-mission-2", category: "witness-mission",
    title: "You will be my witnesses in Jerusalem and in all Judea and Samaria, and to the end of the earth",
    reference: "Acts 1:8", book: "Acts", chapter: 1, verse: 8,
    context: "Jesus outlines a concentric, expanding pattern for the mission — starting local, ending global — in His final words before the ascension on the Mount of Olives.",
  },
  {
    id: "witness-mission-3", category: "witness-mission",
    title: "You are the light of the world... let your light shine before others",
    reference: "Matthew 5:14", book: "Matthew", chapter: 5, verse: 14,
    context: "Part of the Sermon on the Mount, describing visible, observable good works as the intended means by which people come to glorify God rather than the disciples themselves.",
  },
  {
    id: "witness-mission-4", category: "witness-mission",
    title: "We are ambassadors for Christ, God making his appeal through us",
    reference: "2 Corinthians 5:20", book: "2 Corinthians", chapter: 5, verse: 20,
    context: "Paul describes believers' role in the world using a diplomatic image, representing a message and an authority to the Corinthian church that is not their own.",
  },
  {
    id: "witness-mission-5", category: "witness-mission",
    title: "How are they to hear without someone preaching?",
    reference: "Romans 10:14", book: "Romans", chapter: 10, verse: 14,
    context: "Paul makes the case that faith requires a messenger, tying the entire chain of salvation back to someone being willing to go and speak the gospel aloud.",
  },
  {
    id: "witness-mission-6", category: "witness-mission",
    title: "Always being prepared to make a defense to anyone who asks you for a reason for the hope that is in you",
    reference: "1 Peter 3:15", book: "1 Peter", chapter: 3, verse: 15,
    context: "Peter instructs suffering, scattered believers to hold ready, gentle answers for their faith rather than responding to hostility with either silence or aggression.",
  },
];

// ── Helpers ───────────────────────────────────────────────

export function getPrincipleById(id: string): Principle | undefined {
  return PRINCIPLES.find((p) => p.id === id);
}

export function principlesInCategory(category: PrincipleCategoryId): Principle[] {
  return PRINCIPLES.filter((p) => p.category === category);
}

/** Deterministic daily pick — stable for the whole calendar day, changes automatically the next. */
export function principleOfTheDay(date: Date = new Date()): Principle {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const diff = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - start;
  const dayOfYear = Math.floor(diff / 86400000);
  return PRINCIPLES[dayOfYear % PRINCIPLES.length];
}
