import {
  Sunrise, Waves, Tent, Pyramid, Compass, Scale, Crown,
  Landmark, Lock, KeyRound, Hourglass, Cross, Flame,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Sunrise, Waves, Tent, Pyramid, Compass, Scale, Crown,
  Landmark, Lock, KeyRound, Hourglass, Cross, Flame,
};

export function EraIconGlyph({ name, size = 18, className, style }: { name: string; size?: number; className?: string; style?: React.CSSProperties }) {
  const Icon = ICONS[name] ?? Sunrise;
  return <Icon size={size} className={className} style={style} />;
}
