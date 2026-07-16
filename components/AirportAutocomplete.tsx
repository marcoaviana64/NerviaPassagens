"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Airport } from "@/lib/data/airports";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  placeholder: string;
  value: Airport | null;
  onChange: (airport: Airport | null) => void;
  icon?: React.ReactNode;
}

export function AirportAutocomplete({ label, placeholder, value, onChange, icon }: Props) {
  const [query, setQuery] = useState(value ? `${value.city} (${value.code})` : "");
  const [results, setResults] = useState<Airport[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/airports/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setResults(data.airports ?? []);
      } catch {
        // ignore aborted requests
      } finally {
        setLoading(false);
      }
    }, 150);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectAirport(airport: Airport) {
    onChange(airport);
    setQuery(`${airport.city} (${airport.code})`);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative flex-1">
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
        {icon ?? <MapPin className="h-4 w-4 shrink-0 text-slate-400" />}
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (value) onChange(null);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
        {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-300" />}
      </div>

      {open && (
        <div className="absolute z-40 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-cardHover animate-fadeIn">
          {results.length === 0 && !loading && (
            <div className="px-4 py-3 text-sm text-slate-400">Nenhum aeroporto encontrado</div>
          )}
          {results.map((airport) => (
            <button
              key={airport.code}
              type="button"
              onClick={() => selectAirport(airport)}
              className={cn(
                "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-brand-50",
                value?.code === airport.code && "bg-brand-50"
              )}
            >
              <span>
                <span className="block font-medium text-slate-900">
                  {airport.city}
                  {airport.region ? `, ${airport.region}` : ""}, {airport.country}
                </span>
                <span className="block text-xs text-slate-500">{airport.name}</span>
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                {airport.code}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
