export interface Airline {
  code: string;
  name: string;
  color: string; // usado para o "logo" em texto (avatar colorido) do card
}

export const AIRLINES: Record<string, Airline> = {
  LA: { code: "LA", name: "LATAM Airlines", color: "#0F2C59" },
  G3: { code: "G3", name: "GOL Linhas Aéreas", color: "#FF6600" },
  AD: { code: "AD", name: "Azul Linhas Aéreas", color: "#0072CE" },
  AA: { code: "AA", name: "American Airlines", color: "#C41E3A" },
  UA: { code: "UA", name: "United Airlines", color: "#005DAA" },
  DL: { code: "DL", name: "Delta Air Lines", color: "#003366" },
  AF: { code: "AF", name: "Air France", color: "#002157" },
  LH: { code: "LH", name: "Lufthansa", color: "#05164D" },
  IB: { code: "IB", name: "Iberia", color: "#D8262F" },
  TP: { code: "TP", name: "TAP Air Portugal", color: "#E4032E" },
  BA: { code: "BA", name: "British Airways", color: "#075AAA" },
  KL: { code: "KL", name: "KLM", color: "#00A1DE" },
  CM: { code: "CM", name: "Copa Airlines", color: "#003876" },
  AV: { code: "AV", name: "Avianca", color: "#E4022A" },
  AZ: { code: "AZ", name: "ITA Airways", color: "#008C45" },
  EK: { code: "EK", name: "Emirates", color: "#C8102E" },
  QR: { code: "QR", name: "Qatar Airways", color: "#5C0632" },
  EY: { code: "EY", name: "Etihad Airways", color: "#BD8B13" },
  TK: { code: "TK", name: "Turkish Airlines", color: "#C70A0C" },
  AC: { code: "AC", name: "Air Canada", color: "#D22730" },
};

export function getAirline(code: string): Airline {
  return AIRLINES[code] ?? { code, name: code, color: "#475569" };
}
