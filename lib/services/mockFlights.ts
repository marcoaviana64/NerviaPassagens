import { FlightOffer, FlightSearchParams, FlightSegment } from "@/lib/types/flight";
import { AIRLINES } from "@/lib/data/airlines";

// Gera resultados de demonstração realistas e determinísticos (mesma busca = mesmos preços),
// usados como fallback quando nenhuma chave de API de voos está configurada, e como
// modo demo instantâneo do produto.
function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return function () {
    h = (Math.imul(h ^ (h >>> 15), h | 1) ^ 0) >>> 0;
    h = (h + Math.imul(h ^ (h >>> 7), h | 61)) >>> 0;
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
}

const AIRLINE_CODES = Object.keys(AIRLINES);

function buildSegment(
  rand: () => number,
  airlineCode: string,
  origin: string,
  destination: string,
  departure: Date
): FlightSegment {
  const durationMinutes = 60 * (2 + Math.floor(rand() * 9)) + Math.floor(rand() * 60);
  const arrival = new Date(departure.getTime() + durationMinutes * 60000);
  return {
    airlineCode,
    flightNumber: `${airlineCode}${1000 + Math.floor(rand() * 8999)}`,
    originCode: origin,
    destinationCode: destination,
    departureTime: departure.toISOString(),
    arrivalTime: arrival.toISOString(),
    durationMinutes,
  };
}

function buildItinerary(rand: () => number, origin: string, destination: string, dateISO: string) {
  const stops = rand() < 0.45 ? 0 : rand() < 0.8 ? 1 : 2;
  const airlineCode = AIRLINE_CODES[Math.floor(rand() * AIRLINE_CODES.length)];
  const segments: FlightSegment[] = [];

  const hubCodes = ["GRU", "MIA", "PTY", "BOG", "LIS", "MAD"];
  const stopoverCandidates = hubCodes.filter((h) => h !== origin && h !== destination);

  // cursor de tempo avança de forma monotônica ao longo dos trechos + conexões
  const cursor = new Date(`${dateISO}T00:00:00.000Z`);
  cursor.setUTCHours(5 + Math.floor(rand() * 18), Math.floor(rand() * 60), 0, 0);

  let currentOrigin = origin;
  for (let i = 0; i <= stops; i++) {
    const isLast = i === stops;
    const segDestination = isLast
      ? destination
      : stopoverCandidates[Math.floor(rand() * stopoverCandidates.length)] ?? destination;

    const seg = buildSegment(rand, airlineCode, currentOrigin, segDestination, new Date(cursor));
    segments.push(seg);

    currentOrigin = segDestination;
    // avança o cursor para o horário de chegada + tempo de conexão (45-135 min)
    const connectionMinutes = 45 + Math.floor(rand() * 90);
    cursor.setTime(new Date(seg.arrivalTime).getTime() + connectionMinutes * 60000);
  }

  const durationMinutes =
    new Date(segments[segments.length - 1].arrivalTime).getTime() - new Date(segments[0].departureTime).getTime();

  return { segments, durationMinutes: Math.round(durationMinutes / 60000), stops, airlineCode };
}

export function generateMockOffers(params: FlightSearchParams, count = 18): FlightOffer[] {
  const rand = seededRandom(
    `${params.origin}-${params.destination}-${params.departDate}-${params.returnDate ?? ""}-${params.cabinClass}`
  );

  const basePrice =
    280 +
    Math.abs(params.origin.charCodeAt(0) - params.destination.charCodeAt(0)) * 18 +
    Math.floor(rand() * 400);

  const cabinMultiplier: Record<string, number> = {
    ECONOMY: 1,
    PREMIUM_ECONOMY: 1.6,
    BUSINESS: 3.2,
    FIRST: 5.5,
  };

  const offers: FlightOffer[] = [];

  for (let i = 0; i < count; i++) {
    const outbound = buildItinerary(rand, params.origin, params.destination, params.departDate);
    const inbound = params.returnDate
      ? buildItinerary(rand, params.destination, params.origin, params.returnDate)
      : undefined;

    const stopsPenaltyOut = outbound.stops * 40;
    const stopsPenaltyIn = inbound ? inbound.stops * 40 : 0;
    const variance = 0.75 + rand() * 0.6;
    const price = Math.round(
      (basePrice + stopsPenaltyOut + stopsPenaltyIn) *
        variance *
        cabinMultiplier[params.cabinClass] *
        params.adults
    );

    offers.push({
      id: `demo-${i}-${outbound.segments[0].flightNumber}`,
      airlineCode: outbound.airlineCode,
      price,
      currency: "BRL",
      outbound: { segments: outbound.segments, durationMinutes: outbound.durationMinutes, stops: outbound.stops },
      inbound: inbound
        ? { segments: inbound.segments, durationMinutes: inbound.durationMinutes, stops: inbound.stops }
        : undefined,
      cabinClass: params.cabinClass,
      bagsIncluded: rand() > 0.4,
      source: "demo",
    });
  }

  return offers.sort((a, b) => a.price - b.price);
}
