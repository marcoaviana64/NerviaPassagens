export type CabinClass = "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departDate: string; // YYYY-MM-DD
  returnDate?: string; // YYYY-MM-DD
  adults: number;
  cabinClass: CabinClass;
}

export interface FlightSegment {
  airlineCode: string;
  flightNumber: string;
  originCode: string;
  destinationCode: string;
  departureTime: string; // ISO
  arrivalTime: string; // ISO
  durationMinutes: number;
}

export interface FlightItinerary {
  segments: FlightSegment[];
  durationMinutes: number;
  stops: number;
}

export interface FlightOffer {
  id: string;
  airlineCode: string;
  price: number;
  currency: string;
  outbound: FlightItinerary;
  inbound?: FlightItinerary;
  cabinClass: CabinClass;
  bagsIncluded: boolean;
  source: "live" | "demo";
}

export interface FlightSearchResult {
  offers: FlightOffer[];
  source: "live" | "demo";
  currency: string;
}
