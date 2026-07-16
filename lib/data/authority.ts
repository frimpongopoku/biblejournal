import { OT_BOOKS, type BookName } from "@/lib/bible-books";

// ── Types ─────────────────────────────────────────────────

export type AuthorityCategoryId =
  | "delegated-authority" | "name-of-jesus" | "position-in-christ" | "victory-over-enemy"
  | "armor-warfare" | "binding-loosing" | "authority-over-sickness" | "overcomers"
  | "sonship-basis" | "prayer-authority" | "standing-firm" | "blood-of-the-lamb";

export type AuthorityKind = "promise" | "principle" | "warning" | "wisdom";

export interface AuthorityCategory {
  id: AuthorityCategoryId;
  label: string;
  blurb: string;
  icon: string;
  color: string;
}

export interface AuthorityEntry {
  id: string;
  category: AuthorityCategoryId;
  kind: AuthorityKind;
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

export const AUTHORITY_KINDS: { id: AuthorityKind; label: string; color: string }[] = [
  { id: "promise",   label: "Promise",   color: "var(--bj-gold-deep)" },
  { id: "principle", label: "Principle", color: "var(--bj-ink3)" },
  { id: "warning",   label: "Warning",   color: "var(--bj-ember)" },
  { id: "wisdom",    label: "Wisdom",    color: "var(--bj-sage)" },
];

// ── Categories ────────────────────────────────────────────

export const AUTHORITY_CATEGORIES: AuthorityCategory[] = [
  { id: "delegated-authority",   label: "Authority Given",        blurb: "Sent with real authority",       icon: "Key",         color: "#B08D3E" },
  { id: "name-of-jesus",         label: "The Name of Jesus",      blurb: "Above every other name",          icon: "Flame",       color: "#C98A4B" },
  { id: "position-in-christ",    label: "Seated With Him",        blurb: "Positioned above, not beneath",   icon: "Crown",       color: "#9B6BA8" },
  { id: "victory-over-enemy",    label: "Victory Over the Enemy", blurb: "Already defeated",                 icon: "Swords",      color: "#A65D57" },
  { id: "armor-warfare",         label: "Armor & Warfare",        blurb: "Equipped, not exposed",            icon: "ShieldCheck", color: "#5B7C99" },
  { id: "binding-loosing",       label: "Binding & Loosing",      blurb: "Kingdom keys",                     icon: "LockOpen",    color: "#6B8CAE" },
  { id: "authority-over-sickness", label: "Authority Over Sickness", blurb: "Sent to heal",                 icon: "HeartPulse",  color: "#C0616B" },
  { id: "overcomers",            label: "Overcomers",             blurb: "Given a name, given a nation",     icon: "Trophy",      color: "#C9A227" },
  { id: "sonship-basis",         label: "Sons Who Reign",         blurb: "Authority flows from identity",    icon: "Users",       color: "#6E9E5C" },
  { id: "prayer-authority",      label: "Authority in Prayer",    blurb: "Asking with confidence",           icon: "Hand",        color: "#4F7C82" },
  { id: "standing-firm",         label: "Standing Firm",          blurb: "Resisting, not retreating",        icon: "Footprints",  color: "#8A7256" },
  { id: "blood-of-the-lamb",     label: "The Blood That Overcomes", blurb: "The ground of every victory",   icon: "Droplet",     color: "#8E6FA8" },
];

export function getAuthorityCategory(id: AuthorityCategoryId): AuthorityCategory {
  return AUTHORITY_CATEGORIES.find((c) => c.id === id)!;
}

export function getAuthorityKind(id: AuthorityKind) {
  return AUTHORITY_KINDS.find((k) => k.id === id)!;
}

// ── Entries ───────────────────────────────────────────────

export const AUTHORITY_ENTRIES: AuthorityEntry[] = [
  // ── Authority Given ───────────────────────────────────
  {
    id: "delegated-authority-1", category: "delegated-authority", kind: "promise",
    title: "I have given you authority to tread on serpents and scorpions, and over all the power of the enemy, and nothing shall hurt you",
    reference: "Luke 10:19", book: "Luke", chapter: 10, verse: 19,
    context: "Jesus says this to seventy-two disciples returning overjoyed that even demons submitted to them in His name, redirecting their excitement from the power itself toward the far greater fact that their names are written in heaven.",
  },
  {
    id: "delegated-authority-2", category: "delegated-authority", kind: "principle",
    title: "All authority in heaven and on earth has been given to me. Go therefore",
    reference: "Matthew 28:18", book: "Matthew", chapter: 28, verse: 18,
    context: "The resurrected Jesus's final words to His eleven disciples on a Galilean mountain — the Great Commission that follows is grounded entirely on this prior claim: they are sent under His authority, not their own.",
  },
  {
    id: "delegated-authority-3", category: "delegated-authority", kind: "principle",
    title: "He called his twelve disciples to him and gave them authority over unclean spirits, to cast them out, and to heal every disease",
    reference: "Matthew 10:1", book: "Matthew", chapter: 10, verse: 1,
    context: "Before sending the twelve out on their first mission trip without Him, Jesus equips them with the same authority He Himself had been exercising — a temporary, specific commissioning for a defined task among the towns of Israel.",
  },
  {
    id: "delegated-authority-4", category: "delegated-authority", kind: "promise",
    title: "These signs will accompany those who believe: in my name they will cast out demons",
    reference: "Mark 16:17", book: "Mark", chapter: 16, verse: 17,
    context: "Part of Jesus's closing words in Mark's Gospel, extending the pattern of authority exercised in His name beyond the original twelve to all who would believe the message they carried forward.",
  },
  {
    id: "delegated-authority-5", category: "delegated-authority", kind: "promise",
    title: "Whoever believes in me will also do the works that I do; and greater works than these will he do",
    reference: "John 14:12", book: "John", chapter: 14, verse: 12,
    context: "Spoken at the Last Supper, Jesus explains this expansion of works is possible specifically because He is going to the Father — His departure makes way for the Spirit's ongoing empowerment of believers everywhere, not just in one place.",
  },
  {
    id: "delegated-authority-6", category: "delegated-authority", kind: "wisdom",
    title: "I too am a man under authority, with soldiers under me... say the word, and my servant will be healed",
    reference: "Matthew 8:9", book: "Matthew", chapter: 8, verse: 9,
    context: "A Roman centurion reasons that because Jesus, like himself, operates under a chain of authority, He can simply command healing the way a soldier obeys an order — Jesus calls this the greatest faith He had found in Israel, and the pattern holds: authority in scripture always flows from being rightly under authority, not around it.",
  },

  // ── The Name of Jesus ─────────────────────────────────
  {
    id: "name-of-jesus-1", category: "name-of-jesus", kind: "principle",
    title: "God has highly exalted him and bestowed on him the name that is above every name",
    reference: "Philippians 2:9", book: "Philippians", chapter: 2, verse: 9,
    context: "Paul quotes what is likely an early Christian hymn describing Christ's path from self-emptying humility to exaltation, establishing that the name believers pray and act in carries the highest authority in existence.",
  },
  {
    id: "name-of-jesus-2", category: "name-of-jesus", kind: "wisdom",
    title: "In the name of Jesus Christ of Nazareth, rise up and walk",
    reference: "Acts 3:6", book: "Acts", chapter: 3, verse: 6,
    context: "Peter and John, on their way to afternoon prayer at the temple, speak this to a man lame from birth who had begged there daily for years — Peter is careful afterward to clarify it was not his own power or piety that healed him, but faith in this name.",
  },
  {
    id: "name-of-jesus-3", category: "name-of-jesus", kind: "principle",
    title: "There is salvation in no one else, for there is no other name under heaven given among men by which we must be saved",
    reference: "Acts 4:12", book: "Acts", chapter: 4, verse: 12,
    context: "Peter declares this to the same religious council that had recently pressured Pilate to crucify Jesus, defending the healing of the lame man as evidence of the singular authority of the name they had rejected.",
  },
  {
    id: "name-of-jesus-4", category: "name-of-jesus", kind: "promise",
    title: "Whatever you ask in my name, this I will do, that the Father may be glorified in the Son",
    reference: "John 14:13", book: "John", chapter: 14, verse: 13,
    context: "Part of Jesus's Upper Room teaching the night before His death, tying prayer in His name not to a formula for getting what is wanted but to a request aligned with glorifying the Father.",
  },
  {
    id: "name-of-jesus-5", category: "name-of-jesus", kind: "promise",
    title: "Ask, and you will receive, that your joy may be full",
    reference: "John 16:24", book: "John", chapter: 16, verse: 24,
    context: "Jesus notes His disciples have not yet asked anything in His name, since His full authority as the risen, exalted Son would only be revealed after the resurrection — this promise anticipates a new kind of access opening up.",
  },
  {
    id: "name-of-jesus-6", category: "name-of-jesus", kind: "warning",
    title: "The evil spirit answered them, 'Jesus I know, and Paul I recognize, but who are you?' And the man... leaped on them... and overpowered them",
    reference: "Acts 19:15", book: "Acts", chapter: 19, verse: 15,
    context: "Seven sons of a Jewish chief priest named Sceva try to invoke \"the Jesus whom Paul proclaims\" over a demon-possessed man as if the name itself were a magic formula, with no actual relationship to Christ — they are physically overpowered and flee wounded, a sober warning that authority is exercised through genuine faith in Christ, not recited words.",
  },

  // ── Seated With Him ───────────────────────────────────
  {
    id: "position-in-christ-1", category: "position-in-christ", kind: "principle",
    title: "God... raised us up with him and seated us with him in the heavenly places in Christ Jesus",
    reference: "Ephesians 2:6", book: "Ephesians", chapter: 2, verse: 6,
    context: "Paul describes believers' position as already accomplished — not a future hope but a present spiritual reality — immediately after describing them as \"dead in trespasses\" before being made alive with Christ.",
  },
  {
    id: "position-in-christ-2", category: "position-in-christ", kind: "principle",
    title: "Far above all rule and authority and power and dominion, and above every name that is named",
    reference: "Ephesians 1:21", book: "Ephesians", chapter: 1, verse: 21,
    context: "Paul describes exactly where Christ was seated after His resurrection — above every conceivable rank of spiritual or earthly power — as the basis for the believer's own position described two chapters later.",
  },
  {
    id: "position-in-christ-3", category: "position-in-christ", kind: "principle",
    title: "You have been filled in him, who is the head of all rule and authority",
    reference: "Colossians 2:10", book: "Colossians", chapter: 2, verse: 10,
    context: "Paul writes to a church in the Lycus Valley being pulled toward mystical rituals and angel-worship, insisting believers are already complete in Christ — there is no higher power to appease or additional authority to acquire.",
  },
  {
    id: "position-in-christ-4", category: "position-in-christ", kind: "principle",
    title: "Consider yourselves dead to sin and alive to God in Christ Jesus",
    reference: "Romans 6:11", book: "Romans", chapter: 6, verse: 11,
    context: "Paul instructs believers to actively reckon on a truth already accomplished at the cross — authority over sin's dominion begins with recognizing a completed reality, not achieving a new one.",
  },
  {
    id: "position-in-christ-5", category: "position-in-christ", kind: "principle",
    title: "Seek the things that are above, where Christ is, seated at the right hand of God",
    reference: "Colossians 3:1", book: "Colossians", chapter: 3, verse: 1,
    context: "Paul pivots from doctrine to practice, arguing that because believers have been \"raised with Christ,\" their focus and posture should be shaped by His position of authority rather than by earthly, temporary concerns.",
  },

  // ── Victory Over the Enemy ────────────────────────────
  {
    id: "victory-over-enemy-1", category: "victory-over-enemy", kind: "promise",
    title: "The God of peace will soon crush Satan under your feet",
    reference: "Romans 16:20", book: "Romans", chapter: 16, verse: 20,
    context: "Paul closes his letter to a Roman church he warns about deceptive false teachers, promising that the same crushing of the serpent first announced in Genesis would be completed through God acting on their behalf.",
  },
  {
    id: "victory-over-enemy-2", category: "victory-over-enemy", kind: "promise",
    title: "He who is in you is greater than he who is in the world",
    reference: "1 John 4:4", book: "1 John", chapter: 4, verse: 4,
    context: "John reassures believers who had overcome false teachers denying Christ's incarnation, locating the source of their victory not in their own discernment but in the Spirit already living within them.",
  },
  {
    id: "victory-over-enemy-3", category: "victory-over-enemy", kind: "principle",
    title: "He disarmed the rulers and authorities and put them to open shame, by triumphing over them in him",
    reference: "Colossians 2:15", book: "Colossians", chapter: 2, verse: 15,
    context: "Paul describes the cross itself as a decisive military victory, borrowing imagery from a Roman triumphal procession where a conquering general paraded his defeated enemies publicly.",
  },
  {
    id: "victory-over-enemy-4", category: "victory-over-enemy", kind: "principle",
    title: "The reason the Son of God appeared was to destroy the works of the devil",
    reference: "1 John 3:8", book: "1 John", chapter: 3, verse: 8,
    context: "John states the explicit purpose of the incarnation in stark, adversarial terms, framing Christ's entire earthly mission as a direct confrontation with the works and influence of the devil.",
  },
  {
    id: "victory-over-enemy-5", category: "victory-over-enemy", kind: "wisdom",
    title: "I saw Satan fall like lightning from heaven",
    reference: "Luke 10:18", book: "Luke", chapter: 10, verse: 18,
    context: "Jesus responds to the seventy-two disciples' amazed report that demons submitted to them, revealing He witnessed a far larger, cosmic defeat behind their small, local victories.",
  },
  {
    id: "victory-over-enemy-6", category: "victory-over-enemy", kind: "promise",
    title: "He shall bruise your head, and you shall bruise his heel",
    reference: "Genesis 3:15", book: "Genesis", chapter: 3, verse: 15,
    context: "Spoken to the serpent immediately after the fall, this is the Bible's first promise of redemption — a future offspring of the woman would deal the serpent a fatal, head-crushing blow at the cost of a real but survivable wound.",
  },

  // ── Armor & Warfare ───────────────────────────────────
  {
    id: "armor-warfare-1", category: "armor-warfare", kind: "principle",
    title: "Put on the whole armor of God, that you may be able to stand against the schemes of the devil",
    reference: "Ephesians 6:11", book: "Ephesians", chapter: 6, verse: 11,
    context: "Paul, likely writing while chained to a Roman soldier in prison, uses the guard's own armor piece by piece as a metaphor for the spiritual readiness available to every believer.",
  },
  {
    id: "armor-warfare-2", category: "armor-warfare", kind: "principle",
    title: "We do not wrestle against flesh and blood, but against the rulers, against the authorities, against the cosmic powers",
    reference: "Ephesians 6:12", book: "Ephesians", chapter: 6, verse: 12,
    context: "Paul clarifies the true nature of the conflict he's about to describe armor for — the real opposition believers face is spiritual, not the people who may seem to be the source of conflict.",
  },
  {
    id: "armor-warfare-3", category: "armor-warfare", kind: "principle",
    title: "Take... the sword of the Spirit, which is the word of God",
    reference: "Ephesians 6:17", book: "Ephesians", chapter: 6, verse: 17,
    context: "The only offensive weapon in Paul's armor list, following five defensive pieces — scripture itself, actively wielded, is presented as the believer's means of engaging rather than merely enduring spiritual attack.",
  },
  {
    id: "armor-warfare-4", category: "armor-warfare", kind: "principle",
    title: "The weapons of our warfare are not of the flesh but have divine power to destroy strongholds",
    reference: "2 Corinthians 10:4", book: "2 Corinthians", chapter: 10, verse: 4,
    context: "Paul defends his apostolic authority against critics in Corinth questioning his unimpressive physical presence, insisting his effectiveness comes from spiritual weapons rather than personal charisma or force.",
  },
  {
    id: "armor-warfare-5", category: "armor-warfare", kind: "wisdom",
    title: "Share in suffering as a good soldier of Christ Jesus",
    reference: "2 Timothy 2:3", book: "2 Timothy", chapter: 2, verse: 3,
    context: "Paul, writing his final letter from a Roman prison awaiting execution, encourages Timothy toward a soldier's singular focus and endurance rather than entanglement in the ordinary pursuits of civilian life.",
  },

  // ── Binding & Loosing ─────────────────────────────────
  {
    id: "binding-loosing-1", category: "binding-loosing", kind: "principle",
    title: "I will give you the keys of the kingdom of heaven, and whatever you bind on earth shall be bound in heaven",
    reference: "Matthew 16:19", book: "Matthew", chapter: 16, verse: 19,
    context: "Spoken to Peter immediately after his confession that Jesus is the Christ, establishing a principle of delegated spiritual authority exercised on earth with heaven's backing.",
  },
  {
    id: "binding-loosing-2", category: "binding-loosing", kind: "principle",
    title: "Whatever you bind on earth shall be bound in heaven, and whatever you loose on earth shall be loosed in heaven",
    reference: "Matthew 18:18", book: "Matthew", chapter: 18, verse: 18,
    context: "Jesus repeats this authority in the context of church discipline and reconciliation, extending what was first given to Peter alone to the gathered community of believers handling conflict together.",
  },
  {
    id: "binding-loosing-3", category: "binding-loosing", kind: "principle",
    title: "If you forgive the sins of any, they are forgiven them",
    reference: "John 20:23", book: "John", chapter: 20, verse: 23,
    context: "The resurrected Jesus breathes on His disciples and gives them the Holy Spirit, commissioning them with authority to declare forgiveness as they carry His message of reconciliation into the world.",
  },
  {
    id: "binding-loosing-4", category: "binding-loosing", kind: "promise",
    title: "If two of you agree on earth about anything they ask, it will be done for them by my Father in heaven",
    reference: "Matthew 18:19", book: "Matthew", chapter: 18, verse: 19,
    context: "Immediately following the binding-and-loosing statement, Jesus ties this authority to agreement between even just two people, framing prayer itself as an exercise of the same delegated kingdom authority.",
  },
  {
    id: "binding-loosing-5", category: "binding-loosing", kind: "promise",
    title: "Where two or three are gathered in my name, there am I among them",
    reference: "Matthew 18:20", book: "Matthew", chapter: 18, verse: 20,
    context: "Closes Jesus's teaching on church discipline and agreement in prayer with a promise of His own presence — the authority described in the surrounding verses rests on this presence, not on the size of the gathering.",
  },

  // ── Authority Over Sickness ───────────────────────────
  {
    id: "authority-over-sickness-1", category: "authority-over-sickness", kind: "principle",
    title: "He gave them power and authority over all demons and to cure diseases",
    reference: "Luke 9:1", book: "Luke", chapter: 9, verse: 1,
    context: "Before sending the twelve out to preach the kingdom of God in the surrounding towns, Jesus equips them with the same authority over sickness and demonic oppression He had been exercising Himself.",
  },
  {
    id: "authority-over-sickness-2", category: "authority-over-sickness", kind: "principle",
    title: "Heal the sick, raise the dead, cleanse lepers, cast out demons. You received without paying; give without pay",
    reference: "Matthew 10:8", book: "Matthew", chapter: 10, verse: 8,
    context: "Jesus instructs the twelve as He sends them out that the authority they carry was freely given to them, and freely giving it away — without charging for it — should be its natural expression.",
  },
  {
    id: "authority-over-sickness-3", category: "authority-over-sickness", kind: "wisdom",
    title: "God anointed Jesus of Nazareth with the Holy Spirit and with power... healing all who were oppressed by the devil",
    reference: "Acts 10:38", book: "Acts", chapter: 10, verse: 38,
    context: "Peter summarizes Jesus's entire earthly ministry to a Roman centurion's household, tying physical healing directly to spiritual oppression and framing both as territory Jesus specifically came to reclaim.",
  },
  {
    id: "authority-over-sickness-4", category: "authority-over-sickness", kind: "promise",
    title: "The prayer of faith will save the one who is sick, and the Lord will raise him up",
    reference: "James 5:15", book: "James", chapter: 5, verse: 15,
    context: "James gives the early church a practical model of elders praying and anointing the sick with oil, treating physical healing as something the gathered community actively pursues together through prayer.",
  },
  {
    id: "authority-over-sickness-5", category: "authority-over-sickness", kind: "promise",
    title: "They will lay hands on the sick, and they will recover",
    reference: "Mark 16:18", book: "Mark", chapter: 16, verse: 18,
    context: "Part of the same closing commission listing signs that would accompany believers, extending the pattern of authority over sickness beyond the original twelve disciples to all who carry the message forward.",
  },

  // ── Overcomers ─────────────────────────────────────────
  {
    id: "overcomers-1", category: "overcomers", kind: "promise",
    title: "Everyone who has been born of God overcomes the world. And this is the victory... our faith",
    reference: "1 John 5:4", book: "1 John", chapter: 5, verse: 4,
    context: "John identifies the mechanism of spiritual victory not as effort or willpower but as faith itself, flowing from the new birth every believer has already received.",
  },
  {
    id: "overcomers-2", category: "overcomers", kind: "promise",
    title: "In all these things we are more than conquerors through him who loved us",
    reference: "Romans 8:37", book: "Romans", chapter: 8, verse: 37,
    context: "Paul writes this after listing tribulation, distress, persecution, famine, and sword — real hardships he and his readers actually faced — insisting that none of it can separate believers from Christ's love or overcome them.",
  },
  {
    id: "overcomers-3", category: "overcomers", kind: "promise",
    title: "The one who conquers will have this heritage, and I will be his God",
    reference: "Revelation 21:7", book: "Revelation", chapter: 21, verse: 7,
    context: "Part of John's vision of the new heaven and new earth, promising the full inheritance of God's presence specifically to those who overcome, echoing the promises made to each of the seven churches earlier in the book.",
  },
  {
    id: "overcomers-4", category: "overcomers", kind: "wisdom",
    title: "Thanks be to God, who gives us the victory through our Lord Jesus Christ",
    reference: "1 Corinthians 15:57", book: "1 Corinthians", chapter: 15, verse: 57,
    context: "Paul's exclamation closing a long argument for the certainty of the resurrection, declaring that even death itself — the \"last enemy\" mentioned earlier in the chapter — has already been overcome in Christ.",
  },
  {
    id: "overcomers-5", category: "overcomers", kind: "promise",
    title: "The one who conquers and who keeps my works until the end, to him I will give authority over the nations",
    reference: "Revelation 2:26", book: "Revelation", chapter: 2, verse: 26,
    context: "Part of Christ's letter to the church in Thyatira, a city struggling with compromise and false teaching, promising that enduring faithfulness — not passivity — is what authority in the coming kingdom is built on.",
  },

  // ── Sons Who Reign ─────────────────────────────────────
  {
    id: "sonship-basis-1", category: "sonship-basis", kind: "principle",
    title: "All who are led by the Spirit of God are sons of God",
    reference: "Romans 8:16", book: "Romans", chapter: 8, verse: 16,
    context: "Paul contrasts a spirit of slavery and fear with the Spirit of adoption believers have received, describing the Spirit itself as bearing inward witness to this new, secure family identity.",
  },
  {
    id: "sonship-basis-2", category: "sonship-basis", kind: "principle",
    title: "He has made us a kingdom, priests to his God and Father",
    reference: "Revelation 1:6", book: "Revelation", chapter: 1, verse: 6,
    context: "John opens Revelation with this doxology to Christ, describing believers not as distant subjects but as a kingdom and priesthood in their own right — a status carrying both worship access and delegated rule.",
  },
  {
    id: "sonship-basis-3", category: "sonship-basis", kind: "wisdom",
    title: "See what kind of love the Father has given us, that we should be called children of God",
    reference: "1 John 3:1", book: "1 John", chapter: 3, verse: 1,
    context: "John pauses his letter mid-argument in evident wonder at this identity, insisting the label \"children of God\" is not a metaphor but a literal, love-given reality the world simply doesn't recognize.",
  },
  {
    id: "sonship-basis-4", category: "sonship-basis", kind: "promise",
    title: "I will be a father to you, and you shall be sons and daughters to me",
    reference: "2 Corinthians 6:18", book: "2 Corinthians", chapter: 6, verse: 18,
    context: "Paul weaves together several Old Testament promises to a Corinthian church tempted to compromise with idolatry, grounding their call to separation in the security of an already-given family identity.",
  },
  {
    id: "sonship-basis-5", category: "sonship-basis", kind: "principle",
    title: "Through death he might destroy the one who has the power of death... and deliver all those who through fear of death were subject to lifelong slavery",
    reference: "Hebrews 2:14", book: "Hebrews", chapter: 2, verse: 14,
    context: "The writer explains why Christ took on flesh and blood at all — to personally confront death and the one who wielded it, freeing His brothers and sisters from a fear that had held them captive their whole lives.",
  },

  // ── Authority in Prayer ────────────────────────────────
  {
    id: "prayer-authority-1", category: "prayer-authority", kind: "promise",
    title: "If you abide in me, and my words abide in you, ask whatever you wish, and it will be done for you",
    reference: "John 15:7", book: "John", chapter: 15, verse: 7,
    context: "Part of Jesus's vine-and-branches teaching at the Last Supper, tying answered prayer directly to abiding closeness with Him — the promise assumes ongoing relationship, not a detached transaction.",
  },
  {
    id: "prayer-authority-2", category: "prayer-authority", kind: "promise",
    title: "This is the confidence that we have toward him, that if we ask anything according to his will he hears us",
    reference: "1 John 5:14", book: "1 John", chapter: 5, verse: 14,
    context: "John gives believers a specific basis for boldness in prayer — not certainty about getting exactly what is asked, but confidence that requests aligned with God's will are genuinely heard.",
  },
  {
    id: "prayer-authority-3", category: "prayer-authority", kind: "promise",
    title: "Whoever says to this mountain, 'Be taken up and thrown into the sea,' and does not doubt in his heart... it will be done for him",
    reference: "Mark 11:23", book: "Mark", chapter: 11, verse: 23,
    context: "Spoken the morning after Jesus curses a fig tree that withers by the next day, using a mountain overlooking Jerusalem as a deliberately enormous image for the reach of faith-filled prayer.",
  },
  {
    id: "prayer-authority-4", category: "prayer-authority", kind: "promise",
    title: "Whatever you ask in prayer, believing, you will receive",
    reference: "Matthew 21:22", book: "Matthew", chapter: 21, verse: 22,
    context: "Jesus teaches this to His disciples the same morning they discover the fig tree He cursed has withered, connecting the visible result to the posture of undoubting faith behind the prayer.",
  },
  {
    id: "prayer-authority-5", category: "prayer-authority", kind: "principle",
    title: "The prayer of a righteous person has great power as it is working",
    reference: "James 5:16", book: "James", chapter: 5, verse: 16,
    context: "James ties this statement to confessing sin to one another, using Elijah's prayer for drought and rain as proof that ordinary human prayer — not superhuman status — carries real effect when offered in righteousness.",
  },

  // ── Standing Firm ──────────────────────────────────────
  {
    id: "standing-firm-1", category: "standing-firm", kind: "promise",
    title: "Submit yourselves therefore to God. Resist the devil, and he will flee from you",
    reference: "James 4:7", book: "James", chapter: 4, verse: 7,
    context: "James ties resisting the devil directly to submission to God first, addressing a quarreling, worldly-minded community whose real problem was unsurrendered desire, not merely external attack.",
  },
  {
    id: "standing-firm-2", category: "standing-firm", kind: "principle",
    title: "Resist him, firm in your faith, knowing that the same kinds of suffering are being experienced by your brotherhood",
    reference: "1 Peter 5:9", book: "1 Peter", chapter: 5, verse: 9,
    context: "Peter writes to persecuted, scattered believers just after describing the devil as a roaring lion seeking someone to devour, reminding them their suffering is neither unique nor a sign they've been singled out and abandoned.",
  },
  {
    id: "standing-firm-3", category: "standing-firm", kind: "warning",
    title: "Give no opportunity to the devil",
    reference: "Ephesians 4:27", book: "Ephesians", chapter: 4, verse: 27,
    context: "Paul places this warning between instructions about unresolved anger and honest speech, suggesting ordinary relational sin — not just dramatic spiritual attack — is the more common doorway the enemy actually uses.",
  },
  {
    id: "standing-firm-4", category: "standing-firm", kind: "promise",
    title: "God gave us a spirit not of fear but of power and love and self-control",
    reference: "2 Timothy 1:7", book: "2 Timothy", chapter: 1, verse: 7,
    context: "Paul encourages a timid Timothy, reminding him to \"fan into flame\" the gift already given to him, tying spiritual boldness to a Spirit already received rather than a personality trait he lacked.",
  },
  {
    id: "standing-firm-5", category: "standing-firm", kind: "principle",
    title: "Be watchful, stand firm in the faith, act like men, be strong",
    reference: "1 Corinthians 16:13", book: "1 Corinthians", chapter: 16, verse: 13,
    context: "Paul's brief, rapid-fire closing charges to a divided, easily-distracted Corinthian church, summarizing steadfastness as a matter of active vigilance rather than passive hope.",
  },

  // ── The Blood That Overcomes ──────────────────────────
  {
    id: "blood-of-the-lamb-1", category: "blood-of-the-lamb", kind: "principle",
    title: "They have conquered him by the blood of the Lamb and by the word of their testimony",
    reference: "Revelation 12:11", book: "Revelation", chapter: 12, verse: 11,
    context: "John describes the accuser being cast down after a cosmic war in heaven, naming exactly what gave the persecuted believers victory over him — not their own strength, but Christ's blood and their spoken testimony.",
  },
  {
    id: "blood-of-the-lamb-2", category: "blood-of-the-lamb", kind: "principle",
    title: "How much more will the blood of Christ... purify our conscience from dead works to serve the living God",
    reference: "Hebrews 9:14", book: "Hebrews", chapter: 9, verse: 14,
    context: "The writer contrasts the repeated animal sacrifices of the old covenant, which only cleansed ceremonially, with Christ's once-for-all sacrifice, which reaches all the way to the conscience itself.",
  },
  {
    id: "blood-of-the-lamb-3", category: "blood-of-the-lamb", kind: "principle",
    title: "Ransomed... with the precious blood of Christ, like that of a lamb without blemish or spot",
    reference: "1 Peter 1:19", book: "1 Peter", chapter: 1, verse: 19,
    context: "Peter writes to scattered, persecuted believers reminding them their ransom from an \"empty way of life\" inherited from their ancestors cost far more than silver or gold — it cost the sinless life of Christ Himself.",
  },
  {
    id: "blood-of-the-lamb-4", category: "blood-of-the-lamb", kind: "principle",
    title: "Making peace by the blood of his cross",
    reference: "Colossians 1:20", book: "Colossians", chapter: 1, verse: 20,
    context: "Paul describes the scope of Christ's reconciling work as cosmic in scale — \"whether on earth or in heaven\" — with the cross as the singular means by which all of it was accomplished.",
  },
  {
    id: "blood-of-the-lamb-5", category: "blood-of-the-lamb", kind: "principle",
    title: "When I see the blood, I will pass over you, and no plague will befall you to destroy you",
    reference: "Exodus 12:13", book: "Exodus", chapter: 12, verse: 13,
    context: "Instructions for the very first Passover, the night before Israel's exodus from Egypt, where blood applied to a doorframe — not moral performance — was the sole condition for the household inside being spared judgment.",
  },
];

// ── Helpers ───────────────────────────────────────────────

export function getAuthorityEntryById(id: string): AuthorityEntry | undefined {
  return AUTHORITY_ENTRIES.find((e) => e.id === id);
}

export function authorityEntriesInCategory(category: AuthorityCategoryId): AuthorityEntry[] {
  return AUTHORITY_ENTRIES.filter((e) => e.category === category);
}

/** Deterministic daily pick — stable for the whole calendar day, changes automatically the next. */
export function authorityEntryOfTheDay(date: Date = new Date()): AuthorityEntry {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const diff = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - start;
  const dayOfYear = Math.floor(diff / 86400000);
  return AUTHORITY_ENTRIES[dayOfYear % AUTHORITY_ENTRIES.length];
}
