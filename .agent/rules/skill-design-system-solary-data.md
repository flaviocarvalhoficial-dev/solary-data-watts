---
trigger: always_on
---

# Design System: Bright CRM

**Extraído de:** Screenshot — tela de Leads (app web)
**Data:** 2026-03-24
**Versão:** 1.0

> ⚠️ Este documento é a fonte de verdade visual do produto. Toda nova seção deve respeitar estas regras antes de introduzir qualquer variação.

---

## 1. Tokens de Cor

### 1.1 Paleta Base

| Token | Hex | Uso semântico |
|-------|-----|---------------|
| `color-primary` | `#6366F1` | Acento principal — CTA, item nav ativo, paginação ativa |
| `color-primary-hover` | `#4F46E5` [estimado] | Hover do botão primário |
| `color-bg-base` | `#F3F4F6` | Fundo global da aplicação (canvas externo) |
| `color-bg-surface` | `#FFFFFF` | Fundo de cards, tabela, sidebar, topbar |
| `color-bg-muted` | `#F9FAFB` | Fundo do header da tabela, hover de linha |
| `color-border` | `#E5E7EB` | Bordas de inputs, separadores, linhas de tabela |
| `color-border-light` | `#F3F4F6` | Divisores internos de linhas de tabela |
| `color-text-primary` | `#111827` | Texto principal — nomes, valores de destaque |
| `color-text-secondary` | `#374151` | Texto corpo — subjects, datas |
| `color-text-muted` | `#6B7280` | Labels, metadados, cabeçalhos de coluna |
| `color-text-xmuted` | `#9CA3AF` | Email do usuário, placeholder, ícones inativos |
| `color-text-on-primary` | `#FFFFFF` | Texto sobre fundos primários |
| `color-status-cold-bg` | `#DBEAFE` | Fundo badge "Cold Lead" |
| `color-status-cold-text` | `#1D4ED8` | Texto badge "Cold Lead" |
| `color-status-hot-bg` | `#FEE2E2` | Fundo badge "Hot Lead" |
| `color-status-hot-text` | `#DC2626` | Texto badge "Hot Lead" |
| `color-status-warm-bg` | `#FEF3C7` | Fundo badge "Warm Lead" |
| `color-status-warm-text` | `#D97706` | Texto badge "Warm Lead" |
| `color-danger` | `#EF4444` | Badge de notificação |

### 1.2 Regras de Uso

- **`color-primary`** é o único acento cromático da UI. Não pode aparecer em ícones decorativos, textos informativos ou backgrounds de seção.
- **Cores de status** (cold/hot/warm) formam um sistema semântico fechado. Nunca reutilizar essas cores fora de badges de status.
- **`color-bg-base`** (`#F3F4F6`) só deve aparecer no canvas externo (body/app-shell). Nunca dentro de cards ou painéis.
- Contraste mínimo observado: texto muted `#6B7280` sobre branco atinge ~4.5:1 — limite AA. Não reduzir opacidade ou clarear mais.
- **Logos de fontes** (Dribbble, Instagram, etc.) usam cores de marca originais — são exceção ao sistema monocromático.

---

## 2. Tipografia

### 2.1 Escala

| Token | Tamanho | Peso | Line-height | Uso |
|-------|---------|------|-------------|-----|
| `text-page-title` | ~22px [estimado] | 700 | 1.2 | Título da página (H1 "Leads") |
| `text-nav-label-group` | 11px [estimado] | 600 | 1.4 | Labels de grupo de nav ("Menu", "Insights") |
| `text-nav-item` | 14px [estimado] | 500 | 1.4 | Itens de navegação lateral |
| `text-table-header` | 12px | 600 | 1.4 | Cabeçalhos de coluna da tabela |
| `text-lead-name` | 14px [estimado] | 600 | 1.4 | Nome do lead na tabela |
| `text-body` | 13–14px [estimado] | 400–500 | 1.5 | Subjects, datas, metadados |
| `text-badge` | 12px | 500 | 1 | Texto dos badges de status |
| `text-user-name` | 14px [estimado] | 600 | 1.2 | Nome do usuário no rodapé da sidebar |
| `text-user-email` | 12px | 400 | 1.2 | Email do usuário |
| `text-label-muted` | 11–12px | 600 | 1 | Labels uppercase (grupos nav) |

### 2.2 Fonte

Família tipográfica: **Inter** [estimado — alta probabilidade baseada no estilo geométrico sem serifa, espaçamento entre letras e pesos utilizados. Alternativas possíveis: DM Sans, Plus Jakarta Sans.]

