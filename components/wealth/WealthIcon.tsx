import {
  Wallet, Percent, Briefcase, Gift, Anchor, TriangleAlert, Hammer,
  Landmark, HandCoins, HandHelping, TreeDeciduous, Gem,
  type LucideProps,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  Wallet, Percent, Briefcase, Gift, Anchor, TriangleAlert, Hammer,
  Landmark, HandCoins, HandHelping, TreeDeciduous, Gem,
};

export function WealthIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = ICONS[name] ?? Wallet;
  return <Icon {...props} />;
}
