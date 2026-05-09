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

function compute(dates: Date[]): { streak: number; weekDots: WeekDot[] } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const active = new Set(dates.map((d) => d.toISOString().slice(0, 10)));

  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (active.has(d.toISOString().slice(0, 10))) streak++;
    else break;
  }

  const weekDots: WeekDot[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const jsDay = d.getDay(); // 0=Sun … 6=Sat
    const label = DAY_LABEL[jsDay === 0 ? 6 : jsDay - 1];
    return { on: active.has(d.toISOString().slice(0, 10)), label };
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
