"use client";

import { Suspense } from "react";
import { Reader } from "@/components/bible/Reader";

export default function BiblePage() {
  return (
    <Suspense fallback={null}>
      <Reader />
    </Suspense>
  );
}
