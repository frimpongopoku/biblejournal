import type { BookName } from "@/lib/bible-books";

// ── Types ─────────────────────────────────────────────────

export interface TimelineRef {
  label: string;      // display text, e.g. "Genesis 15:6" or "Genesis 35:23–26"
  book: BookName;
  chapter: number;
  verse: number;       // jump target for openBibleAt — start verse when label is a range
}

export interface TimelineEvent {
  id: string;
  title: string;
  dateLabel: string;
  summary: string;
  figures: string[];
  places: string[];
  refs: TimelineRef[];
  corroboration?: string; // only ever a real, named, verifiable extra-biblical reference
}

export interface TimelineSource {
  title: string;
  note?: string;
}

export interface TimelineEra {
  id: string;
  order: number;
  name: string;
  icon: string;        // lucide-react icon name
  color: string;        // accent hex
  dateRange: string;
  dateCaveat?: string;
  summary: string;
  events: TimelineEvent[];
  sources: TimelineSource[];
}

// ── Intro copy for the overview page ─────────────────────

export const TIMELINE_INTRO =
  "A chronological walk from Creation through the early church — every era dated as honestly as the evidence allows, every event linked to the passage itself, every claim traceable to a named source. Where serious scholars disagree on a date (the Exodus, the crucifixion year), both views are shown rather than one being presented as settled fact. Nothing here is invented.";

// ── Eras ──────────────────────────────────────────────────

