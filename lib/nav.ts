import {
  NotebookText, Library, BookOpen, HeartHandshake, Megaphone, Mic, Compass,
  GraduationCap, Scroll, BookOpenCheck, Coins, Zap, Handshake, Wheat, History,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Second key of the "G then …" sequence. */
  g?: string;
  /** Extra words the ⌘K palette matches on. */
  keywords?: string;
}

export interface NavGroup {
  id: string;
  label: string | null;
  items: NavItem[];
  /** Show this many items, the rest behind "N more". */
  fold?: number;
}

/**
 * One source of truth for the sidebar, ⌘K and the shortcuts panel.
 * Journal-first: the four places you live (Today, Journal, Bible, Sermons), then tools.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: "main",
    label: null,
    items: [
      { href: "/dashboard", label: "Today", icon: NotebookText, g: "d", keywords: "dashboard home today page prompt" },
      { href: "/journal", label: "Journal", icon: Library, g: "j", keywords: "write entries diary river" },
      { href: "/bible", label: "Bible", icon: BookOpen, g: "b", keywords: "read scripture study highlights notes questions commentary" },
      { href: "/sermons", label: "Sermons", icon: Mic, g: "m", keywords: "notes preaching video message church" },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    fold: 4,
    items: [
      { href: "/research", label: "Ask & research", icon: Compass, g: "r", keywords: "ask word study commentary research" },
      { href: "/prayer", label: "Prayer list", icon: HeartHandshake, g: "p", keywords: "prayers requests answered" },
      { href: "/timeline", label: "Timeline", icon: History, g: "t", keywords: "space trail history" },
      { href: "/proclamations", label: "Proclamations", icon: Megaphone, g: "c", keywords: "declarations declare confess" },
      { href: "/learn", label: "Learning", icon: GraduationCap, g: "l", keywords: "books topics courses" },
      { href: "/promises", label: "Promises", icon: Scroll, keywords: "space" },
      { href: "/principles", label: "Principles", icon: BookOpenCheck, keywords: "space" },
      { href: "/wealth", label: "Wealth", icon: Coins, keywords: "space money stewardship" },
      { href: "/authority", label: "Authority", icon: Zap, keywords: "space" },
      { href: "/intercession", label: "Intercession", icon: Handshake, keywords: "space" },
      { href: "/parables", label: "Parables", icon: Wheat, keywords: "space" },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

/** Bottom tab bar on phones. */
export const MOBILE_TABS = ["/dashboard", "/journal", "/bible", "/sermons"]
  .map((h) => NAV_ITEMS.find((i) => i.href === h)!);

/**
 * Shared keyboard state: while a "G then …" sequence is pending, page-level
 * single-letter shortcuts (e.g. J in the Bible reader) must stand down.
 */
export const keySequence = { gPendingUntil: 0 };
export const gSequencePending = () => performance.now() < keySequence.gPendingUntil;
