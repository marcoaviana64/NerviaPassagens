import { NextRequest, NextResponse } from "next/server";
import { searchFlights } from "@/lib/services/flightSearch";
import { CabinClass } from "@/lib/types/flight";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const origin = sp.get("origin");
  const destination = sp.get("destination");
  const departDate = sp.get("departDate");
  const returnDate = sp.get("returnDate") ?? undefined;
  const adults = parseInt(sp.get("adults") ?? "1", 10);
  const cabinClass = (sp.get("cabinClass") ?? "ECONOMY") as CabinClass;

  if (!origin || !destination || !departDate) {
    return NextResponse.json(
      { error: "Parâmetros obrigatórios: origin, destination, departDate" },
      { status: 400 }
    );
  }

  try {
    const result = await searchFlights({
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departDate,
      returnDate,
      adults: Number.isFinite(adults) && adults > 0 ? adults : 1,
      cabinClass,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/flights/search]", err);
    return NextResponse.json({ error: "Falha ao buscar voos" }, { status: 500 });
  }
}
