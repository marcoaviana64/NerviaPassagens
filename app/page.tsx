import { Header } from "@/components/Header";
import { SearchForm } from "@/components/SearchForm";
import { BadgeCheck, TrendingDown, ShieldCheck, Zap } from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: TrendingDown,
    title: "Compare preços de verdade",
    description: "Veja tarifas de várias companhias lado a lado e ordene pelo que importa para você.",
  },
  {
    icon: Zap,
    title: "Resultados rápidos",
    description: "Filtros instantâneos por escalas, horário, preço máximo e companhia aérea.",
  },
  {
    icon: ShieldCheck,
    title: "Sem cadastro necessário",
    description: "Busque e compare passagens sem precisar criar conta.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-white">
      <Header />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-accent-100 blur-3xl" />
        <div className="pointer-events-none absolute -top-10 left-0 h-72 w-72 rounded-full bg-brand-100 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
          <div className="mb-10 text-center">
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm ring-1 ring-brand-100">
              <BadgeCheck className="h-3.5 w-3.5" />
              Encontre a passagem certa, sem enrolação
            </span>
            <h1 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Compare e encontre as{" "}
              <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
                melhores passagens aéreas
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
              Busque voos, compare preços entre companhias e escolha com confiança.
            </p>
          </div>

          <SearchForm />

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {HIGHLIGHTS.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:shadow-cardHover"
              >
                <item.icon className="mb-3 h-6 w-6 text-brand-600" />
                <h3 className="mb-1 font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-500 sm:px-6">
          Passagem Certa — comparador de passagens aéreas. Preços exibidos podem incluir dados de demonstração
          quando nenhuma API de voos estiver configurada.
        </div>
      </footer>
    </main>
  );
}
