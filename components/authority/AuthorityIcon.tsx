import {
  Key, Flame, Crown, Swords, ShieldCheck, LockOpen, HeartPulse, Trophy,
  Users, Hand, Footprints, Droplet,
  type LucideProps,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  Key, Flame, Crown, Swords, ShieldCheck, LockOpen, HeartPulse, Trophy,
  Users, Hand, Footprints, Droplet,
};

export function AuthorityIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = ICONS[name] ?? Key;
  return <Icon {...props} />;
}
