"use client";

import { useState } from "react";
import { Mark } from "./Mark";

/* The screen while BibJournal opens: the mark with a slowly breathing halo, the
   name, and a verse. The thin line only appears if opening takes over 400ms. */

const VERSES: [string, string][] = [
  ["Your word is a lamp to my feet and a light to my path.", "Psalm 119:105"],
  ["In the morning, Lord, you hear my voice.", "Psalm 5:3"],
  ["Be still, and know that I am God.", "Psalm 46:10"],
  ["Come to me, all you who are weary and burdened, and I will give you rest.", "Matthew 11:28"],
  ["The Lord is my shepherd, I lack nothing.", "Psalm 23:1"],
  ["His mercies are new every morning; great is your faithfulness.", "Lamentations 3:23"],
  ["Cast all your anxiety on him because he cares for you.", "1 Peter 5:7"],
];

export function Opening({ label = "Opening your journal" }: { label?: string }) {
  const [[text, ref]] = useState(() => VERSES[Math.floor(Date.now() / 86_400_000) % VERSES.length]);
  return (
    <div role="status" aria-label={label} className="bj-opening min-h-screen flex items-center justify-center px-6">
      <div className="flex flex-col items-center text-center">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <span aria-hidden="true" className="bj-opening-halo absolute -inset-8 rounded-full" />
          <Mark size={76} className="relative" />
        </div>
        <p className="font-display mt-7" style={{ fontSize: 30, lineHeight: 1, color: "var(--bj-ink)", fontWeight: 500 }}>BibJournal</p>
        <span aria-hidden="true" className="bj-opening-line mt-5" />
        <p className="font-display italic mt-7 max-w-[380px]" style={{ fontSize: 17, lineHeight: 1.5, color: "var(--bj-ink3)" }}>“{text}”</p>
        <p className="font-sans mt-2 text-[10.5px] font-semibold uppercase" style={{ letterSpacing: "0.12em", color: "var(--bj-ink4)" }}>{ref}</p>
      </div>
    </div>
  );
}
