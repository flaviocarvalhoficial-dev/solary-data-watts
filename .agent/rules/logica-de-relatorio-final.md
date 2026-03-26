---
trigger: always_on
---

# LÓGICA DO RELATÓRIO FINAL — CRUZAMENTO ENTRE FATURA + GERAÇÃO (API OU MANUAL)

Você deve implementar a lógica do relatório final do sistema fotovoltaico com base no cruzamento entre:

1. dados da fatura de energia
2. dados de geração da plataforma solar
3. dados complementares preenchidos manualmente, quando necessário

O relatório final precisa seguir a lógica de negócio de um relatório executivo como este, que apresenta: dados principais do projeto, resultado do projeto, resultado operacional, retorno do investimento, créditos acumulados e resultado total. O exemplo enviado mostra campos como investimento, saldo acumulado em créditos, valor do kWh, fatura antiga, fatura atual, economia mensal, redução percentual, economia no ciclo, payback, equivalente em reais dos créditos e resultado total. :contentReference[oaicite:0]{index=0} :contentReference[oaicite:1]{index=1} :contentReference[oaicite:2]{index=2}

---

## OBJETIVO

Gerar automaticamente os resultados financeiros e operacionais do cliente com base no cruzamento dos dados energéticos e tarifários.

A geração pode vir de 2 fontes:

- API da plataforma solar
- preenchimento manual

A fatura pode vir de:

- leitura/importação de PDF estruturado
- preenchimento manual assistido

---

## ENTRADAS NECESSÁRIAS

### 1. DADOS DA FATURA

Campos mínimos:

- competencia
- cliente
- uc
- concessionaria
- consumo_kwh
- energia_injetada_kwh
- energia_compensada_kwh
- saldo_creditos_kwh
- valor_total_fatura
- tarifa_kwh
- custo_disponibilidade
- tributos
- bandeira_tarifaria
- observacoes

### 2. DADOS DA GERAÇÃO SOLAR

Campos mínimos:

- competencia
- sistema_id
- cliente
- geracao_mes_kwh
- geracao_hoje_kwh (opcional)
- geracao_total_kwh (opcional)
- fonte_geracao = "api" | "manual"
- status_sistema (opcional)
- data_ultima_leitura

### 3. DADOS FINANCEIROS / DE PROJETO

Campos mínimos:

- investimento_inicial
- quantidade_meses_ativos
- valor_kwh_atual
- ciclo_meses (ex: 5)
- nome_projeto
- observacoes_executivas

---

## REGRA DE PRIORIDADE DAS FONTES

Implementar prioridade:

1. se houver dado de geração vindo da API e estiver válido, usar API
2. se não houver API, usar preenchimento manual
3. se ambos existirem, manter API como principal e manual como fallback
4. registrar no banco qual fonte foi usada no relatório final

Campo obrigatório no resultado:
- fonte_geracao_utilizada

---

## NORMALIZAÇÃO DOS DADOS

Antes dos cálculos:

- converter números monetários para decimal
- converter kWh para decimal
- padronizar competência no formato YYYY-MM
- tratar campos vazios como null
- impedir cálculo com strings brutas
- validar que tarifa_kwh > 0
- validar que valor_total_fatura >= 0
- validar que geracao_mes_kwh >= 0

---

## CÁLCULOS PRINCIPAIS

### 1. FATURA ANTIGA CORRIGIDA

Objetivo:
Estimar quanto seria a fatura sem o sistema solar ou reconstruir a referência anterior.

Regra:
- se existir campo manual `fatura_antiga_corrigida_manual`, usar esse valor
- senão, calcular por aproximação com base no consumo/energia compensada e tarifa

Sugestão de cálculo base:
- fatura_antiga_corrigida = valor_total_fatura + (energia_compensada_kwh * tarifa_kwh)

Se houver energia injetada relevante e regra tarifária específica da concessionária, permitir ajuste posterior via fórmula customizável.

Campo final:
- fatura_antiga_corrigida

---

### 2. FATURA ATUAL COM SOLAR

Regra:
- usar o valor efetivamente pago na fatura

Campo final:
- fatura_atual_com_solar = valor_total_fatura

---

### 3. ECONOMIA MENSAL

Fórmula:
- economia_mensal = fatura_antiga_corrigida - fatura_atual_com_solar

Se resultado < 0:
- marcar como anomalia
- não deixar economia negativa sem validação manual

Campo final:
- economia_mensal

---

