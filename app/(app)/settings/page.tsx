"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { SECTIONS, SectionBody, useSectionSummary, type SectionId } from "@/components/settings/SettingsSections";
import { SECTION_ICONS } from "@/components/settings/SettingsModal";

/** Settings on a phone: a list, then one section at a time. (Desktop uses the ⌘, window.) */
export default function SettingsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const summary = useSectionSummary();
  const [open, setOpen] = useState<SectionId | null>(null);
  const groups: SectionId[][] = [["appearance", "type", "writing"], ["reading", "sounds", "prayer"], ["shortcuts", "account"]];
  const label = (id: SectionId) => SECTIONS.find((s) => s.id === id)!.label;

  return (
    <div className="min-h-full w-full px-4 md:px-10 pt-6 md:pt-10 pb-28" style={{ maxWidth: 720, margin: "0 auto" }}>
      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <motion.div key={open} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}>
            <button type="button" onClick={() => setOpen(null)} className="flex items-center gap-1 -ml-1 h-9 font-sans text-[14px] font-medium" style={{ color: "var(--bj-gold)" }}>
              <ChevronLeft size={18} /> Settings
            </button>
            <h1 className="font-display mt-1 mb-2" style={{ fontSize: 30, color: "var(--bj-ink)", fontWeight: 500 }}>{label(open)}</h1>
            <SectionBody id={open} />
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}>
            <div className="flex items-center mb-4">
              <h1 className="font-display flex-1" style={{ fontSize: 34, color: "var(--bj-ink)", fontWeight: 500 }}>Settings</h1>
              <button type="button" onClick={() => router.back()} className="font-sans text-[14px] font-medium h-9 px-2" style={{ color: "var(--bj-gold)" }}>Done</button>
            </div>
            <button type="button" onClick={() => setOpen("account")} className="bj-raised bj-lift w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl mb-5 text-left">
              {user?.photoURL
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover shrink-0" />
                : <span className="w-10 h-10 rounded-full shrink-0" style={{ background: "var(--bj-gold-soft)" }} />}
              <span className="flex-1 min-w-0">
                <span className="block font-sans text-[15px] font-medium truncate" style={{ color: "var(--bj-ink)" }}>{user?.displayName || "Your account"}</span>
                <span className="block font-sans text-[12px] truncate" style={{ color: "var(--bj-ink4)" }}>{user?.email}</span>
              </span>
              <ChevronRight size={15} style={{ color: "var(--bj-ink4)" }} />
            </button>
            {groups.map((g, gi) => (
              <div key={gi} className="bj-raised rounded-2xl px-3.5 mb-5">
                {g.map((id) => {
                  const Icon = SECTION_ICONS[id];
                  return (
                    <button key={id} type="button" onClick={() => setOpen(id)} className="w-full flex items-center gap-3 h-12 text-left border-b last:border-b-0 transition-opacity duration-100 active:opacity-60" style={{ borderColor: "var(--bj-line-soft)" }}>
                      <span className="bj-well w-7 h-7 rounded-lg flex items-center justify-center shrink-0"><Icon size={14} style={{ color: "var(--bj-gold)" }} /></span>
                      <span className="flex-1 font-sans text-[15px] font-medium" style={{ color: "var(--bj-ink)" }}>{label(id)}</span>
                      <span className="font-sans text-[13px] truncate max-w-[40%]" style={{ color: "var(--bj-ink4)" }}>{summary[id]}</span>
                      <ChevronRight size={15} className="shrink-0" style={{ color: "var(--bj-ink4)" }} />
                    </button>
                  );
                })}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
