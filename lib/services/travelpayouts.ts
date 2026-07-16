import { FlightOffer, FlightSearchParams, FlightSegment, FlightItinerary } from "@/lib/types/flight";

// Integração com a Aviasales Data API (Travelpayouts) — gratuita para qualquer projeto,
// sem exigência de volume mínimo de usuários (diferente da Flight Search "tempo real" da
// própria Travelpayouts, que só libera acesso a partir de 50.000 MAU, e da Amadeus
// Self-Service, que a Amadeus está descontinuando em 17/07/2026).
//
// Documentação: https://support.travelpayouts.com/hc/en-us/articles/203956163-Aviasales-Data-API
//
// Como conseguir o token (gratuito):
//   1. Crie uma conta em https://www.travelpayouts.com (rede de afiliados de viagem)
//   2. Acesse https://app.travelpayouts.com/profile/api-token e copie o "API token"
//   3. Configure TRAVELPAYOUTS_TOKEN no .env.local
//
// Importante: os preços vêm de um cache de buscas reais feitas por outros usuários nos
// últimos 7 dias (não é uma cotação "ao vivo" como a Amadeus fazia) e não expõem o
// aeroporto de conexão quando há escalas — apenas a contagem de escalas e a duração total.
// Por isso, ao montar o FlightOffer abaixo, cada trecho (ida/volta) é representado por um
// único segmento "lógico" origem→destino; ver README para mais detalhes dessa limitação.

const BASE_URL = "https://api.travelpayouts.com/aviasales/v3/prices_for_dates";

function buildSegment(
  airlineCode: string,
  flightNumber: string,
  origin: string,
  destination: string,
  departureISO: string,
  durationMinutes: number
): FlightSegment {
  const departure = new Date(departureISO);
  const arrival = new Date(departure.getTime() + durationMinutes * 60000);
  return {
    airlineCode,
    flightNumber: `${airlineCode}${flightNumber}`,
    originCode: origin,
    destinationCode: destination,
    departureTime: departure.toISOString(),
    arrivalTime: arrival.toISOString(),
    durationMinutes,
  };
}

export async function searchTravelpayoutsOffers(params: FlightSearchParams): Promise<FlightOffer[]> {
  const token = process.env.TRAVELPAYOUTS_TOKEN;
  if (!token) throw new Error("TRAVELPAYOUTS_NOT_CONFIGURED");

  const query = new URLSearchParams({
    origin: params.origin,
    destination: params.destination,
    departure_at: params.departDate,
    one_way: params.returnDate ? "false" : "true",
    direct: "false",
    unique: "false",
    sorting: "price",
    currency: "brl",
    limit: "30",
    page: "1",
  });
  if (params.returnDate) query.set("return_at", params.returnDate);

  const res = await fetch(`${BASE_URL}?${query.toString()}`, {
    headers: { "X-Access-Token": token },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`TRAVELPAYOUTS_SEARCH_FAILED_${res.status}`);
  }

  const json = await res.json();
  if (!json.success || !Array.isArray(json.data)) {
    throw new Error("TRAVELPAYOUTS_SEARCH_EMPTY");
  }

  const offers: FlightOffer[] = json.data.map((entry: any, idx: number) => {
    const outboundSegment = buildSegment(
      entry.airline,
      String(entry.flight_number ?? ""),
      entry.origin_airport ?? params.origin,
      entry.destination_airport ?? params.destination,
      entry.departure_at,
      entry.duration_to ?? entry.duration ?? 0
    );

    const outbound: FlightItinerary = {
      segments: [outboundSegment],
      durationMinutes: entry.duration_to ?? entry.duration ?? 0,
      stops: entry.transfers ?? 0,
    };

    let inbound: FlightItinerary | undefined;
    if (params.returnDate && entry.return_at) {
      const inboundSegment = buildSegment(
        entry.airline,
        String(entry.flight_number ?? ""),
        entry.destination_airport ?? params.destination,
        entry.origin_airport ?? params.origin,
        entry.return_at,
        entry.duration_back ?? 0
      );
      inbound = {
        segments: [inboundSegment],
        durationMinutes: entry.duration_back ?? 0,
        stops: entry.return_transfers ?? 0,
      };
    }

    return {
      id: `tp-${idx}-${entry.flight_number ?? idx}-${entry.departure_at}`,
      airlineCode: entry.airline,
      price: Math.round(entry.price),
      currency: "BRL",
      outbound,
      inbound,
      cabinClass: params.cabinClass,
      // A Data API não expõe bagagem incluída; assumimos "não incluída" por padrão
      // (tarifa mais restritiva), o usuário confirma na etapa de compra.
      bagsIncluded: false,
      source: "live",
    };
  });

  return offers;
}
