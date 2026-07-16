import { OT_BOOKS, type BookName } from "@/lib/bible-books";

// ── Types ─────────────────────────────────────────────────

export type WealthCategoryId =
  | "provision" | "tithing" | "stewardship" | "generosity" | "contentment"
  | "warnings" | "work" | "ownership" | "debt" | "poverty"
  | "inheritance" | "eternal";

export type WealthKind = "promise" | "principle" | "warning" | "wisdom";

export interface WealthCategory {
  id: WealthCategoryId;
  label: string;
  blurb: string;
  icon: string;
  color: string;
}

export interface WealthEntry {
  id: string;
  category: WealthCategoryId;
  kind: WealthKind;
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

export const WEALTH_KINDS: { id: WealthKind; label: string; color: string }[] = [
  { id: "promise",   label: "Promise",   color: "var(--bj-gold-deep)" },
  { id: "principle", label: "Principle", color: "var(--bj-ink3)" },
  { id: "warning",   label: "Warning",   color: "var(--bj-ember)" },
  { id: "wisdom",    label: "Wisdom",    color: "var(--bj-sage)" },
];

// ── Categories ────────────────────────────────────────────

export const WEALTH_CATEGORIES: WealthCategory[] = [
  { id: "provision",    label: "Provision",           blurb: "He meets material need",       icon: "Wallet",        color: "#6E9E5C" },
  { id: "tithing",      label: "Tithing & Firstfruits", blurb: "Honoring Him first",          icon: "Percent",       color: "#C9A227" },
  { id: "stewardship",  label: "Stewardship",         blurb: "Managing, not owning",          icon: "Briefcase",     color: "#8A7256" },
  { id: "generosity",   label: "Generosity & Giving", blurb: "Open hands multiply",           icon: "Gift",          color: "#D4A24E" },
  { id: "contentment",  label: "Contentment",         blurb: "Enough, truly enough",           icon: "Anchor",        color: "#4F7C82" },
  { id: "warnings",     label: "Warnings About Riches", blurb: "What wealth can do to a heart", icon: "TriangleAlert", color: "#A65D57" },
  { id: "work",         label: "Work & Diligence",    blurb: "Labor that bears fruit",         icon: "Hammer",        color: "#C98A4B" },
  { id: "ownership",    label: "God's Ownership",     blurb: "It was always His",              icon: "Landmark",      color: "#5B7C99" },
  { id: "debt",         label: "Debt & Lending",      blurb: "Freedom and its cost",            icon: "HandCoins",     color: "#7FA5C4" },
  { id: "poverty",      label: "Poverty & the Poor",  blurb: "A cry He always hears",           icon: "HandHelping",   color: "#C0616B" },
  { id: "inheritance",  label: "Inheritance & Legacy", blurb: "What outlasts a lifetime",       icon: "TreeDeciduous", color: "#6B8CAE" },
  { id: "eternal",      label: "Eternal Perspective",  blurb: "Treasure that cannot be lost",   icon: "Gem",           color: "#9B6BA8" },
];

export function getWealthCategory(id: WealthCategoryId): WealthCategory {
  return WEALTH_CATEGORIES.find((c) => c.id === id)!;
}

export function getWealthKind(id: WealthKind) {
  return WEALTH_KINDS.find((k) => k.id === id)!;
}

// ── Entries ───────────────────────────────────────────────

export const WEALTH_ENTRIES: WealthEntry[] = [
  // ── Provision ─────────────────────────────────────────
  {
    id: "provision-1", category: "provision", kind: "promise",
    title: "My God will supply every need of yours according to his riches in glory",
    reference: "Philippians 4:19", book: "Philippians", chapter: 4, verse: 19,
    context: "Paul writes from prison thanking the Philippian church for the financial gift they sent him despite their own poverty, promising that the same generosity shown to him will be repaid by God's abundant supply.",
  },
  {
    id: "provision-2", category: "provision", kind: "promise",
    title: "Seek first the kingdom of God, and all these things will be added to you",
    reference: "Matthew 6:33", book: "Matthew", chapter: 6, verse: 33,
    context: "Part of the Sermon on the Mount, spoken to a crowd anxious about food and clothing under Roman occupation, Jesus reorders priorities: material provision follows the pursuit of God's kingdom, not the other way around.",
  },
  {
    id: "provision-3", category: "provision", kind: "promise",
    title: "I have not seen the righteous forsaken or his children begging for bread",
    reference: "Psalm 37:25", book: "Psalms", chapter: 37, verse: 25,
    context: "David reflects near the end of his life on watching God sustain the righteous even while the wicked seemed to prosper temporarily — a personal testimony of a lifetime's pattern, not a blanket guarantee against every hardship.",
  },
  {
    id: "provision-4", category: "provision", kind: "principle",
    title: "Remember the LORD your God, for it is he who gives you power to get wealth",
    reference: "Deuteronomy 8:18", book: "Deuteronomy", chapter: 8, verse: 18,
    context: "Moses warns Israel just before they enter a bountiful land that the very ability to produce wealth is a gift from God meant to confirm His covenant, not evidence of their own strength.",
  },
  {
    id: "provision-5", category: "provision", kind: "promise",
    title: "The LORD Will Provide",
    reference: "Genesis 22:14", book: "Genesis", chapter: 22, verse: 14,
    context: "At the climax of Abraham's hardest test — offering Isaac on Mount Moriah — God provides a ram at the last moment, and Abraham names the place after this provision, a name that became a byword in Israel.",
  },
  {
    id: "provision-6", category: "provision", kind: "promise",
    title: "Those who seek the LORD lack no good thing",
    reference: "Psalm 34:10", book: "Psalms", chapter: 34, verse: 10,
    context: "David composed this after escaping King Achish of Gath by feigning madness, testifying that dependence on God, not scheming or self-sufficiency, is what actually sustains a person.",
  },

  // ── Tithing & Firstfruits ─────────────────────────────
  {
    id: "tithing-1", category: "tithing", kind: "promise",
    title: "Bring the full tithe into the storehouse... and see if I will not... pour down for you a blessing",
    reference: "Malachi 3:10", book: "Malachi", chapter: 3, verse: 10,
    context: "The last Old Testament prophet confronts a post-exilic Judah that had grown spiritually apathetic, withholding offerings; God issues a rare, direct invitation to test His faithfulness through obedient giving.",
  },
  {
    id: "tithing-2", category: "tithing", kind: "promise",
    title: "Honor the LORD with your wealth... then your barns will be filled with plenty",
    reference: "Proverbs 3:9", book: "Proverbs", chapter: 3, verse: 9,
    context: "Solomon instructs his son that giving God the firstfruits — the first and best portion of a harvest, before personal use — was understood to invite rather than diminish abundance.",
  },
  {
    id: "tithing-3", category: "tithing", kind: "principle",
    title: "Every tithe of the land... is the LORD's; it is holy to the LORD",
    reference: "Leviticus 27:30", book: "Leviticus", chapter: 27, verse: 30,
    context: "Part of Israel's holiness code, establishing the tithe not as a voluntary donation but as something already set apart as belonging to God before it was ever counted as personal property.",
  },
  {
    id: "tithing-4", category: "tithing", kind: "principle",
    title: "Abram gave him a tenth of everything",
    reference: "Genesis 14:20", book: "Genesis", chapter: 14, verse: 20,
    context: "After rescuing his nephew Lot in a regional war, Abram gives a tenth of the recovered spoils to Melchizedek, priest of God Most High — the Bible's earliest recorded tithe, given voluntarily, centuries before the Mosaic law required it.",
  },
  {
    id: "tithing-5", category: "tithing", kind: "principle",
    title: "The one who sows bountifully will also reap bountifully",
    reference: "2 Corinthians 9:6", book: "2 Corinthians", chapter: 9, verse: 6,
    context: "Paul urges the Corinthian church to follow through on a relief offering for Jerusalem believers, reframing giving as an act of cheerful sowing rather than a legal obligation extracted under pressure.",
  },
  {
    id: "tithing-6", category: "tithing", kind: "principle",
    title: "To the Levites... I have given every tithe in Israel for an inheritance",
    reference: "Numbers 18:21", book: "Numbers", chapter: 18, verse: 21,
    context: "Because the tribe of Levi received no allotted land like the other tribes, the tithe functioned as their means of provision in exchange for their work maintaining the tabernacle and its worship.",
  },

  // ── Stewardship ───────────────────────────────────────
  {
    id: "stewardship-1", category: "stewardship", kind: "warning",
    title: "You cannot serve God and money",
    reference: "Matthew 6:24", book: "Matthew", chapter: 6, verse: 24,
    context: "Part of the Sermon on the Mount, Jesus personifies money (\"mammon\") as a rival master, teaching that wealth's pull on loyalty is strong enough to functionally compete with devotion to God.",
  },
  {
    id: "stewardship-2", category: "stewardship", kind: "principle",
    title: "One who is faithful in a very little is also faithful in much",
    reference: "Luke 16:10", book: "Luke", chapter: 16, verse: 10,
    context: "Follows the parable of the dishonest manager, where Jesus uses the manager's shrewdness — not his dishonesty — as a teaching point: how a person handles money reveals whether they can be trusted with greater responsibility.",
  },
  {
    id: "stewardship-3", category: "stewardship", kind: "principle",
    title: "Well done, good and faithful servant. You have been faithful over a little; I will set you over much",
    reference: "Matthew 25:21", book: "Matthew", chapter: 25, verse: 21,
    context: "From the Parable of the Talents, where a master entrusts servants with different amounts before a journey; the two who invest and grow what they were given are commended, while the one who buried his out of fear is rebuked.",
  },
  {
    id: "stewardship-4", category: "stewardship", kind: "principle",
    title: "The earth is the LORD's and the fullness thereof",
    reference: "Psalm 24:1", book: "Psalms", chapter: 24, verse: 1,
    context: "A worship psalm establishing the theological foundation underneath every other wealth teaching in scripture: everything, including all material wealth, ultimately belongs to God and is only ever managed by people.",
  },
  {
    id: "stewardship-5", category: "stewardship", kind: "principle",
    title: "It is required of stewards that they be found faithful",
    reference: "1 Corinthians 4:2", book: "1 Corinthians", chapter: 4, verse: 2,
    context: "Paul describes himself and the apostles as stewards of God's mysteries, defining faithfulness — not brilliance or results — as the single metric by which any steward, including of money, is measured.",
  },
  {
    id: "stewardship-6", category: "stewardship", kind: "wisdom",
    title: "All things come from you, and of your own have we given you",
    reference: "1 Chronicles 29:14", book: "1 Chronicles", chapter: 29, verse: 14,
    context: "David prays this publicly after Israel's leaders give generously toward materials for the temple Solomon would build, modeling the posture that even generous giving is really just returning what was already God's.",
  },

  // ── Generosity & Giving ───────────────────────────────
  {
    id: "generosity-1", category: "generosity", kind: "principle",
    title: "One gives freely, yet grows all the richer",
    reference: "Proverbs 11:25", book: "Proverbs", chapter: 11, verse: 25,
    context: "Solomon observes a counterintuitive pattern: withholding more than is right leads to poverty, while generous giving tends toward increase — an observed principle of a well-ordered life, not a guaranteed formula.",
  },
  {
    id: "generosity-2", category: "generosity", kind: "promise",
    title: "God is able to make all grace abound to you, so that... you may abound in every good work",
    reference: "2 Corinthians 9:8", book: "2 Corinthians", chapter: 9, verse: 8,
    context: "Paul teaches the Corinthian church that generous giving flows from — and is replenished by — God's abundant grace, tying material generosity to spiritual sufficiency rather than personal lack.",
  },
  {
    id: "generosity-3", category: "generosity", kind: "promise",
    title: "Give, and it will be given to you... pressed down, shaken together, running over",
    reference: "Luke 6:38", book: "Luke", chapter: 6, verse: 38,
    context: "Part of Jesus's Sermon on the Plain, using the image of a merchant overfilling a grain measure before pouring it into the buyer's lap to describe overflowing generosity in return for generosity given.",
  },
  {
    id: "generosity-4", category: "generosity", kind: "wisdom",
    title: "They all contributed out of their abundance, but she out of her poverty",
    reference: "Mark 12:43", book: "Mark", chapter: 12, verse: 43,
    context: "Jesus, watching people deposit money into the temple treasury, redefines generosity by proportion and sacrifice: the poor widow's two small coins outweigh the surplus given by the wealthy.",
  },
  {
    id: "generosity-5", category: "generosity", kind: "principle",
    title: "It is more blessed to give than to receive",
    reference: "Acts 20:35", book: "Acts", chapter: 20, verse: 35,
    context: "Paul quotes this saying of Jesus, not recorded directly in the Gospels, in his farewell address to the Ephesian elders, using it to justify his own pattern of working with his hands to support the weak.",
  },
  {
    id: "generosity-6", category: "generosity", kind: "promise",
    title: "Whoever is generous to the poor lends to the LORD, and he will repay him for his deed",
    reference: "Proverbs 19:17", book: "Proverbs", chapter: 19, verse: 17,
    context: "Frames generosity toward the poor as, in effect, a loan made directly to God Himself, who considers Himself obligated to repay it.",
  },

  // ── Contentment ───────────────────────────────────────
  {
    id: "contentment-1", category: "contentment", kind: "principle",
    title: "Godliness with contentment is great gain",
    reference: "1 Timothy 6:6", book: "1 Timothy", chapter: 6, verse: 6,
    context: "Paul warns Timothy about false teachers who treat godliness as a means of financial gain, redefining true \"gain\" as contentment itself rather than accumulated wealth.",
  },
  {
    id: "contentment-2", category: "contentment", kind: "promise",
    title: "Be content with what you have, for he has said, 'I will never leave you nor forsake you'",
    reference: "Hebrews 13:5", book: "Hebrews", chapter: 13, verse: 5,
    context: "The writer ties contentment directly to the security of God's abiding presence — anxious grasping for more makes sense only if you believe you might be left to fend for yourself.",
  },
  {
    id: "contentment-3", category: "contentment", kind: "wisdom",
    title: "I have learned, in whatever situation I am, to be content",
    reference: "Philippians 4:11", book: "Philippians", chapter: 4, verse: 11,
    context: "Paul writes this from a Roman prison, describing contentment as a learned skill built through cycles of both abundance and need, not a natural temperament or a result of favorable circumstances.",
  },
  {
    id: "contentment-4", category: "contentment", kind: "wisdom",
    title: "Give me neither poverty nor riches; feed me with the food that is needful for me",
    reference: "Proverbs 30:8", book: "Proverbs", chapter: 30, verse: 8,
    context: "Agur's prayer recognizes that both extremes of wealth and poverty carry spiritual danger, asking instead for exactly enough — a rare biblical prayer for moderation rather than increase.",
  },
  {
    id: "contentment-5", category: "contentment", kind: "wisdom",
    title: "He who loves money will not be satisfied with money",
    reference: "Ecclesiastes 5:10", book: "Ecclesiastes", chapter: 5, verse: 10,
    context: "The Teacher observes that wealth accumulation creates its own appetite rather than satisfying it, part of his broader argument that material gain alone cannot fill life with meaning.",
  },
  {
    id: "contentment-6", category: "contentment", kind: "warning",
    title: "Be on your guard against all covetousness, for one's life does not consist in the abundance of his possessions",
    reference: "Luke 12:15", book: "Luke", chapter: 12, verse: 15,
    context: "Jesus responds to a man demanding He arbitrate an inheritance dispute, refusing to take sides and instead confronting the greed underneath the request itself.",
  },

  // ── Warnings About Riches ─────────────────────────────
  {
    id: "warnings-1", category: "warnings", kind: "warning",
    title: "The love of money is a root of all kinds of evils",
    reference: "1 Timothy 6:10", book: "1 Timothy", chapter: 6, verse: 10,
    context: "Paul clarifies to Timothy that money itself is not condemned — it is the love of it, the desire to be rich, that has led some to wander from the faith and pierce themselves with many griefs.",
  },
  {
    id: "warnings-2", category: "warnings", kind: "warning",
    title: "It is easier for a camel to go through the eye of a needle than for a rich person to enter the kingdom of God",
    reference: "Matthew 19:24", book: "Matthew", chapter: 19, verse: 24,
    context: "Spoken right after a wealthy young ruler walks away sorrowful, unwilling to sell his possessions to follow Jesus — the disciples' shocked reaction shows how strongly wealth was assumed to signal God's favor in that culture.",
  },
  {
    id: "warnings-3", category: "warnings", kind: "warning",
    title: "Fool! This night your soul is required of you",
    reference: "Luke 12:20", book: "Luke", chapter: 12, verse: 20,
    context: "The punchline of the Parable of the Rich Fool, told right after the inheritance dispute — a successful farmer plans years of ease around his surplus without accounting for his own mortality or generosity toward God and others.",
  },
  {
    id: "warnings-4", category: "warnings", kind: "warning",
    title: "The deceitfulness of riches chokes the word, and it proves unfruitful",
    reference: "Matthew 13:22", book: "Matthew", chapter: 13, verse: 22,
    context: "Part of the Parable of the Sower's explanation, describing a heart where the gospel takes root but is eventually strangled out by anxiety and the seductive pull of wealth.",
  },
  {
    id: "warnings-5", category: "warnings", kind: "warning",
    title: "Weep and howl for the miseries that are coming upon you... your riches have rotted",
    reference: "James 5:2", book: "James", chapter: 5, verse: 2,
    context: "James rebukes wealthy landowners who had withheld wages from their harvest workers, warning that hoarded, unjustly-gained riches will testify against their owners rather than protect them.",
  },
  {
    id: "warnings-6", category: "warnings", kind: "warning",
    title: "Whoever trusts in his riches will fall, but the righteous will flourish like a green leaf",
    reference: "Proverbs 11:28", book: "Proverbs", chapter: 11, verse: 28,
    context: "Solomon contrasts the false security of wealth, which can vanish, with the stability of righteousness, which continues to bear fruit regardless of financial circumstances.",
  },

  // ── Work & Diligence ──────────────────────────────────
  {
    id: "work-1", category: "work", kind: "principle",
    title: "If anyone is not willing to work, let him not eat",
    reference: "2 Thessalonians 3:10", book: "2 Thessalonians", chapter: 3, verse: 10,
    context: "Paul corrects believers in Thessalonica who had stopped working, possibly due to confusion about Christ's imminent return, insisting that eager anticipation of the future doesn't excuse present idleness.",
  },
  {
    id: "work-2", category: "work", kind: "wisdom",
    title: "A slack hand causes poverty, but the hand of the diligent makes rich",
    reference: "Proverbs 10:4", book: "Proverbs", chapter: 10, verse: 4,
    context: "One of Solomon's many proverbs pairing diligence with increase and laziness with lack, part of the wisdom tradition's consistent link between effort and material outcome.",
  },
  {
    id: "work-3", category: "work", kind: "wisdom",
    title: "Wealth gained hastily will dwindle, but whoever gathers little by little will increase it",
    reference: "Proverbs 13:11", book: "Proverbs", chapter: 13, verse: 11,
    context: "Contrasts get-rich-quick schemes with patient, steady accumulation, suggesting the manner of gaining wealth shapes whether it actually lasts.",
  },
  {
    id: "work-4", category: "work", kind: "wisdom",
    title: "The plans of the diligent lead surely to abundance, but everyone who is hasty comes only to poverty",
    reference: "Proverbs 21:5", book: "Proverbs", chapter: 21, verse: 5,
    context: "Ties financial outcome not just to effort but to planning — hasty decisions, even energetic ones, are contrasted with careful, diligent forethought.",
  },
  {
    id: "work-5", category: "work", kind: "wisdom",
    title: "Everyone should eat and drink and take pleasure in all his toil — this is God's gift to man",
    reference: "Ecclesiastes 3:13", book: "Ecclesiastes", chapter: 3, verse: 13,
    context: "The Teacher, after cataloguing life's apparent futility, lands on a modest conclusion: enjoying the simple fruit of one's own labor is itself a gift from God, not a consolation prize.",
  },
  {
    id: "work-6", category: "work", kind: "wisdom",
    title: "In all toil there is profit, but mere talk tends only to poverty",
    reference: "Proverbs 14:23", book: "Proverbs", chapter: 14, verse: 23,
    context: "A blunt contrast between productive labor and empty conversation about plans, reinforcing that intention without action produces nothing.",
  },

  // ── God's Ownership ───────────────────────────────────
  {
    id: "ownership-1", category: "ownership", kind: "principle",
    title: "The silver is mine, and the gold is mine, declares the LORD of hosts",
    reference: "Haggai 2:8", book: "Haggai", chapter: 2, verse: 8,
    context: "Haggai encourages a discouraged post-exilic community rebuilding a temple that seemed poor compared to Solomon's, reminding them that God's resources are not limited by their present, meager circumstances.",
  },
  {
    id: "ownership-2", category: "ownership", kind: "principle",
    title: "Beware lest you say... 'My power and the might of my hand have gotten me this wealth'",
    reference: "Deuteronomy 8:17", book: "Deuteronomy", chapter: 8, verse: 17,
    context: "Moses warns Israel just before entering a land of abundance that prosperity easily breeds amnesia about its source, urging them to remember God as the one who gives the very power to produce wealth.",
  },
  {
    id: "ownership-3", category: "ownership", kind: "principle",
    title: "Yours, O LORD, is the greatness... both riches and honor come from you",
    reference: "1 Chronicles 29:11", book: "1 Chronicles", chapter: 29, verse: 11,
    context: "Part of David's public prayer after Israel's leaders give generously toward the temple's construction materials, acknowledging that everything given was already God's before it was ever offered.",
  },
  {
    id: "ownership-4", category: "ownership", kind: "wisdom",
    title: "The LORD gave, and the LORD has taken away; blessed be the name of the LORD",
    reference: "Job 1:21", book: "Job", chapter: 1, verse: 21,
    context: "Job's response upon losing his wealth, servants, and children in a single day, modeling a posture that holds material blessing loosely as something received rather than possessed by right.",
  },
  {
    id: "ownership-5", category: "ownership", kind: "principle",
    title: "Every beast of the forest is mine, the cattle on a thousand hills",
    reference: "Psalm 50:10", book: "Psalms", chapter: 50, verse: 10,
    context: "God confronts Israel's empty ritual sacrifice by pointing out He has no actual need of their offerings — He already owns every resource in creation, so worship was never meant to be transactional.",
  },

  // ── Debt & Lending ────────────────────────────────────
  {
    id: "debt-1", category: "debt", kind: "wisdom",
    title: "The borrower is the slave of the lender",
    reference: "Proverbs 22:7", book: "Proverbs", chapter: 22, verse: 7,
    context: "Solomon observes the practical loss of freedom that comes with debt, framing financial obligation as a form of servitude regardless of the terms.",
  },
  {
    id: "debt-2", category: "debt", kind: "principle",
    title: "At the end of every seven years you shall grant a release",
    reference: "Deuteronomy 15:1", book: "Deuteronomy", chapter: 15, verse: 1,
    context: "Part of Israel's covenant law, requiring creditors to cancel debts owed by fellow Israelites every seventh year, preventing permanent underclasses from forming through compounding debt.",
  },
  {
    id: "debt-3", category: "debt", kind: "wisdom",
    title: "The wicked borrows but does not pay back, but the righteous is generous and gives",
    reference: "Psalm 37:21", book: "Psalms", chapter: 37, verse: 21,
    context: "Contrasts financial dishonesty — failing to repay what's owed — with righteous generosity, tying ethical character directly to how a person handles borrowed money.",
  },
  {
    id: "debt-4", category: "debt", kind: "principle",
    title: "Owe no one anything, except to love each other",
    reference: "Romans 13:8", book: "Romans", chapter: 13, verse: 8,
    context: "Paul closes a section on civic obligations — taxes, respect, honor — with this broader financial principle, though the \"debt\" of love is presented as the one obligation that's never fully discharged.",
  },
  {
    id: "debt-5", category: "debt", kind: "principle",
    title: "If you lend money to any of my people with you who is poor, you shall not exact interest from him",
    reference: "Exodus 22:25", book: "Exodus", chapter: 22, verse: 25,
    context: "Part of Israel's case law protecting the poor from predatory lending within the covenant community, distinguishing charitable lending to the needy from ordinary commercial loans.",
  },

  // ── Poverty & the Poor ────────────────────────────────
  {
    id: "poverty-1", category: "poverty", kind: "principle",
    title: "Whoever oppresses a poor man insults his Maker, but he who is generous to the needy honors him",
    reference: "Proverbs 14:31", book: "Proverbs", chapter: 14, verse: 31,
    context: "Solomon ties how a person treats the poor directly to how they honor God, since all people — rich and poor alike — bear the same Maker's image.",
  },
  {
    id: "poverty-2", category: "poverty", kind: "principle",
    title: "There will never cease to be poor in the land. Therefore... open wide your hand to your brother",
    reference: "Deuteronomy 15:11", book: "Deuteronomy", chapter: 15, verse: 11,
    context: "Moses gives this instruction alongside the debt-release laws, acknowledging poverty won't be fully eliminated while commanding an ongoing posture of open-handed generosity rather than resignation.",
  },
  {
    id: "poverty-3", category: "poverty", kind: "principle",
    title: "Remember the poor... the very thing I was eager to do",
    reference: "Galatians 2:10", book: "Galatians", chapter: 2, verse: 10,
    context: "Paul recounts an agreement with the Jerusalem apostles affirming his mission to the Gentiles, noting that caring for the poor was the one shared practical commitment across very different ministries.",
  },
  {
    id: "poverty-4", category: "poverty", kind: "warning",
    title: "Whoever closes his ear to the cry of the poor will himself call out and not be answered",
    reference: "Proverbs 21:13", book: "Proverbs", chapter: 21, verse: 13,
    context: "Solomon warns that indifference to the poor's suffering sets a precedent that can return on the indifferent person in their own time of need.",
  },
  {
    id: "poverty-5", category: "poverty", kind: "principle",
    title: "You shall leave them for the poor and for the sojourner",
    reference: "Leviticus 19:9", book: "Leviticus", chapter: 19, verse: 9,
    context: "Part of Israel's harvest law, leaving the edges of fields and fallen grapes ungathered — a structural provision for the poor built directly into the agricultural system, seen in action later in the Book of Ruth.",
  },
  {
    id: "poverty-6", category: "poverty", kind: "warning",
    title: "If a brother or sister is poorly clothed and lacking in daily food... and you do nothing, what good is that?",
    reference: "James 2:15", book: "James", chapter: 2, verse: 15,
    context: "James confronts empty well-wishing toward the poor within the church, insisting genuine faith must translate into material help when it's within one's power to give.",
  },

  // ── Inheritance & Legacy ──────────────────────────────
  {
    id: "inheritance-1", category: "inheritance", kind: "wisdom",
    title: "A good man leaves an inheritance to his children's children",
    reference: "Proverbs 13:22", book: "Proverbs", chapter: 13, verse: 22,
    context: "Solomon frames long-term generational stewardship as a mark of wisdom and goodness, contrasted in the same verse with a sinner's wealth being stored up for the righteous instead.",
  },
  {
    id: "inheritance-2", category: "inheritance", kind: "principle",
    title: "Children ought not to lay up for their parents, but parents for their children",
    reference: "2 Corinthians 12:14", book: "2 Corinthians", chapter: 12, verse: 14,
    context: "Paul, defending his refusal to be a financial burden on the Corinthian church, states this as an ordinary, assumed pattern of family responsibility in his culture.",
  },
  {
    id: "inheritance-3", category: "inheritance", kind: "principle",
    title: "You shall cause the inheritance of their father to pass to them",
    reference: "Numbers 27:8", book: "Numbers", chapter: 27, verse: 8,
    context: "When a man dies with no sons, his daughters — Zelophehad's — petition Moses for the right to inherit his land. God rules in their favor, and the case becomes a lasting statute expanding inheritance protections.",
  },
  {
    id: "inheritance-4", category: "inheritance", kind: "wisdom",
    title: "I have bought... to be my wife, to perpetuate the name of the dead in his inheritance",
    reference: "Ruth 4:10", book: "Ruth", chapter: 4, verse: 10,
    context: "Boaz publicly and legally acts as kinsman-redeemer to keep a poor widow's family inheritance from being lost or absorbed by another, modeling costly generosity toward extended family.",
  },
  {
    id: "inheritance-5", category: "inheritance", kind: "promise",
    title: "In him we have obtained an inheritance",
    reference: "Ephesians 1:11", book: "Ephesians", chapter: 1, verse: 11,
    context: "Paul opens his letter to the Ephesians describing a spiritual inheritance secured entirely through Christ's work, reframing ultimate \"wealth\" in eternal rather than earthly terms.",
  },

  // ── Eternal Perspective ───────────────────────────────
  {
    id: "eternal-1", category: "eternal", kind: "principle",
    title: "Lay up for yourselves treasures in heaven... where your treasure is, there your heart will be also",
    reference: "Matthew 6:19", book: "Matthew", chapter: 6, verse: 19,
    context: "Part of the Sermon on the Mount, Jesus contrasts treasure vulnerable to moths, rust, and thieves with treasure that cannot be lost, tying the location of a person's wealth to the location of their affections.",
  },
  {
    id: "eternal-2", category: "eternal", kind: "principle",
    title: "As for the rich in this present age... be rich in good works, laying up treasure for the future",
    reference: "1 Timothy 6:17", book: "1 Timothy", chapter: 6, verse: 17,
    context: "Paul instructs Timothy on pastoring wealthy members of the church, neither condemning wealth nor ignoring its dangers, but redirecting it toward generosity as a means of laying hold of \"that which is truly life.\"",
  },
  {
    id: "eternal-3", category: "eternal", kind: "wisdom",
    title: "As he came from his mother's womb he shall go again, naked as he came, and shall take nothing for his toil",
    reference: "Ecclesiastes 5:15", book: "Ecclesiastes", chapter: 5, verse: 15,
    context: "The Teacher observes the universal, sobering fact that no amount of accumulated wealth can be carried out of this life, undercutting the ultimate value of hoarding for its own sake.",
  },
  {
    id: "eternal-4", category: "eternal", kind: "principle",
    title: "Sell your possessions, and give to the needy... a treasure in the heavens that does not fail",
    reference: "Luke 12:33", book: "Luke", chapter: 12, verse: 33,
    context: "Jesus instructs His disciples immediately after the parable of the rich fool, converting the same logic of risk-management the fool used for himself into generosity toward others instead.",
  },
  {
    id: "eternal-5", category: "eternal", kind: "wisdom",
    title: "Be not afraid when a man becomes rich... for when he dies he will carry nothing away",
    reference: "Psalm 49:16", book: "Psalms", chapter: 49, verse: 16,
    context: "The psalmist counsels against being intimidated or impressed by others' wealth, since death eventually levels the advantage entirely.",
  },
  {
    id: "eternal-6", category: "eternal", kind: "wisdom",
    title: "What will it profit a man if he gains the whole world and forfeits his soul?",
    reference: "Matthew 16:26", book: "Matthew", chapter: 16, verse: 26,
    context: "Jesus asks this immediately after predicting His own death and calling His disciples to take up their cross, weighing all material gain against the infinitely greater weight of a person's soul.",
  },
];

// ── Helpers ───────────────────────────────────────────────

export function getWealthEntryById(id: string): WealthEntry | undefined {
  return WEALTH_ENTRIES.find((e) => e.id === id);
}

export function wealthEntriesInCategory(category: WealthCategoryId): WealthEntry[] {
  return WEALTH_ENTRIES.filter((e) => e.category === category);
}

/** Deterministic daily pick — stable for the whole calendar day, changes automatically the next. */
export function wealthEntryOfTheDay(date: Date = new Date()): WealthEntry {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const diff = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - start;
  const dayOfYear = Math.floor(diff / 86400000);
  return WEALTH_ENTRIES[dayOfYear % WEALTH_ENTRIES.length];
}
