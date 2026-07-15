import { FlightSearchParams, FlightSearchResult } from "@/lib/types/flight";
import { searchTravelpayoutsOffers } from "@/lib/services/travelpayouts";
import { generateMockOffers } from "@/lib/services/mockFlights";

// Camada de abstração do provedor de voos: tenta a Aviasales Data API (Travelpayouts,
// gratuita) quando há um token configurado; caso contrário, ou em caso de falha, usa
// dados de demonstração para que a experiência de busca nunca quebre. Trocar de provedor
// no futuro significa apenas adicionar um novo arquivo em lib/services/ e chamá-lo aqui.
export async function searchFlights(params: FlightSearchParams): Promise<FlightSearchResult> {
  const hasTravelpayoutsToken = Boolean(process.env.TRAVELPAYOUTS_TOKEN);

  if (hasTravelpayoutsToken) {
    try {
      const offers = await searchTravelpayoutsOffers(params);
      if (offers.length > 0) {
        return { offers, source: "live", currency: offers[0].currency };
      }
    } catch (err) {
      console.error("[flightSearch] Travelpayouts falhou, usando dados de demonstração:", err);
    }
  }

  const offers = generateMockOffers(params);
  return { offers, source: "demo", currency: "BRL" };
}
