export const PROTESTANT_BOOKS = [
  // Old Testament (39)
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy",
  "Joshua","Judges","Ruth","1 Samuel","2 Samuel",
  "1 Kings","2 Kings","1 Chronicles","2 Chronicles",
  "Ezra","Nehemiah","Esther","Job","Psalms","Proverbs",
  "Ecclesiastes","Song of Solomon","Isaiah","Jeremiah",
  "Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos",
  "Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah",
  "Haggai","Zechariah","Malachi",
  // New Testament (27)
  "Matthew","Mark","Luke","John","Acts",
  "Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians",
  "Philippians","Colossians","1 Thessalonians","2 Thessalonians",
  "1 Timothy","2 Timothy","Titus","Philemon","Hebrews",
  "James","1 Peter","2 Peter","1 John","2 John",
  "3 John","Jude","Revelation",
] as const;

export type BookName = typeof PROTESTANT_BOOKS[number];

export const OT_BOOKS = new Set(PROTESTANT_BOOKS.slice(0, 39));

export const CHAPTER_COUNTS: Record<string, number> = {
  "Genesis":50,"Exodus":40,"Leviticus":27,"Numbers":36,"Deuteronomy":34,
  "Joshua":24,"Judges":21,"Ruth":4,"1 Samuel":31,"2 Samuel":24,
  "1 Kings":22,"2 Kings":25,"1 Chronicles":29,"2 Chronicles":36,
  "Ezra":10,"Nehemiah":13,"Esther":10,"Job":42,"Psalms":150,"Proverbs":31,
  "Ecclesiastes":12,"Song of Solomon":8,"Isaiah":66,"Jeremiah":52,
  "Lamentations":5,"Ezekiel":48,"Daniel":12,"Hosea":14,"Joel":3,"Amos":9,
  "Obadiah":1,"Jonah":4,"Micah":7,"Nahum":3,"Habakkuk":3,"Zephaniah":3,
  "Haggai":2,"Zechariah":14,"Malachi":4,
  "Matthew":28,"Mark":16,"Luke":24,"John":21,"Acts":28,
  "Romans":16,"1 Corinthians":16,"2 Corinthians":13,"Galatians":6,"Ephesians":6,
  "Philippians":4,"Colossians":4,"1 Thessalonians":5,"2 Thessalonians":3,
  "1 Timothy":6,"2 Timothy":4,"Titus":3,"Philemon":1,"Hebrews":13,
  "James":5,"1 Peter":5,"2 Peter":3,"1 John":5,"2 John":1,
  "3 John":1,"Jude":1,"Revelation":22,
};

// OSIS osisID → canonical book name (for KJV format)
export const OSIS_ID_TO_NAME: Record<string, string> = {
  Gen:"Genesis",Exod:"Exodus",Lev:"Leviticus",Num:"Numbers",Deut:"Deuteronomy",
  Josh:"Joshua",Judg:"Judges",Ruth:"Ruth",
  "1Sam":"1 Samuel","2Sam":"2 Samuel",
  "1Kgs":"1 Kings","2Kgs":"2 Kings",
  "1Chr":"1 Chronicles","2Chr":"2 Chronicles",
  Ezra:"Ezra",Neh:"Nehemiah",Esth:"Esther",
  Job:"Job",Ps:"Psalms",Prov:"Proverbs",
  Eccl:"Ecclesiastes",Song:"Song of Solomon",
  Isa:"Isaiah",Jer:"Jeremiah",Lam:"Lamentations",
  Ezek:"Ezekiel",Dan:"Daniel",Hos:"Hosea",
  Joel:"Joel",Amos:"Amos",Obad:"Obadiah",
  Jonah:"Jonah",Mic:"Micah",Nah:"Nahum",
  Hab:"Habakkuk",Zeph:"Zephaniah",Hag:"Haggai",
  Zech:"Zechariah",Mal:"Malachi",
  Matt:"Matthew",Mark:"Mark",Luke:"Luke",John:"John",Acts:"Acts",
  Rom:"Romans","1Cor":"1 Corinthians","2Cor":"2 Corinthians",
  Gal:"Galatians",Eph:"Ephesians",Phil:"Philippians",
  Col:"Colossians","1Thess":"1 Thessalonians","2Thess":"2 Thessalonians",
  "1Tim":"1 Timothy","2Tim":"2 Timothy",Titus:"Titus",
  Phlm:"Philemon",Heb:"Hebrews",Jas:"James",
  "1Pet":"1 Peter","2Pet":"2 Peter",
  "1John":"1 John","2John":"2 John","3John":"3 John",
  Jude:"Jude",Rev:"Revelation",
};
