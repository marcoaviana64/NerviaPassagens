"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, CalendarDays, Users, Search, PlaneTakeoff, PlaneLanding } from "lucide-react";
import { AirportAutocomplete } from "@/components/AirportAutocomplete";
import { Airport } from "@/lib/data/airports";
import { cn } from "@/lib/utils";

const CABIN_OPTIONS: { value: string; label: string }[] = [
  { value: "ECONOMY", label: "Econômica" },
  { value: "PREMIUM_ECONOMY", label: "Econômica Premium" },
  { value: "BUSINESS", label: "Executiva" },
  { value: "FIRST", label: "Primeira Classe" },
];

function todayISO(offsetDays = 7) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function SearchForm() {
  const router = useRouter();
  const [origin, setOrigin] = useState<Airport | null>(null);
  const [destination, setDestination] = useState<Airport | null>(null);
  const [tripType, setTripType] = useState<"roundtrip" | "oneway">("roundtrip");
  const [departDate, setDepartDate] = useState(todayISO(7));
  const [returnDate, setReturnDate] = useState(todayISO(14));
  const [adults, setAdults] = useState(1);
  const [cabinClass, setCabinClass] = useState("ECONOMY");
  const [error, setError] = useState<string | null>(null);

  function swap() {
    setOrigin(destination);
    setDestination(origin);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!origin || !destination) {
      setError("Escolha origem e destino para continuar.");
      return;
    }
    if (origin.code === destination.code) {
      setError("Origem e destino não podem ser iguais.");
      return;
    }
    setError(null);

    const params = new URLSearchParams({
      origin: origin.code,
      destination: destination.code,
      departDate,
      adults: String(adults),
      cabinClass,
    });
    if (tripType === "roundtrip") params.set("returnDate", returnDate);

    router.push(`/results?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-cardHover sm:p-6"
    >
      <div className="mb-4 flex gap-2">
        {(["roundtrip", "oneway"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setTripType(type)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition",
              tripType === type
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {type === "roundtrip" ? "Ida e volta" : "Somente ida"}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
          <AirportAutocomplete
            label="Origem"
            placeholder="De onde você parte?"
            value={origin}
            onChange={setOrigin}
            icon={<PlaneTakeoff className="h-4 w-4 shrink-0 text-brand-500" />}
          />
          <button
            type="button"
            onClick={swap}
            aria-label="Trocar origem e destino"
            className="mx-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:rotate-180 hover:text-brand-600 sm:mb-2.5"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
          <AirportAutocomplete
            label="Destino"
            placeholder="Para onde você vai?"
            value={destination}
            onChange={setDestination}
            icon={<PlaneLanding className="h-4 w-4 shrink-0 text-accent-600" />}
          />
        </div>

        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Ida
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
              <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                type="date"
                value={departDate}
                min={todayISO(0)}
                onChange={(e) => setDepartDate(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-slate-900 focus:outline-none"
                required
              />
            </div>
          </div>

          {tripType === "roundtrip" && (
            <div className="flex-1">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Volta
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
                <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="date"
                  value={returnDate}
                  min={departDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-slate-900 focus:outline-none"
                  required
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Passageiros
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
              <Users className="h-4 w-4 shrink-0 text-slate-400" />
              <button
                type="button"
                onClick={() => setAdults((a) => Math.max(1, a - 1))}
                className="h-5 w-5 shrink-0 rounded-full bg-slate-100 text-sm font-semibold text-slate-600 hover:bg-slate-200"
              >
                −
              </button>
              <span className="w-5 text-center text-sm font-medium">{adults}</span>
              <button
                type="button"
                onClick={() => setAdults((a) => Math.min(9, a + 1))}
                className="h-5 w-5 shrink-0 rounded-full bg-slate-100 text-sm font-semibold text-slate-600 hover:bg-slate-200"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex-1">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Classe
            </label>
            <select
              value={cabinClass}
              onChange={(e) => setCabinClass(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              {CABIN_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="flex h-[46px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-6 text-sm font-semibold text-white shadow-card transition hover:shadow-cardHover active:scale-[0.98] lg:mb-0"
        >
          <Search className="h-4 w-4" />
          Procurar
        </button>
      </div>

      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
    </form>
  );
}
