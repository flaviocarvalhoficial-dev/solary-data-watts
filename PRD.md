# PRD — Watts (v2.1 — Refinado & Operacional)

## 1. Visão Geral
Watts é um sistema de Inteligência Operacional para empresas de energia solar. Ele automatiza a coleta de dados de monitoramento (APsystems, Sungrow, GoodWe) e o cruzamento com faturas de energia (PDF) para gerar relatórios executivos de desempenho auditáveis e precisos dos clientes.

## 2. Proposta de Valor
- **Eliminação de Erro Humano**: Cálculos automáticos de economia e payback.
- **Eficiência em Lote**: Processamento de faturas e geração de relatórios em segundos.
- **Transparência Auditável**: Histórico completo de faturas, geração e auditoria por competência.

## 3. Público-Alvo
- Gestores de frotas de usinas fotovoltaicas.
- Equipes de pós-venda/suceso do cliente em integradores solares.

---

## 4. Funcionalidades Principais (Atualizadas)

### 4.1. Experiência de Onboarding (Primeiro Acesso)
- **Tela de Boas-vindas Premium**: Apresentação dos pilares de valor do produto logo no primeiro acesso.
- **Educação do Usuário**: Explicação clara sobre Monitoramento Live, Auditoria de Faturas e Relatórios Executivos.
- **Engajamento Imediato**: Call-to-action (CTA) direto para o dashboard para reduzir o tempo de valor percebido (Time to Value).
- **Lógica de Persistência**: Uso de localStorage para garantir que a tela seja exibida apenas uma vez por dispositivo.

### 4.2. Dashboard de Frota (Monitoramento "Live")
- **KPIs de Alta Densidade**: Visão em tempo real do Total de Sistemas, Geração do Dia e Sistemas Incompletos.
- **Sistema de Tooltips (Watts Tooltip)**: Informações contextuais em todos os KPIs para facilitar o entendimento de métricas complexas (Geração Reportada, Economia Estimada, Saldo de Créditos, Payback).
  - *Design*: Fundo claro (#FDECEA), texto cinza escuro (#4A4A4A), sem bordas, sem sombras, com indicador visual de direção (seta).
- **Gráficos de Tendência**: Visualização rápida do status da frota (Normal, Alerta, Erro).
- **Lista Spread-Style**: Tabela densa com busca global, filtros por plataforma e status de relatório.

### 4.3. Gestão de Clientes e Competências
- **Visualização 360°**: Detalhe completo do cliente com status operacional sincronizado.
- **Suporte Multi-Competência**: Troca rápida de meses de referência para auditoria histórica.
- **Sincronização Profunda (Deep Sync)**: Integração com APIs oficiais para captura de geração e metadados ECU/Plataforma.

### 4.4. Motor de Relatórios & PDF
- **Preview Executivo**: Visualização em tela cheia do relatório antes da exportação.
- **Branding Customizado**: Suporte a logotipos de parceiros e cores da marca.
- **Exportação em Lote**: Geração assíncrona de PDFs e download em arquivo ZIP.

---

## 5. Arquitetura de Design (VDS - Veselty Design System)
- **Logotipo e Identidade**: Nome "Watts" com tipografia manuscrita irregular (Caveat) para um visual humano e confiável.
- **Estética Flat-First**: Interfaces limpas, sem sombras desnecessárias, priorizando a legibilidade dos dados.
- **Hierarchy of Action**: Uso do Laranja Watts (#E8593C) para ações primárias e estados críticos.
- **Micro-interações**: Transições suaves de mouse (hovers) e estados de carregamento (skeletons e spinners).

## 6. Roadmap Próximas Versões
- Integração com Concessionárias via WebScraping.
- Portal do cliente final (visualização limitada).
- Alertas preditivos de queda de produção via IA.
- Dashboards financeiros comparativos entre usinas.

---

**Última Atualização**: 26 de Março de 2026.
**Status**: MVP Funcional & Operacional.
