import {
  BadgeCheck, Flame, Wind, Fence, Users, MessageCircle, Swords,
  Landmark, Hourglass, UsersRound, Heart, Sprout, Handshake,
  type LucideProps,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  BadgeCheck, Flame, Wind, Fence, Users, MessageCircle, Swords,
  Landmark, Hourglass, UsersRound, Heart, Sprout,
};

export function IntercessionIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = ICONS[name] ?? Handshake;
  return <Icon {...props} />;
}
