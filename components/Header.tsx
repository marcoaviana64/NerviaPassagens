import { Plane } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 text-white shadow-card">
            <Plane className="h-5 w-5 -rotate-45" strokeWidth={2.4} />
          </span>
          <span className="text-lg tracking-tight">
            Passagem <span className="text-brand-600">Certa</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 sm:flex">
          <Link href="/" className="transition hover:text-brand-600">
            Buscar voos
          </Link>
          <a
            href="#como-funciona"
            className="transition hover:text-brand-600"
          >
            Como funciona
          </a>
        </nav>
      </div>
    </header>
  );
}
