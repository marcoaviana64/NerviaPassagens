"use client";

import { SlidersHorizontal } from "lucide-react";
import { getAirline } from "@/lib/data/airlines";
import { formatCurrency, cn } from "@/lib/utils";

export interface Filters {
  maxPrice: number;
  directOnly: boolean;
  maxStops: number;
  airlines: string[];
}

export function FiltersPanel({
  filters,
  onChange,
  priceRange,
  availableAirlines,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  priceRange: { min: number; max: number };
  availableAirlines: string[];
}) {
  function toggleAirline(code: string) {
    const set = new Set(filters.airlines);
    if (set.has(code)) set.delete(code);
    else set.add(code);
    onChange({ ...filters, airlines: Array.from(set) });
  }

  return (
    <aside className="h-fit w-full shrink-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-card lg:w-64">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
        <SlidersHorizontal className="h-4 w-4 text-brand-600" />
        Filtros
      </div>

      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span>Preço máximo</span>
          <span className="text-slate-700">{formatCurrency(filters.maxPrice)}</span>
        </div>
        <input
          type="range"
          min={priceRange.min}
          max={priceRange.max}
          step={10}
          value={filters.maxPrice}
          onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          className="w-full accent-brand-600"
        />
      </div>

      <div className="mb-5">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Escalas</div>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={filters.directOnly}
              onChange={(e) => onChange({ ...filters, directOnly: e.target.checked, maxStops: e.target.checked ? 0 : 2 })}
              className="h-4 w-4 rounded accent-brand-600"
            />
            Somente voos diretos
          </label>
          {!filters.directOnly && (
            <div className="flex gap-2">
              {[0, 1, 2].map((n) => (
                <button
                  key={n}
                  onClick={() => onChange({ ...filters, maxStops: n })}
                  className={cn(
                    "flex-1 rounded-lg py-1.5 text-xs font-semibold transition",
                    filters.maxStops === n ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {n === 0 ? "Direto" : `Até ${n}`}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Companhias</div>
        <div className="flex flex-col gap-2">
          {availableAirlines.map((code) => {
            const airline = getAirline(code);
            const checked = filters.airlines.includes(code);
            return (
              <label key={code} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAirline(code)}
                  className="h-4 w-4 rounded accent-brand-600"
                />
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: airline.color }}
                />
                {airline.name}
              </label>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