### 2.3 Regras

- Não usar `font-weight` abaixo de 400 na interface.
- Labels de grupo de navegação usam `text-transform: uppercase` + `letter-spacing: 0.05em`.
- Nomes de leads e do usuário sempre `font-weight: 600` — diferenciador de hierarquia.
- Não usar itálico na UI funcional.
- Datas e metadados: sempre `color-text-muted` ou `color-text-secondary`, nunca primário.

---

## 3. Espaçamento e Grid

### 3.1 Escala

| Token | Valor | Uso típico |
|-------|-------|-----------|
| `space-1` | 4px | Gap mínimo entre ícone e label |
| `space-2` | 8px | Padding interno de badges, gap de itens inline |
| `space-3` | 12px | Padding horizontal de nav items, cell padding |
| `space-4` | 16px | Padding padrão de seções, botões |
| `space-5` | 20px [estimado] | Gap entre grupos de nav |
| `space-6` | 24px | Gap entre grupos semânticos na sidebar |
| `space-8` | 32px [estimado] | Padding de seções maiores |

### 3.2 Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `radius-sm` | 6px | Botões outline, toggle List/Grid |
| `radius-md` | 8px | Botões primários, inputs, nav item ativo, cards |
| `radius-full` | 999px | Badges de status (pills), avatar circular |

### 3.3 Estrutura de Layout

```css
/* App Shell */
.app-shell {
  display: flex;
  height: 100vh;
  background: #F3F4F6;
}

/* Sidebar */
.sidebar {
  width: 268px; /* estimado */
  min-height: 100vh;
  background: #FFFFFF;
  border-right: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  padding: 16px 12px;
  flex-shrink: 0;
}

/* Área de conteúdo principal */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Topbar */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #FFFFFF;
}

/* Toolbar da tabela */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
}

/* Container da tabela */
.table-container {
  flex: 1;
  overflow-y: auto;
  background: #FFFFFF;
  border-radius: 12px; /* estimado */
  margin: 0 24px;
}
```

---

## 4. Elevação

O sistema de elevação do Bright é **flat-first**: ausência deliberada de sombras para criar uma interface limpa e de baixo ruído visual. A profundidade é criada exclusivamente por:

1. **Contraste de fundo:** `#F3F4F6` (canvas) vs `#FFFFFF` (superfícies) cria separação visual sem sombras.
2. **Bordas sutis:** `1px solid #E5E7EB` delimita a sidebar e inputs.
3. **Sobreposição de cor:** O item ativo na nav usa fill sólido `#6366F1` para sobressair sem elevação.

Não há `box-shadow` observada em nenhum componente da interface. Modais e dropdowns (não visíveis no screenshot) provavelmente utilizam `box-shadow: 0 4px 16px rgba(0,0,0,0.08)` [estimado], mas nenhuma evidência direta.

---

## 5. Anatomia dos Componentes

### C1 — Botão Primário

```
┌─────────────────────┐
│  ＋  Add New Lead   │  ← ícone + label
└─────────────────────┘

background:    #6366F1
color:         #FFFFFF
border-radius: 8px
padding:       8px 16px
font-size:     14px
font-weight:   600
border:        none
hover:         background #4F46E5 [estimado]
gap ícone:     6px
```

### C2 — Botão Outline

```
┌──────────────┐
│  🔽 Filter   │
└──────────────┘

background:    #FFFFFF
color:         #374151
border:        1px solid #E5E7EB
border-radius: 8px
padding:       7px 14px
font-size:     14px
font-weight:   500
hover:         background #F9FAFB [estimado]
```

### C3 — Badge de Status

```
╭──────────────╮
│  Cold Lead   │
╰──────────────╯

border-radius: 999px
padding:       3px 10px
font-size:     12px
font-weight:   500
line-height:   1

Variantes:
  cold  → bg #DBEAFE / text #1D4ED8
  hot   → bg #FEE2E2 / text #DC2626
  warm  → bg #FEF3C7 / text #D97706
```

### C4 — Nav Item

```
┌────────────────────────────┐
│ [ícone 16px]  Label   [>]  │  ← chevron só em itens expansíveis
└────────────────────────────┘

Estado inativo:
  background:  transparent
  color:       #374151
  border-radius: 8px
  padding:     8px 12px

Estado ativo:
  background:  #6366F1
  color:       #FFFFFF

Estado hover:
  background:  #F3F4F6
```

### C5 — Input de Busca

