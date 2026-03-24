---
trigger: always_on
---

# Wireframe Report: Bright CRM — Leads

**Tipo de Interface:** Dashboard Web App (CRM)
**URL ou Fonte:** Screenshot fornecido
**Data da Análise:** 2026-03-24

---

## Sumário de Seções

1. SIDEBAR — Navegação lateral global
2. TOPBAR — Barra superior de ações da página
3. TOOLBAR — Controles de visualização e ações da tabela
4. TABLE HEADER — Cabeçalho da tabela de leads
5. TABLE BODY — Linhas de dados dos leads
6. PAGINATION — Rodapé de paginação
7. USER FOOTER — Perfil do usuário na base da sidebar

---

## Mapeamento Detalhado

---

### SEÇÃO 1: SIDEBAR

> Posição: esquerda fixo | Largura: ~268px | Fundo: `#FFFFFF` com borda direita sutil `#E5E7EB`

**Descrição geral:**
Navegação lateral persistente que ocupa toda a altura da janela. Organizada em grupos semânticos separados por labels de seção. O item ativo (`Leads`) possui fundo roxo/índigo e texto branco. Os demais itens são cinza escuro com ícone à esquerda. Alguns itens possuem seta de expansão (chevron) indicando sub-menus. O topo exibe a logo do produto.

#### Subseção 1.1 — Logotipo

| Elemento | Tipo | Conteúdo / Valor | Comportamento |
|----------|------|-----------------|---------------|
| Ícone logo | Imagem/SVG | Ícone amarelo estrelado | Estático |
| Nome produto | Texto | "Bright" | Estático, link para home |
| Botão colapsar | Ícone | `<<` (chevron duplo) | Clicável — colapsa sidebar |

**Wireframe Comentado:**
```
┌─────────────────────────────┐
│ ★ Bright              [<<]  │  ← logo (24px) + nome bold + collapse btn (dir.)
└─────────────────────────────┘
```

#### Subseção 1.2 — Campo de Busca Sidebar

| Elemento | Tipo | Conteúdo / Valor | Comportamento |
|----------|------|-----------------|---------------|
| Ícone lupa | Ícone | 🔍 | Decorativo |
| Input text | Input | Placeholder "Search" | Focável, filtra nav |
| Atalho kbd | Badge | "⌘ K" | Estático |

**Wireframe Comentado:**
```
┌─────────────────────────────┐
│ 🔍 Search           [⌘ K]  │  ← borda arredondada ~8px, bg #F3F4F6
└─────────────────────────────┘
```

#### Subseção 1.3 — Menu Principal (grupo "Menu")

| Elemento | Tipo | Conteúdo / Valor | Comportamento |
|----------|------|-----------------|---------------|
| Label grupo | Texto | "Menu" | Estático, cinza muted |
| Item Dashboard | Nav link | 🟦 Dashboard | Clicável |
| Item Leads | Nav link | 🟣 Leads | Ativo — bg roxo, texto branco |
| Item Deals | Nav link | 📁 Deals | Clicável + chevron expansão |
| Item Projects | Nav link | 📂 Projects | Clicável + chevron expansão |
| Item Contacts | Nav link | 👤 Contacts | Clicável + chevron expansão |
| Item Products | Nav link | 📦 Products | Clicável |
| Item Marketplace | Nav link | 🏪 Marketplace | Clicável |

**Wireframe Comentado:**
```
  Menu
  ┌────────────────────────────┐
  │ □ Dashboard                │
  ├────────────────────────────┤
  │ ■ Leads          [ATIVO]  │  ← bg #6366F1, radius 8px, texto branco
  ├────────────────────────────┤
  │ □ Deals               [>] │  ← chevron direito indica dropdown
  │ □ Projects            [>] │
  │ □ Contacts            [>] │
  │ □ Products                │
  │ □ Marketplace             │
  └────────────────────────────┘
```

#### Subseção 1.4 — Menu Insights

| Elemento | Tipo | Conteúdo / Valor | Comportamento |
|----------|------|-----------------|---------------|
| Label grupo | Texto | "Insights" | Estático |
| Item Activities | Nav link | Activities | Clicável |
| Item Reports | Nav link | Reports | Clicável + chevron |
| Item Campaigns | Nav link | Campaigns | Clicável + chevron |
| Item Inbox | Nav link | Inbox | Clicável |
| Item Tasks | Nav link | Tasks | Clicável |
| Item Calendar | Nav link | Calendar | Clicável |

**Notas de Replicação:**
- Largura sidebar: `268px` [estimado]
- Item ativo: `background: #6366F1; border-radius: 8px; color: #FFFFFF`
- Item inativo hover: `background: #F3F4F6`
- Padding item: `8px 12px` [estimado]
- Labels de grupo: `font-size: 11px; font-weight: 600; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.05em`
- Gap entre grupos: `24px` [estimado]

