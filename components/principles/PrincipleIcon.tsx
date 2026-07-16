import {
  Sprout, MessageCircle, Landmark, Coins, Scale, Lightbulb, Heart,
  Handshake, Feather, Gavel, Moon, Users, Gift, Crown, Puzzle,
  KeyRound, Brain, Globe,
  type LucideProps,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  Sprout, MessageCircle, Landmark, Coins, Scale, Lightbulb, Heart,
  Handshake, Feather, Gavel, Moon, Users, Gift, Crown, Puzzle,
  KeyRound, Brain, Globe,
};

export function PrincipleIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = ICONS[name] ?? Scale;
  return <Icon {...props} />;
}
