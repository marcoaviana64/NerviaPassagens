import { NextRequest, NextResponse } from "next/server";
import { AIRPORTS, Airport } from "@/lib/data/airports";

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Aeroportos brasileiros de maior movimento, exibidos por padrão quando o campo está vazio
// e usados para desempatar resultados (aparecem primeiro dentro da mesma faixa de relevância).
const MAJOR_HUBS = ["GRU", "CGH", "GIG", "SDU", "BSB", "CNF", "SSA", "POA", "CWB", "REC", "FOR", "MAO"];

function relevance(a: Airport, q: string): number {
  const code = normalize(a.code);
  const city = normalize(a.city);
  const region = a.region ? normalize(a.region) : "";
  const name = normalize(a.name);
  const country = normalize(a.country);

  if (code === q) return 0;
  if (region && region === q) return 1;
  if (code.startsWith(q)) return 2;
  if (city.startsWith(q)) return 3;
  if (region && region.startsWith(q)) return 4;
  if (city.includes(q)) return 5;
  if (name.includes(q)) return 6;
  if (region && region.includes(q)) return 7;
  if (country.includes(q)) return 8;
  return 9;
}

export async function GET(req: NextRequest) {
  const raw = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const q = normalize(raw);

  if (q.length < 2) {
    const defaults = MAJOR_HUBS.map((code) => AIRPORTS.find((a) => a.code === code)).filter(
      (a): a is Airport => Boolean(a)
    );
    return NextResponse.json({ airports: defaults });
  }

  const results = AIRPORTS.filter((a) => relevance(a, q) < 9)
    .sort((a, b) => {
      const diff = relevance(a, q) - relevance(b, q);
      if (diff !== 0) return diff;
      const hubDiff = Number(MAJOR_HUBS.includes(b.code)) - Number(MAJOR_HUBS.includes(a.code));
      if (hubDiff !== 0) return hubDiff;
      return a.city.localeCompare(b.city);
    })
    .slice(0, 8);

  return NextResponse.json({ airports: results });
}