---

### SEÇÃO 2: TOPBAR

> Posição: topo do conteúdo principal | Largura: full (área de conteúdo) | Fundo: `#FFFFFF` ou `#F9FAFB`

**Descrição geral:**
Barra horizontal no topo da área de conteúdo. Exibe o título da página à esquerda ("Leads") em texto grande e bold. À direita, campo de busca global e ícone de notificação.

#### Subseção 2.1 — Título e Ações

| Elemento | Tipo | Conteúdo / Valor | Comportamento |
|----------|------|-----------------|---------------|
| Título | Texto H1 | "Leads" | Estático |
| Search global | Input | Placeholder "Search" com ícone 🔍 | Focável |
| Botão notificação | Ícone + badge | 🔔 com badge vermelho | Clicável |

**Wireframe Comentado:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Leads                               [ 🔍 Search          ] [🔔]       │
└─────────────────────────────────────────────────────────────────────────┘
```

**Notas de Replicação:**
- Search: `width: ~200px; border: 1px solid #E5E7EB; border-radius: 8px; padding: 8px 12px`
- Badge notificação: círculo vermelho `#EF4444`, `8px` de diâmetro, posicionado top-right do ícone
- Título: `font-size: 22px [estimado]; font-weight: 700`

---

### SEÇÃO 3: TOOLBAR

> Posição: abaixo do topbar | Largura: full (área de conteúdo) | Fundo: transparente

**Descrição geral:**
Linha de controles que permite alternar entre visualizações (List/Grid) e executar ações sobre a tabela (Filter, Export, Add New Lead). Controles alinhados horizontalmente — toggle à esquerda, ações à direita.

#### Subseção 3.1 — Toggle de Visualização

| Elemento | Tipo | Conteúdo / Valor | Comportamento |
|----------|------|-----------------|---------------|
| Botão List | Toggle btn | ☰ List | Ativo/selecionado |
| Botão Grid | Toggle btn | ⊞ Grid | Clicável |

#### Subseção 3.2 — Ações da Tabela

| Elemento | Tipo | Conteúdo / Valor | Comportamento |
|----------|------|-----------------|---------------|
| Botão Filter | Botão outline | 🔽 Filter | Clicável — abre painel filtro |
| Botão Export | Botão outline | ↑ Export | Clicável — exporta dados |
| Botão Add New Lead | Botão primário | ＋ Add New Lead | Clicável — abre modal/form |

**Wireframe Comentado:**
```
┌──────────────────────────────────────────────────────────────────┐
│  [☰ List] [⊞ Grid]                [🔽 Filter] [↑ Export] [＋ Add New Lead] │
└──────────────────────────────────────────────────────────────────┘
```

**Notas de Replicação:**
- Toggle List/Grid: `border: 1px solid #E5E7EB; border-radius: 6px; padding: 4px 10px`
- Botão primário (Add New Lead): `background: #6366F1; color: #FFF; border-radius: 8px; padding: 8px 16px; font-weight: 600`
- Botões outline: `border: 1px solid #E5E7EB; background: #FFF; border-radius: 8px`

---

### SEÇÃO 4: TABLE HEADER

> Posição: topo da tabela | Largura: full | Fundo: `#F9FAFB` [estimado]

**Descrição geral:**
Cabeçalho fixo da tabela com 6 colunas. Cada coluna possui label de texto com ícone de ordenação (setas). A primeira coluna à esquerda contém um checkbox global de seleção.

#### Subseção 4.1 — Colunas

| Elemento | Tipo | Conteúdo / Valor | Comportamento |
|----------|------|-----------------|---------------|
| Checkbox global | Input checkbox | — | Clicável — seleciona todos |
| Col Leads | Cabeçalho | "Leads ↕" | Ordenável |
| Col Subject | Cabeçalho | "Subject ↕" | Ordenável |
| Col Activities | Cabeçalho | "Activities ↕" | Ordenável |
| Col Status | Cabeçalho | "Status ↕" | Ordenável |
| Col Created | Cabeçalho | "Created ↕" | Ordenável |
| Col Sources | Cabeçalho | "Sources ↕" | Ordenável |

**Wireframe Comentado:**
```
┌──┬──────────────┬──────────────────────┬────────────────┬───────────┬──────────────┬────────────┐
│☐ │ Leads ↕      │ Subject ↕            │ Activities ↕   │ Status ↕  │ Created ↕    │ Sources ↕  │
└──┴──────────────┴──────────────────────┴────────────────┴───────────┴──────────────┴────────────┘
```

**Notas de Replicação:**
- `font-size: 12px; font-weight: 600; color: #6B7280; text-transform: none`
- Ícone ordenação: `↕` ou chevrons duplos, `color: #9CA3AF`
- Border-bottom do header: `1px solid #E5E7EB`

