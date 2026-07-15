import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Passagem Certa — Encontre as melhores promoções de passagens aéreas",
  description:
    "Compare preços de passagens aéreas em tempo real, filtre por escalas, horários e companhias, e encontre a passagem certa para sua viagem.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
