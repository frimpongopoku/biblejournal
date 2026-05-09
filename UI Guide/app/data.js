// Shared content for the Bible Journal prototype.
// Scripture is public domain (KJV/WEB-style). Journal/prayer entries are original.

window.BJ = window.BJ || {};

window.BJ.dailyVerse = {
  ref: 'Lamentations 3:22–23',
  text: 'It is of the Lord\u2019s mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness.',
};

window.BJ.streak = { days: 47, weekDots: [1, 1, 1, 0, 1, 1, 1] };

window.BJ.collections = [
  { id: 'all', name: 'All notes', count: 142 },
  { id: 'sermons', name: 'Sermon notes', count: 24 },
  { id: 'study', name: 'Bible study', count: 38 },
  { id: 'reflect', name: 'Daily reflections', count: 61 },
  { id: 'sermon-prep', name: 'Sermon prep', count: 7 },
  { id: 'archive', name: 'Archive', count: 12 },
];

window.BJ.tags = [
  { id: 'grace', name: 'grace', count: 18 },
  { id: 'waiting', name: 'waiting', count: 9 },
  { id: 'identity', name: 'identity', count: 14 },
  { id: 'covenant', name: 'covenant', count: 6 },
  { id: 'lament', name: 'lament', count: 4 },
  { id: 'kingdom', name: 'kingdom', count: 11 },
];

window.BJ.entries = [
  {
    id: 'morning-light',
    title: 'Morning Light',
    folder: 'reflect',
    tags: ['grace', 'waiting'],
    date: 'Today \u00b7 6:42 AM',
    excerpt: 'A meditation on Lamentations 3 \u2014 mercy as a sunrise, not a transaction.',
    pinned: true,
    body: [
      { kind: 'h', text: 'Morning Light' },
      { kind: 'meta', text: 'May 9, 2026 \u00b7 Saturday' },
      { kind: 'p', text: 'I keep returning to the word new. Not renewed, not refreshed. New. As if mercy is something God invents at sunrise, never copied from yesterday\u2019s.' },
      { kind: 'verse', ref: 'Lamentations 3:22\u201323', text: 'It is of the Lord\u2019s mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness.' },
      { kind: 'p', text: 'There is something tender about a God who refuses to let his kindness become routine. The same sun, technically. A different mercy entirely.' },
      { kind: 'callout', label: 'Question for the week', text: 'What if I treated each morning the way Lamentations does \u2014 not as a continuation of yesterday\u2019s exhaustion, but as a fresh draft of grace?' },
      { kind: 'p', text: 'Cross\u2011reference Psalm 30:5. Joy in the morning. The pattern is consistent: night is real, but it is never the last word.' },
    ],
  },
  {
    id: 'on-waiting',
    title: 'On Waiting',
    folder: 'reflect',
    tags: ['waiting'],
    date: 'Yesterday',
    excerpt: 'Waiting is not the absence of God\u2019s movement. It is the room where it happens.',
    pinned: false,
  },
  {
    id: 'vine-branch',
    title: 'The Vine and the Branch',
    folder: 'study',
    tags: ['identity', 'kingdom'],
    date: 'Wed, May 6',
    excerpt: 'John 15. Abiding is not effort \u2014 it is location.',
    pinned: true,
  },
  {
    id: 'hesed',
    title: 'Hesed \u2014 a word that won\u2019t translate',
    folder: 'study',
    tags: ['covenant', 'grace'],
    date: 'Mon, May 4',
    excerpt: 'Loyal love. Stubborn kindness. Promise that outlasts performance.',
  },
  {
    id: 'sermon-mercy',
    title: 'Sermon notes \u2014 Pastor Adeyemi, Sun May 3',
    folder: 'sermons',
    tags: ['grace'],
    date: 'Sun, May 3',
    excerpt: 'Three movements of mercy: pursued, received, multiplied.',
  },
  {
    id: 'prodigal',
    title: 'The father ran',
    folder: 'reflect',
    tags: ['grace', 'identity'],
    date: 'Fri, May 1',
    excerpt: 'Luke 15. The shocking detail is the running, not the return.',
  },
  {
    id: 'lament-honest',
    title: 'Permission to lament',
    folder: 'reflect',
    tags: ['lament'],
    date: 'Apr 28',
    excerpt: 'The Psalter teaches honesty before it teaches praise.',
  },
];

