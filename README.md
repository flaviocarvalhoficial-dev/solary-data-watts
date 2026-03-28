# Watts — Inteligência Operacional para Energia Solar

![Watts Mascot](/mascote-watts/saudando.svg)

Watts (anteriormente Solary Data) é um ecossistema de inteligência operacional projetado para automatizar o monitoramento de usinas fotovoltaicas e a auditoria de faturas de energia. O sistema elimina erros humanos, ganha escala no processamento de faturas (PDF) e gera relatórios executivos precisos para gestores de frota.

## 🚀 Funcionalidades Principais

- **Dashboard de Frota "Live"**: Visão consolidada de todos os sistemas, com status de geração em tempo real e KPIs de alta densidade.
- **Auditoria de Faturas (OCR)**: Processamento automático de PDFs da Equatorial Pará para extração de consumo, injeção e créditos.
- **Sincronização APsystems**: Integração profunda com a API APsystems para coleta de metadados e geração histórica.
- **Motor de Relatórios Executivos**: Geração automática de PDFs profissionais com cálculos de ROI, Payback dinâmico e economia real.
- **Gestão de Créditos GD2**: Monitoramento de saldos acumulados e explicações automáticas sobre a composição tarifária.

## 🛠️ Stack Tecnológica

- **Frontend**: Vite + React + TypeScript
- **Backend/Banco**: Supabase (PostgreSQL)
- **Documentação**: Edge Functions (Deno/Supabase Functions)
- **PDF/UI**: jsPDF + html2canvas + Lucide Icons
- **Design System**: Veselty Design System (VDS) — Estética Flat-First & Premium

## 📦 Início Rápido

### Pré-requisitos
- Node.js (v18+)
- Conta no Supabase

### Instalação
```bash
# Clone o repositório
git clone https://github.com/flaviocarvalhoficial-dev/solary-data-watts.git

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

### Configuração
O projeto está configurado para usar o Supabase. Verifique os identificadores de projeto no arquivo `src/lib/supabase.ts`.

## 📂 Estrutura do Projeto

- `src/components`: Componentes modulares da interface.
- `src/hooks`: Lógica de estado e integração com Supabase.
- `src/services`: Wrappers de API (APsystems, etc).
- `src/utils`: Motor de cálculo solar e auxílios de formatação.
- `supabase/functions`: Edge functions para proxies de API externos.

## 🤝 Contribuição
Para novos desenvolvedores ou IAs: Consulte o arquivo [ARCHITECTURE.md](./ARCHITECTURE.md) para detalhes técnicos sobre o esquema do banco de dados e fluxos de dados.

---
**Watts** — Transformando dados de energia em inteligência e lucro.
