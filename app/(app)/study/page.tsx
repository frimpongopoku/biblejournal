import { redirect } from "next/navigation";

/** Study now lives inside the Bible reader (Read / Study switch). */
export default async function StudyPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const q = new URLSearchParams({ mode: "study" });
  for (const k of ["book", "chapter", "verse"]) { const v = sp[k]; if (typeof v === "string") q.set(k, v); }
  redirect(`/bible?${q}`);
}
