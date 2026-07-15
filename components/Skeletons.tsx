export function FlightCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3 lg:w-44">
          <div className="skeleton h-10 w-10 rounded-xl" />
          <div className="skeleton h-4 w-24 rounded" />
        </div>
        <div className="flex flex-1 items-center gap-4">
          <div className="skeleton h-6 w-12 rounded" />
          <div className="skeleton h-px flex-1 rounded" />
          <div className="skeleton h-6 w-12 rounded" />
        </div>
        <div className="flex flex-col items-end gap-2 lg:w-40">
          <div className="skeleton h-7 w-20 rounded" />
          <div className="skeleton h-9 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function FiltersSkeleton() {
  return (
    <div className="w-full space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card lg:w-64">
      <div className="skeleton h-4 w-20 rounded" />
      <div className="skeleton h-8 w-full rounded" />
      <div className="skeleton h-4 w-16 rounded" />
      <div className="skeleton h-8 w-full rounded" />
    </div>
  );
}
