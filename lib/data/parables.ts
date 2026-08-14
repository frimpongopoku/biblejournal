import type { BookName } from "@/lib/bible-books";

// ── Types ─────────────────────────────────────────────────

export type ParablePartId = "growth" | "relational" | "stewardship";

export interface ParablePart {
  id: ParablePartId;
  partNumber: string;
  label: string;
  blurb: string;
  icon: string;
  color: string;
}

export interface ParableReference {
  label: string;
  book: BookName;
  chapter: number;
  verse: number;
}

export interface ParableSymbol {
  term: string;
  meaning: string;
}

export interface ParableSource {
  label: string;
  url: string;
}

export interface ParableEntry {
  id: string;
  part: ParablePartId;
  title: string;
  references: ParableReference[];
  /** Present when a parable is genre-ambiguous — e.g. John's "figure of speech" discourses, or a debated judgment scene. */
  genreNote?: string;
  summary: string;
  context: string;
  symbols: ParableSymbol[];
  sources: ParableSource[];
}

// ── Parts ─────────────────────────────────────────────────

export const PARABLE_PARTS: ParablePart[] = [
  {
    id: "growth",
    partNumber: "Part One",
    label: "Growth & the Kingdom",
    blurb: "Seed, soil, bread, and trade",
    icon: "Sprout",
    color: "#7A9D54",
  },
  {
    id: "relational",
    partNumber: "Part Two",
    label: "Mercy, Money & Neighbors",
    blurb: "Debt, hospitality, and who is shown mercy",
    icon: "HandCoins",
    color: "#B4784A",
  },
  {
    id: "stewardship",
    partNumber: "Part Three",
    label: "Stewardship, Weddings & Judgment",
    blurb: "Capital entrusted, tenants, and final accounting",
    icon: "Scale",
    color: "#5B6F99",
  },
];

export function getParablePart(id: ParablePartId): ParablePart {
  return PARABLE_PARTS.find((p) => p.id === id)!;
}

// ── Entries ───────────────────────────────────────────────

