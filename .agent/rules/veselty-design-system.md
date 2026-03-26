# Design System: Veselty Inc.

**Extraído de:** Screenshot — Dashboard principal (web app)
**Data:** 2026-03-25
**Versão:** 1.0

> ⚠️ Este documento é a fonte de verdade visual do produto. Toda nova seção deve respeitar estas regras antes de introduzir qualquer variação.

---

## 1. Tokens de Cor

### 1.1 Paleta Base

| Token | Hex | Uso semântico |
|-------|-----|---------------|
| `color-bg-base` | `#F5F5F0` | Fundo global da página (cinza-off-white levemente quente) [estimado] |
| `color-bg-surface` | `#FFFFFF` | Superfície de cards, sidebar, painéis elevados |
| `color-bg-sidebar` | `#FFFFFF` | Background do painel de navegação lateral |
| `color-primary` | `#E8593C` | Acento principal — CTAs, highlights, ícone de logo, badges ativos |
| `color-primary-light` | `#F5C4B0` | Fill de áreas de gráfico, heatmap bars, fundo de pills secundárias [estimado] |
| `color-primary-muted` | `#FAE8E2` | Background de elementos pill selecionados em estado secundário [estimado] |
| `color-text-primary` | `#1A1A1A` | Texto principal — títulos, valores numéricos grandes |
| `color-text-secondary` | `#6B6B6B` | Labels de seção, subtítulos, texto de suporte [estimado] |
| `color-text-muted` | `#A0A0A0` | Texto terciário — eixos de gráfico, metadados, placeholders [estimado] |
| `color-text-link` | `#E8593C` | "See Details", "See All" — links de ação inline |
| `color-border-subtle` | `#EBEBEB` | Bordas de cards, separadores entre colunas da tabela [estimado] |
| `color-badge-success-bg` | `#E6F4EA` | Background de badge "In Stock" |
| `color-badge-success-text` | `#1E7E34` | Texto de badge "In Stock" |
| `color-badge-danger-bg` | `#FDECEA` | Background de badge "Out of stock" |
| `color-badge-danger-text` | `#C0392B` | Texto de badge "Out of stock" |
| `color-trend-up` | `#2ECC71` | Delta positivo — "+12%", "+7%" [estimado] |
| `color-trend-down` | `#E74C3C` | Delta negativo — "-4.5430" |
| `color-chart-fill` | `#F5C4B0` | Área de preenchimento do gráfico de área (coral claro) |
| `color-chart-line` | `#E8593C` | Linha principal do gráfico, tooltip pill |
| `color-chart-avg` | `#F5C4B0` | Linha de média (coral mais suave, tracejada) |
| `color-btn-dark-bg` | `#1A1A1A` | Background do botão "+ Add Widget" |
| `color-btn-dark-text` | `#FFFFFF` | Texto do botão "+ Add Widget" |

### 1.2 Regras de Uso