### 4. REDUÇÃO DA FATURA (%)

Fórmula:
- reducao_percentual = (economia_mensal / fatura_antiga_corrigida) * 100

Se fatura_antiga_corrigida <= 0:
- retornar null

Campo final:
- reducao_percentual

---

### 5. ECONOMIA NO CICLO

Objetivo:
Somar a economia ao longo do período relevante do negócio, como no exemplo do ciclo produtivo de 5 meses. :contentReference[oaicite:3]{index=3}

Regra:
- economia_ciclo = soma das economias mensais das competências dentro do ciclo selecionado

Campo final:
- economia_ciclo

---

### 6. SALDO ACUMULADO EM CRÉDITOS (kWh)

Regra:
- se a fatura trouxer saldo_creditos_kwh, usar esse valor
- se houver histórico mensal, considerar o saldo mais recente válido
- permitir ajuste manual quando a fatura não trouxer o campo claramente

Campo final:
- saldo_creditos_kwh

---

### 7. EQUIVALENTE EM REAIS DOS CRÉDITOS

Fórmula:
- creditos_em_reais = saldo_creditos_kwh * valor_kwh_atual

Campo final:
- creditos_em_reais

---

### 8. RESULTADO TOTAL DO PROJETO

No exemplo enviado, o resultado total é a soma entre economia e créditos acumulados. :contentReference[oaicite:4]{index=4}

Fórmula:
- resultado_total = economia_ciclo + creditos_em_reais

Campo final:
- resultado_total

---

### 9. PAYBACK

No exemplo enviado, o payback é apresentado em anos, com aproximação textual. :contentReference[oaicite:5]{index=5}

Fórmula base:
- payback_anos = investimento_inicial / (economia_mensal * 12)

Se economia_mensal <= 0:
- retornar null

Também gerar:
- payback_meses = payback_anos * 12
- payback_texto_aproximado = ex: "1,75 anos (~1 ano e 9 meses)"

---

### 10. RESULTADO OPERACIONAL

Gerar blocos textuais automáticos com base nos indicadores.

Regras de texto:

Se economia_mensal > 0:
- incluir "Redução de custos no período"

Se reducao_percentual >= 50:
- incluir "Maior previsibilidade financeira"

Se saldo_creditos_kwh > 0:
- incluir "Melhor aproveitamento da energia"

Permitir edição manual posterior do texto.

Campos finais:
- insights_operacionais[]

---

## REGRAS DE CONSISTÊNCIA

### Regra 1
Se geracao_mes_kwh estiver muito baixa e economia muito alta:
- marcar divergência para revisão

### Regra 2
Se fatura atual for maior que a fatura antiga:
- marcar relatório como "revisar"

### Regra 3
Se saldo de créditos existir mas valor_kwh_atual estiver ausente:
- bloquear cálculo de créditos em reais

### Regra 4
Se API falhar:
- permitir relatório com dados manuais
- marcar `relatorio_modo = "manual_assistido"`

### Regra 5
Salvar memória de cálculo:
- quais campos vieram da API
- quais vieram da fatura
- quais foram preenchidos manualmente
- quais fórmulas foram aplicadas

---

## ESTRUTURA DO OBJETO FINAL DE CÁLCULO

```json
{
  "cliente": "string",
  "competencia": "YYYY-MM",
  "nome_projeto": "string",
  "fonte_geracao_utilizada": "api|manual",
  "dados_entrada": {
    "fatura": {
      "consumo_kwh": 0,
      "energia_injetada_kwh": 0,
      "energia_compensada_kwh": 0,
      "saldo_creditos_kwh": 0,
      "valor_total_fatura": 0,
      "tarifa_kwh": 0
    },
    "geracao": {
      "geracao_mes_kwh": 0,
      "status_sistema": "string"
    },
    "financeiro": {
      "investimento_inicial": 0,
      "valor_kwh_atual": 0,
      "ciclo_meses": 5
    }
  },
  "resultado": {
    "fatura_antiga_corrigida": 0,
    "fatura_atual_com_solar": 0,
    "economia_mensal": 0,
    "reducao_percentual": 0,
    "economia_ciclo": 0,
    "saldo_creditos_kwh": 0,
    "creditos_em_reais": 0,
    "resultado_total": 0,
    "payback_anos": 0,
    "payback_meses": 0,
    "payback_texto_aproximado": "string"
  },
  "insights_operacionais": [
    "string"
  ],
  "flags_validacao": [
    "string"
  ]
}