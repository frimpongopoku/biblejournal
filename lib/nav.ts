import {
  LayoutDashboard, NotebookPen, BookOpen, HeartHandshake, Megaphone, Mic, Compass,
  GraduationCap, Scroll, BookOpenCheck, Coins, Zap, Handshake, Wheat, Highlighter, History,
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

export interface NavGroup { id: string; label: string | null; items: NavItem[]; collapsible?: boolean }

/** One source of truth for the sidebar, ⌘K and the shortcuts panel. */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: "main",
    label: null,
    items: [
      { href: "/dashboard", label: "Today", icon: LayoutDashboard, g: "d", keywords: "dashboard home" },
      { href: "/journal", label: "Journal", icon: NotebookPen, g: "j", keywords: "write entries diary" },
      { href: "/bible", label: "Bible", icon: BookOpen, g: "b", keywords: "read scripture" },
      { href: "/study", label: "Study", icon: Highlighter, g: "s", keywords: "highlights notes questions" },
      { href: "/research", label: "Research", icon: Compass, g: "r", keywords: "ask word study commentary" },
    ],
  },
  {
    id: "practice",
    label: "Practice",
    items: [
      { href: "/prayer", label: "Prayer", icon: HeartHandshake, g: "p", keywords: "prayers requests answered" },
      { href: "/sermons", label: "Sermons", icon: Mic, g: "m", keywords: "notes preaching video" },
      { href: "/proclamations", label: "Proclamations", icon: Megaphone, g: "c", keywords: "declarations declare confess" },
      { href: "/learn", label: "Learning", icon: GraduationCap, g: "l", keywords: "books topics courses" },
    ],
  },
  {
    id: "spaces",
    label: "Study spaces",
    collapsible: true,
    items: [
      { href: "/promises", label: "Promises", icon: Scroll, keywords: "space" },
      { href: "/principles", label: "Principles", icon: BookOpenCheck, keywords: "space" },
      { href: "/wealth", label: "Wealth", icon: Coins, keywords: "space money stewardship" },
      { href: "/authority", label: "Authority", icon: Zap, keywords: "space" },
      { href: "/intercession", label: "Intercession", icon: Handshake, keywords: "space" },
      { href: "/parables", label: "Parables", icon: Wheat, keywords: "space" },
      { href: "/timeline", label: "Timeline", icon: History, g: "t", keywords: "space trail history" },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

/** Bottom tab bar on phones. */
export const MOBILE_TABS = ["/dashboard", "/journal", "/bible", "/prayer"]
  .map((h) => NAV_ITEMS.find((i) => i.href === h)!);