export const PARABLE_ENTRIES: ParableEntry[] = [
  // ══════════════════════ PART ONE — Growth & the Kingdom ══════════════════════
  {
    id: "the-sower",
    part: "growth",
    title: "The Sower",
    references: [
      { label: "Matt 13:1-23", book: "Matthew", chapter: 13, verse: 3 },
      { label: "Mark 4:1-20", book: "Mark", chapter: 4, verse: 3 },
      { label: "Luke 8:4-15", book: "Luke", chapter: 8, verse: 5 },
    ],
    summary: "A farmer scatters seed by hand across a field. Some falls on the hard-packed path and is eaten by birds; some on shallow rocky soil and scorches once the sun rises; some among thorns that choke it; and some on good soil, which yields an abundant crop. Jesus explains the soils as different responses to \"the word of the kingdom.\"",
    context: "Galilean fields were small, terraced plots on limestone hillsides, crisscrossed by footpaths worn hard by people and animals — the \"wayside\" soil. Farmers commonly broadcast seed by hand before plowing it under, so seed landing on a path, on a limestone shelf invisible until the plow struck it, or among still-rooted field-edge thorns was a normal, expected hazard — not a sign of an incompetent sower. \"Rocky ground\" means thin soil over bedrock, not scattered stones: it warms and sprouts fast, but roots can't go deep enough to survive the dry Galilean summer.",
    symbols: [
      { term: "The path", meaning: "A trampled footpath through the field; a hardened heart the message can't penetrate." },
      { term: "Rocky/shallow soil", meaning: "Thin earth over limestone bedrock — fast, shallow growth that dies under summer heat." },
      { term: "Thorns", meaning: "Established weeds at field margins competing for water; worldly cares choking growth." },
      { term: "Good soil, 30/60/100-fold", meaning: "Ordinary yields were closer to 7.5-fold — the number signals supernatural abundance." },
    ],
    sources: [
      { label: "bibleodyssey.org", url: "https://www.bibleodyssey.org/articles/the-parable-of-the-sower/" },
      { label: "setfreeseminars.com", url: "https://setfreeseminars.com/the-parable-of-the-sower-growing-wheat-in-galilee/" },
      { label: "enduringword.com", url: "https://enduringword.com/bible-commentary/mark-4/" },
    ],
  },
  {
    id: "weeds-among-wheat",
    part: "growth",
    title: "The Weeds Among the Wheat",
    references: [{ label: "Matt 13:24-30, 36-43", book: "Matthew", chapter: 13, verse: 24 }],
    summary: "A man sows good wheat, but an enemy secretly sows darnel among it by night. The servants want to pull the weeds immediately; the owner tells them to let both grow until harvest, when reapers separate wheat from weeds and burn the latter.",
    context: "The weed is almost certainly darnel (Lolium temulentum), visually identical to wheat until the grain heads form — by which point the roots are entangled, so premature weeding destroys the wheat too. Darnel's grain is mildly toxic if milled into flour, a genuine agricultural threat. Sabotaging a rival's field by night-sowing was recognized enough in the Roman world that Roman law explicitly prohibited it, and Jewish law (Leviticus 19:19) separately forbade mixing seed types — so the enemy's act reads as a deliberate double violation to this audience.",
    symbols: [
      { term: "Wheat", meaning: "Galilee's staple grain and bread source; the \"sons of the kingdom.\"" },
      { term: "Darnel/tares", meaning: "A toxic look-alike weed; deception invisible until maturity." },
      { term: "The enemy sowing at night", meaning: "A recognizable, legally-prohibited act of sabotage, not an invented plot device." },
      { term: "Harvest & reapers", meaning: "Standard prophetic shorthand for the final separation of good and evil." },
    ],
    sources: [
      { label: "biblestudytools.com", url: "https://www.biblestudytools.com/bible-study/topical-studies/what-is-the-significance-of-wheat-and-tares-in-the-bible.html" },
      { label: "wikipedia.org", url: "https://en.wikipedia.org/wiki/Parable_of_the_Tares" },
    ],
  },
  {
    id: "mustard-seed",
    part: "growth",
    title: "The Mustard Seed",
    references: [
      { label: "Matt 13:31-32", book: "Matthew", chapter: 13, verse: 31 },
      { label: "Mark 4:30-32", book: "Mark", chapter: 4, verse: 30 },
      { label: "Luke 13:18-19", book: "Luke", chapter: 13, verse: 18 },
    ],
    summary: "The kingdom of heaven is like a mustard seed — the smallest of seeds sown — which grows into the largest of garden plants, big enough for birds to nest in its branches.",
    context: "Black mustard normally grows as an annual herb but can reach 8-9 feet, making the seed-to-plant contrast genuinely striking. Jewish sources indicate mustard usually wasn't deliberately cultivated in garden plots, since — as Pliny the Elder also noted — once sown it's nearly impossible to eradicate. That gives the image a subversive edge: rather than the cedar of Lebanon, the Old Testament's standard emblem of imperial grandeur (Daniel 4's Babylon; Ezekiel 17 and 31's Egypt/Assyria as towering trees sheltering birds), Jesus chooses a weedy, unglamorous shrub — the kingdom starts small and unimpressive, yet the birds-nesting image still lands, echoing those same prophetic pictures of nations finding shelter.",
    symbols: [
      { term: "Mustard seed", meaning: "Proverbially tiny; the kingdom's small, unimpressive beginning." },
      { term: "Largest of garden plants", meaning: "Explosive, almost weed-like growth — the kingdom's unstoppable expansion." },
      { term: "Birds nesting in its branches", meaning: "Echoes Daniel 4 and Ezekiel 17/31's tree-empires sheltering nations — now a shrub, not a cedar." },
    ],
    sources: [
      { label: "wikipedia.org", url: "https://en.wikipedia.org/wiki/Parable_of_the_Mustard_Seed" },
      { label: "scielo.org.za", url: "https://scielo.org.za/scielo.php?pid=S1015-87582013000200014&script=sci_arttext" },
    ],
  },
  {
    id: "the-leaven",
    part: "growth",
    title: "The Leaven",
    references: [
      { label: "Matt 13:33", book: "Matthew", chapter: 13, verse: 33 },
      { label: "Luke 13:20-21", book: "Luke", chapter: 13, verse: 20 },
    ],
    summary: "The kingdom of heaven is like leaven a woman mixes into three seahs of flour until the whole batch rises — hidden, pervasive growth from a small input.",
    context: "First-century leaven (Hebrew se'or) wasn't packaged yeast but a piece of fermented dough saved from a previous baking and worked into a fresh batch. Leaven carries a strongly negative charge elsewhere in scripture — forbidden at Passover, generally a metaphor for corrupting influence — which makes Jesus's positive use of it here unusual and debated among interpreters. The quantity, \"three seahs,\" is enormous — roughly 60 lbs of flour, enough for well over a hundred people — deliberately echoing Genesis 18:6, where Sarah prepares three seahs for the divine visitors at Mamre: an image of extravagant hospitality, not just chemistry.",
    symbols: [
      { term: "Leaven (se'or)", meaning: "Reused fermented dough; usually a symbol of corruption, used positively here for unstoppable growth." },
      { term: "Three seahs of flour", meaning: "An unusually large batch, echoing Sarah's hospitality in Genesis 18:6." },
      { term: "\"Hidden\" (Gk. enkrypto)", meaning: "Worked in and invisible — growth imperceptible until it's already complete." },
    ],
    sources: [
      { label: "israelbiblecenter.com", url: "https://weekly.israelbiblecenter.com/the-kingdom-is-like-leaven" },
      { label: "biblestudytools.com", url: "https://www.biblestudytools.com/commentaries/gills-exposition-of-the-bible/matthew-13-33.html" },
      { label: "myjewishlearning.com", url: "https://www.myjewishlearning.com/article/leaven-hametz/" },
    ],
  },
  {
    id: "hidden-treasure",
    part: "growth",
    title: "The Hidden Treasure",
    references: [{ label: "Matt 13:44", book: "Matthew", chapter: 13, verse: 44 }],
    summary: "A man finds treasure hidden in a field, reburies it, and in joy sells everything he owns to buy that field and gain the treasure.",
    context: "Without banks or safes, burying valuables for safekeeping was routine — Josephus records Jerusalem residents doing exactly this during the AD 70 siege. Ownership of found treasure was a live legal question: the Mishnah (Bava Metzia) and Roman legal discourse alike debated rights to valuables discovered on someone else's land. Under the assumption the parable relies on, treasure found in a field belonged to the field's owner — which is precisely why the man must buy the whole field rather than simply take what he found.",
    symbols: [
      { term: "Hidden treasure", meaning: "Valuables buried for safekeeping, a common and legally recognized practice." },
      { term: "The field", meaning: "Must be purchased whole to legally claim what's hidden in it." },
      { term: "Selling all, \"in his joy\"", meaning: "True worth outweighing any cost — an unexpected, stumbled-upon find." },
    ],
    sources: [
      { label: "jerusalemperspective.com", url: "https://www.jerusalemperspective.com/13302/" },
      { label: "fpcjackson.org", url: "https://fpcjackson.org/resource-library/sermons/the-parables-of-the-hidden-treasure-and-the-pearl-of-great-value/" },
    ],
  },
  {
    id: "pearl-of-great-price",
    part: "growth",
    title: "The Pearl of Great Price",
    references: [{ label: "Matt 13:45-46", book: "Matthew", chapter: 13, verse: 45 }],
    summary: "A merchant dealing in fine pearls finds one pearl of surpassing value and sells everything he owns to purchase it.",
    context: "Pearls were among the Greco-Roman world's most valuable commodities — Pliny the Elder ranked them first, ahead of gems that would later surpass them — sourced through Red Sea and Indian Ocean trade. Because natural pearls vary enormously in size and luster, one flawless specimen could equal a merchant's entire fortune, unlike gold or grain valued by uniform weight. The merchant (Greek emporos) actively searches as his trade, contrasting with the Hidden Treasure's accidental finder — together the two parables present two paths to the kingdom, both ending the same way: total, joyful sacrifice.",
    symbols: [
      { term: "The merchant (emporos)", meaning: "A professional trader actively seeking fine goods, not a lucky bystander." },
      { term: "The pearl", meaning: "Prized individually, not sold in bulk — the kingdom's singular, surpassing worth." },
    ],
    sources: [
      { label: "jerusalemperspective.com", url: "https://www.jerusalemperspective.com/13302/" },
      { label: "wikipedia.org", url: "https://en.wikipedia.org/wiki/Parable_of_the_Pearl" },
    ],
  },
  {
    id: "the-net",
    part: "growth",
    title: "The Net (Dragnet)",
    references: [{ label: "Matt 13:47-50", book: "Matthew", chapter: 13, verse: 47 }],
    summary: "The kingdom of heaven is like a dragnet cast into the sea, catching fish of every kind; when full, fishermen sort the catch, keeping the good and discarding the bad — an image Jesus applies to the final judgment.",
    context: "The dragnet (sagene) was a large weighted net with floats on top and lead on the bottom, worked between boats or from shore, sweeping the seabed indiscriminately — unlike a hand-cast net targeting specific fish. Since Jewish dietary law (Leviticus 11:9-12) permitted only fish with fins and scales, a dragnet's mixed catch on the Sea of Galilee always required sorting afterward — scaleless species like catfish had to be discarded. The sorting in the parable is an ordinary trade routine, not an invented detail.",
    symbols: [
      { term: "The dragnet", meaning: "Catches all kinds indiscriminately — the kingdom's outward call gathering all kinds of people." },
      { term: "Sorting good from bad", meaning: "Required by kosher law; parallels the final eschatological separation." },
    ],
    sources: [
      { label: "readingacts.com", url: "https://readingacts.com/2021/06/08/the-parable-of-the-dragnet-matthew-1347-50/" },
      { label: "bibleref.com", url: "https://www.bibleref.com/Matthew/13/Matthew-13-47.html" },
    ],
  },
  {
    id: "growing-seed",
    part: "growth",
    title: "The Growing Seed",
    references: [{ label: "Mark 4:26-29", book: "Mark", chapter: 4, verse: 26 }],
    summary: "A man scatters seed, then goes about his life; it sprouts and grows on its own, without his understanding — blade, then head, then full grain — and once ripe, he sends in the sickle.",
    context: "Palestinian grain matured within about four months of sowing, and much of that stretch required little active intervention — barley and wheat largely grew unattended between sowing and harvest. This parable draws on that real gap in a Galilean farmer's labor: effort concentrated at the beginning and end, with an extended, uncontrolled middle where growth simply happened.",
    symbols: [
      { term: "\"He knows not how\"", meaning: "The real agricultural gap between sowing and harvest, no farmer input required." },
      { term: "Blade, head, full grain", meaning: "The standard staged progression of cereal growth — gradual, organic maturation." },
      { term: "The sickle at ripeness", meaning: "Harvest imagery from Joel 3:13, prophetic shorthand for final judgment." },
    ],
    sources: [
      { label: "wikipedia.org", url: "https://en.wikipedia.org/wiki/Parable_of_the_Growing_Seed" },
      { label: "ncec.catholic.edu.au", url: "https://ncec.catholic.edu.au/faith/scripture-resources/commentaries/the-gospel-of-mark/the-parable-of-the-growing-seed-mark-426-29/" },
    ],
  },
  {
    id: "new-wine-old-wineskins",
    part: "growth",
    title: "New Wine in Old Wineskins",
    references: [
      { label: "Matt 9:16-17", book: "Matthew", chapter: 9, verse: 16 },
      { label: "Mark 2:21-22", book: "Mark", chapter: 2, verse: 21 },
      { label: "Luke 5:36-39", book: "Luke", chapter: 5, verse: 36 },
    ],
    summary: "No one patches an old garment with unshrunk cloth, or puts new wine into old wineskins — the skins burst as the wine ferments, ruining both. New wine needs fresh skins.",
    context: "Wine was stored and carried in skins, not barrels (a Roman/northern technology scarce in timber-poor Galilee) — a whole goat or sheep hide sewn up, one leg left as the spout, seams sealed and leather oiled supple. Fermenting wine keeps releasing gas and expanding after sealing; a new, elastic skin can stretch with it, but an old skin, already stretched to its limit and dried brittle with age, cracks under renewed pressure. The unshrunk-cloth image works the same way: a new patch on old, already-shrunk fabric will shrink further when washed and tear the surrounding weakened cloth. Luke alone adds the wry aside that no one wants new wine after the old, \"for he says, 'the old is good'\" — a note on plain resistance to the new.",
    symbols: [
      { term: "New wine", meaning: "Still-fermenting, expanding wine — the new reality Jesus brings." },
      { term: "Old wineskins", meaning: "Already stretched to their limit, brittle with age — old forms unable to flex for something new." },
      { term: "Unshrunk cloth", meaning: "Will shrink on washing and tear a patch loose — the same incompatibility, a second image." },
    ],
    sources: [
      { label: "wikipedia.org", url: "https://en.wikipedia.org/wiki/New_Wine_into_Old_Wineskins" },
      { label: "hcna.us", url: "https://www.hcna.us/columns/old-wineskins.html" },
      { label: "psephizo.com", url: "https://www.psephizo.com/biblical-studies/what-are-jesus-new-wineskins-structures-or-people/" },
    ],
  },

  // ══════════════════════ PART TWO — Mercy, Money & Neighbors ══════════════════════
  {
    id: "good-samaritan",
    part: "relational",
    title: "The Good Samaritan",
    references: [{ label: "Luke 10:25-37", book: "Luke", chapter: 10, verse: 25 }],
    summary: "A lawyer asks Jesus who counts as his \"neighbor.\" Jesus answers with a beaten traveler on the Jerusalem-Jericho road, passed by a priest and a Levite, but rescued, bandaged, transported, and paid for by a Samaritan — then turns the question back on the lawyer.",
    context: "Jewish-Samaritan hostility ran deep: the rupture traces to 722 BC, when Assyria resettled the destroyed Northern Kingdom with foreign populations who blended Israelite worship with other cults, and hardened around 520 BC when returning Judean exiles rejected Samaritan help rebuilding the Temple. Samaritans built a rival temple on Mount Gerizim, which the Hasmonean king John Hyrcanus destroyed in 128 BC — a wound still live in John 4:9's \"Jews do not associate with Samaritans.\" A priest or Levite avoiding the body wasn't simple callousness: Numbers 19 prescribes seven days' defilement from corpse contact, a real concern since Jericho housed many priestly families rotating through Temple service. The road itself drops roughly 3,300 feet over 17 rocky miles — long-reputed bandit country. The Samaritan's two denarii was about two days' wages, a meaningful advance to an innkeeper, a trade itself often viewed with suspicion.",
    symbols: [
      { term: "Priest / Levite", meaning: "Temple servants bound by purity codes that made corpse contact costly." },
      { term: "Samaritan", meaning: "An ethnic and religious rival, worshipping at Gerizim, not Jerusalem." },
      { term: "Two denarii", meaning: "About two days' wages — a real, open-ended commitment to the innkeeper." },
    ],
    sources: [
      { label: "craigkeener.com", url: "https://craigkeener.com/the-good-samaritan-part-two-luke-1031-37/" },
      { label: "biblicalarchaeology.org", url: "https://www.biblicalarchaeology.org/daily/ancient-cultures/daily-life-and-practice/the-samaritan-schism/" },
      { label: "enduringword.com", url: "https://enduringword.com/bible-commentary/luke-10/" },
    ],
  },
  {
    id: "prodigal-son",
    part: "relational",
    title: "The Prodigal Son",
    references: [{ label: "Luke 15:11-32", book: "Luke", chapter: 15, verse: 11 }],
    summary: "A younger son demands his inheritance early, squanders it in \"a far country,\" and ends up feeding pigs, destitute. He returns expecting servant status; his father runs to meet him, fully restores him as son, and throws a feast — provoking the older brother's resentment.",
    context: "Under Deuteronomy 21:17, the firstborn received a double portion — two-thirds to the elder, one-third to the younger — but possession normally came only at the father's death. Demanding an early share was tantamount to \"I wish you were already dead,\" a breach Deuteronomy 21:18-21 treats as grave rebellion. The \"far country\" is Gentile territory; being hired to feed pigs — unclean under Leviticus 11:7 — was the ultimate degradation for a Jew. A dignified patriarch did not run in public, since doing so meant hiking up one's robe and exposing the legs; interpreters following Kenneth Bailey's work on Middle-Eastern village life read this as the father absorbing his son's public shame before the village could inflict it. The robe, signet ring, and sandals (servants went barefoot) together signal full reinstatement as son, not hired hand.",
    symbols: [
      { term: "Firstborn's double portion", meaning: "The legal inheritance share under Deuteronomy 21:17." },
      { term: "Unclean pigs", meaning: "Forbidden animals (Lev 11:7); tending them was maximal degradation." },
      { term: "Robe, ring, sandals", meaning: "Restore honor, legal authority, and free (not servant) status — respectively." },
      { term: "The father's run", meaning: "A breach of patriarchal decorum, read as absorbing the son's shame publicly." },
    ],
    sources: [
      { label: "craigkeener.com", url: "https://craigkeener.com/the-prodigal-son-luke-15/" },
      { label: "gotquestions.org", url: "https://www.gotquestions.org/parable-prodigal-son.html" },
      { label: "meyerpink.com", url: "https://meyerpink.com/how-does-a-jewish-inheritance-law-favor-a-prodigal-son/" },
    ],
  },
  {
    id: "two-debtors",
    part: "relational",
    title: "The Two Debtors",
    references: [{ label: "Luke 7:41-43", book: "Luke", chapter: 7, verse: 41 }],
    summary: "At Simon the Pharisee's table, a woman known as \"a sinner\" anoints Jesus's feet with tears and ointment. When Simon inwardly doubts him for allowing it, Jesus tells of a creditor forgiving two debts — 500 and 50 denarii — asking which debtor will love him more.",
    context: "A denarius was a laborer's standard daily wage: 500 denarii equaled roughly a year and a half to two years' wages, 50 was under two months'. Moneylenders normally had real recourse against defaulters — property seizure, even debt servitude — so cancelling both debts outright was extraordinary grace, not ordinary business. The scene turns on breached hospitality: a host owed an honored guest water for the feet, a greeting kiss, and oil for the head — Simon supplied none of the three, a calculated slight since he had invited Jesus himself. The woman's uninvited, excessive gestures — tears instead of water, kisses on the feet, costly ointment — publicly inverted that insult.",
    symbols: [
      { term: "Denarius", meaning: "A laborer's daily wage; 500 vs. 50 marks a tenfold gap in debt." },
      { term: "Foot washing, kiss, oil", meaning: "Three standard courtesies for an honored guest — all three withheld by Simon." },
      { term: "\"Sinner\"", meaning: "A social label marking the woman as disreputable, likely for sexual sin." },
    ],
    sources: [
      { label: "bibleref.com", url: "https://www.bibleref.com/Luke/7/Luke-7-41.html" },
      { label: "blueletterbible.org", url: "https://www.blueletterbible.org/comm/maclaren_alexander/expositions-of-holy-scripture/luke/the-two-debtors.cfm" },
    ],
  },
  {
    id: "unforgiving-servant",
    part: "relational",
    title: "The Unforgiving Servant",
    references: [{ label: "Matt 18:21-35", book: "Matthew", chapter: 18, verse: 23 }],
    summary: "A king forgives a servant an impossibly vast debt, but that servant then violently refuses to forgive a fellow servant's comparatively trivial debt. The king hands him to torturers; Jesus warns God will do likewise to anyone who withholds forgiveness from the heart.",
    context: "A talent was worth about 6,000 denarii; 10,000 talents (60 million denarii) represented roughly 150,000-200,000 years of ordinary labor — more than ten times Herod's entire kingdom's annual tax revenue. \"Ten thousand\" (Greek myrioi, source of \"myriad\") was the largest expressible figure in Greek, so the debt is deliberately impossible, dramatizing sin's unpayable weight. Ancient practice allowed creditors to seize a debtor's family and sell them into slavery, or hand debtors to jailers who used imprisonment to pressure relatives — the parable's stakes were real. Against that, the second servant's 100-denarii debt (three to four months' wages) was manageable, making the first servant's refusal morally shocking to the original audience.",
    symbols: [
      { term: "Talent", meaning: "The largest monetary unit of the era, ~6,000 denarii — used here for hyperbole." },
      { term: "Selling into slavery", meaning: "A real legal remedy for debt default, extending to a debtor's family." },
      { term: "Torturers/jailers", meaning: "Debt-enforcement agents using confinement to pressure repayment." },
    ],
    sources: [
      { label: "readingacts.com", url: "https://readingacts.com/2022/01/19/the-parable-of-the-unmerciful-servant-matthew-1823-35/" },
      { label: "wikipedia.org", url: "https://en.wikipedia.org/wiki/Parable_of_the_Unforgiving_Servant" },
      { label: "enduringword.com", url: "https://enduringword.com/bible-commentary/matthew-18/" },
    ],
  },
  {
    id: "pharisee-tax-collector",
    part: "relational",
    title: "The Pharisee and the Tax Collector",
    references: [{ label: "Luke 18:9-14", book: "Luke", chapter: 18, verse: 9 }],
    summary: "Two men pray in the Temple — a Pharisee, thanking God for his own righteousness, and a tax collector, standing at a distance, beating his chest, crying for mercy. Jesus says the tax collector, not the Pharisee, went home justified.",
    context: "Pharisees were a respected reform movement admired for scrupulous Torah observance beyond the legal minimum — fasting twice weekly and tithing \"of all that I get\" were genuine, admired disciplines, so the Pharisee's prayer would have sounded unremarkable, even praiseworthy, at first. Tax collectors (telonai) bought or subcontracted collection rights from Rome and were notorious for overcharging; handling Gentile money for the occupying power made them viewed as ritually compromised collaborators, near the bottom of the social order. Temple prayer was typically spoken aloud, standing with eyes and hands lifted; the tax collector's refusal to lift his eyes, his distance from the crowd, and his chest-beating (a rare, visceral gesture of anguish) mark a strikingly countercultural posture against the Pharisee's confident, self-comparing prayer.",
    symbols: [
      { term: "Pharisee", meaning: "Respected lay teacher, strict Torah-keeper, voluntary faster and tither." },
      { term: "Tax collector (telones)", meaning: "Rome-affiliated revenue contractor, socially despised as collaborator." },
      { term: "Beating the breast", meaning: "A rare physical gesture of anguish or repentance." },
    ],
    sources: [
      { label: "psephizo.com", url: "https://www.psephizo.com/biblical-studies/the-parable-of-the-pharisee-and-the-tax-collector-in-luke-18/" },
      { label: "gotquestions.org", url: "https://www.gotquestions.org/parable-Pharisee-tax-collector.html" },
    ],
  },
  {
    id: "rich-fool",
    part: "relational",
    title: "The Rich Fool",
    references: [{ label: "Luke 12:16-21", book: "Luke", chapter: 12, verse: 16 }],
    summary: "A wealthy landowner, after an abundant harvest, plans to tear down his barns and build bigger ones for years of ease. God calls him a fool: his life will be demanded of him that very night.",
    context: "First-century Palestine was a largely subsistence agrarian economy; grain was stored in jars, pits, or stone granaries, so enlarging storehouses reflects a recognizable farming decision. Land was often concentrated through purchase or foreclosure on smaller farmers, so a landowner needing bigger barns was likely an elite whose surplus came partly at neighbors' expense. Jewish wisdom and covenant law (gleaning laws, tithes for the needy) insisted surplus grain carried obligations to the poor, not just private security. \"This night your soul is required of you\" is a Semitic idiom for sudden death — a debt metaphor, life held on loan from God — making the man's talk of \"many years\" tragically ironic.",
    symbols: [
      { term: "Barns/granaries", meaning: "Stone or pit grain storage — a real, recognizable farming decision." },
      { term: "\"Your soul is required\"", meaning: "Idiom for sudden death; life held on loan from God." },
      { term: "\"Rich toward God\"", meaning: "The contrast term: generosity/dependence vs. self-directed hoarding." },
    ],
    sources: [
      { label: "jesuswalk.com", url: "https://www.jesuswalk.com/luke/055-greed.htm" },
      { label: "gotquestions.org", url: "https://www.gotquestions.org/parable-rich-fool.html" },
      { label: "wikipedia.org", url: "https://en.wikipedia.org/wiki/Parable_of_the_Rich_Fool" },
    ],
  },
  {
    id: "rich-man-lazarus",
    part: "relational",
    title: "The Rich Man and Lazarus",
    references: [{ label: "Luke 16:19-31", book: "Luke", chapter: 16, verse: 19 }],
    summary: "An unnamed rich man lives in luxury while a poor, sore-covered beggar named Lazarus lies at his gate. Both die; Lazarus is carried to Abraham's side while the rich man suffers in torment, separated by an uncrossable chasm.",
    context: "\"Purple and fine linen\" signaled top-tier wealth — Tyrian purple dye, extracted in minuscule quantities from murex sea snails, cost more than its weight in gold. Lazarus's begging and untreated sores reflect the real plight of the disabled poor. Dogs in this period were unclean scavengers, not pets, so their licking his sores marks him as already treated like refuse. \"Abraham's bosom\" draws on banquet-reclining custom, where the seat of honor was next to the host; some Second Temple Jewish thought pictured Sheol as divided into a comfortable region for the righteous and a place of torment for the wicked — the cosmology the parable assumes. Lazarus is also the only named character in any parable of Jesus — his name (\"God has helped\") standing in ironic contrast to the nameless rich man.",
    symbols: [
      { term: "Purple / fine linen", meaning: "Tyrian-dyed cloth signaling extreme, near-royal wealth." },
      { term: "Dogs", meaning: "Unclean scavengers, not companions — their touch was degrading." },
      { term: "Abraham's bosom", meaning: "The honored banquet position; shorthand for the righteous dead's rest." },
      { term: "The great chasm", meaning: "A fixed, uncrossable boundary in Jewish afterlife geography." },
    ],
    sources: [
      { label: "craigkeener.com", url: "https://craigkeener.com/the-rich-man-and-lazarus-luke-1619-31/" },
      { label: "blueletterbible.org", url: "https://www.blueletterbible.org/faq/don_stewart/don_stewart_115.cfm" },
      { label: "gotquestions.org", url: "https://www.gotquestions.org/rich-man-and-Lazarus.html" },
    ],
  },
  {
    id: "friend-at-midnight",
    part: "relational",
    title: "The Friend at Midnight",
    references: [{ label: "Luke 11:5-8", book: "Luke", chapter: 11, verse: 5 }],
    summary: "A man wakes a friend at midnight to borrow three loaves for an unexpected guest. The friend at first refuses, but gets up and gives what's needed because of the petitioner's shameless persistence — the basis for Jesus's \"ask, seek, knock.\"",
    context: "Village hospitality was a strict, shared obligation — a guest arriving even unannounced at night had to be fed, and failing to do so shamed the whole community. The scene assumes a one-room peasant house where the extended family slept together on a raised platform with animals below; answering the door meant climbing over sleeping children and livestock to unbar a door that, once shut, signaled real \"do not disturb.\" The Greek behind \"persistence,\" anaideia, literally means shamelessness — audacity that overrides normal social propriety for a genuine need.",
    symbols: [
      { term: "Three loaves", meaning: "The standard staple portion owed to an arriving guest." },
      { term: "The shut door", meaning: "A deliberate \"do not disturb\" signal, making the request genuinely costly." },
      { term: "Anaideia (shamelessness)", meaning: "The parable's pivotal word — audacious persistence overriding propriety." },
    ],
    sources: [
      { label: "blueletterbible.org", url: "https://www.blueletterbible.org/Comm/archives/guzik_david/StudyGuide_Luk/Luk_11.cfm" },
      { label: "bibleref.com", url: "https://www.bibleref.com/Luke/11/Luke-11-8.html" },
      { label: "gotquestions.org", url: "https://www.gotquestions.org/parable-persistent-neighbor.html" },
    ],
  },
  {
    id: "persistent-widow",
    part: "relational",
    title: "The Persistent Widow & the Unjust Judge",
    references: [{ label: "Luke 18:1-8", book: "Luke", chapter: 18, verse: 2 }],
    summary: "A corrupt judge who \"neither feared God nor respected man\" is repeatedly pressed by a widow demanding justice, and eventually grants it just to be rid of her. Jesus argues from lesser to greater: if even an unjust judge relents, how much more will God answer his people.",
    context: "Widows held one of the most precarious positions in ancient Israel — without a husband, father, or adult son to represent her, a widow typically had no independent standing to defend property, which is why Torah repeatedly commands special protection for widows. Local judges under Roman-era administration were often political appointees, not trained jurists, and a judge fearing \"neither God nor man\" was a recognizable corrupt type. Her leverage was public, relentless persistence against her \"adversary\" (Greek antidikos, an opposing litigant). \"Wear me out\" translates hypopiazo — literally a boxing term for a blow under the eye, the same word Paul uses in 1 Corinthians 9:27 — most likely an idiom here for public shaming, since reputation was serious currency in an honor-shame culture.",
    symbols: [
      { term: "Widow", meaning: "Legally and economically vulnerable — a recurring object of Torah's protective commands." },
      { term: "Adversary (antidikos)", meaning: "The widow's opposing party in a legal dispute." },
      { term: "\"Wear me out\" (hypopiazo)", meaning: "Literally \"give a black eye\" — an idiom for public shaming, not physical exhaustion." },
    ],
    sources: [
      { label: "billmounce.com", url: "https://www.billmounce.com/monday-with-mounce/did-the-judge-fear-getting-beat-luke-18-5" },
      { label: "gotquestions.org", url: "https://www.gotquestions.org/parable-persistent-widow-unjust-judge.html" },
      { label: "enterthebible.org", url: "https://enterthebible.org/passage/luke-181-8-a-widow-and-an-unjust-judge/" },
    ],
  },
  {
    id: "lost-sheep",
    part: "relational",
    title: "The Lost Sheep",
    references: [
      { label: "Matt 18:12-14", book: "Matthew", chapter: 18, verse: 12 },
      { label: "Luke 15:3-7", book: "Luke", chapter: 15, verse: 4 },
    ],
    summary: "A shepherd with a hundred sheep loses one, leaves the ninety-nine, and searches until he finds it, carrying it home rejoicing. Matthew applies it to not writing off vulnerable believers; Luke, to heaven's joy over one repentant sinner.",
    context: "Shepherding was among the most familiar occupations in the Judean hill country. A flock of a hundred was a modest, realistic holding — not a massive operation — so losing even one animal was a real, traceable loss, and the rocky, semi-arid terrain genuinely exposed strays to cliffs and predators. Despite the trade's economic importance, shepherds held low social status in Second Temple Judaism, regarded as ritually unreliable witnesses — sharpening the irony of shepherd imagery applied to God. The image draws directly on Psalm 23's personal shepherd-God and Ezekiel 34's indictment of Israel's failed human shepherds alongside God's promise to search for the scattered flock himself.",
    symbols: [
      { term: "Shepherd", meaning: "Low-status but essential; stands in for God/Messiah (Ezekiel 34, Psalm 23)." },
      { term: "Flock of 100", meaning: "A realistic, modest flock size, not an exaggeration." },
      { term: "Carrying on the shoulders", meaning: "A known technique for exhausted animals — tender restoration, not mere rescue." },
    ],
    sources: [
      { label: "enduringword.com", url: "https://enduringword.com/bible-commentary/luke-15/" },
      { label: "bibleodyssey.org", url: "https://www.bibleodyssey.org/articles/shepherds-in-the-bible/" },
      { label: "wikipedia.org", url: "https://en.wikipedia.org/wiki/Parable_of_the_Lost_Sheep" },
    ],
  },
  {
    id: "lost-coin",
    part: "relational",
    title: "The Lost Coin",
    references: [{ label: "Luke 15:8-10", book: "Luke", chapter: 15, verse: 8 }],
    summary: "A woman with ten silver coins loses one, lights a lamp, sweeps her house, and searches until she finds it, calling friends and neighbors to rejoice — the same lesson as the Lost Sheep, told through a domestic, female-centered scene.",
    context: "The coin was a drachma, roughly a day's wage, so ten represented meaningful savings — plausibly a woman's dowry, in a culture where married women had limited independent property rights. Bible-background scholarship notes a widely cited (if debated) practice of Palestinian brides wearing a strand of pierced coins as part of a bridal headdress, marking betrothed or married status — on this reading, a missing coin was a visible social loss, not just a financial one. First-century village houses commonly had one small, dim room with a hard dirt or stone floor, so a dropped coin could easily vanish into a crack — explaining the need for a lamp even by day, and systematic sweeping.",
    symbols: [
      { term: "Drachma", meaning: "A day's-wage-value coin, roughly equivalent to a Roman denarius." },
      { term: "Ten coins", meaning: "Likely a woman's dowry or savings set, possibly worn as a headdress." },
      { term: "Lamp & sweeping", meaning: "Practical necessities in a dark, one-room house with a dirt floor." },
    ],
    sources: [
      { label: "blueletterbible.org", url: "https://www.blueletterbible.org/Comm/archives/guzik_david/StudyGuide_Luk/Luk_15.cfm" },
      { label: "biblestudytools.com", url: "https://www.biblestudytools.com/luke/15-8.html" },
      { label: "wikipedia.org", url: "https://en.wikipedia.org/wiki/Parable_of_the_Lost_Coin" },
    ],
  },
  {
    id: "unjust-steward",
    part: "relational",
    title: "The Unjust (Shrewd) Steward",
    references: [{ label: "Luke 16:1-13", book: "Luke", chapter: 16, verse: 1 }],
    summary: "A steward, about to be fired for wasting his master's possessions, secures his future by reducing what several debtors owe before his dismissal takes effect. The master commends his shrewdness, not his dishonesty.",
    context: "An oikonomos (root of \"economy\") was a trusted estate manager with legal authority to bind contracts on the owner's behalf — which is why his debt reductions were legally valid. Managers typically earned through commissions built into loans, and since Torah forbade charging fellow Israelites interest (Deuteronomy 23:19-20), inflating the quantity recorded on a debt bond was a common way to disguise interest. The debts named are substantial — about 900 gallons of olive oil (customarily marked up around 100%, covering spoilage risk and hidden interest) and roughly 30 tons of wheat (a lower typical markup) — serious commercial transactions. The steward is most plausibly cutting his own commission or the disguised usury, still costly to the master but recognizable to the audience as clever risk management, not petty theft.",
    symbols: [
      { term: "Oikonomos", meaning: "Trusted estate agent who could legally bind the owner to contracts." },
      { term: "Debt bond", meaning: "A promissory note written by the debtor, alterable at the steward's direction." },
      { term: "Olive oil / wheat", meaning: "High- and lower-markup commodities respectively, both disguising forbidden interest." },
    ],
    sources: [
      { label: "psephizo.com", url: "https://www.psephizo.com/biblical-studies/the-parable-of-the-unjust-steward-in-luke-16/" },
      { label: "enduringword.com", url: "https://enduringword.com/bible-commentary/luke-16/" },
      { label: "gotquestions.org", url: "https://www.gotquestions.org/parable-unjust-steward.html" },
    ],
  },

  // ══════════════════════ PART THREE — Stewardship, Weddings & Judgment ══════════════════════
  {
    id: "the-talents",
    part: "stewardship",
    title: "The Talents",
    references: [{ label: "Matt 25:14-30", book: "Matthew", chapter: 25, verse: 14 }],
    summary: "A man entrusts three servants with talents — 5, 2, and 1 — \"according to his ability.\" Two trade and double their money; the third buries his out of fear. The faithful are given more; the fearful servant is condemned and his talent taken away.",
    context: "A talent was a unit of weight (about 75-80 lbs of silver), equal to roughly 6,000 denarii — meaning one talent represented 15-20 years of an ordinary laborer's wages, an almost incomprehensible sum for a household servant to manage. The parable assumes a common arrangement: a landowner traveling abroad leaves slaves — not free employees — in charge of capital, expecting them to actively trade or invest it. The master's rebuke that the third servant should have \"put my money with the bankers\" reflects a real institution: money-changers' tables (trapezai) in the marketplace paying interest on deposits, though Jewish law restricted interest to non-Jews, making active trade the more common route to growth.",
    symbols: [
      { term: "Talent", meaning: "Largest unit of currency by weight — roughly 15-20 years' wages." },
      { term: "Burying money", meaning: "A legally defensible safeguard in the period — plausible, if condemned here as timidity." },
      { term: "The bankers", meaning: "Real first-century financial intermediaries paying interest on deposits." },
    ],
    sources: [
      { label: "biblestudytools.com", url: "https://www.biblestudytools.com/bible-stories/the-parable-of-the-talents-bible-story.html" },
      { label: "theologyofwork.org", url: "https://www.theologyofwork.org/new-testament/matthew/living-in-the-new-kingdom-matthew-18-25/the-parable-of-the-talents-matthew-2514-30/" },
      { label: "learnreligions.com", url: "https://www.learnreligions.com/what-is-a-talent-700699" },
    ],
  },
  {
    id: "the-minas",
    part: "stewardship",
    title: "The Minas (Pounds)",
    references: [{ label: "Luke 19:11-27", book: "Luke", chapter: 19, verse: 12 }],
    summary: "A nobleman travels abroad to receive a kingdom while his citizens, who hate him, send a delegation to oppose his rule. He leaves ten servants a mina each to trade with; on return as king, he rewards the faithful and executes the rebels.",
    context: "A mina was far smaller than a talent — about 100 drachmas, roughly three months' wages. The story's real punch is political: told near Jericho, where Herod's son Archelaus had built his palace, it echoes a locally famous episode — Archelaus traveled to Rome around 4 BC to have his father's will confirmed as king, while a Jewish delegation followed to oppose him before Caesar. Rome confirmed him (as ethnarch), and he returned to brutally suppress opposition before eventually being deposed. Jesus's audience would have caught the allusion immediately, subverting hopes that God's kingdom would appear immediately and violently as they neared Jerusalem.",
    symbols: [
      { term: "Mina", meaning: "A modest sum (~3 months' wages), unlike the talent's enormous value — faithfulness in \"very little.\"" },
      { term: "The nobleman's journey", meaning: "Directly echoes Archelaus's real trip to Rome for royal confirmation." },
      { term: "\"We do not want this man to reign\"", meaning: "Mirrors the historical embassy against Archelaus, and foreshadows the crowd's rejection of Jesus." },
    ],
    sources: [
      { label: "jesuswalk.com", url: "https://www.jesuswalk.com/luke/084-minas.htm" },
      { label: "gotquestions.org", url: "https://www.gotquestions.org/parable-ten-minas.html" },
    ],
  },
  {
    id: "ten-virgins",
    part: "stewardship",
    title: "The Ten Virgins",
    references: [{ label: "Matt 25:1-13", book: "Matthew", chapter: 25, verse: 1 }],
    summary: "Ten bridesmaids wait with lamps for a bridegroom's arrival; five bring extra oil, five don't. The bridegroom is delayed until midnight; the unprepared five run out of oil, leave to buy more, and find the door shut on their return.",
    context: "First-century Jewish marriage unfolded in stages: a betrothal contract, then, roughly a year later, the marriage proper, when the groom would come — often without exact prior notice — to fetch his bride in a torch-lit night procession. Attendants were expected to carry their own lit lamps — small oil-fed clay lamps or oil-soaked torches, burning only about two hours before needing more fuel — to join that procession; anyone without a lit lamp had no legitimate place in the party. Because the exact hour was genuinely unpredictable and celebrations began at night, readiness rather than mere presence was the real test of a genuine attendant.",
    symbols: [
      { term: "Bridegroom", meaning: "Christ at his return — his delay mirrors real, unpredictable groom-timing." },
      { term: "Oil lamps", meaning: "Badge of legitimate membership in the wedding party; a two-hour burn meant reserves mattered." },
      { term: "The shut door", meaning: "Once the party entered, latecomers were genuinely locked out — a serious social exclusion." },
    ],
    sources: [
      { label: "shalomlc.org", url: "https://www.shalomlc.org/articles/the-ten-virgins-jewish-wedding-and-the-second-coming" },
      { label: "enduringword.com", url: "https://enduringword.com/bible-commentary/matthew-25/" },
    ],
  },
  {
    id: "great-banquet",
    part: "stewardship",
    title: "The Great Banquet / Wedding Feast",
    references: [
      { label: "Matt 22:1-14", book: "Matthew", chapter: 22, verse: 2 },
      { label: "Luke 14:15-24", book: "Luke", chapter: 14, verse: 16 },
    ],
    summary: "A host prepares a lavish banquet; the invited guests refuse to come (in Matthew, some kill the messengers), so servants gather replacement guests from the streets. In Matthew, one improperly dressed guest is expelled.",
    context: "Etiquette called for two invitations: an initial one well in advance, and a second summons on the day itself announcing everything was ready — meaning the refusals in the parable are a calculated public insult, not a scheduling conflict. In Matthew's version, wealthy hosts customarily supplied wedding garments as a matter of hospitality, especially in royal contexts; refusing the provided robe was a deliberate insult, not an excusable lack of resources — which is why the offending guest is speechless when confronted. Luke's detail of gathering the poor, crippled, blind, and lame is a deliberate reversal of banquet honor codes, which normally excluded people who couldn't reciprocate an invitation.",
    symbols: [
      { term: "Double invitation", meaning: "Refusing the second, \"all is ready\" summons was a serious breach of honor culture." },
      { term: "Excuses (field, oxen, marriage)", meaning: "Culturally flimsy pretexts — such transactions were normally settled before agreeing to attend." },
      { term: "Wedding garment", meaning: "A host-provided robe in Matthew's version; refusing it was contempt, not poverty." },
    ],
    sources: [
      { label: "bible.org", url: "https://bible.org/seriespage/32-parable-wedding-banquet-matthew-221-14" },
      { label: "gotquestions.org", url: "https://www.gotquestions.org/wedding-garments.html" },
      { label: "wikipedia.org", url: "https://en.wikipedia.org/wiki/Parable_of_the_Great_Banquet" },
    ],
  },
  {
    id: "laborers-vineyard",
    part: "stewardship",
    title: "The Laborers in the Vineyard",
    references: [{ label: "Matt 20:1-16", book: "Matthew", chapter: 20, verse: 1 }],
    summary: "A landowner hires workers at dawn, 9am, noon, 3pm, and 5pm, promising a \"fair\" wage. At day's end, all receive the same denarius regardless of hours worked, provoking the early workers' complaints — which the owner rebuffs by asserting his right to be generous.",
    context: "A denarius was the recognized standard daily wage — enough for subsistence, not surplus, so a single day without work threatened real hunger. The village marketplace functioned as an informal hiring hall, where landless day laborers, often displaced by debt or Roman taxation, gathered each morning hoping to be chosen. The urgency behind hiring even at 5pm reflects the real agricultural calendar: grapes ripened just before the autumn rains, and an unharvested crop could be ruined if the rains broke first — a landowner genuinely needed all the labor he could get, even for a single late hour.",
    symbols: [
      { term: "Denarius", meaning: "The standard, agreed day's wage — paying it to all regardless of hours is the deliberate scandal." },
      { term: "Marketplace", meaning: "The real gathering point where unemployed day laborers waited to be hired." },
      { term: "\"Is your eye evil?\"", meaning: "An idiom for envy/stinginess, contrasted with the owner's deliberate generosity." },
    ],
    sources: [
      { label: "theologyofwork.org", url: "https://www.theologyofwork.org/new-testament/matthew/living-in-the-new-kingdom-matthew-18-25/the-laborers-in-the-vineyard-matthew-201-16/" },
      { label: "wikipedia.org", url: "https://en.wikipedia.org/wiki/Parable_of_the_Workers_in_the_Vineyard" },
    ],
  },
  {
    id: "wicked-tenants",
    part: "stewardship",
    title: "The Wicked Tenants",
    references: [
      { label: "Matt 21:33-46", book: "Matthew", chapter: 21, verse: 33 },
      { label: "Mark 12:1-12", book: "Mark", chapter: 12, verse: 1 },
      { label: "Luke 20:9-19", book: "Luke", chapter: 20, verse: 9 },
    ],
    summary: "A landowner plants a vineyard, leases it to tenants, and moves abroad. When he sends servants to collect his share, the tenants beat and kill them, then kill his son too, hoping to seize the inheritance. The owner destroys the tenants and gives the vineyard to others.",
    context: "Absentee landlordism was common in first-century Judea and Galilee — landowners leased land to tenants for a fixed rent or, more often, a share (often a third or a quarter) of the harvest, and disputes over that share were a real, ongoing source of friction. The vineyard imagery deliberately evokes Isaiah 5:1-7's \"Song of the Vineyard,\" where Israel is God's carefully planted vineyard yielding wild grapes instead of good fruit — the chief priests and elders in the audience would have caught this echo immediately. Some scholars note the tenants may reflect comparatively well-off commercial farmers with a real legal claim to press if the heir died without possession established, heightening the calculation behind killing the son.",
    symbols: [
      { term: "The vineyard", meaning: "Israel, drawing directly on Isaiah 5's vineyard song." },
      { term: "The tenant farmers", meaning: "The religious/temple leadership responsible for Israel's fruitfulness." },
      { term: "Servants sent for fruit", meaning: "The prophets, repeatedly rejected throughout Israel's history." },
      { term: "The son", meaning: "Jesus, whose death \"outside the vineyard\" echoes crucifixion outside Jerusalem." },
    ],
    sources: [
      { label: "postost.net", url: "https://www.postost.net/2017/11/jesus-parable-wicked-tenants-exercise-narrative-historical-hermeneutics" },
      { label: "wikipedia.org", url: "https://en.wikipedia.org/wiki/Parable_of_the_Wicked_Husbandmen" },
    ],
  },
  {
    id: "the-two-sons",
    part: "stewardship",
    title: "The Two Sons",
    references: [{ label: "Matt 21:28-32", book: "Matthew", chapter: 21, verse: 28 }],
    summary: "A father asks two sons to work in his vineyard. The first refuses, then goes; the second agrees, then never goes. Jesus applies it: tax collectors and prostitutes, who repented under John, enter the kingdom ahead of the religious leaders who rejected him.",
    context: "Delivered in the temple courts right after the chief priests and elders refuse to publicly evaluate John the Baptist's ministry out of political fear. Tax collectors and prostitutes were both social and religious outcasts — the former for collaborating with Rome, often through overcharging — yet both groups had responded to John's baptism of repentance, while the religious establishment, the \"obedient\" son on paper, had not. The vineyard-labor setting again taps the common image of Israel/covenant obedience as vineyard work.",
    symbols: [
      { term: "Vineyard work", meaning: "Covenant obedience to God's will — a recognizable stand-in given the vineyard-as-Israel motif." },
      { term: "First son (no, then goes)", meaning: "Tax collectors and prostitutes, whose rejection gave way to genuine repentance." },
      { term: "Second son (yes, then doesn't)", meaning: "Religious leaders whose verbal piety wasn't matched by action." },
    ],
    sources: [
      { label: "thebiblesays.com", url: "https://thebiblesays.com/en/commentary/mat+21:28" },
      { label: "theologyofwork.org", url: "https://www.theologyofwork.org/new-testament/matthew/living-in-the-new-kingdom-matthew-18-25/parable-of-the-two-sons-matthew-2128-32/" },
    ],
  },
  {
    id: "sheep-and-goats",
    part: "stewardship",
    title: "The Sheep and the Goats",
    references: [{ label: "Matt 25:31-46", book: "Matthew", chapter: 25, verse: 31 }],
    genreNote: "Debated: a judgment scene, not a classic parable",
    summary: "At his coming, the Son of Man separates the nations as a shepherd separates sheep from goats, judging both by how they treated \"the least of these\" — the hungry, thirsty, stranger, naked, sick, and imprisoned.",
    context: "In Palestinian herding, sheep and goats commonly grazed together by day on the same hillsides, but were separated at evening because goats needed shelter from the cold that sheep tolerated outdoors — an everyday, unremarkable routine that gives the judgment scene its vividness: intermingled by day, decisively sorted by night. The imagery also draws on Ezekiel 34, where God himself judges between the fat and lean sheep who trample and abuse the flock's resources — reinforcing the throne, glory, and \"King\" language unusual for a simple parable, which is why some scholars argue this is better read as a straightforward apocalyptic judgment scene using parabolic imagery, rather than a parable proper.",
    symbols: [
      { term: "Sheep / goats", meaning: "The righteous and unrighteous — historically separated at night for practical, not moral, reasons." },
      { term: "Right hand / left", meaning: "The place of honor versus disfavor in ancient seating and judgment customs." },
      { term: "\"The least of these my brothers\"", meaning: "Most historical-critical readings tie this to Jesus's messengers (echoing Matthew 10), not the poor generally." },
    ],
    sources: [
      { label: "psephizo.com — who are the sheep & goats", url: "https://www.psephizo.com/biblical-studies/who-are-the-sheep-and-the-goats-in-matt-25/" },
      { label: "psephizo.com — the \"not-parable\"", url: "https://www.psephizo.com/biblical-studies/the-not-parable-of-the-sheep-and-the-goats-in-matthew-25/" },
    ],
  },
  {
    id: "wise-foolish-builders",
    part: "stewardship",
    title: "The Wise & Foolish Builders",
    references: [
      { label: "Matt 7:24-27", book: "Matthew", chapter: 7, verse: 24 },
      { label: "Luke 6:47-49", book: "Luke", chapter: 6, verse: 47 },
    ],
    summary: "Two men build houses — one on rock, one on sand. A storm strikes both; the house on rock stands, the house on sand collapses completely.",
    context: "Archaeological surveys around the Sea of Galilee show houses of this period built either directly on the region's hard alluvial sand or with foundations dug through it to bedrock, sometimes many feet deep. The critical variable wasn't sand-versus-rock location in the abstract — much of the Galilean building surface was hardened sand either way — but whether a builder invested the extra labor to dig a true foundation. The flood imagery reflects a real seasonal hazard: dry wadis and low ground could be transformed almost overnight by winter rains and the Jordan's overflow, washing away houses without deep foundations.",
    symbols: [
      { term: "Rock (bedrock)", meaning: "A foundation dug deep enough to reach stable ground — obedience as a load-bearing foundation." },
      { term: "Sand", meaning: "Deceptively firm-looking in dry months, unstable once winter floods arrived." },
      { term: "Digging deep", meaning: "The extra, often-skipped labor separating a wise builder from a merely convenient one." },
    ],
    sources: [
      { label: "biblestudytools.com", url: "https://www.biblestudytools.com/bible-study/topical-studies/the-parable-of-the-two-builders.html" },
      { label: "wikipedia.org", url: "https://en.wikipedia.org/wiki/Parable_of_the_Wise_and_the_Foolish_Builders" },
    ],
  },
  {
    id: "budding-fig-tree",
    part: "stewardship",
    title: "The Budding Fig Tree",
    references: [
      { label: "Matt 24:32-35", book: "Matthew", chapter: 24, verse: 32 },
      { label: "Mark 13:28-31", book: "Mark", chapter: 13, verse: 28 },
      { label: "Luke 21:29-31", book: "Luke", chapter: 21, verse: 29 },
    ],
    summary: "Jesus tells the disciples to learn from the fig tree: when its branches soften and put out leaves, everyone knows summer is near. Likewise, when they see the signs he described, they'll know the fulfillment is near.",
    context: "The fig tree was among the most common, dependable fruit trees in Judea's agricultural economy — unlike evergreens, it loses its leaves in winter, so its new growth is an unmistakable seasonal marker any villager, not just an expert, could read correctly. In Hebrew scripture the fig tree also frequently symbolizes Israel's national well-being or spiritual state (Hosea 9:10, Joel 1:7, Jeremiah 24), giving the image a possible extra layer of national meaning beyond the simple seasonal illustration.",
    symbols: [
      { term: "Tender branches, new leaves", meaning: "An easily observed, universally understood sign of an imminent, fixed season." },
      { term: "Fig tree", meaning: "Elsewhere in scripture, a recurring symbol for Israel's national and spiritual condition." },
    ],
    sources: [
      { label: "biblestudytoolbox.com", url: "https://biblestudytoolbox.com/bible-studies/parables-of-jesus/parable-of-the-fig-tree/" },
    ],
  },
  {
    id: "the-doorkeeper",
    part: "stewardship",
    title: "The Doorkeeper",
    references: [{ label: "Mark 13:34-37", book: "Mark", chapter: 13, verse: 34 }],
    summary: "A man going on a journey puts his servants in charge, each with assigned work, and commands the doorkeeper specifically to stay alert — he doesn't know when the master returns, \"evening, midnight, rooster crow, or dawn.\"",
    context: "In a wealthy household, servants held specific ongoing duties during a master's absence; the doorkeeper guarded the household's single point of entry and had to stay alert at any hour, since travelers — and thieves — could arrive by night. Jesus's four watches (\"evening, midnight, cockcrow, morning\") use the Roman military system of dividing the night into four three-hour watches, rather than the earlier Jewish three-watch system — a detail familiar to an audience living under Roman administration and garrison presence.",
    symbols: [
      { term: "The doorkeeper", meaning: "The servant with a non-negotiable duty of vigilance at the single point of entry." },
      { term: "Four night watches", meaning: "The Roman (not older Jewish) system, reflecting life under Roman administration." },
    ],
    sources: [
      { label: "tfionline.com", url: "https://directors.tfionline.com/post/stories-jesus-told-waiting-servants/" },
      { label: "biblestudytoolbox.com", url: "https://biblestudytoolbox.com/bible-studies/parables-of-jesus/parable-of-the-owner-of-the-house/" },
    ],
  },
  {
    id: "the-strong-man",
    part: "stewardship",
    title: "The Strong Man",
    references: [
      { label: "Matt 12:29", book: "Matthew", chapter: 12, verse: 29 },
      { label: "Mark 3:27", book: "Mark", chapter: 3, verse: 27 },
      { label: "Luke 11:21-22", book: "Luke", chapter: 11, verse: 21 },
    ],
    summary: "Answering the accusation that he casts out demons by Satan's power, Jesus says no one can plunder a strong man's house unless they first bind him — implying his exorcisms prove he has already overpowered Satan.",
    context: "The image draws on the ordinary reality of household security and theft: a strong, armed householder could defend his goods against casual intrusion, and the only way to plunder his house was to first neutralize him by force — a scenario any listener familiar with real banditry would grasp immediately. Jesus deploys this against scribes from Jerusalem who had accused him of casting out demons by Beelzebul, \"the prince of demons,\" a serious legal-religious charge; his logic is that his successful exorcisms are evidence he has already bound the stronger power, not evidence of collusion with it.",
    symbols: [
      { term: "The strong man", meaning: "Satan, understood as having genuine, guarded authority prior to being overcome." },
      { term: "Binding", meaning: "A recognizable image from securing intruders or captives, repurposed as a spiritual-authority claim." },
    ],
    sources: [
      { label: "wikipedia.org", url: "https://en.wikipedia.org/wiki/Parable_of_the_Strong_Man" },
      { label: "thegospelcoalition.org", url: "https://www.thegospelcoalition.org/article/jesus-bound-strong-man-what-that-means-for-you/" },
    ],
  },
  {
    id: "good-shepherd",
    part: "stewardship",
    title: "The Good Shepherd",
    references: [{ label: "John 10:1-18", book: "John", chapter: 10, verse: 1 }],
    genreNote: "A figure of speech (paroimia), not a synoptic parable",
    summary: "Jesus describes himself as both the \"door\" of the sheep and the \"good shepherd\" who knows his sheep by name and lays down his life for them — contrasted with hired hands who flee at danger and thieves who enter illegitimately.",
    context: "John never uses parabole (\"parable\"), the word Matthew, Mark, and Luke use; here he uses paroimia — \"figure of speech\" or \"veiled saying\" — a sustained, layered metaphor rather than a short narrative. Communal sheepfolds were simple walled enclosures, open at the top, with a single entrance and no physical door — at night the shepherd himself lay across that opening, becoming a literal, living door. Multiple flocks were often penned together overnight for shared safety, and sheep genuinely learned to recognize their own shepherd's voice, separating out from a mixed flock to follow only him at sorting time each morning — a real, observable phenomenon behind Jesus's claim.",
    symbols: [
      { term: "The sheepfold", meaning: "A communal, walled enclosure with one entrance, shared by multiple flocks overnight." },
      { term: "The door", meaning: "Legitimate access — the shepherd's own body at night functioned as a literal door." },
      { term: "The shepherd's voice", meaning: "How sheep really distinguished and followed their own shepherd out of a mixed flock." },
    ],
    sources: [
      { label: "catechist.com", url: "https://www.catechist.com/does-john-use-parables-introduction-to-johns-figures-of-speech/" },
      { label: "biblehub.com", url: "https://biblehub.com/greek/3942.htm" },
      { label: "israelmyglory.org", url: "https://israelmyglory.org/article/the-shepherd-of-israel-the-true-shepherd-john-101-5-part-one/" },
    ],
  },
  {
    id: "vine-and-branches",
    part: "stewardship",
    title: "The Vine and the Branches",
    references: [{ label: "John 15:1-17", book: "John", chapter: 15, verse: 1 }],
    genreNote: "A figure of speech (paroimia), not a synoptic parable",
    summary: "Jesus describes himself as the \"true vine\" and the Father as the vinedresser, who prunes fruitful branches to increase yield and removes fruitless ones entirely. Disciples are called to \"abide\" in the vine, since apart from it they can do nothing.",
    context: "Viticulture was deeply familiar across the hill country of Judea, Samaria, and Galilee — terraced vineyard slopes and rock-cut winepresses attest to a continuous wine economy going back centuries. Vinedressers followed a genuine seasonal cycle: severe pruning and leaf-stripping after autumn harvest to induce dormancy, and further trimming in spring before flowering, both aimed at maximizing future fruit rather than vegetative growth — the concrete practice underlying the Father's active pruning \"so that it may bear more fruit.\" The vine was also an established Hebrew scripture metaphor for Israel itself (Psalm 80, Isaiah 5, Jeremiah 2, Ezekiel 15 and 19), so Jesus's claim to be the \"true\" vine implicitly repositions himself, not the nation collectively, as the locus of covenant fruitfulness.",
    symbols: [
      { term: "The vine", meaning: "Jesus, echoing and reframing the Old Testament's recurring image of Israel as God's vine." },
      { term: "The vinedresser", meaning: "God the Father, actively managing growth through real, seasonally-timed pruning." },
      { term: "Pruning", meaning: "The real agricultural practice of cutting back even healthy branches to increase future fruit." },
      { term: "Branches cut off and burned", meaning: "Dead vine wood had no other practical use except as kindling — a mundane detail sharpening the warning." },
    ],
    sources: [
      { label: "faithalone.org", url: "https://faithalone.org/wp-content/uploads/2020/08/derickson.pdf" },
      { label: "psephizo.com", url: "https://www.psephizo.com/biblical-studies/jesus-is-the-true-vine-in-john-15/" },
    ],
  },
  {
    id: "counting-the-cost",
    part: "stewardship",
    title: "Counting the Cost",
    references: [{ label: "Luke 14:28-33", book: "Luke", chapter: 14, verse: 28 }],
    summary: "Jesus tells would-be disciples to first calculate the cost, using a man who starts a tower without checking he can finish it, and a king who must decide, before battle, whether his 10,000 troops can withstand an opposing 20,000 — applying both to the total renunciation discipleship requires.",
    context: "Both illustrations draw on high-stakes planning any listener would recognize: an abandoned building project with only a foundation laid was a visible, standing monument to poor planning that invited public mockery in a face-to-face honor/shame culture, while a king facing a 2-to-1 disadvantage had exactly two real options — commit fully or negotiate terms early. Some commentators suggest the tower in view may specifically be a vineyard watchtower (a common structure for guarding crops, cf. Isaiah 5:2 and Mark 12:1's tenant-farming setting), tying the image back into the same agrarian estate world as the vineyard parables.",
    symbols: [
      { term: "The tower", meaning: "Possibly a vineyard watchtower; an unfinished one was a public monument to failed foresight." },
      { term: "10,000 vs. 20,000 troops", meaning: "A stark, calculable disadvantage demanding full commitment or negotiated surrender — no middle path." },
    ],
    sources: [
      { label: "wikipedia.org", url: "https://en.wikipedia.org/wiki/Counting_the_cost" },
      { label: "gotquestions.org", url: "https://www.gotquestions.org/count-the-cost.html" },
    ],
  },
  {
    id: "barren-fig-tree",
    part: "stewardship",
    title: "The Barren Fig Tree",
    references: [{ label: "Luke 13:6-9", book: "Luke", chapter: 13, verse: 6 }],
    summary: "A man plants a fig tree in his vineyard and finds no fruit for three years running. He orders it cut down; the vinedresser asks for one more year to dig around and fertilize it, offering to cut it down then if it still fails.",
    context: "Planting a fig tree within a vineyard was established multi-cropping practice — the fig benefited from cultivated soil while providing shade for workers, a normal, doubly-useful planting. Fig trees typically produced two or even three fruit-bearing seasons annually, so three consecutive years of total fruitlessness was a genuinely unusual, extended failure justifying real economic frustration — the tree occupied soil that could support productive vines. Told in Luke right after Jesus calls his hearers to repent \"or you will all likewise perish,\" the parable draws on the well-established prophetic vineyard/fig-tree image for Israel's accountability (Isaiah 5:1-7, Hosea 9:10, Micah 7:1), with the vinedresser's intercession picturing a real horticultural remedy as a season of grace before judgment.",
    symbols: [
      { term: "Fig tree in a vineyard", meaning: "A real, doubly-beneficial planting; also a stock image for Israel." },
      { term: "Three years of no fruit", meaning: "An unusually extended failure given the fig's normal harvest cycle." },
      { term: "Digging & fertilizing", meaning: "An actual horticultural remedy, used here as a picture of gracious extra time before judgment." },
    ],
    sources: [
      { label: "bereaninsights.org", url: "https://www.bereaninsights.org/bible-gem-1011-a-fig-tree-in-a-vineyard-luke-136-9/" },
      { label: "sanrafaelop.org", url: "https://sanrafaelop.org/2024/07/29/parable-of-the-fig-tree-luke-13-6-9/" },
    ],
  },
  {
    id: "master-and-servant",
    part: "stewardship",
    title: "The Master and His Servant",
    references: [{ label: "Luke 17:7-10", book: "Luke", chapter: 17, verse: 7 }],
    summary: "Jesus asks whether a master would invite a servant in from plowing to sit and eat, or would instead expect him to first prepare and serve the master's meal — without thanks for merely doing his assigned duty. Disciples who obey fully should say, \"We are unworthy servants.\"",
    context: "The scenario assumes the real, unremarkable master-slave relationship of a small first-century farming household, where a single servant (Greek doulos, an actual slave) might handle both fieldwork and household chores including meal service — a common arrangement for a modest landowner without separate staff. Under both Jewish and Roman norms of the period, this hierarchy was simply assumed: a master reversing roles to serve his own slave, or thanking him for ordinary assigned duties, would have struck the original audience as genuinely strange, not admirably humble — fulfilling one's role created no special claim to gratitude. Jesus leverages that unremarkable convention to make a sharper point: total obedience to God is the baseline, not something that earns merit.",
    symbols: [
      { term: "The servant (doulos)", meaning: "A real household slave, likely the sole servant of a modest farming establishment." },
      { term: "\"We are unworthy servants\"", meaning: "An idiom reflecting the real social assumption that duty, however demanding, earned no special claim." },
    ],
    sources: [
      { label: "psephizo.com", url: "https://www.psephizo.com/biblical-studies/does-jesus-treat-us-as-good-for-nothing-slaves-in-luke-17/" },
      { label: "jesuswalk.com", url: "https://www.jesuswalk.com/luke/073-dutiful-servants.htm" },
    ],
  },
];

export function getParableEntryById(id: string): ParableEntry | undefined {
  return PARABLE_ENTRIES.find((e) => e.id === id);
}

export function parablesInPart(part: ParablePartId): ParableEntry[] {
  return PARABLE_ENTRIES.filter((e) => e.part === part);
}

/** Deterministic daily pick — stable for the whole calendar day, changes automatically the next. */
export function parableOfTheDay(date: Date = new Date()): ParableEntry {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const diff = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - start;
  const dayOfYear = Math.floor(diff / 86400000);
  return PARABLE_ENTRIES[dayOfYear % PARABLE_ENTRIES.length];
}
