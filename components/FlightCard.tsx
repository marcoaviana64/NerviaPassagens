"use client";

import { useState } from "react";
import { ChevronDown, Clock, Luggage, PlaneTakeoff } from "lucide-react";
import { FlightOffer, FlightItinerary } from "@/lib/types/flight";
import { getAirline } from "@/lib/data/airlines";
import { formatCurrency, formatDuration, formatTime, cn } from "@/lib/utils";

function stopsLabel(stops: number) {
  if (stops === 0) return "Direto";
  if (stops === 1) return "1 parada";
  return `${stops} paradas`;
}

function ItineraryRow({ itinerary, label }: { itinerary: FlightItinerary; label: string }) {
  const first = itinerary.segments[0];
  const last = itinerary.segments[itinerary.segments.length - 1];

  return (
    <div className="flex flex-1 items-center gap-4">
      <div className="text-center">
        <div className="text-lg font-semibold text-slate-900">{formatTime(first.departureTime)}</div>
        <div className="text-xs font-medium text-slate-500">{first.originCode}</div>
      </div>

      <div className="flex-1">
        <div className="mb-1 flex items-center justify-center gap-1 text-xs font-medium text-slate-400">
          <Clock className="h-3 w-3" />
          {formatDuration(itinerary.durationMinutes)}
        </div>
        <div className="relative h-px w-full bg-slate-200">
          <PlaneTakeoff className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-90 text-slate-400" />
        </div>
        <div
          className={cn(
            "mt-1 text-center text-xs font-semibold",
            itinerary.stops === 0 ? "text-accent-600" : "text-slate-500"
          )}
        >
          {stopsLabel(itinerary.stops)}
        </div>
      </div>

      <div className="text-center">
        <div className="text-lg font-semibold text-slate-900">{formatTime(last.arrivalTime)}</div>
        <div className="text-xs font-medium text-slate-500">{last.destinationCode}</div>
      </div>
    </div>
  );
}

export function FlightCard({ offer }: { offer: FlightOffer }) {
  const [open, setOpen] = useState(false);
  const airline = getAirline(offer.airlineCode);

  const googleFlightsUrl = `https://www.google.com/travel/flights?q=Flights%20from%20${offer.outbound.segments[0].originCode}%20to%20${
    offer.outbound.segments[offer.outbound.segments.length - 1].destinationCode
  }%20on%20${offer.outbound.segments[0].departureTime.slice(0, 10)}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition hover:shadow-cardHover animate-fadeIn">
      <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center">
        <div className="flex shrink-0 items-center gap-3 lg:w-44">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold text-white shadow-sm"
            style={{ backgroundColor: airline.color }}
          >
            {airline.code}
          </span>
          <div>
            <div className="text-sm font-semibold text-slate-900">{airline.name}</div>
            {offer.bagsIncluded && (
              <div className="flex items-center gap-1 text-xs text-accent-600">
                <Luggage className="h-3 w-3" /> Bagagem incluída
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <ItineraryRow itinerary={offer.outbound} label="Ida" />
          {offer.inbound && (
            <>
              <div className="h-px bg-slate-100" />
              <ItineraryRow itinerary={offer.inbound} label="Volta" />
            </>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2 lg:w-40">
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(offer.price, offer.currency)}</div>
            <div className="text-xs text-slate-500">por pessoa</div>
          </div>
          <a
            href={googleFlightsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:shadow-md active:scale-[0.98]"
          >
            Comprar
          </a>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex w-full items-center justify-center gap-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Ver detalhes
            <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-4 border-t border-slate-100 bg-slate-50 p-4 sm:p-5 animate-fadeIn">
          {[{ label: "Ida", itinerary: offer.outbound }, ...(offer.inbound ? [{ label: "Volta", itinerary: offer.inbound }] : [])].map(
            ({ label, itinerary }) => (
              <div key={label}>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
                <div className="space-y-2">
                  {itinerary.segments.map((seg, idx) => (
                    <div
                      key={`${seg.flightNumber}-${idx}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-3 text-sm shadow-sm"
                    >
                      <span className="font-medium text-slate-900">
                        {seg.originCode} → {seg.destinationCode}
                      </span>
                      <span className="text-slate-500">
                        {formatTime(seg.departureTime)} – {formatTime(seg.arrivalTime)}
                      </span>
                      <span className="text-slate-500">{formatDuration(seg.durationMinutes)}</span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                        {seg.flightNumber}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
