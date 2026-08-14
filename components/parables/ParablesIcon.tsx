import { Sprout, HandCoins, Scale, Wheat, type LucideProps } from "lucide-react";

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  Sprout,
  HandCoins,
  Scale,
};

export function ParablesIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = ICONS[name] ?? Wheat;
  return <Icon {...props} />;
}