---

### SEÇÃO 5: TABLE BODY

> Posição: corpo da tabela | Largura: full | Fundo: `#FFFFFF` com linhas alternadas sutis

**Descrição geral:**
Lista de leads em linhas de tabela. Cada linha exibe: checkbox, avatar circular + nome do lead, subject/projeto, data de atividade com ícone, badge de status colorido, tempo relativo de criação com ícone de relógio, e logo da fonte (Dribbble, Instagram, Google, Facebook, LinkedIn).

#### Subseção 5.1 — Linha de Lead (padrão repetido)

| Elemento | Tipo | Conteúdo / Valor | Comportamento |
|----------|------|-----------------|---------------|
| Checkbox | Input | — | Clicável — seleciona linha |
| Avatar | Imagem circular | Foto do lead (32–36px) | Estático |
| Nome lead | Texto | Ex: "Jenny Wilson" | Clicável — abre detalhe |
| Subject | Texto | Ex: "Redesign mobile app" | Estático |
| Ícone atividade | Ícone | 📊 (gráfico) | Decorativo |
| Data atividade | Texto | Ex: "Sep 12 at 09:10 AM" | Estático |
| Badge status | Badge | "Cold Lead" / "Hot Lead" / "Warm Lead" | Estático |
| Ícone criado | Ícone | ⏱ (relógio) | Decorativo |
| Tempo criado | Texto | Ex: "1 month ago" | Estático |
| Logo fonte | Imagem/SVG | Dribbble / Instagram / Google / Facebook / LinkedIn | Estático |

**Wireframe Comentado:**
```
┌──┬─────────────────────┬──────────────────────┬────────────────────┬─────────────┬──────────────┬──────────────┐
│☐ │ [AVT] Jenny Wilson  │ Redesign mobile app  │ 📊 Sep 12 09:10 AM │ [Cold Lead] │ ⏱ 1 month ago│ [Dribbble]   │
├──┼─────────────────────┼──────────────────────┼────────────────────┼─────────────┼──────────────┼──────────────┤
│☐ │ [AVT] David Lane    │ Full Website Design  │ 📊 Sep 12 10:15 AM │ [Hot Lead]  │ ⏱ 2 months  │ [Instagram]  │
└──┴─────────────────────┴──────────────────────┴────────────────────┴─────────────┴──────────────┴──────────────┘
```

**Cores dos badges de status:**
| Status | Background | Texto |
|--------|-----------|-------|
| Cold Lead | `#DBEAFE` (azul claro) | `#1D4ED8` |
| Hot Lead | `#FEE2E2` (vermelho claro) | `#DC2626` |
| Warm Lead | `#FEF3C7` (amarelo claro) | `#D97706` |

**Notas de Replicação:**
- Altura linha: `~56px` [estimado]
- Avatar: `width: 34px; height: 34px; border-radius: 50%`
- Badge: `border-radius: 999px; padding: 3px 10px; font-size: 12px; font-weight: 500`
- Linha hover: `background: #F9FAFB`
- Border-bottom linha: `1px solid #F3F4F6`
- Nome lead: `font-weight: 600; color: #111827`
- Textos secundários: `font-size: 13px; color: #6B7280`

---

### SEÇÃO 6: PAGINATION

> Posição: rodapé da tabela | Largura: full | Fundo: `#FFFFFF`

**Descrição geral:**
Controles de paginação centralizados à direita. Exibe seletor de quantidade de itens por página à esquerda, e controles de navegação (prev/next + números de página) à direita.

#### Subseção 6.1 — Controles

| Elemento | Tipo | Conteúdo / Valor | Comportamento |
|----------|------|-----------------|---------------|
| Label "Show" | Texto | "Show" | Estático |
| Seletor itens | Dropdown | "11 ▾" (Leads per page) | Clicável — muda qtd |
| Btn anterior | Botão | ← | Clicável — página anterior |
| Btn página 1 | Botão | "1" | Ativo — destacado |
| Btn página 2–5 | Botão | "2", "3", "4", "5" | Clicável |
| Reticências | Texto | "..." | Estático |
| Btn página 16 | Botão | "16" | Clicável |
| Btn próximo | Botão | → | Clicável |

**Wireframe Comentado:**
```
┌──────────────────────────────────────────────────────────────────┐
│  Show [11 ▾] Leads per page          [←] [1] [2] [3] [4] [5] [...] [16] [→] │
└──────────────────────────────────────────────────────────────────┘
```

**Notas de Replicação:**
- Página ativa: `background: #6366F1; color: #FFF; border-radius: 6px`
- Páginas inativas: `background: transparent; color: #374151`
- Tamanho botão paginação: `32px x 32px`

---
### SEÇÃO 7: USER