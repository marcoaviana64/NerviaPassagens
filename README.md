# Passagem Certa

Comparador de passagens aéreas inspirado no Google Flights, Skyscanner e Kayak: busque voos,
compare preços entre companhias e filtre por escalas, horários e preço.

## Escopo desta versão

Este é o MVP essencial do produto: **busca de voos + página de resultados** (cards com
companhia, preço, duração, escalas, horários, ordenação e filtros). Recursos como calendário
de menores preços, alertas por e-mail, favoritos, dashboard, login e painel administrativo
fazem parte do roadmap, mas não estão incluídos nesta entrega — a arquitetura (camada de
serviços em `lib/services/`) foi pensada para que esses módulos sejam adicionados depois sem
retrabalho.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Ícones: lucide-react
- Sem backend/banco de dados: a busca é *stateless*, via API Routes do Next.js

## APIs utilizadas

| Dado | Fonte | Precisa de chave? |
|---|---|---|
| Autocomplete de aeroportos | Base local em `lib/data/airports.ts` (dados abertos de aeroportos, principais hubs do Brasil e do mundo) | Não |
| Busca de voos e preços | [Aviasales Data API (Travelpayouts)](https://support.travelpayouts.com/hc/en-us/articles/203956163-Aviasales-Data-API) — gratuita, sem mínimo de tráfego | Sim, opcional |
| Fallback de demonstração | Gerador determinístico em `lib/services/mockFlights.ts` | Não |

Sem token da Travelpayouts configurado, o app usa automaticamente dados de demonstração
realistas (mesmos parâmetros de busca sempre geram os mesmos resultados) — a interface
mostra um aviso amarelo informando isso na página de resultados.

A camada `lib/services/flightSearch.ts` é o único ponto que decide qual provedor usar,
então trocar de fornecedor no futuro significa apenas criar um novo arquivo em
`lib/services/` e apontar essa função para ele.

### Por que Travelpayouts e não Amadeus?

Este projeto originalmente integrava a Amadeus Self-Service API. Em fevereiro de 2026 a
Amadeus anunciou o encerramento desse portal para novos e antigos usuários (registro de
novas contas pausado desde março; chaves existentes desativadas em 17/07/2026), então a
integração foi trocada para a Aviasales Data API. Duas observações importantes sobre essa
fonte:

- Os preços vêm de um **cache de buscas reais de outros usuários** dos últimos 7 dias — não
  é uma cotação instantânea ao vivo como era a Amadeus.
- Quando há escalas, a API retorna a **contagem de escalas e a duração total**, mas não o
  aeroporto de conexão — por isso cada trecho (ida/volta) é exibido como um único segmento
  lógico "origem → destino", em vez do detalhamento voo a voo de cada perna da conexão.

A [Aviasales Flight Search API "tempo real"](https://support.travelpayouts.com/hc/en-us/articles/30565016140434)
(que traria o itinerário completo, com aeroportos de conexão) exige projetos com mais de
50 mil usuários ativos por mês, o que não se aplica aqui. A Kiwi.com Tequila API foi
avaliada como alternativa, mas exige escolher um tipo de parceria e passar por aprovação,
o que não é compatível com o objetivo de "funciona assim que você configura uma chave".

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # opcional — preencha o token da Travelpayouts se tiver
npm run dev
```

Acesse http://localhost:3000

## Build de produção

```bash
npm run build
npm run start
```

## Deploy na Vercel

1. Suba este projeto para um repositório Git (GitHub/GitLab/Bitbucket).
2. Importe o repositório em https://vercel.com/new.
3. Se for usar tarifas reais, adicione `TRAVELPAYOUTS_TOKEN` em Project Settings →
   Environment Variables.
4. Deploy — o Next.js é detectado automaticamente, nenhuma configuração adicional é necessária.

## Estrutura do projeto

```
app/
  page.tsx                 # Home — formulário de busca
  results/page.tsx         # Página de resultados
  api/airports/search/     # Autocomplete de aeroportos
  api/flights/search/      # Busca de voos (Travelpayouts ou demo)
components/
  SearchForm.tsx
  AirportAutocomplete.tsx
  FlightCard.tsx
  SortBar.tsx
  FiltersPanel.tsx
  Skeletons.tsx
  EmptyState.tsx
  Header.tsx
lib/
  data/airports.ts            # Base de aeroportos (aberta, sem chave)
  data/airlines.ts            # Nomes e cores das companhias para os cards
  services/travelpayouts.ts   # Integração real com a Aviasales Data API
  services/mockFlights.ts     # Gerador de dados de demonstração
  services/flightSearch.ts    # Camada de abstração (escolhe Travelpayouts ou demo)
  types/flight.ts
  utils.ts
```

## Próximos passos sugeridos

- Calendário de menores preços e gráfico de tendência histórica
- Alertas de preço por e-mail/push
- Favoritos e dashboard (exigiria autenticação + banco de dados, ex.: Prisma + PostgreSQL/Supabase)
- Painel administrativo
- Conversão de moeda (ExchangeRate API) para buscas internacionais
- Deep link de compra direto na Aviasales (hoje o botão "Comprar" abre o Google Flights)
