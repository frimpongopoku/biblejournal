import {
  Sun, Wheat, Shield, Feather, Mountain, Route, HeartPulse, Droplets,
  Sunrise, Infinity as InfinityIcon, Anchor, Sprout, Lightbulb, Star,
  Scale, Crown, Wind, Gem, Moon,
  type LucideProps,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  Sun, Wheat, Shield, Feather, Mountain, Route, HeartPulse, Droplets,
  Sunrise, Infinity: InfinityIcon, Anchor, Sprout, Lightbulb, Star,
  Scale, Crown, Wind, Gem, Moon,
};

export function PromiseIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = ICONS[name] ?? Sun;
  return <Icon {...props} />;
}