window.BJ.prayers = [
  { id: 'p1', subject: 'Mum\u2019s recovery', status: 'praying', body: 'For full healing after surgery. Strength for Dad as he cares for her.', updated: '2 days ago', streak: 14 },
  { id: 'p2', subject: 'Wisdom in the new role', status: 'praying', body: 'Discernment for the team I\u2019m leading. That I would lead from rest, not anxiety.', updated: 'Today', streak: 7 },
  { id: 'p3', subject: 'Sade\u2019s exams', status: 'answered', body: 'Peace and recall. Whatever the result, that her identity stays anchored.', updated: 'Last week', answeredOn: 'May 6' },
  { id: 'p4', subject: 'Our small group', status: 'praying', body: 'That Tuesday nights would feel like home for someone who needs one.', updated: '3 days ago', streak: 21 },
  { id: 'p5', subject: 'A clear no', status: 'answered', body: 'I asked for clarity on the Lagos move. It came.', updated: 'Apr 20', answeredOn: 'Apr 20' },
];

window.BJ.bibleChapter = {
  book: 'John',
  chapter: 15,
  version: 'ESV',
  title: 'I Am the True Vine',
  verses: [
    { n: 1, text: '\u201cI am the true vine, and my Father is the vinedresser.' },
    { n: 2, text: 'Every branch in me that does not bear fruit he takes away, and every branch that does bear fruit he prunes, that it may bear more fruit.' },
    { n: 3, text: 'Already you are clean because of the word that I have spoken to you.' },
    { n: 4, text: 'Abide in me, and I in you. As the branch cannot bear fruit by itself, unless it abides in the vine, neither can you, unless you abide in me.', highlight: 'gold' },
    { n: 5, text: 'I am the vine; you are the branches. Whoever abides in me and I in him, he it is that bears much fruit, for apart from me you can do nothing.', highlight: 'gold' },
    { n: 6, text: 'If anyone does not abide in me he is thrown away like a branch and withers; and the branches are gathered, thrown into the fire, and burned.' },
    { n: 7, text: 'If you abide in me, and my words abide in you, ask whatever you wish, and it will be done for you.' },
    { n: 8, text: 'By this my Father is glorified, that you bear much fruit and so prove to be my disciples.' },
    { n: 9, text: 'As the Father has loved me, so have I loved you. Abide in my love.' },
    { n: 10, text: 'If you keep my commandments, you will abide in my love, just as I have kept my Father\u2019s commandments and abide in his love.' },
    { n: 11, text: 'These things I have spoken to you, that my joy may be in you, and that your joy may be full.' },
  ],
};

window.BJ.crossRefs = [
  { ref: 'Romans 11:17\u201324', note: 'Grafted in \u2014 branch language used of Gentile inclusion.' },
  { ref: 'Galatians 5:22\u201323', note: 'Fruit named: love, joy, peace, patience\u2026' },
  { ref: 'Psalm 1:3', note: '\u201cLike a tree planted by streams of water.\u201d Pattern of abiding life.' },
  { ref: 'Isaiah 5:1\u20137', note: 'Vineyard song. Israel as vine that disappointed.' },
];

window.BJ.aiInsights = [
  'The Greek meno\u0304 (abide) appears 11 times in this chapter \u2014 the densest cluster in the NT.',
  '\u201cFruit\u201d in John points outward (Gal 5) and forward (Matt 7). Worth noting both.',
  'You wrote about identity\u2011as\u2011location on May 4. This passage develops the same thread.',
];

window.BJ.navItems = [
  { id: 'home', label: 'Today', icon: 'home' },
  { id: 'journal', label: 'Journal', icon: 'pen' },
  { id: 'bible', label: 'Bible', icon: 'book' },
  { id: 'prayer', label: 'Prayers', icon: 'flame' },
  { id: 'highlights', label: 'Highlights', icon: 'spark' },
  { id: 'research', label: 'Research', icon: 'compass' },
  { id: 'graph', label: 'Graph', icon: 'graph' },
];
