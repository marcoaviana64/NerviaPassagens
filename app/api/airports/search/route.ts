import { NextRequest, NextResponse } from "next/server";
import { AIRPORTS } from "@/lib/data/airports";

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export async function GET(req: NextRequest) {
  const raw = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const q = normalize(raw);

  if (q.length < 2) {
    return NextResponse.json({ airports: AIRPORTS.slice(0, 8) });
  }

  const results = AIRPORTS.filter(
    (a) =>
      normalize(a.code).startsWith(q) ||
      normalize(a.city).includes(q) ||
      normalize(a.name).includes(q) ||
      normalize(a.country).includes(q)
  ).slice(0, 8);

  return NextResponse.json({ airports: results });
}
