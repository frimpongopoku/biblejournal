import { NextResponse } from "next/server";
import { getAvailableVersions } from "@/lib/bible-parser";

export async function GET() {
  return NextResponse.json({ versions: getAvailableVersions() });
}
