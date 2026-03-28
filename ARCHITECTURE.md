# Arquitetura Técnica — Watts

Este documento detalha as decisões arquiteturais e o funcionamento interno do sistema Watts.

## 🏗️ Visão Geral da Arquitetura

O Watts utiliza uma arquitetura baseada em **Supabase (Backend-as-a-Service)** com um frontend **React (Vite/TypeScript)**. A lógica pesada de integração externa é tratada via **Edge Functions**.

---

## 🗄️ Esquema do Banco de Dados (Supabase)

O banco de dados PostgreSQL no Supabase contém as seguintes tabelas críticas:

- **`profiles`**: Dados estendidos dos usuários integrados com Auth.
- **`clients`**: Cadastro mestre de clientes (UC, Plataforma, ID do Sistema, Investimento).
- **`systems`**: Cache de metadados das usinas solares sincronizados via API.
- **`bills`**: Auditoria de faturas (consumo, injeção, créditos, valor total).
- **`apsystems_monthly_quota`**: Controle de rate limit para a API externa (limite de 1.000).
- **`apsystems_api_logs`**: Auditoria completa de todas as chamadas feitas para o monitoramento.
- **`fleet_history`**: Snapshots diários da saúde e geração da frota para gráficos históricos.

---

## ⚡ Edge Functions (Proxies & Cache)

Localizadas em `/supabase/functions`, as Edge Functions atuam como uma camada de segurança e controle:

1. **`aps-proxy-deep-sync`**: Gerencia a comunicação HMAC-SHA256 com a APsystems.
   - Aplica quota mensal.
   - Normaliza os dados da API para o frontend.
   - Otimiza o número de chamadas (ex: pulando meter summaries desnecessários).

---

## ⚛️ Arquitetura Frontend

O frontend segue um padrão de **Single Source of Truth** centralizado na camada de Hooks.

### 1. Camada de Hooks (Data Fetching & Logic)
- **`useEnrichedClients`**: O hook mais crítico. Ele cruza os dados das tabelas `clients`, `systems` e `bills` (competência selecionada) para gerar um objeto unificado pronto para exibir no UI.
- **`useBillUpload`**: Gerencia a orquestração do upload de PDF, parsing OCR e vinculação automática por UC.
- **`useSolarSync`**: Orquestra a sincronização em lote de múltiplos sistemas com as APIs solares.

### 2. Motor de Cálculo (`solarHelpers.ts`)
Toda a lógica financeira do projeto (ROI, Payback, Economia GD2) está centralizada neste arquivo para garantir consistência entre o Dashboard e o Relatório Executivo (PDF).

### 3. Design System (VDS)
Definido em `src/index.css`, utiliza variáveis CSS (:root) para tokens de cores, espaçamento e tipografia:
- **Cor Primária**: `#E8593C` (Laranja Watts)
- **Estética**: Flat-First (sem sombras ou gradientes excessivos).
- **Tipografia**: Inter (UI) e Caveat (Logo/Mascote).

---

## 📄 Processamento de Faturas (OCR)

O sistema utiliza `pdfjs-dist` para leitura de texto em nível de cliente. A extração é baseada em **Regex Semântico**, priorizando blocos estruturais da fatura da Equatorial Pará.

- **Vínculo**: Uma fatura é vinculada automaticamente a um cliente se a Unidade Consumidora (UC) extraída corresponder à UC cadastrada.

---

## 🚀 Deployment & CI/CD

- **Frontend**: Hospedado via Vercel ou similar (Vite Build).
- **Backend/Funções**: Deploy via Supabase CLI.
  ```bash
  supabase functions deploy aps-proxy-deep-sync
  ```