```
┌──────────────────────────────┐
│ 🔍  Search           [⌘ K]  │
└──────────────────────────────┘

background:    #F3F4F6
border:        1px solid #E5E7EB (ou sem borda)
border-radius: 8px
padding:       7px 12px
font-size:     13px
color:         #9CA3AF (placeholder)
```

### C6 — Avatar Circular

```
  ╭───╮
  │IMG│
  ╰───╯

width:         34–36px [estimado]
height:        34–36px
border-radius: 50%
object-fit:    cover
```

### C7 — Linha de Tabela

```
┌──┬──────────────┬──────────────┬────────────────┬───────────┬──────────┬──────────┐
│☐ │ [AVT] Nome   │ Subject      │ 📊 Data hora   │ [Badge]   │ ⏱ Tempo  │ [Logo]   │
└──┴──────────────┴──────────────┴────────────────┴───────────┴──────────┴──────────┘

height:        ~56px
border-bottom: 1px solid #F3F4F6
hover:         background #F9FAFB
padding-x:     16px (estimado, alinhado com header)
```

### C8 — Botão de Paginação

```
Estado ativo:
  width/height:  32px
  background:    #6366F1
  color:         #FFFFFF
  border-radius: 6px

Estado inativo:
  background:    transparent
  color:         #374151
  border-radius: 6px
```

---

## 6. Padrões de Layout

### L1 — Layout App Shell (Two-Column Fixed)

```css
.app {
  display: flex;
  min-height: 100vh;
}
.sidebar  { width: 268px; flex-shrink: 0; }
.content  { flex: 1; min-width: 0; }
```

### L2 — Toolbar (Space Between)

```css
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.toolbar-left  { display: flex; gap: 8px; }
.toolbar-right { display: flex; gap: 8px; }
```

### L3 — Célula Lead (Avatar + Nome)

```css
.lead-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
```

### L4 — Célula com Ícone + Texto

```css
.icon-text-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6B7280;
  font-size: 13px;
}
```

---

## 7. Estados de Interação

| Estado | Elemento | Regra |
|--------|----------|-------|
| Hover | Linha de tabela | `background: #F9FAFB` |
| Hover | Nav item inativo | `background: #F3F4F6` |
| Hover | Botão primário | `background: #4F46E5` [estimado] |
| Hover | Botão outline | `background: #F9FAFB` |
| Ativo | Nav item | `background: #6366F1; color: #FFFFFF` |
| Ativo | Botão paginação | `background: #6366F1; color: #FFFFFF` |
| Checked | Checkbox | Ícone de check visível |
| Focus | Input search | `outline: 2px solid #6366F1` [estimado] |
| Scroll — tabela | Body | Tabela com overflow-y: auto, header fixo [estimado] |
---
## 8. Princípios de Identidade

1. **Roxo como linguagem de ação**
   O índigo `#6366F1` é reservado exclusivamente para indicar "onde o usuário está" e "o que o usuário pode fazer". Qualquer outro elemento desta cor viola a gramática visual.

2. **Superfície limpa, dados densos**
   A interface exibe 11+ registros por tela sem parecer apertada. Isso é conseguido por linha-height controlada, ausência de sombras e bordas mínimas — o conteúdo respira sem espaços desperdiçados.

3. **Status como cor funcional, não decorativa**
   O sistema Cold/Warm/Hot usa azul/amarelo/vermelho com significado semântico estrito. Cor = informação, não estética.

4. **Flat por princípio**
   Zero elevação visível. A profundidade emerge de contraste de background, não de sombras. Isso cria consistência visual e reduz ruído cognitivo.

5. **Avatar como âncora de identidade**
   Toda linha da tabela é ancorada por um avatar circular real. Isso humaniza os dados e cria scannabilidade visual superior a texto puro.

6. **Sidebar como mapa cognitivo**
   A divisão em grupos semânticos ("Menu" / "Insights") cria dois mundos operacionais claros: ações de negócio vs análise. O item ativo serve como "você está aqui".

7. **Consistência geométrica**
   Todos os raios de borda são múltiplos de 2 (6px, 8px, 999px). Nada é orgânico ou irregular — a interface é percebida como confiável e sistemática.
---
## 9. O que NUNCA fazer

- ❌ **Não usar `color-primary` (#6366F1) como cor decorativa** — ela só pode aparecer em estados ativos e CTAs primários. Um ícone roxo "bonito" quebra o sistema semântico.
- ❌ **Não criar um quarto status de lead com cor arbitrária** — o sistema é tri-cromático (azul/amarelo/vermelho). Novos status devem ser validados e adicionados ao design system formalmente.
- ❌ **Não usar somb