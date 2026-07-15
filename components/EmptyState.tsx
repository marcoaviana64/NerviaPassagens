import { SearchX } from "lucide-react";

export function EmptyState({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center">
      <SearchX className="mb-4 h-10 w-10 text-slate-300" />
      <p className="mb-4 max-w-sm text-sm font-medium text-slate-500">{message}</p>
      {action}
    </div>
  );
}
