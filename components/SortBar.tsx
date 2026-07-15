"use client";

import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortKey = "price" | "duration" | "departure" | "stops";

const OPTIONS: { key: SortKey; label: string }[] = [
  { key: "price", label: "Preço" },
  { key: "duration", label: "Duração" },
  { key: "departure", label: "Horário" },
  { key: "stops", label: "Escalas" },
];

export function SortBar({ value, onChange, resultCount }: { value: SortKey; onChange: (v: SortKey) => void; resultCount: number }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <span className="text-sm font-medium text-slate-600">
        {resultCount} {resultCount === 1 ? "voo encontrado" : "voos encontrados"}
      </span>
      <div className="flex items-center gap-1.5">
        <ArrowUpDown className="mr-1 h-3.5 w-3.5 text-slate-400" />
        {OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition",
              value === opt.key ? "bg-brand-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