export const TIMELINE_ERAS: TimelineEra[] = [
  {
    id: "beginnings",
    order: 1,
    name: "Beginnings",
    icon: "Sunrise",
    color: "#D4AF6A",
    dateRange: "Undated in the text; traditional reckonings place it c. 4004 BC",
    dateCaveat:
      "Genesis does not give a scientific date for creation. Archbishop James Ussher's widely reprinted 1650 chronology arrived at 4004 BC by summing the Genesis 5 and 11 genealogies. Many evangelical scholars since have read those genealogies as having gaps or a stylized structure (the Hebrew for \"begot\" can mean \"became the ancestor of\") rather than a tight birth-year ledger — so no single date commands consensus, and this app presents Ussher's figure as one historical reckoning, not \"the\" date.",
    summary:
      "In the beginning God creates the heavens, the earth, and the first man and woman, Adam and Eve, placing them in the garden of Eden. Their disobedience — the Fall — introduces sin and death into the world, and the first family's story is marked by tragedy when Cain kills his brother Abel.",
    events: [
      {
        id: "beginnings-1",
        title: "Creation",
        dateLabel: "Six days (undated)",
        summary:
          "God creates the heavens and the earth in six days, culminating in the creation of humanity — male and female — in his own image, and rests on the seventh day.",
        figures: [],
        places: ["Eden"],
        refs: [
          { label: "Genesis 1:1", book: "Genesis", chapter: 1, verse: 1 },
          { label: "Genesis 1:27", book: "Genesis", chapter: 1, verse: 27 },
        ],
      },
      {
        id: "beginnings-2",
        title: "Adam and Eve in the Garden",
        dateLabel: "Undated",
        summary:
          "God forms the man from the dust of the ground and breathes life into him, places him in the garden of Eden to tend it, and forms the woman from his side as his companion.",
        figures: ["Adam", "Eve"],
        places: ["Garden of Eden"],
        refs: [
          { label: "Genesis 2:7", book: "Genesis", chapter: 2, verse: 7 },
          { label: "Genesis 2:22", book: "Genesis", chapter: 2, verse: 22 },
        ],
      },
      {
        id: "beginnings-3",
        title: "The Fall",
        dateLabel: "Undated",
        summary:
          "Deceived by the serpent, Eve and then Adam eat from the one tree God forbade them. Sin and death enter the human story, and they are exiled from Eden.",
        figures: ["Adam", "Eve", "the serpent"],
        places: ["Garden of Eden"],
        refs: [
          { label: "Genesis 3:6", book: "Genesis", chapter: 3, verse: 6 },
          { label: "Genesis 3:23–24", book: "Genesis", chapter: 3, verse: 23 },
        ],
      },
      {
        id: "beginnings-4",
        title: "Cain and Abel",
        dateLabel: "Undated",
        summary:
          "Adam and Eve's firstborn son Cain murders his brother Abel out of jealousy after God favors Abel's offering — the Bible's first murder, and first act of violence between siblings.",
        figures: ["Cain", "Abel"],
        places: [],
        refs: [{ label: "Genesis 4:8", book: "Genesis", chapter: 4, verse: 8 }],
      },
      {
        id: "beginnings-5",
        title: "The Line of Seth to Noah",
        dateLabel: "Undated",
        summary:
          "Genesis 5 traces ten generations from Adam through his son Seth to Noah, including Enoch, who \"walked with God\" and did not experience death, and Methuselah, the longest-lived person recorded in scripture.",
        figures: ["Seth", "Enoch", "Methuselah", "Lamech"],
        places: [],
        refs: [
          { label: "Genesis 5:1", book: "Genesis", chapter: 5, verse: 1 },
          { label: "Genesis 5:24", book: "Genesis", chapter: 5, verse: 24 },
        ],
      },
    ],
    sources: [
      { title: "ESV Study Bible (Crossway)", note: "Genesis introduction and chronology charts" },
      { title: "Kenneth A. Kitchen, On the Reliability of the Old Testament (Eerdmans, 2003)" },
      { title: "James Ussher, Annals of the World (1650)", note: "source of the traditional 4004 BC date, presented here as historical, not as consensus" },
    ],
  },
  {
    id: "flood-new-beginnings",
    order: 2,
    name: "Flood & New Beginnings",
    icon: "Waves",
    color: "#4F7C82",
    dateRange: "Traditional reckoning c. 2348 BC — undated and debated",
    dateCaveat:
      "Like creation, the flood's date rests entirely on genealogical reckonings such as Ussher's; it is not independently datable from the biblical text itself.",
    summary:
      "Humanity's wickedness leads God to send a flood, preserving Noah, his family, and the animals in the ark. Afterward God establishes a covenant with Noah, sealed by the rainbow. Generations later, humanity's pride at the Tower of Babel leads God to scatter the nations and confuse their languages.",
    events: [
      {
        id: "flood-1",
        title: "Noah and the Ark",
        dateLabel: "Undated",
        summary:
          "God instructs Noah to build an ark to preserve his family and two of every kind of animal from a coming flood that will cover the earth.",
        figures: ["Noah"],
        places: [],
        refs: [
          { label: "Genesis 6:14", book: "Genesis", chapter: 6, verse: 14 },
          { label: "Genesis 7:17", book: "Genesis", chapter: 7, verse: 17 },
        ],
      },
      {
        id: "flood-2",
        title: "The Flood and the Covenant",
        dateLabel: "Undated",
        summary:
          "The floodwaters recede and the ark comes to rest on the mountains of Ararat. God establishes a covenant with Noah never again to destroy the earth by flood, with the rainbow as its sign.",
        figures: ["Noah"],
        places: ["Mountains of Ararat"],
        refs: [
          { label: "Genesis 8:4", book: "Genesis", chapter: 8, verse: 4 },
          { label: "Genesis 9:13", book: "Genesis", chapter: 9, verse: 13 },
        ],
      },
      {
        id: "flood-3",
        title: "The Table of Nations",
        dateLabel: "Undated",
        summary:
          "Genesis 10 traces the descendants of Noah's three sons spreading out to become the nations and territories of the ancient world.",
        figures: ["Shem", "Ham", "Japheth"],
        places: [],
        refs: [{ label: "Genesis 10:32", book: "Genesis", chapter: 10, verse: 32 }],
      },
      {
        id: "flood-4",
        title: "The Tower of Babel",
        dateLabel: "Undated",
        summary:
          "United by one language, humanity builds a city and tower to make a name for itself. God confuses their language and scatters them across the earth — the text's account of the origin of the world's nations and languages.",
        figures: [],
        places: ["Shinar (Babel)"],
        refs: [{ label: "Genesis 11:9", book: "Genesis", chapter: 11, verse: 9 }],
      },
    ],
    sources: [
      { title: "ESV Study Bible (Crossway)" },
      { title: "Kenneth A. Kitchen, On the Reliability of the Old Testament (Eerdmans, 2003)" },
      { title: "James Ussher, Annals of the World (1650)", note: "traditional date only" },
    ],
  },
  {
    id: "patriarchs",
    order: 3,
    name: "The Patriarchs",
    icon: "Tent",
    color: "#B08D3E",
    dateRange: "c. 2000–1800 BC (common evangelical estimate); Ussher's traditional dates run c. 2091–1876 BC",
    dateCaveat:
      "The patriarchal narratives are notoriously difficult to anchor to independent archaeological dates — most scholars work from internal genealogical math and general cultural fit with the early-to-middle Bronze Age rather than a fixed external anchor point.",
    summary:
      "God calls Abraham out of Ur to a land he will show him, establishing a covenant promising land, descendants, and blessing to all nations through his line. The promise passes to Isaac, then to Jacob (renamed Israel), whose twelve sons become the twelve tribes of Israel — including Joseph, sold into slavery in Egypt, who rises to become second-in-command and preserves his family during famine.",
    events: [
      {
        id: "patriarchs-1",
        title: "The Call of Abraham",
        dateLabel: "c. 2091 BC (traditional)",
        summary:
          "God calls Abram to leave his homeland for a land he will show him, promising to make him into a great nation and to bless all peoples of the earth through him.",
        figures: ["Abram (Abraham)"],
        places: ["Ur of the Chaldeans", "Haran", "Canaan"],
        refs: [
          { label: "Genesis 12:1", book: "Genesis", chapter: 12, verse: 1 },
          { label: "Genesis 12:7", book: "Genesis", chapter: 12, verse: 7 },
        ],
      },
      {
        id: "patriarchs-2",
        title: "The Covenant and the Promised Son",
        dateLabel: "c. 2066 BC (traditional, Isaac's birth)",
        summary:
          "God confirms his covenant with Abraham, crediting his faith as righteousness. In old age, Abraham and Sarah's long-promised son Isaac is finally born.",
        figures: ["Abraham", "Sarah", "Isaac"],
        places: ["Canaan"],
        refs: [
          { label: "Genesis 15:6", book: "Genesis", chapter: 15, verse: 6 },
          { label: "Genesis 21:3", book: "Genesis", chapter: 21, verse: 3 },
        ],
      },
      {
        id: "patriarchs-3",
        title: "Isaac and Jacob",
        dateLabel: "Undated",
        summary:
          "Isaac's younger son Jacob obtains his brother Esau's birthright and blessing, then wrestles with God at Peniel and is renamed Israel — \"he struggles with God.\"",
        figures: ["Isaac", "Rebekah", "Jacob", "Esau"],
        places: ["Peniel"],
        refs: [
          { label: "Genesis 25:26", book: "Genesis", chapter: 25, verse: 26 },
          { label: "Genesis 32:28", book: "Genesis", chapter: 32, verse: 28 },
        ],
      },
      {
        id: "patriarchs-4",
        title: "The Twelve Sons of Jacob",
        dateLabel: "Undated",
        summary:
          "Jacob's twelve sons — born to his wives Leah and Rachel and their servants — become the ancestors of the twelve tribes of Israel.",
        figures: ["Reuben", "Simeon", "Levi", "Judah", "Joseph", "Benjamin", "and six others"],
        places: [],
        refs: [{ label: "Genesis 35:23–26", book: "Genesis", chapter: 35, verse: 23 }],
      },
      {
        id: "patriarchs-5",
        title: "Joseph Sold into Egypt",
        dateLabel: "c. 1898 BC (traditional)",
        summary:
          "Jealous of their father's favoritism, Joseph's brothers sell him into slavery. He is taken to Egypt as a household servant.",
        figures: ["Joseph"],
        places: ["Canaan", "Egypt"],
        refs: [{ label: "Genesis 37:28", book: "Genesis", chapter: 37, verse: 28 }],
      },
      {
        id: "patriarchs-6",
        title: "Joseph Rises to Power",
        dateLabel: "c. 1885 BC (traditional)",
        summary:
          "After interpreting Pharaoh's dreams, Joseph is elevated to oversee Egypt's grain reserves through famine. His brothers eventually come to Egypt for grain, and he reveals himself and forgives them, bringing the family to settle in Goshen.",
        figures: ["Joseph", "Pharaoh"],
        places: ["Egypt", "Goshen"],
        refs: [
          { label: "Genesis 41:41", book: "Genesis", chapter: 41, verse: 41 },
          { label: "Genesis 45:5", book: "Genesis", chapter: 45, verse: 5 },
        ],
      },
    ],
    sources: [
      { title: "ESV Study Bible (Crossway)", note: "chronology charts" },
      { title: "Eugene H. Merrill, Kingdom of Priests: A History of Old Testament Israel (Baker Academic)" },
      { title: "Kenneth A. Kitchen, On the Reliability of the Old Testament (Eerdmans, 2003)" },
    ],
  },
  {
    id: "egypt-exodus",
    order: 4,
    name: "Egypt & the Exodus",
    icon: "Pyramid",
    color: "#A65D57",
    dateRange: "Two scholarly positions: an \"early date\" c. 1446 BC, or a \"late date\" c. 1290–1260 BC",
    dateCaveat:
      "The early date follows 1 Kings 6:1's statement of 480 years before Solomon's fourth year (c. 966 BC). The late date follows the store city \"Rameses\" named in Exodus 1:11 and archaeological destruction layers in Canaan, associating the Exodus with the reign of Rameses II. Both positions are held by serious evangelical scholars; this app presents both rather than choosing one as fact.",
    summary:
      "Israel multiplies in Egypt over centuries until a new Pharaoh enslaves them. God raises up Moses to confront Pharaoh, and after ten plagues Israel is freed and crosses the Red Sea. At Mount Sinai, God gives Moses the Law, including the Ten Commandments, and formally establishes Israel as his covenant people.",
    events: [
      {
        id: "egypt-1",
        title: "Israel Enslaved in Egypt",
        dateLabel: "Undated (generations after Joseph)",
        summary:
          "A new Pharaoh \"who did not know Joseph\" grows alarmed at Israel's numbers and forces the Israelites into hard labor, building the store cities of Pithom and Rameses.",
        figures: [],
        places: ["Egypt", "Goshen"],
        refs: [
          { label: "Exodus 1:11", book: "Exodus", chapter: 1, verse: 11 },
          { label: "Exodus 1:14", book: "Exodus", chapter: 1, verse: 14 },
        ],
      },
      {
        id: "egypt-2",
        title: "The Birth and Calling of Moses",
        dateLabel: "c. 1526 / c. 1350 BC (early / late date estimates)",
        summary:
          "Moses is drawn from the Nile and raised in Pharaoh's household, later fleeing to Midian after killing an Egyptian. God calls him from a burning bush to lead Israel out of Egypt.",
        figures: ["Moses", "Pharaoh's daughter"],
        places: ["Egypt", "Midian"],
        refs: [
          { label: "Exodus 2:10", book: "Exodus", chapter: 2, verse: 10 },
          { label: "Exodus 3:10", book: "Exodus", chapter: 3, verse: 10 },
        ],
      },
      {
        id: "egypt-3",
        title: "The Ten Plagues and the Exodus",
        dateLabel: "c. 1446 BC (early date) / c. 1260 BC (late date)",
        summary:
          "After Pharaoh repeatedly refuses to release Israel, God sends ten plagues on Egypt, culminating in the death of the firstborn and the first Passover. Pharaoh finally lets Israel go.",
        figures: ["Moses", "Aaron", "Pharaoh"],
        places: ["Egypt"],
        refs: [
          { label: "Exodus 7:20", book: "Exodus", chapter: 7, verse: 20 },
          { label: "Exodus 12:31", book: "Exodus", chapter: 12, verse: 31 },
        ],
        corroboration:
          "No Egyptian royal inscription names the Exodus directly — expected, since Egyptian monumental records did not memorialize defeats. The debated Ipuwer Papyrus, describing social collapse and a Nile \"turned to blood,\" is sometimes cited as a partial parallel, though its date and relevance are disputed among Egyptologists.",
      },
      {
        id: "egypt-4",
        title: "Crossing the Red Sea",
        dateLabel: "c. 1446 BC / c. 1260 BC",
        summary:
          "With Pharaoh's army in pursuit, God parts the sea for Israel to cross on dry ground, then closes it over the pursuing Egyptian army.",
        figures: ["Moses"],
        places: ["Red Sea"],
        refs: [{ label: "Exodus 14:22", book: "Exodus", chapter: 14, verse: 22 }],
      },
      {
        id: "egypt-5",
        title: "The Law Given at Sinai",
        dateLabel: "c. 1446 BC / c. 1260 BC, three months after the Exodus",
        summary:
          "At Mount Sinai, God gives Moses the Ten Commandments and the broader Law, establishing the covenant terms of Israel's relationship with him as his chosen people.",
        figures: ["Moses"],
        places: ["Mount Sinai"],
        refs: [
          { label: "Exodus 19:5", book: "Exodus", chapter: 19, verse: 5 },
          { label: "Exodus 20:3", book: "Exodus", chapter: 20, verse: 3 },
        ],
      },
    ],
    sources: [
      { title: "Kenneth A. Kitchen, On the Reliability of the Old Testament (Eerdmans, 2003)" },
      { title: "James K. Hoffmeier, Israel in Egypt (Oxford University Press)" },
      { title: "ESV Study Bible (Crossway)" },
      { title: "Associates for Biblical Research", note: "journal articles on the early/late Exodus dating debate" },
    ],
  },
  {
    id: "wilderness-conquest",
    order: 5,
    name: "Wilderness & Conquest",
    icon: "Compass",
    color: "#8A7256",
    dateRange: "c. 1446–1406 BC (early date) or c. 1260–1220 BC (late date) — 40 years of wandering either way",
    summary:
      "Israel spends forty years wandering the wilderness because of unbelief at Kadesh Barnea, receiving further law and organization along the way. Moses dies within sight of the Promised Land, and Joshua leads Israel across the Jordan to conquer Canaan, beginning with the fall of Jericho.",
    events: [
      {
        id: "wilderness-1",
        title: "The Twelve Spies and Forty Years' Wandering",
        dateLabel: "Year 2 after the Exodus",
        summary:
          "Twelve spies scout Canaan; ten report fearfully and the people refuse to enter, so God sentences that generation to forty years of wandering until it passes away — sparing only Joshua and Caleb.",
        figures: ["Moses", "Joshua", "Caleb"],
        places: ["Kadesh Barnea"],
        refs: [
          { label: "Numbers 13:2", book: "Numbers", chapter: 13, verse: 2 },
          { label: "Numbers 14:34", book: "Numbers", chapter: 14, verse: 34 },
        ],
      },
      {
        id: "wilderness-2",
        title: "The Death of Moses",
        dateLabel: "End of the 40 years",
        summary:
          "Moses views the Promised Land from Mount Nebo but is not permitted to enter it himself. He dies there, and Joshua succeeds him as Israel's leader.",
        figures: ["Moses", "Joshua"],
        places: ["Mount Nebo"],
        refs: [
          { label: "Deuteronomy 34:1", book: "Deuteronomy", chapter: 34, verse: 1 },
          { label: "Deuteronomy 34:5", book: "Deuteronomy", chapter: 34, verse: 5 },
        ],
      },
      {
        id: "wilderness-3",
        title: "Crossing the Jordan and the Fall of Jericho",
        dateLabel: "c. 1406 BC (early date) / c. 1220 BC (late date)",
        summary:
          "Joshua leads Israel across the Jordan on dry ground. The conquest begins with Jericho's walls falling after Israel marches around the city as God commanded.",
        figures: ["Joshua", "Rahab"],
        places: ["Jordan River", "Jericho"],
        refs: [
          { label: "Joshua 3:17", book: "Joshua", chapter: 3, verse: 17 },
          { label: "Joshua 6:20", book: "Joshua", chapter: 6, verse: 20 },
        ],
      },
      {
        id: "wilderness-4",
        title: "The Conquest and Division of the Land",
        dateLabel: "c. 1406–1400 BC / c. 1220–1210 BC",
        summary:
          "Joshua leads campaigns through central, southern, and northern Canaan, and the land is subsequently divided by lot among the twelve tribes.",
        figures: ["Joshua"],
        places: ["Canaan"],
        refs: [
          { label: "Joshua 11:23", book: "Joshua", chapter: 11, verse: 23 },
          { label: "Joshua 14:1", book: "Joshua", chapter: 14, verse: 1 },
        ],
        corroboration:
          "The Merneptah Stele (c. 1208 BC), an Egyptian victory inscription now in the Cairo Museum, contains the earliest known extra-biblical reference to \"Israel\" as a people already present in Canaan — consistent with a conquest and settlement having occurred by this date.",
      },
    ],
    sources: [
      { title: "ESV Study Bible (Crossway)" },
      { title: "Kenneth A. Kitchen, On the Reliability of the Old Testament (Eerdmans, 2003)" },
      { title: "Eugene H. Merrill, Kingdom of Priests: A History of Old Testament Israel (Baker Academic)" },
    ],
  },
  {
    id: "judges",
    order: 6,
    name: "The Judges",
    icon: "Scale",
    color: "#6E9E5C",
    dateRange: "c. 1375–1050 BC (early date) or c. 1200–1050 BC (late date)",
    summary:
      "After Joshua's death, Israel has no central king and repeatedly falls into a cycle: apostasy, oppression by surrounding nations, a cry for help, and deliverance through a judge God raises up — including Deborah, Gideon, and Samson. The book of Ruth, set in this same era, follows a Moabite widow who becomes an ancestor of King David.",
    events: [
      {
        id: "judges-1",
        title: "The Cycle of the Judges Begins",
        dateLabel: "Undated",
        summary:
          "Judges 2 lays out the recurring pattern that structures the whole book: Israel forsakes God, is oppressed by an enemy, cries out, and God raises up a judge to deliver them — until that judge dies and the cycle repeats.",
        figures: [],
        places: [],
        refs: [
          { label: "Judges 2:16", book: "Judges", chapter: 2, verse: 16 },
          { label: "Judges 2:19", book: "Judges", chapter: 2, verse: 19 },
        ],
      },
      {
        id: "judges-2",
        title: "Deborah and Barak",
        dateLabel: "Undated",
        summary:
          "The prophetess Deborah, Israel's only female judge, summons Barak to lead an army against the Canaanite commander Sisera, whose forces are routed.",
        figures: ["Deborah", "Barak", "Jael"],
        places: [],
        refs: [
          { label: "Judges 4:4", book: "Judges", chapter: 4, verse: 4 },
          { label: "Judges 4:14", book: "Judges", chapter: 4, verse: 14 },
        ],
      },
      {
        id: "judges-3",
        title: "Gideon",
        dateLabel: "Undated",
        summary:
          "God calls the hesitant Gideon to deliver Israel from Midianite raiders, reducing his army to just 300 men so that the victory could not be credited to Israel's own strength.",
        figures: ["Gideon"],
        places: ["Midian"],
        refs: [
          { label: "Judges 6:12", book: "Judges", chapter: 6, verse: 12 },
          { label: "Judges 7:7", book: "Judges", chapter: 7, verse: 7 },
        ],
      },
      {
        id: "judges-4",
        title: "Samson",
        dateLabel: "Undated",
        summary:
          "Samson, a Nazirite given supernatural strength, battles the Philistines throughout his life. Betrayed by Delilah and captured, he brings down a Philistine temple in his final act.",
        figures: ["Samson", "Delilah"],
        places: ["Philistia"],
        refs: [
          { label: "Judges 13:5", book: "Judges", chapter: 13, verse: 5 },
          { label: "Judges 16:30", book: "Judges", chapter: 16, verse: 30 },
        ],
      },
      {
        id: "judges-5",
        title: "Ruth",
        dateLabel: "Undated, \"in the days when the judges ruled\"",
        summary:
          "The book of Ruth follows a Moabite widow's loyalty to her mother-in-law Naomi and her marriage to Boaz. Their great-grandson is King David.",
        figures: ["Ruth", "Naomi", "Boaz"],
        places: ["Moab", "Bethlehem"],
        refs: [
          { label: "Ruth 1:16", book: "Ruth", chapter: 1, verse: 16 },
          { label: "Ruth 4:17", book: "Ruth", chapter: 4, verse: 17 },
        ],
      },
    ],
    sources: [
      { title: "ESV Study Bible (Crossway)" },
      { title: "John Bright, A History of Israel (Westminster John Knox Press)" },
    ],
  },
  {
    id: "united-kingdom",
    order: 7,
    name: "United Kingdom",
    icon: "Crown",
    color: "#C9A227",
    dateRange: "c. 1050–930 BC",
    summary:
      "Israel demands a king, and the prophet Samuel anoints Saul, then David after Saul's disobedience. David establishes Jerusalem as Israel's capital and receives God's covenant promise of an everlasting dynasty. His son Solomon builds the Temple and rules over Israel's golden age, but his later idolatry sets up the kingdom's division after his death.",
    events: [
      {
        id: "united-1",
        title: "Samuel and the Demand for a King",
        dateLabel: "c. 1050 BC",
        summary:
          "Israel asks the prophet Samuel for a king \"such as all the other nations have.\" God grants the request, and Samuel anoints Saul as Israel's first king.",
        figures: ["Samuel", "Saul"],
        places: [],
        refs: [
          { label: "1 Samuel 8:7", book: "1 Samuel", chapter: 8, verse: 7 },
          { label: "1 Samuel 10:1", book: "1 Samuel", chapter: 10, verse: 1 },
        ],
      },
      {
        id: "united-2",
        title: "David Anointed and Israel's Beloved King",
        dateLabel: "c. 1025 BC (anointing) / c. 1010 BC (reign begins)",
        summary:
          "After Saul's disobedience, Samuel secretly anoints the young shepherd David. David's defeat of the Philistine giant Goliath launches his rise to national prominence and eventually the throne.",
        figures: ["David", "Samuel", "Goliath"],
        places: ["Bethlehem", "Valley of Elah"],
        refs: [
          { label: "1 Samuel 16:13", book: "1 Samuel", chapter: 16, verse: 13 },
          { label: "1 Samuel 17:50", book: "1 Samuel", chapter: 17, verse: 50 },
        ],
      },
      {
        id: "united-3",
        title: "The Davidic Covenant",
        dateLabel: "c. 1003–995 BC",
        summary:
          "David captures Jerusalem and makes it his capital. God promises through the prophet Nathan that David's throne will be established forever — a covenant later fulfilled in Christ.",
        figures: ["David", "Nathan"],
        places: ["Jerusalem"],
        refs: [
          { label: "2 Samuel 5:7", book: "2 Samuel", chapter: 5, verse: 7 },
          { label: "2 Samuel 7:16", book: "2 Samuel", chapter: 7, verse: 16 },
        ],
        corroboration:
          "In 1993–94 a 9th-century BC inscription discovered at Tel Dan referenced the \"House of David\" (bytdwd), the earliest known extra-biblical reference to David's dynasty.",
      },
      {
        id: "united-4",
        title: "Solomon and the Temple",
        dateLabel: "c. 970–930 BC (reign); Temple completed c. 966 BC",
        summary:
          "David's son Solomon, granted extraordinary wisdom, builds the Jerusalem Temple as the permanent house of the Lord, completing it in the eleventh year of his reign.",
        figures: ["Solomon"],
        places: ["Jerusalem"],
        refs: [
          { label: "1 Kings 3:12", book: "1 Kings", chapter: 3, verse: 12 },
          { label: "1 Kings 6:38", book: "1 Kings", chapter: 6, verse: 38 },
        ],
      },
      {
        id: "united-5",
        title: "The Kingdom Divides",
        dateLabel: "c. 930 BC",
        summary:
          "After Solomon's death, his son Rehoboam's harsh policies split the kingdom: ten northern tribes follow Jeroboam as the kingdom of Israel, while Judah and Benjamin remain loyal to the Davidic line in the south.",
        figures: ["Rehoboam", "Jeroboam"],
        places: ["Shechem"],
        refs: [
          { label: "1 Kings 12:16", book: "1 Kings", chapter: 12, verse: 16 },
          { label: "1 Kings 12:20", book: "1 Kings", chapter: 12, verse: 20 },
        ],
      },
    ],
    sources: [
      { title: "ESV Study Bible (Crossway)" },
      { title: "John Bright, A History of Israel (Westminster John Knox Press)" },
      { title: "Tel Dan Stele", note: "Israel Museum / published excavation reports, Biran & Naveh 1993–95" },
    ],
  },
  {
    id: "divided-kingdom",
    order: 8,
    name: "Divided Kingdom",
    icon: "Landmark",
    color: "#9B6BA8",
    dateRange: "c. 930–586 BC",
    summary:
      "Israel (north) and Judah (south) follow separate, often tragic, royal lines. Prophets like Elijah, Elisha, Isaiah, and Jeremiah call the nations back to covenant faithfulness. Israel falls to Assyria in 722 BC; Judah endures longer under occasional reforming kings but ultimately falls to Babylon in 586 BC, with the Jerusalem Temple destroyed.",
    events: [
      {
        id: "divided-1",
        title: "Elijah and Elisha Confront Israel's Idolatry",
        dateLabel: "c. 870–840 BC",
        summary:
          "The prophet Elijah confronts King Ahab and the prophets of Baal at Mount Carmel. His successor Elisha continues a prophetic ministry marked by miracles in the northern kingdom.",
        figures: ["Elijah", "Elisha", "Ahab", "Jezebel"],
        places: ["Mount Carmel"],
        refs: [
          { label: "1 Kings 18:39", book: "1 Kings", chapter: 18, verse: 39 },
          { label: "2 Kings 2:11", book: "2 Kings", chapter: 2, verse: 11 },
        ],
      },
      {
        id: "divided-2",
        title: "The Fall of Israel to Assyria",
        dateLabel: "722 BC",
        summary:
          "After generations of idolatry, the northern kingdom of Israel falls to the Assyrian empire. Samaria is captured and much of the population deported, ending the northern kingdom.",
        figures: ["Hoshea", "Shalmaneser V", "Sargon II"],
        places: ["Samaria"],
        refs: [
          { label: "2 Kings 17:6", book: "2 Kings", chapter: 17, verse: 6 },
          { label: "2 Kings 17:23", book: "2 Kings", chapter: 17, verse: 23 },
        ],
      },
      {
        id: "divided-3",
        title: "Isaiah, Hezekiah, and Assyria's Siege of Jerusalem",
        dateLabel: "701 BC",
        summary:
          "The prophet Isaiah ministers through King Hezekiah's reforms. When the Assyrian king Sennacherib besieges Jerusalem, the city is delivered without falling.",
        figures: ["Isaiah", "Hezekiah", "Sennacherib"],
        places: ["Jerusalem"],
        refs: [
          { label: "2 Kings 19:35", book: "2 Kings", chapter: 19, verse: 35 },
          { label: "Isaiah 37:36", book: "Isaiah", chapter: 37, verse: 36 },
        ],
        corroboration:
          "Sennacherib's own annals (the Taylor Prism / Sennacherib Prism, British Museum) describe besieging Jerusalem and boast of shutting Hezekiah up \"like a bird in a cage\" — but notably stop short of claiming the city was captured, consistent with 2 Kings 19's account of its deliverance.",
      },
      {
        id: "divided-4",
        title: "Josiah's Reform",
        dateLabel: "c. 622 BC",
        summary:
          "The Book of the Law is rediscovered in the Temple during repairs. Young King Josiah leads Judah's last great religious reform before its final decline.",
        figures: ["Josiah"],
        places: ["Jerusalem"],
        refs: [
          { label: "2 Kings 22:8", book: "2 Kings", chapter: 22, verse: 8 },
          { label: "2 Kings 23:25", book: "2 Kings", chapter: 23, verse: 25 },
        ],
      },
      {
        id: "divided-5",
        title: "Jeremiah Warns of Coming Judgment",
        dateLabel: "c. 627–586 BC",
        summary:
          "The prophet Jeremiah warns Judah's final kings of coming Babylonian judgment for persistent unfaithfulness, and predicts a seventy-year exile.",
        figures: ["Jeremiah"],
        places: ["Jerusalem"],
        refs: [
          { label: "Jeremiah 1:5", book: "Jeremiah", chapter: 1, verse: 5 },
          { label: "Jeremiah 25:11", book: "Jeremiah", chapter: 25, verse: 11 },
        ],
      },
      {
        id: "divided-6",
        title: "The Fall of Jerusalem to Babylon",
        dateLabel: "586 BC",
        summary:
          "After a long siege, Nebuchadnezzar's Babylonian army breaches Jerusalem, burns the Temple Solomon built, and deports much of Judah's population — ending the kingdom of Judah.",
        figures: ["Zedekiah", "Nebuchadnezzar II"],
        places: ["Jerusalem"],
        refs: [
          { label: "2 Kings 25:9", book: "2 Kings", chapter: 25, verse: 9 },
          { label: "2 Chronicles 36:19", book: "2 Chronicles", chapter: 36, verse: 19 },
        ],
      },
    ],
    sources: [
      { title: "John Bright, A History of Israel (Westminster John Knox Press)" },
      { title: "ESV Study Bible / NIV Study Bible", note: "timeline charts" },
      { title: "Sennacherib Prism (Taylor Prism)", note: "British Museum collection" },
    ],
  },
  {
    id: "exile",
    order: 9,
    name: "Exile",
    icon: "Lock",
    color: "#5B6E9E",
    dateRange: "586–538 BC",
    summary:
      "Judah's leading citizens are deported to Babylon, where the prophets Daniel and Ezekiel minister among the exiles, insisting that God remains sovereign even in a foreign land. The exile ends when the Persian king Cyrus conquers Babylon and permits the Jewish exiles to return home.",
    events: [
      {
        id: "exile-1",
        title: "Daniel in Babylon",
        dateLabel: "c. 605–530s BC",
        summary:
          "Taken to Babylon as a young man, Daniel rises to high office while remaining faithful to God — surviving the fiery furnace's threat to his friends and his own night in the lions' den.",
        figures: ["Daniel", "Nebuchadnezzar II"],
        places: ["Babylon"],
        refs: [
          { label: "Daniel 1:6", book: "Daniel", chapter: 1, verse: 6 },
          { label: "Daniel 6:22", book: "Daniel", chapter: 6, verse: 22 },
        ],
      },
      {
        id: "exile-2",
        title: "Ezekiel's Visions Among the Exiles",
        dateLabel: "c. 593–571 BC",
        summary:
          "The priest-prophet Ezekiel ministers to the exiled community, delivering visions of judgment and, famously, of dry bones brought back to life — a promise of Israel's future restoration.",
        figures: ["Ezekiel"],
        places: ["Babylon, by the Kebar River"],
        refs: [
          { label: "Ezekiel 1:1", book: "Ezekiel", chapter: 1, verse: 1 },
          { label: "Ezekiel 37:14", book: "Ezekiel", chapter: 37, verse: 14 },
        ],
      },
      {
        id: "exile-3",
        title: "The Writing on the Wall",
        dateLabel: "539 BC",
        summary:
          "At a feast, a mysterious hand writes on the palace wall. Daniel interprets it as judgment on Babylon, which falls to the Medo-Persian empire that same night.",
        figures: ["Belshazzar", "Daniel"],
        places: ["Babylon"],
        refs: [
          { label: "Daniel 5:5", book: "Daniel", chapter: 5, verse: 5 },
          { label: "Daniel 5:30", book: "Daniel", chapter: 5, verse: 30 },
        ],
      },
      {
        id: "exile-4",
        title: "Cyrus Conquers Babylon",
        dateLabel: "539 BC",
        summary:
          "The Persian king Cyrus the Great conquers Babylon, setting the stage for the exiles' release the following year.",
        figures: ["Cyrus the Great"],
        places: ["Babylon"],
        refs: [
          { label: "Daniel 5:31", book: "Daniel", chapter: 5, verse: 31 },
          { label: "2 Chronicles 36:22", book: "2 Chronicles", chapter: 36, verse: 22 },
        ],
        corroboration:
          "The Cyrus Cylinder (539 BC, British Museum) records Cyrus's conquest of Babylon and his general policy of letting displaced peoples and their gods return home — corroborating the character of the decree described in Ezra 1.",
      },
    ],
    sources: [
      { title: "ESV Study Bible (Crossway)" },
      { title: "The Cyrus Cylinder", note: "British Museum collection" },
      { title: "John Bright, A History of Israel (Westminster John Knox Press)" },
    ],
  },
  {
    id: "return-restoration",
    order: 10,
    name: "Return & Restoration",
    icon: "KeyRound",
    color: "#6B8CAE",
    dateRange: "538–c. 430 BC",
    summary:
      "Cyrus's decree allows the Jewish exiles to return to Jerusalem in waves. Zerubbabel oversees the rebuilding of the Temple; decades later Ezra restores the Law and Nehemiah rebuilds Jerusalem's walls despite fierce opposition. Esther, set in the Persian court during this same broad period, preserves the Jewish people from annihilation. Malachi's prophecy closes the Old Testament era.",
    events: [
      {
        id: "return-1",
        title: "Cyrus's Decree and the First Return",
        dateLabel: "538 BC",
        summary:
          "Cyrus decrees that the Jewish exiles may return to Jerusalem and rebuild the Temple. Zerubbabel leads the first wave home.",
        figures: ["Cyrus the Great", "Zerubbabel"],
        places: ["Jerusalem"],
        refs: [
          { label: "Ezra 1:3", book: "Ezra", chapter: 1, verse: 3 },
          { label: "Ezra 2:1", book: "Ezra", chapter: 2, verse: 1 },
        ],
      },
      {
        id: "return-2",
        title: "The Second Temple Completed",
        dateLabel: "516 BC",
        summary:
          "After delays and opposition, and encouraged by the prophets Haggai and Zechariah, the returned exiles complete the Second Temple roughly seventy years after the first was destroyed.",
        figures: ["Zerubbabel", "Haggai", "Zechariah"],
        places: ["Jerusalem"],
        refs: [
          { label: "Ezra 6:15", book: "Ezra", chapter: 6, verse: 15 },
          { label: "Haggai 1:8", book: "Haggai", chapter: 1, verse: 8 },
        ],
      },
      {
        id: "return-3",
        title: "Esther Saves Her People",
        dateLabel: "c. 483–473 BC",
        summary:
          "In the Persian court, the Jewish queen Esther risks her life to expose a plot to annihilate the Jewish people. Their deliverance is still commemorated in the feast of Purim.",
        figures: ["Esther", "Mordecai", "King Ahasuerus (Xerxes I)"],
        places: ["Susa, Persia"],
        refs: [
          { label: "Esther 4:14", book: "Esther", chapter: 4, verse: 14 },
          { label: "Esther 9:22", book: "Esther", chapter: 9, verse: 22 },
        ],
      },
      {
        id: "return-4",
        title: "Ezra Restores the Law",
        dateLabel: "c. 458 BC",
        summary:
          "The priest and scribe Ezra leads a further return from Babylon and leads Israel in a renewed, public reading and study of the Law.",
        figures: ["Ezra"],
        places: ["Jerusalem"],
        refs: [
          { label: "Ezra 7:10", book: "Ezra", chapter: 7, verse: 10 },
          { label: "Nehemiah 8:8", book: "Nehemiah", chapter: 8, verse: 8 },
        ],
      },
      {
        id: "return-5",
        title: "Nehemiah Rebuilds the Walls",
        dateLabel: "c. 445 BC",
        summary:
          "As cupbearer to the Persian king, Nehemiah obtains permission to return and rebuild Jerusalem's broken walls, completing the work in fifty-two days despite fierce opposition.",
        figures: ["Nehemiah"],
        places: ["Jerusalem"],
        refs: [
          { label: "Nehemiah 2:17", book: "Nehemiah", chapter: 2, verse: 17 },
          { label: "Nehemiah 6:15", book: "Nehemiah", chapter: 6, verse: 15 },
        ],
      },
      {
        id: "return-6",
        title: "Malachi's Closing Word",
        dateLabel: "c. 430 BC",
        summary:
          "The last of the Old Testament prophets, Malachi rebukes Israel's half-hearted worship and looks ahead to a coming messenger who will prepare the way of the Lord — closing the Hebrew Scriptures on a note of expectation.",
        figures: ["Malachi"],
        places: [],
        refs: [{ label: "Malachi 4:6", book: "Malachi", chapter: 4, verse: 6 }],
      },
    ],
    sources: [
      { title: "ESV Study Bible (Crossway)" },
      { title: "John Bright, A History of Israel (Westminster John Knox Press)" },
    ],
  },
  {
    id: "silent-years",
    order: 11,
    name: "The Silent Years",
    icon: "Hourglass",
    color: "#8A7A6B",
    dateRange: "c. 430–5 BC — roughly four centuries between Malachi and Matthew",
    dateCaveat:
      "This period has no book in the Protestant Old or New Testament. Its history comes from sources like Josephus's Antiquities of the Jews, 1–2 Maccabees (historical books included in Catholic and Orthodox Bibles, and treated here as history, not scripture), and Greek and Roman records.",
    summary:
      "Though no biblical book narrates this period, it decisively shapes the world Jesus is born into: Persian rule gives way to Alexander the Great's conquest and the spread of Greek language and culture, the Maccabean revolt wins a brief Jewish independence, and finally Rome absorbs the region — installing Herod the Great as client king over Judea.",
    events: [
      {
        id: "silent-1",
        title: "Alexander the Great and Hellenization",
        dateLabel: "334–323 BC",
        summary:
          "Alexander's conquests spread Greek language and culture across the Near East, including Judea. After his death his empire splits among his generals, with the Ptolemies (Egypt) and later the Seleucids (Syria) ruling over Judea in turn.",
        figures: ["Alexander the Great"],
        places: [],
        refs: [{ label: "Daniel 8:5", book: "Daniel", chapter: 8, verse: 5 }],
      },
      {
        id: "silent-2",
        title: "The Maccabean Revolt",
        dateLabel: "167–160 BC",
        summary:
          "When the Seleucid king Antiochus IV Epiphanes desecrates the Jerusalem Temple in 167 BC, the priest Mattathias and his son Judas Maccabeus lead a successful revolt. The Temple's rededication is still marked in the Jewish feast of Hanukkah.",
        figures: ["Judas Maccabeus", "Antiochus IV Epiphanes"],
        places: ["Jerusalem"],
        refs: [{ label: "Daniel 11:31", book: "Daniel", chapter: 11, verse: 31 }],
      },
      {
        id: "silent-3",
        title: "Roman Rule Begins",
        dateLabel: "63 BC",
        summary:
          "Internal Hasmonean dynasty conflict invites Roman intervention. The general Pompey captures Jerusalem, bringing Judea under Roman control.",
        figures: ["Pompey"],
        places: ["Jerusalem"],
        refs: [],
      },
      {
        id: "silent-4",
        title: "Herod the Great",
        dateLabel: "37–4 BC",
        summary:
          "Rome installs the ambitious, ruthless Herod the Great as client king of Judea. His massive building projects — including a greatly expanded Temple — form the backdrop to the Gospels' opening chapters, and it is during his reign that Jesus is born.",
        figures: ["Herod the Great"],
        places: ["Jerusalem"],
        refs: [{ label: "Matthew 2:1", book: "Matthew", chapter: 2, verse: 1 }],
      },
    ],
    sources: [
      { title: "Flavius Josephus, Antiquities of the Jews" },
      { title: "1 & 2 Maccabees", note: "historical sources for the Maccabean revolt" },
      { title: "F.F. Bruce, New Testament History (Doubleday)" },
    ],
  },
  {
    id: "life-of-christ",
    order: 12,
    name: "Life of Christ",
    icon: "Cross",
    color: "#C0616B",
    dateRange: "c. 6/5 BC – c. AD 30–33",
    dateCaveat:
      "Jesus's birth is dated before Herod the Great's death (commonly placed 4 BC), placing it c. 6–4 BC — a reminder that the modern calendar, fixed centuries later, is offset from the actual date. The crucifixion is most commonly dated to either AD 30 or AD 33 depending on how Passover dating and the length of Jesus's ministry are reckoned; both are held by serious scholars.",
    summary:
      "Jesus of Nazareth is born in Bethlehem, begins a public ministry around age thirty marked by teaching, miracles, and the announcement of the kingdom of God, and is crucified in Jerusalem under the Roman governor Pontius Pilate. Three days later, his followers testify that he rose from the dead, and after forty days he ascends to heaven.",
    events: [
      {
        id: "christ-1",
        title: "The Birth of Jesus",
        dateLabel: "c. 6–4 BC",
        summary:
          "Jesus is born in Bethlehem to Mary, betrothed to Joseph, fulfilling prophecies of a Messiah born in David's city. Matthew and Luke both place this before Herod the Great's death.",
        figures: ["Mary", "Joseph"],
        places: ["Bethlehem"],
        refs: [
          { label: "Luke 2:7", book: "Luke", chapter: 2, verse: 7 },
          { label: "Matthew 2:1", book: "Matthew", chapter: 2, verse: 1 },
        ],
      },
      {
        id: "christ-2",
        title: "John the Baptist and Jesus's Baptism",
        dateLabel: "c. AD 26–27",
        summary:
          "John the Baptist prepares the way, calling Israel to repentance. Jesus is baptized by him in the Jordan, marking the beginning of his public ministry around age thirty.",
        figures: ["John the Baptist", "Jesus"],
        places: ["Jordan River"],
        refs: [
          { label: "Matthew 3:13", book: "Matthew", chapter: 3, verse: 13 },
          { label: "Matthew 3:17", book: "Matthew", chapter: 3, verse: 17 },
        ],
      },
      {
        id: "christ-3",
        title: "Ministry, Teaching, and Miracles",
        dateLabel: "c. AD 27–30",
        summary:
          "Over roughly three years, Jesus calls twelve disciples, teaches in parables about the kingdom of God — including the Sermon on the Mount — and performs healings and other miracles across Galilee and Judea.",
        figures: ["Jesus", "the twelve disciples"],
        places: ["Galilee", "Judea"],
        refs: [
          { label: "Matthew 4:23", book: "Matthew", chapter: 4, verse: 23 },
          { label: "Luke 6:13", book: "Luke", chapter: 6, verse: 13 },
        ],
      },
      {
        id: "christ-4",
        title: "The Crucifixion",
        dateLabel: "AD 30 or AD 33 (both held by scholars)",
        summary:
          "After being arrested, tried before the Jewish council and then Pilate, Jesus is crucified outside Jerusalem at a place called Golgotha.",
        figures: ["Jesus", "Pontius Pilate"],
        places: ["Jerusalem", "Golgotha"],
        refs: [
          { label: "Matthew 27:35", book: "Matthew", chapter: 27, verse: 35 },
          { label: "John 19:30", book: "John", chapter: 19, verse: 30 },
        ],
        corroboration:
          "The Jewish historian Josephus (Antiquities 18) and the Roman historian Tacitus (Annals 15) both reference Jesus and his execution under Pontius Pilate — widely cited extra-biblical attestations of a historical Jesus, independent of the Gospel accounts.",
      },
      {
        id: "christ-5",
        title: "The Resurrection",
        dateLabel: "AD 30 or AD 33, three days after the crucifixion",
        summary:
          "On the third day, Jesus's tomb is found empty. He appears alive to Mary Magdalene, the disciples, and — per Paul's later account — to more than five hundred people at once.",
        figures: ["Jesus", "Mary Magdalene"],
        places: ["Jerusalem"],
        refs: [
          { label: "Matthew 28:6", book: "Matthew", chapter: 28, verse: 6 },
          { label: "1 Corinthians 15:6", book: "1 Corinthians", chapter: 15, verse: 6 },
        ],
      },
      {
        id: "christ-6",
        title: "The Ascension",
        dateLabel: "40 days after the resurrection",
        summary:
          "Jesus commissions his disciples and ascends into heaven from the Mount of Olives, promising to send the Holy Spirit and to return.",
        figures: ["Jesus"],
        places: ["Mount of Olives"],
        refs: [
          { label: "Acts 1:9", book: "Acts", chapter: 1, verse: 9 },
          { label: "Acts 1:11", book: "Acts", chapter: 1, verse: 11 },
        ],
      },
    ],
    sources: [
      { title: "ESV Study Bible / NIV Study Bible", note: "harmony and chronology of the Gospels" },
      { title: "Paul L. Maier, In the Fullness of Time (Kregel)" },
      { title: "F.F. Bruce, New Testament History (Doubleday)" },
    ],
  },
  {
    id: "early-church",
    order: 13,
    name: "The Early Church",
    icon: "Flame",
    color: "#D98F4E",
    dateRange: "c. AD 30–c. AD 95",
    summary:
      "The Holy Spirit falls on the disciples at Pentecost, and the church rapidly grows from Jerusalem outward. A persecutor named Saul is transformed into the apostle Paul, whose missionary journeys and letters carry the gospel across the Roman world. The apostle John, in exile on Patmos, receives the vision recorded in Revelation, and the New Testament closes looking ahead to Christ's return.",
    events: [
      {
        id: "church-1",
        title: "Pentecost and the Birth of the Church",
        dateLabel: "c. AD 30, 50 days after the resurrection",
        summary:
          "The Holy Spirit falls on Jesus's disciples at Pentecost. Peter preaches to the crowds in Jerusalem, and about three thousand are added to the church that day.",
        figures: ["the apostles", "Peter"],
        places: ["Jerusalem"],
        refs: [
          { label: "Acts 2:4", book: "Acts", chapter: 2, verse: 4 },
          { label: "Acts 2:41", book: "Acts", chapter: 2, verse: 41 },
        ],
      },
      {
        id: "church-2",
        title: "Stephen's Martyrdom and the Scattering",
        dateLabel: "c. AD 34–35",
        summary:
          "Stephen becomes the church's first martyr, stoned for his testimony about Jesus. The persecution that follows scatters believers beyond Jerusalem, spreading the gospel further.",
        figures: ["Stephen", "Saul"],
        places: ["Jerusalem"],
        refs: [
          { label: "Acts 7:60", book: "Acts", chapter: 7, verse: 60 },
          { label: "Acts 8:1", book: "Acts", chapter: 8, verse: 1 },
        ],
      },
      {
        id: "church-3",
        title: "Saul's Conversion",
        dateLabel: "c. AD 33–36",
        summary:
          "Saul, a zealous persecutor of the church, is confronted by the risen Jesus on the road to Damascus and becomes Paul, the apostle who will carry the gospel to the Gentile world.",
        figures: ["Saul (Paul)"],
        places: ["Road to Damascus"],
        refs: [
          { label: "Acts 9:4", book: "Acts", chapter: 9, verse: 4 },
          { label: "Acts 9:15", book: "Acts", chapter: 9, verse: 15 },
        ],
      },
      {
        id: "church-4",
        title: "Paul's Missionary Journeys",
        dateLabel: "c. AD 46–57",
        summary:
          "Over roughly three journeys across the eastern Mediterranean, Paul plants and strengthens churches, writing many of the letters that become part of the New Testament.",
        figures: ["Paul", "Barnabas", "Silas"],
        places: ["Asia Minor", "Greece"],
        refs: [
          { label: "Acts 13:3", book: "Acts", chapter: 13, verse: 3 },
          { label: "Acts 16:9", book: "Acts", chapter: 16, verse: 9 },
        ],
      },
      {
        id: "church-5",
        title: "The Jerusalem Council",
        dateLabel: "c. AD 49–50",
        summary:
          "The early church's leaders meet in Jerusalem to settle whether Gentile believers must keep the Jewish law, affirming salvation by grace through faith for Jew and Gentile alike.",
        figures: ["Peter", "Paul", "James"],
        places: ["Jerusalem"],
        refs: [
          { label: "Acts 15:6", book: "Acts", chapter: 15, verse: 6 },
          { label: "Acts 15:20", book: "Acts", chapter: 15, verse: 20 },
        ],
      },
      {
        id: "church-6",
        title: "Paul's Imprisonment and Journey to Rome",
        dateLabel: "c. AD 57–62",
        summary:
          "Arrested in Jerusalem and, after appealing to Caesar, transported to Rome, Paul remains under guard yet continues to teach freely — where the book of Acts's narrative ends.",
        figures: ["Paul"],
        places: ["Caesarea", "Rome"],
        refs: [
          { label: "Acts 27:1", book: "Acts", chapter: 27, verse: 1 },
          { label: "Acts 28:31", book: "Acts", chapter: 28, verse: 31 },
        ],
      },
      {
        id: "church-7",
        title: "The Fall of Jerusalem",
        dateLabel: "AD 70",
        summary:
          "Roman legions under Titus destroy Jerusalem and the Temple during the Jewish revolt, fulfilling Jesus's prophecy that not one stone would be left upon another.",
        figures: ["Titus"],
        places: ["Jerusalem"],
        refs: [
          { label: "Matthew 24:2", book: "Matthew", chapter: 24, verse: 2 },
          { label: "Luke 21:20", book: "Luke", chapter: 21, verse: 20 },
        ],
        corroboration:
          "The Jewish historian Josephus, an eyewitness to the Jewish revolt, recorded the siege and destruction of Jerusalem in detail in The Jewish War — the primary historical source for the events of AD 70 outside the Gospels' predictive statements.",
      },
      {
        id: "church-8",
        title: "John's Revelation",
        dateLabel: "c. AD 95",
        summary:
          "Exiled on the island of Patmos, likely under the emperor Domitian, the apostle John receives the vision recorded in the book of Revelation — closing the New Testament with the promise of Christ's return.",
        figures: ["the apostle John"],
        places: ["Patmos"],
        refs: [
          { label: "Revelation 1:9", book: "Revelation", chapter: 1, verse: 9 },
          { label: "Revelation 22:20", book: "Revelation", chapter: 22, verse: 20 },
        ],
      },
    ],
    sources: [
      { title: "F.F. Bruce, New Testament History (Doubleday)" },
      { title: "Eusebius, Ecclesiastical History", note: "early church tradition on the apostles and John's exile" },
      { title: "Flavius Josephus, The Jewish War", note: "primary source for AD 70" },
      { title: "ESV Study Bible / NIV Study Bible", note: "timeline of Acts and the epistles" },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────

export function getEraById(id: string): TimelineEra | undefined {
  return TIMELINE_ERAS.find((e) => e.id === id);
}

export function getEraIndex(id: string): number {
  return TIMELINE_ERAS.findIndex((e) => e.id === id);
}

export function getTotalEventCount(): number {
  return TIMELINE_ERAS.reduce((sum, era) => sum + era.events.length, 0);
}
