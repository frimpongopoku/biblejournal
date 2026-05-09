import { NextResponse } from "next/server";
import { getBooks } from "@/lib/bible-parser";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ version: string }> }
) {
  const { version } = await params;
  try {
    const books = getBooks(version.toUpperCase());
    return NextResponse.json({ books });
  } catch {
    return NextResponse.json({ error: "Version not found" }, { status: 404 });
  }
}
