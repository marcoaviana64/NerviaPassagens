"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { Header } from "@/components/Header";
import { FlightCard } from "@/components/FlightCard";
import { SortBar, SortKey } from "@/components/SortBar";
import { FiltersPanel, Filters } from "@/components/FiltersPanel";
import { FlightCardSkeleton, FiltersSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";
import { FlightOffer } from "@/lib/types/flight";
import { formatDateLabel } from "@/lib/utils";

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const origin = searchParams.get("origin") ?? "";
  const destination = searchParams.get("destination") ?? "";
  const departDate = searchParams.get("departDate") ?? "";
  const returnDate = searchParams.get("returnDate") ?? undefined;
  const adults = searchParams.get("adults") ?? "1";
  const cabinClass = searchParams.get("cabinClass") ?? "ECONOMY";

  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"live" | "demo" | null>(null);
  const [sort, setSort] = useState<SortKey>("price");
  const [filters, setFilters] = useState<Filters | null>(null);

  useEffect(() => {
    if (!origin || !destination || !departDate) return;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ origin, destination, departDate, adults, cabinClass });
    if (returnDate) params.set("returnDate", returnDate);

    fetch(`/api/flights/search?${params.toString()}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Falha na busca");
        return res.json();
      })
      .then((data) => {
        setOffers(data.offers ?? []);
        setSource(data.source ?? null);
        if (data.offers?.length) {
          const prices = data.offers.map((o: FlightOffer) => o.price);
          setFilters({
            maxPrice: Math.max(...prices),
            directOnly: false,
            maxStops: 2,
            airlines: Array.from(new Set(data.offers.map((o: FlightOffer) => o.airlineCode))),
          });
        }
      })
      .catch(() => setError("Não foi possível buscar voos agora. Tente novamente em instantes."))
      .finally(() => setLoading(false));
  }, [origin, destination, departDate, returnDate, adults, cabinClass]);

  const priceRange = useMemo(() => {
    if (offers.length === 0) return { min: 0, max: 1000 };
    const prices = offers.map((o) => o.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [offers]);

  const availableAirlines = useMemo(
    () => Array.from(new Set(offers.map((o) => o.airlineCode))),
    [offers]
  );

  const filteredSorted = useMemo(() => {
    if (!filters) return [];
    let list = offers.filter((o) => {
      if (o.price > filters.maxPrice) return false;
      if (o.outbound.stops > filters.maxStops) return false;
      if (filters.airlines.length > 0 && !filters.airlines.includes(o.airlineCode)) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price":
          return a.price - b.price;
        case "duration":
          return a.outbound.durationMinutes - b.outbound.durationMinutes;
        case "departure":
          return (
            new Date(a.outbound.segments[0].departureTime).getTime() -
            new Date(b.outbound.segments[0].departureTime).getTime()
          );
        case "stops":
          return a.outbound.stops - b.outbound.stops;
        default:
          return 0;
      }
    });

    return list;
  }, [offers, filters, sort]);

  if (!origin || !destination || !departDate) {
    return (
      <EmptyState
        message="Parâmetros de busca inválidos ou ausentes."
        action={
          <button
            onClick={() => router.push("/")}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Voltar para a busca
          </button>
        }
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <Header />

      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <button
          onClick={() => router.push("/")}
          className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Nova busca
        </button>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-5">
          <div>
            <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
              {origin} → {destination}
            </h1>
            <p className="text-sm text-slate-500">
              {formatDateLabel(`${departDate}T00:00:00`)}
              {returnDate ? ` – ${formatDateLabel(`${returnDate}T00:00:00`)}` : ""} · {adults}{" "}
              {Number(adults) === 1 ? "passageiro" : "passageiros"}
            </p>
          </div>
        </div>

        {source === "demo" && !loading && (
          <div className="mb-6 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            Exibindo dados de demonstração porque nenhum token de API de voos (Travelpayouts) está configurado.
            Configure <code className="font-mono text-xs">TRAVELPAYOUTS_TOKEN</code> no{" "}
            <code className="font-mono text-xs">.env.local</code> para ver tarifas reais (dados de cache da Aviasales,
            atualizados nos últimos 7 dias).
          </div>
        )}

        {error && <EmptyState message={error} />}

        {!error && (
          <div className="flex flex-col gap-6 lg:flex-row">
            {loading || !filters ? <FiltersSkeleton /> : (
              <FiltersPanel filters={filters} onChange={setFilters} priceRange={priceRange} availableAirlines={availableAirlines} />
            )}

            <div className="flex-1 space-y-4">
              {!loading && filters && <SortBar value={sort} onChange={setSort} resultCount={filteredSorted.length} />}

              {loading &&
                Array.from({ length: 6 }).map((_, i) => <FlightCardSkeleton key={i} />)}

              {!loading && filteredSorted.length === 0 && (
                <EmptyState message="Nenhum voo encontrado com os filtros atuais. Tente ajustar o preço máximo ou as escalas." />
              )}

              {!loading && filteredSorted.map((offer) => <FlightCard key={offer.id} offer={offer} />)}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-400">Carregando…</div>}>
      <ResultsContent />
    </Suspense>
  );
}
