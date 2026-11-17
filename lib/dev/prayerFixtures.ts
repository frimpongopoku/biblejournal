// DEV ONLY — worst-case prayer data for break-ui. Swapped in at the
// usePrayers boundary with ?data=worst|empty|one|huge. Never shipped:
// usePrayers only reads it when NODE_ENV is "development".
import type { Prayer, PrayerLogEntry } from "@/types";

export type DevData = "demo" | "worst" | "empty" | "one" | "huge";

export function devDataMode(): DevData {
  if (process.env.NODE_ENV !== "development" || typeof window === "undefined") return "demo";
  const v = new URLSearchParams(window.location.search).get("data");
  return v === "worst" || v === "empty" || v === "one" || v === "huge" ? v : "demo";
}

const DAY = 86_400_000;
const now = Date.now();
const ago = (d: number) => new Date(now - d * DAY);
const doc = (...paras: string[]) => JSON.stringify({ type: "doc", content: paras.map((t) => ({ type: "paragraph", content: [{ type: "text", text: t }] })) });

function base(id: string, p: Partial<Prayer>): Prayer {
  return {
    id, userId: "dev", title: "", body: "", for: "", log: [], status: "active", scriptures: [],
    testimony: null, answeredAt: null, createdAt: ago(3), updatedAt: ago(1), ...p,
  };
}

/** 1,284 daily entries over ~3.5 years: the log that's been kept faithfully. */
function longLog(): PrayerLogEntry[] {
  return Array.from({ length: 1284 }, (_, i) => ({
    at: now - (1284 - i) * DAY + 7 * 3600_000,
    text: i % 3 === 0 ? "" : i % 7 === 0
      ? "Lord, it’s been another week of silence from the Home Office. I don’t understand the delay, but I’m choosing to trust you with it. Give Kwame peace at work and give me patience when I check the tracker for the fourth time today.\nAlso — thank you for Ama’s call."
      : "Still waiting. Still trusting.",
  }));
}

const WORST: Prayer[] = [
  base("w1", {
    for: "Aleksandra Wiśniewska-Kowalczyk",
    title: "That the immigration tribunal would overturn the refusal on Kwame’s spouse visa before the 14 March hearing deadline",
    body: doc("Father, you set the boundaries of the nations and you know every caseworker by name. The refusal said the evidence of our relationship was ‘insufficient’ — you know the eleven years, the two children, the flat in Kumasi and the one in Leeds.",
      "Give our solicitor wisdom, give the judge a fair heart, and give me sleep. I’ve stopped eating properly. Let me not make this my god."),
    log: longLog(), createdAt: ago(1284),
    scriptures: [{ book: "Psalm", chapter: 119, verse: 105, endVerse: 112, version: "ESV", text: "Your word is a lamp to my feet and a light to my path. I have sworn an oath and confirmed it, to keep your righteous rules. I am severely afflicted; give me life, O Lord, according to your word! Accept my freewill offerings of praise, O Lord, and teach me your rules. I hold my life in my hand continually, but I do not forget your law. The wicked have laid a snare for me, but I do not stray from your precepts. Your testimonies are my heritage forever, for they are the joy of my heart. I incline my heart to perform your statutes forever, to the end." }],
  }),
  base("w2", { for: "Jo", title: "Jo", createdAt: new Date(now - 3600_000) }),
  base("w3", {
    for: "🙏 Grandma Ọláyínká",
    title: "https://www.gofundme.com/f/help-rebuild-st-michaels-community-hall-after-the-flood-2026",
    body: doc("Share it with everyone at church. Target £48,500."),
    log: [{ at: now - 2 * DAY, text: "Raised £12,840 so far." }],
    createdAt: ago(20),
  }),
  base("w4", { for: "", title: "", body: "", log: [{ at: now - 5 * DAY, text: "" }], createdAt: ago(9) }),
  base("w5", { for: "Nguyễn Văn Thắng", title: "Cầu nguyện cho gia đình ông Nguyễn Văn Thắng — sức khỏe và bình an", log: [{ at: now - 1 * DAY, text: "Ông đã xuất viện. Tạ ơn Chúa!" }], createdAt: ago(31) }),
  base("w6", { for: "the whole of Grace Chapel Leeds (and the plant in Harehills)", title: "A building", createdAt: ago(400) }),
  ...Array.from({ length: 34 }, (_, i) => base(`wr${i}`, {
    for: ["Mum", "Dad", "Kofi", "", "Ama", "Our street", "Pastor Sam"][i % 7],
    title: ["Healing", "A job that fits", "Wisdom about the move", "Patience with the kids in the mornings", "Salvation", "Peace", "Provision for school fees for the autumn term"][i % 7],
    createdAt: ago(10 + i * 11), log: i % 4 ? [{ at: now - (i + 1) * DAY, text: "" }] : [],
  })),
  base("a1", {
    status: "answered", for: "Esi", title: "Esi’s scan",
    body: doc("That the lump would be nothing."),
    testimony: "The scan came back clear. The consultant said, and I wrote it down so I wouldn’t forget it: ‘I don’t have an explanation for why the second image is different from the first.’ We sat in the car park for forty minutes and cried and laughed and called everyone. Three years. One thousand and ninety-five days of bringing this. I’m writing it here so that when the next thing comes, I remember this one.",
    createdAt: ago(1100), answeredAt: ago(5),
  }),
  base("a2", { status: "answered", for: "", title: "The roof", testimony: null, createdAt: ago(400), answeredAt: new Date(new Date().getFullYear() - 1, 10, 2) }),
];

const ONE: Prayer[] = [base("o1", { for: "Mum", title: "Mum’s recovery", body: doc("Heal what was cut."), log: [{ at: now - DAY, text: "She walked to the gate." }], createdAt: ago(1) })];

function huge(): Prayer[] {
  return Array.from({ length: 1000 }, (_, i) => base(`h${i}`, {
    for: `Person ${i % 120}`, title: `Prayer request number ${i + 1}`, createdAt: ago(i % 900),
    log: Array.from({ length: i % 5 }, (_, k) => ({ at: now - (k + 1) * 3 * DAY, text: "" })),
  }));
}

export function devPrayers(mode: DevData): Prayer[] | null {
  if (mode === "worst") return WORST;
  if (mode === "empty") return [];
  if (mode === "one") return ONE;
  if (mode === "huge") return huge();
  return null;
}
