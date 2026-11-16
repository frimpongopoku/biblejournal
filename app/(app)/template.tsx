"use client";

import { useState } from "react";
import { lastInputWasKeyboard } from "@/lib/inputMode";

/** Each page rises in on arrival — unless you got here with the keyboard. */
export default function Template({ children }: { children: React.ReactNode }) {
  const [animate] = useState(() => !lastInputWasKeyboard());
  return <div className={`h-full ${animate ? "bj-page" : ""}`}>{children}</div>;
}