- **`color-primary` (#E8593C)** é o coral-laranja da marca. Aparece exclusivamente em: CTA principal (Export), logo mark, nav item ativo, tooltip do gráfico, pill de categoria selecionada, badges de tendência, links "See Details". **NUNCA** usar como fundo de superfícies grandes ou texto corrido.
- **`color-bg-base`** define o espaço negativo entre cards. Jamais usar branco puro `#FFFFFF` como fundo da página — o contraste entre a base e os cards cria a hierarquia de elevação.
- **`color-text-primary`** é reservado para valores numéricos de destaque (KPIs) e títulos de seção H1. Texto de suporte usa obrigatoriamente `color-text-secondary` ou `color-text-muted`.
- **Badges** de status (In Stock / Out of stock) sempre combinam `bg` + `text` do mesmo ramp semântico — nunca misturar success-bg com danger-text.
- **Tendências** positivas usam verde (`color-trend-up`), negativas usam vermelho (`color-trend-down`). O sinal "+" ou "↑" precede sempre o valor.

---

## 2. Tipografia

### 2.1 Escala

| Token | Tamanho | Peso | Uso |
|-------|---------|------|-----|
| `text-kpi` | ~28–32px | 500–600 | Valores monetários e métricas principais ($43,630 / 17.9%) |
| `text-headline` | ~18–20px | 500 | Títulos de seção ("Dashboard", "Analytics") |
| `text-title-card` | ~13–14px | 500 | Títulos de card ("Product overview", "Active sales") |
| `text-body` | ~13px | 400 | Corpo de texto, labels de navegação |
| `text-label` | ~11–12px | 400 | Labels de eixo de gráfico, metadados ("Total sales", "vs last month") |
| `text-badge` | ~11px | 500 | Texto dentro de badges e pills |
| `text-nav-section` | ~10–11px | 500 | Labels de grupo na sidebar ("MAIN MENU", "OTHER", "ACCOUNT") — uppercase |

### 2.2 Fonte

**Candidatas prováveis [estimado]:**
1. **Inter** — geometria neutra, pesos bem espaçados, muito usada em SaaS dashboards; alto grau de correspondência com os pesos e espaçamento observados
2. **DM Sans** — alternativa com letterforms ligeiramente mais arredondadas, compatível com o tom do produto
3. **Plus Jakarta Sans** — segunda candidata por compartilhar a mesma densidade e espaçamento de tracking

A fonte não apresenta serifas, tem tracking neutro, e os algarismos são tabular (alinhamento colunar nos valores monetários).

### 2.3 Regras

- Labels de seção da sidebar (`MAIN MENU`, `OTHER`, `ACCOUNT`) são **sempre em uppercase**, peso 500, tamanho ~10px, cor `color-text-muted`
- Valores KPI são sempre **monoespaçados numericamente** para manter alinhamento em atualizações em tempo real
- Hierarquia de texto em cards: título (500) → valor KPI (600) → label de suporte (400, muted) → link de ação (400, `color-primary`)
- Texto de badges/pills nunca usa peso abaixo de 500
- Nunca usar `text-kpi` fora do contexto de métrica principal de um card

---

## 3. Espaçamento e Grid

### 3.1 Escala

| Token | Valor | Uso típico |
|-------|-------|-----------|
| `space-1` | 4px | Gap mínimo entre ícone e label inline |
| `space-2` | 8px | Padding interno de badges, gap entre trend badge e label |
| `space-3` | 12px | Padding interno de itens de nav, gap entre elementos de card |
| `space-4` | 16px | Padding interno de cards (horizontal), gap entre pills |
| `space-5` | 20px | Padding vertical de cards |
| `space-6` | 24px | Gap entre cards no grid principal |
| `space-8` | 32px | Margem entre seções do dashboard |
| `space-sidebar` | 16px | Padding interno da sidebar (lateral) |

### 3.2 Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `radius-sm` | 6px | Badges, pills de categoria, trend indicators |
| `radius-md` | 10px | Cards de KPI e painéis de conteúdo |
| `radius-lg` | 14px | Cards maiores (Analytics, Sales Performance) [estimado] |
| `radius-full` | 999px | Pills de filtro ("This month", "This year"), avatars de usuário |
| `radius-btn` | 8px | Botões primários (Export, Add Widget) |

### 3.3 Estrutura de Layout

```css
/* Layout raiz — sidebar fixa + área de conteúdo */
.app-layout {
  display: grid;
  grid-template-columns: 190px 1fr;
  height: 100vh;
  background: #F5F5F0; /* color-bg-base */
}

/* Sidebar */
.sidebar {
  width: 190px;
  background: #FFFFFF;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-right: 1px solid #EBEBEB;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
}

/* Área de conteúdo principal */
.content-area {
  margin-left: 190px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Topbar */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 56px;
  background: #FFFFFF;
  border-bottom: 1px solid #EBEBEB;
  position: sticky;
  top: 0;
  z-index: 10;
}

/* Grid de KPI cards (linha 1: 3 colunas) */
.kpi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}

/* Grid de gráficos (linha 2: 2 colunas, proporção 60/40) */
.chart-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 16px;
}

/* Grid de bottom row (linha 3: 2 colunas, 50/50) */
.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* Card base */
.card {
  background: #FFFFFF;
  border: 1px solid #EBEBEB;
  border-radius: 10px;
  padding: 20px;
}
```

---

## 4. Elevação

O sistema de elevação da Veselty **não usa sombras** (box-shadow). A profundidade é criada exclusivamente por:

1. **Contraste de superfície:** cards brancos (`#FFFFFF`) sobre fundo off-white (`#F5F5F0`) — diferença perceptível sem sombra
2. **Bordas sutis:** `1px solid #EBEBEB` delimita todas as superfícies sem adicionar peso visual
3. **Sidebar branca sobre fundo:** mesma lógica — separação por `border-right` 1px, sem shadow

**Decisão de design:** A ausência de sombras cria uma estética flat e limpa, adequada a dashboards com alta densidade de informação — sombras adicionariam ruído visual em um contexto onde os dados são o foco principal.

**Exceção observada:** O tooltip do gráfico (pill coral com "+19%") pode ter uma sombra sutil [estimado: `box-shadow: 0 2px 8px rgba(0,0,0,0.12)`] para destacar sobre o gráfico — único elemento com possível elevação por sombra.

---

## 5. Anatomia dos Componentes

### C1 — Botão Primário (Export)

```
[ ↑ Export ]
╔══════════════╗
║  icon  label ║
╚══════════════╝

Background:     #E8593C (color-primary)
Texto:          #FFFFFF, 13px, peso 500
Padding:        8px 16px
Border-radius:  8px (radius-btn)
Ícone:          16px, posição left, gap 6px
Estado hover:   background ligeiramente escurecido (~#D44E33) [estimado]
Regra:          Único CTA coral por viewport — não duplicar
```

### C2 — Botão Escuro (Add Widget)

```
[ + Add Widget ]
╔══════════════════╗
║  icon  label     ║
╚══════════════════╝

Background:     #1A1A1A (color-btn-dark-bg)
Texto:          #FFFFFF, 13px, peso 500
Padding:        8px 16px
Border-radius:  8px
Ícone:          "+" prefixo, 14px
Regra:          Usado para ações de adição/criação — contrasta com CTA primário
```

### C3 — Item de Navegação (Sidebar)

```
[ icon  Label          badge? ]

Estado ativo:
  Background:   rgba(232,89,60, 0.10)
  Texto:        #E8593C, peso 500
  Border-radius: 8px
  Ícone:        coral (#E8593C)

Estado idle:
  Background:   transparent
  Texto:        #6B6B6B, peso 400
  Ícone:        #A0A0A0

Padding:        8px 12px
Badge numérico: pill arredondado direita, bg cinza claro, texto muted, 11px
Regra:          Apenas 1 item ativo por vez; seções separadas por label uppercase
```

### C4 — Card de KPI

```
╔══════════════════════════════════╗
║ Label de título          [pill]  ║
║ $XX,XXX  suporte text            ║
║                                  ║
║ [mini chart / gráfico]           ║
║                          ───     ║
║ See Details →                    ║
╚══════════════════════════════════╝

Background:     #FFFFFF
Border:         1px solid #EBEBEB
Border-radius:  10px
Padding:        20px
Título:         13px, peso 500, color-text-secondary
Valor KPI:      28–32px, peso 500–600, color-text-primary
Suporte:        11px, peso 400, color-text-muted
Link:           12–13px, color-primary, "See Details →"
Pill de período: border 1px, radius-full, 11px, muted
```

### C5 — Pill de Filtro / Seletor de Categoria

```
[ Label • ]    (selecionado)
[ Label   ]    (idle)

Selecionado:
  Background:   #E8593C
  Texto:        #FFFFFF, 12px, peso 500
  Border-radius: 999px
  Padding:      6px 14px
  Dot indicator: círculo branco 6px, margem right 6px

Idle:
  Background:   rgba(232,89,60, 0.10) ou #F0F0F0
  Texto:        #E8593C ou #6B6B6B
  Mesmo padding e radius

Regra: Usados em pares para seleção de categoria (ex: Cosmetics / Houseware)
```

### C6 — Badge de Status

```
[ In Stock ]      [ Out of stock ]

In Stock:
  Background:   #E6F4EA
  Texto:        #1E7E34, 11px, peso 500
  Border-radius: 4–6px
  Padding:      2px 8px

Out of stock:
  Background:   #FDECEA
  Texto:        #C0392B, 11px, peso 500

Regra: Nunca usar cores de badge fora do contexto de status de inventário
```

### C7 — Trend Badge (Delta de variação)

```
↑ +12%    (positivo)
↓ -0.4%   (negativo)

Positivo:
  Background:   rgba(46,204,113,0.12)
  Texto:        #1E7E34, 11px, peso 500
  Prefixo:      "↑" ou "+"

Negativo:
  Background:   rgba(231,76,60,0.12)
  Texto:        #C0392B
  Prefixo:      "↓" ou "-"

Border-radius:  4px
Padding:        2px 6px
Regra:          Sempre acompanha um label de referência ("vs last month")
```

### C8 — Input de Busca (Topbar)

```
[ 🔍 Search          F⌘ ]

Background:     var(color-bg-base) ou #F5F5F0
Border:         1px solid #EBEBEB
Border-radius:  8px
Padding:        8px 12px
Placeholder:    "Search", color-text-muted
Atalho kbd:     pill "F⌘", 10px, cinza claro
Largura:        ~200px [estimado]
```

### C9 — Tooltip de Gráfico

```
╭──────╮
│ +19% │
╰──────╯
   │

Background:     #1A1A1A ou #E8593C
Texto:          #FFFFFF, 12px, peso 500
Border-radius:  999px (pill)
Padding:        4px 10px
Seta:           linha vertical fino conectando ao ponto do gráfico
```

### C10 — Linha de Tabela (Top Products)

```
[ thumbnail  Nome         Sales  Revenue  Stock  Status ]

Header:         11px, uppercase, color-text-muted, peso 500
Corpo:          13px, color-text-primary, peso 400
Separador:      border-bottom 1px #EBEBEB por linha
Thumbnail:      24x24px, border-radius 4px
Status:         Badge C6
```

---

## 6. Padrões de Layout

### L1 — Layout Raiz da Aplicação

```
┌─────────────┬────────────────────────────────────────────┐
│             │  [Topbar — Search | Avatars | + | 🔔 | CTA]│
│  Sidebar    ├────────────────────────────────────────────┤
│  190px      │                                            │
│  fixo       │  Dashboard Header                          │
│             │  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  Logo       │  │ KPI card │ │ KPI card │ │ KPI card │   │
│  Nav groups │  └──────────┘ └──────────┘ └──────────┘   │
│  Settings   │  ┌───────────────────────┐ ┌──────────┐   │
│  User       │  │ Analytics (gráfico)   │ │ Sales    │   │
│             │  └───────────────────────┘ │ Perf.    │   │
│             │  ┌────────────┐ ┌─────────┘─────────┐│   │
│             │  │ Visits     │ │ Top Products table ││   │
│             │  └────────────┘ └────────────────────┘│   │
└─────────────┴────────────────────────────────────────────┘
```

### L2 — Card de KPI Interno

```css
.kpi-card-inner {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.kpi-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.kpi-value-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
/* KPI value + label em linha: "$43,630  Total sales" */
.kpi-value { font-size: 30px; font-weight: 500; }
.kpi-label { font-size: 12px; color: var(--color-text-muted); }
.kpi-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}
```

### L3 — Sidebar Navigation

```css
.sidebar-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 20px;
}
.sidebar-group-label {
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  padding: 0 12px;
  margin-bottom: 4px;
}
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s;
}
```

---

## 7. Estados de Interação

| Estado | Regra |
|--------|-------|
| Hover — item de nav | Background `rgba(0,0,0,0.04)`, transição 150ms |
| Hover — card | Sem alteração visual aparente — cards são estáticos |
| Hover — botão primário | Background escurece ~10% (`#D44E33`) |
| Hover — "See Details" | Underline aparece, cor mantida (`color-primary`) |
| Hover — linha de tabela | Background row `rgba(0,0,0,0.02)` [estimado] |
| Active — nav item | Background coral claro + texto + ícone coral (persistente) |
| Active — pill de categoria | Fill coral sólido + texto branco |
| Hover — pill de filtro ("This month") | Border fica mais escura, leve background |
| Focus — input de busca | Border `color-primary`, outline removido, shadow sutil [estimado] |
| Tooltip do gráfico | Aparece on hover sobre ponto/coluna, posicionado acima com seta |
| Scroll | Topbar permanece sticky; sidebar permanece fixed; conteúdo rola |

---

## 8. Princípios de Identidade

### P1 — Dados no Centro
O design nunca compete com os dados. Fundo off-white neutro, tipografia sem ornamentos e ausência de sombras garantem que KPIs e gráficos sejam sempre o elemento mais proeminente da tela.

### P2 — Cor Única, Propósito Singular
O coral `#E8593C` é a única cor de acento. Cada aparição carrega significado — ação (CTA), seleção ativa, destaque de dado. Isso cria hierarquia clara: onde há coral, há algo que merece atenção.

### P3 — Flat é Intencional
Sem sombras, sem gradientes, sem glassmorphism. A profundidade vem exclusivamente do contraste entre superfícies. Esse minimalismo reduz a carga cognitiva em ambientes de uso prolongado (dashboards operacionais).

### P4 — Densidade com Respiro
Alta densidade de informação (múltiplos cards, tabelas, gráficos em uma tela) é compensada por espaçamento generoso entre componentes (16–24px de gap) e padding interno consistente (20px). Nada se toca.

### P5 — Consistência Tipográfica como Estrutura
A hierarquia visual é construída quase exclusivamente via tipografia — tamanho, peso e cor. Não há decorações, ícones de destaque ou elementos gráficos para criar hierarquia. A fonte é a grade invisível.

### P6 — Navegação Contextual
A sidebar agrupa itens por contexto (Main Menu / Other / Account) e não por frequência. O item ativo é inequívoco: coral em fundo, ícone colorido, texto em bold. Não há ambiguidade sobre onde o usuário está.

### P7 — Feedback Cromático de Status
Tendências positivas = verde, negativas = vermelho, neutras = cinza. Essa semântica de cores é aplicada de forma consistente em badges, delta indicators e gráficos — o usuário processa status antes de ler o número.

---

## 9. O que NUNCA fazer

- ❌ **Usar `#E8593C` como cor de fundo de superfícies grandes** — o coral é um acento de atenção, não uma cor estrutural. Em grandes áreas, destrói o contraste e elimina a hierarquia.
- ❌ **Adicionar sombras a cards** — o sistema de elevação é deliberadamente flat. Box-shadows introduzem peso visual desnecessário e quebram a coerência estética.
- ❌ **Usar mais de um CTA coral por viewport** — o botão "Export" é o único CTA coral. Um segundo botão coral anula o sinal de ação primária.
- ❌ **Escrever labels de seção da sidebar em Title Case ou lowercase** — são sempre `UPPERCASE` com tracking ampliado. Qualquer variação quebra a hierarquia visual da navegação.
- ❌ **Usar cores diferentes de verde/vermelho para indicadores de tendência** — a semântica cromática (verde = positivo, vermelho = negativo) é parte do sistema. Usar amarelo, azul ou roxo gera ambiguidade em contextos financeiros.
- ❌ **Colocar bordas coloridas em cards** — todos os cards têm `border: 1px solid #EBEBEB`. Bordas coloridas quebram o sistema flat e criam hierarquia visual falsa.
- ❌ **Misturar pesos de fonte acima de 600** — o sistema usa no máximo peso 600 para valores KPI. Bold mais pesado (700, 800) rompe o equilíbrio tipográfico e cria contraste excessivo.
- ❌ **Usar o fundo branco `#FFFFFF` como fundo da página** — o fundo deve ser `#F5F5F0` (off-white quente). Branco puro elimina o contraste que diferencia a página dos cards.
- ❌ **Criar pills de status com cores fora da paleta semântica** — badges de status usam apenas os pares green/danger definidos. Criar novos pares de cores ad-hoc fragmenta o sistema.
- ❌ **Rotular eixos de gráfico com texto acima de 12px** — labels de eixo são sempre `text-label` (11–12px, muted). Aumentar o tamanho compete com os dados representados.
- ❌ **Usar ícones decorativos ou ilustrações** — a UI usa apenas ícones funcionais de linha (16–18px) estritamente para navegação e ações. Sem ilustrações, mascotes ou elementos decorativos.
- ❌ **Aninhar cards dentro de cards** — a hierarquia é: página → card → conteúdo interno. Um card dentro de outro cria profundidade visual que o sistema flat não suporta.
