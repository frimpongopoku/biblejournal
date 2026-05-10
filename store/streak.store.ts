import { create } from "zustand";

const DAY_LABEL = ["M", "T", "W", "T", "F", "S", "S"]; // Mon=0 … Sun=6

export interface WeekDot {
  on: boolean;
  label: string;
}

interface StreakState {
  streak: number;
  weekDots: WeekDot[];
  update: (activityDates: Date[]) => void;
}

// Use local date string to avoid UTC-vs-local timezone mismatch
function localKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function compute(dates: Date[]): { streak: number; weekDots: WeekDot[] } {
  const now = new Date();
  const active = new Set(dates.map(localKey));

  // Grace period: if nothing recorded today yet, start counting from yesterday
  // so the streak doesn't reset mid-day before you've had a chance to write.
  const startOffset = active.has(localKey(now)) ? 0 : 1;

  let streak = 0;
  for (let i = startOffset; i < 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    if (active.has(localKey(d))) streak++;
    else break;
  }

  const weekDots: WeekDot[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const jsDay = d.getDay();
    const label = DAY_LABEL[jsDay === 0 ? 6 : jsDay - 1];
    return { on: active.has(localKey(d)), label };
  });

  return { streak, weekDots };
}

export const useStreakStore = create<StreakState>((set) => ({
  streak: 0,
  weekDots: Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const jsDay = d.getDay();
    return { on: false, label: DAY_LABEL[jsDay === 0 ? 6 : jsDay - 1] };
  }),
  update: (dates) => set(compute(dates)),
}));
