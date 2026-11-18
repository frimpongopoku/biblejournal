"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/AppShell";
import { useStreakSync } from "@/hooks/useStreakSync";
import { useTypeVars } from "@/hooks/useTypeVars";
import { PersistentVideo } from "@/components/sermons/PersistentVideo";
import { VaultGate } from "@/components/vault/VaultGate";
import { Opening } from "@/components/brand/Opening";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useStreakSync();
  useTypeVars();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) return <Opening />;

  if (!user) return null;

  return (
    <>
      <AppShell>{children}</AppShell>
      <PersistentVideo />
      <VaultGate />
    </>
  );
}
